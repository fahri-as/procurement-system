/**
 * Dashboard Controller
 * Handles dashboard display and inventory management
 */
$(document).ready(function () {
  // DOM Elements
  const $mobileMenuBtn = $("#mobileMenuBtn");
  const $mobileMenuOverlay = $("#mobileMenuOverlay");
  const $sidebar = $("#sidebar");
  const $logoutBtn = $("#logoutBtn");
  const $refreshBtn = $("#refreshBtn");
  const $retryBtn = $("#retryBtn");

  // Stats elements
  const $totalItems = $("#totalItems");
  const $lowStockItems = $("#lowStockItems");
  const $totalStockValue = $("#totalStockValue");

  // User info elements
  const $userName = $("#userName");
  const $userRole = $("#userRole");

  // State elements
  const $loadingState = $("#loadingState");
  const $errorState = $("#errorState");
  const $errorMessage = $("#errorMessage");
  const $errorDetail = $("#errorDetail");
  const $emptyState = $("#emptyState");
  const $inventoryTable = $("#inventoryTable");
  const $inventoryTableBody = $("#inventoryTableBody");

  /**
   * Check authentication and redirect if not logged in
   */
  function checkAuthentication() {
    if (!Auth.isAuthenticated()) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  /**
   * Load user information
   */
  function loadUserInfo() {
    const user = Auth.getUser();
    if (user) {
      $userName.text(user.username || "-");
      $userRole.text(user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "-");
    }
  }

  /**
   * Format currency
   * @param {number|string} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  /**
   * Get stock status badge
   * @param {number} stock - Stock quantity
   * @returns {Object} Badge object with class and text
   */
  function getStockStatus(stock) {
    if (stock === 0) {
      return { class: "stock-low", text: "Habis" };
    } else if (stock < 10) {
      return { class: "stock-low", text: "Rendah" };
    } else if (stock < 50) {
      return { class: "stock-medium", text: "Sedang" };
    } else {
      return { class: "stock-high", text: "Aman" };
    }
  }

  /**
   * Calculate statistics from items
   * @param {Array} items - Array of items
   * @returns {Object} Statistics object
   */
  function calculateStatistics(items) {
    const stats = {
      totalItems: items.length,
      lowStockItems: items.filter((item) => item.stock < 10).length,
      totalStockValue: 0,
    };

    items.forEach((item) => {
      const stockValue = parseFloat(item.price) * item.stock;
      stats.totalStockValue += stockValue;
    });

    return stats;
  }

  /**
   * Update statistics display
   * @param {Object} stats - Statistics object
   */
  function updateStatistics(stats) {
    $totalItems.text(stats.totalItems);
    $lowStockItems.text(stats.lowStockItems);
    $totalStockValue.text(formatCurrency(stats.totalStockValue));
  }

  /**
   * Render inventory table
   * @param {Array} items - Array of items
   */
  function renderInventoryTable(items) {
    $inventoryTableBody.empty();

    if (items.length === 0) {
      $inventoryTable.addClass("hidden");
      $emptyState.removeClass("hidden");
      return;
    }

    $emptyState.addClass("hidden");
    $inventoryTable.removeClass("hidden");

    items.forEach((item, index) => {
      const stockStatus = getStockStatus(item.stock);
      const price = formatCurrency(item.price);

      const row = `
                <tr class="fade-in hover:bg-gray-50 transition-colors" style="animation-delay: ${index * 0.05}s">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        #${item.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${escapeHtml(item.name)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${price}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900 font-medium">${item.stock}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="stock-badge ${stockStatus.class}">${stockStatus.text}</span>
                    </td>
                </tr>
            `;

      $inventoryTableBody.append(row);
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Show loading state
   */
  function showLoading() {
    $loadingState.removeClass("hidden");
    $errorState.addClass("hidden");
    $emptyState.addClass("hidden");
    $inventoryTable.addClass("hidden");
  }

  /**
   * Show error state
   * @param {string} message - Error message
   * @param {string} detail - Error detail
   */
  function showError(message, detail) {
    $loadingState.addClass("hidden");
    $errorState.removeClass("hidden");
    $emptyState.addClass("hidden");
    $inventoryTable.addClass("hidden");
    $errorMessage.text(message);
    $errorDetail.text(detail || "");
  }

  /**
   * Load inventory data
   */
  function loadInventory() {
    showLoading();

    ApiService.getItems()
      .then((items) => {
        $loadingState.addClass("hidden");

        // Calculate and update statistics
        const stats = calculateStatistics(items);
        updateStatistics(stats);

        // Render inventory table
        renderInventoryTable(items);
      })
      .catch((error) => {
        showError(error.message, error.detail);
      });
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    $sidebar.toggleClass("open");
    $mobileMenuOverlay.toggleClass("hidden");
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    $sidebar.removeClass("open");
    $mobileMenuOverlay.addClass("hidden");
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      Auth.logout();
      window.location.href = "/login.html";
    }
  }

  // Event Listeners
  $mobileMenuBtn.on("click", toggleMobileMenu);
  $mobileMenuOverlay.on("click", closeMobileMenu);
  $logoutBtn.on("click", handleLogout);
  $refreshBtn.on("click", loadInventory);
  $retryBtn.on("click", loadInventory);

  // Close mobile menu on window resize (desktop)
  $(window).on("resize", function () {
    if ($(window).width() > 768) {
      closeMobileMenu();
    }
  });

  // Initialize
  if (checkAuthentication()) {
    loadUserInfo();
    loadInventory();
  }
});
