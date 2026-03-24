# Multi-View Project Tracker (Frontend Assessment)

A React + TypeScript implementation of a project tracker with synchronized Kanban, List, and Timeline views on one shared in-memory dataset.

## Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Stack and State Decision

- **Framework**: React + TypeScript
- **Styling**: CSS Modules (`src/styles.module.css`)
- **State management**: **Zustand**

I chose Zustand over Context + reducer because this UI has several independent concerns (task data, filters, sorting, active view, collaboration presence simulation, URL sync). Zustand keeps these updates concise, avoids nested provider wiring, and supports selective subscription so each view re-renders only for the state it consumes.

## Features Implemented

- Three instant-switch views using shared state:
  - Kanban board with four columns, per-column counts, independent overflow scrolling, avatar initials, priority badges, due/overdue labeling, and empty-column states.
  - List view with sortable headers (title, priority, due date), single active sort toggle, inline status updates in each row.
  - Timeline/Gantt-like view with current month axis, bars from start→due, priority colors, due-only marker behavior, and a vertical “today” line.
- Custom pointer-event drag-and-drop in Kanban (no drag libraries): drag ghost, placeholder styling, drop-zone highlighting, cross-column status updates, touch + mouse compatibility.
- Custom virtual scrolling in List (no virtual libraries): fixed row-height viewport with top/bottom spacers and +5 row buffer, tested against seeded 520 tasks.
- Simulated live collaboration indicators: 3 moving users, task-level presence badges, and top presence bar.
- Filters with immediate apply and URL query synchronization (status, priority, assignee, due range), plus back/forward restoration and conditional clear button.

## Virtual Scrolling Approach

The list view uses fixed-height rows (`58px`) and a scroll container with known viewport height. On scroll:

1. Compute `startIndex = floor(scrollTop / rowHeight) - buffer`.
2. Render only `visibleRows + buffer*2` tasks.
3. Insert a top spacer (`startIndex * rowHeight`) and bottom spacer (`remainingRows * rowHeight`) so total scroll height remains accurate.

This keeps DOM size small while preserving natural scrollbar behavior and smooth scrolling for 500+ tasks.

## Drag-and-Drop Approach

Drag-and-drop is built with native pointer events:

- On `pointerdown`, capture pointer and track pointer-to-card offset.
- Render a fixed-position drag ghost that follows pointer (`pointermove`).
- Detect active drop zone with `elementFromPoint(...).closest('[data-column]')` and highlight it.
- Keep the original card in-place with reduced opacity as a placeholder to avoid major layout jump.
- On `pointerup`, if a valid column is hovered, update status in store; otherwise reset drag state (snap-back behavior from origin).

No external DnD package is used.

## Lighthouse

> Note: attach a desktop Lighthouse screenshot after running an audited production deployment.

Example placeholder:

`docs/lighthouse-desktop.png`

## Explanation (Assessment Field, ~190 words)

The hardest UI problem was making custom drag-and-drop feel predictable while preserving column layout and scroll behavior. The main issue is that removing a dragged card from layout causes immediate reflow, which shifts nearby cards and makes targeting drop zones frustrating. I solved this by keeping the source card rendered in place and styling it as a placeholder (same box metrics, reduced opacity) while separately rendering a fixed-position ghost that follows pointer coordinates. This avoids layout shift and keeps the board stable during drag.

I used pointer events so the same interaction logic works for both mouse and touch, and used `setPointerCapture` to maintain event continuity even if the pointer moves quickly. Drop-zone feedback is derived from `elementFromPoint` and a `data-column` contract, which makes hover indication independent of card nesting.

If I had more time, I’d refactor drag state into a dedicated hook with a small physics layer for smoother snap-back animation when dropped outside valid zones, and add keyboard-accessible drag interactions (grab/move/drop semantics) to improve accessibility compliance.
