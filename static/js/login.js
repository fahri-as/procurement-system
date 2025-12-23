/**
 * Login Page Controller
 * Handles login form submission and user authentication
 */
$(document).ready(function() {
    const $loginForm = $('#loginForm');
    const $usernameInput = $('#username');
    const $passwordInput = $('#password');
    const $submitBtn = $('#submitBtn');
    const $submitText = $('#submitText');
    const $submitSpinner = $('#submitSpinner');
    const $errorAlert = $('#errorAlert');
    const $errorMessage = $('#errorMessage');
    const $successAlert = $('#successAlert');
    const $successMessage = $('#successMessage');
    const $usernameError = $('#usernameError');
    const $passwordError = $('#passwordError');
    const $togglePassword = $('#togglePassword');
    const $eyeIcon = $('#eyeIcon');
    const $eyeOffIcon = $('#eyeOffIcon');

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        $errorMessage.text(message);
        $errorAlert.removeClass('hidden').addClass('error-message');
        $successAlert.addClass('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    /**
     * Hide error message
     */
    function hideError() {
        $errorAlert.addClass('hidden');
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    function showSuccess(message) {
        $successMessage.text(message);
        $successAlert.removeClass('hidden').addClass('error-message');
        $errorAlert.addClass('hidden');
    }

    /**
     * Hide success message
     */
    function hideSuccess() {
        $successAlert.addClass('hidden');
    }

    /**
     * Show field error
     * @param {string} fieldId - Field ID (username or password)
     * @param {string} message - Error message
     */
    function showFieldError(fieldId, message) {
        const $fieldError = $(`#${fieldId}Error`);
        $fieldError.text(message).removeClass('hidden');
        $(`#${fieldId}`).addClass('border-red-500');
    }

    /**
     * Clear field errors
     */
    function clearFieldErrors() {
        $usernameError.addClass('hidden');
        $passwordError.addClass('hidden');
        $usernameInput.removeClass('border-red-500');
        $passwordInput.removeClass('border-red-500');
    }

    /**
     * Set loading state
     * @param {boolean} isLoading - Whether form is loading
     */
    function setLoading(isLoading) {
        if (isLoading) {
            $submitBtn.addClass('btn-loading').prop('disabled', true);
            $submitText.text('Memproses...');
            $submitSpinner.removeClass('hidden');
        } else {
            $submitBtn.removeClass('btn-loading').prop('disabled', false);
            $submitText.text('Masuk');
            $submitSpinner.addClass('hidden');
        }
    }

    /**
     * Validate form inputs
     * @returns {boolean} True if form is valid
     */
    function validateForm() {
        let isValid = true;
        clearFieldErrors();

        const username = $usernameInput.val().trim();
        const password = $passwordInput.val();

        // Validate username
        if (!username) {
            showFieldError('username', 'Username wajib diisi');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError('username', 'Username minimal 3 karakter');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showFieldError('password', 'Password wajib diisi');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError('password', 'Password minimal 6 karakter');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handle login API request
     * @param {string} username - Username
     * @param {string} password - Password
     */
    function handleLogin(username, password) {
        const loginData = {
            username: username,
            password: password
        };

        const apiUrl = ApiConfig.baseURL + ApiConfig.endpoints.login;
        
        // Debug logging
        console.log('Login attempt:', {
            url: apiUrl,
            username: username,
            data: loginData
        });

        $.ajax({
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            timeout: ApiConfig.timeout,
            dataType: 'json',
            success: function(response) {
                console.log('Login success response:', response);
                
                // Validate response structure
                if (!response || !response.token) {
                    console.error('Invalid response structure:', response);
                    setLoading(false);
                    Notification.error(
                        'Response Tidak Valid',
                        'Response dari server tidak valid. Token tidak ditemukan.'
                    );
                    return;
                }

                try {
                    // Save token and user data
                    Auth.saveToken(response.token);
                    if (response.user) {
                        Auth.saveUser(response.user);
                    }

                    // Show success notification
                    Notification.success('Login Berhasil', 'Mengalihkan ke dashboard...', 1000);

                    // Redirect to dashboard or home page
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 1000);
                } catch (error) {
                    console.error('Error saving auth data:', error);
                    setLoading(false);
                    Notification.error(
                        'Gagal Menyimpan Data',
                        'Gagal menyimpan data autentikasi: ' + error.message
                    );
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                setLoading(false);
                
                console.error('Login error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    responseText: xhr.responseText,
                    responseJSON: xhr.responseJSON
                });
                
                let errorMsg = 'Terjadi kesalahan saat login';
                let errorDetail = '';
                
                // Handle different error scenarios
                if (xhr.status === 0) {
                    errorMsg = 'Tidak dapat terhubung ke server';
                    errorDetail = 'Pastikan server berjalan di ' + apiUrl;
                } else if (xhr.status === 401) {
                    errorMsg = 'Username atau password salah';
                    errorDetail = xhr.responseJSON?.error || 'Kredensial yang dimasukkan tidak valid';
                } else if (xhr.status === 400) {
                    errorMsg = 'Data tidak valid';
                    errorDetail = xhr.responseJSON?.error || 'Format data yang dikirim tidak sesuai';
                } else if (xhr.status === 404) {
                    errorMsg = 'Endpoint tidak ditemukan';
                    errorDetail = 'URL: ' + apiUrl;
                } else if (xhr.status === 500) {
                    errorMsg = 'Kesalahan server';
                    errorDetail = xhr.responseJSON?.error || 'Terjadi kesalahan pada server';
                } else if (textStatus === 'timeout') {
                    errorMsg = 'Request timeout';
                    errorDetail = 'Server tidak merespons dalam waktu yang ditentukan';
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                    errorDetail = xhr.responseJSON.message || '';
                } else if (xhr.responseText) {
                    // Try to parse response text as JSON
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMsg = errorResponse.error || errorMsg;
                        errorDetail = errorResponse.message || '';
                    } catch (e) {
                        errorDetail = xhr.responseText.substring(0, 100);
                    }
                }

                // Show error notification
                Notification.error(
                    'Login Gagal',
                    errorMsg,
                    errorDetail || ''
                );
                
                if (errorDetail) {
                    console.error('Error detail:', errorDetail);
                }
            }
        });
    }

    /**
     * Handle form submission
     */
    $loginForm.on('submit', function(e) {
        e.preventDefault();
        
        hideError();
        hideSuccess();
        clearFieldErrors();

        if (!validateForm()) {
            return;
        }

        const username = $usernameInput.val().trim();
        const password = $passwordInput.val();

        setLoading(true);
        handleLogin(username, password);
    });

    /**
     * Toggle password visibility
     */
    $togglePassword.on('click', function() {
        const isPassword = $passwordInput.attr('type') === 'password';
        
        if (isPassword) {
            $passwordInput.attr('type', 'text');
            $eyeIcon.addClass('hidden');
            $eyeOffIcon.removeClass('hidden');
        } else {
            $passwordInput.attr('type', 'password');
            $eyeIcon.removeClass('hidden');
            $eyeOffIcon.addClass('hidden');
        }
    });

    /**
     * Clear errors on input focus
     */
    $usernameInput.on('focus', function() {
        hideError();
        $usernameError.addClass('hidden');
        $(this).removeClass('border-red-500');
    });

    $passwordInput.on('focus', function() {
        hideError();
        $passwordError.addClass('hidden');
        $(this).removeClass('border-red-500');
    });

    /**
     * Check if user is already logged in
     */
    if (Auth.isAuthenticated()) {
        // Optionally redirect if already logged in
        // window.location.href = '/dashboard.html';
    }
});

