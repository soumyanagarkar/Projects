import React from 'react';
import { FiHash } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { isAdmin, normalizeRole } from '../utils/roleUtils';
import { useAuthStore } from '../stores/useStore';

const QuickActionsPanel = ({ onCreateProject, onJoinProject }) => {
  const { user } = useAuthStore();
  const globalRole = normalizeRole(user?.globalRole || user?.role || 'Viewer');
  const canCreate = isAdmin(globalRole);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}
    >
      {canCreate && (
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateProject}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 12,
            border: '2px dashed #D1D5DB',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0EA5E9';
            e.currentTarget.style.backgroundColor = '#F0F9FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4338CA',
              fontWeight: 700
            }}
          >
            +
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              Create Project
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              Start a new project
            </div>
          </div>
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onJoinProject}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          border: '2px dashed #D1D5DB',
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#22C55E';
          e.currentTarget.style.backgroundColor = '#F0FDF4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB';
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}
        >
          <FiHash size={24} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
            Join Project
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Enter a project code
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export default QuickActionsPanel;
