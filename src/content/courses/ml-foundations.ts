import type { Course } from "@/types";

export const mlFoundations: Course = {
  id: "ml-foundations",
  slug: "ml-foundations",
  title: "Machine Learning Foundations",
  subtitle: "What 'the model learned it' actually means.",
  description:
    "Before the tooling, there is one idea: adjust the parameters until the predictions stop being wrong. Fit a line by hand, see why a validation set exists, and learn to judge where a model belongs in a product - and where it definitely does not.",
  icon: "📈",
  accent: "from-cyan-500 to-indigo-400",
  category: "ai",
  tags: ["machine learning", "models", "training", "data science", "evaluation"],
  level: "intermediate",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 55,
  outcomes: [
    "Explain training as minimising a loss function",
    "Describe overfitting and why a validation set exists",
    "Decide whether a problem is a good fit for machine learning",
  ],
  origin: "curated",
  modules: [
    {
      id: "ml-m1",
      title: "How models learn",
      summary: "Loss, gradients, generalisation, and product fit.",
      lessons: [
        {
          id: "learning-from-data",
          title: "Learning from data",
          minutes: 18,
          objectives: [
            "Explain the role of a loss function",
            "Predict what a learning rate that is too large will do",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Fitting is guessing, measuring and correcting",
              body: [
                "A model starts with random parameters. It makes a prediction, measures how wrong it was with a loss function, then nudges each parameter in the direction that reduces the loss. Repeat a few thousand times and the guesses become useful.",
                "The learning rate controls the size of each nudge. Too small and training takes forever; too large and the loss bounces around or explodes instead of settling.",
              ],
            },
            {
              kind: "simulation",
              simulationId: "gradient-descent",
              title: "Gradient Descent Playground",
              description:
                "Fit a line to noisy data by hand: choose a learning rate, step the optimiser and watch the loss curve converge - or blow up.",
            },
            {
              kind: "quiz",
              question: "You raise the learning rate and the loss jumps up and down without settling. What is happening?",
              options: [
                "The steps are too large, so the optimiser keeps overshooting the minimum",
                "The dataset is too small to learn from",
                "The loss function is broken",
                "The model has already finished training",
              ],
              answerIndex: 0,
              explanation:
                "A large step size overshoots the valley and can diverge. Lower the rate, or add a schedule that shrinks it over time.",
            },
          ],
        },
        {
          id: "validation-and-overfitting",
          title: "Training, validation and overfitting",
          minutes: 20,
          objectives: [
            "Explain why a validation set must stay untouched",
            "Recognise overfitting from two numbers",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Two numbers tell the story",
              body: [
                "Split the data: train on most of it, validate on the rest. If training error keeps falling while validation error rises, the model is memorising noise instead of learning the pattern - that is overfitting.",
                "Tune everything on the validation set, then touch the test set once at the end. If you tune on the test set, your reported score is fiction.",
              ],
            },
            {
              kind: "code",
              language: "python",
              caption: "The split that prevents self-deception",
              code: `from sklearn.model_selection import train_test_split

# 1. Hold out a test set and do not look at it until the very end
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Split the remainder into train and validation
X_fit, X_val, y_fit, y_val = train_test_split(
    X_train, y_train, test_size=0.25, random_state=42
)

# 3. Compare the two numbers after each epoch
#    train error falling + validation error rising  ->  overfitting
#    both high and flat                             ->  underfitting`,
            },
            {
              kind: "challenge",
              challengeId: "js-reverse-words",
            },
            {
              kind: "quiz",
              question:
                "Training accuracy is 99%, validation accuracy is 71%. What is the most likely problem?",
              options: [
                "Overfitting - the model has memorised the training data",
                "Underfitting - the model is too simple",
                "The validation set is too large",
                "The learning rate is too small",
              ],
              answerIndex: 0,
              explanation:
                "A large gap between train and validation performance is the signature of overfitting. Fix it with more data, regularisation, or a simpler model.",
            },
          ],
        },
        {
          id: "ml-in-products",
          title: "Where ML fits in a product",
          minutes: 17,
          objectives: [
            "Decide whether a problem needs machine learning at all",
            "Define the metric the model is actually serving",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Start with the rule you cannot write",
              body: [
                "Machine learning earns its place when the rule is genuinely hard to write down but you have examples of the answer: spam filtering, ranking, forecasting, transcription. If a simple rule or a lookup table gets you 90% of the way, ship that instead.",
                "Then connect the model metric to a product metric. Accuracy on a dataset means nothing until you say which business number it moves and by how much.",
              ],
            },
            {
              kind: "checklist",
              title: "Is this a machine learning problem?",
              items: [
                "Do we have labelled examples of the outcome we want to predict?",
                "Would a rule or a lookup table be good enough?",
                "What is the cost of a false positive versus a false negative?",
                "Which product metric should improve, and by how much?",
                "Who checks the output before it affects a person?",
                "How will we notice when the data drifts?",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Beware the accuracy trap",
              body: "With 2% fraud, a model that always predicts 'not fraud' is 98% accurate and completely useless. Pick a metric that reflects the cost of each mistake, and report the baseline next to it.",
            },
            {
              kind: "quiz",
              question: "A team reports 98% accuracy on a fraud model. Why is that not impressive on its own?",
              options: [
                "Because predicting 'no fraud' every time would score 98% when fraud is rare",
                "Because accuracy is never a valid metric",
                "Because fraud models always overfit",
                "Because 98% is below the industry standard",
              ],
              answerIndex: 0,
              explanation:
                "Always compare against the trivial baseline. For imbalanced problems, look at precision, recall or cost-weighted measures instead.",
            },
          ],
        },
      ],
    },
  ],
};
