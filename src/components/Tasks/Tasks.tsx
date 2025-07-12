import React, { useState } from 'react';

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
}

const Tasks: React.FC<TasksProps> = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  selectedTaskId,
  onSelectTask,
  currentProjectId
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [showStateViewer, setShowStateViewer] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false
  });

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingTaskId(null);
              setFormData({ title: '', description: '', completed: false });
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
          >
            {showCreateForm ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingTaskId) && (
          !currentProjectId ? (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-yellow-100 border border-yellow-300 shadow-lg rounded-lg p-6 max-w-md mx-4 w-full text-yellow-800 text-sm">
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
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6 max-w-md mx-4 w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingTaskId ? 'Edit Task' : 'New Task'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label htmlFor="completed" className="text-sm font-medium text-gray-700">
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
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Active Task for Timer:</strong> {selectedTaskId ? filteredTasks.find(t => t.id === selectedTaskId)?.title || 'Unknown' : 'None'}
          </p>
          <p className="text-xs text-blue-600 mt-1">Click the radio button next to a task to select it for the timer</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks yet for this project. Create your first task!</p>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedTaskId === task.id
                  ? 'border-blue-500 bg-blue-50'
                  : task.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="selectedTask"
                      checked={selectedTaskId === task.id}
                      onChange={() => {}} // Radio button is now controlled by parent div click
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task.id);
                      }}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Timers: {getTimerCount(task.id)}</span>
                    <span>Created: {task.createdAt.toLocaleDateString()}</span>
                    {selectedTaskId === task.id && (
                      <span className="text-blue-600 font-medium">Active</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(task);
                    }}
                    className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(task);
                    }}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Task</h3>
            <p className="text-gray-700 mb-6">
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

      {/* State Viewer */}
      <div className="mt-6">
        <button
          onClick={() => setShowStateViewer(!showStateViewer)}
          className="w-full p-2 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium text-blue-700"
        >
          {showStateViewer ? 'Hide State Viewer' : 'Show State Viewer'}
        </button>
        
        {showStateViewer && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Tasks State</h4>
            <div className="text-xs font-mono space-y-1">
              <div><strong>Total Tasks:</strong> {tasks.length}</div>
              <div><strong>Completed:</strong> {tasks.filter(t => t.completed).length}</div>
              <div><strong>Selected Task ID:</strong> {selectedTaskId || 'None'}</div>
              <div><strong>Show Create Form:</strong> {showCreateForm.toString()}</div>
              <div><strong>Editing Task ID:</strong> {editingTaskId || 'None'}</div>
            </div>
            
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Tasks Data</h4>
            <div className="text-xs font-mono bg-white p-2 rounded max-h-40 overflow-y-auto">
              <pre>{JSON.stringify(tasks, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;