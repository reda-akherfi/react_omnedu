import React, { useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

interface ProjectsProps {
  projects: Project[];
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProject: (id: number, updates: Partial<Project>) => void;
  onDeleteProject: (id: number) => void;
  selectedProjectId: number | null;
  onSelectProject: (id: number | null) => void;
}

const Projects: React.FC<ProjectsProps> = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  selectedProjectId,
  onSelectProject
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', completed: false });
  const [showStateViewer, setShowStateViewer] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleCreate = () => {
    if (formData.name.trim()) {
      onCreateProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        completed: formData.completed
      });
      setFormData({ name: '', description: '', completed: false });
      setShowCreateForm(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setFormData({ name: project.name, description: project.description, completed: project.completed });
    setShowCreateForm(false);
  };

  const handleUpdate = () => {
    if (editingProjectId && formData.name.trim()) {
      onUpdateProject(editingProjectId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        completed: formData.completed,
        updatedAt: new Date()
      });
      setEditingProjectId(null);
      setFormData({ name: '', description: '', completed: false });
    }
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setFormData({ name: '', description: '', completed: false });
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    setProjectToDelete(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingProjectId(null);
            setFormData({ name: '', description: '', completed: false });
          }}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium"
        >
          {showCreateForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingProjectId) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingProjectId ? 'Edit Project' : 'New Project'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed}
                  onChange={e => setFormData({ ...formData, completed: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                  Mark as completed
                </label>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={editingProjectId ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
                >
                  {editingProjectId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    cancelEdit();
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Selection Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>Selected Project:</strong> {selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name || 'Unknown' : 'None'}
        </p>
        <p className="text-xs text-blue-600 mt-1">Click anywhere on a project to select it</p>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No projects yet. Create your first project!</p>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedProjectId === project.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={project.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateProject(project.id, { completed: !project.completed, updatedAt: new Date() });
                      }}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className={`font-medium ${project.completed ? 'line-through text-gray-400' : ''}`}>{project.name}</span>
                    {project.completed && <span className="ml-2 text-xs text-green-600 font-semibold">Completed</span>}
                  </div>
                  {project.description && (
                    <p className="text-sm mt-1 text-gray-600">{project.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    {selectedProjectId === project.id && (
                      <span className="text-purple-600 font-medium">Active</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(project);
                    }}
                    className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project);
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

      {/* State Viewer */}
      <div className="mt-6">
        <button
          onClick={() => setShowStateViewer(!showStateViewer)}
          className="w-full p-2 bg-purple-100 hover:bg-purple-200 rounded-md text-sm font-medium text-purple-700"
        >
          {showStateViewer ? 'Hide State Viewer' : 'Show State Viewer'}
        </button>
        {showStateViewer && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Projects State</h4>
            <div className="text-xs font-mono space-y-1">
              <div><strong>Total Projects:</strong> {projects.length}</div>
              <div><strong>Selected Project ID:</strong> {selectedProjectId || 'None'}</div>
            </div>
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Projects Data</h4>
            <div className="text-xs font-mono bg-white p-2 rounded max-h-40 overflow-y-auto">
              <pre>{JSON.stringify(projects, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the project "<strong>{projectToDelete.name}</strong>"?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will also delete all tasks associated with this project. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
              >
                Delete Project
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

export default Projects; 