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

        // Initialize Pagefind search functionality with custom UI
        function initializePagefindSearch() {
            // Initialize Pagefind search API directly (not UI component)
            try {
                // Import and initialize Pagefind search
                import('/pagefind/pagefind.js').then(async (searchModule) => {
                    // Try different ways to get the search instance
                    let searchInstance;
                    
                    // Method 1: Try searchModule.init()
                    if (typeof searchModule.init === 'function') {
                        searchInstance = await searchModule.init();
                    }
                    
                    // Method 2: Try searchModule.default.init() if it's an ES module
                    if (!searchInstance && searchModule.default && typeof searchModule.default.init === 'function') {
                        searchInstance = await searchModule.default.init();
                    }
                    
                    // Method 3: Try using searchModule directly if it has a search method
                    if (!searchInstance && typeof searchModule.search === 'function') {
                        searchInstance = searchModule;
                    }
                    
                    // Method 4: Try searchModule.default if it has a search method
                    if (!searchInstance && searchModule.default && typeof searchModule.default.search === 'function') {
                        searchInstance = searchModule.default;
                    }
                    
                    if (!searchInstance) {
                        return;
                    }
                    
                    // Enhance the search instance with preloading capability
                    const enhancedSearchInstance = {
                        ...searchInstance,
                        preload: (term) => {
                            if (searchInstance && typeof searchInstance.preload === 'function') {
                                try {
                                    searchInstance.preload(term);
                                } catch (error) {
                                    // Silently handle errors in production
                                }
                            }
                        }
                    };
                    
                    // Store the enhanced search instance globally
                    globalPagefindUI = enhancedSearchInstance;
                    
                    // Now that Pagefind is initialized, initialize the custom search modal
                    initializeCustomSearchModal(globalPagefindUI);
                }).catch(error => {
                    // Silently handle errors in production
                });
            } catch (error) {
                // Silently handle errors in production
                return;
            }
        }

        // Initialize custom search modal with Pagefind integration
        function initializeCustomSearchModal(pagefindUI) {
            const searchOverlay = document.getElementById('search-overlay');
            const searchInput = document.getElementById('search-input');
            const searchClose = document.getElementById('search-close');
            const searchResults = document.getElementById('search-results');
            const searchIcons = [
                document.getElementById('search-icon-mobile'),
                document.getElementById('search-icon-desktop')
            ].filter(Boolean);

            if (!searchOverlay || !searchInput || !searchClose || !searchResults) {
                return;
            }

            // Open search modal when search icons are clicked
            searchIcons.forEach((icon, index) => {
                if (icon) {
                    icon.addEventListener('click', function() {
                        openSearchModal();
                    });
                }
            });

            // Close search modal
            searchClose.addEventListener('click', closeSearchModal);
            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    closeSearchModal();
                }
            });

            // Handle search input with preloading strategy
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                const query = this.value.trim();
                
                // Clear previous timeout
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }

                if (query.length === 0) {
                    searchResults.innerHTML = '';
                    return;
                }

                // Preload the search term for instant results
                if (pagefindUI && typeof pagefindUI.preload === 'function') {
                    try {
                        pagefindUI.preload(query);
                    } catch (error) {
                        // Silently handle errors in production
                    }
                }

                // Debounce search
                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            });

            // Handle keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Open search with Ctrl/Cmd + K
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    openSearchModal();
                }
                
                // Close search with Escape
                if (e.key === 'Escape' && searchOverlay.style.display === 'block') {
                    closeSearchModal();
                }
            });

            function openSearchModal() {
                searchOverlay.style.display = 'block';
                searchOverlay.classList.add('active');
                
                // Wait a moment for the modal to render, then focus
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }

            function closeSearchModal() {
                searchOverlay.style.display = 'none';
                searchOverlay.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
            }

                        async function performSearch(query) {
                try {
                    // Use the Pagefind search API instance that's already configured
                    if (globalPagefindUI && typeof globalPagefindUI.search === 'function') {
                        const results = await globalPagefindUI.search(query, { showSubResults: true });
                        
                        if (results && results.results && results.results.length > 0) {
                            // Check if we have sub-results
                            let allResults = [];
                            for (const result of results.results) {
                                allResults.push(result);
                                
                                // Get the result data to check for sub_results
                                try {
                                    if (typeof result.data === 'function') {
                                        const resultData = await result.data();
                                        if (resultData.sub_results && resultData.sub_results.length > 0) {
                                            allResults.push(...resultData.sub_results);
                                        }
                                    }
                                } catch (error) {
                                    // Silently handle errors in production
                                }
                            }
                            
                            await displaySearchResults(allResults);
                            return;
                        }
                    }
                    
                    // Fallback to direct Pagefind API if our instance doesn't work
                    const search = await import('/pagefind/pagefind.js');
                    const searchModule = search.default || search;
                    
                    const results = await searchModule.search(query, { showSubResults: true });
                    
                    if (results.results && results.results.length > 0) {
                        // Flatten results to include sub-results
                        let allResults = [];
                        for (const result of results.results) {
                            allResults.push(result);
                            
                            // Get the result data to check for sub_results
                            try {
                                if (typeof result.data === 'function') {
                                    const resultData = await result.data();
                                    if (resultData.sub_results && resultData.sub_results.length > 0) {
                                        allResults.push(...resultData.sub_results);
                                    }
                                }
                            } catch (error) {
                                // Silently handle errors in production
                            }
                        }
                        
                        await displaySearchResults(allResults);
                    } else {
                        searchResults.innerHTML = '<div class="no-results">No results found</div>';
                    }
                } catch (error) {
                    searchResults.innerHTML = '<div class="search-error">Search temporarily unavailable</div>';
                }
            }

            async function displaySearchResults(results) {
                // Add results count header
                const resultsCount = results.length;
                const searchTerm = document.getElementById('search-input').value;
                const resultsHeader = `
                    <div class="search-results-header">
                        <h3 class="results-count">${resultsCount} RESULT${resultsCount !== 1 ? 'S' : ''} FOR '${searchTerm.toUpperCase()}'</h3>
                    </div>
                `;
                
                const resultsHTML = await Promise.all(results.map(async (result) => {
                    // Pagefind stores data in a function that needs to be called
                    let resultData = {};
                    try {
                        if (typeof result.data === 'function') {
                            resultData = await result.data();
                        }
                    } catch (error) {
                        // Silently handle errors in production
                    }
                    
                    // Extract title from various possible locations
                    const title = resultData.title || 
                                 resultData.meta?.title || 
                                 result.meta?.title || 
                                 result.title || 
                                 'Untitled';
                    
                    // Extract URL from various possible locations
                    let url = resultData.url || 
                              resultData.meta?.url || 
                              result.meta?.url || 
                              result.url || 
                              '#';
                    
                    // Extract excerpt from various possible locations
                    const excerpt = resultData.excerpt || 
                                   result.excerpt || 
                                   resultData.content?.substring(0, 150) + '...' || 
                                   result.content?.substring(0, 150) + '...' || 
                                   '';
                    
                    // Check if this result has anchor information (paragraph-level result)
                    let anchorInfo = '';
                    let anchorUrl = url;
                    
                    if (result.anchor) {
                        // This is a paragraph-level result with anchor
                        anchorInfo = `<span class="search-result-anchor">📎 ${result.anchor.title || 'Paragraph'}</span>`;
                        
                        // Add anchor to URL if it's not already there
                        if (!url.includes('#')) {
                            anchorUrl = `${url}#${result.anchor.id}`;
                        }
                    }
                    
                    return `
                        <div class="search-result">
                            <a href="${anchorUrl}" class="search-result-link">
                                <h3 class="search-result-title">${title}</h3>
                                <p class="search-result-excerpt">${excerpt}</p>
                                ${anchorInfo}
                            </a>
                        </div>
                    `;
                }));

                searchResults.innerHTML = resultsHeader + resultsHTML.join('');
                
                // Add click handlers for search results
                addSearchResultClickHandlers();
            }


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

        // Function to add click handlers for search results
        function addSearchResultClickHandlers() {
            const searchResults = document.querySelectorAll('.search-result-link');
            searchResults.forEach(link => {
                // Remove any existing click event listeners to prevent duplicates
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                
                // Add the click handler to the new element
                newLink.addEventListener('click', function(e) {
                    // Close the search modal after a short delay to allow navigation
                    setTimeout(() => {
                        closeSearchModal();
                    }, 100);
                });
            });
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
