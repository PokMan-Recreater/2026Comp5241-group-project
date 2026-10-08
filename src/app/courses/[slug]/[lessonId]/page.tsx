import type { Metadata } from "next";
import { LessonView } from "@/components/lesson/LessonView";
import { courseLessonsOf, curatedCourses, getLessonBySlug } from "@/content";

/** Pre-renders every curated lesson at build time; generated courses render on demand. */
export function generateStaticParams() {
  return curatedCourses.flatMap((course) =>
    courseLessonsOf(course).map((lesson) => ({ slug: course.slug, lessonId: lesson.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const location = getLessonBySlug(slug, lessonId);
  if (!location) return { title: "Lesson" };
  return {
    title: `${location.lesson.title} · ${location.course.title}`,
    description: location.lesson.objectives.join(" · "),
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  return <LessonView courseSlug={slug} lessonId={lessonId} />;
}
