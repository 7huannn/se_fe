// services/groupsService.js - Groups and team management service
import { apiClient } from './api.js';

class GroupsService {
  constructor() {
    this.groups = [];
  }

  // Create a new group
  async createGroup(groupData) {
    try {
      const response = await apiClient.post('api/groups/', groupData);
      
      return {
        success: true,
        message: 'Group created successfully',
        group: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Join a group via invite code
  async joinGroupByInviteCode(inviteCode) {
    try {
      const response = await apiClient.post('api/groups/join/', null, {
        params: { invite_code: inviteCode }
      });
      
      return {
        success: true,
        message: 'Successfully joined the group',
        membership: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Join a group by ID
  async joinGroup(groupId) {
    try {
      const response = await apiClient.post(`api/groups/${groupId}/join/`);
      
      return {
        success: true,
        message: 'Successfully joined the group',
        membership: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Leave a group
  async leaveGroup(groupId) {
    try {
      await apiClient.delete(`api/groups/${groupId}/leave/`);
      
      return {
        success: true,
        message: 'Successfully left the group'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Delete a group (owner only)
  async deleteGroup(groupId) {
    try {
      await apiClient.delete(`api/groups/${groupId}`);
      
      return {
        success: true,
        message: 'Group deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Invite a member to group
  async inviteMember(groupId, userId) {
    try {
      const response = await apiClient.post(`api/groups/${groupId}/invite/`, null, {
        params: { user_id: userId }
      });
      
      return {
        success: true,
        message: 'Invitation sent successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Remove a member from group
  async removeMember(groupId, userId) {
    try {
      await apiClient.delete(`api/groups/${groupId}/members/${userId}`);
      
      return {
        success: true,
        message: 'Member removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Get group member info
  async getGroupMember(groupId, userId) {
    try {
      const response = await apiClient.get(`api/groups/${groupId}/members/${userId}`);
      
      return {
        success: true,
        member: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Update member role
  async updateMemberRole(groupId, userId, role) {
    try {
      const response = await apiClient.put(`api/groups/${groupId}/role`, {
        user_id: userId,
        role: role
      });
      
      return {
        success: true,
        message: 'Member role updated successfully',
        member: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Transfer group ownership
  async transferOwnership(groupId, newOwnerId) {
    try {
      const response = await apiClient.put(`api/groups/${groupId}/transfer-ownership/`, null, {
        params: { new_owner_id: newOwnerId }
      });
      
      return {
        success: true,
        message: 'Ownership transferred successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Update group email notification settings
  async updateGroupEmailNotification(groupId, enabled) {
    try {
      const response = await apiClient.put(`api/groups/${groupId}/email-notification`, {
        enabled
      });
      
      return {
        success: true,
        message: 'Email notification settings updated',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // ============ GROUP EVENTS ============

  // Create a group event
  async createGroupEvent(groupId, eventData) {
    try {
      const formattedData = this.formatEventData(eventData);
      const response = await apiClient.post(`api/groups/${groupId}/events/`, formattedData);
      
      return {
        success: true,
        message: 'Group event created successfully',
        event: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Update a group event
  async updateGroupEvent(groupId, eventId, eventData) {
    try {
      const formattedData = this.formatEventData(eventData);
      const response = await apiClient.put(`api/groups/${groupId}/events/${eventId}`, formattedData);
      
      return {
        success: true,
        message: 'Group event updated successfully',
        event: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Delete a group event
  async deleteGroupEvent(groupId, eventId) {
    try {
      await apiClient.delete(`api/groups/${groupId}/events/${eventId}`);
      
      return {
        success: true,
        message: 'Group event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Get all events for a group
  async getGroupEvents(groupId) {
    try {
      const response = await apiClient.get(`api/groups/${groupId}/events/`);
      
      return {
        success: true,
        events: response.map(event => this.parseEventData(event))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        events: []
      };
    }
  }

  // ============ HELPER METHODS ============

  // Format event data before sending to API
  formatEventData(eventData) {
    const formatted = { ...eventData };
    
    // Convert Date objects to ISO strings
    if (formatted.start_time instanceof Date) {
      formatted.start_time = formatted.start_time.toISOString();
    }
    if (formatted.end_time instanceof Date) {
      formatted.end_time = formatted.end_time.toISOString();
    }
    
    // Map frontend field names to backend field names if needed
    if (formatted.startTime && !formatted.start_time) {
      formatted.start_time = formatted.startTime instanceof Date ? 
        formatted.startTime.toISOString() : formatted.startTime;
      delete formatted.startTime;
    }
    
    if (formatted.endTime && !formatted.end_time) {
      formatted.end_time = formatted.endTime instanceof Date ? 
        formatted.endTime.toISOString() : formatted.endTime;
      delete formatted.endTime;
    }
    
    if (formatted.eventType && !formatted.event_type) {
      formatted.event_type = formatted.eventType;
      delete formatted.eventType;
    }
    
    return formatted;
  }

  // Parse event data received from API
  parseEventData(eventData) {
    const parsed = { ...eventData };
    
    // Convert ISO strings back to Date objects
    if (parsed.start_time) {
      parsed.startTime = new Date(parsed.start_time);
      parsed.date = new Date(parsed.start_time); // For compatibility with existing frontend
    }
    
    if (parsed.end_time) {
      parsed.endTime = new Date(parsed.end_time);
    }
    
    if (parsed.created_at) {
      parsed.createdAt = new Date(parsed.created_at);
    }
    
    if (parsed.updated_at) {
      parsed.updatedAt = new Date(parsed.updated_at);
    }
    
    // Map backend field names to frontend field names if needed
    if (parsed.event_type) {
      parsed.eventType = parsed.event_type;
    }
    
    if (parsed.creator_id) {
      parsed.creatorId = parsed.creator_id;
    }
    
    if (parsed.group_id) {
      parsed.groupId = parsed.group_id;
    }
    
    return parsed;
  }

  // Validate group data
  validateGroupData(groupData) {
    const errors = [];
    
    if (!groupData.name || groupData.name.trim().length === 0) {
      errors.push('Group name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if user has permission for group action
  canPerformAction(membership, action) {
    if (!membership) return false;
    
    const { role } = membership;
    
    switch (action) {
      case 'delete_group':
      case 'transfer_ownership':
        return role === 'owner';
      
      case 'invite_member':
      case 'remove_member':
      case 'update_member_role':
      case 'create_event':
      case 'update_event':
      case 'delete_event':
        return role === 'owner' || role === 'editor';
      
      case 'view_events':
      case 'leave_group':
        return ['owner', 'editor', 'viewer'].includes(role);
      
      default:
        return false;
    }
  }
}

// Create singleton instance
const groupsService = new GroupsService();

export { groupsService };