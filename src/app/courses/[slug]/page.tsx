import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetail } from "@/components/course/CourseDetail";
import { courseLessonsOf, curatedCourses, getCourseBySlug } from "@/content";

export function generateStaticParams() {
  return curatedCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div>
      <CourseDetail slug={slug} />
      <p className="mx-auto max-w-5xl px-4 pb-10 text-xs text-slate-500">
        {courseLessonsOf(course).length} lessons · {course.tags.join(" · ")}
      </p>
    </div>
  );
}
