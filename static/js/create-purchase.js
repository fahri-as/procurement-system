/**
 * Create Purchase Page Controller
 * Handles purchase order creation with cart functionality
 */

const CreatePurchaseController = {
    // Cart state
    cart: [],
    suppliers: [],
    items: [],

    /**
     * Initialize the page
     */
    init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Load initial data
        this.loadData();

        // Setup user info
        this.setupUserInfo();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const self = this;

        // Mobile menu toggle
        $('#mobileMenuBtn').on('click', function() {
            $('#sidebar').toggleClass('open');
            $('#mobileMenuOverlay').toggleClass('hidden');
        });

        $('#mobileMenuOverlay').on('click', function() {
            $('#sidebar').removeClass('open');
            $(this).addClass('hidden');
        });

        // Logout
        $('#logoutBtn').on('click', function() {
            Auth.logout();
            window.location.href = '/login.html';
        });

        // Add to cart
        $('#addToCartBtn').on('click', function() {
            self.addToCart();
        });

        // Submit order
        $('#submitOrderBtn').on('click', function() {
            self.submitOrder();
        });

        // Success modal buttons
        $('#createAnotherBtn').on('click', function() {
            self.resetForm();
            $('#successModal').addClass('hidden');
        });

        $('#goToDashboardBtn').on('click', function() {
            window.location.href = '/dashboard.html';
        });

        // Allow Enter key to add to cart
        $('#qtyInput').on('keypress', function(e) {
            if (e.which === 13) {
                self.addToCart();
            }
        });
    },

    /**
     * Setup user info display
     */
    setupUserInfo() {
        const user = Auth.getUser();
        if (user) {
            $('#userName').text(user.username || '-');
            $('#userRole').text(user.role || '-');
        }
    },

    /**
     * Load suppliers and items data
     */
    async loadData() {
        try {
            // Load suppliers and items in parallel
            const [suppliers, items] = await Promise.all([
                ApiService.getSuppliers(),
                ApiService.getItems()
            ]);

            this.suppliers = suppliers;
            this.items = items;

            this.populateSuppliers();
            this.populateItems();
        } catch (error) {
            this.showError('Gagal memuat data: ' + error.message);
        }
    },

    /**
     * Populate supplier dropdown
     */
    populateSuppliers() {
        const $select = $('#supplierSelect');
        $select.empty();
        $select.append('<option value="">-- Pilih Supplier --</option>');

        this.suppliers.forEach(supplier => {
            $select.append(`<option value="${supplier.id}">${supplier.name}</option>`);
        });
    },

    /**
     * Populate item dropdown
     */
    populateItems() {
        const $select = $('#itemSelect');
        $select.empty();
        $select.append('<option value="">-- Pilih Item --</option>');

        this.items.forEach(item => {
            const price = this.formatCurrency(item.price);
            $select.append(`<option value="${item.id}" data-price="${item.price}">${item.name} - ${price}</option>`);
        });
    },

    /**
     * Validate form inputs
     * @returns {boolean} True if valid
     */
    validateForm() {
        let isValid = true;

        // Reset errors
        $('#supplierError, #itemError, #qtyError').addClass('hidden').text('');

        // Validate supplier
        const supplierId = $('#supplierSelect').val();
        if (!supplierId) {
            $('#supplierError').text('Supplier harus dipilih').removeClass('hidden');
            isValid = false;
        }

        // Validate item
        const itemId = $('#itemSelect').val();
        if (!itemId) {
            $('#itemError').text('Item harus dipilih').removeClass('hidden');
            isValid = false;
        }

        // Validate quantity
        const qty = parseInt($('#qtyInput').val());
        if (!qty || qty < 1) {
            $('#qtyError').text('Quantity harus lebih dari 0').removeClass('hidden');
            isValid = false;
        }

        return isValid;
    },

    /**
     * Add item to cart
     */
    addToCart() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        const itemId = parseInt($('#itemSelect').val());
        const qty = parseInt($('#qtyInput').val());
        const item = this.items.find(i => i.id === itemId);

        if (!item) {
            this.showError('Item tidak ditemukan');
            return;
        }

        // Check if item already in cart
        const existingIndex = this.cart.findIndex(cartItem => cartItem.itemId === itemId);
        
        if (existingIndex >= 0) {
            // Update quantity if item already exists
            this.cart[existingIndex].qty += qty;
        } else {
            // Add new item to cart
            this.cart.push({
                itemId: itemId,
                itemName: item.name,
                price: parseFloat(item.price),
                qty: qty,
                subtotal: parseFloat(item.price) * qty
            });
        }

        // Recalculate subtotal for updated item
        if (existingIndex >= 0) {
            this.cart[existingIndex].subtotal = this.cart[existingIndex].price * this.cart[existingIndex].qty;
        }

        // Update UI
        this.updateCartDisplay();
        this.resetItemForm();
    },

    /**
     * Remove item from cart
     * @param {number} itemId - Item ID to remove
     */
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.itemId !== itemId);
        this.updateCartDisplay();
    },

    /**
     * Update cart display
     */
    updateCartDisplay() {
        const $cartTableBody = $('#cartTableBody');
        const $cartTable = $('#cartTable');
        const $emptyCartState = $('#emptyCartState');
        const $submitSection = $('#submitSection');

        // Clear table body
        $cartTableBody.empty();

        if (this.cart.length === 0) {
            // Show empty state
            $cartTable.addClass('hidden');
            $emptyCartState.removeClass('hidden');
            $submitSection.addClass('hidden');
            $('#grandTotal').text('Rp 0');
        } else {
            // Show cart table
            $cartTable.removeClass('hidden');
            $emptyCartState.addClass('hidden');
            $submitSection.removeClass('hidden');

            // Calculate grand total
            let grandTotal = 0;

            // Populate cart items
            this.cart.forEach((item, index) => {
                grandTotal += item.subtotal;

                const row = `
                    <tr class="fade-in">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${index + 1}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.itemName}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${this.formatCurrency(item.price)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.qty}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${this.formatCurrency(item.subtotal)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                                class="text-red-600 hover:text-red-800 remove-item-btn" 
                                data-item-id="${item.itemId}"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
                $cartTableBody.append(row);
            });

            // Update grand total
            $('#grandTotal').text(this.formatCurrency(grandTotal));

            // Attach remove button handlers
            $('.remove-item-btn').on('click', (e) => {
                const itemId = parseInt($(e.currentTarget).data('item-id'));
                this.removeFromCart(itemId);
            });
        }
    },

    /**
     * Reset item form
     */
    resetItemForm() {
        $('#itemSelect').val('');
        $('#qtyInput').val(1);
        $('#itemError, #qtyError').addClass('hidden');
    },

    /**
     * Reset entire form
     */
    resetForm() {
        $('#supplierSelect').val('');
        this.resetItemForm();
        this.cart = [];
        this.updateCartDisplay();
        $('#supplierError').addClass('hidden');
    },

    /**
     * Submit order to backend
     */
    async submitOrder() {
        // Validate supplier is selected
        const supplierId = $('#supplierSelect').val();
        if (!supplierId) {
            $('#supplierError').text('Supplier harus dipilih').removeClass('hidden');
            $('#supplierSelect').focus();
            return;
        }

        // Validate cart is not empty
        if (this.cart.length === 0) {
            this.showError('Keranjang tidak boleh kosong');
            return;
        }

        // Prepare request data
        const requestData = {
            supplierId: parseInt(supplierId),
            details: this.cart.map(item => ({
                itemId: item.itemId,
                qty: item.qty
            }))
        };

        // Show loading state
        $('#submitOrderBtn').prop('disabled', true).html(`
            <svg class="animate-spin h-5 w-5 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses...
        `);

        try {
            const response = await ApiService.createPurchasing(requestData);
            
            // Show success modal
            const grandTotal = this.formatCurrency(response.purchasing.grandTotal);
            $('#successMessage').text(`Purchase order berhasil dibuat dengan total ${grandTotal}`);
            $('#successModal').removeClass('hidden');

            // Reset form
            this.resetForm();
        } catch (error) {
            this.showError('Gagal membuat purchase order: ' + error.message);
        } finally {
            // Reset button state
            $('#submitOrderBtn').prop('disabled', false).html(`
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Submit Order
            `);
        }
    },

    /**
     * Format number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        alert(message); // Simple alert, can be replaced with better UI
        console.error(message);
    }
};

// Initialize when DOM is ready
$(document).ready(function() {
    CreatePurchaseController.init();
});

