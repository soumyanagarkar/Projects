import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiCheckCircle, FiClock, FiUsers, FiPlus } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import JoinProjectModal from '../modals/JoinProjectModal';
import { useAuthStore, useProjectStore } from '../stores/useStore';
import { isAdmin, normalizeRole } from '../utils/roleUtils';
import { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_MD, SHADOW_LG } from '../color-constants';

const PRIMARY_YELLOW = '#FFC300';
const ACCENT_RED = '#D00000';
const ACCENT_TEAL = '#008080';
const ACCENT_GREEN = '#4CAF50';
const ACCENT_BLUE = '#2563EB';
const ACCENT_GRAY = '#9CA3AF';
const BACKGROUND_IVORY = '#FAFAF0';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setProjects: updateProjectsStore } = useProjectStore();

  const globalRole = normalizeRole(user?.globalRole || user?.role || 'Viewer');

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    if (!token) return navigate('/login');

    setLoading(true);
    try {
      // Projects are required for dashboard.
      const projectsResp = await fetch('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!projectsResp.ok) throw new Error('Failed to fetch projects');
      const projectsData = await projectsResp.json();

      const safeProjectsData = Array.isArray(projectsData) ? projectsData : [];
      setProjects(safeProjectsData);
      updateProjectsStore(safeProjectsData);

      // Tasks for analytics
      const tasksArrays = await Promise.all(
        safeProjectsData.map(project =>
          fetch(`http://localhost:5000/api/tasks/${project._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        )
      );
      setTasks(tasksArrays.flat().filter(Boolean));

      // Invites are optional; do not fail the dashboard when invite APIs are unavailable.
      try {
        const invitesResp = await fetch('http://localhost:5000/api/projects/invites/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (invitesResp.ok) {
          const invitesData = await invitesResp.json();
          setInvites(Array.isArray(invitesData) ? invitesData : []);
        } else {
          setInvites([]);
        }
      } catch {
        setInvites([]);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setInvites([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Metrics & Analytics ---
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.progress === 100).length;
  const pendingProjects = totalProjects - completedProjects;

  const graphData = React.useMemo(() => {
    const normalizeTaskStatus = (status) =>
      String(status || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

    const now = Date.now();
    const counts = { todo: 0, inprogress: 0, done: 0, overdue: 0 };

    tasks.forEach((task) => {
      const statusKey = normalizeTaskStatus(task?.status);
      if (statusKey === 'todo') counts.todo += 1;
      if (statusKey === 'inprogress') counts.inprogress += 1;
      if (statusKey === 'done') counts.done += 1;

      const due = new Date(task?.dueDate || '');
      if (!Number.isNaN(due.getTime()) && due.getTime() < now && statusKey !== 'done') {
        counts.overdue += 1;
      }
    });

    const rows = [
      { name: 'Todo', value: counts.todo, color: PRIMARY_YELLOW },
      { name: 'In Progress', value: counts.inprogress, color: ACCENT_BLUE },
      { name: 'Done', value: counts.done, color: ACCENT_GREEN },
      { name: 'Overdue', value: counts.overdue, color: ACCENT_RED },
    ];

    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return total > 0 ? rows : [{ name: 'No Tasks', value: 1, color: ACCENT_GRAY }];
  }, [tasks]);

  const uniqueTeamMembersCount = React.useMemo(() => {
    const uniqueIds = new Set();
    projects.forEach(p => {
      (p.members || []).forEach(m => {
        const id = m._id || m;
        if (id) uniqueIds.add(id.toString());
      });
    });
    return uniqueIds.size;
  }, [projects]);

  const handleAcceptInvite = async inviteId => {
    const token = JSON.parse(localStorage.getItem('auth-storage')).state.token;
    try {
      await fetch('http://localhost:5000/api/projects/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteId }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error accepting invite:', err);
    }
  };

  const handleDeclineInvite = async inviteId => {
    const token = JSON.parse(localStorage.getItem('auth-storage')).state.token;
    try {
      await fetch('http://localhost:5000/api/projects/invite/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteId }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error declining invite:', err);
    }
  };

  return (

    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BACKGROUND_IVORY} 0%, #FFFFFF 100%)` }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar onSearchChange={() => { }} />
        <div style={{ padding: '32px 48px', flex: 1, overflowY: 'auto' }}>
          {/* Header */}
          <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: TEXT_PRIMARY, margin: 0, marginBottom: 8 }}>Dashboard</h1>
              <p style={{ fontSize: 16, color: TEXT_SECONDARY, marginTop: 0 }}>
                Welcome back, {user?.name || 'User'}{user?.title ? ` - ${user.title}` : ''}! Here's your project overview.
              </p>
            </div>
            {isAdmin(globalRole) && (
              <button
                onClick={() => navigate('/projects/create')}
                style={{
                  backgroundColor: PRIMARY_YELLOW,
                  color: '#111827',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: SHADOW_MD
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = SHADOW_LG;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = SHADOW_MD;
                }}
              >
                <FiPlus size={18} />
                Create Project
              </button>
            )}
          </header>

          {/* Pending Invitations */}
          {invites.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 20 }}>Pending Invitations</h2>
              <div style={invitesGridStyle}>
                {invites.map(invite => (
                  <InviteCard
                    key={invite._id}
                    invite={invite}
                    onAccept={() => handleAcceptInvite(invite._id)}
                    onDecline={() => handleDeclineInvite(invite._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div style={statsGridStyle}>
            <StatCard icon={<FiBox />} color={ACCENT_TEAL} label="Total Projects" value={totalProjects} />
            <StatCard icon={<FiCheckCircle />} color={ACCENT_GREEN} label="Completed" value={completedProjects} />
            <StatCard icon={<FiClock />} color={PRIMARY_YELLOW} label="In Progress" value={pendingProjects} />
            <StatCard icon={<FiUsers />} color={ACCENT_BLUE} label="Team Members" value={uniqueTeamMembersCount} />
          </div>

          {/* Analytics Graph */}
          <div style={{ marginTop: 24, marginBottom: 40 }}>
            <ChartCard title="Task Overview">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: TEXT_SECONDARY }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TEXT_SECONDARY }} />
                    <Tooltip
                      formatter={(value) => [`${value} tasks`, 'Count']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {graphData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Projects Section */}
          <div style={{ marginTop: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>Your Projects</h2>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: TEXT_SECONDARY }}>Loading projects...</div>
            ) : projects.length === 0 ? (
              <div style={{
                padding: 60,
                textAlign: 'center',
                color: TEXT_SECONDARY,
                backgroundColor: 'white',
                borderRadius: 14,
                border: `1px solid ${BORDER_COLOR}`,
                boxShadow: SHADOW_MD
              }}>
                <h3 style={{ color: TEXT_PRIMARY, marginBottom: 8 }}>No projects yet</h3>
                <p>Create your first project to get started.</p>
              </div>
            ) : (
              <div style={projectGridStyle}>
                {projects.slice(0, 12).map(project => {
                  const projectTasks = tasks.filter(t => t.projectId === project._id);
                  return <ProjectCard key={project._id} project={project} tasks={projectTasks} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showJoinModal && <JoinProjectModal onClose={() => setShowJoinModal(false)} refresh={fetchDashboardData} />}
    </div>
  );
};

// --- Sub Components ---
const StatCard = ({ icon, color, label, value }) => (
  <div style={{
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    boxShadow: SHADOW_MD,
    border: `1px solid ${BORDER_COLOR}`,
    transition: 'all 0.3s ease'
  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      color: color
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: TEXT_SECONDARY, fontSize: 12, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</p>
      <h3 style={{ fontSize: 28, fontWeight: 800, color: TEXT_PRIMARY, margin: 0, marginTop: 4 }}>{value}</h3>
    </div>
  </div>
);

const InviteCard = ({ invite, onAccept, onDecline }) => (
  <div style={{
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: SHADOW_MD,
    border: `1px solid ${BORDER_COLOR}`,
    transition: 'all 0.3s ease'
  }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = SHADOW_LG} onMouseLeave={(e) => e.currentTarget.style.boxShadow = SHADOW_MD}>
    <div>
      <h4 style={{ margin: 0, marginBottom: 6, fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY }}>
        {invite.projectId?.name || 'Unknown Project'}
      </h4>
      <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>
        Invited by {invite.senderId?.name || 'Unknown'}
      </p>
    </div>
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={onAccept} style={{
        padding: '10px 18px',
        backgroundColor: ACCENT_GREEN,
        color: 'white',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        transition: 'all 0.2s ease'
      }} onMouseEnter={(e) => e.target.style.opacity = '0.85'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Accept</button>
      <button onClick={onDecline} style={{
        padding: '10px 18px',
        backgroundColor: ACCENT_RED,
        color: 'white',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        transition: 'all 0.2s ease'
      }} onMouseEnter={(e) => e.target.style.opacity = '0.85'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Decline</button>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={{
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 14,
    boxShadow: SHADOW_MD,
    border: `1px solid ${BORDER_COLOR}`
  }}>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, margin: 0, marginBottom: 16 }}>{title}</h3>
    {children}
  </div>
);

// --- Styles ---
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 40 };
const projectGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 };
const invitesGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 };
export default Dashboard;
