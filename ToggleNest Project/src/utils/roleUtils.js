// Centralized role and permission helpers for ToggleNest
// Keep this in sync with backend Membership role hierarchy.

const ROLE_HIERARCHY = {
  Viewer: 1,
  Member: 2,
  Contributor: 2,
  SDE: 2,
  Admin: 3
};

// --- Normalization helpers ---

export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return null;
  const trimmed = role.trim();
  if (ROLE_HIERARCHY[trimmed]) return trimmed;
  const lower = trimmed.toLowerCase();
  switch (lower) {
    case 'admin':
    case 'owner':
    case 'manager':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
    case 'contributor':
      return 'Contributor';
    case 'sde':
      return 'SDE';
    default:
      return null;
  }
};

export const getRoleRank = (role) => {
  const normalized = normalizeRole(role);
  if (!normalized) return 0;
  return ROLE_HIERARCHY[normalized] ?? 0;
};

// --- High-level checks ---

export const isAdmin = (role) => getRoleRank(role) >= 3;
export const isMember = (role) => getRoleRank(role) >= 2;
export const isViewer = (role) => getRoleRank(role) >= 1;

// --- Specific permissions used across the app ---

export const canManageMembers = (role) => isAdmin(role);
export const canChangeRoles = (role) => isAdmin(role);
export const canCreateProject = (role) => isAdmin(role);
export const canInviteMembers = (role) => isAdmin(role);

export const canCreateTask = (projectRole, globalRole) => {
  const normalizedGlobal = normalizeRole(globalRole);
  if (normalizedGlobal === 'Viewer') return false;

  const normalizedProject = normalizeRole(projectRole);
  return normalizedProject === 'Admin' || normalizedProject === 'SDE' || normalizedProject === 'Member';
};

export const canEditOrDeleteTask = (role, task, currentUserId) => {
  const r = normalizeRole(role);
  if (r === 'Admin' || r === 'SDE') return true;
  if (r === 'Contributor' && task?.assignee?.toString() === currentUserId?.toString()) return true;
  return false;
};

export const canDragTask = (role) => {
  const r = normalizeRole(role);
  return r === 'Admin' || r === 'SDE';
};

// Chat permissions
export const canSendMessage = (role) => isViewer(role);
export const canCreateChat = (role) => isMember(role);

// Convenience helper to safely extract role from different shapes
export const extractRoleFromMembership = (membership) => {
  if (!membership) return null;
  if (typeof membership === 'string') return normalizeRole(membership);
  if (membership.role) return normalizeRole(membership.role);
  return null;
};

