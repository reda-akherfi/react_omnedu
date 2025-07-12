import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface TimerSession {
  id: number;
  taskId: number | null; // Link to task
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

interface TimerProps {
  selectedTaskId: number | null;
  onTimerSessionComplete: (sessionId: number, taskId: number | null) => void;
  taskTitle?: string;
  darkMode: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  selectedTaskId, 
  onTimerSessionComplete, 
  taskTitle,
  darkMode
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [currentTime, setCurrentTime] = useState<number>(0); // For stopwatch mode
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [customCountdown, setCustomCountdown] = useState<number>(10 * 60); // 10 minutes default
  const [showSettings, setShowSettings] = useState<boolean>(false);
  // Track previous task ID to detect changes
  const prevTaskIdRef = useRef<number | null>(null);
  useEffect(() => {
    // Check if task has changed
    if (selectedTaskId !== prevTaskIdRef.current && prevTaskIdRef.current !== null) {
      // Task has changed - handle the switch
      handleTaskSwitch();
    }
    prevTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);
  

const handleTaskSwitch = () => {
    if (isRunning && currentSession) {
      // Complete current session for previous task
      const actualDuration = mode === 'stopwatch' 
        ? currentTime 
        : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: actualDuration,
        reason: 'task_switched'
      };
      
      // Add to history and notify parent about this session
      addUniqueSessionToHistory(completedSession);
      onTimerSessionComplete(completedSession.id, completedSession.taskId);
  
      // Start new session with remaining time
      if (mode !== 'stopwatch') {
        const newSession: TimerSession = {
          id: Date.now(),
          taskId: selectedTaskId,
          mode,
          phase: mode === 'pomodoro' ? pomodoroPhase : null,
          startTime: new Date(),
          plannedDuration: timeLeft, // Continue with remaining time
          completed: false
        };
        setCurrentSession(newSession);
        startTimeRef.current = new Date();
      }
    } else if (currentSession) {
      // Just update the task ID if timer isn't running
      setCurrentSession({
        ...currentSession,
        taskId: selectedTaskId
      });
    }
  };
  
  // Settings state
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 1,
    longBreakInterval: 4,
    autoStartWork: false,
    autoStartBreaks: false
  });
  
  // Timer tracking for statistics
  const [timerHistory, setTimerHistory] = useState<TimerSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  
  // State viewer for debugging
  const [showStateViewer, setShowStateViewer] = useState<boolean>(false);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  
  const addUniqueSessionToHistory = (session: TimerSession) => {
    setTimerHistory(prev => {
      // Check if session with this ID already exists
      const existingIndex = prev.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        // Update existing session if needed
        return prev.map((s, idx) => 
          idx === existingIndex ? session : s
        );
      } else {
        // Add new session
        if (session.completed) {
          onTimerSessionComplete(session.id, session.taskId);
        }
        return [...prev, session];
      }
    });
  };

  // Initialize timer based on mode
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'pomodoro') {
        const duration = getPomodoroPhaseTime(pomodoroPhase);
        setTimeLeft(duration * 60);
      } else if (mode === 'countdown') {
        setTimeLeft(customCountdown);
      } else if (mode === 'stopwatch') {
        setCurrentTime(0);
      }
    }
  }, [mode, pomodoroPhase, customCountdown, settings]);
  
  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setCurrentTime(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              
              // Complete current session
              if (currentSession) {
                const actualDuration = ((mode as string) === 'stopwatch' ? currentTime + 1 : (currentSession.plannedDuration ?? 0));
                
                const completedSession: TimerSession = {
                  ...currentSession,
                  endTime: new Date(),
                  completed: true,
                  actualDuration: actualDuration
                };
                addUniqueSessionToHistory(completedSession);
                setCurrentSession(null);
              }
              
              // Handle pomodoro phase transitions
              if (mode === 'pomodoro') {
                let nextPhase: 'work' | 'shortBreak' | 'longBreak';
                let shouldAutoStart = false;
                
                if (pomodoroPhase === 'work') {
                  const newCount = pomodoroCount + 1;
                  setPomodoroCount(newCount);
                  
                  if (newCount % settings.longBreakInterval === 0) {
                    nextPhase = 'longBreak';
                  } else {
                    nextPhase = 'shortBreak';
                  }
                  shouldAutoStart = settings.autoStartBreaks;
                } else {
                  nextPhase = 'work';
                  shouldAutoStart = settings.autoStartWork;
                }
                
                setPomodoroPhase(nextPhase);
                
                // Reset timer for next phase and auto-start if enabled
                setTimeout(() => {
                  const nextPhaseDuration = getPomodoroPhaseTime(nextPhase);
                  setTimeLeft(nextPhaseDuration * 60);
                  
                  if (shouldAutoStart) {
                    setIsRunning(true);
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
  }, [isRunning, mode, currentSession, pomodoroPhase, pomodoroCount, settings.longBreakInterval, settings.autoStartWork, settings.autoStartBreaks, currentTime, selectedTaskId]);
  
  const getPomodoroPhaseTime = (phase: 'work' | 'shortBreak' | 'longBreak'): number => {
    switch (phase) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };
  
  const startTimer = () => {
    // If we have an existing session with a different task, complete it first
    if (currentSession && currentSession.taskId !== selectedTaskId) {
      const actualDuration = mode === 'stopwatch' 
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
  
    setIsRunning(true);
    startTimeRef.current = new Date();
    
    // Create new session
    const newSession: TimerSession = {
      id: Date.now(),
      taskId: selectedTaskId,
      mode,
      phase: mode === 'pomodoro' ? pomodoroPhase : null,
      startTime: new Date(),
      plannedDuration: mode === 'stopwatch' ? null : timeLeft,
      completed: false
    };
    setCurrentSession(newSession);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    
    // Mark current session based on mode
    if (currentSession) {
      const actualDuration = mode === 'stopwatch' ? currentTime : (currentSession.plannedDuration ?? 0) - timeLeft;
      
      const sessionEnd: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: mode === 'stopwatch' ? true : false, // Stopwatch reset = complete
        actualDuration: actualDuration,
        reason: 'reset'
      };
      addUniqueSessionToHistory(sessionEnd);
      setCurrentSession(null);
    }
    
    if (mode === 'pomodoro') {
      const duration = getPomodoroPhaseTime(pomodoroPhase);
      setTimeLeft(duration * 60);
    } else if (mode === 'countdown') {
      setTimeLeft(customCountdown);
    } else if (mode === 'stopwatch') {
      setCurrentTime(0);
    }
  };
  
  const handleModeChange = (newMode: 'pomodoro' | 'countdown' | 'stopwatch') => {
    // Complete current session when mode changes
    if (currentSession) {
      const actualDuration = mode === 'stopwatch' 
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
    
    setIsRunning(false);
    setMode(newMode);
    
    if (newMode === 'pomodoro') {
      setPomodoroPhase('work');
      setPomodoroCount(0);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const updateSettings = (key: keyof TimerSettings, value: string | number | boolean) => {
    if (key === 'autoStartWork' || key === 'autoStartBreaks') {
      setSettings(prev => ({ ...prev, [key]: value as boolean }));
    } else {
      setSettings(prev => ({ ...prev, [key]: parseInt(value as string) }));
    }
  };
  
  const getDisplayTime = (): string => {
    if (mode === 'stopwatch') {
      return formatTime(currentTime);
    }
    return formatTime(timeLeft);
  };
  
  const getPhaseLabel = (): string => {
    if (mode === 'pomodoro') {
      switch (pomodoroPhase) {
        case 'work': return 'Work Time';
        case 'shortBreak': return 'Short Break';
        case 'longBreak': return 'Long Break';
        default: return 'Work Time';
      }
    }
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };
  
  const getProgressPercentage = (): number => {
    if (mode === 'stopwatch') return 0;
    if (mode === 'pomodoro') {
      const totalTime = getPomodoroPhaseTime(pomodoroPhase) * 60;
      return ((totalTime - timeLeft) / totalTime) * 100;
    }
    if (mode === 'countdown') {
      return ((customCountdown - timeLeft) / customCountdown) * 100;
    }
    return 0;
  };

  const getTaskSessionCount = (): number => {
    if (!selectedTaskId) return 0;
    return timerHistory.filter(session => session.taskId === selectedTaskId).length;
  };

  const getTaskCompletedSessionCount = (): number => {
    if (!selectedTaskId) return 0;
    return timerHistory.filter(session => session.taskId === selectedTaskId && session.completed).length;
  };

  return (
    <div className={`max-w-md mx-auto p-6 rounded-lg shadow-lg transition-colors duration-200 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Task Info */}
      {selectedTaskId && (
        <div className={`mb-4 p-3 rounded-md border transition-colors duration-200 ${
          darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Working on:</h3>
          <p className={`font-medium ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>{taskTitle || `Task #${selectedTaskId}`}</p>
          <div className={`text-xs mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            Sessions: {getTaskSessionCount()} • Completed: {getTaskCompletedSessionCount()}
          </div>
        </div>
      )}
      
      {!selectedTaskId && (
        <div className={`mb-4 p-3 rounded-md border transition-colors duration-200 ${
          darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>⚠️ No task selected. Timer sessions won't be linked to any task.</p>
        </div>
      )}

      <div className="mb-6">
        <select 
          value={mode} 
          onChange={(e) => handleModeChange(e.target.value as 'pomodoro' | 'countdown' | 'stopwatch')}
          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100' 
              : 'border-gray-300 text-gray-900'
          }`}
        >
          <option value="pomodoro">Pomodoro</option>
          <option value="countdown">Countdown</option>
          <option value="stopwatch">Stopwatch</option>
        </select>
      </div>
      
      <div className="text-center mb-6">
        <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{getPhaseLabel()}</h2>
        <div className={`text-6xl font-mono font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {getDisplayTime()}
        </div>
        
        {mode !== 'stopwatch' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}
        
        {mode === 'pomodoro' && (
          <div className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Session {pomodoroCount + 1} • {pomodoroPhase === 'work' ? 'Focus' : 'Break'}
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={`px-6 py-2 rounded-md font-medium ${
            isRunning 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={resetTimer}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-4">
        {mode === 'countdown' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Countdown Duration (minutes)
            </label>
            <input
              type="number"
              value={customCountdown / 60}
              onChange={(e) => setCustomCountdown(parseInt(e.target.value) * 60)}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              }`}
              min="1"
              max="999"
            />
          </div>
        )}
        
        {mode === 'pomodoro' && (
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            
            {showSettings && (
              <div className={`mt-4 space-y-3 p-4 rounded-md transition-colors duration-200 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.workDuration}
                    onChange={(e) => updateSettings('workDuration', e.target.value)}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings('shortBreakDuration', e.target.value)}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings('longBreakDuration', e.target.value)}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Long Break Interval (sessions)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSettings('longBreakInterval', e.target.value)}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    min="2"
                    max="10"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoStartWork"
                    checked={settings.autoStartWork}
                    onChange={(e) => updateSettings('autoStartWork', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoStartWork" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Auto-start work sessions
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoStartBreaks"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings('autoStartBreaks', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoStartBreaks" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Auto-start break sessions
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {timerHistory.length > 0 && (
        <div className={`mt-6 p-4 rounded-md transition-colors duration-200 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Sessions ({timerHistory.length})
          </h3>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Completed: {timerHistory.filter(s => s.completed).length} • 
            Incomplete: {timerHistory.filter(s => !s.completed).length} •
            With Tasks: {timerHistory.filter(s => s.taskId !== null).length}
          </div>
        </div>
      )}
      
      {/* State Viewer */}
      <div className="mt-6">
        <button
          onClick={() => setShowStateViewer(!showStateViewer)}
          className={`w-full p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            darkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {showStateViewer ? 'Hide State Viewer' : 'Show State Viewer'}
        </button>
        
        {showStateViewer && (
          <div className={`mt-4 p-4 rounded-md transition-colors duration-200 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current State</h4>
            <div className={`text-xs font-mono space-y-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              <div><strong>Mode:</strong> {mode}</div>
              <div><strong>Is Running:</strong> {isRunning.toString()}</div>
              <div><strong>Time Left:</strong> {timeLeft}s</div>
              <div><strong>Current Time:</strong> {currentTime}s</div>
              <div><strong>Pomodoro Phase:</strong> {pomodoroPhase}</div>
              <div><strong>Pomodoro Count:</strong> {pomodoroCount}</div>
              <div><strong>Selected Task ID:</strong> {selectedTaskId || 'None'}</div>
            </div>
            
            <h4 className={`font-medium mt-4 mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Session</h4>
            <div className={`text-xs font-mono p-2 rounded transition-colors duration-200 ${
              darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'
            }`}>
              <pre>{JSON.stringify(currentSession, null, 2)}</pre>
            </div>
            
            <h4 className={`font-medium mt-4 mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Timer History ({timerHistory.length})</h4>
            <div className={`text-xs font-mono p-2 rounded max-h-40 overflow-y-auto transition-colors duration-200 ${
              darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'
            }`}>
              <pre>{JSON.stringify(timerHistory, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;