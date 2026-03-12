import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLoader, FiArrowLeft, FiX } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

import KanbanTaskCard from '../components/KanbanTaskCard';
import ActivityLog from '../components/ActivityLog';
import ProjectChat from '../components/ProjectChat';
import { useAuthStore } from '../stores/useStore';
import { useSocket } from '../hooks/useSocket';
import {
  canCreateTask,
  canDragTask,
  canEditOrDeleteTask
} from '../utils/roleUtils';

const KanbanBoard = ({ projectId: propProjectId, userRole, onMemberUpdate }) => {
  const { projectId: paramProjectId } = useParams();
  const navigate = useNavigate();
  const projectId = propProjectId || paramProjectId;
  const { user } = useAuthStore();
  const socket = useSocket();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    assignee: '',
    dueDate: '',
    labels: [],
    subtasks: [],
    blockers: []
  });

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  useEffect(() => {
    if (projectId && socket && user?.id) {
      socket.emit('join_room', {
        roomName: projectId,
        userId: user.id
      });
    }
    fetchBoardData();
    fetchMembers();
  }, [projectId, user, onMemberUpdate]);

  const getToken = () => {
    const token = localStorage.getItem('token');
    const authStorage = localStorage.getItem('auth-storage');
    if (token) return token;
    if (authStorage) {
      try {
        return JSON.parse(authStorage).state.token;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchBoardData = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/members/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const handleDragEnd = async (result) => {
    if (!enabled) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const currentUserId = user?.id || user?._id;
    if (!canEditOrDeleteTask(userRole, task, currentUserId)) return;

    const newStatus = destination.droppableId;
    const updatedTask = { ...task, status: newStatus };

    // Optimistically update UI
    setTasks(prev => prev.map(t => t._id === draggableId ? updatedTask : t));

    // Send to backend
    const token = getToken();
    try {
      if (!token) throw new Error('No token');
      await fetch(`http://localhost:5000/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      // Emit activity
      if (socket) {
        socket.emit('task_activity', {
          projectId,
          userId: user.id,
          userName: user.name,
          action: `moved task "${task.title}" to ${newStatus}`,
          entityType: 'task',
          entityId: task._id
        });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert on error
      setTasks(prev => prev.map(t => t._id === draggableId ? task : t));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTask, projectId })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks(prev => [...prev, createdTask]);
        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          status: 'Todo',
          priority: 'Medium',
          assignee: '',
          dueDate: '',
          labels: [],
          subtasks: [],
          blockers: []
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const columns = ['Todo', 'In Progress', 'Done'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-2xl text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        {canCreateTask(userRole, user?.globalRole || user?.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span> New Task
          </button>
        )}
      </div>

      {!enabled ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 col-span-3 shadow-sm min-h-[400px]">
            <FiLoader className="animate-spin text-4xl text-indigo-500 mb-4" />
            <span className="text-gray-500 font-medium">Initializing Board...</span>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
            {columns.map(column => (
              <div
                key={column}
                className="bg-gray-50/80 backdrop-blur-sm rounded-2xl min-w-[320px] flex flex-col p-3 border border-gray-200/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] h-full"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 px-2 pt-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{column}</h3>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-bold min-w-[20px] text-center">
                      {tasks.filter(t => t.status === column).length}
                    </span>
                  </div>
                  {/* Optional: Add clear all or sort button here */}
                </div>

                <Droppable droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-3 rounded-xl transition-all duration-200 min-h-[150px] p-1 ${snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : ''
                        }`}
                    >
                      {tasks
                        .filter(task => task.status === column)
                        .map((task, index) => {
                          const currentUserId = user?.id || user?._id;
                          const canEdit = canEditOrDeleteTask(userRole, task, currentUserId);
                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={!canEdit}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    zIndex: snapshot.isDragging ? 1000 : 1, // Ensure dragged item is on top
                                  }}
                                  className={`${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500 ring-opacity-50 rounded-xl' : ''} transition-transform ${!canEdit ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                                >
                                  <KanbanTaskCard
                                    task={task}
                                    members={members}
                                    onUpdate={fetchBoardData}
                                    projectId={projectId}
                                    userRole={userRole}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map(member => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
