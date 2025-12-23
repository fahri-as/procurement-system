/**
 * Notification Utility
 * Provides clean and user-friendly error/success notifications using SweetAlert2
 */

const Notification = {
  /**
   * Show error notification
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {string} detail - Optional error detail
   */
  error(title, message, detail = '') {
    const fullMessage = detail ? `${message}\n\n${detail}` : message;
    
    Swal.fire({
      icon: 'error',
      title: title || 'Terjadi Kesalahan',
      text: fullMessage,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    });
  },

  /**
   * Show success notification
   * @param {string} title - Success title
   * @param {string} message - Success message
   * @param {number} timer - Auto close timer in milliseconds (optional)
   */
  success(title, message, timer = null) {
    const options = {
      icon: 'success',
      title: title || 'Berhasil',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    };

    if (timer) {
      options.timer = timer;
      options.timerProgressBar = true;
      options.showConfirmButton = false;
    }

    Swal.fire(options);
  },

  /**
   * Show warning notification
   * @param {string} title - Warning title
   * @param {string} message - Warning message
   */
  warning(title, message) {
    Swal.fire({
      icon: 'warning',
      title: title || 'Peringatan',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    });
  },

  /**
   * Show info notification
   * @param {string} title - Info title
   * @param {string} message - Info message
   */
  info(title, message) {
    Swal.fire({
      icon: 'info',
      title: title || 'Informasi',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    });
  },

  /**
   * Show confirmation dialog
   * @param {string} title - Confirmation title
   * @param {string} message - Confirmation message
   * @param {string} confirmText - Confirm button text
   * @param {string} cancelText - Cancel button text
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed
   */
  confirm(title, message, confirmText = 'Ya', cancelText = 'Tidak') {
    return Swal.fire({
      icon: 'question',
      title: title || 'Konfirmasi',
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      }
    }).then((result) => {
      return result.isConfirmed;
    });
  },

  /**
   * Show loading notification
   * @param {string} message - Loading message
   */
  loading(message = 'Memproses...') {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-lg'
      }
    });
  },

  /**
   * Close current notification
   */
  close() {
    Swal.close();
  }
};

