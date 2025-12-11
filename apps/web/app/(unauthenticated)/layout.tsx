import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

export const metadata = {
  title: "Tourify",
  description: "Unauthenticated area",
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
