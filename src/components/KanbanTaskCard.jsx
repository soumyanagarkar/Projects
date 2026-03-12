import React, { useState } from 'react';
import {
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit2,
  CheckSquare,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { canEditOrDeleteTask } from '../utils/roleUtils';
import { useAuthStore } from '../stores/useStore';

const KanbanTaskCard = ({ task, members, onUpdate, projectId, userRole }) => {
  const { user } = useAuthStore();
  const currentUserId = user?.id || user?._id;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  if (!task) return null;

  const assignee = members.find(m => m.userId === task.assignee);

  const priorityConfig = {
    Low: { color: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20', icon: 'def' },
    Medium: { color: 'bg-amber-100 text-amber-700 ring-amber-600/20', icon: 'def' },
    High: { color: 'bg-rose-100 text-rose-700 ring-rose-600/20', icon: 'def' }
  };

  const handleSave = async () => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedTask)
      });

      if (response.ok) {
        onUpdate();
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    if (!token) return;

    try {
      await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const canEdit = canEditOrDeleteTask(userRole, task, currentUserId);

  if (isEditing && canEdit) {
    return (
      <motion.div
        layoutId={task._id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100 ring-4 ring-indigo-50 relative z-10"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full px-3 py-2 text-lg font-semibold text-gray-800 border-b-2 border-indigo-100 focus:border-indigo-500 outline-none bg-transparent transition-colors placeholder-gray-400"
            placeholder="Task title"
            autoFocus
          />

          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100 focus:border-indigo-300 outline-none resize-none transition-all"
            rows={3}
            placeholder="Add a description..."
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assignee</label>
              <select
                value={editedTask.assignee || ''}
                onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
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

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={task._id}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onClick={() => canEdit && setIsEditing(true)}
    >
      {/* Priority Stripe */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ring-2 ${priorityConfig[task.priority]?.color.replace('text', 'bg').split(' ')[0]} ring-offset-1`} />

      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start pr-6">
          <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
            {task.title}
          </h4>
        </div>

        {/* Description Snippet */}
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50/50">
          <div className="flex items-center gap-2">
            {/* Styles Priority Badge */}
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ring-1 ring-inset ${priorityConfig[task.priority]?.color}`}>
              {task.priority}
            </span>

            {/* Subtasks Count */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                <CheckSquare size={10} />
                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${new Date(task.dueDate) < new Date() ? 'text-rose-600 bg-rose-50' : 'text-gray-400 bg-gray-50'
                }`}>
                <Calendar size={10} />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}

            {/* Assignee Avatar */}
            {assignee ? (
              <div className="relative group/avatar">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white">
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                {/* Tooltip */}
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-0.5 px-2 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {assignee.name}
                </span>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 ring-1 ring-gray-200 border border-white">
                <User size={12} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Menu */}
      <AnimatePresence>
        {isHovered && canEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex bg-white/90 backdrop-blur-sm shadow-sm rounded-lg border border-gray-100 p-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit Task"
            >
              <Edit2 size={12} />
            </button>
            <div className="w-px bg-gray-200 my-1 mx-0.5" />
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KanbanTaskCard;