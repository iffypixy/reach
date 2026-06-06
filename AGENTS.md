In all work, be extremely thorough and ensure 100% correctness. Always verify yourself. Be specific and concise.

## Coding style

- Only comment when context cannot be inferred from surrounding code.
- Use single-line control flow when the body is one expression: `if (done) return;` not `if (done) { return; }`.
- Inline intermediate values: no throwaway variables. Bad: `const items = getItems(); process(items);` Good: `process(getItems())`.
- Early returns over nesting. Bad: `if (x) { if (y) { do() } }` Good: `if (!x) return; if (!y) return; do();`
- No `else` after `return`. Bad: `if (x) return a; else return b;` Good: `if (x) return a; return b;`
- No redundant booleans. Bad: `if (x === true)` when `x` is already boolean → `if (x)`. Bad: `return x ? true : false` → `return !!x`.
- Ternary for simple conditional assignment. Bad: `let v; if (x) v = a; else v = b;` Good: `const v = x ? a : b;`
- Destructure over repetitive property access. Bad: `user.name, user.age, user.id` Good: `const { name, age, id } = user;`
- Use `.map()` / `.filter()` for data transformations. Use `for` loops for side effects. Never `.forEach()`.
- Use `res` for accumulator/return variables: the function name already describes the result, so a descriptive variable name is redundant.
- Error messages: lowercase, no trailing period. Bad: `"Failed to load config."` Good: `"failed to load config"`
- Use `assert()` to enforce invariants. Fail fast at the violation, not downstream with a mystery error.
- Exhaustive case handling: use the `never` type to ensure all cases are covered in switches, if/else chains, and mappings. Unhandled cases should be compile-time errors, not silent fallthrough.
- `unknown` over `any` in TypeScript: force type narrowing before use.
- Prefer `Record` lookups over `switch` for simple mappings. Bad: `switch (status) { case 'active': return 'Online'; ... }` Good: `const labels: Record<Status, string> = { active: 'Online', ... }; return labels[status];`
- Colocate by default: don't extract into separate files until there's a concrete reason (reuse, complexity). Don't pre-split.
