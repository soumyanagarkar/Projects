import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLink, FiX } from 'react-icons/fi';
import TopBar from '../components/TopBar';
import { useAuthStore, useProjectStore } from '../stores/useStore';
import { useSocket } from '../hooks/useSocket';
import { canCreateProject, normalizeRole } from '../utils/roleUtils';
import { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_LG } from '../color-constants';

const PRIMARY_YELLOW = '#FFC300';
const ACCENT_RED = '#D00000';
const ACCENT_TEAL = '#008080';
const BACKGROUND_IVORY = '#FAFAF0';
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #FFC300 0%, #4CAF50 100%)';
const SECONDARY_GRADIENT = 'linear-gradient(135deg, #008080 0%, #2563EB 100%)';

const CreateProjectPage = () => {
  const { user } = useAuthStore();
  const { addProject } = useProjectStore();
  const socket = useSocket();
  const navigate = useNavigate();

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
  const [tagInput, setTagInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const globalRole = normalizeRole(user?.globalRole || user?.role || 'Viewer');
  const canCreate = canCreateProject(globalRole);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Project name is required');
    if (!canCreate) return setError('Insufficient permissions');
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage')) || {};
      const token = authData?.state?.token || localStorage.getItem('token');
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

      const files = Array.isArray(formData.attachments) ? formData.attachments : [];
      files.forEach((file) => multipart.append('attachments', file));

      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: multipart
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create project');

      addProject(data);
      if (socket) socket.emit('projectCreate', { projectId: data._id, userId: user?.id });

      navigate(`/project/${data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar onQuickCreate={() => navigate('/projects/create')} onSearchChange={() => {}} />
      <div style={{ flex: 1, padding: '48px 24px', background: `linear-gradient(135deg, ${BACKGROUND_IVORY} 0%, #FFFFFF 100%)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: TEXT_PRIMARY, margin: 0, marginBottom: 8 }}>Create New Project</h1>
            <p style={{ fontSize: 16, color: TEXT_SECONDARY, margin: 0 }}>Set up your project with all the details you need to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: 16,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: ACCENT_RED,
              borderRadius: 12,
              marginBottom: 24,
              border: `1px solid ${ACCENT_RED}20`,
              fontSize: 14,
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: 32,
            borderRadius: 16,
            boxShadow: SHADOW_LG,
            border: `1px solid ${BORDER_COLOR}`
          }}>
            {/* Project Name */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 10
              }}>
                Project Name <span style={{ color: ACCENT_RED }}>*</span>
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `2px solid ${BORDER_COLOR}`,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = ACCENT_TEAL}
                onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 10
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Describe your project, its goals, and scope..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `2px solid ${BORDER_COLOR}`,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = ACCENT_TEAL}
                onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
              />
            </div>

            {/* Related Links */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 10
              }}>
                Related Links
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), linkInput.trim() && (setFormData({ ...formData, relatedLinks: [...formData.relatedLinks, linkInput.trim()] }), setLinkInput('')))}
                  placeholder="https://example.com/spec"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${BORDER_COLOR}`,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ACCENT_TEAL}
                  onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!linkInput.trim()) return;
                    setFormData({ ...formData, relatedLinks: [...formData.relatedLinks, linkInput.trim()] });
                    setLinkInput('');
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: SECONDARY_GRADIENT,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0, 128, 128, 0.25)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Add
                </button>
              </div>
              {formData.relatedLinks.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.relatedLinks.map((link, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'rgba(0, 128, 128, 0.08)',
                        border: '1px solid rgba(0, 128, 128, 0.2)',
                        borderRadius: 8,
                        fontSize: 13
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TEXT_PRIMARY }}>{link}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(fd => ({ ...fd, relatedLinks: fd.relatedLinks.filter((_, i) => i !== idx) }))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: ACCENT_RED,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 10
              }}>
                Attachments
              </label>
              <div style={{
                padding: '20px 16px',
                borderRadius: 10,
                border: `2px dashed ${BORDER_COLOR}`,
                background: 'rgba(255, 195, 0, 0.08)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setFormData(fd => ({ ...fd, attachments: [...(fd.attachments || []), ...files] }));
                  }}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    opacity: 0,
                    position: 'absolute'
                  }}
                />
                <p style={{ margin: 0, color: TEXT_SECONDARY, fontSize: 13, fontWeight: 500 }}>Click to select files or drag and drop</p>
              </div>
              {formData.attachments && formData.attachments.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'rgba(76, 175, 80, 0.08)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: 8,
                        fontSize: 13
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TEXT_PRIMARY }}>{attachment?.name || `File ${idx + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(fd => ({ ...fd, attachments: fd.attachments.filter((_, i) => i !== idx) }))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: ACCENT_RED,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Members */}
            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 10
              }}>
                Team Members
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), memberInput.trim() && setFormData({ ...formData, members: [...formData.members, memberInput.trim().toLowerCase()] }), setMemberInput(''))}
                  placeholder="member@example.com"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${BORDER_COLOR}`,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ACCENT_TEAL}
                  onBlur={(e) => e.target.style.borderColor = BORDER_COLOR}
                />
                <button
                  type="button"
                  onClick={() => {
                    const em = memberInput.trim().toLowerCase();
                    if (!em) return;
                    if (!formData.members.includes(em)) setFormData({ ...formData, members: [...formData.members, em] });
                    setMemberInput('');
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: SECONDARY_GRADIENT,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0, 128, 128, 0.25)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Add
                </button>
              </div>
              {formData.members.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {formData.members.map((member, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        background: 'rgba(255, 195, 0, 0.18)',
                        border: '1px solid rgba(255, 195, 0, 0.35)',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        color: TEXT_PRIMARY
                      }}
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => setFormData(fd => ({ ...fd, members: fd.members.filter((_, i) => i !== idx) }))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: TEXT_SECONDARY,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 24, borderTop: `1px solid ${BORDER_COLOR}` }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: `1.5px solid ${BORDER_COLOR}`,
                  background: 'white',
                  color: TEXT_PRIMARY,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = TEXT_SECONDARY;
                  e.target.style.background = `${TEXT_PRIMARY}05`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = BORDER_COLOR;
                  e.target.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: 'none',
                  background: loading ? '#D1D5DB' : PRIMARY_GRADIENT,
                  color: loading ? 'white' : '#111827',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(255, 195, 0, 0.35)',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 20px rgba(255, 195, 0, 0.45)')}
                onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 15px rgba(255, 195, 0, 0.35)')}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
