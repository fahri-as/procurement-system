/**
 * Inventory CRUD Page
 */
$(document).ready(function () {
  const $mobileMenuBtn = $("#mobileMenuBtn");
  const $mobileMenuOverlay = $("#mobileMenuOverlay");
  const $sidebar = $("#sidebar");
  const $logoutBtn = $("#logoutBtn");

  const $formTitle = $("#formTitle");
  const $saveItemBtn = $("#saveItemBtn");
  const $resetFormBtn = $("#resetFormBtn");

  const $itemNameInput = $("#itemNameInput");
  const $itemPriceInput = $("#itemPriceInput");
  const $itemStockInput = $("#itemStockInput");
  const $itemSupplierSelect = $("#itemSupplierSelect");

  const $itemNameError = $("#itemNameError");
  const $itemPriceError = $("#itemPriceError");
  const $itemStockError = $("#itemStockError");
  const $itemSupplierError = $("#itemSupplierError");

  const $filterSupplierSelect = $("#filterSupplierSelect");
  const $refreshBtn = $("#refreshBtn");

  const $inventoryTableBody = $("#inventoryTableBody");
  const $inventoryEmptyState = $("#inventoryEmptyState");

  let editingItemId = null;
  let suppliers = [];
  let items = [];

  function checkAuthentication() {
    if (!Auth.isAuthenticated()) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  function loadUserInfo() {
    const user = Auth.getUser();
    $("#userName").text(user?.username || "-");
    $("#userRole").text(user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "-");
  }

  function toggleMobileMenu() {
    $sidebar.toggleClass("open");
    $mobileMenuOverlay.toggleClass("hidden");
  }

  function closeMobileMenu() {
    $sidebar.removeClass("open");
    $mobileMenuOverlay.addClass("hidden");
  }

  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  }

  function setLoading(isLoading) {
    $saveItemBtn.prop("disabled", isLoading).toggleClass("opacity-60", isLoading);
  }

  function clearErrors() {
    [$itemNameError, $itemPriceError, $itemStockError, $itemSupplierError].forEach(($el) => $el.addClass("hidden").text(""));
  }

  function resetForm() {
    editingItemId = null;
    $formTitle.text("Tambah Item");
    $itemNameInput.val("");
    $itemPriceInput.val("");
    $itemStockInput.val("");
    $itemSupplierSelect.val("");
    $resetFormBtn.addClass("hidden");
    clearErrors();
  }

  function fillForm(item) {
    editingItemId = item.id;
    $formTitle.text(`Edit Item #${item.id}`);
    $itemNameInput.val(item.name);
    $itemPriceInput.val(item.price);
    $itemStockInput.val(item.stock);
    $itemSupplierSelect.val(item.supplierId);
    $resetFormBtn.removeClass("hidden");
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    if (!$itemNameInput.val().trim()) {
      $itemNameError.text("Nama wajib diisi").removeClass("hidden");
      valid = false;
    }

    const price = parseFloat($itemPriceInput.val());
    if (isNaN(price) || price < 0) {
      $itemPriceError.text("Harga tidak valid").removeClass("hidden");
      valid = false;
    }

    const stock = parseInt($itemStockInput.val(), 10);
    if (isNaN(stock) || stock < 0) {
      $itemStockError.text("Stok tidak valid").removeClass("hidden");
      valid = false;
    }

    if (!$itemSupplierSelect.val()) {
      $itemSupplierError.text("Supplier wajib dipilih").removeClass("hidden");
      valid = false;
    }

    return valid;
  }

  function renderSuppliersOptions() {
    const supplierOptions = suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");

    $itemSupplierSelect.find("option:not(:first)").remove();
    $itemSupplierSelect.append(supplierOptions);

    $filterSupplierSelect.find("option:not(:first)").remove();
    $filterSupplierSelect.append(supplierOptions);
  }

  function renderInventoryTable() {
    $inventoryTableBody.empty();

    if (!items.length) {
      $inventoryTableBody.append($inventoryEmptyState);
      $inventoryEmptyState.removeClass("hidden");
      return;
    }

    $inventoryEmptyState.addClass("hidden");

    items.forEach((item) => {
      const supplier = suppliers.find((s) => s.id === item.supplierId);
      const row = `
        <tr class="hover:bg-gray-50 fade-in">
          <td class="px-6 py-4 text-sm text-gray-900 font-medium">#${item.id}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${item.name}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${supplier ? supplier.name : "-"}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${formatCurrency(item.price)}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${item.stock}</td>
          <td class="px-6 py-4 text-sm text-gray-900">
            <div class="flex items-center space-x-2">
              <button class="editItemBtn px-3 py-1 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100" data-id="${item.id}">Edit</button>
              <button class="deleteItemBtn px-3 py-1 text-red-700 bg-red-50 rounded-lg hover:bg-red-100" data-id="${item.id}">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      $inventoryTableBody.append(row);
    });
  }

  function loadSuppliers() {
    return ApiService.getSuppliers()
      .then((data) => {
        suppliers = data;
        renderSuppliersOptions();
      })
      .catch((err) => {
        Notification.error("Gagal Memuat Supplier", err.message, err.detail || "");
      });
  }

  function loadItems() {
    const supplierId = $filterSupplierSelect.val();
    return ApiService.getItems(supplierId || null)
      .then((data) => {
        items = data;
        renderInventoryTable();
      })
      .catch((err) => {
        Notification.error("Gagal Memuat Inventory", err.message, err.detail || "");
      });
  }

  function handleSaveItem() {
    if (!validateForm()) return;

    const payload = {
      name: $itemNameInput.val().trim(),
      price: parseFloat($itemPriceInput.val() || "0").toString(),
      stock: parseInt($itemStockInput.val() || "0", 10),
      supplierId: parseInt($itemSupplierSelect.val(), 10),
    };

    setLoading(true);

    const action = editingItemId ? ApiService.updateItem(editingItemId, payload) : ApiService.createItem(payload);

    action
      .then(() => {
        Notification.success("Berhasil", editingItemId ? "Item berhasil diperbarui" : "Item berhasil ditambahkan", 1500);
        return loadItems();
      })
      .then(() => resetForm())
      .catch((err) => Notification.error("Gagal Menyimpan Item", err.message, err.detail || ""))
      .finally(() => setLoading(false));
  }

  function handleEditClick(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    fillForm(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteClick(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    Notification.confirm("Hapus Item", `Hapus "${item.name}"?`, "Ya, Hapus", "Batal").then((confirmed) => {
      if (!confirmed) return;

      Notification.loading("Menghapus...");
      ApiService.deleteItem(id)
        .then(() => {
          Notification.close();
          Notification.success("Berhasil", "Item dihapus", 1200);
          return loadItems();
        })
        .catch((err) => {
          Notification.close();
          Notification.error("Gagal Menghapus", err.message, err.detail || "");
        });
    });
  }

  function bindEvents() {
    $mobileMenuBtn.on("click", toggleMobileMenu);
    $mobileMenuOverlay.on("click", closeMobileMenu);
    $(window).on("resize", () => {
      if ($(window).width() > 768) closeMobileMenu();
    });

    $logoutBtn.on("click", async () => {
      const confirmed = await Notification.confirm("Konfirmasi Logout", "Apakah Anda yakin ingin logout?", "Ya, Logout", "Batal");
      if (confirmed) {
        Auth.logout();
        window.location.href = "/login.html";
      }
    });

    $saveItemBtn.on("click", handleSaveItem);
    $resetFormBtn.on("click", resetForm);

    $refreshBtn.on("click", () => {
      loadItems();
    });

    $filterSupplierSelect.on("change", () => loadItems());

    $inventoryTableBody.on("click", ".editItemBtn", function () {
      const id = parseInt($(this).data("id"), 10);
      handleEditClick(id);
    });

    $inventoryTableBody.on("click", ".deleteItemBtn", function () {
      const id = parseInt($(this).data("id"), 10);
      handleDeleteClick(id);
    });
  }

  async function init() {
    if (!checkAuthentication()) return;
    loadUserInfo();
    bindEvents();
    await loadSuppliers();
    await loadItems();
  }

  init();
});
