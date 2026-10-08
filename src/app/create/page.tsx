import type { Metadata } from "next";
import { CustomTopicForm } from "@/components/create/CustomTopicForm";

export const metadata: Metadata = {
  title: "Generate a custom topic",
  description:
    "Type any topic and get a complete mini-course with modules, a weekly schedule and interview rehearsal - including subjects outside computer science.",
};

export default function CreatePage() {
  return <CustomTopicForm />;
}
