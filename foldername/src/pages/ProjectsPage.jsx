import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiChevronUp, FiChevronDown, FiLoader, FiX, FiTrash2 } from 'react-icons/fi';
import { isAdmin, normalizeRole } from '../utils/roleUtils';
import { useAuthStore } from '../stores/useStore';

// --- Constants ---
const DARK_NAVY = '#1E293B';
const BACKGROUND_IVORY = '#F9FAFB';
const ACCENT_TEAL = '#2DD4BF';
const ACCENT_RED = '#EF4444';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const { user } = useAuthStore();
    const globalRole = normalizeRole(user?.globalRole || user?.role || 'Viewer');

    // Form/Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        manager: '',
        deadline: '',
        status: 'Planning',
        priority: 'Medium',
        progress: 0,
        files: [],
        relatedLinks: ''
    });

    // --- 1. Fetch Data ---
    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        setLoading(true); // Start loading
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/projects", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false); // Stop loading no matter what
        }
    };
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) { console.error(err); }
    };

    // --- 2. Create Project (Save to DB) ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append('name', newProject.name);
        formData.append('manager', newProject.manager);
        formData.append('deadline', newProject.deadline);
        formData.append('status', 'Planning');
        formData.append('priority', newProject.priority);
        formData.append('progress', Number(newProject.progress));

        // Process related links
        const linksArray = newProject.relatedLinks
            ? newProject.relatedLinks.split(',').map(l => l.trim()).filter(Boolean)
            : [];
        if (linksArray.length > 0) {
            formData.append('relatedLinks', JSON.stringify(linksArray));
        }

        if (newProject.files && newProject.files.length > 0) {
            for (let i = 0; i < newProject.files.length; i++) {
                formData.append('attachments', newProject.files[i]);
            }
        }

        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create project");
            }

            await fetchProjects();

            setIsModalOpen(false);
            setNewProject({ name: '', manager: '', deadline: '', status: 'Planning', priority: 'Medium', progress: 0, files: [], relatedLinks: '' });

        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // --- 3. Delete Project ---
    const handleDeleteProject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            const token = localStorage.getItem("token"); // Get the token

            const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Add this line
                }
            });

            if (response.ok) {
                setProjects(projects.filter(p => p._id !== id));
            } else {
                alert("Failed to delete project. Check permissions.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // --- 4. Filter & Sort Logic ---
    const filteredProjects = projects.filter(p => {
        const projectName = typeof p.name === 'object'
            ? (p.name?.name || "")
            : (p.name || "");

        const managerName = typeof p.manager === 'object'
            ? (p.manager?.name || "")
            : (p.manager || "");

        return projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            managerName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === 'object' && valA !== null) valA = valA.name || "";
        if (typeof valB === 'object' && valB !== null) valB = valB.name || "";

        const strA = String(valA || "").toLowerCase();
        const strB = String(valB || "").toLowerCase();

        if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BACKGROUND_IVORY }}>
            <div style={{ padding: '30px 50px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', color: DARK_NAVY, fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                        <FiGrid style={{ color: ACCENT_TEAL, marginRight: '15px' }} />
                        Projects ({sortedProjects.length})
                    </h1>
                    {/* New Project button removed */}
                </header>

                {/* Search removed */}

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}><FiLoader size={40} className="spin-animation" /></div>
                ) : (
                    <div style={tableContainerStyle}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#F8FAFC' }}>
                                <tr>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Manager</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Priority</th>
                                    <th style={thStyle}>Progress</th>
                                    <th style={thStyle}>Deadline</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map(p => (
                                    <tr key={p._id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <td style={tdStyle}>
                                            <Link to={`/project/${p._id}`} style={{ color: ACCENT_TEAL, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ padding: '6px 8px', background: '#F3F4F6', borderRadius: 6, fontWeight: 800, color: '#111827', fontSize: '0.85rem' }}>{p.projectKey || p.projectCode || '—'}</span>
                                                <span>{typeof p.name === 'object' ? p.name?.name : p.name}</span>
                                            </Link>
                                        </td>
                                        <td style={tdStyle}>
                                            {p.manager && typeof p.manager === 'object'
                                                ? p.manager.name
                                                : (p.manager || "Unassigned")}
                                        </td>                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle}>{p.status}</span>
                                        </td>
                                        <td style={{ ...tdStyle, color: p.priority === 'High' ? ACCENT_RED : DARK_NAVY, fontWeight: 600 }}>{p.priority}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={progressBarContainer}>
                                                    <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: p.progress === 100 ? '#10B981' : ACCENT_TEAL }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem' }}>{p.progress}%</span>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, color: '#64748B' }}>{p.deadline}</td>
                                        <td style={tdStyle}>
                                            {isAdmin(globalRole) && (
                                                <button
                                                    onClick={() => handleDeleteProject(p._id)}
                                                    style={deleteBtnStyle}
                                                    title="Delete Project"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- ADD PROJECT MODAL --- */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <FiX onClick={() => setIsModalOpen(false)} style={closeIconStyle} />
                        <h2 style={{ marginBottom: '20px', color: DARK_NAVY }}>Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <label style={labelStyle}>Project Name</label>
                            <input required style={inputStyle} value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />

                            <label style={labelStyle}>Project Manager</label>
                            <select
                                required
                                style={inputStyle}
                                value={newProject.manager}
                                onChange={e => setNewProject({ ...newProject, manager: e.target.value })}
                            >
                                <option value="">Select Manager</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}> {/* VALUE MUST BE _ID */}
                                        {user.name}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Priority</label>
                                    <select style={inputStyle} value={newProject.priority} onChange={e => setNewProject({ ...newProject, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Initial Progress (%)</label>
                                    <input type="number" min="0" max="100" style={inputStyle} value={newProject.progress} onChange={e => setNewProject({ ...newProject, progress: e.target.value })} />
                                </div>
                            </div>

                            <label style={labelStyle}>Deadline</label>
                            <input type="date" required style={inputStyle} value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} />

                            <label style={labelStyle}>Related Links (comma separated URLs)</label>
                            <input placeholder="e.g. github.com, drive.google.com" style={inputStyle} value={newProject.relatedLinks} onChange={e => setNewProject({ ...newProject, relatedLinks: e.target.value })} />

                            <label style={labelStyle}>Attachments</label>
                            <input
                                type="file"
                                multiple
                                style={inputStyle}
                                onChange={e => setNewProject({ ...newProject, files: e.target.files })}
                            />

                            <button type="submit" style={saveButtonStyle}>Create Project</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '15px', fontSize: '0.95rem', color: '#1E293B' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '16px', width: '450px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const closeIconStyle = { position: 'absolute', right: '25px', top: '25px', cursor: 'pointer', color: '#64748B', fontSize: '24px' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.95rem', boxSizing: 'border-box' };
const saveButtonStyle = { width: '100%', padding: '14px', backgroundColor: ACCENT_TEAL, color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' };
const newProjectBtnStyle = { padding: '10px 20px', backgroundColor: ACCENT_TEAL, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600 };
const searchBarStyle = { padding: '12px', width: '350px', marginBottom: '25px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const tableContainerStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' };
const statusBadgeStyle = { backgroundColor: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 };
const progressBarContainer = { width: '70px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' };
const deleteBtnStyle = { border: 'none', background: 'none', color: ACCENT_RED, cursor: 'pointer', padding: '5px' };

export default ProjectsPage;