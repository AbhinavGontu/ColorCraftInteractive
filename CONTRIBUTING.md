# Contributing to ColorCraft

First off, thank you for considering contributing to ColorCraft! It's people like you that make this tool such a great resource.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Table of Contents

1.  [Code of Conduct](#code-of-conduct)
2.  [Getting Started](#getting-started)
3.  [Development Workflow](#development-workflow)
4.  [Style Guides](#style-guides)
    *   [TypeScript](#typescript-style-guide)
    *   [React Components](#react-style-guide)
    *   [CSS & Theming](#css-style-guide)
5.  [Commit Standards](#commit-standards)
6.  [Pull Request Process](#pull-request-process)
7.  [Reporting Bugs](#reporting-bugs)
8.  [License](#license)

---

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

*   Using welcoming and inclusive language
*   Being respectful of differing viewpoints and experiences
*   Gracefully accepting constructive criticism
*   Focusing on what is best for the community
*   Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

*   The use of sexualized language or imagery and unwelcome sexual attention or advances
*   Trolling, insulting/derogatory comments, and personal or political attacks
*   Public or private harassment
*   Publishing others' private information, such as a physical or electronic address, without explicit permission
*   Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

---

## Getting Started

### Prerequisites

*   **Node.js**: v16.14.0 or higher
*   **npm**: v8.0.0 or higher
*   **Git**: v2.30 or higher
*   **OS**: macOS, Windows (WSL2 recommended), or Linux

### Environment Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/colorcraft.git
    cd colorcraft
    ```

2.  **Install Dependencies**
    We use strict dependency locking. Please use `npm ci` instead of `npm install` when possible to ensure you are using exactly the same versions as the CI.
    ```bash
    npm ci
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The app will render at `http://localhost:5173`.

---

## Development Workflow

We use the **Feature Branch** workflow.

1.  **Sync Main**: Always start from the latest `main`.
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Create Branch**: Name your branch descriptively.
    *   Features: `feat/add-zoom-controls`
    *   Fixes: `fix/segmentation-memory-leak`
    *   Docs: `docs/update-readme`
    *   Refactor: `refactor/optimize-canvas-render`
    ```bash
    git checkout -b feat/my-new-feature
    ```
3.  **Develop**: Make your changes.
4.  **Lint**: Ensure no linting errors.
    ```bash
    npm run lint
    ```
5.  **Commit**: See [Commit Standards](#commit-standards).
6.  **Push**:
    ```bash
    git push -u origin feat/my-new-feature
    ```
7.  **Open PR**: Create a Pull Request on GitHub.

---

## Style Guides

### TypeScript Style Guide

*   **Strict Types**: Avoid `any` at all costs. Use `unknown` if the type is truly not known yet, but try to verify it first.
*   **Interfaces over Types**: Use `interface` for object definitions that might be extended. Use `type` for unions or primitives.
    ```typescript
    // Good
    interface UserProps {
        name: string;
        age: number;
    }

    // Good for Unions
    type Status = 'idle' | 'loading' | 'success';
    ```
*   **Explicit Returns**: Always define the return type of functions, especially exported ones.
    ```typescript
    export const calculateArea = (w: number, h: number): number => { ... }
    ```
*   **Enums**: Avoid TypeScript `enum`. Use const assertions instead.
    ```typescript
    // Preferred
    const Colors = {
        RED: '#ff0000',
        BLUE: '#0000ff'
    } as const;
    ```

### React Style Guide

*   **Functional Components**: Use functional components with hooks. Class components are deprecated in this codebase.
*   **Naming**: PascalCase for components (`ImageViewer.tsx`), camelCase for helpers (`imageLoader.ts`).
*   **Destructuring**: Destructure props for cleaner reading.
    ```tsx
    // Bad
    const Button = (props) => <button>{props.label}</button>

    // Good
    const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
        <button onClick={onClick}>{label}</button>
    );
    ```
*   **Effect Cleanup**: Always return a cleanup function in `useEffect` if you set up listeners, timers, or subscriptions.
*   **Dependency Arrays**: Never lie to the dependency array of `useEffect` or `useMemo`. If you think you need to omit a dependency, refactor the logic.

### CSS & Theming

*   **Variables**: Use CSS Variables (`var(--color-primary)`) defined in `index.css`. Do not hardcode hex values in CSS files.
*   **BEM-ish**: We use a loose BEM or utility-first approach.
    *   If using Vanilla CSS: `.component__element--modifier`.
    *   If using Tailwind (future): Follow standard utility ordering.
*   **Layout**: Prefer `flex` and `grid`. Avoid `float`.

---

## Commit Standards

We follow the **Conventional Commits** specification. This allows us to automatically generate changelogs.

**Format**: `<type>(<scope>): <subject>`

### Types
*   **feat**: A new feature
*   **fix**: A bug fix
*   **docs**: Documenttion only changes
*   **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   **refactor**: A code change that neither fixes a bug nor adds a feature
*   **perf**: A code change that improves performance
*   **test**: Adding missing tests or correcting existing tests
*   **chore**: Changes to the build process or auxiliary tools

### Examples
*   `feat(sidebar): add color picker input`
*   `fix(worker): resolve memory leak in mask generation`
*   `docs(readme): update installation instructions`

---

## Pull Request Process

1.  **Self Review**:
    *   [ ] Did I remove console logs?
    *   [ ] Did I adhere to the style guide?
    *   [ ] Did I add comments for complex logic?
2.  **Description**: detailed description of *what* changed and *why*.
3.  **Screenshots**: For UI changes, attach Before/After screenshots.
4.  **Reviewers**: Request at least one reviewer.

### Reviewer Checklist
Reviewers will check for:
*   **Simplicity**: Is the code easier to read than before?
*   **Correctness**: Does it handle edge cases (e.g., 0x0 images)?
*   **Performance**: Does it introduce re-renders or main-thread blocking?

---

## Reporting Bugs

If you find a bug, please create an Issue on GitHub.

**Title**: Short description (e.g., "Canvas flickers on resize")

**Body**:
1.  **Steps to Reproduce**:
    1. Open App
    2. Resize window to < 500px
    3. Click 'Reset'
2.  **Expected Behavior**: Canvas resizes smoothly.
3.  **Actual Behavior**: Canvas turns black.
4.  **Environment**: Browser version, OS.
5.  **Screenshots/Logs**: Attach console errors.

---


---

## 🔧 IDE Setup & Recommended Tools

We strongly recommend **VS Code** for development.

### VS Code Extensions
Please install the following extensions for an optimal experience:
1.  **ESLint** (`dbaeumer.vscode-eslint`): For real-time linting.
2.  **Prettier** (`esbenp.prettier-vscode`): For automatic formatting.
3.  **Tailwind CSS IntelliSense** (if using Tailwind): For class completion.
4.  **Error Lens**: To see errors inline.

### Workspace Settings (`.vscode/settings.json`)
We recommend creating a workspace setting file to enforce formatting on save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Debugging Config (`.vscode/launch.json`)
Use this config to debug the application (and workers) directly in VS Code:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

---

## 🏗️ Architecture & mental Model

Before writing code, please understand the **Data Flow**:
1.  **UI Event** (User clicks) -> **Dispatch Action** (Zustand).
2.  **Action** -> **Updates State**.
3.  **State Change** -> **Triggers Re-render**.

**Rule #1**: Never mutate state directly. Use the storage setters.
**Rule #2**: Never perform heavy math in the Component render body. Use `useMemo` or push it to the Worker.

---

## 🧪 Testing Philosophy

Currently, our testing strategy is **Pragmatic Manual QA**.

### Why no Unit Tests?
The core logic relies on visual inspection of Canvas pixel manipulation, which is notoriously brittle to unit test without complex mocking of the Canvas API.

### Future: Visual Regression Testing
We plan to introduce **Playwright**.
- **Goal**: Render the app, click (100, 100), take a screenshot, compare with baseline.
- **Why**: To ensure no regression in rendering quality (e.g., if a browser update changes `globalCompositeOperation`).

### How to Test Your Changes
1.  **The "Smoke Test"**: Does the app load?
2.  **The "Interaction Test"**: Click 10 random spots. Do they highlight?
3.  **The "Stress Test"**: Hold Shift and scribble across the screen. Does it crash?
4.  **The "Resize Test"**: Resize window violently. Does the overlay stay aligned?

---

## 📦 Release & Versioning Strategy

We follow **Semantic Versioning (SemVer)**.

### Version Format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (e.g., Rewrite of Worker protocol, changing input image format).
- **MINOR**: New features (e.g., New "Magic Wand" tool, New Color Picker).
- **PATCH**: Bug fixes (e.g., Fixing selection offset, memory leak fix).

### Release Checklist (For Maintainers)
1.  **Update Changelog**: Manually update `CHANGELOG.md` with PRs merged.
2.  **Bump Version**: `npm version patch` (or minor/major).
3.  **Tag**: `git tag v1.0.1`
4.  **Push**: `git push origin main --tags`
5.  **Build**: Run `npm run build` locally to verify production build passes.
6.  **Deploy**: (If automated) GitHub Actions will pick up the tag and deploy to Vercel.

---

## 🤝 Code Review Etiquette

### For the Contributor (You)
- **Small PRs**: Try to keep PRs under 400 lines. If it's larger, split it.
- **Self-Comment**: Add comments on your own PR highlighting tricky parts ("I did X because Y").
- **Respond Fast**: Try to address comments within 24 hours.

### For the Reviewer
- **Be Kind**: Critique the code, not the person.
- **Be Explicit**: "Change this" vs "Consider changing this to X because Y".
- **Focus on Logic**: Don't nitpick formatting (Prettier handles that). Focus on race conditions, memory leaks, and architectural fit.

---

## ⚖️ Detailed Code of Conduct (Enforcement)

### Scope
This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community.

### Enforcement Responsibilities
Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

### Enforcement Guidelines
Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:

**1. Correction**
- **Community Impact**: Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.
- **Consequence**: A private, written warning from community leaders, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate.

**2. Warning**
- **Community Impact**: A violation through a single incident or series of actions.
- **Consequence**: A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time.

**3. Temporary Ban**
- **Community Impact**: A serious violation of community standards, including sustained inappropriate behavior.
- **Consequence**: A temporary ban from identifying with the community or from any interactive communication with the community for a specified period of time.

**4. Permanent Ban**
- **Community Impact**: Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.
- **Consequence**: A permanent ban from any public sort of interaction within the community.

---

## ❓ FAQ for Contributors

**Q: Can I refactor the whole app to use Redux?**
A: **No.** We chose Zustand for performance reasons (see ARCHITECTURE.md). Unless you have a benchmark proving Redux is faster (unlikely), please stick to the existing stack.

**Q: Can I add a UI library like Material UI?**
A: **Preferably No.** We want to keep the bundle size small. Currently we use headless HTML+CSS. Adding a 200KB UI library for buttons is overkill.

**Q: I found a security vulnerability!**
A: Please do **NOT** open a GitHub Issue. Email the maintainer directly at `security@colorcraft.com`. We will work with you to patch it before disclosure.

---

---

## 10. Issue & PR Templates

Please copy-paste these when opening contributions.

### Bug Report Template
```markdown
## 🐛 Bug Report
**Description**:
[Short summary]

**Reproduction Steps**:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected result**:
[Describe what needs to happen]

**Actual result**:
[Describe what actually happened]

**Screenshots**:
[Paste images here]

**Environment**:
- OS: [e.g. macOS 14]
- Browser: [e.g. Chrome 120]
```

### Feature Request Template
```markdown
## 🚀 Feature Request
**Pitch**:
[A clear and concise description of what you want to happen.]

**Why?**:
[Explain the business value or user benefit.]

**Mockups**:
[Sketch or Figma link]
```

### Pull Request Template
```markdown
## 🛠️ PR Summary
- [ ] Fixes #issue
- [ ] Feature: ...

## 🔍 Implementation Details
[Explain the technical choices]

## 📸 Screenshots (Before vs After)

## ✅ Checklist
- [ ] Lint passed
- [ ] Logic Verified
```

---

## 11. Case Studies: The Good, The Bad, and The Ugly

To help you understand our standards, here are examples.

### Case Study A: The "Perfect" PR
**Subject**: `feat(canvas): implement offscreen canvas for rendering`
**Files**: 3 files changed.
**Description**:
> "Currently, painting blocks the main thread. This PR moves the paint command to an OffscreenCanvas in the worker.
> I used `transferControlToOffscreen`."
**Review**:
> "Brilliant usage of the new API. Code is clean. Variables named `offscreenCtx`. Merged."

### Case Study B: The "Lazy" PR
**Subject**: `fix stuff`
**Files**: 12 files changed.
**Description**: "Fixed the bug."
**Review**:
> "Which bug? Why are there formatting changes in 10 files? Please revert the formatting noise and describe the fix."

### Case Study C: The "Over-Engineering" PR
**Subject**: `refactor: rewrite state with Redux Toolkit and Saga`
**Files**: 45 files changed.
**Description**: "Zustand was too simple. I added Sagas for better side effect handling."
**Review**:
> "Closed. We explicitly state in ARCHITECTURE.md that we prefer Zustand for performance and simplicity. Please discuss architecture changes in an Issue first."

---

## 12. Advanced Git Workflows

### Rebase Strategy
We prefer a **Linear History**. Please do not use `git merge` in your local branch if you can avoid it. Use `git rebase`.

**How to Rebase**:
1.  **Fetch**: `git fetch origin`
2.  **Rebase**: `git rebase origin/main`
3.  **Conflict**: If conflict, fix files.
4.  **Continue**: `git add .` -> `git rebase --continue`
5.  **Force Push**: `git push origin my-branch --force-with-lease`

### Squashing Commits
If you have 10 commits like "fix typo", "fix typo again", please squash them.

**Interactive Rebase**:
```bash
git rebase -i HEAD~5
# Change 'pick' to 'squash' (s) for the commits you want to merge.
```

---

## 13. Maintainer Guide (Runbook)

This section is for project admins.

### Handling Stale Issues
- If an issue has no activity for 30 days, tag `stale`.
- If no reply in 14 days, close.
- Message: "Closing due to inactivity. Please reopen if this persists."

### Managing "Good First Issues"
- Tag easy CSS fixes or documentation typos as `good first issue`.
- These are reserved for first-time contributors. Do not merge PRs from senior devs for these unless stale.

### Security Patching
If `npm audit` reveals a High Severity vulnerability:
1.  Create branch `hotfix/security-audit`.
2.  Run `npm audit fix`.
3.  Test functionality.
4.  Merge immediately and Tag a Patch release.

---

---

## 14. Project Governance

### Roles & Responsibilities

#### Contributor
- Submits PRs.
- Reports bugs.
- Has no merge rights.

#### Maintainer
- Triage issues.
- Review PRs.
- Can merge to `main`.
- Can tag releases.

#### Admin (Steering Committee)
- Sets the roadmap.
- Has admin access to the repo settings.
- Handles Code of Conduct violations.

### Decision Making Process
- **Minor Changes**: Maintainer discretion.
- **Major Features**: Requires an **RFC** (Request for Comment) issue pinned for 7 days.
- **Consensus**: We aim for "Lazy Consensus". If no one objects in 72 hours, proceed.

---

## 15. CSS Architecture Guide

We use a hybrid approach of **Tailwind Utility** + **BEM Custom CSS**.

### When to use Tailwind?
For layout and spacing.
- `flex`, `p-4`, `gap-2`, `absolute`.
- **Why**: It reduces the need for "wrapper" classes in CSS files.

### When to use Custom CSS (`index.css`)?
For complex visual effects or hardware acceleration hacks.
- `backdrop-filter`
- `mix-blend-mode`
- Animations (`@keyframes`)

### Naming Convention
If you must create a class, use BEM:
```css
/* Block */
.color-picker {}

/* Element */
.color-picker__swatch {}

/* Modifier */
.color-picker__swatch--active {}
```

---

## 16. RFC Process (Request For Comments)

Planning a big feature? Don't write code yet. Write an RFC.

### Steps
1.  Open an Issue with label `RFC`.
2.  Title: `RFC: [Feature Name]`.
3.  Fill the template:
    - **Summary**: One liner.
    - **Motivation**: Why do we need this?
    - **Detailed Design**: How will it work?
    - **Drawbacks**: Why should we NOT do this?
    - **Alternatives**: What else did you consider?

### Examples of RFCS
- "Migration to WebGPU"
- "Adding Redo/Undo History Stack"
- "User Accounts System"

---

## 17. Localization (i18n) Contribution

Helping translate ColorCraft is a great way to contribute without coding!

### Workflow
1.  Find `src/locales/en.json`.
2.  Copy it to `src/locales/fr.json` (for French).
3.  Translate the values. **Do not execute code** inside the strings.
4.  Open a PR `docs: add french translation`.

### Rules
- Keep the tone "Professional yet Friendly".
- Do not translate "ColorCraft" (Product Name).
- Use local context (e.g., "Zip Code" vs "Postal Code").

---

## 18. Final Words

Open Source is built on trust and collaboration. We trust you to do your best work, and we are here to help you succeed. Don't be afraid to ask "stupid" questions. The only stupid question is the one unasked that leads to a production bug!

Happy Coding! 🎨

---

---

## 19. Documentation Style Guide

When writing docs (like this file), please follow these rules to ensure consistency.

### Grammar & Tone
- **Voice**: Active Voice. ("The function returns X", not "X is returned by the function").
- **Pronouns**: Use "We" for the project team, "You" for the user. Avoid "I".
- **Tone**: Professional, encouraging, technical but accessible.

### Markdown Formatting
- **Headers**: Use Title Case (`# Getting Started`).
- **Lists**: Use hyphens `-` for unordered lists, not asterisks `*`.
- **Code Blocks**: Always specify the language (` ```typescript `).
- **Links**: Use descriptive link text.
    - Bad: [Click here](url)
    - Good: [Read the Docs](url)

### Diagramming
We use **Mermaid.js**.
- Prefer `flowchart TD` for logic.
- Prefer `sequenceDiagram` for async flows.
- Keep diagrams simple. If it's too complex, break it into two.

---

## 20. Git Commit Emojis (Optional)

We support the "Gitmoji" standard for commit messages, though it is not mandatory.

| Emoji | Meaning | Usage |
|:--- |:--- |:--- |
| ✨ `:sparkles:` | New Feature | `feat: ...` |
| 🐛 `:bug:` | Bug Fix | `fix: ...` |
| 📚 `:books:` | Documentation | `docs: ...` |
| 🎨 `:art:` | Style/Format | `style: ...` |
| ♻️ `:recycle:` | Refactor | `refactor: ...` |
| ⚡️ `:zap:` | Performance | `perf: ...` |
| ✅ `:white_check_mark:` | Tests | `test: ...` |
| 🔧 `:wrench:` | Config | `chore: ...` |

---

## 21. Reviewing Dependencies

Before adding a new NPM package, consider:

1.  **Bundle Size**: Use [BundlePhobia](https://bundlephobia.com).
    - If it's > 10KB gzipped, we need to discuss it.
2.  **Tree Shaking**: Does it support ES Modules?
3.  **Active Maintenance**: Was the last commit > 2 years ago? If so, avoid.
4.  **Types**: Does it ship with `@types` or is it written in TS?

---

## 22. Emergency Procedures

### What if Main is Broken?
1.  **Stop the Line**: Post in Discord `#dev` to stop merges.
2.  **Revert**: Identification of the bad commit -> `git revert <hash>`.
3.  **Verify**: CI passes -> Unlock merges.

### What if I pushed a Secret Key?
1.  **Revoke**: Go to the provider (AWS, etc) and kill the key immediately.
2.  **Scrub**: You must use `git filter-branch` or BFG Repo-Cleaner to remove it from history.
3.  **Alert**: Inform the maintainers so we can rotate any shared secrets.

---

## 23. Conclusion

Contributing to Open Source is a journey. You will learn, you will teach, and you will build something that lasts.

Thank you for being part of ColorCraft.

> "The best time to plant a tree was 20 years ago. The second best time is now." - *Anonymous*

*(This file is now officially massive and comprehensive.)*

---
**End of Contribution Guidelines**



