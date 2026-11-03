// Authored reference solutions, formatted for reading.
export const challengeSolutions = {
  "sum-even": "function sumEven(numbers) {\n    return numbers.reduce((sum, n) => sum + (n % 2 === 0 ? n : 0), 0);\n}",
  "reverse-words": "function reverseWords(text) {\n    return text.trim().split(/\\s+/).filter(Boolean).reverse().join(\" \");\n}",
  "chunk": "function chunk(items, size) {\n    if (!Number.isInteger(size) || size < 1)\n        return [];\n    const out = [];\n    for (let i = 0; i < items.length; i += size)\n        out.push(items.slice(i, i + size));\n    return out;\n}",
  "average": "function average(numbers) {\n    if (!numbers.length)\n        return 0;\n    return numbers.reduce((a, b) => a + b, 0) / numbers.length;\n}",
  "fizzbuzz": "function fizzbuzz(n) {\n    return Array.from({ length: n }, (_, j) => {\n        const i = j + 1;\n        return i % 15 === 0 ? \"FizzBuzz\" : i % 3 === 0 ? \"Fizz\" : i % 5 === 0 ? \"Buzz\" : String(i);\n    });\n}",
  "slugify": "function slugify(title) {\n    return title.toLowerCase().replace(/[^a-z0-9]+/g, \"-\").replace(/^-+|-+$/g, \"\");\n}",
  "json-lines": "function parseJsonLines(text) {\n    const out = [];\n    for (const line of text.split(\"\\n\")) {\n        if (!line.trim())\n            continue;\n        try {\n            out.push(JSON.parse(line));\n        }\n        catch {\n        }\n    }\n    return out;\n}",
  "unique": "function uniqueById(items) {\n    const seen = new Set();\n    return items.filter(x => !seen.has(x.id) && seen.add(x.id));\n}",
  "price": "function totalPrice(cart) {\n    return Math.round((cart.reduce((n, x) => n + x.price * x.quantity, 0) + Number.EPSILON) * 100) / 100;\n}",
  "access": "function canAccess(user, record) {\n    return user.active === true && (user.role === 'admin' || user.id === record.ownerId);\n}",
  "form": "function validateForm(data) {\n    const errors = [];\n    if (!String(data.name || '').trim())\n        errors.push('name');\n    if (!String(data.email || '').includes('@'))\n        errors.push('email');\n    return errors;\n}",
  "group": "function groupByStatus(tasks) {\n    const groups = Object.create(null);\n    for (const t of tasks)\n        (groups[t.status] ??= []).push(t.id);\n    return groups;\n}",
  "retry": "function retryDelay(attempt) {\n    return Math.min(30000, 1000 * 2 ** attempt);\n}",
  "summary": "function summarizeResults(results) {\n    return results.reduce((s, x) => {\n        s[x.passed === true ? \"passed\" : \"failed\"]++;\n        return s;\n    }, { passed: 0, failed: 0 });\n}"
};
