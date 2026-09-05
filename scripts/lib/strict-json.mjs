// JSON.parse drops duplicate members. Evidence must preserve ambiguity as error.
// Syntax diagnostics never include source payload fragments.
export function parseStrictJson(text) {
  let result
  try { result = JSON.parse(text) } catch { throw new Error('Invalid JSON') }
  const stack = []
  for (const [token] of text.matchAll(/"(?:\\.|[^"\\])*"|[{}\[\],:]/g)) {
    if (token === '{') stack.push({ keys: new Set(), expectKey: true })
    else if (token === '[') stack.push(null)
    else if (token === '}' || token === ']') stack.pop()
    else if (token === ',' && stack.at(-1)) stack.at(-1).expectKey = true
    else if (token.startsWith('"') && stack.at(-1)?.expectKey) {
      const key = JSON.parse(token)
      if (stack.at(-1).keys.has(key)) throw new Error('Duplicate object member in JSON')
      stack.at(-1).keys.add(key)
      stack.at(-1).expectKey = false
    }
  }
  return result
}
