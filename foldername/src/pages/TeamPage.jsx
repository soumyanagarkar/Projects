import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiLoader } from 'react-icons/fi';

const DARK_NAVY = '#1E293B';
const BACKGROUND_IVORY = '#F9FAFB';
const ACCENT_TEAL = '#2DD4BF';

const TeamPage = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig] = useState({ key: 'name', direction: 'ascending' });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/users", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await response.json();

                if (response.ok) {
                    setTeam(Array.isArray(data) ? data : []);
                } else {
                    console.error("Server error:", data.message);
                    setTeam([]); // Fallback to empty array
                }
            } catch (error) {
                console.error("Network error fetching team:", error);
                setTeam([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    // --- Dynamic Filtering with Safety ---
    const filteredTeam = (Array.isArray(team) ? team : []).filter(member => {
        const name = String(member.name || "").toLowerCase();
        const email = String(member.email || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    // --- Sorting with Safety ---
    const sortedTeam = [...filteredTeam].sort((a, b) => {
        const key = sortConfig.key;
        const valA = String(a[key] || "").toLowerCase();
        const valB = String(b[key] || "").toLowerCase();
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    if (loading) return (
        <div style={fullPageCenter}>
            <FiLoader className="spin-animation" size={40} color={ACCENT_TEAL} />
            <p style={{ marginTop: '10px', color: DARK_NAVY, fontWeight: 600 }}>Loading Team...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BACKGROUND_IVORY }}>
            <div style={{ padding: '30px 50px' }}>
                <header style={headerStyle}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: DARK_NAVY, margin: 0 }}>
                        <FiUsers size={28} style={{ marginRight: '15px', color: ACCENT_TEAL, verticalAlign: 'middle' }} />
                        Team Members ({sortedTeam.length})
                    </h1>
                </header>

                {/* Search removed */}

                <div style={tableCardStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Role</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeam.map((member) => (
                                <tr key={member._id} style={tableRowStyle}>
                                    <td style={{ padding: '15px', fontWeight: 600, color: DARK_NAVY }}>
                                        {String(member.name || "Unknown User")}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={roleBadgeStyle}>
                                            {typeof member.role === 'object' && member.role !== null
                                                ? String(member.role.name || "Member")
                                                : String(member.role || 'Member')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <a href={`mailto:${member.email}`} style={emailLinkStyle}>
                                            <FiMail style={{ marginRight: '8px' }} /> {String(member.email || "No Email")}
                                        </a>
                                    </td>
                                    <td style={idColumnStyle}>
                                        {String(member._id)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {sortedTeam.length === 0 && (
                        <div style={emptyStateStyle}>
                            No team members found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Styles ---

const fullPageCenter = { display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND_IVORY };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const searchContainerStyle = { position: 'relative', width: '400px', marginBottom: '25px' };
const searchIconStyle = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' };
const searchInputStyle = { padding: '12px 15px 12px 45px', border: '1px solid #E2E8F0', borderRadius: '12px', width: '100%', outline: 'none', transition: '0.2s focus', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const tableCardStyle = { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #F1F5F9' };
const tableHeaderRowStyle = { backgroundColor: '#F8FAFC', borderBottom: '2px solid #F1F5F9' };
const thStyle = { padding: '18px 15px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableRowStyle = { borderBottom: '1px solid #F8FAFC', transition: '0.2s' };
const roleBadgeStyle = { backgroundColor: '#F1F5F9', color: '#475569', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 };
const emailLinkStyle = { color: ACCENT_TEAL, textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 500 };
const idColumnStyle = { padding: '15px', fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' };
const emptyStateStyle = { padding: '40px', textAlign: 'center', color: '#64748B', fontWeight: 500 };

export default TeamPage;