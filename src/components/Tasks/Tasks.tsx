import React, { useState, useRef, useEffect } from 'react';

// Type definitions
interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  timerIds: number[];
}

interface TasksProps {
  tasks: Task[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timerIds'>) => void;
  onUpdateTask: (id: number, updates: Partial<Task>) => void;
  onDeleteTask: (id: number) => void;
  selectedTaskId: number | null;
  onSelectTask: (taskId: number | null) => void;
  currentProjectId: number | null;
  darkMode: boolean;
}

const Tasks: React.FC<TasksProps> = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  selectedTaskId,
  onSelectTask,
  currentProjectId,
  darkMode
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false
  });

  // Refs for click-outside detection
  const createEditModalRef = useRef<HTMLDivElement>(null);
  const noProjectModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createEditModalRef.current && !createEditModalRef.current.contains(event.target as Node)) {
        if (showCreateForm || editingTaskId) {
          setShowCreateForm(false);
          cancelEditing();
        }
      }
    };

    if (showCreateForm || editingTaskId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateForm, editingTaskId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noProjectModalRef.current && !noProjectModalRef.current.contains(event.target as Node)) {
        if (showCreateForm && !currentProjectId) {
          setShowCreateForm(false);
          cancelEditing();
        }
      }
    };

    if (showCreateForm && !currentProjectId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateForm, currentProjectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        if (taskToDelete) {
          cancelDelete();
        }
      }
    };

    if (taskToDelete) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [taskToDelete]);

  const handleCreateTask = () => {
    if (!currentProjectId) return;
    if (formData.title.trim()) {
      onCreateTask({
        projectId: currentProjectId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        completed: formData.completed
      });
      setFormData({ title: '', description: '', completed: false });
      setShowCreateForm(false);
    }
  };

  const handleUpdateTask = (taskId: number) => {
    if (formData.title.trim()) {
      onUpdateTask(taskId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        completed: formData.completed,
        updatedAt: new Date()
      });
      setFormData({ title: '', description: '', completed: false });
      setEditingTaskId(null);
    }
  };

  const startEditing = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      completed: task.completed
    });
    setEditingTaskId(task.id);
    setShowCreateForm(false);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setFormData({ title: '', description: '', completed: false });
  };

  const toggleTaskCompletion = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask(taskId, { 
        completed: !task.completed,
        updatedAt: new Date()
      });
    }
  };

  const getTimerCount = (taskId: number): number => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.timerIds.length : 0;
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  // Only show tasks for the current project
  const filteredTasks = currentProjectId ? tasks.filter(t => t.projectId === currentProjectId) : [];

  return (
    <div className={`max-w-md mx-auto p-6 rounded-lg shadow-lg transition-colors duration-200 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Tasks</h2>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingTaskId(null);
              setFormData({ title: '', description: '', completed: false });
            }}
            disabled={!currentProjectId}
            className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors duration-200 ${
              !currentProjectId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {showCreateForm ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingTaskId) && (
          !currentProjectId ? (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
              <div 
                ref={noProjectModalRef}
                className="bg-yellow-100 border border-yellow-300 shadow-lg rounded-lg p-6 max-w-md mx-4 w-full text-yellow-800 text-sm cursor-default"
              >
                You must select a project to create a task.
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      cancelEditing();
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
              <div 
                ref={createEditModalRef}
                className={`border shadow-lg rounded-lg p-6 max-w-md mx-4 w-full transition-colors duration-200 cursor-default ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {editingTaskId ? 'Edit Task' : 'New Task'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={3}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="completed"
                      checked={formData.completed}
                      onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="completed" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mark as completed
                    </label>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => editingTaskId ? handleUpdateTask(editingTaskId) : handleCreateTask()}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
                    >
                      {editingTaskId ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        cancelEditing();
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Task Selection Info */}
        <div className={`mb-4 p-3 rounded-md border transition-colors duration-200 ${
          darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            <strong>Active Task for Timer:</strong> {selectedTaskId ? filteredTasks.find(t => t.id === selectedTaskId)?.title || 'Unknown' : 'None'}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Click the radio button next to a task to select it for the timer</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {!currentProjectId ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">No Project Selected</p>
            <p className="text-sm">Please select a project first to view and manage tasks</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tasks yet for this project. Create your first task!</p>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 border rounded-md cursor-pointer transition-colors duration-200 ${
                selectedTaskId === task.id
                  ? darkMode 
                    ? 'border-blue-400 bg-blue-900' 
                    : 'border-blue-500 bg-blue-50'
                  : task.completed
                  ? darkMode
                    ? 'border-green-600 bg-green-900'
                    : 'border-green-300 bg-green-50'
                  : darkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task.id);
                      }}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className={`flex items-center space-x-4 mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Timers: {getTimerCount(task.id)}</span>
                    <span>Created: {task.createdAt.toLocaleDateString()}</span>
                    {selectedTaskId === task.id && (
                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Active</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(task);
                    }}
                    className="p-2 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 rounded transition-colors duration-200"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(task);
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 hover:text-red-600 rounded transition-colors duration-200"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
          <div 
            ref={deleteModalRef}
            className={`border shadow-lg rounded-lg p-6 max-w-md mx-4 transition-colors duration-200 cursor-default ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Delete Task</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete the task "<strong>{taskToDelete.title}</strong>"?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will also delete all timer sessions associated with this task. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
              >
                Delete Task
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;