import type { Metadata } from "next";
import "@/styles/globals.css";
import Masthead from "@/components/Masthead";
import Inky from "@/components/Inky";
import Wire from "@/components/Wire";

export const metadata: Metadata = {
  title: "Sonia's",
  description:
    "A magazine of software, photographs, and other obsessions. Engineering, products, and pictures by Sonia Kaul.",
  openGraph: {
    title: "Sonia's",
    description:
      "A magazine of software, photographs, and other obsessions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Masthead />
        {children}
        <Wire />
        <Inky />
      </body>
    </html>
  );
}
