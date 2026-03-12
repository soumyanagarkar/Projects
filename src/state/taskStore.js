import { create } from 'zustand';

export const useTaskState = create((set, get) => ({
  tasksByProject: {},
  loadingByProject: {},

  setTasksForProject: (projectId, tasks) =>
    set((state) => ({
      tasksByProject: {
        ...state.tasksByProject,
        [projectId]: tasks || []
      }
    })),

  addTaskForProject: (projectId, task) =>
    set((state) => ({
      tasksByProject: {
        ...state.tasksByProject,
        [projectId]: [...(state.tasksByProject[projectId] || []), task]
      }
    })),

  updateTaskForProject: (projectId, taskId, updates) =>
    set((state) => {
      const tasks = state.tasksByProject[projectId] || [];
      return {
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: tasks.map((t) =>
            t._id === taskId ? { ...t, ...updates } : t
          )
        }
      };
    }),

  removeTaskForProject: (projectId, taskId) =>
    set((state) => {
      const tasks = state.tasksByProject[projectId] || [];
      return {
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: tasks.filter((t) => t._id !== taskId)
        }
      };
    }),

  setLoadingForProject: (projectId, isLoading) =>
    set((state) => ({
      loadingByProject: {
        ...state.loadingByProject,
        [projectId]: isLoading
      }
    }))
}));

