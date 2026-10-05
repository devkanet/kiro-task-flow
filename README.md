# TaskFlow

TaskFlow is a responsive task management web application built with React and TypeScript using Kiro as the primary development tool.

The project was created for the Kiro University Challenge and demonstrates all seven core Kiro lessons in one functional application: Spec-driven development, Steering, Hooks, Property-based testing, Powers, MCP, and Custom agents.

## Features

- Create tasks
- Edit existing tasks
- Mark tasks as completed
- Delete tasks with confirmation
- Filter tasks by status
- Persist tasks using localStorage
- Validate user input
- Responsive and accessible UI

## Tech Stack

- React
- TypeScript
- Vite
- CSS Modules
- Vitest
- React Testing Library
- fast-check
- Kiro

## Kiro University Lessons

### Lesson 1 — Spec-driven Development

TaskFlow was designed and implemented using Kiro Feature Specs.

The project specification is stored in:

- `.kiro/specs/taskflow-todo-app/requirements.md`
- `.kiro/specs/taskflow-todo-app/design.md`
- `.kiro/specs/taskflow-todo-app/tasks.md`

The requirements document defines structured requirements and acceptance criteria, while the design document describes the architecture, components, data flow, correctness properties, and testing strategy.

### Lesson 2 — Steering

Project-specific guidance is defined in:

`.kiro/steering/taskflow-project.md`

The steering document gives Kiro persistent context about the project's architecture, technology choices, coding conventions, accessibility requirements, and testing approach.

### Lesson 3 — Hooks

TaskFlow uses a Kiro hook defined in:

`.kiro/hooks/eslint-on-save.json`

The `PostFileSave` hook runs:

`npm run lint -- --fix`

for matching TypeScript files (`.ts` / `.tsx`), automatically enforcing code quality during development.

### Lesson 4 — Property-based Testing

TaskFlow uses `fast-check` to test general correctness properties derived from the Feature Spec.

Property-based tests generate many different inputs instead of relying only on manually selected examples.

Examples can be found in the test suite, including:

- `src/utils/taskUtils.test.ts`
- `src/utils/storage.test.ts`

These tests cover properties such as task filtering correctness and localStorage persistence behavior.

### Lesson 5 — Powers

Kiro's `web-design-guidelines` Power was used to review TaskFlow's user interface.

The Power identified potential UI and accessibility improvements. Its recommendations
were reviewed against the TaskFlow Requirements, Design, and Steering guidance, and
applicable suggestions were selectively adopted.

For example, the TaskForm styles were updated with clearer `:focus-visible` states for
keyboard users and hover feedback for action buttons.

The related UI implementation can be found under:

`src/components/TaskForm/`

### Lesson 6 — Model Context Protocol (MCP)

TaskFlow configures the `fetch` MCP server in:

`.kiro/settings/mcp.json`

The MCP configuration runs `mcp-server-fetch` via `uvx`, extending Kiro with an external tool for retrieving web content.

The Fetch MCP server was also used during development to consult MDN
documentation for the native `<dialog>` element and validate TaskFlow's
confirmation dialog implementation, including modal behavior, cancellation,
and focus/accessibility considerations.

### Lesson 7 — Custom Agents

TaskFlow includes a purpose-built custom agent:

`.kiro/agents/spec-conformance-reviewer.md`

The agent reviews the implementation and tests against the TaskFlow Feature Spec and Steering documents.

It is intentionally configured as a read-only reviewer, with file writes,
shell commands, web access, and MCP access explicitly denied.

Its purpose is to provide a reusable workflow for checking whether the implementation remains consistent with the project's requirements and design.

The agent was validated by intentionally changing a property-based test tag
from `Property 6` to `Property X`. It correctly detected the mismatch against
the Spec's testing strategy. A separate permission test confirmed that the
read-only agent could not modify the file even when explicitly asked to fix it.

## Project Structure

```text
.kiro/
├── agents/
│   └── spec-conformance-reviewer.md
├── hooks/
│   └── eslint-on-save.json
├── settings/
│   └── mcp.json
├── specs/
│   └── taskflow-todo-app/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── steering/
    └── taskflow-project.md

src/
├── components/
├── hooks/
├── utils/
├── App.tsx
└── ...
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone https://github.com/devkanet/kiro-task-flow.git
cd kiro-task-flow
npm install
```

### Start the Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Run Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Kiro Configuration

The `.kiro` directory is intentionally included in this repository so that the Kiro University lesson implementations can be reviewed alongside the application source code.

It contains the project's Feature Spec, Steering document, Hook configuration, MCP configuration, and Custom Agent.

## Demo

Demo video: https://youtu.be/IapbbIspD7w

## Kiro University Challenge

This project was created as an individual submission for the Kiro University Challenge.

It demonstrates the seven core lessons through a single working application rather than separate lesson-specific projects.

## Bonus

Bonus challenge implementations, if completed, will be documented here.

<!--
### Bonus 1 — Kiro Web / Cloud

Add cloud-session evidence and explanation here.

### Bonus 2 — Package a Kiro Power

Add the public Power repository and explanation here.
-->
