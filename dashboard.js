class Dashboard {
    constructor() {
        console.log('📱 Dashboard.js loading...');
        
        // Initialize state
        this.currentUser = null;
        this.activeChat = null;
        this.activePage = 'feed';
        this.friends = [];
        this.posts = [];
        this.chats = [];
        this.notifications = [];
        this.groups = [];
        this.events = [];
        this.marketplace = [];
        this.saved = [];
        this.memories = [];
        this.reportingPostId = null;
        
        // Start initialization
        this.init();
    }
    
    async init() {
        console.log('🔄 Dashboard init() started');
        
        // Load user from localStorage (saved during login)
        await this.loadUserFromLocalStorage();
        
        // If no user found, redirect to login
        if (!this.currentUser) {
            console.error('❌ No user found, redirecting to login');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ User loaded:', this.currentUser.email);
        
        // Initialize UI
        this.initUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load data
        await this.loadData();
        
        // Load current page
        this.loadPage(this.activePage);
        
        // Update UI with real user
        this.updateUserUI();
    }
    
    async loadUserFromLocalStorage() {
        try {
            const userData = localStorage.getItem('oliviafan_user');
            if (userData) {
                const parsed = JSON.parse(userData);
                
                // Anime avatar options
                const animeAvatars = [
                    'https://i.pinimg.com/736x/3a/1f/2a/3a1f2a4e7c5b5c5e5e5e5e5e5e5e5e5e5.jpg',
                    'https://i.pinimg.com/736x/7a/7d/7b/7a7d7b5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
                    'https://i.pinimg.com/736x/9a/9b/9c/9a9b9c5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg'
                ];
                
                // Use anime avatar if current is default
                const userAvatar = parsed.photoURL && !parsed.photoURL.includes('pravatar') 
                    ? parsed.photoURL 
                    : animeAvatars[Math.floor(Math.random() * animeAvatars.length)];
                
                this.currentUser = {
                    uid: parsed.uid || `user_${Date.now()}`,
                    email: parsed.email,
                    name: parsed.name || parsed.email.split('@')[0],
                    displayName: parsed.name || parsed.email.split('@')[0],
                    photoURL: userAvatar,
                    bio: parsed.bio || 'New Olivia Rodrigo fan',
                    fanLevel: parsed.fanLevel || 'fan',
                    favoriteSong: parsed.favoriteSong || 'vampire'
                };
                console.log('📱 User loaded from localStorage:', this.currentUser.email);
            }
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
        }
    }
    
    async loadData() {
        // Load posts
        await this.loadPosts();
        
        // Load friends
        await this.loadFriends();
        
        // Load notifications
        await this.loadNotifications();
        
        // Update UI
        this.renderQuickFriends();
        this.renderOnlineFriends();
        this.renderPosts();
        this.renderChatList();
        this.renderNotifications();
        this.renderStories();
        this.renderBirthdays();
    }
    
    async loadPosts() {
        try {
            // Try Firebase first
            if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
                const { ref, get, query, orderByChild, limitToLast } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                const postsRef = ref(db, 'posts');
                const postsQuery = query(postsRef, orderByChild('createdAt'), limitToLast(20));
                const snapshot = await get(postsQuery);
                
                if (snapshot.exists()) {
                    const postsData = snapshot.val();
                    this.posts = Object.entries(postsData).map(([key, value]) => ({
                        ...value,
                        id: key
                    })).reverse();
                    console.log('📝 Loaded posts from Firebase:', this.posts.length);
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading posts from Firebase:', error);
        }
        
        // Fallback: Create welcome post for new user
        this.posts = [{
            id: 'welcome_post',
            userId: this.currentUser.uid,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.photoURL,
            content: `Welcome to OliviaFan, ${this.currentUser.name.split(' ')[0] || this.currentUser.name}! 🎵 Can't wait to see your posts about Olivia Rodrigo's music!`,
            createdAt: new Date().toISOString(),
            likes: {},
            comments: {}
        }];
    }
    
    async loadFriends() {
        try {
            // Try Firebase
            if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
                const { ref, get } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                const usersRef = ref(db, 'users');
                const snapshot = await get(usersRef);
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    this.friends = Object.entries(users)
                        .filter(([key]) => key !== this.currentUser.uid)
                        .map(([key, user]) => ({
                            id: key,
                            name: user.name || user.username || 'User',
                            avatar: user.photoURL || 'https://i.pravatar.cc/150',
                            bio: user.bio || 'Olivia fan',
                            online: Math.random() > 0.3
                        }))
                        .slice(0, 8);
                    console.log('👥 Loaded friends from Firebase:', this.friends.length);
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading friends from Firebase:', error);
        }
        
        // Fallback: Show suggestions with anime avatars
        const animeAvatars = [
            'https://i.pinimg.com/736x/3a/1f/2a/3a1f2a4e7c5b5c5e5e5e5e5e5e5e5e5e5.jpg',
            'https://i.pinimg.com/736x/7a/7d/7b/7a7d7b5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/9a/9b/9c/9a9b9c5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/b5/b6/b7/b5b6b75e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/d4/d5/d6/d4d5d65e5e5e5e5e5e5e5e5e5e5e5e5e.jpg'
        ];
        
        this.friends = [
            {
                id: 'suggestion1',
                name: 'Sakura Music',
                avatar: animeAvatars[0],
                bio: 'Big fan of GUTS album',
                online: true
            },
            {
                id: 'suggestion2',
                name: 'Anime Concert Buddy',
                avatar: animeAvatars[1],
                bio: 'Going to the tour!',
                online: false
            },
            {
                id: 'suggestion3',
                name: 'Kawaii Music Lover',
                avatar: animeAvatars[2],
                bio: 'Love all Olivia songs',
                online: true
            },
            {
                id: 'suggestion4',
                name: 'Anime Fan Club',
                avatar: animeAvatars[3],
                bio: 'President of Olivia fan club',
                online: true
            },
            {
                id: 'suggestion5',
                name: 'Music Otaku',
                avatar: animeAvatars[4],
                bio: 'Collecting all Olivia merch',
                online: false
            }
        ];
    }
    
    async loadNotifications() {
        // Simple welcome notification
        this.notifications = [{
            id: 'welcome',
            type: 'welcome',
            from: 'OliviaFan Team',
            message: `Welcome ${this.currentUser.name.split(' ')[0] || this.currentUser.name}! Start connecting with other fans.`,
            read: false,
            timestamp: new Date().toISOString()
        }];
    }
    
    updateUserUI() {
        console.log('🎨 Updating UI for user:', this.currentUser.name);
        
        // Update avatars
        const updateAvatar = (selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(img => {
                if (img) {
                    img.src = this.currentUser.photoURL;
                    img.alt = this.currentUser.name;
                }
            });
        };
        
        updateAvatar('#userAvatarSmall');
        updateAvatar('.user-avatar img');
        updateAvatar('.post-author-avatar');
        updateAvatar('.comment-avatar');
        updateAvatar('.create-post-header img');
        updateAvatar('.profile-avatar-large img');
        
        // Update names
        const updateName = (selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) el.textContent = this.currentUser.name;
            });
        };
        
        updateName('#userNameDropdown');
        updateName('.profile-name');
        updateName('#modalUserName');
        
        // Update other user info
        const bioElements = document.querySelectorAll('.profile-bio, #settingsBio');
        bioElements.forEach(el => {
            if (el) el.textContent = this.currentUser.bio;
        });
        
        const emailElements = document.querySelectorAll('input[type="email"][disabled]');
        emailElements.forEach(el => {
            if (el) el.value = this.currentUser.email;
        });
        
        // Update post input placeholder
        const postInput = document.querySelector('.post-input-trigger span');
        if (postInput) {
            postInput.textContent = `What's on your mind, ${this.currentUser.name.split(' ')[0] || this.currentUser.name}?`;
        }
    }
    
    // ========== UI INITIALIZATION ==========
    initUI() {
        // Set initial page from URL hash
        const hash = window.location.hash.substring(1) || 'feed';
        this.switchPage(hash);
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'feed';
            this.switchPage(page);
        });
    }
    
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-item[data-page], .dropdown-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
                this.closeAllDropdowns();
            });
        });
        
        // Friend tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('friends-tab')) {
                const tabId = e.target.dataset.tab;
                this.switchFriendTab(tabId);
            }
            
            if (e.target.classList.contains('settings-item')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.switchSettingsSection(section);
            }
        });
        
        // Create post modal
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                this.openCreatePostModal();
            });
        }
        
        // Chat functionality
        const newMessageBtn = document.getElementById('newMessageBtn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => {
                this.openNewMessageModal();
            });
        }
        
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        const backToChats = document.getElementById('backToChats');
        if (backToChats) {
            backToChats.addEventListener('click', () => {
                this.closeActiveChat();
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('.close-modal, .cancel-post, .cancel-report, .cancel-settings').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
        
        // Submit buttons
        const postSubmit = document.querySelector('.post-submit');
        if (postSubmit) {
            postSubmit.addEventListener('click', () => {
                this.submitPost();
            });
        }
        
        const submitReport = document.querySelector('.submit-report');
        if (submitReport) {
            submitReport.addEventListener('click', () => {
                this.submitReport();
            });
        }
        
        const saveSettings = document.querySelector('.save-settings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsRead();
            });
        }
        
        // Add photo button
        const addPhotoBtn = document.getElementById('addPhotoBtn');
        if (addPhotoBtn) {
            addPhotoBtn.addEventListener('click', () => {
                document.getElementById('postImageInput').click();
            });
        }
        
        // Image upload
        const postImageInput = document.getElementById('postImageInput');
        if (postImageInput) {
            postImageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }
        
        // Search functionality
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.globalSearch(e.target.value);
            });
        }
        
        const chatSearch = document.getElementById('chatSearch');
        if (chatSearch) {
            chatSearch.addEventListener('input', (e) => {
                this.searchChats(e.target.value);
            });
        }
        
        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('confirm-logout')) {
                this.logout();
            }
            
            if (e.target.classList.contains('cancel-logout')) {
                this.switchPage('feed');
            }
        });
        
        // Report reason radio buttons
        document.querySelectorAll('input[name="reportReason"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const details = document.getElementById('reportDetails');
                if (details) {
                    details.style.display = e.target.value === 'other' ? 'block' : 'none';
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-container')) {
                const notifDropdown = document.getElementById('notificationDropdown');
                if (notifDropdown) notifDropdown.style.display = 'none';
            }
            
            if (!e.target.closest('.user-menu-container')) {
                const userDropdown = document.getElementById('userDropdown');
                if (userDropdown) userDropdown.style.display = 'none';
            }
        });
        
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                const dropdown = document.getElementById('userDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }
        
        // Notification toggle
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                const dropdown = document.getElementById('notificationDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }
        
        // Post action buttons in feed
        document.addEventListener('click', (e) => {
            if (e.target.closest('.post-action-btn[data-type="photo"]')) {
                document.getElementById('postImageInput').click();
            }
            
            // Post like
            if (e.target.closest('.post-action-btn') && e.target.closest('.post-action-btn').textContent.includes('Like')) {
                const postId = e.target.closest('.post-card').id.replace('post-', '');
                this.likePost(postId);
            }
            
            // Post comment focus
            if (e.target.closest('.post-action-btn') && e.target.closest('.post-action-btn').textContent.includes('Comment')) {
                const postId = e.target.closest('.post-card').id.replace('post-', '');
                this.focusComment(postId);
            }
        });
    }
    
    // ========== PAGE MANAGEMENT ==========
    switchPage(page) {
        if (page === this.activePage) return;
        
        this.activePage = page;
        window.location.hash = page;
        this.updateNavigation(page);
        this.loadPage(page);
    }
    
    updateNavigation(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }
    
    async loadPage(page) {
        const pageContent = document.getElementById(`${page}-page`);
        if (!pageContent) return;
        
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show current page
        pageContent.classList.add('active');
        
        // Load page content
        switch(page) {
            case 'feed':
                this.loadFeedPage();
                break;
            case 'friends':
                this.loadFriendsPage();
                break;
            case 'profile':
                this.loadProfilePage();
                break;
            case 'groups':
                this.loadGroupsPage();
                break;
            case 'events':
                this.loadEventsPage();
                break;
            case 'marketplace':
                this.loadMarketplacePage();
                break;
            case 'saved':
                this.loadSavedPage();
                break;
            case 'memories':
                this.loadMemoriesPage();
                break;
            case 'settings':
                this.loadSettingsPage();
                break;
            case 'logout':
                this.loadLogoutPage();
                break;
        }
    }
    
    loadFeedPage() {
        const pageContent = document.getElementById('feed-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <!-- Create Post Card -->
            <div class="create-post-card">
                <div class="create-post-header">
                    <img src="${this.currentUser.photoURL}" alt="${this.currentUser.name}">
                    <div class="post-input-trigger" id="postInputTrigger">
                        <span>What's on your mind, ${this.currentUser.name.split(' ')[0] || this.currentUser.name}?</span>
                    </div>
                </div>
                <div class="create-post-actions">
                    <button class="post-action-btn" data-type="photo">
                        <i class="fas fa-image" style="color: #45bd62;"></i>
                        <span>Photo/Video</span>
                    </button>
                    <button class="post-action-btn" data-type="tag">
                        <i class="fas fa-user-tag" style="color: #1877f2;"></i>
                        <span>Tag Friends</span>
                    </button>
                    <button class="post-action-btn" data-type="feeling">
                        <i class="fas fa-smile" style="color: #f7b928;"></i>
                        <span>Feeling/Activity</span>
                    </button>
                </div>
            </div>

            <!-- Posts Feed -->
            <div class="posts-feed" id="postsFeed">
                <!-- Posts will be loaded here -->
            </div>
        `;
        
        // Add event listener for post trigger
        document.getElementById('postInputTrigger').addEventListener('click', () => {
            this.openCreatePostModal();
        });
        
        // Render posts
        this.renderPosts();
    }
    
    loadFriendsPage() {
        const pageContent = document.getElementById('friends-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="friends-container">
                <div class="friends-header">
                    <h1>Friends</h1>
                    <div class="friends-tabs">
                        <button class="friends-tab active" data-tab="all">All Friends (${this.friends.length})</button>
                        <button class="friends-tab" data-tab="suggestions">Suggestions</button>
                    </div>
                </div>
                
                <div class="friends-content">
                    <!-- All Friends -->
                    <div class="friends-tab-content active" id="all-friends">
                        <div class="friends-filter">
                            <input type="text" placeholder="Search friends..." class="friend-search" id="friendSearch">
                        </div>
                        <div class="friends-grid" id="allFriendsGrid">
                            <!-- Friends will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Suggestions -->
                    <div class="friends-tab-content" id="suggestions-friends">
                        <div class="suggestions-section">
                            <h3>People You May Know</h3>
                            <div class="suggestions-grid" id="suggestionsGrid">
                                <!-- Suggestions will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Render friends content
        this.renderFriendsPage();
        
        // Add event listeners
        const friendSearch = document.getElementById('friendSearch');
        if (friendSearch) {
            friendSearch.addEventListener('input', (e) => {
                this.searchFriends(e.target.value);
            });
        }
        
        // Add tab switching
        document.querySelectorAll('.friends-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchFriendTab(e.target.dataset.tab);
            });
        });
    }
    
    loadProfilePage() {
        const pageContent = document.getElementById('profile-page');
        if (!pageContent) return;
        
        const userPosts = this.posts.filter(p => p.userId === this.currentUser.uid);
        const friendsCount = this.friends.length;
        
        // Anime images for posts
        const animePostImages = [
            'https://i.pinimg.com/736x/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg',
            'https://i.pinimg.com/736x/2b/3c/4d/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg',
            'https://i.pinimg.com/736x/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg',
            'https://i.pinimg.com/736x/4d/5e/6f/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg'
        ];
        
        // Anime friend avatars
        const animeFriendAvatars = [
            'https://i.pinimg.com/736x/3a/1f/2a/3a1f2a4e7c5b5c5e5e5e5e5e5e5e5e5e5.jpg',
            'https://i.pinimg.com/736x/7a/7d/7b/7a7d7b5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/9a/9b/9c/9a9b9c5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/b5/b6/b7/b5b6b75e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/d4/d5/d6/d4d5d65e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/e6/e7/e8/e6e7e85e5e5e5e5e5e5e5e5e5e5e5e5e.jpg'
        ];
        
        pageContent.innerHTML = `
        <div class="profile-container">
            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-banner">
                    <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Banner" class="profile-banner-img">
                    <div class="profile-banner-overlay">
                        <div class="profile-avatar-container">
                            <div class="profile-avatar-large">
                                <img src="${this.currentUser.photoURL}" alt="${this.currentUser.name}" id="profileAvatar">
                            </div>
                            <button class="profile-avatar-edit" id="editProfilePicBtn">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        <div>
                            <h1 class="profile-name">${this.currentUser.name}</h1>
                            <p class="profile-bio">${this.currentUser.bio}</p>
                            <button class="profile-banner-edit">
                                <i class="fas fa-camera"></i> Edit Cover Photo
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="profile-info">
                    <div class="profile-stats">
                        <div class="profile-stat">
                            <span class="stat-number">${userPosts.length}</span>
                            <span class="stat-label">Posts</span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-number">${friendsCount}</span>
                            <span class="stat-label">Friends</span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-number">${userPosts.filter(p => p.image).length}</span>
                            <span class="stat-label">Photos</span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Videos</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn-primary" id="addToStoryBtn">
                            <i class="fas fa-plus"></i> Add to Story
                        </button>
                        <button class="btn-secondary" id="editProfileBtn">
                            <i class="fas fa-pen"></i> Edit Profile
                        </button>
                        <button class="btn-secondary">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Profile Navigation -->
            <nav class="profile-nav">
                <ul class="profile-nav-list">
                    <li class="profile-nav-item active" data-tab="posts">Posts</li>
                    <li class="profile-nav-item" data-tab="about">About</li>
                    <li class="profile-nav-item" data-tab="friends">Friends</li>
                    <li class="profile-nav-item" data-tab="photos">Photos</li>
                    <li class="profile-nav-item" data-tab="videos">Videos</li>
                    <li class="profile-nav-item" data-tab="check-ins">Check-ins</li>
                </ul>
            </nav>
            
            <!-- Profile Content -->
            <div class="profile-content">
                <!-- Left Column: Intro & Friends -->
                <div class="profile-left">
                    <!-- Intro Section -->
                    <div class="intro-section">
                        <h3>Intro</h3>
                        <div class="intro-item">
                            <i class="fas fa-briefcase"></i>
                            <span>Works at Olivia Fan Community</span>
                        </div>
                        <div class="intro-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Studied at Music University</span>
                        </div>
                        <div class="intro-item">
                            <i class="fas fa-home"></i>
                            <span>Lives in Music City</span>
                        </div>
                        <div class="intro-item">
                            <i class="fas fa-heart"></i>
                            <span>${this.currentUser.favoriteSong ? `Favorite song: ${this.currentUser.favoriteSong}` : 'Loves Olivia Rodrigo'}</span>
                        </div>
                        <div class="intro-item">
                            <i class="fas fa-star"></i>
                            <span>${this.currentUser.fanLevel ? `Fan Level: ${this.currentUser.fanLevel}` : 'Superfan'}</span>
                        </div>
                        <button class="btn-secondary" style="width: 100%; margin-top: 10px;">
                            <i class="fas fa-pen"></i> Edit Details
                        </button>
                    </div>
                    
                    <!-- Friends Section -->
                    <div class="friends-section">
                        <div class="friends-header">
                            <h3>Friends</h3>
                            <a href="#" class="see-all">See All Friends</a>
                        </div>
                        <div class="friends-grid" id="profileFriendsGrid">
                            <!-- Friends will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- Right Column: Posts -->
                <div class="profile-right">
                    <!-- Create Post -->
                    <div class="create-post-card" style="margin-bottom: 20px;">
                        <div class="create-post-header">
                            <img src="${this.currentUser.photoURL}" alt="${this.currentUser.name}">
                            <div class="post-input-trigger" id="profilePostInput">
                                <span>What's on your mind, ${this.currentUser.name.split(' ')[0]}?</span>
                            </div>
                        </div>
                        <div class="create-post-actions">
                            <button class="post-action-btn" data-type="photo">
                                <i class="fas fa-image"></i> Photo/Video
                            </button>
                            <button class="post-action-btn" data-type="tag">
                                <i class="fas fa-user-tag"></i> Tag Friends
                            </button>
                        </div>
                    </div>
                    
                    <!-- Posts Grid -->
                    <div class="posts-section">
                        <div class="posts-header">
                            <h3>Posts</h3>
                        </div>
                        <div class="posts-grid" id="profilePostsGrid">
                            <!-- Posts will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Edit Profile Modal -->
        <div class="edit-modal" id="editProfileModal">
            <div class="edit-modal-content">
                <div class="edit-modal-header">
                    <h3>Edit Profile</h3>
                    <button class="close-edit">&times;</button>
                </div>
                <div class="edit-modal-body">
                    <div class="edit-form-group">
                        <label>Profile Picture</label>
                        <div class="profile-picture-upload">
                            <div class="upload-preview">
                                <img src="${this.currentUser.photoURL}" alt="Preview" id="avatarPreview">
                            </div>
                            <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                            <div class="upload-actions">
                                <button class="upload-btn primary" id="uploadAvatarBtn">Upload Photo</button>
                                <button class="upload-btn secondary" id="removeAvatarBtn">Remove Current</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="edit-form-group">
                        <label>Name</label>
                        <input type="text" id="editName" value="${this.currentUser.name}" placeholder="Your name">
                    </div>
                    
                    <div class="edit-form-group">
                        <label>Bio</label>
                        <textarea id="editBio" placeholder="Tell everyone about yourself...">${this.currentUser.bio}</textarea>
                    </div>
                    
                    <div class="edit-form-group">
                        <label>Favorite Song</label>
                        <input type="text" id="editFavoriteSong" value="${this.currentUser.favoriteSong || ''}" placeholder="e.g., vampire, drivers license...">
                    </div>
                    
                    <div class="edit-form-group">
                        <label>Fan Level</label>
                        <select id="editFanLevel">
                            <option value="casual" ${this.currentUser.fanLevel === 'casual' ? 'selected' : ''}>🎧 Casual Listener</option>
                            <option value="fan" ${this.currentUser.fanLevel === 'fan' ? 'selected' : ''}>💜 Big Fan</option>
                            <option value="superfan" ${this.currentUser.fanLevel === 'superfan' ? 'selected' : ''}>⭐ Superfan</option>
                            <option value="obsessed" ${!this.currentUser.fanLevel || this.currentUser.fanLevel === 'obsessed' ? 'selected' : ''}>🔥 Obsessed</option>
                        </select>
                    </div>
                </div>
                <div class="edit-modal-footer">
                    <button class="btn-secondary" id="cancelEditBtn">Cancel</button>
                    <button class="btn-primary" id="saveProfileBtn">Save Changes</button>
                </div>
            </div>
        </div>
        `;
        
        // Add event listeners
        this.setupProfileEventListeners();
        
        // Load content
        this.renderProfileFriends(animeFriendAvatars);
        this.renderProfilePosts(animePostImages);
    }
    
    setupProfileEventListeners() {
        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.openEditProfileModal();
            });
        }
        
        // Edit profile picture button
        const editProfilePicBtn = document.getElementById('editProfilePicBtn');
        if (editProfilePicBtn) {
            editProfilePicBtn.addEventListener('click', () => {
                this.openEditProfileModal();
            });
        }
        
        // Profile navigation tabs
        document.querySelectorAll('.profile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchProfileTab(tab);
            });
        });
        
        // Profile post input
        const profilePostInput = document.getElementById('profilePostInput');
        if (profilePostInput) {
            profilePostInput.addEventListener('click', () => {
                this.openCreatePostModal();
            });
        }
        
        // Edit modal
        const editModal = document.getElementById('editProfileModal');
        const closeEditBtn = document.querySelector('.close-edit');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
        const removeAvatarBtn = document.getElementById('removeAvatarBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (closeEditBtn) {
            closeEditBtn.addEventListener('click', () => {
                editModal.classList.remove('active');
            });
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                editModal.classList.remove('active');
            });
        }
        
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfileChanges();
            });
        }
        
        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', () => {
                avatarUpload.click();
            });
        }
        
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', () => {
                this.removeProfilePicture();
            });
        }
        
        if (avatarUpload) {
            avatarUpload.addEventListener('change', (e) => {
                this.handleProfilePictureUpload(e.target.files[0]);
            });
        }
        
        // Close modal when clicking outside
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    editModal.classList.remove('active');
                }
            });
        }
    }
    
    openEditProfileModal() {
        const editModal = document.getElementById('editProfileModal');
        if (editModal) {
            editModal.classList.add('active');
        }
    }
    
    async saveProfileChanges() {
        const name = document.getElementById('editName').value.trim();
        const bio = document.getElementById('editBio').value.trim();
        const favoriteSong = document.getElementById('editFavoriteSong').value.trim();
        const fanLevel = document.getElementById('editFanLevel').value;
        
        if (!name) {
            this.showNotification('Name is required', 'error');
            return;
        }
        
        // Update current user
        this.currentUser.name = name;
        this.currentUser.bio = bio;
        this.currentUser.favoriteSong = favoriteSong;
        this.currentUser.fanLevel = fanLevel;
        
        // Update localStorage
        localStorage.setItem('oliviafan_user', JSON.stringify(this.currentUser));
        
        // Update Firebase if available
        if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
            try {
                const { ref, update } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                await update(ref(db, `users/${this.currentUser.uid}`), {
                    name: name,
                    bio: bio,
                    favoriteSong: favoriteSong,
                    fanLevel: fanLevel,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error updating profile in Firebase:', error);
            }
        }
        
        // Update UI
        this.updateUserUI();
        
        // Close modal
        const editModal = document.getElementById('editProfileModal');
        if (editModal) {
            editModal.classList.remove('active');
        }
        
        this.showNotification('Profile updated successfully!', 'success');
    }
    
    async handleProfilePictureUpload(file) {
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        
        // In a real app, you would upload to Firebase Storage
        // For now, we'll use a data URL
        const newAvatarUrl = URL.createObjectURL(file);
        
        // Update current user
        this.currentUser.photoURL = newAvatarUrl;
        
        // Update localStorage
        localStorage.setItem('oliviafan_user', JSON.stringify(this.currentUser));
        
        // Update UI
        this.updateUserUI();
        
        this.showNotification('Profile picture updated!', 'success');
    }
    
    removeProfilePicture() {
        // Set default anime avatar
        const animeAvatars = [
            'https://i.pinimg.com/736x/3a/1f/2a/3a1f2a4e7c5b5c5e5e5e5e5e5e5e5e5e5.jpg',
            'https://i.pinimg.com/736x/7a/7d/7b/7a7d7b5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/9a/9b/9c/9a9b9c5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/b5/b6/b7/b5b6b75e5e5e5e5e5e5e5e5e5e5e5e5e.jpg'
        ];
        
        const randomAvatar = animeAvatars[Math.floor(Math.random() * animeAvatars.length)];
        
        // Update current user
        this.currentUser.photoURL = randomAvatar;
        
        // Update preview
        const preview = document.getElementById('avatarPreview');
        if (preview) {
            preview.src = randomAvatar;
        }
        
        // Update localStorage
        localStorage.setItem('oliviafan_user', JSON.stringify(this.currentUser));
        
        // Update UI
        this.updateUserUI();
        
        this.showNotification('Profile picture removed', 'info');
    }
    
    switchProfileTab(tab) {
        // Update navigation
        document.querySelectorAll('.profile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.profile-nav-item[data-tab="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Show/hide content based on tab
        this.showNotification(`Showing ${tab} tab`, 'info');
    }
    
    renderProfileFriends(animeAvatars = []) {
        const profileFriendsGrid = document.getElementById('profileFriendsGrid');
        if (!profileFriendsGrid) return;
        
        profileFriendsGrid.innerHTML = '';
        
        // Default anime avatars if none provided
        const defaultAnimeAvatars = [
            'https://i.pinimg.com/736x/3a/1f/2a/3a1f2a4e7c5b5c5e5e5e5e5e5e5e5e5e5.jpg',
            'https://i.pinimg.com/736x/7a/7d/7b/7a7d7b5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/9a/9b/9c/9a9b9c5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/b5/b6/b7/b5b6b75e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/d4/d5/d6/d4d5d65e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
            'https://i.pinimg.com/736x/e6/e7/e8/e6e7e85e5e5e5e5e5e5e5e5e5e5e5e5e.jpg'
        ];
        
        const avatars = animeAvatars.length > 0 ? animeAvatars : defaultAnimeAvatars;
        
        this.friends.slice(0, 6).forEach((friend, index) => {
            // Use anime avatar for friends
            const friendAvatar = avatars[index % avatars.length] || friend.avatar;
            
            const friendCard = document.createElement('div');
            friendCard.className = 'friend-card';
            friendCard.innerHTML = `
                <img src="${friendAvatar}" alt="${friend.name}" class="friend-avatar">
                <div class="friend-info">
                    <h4 class="friend-name">${friend.name}</h4>
                    <p class="friend-mutual">${friend.bio}</p>
                </div>
            `;
            profileFriendsGrid.appendChild(friendCard);
        });
    }
    
    renderProfilePosts(animeImages = []) {
        const profilePostsGrid = document.getElementById('profilePostsGrid');
        if (!profilePostsGrid) return;
        
        profilePostsGrid.innerHTML = '';
        
        const userPosts = this.posts.filter(post => post.userId === this.currentUser.uid);
        
        if (userPosts.length === 0) {
            profilePostsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-edit"></i>
                    <h3>No posts yet</h3>
                    <p>Share your thoughts about Olivia's music!</p>
                    <button class="btn-primary" onclick="dashboard.openCreatePostModal()">
                        Create Your First Post
                    </button>
                </div>
            `;
            return;
        }
        
        // Default anime images if none provided
        const defaultAnimeImages = [
            'https://i.pinimg.com/736x/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg',
            'https://i.pinimg.com/736x/2b/3c/4d/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg',
            'https://i.pinimg.com/736x/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg',
            'https://i.pinimg.com/736x/4d/5e/6f/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg',
            'https://i.pinimg.com/736x/5e/6f/7a/5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg'
        ];
        
        const images = animeImages.length > 0 ? animeImages : defaultAnimeImages;
        
        userPosts.forEach((post, index) => {
            const postImage = images[index % images.length];
            const timeAgo = this.formatTimeAgo(new Date(post.createdAt));
            
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <img src="${postImage}" alt="Post image" class="post-image">
                <div class="post-content">
                    <div class="post-time">${timeAgo}</div>
                    <p class="post-text">${post.content}</p>
                </div>
            `;
            profilePostsGrid.appendChild(postCard);
        });
    }
    
    loadGroupsPage() {
        const pageContent = document.getElementById('groups-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="groups-container">
                <div class="groups-header">
                    <h1>Groups</h1>
                    <button class="btn-primary" id="createGroupBtn">
                        <i class="fas fa-plus"></i> Create Group
                    </button>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No groups yet</h3>
                    <p>Join groups to connect with other Olivia fans!</p>
                    <button class="btn-primary">Explore Groups</button>
                </div>
            </div>
        `;
        
        const createGroupBtn = document.getElementById('createGroupBtn');
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => {
                this.showNotification('Group creation feature coming soon!', 'info');
            });
        }
    }
    
    loadEventsPage() {
        const pageContent = document.getElementById('events-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="events-container">
                <div class="events-header">
                    <h1>Events</h1>
                    <button class="btn-primary" id="createEventBtn">
                        <i class="fas fa-plus"></i> Create Event
                    </button>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No events yet</h3>
                    <p>Check back for upcoming Olivia Rodrigo events!</p>
                </div>
            </div>
        `;
        
        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                this.showNotification('Event creation feature coming soon!', 'info');
            });
        }
    }
    
    loadMarketplacePage() {
        const pageContent = document.getElementById('marketplace-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="marketplace-container">
                <div class="marketplace-header">
                    <h1>Marketplace</h1>
                    <button class="btn-primary" id="createListingBtn">
                        <i class="fas fa-plus"></i> Sell Item
                    </button>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Marketplace coming soon</h3>
                    <p>Buy and sell Olivia Rodrigo merchandise with other fans!</p>
                </div>
            </div>
        `;
        
        const createListingBtn = document.getElementById('createListingBtn');
        if (createListingBtn) {
            createListingBtn.addEventListener('click', () => {
                this.showNotification('Marketplace feature coming soon!', 'info');
            });
        }
    }
    
    loadSavedPage() {
        const pageContent = document.getElementById('saved-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="saved-container">
                <div class="saved-header">
                    <h1>Saved</h1>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>No saved items</h3>
                    <p>Save posts, events, and merchandise to find them later!</p>
                </div>
            </div>
        `;
    }
    
    loadMemoriesPage() {
        const pageContent = document.getElementById('memories-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="memories-container">
                <div class="memories-header">
                    <h1>Memories</h1>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No memories yet</h3>
                    <p>Your favorite Olivia moments will appear here!</p>
                </div>
            </div>
        `;
    }
    
    loadSettingsPage() {
        const pageContent = document.getElementById('settings-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="settings-container">
                <div class="settings-sidebar">
                    <div class="settings-menu">
                        <a href="#account" class="settings-item active" data-section="account">
                            <i class="fas fa-user-circle"></i>
                            <span>Account</span>
                        </a>
                        <a href="#privacy" class="settings-item" data-section="privacy">
                            <i class="fas fa-shield-alt"></i>
                            <span>Privacy</span>
                        </a>
                        <a href="#notifications" class="settings-item" data-section="notifications">
                            <i class="fas fa-bell"></i>
                            <span>Notifications</span>
                        </a>
                    </div>
                </div>
                
                <div class="settings-content">
                    <div class="settings-section active" id="account-section">
                        <h2>Account Settings</h2>
                        <div class="settings-form">
                            <div class="setting-item">
                                <label>Display Name</label>
                                <input type="text" value="${this.currentUser.name}" id="settingsDisplayName">
                            </div>
                            <div class="setting-item">
                                <label>Bio</label>
                                <textarea id="settingsBio">${this.currentUser.bio}</textarea>
                            </div>
                            <div class="setting-item">
                                <label>Email</label>
                                <input type="email" value="${this.currentUser.email}" disabled>
                            </div>
                            <button class="btn-primary" id="saveAccountSettings">Save Changes</button>
                        </div>
                    </div>
                    
                    <div class="settings-section" id="privacy-section">
                        <h2>Privacy Settings</h2>
                        <div class="settings-form">
                            <div class="setting-item">
                                <label>Who can see your posts?</label>
                                <select id="privacyPosts">
                                    <option value="public">Public</option>
                                    <option value="friends" selected>Friends Only</option>
                                    <option value="onlyme">Only Me</option>
                                </select>
                            </div>
                            <button class="btn-primary" id="savePrivacySettings">Save Privacy Settings</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const saveAccountSettings = document.getElementById('saveAccountSettings');
        if (saveAccountSettings) {
            saveAccountSettings.addEventListener('click', () => {
                this.saveAccountSettings();
            });
        }
        
        const savePrivacySettings = document.getElementById('savePrivacySettings');
        if (savePrivacySettings) {
            savePrivacySettings.addEventListener('click', () => {
                this.savePrivacySettings();
            });
        }
        
        document.querySelectorAll('.settings-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSettingsSection(section);
            });
        });
    }
    
    loadLogoutPage() {
        const pageContent = document.getElementById('logout-page');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="logout-container">
                <div class="logout-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <h1>Log Out</h1>
                <p>Are you sure you want to log out? You will need to sign in again to access your account.</p>
                <div class="logout-actions">
                    <button class="btn-secondary cancel-logout">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn-primary confirm-logout">
                        <i class="fas fa-sign-out-alt"></i> Log Out
                    </button>
                </div>
            </div>
        `;
    }
    
    // ========== RENDER METHODS ==========
    renderQuickFriends() {
        const quickFriendsList = document.getElementById('quickFriends');
        if (!quickFriendsList) return;
        
        quickFriendsList.innerHTML = '';
        
        if (this.friends.length === 0) {
            quickFriendsList.innerHTML = `
                <div class="no-friends-message">
                    <i class="fas fa-user-plus"></i>
                    <span>Add friends to see them here</span>
                </div>
            `;
            return;
        }
        
        this.friends.slice(0, 5).forEach(friend => {
            const quickFriend = document.createElement('div');
            quickFriend.className = `quick-friend-item ${friend.online ? '' : 'offline'}`;
            quickFriend.innerHTML = `
                <div class="quick-friend-avatar">
                    <img src="${friend.avatar}" alt="${friend.name}" onerror="this.src='https://i.pravatar.cc/150'">
                    ${friend.online ? '<div class="online-status"></div>' : ''}
                </div>
                <span class="quick-friend-name">${friend.name}</span>
            `;
            quickFriendsList.appendChild(quickFriend);
        });
    }
    
    renderOnlineFriends() {
        const onlineFriendsList = document.getElementById('onlineFriendsList');
        const onlineCount = document.getElementById('onlineCount');
        
        if (!onlineFriendsList) return;
        
        onlineFriendsList.innerHTML = '';
        
        const onlineFriends = this.friends.filter(friend => friend.online);
        if (onlineCount) onlineCount.textContent = `${onlineFriends.length} online`;
        
        onlineFriends.forEach(friend => {
            const onlineFriend = document.createElement('div');
            onlineFriend.className = 'online-friend-item';
            onlineFriend.innerHTML = `
                <div class="online-friend-avatar">
                    <img src="${friend.avatar}" alt="${friend.name}" onerror="this.src='https://i.pravatar.cc/150'">
                </div>
                <div class="online-friend-info">
                    <h5 class="online-friend-name">${friend.name}</h5>
                    <p class="online-friend-status">${friend.online ? 'Active now' : 'Offline'}</p>
                </div>
            `;
            onlineFriendsList.appendChild(onlineFriend);
        });
    }
    
    renderPosts() {
        const postsFeed = document.getElementById('postsFeed');
        if (!postsFeed) return;
        
        postsFeed.innerHTML = '';
        
        if (this.posts.length === 0) {
            postsFeed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather-alt"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share about Olivia's music!</p>
                    <button class="btn-primary" onclick="dashboard.openCreatePostModal()">
                        Create Your First Post
                    </button>
                </div>
            `;
            return;
        }
        
        this.posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsFeed.appendChild(postElement);
        });
    }
    
    renderChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        if (this.chats.length === 0) {
            chatList.innerHTML = `
                <div class="empty-chat-state">
                    <i class="fas fa-comments"></i>
                    <h4>No messages yet</h4>
                    <p>Start a conversation with your friends</p>
                </div>
            `;
            return;
        }
        
        this.chats.forEach(chat => {
            const chatElement = this.createChatElement(chat);
            chatList.appendChild(chatElement);
        });
    }
    
    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        const notificationCount = document.getElementById('notificationCount');
        
        if (!notificationList) return;
        
        notificationList.innerHTML = '';
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        if (notificationCount) notificationCount.textContent = unreadCount;
        
        this.notifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            notificationList.appendChild(notificationElement);
        });
    }
    
    renderStories() {
        const storiesSection = document.querySelector('.stories-section');
        if (!storiesSection) return;
        
        // Clear existing stories
        const existingStories = storiesSection.querySelectorAll('.story-card');
        existingStories.forEach((story, index) => {
            if (index > 0) story.remove();
        });
        
        // Add user's story
        const userStory = document.createElement('div');
        userStory.className = 'story-card';
        userStory.innerHTML = `
            <div class="story-avatar-wrapper">
                <img src="${this.currentUser.photoURL}" alt="You">
                <div class="add-story">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
            <span class="story-author">You</span>
        `;
        storiesSection.appendChild(userStory);
        
        // Add friend stories
        this.friends.slice(0, 4).forEach(friend => {
            const storyElement = document.createElement('div');
            storyElement.className = 'story-card';
            storyElement.innerHTML = `
                <div class="story-avatar-wrapper">
                    <img src="${friend.avatar}" alt="${friend.name}">
                </div>
                <span class="story-author">${friend.name.split(' ')[0]}</span>
            `;
            storiesSection.appendChild(storyElement);
        });
    }
    
    renderBirthdays() {
        const birthdaysList = document.getElementById('birthdaysList');
        if (!birthdaysList) return;
        
        birthdaysList.innerHTML = `
            <div class="birthday-card">
                <div class="birthday-icon">
                    <i class="fas fa-birthday-cake"></i>
                </div>
                <div class="birthday-info">
                    <p class="birthday-text">
                        Welcome to OliviaFan, <span class="birthday-name">${this.currentUser.name.split(' ')[0] || this.currentUser.name}</span>!
                    </p>
                </div>
            </div>
        `;
    }
    
    renderFriendsPage() {
        const allFriendsGrid = document.getElementById('allFriendsGrid');
        if (!allFriendsGrid) return;
        
        allFriendsGrid.innerHTML = '';
        
        if (this.friends.length === 0) {
            allFriendsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <h3>No friends yet</h3>
                    <p>Connect with other Olivia fans!</p>
                </div>
            `;
            return;
        }
        
        this.friends.forEach(friend => {
            const friendCard = this.createFriendCard(friend);
            allFriendsGrid.appendChild(friendCard);
        });
    }
    
    // ========== ELEMENT CREATION ==========
    createFriendCard(friend) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-card-header">
                <img src="${friend.avatar}" alt="${friend.name}" class="user-card-avatar" onerror="this.src='https://i.pravatar.cc/150'">
            </div>
            <div class="user-card-body">
                <h3 class="user-card-name">${friend.name}</h3>
                <p class="user-card-bio">${friend.bio}</p>
                <div class="user-card-actions">
                    <button class="user-card-btn primary" onclick="dashboard.messageFriend('${friend.id}')">
                        <i class="fas fa-envelope"></i> Message
                    </button>
                    <button class="user-card-btn secondary" onclick="dashboard.addFriend('${friend.id}')">
                        <i class="fas fa-user-plus"></i> Add Friend
                    </button>
                </div>
            </div>
        `;
        return card;
    }
    
    createPostElement(post) {
        const element = document.createElement('div');
        element.className = 'post-card';
        element.id = `post-${post.id}`;
        
        const timeAgo = this.formatTimeAgo(new Date(post.createdAt));
        const liked = post.likes && post.likes[this.currentUser.uid];
        const likeCount = post.likes ? Object.keys(post.likes).length : 0;
        const commentCount = post.comments ? Object.keys(post.comments).length : 0;
        
        element.innerHTML = `
            <div class="post-header">
                <div class="post-user">
                    <img src="${post.userAvatar}" alt="${post.userName}" class="post-author-avatar" onerror="this.src='https://i.pravatar.cc/150'">
                    <div class="post-author-info">
                        <h4 class="post-author-name">${post.userName}</h4>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                </div>
                ${post.userId === this.currentUser.uid ? `
                    <div class="post-actions-menu">
                        <button class="post-action-btn" onclick="dashboard.deletePost('${post.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="post-stats">
                <span><i class="fas fa-thumbs-up"></i> ${likeCount}</span>
                <span>${commentCount} comments</span>
            </div>
            <div class="post-actions-bar">
                <button class="post-action-btn ${liked ? 'active' : ''}" onclick="dashboard.likePost('${post.id}')">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${liked ? 'Liked' : 'Like'}</span>
                </button>
                <button class="post-action-btn" onclick="dashboard.focusComment('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button class="post-action-btn" onclick="dashboard.sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}">
                <div class="comment-input">
                    <img src="${this.currentUser.photoURL}" alt="You" class="comment-avatar">
                    <input type="text" placeholder="Write a comment..." class="comment-input-field" 
                           onkeypress="if(event.key === 'Enter') dashboard.addComment('${post.id}', this)">
                </div>
                <div class="comments-list" id="comments-list-${post.id}">
                    ${post.comments ? Object.values(post.comments).map(comment => `
                        <div class="comment">
                            <img src="${comment.userAvatar || 'https://i.pravatar.cc/150'}" alt="${comment.userName}" class="comment-avatar">
                            <div class="comment-content">
                                <h5 class="comment-author">${comment.userName}</h5>
                                <p class="comment-text">${comment.content}</p>
                                <span class="comment-time">${this.formatTimeAgo(new Date(comment.timestamp))}</span>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
        return element;
    }
    
    createChatElement(chat) {
        const element = document.createElement('button');
        element.className = `chat-user-card ${chat.unread > 0 ? 'unread' : ''}`;
        element.innerHTML = `
            <img src="${chat.userAvatar}" alt="${chat.userName}" class="chat-user-avatar" onerror="this.src='https://i.pravatar.cc/150'">
            <div class="chat-user-info">
                <div class="chat-user-name">
                    <span>${chat.userName}</span>
                    <span class="chat-user-time">${chat.timestamp}</span>
                </div>
                <p class="chat-user-last-message">${chat.lastMessage}</p>
            </div>
            ${chat.unread > 0 ? `<span class="chat-user-unread">${chat.unread}</span>` : ''}
        `;
        element.onclick = () => this.openChat(chat.id);
        return element;
    }
    
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        element.innerHTML = `
            <img src="https://i.pravatar.cc/150" alt="${notification.from}" class="notification-avatar">
            <div class="notification-content">
                <p><strong>${notification.from}</strong> ${notification.message}</p>
                <span class="notification-time">${this.formatTimeAgo(new Date(notification.timestamp))}</span>
            </div>
            ${!notification.read ? '<div class="notification-dot"></div>' : ''}
        `;
        return element;
    }
    
    // ========== UTILITY METHODS ==========
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    switchFriendTab(tabId) {
        document.querySelectorAll('.friends-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.friends-tab[data-tab="${tabId}"]`)?.classList.add('active');
        
        document.querySelectorAll('.friends-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-friends`)?.classList.add('active');
    }
    
    switchProfileTab(tabId) {
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.profile-tab[data-tab="${tabId}"]`)?.classList.add('active');
        
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`profile-${tabId}`)?.classList.add('active');
    }
    
    switchSettingsSection(section) {
        document.querySelectorAll('.settings-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.settings-item[data-section="${section}"]`)?.classList.add('active');
        
        document.querySelectorAll('.settings-section').forEach(sect => {
            sect.classList.remove('active');
        });
        document.getElementById(`${section}-section`)?.classList.add('active');
    }
    
    // ========== FUNCTIONAL METHODS ==========
    openCreatePostModal() {
        document.getElementById('createPostModal').classList.add('active');
        document.getElementById('postContent').focus();
    }
    
    async submitPost() {
        const content = document.getElementById('postContent').value.trim();
        const audience = document.getElementById('postAudience').value;
        
        if (!content) {
            this.showNotification('Please write something to post.', 'error');
            return;
        }
        
        try {
            const postId = `post_${Date.now()}`;
            const newPost = {
                id: postId,
                userId: this.currentUser.uid,
                userName: this.currentUser.name,
                userAvatar: this.currentUser.photoURL,
                content: content,
                audience: audience,
                createdAt: new Date().toISOString(),
                likes: {},
                comments: {}
            };
            
            // Save to Firebase if available
            if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
                const { ref, set } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                await set(ref(db, `posts/${postId}`), newPost);
            }
            
            // Add to local state
            this.posts.unshift(newPost);
            
            // Update UI
            this.renderPosts();
            if (this.activePage === 'profile') {
                this.renderProfilePosts();
            }
            
            this.closeModals();
            document.getElementById('postContent').value = '';
            
            this.showNotification('Post published successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification('Failed to publish post', 'error');
        }
    }
    
    async likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        post.liked = !post.liked;
        post.likes = post.likes || {};
        
        if (post.liked) {
            post.likes[this.currentUser.uid] = true;
        } else {
            delete post.likes[this.currentUser.uid];
        }
        
        // Update Firebase if available
        if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
            try {
                const { ref, update } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                await update(ref(db, `posts/${postId}`), {
                    likes: post.likes
                });
            } catch (error) {
                console.error('Error updating like in Firebase:', error);
            }
        }
        
        // Update UI
        this.renderPosts();
    }
    
    async addComment(postId, inputElement) {
        const comment = inputElement.value.trim();
        if (!comment) return;
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const commentId = `comment_${Date.now()}`;
        post.comments = post.comments || {};
        post.comments[commentId] = {
            id: commentId,
            userId: this.currentUser.uid,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.photoURL,
            content: comment,
            timestamp: new Date().toISOString()
        };
        
        // Update Firebase if available
        if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
            try {
                const { ref, update } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                await update(ref(db, `posts/${postId}`), {
                    comments: post.comments
                });
            } catch (error) {
                console.error('Error adding comment to Firebase:', error);
            }
        }
        
        inputElement.value = '';
        this.renderPosts();
    }
    
    async saveAccountSettings() {
        const displayName = document.getElementById('settingsDisplayName').value.trim();
        const bio = document.getElementById('settingsBio').value.trim();
        
        if (!displayName) {
            this.showNotification('Display name is required', 'error');
            return;
        }
        
        this.currentUser.name = displayName;
        this.currentUser.bio = bio;
        
        // Update localStorage
        localStorage.setItem('oliviafan_user', JSON.stringify(this.currentUser));
        
        // Update Firebase if available
        if (window.firebaseAuth && window.firebaseDatabase) {
            try {
                const auth = window.firebaseAuth;
                const { updateProfile } = window.firebaseAuthFunctions;
                const { ref, update } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                // Update auth profile
                await updateProfile(auth.currentUser, {
                    displayName: displayName
                });
                
                // Update database
                await update(ref(db, `users/${this.currentUser.uid}`), {
                    name: displayName,
                    bio: bio,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error updating profile in Firebase:', error);
            }
        }
        
        this.updateUserUI();
        this.showNotification('Profile updated successfully!', 'success');
    }
    
    async savePrivacySettings() {
        const privacyPosts = document.getElementById('privacyPosts').value;
        
        if (window.firebaseDatabase && window.firebaseDatabaseFunctions) {
            try {
                const { ref, update } = window.firebaseDatabaseFunctions;
                const db = window.firebaseDatabase;
                
                await update(ref(db, `users/${this.currentUser.uid}/settings`), {
                    postPrivacy: privacyPosts
                });
            } catch (error) {
                console.error('Error saving privacy settings:', error);
            }
        }
        
        this.showNotification('Privacy settings saved!', 'success');
    }
    
    async logout() {
        // Clear localStorage
        localStorage.removeItem('oliviafan_user');
        
        // Sign out from Firebase if available
        if (window.firebaseAuth && window.firebaseAuthFunctions) {
            try {
                const { signOut } = window.firebaseAuthFunctions;
                await signOut(window.firebaseAuth);
            } catch (error) {
                console.error('Error signing out from Firebase:', error);
            }
        }
        
        this.showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // ========== HELPER METHODS ==========
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'};
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
               style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'}"></i>
            <span>${message}</span>
            <button class="toast-close" style="
                background: none;
                border: none;
                color: #65676b;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            ">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add CSS for animation if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .toast-notification.fade-out {
                    animation: slideOut 0.3s ease forwards;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Close button
        notification.querySelector('.toast-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    closeAllDropdowns() {
        const notifDropdown = document.getElementById('notificationDropdown');
        const userDropdown = document.getElementById('userDropdown');
        
        if (notifDropdown) notifDropdown.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'none';
    }
    
    // ========== METHODS TO IMPLEMENT ==========
    openChat(chatId) {
        this.showNotification('Chat feature coming soon!', 'info');
    }
    
    closeActiveChat() {
        // Implementation needed
    }
    
    sendMessage() {
        this.showNotification('Chat feature coming soon!', 'info');
    }
    
    searchChats(query) {
        // Implementation needed
    }
    
    searchFriends(query) {
        // Implementation needed
    }
    
    globalSearch(query) {
        // Implementation needed
    }
    
    messageFriend(friendId) {
        this.showNotification('Messaging feature coming soon!', 'info');
    }
    
    addFriend(friendId) {
        this.showNotification('Friend request sent!', 'success');
    }
    
    markAllNotificationsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();
        this.showNotification('All notifications marked as read', 'success');
    }
    
    acceptFriendRequest(notificationId) {
        this.showNotification('Friend request accepted!', 'success');
    }
    
    declineFriendRequest(notificationId) {
        this.showNotification('Friend request declined', 'info');
    }
    
    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.renderPosts();
            this.showNotification('Post deleted', 'success');
        }
    }
    
    focusComment(postId) {
        const input = document.querySelector(`#comments-${postId} .comment-input-field`);
        if (input) input.focus();
    }
    
    sharePost(postId) {
        this.showNotification('Post shared!', 'success');
    }
    
    reportPost(postId) {
        this.reportingPostId = postId;
        document.getElementById('reportModal').classList.add('active');
    }
    
    submitReport() {
        this.showNotification('Report submitted. Thank you!', 'success');
        this.closeModals();
    }
    
    openSettingsModal() {
        document.getElementById('settingsModal').classList.add('active');
    }
    
    saveSettings() {
        this.showNotification('Settings saved!', 'success');
        this.closeModals();
    }
    
    handleImageUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('postPreview');
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; border-radius: 8px;">
                <button class="remove-image" onclick="dashboard.removeImagePreview()">
                    <i class="fas fa-times"></i> Remove
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
    
    removeImagePreview() {
        document.getElementById('postPreview').innerHTML = '';
        document.getElementById('postImageInput').value = '';
    }
    
    openNewMessageModal() {
        this.showNotification('New message feature coming soon!', 'info');
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    window.dashboard = dashboard;
});