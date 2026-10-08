import type { Course } from "@/types";

export const gitEssentials: Course = {
  id: "git-essentials",
  slug: "git-essentials",
  title: "Git & Version Control Essentials",
  subtitle: "Stop emailing zip files. Track every change with confidence.",
  description:
    "Version control is the shared language of every engineering team. Go from 'what is a commit' to opening a pull request a reviewer will approve, including how to survive a merge conflict without panicking.",
  icon: "🌿",
  accent: "from-orange-500 to-amber-400",
  category: "foundations",
  tags: ["git", "version control", "github", "collaboration", "code review"],
  level: "beginner",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 45,
  outcomes: [
    "Explain what a commit is and why history matters",
    "Run the daily add / commit / push workflow without looking it up",
    "Create a branch, merge it, and resolve a conflict",
    "Write a pull request description a reviewer can approve quickly",
  ],
  origin: "curated",
  modules: [
    {
      id: "git-m1",
      title: "Version control foundations",
      summary: "The mental model: snapshots, history and why 'undo' is not enough.",
      lessons: [
        {
          id: "why-version-control",
          title: "Why version control exists",
          minutes: 10,
          objectives: [
            "Describe a commit as a snapshot plus a message",
            "Recognise the working directory, staging area and history",
          ],
          blocks: [
            {
              kind: "text",
              heading: "The problem before Git",
              body: [
                "Without version control, teams share work by copying folders: report_final_v3_actually_final.docx. Nobody knows which file is current, who changed what, or how to undo a change safely.",
                "Git replaces that chaos with a history. Each commit records a snapshot of the whole project plus a message explaining why the change exists. Any snapshot can be inspected, compared or restored.",
              ],
            },
            {
              kind: "callout",
              tone: "info",
              title: "Commit messages are for humans",
              body: "A good message answers 'why', not 'what'. The diff already shows what changed. Write 'Fix checkout total rounding for gift cards', not 'update file'.",
            },
            {
              kind: "quiz",
              question: "Which statement best describes a Git commit?",
              options: [
                "A snapshot of the project plus a message explaining the change",
                "A live copy of the project that only one person can edit",
                "A backup Git uploads automatically every hour",
                "A list of the files you are currently editing",
              ],
              answerIndex: 0,
              explanation:
                "A commit is an immutable snapshot with a message, an author and a pointer to its parent. That chain is the history.",
            },
          ],
        },
        {
          id: "first-commit-workflow",
          title: "Your first commit workflow",
          minutes: 15,
          objectives: [
            "Initialise a repository and make a first commit",
            "Read git status and know what it is telling you",
          ],
          blocks: [
            {
              kind: "text",
              body: [
                "You will type these commands thousands of times. The habit that separates beginners from confident users is running git status constantly: it always tells you which state your files are in.",
              ],
            },
            {
              kind: "code",
              language: "bash",
              caption: "Start a repository and make the first commit",
              code: `git init                     # turn this folder into a repository
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

git status                   # ask what is going on - do this constantly
git add .                    # stage the files for the next commit
git commit -m "Add project skeleton and README"
git log --oneline            # see the history you just created`,
            },
            {
              kind: "checklist",
              title: "Before every commit",
              items: [
                "git status shows only files that belong to this change",
                "No debugging leftovers: console.log, TODO, secrets",
                "The commit message explains why the change is needed",
                "The project still runs",
              ],
            },
            {
              kind: "quiz",
              question:
                "You edited three files but only want two of them in this commit. What do you do?",
              options: [
                "Run git add with the two file paths, then commit",
                "Run git add . and delete the third file afterwards",
                "Commit everything and explain it in the message",
                "Delete the third file, commit, then recreate it",
              ],
              answerIndex: 0,
              explanation:
                "Staging is selective by design: git add path/to/file stages exactly that file and leaves the rest untouched.",
            },
          ],
        },
      ],
    },
    {
      id: "git-m2",
      title: "Branching and collaborating",
      summary: "Work in parallel, merge safely, and get your pull request merged.",
      lessons: [
        {
          id: "branch-merge-resolve",
          title: "Branch, merge, resolve - and open a PR",
          minutes: 20,
          objectives: [
            "Create and switch branches without losing work",
            "Resolve a merge conflict and finish the merge",
            "Open a pull request a reviewer can act on quickly",
          ],
          blocks: [
            {
              kind: "text",
              heading: "A branch is just a movable label",
              body: [
                "A branch is a pointer to a commit that moves forward as you commit. Creating one is instant, which is why teams use a branch per feature: main stays deployable while your unfinished work lives safely elsewhere.",
                "When the feature is ready you merge the branch back into main. Git merges automatically unless the same lines changed on both sides - that is all a conflict is.",
              ],
            },
            {
              kind: "simulation",
              simulationId: "git-branching",
              title: "Branch & Merge Sandbox",
              description:
                "Create commits and branches on a live graph. Merge a diverged branch to see how Git reports a conflict, then resolve it.",
            },
            {
              kind: "code",
              language: "bash",
              caption: "The branch workflow you will repeat daily",
              code: `git switch main && git pull          # start from an up-to-date main
git switch -c feature/checkout-coupon  # branch for the feature

git add . && git commit -m "Apply coupon before tax"

git switch main && git pull            # refresh main
git switch feature/checkout-coupon
git merge main                         # bring main into your branch

git push -u origin feature/checkout-coupon`,
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Never mix a refactor with a behaviour change",
              body: "A diff that reformats 40 files and fixes a bug cannot be reviewed. Split it: the reviewer approves the refactor fast and spends real attention on the bug.",
            },
            {
              kind: "quiz",
              question: "Git stops a merge with conflict markers in one file. What is the correct next step?",
              options: [
                "Edit the file to the intended result, remove the markers, then git add and commit",
                "Delete the repository and clone it again",
                "Run git reset --hard to throw the branch away",
                "Wait for Git to resolve it on the next pull",
              ],
              answerIndex: 0,
              explanation:
                "You are the only one who knows the intended result. Resolve the file, stage it and commit to complete the merge. Nothing is lost: both original versions stay in the history.",
            },
          ],
        },
      ],
    },
  ],
};
