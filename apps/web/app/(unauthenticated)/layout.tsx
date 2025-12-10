import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
// app/layout.js or app/page.js

export const metadata = {
  title: "Tourify - Onboard Users With Styles",
  description:
    "Create beautiful, interactive product tours that guide users through your app. No coding required, analytics included..",
  keywords: ["tour", "guided tours", "experiences"],
  authors: [
    { name: "Tourify Team", url: "https://tourify-web-lovat.vercel.app" },
  ],
  creator: "Tourify Team",
  publisher: "Tourify",
  openGraph: {
    type: "website",
    url: "https://tourify-web-lovat.vercel.app/",
    title: "Tourify - Onboard Users With Styles",
    description:
      "Create beautiful, interactive product tours that guide users through your app. No coding required, analytics included..",
    siteName: "Tourify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tourify Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tourify - Onboard Users With Styles",
    description:
      "Create beautiful, interactive product tours that guide users through your app. No coding required, analytics included..",
    creator: "@Tourify",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

type Props = {
  children: React.ReactNode;
};

export default function UnauthenticatedLayout({ children }: Props) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
