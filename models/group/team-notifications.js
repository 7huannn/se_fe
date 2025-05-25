// models/group/team-notifications.js - Helper functions for team notifications

/**
 * Helper functions for team-related notifications
 */

/**
 * Get current user info for notifications
 * @returns {Object} Current user information
 */
export function getCurrentUserForNotifications() {
  return {
    email: localStorage.getItem('email') || '',
    name: localStorage.getItem('username') || 'User'
  };
}

/**
 * Create notification for team creation
 * @param {Object} team - Team data
 * @returns {Object} Notification object
 */
export function createTeamCreationNotification(team) {
  return {
    type: 'team-create',
    category: 'team',
    message: `Team "${team.name}" has been created successfully`,
    details: `You are now a leader of this team with ${team.members ? team.members.length : 1} member${team.members && team.members.length !== 1 ? 's' : ''}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    icon: '🎉👥',
    priority: 'high'
  };
}

/**
 * Create notification for being added to team
 * @param {Object} team - Team data
 * @param {Object} addedBy - User who added the member
 * @param {string} role - Role assigned ('leader' or 'member')
 * @returns {Object} Notification object
 */
export function createAddedToTeamNotification(team, addedBy, role = 'member') {
  const roleText = role === 'leader' ? 'as a Leader' : 'as a Member';
  const icon = role === 'leader' ? '👑👥' : '➕👥';
  
  return {
    type: 'team-member-added-to',
    category: 'team',
    message: `You've been added to team "${team.name}" ${roleText}`,
    details: `Added by ${addedBy.name || addedBy.email}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    addedById: addedBy.id,
    role: role,
    icon: icon,
    priority: 'high'
  };
}

/**
 * Create notification for adding someone to team
 * @param {Object} team - Team data
 * @param {Object} member - Member that was added
 * @returns {Object} Notification object
 */
export function createMemberAddedNotification(team, member) {
  return {
    type: 'team-member-add',
    category: 'team',
    message: `${member.name || member.email} has been added to team "${team.name}"`,
    details: `Role: ${member.role || 'Member'}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    memberId: member.id,
    icon: '➕👤',
    priority: 'medium'
  };
}

/**
 * Create notification for removing someone from team
 * @param {Object} team - Team data
 * @param {Object} member - Member that was removed
 * @param {Object} removedBy - User who removed the member
 * @returns {Object} Notification object
 */
export function createMemberRemovedNotification(team, member, removedBy) {
  const currentUser = getCurrentUserForNotifications();
  const isCurrentUser = member.email.toLowerCase() === currentUser.email.toLowerCase();
  
  if (isCurrentUser) {
    // Notification for the user being removed
    return {
      type: 'team-member-removed-from',
      category: 'team',
      message: `You have been removed from team "${team.name}"`,
      details: `Removed by ${removedBy.name || removedBy.email}`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      removedById: removedBy.id,
      icon: '➖👤',
      priority: 'high'
    };
  } else {
    // Notification for team leaders/administrators
    return {
      type: 'team-member-remove',
      category: 'team',
      message: `${member.name || member.email} has been removed from team "${team.name}"`,
      details: `Removed by ${removedBy.name || removedBy.email}`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      memberId: member.id,
      removedById: removedBy.id,
      icon: '➖👤',
      priority: 'medium'
    };
  }
}

/**
 * Create notification for role change
 * @param {Object} team - Team data
 * @param {Object} member - Member whose role changed
 * @param {string} oldRole - Previous role
 * @param {string} newRole - New role
 * @param {Object} changedBy - User who changed the role
 * @returns {Object} Notification object
 */
export function createRoleChangeNotification(team, member, oldRole, newRole, changedBy) {
  const currentUser = getCurrentUserForNotifications();
  const isCurrentUser = member.email.toLowerCase() === currentUser.email.toLowerCase();
  
  const promotion = newRole === 'leader';
  const actionText = promotion ? 'promoted to Leader' : 'changed to Member';
  const icon = promotion ? '👑' : '👤';
  
  if (isCurrentUser) {
    // Notification for the user whose role changed
    return {
      type: 'team-role-changed-self',
      category: 'team',
      message: `You have been ${actionText} in team "${team.name}"`,
      details: `Role changed by ${changedBy.name || changedBy.email}`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      memberId: member.id,
      oldRole: oldRole,
      newRole: newRole,
      changedById: changedBy.id,
      icon: icon,
      priority: 'high'
    };
  } else {
    // Notification for other team members
    return {
      type: 'team-member-role-change',
      category: 'team',
      message: `${member.name || member.email} has been ${actionText} in team "${team.name}"`,
      details: `Role changed by ${changedBy.name || changedBy.email}`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      memberId: member.id,
      oldRole: oldRole,
      newRole: newRole,
      changedById: changedBy.id,
      icon: icon,
      priority: 'medium'
    };
  }
}

/**
 * Create notification for team edit
 * @param {Object} team - Team data
 * @param {Object} changes - What was changed
 * @param {Object} editedBy - User who edited the team
 * @returns {Object} Notification object
 */
export function createTeamEditNotification(team, changes, editedBy) {
  let changeDetails = [];
  
  if (changes.name) changeDetails.push('name');
  if (changes.description) changeDetails.push('description');
  if (changes.color) changeDetails.push('color');
  if (changes.privacy) {
    changeDetails.push(`privacy (now ${changes.privacy})`);
  }
  
  const changesText = changeDetails.length > 0 ? changeDetails.join(', ') : 'details';
  
  return {
    type: 'team-edit',
    category: 'team',
    message: `Team "${team.name}" has been updated`,
    details: `Changed: ${changesText} by ${editedBy.name || editedBy.email}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    changes: changes,
    editedById: editedBy.id,
    icon: '✏️👥',
    priority: 'low'
  };
}

/**
 * Create notification for team deletion
 * @param {Object} team - Team data (before deletion)
 * @param {Object} deletedBy - User who deleted the team
 * @returns {Object} Notification object
 */
export function createTeamDeletionNotification(team, deletedBy) {
  return {
    type: 'team-delete',
    category: 'team',
    message: `Team "${team.name}" has been deleted`,
    details: `Team was deleted by ${deletedBy.name || deletedBy.email}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id, // Keep for reference, though team no longer exists
    deletedById: deletedBy.id,
    icon: '🗑️👥',
    priority: 'high'
  };
}

/**
 * Create notification for privacy change
 * @param {Object} team - Team data
 * @param {string} oldPrivacy - Previous privacy setting
 * @param {string} newPrivacy - New privacy setting
 * @param {Object} changedBy - User who changed the privacy
 * @returns {Object} Notification object
 */
export function createPrivacyChangeNotification(team, oldPrivacy, newPrivacy, changedBy) {
  const icon = newPrivacy === 'private' ? '🔒' : '🌐';
  const privacyText = newPrivacy === 'private' ? 'Private' : 'Public';
  
  return {
    type: 'team-privacy-update',
    category: 'team',
    message: `Team "${team.name}" is now ${privacyText}`,
    details: `Privacy changed from ${oldPrivacy} to ${newPrivacy} by ${changedBy.name || changedBy.email}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    oldPrivacy: oldPrivacy,
    newPrivacy: newPrivacy,
    changedById: changedBy.id,
    icon: icon,
    priority: 'low'
  };
}

/**
 * Create notification for team invitation (future enhancement)
 * @param {Object} team - Team data
 * @param {Object} invitedBy - User who sent the invitation
 * @param {string} inviteCode - Invitation code
 * @returns {Object} Notification object
 */
export function createTeamInviteNotification(team, invitedBy, inviteCode) {
  return {
    type: 'team-invite',
    category: 'team',
    message: `You've been invited to join team "${team.name}"`,
    details: `Invited by ${invitedBy.name || invitedBy.email}`,
    timestamp: Date.now(),
    read: false,
    teamId: team.id,
    invitedById: invitedBy.id,
    inviteCode: inviteCode,
    icon: '📩👥',
    priority: 'high',
    actionRequired: true
  };
}

/**
 * Dispatch notification event
 * @param {Object} notification - Notification data
 */
export function dispatchNotificationEvent(notification) {
  document.dispatchEvent(new CustomEvent('team-notification', {
    detail: { notification },
    bubbles: true
  }));
}

/**
 * Get notification priority color
 * @param {string} priority - Priority level
 * @returns {string} CSS color value
 */
export function getNotificationPriorityColor(priority) {
  const colors = {
    'high': '#e74c3c',
    'medium': '#f39c12',
    'low': '#3498db'
  };
  
  return colors[priority] || colors.medium;
}

/**
 * Check if notification should show desktop notification
 * @param {Object} notification - Notification data
 * @returns {boolean} Whether to show desktop notification
 */
export function shouldShowDesktopNotification(notification) {
  // Show desktop notifications for high priority team notifications
  return notification.category === 'team' && 
         ['high', 'medium'].includes(notification.priority) &&
         ['team-member-added-to', 'team-role-changed-self', 'team-member-removed-from', 'team-delete'].includes(notification.type);
}

/**
 * Show desktop notification if permissions granted
 * @param {Object} notification - Notification data
 */
export function showDesktopNotification(notification) {
  if (!shouldShowDesktopNotification(notification)) return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Schedigo - Team Update', {
      body: notification.message,
      icon: '/favicon.ico', // Adjust path as needed
      tag: `schedigo-team-${notification.teamId}`,
      requireInteraction: notification.priority === 'high'
    });
  }
}

/**
 * Request notification permission
 * @returns {Promise<string>} Permission result
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
}