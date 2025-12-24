/**
 * Suppliers CRUD Page
 */
$(document).ready(function () {
  const $mobileMenuBtn = $("#mobileMenuBtn");
  const $mobileMenuOverlay = $("#mobileMenuOverlay");
  const $sidebar = $("#sidebar");
  const $logoutBtn = $("#logoutBtn");

  const $formTitle = $("#formTitle");
  const $saveSupplierBtn = $("#saveSupplierBtn");
  const $resetFormBtn = $("#resetFormBtn");

  const $supplierNameInput = $("#supplierNameInput");
  const $supplierEmailInput = $("#supplierEmailInput");
  const $supplierAddressInput = $("#supplierAddressInput");

  const $supplierNameError = $("#supplierNameError");
  const $supplierEmailError = $("#supplierEmailError");
  const $supplierAddressError = $("#supplierAddressError");

  const $supplierTableBody = $("#supplierTableBody");
  const $supplierEmptyState = $("#supplierEmptyState");
  const $refreshBtn = $("#refreshBtn");

  let suppliers = [];
  let editingId = null;

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

  function clearErrors() {
    [$supplierNameError, $supplierEmailError, $supplierAddressError].forEach(($el) => $el.addClass("hidden").text(""));
  }

  function resetForm() {
    editingId = null;
    $formTitle.text("Tambah Supplier");
    $supplierNameInput.val("");
    $supplierEmailInput.val("");
    $supplierAddressInput.val("");
    $resetFormBtn.addClass("hidden");
    clearErrors();
  }

  function fillForm(supplier) {
    editingId = supplier.id;
    $formTitle.text(`Edit Supplier #${supplier.id}`);
    $supplierNameInput.val(supplier.name);
    $supplierEmailInput.val(supplier.email);
    $supplierAddressInput.val(supplier.address || "");
    $resetFormBtn.removeClass("hidden");
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    if (!$supplierNameInput.val().trim()) {
      $supplierNameError.text("Nama wajib diisi").removeClass("hidden");
      valid = false;
    }

    const email = $supplierEmailInput.val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      $supplierEmailError.text("Email tidak valid").removeClass("hidden");
      valid = false;
    }

    return valid;
  }

  function renderTable() {
    $supplierTableBody.empty();

    if (!suppliers.length) {
      $supplierTableBody.append($supplierEmptyState);
      $supplierEmptyState.removeClass("hidden");
      return;
    }

    $supplierEmptyState.addClass("hidden");

    suppliers.forEach((supplier) => {
      const row = `
        <tr class="hover:bg-gray-50 fade-in">
          <td class="px-6 py-4 text-sm text-gray-900 font-medium">#${supplier.id}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${supplier.name}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${supplier.email}</td>
          <td class="px-6 py-4 text-sm text-gray-900">${supplier.address || "-"}</td>
          <td class="px-6 py-4 text-sm text-gray-900">
            <div class="flex items-center space-x-2">
              <button class="editSupplierBtn px-3 py-1 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100" data-id="${supplier.id}">Edit</button>
              <button class="deleteSupplierBtn px-3 py-1 text-red-700 bg-red-50 rounded-lg hover:bg-red-100" data-id="${supplier.id}">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      $supplierTableBody.append(row);
    });
  }

  function loadSuppliers() {
    return ApiService.getSuppliers()
      .then((data) => {
        suppliers = data;
        renderTable();
      })
      .catch((err) => {
        Notification.error("Gagal Memuat Supplier", err.message, err.detail || "");
      });
  }

  function handleSave() {
    if (!validateForm()) return;

    const payload = {
      name: $supplierNameInput.val().trim(),
      email: $supplierEmailInput.val().trim(),
      address: $supplierAddressInput.val().trim(),
    };

    $saveSupplierBtn.prop("disabled", true).addClass("opacity-60");

    const action = editingId
      ? ApiService.updateSupplier(editingId, payload)
      : ApiService.createSupplier(payload);

    action
      .then(() => {
        Notification.success("Berhasil", editingId ? "Supplier diperbarui" : "Supplier ditambahkan", 1500);
        return loadSuppliers();
      })
      .then(() => resetForm())
      .catch((err) => Notification.error("Gagal Menyimpan", err.message, err.detail || ""))
      .finally(() => $saveSupplierBtn.prop("disabled", false).removeClass("opacity-60"));
  }

  function handleEditClick(id) {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;
    fillForm(supplier);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteClick(id) {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;

    Notification.confirm("Hapus Supplier", `Hapus "${supplier.name}"?`, "Ya, Hapus", "Batal").then((confirmed) => {
      if (!confirmed) return;
      Notification.loading("Menghapus...");
      ApiService.deleteSupplier(id)
        .then(() => {
          Notification.close();
          Notification.success("Berhasil", "Supplier dihapus", 1200);
          return loadSuppliers();
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

    $saveSupplierBtn.on("click", handleSave);
    $resetFormBtn.on("click", resetForm);
    $refreshBtn.on("click", () => loadSuppliers());

    $supplierTableBody.on("click", ".editSupplierBtn", function () {
      const id = parseInt($(this).data("id"), 10);
      handleEditClick(id);
    });

    $supplierTableBody.on("click", ".deleteSupplierBtn", function () {
      const id = parseInt($(this).data("id"), 10);
      handleDeleteClick(id);
    });
  }

  function init() {
    if (!checkAuthentication()) return;
    loadUserInfo();
    bindEvents();
    loadSuppliers();
  }

  init();
});

