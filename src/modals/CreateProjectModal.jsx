import React, { useState } from 'react';
import { FiX, FiLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useProjectStore } from '../stores/useStore';
import { useSocket } from '../hooks/useSocket';
import { canCreateProject, normalizeRole } from '../utils/roleUtils';
import { GRADIENT_CYAN, ACCENT_CYAN, DANGER_COLOR, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_ELEVATED } from '../color-constants';

const CreateProjectModal = ({ isOpen, onClose, onSuccess, refresh }) => {
  const { user, token } = useAuthStore();
  const { addProject } = useProjectStore();
  const socket = useSocket();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gitLink: '',
    tags: [],
    relatedLinks: [],
    attachments: [],
    members: [],
    projectKey: '',
    projectType: 'software',
    visibility: 'private',
    leadEmail: ''
  });
  const [memberInput, setMemberInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [descPreview, setDescPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const globalRole = normalizeRole(user?.globalRole || user?.role || 'Viewer');
  const canCreate = canCreateProject(globalRole);

  if (typeof isOpen !== 'undefined' && !isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem('auth-storage')) || {};
    const token = authData?.state?.token || localStorage.getItem('token');
    
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const multipart = new FormData();
      multipart.append('name', formData.name);
      multipart.append('description', formData.description || '');
      if (formData.gitLink) multipart.append('gitLink', formData.gitLink);
      multipart.append('relatedLinks', JSON.stringify(formData.relatedLinks || []));
      multipart.append('members', JSON.stringify(formData.members || []));
      if (formData.projectKey) multipart.append('projectKey', formData.projectKey);
      multipart.append('projectType', formData.projectType || 'software');
      multipart.append('visibility', formData.visibility || 'private');
      if (formData.leadEmail) multipart.append('defaultAssignee', formData.leadEmail);

      (Array.isArray(formData.attachments) ? formData.attachments : [])
        .filter((item) => item instanceof File)
        .forEach((file) => multipart.append('attachments', file));

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: multipart
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      // Update store
      addProject(data);

      // Emit socket event
      if (socket) {
        socket.emit('projectCreate', { projectId: data._id, userId: user?.id });
      }

      // Reset form
      setFormData({ name: '', description: '', gitLink: '', tags: [], relatedLinks: [], attachments: [], members: [], projectKey: '', projectType: 'software', visibility: 'private', leadEmail: '' });
      setMemberInput('');
      setLinkInput('');
      setTagInput('');
      
      if (onSuccess) onSuccess(data);
      if (typeof refresh === 'function') refresh();
      onClose();

      // Navigate to project workspace
      if (data && data._id) {
        setTimeout(() => {
          window.location.href = `/project/${data._id}`;
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
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
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
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
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: SHADOW_ELEVATED,
              zIndex: 1001,
              border: `1px solid ${BORDER_COLOR}`
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: TEXT_PRIMARY, margin: 0 }}>Create Project</h2>
                <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: '6px 0 0 0' }}>Set up a new project quickly</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  color: TEXT_SECONDARY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiX size={22} />
              </motion.button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 16,
                  backgroundColor: `rgba(239, 68, 68, 0.1)`,
                  color: DANGER_COLOR,
                  borderRadius: 12,
                  marginBottom: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  border: `1px solid ${DANGER_COLOR}20`
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Project Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>
                  Project Name <span style={{ color: DANGER_COLOR }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Website Redesign"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `2px solid ${BORDER_COLOR}`,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ACCENT_CYAN}
                  onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `2px solid ${BORDER_COLOR}`,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ACCENT_CYAN}
                  onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                />
              </div>

              {/* Related Links */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>Related Links</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), linkInput.trim() && (setFormData({ ...formData, relatedLinks: [...formData.relatedLinks, linkInput.trim()] }), setLinkInput('')))}
                    placeholder="https://example.com"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `2px solid ${BORDER_COLOR}`,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = ACCENT_CYAN}
                    onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (!linkInput.trim()) return;
                      setFormData({ ...formData, relatedLinks: [...formData.relatedLinks, linkInput.trim()] });
                      setLinkInput('');
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: GRADIENT_CYAN,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Add
                  </motion.button>
                </div>
                {formData.relatedLinks.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.relatedLinks.map((link, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: `${ACCENT_CYAN}08`,
                        border: `1px solid ${ACCENT_CYAN}20`,
                        borderRadius: 8,
                        fontSize: 12
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TEXT_PRIMARY }}>{link}</span>
                        <button type="button" onClick={() => setFormData(fd => ({ ...fd, relatedLinks: fd.relatedLinks.filter((_, i) => i !== idx) }))} style={{ border: 'none', background: 'transparent', color: DANGER_COLOR, cursor: 'pointer', padding: 4 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>Team Members</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="email"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), memberInput.trim() && (setFormData({ ...formData, members: [...formData.members, memberInput.trim().toLowerCase()] }), setMemberInput('')))}
                    placeholder="member@example.com"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `2px solid ${BORDER_COLOR}`,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = ACCENT_CYAN}
                    onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      const em = memberInput.trim().toLowerCase();
                      if (!em || formData.members.includes(em)) return;
                      setFormData({ ...formData, members: [...formData.members, em] });
                      setMemberInput('');
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: GRADIENT_CYAN,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Add
                  </motion.button>
                </div>
                {formData.members.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {formData.members.map((member, idx) => (
                      <div key={idx} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: `${ACCENT_CYAN}15`,
                        border: `1px solid ${ACCENT_CYAN}30`,
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        color: TEXT_PRIMARY
                      }}>
                        {member}
                        <button type="button" onClick={() => setFormData(fd => ({ ...fd, members: fd.members.filter((_, i) => i !== idx) }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: TEXT_SECONDARY }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER_COLOR}` }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: `1.5px solid ${BORDER_COLOR}`,
                    backgroundColor: 'white',
                    color: TEXT_PRIMARY,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10,
                    border: 'none',
                    background: loading ? '#D1D5DB' : GRADIENT_CYAN,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </motion.button>
