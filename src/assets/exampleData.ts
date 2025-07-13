// Example data for initial app state
// Type definitions (copied from DATA_STRUCTURES.md)

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  timerIds: number[];
}

export interface TimerSession {
  id: number;
  taskId: number | null;
  mode: 'pomodoro' | 'countdown' | 'stopwatch';
  phase: 'work' | 'shortBreak' | 'longBreak' | null;
  startTime: Date;
  plannedDuration: number | null;
  completed: boolean;
  endTime?: Date;
  actualDuration?: number;
  reason?: string;
}

export const exampleProjects: Project[] = [
  {
    id: 1,
    name: 'Personal Productivity',
    description: 'Tasks to improve my daily productivity and time management.',
    createdAt: new Date('2024-01-01T09:00:00'),
    updatedAt: new Date('2024-01-01T09:00:00'),
    completed: false
  },
  {
    id: 2,
    name: 'Work Project Alpha',
    description: 'Main work project with multiple deliverables and deadlines.',
    createdAt: new Date('2024-01-02T10:00:00'),
    updatedAt: new Date('2024-01-02T10:00:00'),
    completed: false
  },
  {
    id: 3,
    name: 'Learning & Development',
    description: 'Tasks for learning new skills and self-improvement.',
    createdAt: new Date('2024-01-03T11:00:00'),
    updatedAt: new Date('2024-01-03T11:00:00'),
    completed: false
  },
  {
    id: 4,
    name: 'Home Organization',
    description: 'Tasks to organize and maintain the home environment.',
    createdAt: new Date('2024-01-04T12:00:00'),
    updatedAt: new Date('2024-01-04T12:00:00'),
    completed: false
  },
  {
    id: 5,
    name: 'Health & Fitness',
    description: 'Tasks related to physical health and exercise routines.',
    createdAt: new Date('2024-01-05T13:00:00'),
    updatedAt: new Date('2024-01-05T13:00:00'),
    completed: false
  },
  {
    id: 6,
    name: 'Financial Planning',
    description: 'Tasks for budgeting, saving, and financial management.',
    createdAt: new Date('2024-01-06T14:00:00'),
    updatedAt: new Date('2024-01-06T14:00:00'),
    completed: false
  },
  {
    id: 7,
    name: 'Creative Writing',
    description: 'Writing projects including blog posts, stories, and content creation.',
    createdAt: new Date('2024-01-07T15:00:00'),
    updatedAt: new Date('2024-01-07T15:00:00'),
    completed: false
  },
  {
    id: 8,
    name: 'Side Business',
    description: 'Tasks for developing and managing a side business venture.',
    createdAt: new Date('2024-01-08T16:00:00'),
    updatedAt: new Date('2024-01-08T16:00:00'),
    completed: false
  },
  {
    id: 9,
    name: 'Travel Planning',
    description: 'Tasks for planning upcoming trips and vacations.',
    createdAt: new Date('2024-01-09T17:00:00'),
    updatedAt: new Date('2024-01-09T17:00:00'),
    completed: false
  },
  {
    id: 10,
    name: 'Completed Project',
    description: 'A project that has been completed successfully.',
    createdAt: new Date('2024-01-10T18:00:00'),
    updatedAt: new Date('2024-01-10T18:00:00'),
    completed: true
  }
];

export const exampleTasks: Task[] = [
  // Personal Productivity Tasks
  {
    id: 101,
    projectId: 1,
    title: 'Morning Routine',
    description: 'Complete my morning routine checklist including meditation and planning.',
    completed: false,
    createdAt: new Date('2024-01-01T09:10:00'),
    updatedAt: new Date('2024-01-01T09:10:00'),
    timerIds: [1001, 1002]
  },
  {
    id: 102,
    projectId: 1,
    title: 'Plan Day',
    description: 'Review calendar and plan today\'s tasks and priorities.',
    completed: false,
    createdAt: new Date('2024-01-01T09:20:00'),
    updatedAt: new Date('2024-01-01T09:20:00'),
    timerIds: [1003]
  },
  {
    id: 103,
    projectId: 1,
    title: 'Time Audit',
    description: 'Track how I spend my time for one week to identify inefficiencies.',
    completed: true,
    createdAt: new Date('2024-01-01T09:30:00'),
    updatedAt: new Date('2024-01-01T09:30:00'),
    timerIds: [1004, 1005, 1006]
  },
  {
    id: 104,
    projectId: 1,
    title: 'Declutter Workspace',
    description: 'Organize and declutter my physical and digital workspace.',
    completed: false,
    createdAt: new Date('2024-01-01T09:40:00'),
    updatedAt: new Date('2024-01-01T09:40:00'),
    timerIds: []
  },

  // Work Project Alpha Tasks
  {
    id: 201,
    projectId: 2,
    title: 'Write Status Report',
    description: 'Draft the weekly status report for the Alpha project.',
    completed: false,
    createdAt: new Date('2024-01-02T10:10:00'),
    updatedAt: new Date('2024-01-02T10:10:00'),
    timerIds: [2001, 2002, 2003]
  },
  {
    id: 202,
    projectId: 2,
    title: 'Team Meeting',
    description: 'Attend the Monday team sync and take notes.',
    completed: true,
    createdAt: new Date('2024-01-02T10:20:00'),
    updatedAt: new Date('2024-01-02T10:20:00'),
    timerIds: [2004]
  },
  {
    id: 203,
    projectId: 2,
    title: 'Code Review',
    description: 'Review pull requests and provide feedback to team members.',
    completed: false,
    createdAt: new Date('2024-01-02T10:30:00'),
    updatedAt: new Date('2024-01-02T10:30:00'),
    timerIds: [2005]
  },
  {
    id: 204,
    projectId: 2,
    title: 'Bug Fix',
    description: 'Fix the critical bug in the authentication module.',
    completed: false,
    createdAt: new Date('2024-01-02T10:40:00'),
    updatedAt: new Date('2024-01-02T10:40:00'),
    timerIds: [2006, 2007]
  },
  {
    id: 205,
    projectId: 2,
    title: 'Documentation Update',
    description: 'Update the API documentation with new endpoints.',
    completed: true,
    createdAt: new Date('2024-01-02T10:50:00'),
    updatedAt: new Date('2024-01-02T10:50:00'),
    timerIds: [2008]
  },

  // Learning & Development Tasks
  {
    id: 301,
    projectId: 3,
    title: 'Read Technical Book',
    description: 'Read 20 pages of "Clean Code" by Robert Martin.',
    completed: false,
    createdAt: new Date('2024-01-03T11:10:00'),
    updatedAt: new Date('2024-01-03T11:10:00'),
    timerIds: [3001, 3002]
  },
  {
    id: 302,
    projectId: 3,
    title: 'Online Course',
    description: 'Complete Module 3 of the React Advanced Patterns course.',
    completed: false,
    createdAt: new Date('2024-01-03T11:20:00'),
    updatedAt: new Date('2024-01-03T11:20:00'),
    timerIds: [3003]
  },
  {
    id: 303,
    projectId: 3,
    title: 'Practice Coding',
    description: 'Solve 3 algorithm problems on LeetCode.',
    completed: true,
    createdAt: new Date('2024-01-03T11:30:00'),
    updatedAt: new Date('2024-01-03T11:30:00'),
    timerIds: [3004, 3005]
  },
  {
    id: 304,
    projectId: 3,
    title: 'Watch Tutorial',
    description: 'Watch the TypeScript advanced features tutorial.',
    completed: false,
    createdAt: new Date('2024-01-03T11:40:00'),
    updatedAt: new Date('2024-01-03T11:40:00'),
    timerIds: []
  },

  // Home Organization Tasks
  {
    id: 401,
    projectId: 4,
    title: 'Clean Kitchen',
    description: 'Deep clean the kitchen including appliances and cabinets.',
    completed: false,
    createdAt: new Date('2024-01-04T12:10:00'),
    updatedAt: new Date('2024-01-04T12:10:00'),
    timerIds: [4001]
  },
  {
    id: 402,
    projectId: 4,
    title: 'Organize Closet',
    description: 'Sort and organize clothes by season and type.',
    completed: true,
    createdAt: new Date('2024-01-04T12:20:00'),
    updatedAt: new Date('2024-01-04T12:20:00'),
    timerIds: [4002, 4003]
  },
  {
    id: 403,
    projectId: 4,
    title: 'Declutter Garage',
    description: 'Remove unnecessary items and organize tools and equipment.',
    completed: false,
    createdAt: new Date('2024-01-04T12:30:00'),
    updatedAt: new Date('2024-01-04T12:30:00'),
    timerIds: []
  },

  // Health & Fitness Tasks
  {
    id: 501,
    projectId: 5,
    title: 'Morning Workout',
    description: 'Complete 30-minute cardio and strength training routine.',
    completed: false,
    createdAt: new Date('2024-01-05T13:10:00'),
    updatedAt: new Date('2024-01-05T13:10:00'),
    timerIds: [5001, 5002]
  },
  {
    id: 502,
    projectId: 5,
    title: 'Meal Prep',
    description: 'Prepare healthy meals for the week ahead.',
    completed: false,
    createdAt: new Date('2024-01-05T13:20:00'),
    updatedAt: new Date('2024-01-05T13:20:00'),
    timerIds: [5003]
  },
  {
    id: 503,
    projectId: 5,
    title: 'Yoga Session',
    description: 'Complete a 45-minute yoga session for flexibility.',
    completed: true,
    createdAt: new Date('2024-01-05T13:30:00'),
    updatedAt: new Date('2024-01-05T13:30:00'),
    timerIds: [5004]
  },

  // Financial Planning Tasks
  {
    id: 601,
    projectId: 6,
    title: 'Budget Review',
    description: 'Review monthly expenses and adjust budget categories.',
    completed: false,
    createdAt: new Date('2024-01-06T14:10:00'),
    updatedAt: new Date('2024-01-06T14:10:00'),
    timerIds: [6001]
  },
  {
    id: 602,
    projectId: 6,
    title: 'Investment Research',
    description: 'Research new investment opportunities and update portfolio.',
    completed: false,
    createdAt: new Date('2024-01-06T14:20:00'),
    updatedAt: new Date('2024-01-06T14:20:00'),
    timerIds: [6002, 6003]
  },

  // Creative Writing Tasks
  {
    id: 701,
    projectId: 7,
    title: 'Blog Post Draft',
    description: 'Write a 1000-word blog post about productivity tips.',
    completed: false,
    createdAt: new Date('2024-01-07T15:10:00'),
    updatedAt: new Date('2024-01-07T15:10:00'),
    timerIds: [7001, 7002]
  },
  {
    id: 702,
    projectId: 7,
    title: 'Short Story',
    description: 'Write the first chapter of a short story.',
    completed: true,
    createdAt: new Date('2024-01-07T15:20:00'),
    updatedAt: new Date('2024-01-07T15:20:00'),
    timerIds: [7003]
  },

  // Side Business Tasks
  {
    id: 801,
    projectId: 8,
    title: 'Market Research',
    description: 'Research competitors and identify market opportunities.',
    completed: false,
    createdAt: new Date('2024-01-08T16:10:00'),
    updatedAt: new Date('2024-01-08T16:10:00'),
    timerIds: [8001]
  },
  {
    id: 802,
    projectId: 8,
    title: 'Business Plan',
    description: 'Draft a comprehensive business plan for the side venture.',
    completed: false,
    createdAt: new Date('2024-01-08T16:20:00'),
    updatedAt: new Date('2024-01-08T16:20:00'),
    timerIds: [8002, 8003]
  },

  // Travel Planning Tasks
  {
    id: 901,
    projectId: 9,
    title: 'Book Flights',
    description: 'Research and book flights for the summer vacation.',
    completed: false,
    createdAt: new Date('2024-01-09T17:10:00'),
    updatedAt: new Date('2024-01-09T17:10:00'),
    timerIds: [9001]
  },
  {
    id: 902,
    projectId: 9,
    title: 'Hotel Research',
    description: 'Find and compare hotels in the destination city.',
    completed: false,
    createdAt: new Date('2024-01-09T17:20:00'),
    updatedAt: new Date('2024-01-09T17:20:00'),
    timerIds: [9002]
  },

  // Completed Project Tasks
  {
    id: 1001,
    projectId: 10,
    title: 'Website Redesign',
    description: 'Complete the website redesign project.',
    completed: true,
    createdAt: new Date('2024-01-10T18:10:00'),
    updatedAt: new Date('2024-01-10T18:10:00'),
    timerIds: [10001, 10002, 10003]
  },
  {
    id: 1002,
    projectId: 10,
    title: 'Client Presentation',
    description: 'Prepare and deliver the final presentation to the client.',
    completed: true,
    createdAt: new Date('2024-01-10T18:20:00'),
    updatedAt: new Date('2024-01-10T18:20:00'),
    timerIds: [10004]
  }
];

export const exampleTimerSessions: TimerSession[] = [
  // Personal Productivity Sessions
  {
    id: 1001,
    taskId: 101,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-01T09:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-01T09:16:00'),
    actualDuration: 60
  },
  {
    id: 1002,
    taskId: 101,
    mode: 'pomodoro',
    phase: 'shortBreak',
    startTime: new Date('2024-01-01T09:17:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-01T09:18:00'),
    actualDuration: 60
  },
  {
    id: 1003,
    taskId: 102,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-01T09:25:00'),
    plannedDuration: 900,
    completed: true,
    endTime: new Date('2024-01-01T09:40:00'),
    actualDuration: 900
  },
  {
    id: 1004,
    taskId: 103,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-01T10:00:00'),
    plannedDuration: null,
    completed: true,
    endTime: new Date('2024-01-01T10:30:00'),
    actualDuration: 1800
  },
  {
    id: 1005,
    taskId: 103,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-01T11:00:00'),
    plannedDuration: null,
    completed: true,
    endTime: new Date('2024-01-01T11:45:00'),
    actualDuration: 2700
  },
  {
    id: 1006,
    taskId: 103,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-01T14:00:00'),
    plannedDuration: null,
    completed: false,
    endTime: new Date('2024-01-01T14:15:00'),
    actualDuration: 900,
    reason: 'interrupted'
  },

  // Work Project Sessions
  {
    id: 2001,
    taskId: 201,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-02T10:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-02T10:16:00'),
    actualDuration: 60
  },
  {
    id: 2002,
    taskId: 201,
    mode: 'pomodoro',
    phase: 'shortBreak',
    startTime: new Date('2024-01-02T10:17:00'),
    plannedDuration: 60,
    completed: false,
    endTime: new Date('2024-01-02T10:17:30'),
    actualDuration: 30,
    reason: 'skipped'
  },
  {
    id: 2003,
    taskId: 201,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-02T10:18:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-02T10:19:00'),
    actualDuration: 60
  },
  {
    id: 2004,
    taskId: 202,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-02T10:30:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-02T11:00:00'),
    actualDuration: 1800
  },
  {
    id: 2005,
    taskId: 203,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-02T11:30:00'),
    plannedDuration: 60,
    completed: false,
    endTime: new Date('2024-01-02T11:45:00'),
    actualDuration: 900,
    reason: 'reset'
  },
  {
    id: 2006,
    taskId: 204,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-02T14:00:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-02T14:01:00'),
    actualDuration: 60
  },
  {
    id: 2007,
    taskId: 204,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-02T14:02:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-02T14:03:00'),
    actualDuration: 60
  },
  {
    id: 2008,
    taskId: 205,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-02T15:00:00'),
    plannedDuration: 1200,
    completed: true,
    endTime: new Date('2024-01-02T15:20:00'),
    actualDuration: 1200
  },

  // Learning Sessions
  {
    id: 3001,
    taskId: 301,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-03T11:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-03T11:16:00'),
    actualDuration: 60
  },
  {
    id: 3002,
    taskId: 301,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-03T11:18:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-03T11:19:00'),
    actualDuration: 60
  },
  {
    id: 3003,
    taskId: 302,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-03T12:00:00'),
    plannedDuration: 2400,
    completed: false,
    endTime: new Date('2024-01-03T12:30:00'),
    actualDuration: 1800,
    reason: 'interrupted'
  },
  {
    id: 3004,
    taskId: 303,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-03T13:00:00'),
    plannedDuration: null,
    completed: true,
    endTime: new Date('2024-01-03T13:45:00'),
    actualDuration: 2700
  },
  {
    id: 3005,
    taskId: 303,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-03T14:00:00'),
    plannedDuration: null,
    completed: true,
    endTime: new Date('2024-01-03T14:30:00'),
    actualDuration: 1800
  },

  // Home Organization Sessions
  {
    id: 4001,
    taskId: 401,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-04T12:15:00'),
    plannedDuration: 3600,
    completed: false,
    endTime: new Date('2024-01-04T12:45:00'),
    actualDuration: 1800,
    reason: 'reset'
  },
  {
    id: 4002,
    taskId: 402,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-04T12:30:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-04T12:31:00'),
    actualDuration: 60
  },
  {
    id: 4003,
    taskId: 402,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-04T12:33:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-04T12:34:00'),
    actualDuration: 60
  },

  // Health & Fitness Sessions
  {
    id: 5001,
    taskId: 501,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-05T13:15:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-05T13:45:00'),
    actualDuration: 1800
  },
  {
    id: 5002,
    taskId: 501,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-05T13:47:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-05T14:17:00'),
    actualDuration: 1800
  },
  {
    id: 5003,
    taskId: 502,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-05T15:00:00'),
    plannedDuration: 60,
    completed: false,
    endTime: new Date('2024-01-05T15:30:00'),
    actualDuration: 1800,
    reason: 'mode_changed'
  },
  {
    id: 5004,
    taskId: 503,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-05T16:00:00'),
    plannedDuration: 2700,
    completed: true,
    endTime: new Date('2024-01-05T16:45:00'),
    actualDuration: 2700
  },

  // Financial Planning Sessions
  {
    id: 6001,
    taskId: 601,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-06T14:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-06T14:16:00'),
    actualDuration: 60
  },
  {
    id: 6002,
    taskId: 602,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-06T14:30:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-06T15:00:00'),
    actualDuration: 1800
  },
  {
    id: 6003,
    taskId: 602,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-06T15:30:00'),
    plannedDuration: 1200,
    completed: false,
    endTime: new Date('2024-01-06T15:45:00'),
    actualDuration: 900,
    reason: 'task_switched'
  },

  // Creative Writing Sessions
  {
    id: 7001,
    taskId: 701,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-07T15:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-07T15:16:00'),
    actualDuration: 60
  },
  {
    id: 7002,
    taskId: 701,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-07T15:18:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-07T15:19:00'),
    actualDuration: 60
  },
  {
    id: 7003,
    taskId: 702,
    mode: 'stopwatch',
    phase: null,
    startTime: new Date('2024-01-07T16:00:00'),
    plannedDuration: null,
    completed: true,
    endTime: new Date('2024-01-07T16:45:00'),
    actualDuration: 2700
  },

  // Side Business Sessions
  {
    id: 8001,
    taskId: 801,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-08T16:15:00'),
    plannedDuration: 2400,
    completed: true,
    endTime: new Date('2024-01-08T16:55:00'),
    actualDuration: 2400
  },
  {
    id: 8002,
    taskId: 802,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-08T17:00:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-08T17:01:00'),
    actualDuration: 60
  },
  {
    id: 8003,
    taskId: 802,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-08T17:03:00'),
    plannedDuration: 60,
    completed: false,
    endTime: new Date('2024-01-08T17:20:00'),
    actualDuration: 1020,
    reason: 'interrupted'
  },

  // Travel Planning Sessions
  {
    id: 9001,
    taskId: 901,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-09T17:15:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-09T17:45:00'),
    actualDuration: 1800
  },
  {
    id: 9002,
    taskId: 902,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-09T18:00:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-09T18:01:00'),
    actualDuration: 60
  },

  // Completed Project Sessions
  {
    id: 10001,
    taskId: 1001,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-10T18:15:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-10T18:16:00'),
    actualDuration: 60
  },
  {
    id: 10002,
    taskId: 1001,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-10T18:18:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-10T18:19:00'),
    actualDuration: 60
  },
  {
    id: 10003,
    taskId: 1001,
    mode: 'pomodoro',
    phase: 'work',
    startTime: new Date('2024-01-10T18:21:00'),
    plannedDuration: 60,
    completed: true,
    endTime: new Date('2024-01-10T18:22:00'),
    actualDuration: 60
  },
  {
    id: 10004,
    taskId: 1002,
    mode: 'countdown',
    phase: null,
    startTime: new Date('2024-01-10T19:00:00'),
    plannedDuration: 1800,
    completed: true,
    endTime: new Date('2024-01-10T19:30:00'),
    actualDuration: 1800
  }
]; 