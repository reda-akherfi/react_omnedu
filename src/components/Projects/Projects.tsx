import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

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
  darkMode: boolean;
}

const Projects: React.FC<ProjectsProps> = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  selectedProjectId,
  onSelectProject,
  darkMode
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', completed: false });
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click-outside detection
  const createEditModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createEditModalRef.current && !createEditModalRef.current.contains(event.target as Node)) {
        if (showCreateForm || editingProjectId) {
          setShowCreateForm(false);
          cancelEdit();
        }
      }
    };

    if (showCreateForm || editingProjectId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateForm, editingProjectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        if (projectToDelete) {
          cancelDelete();
        }
      }
    };

    if (projectToDelete) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [projectToDelete]);

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

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full h-full flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-4 px-4 pt-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Projects</h2>
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

        {/* Search Box */}
        <div className="mb-4 px-4">
          <div className={`relative ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search projects..."
            />
          </div>
          {searchQuery && (
            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingProjectId) && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
            <div 
              ref={createEditModalRef}
              className={`border shadow-lg rounded-lg p-6 max-w-md mx-4 w-full transition-colors duration-200 cursor-default ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {editingProjectId ? 'Edit Project' : 'New Project'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
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
                  <label htmlFor="completed" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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

        {/* Projects List - Fill available space, themed scrollbar */}
        <div className="flex-1 min-h-0 overflow-y-auto themed-scrollbar px-4 pb-4">
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery ? (
                  <>
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <p className="font-medium">No projects found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="font-medium">No projects yet</p>
                    <p className="text-sm">Create your first project!</p>
                  </>
                )}
              </div>
            ) : (
              filteredProjects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedProjectId === project.id
                      ? darkMode 
                        ? 'border-purple-400 bg-purple-900' 
                        : 'border-purple-500 bg-purple-50'
                      : darkMode
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
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
                        <span className={`font-medium ${project.completed ? 'line-through text-gray-400' : darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{project.name}</span>
                        {project.completed && <span className="ml-2 text-xs text-green-600 font-semibold">Completed</span>}
                      </div>
                      {project.description && (
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</p>
                      )}
                      <div className={`flex items-center space-x-4 mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                        {selectedProjectId === project.id && (
                          <span className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Active</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="p-2 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 rounded transition-colors duration-200"
                        title="Edit project"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project);
                        }}
                        className="p-2 text-red-500 hover:bg-red-100 hover:text-red-600 rounded transition-colors duration-200"
                        title="Delete project"
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
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm cursor-pointer">
          <div 
            ref={deleteModalRef}
            className={`border shadow-lg rounded-lg p-6 max-w-md mx-4 transition-colors duration-200 cursor-default ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Delete Project</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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