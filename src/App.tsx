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

  // Project CRUD operations
  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Timer App</h1>
          <div className="text-sm text-gray-600 space-x-4">
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
            />
          </div>

          {/* Timer Component (Right) */}
          <div>
            <Timer
              selectedTaskId={selectedTaskId}
              onTimerSessionComplete={handleTimerSessionComplete}
              taskTitle={selectedTask?.title}
            />
          </div>
        </div>

        {/* Global State Viewer */}
        <div className="mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => setShowGlobalStateViewer(!showGlobalStateViewer)}
            className="w-full p-3 bg-purple-100 hover:bg-purple-200 rounded-md text-sm font-medium text-purple-700"
          >
            {showGlobalStateViewer ? 'Hide Global State Viewer' : 'Show Global State Viewer'}
          </button>
          
          {showGlobalStateViewer && (
            <div className="mt-4 p-6 bg-gray-100 rounded-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Global Application State</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Global Statistics */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Global Statistics</h4>
                  <div className="text-sm font-mono space-y-1 bg-white p-3 rounded">
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
                  <h4 className="font-medium text-gray-700 mb-2">Selected Task Details</h4>
                  <div className="text-xs font-mono bg-white p-3 rounded">
                    <pre>{JSON.stringify(selectedTask, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* Task-Timer Relationships */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">Task-Timer Relationships</h4>
                <div className="text-xs font-mono bg-white p-3 rounded max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(taskTimerRelationships, null, 2)}</pre>
                </div>
              </div>

              {/* All Tasks Data */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">All Tasks Data</h4>
                <div className="text-xs font-mono bg-white p-3 rounded max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(tasks, null, 2)}</pre>
                </div>
              </div>

              {/* Detailed Task-Timer Breakdown */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">Task-Timer Breakdown</h4>
                <div className="space-y-2">
                  {tasks.map(task => {
                    const relationship = getTaskRelationship(task.id);
                    return (
                      <div key={task.id} className="bg-white p-3 rounded text-sm">
                        <div className="font-medium text-gray-800">{task.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span>ID: {task.id}</span>
                          <span className="ml-4">Timer IDs: [{task.timerIds.join(', ')}]</span>
                          <span className="ml-4">Sessions: {relationship?.totalSessions || 0}</span>
                          <span className="ml-4">Completed: {relationship?.completedSessions || 0}</span>
                          <span className="ml-4">Status: {task.completed ? 'Completed' : 'Active'}</span>
                          {selectedTaskId === task.id && (
                            <span className="ml-4 text-blue-600 font-medium">← Currently Selected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="bg-white p-3 rounded text-sm text-gray-500">
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