// services/groupServiceWrapper.js - Wrapper to handle frontend-backend integration

import { groupsService } from './groupsService.js';
import { authService } from './authService.js';

/**
 * Wrapper service to handle group operations with proper data mapping
 */
export class GroupServiceWrapper {
    constructor() {
        this.localStorageKey = 'schedigo_teams';
    }

    /**
     * Create a group with proper data mapping
     * @param {Object} frontendGroupData - Group data from frontend
     * @returns {Promise<Object>} Result with mapped group data
     */
    async createGroup(frontendGroupData) {
        try {
            // Map frontend data to backend format
            const backendData = this.mapFrontendToBackend(frontendGroupData);
            
            // Create group on backend
            const result = await groupsService.createGroup(backendData);
            
            if (result.success) {
                // Map backend response to frontend format
                const frontendGroup = this.mapBackendToFrontend(result.group, frontendGroupData);
                
                // Save to localStorage as backup
                await this.saveGroupLocally(frontendGroup);
                
                return {
                    success: true,
                    group: frontendGroup,
                    message: 'Group created successfully'
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error in createGroup wrapper:', error);
            return {
                success: false,
                message: error.message || 'Failed to create group'
            };
        }
    }

    /**
     * Join a group by invite code
     * @param {string} inviteCode - Group invite code
     * @returns {Promise<Object>} Result
     */
    async joinGroupByInviteCode(inviteCode) {
        try {
            const result = await groupsService.joinGroupByInviteCode(inviteCode);
            
            if (result.success) {
                // Refresh local groups list
                await this.refreshLocalGroups();
                
                return {
                    success: true,
                    message: 'Successfully joined the group',
                    membership: result.membership
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error joining group:', error);
            return {
                success: false,
                message: error.message || 'Failed to join group'
            };
        }
    }

    /**
     * Leave a group
     * @param {number} groupId - Group ID (backend ID)
     * @returns {Promise<Object>} Result
     */
    async leaveGroup(groupId) {
        try {
            const result = await groupsService.leaveGroup(groupId);
            
            if (result.success) {
                // Remove from local storage
                await this.removeGroupLocally(groupId);
                
                return {
                    success: true,
                    message: 'Successfully left the group'
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error leaving group:', error);
            return {
                success: false,
                message: error.message || 'Failed to leave group'
            };
        }
    }

    /**
     * Delete a group
     * @param {number} groupId - Group ID (backend ID)
     * @returns {Promise<Object>} Result
     */
    async deleteGroup(groupId) {
        try {
            const result = await groupsService.deleteGroup(groupId);
            
            if (result.success) {
                // Remove from local storage
                await this.removeGroupLocally(groupId);
                
                return {
                    success: true,
                    message: 'Group deleted successfully'
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error deleting group:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete group'
            };
        }
    }

    /**
     * Get user's groups (placeholder - backend doesn't have this endpoint yet)
     * @returns {Promise<Object>} Result with groups array
     */
    async getUserGroups() {
        try {
            // For now, return groups from localStorage
            // TODO: Implement when backend has getUserGroups endpoint
            const localGroups = this.getLocalGroups();
            
            return {
                success: true,
                groups: localGroups,
                message: 'Groups retrieved from local storage'
            };
        } catch (error) {
            console.error('Error getting user groups:', error);
            return {
                success: false,
                groups: [],
                message: error.message || 'Failed to get groups'
            };
        }
    }

    /**
     * Map frontend group data to backend format
     * @param {Object} frontendData - Frontend group data
     * @returns {Object} Backend format
     */
    mapFrontendToBackend(frontendData) {
        return {
            name: frontendData.name,
            description: frontendData.description || ''
            // Note: Backend doesn't support color, privacy, initials
        };
    }

    /**
     * Map backend group data to frontend format
     * @param {Object} backendData - Backend group data
     * @param {Object} originalFrontendData - Original frontend data for missing fields
     * @returns {Object} Frontend format
     */
    mapBackendToFrontend(backendData, originalFrontendData = {}) {
        return {
            // Frontend specific fields
            id: backendData.id,
            name: backendData.name,
            description: backendData.description || '',
            code: backendData.invite_code, // Backend uses invite_code
            inviteCode: backendData.invite_code,
            
            // Frontend-only fields (not supported by backend)
            privacy: originalFrontendData.privacy || 'private',
            color: originalFrontendData.color || 'blue',
            initials: originalFrontendData.initials || this.getInitials(backendData.name),
            
            // Timestamps
            createdAt: backendData.created_at,
            updatedAt: backendData.updated_at || backendData.created_at,
            
            // Backend specific fields
            creator_id: backendData.creator_id,
            createdBy: backendData.creator_id, // Map for frontend compatibility
            
            // Members will be populated separately
            members: []
        };
    }

    /**
     * Map frontend member role to backend role
     * @param {string} frontendRole - Frontend role (leader/member)
     * @returns {string} Backend role (owner/editor/viewer)
     */
    mapFrontendRoleToBackend(frontendRole) {
        const roleMap = {
            'leader': 'editor', // or 'owner' depending on context
            'member': 'viewer'
        };
        
        return roleMap[frontendRole] || 'viewer';
    }

    /**
     * Map backend member role to frontend role
     * @param {string} backendRole - Backend role (owner/editor/viewer)
     * @returns {string} Frontend role (leader/member)
     */
    mapBackendRoleToFrontend(backendRole) {
        const roleMap = {
            'owner': 'leader',
            'editor': 'leader', // Treat editors as leaders in frontend
            'viewer': 'member'
        };
        
        return roleMap[backendRole] || 'member';
    }

    /**
     * Generate initials from name
     * @param {string} name - Group name
     * @returns {string} Initials
     */
    getInitials(name) {
        if (!name) return 'GR';
        
        const words = name.split(' ');
        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else {
            return name.substring(0, 2).toUpperCase();
        }
    }

    /**
     * Save group to localStorage
     * @param {Object} group - Group data
     */
    async saveGroupLocally(group) {
        try {
            const groups = this.getLocalGroups();
            
            // Check if group already exists
            const existingIndex = groups.findIndex(g => g.id === group.id);
            
            if (existingIndex >= 0) {
                // Update existing
                groups[existingIndex] = group;
            } else {
                // Add new
                groups.push(group);
            }
            
            localStorage.setItem(this.localStorageKey, JSON.stringify(groups));
        } catch (error) {
            console.error('Error saving group locally:', error);
        }
    }

    /**
     * Remove group from localStorage
     * @param {number} groupId - Group ID
     */
    async removeGroupLocally(groupId) {
        try {
            const groups = this.getLocalGroups();
            const filteredGroups = groups.filter(g => g.id !== groupId);
            localStorage.setItem(this.localStorageKey, JSON.stringify(filteredGroups));
        } catch (error) {
            console.error('Error removing group locally:', error);
        }
    }

    /**
     * Get groups from localStorage
     * @returns {Array} Groups array
     */
    getLocalGroups() {
        try {
            const groupsData = localStorage.getItem(this.localStorageKey);
            return groupsData ? JSON.parse(groupsData) : [];
        } catch (error) {
            console.error('Error getting local groups:', error);
            return [];
        }
    }

    /**
     * Refresh local groups (placeholder for future backend sync)
     * @returns {Promise<Array>} Updated groups array
     */
    async refreshLocalGroups() {
        try {
            // TODO: Implement when backend has getUserGroups endpoint
            // For now, just return existing local groups
            return this.getLocalGroups();
        } catch (error) {
            console.error('Error refreshing local groups:', error);
            return this.getLocalGroups();
        }
    }

    /**
     * Sync groups with backend (future implementation)
     * @returns {Promise<Object>} Sync result
     */
    async syncWithBackend() {
        try {
            // TODO: Implement comprehensive sync when backend supports it
            // This would involve:
            // 1. Get user's groups from backend
            // 2. Compare with local groups
            // 3. Resolve conflicts
            // 4. Update local storage
            
            console.log('Backend sync not yet implemented');
            return {
                success: true,
                message: 'Sync functionality not yet available'
            };
        } catch (error) {
            console.error('Error syncing with backend:', error);
            return {
                success: false,
                message: 'Sync failed'
            };
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return authService.isUserAuthenticated();
    }

    /**
     * Get current user data
     * @returns {Object|null} User data
     */
    getCurrentUser() {
        return authService.getCurrentUserData();
    }
}

// Create and export singleton instance
export const groupServiceWrapper = new GroupServiceWrapper();