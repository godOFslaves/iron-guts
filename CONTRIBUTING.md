# Contributing to IRON GUTS

First off, thank you for considering contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iron-guts.git
   cd iron-guts
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the project:
   ```bash
   npm run dev
   ```

## Checking Your Changes

Before submitting a PR, make sure everything passes:

```bash
npm run lint
npm run test
npm run build
```

All three commands must complete without errors.

## Code Style

- TypeScript with strict mode enabled
- ESLint with `@typescript-eslint/recommended`
- Consistent formatting (Prettier conventions)
- Meaningful variable and function names
- No unused imports, variables, or parameters
- JSDoc comments for public APIs

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add wall sliding for corner collisions
fix(physics): resolve Z-axis penetration in narrow corridors
chore: update dependencies
docs: add Russian README
test(Physics): add corner collision test case
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## Submitting Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Make your changes and commit with a clear message.
3. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```
4. Open a Pull Request against `godOFslaves/iron-guts:main`.

## Reporting Issues

Use the [Issues](https://github.com/godOFslaves/iron-guts/issues) page. For bugs, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS version
- Any relevant console errors

## Pull Requests

- Fill in the PR template with a clear description
- Link any related issues
- Ensure CI checks pass
- Keep PRs focused on a single concern

Thank you for helping make IRON GUTS better!
