import React, { useState, useEffect } from 'react';
import { FiActivity, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useSocket } from '../hooks/useSocket';

const ActivityLog = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const socket = useSocket();

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('join_room', { roomName: projectId });

    const handleActivity = (newActivity) => {
      setActivities(prev => [newActivity, ...prev]);
    };

    socket.on('receive_activity', handleActivity);
    return () => socket.off('receive_activity', handleActivity);
  }, [socket, projectId]);

  const fetchActivities = async () => {
    const token = JSON.parse(localStorage.getItem('auth-storage')).state.token;
    try {
      const response = await fetch(`http://localhost:5000/api/activity?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.entityType === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-8">Loading activity log...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Activities</option>
            <option value="task">Tasks</option>
            <option value="member">Members</option>
            <option value="invite">Invites</option>
            <option value="role">Roles</option>
            <option value="chat">Chat</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities found for the selected filter.
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <FiActivity className="text-teal-600" size={16} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.userName}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                  {activity.details && (
                    <div className="mt-2 text-xs text-gray-600">
                      {activity.entityType === 'task' && activity.details.old && activity.details.new && (
                        <div>
                          <span className="font-medium">Changes:</span>
                          {activity.details.old.status !== activity.details.new.status && (
                            <div>Status: {activity.details.old.status} → {activity.details.new.status}</div>
                          )}
                          {activity.details.old.assignee !== activity.details.new.assignee && (
                            <div>Assignee changed</div>
                          )}
                          {activity.details.old.priority !== activity.details.new.priority && (
                            <div>Priority: {activity.details.old.priority} → {activity.details.new.priority}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.entityType === 'task' ? 'bg-blue-100 text-blue-800' :
                      activity.entityType === 'member' ? 'bg-green-100 text-green-800' :
                        activity.entityType === 'invite' ? 'bg-purple-100 text-purple-800' :
                          activity.entityType === 'role' ? 'bg-yellow-100 text-yellow-800' :
                            activity.entityType === 'chat' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                    }`}>
                    {activity.entityType}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;