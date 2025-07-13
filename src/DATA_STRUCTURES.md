# Data Structures Used in the Productivity App

## Project
Represents a project grouping multiple tasks.
```typescript

interface Project {
  id: number;        // Unique identifier for the project
  name: string;      // Project name
  description: string;  // Project description/details
  createdAt: Date;      // Date the project was created
  updatedAt: Date;   // Date the project was last updated
  completed: boolean;  // Whether the project is marked as completed
}
```
---
## Task
Represents a single task belonging to a project. Can be linked to timer sessions.

```typescript
interface Task {
  id: number;     // Unique identifier for the task
  projectId: number;  // The project this task belongs to
  title: string;      // Task title
  description: string;  // Task description/details
  completed: boolean;  // Whether the task is completed
  createdAt: Date;    // Date the task was created
  updatedAt: Date;   // Date the task was last updated
  timerIds: number[]; // List of TimerSession IDs associated with this task
}
```
---
## TimerSession
Represents a single timer session (Pomodoro, Countdown, or Stopwatch), optionally linked to a task.
```typescript
interface TimerSession {
  id: number;  // Unique identifier for the session
  taskId: number | null;  // Linked task ID (if any)
  mode: 'pomodoro' | 'countdown' | 'stopwatch'; // Timer mode
  phase: 'work' | 'shortBreak' | 'longBreak' | null; // Pomodoro phase (if applicable)
  startTime: Date;       // When the session started
  plannedDuration: number | null;    // Planned duration in seconds (null for stopwatch)
  completed: boolean; // Whether the session was completed
  endTime?: Date; // When the session ended (if completed)
  actualDuration?: number; // Actual duration in seconds
  reason?: string; // Reason for session ending (e.g., 'skipped', 'reset', etc.)
}
```
## TimerSettings
User-configurable settings for the timer system.
```typescript
interface TimerSettings {
  workDuration: number; // Pomodoro work duration (minutes)
  shortBreakDuration: number; // Pomodoro short break duration (minutes)
  longBreakDuration: number;   // Pomodoro long break duration (minutes)
  longBreakInterval: number;   // Number of work sessions before a long break
  autoStartWork: boolean;      // Auto-start work sessions after breaks
  autoStartBreaks: boolean;    // Auto-start breaks after work sessions
}
```
## Other Types

- **Sidebar State**: `activeSidebarItem: 'main' | 'statistics'` — Which sidebar section is active.
- **Timer Mode**: `'pomodoro' | 'countdown' | 'stopwatch'`
- **Pomodoro Phase**: `'work' | 'shortBreak' | 'longBreak'`