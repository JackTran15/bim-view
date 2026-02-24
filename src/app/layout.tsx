import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaceLink – 2D/3D BIM Editor",
  description: "Real-time wall geometry editor with unified 2D and 3D views",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
