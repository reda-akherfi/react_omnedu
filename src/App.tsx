import React, { useState } from 'react';

import './App.css'
import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks';
import Projects from './components/Projects/Projects';




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

interface TaskTimerRelationship {
  taskId: number;
  timerIds: number[];
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number; // in seconds
  lastSessionDate?: Date;
}

const App: React.FC = () => {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // Task-Timer relationship tracking
  const [taskTimerRelationships, setTaskTimerRelationships] = useState<TaskTimerRelationship[]>([]);
  
  // State viewer for debugging
  const [showGlobalStateViewer, setShowGlobalStateViewer] = useState<boolean>(false);

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
    // Initialize relationship tracking
    setTaskTimerRelationships(prev => [...prev, {
      taskId: newTask.id,
      timerIds: [],
      totalSessions: 0,
      completedSessions: 0,
      totalTimeSpent: 0
    }]);
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
    
    // Remove from relationship tracking
    setTaskTimerRelationships(prev => prev.filter(rel => rel.taskId !== taskId));
    
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
  
      // Update relationship tracking (only if not already counted)
      setTaskTimerRelationships(prev => prev.map(rel => 
        rel.taskId === taskId && !rel.timerIds.includes(sessionId)
          ? {
              ...rel,
              timerIds: [...rel.timerIds, sessionId],
              totalSessions: rel.totalSessions + 1,
              completedSessions: rel.completedSessions + 1,  // Fixed this line
              lastSessionDate: new Date()
            }
          : rel
      ));
    }
  };

  // Get selected task details
  const getSelectedTask = () => {
    return tasks.find(task => task.id === selectedTaskId);
  };

  // Get task-timer relationship data
  const getTaskRelationship = (taskId: number): TaskTimerRelationship | undefined => {
    return taskTimerRelationships.find(rel => rel.taskId === taskId);
  };

  // Get global statistics
  const getGlobalStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTimerSessions = taskTimerRelationships.reduce((sum, rel) => sum + rel.totalSessions, 0);
    const totalCompletedSessions = taskTimerRelationships.reduce((sum, rel) => sum + rel.completedSessions, 0);
    
    return {
      totalTasks,
      completedTasks,
      totalTimerSessions,
      totalCompletedSessions,
      tasksWithTimers: taskTimerRelationships.filter(rel => rel.timerIds.length > 0).length
    };
  };

  const globalStats = getGlobalStats();
  const selectedTask = getSelectedTask();

  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Empty div for spacing */}
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-full transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
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
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Task Timer App</h1>
          <div className={`text-sm space-x-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>Tasks: {globalStats.totalTasks}</span>
            <span>Completed: {globalStats.completedTasks}</span>
            <span>Timer Sessions: {globalStats.totalTimerSessions}</span>
            <span>Tasks with Timers: {globalStats.tasksWithTimers}</span>
          </div>
        </div>

        {/* Projects Component (Above Main Content) */}
        <Projects
          projects={projects}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          selectedProjectId={selectedProjectId}
          onSelectProject={selectProject}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Component (Left) */}
          <div>
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

          {/* Timer Component (Right) */}
          <div>
            <Timer
              selectedTaskId={selectedTaskId}
              onTimerSessionComplete={handleTimerSessionComplete}
              taskTitle={selectedTask?.title}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Global State Viewer */}
        <div className="mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => setShowGlobalStateViewer(!showGlobalStateViewer)}
            className={`w-full p-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              darkMode 
                ? 'bg-purple-900 hover:bg-purple-800 text-purple-200' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
            }`}
          >
            {showGlobalStateViewer ? 'Hide Global State Viewer' : 'Show Global State Viewer'}
          </button>
          
          {showGlobalStateViewer && (
            <div className={`mt-4 p-6 rounded-md transition-colors duration-200 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Global Application State</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Global Statistics */}
                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global Statistics</h4>
                  <div className={`text-sm font-mono space-y-1 p-3 rounded transition-colors duration-200 ${
                    darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                  }`}>
                    <div><strong>Total Tasks:</strong> {globalStats.totalTasks}</div>
                    <div><strong>Completed Tasks:</strong> {globalStats.completedTasks}</div>
                    <div><strong>Total Timer Sessions:</strong> {globalStats.totalTimerSessions}</div>
                    <div><strong>Completed Sessions:</strong> {globalStats.totalCompletedSessions}</div>
                    <div><strong>Tasks with Timers:</strong> {globalStats.tasksWithTimers}</div>
                    <div><strong>Selected Task ID:</strong> {selectedTaskId || 'None'}</div>
                  </div>
                </div>

                {/* Selected Task Details */}
                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Selected Task Details</h4>
                  <div className={`text-xs font-mono p-3 rounded transition-colors duration-200 ${
                    darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                  }`}>
                    <pre>{JSON.stringify(selectedTask, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* Task-Timer Relationships */}
              <div className="mt-6">
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Task-Timer Relationships</h4>
                <div className={`text-xs font-mono p-3 rounded max-h-60 overflow-y-auto transition-colors duration-200 ${
                  darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                }`}>
                  <pre>{JSON.stringify(taskTimerRelationships, null, 2)}</pre>
                </div>
              </div>

              {/* All Tasks Data */}
              <div className="mt-6">
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>All Tasks Data</h4>
                <div className={`text-xs font-mono p-3 rounded max-h-60 overflow-y-auto transition-colors duration-200 ${
                  darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                }`}>
                  <pre>{JSON.stringify(tasks, null, 2)}</pre>
                </div>
              </div>

              {/* Detailed Task-Timer Breakdown */}
              <div className="mt-6">
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Task-Timer Breakdown</h4>
                <div className="space-y-2">
                  {tasks.map(task => {
                    const relationship = getTaskRelationship(task.id);
                    return (
                      <div key={task.id} className={`p-3 rounded text-sm transition-colors duration-200 ${
                        darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                      }`}>
                        <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{task.title}</div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>ID: {task.id}</span>
                          <span className="ml-4">Timer IDs: [{task.timerIds.join(', ')}]</span>
                          <span className="ml-4">Sessions: {relationship?.totalSessions || 0}</span>
                          <span className="ml-4">Completed: {relationship?.completedSessions || 0}</span>
                          <span className="ml-4">Status: {task.completed ? 'Completed' : 'Active'}</span>
                          {selectedTaskId === task.id && (
                            <span className={`ml-4 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>← Currently Selected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className={`p-3 rounded text-sm transition-colors duration-200 ${
                      darkMode ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-500'
                    }`}>
                      No tasks created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;