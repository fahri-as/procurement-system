/**
 * API Service
 * Handles all API requests with JWT authentication
 * Uses reusable AJAX wrapper for clean code
 */
const ApiService = {
  /**
   * Get default headers with JWT token
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const authHeader = Auth.getAuthHeader();
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    return headers;
  },

  /**
   * Handle API response errors
   * @param {Object} xhr - jQuery XHR object
   * @returns {Object} Error object with message
   */
  handleError(xhr) {
    let error = {
      message: "Terjadi kesalahan saat memproses permintaan",
      detail: "",
      status: xhr.status,
    };

    if (xhr.status === 401) {
      error.message = "Sesi Anda telah berakhir";
      error.detail = "Silakan login kembali";
      // Redirect to login if unauthorized
      setTimeout(() => {
        Auth.logout();
        window.location.href = "/login.html";
      }, 2000);
    } else if (xhr.status === 403) {
      error.message = "Akses ditolak";
      error.detail = "Anda tidak memiliki izin untuk mengakses resource ini";
    } else if (xhr.status === 404) {
      error.message = "Resource tidak ditemukan";
      error.detail = "Data yang diminta tidak tersedia";
    } else if (xhr.status === 500) {
      error.message = "Kesalahan server";
      error.detail = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
    } else if (xhr.status === 0) {
      error.message = "Tidak dapat terhubung ke server";
      error.detail = "Pastikan server berjalan dan dapat diakses";
    } else if (xhr.responseJSON && xhr.responseJSON.error) {
      error.message = xhr.responseJSON.error;
      error.detail = xhr.responseJSON.message || "";
    }

    return error;
  },

  /**
   * Reusable AJAX wrapper function
   * Automatically handles authentication headers and error handling
   * @param {Object} options - AJAX options
   * @param {string} options.url - Request URL
   * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
   * @param {Object} options.data - Request data (optional)
   * @param {Function} options.onSuccess - Success callback (optional)
   * @param {Function} options.onError - Error callback (optional)
   * @returns {Promise} Promise that resolves with response data
   */
  request(options) {
    const self = this;
    const { url, method = "GET", data = null, onSuccess = null, onError = null } = options;

    return new Promise((resolve, reject) => {
      const ajaxOptions = {
        url: url,
        method: method,
        headers: self.getHeaders(),
        timeout: ApiConfig.timeout,
        success: function (response) {
          if (onSuccess) {
            onSuccess(response);
          }
          resolve(response);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          if (onError) {
            onError(error);
          }
          reject(error);
        },
      };

      // Add data if provided
      if (data !== null) {
        ajaxOptions.data = JSON.stringify(data);
      }

      $.ajax(ajaxOptions);
    });
  },

  /**
   * Get all items from API
   * @returns {Promise} Promise that resolves with items data
   */
  getItems(supplierId) {
    const query = supplierId ? `?supplierId=${supplierId}` : "";
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.items + query,
      method: "GET",
    }).then((response) => response.data || []);
  },

  /**
   * Create a new item
   * @param {Object} itemData - Item data (name, stock, price)
   * @returns {Promise} Promise that resolves with created item
   */
  createItem(itemData) {
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.items,
      method: "POST",
      data: itemData,
    }).then((response) => response.data);
  },

  /**
   * Update an existing item
   * @param {number} itemId - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise} Promise that resolves with updated item
   */
  updateItem(itemId, itemData) {
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.items + "/" + itemId,
      method: "PUT",
      data: itemData,
    }).then((response) => response.data);
  },

  /**
   * Delete an item
   * @param {number} itemId - Item ID
   * @returns {Promise} Promise that resolves on success
   */
  deleteItem(itemId) {
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.items + "/" + itemId,
      method: "DELETE",
    });
  },

  /**
   * Get all suppliers from API
   * @returns {Promise} Promise that resolves with suppliers data
   */
  getSuppliers() {
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.suppliers,
      method: "GET",
    }).then((response) => response.data || []);
  },

  /**
   * Create a new purchasing transaction
   * @param {Object} purchasingData - Purchasing data (supplierId, details[])
   * @returns {Promise} Promise that resolves with created purchasing transaction
   */
  createPurchasing(purchasingData) {
    return this.request({
      url: ApiConfig.baseURL + ApiConfig.endpoints.purchasings,
      method: "POST",
      data: purchasingData,
    });
  },
};
