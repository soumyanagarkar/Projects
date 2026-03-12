import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiUserPlus, FiCheck } from 'react-icons/fi';
import { ACCENT_CYAN, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_ELEVATED, GRADIENT_CYAN, DANGER_COLOR } from '../color-constants';
import { useAuthStore } from '../stores/useStore';

const AddMemberModal = ({ isOpen, onClose, projectId, onAddSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addedUsers, setAddedUsers] = useState([]);

    if (!isOpen) return null;

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;

        try {
            const response = await fetch(`http://localhost:5000/api/members/search/users?query=${query}&projectId=${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error searching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId) => {
        const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;

        try {
            await fetch('http://localhost:5000/api/members/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ projectId, userId, role: 'Contributor' })
            });

            setAddedUsers(prev => [...prev, userId]);
            if (onAddSuccess) onAddSuccess();

            // Remove from search results after short delay
            setTimeout(() => {
                setSearchResults(prev => prev.filter(u => u._id !== userId));
            }, 1000);

        } catch (err) {
            console.error('Error adding member:', err);
        }
    };

    return (
        <AnimatePresence>
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
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 24,
                        width: '100%',
                        maxWidth: 500,
                        boxShadow: SHADOW_ELEVATED,
                        border: `1px solid ${BORDER_COLOR}`
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>Add Members</h2>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT_SECONDARY }}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div style={{ position: 'relative', marginBottom: 20 }}>
                        <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: TEXT_SECONDARY }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: 8,
                                border: `1px solid ${BORDER_COLOR}`,
                                fontSize: 14,
                                fontFamily: 'inherit'
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ maxHeight: 300, overflowY: 'auto', minHeight: 100 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: TEXT_SECONDARY, padding: 20 }}>Searching...</div>
                        ) : searchResults.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {searchResults.map(user => {
                                    const isAdded = addedUsers.includes(user._id);
                                    return (
                                        <div key={user._id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 12px',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: 8,
                                            border: `1px solid ${BORDER_COLOR}`
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: TEXT_PRIMARY, fontSize: 14 }}>{user.name}</div>
                                                <div style={{ fontSize: 12, color: TEXT_SECONDARY }}>{user.email}</div>
                                            </div>
                                            <button
                                                onClick={() => handleAddMember(user._id)}
                                                disabled={isAdded}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    border: 'none',
                                                    background: isAdded ? '#10B981' : GRADIENT_CYAN,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    cursor: isAdded ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}
                                            >
                                                {isAdded ? <><FiCheck /> Added</> : <><FiUserPlus /> Add</>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : searchQuery.length >= 2 ? (
                            <div style={{ textAlign: 'center', color: TEXT_SECONDARY, padding: 20 }}>No users found.</div>
                        ) : (
                            <div style={{ textAlign: 'center', color: TEXT_SECONDARY, padding: 20, fontSize: 13 }}>
                                Type at least 2 characters to search.
                            </div>
                        )}
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddMemberModal;
