import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#0B2350",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "NexInsight More 5-Star Reviews, Fewer Complaints, No Missed Messages",
  description:
    "NexInsight installs review capture, WhatsApp automation, and digital QR cards for local businesses. More 5-star reviews, fewer public complaints, and no missed messages without hiring anyone.",
  keywords:
    "NexInsight, QR review system, WhatsApp automation, digital business cards, local business, review management, customer experience",
  metadataBase: new URL("https://nexinsight.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://nexinsight.com/",
    title: "NexInsight More 5-Star Reviews. No Missed Messages.",
    description:
      "We install review capture, WhatsApp automation, and digital QR cards for restaurants, salons, clinics, and shops. Setup in a week.",
    images: [
      {
        url: "/assets/images/logo-brand.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexInsight More 5-Star Reviews. No Missed Messages.",
    description:
      "We install review capture, WhatsApp automation, and digital QR cards for restaurants, salons, clinics, and shops.",
    images: ["/assets/images/logo-brand.png"],
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
