import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Home from "@/components/Home";
export const metadata: Metadata = indexPageMetadata["/"];
export default function HomePage() {
  return <Home />;
}
