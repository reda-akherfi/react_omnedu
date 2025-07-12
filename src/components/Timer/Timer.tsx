import React from 'react';

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
  showStateViewer: boolean;
  // Timer functions
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onModeChange: (mode: 'pomodoro' | 'countdown' | 'stopwatch') => void;
  onUpdateSettings: (key: keyof TimerSettings, value: string | number | boolean) => void;
  onSetCustomCountdown: (value: number) => void;
  onSetShowSettings: (value: boolean) => void;
  onSetShowStateViewer: (value: boolean) => void;
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
  showSettings,
  settings,
  timerHistory,
  currentSession,
  showStateViewer,
  // Timer functions
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onModeChange,
  onUpdateSettings,
  onSetCustomCountdown,
  onSetShowSettings,
  onSetShowStateViewer,
  // Display helpers
  getDisplayTime,
  getPhaseLabel,
  getProgressPercentage,
  getTaskSessionCount,
  getTaskCompletedSessionCount
}) => {
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
          onChange={(e) => onModeChange(e.target.value as 'pomodoro' | 'countdown' | 'stopwatch')}
          disabled={!selectedTaskId}
          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100' 
              : 'border-gray-300 text-gray-900'
          } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          className={`px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors duration-200 ${
            !selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
              onChange={(e) => onSetCustomCountdown(parseInt(e.target.value) * 60)}
              disabled={!selectedTaskId}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
              min="1"
              max="999"
            />
          </div>
        )}
        
        {mode === 'pomodoro' && (
          <div>
            <button
              onClick={() => onSetShowSettings(!showSettings)}
              disabled={!selectedTaskId}
              className={`w-full p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    onChange={(e) => onUpdateSettings('workDuration', e.target.value)}
                    disabled={!selectedTaskId}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    onChange={(e) => onUpdateSettings('shortBreakDuration', e.target.value)}
                    disabled={!selectedTaskId}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    onChange={(e) => onUpdateSettings('longBreakDuration', e.target.value)}
                    disabled={!selectedTaskId}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    onChange={(e) => onUpdateSettings('longBreakInterval', e.target.value)}
                    disabled={!selectedTaskId}
                    className={`w-full p-1 border rounded text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    } ${!selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    min="2"
                    max="10"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoStartWork"
                    checked={settings.autoStartWork}
                    onChange={(e) => onUpdateSettings('autoStartWork', e.target.checked)}
                    disabled={!selectedTaskId}
                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${
                      !selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                    onChange={(e) => onUpdateSettings('autoStartBreaks', e.target.checked)}
                    disabled={!selectedTaskId}
                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${
                      !selectedTaskId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
          onClick={() => onSetShowStateViewer(!showStateViewer)}
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