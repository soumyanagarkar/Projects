import React, { useState } from 'react';
import { FiBell, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useNotificationStore } from '../stores/useStore';
import { isAdmin, isMember, normalizeRole } from '../utils/roleUtils';
import logo from '../logo.png';

const TopBar = ({ onQuickCreate, onSearchChange }) => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Check multiple possible locations for role, including nested user object and localStorage
  const rawRole = user?.globalRole || user?.role || user?.user?.globalRole || user?.user?.role || localStorage.getItem('userRole');
  const globalRole = normalizeRole(rawRole);
  // Only Admin can quick create (create project)
  const canQuickCreate = isAdmin(globalRole);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (onSearchChange) onSearchChange(value);
  };

  return (
    <div
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="ToggleNest Logo" style={{ height: 56, width: 'auto' }} />
      </div>

      {/* Right side: notifications, quick create, user avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={async () => {
              const newShow = !showNotifs;
              setShowNotifs(newShow);

              if (newShow && unreadCount > 0) {
                markAllAsRead();
                const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
                try {
                  await fetch(`http://localhost:5000/api/notifications/read-all`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                } catch (err) {
                  console.error('Error marking all as read on open:', err);
                }
              }
            }}
            style={{
              position: 'relative',
              border: 'none',
              background: '#F1F5F9',
              cursor: 'pointer',
              padding: 0,
              marginRight: '16px',
              marginTop: '4px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
          >
            <FiBell size={18} color={unreadCount > 0 ? '#FACC15' : '#4B5563'} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: 10,
                  borderRadius: '999px',
                  padding: '2px 6px',
                  fontWeight: 600,
                  border: '2px solid white'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 8,
                  width: 320,
                  backgroundColor: '#111827',
                  color: 'white',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                  zIndex: 50
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #1F2937'
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        markAllAsRead();
                        const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
                        try {
                          await fetch(`http://localhost:5000/api/notifications/read-all`, {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                        } catch (err) {
                          console.error('Error marking all notifications as read:', err);
                        }
                      }}
                      style={{
                        fontSize: 11,
                        background: 'transparent',
                        border: 'none',
                        color: '#FACC15',
                        cursor: 'pointer'
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {(notifications || []).length === 0 ? (
                    <div
                      style={{
                        padding: 16,
                        fontSize: 12,
                        color: '#9CA3AF',
                        textAlign: 'center'
                      }}
                    >
                      You’re all caught up.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={async () => {
                          markAsRead(n._id);
                          const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
                          try {
                            await fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
                              method: 'PATCH',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                          } catch (err) {
                            console.error('Error marking notification as read:', err);
                          }
                        }}
                        style={{
                          padding: 12,
                          borderBottom: '1px solid #1F2937',
                          cursor: 'pointer',
                          backgroundColor: (n.read || n.isRead) ? 'transparent' : 'rgba(250, 204, 21, 0.08)'
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            marginBottom: 2,
                            color: '#E5E7EB'
                          }}
                        >
                          {n.title || 'Update'}
                        </div>
                        <div style={{ fontSize: 12, color: '#D1D5DB' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Create Button */}
        {canQuickCreate && onQuickCreate && (
          <button
            onClick={onQuickCreate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563EB', // Blue-600
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginRight: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'} // Blue-700
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
          >
            Create Project
          </button>
        )}

        {/* User avatar / menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu((s) => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '4px 8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '999px',
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#1D4ED8'
              }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                {user?.name || 'User'}
              </span>
              {globalRole && (
                <span style={{ fontSize: 11, color: '#6B7280' }}>{globalRole}</span>
              )}
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 8,
                  width: 200,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  boxShadow: '0 10px 30px rgba(15,23,42,0.22)',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  zIndex: 50
                }}
              >
                <div style={{ padding: 10, borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {user?.name || 'User'}
                  </div>
                  {globalRole && (
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      {globalRole}
                    </div>
                  )}
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: 10,
                    fontSize: 13,
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: '#DC2626'
                  }}
                  onClick={logout}
                >
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

