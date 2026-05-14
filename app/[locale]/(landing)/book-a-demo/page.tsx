import type { Metadata } from "next";
import BookADemoClient from "@/components/common/book-a-demo/BookADemoClient";

export const metadata: Metadata = {
  title: "Book a Demo — TwinO",
  description:
    "Schedule a 15-minute live walkthrough of TwinO, the AI-powered lead qualification platform for real estate.",
};

export default function BookADemoPage() {
  return <BookADemoClient />;
}
