import React, { useState, useEffect, useRef } from 'react';

import './App.css'
import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks';
import Projects from './components/Projects/Projects';
import { exampleProjects, exampleTasks, exampleTimerSessions } from './assets/exampleData';

// Type definitions
interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

interface Task {
  id: number;
  projectId: number; // Link to one project
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  timerIds: number[];
}



// Timer types
interface TimerSession {
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

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartWork: boolean;
  autoStartBreaks: boolean;
}

const App: React.FC = () => {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Sidebar navigation state
  const [activeSidebarItem, setActiveSidebarItem] = useState<'main' | 'statistics'>('main');
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  

  
  // Timer state (moved from Timer component)
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [currentTime, setCurrentTime] = useState<number>(0); // For stopwatch mode
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [customCountdown, setCustomCountdown] = useState<number>(10 * 60); // 10 minutes default
  const [showTimerSettings, setShowTimerSettings] = useState<boolean>(false);
  const [timerHistory, setTimerHistory] = useState<TimerSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  
  // Timer settings
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 1,
    longBreakInterval: 4,
    autoStartWork: false,
    autoStartBreaks: false
  });

  // Timer refs
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const prevTaskIdRef = useRef<number | null>(null);

  // Timer helper functions
  const getPomodoroPhaseTime = (phase: 'work' | 'shortBreak' | 'longBreak'): number => {
    switch (phase) {
      case 'work': return timerSettings.workDuration;
      case 'shortBreak': return timerSettings.shortBreakDuration;
      case 'longBreak': return timerSettings.longBreakDuration;
      default: return timerSettings.workDuration;
    }
  };

  const addUniqueSessionToHistory = (session: TimerSession) => {
    setTimerHistory(prev => {
      const existingIndex = prev.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        return prev.map((s, idx) => 
          idx === existingIndex ? session : s
        );
      } else {
        if (session.completed) {
          handleTimerSessionComplete(session.id, session.taskId);
        }
        return [...prev, session];
      }
    });
  };

  // Timer task switch handler
  const handleTaskSwitch = () => {
    if (isTimerRunning && currentSession) {
      const actualDuration = timerMode === 'stopwatch' 
        ? currentTime 
        : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: actualDuration,
        reason: 'task_switched'
      };
      
      addUniqueSessionToHistory(completedSession);
  
      if (timerMode !== 'stopwatch') {
        const newSession: TimerSession = {
          id: Date.now(),
          taskId: selectedTaskId,
          mode: timerMode,
          phase: timerMode === 'pomodoro' ? pomodoroPhase : null,
          startTime: new Date(),
          plannedDuration: timeLeft,
          completed: false
        };
        setCurrentSession(newSession);
        startTimeRef.current = new Date();
      }
    } else if (currentSession) {
      setCurrentSession({
        ...currentSession,
        taskId: selectedTaskId
      });
    }
  };

  // Timer task switch effect
  useEffect(() => {
    if (selectedTaskId !== prevTaskIdRef.current && prevTaskIdRef.current !== null) {
      handleTaskSwitch();
    }
    prevTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);

  // Initialize timer based on mode
  useEffect(() => {
    if (!isTimerRunning) {
      if (timerMode === 'pomodoro') {
        const duration = getPomodoroPhaseTime(pomodoroPhase);
        setTimeLeft(duration * 60);
      } else if (timerMode === 'countdown') {
        setTimeLeft(customCountdown);
      } else if (timerMode === 'stopwatch') {
        setCurrentTime(0);
      }
    }
  }, [timerMode, pomodoroPhase, customCountdown, timerSettings]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setCurrentTime(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              
              if (currentSession) {
                const actualDuration = (timerMode as string) === 'stopwatch' ? currentTime + 1 : (currentSession.plannedDuration ?? 0);
                
                const completedSession: TimerSession = {
                  ...currentSession,
                  endTime: new Date(),
                  completed: true,
                  actualDuration: actualDuration
                };
                addUniqueSessionToHistory(completedSession);
                setCurrentSession(null);
              }
              
              if (timerMode === 'pomodoro') {
                let nextPhase: 'work' | 'shortBreak' | 'longBreak';
                let shouldAutoStart = false;
                
                if (pomodoroPhase === 'work') {
                  const newCount = pomodoroCount + 1;
                  setPomodoroCount(newCount);
                  
                  if (newCount % timerSettings.longBreakInterval === 0) {
                    nextPhase = 'longBreak';
                  } else {
                    nextPhase = 'shortBreak';
                  }
                  shouldAutoStart = timerSettings.autoStartBreaks;
                } else {
                  nextPhase = 'work';
                  shouldAutoStart = timerSettings.autoStartWork;
                }
                
                setPomodoroPhase(nextPhase);
                
                setTimeout(() => {
                  const nextPhaseDuration = getPomodoroPhaseTime(nextPhase);
                  setTimeLeft(nextPhaseDuration * 60);
                  
                  if (shouldAutoStart) {
                    setIsTimerRunning(true);
                    startTimeRef.current = new Date();
                    const newSession: TimerSession = {
                      id: Date.now(),
                      taskId: selectedTaskId,
                      mode: 'pomodoro',
                      phase: nextPhase,
                      startTime: new Date(),
                      plannedDuration: nextPhaseDuration * 60,
                      completed: false
                    };
                    setCurrentSession(newSession);
                  }
                }, 100);
              }
              
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, timerMode, currentSession, pomodoroPhase, pomodoroCount, timerSettings.longBreakInterval, timerSettings.autoStartWork, timerSettings.autoStartBreaks, currentTime, selectedTaskId]);

  // Timer control functions
  const startTimer = () => {
    if (currentSession && currentSession.taskId !== selectedTaskId) {
      const actualDuration = timerMode === 'stopwatch' 
        ? currentTime 
        : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: actualDuration,
        reason: 'task_changed_before_start'
      };
      addUniqueSessionToHistory(completedSession);
    }
  
    setIsTimerRunning(true);
    startTimeRef.current = new Date();
    
    const newSession: TimerSession = {
      id: Date.now(),
      taskId: selectedTaskId,
      mode: timerMode,
      phase: timerMode === 'pomodoro' ? pomodoroPhase : null,
      startTime: new Date(),
      plannedDuration: timerMode === 'stopwatch' ? null : timeLeft,
      completed: false
    };
    setCurrentSession(newSession);
  };
  
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };
  
  const resetTimer = () => {
    setIsTimerRunning(false);
    
    if (currentSession) {
      const actualDuration = timerMode === 'stopwatch' ? currentTime : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const sessionEnd: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: timerMode === 'stopwatch' ? true : false,
        actualDuration: actualDuration,
        reason: 'reset'
      };
      addUniqueSessionToHistory(sessionEnd);
      setCurrentSession(null);
    }
    
    if (timerMode === 'pomodoro') {
      const duration = getPomodoroPhaseTime(pomodoroPhase);
      setTimeLeft(duration * 60);
    } else if (timerMode === 'countdown') {
      setTimeLeft(customCountdown);
    } else if (timerMode === 'stopwatch') {
      setCurrentTime(0);
    }
  };

  const skipTimer = () => {
    if (timerMode !== 'pomodoro') return;
    
    setIsTimerRunning(false);
    
    // Complete current session
    if (currentSession) {
      const actualDuration = (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: actualDuration,
        reason: 'skipped'
      };
      addUniqueSessionToHistory(completedSession);
      setCurrentSession(null);
    }
    
    // Move to next phase
    let nextPhase: 'work' | 'shortBreak' | 'longBreak';
    let shouldAutoStart = false;
    
    if (pomodoroPhase === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      
      if (newCount % timerSettings.longBreakInterval === 0) {
        nextPhase = 'longBreak';
      } else {
        nextPhase = 'shortBreak';
      }
      shouldAutoStart = timerSettings.autoStartBreaks;
    } else {
      nextPhase = 'work';
      shouldAutoStart = timerSettings.autoStartWork;
    }
    
    setPomodoroPhase(nextPhase);
    
    // Reset timer for next phase and auto-start if enabled
    setTimeout(() => {
      const nextPhaseDuration = getPomodoroPhaseTime(nextPhase);
      setTimeLeft(nextPhaseDuration * 60);
      
      if (shouldAutoStart) {
        setIsTimerRunning(true);
        startTimeRef.current = new Date();
        const newSession: TimerSession = {
          id: Date.now(),
          taskId: selectedTaskId,
          mode: 'pomodoro',
          phase: nextPhase,
          startTime: new Date(),
          plannedDuration: nextPhaseDuration * 60,
          completed: false
        };
        setCurrentSession(newSession);
      }
    }, 100);
  };
  
  const handleModeChange = (newMode: 'pomodoro' | 'countdown' | 'stopwatch') => {
    if (currentSession) {
      const actualDuration = timerMode === 'stopwatch' 
        ? currentTime 
        : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: actualDuration,
        reason: 'mode_changed'
      };
      addUniqueSessionToHistory(completedSession);
      setCurrentSession(null);
    }
    
    setIsTimerRunning(false);
    setTimerMode(newMode);
    
    if (newMode === 'pomodoro') {
      setPomodoroPhase('work');
      setPomodoroCount(0);
    }
  };

  const updateTimerSettings = (key: keyof TimerSettings, value: string | number | boolean) => {
    if (key === 'autoStartWork' || key === 'autoStartBreaks') {
      setTimerSettings(prev => ({ ...prev, [key]: value as boolean }));
    } else {
      setTimerSettings(prev => ({ ...prev, [key]: parseInt(value as string) }));
    }
  };

  const getTaskSessionCount = (): number => {
    if (!selectedTaskId) return 0;
    return timerHistory.filter(session => session.taskId === selectedTaskId).length;
  };

  const getTaskCompletedSessionCount = (): number => {
    if (!selectedTaskId) return 0;
    return timerHistory.filter(session => session.taskId === selectedTaskId && session.completed).length;
  };

  // Helper functions for timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = (): string => {
    if (timerMode === 'stopwatch') {
      return formatTime(currentTime);
    }
    return formatTime(timeLeft);
  };

  const getPhaseLabel = (): string => {
    if (timerMode === 'pomodoro') {
      switch (pomodoroPhase) {
        case 'work': return 'Work Time';
        case 'shortBreak': return 'Short Break';
        case 'longBreak': return 'Long Break';
        default: return 'Work Time';
      }
    }
    return timerMode.charAt(0).toUpperCase() + timerMode.slice(1);
  };

  const getProgressPercentage = (): number => {
    if (timerMode === 'stopwatch') return 0;
    if (timerMode === 'pomodoro') {
      const totalTime = getPomodoroPhaseTime(pomodoroPhase) * 60;
      return ((totalTime - timeLeft) / totalTime) * 100;
    }
    if (timerMode === 'countdown') {
      return ((customCountdown - timeLeft) / customCountdown) * 100;
    }
    return 0;
  };

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Project CRUD operations
  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false
    };
    setProjects(prev => [...prev, newProject]);
    // Auto-select first project if none selected
    if (!selectedProjectId) setSelectedProjectId(newProject.id);
  };

  const updateProject = (projectId: number, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ));
  };

  const deleteProject = (projectId: number) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    // Remove all tasks belonging to this project
    setTasks(prev => prev.filter(task => task.projectId !== projectId));
    // Deselect if needed
    if (selectedProjectId === projectId) setSelectedProjectId(null);
    if (selectedTaskId && tasks.find(t => t.id === selectedTaskId)?.projectId === projectId) {
      setSelectedTaskId(null);
    }
  };

  const selectProject = (projectId: number | null) => {
    setSelectedProjectId(projectId);
    // Deselect task if it doesn't belong to the new project
    if (selectedTaskId && tasks.find(t => t.id === selectedTaskId)?.projectId !== projectId) {
      setSelectedTaskId(null);
    }
  };

  // Task CRUD operations
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timerIds'>) => {
    if (!taskData.projectId) return;
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      timerIds: []
    };
    setTasks(prev => [...prev, newTask]);

  };

  const updateTask = (taskId: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    

    
    // If this was the selected task, deselect it
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const selectTask = (taskId: number | null) => {
    setSelectedTaskId(taskId);
  };

  // Timer session completion handler
  const handleTimerSessionComplete = (sessionId: number, taskId: number | null) => {
    if (taskId) {
      // Update task's timer IDs (only if not already present)
      setTasks(prev => prev.map(task => 
        task.id === taskId && !task.timerIds.includes(sessionId)
          ? { 
              ...task, 
              timerIds: [...task.timerIds, sessionId],
              updatedAt: new Date()
            }
          : task
      ));
  

    }
  };

  // Get selected task details
  const getSelectedTask = () => {
    return tasks.find(task => task.id === selectedTaskId);
  };



  const selectedTask = getSelectedTask();

  // Load example data on first mount if state is empty
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(exampleProjects);
      setSelectedProjectId(exampleProjects[0]?.id || null);
    }
    if (tasks.length === 0) {
      setTasks(exampleTasks);
      setSelectedTaskId(exampleTasks[0]?.id || null);
    }
    if (timerHistory.length === 0) {
      setTimerHistory(exampleTimerSessions);
    }
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header - Fixed at top */}
      <div className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Task Timer App</h1>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
            }`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              // Sun icon for dark mode (to switch to light)
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              // Moon icon for light mode (to switch to dark)
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout - Adjusted to account for fixed header */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className={`w-16 border-r transition-colors duration-200 flex flex-col items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center py-4">
            <nav className="space-y-4">
              <button
                onClick={() => setActiveSidebarItem('main')}
                title="Main"
                className={`flex items-center justify-center p-3 rounded-lg transition-colors duration-200 ${
                  activeSidebarItem === 'main'
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
              
              <button
                onClick={() => setActiveSidebarItem('statistics')}
                title="Statistics"
                className={`flex items-center justify-center p-3 rounded-lg transition-colors duration-200 ${
                  activeSidebarItem === 'statistics'
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden full-available-height">
          {activeSidebarItem === 'main' && (
            <div className="main-content-row full-available-height">
              {/* Projects Component */}
              <div className="main-content-col">
                <div className="section-card h-full">
                  <Projects
                    projects={projects}
                    onCreateProject={createProject}
                    onUpdateProject={updateProject}
                    onDeleteProject={deleteProject}
                    selectedProjectId={selectedProjectId}
                    onSelectProject={selectProject}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Tasks Component */}
              <div className="main-content-col">
                <div className="section-card h-full">
                  <Tasks
                    tasks={tasks.filter(task => task.projectId === selectedProjectId)}
                    onCreateTask={createTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    selectedTaskId={selectedTaskId}
                    onSelectTask={selectTask}
                    currentProjectId={selectedProjectId}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Timer Component */}
              <div className="main-content-col">
                <div className="section-card h-full">
                  <Timer
                    selectedTaskId={selectedTaskId}
                    taskTitle={selectedTask?.title}
                    darkMode={darkMode}
                    // Timer state
                    mode={timerMode}
                    isRunning={isTimerRunning}
                    timeLeft={timeLeft}
                    currentTime={currentTime}
                    pomodoroPhase={pomodoroPhase}
                    pomodoroCount={pomodoroCount}
                    customCountdown={customCountdown}
                    showSettings={showTimerSettings}
                    settings={timerSettings}
                    timerHistory={timerHistory}
                    currentSession={currentSession}
                    // Timer functions
                    onStartTimer={startTimer}
                    onPauseTimer={pauseTimer}
                    onResetTimer={resetTimer}
                    onSkipTimer={skipTimer}
                    onModeChange={handleModeChange}
                    onUpdateSettings={updateTimerSettings}
                    onSetCustomCountdown={setCustomCountdown}
                    onSetShowSettings={setShowTimerSettings}
                    // Display helpers
                    getDisplayTime={getDisplayTime}
                    getPhaseLabel={getPhaseLabel}
                    getProgressPercentage={getProgressPercentage}
                    getTaskSessionCount={getTaskSessionCount}
                    getTaskCompletedSessionCount={getTaskCompletedSessionCount}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSidebarItem === 'statistics' && (
            <div className="p-6">
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Statistics</h2>
                <p>Statistics section coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;