"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/inky.module.css";

// Render Inky's answer: **bold**, *italic* / _italic_, and clickable links.
// Lightweight on purpose — his replies are short prose, not full Markdown.
function renderAnswer(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|https?:\/\/[^\s]+)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];

    if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("_")) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else {
      let url = tok;
      let trail = "";
      const t = url.match(/[.,;:!?)\]]+$/);
      if (t) {
        trail = t[0];
        url = url.slice(0, url.length - trail.length);
      }
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={styles.answerLink}
        >
          {url}
        </a>
      );
      if (trail) nodes.push(trail);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ============================================================
// INKY — the site's tiny ink-blob mascot.
//
// He lives on the gold divider line above the wire ticker. Motion is
// driven by a state machine (not CSS keyframes) so behaviors chain
// smoothly: he walks on from an edge, walks around, sits, walks off,
// disappears for a randomized 5–15 seconds, then re-enters. Once in
// every ~100 entrances, instead of walking on he falls from the sky.
//
// Behaviors:
//   - walk-forward / walk-backward (with leg-step + body-bob)
//   - sit-stare with SVG-internal squash (eye, belly, legs stay rigid)
//   - turn-around in place
//   - fall-from-sky (rare, 1/100 entrances)
//
// Speed:
//   - Per-walk randomization, 35–60 px/sec
//   - Backward walks are 15% slower (cautious)
//   - Post-sit-stare walks are 35–40 px/sec (languid, just got up)
//   - Post-fall walks start at 78 px/sec and decelerate over 1.5s
//
// Reactions:
//   - Scroll velocity → body tilts up to ±8°
//   - Belly click → opens "Ask the editor" overlay
// ============================================================

const WALK_SPEED_MIN = 35;
const WALK_SPEED_MAX = 60;

type Direction = 1 | -1;
type Behavior =
  | "off-screen"
  | "walk-forward"
  | "walk-backward"
  | "turning"
  | "sit-stare"
  | "falling"
  | "idle";

export default function Inky() {
  const inkyRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef({
    x: -80,
    direction: 1 as Direction,
    behavior: "off-screen" as Behavior,
    onScreen: false,
  });
  const recentBehaviorRef = useRef<string | null>(null);
  const currentTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [showHint, setShowHint] = useState(false);
  const interactedRef = useRef(false);

  // ===== Helpers =====
  function stageWidth() {
    return inkyRef.current?.parentElement?.offsetWidth ?? 1200;
  }

  function render() {
    const inky = inkyRef.current;
    if (!inky) return;
    inky.style.transform = `translateX(${stateRef.current.x}px)`;
    inky.classList.toggle(styles.facingLeft, stateRef.current.direction === -1);
  }

  function pickWalkSpeed({ direction = 1 }: { direction?: Direction } = {}): {
    startSpeed: number;
    cruiseSpeed: number;
  } {
    let base = WALK_SPEED_MIN + Math.random() * (WALK_SPEED_MAX - WALK_SPEED_MIN);

    // Backward walks slightly slower — cautious creature
    if (direction === -1) {
      base *= 0.85;
    }

    // Post-sit-stare: he just stood up, moves languid
    if (recentBehaviorRef.current === "sit-stare") {
      base = 35 + Math.random() * 5; // tight 35–40 window
    }

    // Post-fall: extra momentum from impact, decays to normal
    if (recentBehaviorRef.current === "fall") {
      const cruise = WALK_SPEED_MIN + 8 + Math.random() * 18;
      return { startSpeed: 78, cruiseSpeed: cruise };
    }

    return { startSpeed: base, cruiseSpeed: base };
  }

  function stepDurationFor(speed: number): number {
    const baseSpeed = 38;
    const baseStep = 0.5;
    return (baseStep * baseSpeed) / speed;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===== Behavior primitives =====

  function walk({
    minDuration = 2000,
    maxDuration = 12000,
  } = {}): Promise<"off-screen" | "time-up" | "cancelled"> {
    return new Promise((resolve) => {
      const inky = inkyRef.current;
      if (!inky) {
        resolve("cancelled");
        return;
      }

      const state = stateRef.current;
      state.behavior = state.direction === 1 ? "walk-forward" : "walk-backward";

      const { startSpeed, cruiseSpeed } = pickWalkSpeed({ direction: state.direction });
      let currentSpeed = startSpeed;
      inky.style.setProperty("--step-dur", stepDurationFor(currentSpeed) + "s");

      const decelDuration = 1500;
      const needsDecel = Math.abs(startSpeed - cruiseSpeed) > 0.5;

      inky.classList.add(styles.walking);
      inky.classList.remove(styles.sitting, styles.turning, styles.falling, styles.landing);

      const duration = minDuration + Math.random() * (maxDuration - minDuration);
      const startTime = performance.now();
      let cancelled = false;
      let lastStepDur = stepDurationFor(currentSpeed);

      function frame() {
        if (cancelled) return;
        const elapsed = performance.now() - startTime;

        if (needsDecel) {
          if (elapsed < decelDuration) {
            const t = elapsed / decelDuration;
            currentSpeed = startSpeed + (cruiseSpeed - startSpeed) * t;
          } else {
            currentSpeed = cruiseSpeed;
          }
          const newStepDur = stepDurationFor(currentSpeed);
          if (Math.abs(newStepDur - lastStepDur) > 0.02 && inky) {
            inky.style.setProperty("--step-dur", newStepDur + "s");
            lastStepDur = newStepDur;
          }
        }

        const dt = 1 / 60;
        state.x += currentSpeed * state.direction * dt;

        // Always-on: bounce off the visible edges instead of walking off.
        const maxX = Math.max(40, stageWidth() - 56);
        if (state.x < 0) {
          state.x = 0;
          state.direction = 1;
        } else if (state.x > maxX) {
          state.x = maxX;
          state.direction = -1;
        }
        render();

        if (performance.now() - startTime > duration) {
          inky?.classList.remove(styles.walking);
          recentBehaviorRef.current = "walk";
          resolve("time-up");
          return;
        }

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      currentTaskRef.current = {
        cancel: () => {
          cancelled = true;
          inky?.classList.remove(styles.walking);
          recentBehaviorRef.current = "walk";
          resolve("cancelled");
        },
      };
    });
  }

  function turn(): Promise<void> {
    return new Promise((resolve) => {
      const inky = inkyRef.current;
      if (!inky) {
        resolve();
        return;
      }
      stateRef.current.behavior = "turning";
      inky.classList.remove(styles.walking);
      inky.classList.add(styles.turning);
      let cancelled = false;
      setTimeout(() => {
        if (cancelled) return;
        stateRef.current.direction = (stateRef.current.direction * -1) as Direction;
        render();
        setTimeout(() => {
          if (cancelled) return;
          inky.classList.remove(styles.turning);
          resolve();
        }, 300);
      }, 400);
      currentTaskRef.current = {
        cancel: () => {
          cancelled = true;
          inky.classList.remove(styles.turning);
          resolve();
        },
      };
    });
  }

  function sitStare({ duration = 4000 } = {}): Promise<void> {
    return new Promise((resolve) => {
      const inky = inkyRef.current;
      if (!inky) {
        resolve();
        return;
      }
      stateRef.current.behavior = "sit-stare";
      inky.classList.remove(styles.walking);
      inky.classList.add(styles.sitting);
      let cancelled = false;
      setTimeout(() => {
        if (cancelled) return;
        inky.classList.remove(styles.sitting);
        setTimeout(() => {
          if (cancelled) return;
          recentBehaviorRef.current = "sit-stare";
          resolve();
        }, 400);
      }, duration);
      currentTaskRef.current = {
        cancel: () => {
          cancelled = true;
          inky.classList.remove(styles.sitting);
          recentBehaviorRef.current = "sit-stare";
          resolve();
        },
      };
    });
  }

  function fallFromSky(): Promise<void> {
    return new Promise((resolve) => {
      const inky = inkyRef.current;
      if (!inky) {
        resolve();
        return;
      }
      const state = stateRef.current;
      state.behavior = "falling";
      state.onScreen = true;
      state.direction = Math.random() < 0.5 ? 1 : -1;

      const landingX = stageWidth() * 0.15 + Math.random() * stageWidth() * 0.7;
      state.x = landingX;
      render();

      const fallDistance = window.innerHeight - 56 + 60;
      inky.classList.add(styles.falling);
      inky.classList.remove(styles.walking, styles.sitting);

      inky.style.transform = `translateX(${state.x}px) translateY(-${fallDistance}px)`;

      requestAnimationFrame(() => {
        inky.style.transition = "transform 1.1s cubic-bezier(0.55, 0.05, 0.85, 0.6)";
        inky.style.transform = `translateX(${state.x}px) translateY(0px)`;
      });

      setTimeout(() => {
        inky.classList.remove(styles.falling);
        inky.style.transition = "";
        inky.classList.add(styles.landing);

        setTimeout(() => {
          inky.classList.remove(styles.landing);
          render();
          recentBehaviorRef.current = "fall";
          resolve();
        }, 240);
      }, 1100);

      currentTaskRef.current = {
        cancel: () => {
          inky.classList.remove(styles.falling, styles.landing);
          inky.style.transition = "";
          render();
          recentBehaviorRef.current = "fall";
          resolve();
        },
      };
    });
  }

  // ===== Lifecycle loop =====

  useEffect(() => {
    let stopped = false;

    async function lifecycle() {
      // Inky is always on screen — walk him in to start, then never leave.
      const state = stateRef.current;
      state.x = stageWidth() * 0.4;
      state.direction = 1;
      state.onScreen = true;
      render();

      while (!stopped) {
        // Pick a behavior, all performed in place — he never exits.
        // Mix: 68% walk · 16% sit-stare · 13% turn · 3% surprise sky-fall
        const r = Math.random();
        if (r < 0.68) {
          await walk({ minDuration: 2500, maxDuration: 9000 });
        } else if (r < 0.84) {
          const stareDuration = 3000 + Math.random() * 5000;
          await sitStare({ duration: stareDuration });
        } else if (r < 0.97) {
          await turn();
        } else {
          await fallFromSky();
        }
        if (stopped) return;

        await sleep(400 + Math.random() * 1200);
      }
    }

    render();
    lifecycle();

    return () => {
      stopped = true;
      currentTaskRef.current?.cancel();
    };
  }, []);

  // ===== Scroll-react =====
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    let tiltTimeout: ReturnType<typeof setTimeout>;

    function onScroll() {
      const inky = inkyRef.current;
      if (!inky) return;
      const now = Date.now();
      const dy = window.scrollY - lastScrollY;
      const dt = now - lastScrollTime;
      if (dt > 0) {
        const velocity = dy / dt;
        const tilt = Math.max(-8, Math.min(8, velocity * 6));
        inky.style.setProperty("--tilt", tilt + "deg");
        inky.classList.add(styles.tilting);
        clearTimeout(tiltTimeout);
        tiltTimeout = setTimeout(() => {
          inky.style.setProperty("--tilt", "0deg");
          setTimeout(() => inky.classList.remove(styles.tilting), 300);
        }, 200);
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ===== Escape closes overlay =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        abortRef.current?.abort();
        setOverlayOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (overlayOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [overlayOpen]);

  // ===== "Press my belly" attention hint =====
  // Nudge a few times after load so visitors know Inky is interactive,
  // then leave him be — and stop entirely once they've poked him.
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function nudge(delay: number, duration = 4000) {
      timers.push(
        setTimeout(() => {
          if (cancelled || interactedRef.current) return;
          setShowHint(true);
          timers.push(
            setTimeout(() => {
              if (!cancelled) setShowHint(false);
            }, duration)
          );
        }, delay)
      );
    }

    nudge(2500); // first nudge shortly after load
    nudge(18000); // again a bit later
    nudge(45000); // one last gentle reminder

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  async function runQuery(raw: string) {
    const q = raw.trim();
    if (!q || asking) return;
    setQuery(q);

    setAsking(true);
    setAnswer("");
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/inky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: ctrl.signal,
      });

      if (!res.body) {
        setAnswer(await res.text());
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnswer(acc);
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setAnswer("I couldn't reach my brain just now — give me another try?");
      }
    } finally {
      setAsking(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runQuery(query);
  }

  function closeOverlay() {
    abortRef.current?.abort();
    setOverlayOpen(false);
  }

  return (
    <>
      <div className={styles.inkyStage}>
        <button
          ref={inkyRef}
          className={`${styles.inky} ${styles.idle} ${
            showHint ? styles.hinting : ""
          }`}
          onClick={() => {
            interactedRef.current = true;
            setShowHint(false);
            setOverlayOpen(true);
          }}
          aria-label="Ask Inky a question"
        >
          <span className={styles.tooltip}>Press my belly ✦</span>
          <div className={styles.breathing}>
            <div className={styles.bodyWrap}>
              <svg
                className={styles.bodySvg}
                viewBox="0 0 80 70"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
              >
                <defs>
                  <radialGradient id="inkyBody" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#2a2520" />
                    <stop offset="55%" stopColor="#1a1814" />
                    <stop offset="100%" stopColor="#0c0a08" />
                  </radialGradient>
                </defs>

                {/* Legs sit OUTSIDE the body-shape group so they don't squash */}
                <ellipse
                  className={styles.legBack}
                  cx="22"
                  cy="65"
                  rx="4"
                  ry="2.8"
                  fill="url(#inkyBody)"
                />
                <ellipse
                  className={styles.legFront}
                  cx="36"
                  cy="65"
                  rx="4"
                  ry="2.8"
                  fill="url(#inkyBody)"
                />

                {/* BODY GROUP — the only thing that scales when he sits */}
                <g className={styles.bodyShape} style={{ transformOrigin: "30px 64px" }}>
                  <path
                    d="M 30 8 C 46 8, 56 20, 56 34 L 70 34 C 74 34, 74 46, 70 46 L 56 46 C 56 56, 46 64, 30 64 C 14 64, 6 52, 6 36 C 6 20, 14 8, 30 8 Z"
                    fill="url(#inkyBody)"
                  />
                </g>

                {/* Eye sits OUTSIDE body-shape group — stays rigid */}
                <circle
                  className={styles.eye}
                  cx="42"
                  cy="24"
                  r="2"
                  fill="#f4ede0"
                  style={{ transformOrigin: "42px 24px" }}
                />

                {/* Gold belly — the click affordance, also rigid */}
                <circle
                  className={styles.belly}
                  cx="28"
                  cy="46"
                  r="5"
                  fill="#b8893a"
                  opacity="0.95"
                  style={{ transformOrigin: "28px 46px" }}
                />
                <text
                  x="28"
                  y="49.5"
                  textAnchor="middle"
                  fontFamily="Fraunces, serif"
                  fontStyle="italic"
                  fontSize="8"
                  fill="#1a1814"
                  fontWeight="500"
                  style={{ pointerEvents: "none" }}
                >
                  ?
                </text>
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* ASK THE EDITOR OVERLAY */}
      <div
        className={`${styles.overlay} ${overlayOpen ? styles.active : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeOverlay();
        }}
      >
        <div className={styles.overlayCard}>
          <div className={styles.overlayInky}>
            <svg
              viewBox="0 0 80 70"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <radialGradient id="inkyOverlay" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#2a2520" />
                  <stop offset="55%" stopColor="#1a1814" />
                  <stop offset="100%" stopColor="#0c0a08" />
                </radialGradient>
              </defs>
              <ellipse cx="22" cy="65" rx="4" ry="2.8" fill="url(#inkyOverlay)" />
              <ellipse cx="36" cy="65" rx="4" ry="2.8" fill="url(#inkyOverlay)" />
              <path
                d="M 30 8 C 46 8, 56 20, 56 34 L 70 34 C 74 34, 74 46, 70 46 L 56 46 C 56 56, 46 64, 30 64 C 14 64, 6 52, 6 36 C 6 20, 14 8, 30 8 Z"
                fill="url(#inkyOverlay)"
              />
              <circle cx="42" cy="24" r="2" fill="#f4ede0" />
              <circle cx="28" cy="46" r="5" fill="#b8893a" opacity="0.95" />
            </svg>
          </div>
          <div className={styles.overlayEyebrow}>✦ Ask Inky — Sonia&rsquo;s ink-blob</div>
          <h2 className={styles.overlayHeading}>
            What would you like to know?
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={styles.overlayInput}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. what does Sonia think about AI tooling for engineers?"
            />
          </form>

          {!answer && !asking && (
            <div className={styles.overlayChips}>
              {[
                "What has Sonia built?",
                "Why should we hire her?",
                "What are her hobbies?",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.overlayChip}
                  onClick={() => runQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {(answer || asking) && (
            <div className={styles.overlayAnswer}>
              {renderAnswer(answer)}
              {asking && <span className={styles.cursor} aria-hidden="true" />}
            </div>
          )}

          <div className={styles.overlayHint}>
            {asking ? "Inky is thinking…" : "Press enter to ask"}
          </div>
          <button className={styles.overlayClose} onClick={closeOverlay}>
            Close · Esc
          </button>
        </div>
      </div>
    </>
  );
}
