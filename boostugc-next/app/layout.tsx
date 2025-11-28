import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoostUGC – AI UGC Generator for eCommerce",
  description:
    "BoostUGC generates realistic UGC, lifestyle images and product mockups with AI. Ideal for eCommerce brands, creators and agencies. Try it free.",
  keywords:
    "ai ugc generator, ai product mockups, ai lifestyle images, ecommerce product photography, ai mockup tool, ai ugc app, ai social media content creator",
  openGraph: {
    title: "BoostUGC – AI UGC Generator",
    description: "Generate realistic UGC and product mockups instantly.",
    images: ["https://boostugc.app/og-image.jpg"],
    type: "website",
    url: "https://boostugc.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoostUGC – AI UGC Generator",
    description: "Create realistic UGC and product photos with AI.",
    images: ["https://boostugc.app/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BoostUGC",
    url: "https://boostugc.app",
    applicationCategory: "ImageEditing",
    description:
      "AI tool for generating UGC, lifestyle images and product mockups for eCommerce brands and creators.",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
