import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiUserMinus, FiSearch, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { canManageMembers, canChangeRoles, normalizeRole } from '../utils/roleUtils';

const MembersPanel = ({ projectId, onMemberUpdate, onGlobalRefresh }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [projectId, onMemberUpdate]);

  const getToken = () => JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;

  const fetchMembers = async () => {
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:5000/api/members/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMembers(data);

      // Find current user's role
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state;
      const currentUser = authState?.user;
      const currentToken = authState?.token;
      const currentUserId = currentUser?.id || currentUser?._id;

      const userMember = data.find(m => String(m.userId) === String(currentUserId));
      setUserRole(userMember?.role ? normalizeRole(userMember.role) : '');
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(`http://localhost:5000/api/members/search/users?query=${query}&projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleAddMember = async (userId, role) => {
    const token = getToken();
    try {
      await fetch('http://localhost:5000/api/members/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, userId, role })
      });
      fetchMembers();
      if (onGlobalRefresh) onGlobalRefresh();
      setShowAddMember(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error adding member:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    const token = getToken();
    try {
      await fetch('http://localhost:5000/api/members/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, userId })
      });
      fetchMembers();
      if (onGlobalRefresh) onGlobalRefresh();
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const token = getToken();
    try {
      await fetch('http://localhost:5000/api/members/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, userId, newRole })
      });
      fetchMembers();
      if (onGlobalRefresh) onGlobalRefresh();
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  const canManage = canManageMembers(userRole);
  const canChange = canChangeRoles(userRole);

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Members</h2>
        {canManage && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <FiUserPlus className="mr-2" />
            Add Member
          </button>
        )}
      </div>

      {showAddMember && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map(user => (
                <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <select
                    onChange={(e) => handleAddMember(user._id, e.target.value)}
                    defaultValue="Contributor"
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Member">Member</option>
                    <option value="Contributor">Contributor</option>
                    <option value="SDE">SDE</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="grid gap-4">
        {members.map(member => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center">
                    {member.name}
                    {member.isManager && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black uppercase bg-slate-900 text-white rounded-md tracking-wider">
                        Creator
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginTop: 2 }}>
                    {member.role}
                  </span>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.role === 'Admin' ? 'bg-red-100 text-red-800' :
                  member.role === 'Member' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'Viewer' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {member.role}
                </span>

                {canChange && !member.isManager && (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Member">Member</option>
                    <option value="Contributor">Contributor</option>
                    <option value="SDE">SDE</option>
                    <option value="Admin">Admin</option>
                  </select>
                )}

                {canManage && !member.isManager && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Remove member"
                  >
                    <FiUserMinus size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembersPanel;