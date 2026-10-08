"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Course, LearnerProfile, LearningPath, ProgressState } from "@/types";
import { curatedCourses } from "@/content";
import {
  completeLesson as completeLessonFn,
  emptyProgress,
  lessonKey,
  recordChallenge as recordChallengeFn,
  recordInterview as recordInterviewFn,
  recordQuiz as recordQuizFn,
  reopenLesson,
  toggleBookmark as toggleBookmarkFn,
} from "@/lib/progress";
import { STORAGE_KEYS, readJSON, readString, writeJSON, writeString } from "@/lib/storage";
import { uid } from "@/lib/utils";

/**
 * Single source of truth for everything a learner owns: profile, generated
 * paths, progress and any custom courses. Persisted to localStorage, so the app
 * needs no database - which is what makes the Vercel deployment zero-config.
 */

export interface AppData {
  /** False until localStorage has been read, to avoid hydration mismatches. */
  ready: boolean;
  profile: LearnerProfile | null;
  progress: ProgressState;
  paths: LearningPath[];
  customCourses: Course[];
  /** Curated courses plus any generated ones. */
  allCourses: Course[];
  activePath: LearningPath | null;
  setProfile: (profile: LearnerProfile | null) => void;
  updateProfile: (patch: Partial<LearnerProfile>) => void;
  savePath: (path: LearningPath, course?: Course) => void;
  deletePath: (pathId: string) => void;
  setActivePath: (pathId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  toggleLessonComplete: (courseId: string, lessonId: string) => void;
  recordQuiz: (courseId: string, lessonId: string, correct: number, total: number) => void;
  recordChallenge: (challengeId: string, passed: boolean, code?: string) => void;
  recordInterview: (scenarioId: string, scenarioTitle: string, score: number) => void;
  toggleBookmark: (key: string) => void;
  resetProgress: () => void;
  findCourse: (slugOrId: string) => Course | undefined;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<LearnerProfile | null>(null);
  const [progress, setProgress] = useState<ProgressState>(emptyProgress());
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [activePathId, setActivePathId] = useState<string | null>(null);

  // Hydrate once, on the client. This is a deliberate one-time read of a
  // browser-only store: the server has no localStorage, so the state has to be
  // adopted after mount rather than during render.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage */
    setProfileState(readJSON<LearnerProfile | null>(STORAGE_KEYS.profile, null));
    setProgress(readJSON<ProgressState>(STORAGE_KEYS.progress, emptyProgress()));
    setPaths(readJSON<LearningPath[]>(STORAGE_KEYS.paths, []));
    setCustomCourses(readJSON<Course[]>(STORAGE_KEYS.customCourses, []));
    setActivePathId(readString(STORAGE_KEYS.activePath));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) writeJSON(STORAGE_KEYS.profile, profile);
  }, [ready, profile]);
  useEffect(() => {
    if (ready) writeJSON(STORAGE_KEYS.progress, progress);
  }, [ready, progress]);
  useEffect(() => {
    if (ready) writeJSON(STORAGE_KEYS.paths, paths);
  }, [ready, paths]);
  useEffect(() => {
    if (ready) writeJSON(STORAGE_KEYS.customCourses, customCourses);
  }, [ready, customCourses]);
  useEffect(() => {
    if (ready && activePathId) writeString(STORAGE_KEYS.activePath, activePathId);
  }, [ready, activePathId]);

  const setProfile = useCallback((next: LearnerProfile | null) => {
    setProfileState(next);
  }, []);

  const updateProfile = useCallback((patch: Partial<LearnerProfile>) => {
    setProfileState((previous) => (previous ? { ...previous, ...patch } : previous));
  }, []);

  const savePath = useCallback((path: LearningPath, course?: Course) => {
    setPaths((previous) => [path, ...previous.filter((item) => item.id !== path.id)].slice(0, 20));
    if (course) {
      setCustomCourses((previous) =>
        previous.some((item) => item.id === course.id) ? previous : [course, ...previous],
      );
    }
    setActivePathId(path.id);
  }, []);

  const deletePath = useCallback((pathId: string) => {
    setPaths((previous) => previous.filter((item) => item.id !== pathId));
    setActivePathId((current) => (current === pathId ? null : current));
  }, []);

  const completeLesson = useCallback((courseId: string, lessonId: string) => {
    setProgress((previous) => completeLessonFn(previous, courseId, lessonId));
  }, []);

  const toggleLessonComplete = useCallback((courseId: string, lessonId: string) => {
    setProgress((previous) =>
      previous.lessons[lessonKey(courseId, lessonId)]?.completed
        ? reopenLesson(previous, courseId, lessonId)
        : completeLessonFn(previous, courseId, lessonId),
    );
  }, []);

  const recordQuiz = useCallback(
    (courseId: string, lessonId: string, correct: number, total: number) => {
      setProgress((previous) => recordQuizFn(previous, courseId, lessonId, correct, total));
    },
    [],
  );

  const recordChallenge = useCallback((challengeId: string, passed: boolean, code?: string) => {
    setProgress((previous) => recordChallengeFn(previous, challengeId, passed, code));
  }, []);

  const recordInterview = useCallback(
    (scenarioId: string, scenarioTitle: string, score: number) => {
      setProgress((previous) =>
        recordInterviewFn(previous, scenarioId, scenarioTitle, score, uid("attempt")),
      );
    },
    [],
  );

  const toggleBookmark = useCallback((key: string) => {
    setProgress((previous) => toggleBookmarkFn(previous, key));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(emptyProgress());
  }, []);

  const allCourses = useMemo(() => [...customCourses, ...curatedCourses], [customCourses]);

  const activePath = useMemo(() => {
    if (paths.length === 0) return null;
    return paths.find((path) => path.id === activePathId) ?? paths[0];
  }, [paths, activePathId]);

  const findCourse = useCallback(
    (slugOrId: string) =>
      allCourses.find((course) => course.slug === slugOrId || course.id === slugOrId),
    [allCourses],
  );

  const value = useMemo<AppData>(
    () => ({
      ready,
      profile,
      progress,
      paths,
      customCourses,
      allCourses,
      activePath,
      setProfile,
      updateProfile,
      savePath,
      deletePath,
      setActivePath: setActivePathId,
      completeLesson,
      toggleLessonComplete,
      recordQuiz,
      recordChallenge,
      recordInterview,
      toggleBookmark,
      resetProgress,
      findCourse,
    }),
    [
      ready,
      profile,
      progress,
      paths,
      customCourses,
      allCourses,
      activePath,
      setProfile,
      updateProfile,
      savePath,
      deletePath,
      completeLesson,
      toggleLessonComplete,
      recordQuiz,
      recordChallenge,
      recordInterview,
      toggleBookmark,
      resetProgress,
      findCourse,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside <AppDataProvider>");
  }
  return context;
}
