import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Personalise your learning path",
  description:
    "Tell us your background, goal and weekly study time, name a topic, and get a scheduled mini-course path in seconds.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
