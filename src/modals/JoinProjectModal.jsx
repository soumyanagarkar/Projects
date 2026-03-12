import React, { useState } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useProjectStore } from '../stores/useStore';
import { useSocket } from '../hooks/useSocket';

const JoinProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, token } = useAuthStore();
  const { addProject } = useProjectStore();
  const socket = useSocket();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem('auth-storage'));
    const token = authData?.state?.token;

    try {
      const response = await fetch('http://localhost:5000/api/projects/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectCode: joinCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join project');
      }

      // Update store
      if (data.project) {
        addProject(data.project);
      }

      // Emit socket event
      if (socket) {
        socket.emit('joinByCode', { projectId: data.project?._id, userId: user?.id });
      }

      // Reset form
      setJoinCode('');
      
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 1001
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
                Join Project
              </h2>
              <button
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  color: '#6B7280'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    padding: 12,
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    borderRadius: 8,
                    marginBottom: 20,
                    fontSize: 14
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Project Join Code *
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter project code (e.g., ABC123)"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                  Ask your project manager for the join code
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !joinCode.trim()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundImage: joinCode.trim() && !loading
                      ? 'linear-gradient(135deg, #0EA5E9, #22C55E)'
                      : '#D1D5DB',
                    color: 'white',
                    cursor: joinCode.trim() && !loading ? 'pointer' : 'not-allowed',
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Joining...' : 'Join Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JoinProjectModal;
