/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */
const ApiConfig = {
    // Base API URL - adjust this based on your server configuration
    baseURL: window.location.origin + '/api',
    
    // API Endpoints
    endpoints: {
        login: '/login',
        register: '/register',
        health: '/health',
        items: '/items',
        suppliers: '/suppliers',
        purchasings: '/purchasings'
    },
    
    // Request timeout in milliseconds
    timeout: 10000,
    
    // Storage keys
    storageKeys: {
        token: 'procurement_token',
        user: 'procurement_user'
    }
};

