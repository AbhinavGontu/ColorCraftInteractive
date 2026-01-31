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

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
