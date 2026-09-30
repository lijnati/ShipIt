import type { Metadata } from "next";
import { NotFoundView } from "@/components/shipit/not-found-view";

export const metadata: Metadata = { title: "Not found", robots: { index: false } };

export default function NotFound() {
  return (
    <NotFoundView
      title="Nothing shipped here."
      body="This page doesn't exist. Check the link, or go make something that does."
    />
  );
}
