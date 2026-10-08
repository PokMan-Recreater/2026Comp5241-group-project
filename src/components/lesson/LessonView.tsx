"use client";

import Link from "next/link";
import { useState } from "react";
import type { LessonBlock } from "@/types";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ExplainButton } from "@/components/lesson/ExplainButton";
import { LessonBlocks, type HighlightTarget } from "@/components/lesson/LessonBlocks";
import { NarrateButton } from "@/components/lesson/NarrateButton";
import { findLesson, courseLessonsOf } from "@/content";
import { lessonKey } from "@/lib/progress";
import { formatMinutes, splitSentences } from "@/lib/utils";

interface NarrationSegment {
  blockIndex: number;
  paraIndex: number;
  sentences: string[];
}

/** Flattens the lesson's text blocks into ordered narration segments. */
function buildNarrationSegments(blocks: LessonBlock[]): NarrationSegment[] {
  const segments: NarrationSegment[] = [];
  blocks.forEach((block, blockIndex) => {
    if (block.kind !== "text") return;
    block.body.forEach((paragraph, paraIndex) => {
      segments.push({ blockIndex, paraIndex, sentences: splitSentences(paragraph) });
    });
  });
  return segments;
}

/**
 * Lesson player. Combines the content blocks with narration highlighting,
 * progress recording and prev/next navigation. Works for curated courses and for
 * courses generated for a custom topic (both live in the same store).
 */
export function LessonView({
  courseSlug,
  lessonId,
}: {
  courseSlug: string;
  lessonId: string;
}) {
  const {
    ready,
    findCourse,
    progress,
    completeLesson,
    recordQuiz,
    recordChallenge,
    recordInterview,
    toggleBookmark,
  } = useAppData();

  const course = findCourse(courseSlug);
  const location = course ? findLesson(course, lessonId) : undefined;
  const sourceLesson = location?.lesson;

  const [highlight, setHighlight] = useState<HighlightTarget | null>(null);
  const [quizStats, setQuizStats] = useState({ correct: 0, total: 0 });

  // Derived, cheap to recompute: sentence offsets used for narration highlighting.
  // (Deliberately not memoised - the repo's React Compiler lint rules reject a
  // manual memo whose dependency cannot be proven stable.)
  const segments = sourceLesson ? buildNarrationSegments(sourceLesson.blocks) : [];
  const script = segments.flatMap((segment) => segment.sentences).join(" ");

  if (!ready) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-slate-400">Loading lesson…</p>;
  }

  if (!course || !location) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="section-title">Lesson not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          This lesson may belong to a generated course that is stored in another browser profile.
        </p>
        <Link href="/catalog" className="btn btn-primary mt-6">
          Back to the catalogue
        </Link>
      </div>
    );
  }

  const { lesson, moduleTitle, index, total } = location;
  const key = lessonKey(course.id, lesson.id);
  const isComplete = progress.lessons[key]?.completed ?? false;
  const bookmarked = progress.bookmarks.includes(key);
  const lessons = courseLessonsOf(course);
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index + 1 < lessons.length ? lessons[index + 1] : null;

  const handleSentence = (sentenceIndex: number) => {
    let cursor = 0;
    for (const segment of segments) {
      if (sentenceIndex < cursor + segment.sentences.length) {
        setHighlight({
          blockIndex: segment.blockIndex,
          paraIndex: segment.paraIndex,
          sentenceIndex: sentenceIndex - cursor,
        });
        return;
      }
      cursor += segment.sentences.length;
    }
  };

  const handleQuizAnswered = (correct: boolean) => {
    const nextStats = {
      correct: quizStats.correct + (correct ? 1 : 0),
      total: quizStats.total + 1,
    };
    setQuizStats(nextStats);
    recordQuiz(course.id, lesson.id, nextStats.correct, nextStats.total);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/catalog" className="hover:text-white">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/courses/${course.slug}`} className="hover:text-white">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{moduleTitle}</span>
      </nav>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            Lesson {index + 1} of {total}
          </span>
          <span className="chip">⏱ {formatMinutes(lesson.minutes)}</span>
          {isComplete && <span className="chip border-emerald-400/40 text-emerald-200">completed</span>}
          <button
            type="button"
            className="btn btn-ghost btn-sm ml-auto"
            onClick={() => toggleBookmark(key)}
            aria-pressed={bookmarked}
          >
            {bookmarked ? "★ Saved" : "☆ Save"}
          </button>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{lesson.title}</h1>

        {lesson.objectives.length > 0 && (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="text-[13px] leading-6 text-slate-400">
                → {objective}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {script.length > 0 && (
            <NarrateButton
              script={script}
              label="Listen to this lesson"
              onSentence={handleSentence}
              onEnd={() => setHighlight(null)}
            />
          )}
          <ExplainButton key={lesson.id} topic={lesson.title} />
        </div>
      </header>

      <hr className="my-6 border-white/10" />

      <LessonBlocks
        blocks={lesson.blocks}
        highlight={highlight}
        onQuizAnswered={handleQuizAnswered}
        onChallengeResult={(challengeId, passed, code) => recordChallenge(challengeId, passed, code)}
        onInterviewFinished={(score, title) => recordInterview(lesson.id, title, score)}
      />

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={isComplete ? "btn btn-secondary" : "btn btn-primary"}
            onClick={() => completeLesson(course.id, lesson.id)}
          >
            {isComplete ? "✓ Completed" : "Mark lesson complete (+40 XP)"}
          </button>
          {quizStats.total > 0 && (
            <span className="text-xs text-slate-400">
              quiz this session: {quizStats.correct}/{quizStats.total}
            </span>
          )}
          {next ? (
            <Link
              href={`/courses/${course.slug}/${next.id}`}
              className="btn btn-secondary ml-auto"
              onClick={() => completeLesson(course.id, lesson.id)}
            >
              Next: {next.title} →
            </Link>
          ) : (
            <Link href={`/courses/${course.slug}`} className="btn btn-secondary ml-auto">
              Back to course overview
            </Link>
          )}
        </div>
      </section>

      <nav className="mt-6 flex items-center justify-between text-sm">
        {previous ? (
          <Link href={`/courses/${course.slug}/${previous.id}`} className="link">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/courses/${course.slug}`} className="text-slate-500 hover:text-white">
          All lessons
        </Link>
      </nav>

    </div>
  );
}
