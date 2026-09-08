/** Reject duplicate decoded keys rather than silently accepting the last value. */
export function parseClosedJson(text: string): unknown {
  const value: unknown = JSON.parse(text);
  const stack: (Set<string> | null)[] = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === "{" || char === "[") {
      if (stack.length >= 32) throw new SyntaxError("JSON nesting exceeds supported depth.");
      stack.push(char === "{" ? new Set() : null);
    } else if (char === "}" || char === "]") {
      stack.pop();
    } else if (char === '"') {
      const start = index;
      while (++index < text.length) {
        if (text[index] === "\\") index++;
        else if (text[index] === '"') break;
      }
      let next = index + 1;
      while (/\s/.test(text[next] ?? "") && next < text.length) next++;
      const keys = stack.at(-1);
      if (text[next] === ":" && keys) {
        const key: string = JSON.parse(text.slice(start, index + 1));
        if (keys.has(key)) throw new SyntaxError("Duplicate JSON object key.");
        keys.add(key);
      }
    }
  }
  return value;
}
