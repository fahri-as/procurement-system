/**
 * Authentication Utilities
 * Handles JWT token storage and retrieval using localStorage
 */
const Auth = {
    /**
     * Save JWT token to localStorage
     * @param {string} token - JWT token string
     * @returns {void}
     */
    saveToken(token) {
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid token provided');
        }
        localStorage.setItem(ApiConfig.storageKeys.token, token);
    },

    /**
     * Get JWT token from localStorage
     * @returns {string|null} JWT token or null if not found
     */
    getToken() {
        return localStorage.getItem(ApiConfig.storageKeys.token);
    },

    /**
     * Remove JWT token from localStorage
     * @returns {void}
     */
    removeToken() {
        localStorage.removeItem(ApiConfig.storageKeys.token);
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if token exists
     */
    isAuthenticated() {
        return this.getToken() !== null;
    },

    /**
     * Save user data to localStorage
     * @param {Object} user - User object with id, username, role
     * @returns {void}
     */
    saveUser(user) {
        if (!user || typeof user !== 'object') {
            throw new Error('Invalid user data provided');
        }
        localStorage.setItem(ApiConfig.storageKeys.user, JSON.stringify(user));
    },

    /**
     * Get user data from localStorage
     * @returns {Object|null} User object or null if not found
     */
    getUser() {
        const userStr = localStorage.getItem(ApiConfig.storageKeys.user);
        if (!userStr) {
            return null;
        }
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    /**
     * Remove user data from localStorage
     * @returns {void}
     */
    removeUser() {
        localStorage.removeItem(ApiConfig.storageKeys.user);
    },

    /**
     * Clear all authentication data
     * @returns {void}
     */
    logout() {
        this.removeToken();
        this.removeUser();
    },

    /**
     * Get Authorization header value
     * @returns {string|null} Bearer token string or null
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : null;
    }
};

