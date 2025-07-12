import React, { useState, useEffect, useRef } from 'react';

const Timer = () => {
  const [mode, setMode] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentTime, setCurrentTime] = useState(0); // For stopwatch mode
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // work, shortBreak, longBreak
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [customCountdown, setCustomCountdown] = useState(10 * 60); // 10 minutes default
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4
  });
  
  // Timer tracking for statistics
  const [timerHistory, setTimerHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Initialize timer based on mode
  useEffect(() => {
    if (mode === 'pomodoro') {
      const duration = getPomodoroPhaseTime(pomodoroPhase);
      setTimeLeft(duration * 60);
    } else if (mode === 'countdown') {
      setTimeLeft(customCountdown);
    } else if (mode === 'stopwatch') {
      setCurrentTime(0);
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
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);
  
  const getPomodoroPhaseTime = (phase) => {
    switch (phase) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };
  
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Complete current session
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        actualDuration: mode === 'stopwatch' ? currentTime : currentSession.plannedDuration - timeLeft
      };
      setTimerHistory(prev => [...prev, completedSession]);
      setCurrentSession(null);
    }
    
    // Auto-advance pomodoro phases
    if (mode === 'pomodoro') {
      if (pomodoroPhase === 'work') {
        const newCount = pomodoroCount + 1;
        setPomodoroCount(newCount);
        
        if (newCount % settings.longBreakInterval === 0) {
          setPomodoroPhase('longBreak');
        } else {
          setPomodoroPhase('shortBreak');
        }
      } else {
        setPomodoroPhase('work');
      }
    }
  };
  
  const startTimer = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
    
    // Create new session
    const newSession = {
      id: Date.now(),
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
    
    // Mark current session as incomplete if exists
    if (currentSession) {
      const incompleteSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: mode === 'stopwatch' ? currentTime : currentSession.plannedDuration - timeLeft
      };
      setTimerHistory(prev => [...prev, incompleteSession]);
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
  
  const handleModeChange = (newMode) => {
    // Complete current session when mode changes
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        actualDuration: mode === 'stopwatch' ? currentTime : currentSession.plannedDuration - timeLeft,
        reason: 'mode_changed'
      };
      setTimerHistory(prev => [...prev, completedSession]);
      setCurrentSession(null);
    }
    
    setIsRunning(false);
    setMode(newMode);
    
    if (newMode === 'pomodoro') {
      setPomodoroPhase('work');
      setPomodoroCount(0);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };
  
  const getDisplayTime = () => {
    if (mode === 'stopwatch') {
      return formatTime(currentTime);
    }
    return formatTime(timeLeft);
  };
  
  const getPhaseLabel = () => {
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
  
  const getProgressPercentage = () => {
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <select 
          value={mode} 
          onChange={(e) => handleModeChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pomodoro">Pomodoro</option>
          <option value="countdown">Countdown</option>
          <option value="stopwatch">Stopwatch</option>
        </select>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{getPhaseLabel()}</h2>
        <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
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
          <div className="text-sm text-gray-600 mb-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countdown Duration (minutes)
            </label>
            <input
              type="number"
              value={customCountdown / 60}
              onChange={(e) => setCustomCountdown(parseInt(e.target.value) * 60)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="999"
            />
          </div>
        )}
        
        {mode === 'pomodoro' && (
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700"
            >
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            
            {showSettings && (
              <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.workDuration}
                    onChange={(e) => updateSettings('workDuration', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings('shortBreakDuration', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings('longBreakDuration', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Break Interval (sessions)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSettings('longBreakInterval', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    min="2"
                    max="10"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {timerHistory.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Sessions ({timerHistory.length})
          </h3>
          <div className="text-xs text-gray-600">
            Completed: {timerHistory.filter(s => s.completed).length} • 
            Incomplete: {timerHistory.filter(s => !s.completed).length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;