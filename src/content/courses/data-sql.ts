import type { Course } from "@/types";

export const dataSql: Course = {
  id: "data-sql",
  slug: "data-sql",
  title: "SQL & Data Fluency",
  subtitle: "Answer your own questions without waiting for the data team.",
  description:
    "SQL is the most portable skill in the workplace: it works the same in every tool that touches data. Learn to read a table, write a query that answers a real question, group and join without fear, and sanity-check a number before you present it.",
  icon: "🗃️",
  accent: "from-amber-500 to-orange-400",
  category: "data",
  tags: ["sql", "data", "analytics", "databases", "non-cs"],
  level: "beginner",
  audience: ["non-cs", "cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Read a table schema and know what a row represents",
    "Write SELECT, WHERE and GROUP BY queries",
    "Join two tables and explain what the join does",
    "Sanity-check a result before sharing it",
  ],
  origin: "curated",
  modules: [
    {
      id: "sql-m1",
      title: "Asking questions of data",
      summary: "From a table to a defensible number.",
      lessons: [
        {
          id: "tables-and-questions",
          title: "Tables, rows and the questions you can ask",
          minutes: 15,
          objectives: [
            "Identify the grain of a table",
            "Match a business question to a column",
          ],
          blocks: [
            {
              kind: "text",
              heading: "What is one row?",
              body: [
                "Before writing a query, answer one question: what does a single row represent? One order, one customer, one event? That is the grain, and getting it wrong is the most common source of wrong numbers.",
                "Then translate the request into columns: which column identifies the thing, which one measures it, and which one filters the population you care about.",
              ],
            },
            {
              kind: "code",
              language: "sql",
              caption: "The shape of every query",
              code: `-- What is one row here? One order.
-- orders(order_id, customer_id, created_at, status, total_cents)

SELECT status,                    -- what you group by
       COUNT(*) AS orders,        -- what you measure
       SUM(total_cents) / 100.0 AS revenue_gbp
FROM orders
WHERE created_at >= '2026-01-01'  -- the population you care about
  AND status <> 'cancelled'
GROUP BY status
ORDER BY orders DESC;`,
            },
            {
              kind: "quiz",
              question:
                "The orders table has one row per order, but a customer can order many times. How many rows does a customer with three orders contribute?",
              options: [
                "Three rows - one per order",
                "One row, with the orders combined",
                "Two rows, one for the first and one for the rest",
                "It depends on the database version",
              ],
              answerIndex: 0,
              explanation:
                "The grain is the order, not the customer. Counting customers from this table requires COUNT(DISTINCT customer_id).",
            },
          ],
        },
        {
          id: "select-where-group-by",
          title: "SELECT, WHERE, GROUP BY",
          minutes: 18,
          objectives: [
            "Filter before you aggregate",
            "Compute a rate correctly, with counts alongside it",
          ],
          blocks: [
            {
              kind: "text",
              heading: "The order the database actually works in",
              body: [
                "FROM, WHERE, GROUP BY, then SELECT. That is why you cannot use an alias you created in SELECT inside WHERE - the alias does not exist yet at that point.",
                "Aggregate functions collapse many rows into one. As soon as you group, every column you select must either be in the GROUP BY or wrapped in an aggregate, otherwise the result is undefined.",
              ],
            },
            {
              kind: "code",
              language: "sql",
              caption: "A rate, with the counts that make it trustworthy",
              code: `SELECT device,
       COUNT(*) AS sessions,
       SUM(CASE WHEN converted THEN 1 ELSE 0 END) AS conversions,
       ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(*), 2) AS rate_pct
FROM sessions
WHERE session_date BETWEEN '2026-09-01' AND '2026-09-07'
GROUP BY device
HAVING COUNT(*) > 100          -- ignore segments too small to conclude from
ORDER BY rate_pct DESC;`,
            },
            {
              kind: "checklist",
              title: "Before you trust a number",
              items: [
                "How many rows are behind it? A rate from 4 sessions means nothing",
                "Is the date range like-for-like with what you are comparing?",
                "Did the WHERE clause accidentally exclude a group?",
                "Do the parts add up to the whole?",
                "Would a colleague reproduce this from your query alone?",
              ],
            },
            {
              kind: "quiz",
              question: "Why show the count next to a percentage?",
              options: [
                "So the reader can judge whether the sample is large enough to mean anything",
                "Because SQL requires both columns",
                "To make the query run faster",
                "Percentages are always wrong without a count",
              ],
              answerIndex: 0,
              explanation:
                "A 50% rate from 4 sessions and from 40,000 sessions are completely different claims. The count is what makes the percentage honest.",
            },
          ],
        },
        {
          id: "joins-without-fear",
          title: "Joins without fear",
          minutes: 17,
          objectives: [
            "Choose between INNER and LEFT JOIN",
            "Spot the row multiplication that a join can cause",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Joins match rows on a shared key",
              body: [
                "An INNER JOIN keeps only rows that match on both sides. A LEFT JOIN keeps every row from the left table and fills NULL where nothing matched - which is exactly what you want when the question is 'who has not done X yet?'.",
                "The trap is row multiplication: if the right table has three rows for one key, your left rows triple and every SUM on the left is inflated. Always check the row count before and after a join.",
              ],
            },
            {
              kind: "code",
              language: "sql",
              caption: "Find customers with no orders this month",
              code: `-- LEFT JOIN + IS NULL is the standard "missing" pattern
SELECT c.customer_id,
       c.email,
       COUNT(o.order_id) AS orders_this_month
FROM customers AS c
LEFT JOIN orders AS o
       ON o.customer_id = c.customer_id
      AND o.created_at >= '2026-10-01'   -- join condition, not WHERE
GROUP BY c.customer_id, c.email
HAVING COUNT(o.order_id) = 0
ORDER BY c.email;`,
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Never put a LEFT JOIN filter in WHERE",
              body: "WHERE o.created_at >= ... silently turns your LEFT JOIN into an INNER JOIN, because NULL fails the comparison. Put conditions on the joined table in the ON clause.",
            },
            {
              kind: "quiz",
              question: "After joining orders to order_items, your revenue total tripled. What happened?",
              options: [
                "Each order now has one row per item, so the order total is counted repeatedly",
                "The join deleted the cancelled orders",
                "SQL added the totals together twice by mistake",
                "The date filter was too wide",
              ],
              answerIndex: 0,
              explanation:
                "The join changed the grain from one row per order to one row per item. Aggregate at the right grain - sum items, or sum orders before joining.",
            },
          ],
        },
      ],
    },
  ],
};
