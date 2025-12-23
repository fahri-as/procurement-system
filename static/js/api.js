/**
 * API Service
 * Handles all API requests with JWT authentication
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
   * Get all items from API
   * @returns {Promise} Promise that resolves with items data
   */
  getItems() {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.items,
        method: "GET",
        headers: self.getHeaders(),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response.data || []);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },

  /**
   * Create a new item
   * @param {Object} itemData - Item data (name, stock, price)
   * @returns {Promise} Promise that resolves with created item
   */
  createItem(itemData) {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.items,
        method: "POST",
        headers: self.getHeaders(),
        data: JSON.stringify(itemData),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response.data);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },

  /**
   * Update an existing item
   * @param {number} itemId - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise} Promise that resolves with updated item
   */
  updateItem(itemId, itemData) {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.items + "/" + itemId,
        method: "PUT",
        headers: self.getHeaders(),
        data: JSON.stringify(itemData),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response.data);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },

  /**
   * Delete an item
   * @param {number} itemId - Item ID
   * @returns {Promise} Promise that resolves on success
   */
  deleteItem(itemId) {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.items + "/" + itemId,
        method: "DELETE",
        headers: self.getHeaders(),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },

  /**
   * Get all suppliers from API
   * @returns {Promise} Promise that resolves with suppliers data
   */
  getSuppliers() {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.suppliers,
        method: "GET",
        headers: self.getHeaders(),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response.data || []);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },

  /**
   * Create a new purchasing transaction
   * @param {Object} purchasingData - Purchasing data (supplierId, details[])
   * @returns {Promise} Promise that resolves with created purchasing transaction
   */
  createPurchasing(purchasingData) {
    const self = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: ApiConfig.baseURL + ApiConfig.endpoints.purchasings,
        method: "POST",
        headers: self.getHeaders(),
        data: JSON.stringify(purchasingData),
        timeout: ApiConfig.timeout,
        success: function (response) {
          resolve(response);
        },
        error: function (xhr) {
          const error = self.handleError(xhr);
          reject(error);
        },
      });
    });
  },
};
