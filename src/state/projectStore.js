import { create } from 'zustand';

export const useProjectState = create((set, get) => ({
  projects: [],
  currentProject: null,
  pinnedProjectIds: [],
  currentMembershipRole: null,

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project]
    })),

  setCurrentProject: (project) =>
    set({
      currentProject: project
    }),

  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === projectId ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?._id === projectId
          ? { ...state.currentProject, ...updates }
          : state.currentProject
    })),

  setPinnedProjects: (ids) => set({ pinnedProjectIds: ids }),

  togglePinnedProject: (projectId) =>
    set((state) => {
      const exists = state.pinnedProjectIds.includes(projectId);
      return {
        pinnedProjectIds: exists
          ? state.pinnedProjectIds.filter((id) => id !== projectId)
          : [...state.pinnedProjectIds, projectId]
      };
    }),

  setCurrentMembershipRole: (role) => set({ currentMembershipRole: role })
}));

