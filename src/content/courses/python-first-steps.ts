import type { Course } from "@/types";

export const pythonFirstSteps: Course = {
  id: "python-first-steps",
  slug: "python-first-steps",
  title: "Python for Absolute Beginners",
  subtitle: "Your first programming language, from zero.",
  description:
    "Python reads almost like English, which makes it the friendliest first language and the most common second language for analysts, testers and product people. Write real scripts, understand errors instead of fearing them, and finish with a small program that cleans up a data file.",
  icon: "🐍",
  accent: "from-sky-500 to-emerald-400",
  category: "foundations",
  tags: ["python", "programming", "scripting", "automation", "non-cs"],
  level: "beginner",
  audience: ["non-cs", "cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Run a Python script and read its output and errors",
    "Use variables, conditions, loops and functions",
    "Store and transform data with lists and dictionaries",
    "Read a file, change the data, and write a new file",
  ],
  origin: "curated",
  modules: [
    {
      id: "py-m1",
      title: "Getting started",
      summary: "Install, run, and write your first working script.",
      lessons: [
        {
          id: "running-python",
          title: "Running Python and your first script",
          minutes: 12,
          objectives: [
            "Run code in a terminal or editor",
            "Explain what a traceback tells you",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Two ways to run Python",
              body: [
                "The interactive shell (type python and press Enter) runs one line at a time - perfect for experiments. A script file (.py) runs a whole program - what you will use for real work.",
                "When something breaks, Python prints a traceback: the last line names the error, and the lines above show the path it took. Read the last line first, then the line number.",
              ],
            },
            {
              kind: "code",
              language: "python",
              caption: "hello.py - your first script",
              code: `# Save this as hello.py and run: python hello.py
name = "Ada"
minutes_per_day = 30

print(f"Hello {name}!")
print("You will study", minutes_per_day * 7, "minutes this week.")

# Common errors and what they mean:
# NameError        -> you used a variable that does not exist yet (typo?)
# IndentationError -> a line inside a block is not indented consistently
# TypeError        -> you mixed incompatible types, e.g. "3" + 3`,
            },
            {
              kind: "quiz",
              question:
                "Your script prints: NameError: name 'totle' is not defined. What is the most likely cause?",
              options: [
                "A typo: the variable is defined as 'total' somewhere else",
                "Python is not installed correctly",
                "The file is saved in the wrong folder",
                "The computer ran out of memory",
              ],
              answerIndex: 0,
              explanation:
                "NameError almost always means the name does not exist at that point: a typo, or use before assignment.",
            },
          ],
        },
        {
          id: "variables-and-flow",
          title: "Variables, types and control flow",
          minutes: 18,
          objectives: [
            "Choose the right type for a value",
            "Write conditions and loops that stop correctly",
          ],
          blocks: [
            {
              kind: "text",
              body: [
                "A variable is a name pointing at a value. The four types you will use constantly are str (text), int (whole numbers), float (decimals) and bool (True/False).",
                "Control flow is just 'do this only if...' and 'do this for each...'. The danger zone for beginners is loops that never end, or conditions that are never true.",
              ],
            },
            {
              kind: "code",
              language: "python",
              caption: "Conditions and loops",
              code: `score = 72
grade = "pass" if score >= 50 else "resit"

if score >= 85:
    print("distinction")
elif score >= 50:
    print(grade)
else:
    print("resit")

# Loop over a range of numbers
for day in range(1, 4):
    print("study block", day)

# While loop with a clear stop condition
attempts = 0
while attempts < 3:
    attempts += 1
print("tried", attempts, "times")`,
            },
            {
              kind: "checklist",
              title: "Loop safety checklist",
              items: [
                "Every while loop changes something that can end it",
                "range(1, 4) gives 1, 2, 3 - the end value is excluded",
                "Indentation is 4 spaces and consistent inside a block",
                "You print something inside the loop to check it runs",
              ],
            },
            {
              kind: "quiz",
              question: "How many times does `for day in range(1, 4):` run its body?",
              options: ["3 times", "4 times", "1 time", "Forever"],
              answerIndex: 0,
              explanation:
                "range(1, 4) produces 1, 2, 3. The upper bound is excluded, which is the single most common off-by-one mistake in Python.",
            },
          ],
        },
      ],
    },
    {
      id: "py-m2",
      title: "Working with data",
      summary: "Functions, collections, and your first useful script.",
      lessons: [
        {
          id: "functions-lists-dicts",
          title: "Functions, lists and dictionaries",
          minutes: 20,
          objectives: [
            "Package logic into a reusable function",
            "Choose between a list and a dictionary",
            "Clean up a file of data and write the result out",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Functions turn steps into tools",
              body: [
                "A function gives a name to a chunk of work so you can reuse it and test it once. Keep functions small and let them return a value instead of printing inside.",
                "Lists keep things in order. Dictionaries map a key to a value, which is what you want whenever you look something up by name.",
              ],
            },
            {
              kind: "code",
              language: "python",
              caption: "A tiny data-cleaning script end to end",
              code: `def parse_amount(raw):
    """Turn ' GBP 1,240.50 ' into 1240.5, or 0.0 when unreadable."""
    cleaned = raw.replace("GBP", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

rows = [
    {"name": "Ada", "amount": " GBP 1,240.50 "},
    {"name": "Grace", "amount": "n/a"},
    {"name": "Alan", "amount": " GBP 980.00 "},
]

totals = {row["name"]: parse_amount(row["amount"]) for row in rows}
print(totals)                      # {'Ada': 1240.5, 'Grace': 0.0, 'Alan': 980.0}
print(sum(totals.values()))        # 2220.5

with open("totals.txt", "w", encoding="utf-8") as handle:
    for name, total in sorted(totals.items()):
        handle.write(f"{name}: {total:.2f}\\n")`,
            },
            {
              kind: "callout",
              tone: "tip",
              title: "Handle the bad row, not the good one",
              body: "Real files contain blanks, 'n/a' and stray spaces. Wrap the risky conversion in try/except and return a safe default, so one broken row cannot stop the whole script.",
            },
            {
              kind: "quiz",
              question:
                "You need to look up a customer's email address by their account id. Which structure fits best?",
              options: [
                "A dictionary keyed by account id",
                "A list, searched from the start each time",
                "A single string with all emails joined together",
                "A while loop that re-reads the file every time",
              ],
              answerIndex: 0,
              explanation:
                "A dictionary lookup by key is direct and readable: emails[account_id]. Scanning a list works but costs time and hides intent.",
            },
          ],
        },
      ],
    },
  ],
};
