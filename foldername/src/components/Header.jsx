import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { FiBell } from 'react-icons/fi';
import logo from '../logo.png';

const Header = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header style={headerWrapperStyle}>
            <div>
                <img
                    src={logo}
                    alt="ToggleNest Logo"
                    style={{ height: 60, width: 'auto', marginLeft: 15, marginTop: 12 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Search Bar */}
                {/* search removed */}

                {/* Notification Bell */}
                <div
                    style={{
                        position: 'relative',
                        cursor: 'pointer',
                        marginRight: '40px',
                        marginTop: '12px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                >
                    <FiBell size={20} color="#64748B" />
                    {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}

                    {showDropdown && (
                        <div style={dropdownStyle}>
                            <div style={dropdownHeader}>Notifications</div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '15px', color: '#64748B' }}>No new alerts</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n._id} onClick={() => markAsRead(n._id)} style={notificationItemStyle(n.isRead)}>
                                        <strong>{n.title}</strong>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* create button removed */}
            </div>
        </header>
    );
};

// Styles (Condensed for brevity)
const headerWrapperStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const badgeStyle = { position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' };
const dropdownStyle = { position: 'absolute', top: '40px', right: 0, width: '300px', background: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 100, border: '1px solid #E2E8F0' };
const dropdownHeader = { padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #E2E8F0' };
const notificationItemStyle = (isRead) => ({ padding: '12px', borderBottom: '1px solid #F1F5F9', backgroundColor: isRead ? 'white' : '#F0FDFA', cursor: 'pointer' });

export default Header;
