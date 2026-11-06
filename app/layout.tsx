import type { Metadata } from "next";
import { Header } from "@/components/header";
import { requestOrigin } from "@/lib/http";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await requestOrigin()),
    title: { default: "Awayline", template: "%s · Awayline" },
    description: "Attach an away status to your phone number so people know why you're not answering.",
    robots: { index: false, follow: false },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <a className="skip" href="#main">
            Skip to content
          </a>
          <Header />
          <div id="main">{children}</div>
        </div>
      </body>
    </html>
  );
}
