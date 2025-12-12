// ========== DOM ELEMENTS ==========
const elements = {
    // Mobile Elements
    mobileMenu: document.querySelector('.mobile-menu'),
    menuToggle: document.querySelector('.menu-toggle'),
    menuClose: document.querySelector('.menu-close'),
    
    // Form Elements
    loginToggle: document.getElementById('loginToggle'),
    signupToggle: document.getElementById('signupToggle'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    formTitle: document.getElementById('formTitle'),
    formSubtitle: document.getElementById('formSubtitle'),
    
    // Switch Buttons
    switchButtons: document.querySelectorAll('.switch-btn'),
    
    // Password Toggles
    passwordToggles: document.querySelectorAll('.password-toggle-btn'),
    
    // Progress Elements
    progressSteps: document.querySelectorAll('.progress-step'),
    progressFill: document.querySelector('.progress-fill'),
    stepCircles: document.querySelectorAll('.step-circle'),
    
    // Form Elements
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    username: document.getElementById('username'),
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    fanLevel: document.getElementById('fanLevel'),
    favoriteSong: document.getElementById('favoriteSong'),
    termsAgreement: document.getElementById('termsAgreement'),
    newsletterSubscription: document.getElementById('newsletterSubscription'),
    rememberMe: document.getElementById('rememberMe'),
    
    // Modal Elements
    forgotPasswordLink: document.querySelector('.forgot-password-link'),
    forgotPasswordModal: document.getElementById('forgotPasswordModal'),
    modalClose: document.querySelector('.modal-close'),
    modalSubmitBtn: document.querySelector('.modal-submit-btn'),
    resetEmail: document.getElementById('resetEmail'),
    
    // Back to Top
    backToTopBtn: document.querySelector('.back-to-top'),
    
    // Social Buttons
    socialButtons: document.querySelectorAll('.social-btn'),
    
    // Submit Buttons
    loginSubmitBtn: document.querySelector('.login-submit-btn'),
    signupSubmitBtn: document.querySelector('.signup-submit-btn'),
};

// ========== STATE MANAGEMENT ==========
const state = {
    currentForm: 'login',
    isMobileMenuOpen: false,
    notifications: [],
    isSubmitting: false,
    auth: null,
    database: null
};

// ========== FIREBASE INITIALIZATION ==========
async function initFirebase() {
    try {
        // Check if Firebase is initialized
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }

        // Wait for firebase-config.js to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get Firebase services
        state.auth = window.firebaseAuth;
        state.database = window.firebaseDatabase;

        if (!state.auth || !state.database) {
            throw new Error('Firebase services not available');
        }

        console.log('✅ Firebase services loaded successfully');
        
        // Monitor auth state
        state.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User is signed in:', user.email);
                // You can redirect to dashboard here if needed
                // window.location.href = 'dashboard.html';
            } else {
                console.log('User is signed out');
            }
        });

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showNotification('Unable to connect to authentication service. Please refresh the page.', 'error');
    }
}

// ========== FIREBASE AUTHENTICATION FUNCTIONS ==========
// ========== FIREBASE AUTHENTICATION FUNCTIONS ==========
// ========== FINAL WORKING signUpWithEmail (Firebase v12 modular) ==========
async function signUpWithEmail(email, password, userData) {
    try {
        if (!state.auth || !state.database) {
            throw new Error('Firebase not initialized');
        }

        // Grab ALL needed modular functions in one go
        const {
            createUserWithEmailAndPassword,
            updateProfile,
            sendEmailVerification
        } = window.firebaseAuthFunctions;

        const { ref, set } = window.firebaseDatabaseFunctions;

        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(state.auth, email, password);
        const user = userCredential.user;

        // 2. Update display name (modular style)
        await updateProfile(user, { displayName: userData.username });

        // 3. Save full profile to Realtime Database
        const userRef = ref(state.database, 'users/' + user.uid);
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fanLevel: userData.fanLevel,
            favoriteSong: userData.favoriteSong || '',
            newsletterSubscription: userData.newsletterSubscription,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });

        // 4. Send verification email
        await sendEmailVerification(user);

        console.log('✅ User fully registered + profile saved!');
        return { success: true, user };

    } catch (error) {
        console.error('Signup error details:', error.code, error.message);

        let msg = 'Signup failed. Try again.';
        if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
        if (error.code === 'auth/weak-password') msg = 'Password too weak (minimum 6 characters).';
        if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
        if (error.code === 'auth/network-request-failed') msg = 'Check your internet connection.';

        return { success: false, error: msg };
    }
}

async function signInWithEmail(email, password, rememberMe) {
    try {
        // Use modular syntax for setPersistence and signInWithEmailAndPassword
        const { setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword } = window.firebaseAuthFunctions;
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        
        await setPersistence(state.auth, persistence);
        
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(state.auth, email, password);
        const user = userCredential.user;
        
        // Update last login time in database (use modular ref and set)
        if (user) {
            const { ref, set } = window.firebaseDatabaseFunctions;
            const userRef = ref(state.database, 'users/' + user.uid + '/lastLogin');
            await set(userRef, new Date().toISOString());
        }
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function resetPassword(email) {
    try {
        // Use modular syntax for sendPasswordResetEmail
        const { sendPasswordResetEmail } = window.firebaseAuthFunctions;
        await sendPasswordResetEmail(state.auth, email);
        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    elements.menuToggle?.addEventListener('click', () => {
        state.isMobileMenuOpen = true;
        elements.mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    elements.menuClose?.addEventListener('click', closeMobileMenu);

    // Close menu when clicking outside
    elements.mobileMenu?.addEventListener('click', (e) => {
        if (e.target === elements.mobileMenu) {
            closeMobileMenu();
        }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    state.isMobileMenuOpen = false;
    elements.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== FORM SWAPPING ==========
function initFormSwapping() {
    // Toggle buttons
    elements.loginToggle?.addEventListener('click', () => switchForm('login'));
    elements.signupToggle?.addEventListener('click', () => switchForm('signup'));

    // Switch buttons
    elements.switchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetForm = button.dataset.switchTo;
            switchForm(targetForm);
        });
    });

    // Progress steps
    elements.progressSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            const targetForm = index === 0 ? 'login' : 'signup';
            switchForm(targetForm);
        });
    });
}

function switchForm(formName) {
    if (state.currentForm === formName || state.isSubmitting) return;

    // Update state
    state.currentForm = formName;

    // Animate form transition
    const oldForm = formName === 'login' ? elements.signupForm : elements.loginForm;
    const newForm = formName === 'login' ? elements.loginForm : elements.signupForm;

    // Add exit animation to old form
    oldForm.classList.add('exiting');
    setTimeout(() => {
        oldForm.classList.remove('active', 'exiting');
        
        // Show new form
        newForm.classList.add('active');
        
        // Update UI
        updateFormUI(formName);
        updateProgress(formName);
        
        // Focus first input
        focusFirstInput(newForm);
    }, 300);

    // Update toggle buttons
    updateToggleButtons(formName);
}

function updateFormUI(formName) {
    if (formName === 'login') {
        elements.formTitle.textContent = 'Welcome Back!';
        elements.formSubtitle.textContent = 'Sign in to access exclusive fan content';
    } else {
        elements.formTitle.textContent = 'Join Our Community';
        elements.formSubtitle.textContent = 'Create your account in less than a minute';
    }
}

function updateToggleButtons(formName) {
    elements.loginToggle?.classList.toggle('active', formName === 'login');
    elements.signupToggle?.classList.toggle('active', formName === 'signup');
}

function updateProgress(formName) {
    const progress = formName === 'login' ? '50%' : '100%';
    elements.progressFill.style.width = progress;

    // Update progress steps
    elements.progressSteps.forEach((step, index) => {
        step.classList.toggle('active', 
            (formName === 'login' && index === 0) || 
            (formName === 'signup' && index === 1)
        );
    });

    // Update step circles
    elements.stepCircles.forEach((circle, index) => {
        circle.classList.toggle('active',
            (formName === 'login' && index === 0) ||
            (formName === 'signup' && index === 1)
        );
    });
}

function focusFirstInput(form) {
    const firstInput = form.querySelector('input, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// ========== PASSWORD TOGGLE ==========
function initPasswordToggle() {
    elements.passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const inputId = this.id === 'toggleLoginPassword' ? 'loginPassword' : 'signupPassword';
            const input = document.getElementById(inputId);
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
                this.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
                this.setAttribute('aria-label', 'Show password');
            }
        });
    });
}

// ========== FORM VALIDATION ==========
function initFormValidation() {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Real-time validation for email fields
    [elements.loginEmail, elements.signupEmail].forEach(input => {
        if (input) {
            input.addEventListener('blur', () => validateEmail(input));
            input.addEventListener('input', () => clearError(input));
        }
    });

    // Password validation
    [elements.loginPassword, elements.signupPassword, elements.confirmPassword].forEach(input => {
        if (input) {
            input.addEventListener('blur', () => validatePassword(input));
            input.addEventListener('input', () => clearError(input));
        }
    });

    // Username validation
    if (elements.username) {
        elements.username.addEventListener('blur', () => validateUsername(elements.username));
        elements.username.addEventListener('input', () => clearError(elements.username));
    }

    // Name validation
    if (elements.firstName) {
        elements.firstName.addEventListener('blur', () => validateName(elements.firstName, 'First name'));
        elements.firstName.addEventListener('input', () => clearError(elements.firstName));
    }

    if (elements.lastName) {
        elements.lastName.addEventListener('blur', () => validateName(elements.lastName, 'Last name'));
        elements.lastName.addEventListener('input', () => clearError(elements.lastName));
    }
}

function validateEmail(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
        showError(input, errorElement, 'Email is required');
        return false;
    }

    if (!emailRegex.test(value)) {
        showError(input, errorElement, 'Please enter a valid email address');
        return false;
    }

    clearError(input);
    return true;
}

function validatePassword(input) {
    const value = input.value;
    const errorElement = document.getElementById(input.id + 'Error');

    if (!value) {
        showError(input, errorElement, 'Password is required');
        return false;
    }

    if (value.length < 6) {
        showError(input, errorElement, 'Password must be at least 6 characters');
        return false;
    }

    // For confirm password, check if it matches
    if (input.id === 'confirmPassword' && elements.signupPassword) {
        if (value !== elements.signupPassword.value) {
            showError(input, errorElement, 'Passwords do not match');
            return false;
        }
    }

    clearError(input);
    return true;
}

function validateUsername(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!value) {
        showError(input, errorElement, 'Username is required');
        return false;
    }

    if (!value.startsWith('@')) {
        showError(input, errorElement, 'Username must start with @');
        return false;
    }

    if (value.length < 3) {
        showError(input, errorElement, 'Username must be at least 3 characters');
        return false;
    }

    clearError(input);
    return true;
}

function validateName(input, fieldName) {
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!value) {
        showError(input, errorElement, `${fieldName} is required`);
        return false;
    }

    if (value.length < 2) {
        showError(input, errorElement, `${fieldName} must be at least 2 characters`);
        return false;
    }

    clearError(input);
    return true;
}

function showError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error)';
    }
}

function clearError(input) {
    input.classList.remove('error');
    const errorElement = document.getElementById(input.id + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// ========== FORM SUBMISSION WITH FIREBASE ==========
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (state.isSubmitting) return;
    
    // Validate form
    const isEmailValid = validateEmail(elements.loginEmail);
    const isPasswordValid = validatePassword(elements.loginPassword);
    
    if (!isEmailValid || !isPasswordValid) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Start submission
    state.isSubmitting = true;
    setSubmitButtonState(elements.loginSubmitBtn, true, 'Signing in...');
    
    try {
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;
        const rememberMe = elements.rememberMe ? elements.rememberMe.checked : false;
        
        const result = await signInWithEmail(email, password, rememberMe);
        
        if (result.success) {
    showNotification('Successfully logged in! Redirecting...', 'success');
    
    // SAVE REAL USER DATA
    const userData = {
        uid: result.user.uid,
        email: email,
        name: result.user.displayName || email.split('@')[0],
        photoURL: result.user.photoURL || 'https://i.pravatar.cc/150',
        timestamp: Date.now()
    };
    
    localStorage.setItem('oliviafan_user', JSON.stringify(userData));
    
    // Redirect immediately
    window.location.href = 'dashboard.html';
    }else {
            // Handle specific Firebase errors
            let errorMessage = result.error;
            if (result.error.includes('wrong-password')) {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (result.error.includes('user-not-found')) {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (result.error.includes('too-many-requests')) {
                errorMessage = 'Too many failed attempts. Please try again later.';
            }
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        showNotification('An unexpected error occurred. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        state.isSubmitting = false;
        setSubmitButtonState(elements.loginSubmitBtn, false, 'Sign In');
    }
}

async function handleSignupSubmit(e) {
    e.preventDefault();
    
    if (state.isSubmitting) return;
    
    // Validate all fields
    const validations = [
        validateField(elements.firstName, 'First name is required'),
        validateField(elements.lastName, 'Last name is required'),
        validateField(elements.username, 'Username is required'),
        validateEmail(elements.signupEmail),
        validatePassword(elements.signupPassword),
        validatePassword(elements.confirmPassword)
    ];
    
    // Check terms agreement
    if (!elements.termsAgreement.checked) {
        showNotification('You must agree to the Terms of Service', 'error');
        return;
    }
    
    if (validations.includes(false)) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Start submission
    state.isSubmitting = true;
    setSubmitButtonState(elements.signupSubmitBtn, true, 'Creating account...');
    
    try {
        const userData = {
            email: elements.signupEmail.value.trim(),
            password: elements.signupPassword.value,
            firstName: elements.firstName.value.trim(),
            lastName: elements.lastName.value.trim(),
            username: elements.username.value.trim(),
            fanLevel: elements.fanLevel.value,
            favoriteSong: elements.favoriteSong.value.trim(),
            newsletterSubscription: elements.newsletterSubscription.checked
        };
        
        const result = await signUpWithEmail(userData.email, userData.password, userData);
        
        if (result.success) {
    showNotification('Welcome to the Olivia Fan family! Redirecting...', 'success');
    
    // Save login state + redirect
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
    
    return;
}
         else {
            // Handle specific Firebase errors
            let errorMessage = result.error;
            if (result.error.includes('email-already-in-use')) {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (result.error.includes('weak-password')) {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            }
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        showNotification('An unexpected error occurred. Please try again.', 'error');
        console.error('Signup error:', error);
    } finally {
        state.isSubmitting = false;
        setSubmitButtonState(elements.signupSubmitBtn, false, 'Create Account');
    }
}

// ========== HELPER FUNCTIONS ==========
function validateField(input, message) {
    if (!input) return true;
    
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');
    
    if (!value) {
        showError(input, errorElement, message);
        return false;
    }
    
    clearError(input);
    return true;
}

function setSubmitButtonState(button, isLoading, text = '') {
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.textContent = text;
    } else {
        button.disabled = false;
        if (btnText) {
            // Reset to appropriate text based on button type
            if (button.classList.contains('login-submit-btn')) {
                btnText.textContent = 'Sign In';
            } else if (button.classList.contains('signup-submit-btn')) {
                btnText.textContent = 'Create Account';
            } else if (button.classList.contains('modal-submit-btn')) {
                btnText.textContent = 'Send Reset Link';
            }
        }
    }
}

// ========== MODAL FUNCTIONS ==========
function initModal() {
    // Open modal
    elements.forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(elements.forgotPasswordModal);
    });

    // Close modal
    elements.modalClose?.addEventListener('click', () => {
        closeModal(elements.forgotPasswordModal);
    });

    // Close modal when clicking outside
    elements.forgotPasswordModal?.addEventListener('click', (e) => {
        if (e.target === elements.forgotPasswordModal) {
            closeModal(elements.forgotPasswordModal);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(elements.forgotPasswordModal);
        }
    });

    // Modal submit
    elements.modalSubmitBtn?.addEventListener('click', handlePasswordReset);
}

async function handlePasswordReset() {
    const email = elements.resetEmail.value.trim();
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    if (!validateEmail({ value: email, id: 'resetEmail' })) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    setSubmitButtonState(elements.modalSubmitBtn, true, 'Sending...');
    
    try {
        const result = await resetPassword(email);
        
        if (result.success) {
            showNotification(`Password reset link sent to ${email}`, 'success');
            closeModal(elements.forgotPasswordModal);
            elements.resetEmail.value = '';
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    } finally {
        setSubmitButtonState(elements.modalSubmitBtn, false, 'Send Reset Link');
    }
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            elements.backToTopBtn.classList.add('visible');
        } else {
            elements.backToTopBtn.classList.remove('visible');
        }
    });

    elements.backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== SOCIAL LOGIN ==========
function initSocialLogin() {
    elements.socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.classList.contains('google-btn') ? 'Google' :
                           this.classList.contains('spotify-btn') ? 'Spotify' : 'Apple';
            
            showNotification(`${platform} login would be implemented here`, 'info');
        });
    });
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to container
    container.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });

    // Auto-remove
    const autoRemove = setTimeout(() => {
        hideNotification(notification);
    }, duration);

    // Store notification for cleanup
    state.notifications.push({ element: notification, timeout: autoRemove });

    return {
        element: notification,
        remove: () => hideNotification(notification)
    };
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// ========== RESPONSIVE UTILITIES ==========
function initResponsiveFeatures() {
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            handleResponsiveChanges();
        }, 250);
    });

    // Initial check
    handleResponsiveChanges();
}

function handleResponsiveChanges() {
    const isMobile = window.innerWidth <= 767;
    
    // Update mobile menu visibility
    if (isMobile) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
        if (state.isMobileMenuOpen) {
            closeMobileMenu();
        }
    }
}

// ========== KEYBOARD SHORTCUTS ==========
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when user is typing in inputs
        if (e.target.matches('input, textarea, select')) return;

        // Ctrl/Cmd + L to focus login email
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            if (elements.loginEmail) {
                elements.loginEmail.focus();
            }
        }

        // Ctrl/Cmd + S to switch to signup
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            switchForm('signup');
        }

        // Escape to close modals/menus
        if (e.key === 'Escape') {
            if (state.isMobileMenuOpen) closeMobileMenu();
            if (elements.forgotPasswordModal.classList.contains('active')) {
                closeModal(elements.forgotPasswordModal);
            }
        }
    });
}

// ========== DEMO DATA FOR TESTING ==========
function initDemoData() {
    // Only add demo data on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            // Pre-fill login form
            if (elements.loginEmail) elements.loginEmail.value = 'demo@oliviafan.com';
            if (elements.loginPassword) elements.loginPassword.value = 'password123';

            // Pre-fill signup form
            if (elements.firstName) elements.firstName.value = 'Olivia';
            if (elements.lastName) elements.lastName.value = 'Fan';
            if (elements.username) elements.username.value = '@oliviafan';
            if (elements.signupEmail) elements.signupEmail.value = 'test@oliviafan.com';
            if (elements.signupPassword) elements.signupPassword.value = 'password123';
            if (elements.confirmPassword) elements.confirmPassword.value = 'password123';

            // Welcome notification
            setTimeout(() => {
                showNotification('🎵 Welcome to Olivia Fan Community! Test credentials are pre-filled.', 'info', 3000);
            }, 1000);
        }, 500);
    }
}

// ========== ANIMATION STYLES ==========
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .form.exiting {
            animation: slideOut 0.3s ease forwards;
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-20px);
            }
        }
        
        .form.active {
            animation: slideIn 0.3s ease forwards;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .input-field.error input {
            border-color: var(--error) !important;
            animation: shake 0.5s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .submit-btn.loading .btn-text::after {
            content: '...';
            animation: dots 1.5s infinite;
        }
        
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
    `;
    document.head.appendChild(style);
}

// import { createUserWithEmailAndPassword } from "firebase/auth";

// // Example signup function
// function signup(email, password) {
//   const auth = window.firebaseAuth; // from your firebase-config.js
//   return createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       console.log("User signed up:", userCredential.user);
//     })
//     .catch((error) => {
//       console.error("Signup error:", error);
//     });
// }


// ========== INITIALIZATION ==========
async function init() {
    // Initialize Firebase first
    await initFirebase();
    
    // Initialize all other features
    initMobileMenu();
    initFormSwapping();
    initPasswordToggle();
    initFormValidation();
    initModal();
    initBackToTop();
    initSocialLogin();
    initResponsiveFeatures();
    initKeyboardShortcuts();
    initDemoData();

    // Initialize form submissions
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', handleSignupSubmit);
    }

    // Add animation styles
    addAnimationStyles();

    // Welcome message
    console.log('%c🎵 Olivia Fan Community 🎵', 'color: #8b5cf6; font-size: 18px; font-weight: bold;');
    console.log('%cFirebase authentication integrated successfully', 'color: #10b981;');
}

// ========== LOAD EVENT ==========
document.addEventListener('DOMContentLoaded', init);

// ========== ERROR HANDLING ==========
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// ========== OFFLINE SUPPORT ==========
window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may not work.', 'warning');
});

window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});