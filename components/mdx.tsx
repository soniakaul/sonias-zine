import React from "react";
import { slugify, nodeText } from "@/lib/toc";

// --- Heading overrides: add anchor ids so the TOC can link to them ---
function H2({ children }: { children?: React.ReactNode }) {
  return <h2 id={slugify(nodeText(children))}>{children}</h2>;
}

function H3({ children }: { children?: React.ReactNode }) {
  return <h3 id={slugify(nodeText(children))}>{children}</h3>;
}

// --- Pull quote: breaks the reading column with a big italic line ---
export function PullQuote({
  children,
  attr,
}: {
  children?: React.ReactNode;
  attr?: string;
}) {
  return (
    <div className="pull-quote-block">
      <span className="pull-quote-mark" aria-hidden="true">
        &ldquo;
      </span>
      {children}
      {attr && <span className="attr">{attr}</span>}
    </div>
  );
}

// --- Stat cluster: big Fraunces figures as visual punctuation ---
export function Stats({ children }: { children?: React.ReactNode }) {
  return <div className="stat-cluster">{children}</div>;
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-block">
      <span className="stat-block-value">{value}</span>
      <span className="stat-block-label">{label}</span>
    </div>
  );
}

// --- Case file: the failure stories as numbered incident cards ---
export function CaseFile({
  n,
  name,
  figure,
  children,
}: {
  n: string;
  name: string;
  figure?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="case-file">
      <div className="case-head">
        <span className="case-n">Case {n}</span>
        <span className="case-name">{name}</span>
        {figure && <span className="case-figure">{figure}</span>}
      </div>
      <div className="case-body">{children}</div>
    </div>
  );
}

// --- Timeline of sprints ---
export function Timeline({ children }: { children?: React.ReactNode }) {
  return <div className="timeline">{children}</div>;
}

export function Sprint({
  label,
  date,
  title,
  children,
}: {
  label: string;
  date: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sprint">
      <span className="sprint-dot" aria-hidden="true" />
      <div className="sprint-content">
        <div className="sprint-head">
          <span className="sprint-label">{label}</span>
          <span className="sprint-date">{date}</span>
        </div>
        <div className="sprint-title">{title}</div>
        <div className="sprint-body">{children}</div>
      </div>
    </div>
  );
}

// --- Loop ledger: her literal words beside my interpretation ---
export function Loop({
  round,
  quote,
  read,
}: {
  round?: string;
  quote: string;
  read: string;
}) {
  return (
    <div className="loop-entry">
      <div className="loop-said">
        {round && <span className="loop-round">{round}</span>}
        <p className="loop-quote">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="loop-read">
        <span className="loop-read-label">What it meant</span>
        <p>{read}</p>
      </div>
    </div>
  );
}

// --- Margin note: pinned into the right gutter beside its paragraph ---
export function Margin({
  label,
  children,
}: {
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <aside className="side-note">
      {label && <span className="side-note-label">{label}</span>}
      {children}
    </aside>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  PullQuote,
  Stats,
  Stat,
  CaseFile,
  Timeline,
  Sprint,
  Margin,
  Loop,
};
