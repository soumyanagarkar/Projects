import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useProjectStore, useAuthStore } from '../stores/useStore';
import { isAdmin, normalizeRole } from '../utils/roleUtils';
import { ACCENT_CYAN, ACCENT_EMERALD, WARNING_COLOR, DANGER_COLOR, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_MD, SHADOW_LG, SHADOW_XL, SHADOW_SM } from '../color-constants';

const ProjectCard = ({ project, tasks = [] }) => {
  const { pinnedProjectIds, togglePinnedProject } = useProjectStore();
  const { user } = useAuthStore();

  if (!project) return null;

  const isPinned = pinnedProjectIds.includes(project._id);
  const role = normalizeRole(project.membershipRole || user?.globalRole || user?.role || 'Viewer');
  const canManage = isAdmin(role);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progress || 0;

  // Simple health heuristic
  let healthColor = '#10B981';
  let healthLabel = 'Healthy';
  if (progress < 30) {
    healthColor = '#EF4444';
    healthLabel = 'At Risk';
  } else if (progress < 70) {
    healthColor = '#F59E0B';
    healthLabel = 'Behind';
  }

  const memberCount = project.members?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: SHADOW_XL }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'relative',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 14,
        border: `1px solid ${BORDER_COLOR}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 200,
        boxShadow: SHADOW_MD,
        transition: 'all 0.3s ease'
      }}
    >




      {/* Title & Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3 }}>
            {project.name || 'Untitled Project'}
          </h3>
          <p style={{ marginTop: 6, fontSize: 13, color: TEXT_SECONDARY, maxHeight: 45, overflow: 'hidden', lineHeight: 1.4 }}>
            {project.description || 'No description added yet.'}
          </p>
        </div>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: `${healthColor}20`,
            color: healthColor,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: `1px solid ${healthColor}40`
          }}
        >
          {healthLabel}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TEXT_SECONDARY, marginBottom: 6, fontWeight: 600 }}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: BORDER_COLOR,
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${ACCENT_EMERALD}, ${ACCENT_CYAN})`,
              borderRadius: 999
            }}
          />
        </div>
      </div>

      {/* Footer: Members & Action */}
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: `1px solid ${BORDER_COLOR}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', marginRight: 4 }}>
            {(project.members || []).slice(0, 3).map((m, idx) => (
              <div
                key={m._id || idx}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: ACCENT_CYAN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'white',
                  marginLeft: idx === 0 ? 0 : -8,
                  border: '2px solid white',
                  boxShadow: SHADOW_SM
                }}
                title={m.name || 'Member'}
              >
                {(m.name || 'M').charAt(0).toUpperCase()}
              </div>
            ))}
            {memberCount > 3 && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: TEXT_SECONDARY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'white',
                  marginLeft: -8,
                  border: '2px solid white'
                }}
                title={`${memberCount - 3} more`}
              >
                +{memberCount - 3}
              </div>
            )}
          </div>
          <span style={{ color: TEXT_SECONDARY, fontSize: 12, fontWeight: 500 }}>
            {memberCount} member{memberCount === 1 ? '' : 's'}
          </span>
        </div>

        <Link
          to={`/project/${project._id}`}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: ACCENT_CYAN,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${ACCENT_CYAN}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Open
          <FiArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard;