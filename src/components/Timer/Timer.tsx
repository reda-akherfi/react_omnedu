import React, { useRef, useEffect, useState } from 'react';

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
  taskTitle?: string;
  darkMode: boolean;
  // Timer state
  mode: 'pomodoro' | 'countdown' | 'stopwatch';
  isRunning: boolean;
  timeLeft: number;
  currentTime: number;
  pomodoroPhase: 'work' | 'shortBreak' | 'longBreak';
  pomodoroCount: number;
  customCountdown: number;
  showSettings: boolean;
  settings: TimerSettings;
  timerHistory: TimerSession[];
  currentSession: TimerSession | null;
  // Timer functions
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onModeChange: (mode: 'pomodoro' | 'countdown' | 'stopwatch') => void;
  onUpdateSettings: (key: keyof TimerSettings, value: string | number | boolean) => void;
  onSetCustomCountdown: (value: number) => void;
  onSetShowSettings: (value: boolean) => void;
  // Display helpers
  getDisplayTime: () => string;
  getPhaseLabel: () => string;
  getProgressPercentage: () => number;
  getTaskSessionCount: () => number;
  getTaskCompletedSessionCount: () => number;
}

const Timer: React.FC<TimerProps> = ({ 
  selectedTaskId, 
  taskTitle,
  darkMode,
  // Timer state
  mode,
  isRunning,
  timeLeft,
  currentTime,
  pomodoroPhase,
  pomodoroCount,
  customCountdown,
  settings,
  timerHistory,
  currentSession,
  // Timer functions
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSkipTimer,
  onModeChange,
  onUpdateSettings,
  onSetCustomCountdown,
  getDisplayTime,
  getPhaseLabel,
  getProgressPercentage,
  getTaskSessionCount,
  getTaskCompletedSessionCount
}) => {
  // Modal state for settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const settingsModalRef = useRef<HTMLDivElement>(null);

  // Click outside to close modal
  useEffect(() => {
    if (!showSettingsModal) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsModal]);

  // Gear icon
  const gearIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.94-2.06a1 1 0 0 0 .26-1.09l-1-1.73a1 1 0 0 1 .21-1.18l1.51-1.51a1 1 0 0 0 0-1.42l-2.12-2.12a1 1 0 0 0-1.42 0l-1.51 1.51a1 1 0 0 1-1.18.21l-1.73-1a1 1 0 0 0-1.09.26l-1.06 1.06a1 1 0 0 0-.26 1.09l1 1.73a1 1 0 0 1-.21 1.18l-1.51 1.51a1 1 0 0 0 0 1.42l2.12 2.12a1 1 0 0 0 1.42 0l1.51-1.51a1 1 0 0 1 1.18-.21l1.73 1a1 1 0 0 0 1.09-.26l1.06-1.06z"/></svg>
  );

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

      {/* Mode selector and gear button */}
      <div className="flex items-center mb-6">
        <select 
          value={mode} 
          onChange={(e) => onModeChange(e.target.value as 'pomodoro' | 'countdown' | 'stopwatch')}
          disabled={!selectedTaskId}
          className={`flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100' 
              : 'border-gray-300 text-gray-900'
          } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="pomodoro">Pomodoro</option>
          <option value="countdown">Countdown</option>
          <option value="stopwatch">Stopwatch</option>
        </select>
        <button
          onClick={() => setShowSettingsModal(true)}
          className={`ml-2 flex items-center justify-center rounded-md p-2 transition-colors duration-200 ${
            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Timer Settings"
          type="button"
        >
          {gearIcon}
        </button>
      </div>

      {/* Timer display and controls ... unchanged ... */}
      <div className="text-center mb-6">
        <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{getPhaseLabel()}</h2>
        <div className={`text-6xl font-mono font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{getDisplayTime()}</div>
        {mode !== 'stopwatch' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}
        {mode === 'pomodoro' && (
          <div className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Session {pomodoroCount + 1} • {pomodoroPhase === 'work' ? 'Focus' : 'Break'}</div>
        )}
      </div>

      {/* Timer controls ... unchanged ... */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={isRunning ? onPauseTimer : onStartTimer}
          disabled={!selectedTaskId}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
            isRunning 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onResetTimer}
          disabled={!selectedTaskId}
          className={`px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors duration-200 ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Reset
        </button>
        {mode === 'pomodoro' && (
          <button
            onClick={onSkipTimer}
            disabled={!selectedTaskId}
            className={`px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors duration-200 ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Skip to next phase"
          >
            Skip
          </button>
        )}
      </div>

      {/* Countdown duration input ... unchanged ... */}
      <div className="space-y-4">
        {mode === 'countdown' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Countdown Duration (minutes)</label>
            <input
              type="number"
              value={customCountdown / 60}
              onChange={(e) => onSetCustomCountdown(parseInt(e.target.value) * 60)}
              disabled={!selectedTaskId}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
              min="1"
              max="999"
            />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
          <div
            ref={settingsModalRef}
            className={`border shadow-lg rounded-lg p-6 max-w-md mx-4 w-full transition-colors duration-200 cursor-default ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Timer Settings</h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Work Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.workDuration}
                  onChange={e => onUpdateSettings('workDuration', e.target.value)}
                  disabled={!selectedTaskId}
                  className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300 text-gray-900'} ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Short Break (minutes)</label>
                <input
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={e => onUpdateSettings('shortBreakDuration', e.target.value)}
                  disabled={!selectedTaskId}
                  className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300 text-gray-900'} ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Long Break (minutes)</label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={e => onUpdateSettings('longBreakDuration', e.target.value)}
                  disabled={!selectedTaskId}
                  className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300 text-gray-900'} ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Long Break Interval (sessions)</label>
                <input
                  type="number"
                  value={settings.longBreakInterval}
                  onChange={e => onUpdateSettings('longBreakInterval', e.target.value)}
                  disabled={!selectedTaskId}
                  className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300 text-gray-900'} ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  min="2"
                  max="10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoStartWork"
                  checked={settings.autoStartWork}
                  onChange={e => onUpdateSettings('autoStartWork', e.target.checked)}
                  disabled={!selectedTaskId}
                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor="autoStartWork" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auto-start work sessions</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoStartBreaks"
                  checked={settings.autoStartBreaks}
                  onChange={e => onUpdateSettings('autoStartBreaks', e.target.checked)}
                  disabled={!selectedTaskId}
                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor="autoStartBreaks" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auto-start break sessions</label>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
    </div>
  );
};

export default Timer;