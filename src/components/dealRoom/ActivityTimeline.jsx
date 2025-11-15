import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import ListChecksIcon from '../../icon/ListChecksIcon';

const ActivityIcon = ({ type }) => {
  const iconMap = {
    created: "🏁",
    status_changed: "🔄",
    participant_added: "👥",
    participant_removed: "👤",
    document_uploaded: "📄",
    document_viewed: "👁️",
    comment_added: "💬",
    milestone_reached: "🎯",
    deadline_set: "📅",
    meeting_scheduled: "🤝",
    deal_closed: "🎉",
    default: "📝"
  };
  
  return (
    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
      {iconMap[type] || iconMap.default}
    </div>
  );
};

const ActivityCard = ({ activity, isExpanded, onToggle }) => {
  const formatActivityDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return `Today at ${format(date, 'HH:mm')}`;
      } else if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'MMM dd, yyyy HH:mm');
      }
    } catch (error) {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    }
  };

  const getActivityTypeDisplay = (type) => {
    const typeMap = {
      created: "Deal Created",
      status_changed: "Status Changed",
      participant_added: "Participant Added",
      participant_removed: "Participant Removed", 
      document_uploaded: "Document Uploaded",
      document_viewed: "Document Viewed",
      comment_added: "Comment Added",
      milestone_reached: "Milestone Progress",
      deadline_set: "Deadline Set",
      meeting_scheduled: "Meeting Scheduled",
      deal_closed: "Deal Closed"
    };
    return typeMap[type] || type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Activity';
  };

  const getPriorityColor = (type) => {
    const priorityMap = {
      created: "border-green-200 bg-green-50",
      status_changed: "border-blue-200 bg-blue-50",
      participant_added: "border-purple-200 bg-purple-50",
      document_uploaded: "border-indigo-200 bg-indigo-50",
      milestone_reached: "border-emerald-200 bg-emerald-50",
      deal_closed: "border-yellow-200 bg-yellow-50",
      default: "border-gray-200 bg-gray-50"
    };
    return priorityMap[activity.activity_type] || priorityMap.default;
  };

  return (
    <div className={`border-l-4 ${getPriorityColor(activity.activity_type)} p-4 rounded-r-lg transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-3">
        <ActivityIcon type={activity.activity_type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              {getActivityTypeDisplay(activity.activity_type)}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatActivityDate(activity.timestamp)}
              </span>
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <button
                  onClick={onToggle}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? 'Less' : 'Details'}
                </button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mt-1 break-words">
            {activity.description}
          </p>
          
          {activity.actor_name && (
            <p className="text-xs text-gray-500 mt-1">
              by {activity.actor_name}
            </p>
          )}

          {isExpanded && activity.metadata && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Details:</h5>
              <dl className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</dt>
                    <dd className="text-gray-900 font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityTimeline = ({ activities, onRefresh, loading }) => {
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpanded = (activityId) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'milestone_reached', label: 'Milestones' },
    { value: 'document_uploaded', label: 'Documents' },
    { value: 'participant_added', label: 'Participants' },
    { value: 'status_changed', label: 'Status Changes' },
    { value: 'comment_added', label: 'Comments' }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.activity_type === filter;
    const matchesSearch = !searchTerm || 
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.actor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    try {
      const date = parseISO(activity.timestamp);
      let groupKey;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMM dd, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
      return groups;
    } catch (error) {
      // Fallback for invalid dates
      const groupKey = 'Unknown Date';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
      return groups;
    }
  }, {});

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 w-[50%] mx-auto rounded-lg">
            <div className="text-gray-400 text-6xl mb-4 px-[40%]">
            <ListChecksIcon/>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : `Activities will appear here as the deal progresses`}
            </p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded-full border">
                  {date}
                </h3>
                <div className="flex-1 h-px bg-gray-200 ml-4"></div>
              </div>
              <div className="space-y-3 ml-4">
                {dateActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isExpanded={expandedActivities.has(activity.id)}
                    onToggle={() => toggleExpanded(activity.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {activities.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Activity Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
              <div className="text-xs text-gray-500">Total Activities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.activity_type === 'milestone_reached').length}
              </div>
              <div className="text-xs text-gray-500">Milestone Updates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.activity_type === 'document_uploaded').length}
              </div>
              <div className="text-xs text-gray-500">Documents Uploaded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.activity_type === 'participant_added').length}
              </div>
              <div className="text-xs text-gray-500">Participants Added</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
