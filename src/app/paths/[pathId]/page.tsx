import type { Metadata } from "next";
import { PathDetail } from "@/components/path/PathDetail";

export const metadata: Metadata = {
  title: "Learning path",
  description: "Your scheduled mini-course plan, module by module.",
};

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  return <PathDetail pathId={pathId} />;
}
