import type { CodeChallenge } from "@/types";

/**
 * In-browser coding challenges.
 *
 * Tests are JavaScript expressions evaluated inside a sandboxed iframe with two
 * variables in scope:
 *   `fn`     - the learner's function (named by `entryPoint`)
 *   `expect` - equality helper, `expect(actual, expected)` returns a boolean
 *
 * Nothing is executed on the server, so learner code can never touch the app.
 */
export const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: "js-sum-even-numbers",
    title: "Sum the even numbers",
    difficulty: "beginner",
    prompt:
      "Write `sumEven(numbers)` that returns the total of only the even numbers in the array. An empty array returns 0.",
    entryPoint: "sumEven",
    starterCode: `function sumEven(numbers) {
  // TODO: add up only the even numbers
  return 0;
}`,
    hint: "Loop over the array and check `number % 2 === 0` before adding. `%` gives the remainder, so even numbers have remainder 0.",
    solution: `function sumEven(numbers) {
  let total = 0;
  for (const number of numbers) {
    if (number % 2 === 0) total += number;
  }
  return total;
}`,
    tests: [
      {
        name: "adds even numbers",
        run: "expect(fn([1, 2, 3, 4]), 6)",
        expectation: "sumEven([1, 2, 3, 4]) should be 6",
      },
      {
        name: "ignores odd numbers only",
        run: "expect(fn([1, 3, 5]), 0)",
        expectation: "sumEven([1, 3, 5]) should be 0",
      },
      {
        name: "handles an empty array",
        run: "expect(fn([]), 0)",
        expectation: "sumEven([]) should be 0",
      },
      {
        name: "handles negative even numbers",
        run: "expect(fn([-2, 3, 4]), 2)",
        expectation: "sumEven([-2, 3, 4]) should be 2",
      },
    ],
  },
  {
    id: "js-reverse-words",
    title: "Reverse the word order",
    difficulty: "beginner",
    prompt:
      "Write `reverseWords(text)` that returns the words in reverse order, separated by a single space. Extra whitespace should be ignored.",
    entryPoint: "reverseWords",
    starterCode: `function reverseWords(text) {
  // TODO: split, reverse, join
  return text;
}`,
    hint: "`text.trim().split(/\\s+/)` gives clean words. Arrays have `.reverse()` and `.join(\" \")`.",
    solution: `function reverseWords(text) {
  const words = text.trim().split(/\\s+/).filter(Boolean);
  return words.reverse().join(" ");
}`,
    tests: [
      {
        name: "reverses three words",
        run: 'expect(fn("one two three"), "three two one")',
        expectation: 'reverseWords("one two three") should be "three two one"',
      },
      {
        name: "single word stays put",
        run: 'expect(fn("hello"), "hello")',
        expectation: 'reverseWords("hello") should be "hello"',
      },
      {
        name: "empty string stays empty",
        run: 'expect(fn(""), "")',
        expectation: 'reverseWords("") should be ""',
      },
      {
        name: "collapses messy whitespace",
        run: 'expect(fn("  a   b "), "b a")',
        expectation: 'reverseWords("  a   b ") should be "b a"',
      },
    ],
  },
  {
    id: "js-chunk-array",
    title: "Chunk an array (LLM batching)",
    difficulty: "intermediate",
    prompt:
      "Large language models accept a limited number of items per request, so we batch them. Write `chunk(items, size)` that splits an array into groups of `size`. A size below 1 returns an empty array.",
    entryPoint: "chunk",
    starterCode: `function chunk(items, size) {
  // TODO: return an array of arrays
  return [items];
}`,
    hint: "Walk the array with a step of `size` and use `items.slice(start, start + size)`.",
    solution: `function chunk(items, size) {
  if (size < 1) return [];
  const groups = [];
  for (let start = 0; start < items.length; start += size) {
    groups.push(items.slice(start, start + size));
  }
  return groups;
}`,
    tests: [
      {
        name: "splits into groups",
        run: "expect(fn([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])",
        expectation: "chunk([1,2,3,4,5], 2) should be [[1,2],[3,4],[5]]",
      },
      {
        name: "size of one",
        run: "expect(fn(['a', 'b'], 1), [['a'], ['b']])",
        expectation: "chunk(['a','b'], 1) should be [['a'],['b']]",
      },
      {
        name: "size larger than the array",
        run: "expect(fn([1, 2], 10), [[1, 2]])",
        expectation: "chunk([1,2], 10) should be [[1,2]]",
      },
      {
        name: "rejects an invalid size",
        run: "expect(fn([1, 2], 0), [])",
        expectation: "chunk([1,2], 0) should be []",
      },
    ],
  },
  {
    id: "js-fix-average-bug",
    title: "Fix the off-by-one bug",
    difficulty: "beginner",
    prompt:
      "`average(numbers)` should return the mean of the array, or 0 for an empty array. It currently returns `NaN`. Find the bug and fix it.",
    entryPoint: "average",
    starterCode: `function average(numbers) {
  let total = 0;
  for (let i = 0; i <= numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}`,
    hint: "Read the loop condition character by character: `<=` runs one iteration too many, and `numbers[numbers.length]` is `undefined`. You also need to guard the empty array before dividing.",
    solution: `function average(numbers) {
  if (numbers.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}`,
    tests: [
      {
        name: "averages three numbers",
        run: "expect(fn([2, 4, 6]), 4)",
        expectation: "average([2,4,6]) should be 4",
      },
      {
        name: "single value",
        run: "expect(fn([10]), 10)",
        expectation: "average([10]) should be 10",
      },
      {
        name: "empty array returns 0",
        run: "expect(fn([]), 0)",
        expectation: "average([]) should be 0",
      },
      {
        name: "does not return NaN",
        run: "expect(Number.isNaN(fn([1, 2, 3])), false)",
        expectation: "average([1,2,3]) must not be NaN",
      },
    ],
  },
  {
    id: "js-fizzbuzz",
    title: "FizzBuzz (test-first)",
    difficulty: "beginner",
    prompt:
      'Write `fizzbuzz(n)` returning an array of strings for the numbers 1 to n: multiples of 3 become "Fizz", multiples of 5 become "Buzz", multiples of both become "FizzBuzz", everything else is the number as a string.',
    entryPoint: "fizzbuzz",
    starterCode: `function fizzbuzz(n) {
  // TODO: build the array from 1 to n
  return [];
}`,
    hint: "Check the both-case first: `if (i % 15 === 0)` before checking 3 or 5, otherwise FizzBuzz never appears.",
    solution: `function fizzbuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`,
    tests: [
      {
        name: "first five values",
        run: 'expect(fn(5), ["1", "2", "Fizz", "4", "Buzz"])',
        expectation: 'fizzbuzz(5) should be ["1","2","Fizz","4","Buzz"]',
      },
      {
        name: "both divisors",
        run: 'expect(fn(15)[14], "FizzBuzz")',
        expectation: 'fizzbuzz(15)[14] should be "FizzBuzz"',
      },
      {
        name: "zero returns nothing",
        run: "expect(fn(0), [])",
        expectation: "fizzbuzz(0) should be []",
      },
    ],
  },
  {
    id: "js-slugify-url",
    title: "Slugify a title",
    difficulty: "intermediate",
    prompt:
      "Write `slugify(title)` that turns a human title into a URL slug: lowercase, runs of non-alphanumeric characters replaced with a single hyphen, and no leading or trailing hyphens.",
    entryPoint: "slugify",
    starterCode: `function slugify(title) {
  // TODO: lowercase, replace, trim
  return title;
}`,
    hint: '`title.toLowerCase().replace(/[^a-z0-9]+/g, "-")` does the heavy lifting; then strip the outer hyphens with a second replace.',
    solution: `function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}`,
    tests: [
      {
        name: "punctuation becomes one hyphen",
        run: 'expect(fn("Hello, World!"), "hello-world")',
        expectation: 'slugify("Hello, World!") should be "hello-world"',
      },
      {
        name: "no leading or trailing hyphens",
        run: 'expect(fn("  Deploy to Vercel  "), "deploy-to-vercel")',
        expectation: 'slugify("  Deploy to Vercel  ") should be "deploy-to-vercel"',
      },
      {
        name: "already a slug",
        run: 'expect(fn("my-slug"), "my-slug")',
        expectation: 'slugify("my-slug") should be "my-slug"',
      },
      {
        name: "numbers are kept",
        run: 'expect(fn("Comp 5241: Group Project"), "comp-5241-group-project")',
        expectation: 'slugify("Comp 5241: Group Project") should be "comp-5241-group-project"',
      },
    ],
  },
  {
    id: "js-parse-json-lines",
    title: "Parse JSON lines from a model",
    difficulty: "intermediate",
    prompt:
      "Models often return one JSON object per line. Write `parseJsonLines(text)` returning an array of parsed objects, skipping any line that is not valid JSON.",
    entryPoint: "parseJsonLines",
    starterCode: `function parseJsonLines(text) {
  // TODO: split on newlines, parse each line, skip the broken ones
  return [];
}`,
    hint: "Wrap `JSON.parse` in a try/catch inside a loop, and `trim()` each line first so blank lines are ignored.",
    solution: `function parseJsonLines(text) {
  const results = [];
  for (const line of text.split("\\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      results.push(JSON.parse(trimmed));
    } catch {
      // skip invalid lines
    }
  }
  return results;
}`,
    tests: [
      {
        name: "parses two valid lines",
        run: 'expect(fn(\'{"a":1}\\n{"b":2}\').length, 2)',
        expectation: "two JSON lines should produce an array of length 2",
      },
      {
        name: "skips invalid lines",
        run: 'expect(fn(\'{"a":1}\\nnot json\\n{"b":2}\').length, 2)',
        expectation: "one broken line should be skipped, leaving 2 objects",
      },
      {
        name: "empty input",
        run: "expect(fn(''), [])",
        expectation: "an empty string should return []",
      },
      {
        name: "keeps the values",
        run: 'expect(fn(\'{"name":"ada"}\')[0].name, "ada")',
        expectation: 'the parsed object should have name === "ada"',
      },
    ],
  },
];

export function getChallenge(id: string): CodeChallenge | undefined {
  return CODE_CHALLENGES.find((challenge) => challenge.id === id);
}
