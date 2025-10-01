// Notification Service for managing notifications
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class NotificationService {
  // Get authorization header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Get all notifications with optional filters
  async getAllNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/core/notifications?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data, pagination: data.pagination };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch notifications' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Get unread notifications
  async getUnreadNotifications(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/unread?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch unread notifications' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/unread-count`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, count: data.unread_count };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch unread count' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.',
        count: 0
      };
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/${notificationId}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch notification' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          data: data.data,
          message: data.message 
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to mark notification as read' 
        };
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/read-all`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message,
          updated_count: data.updated_count 
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to mark all notifications as read' 
        };
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
        };
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message 
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to delete notification' 
        };
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Delete all read notifications
  async deleteAllRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/read/all`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message,
          deleted_count: data.deleted_count 
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to delete read notifications' 
        };
      }
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/stats`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch notification statistics' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch notification statistics:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Check due rentals (manual trigger)
  async checkDueRentals() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/check/rentals`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message,
          rentals_due_soon: data.rentals_due_soon,
          overdue_rentals: data.overdue_rentals,
          notifications_created: data.notifications_created
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to check due rentals' 
        };
      }
    } catch (error) {
      console.error('Failed to check due rentals:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Check customer dues (manual trigger)
  async checkCustomerDues() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/notifications/check/customers`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message,
          customers_with_dues: data.customers_with_dues,
          notifications_created: data.notifications_created
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to check customer dues' 
        };
      }
    } catch (error) {
      console.error('Failed to check customer dues:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Helper function to format notification time
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

