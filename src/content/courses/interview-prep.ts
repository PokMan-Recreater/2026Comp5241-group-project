import type { Course } from "@/types";

export const interviewPrep: Course = {
  id: "interview-prep",
  slug: "interview-prep",
  title: "Technical Interview Bootcamp",
  subtitle: "Turn what you know into an offer.",
  description:
    "Interviews are a performance as well as a test. Learn how candidates are actually scored, build a bank of STAR stories you can adapt to any question, and rehearse live coding and behavioural rounds against realistic role-play scenarios with instant rubric feedback.",
  icon: "🎤",
  accent: "from-rose-500 to-orange-400",
  category: "career",
  tags: ["interview", "career", "role-play", "star", "non-cs"],
  level: "beginner",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Explain what interviewers are scoring you on",
    "Tell a STAR story that lands in 90 seconds",
    "Narrate your thinking during a live coding exercise",
  ],
  origin: "curated",
  modules: [
    {
      id: "interview-m1",
      title: "Interview craft",
      summary: "Scoring, stories, and staying calm under observation.",
      lessons: [
        {
          id: "how-interviews-are-scored",
          title: "How interviews are actually scored",
          minutes: 12,
          objectives: [
            "Recognise the signals interviewers write down",
            "Prepare for the follow-up question, not just the first one",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Interviewers write evidence, not vibes",
              body: [
                "Most structured interviews score you against a short rubric: did you clarify the problem, was your reasoning visible, did you test your own answer, how did you react to being corrected? The interviewer needs to justify the decision to a hiring committee, so they write down what you said.",
                "That means the winning behaviour is audible thinking: state your assumptions, name the trade-off you are choosing, and say what you would check next. Silence is the only truly bad answer.",
              ],
            },
            {
              kind: "callout",
              tone: "info",
              title: "The 90-second rule",
              body: "Answers should land in 60 to 90 seconds and stop. Long answers lose the interviewer, and they will remember the confusion rather than the content.",
            },
            {
              kind: "quiz",
              question: "You do not know the answer to a technical question. What scores best?",
              options: [
                "Say what you do know, how you would find out, and give an example of a similar problem you solved",
                "Apologise and wait for the next question",
                "Guess confidently and move on quickly",
                "Say the question is unfair and explain why",
              ],
              answerIndex: 0,
              explanation:
                "Interviewers score reasoning and honesty. A structured 'here is how I would find out' beats a confident wrong answer every time.",
            },
          ],
        },
        {
          id: "star-stories",
          title: "STAR stories for behavioural rounds",
          minutes: 18,
          objectives: [
            "Build three flexible STAR stories",
            "Adapt one story to several different questions",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Situation, Task, Action, Result",
              body: [
                "Prepare three stories: one about a conflict, one about a failure or a slipping deadline, and one about something you taught yourself. Between them they cover almost every behavioural question you will be asked.",
                "Finish each story with what you would do differently. Interviewers score reflection highly, and it shows you are not reciting a script.",
              ],
            },
            {
              kind: "roleplay",
              scenarioId: "behavioural-teamwork",
            },
            {
              kind: "checklist",
              title: "Story bank template",
              items: [
                "Situation in one sentence: where, when, who",
                "Task: what you specifically were responsible for",
                "Action: two or three decisions you made, in order",
                "Result: a number, a decision, or a change that lasted",
                "Reflection: what you would do differently now",
              ],
            },
            {
              kind: "quiz",
              question: "Your story is 4 minutes long. What does the interviewer most likely write down?",
              options: [
                "That you struggle to prioritise and summarise",
                "That you have excellent depth of experience",
                "Nothing - they stop taking notes",
                "That the project was very complex",
              ],
              answerIndex: 0,
              explanation:
                "Concise, structured answers signal communication skills. Cut the setup and lead with the decision you made.",
            },
          ],
        },
        {
          id: "live-coding",
          title: "Live coding without freezing",
          minutes: 20,
          objectives: [
            "Narrate a plan before writing code",
            "Recover gracefully when your first approach fails",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Talk first, type second",
              body: [
                "Restate the problem, ask one clarifying question, then describe your approach in two sentences before typing anything. This buys thinking time and gives the interviewer something to score even if you do not finish.",
                "Test with a tiny example by hand, then write the smallest failing case. When you get stuck, say out loud what you know and what you are unsure about - that is exactly the evidence the interviewer needs.",
              ],
            },
            {
              kind: "challenge",
              challengeId: "js-slugify-url",
            },
            {
              kind: "roleplay",
              scenarioId: "frontend-intern-screen",
            },
            {
              kind: "quiz",
              question: "You realise halfway through that your approach will not work. What is the best move?",
              options: [
                "Say so, explain why, and propose the alternative before rewriting",
                "Keep going silently and hope it works out",
                "Delete everything and start again without explanation",
                "Ask the interviewer to give you the answer",
              ],
              answerIndex: 0,
              explanation:
                "Naming the problem and proposing a fix is exactly the behaviour the rubric rewards. Silent struggle is invisible to the scorer.",
            },
          ],
        },
      ],
    },
  ],
};
