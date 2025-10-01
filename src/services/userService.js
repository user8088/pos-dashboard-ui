// User Management Service for Admin Users
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class UserService {
  // Get authorization header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Check if current user is admin
  isAdmin() {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      return user && user.user_role === 'admin';
    } catch {
      return false;
    }
  }

  // Get all users (Admin only)
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch users' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Get user by ID (Admin only)
  async getUserById(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch user' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Create new user (Admin only)
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(userData),
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
          error: data.message || 'Failed to create user',
          errors: data.errors 
        };
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Update user (Admin only)
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(userData),
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
          error: data.message || 'Failed to update user',
          errors: data.errors 
        };
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users/${userId}`, {
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
          error: data.message || 'Failed to delete user' 
        };
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Get user statistics (Admin only)
  async getUserStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/users/stats`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch user statistics' 
        };
      }
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }
}

// Create and export a singleton instance
const userService = new UserService();
export default userService;

