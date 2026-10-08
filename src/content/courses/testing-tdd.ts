import type { Course } from "@/types";

export const testingTdd: Course = {
  id: "testing-tdd",
  slug: "testing-tdd",
  title: "Automated Testing & TDD",
  subtitle: "Ship changes without breaking things you forgot existed.",
  description:
    "Tests are not paperwork: they are how you change code quickly without fear. Learn what is worth testing, write your first unit test, debug a broken function with evidence, and practise the red-green-refactor loop on real exercises.",
  icon: "🧪",
  accent: "from-emerald-500 to-lime-400",
  category: "engineering",
  tags: ["testing", "tdd", "quality", "debugging", "javascript"],
  level: "beginner",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Decide which behaviour is worth a test",
    "Write and run a unit test with clear assertions",
    "Use red-green-refactor to drive a small change",
  ],
  origin: "curated",
  modules: [
    {
      id: "test-m1",
      title: "Testing that pays for itself",
      summary: "From fear of change to evidence of correctness.",
      lessons: [
        {
          id: "why-tests-pay-off",
          title: "Why tests pay for themselves",
          minutes: 12,
          objectives: [
            "Explain the cost of a bug that reaches a user",
            "Tell the difference between a test and a check you do by hand",
          ],
          blocks: [
            {
              kind: "text",
              heading: "The real purpose of a test",
              body: [
                "A test is a written claim about behaviour that a machine can verify in seconds. Its main value is not catching today's bug - it is letting you change code next month without re-checking everything by hand.",
                "The cost of a bug grows with how late you find it: seconds in a test, hours in code review, days in production, and a great deal more when it involves money or personal data.",
              ],
            },
            {
              kind: "callout",
              tone: "info",
              title: "Test behaviour, not implementation",
              body: "A test that breaks when you rename a private function is a liability. Assert what the function promises to the outside world: inputs, outputs, errors.",
            },
            {
              kind: "quiz",
              question: "Which behaviour is the best candidate for an automated test?",
              options: [
                "A discount calculation with edge cases that are easy to get wrong",
                "The exact wording of a marketing headline",
                "The order of CSS properties in a stylesheet",
                "A one-off script you will run once and delete",
              ],
              answerIndex: 0,
              explanation:
                "Test logic with clear inputs, outputs and edge cases that humans get wrong. Text you will rewrite anyway and throwaway scripts are not worth the maintenance.",
            },
          ],
        },
        {
          id: "first-unit-test",
          title: "Write your first unit test",
          minutes: 18,
          objectives: [
            "Structure a test as arrange, act, assert",
            "Debug a function using a failing test as evidence",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Arrange, act, assert",
              body: [
                "Every good test has three parts: set up the input, call the thing, then assert on the result. If a test is hard to read, it is usually because those three parts are mixed together.",
                "Name tests after the behaviour, not the function: 'returns 0 for an empty list' tells you what broke when it fails in six months.",
              ],
            },
            {
              kind: "code",
              language: "javascript",
              caption: "The same shape in any framework",
              code: `// Arrange, act, assert - framework syntax varies, structure does not
test("average returns 0 for an empty list", () => {
  const input = [];                  // arrange
  const result = average(input);     // act
  expect(result).toBe(0);            // assert
});

test("average ignores nothing and divides by the count", () => {
  expect(average([2, 4, 6])).toBe(4);
  expect(average([10])).toBe(10);
});`,
            },
            {
              kind: "challenge",
              challengeId: "js-fix-average-bug",
            },
            {
              kind: "quiz",
              question:
                "A test fails with: expected 4, received NaN. Where do you look first?",
              options: [
                "The function's arithmetic and loop bounds, then the input the test passed",
                "The test framework version",
                "The machine's memory usage",
                "The order of the test files on disk",
              ],
              answerIndex: 0,
              explanation:
                "NaN comes from arithmetic on something that is not a number - usually an out-of-range index or a missing guard, exactly like the challenge above.",
            },
          ],
        },
        {
          id: "red-green-refactor",
          title: "Red, green, refactor",
          minutes: 20,
          objectives: [
            "Drive a change from a failing test",
            "Refactor safely once the test is green",
          ],
          blocks: [
            {
              kind: "text",
              heading: "The loop",
              body: [
                "Red: write a test that fails for the right reason. Green: write the simplest code that makes it pass. Refactor: improve the design while the test stays green. Each cycle should take minutes, not hours.",
                "The discipline pays off because you always know your next step, and you never spend an afternoon debugging code you cannot verify.",
              ],
            },
            {
              kind: "checklist",
              title: "Red-green-refactor checklist",
              items: [
                "The new test fails before you write the code, and fails for the expected reason",
                "The smallest change makes it pass - resist writing the general solution first",
                "All previous tests still pass before you refactor",
                "Refactoring changes structure only, never behaviour",
                "You commit when the suite is green, not when it is red",
              ],
            },
            {
              kind: "challenge",
              challengeId: "js-sum-even-numbers",
            },
            {
              kind: "challenge",
              challengeId: "js-fizzbuzz",
            },
            {
              kind: "quiz",
              question: "In TDD, when do you write the test?",
              options: [
                "Before the code, so the test can fail for the right reason first",
                "After the code, once you know it works",
                "Only when a bug is reported in production",
                "Never - tests slow teams down",
              ],
              answerIndex: 0,
              explanation:
                "Writing the test first forces you to define the behaviour, and seeing it fail proves the test can actually detect a problem.",
            },
          ],
        },
      ],
    },
  ],
};
