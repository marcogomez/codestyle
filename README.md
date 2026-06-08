# @mgz-dev/codestyle

Codestyle is an opinionated and shared ESLint, Prettier, and TypeScript configuration. One install, consistent code style everywhere.

Supports TypeScript, React (JSX/TSX with hooks rules), Jest, and import ordering out of the box.

## Install

```sh
pnpm add -D @mgz-dev/codestyle eslint prettier
```

## ESLint Config

### Zero-config (recommended)

```js
// eslint.config.mjs
export { default } from "@mgz-dev/codestyle";
```

### With customization

```js
// eslint.config.mjs
import { createConfig } from "@mgz-dev/codestyle";

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  extraIgnores: ["**/generated/**"],
  extraGlobals: {
    MY_GLOBAL: "readonly"
  },
  extraRules: {
    "no-console": "warn"
  }
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tsconfigRootDir` | `string` | `process.cwd()` | Root directory for TypeScript project resolution |
| `extraIgnores` | `string[]` | `[]` | Additional glob patterns to ignore |
| `extraGlobals` | `object` | `{}` | Additional global variables |
| `extraRules` | `object` | `{}` | Additional or overridden ESLint rules |
| `testFiles` | `string[]` | `["**/*.test.ts", ...]` | Glob patterns for test files (Jest rules apply to these) |

## Prettier Config

```js
// prettier.config.mjs
export { default } from "@mgz-dev/codestyle/prettier";
```

Or add to your `package.json`:

```json
{
  "prettier": "@mgz-dev/codestyle/prettier"
}
```

### Settings

| Setting | Value |
|---------|-------|
| Print width | 120 |
| Tab width | 2 |
| Tabs | No (spaces) |
| Semicolons | Yes |
| Quotes | Double |
| Trailing commas | None |
| Arrow parens | Always |
| End of line | Auto |
| Prose wrap | Always |

## TypeScript Config

```json
// tsconfig.json
{
  "extends": "@mgz-dev/codestyle/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

## VS Code Setup

Run `codestyle init` to create or update `.vscode/settings.json` with format-on-save and ESLint integration:

```sh
pnpm codestyle init
```

This sets up:
- Prettier as the default formatter for TypeScript, TSX, JSON, and HTML
- Format on save enabled
- ESLint auto-fix on save
- 2-space tabs, trailing whitespace trimming
- Monorepo-compatible ESLint working directories

If `.vscode/settings.json` already exists, your existing settings are preserved — codestyle only adds what's missing.

Recommended VS Code extension: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)


### Base config

- Target: ES2022
- Module: ESNext
- Module resolution: Bundler
- Strict mode: enabled
- Declaration + declaration maps: enabled
- No unused locals/parameters: enabled
- No implicit returns: enabled
- No fallthrough cases: enabled
- Skip lib check: enabled

## What's included

### ESLint plugins (carried as dependencies, you don't install them)

- `@typescript-eslint/eslint-plugin` + parser
- `eslint-plugin-prettier` — Prettier integration
- `eslint-plugin-import` — Import ordering
- `eslint-plugin-react` — React rules (active on `.tsx`/`.jsx` only)
- `eslint-plugin-react-hooks` — Rules of hooks + exhaustive-deps
- `eslint-plugin-jest` — Jest rules (active on test files only)

### Key rules

- `curly: ["error", "all"]` — Braces required on all control statements
- `@typescript-eslint/no-non-null-assertion: "error"` — No `!` operator
- `@typescript-eslint/no-unused-vars: "error"` — Catches unused variables (ignores `_` prefixed args)
- `react-hooks/exhaustive-deps: "error"` — Catches missing hook dependencies
- `react-hooks/rules-of-hooks: "error"` — Hooks must be called unconditionally
- `import/order` — Enforced import grouping and alphabetical ordering
- `sort-imports` — Enforced member sorting within import statements
- `max-len: 120` — Line length limit matching Prettier's print width

### Peer dependencies (you install these)

- `eslint ^9.0.0`
- `prettier ^3.0.0`

## Releasing

This package uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

### When you make a change

After making your changes, create a changeset to describe what changed:

```sh
pnpm changeset
```

You'll be prompted to:
1. Select the package (just this one)
2. Choose the bump type:
   - **patch** — bug fixes, dependency updates, rule tweaks that don't break existing code
   - **minor** — new rules, new features (like a new editor in `codestyle init`), new config options
   - **major** — rule changes that would cause existing passing code to fail, removed options, breaking config changes
3. Write a summary of the change

This creates a markdown file in `.changeset/`. Commit it with your code.

### How publishing works

When you push to `master` (or merge a PR):

1. The CI **release** workflow detects pending changeset files
2. It opens a "Version Package" PR that bumps the version in `package.json` and updates `CHANGELOG.md`
3. When you merge that PR, the workflow publishes to npm automatically via trusted publishing (OIDC)

No npm tokens to manage or rotate. GitHub Actions authenticates directly with npm.

### First-time setup

The very first publish must be done manually because trusted publishing requires the package to already exist on npm.

1. Create a temporary 90-day granular npm token (Profile > Access Tokens)
2. Publish manually:
   ```sh
   npm publish --access public
   ```
3. Configure trusted publishing on npm: go to `https://www.npmjs.com/package/@mgz-dev/codestyle/access`, click **GitHub Actions**, and fill in:
   - **Organization or user**: `marcogomez` (case-sensitive)
   - **Repository**: `codestyle`
   - **Workflow filename**: `release.yml`
   - **Allowed actions**: select "npm publish"
4. Delete the temporary npm token — you won't need it again

### Manual publishing (if needed)

```sh
pnpm changeset        # create a changeset
pnpm version          # bump version + update CHANGELOG
pnpm release          # publish to npm
```
