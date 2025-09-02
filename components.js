// Load header and footer components

// Check if the current page needs search functionality
function shouldInitializeSearch() {
    // Since we want search on every page that has the header, always return true
    // The header is loaded on every viewable page, so search should be available everywhere
    return true;
}

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let html = await response.text();
        
        // Update copyright year if loading footer
        if (componentPath === 'footer.html') {
            const currentYear = new Date().getFullYear();
            html = html.replace('2025', currentYear);
            
            // Also update after the HTML is inserted
            setTimeout(() => {
                const yearElement = document.getElementById('current-year');
                if (yearElement) {
                    yearElement.textContent = currentYear;
                }
            }, 100);
        }
        
        const targetElement = document.getElementById(elementId);
        
        if (targetElement) {
            targetElement.innerHTML = html;
        }
        
        // Set active states based on current page (only for header, with delay to ensure DOM is ready)
        if (componentPath.endsWith('header.html')) {
            setTimeout(() => {
                setActiveStates();
                initializeHamburgerMenu();
                initializeSearchIcon();
                // Initialize Pagefind only on pages that need search functionality
                setTimeout(() => {
                    if (shouldInitializeSearch()) {
                        initializePagefindSearch();
                    }
                }, 500);
            }, 300);
        }
            } catch (error) {
            // Silently handle errors in production
        }
}

// Set active states for navigation
function setActiveStates() {
    try {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Remove all active classes first
        document.querySelectorAll('.nav-links a, .dropdown-toggle').forEach(link => {
            if (link) {
                link.classList.remove('active');
            }
        });
        
        // Set active state based on current page
        if (currentPage === 'index.html' || currentPage === '') {
            // Home page - no active nav items
        } else if (currentPage === 'about.html') {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            const aboutLink = document.querySelector('.dropdown-menu a[href="about.html"]');
            if (dropdownToggle) dropdownToggle.classList.add('active');
            if (aboutLink) aboutLink.classList.add('active');
        } else if (currentPage === 'way-of-openness.html') {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            const wayOfOpennessLink = document.querySelector('.dropdown-menu a[href="content/way-of-openness.html"]');
            if (dropdownToggle) dropdownToggle.classList.add('active');
            if (wayOfOpennessLink) wayOfOpennessLink.classList.add('active');
        } else if (currentPage === 'lore.html') {
            const loreLink = document.querySelector('.nav-links a[href="lore.html"]');
            if (loreLink) loreLink.classList.add('active');
        } else if (currentPage === 'heists.html') {
            const heistsLink = document.querySelector('.nav-links a[href="heists.html"]');
            if (heistsLink) heistsLink.classList.add('active');
        } else if (currentPage === 'gang.html') {
            const gangLink = document.querySelector('.nav-links a[href="gang.html"]');
            if (gangLink) gangLink.classList.add('active');
        }
    } catch (error) {
        // Silently handle errors in production
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Determine the correct path based on current location
    const currentPath = window.location.pathname;
    const isInContentFolder = currentPath.includes('/content/');
    
    // Add cache-busting timestamp
    const timestamp = Date.now();
    
    if (isInContentFolder) {
        // If we're in the content folder, go up one level to find header/footer
        loadComponent('header', `../header.html?v=${timestamp}`);
        loadComponent('footer', `../footer.html?v=${timestamp}`);
    } else {
        // If we're at the root, use relative paths
        loadComponent('header', `header.html?v=${timestamp}`);
        loadComponent('footer', `footer.html?v=${timestamp}`);
    }
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    setTimeout(() => {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = currentYear;
        }
    }, 200);
    
    // Note: Auto-resize functionality removed in favor of CSS line-clamp
});



// Search icon functionality is now handled by search.js
function initializeSearchIcon() {
    // Check if search icons exist
    const searchIcons = [
        document.getElementById('search-icon-mobile'),
        document.getElementById('search-icon-desktop')
    ].filter(Boolean);
    
    // Search functionality moved to search.js with Pagefind integration
    // But we'll add basic click events here for immediate feedback
    searchIcons.forEach((icon, index) => {
        if (icon) {
            icon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Show a temporary message that search is loading
                const loadingMsg = document.createElement('div');
                loadingMsg.textContent = 'Search is loading...';
                loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border:1px solid #ccc;border-radius:8px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
                document.body.appendChild(loadingMsg);
                
                // Remove after 2 seconds
                setTimeout(() => {
                    if (loadingMsg.parentNode) {
                        loadingMsg.parentNode.removeChild(loadingMsg);
                    }
                }, 2000);
            });
        }
    });
}

        // Global variable to store Pagefind UI instance
        let globalPagefindUI = null;

        // Initialize Pagefind search functionality using standard PagefindUI
        function initializePagefindSearch() {
            try {
                // Load PagefindUI script and wait for it to be available globally
                const script = document.createElement('script');
                script.src = '/pagefind/pagefind-ui.js';
                script.onload = () => {
                    // PagefindUI is now available globally as window.PagefindUI
                    if (window.PagefindUI) {
                                            // Initialize PagefindUI with standard modal (we'll customize styling later)
                    const pagefindUI = new window.PagefindUI({
                        element: "#search",
                        showImages: false,
                        showSubResults: true,
                        highlightParam: "highlight"
                    });
                        
                        // Store the PagefindUI instance globally
                        globalPagefindUI = pagefindUI;
                        
                        // Initialize the search modal with PagefindUI integration
                        initializeSearchModalWithPagefindUI(pagefindUI);
                    } else {
                        console.error('PagefindUI not found after script load');
                    }
                };
                script.onerror = (error) => {
                    console.error('Failed to load PagefindUI script:', error);
                };
                
                // Append the script to the document head
                document.head.appendChild(script);
                
            } catch (error) {
                console.error('Failed to initialize PagefindUI:', error);
                return;
            }
        }

        // Initialize search modal with PagefindUI integration
        function initializeSearchModalWithPagefindUI(pagefindUI) {
            const searchIcons = [
                document.getElementById('search-icon-mobile'),
                document.getElementById('search-icon-desktop')
            ].filter(Boolean);

            // Let PagefindUI handle all modal management
            // We just need to trigger the search when icons are clicked
            searchIcons.forEach((icon, index) => {
                if (icon) {
                    icon.addEventListener('click', function() {
                        // Trigger PagefindUI's built-in search modal
                        if (pagefindUI && typeof pagefindUI.triggerSearch === 'function') {
                            pagefindUI.triggerSearch('');
                        }
                    });
                }
            });

            // Handle keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Open search with Ctrl/Cmd + K
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    if (pagefindUI && typeof pagefindUI.triggerSearch === 'function') {
                        pagefindUI.triggerSearch('');
                    }
                }
            });
        }



        // Function to close the search modal
        function closeSearchModal() {
            const searchModal = document.getElementById('search-modal');
            const searchOverlay = document.getElementById('search-overlay');
            const searchInput = document.getElementById('search-input');
            
            if (searchModal) searchModal.classList.remove('active');
            if (searchOverlay) searchOverlay.classList.remove('active');
            if (searchInput) searchInput.value = '';
            
            // Clear search results
            const searchResults = document.getElementById('search-results');
            if (searchResults) searchResults.innerHTML = '';
        }



// Hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', function() {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu with close button
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', function() {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburgerMenu.contains(event.target) && !navLinks.contains(event.target)) {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
        
        // Use event delegation for all nav-links interactions
        navLinks.addEventListener('click', function(event) {
            const target = event.target;
            
            // Handle dropdown toggle
            if (target.classList.contains('dropdown-toggle')) {
                if (window.innerWidth <= 768) {
                    event.preventDefault();
                    const dropdown = target.closest('.dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                    }
                }
                return;
            }
            
            // Close menu when clicking on regular links
            if (target.tagName === 'A' && !target.classList.contains('dropdown-toggle')) {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}
