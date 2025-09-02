// Load header and footer components
console.log('🔍 Components.js loaded at:', new Date().toISOString());

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
        } else {
            console.error(`❌ Target element ${elementId} not found`);
        }
        
        // Set active states based on current page (only for header, with delay to ensure DOM is ready)
        if (componentPath === 'header.html') {
            console.log('🔍 Header loaded, setting up components...');
            setTimeout(() => {
                console.log('🔍 Setting up header components...');
                setActiveStates();
                initializeHamburgerMenu();
                initializeSearchIcon();
                // Initialize Pagefind after a longer delay to ensure scripts are loaded
                setTimeout(() => {
                    console.log('🔍 About to initialize Pagefind...');
                    initializePagefindSearch();
                }, 500);
            }, 100);
        }
    } catch (error) {
        console.error(`❌ Error loading ${componentPath}:`, error);
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
        console.warn('⚠️ Error setting active states:', error);
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
    // Search functionality moved to search.js with Pagefind integration
}

        // Initialize Pagefind search functionality with custom UI
        function initializePagefindSearch() {
            console.log('🔍 Initializing Pagefind search with custom UI...');
            console.log('🔍 Current time:', new Date().toISOString());
            console.log('🔍 Document ready state:', document.readyState);
            console.log('🔍 Window.PagefindUI:', typeof window.PagefindUI);
            console.log('🔍 Global PagefindUI:', typeof PagefindUI);

            // Check if PagefindUI is available
            if (typeof PagefindUI === 'undefined') {
                console.error('❌ PagefindUI is not available. Script may not have loaded.');
                console.log('🔍 Available globals:', Object.keys(window).filter(key => key.toLowerCase().includes('pagefind')));
                return;
            }

            console.log('🔍 PagefindUI available:', typeof PagefindUI);

            // Initialize Pagefind UI (hidden, we use our custom UI)
            let pagefindUI;
            try {
                pagefindUI = new PagefindUI({
                    element: "#search",
                    showImages: false,
                    showSubResults: true,
                    excerptLength: 150,
                    highlightParam: "highlight",
                    processResult: function(result) {
                        // Custom URL mapping for our site structure
                        const urlMap = {
                            "Startup Ideas: How the Best Founders Get Them and Why Novelty Is Overrated": "/content/startup-ideas.html",
                            "Essential Reading": "/content/essential-reading.html",
                            "Getting to Profitability without Raising Money": "/content/getting-to-profitability.html",
                            "The Way of Openness": "/content/way-of-openness.html"
                        };

                        if (urlMap[result.meta?.title]) {
                            result.meta.url = urlMap[result.meta.title];
                        }

                        return result;
                    }
                });

                console.log('✅ Pagefind UI initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing Pagefind UI:', error);
                return;
            }

            // Initialize custom search modal
            initializeCustomSearchModal(pagefindUI);

            console.log('✅ Pagefind search initialization complete');
        }

        // Initialize custom search modal with Pagefind integration
        function initializeCustomSearchModal(pagefindUI) {
            console.log('🔍 Initializing custom search modal...');

            const searchOverlay = document.getElementById('search-overlay');
            const searchInput = document.getElementById('search-input');
            const searchClose = document.getElementById('search-close');
            const searchResults = document.getElementById('search-results');
            const searchIcons = [
                document.getElementById('search-icon-mobile'),
                document.getElementById('search-icon-desktop')
            ].filter(Boolean);

            if (!searchOverlay || !searchInput || !searchClose || !searchResults) {
                console.error('❌ Custom search modal elements not found');
                return;
            }

            console.log('🔍 Search icons found:', searchIcons.length);

            // Open search modal when search icons are clicked
            searchIcons.forEach((icon, index) => {
                if (icon) {
                    console.log(`🔍 Binding click event to search icon ${index}`);
                    icon.addEventListener('click', function() {
                        console.log('🔍 Search icon clicked, opening custom search modal...');
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

            // Handle search input
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
                console.log('🔍 Opening search modal...');
                console.log('🔍 Search overlay:', searchOverlay);
                console.log('🔍 Search input:', searchInput);
                
                searchOverlay.style.display = 'block';
                searchOverlay.classList.add('active');
                
                // Wait a moment for the modal to render, then focus
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus();
                        console.log('✅ Search input focused');
                    } else {
                        console.error('❌ Search input not found for focusing');
                    }
                }, 100);
                
                console.log('✅ Search modal opened');
            }

            function closeSearchModal() {
                searchOverlay.style.display = 'none';
                searchOverlay.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
                console.log('✅ Search modal closed');
            }

            async function performSearch(query) {
                console.log('🔍 Performing search for:', query);
                
                try {
                    // Use Pagefind's standard search functionality
                    const search = await import('/pagefind/pagefind.js');
                    const searchInstance = await search.init();
                    const results = await searchInstance.search(query);
                    
                    console.log('🔍 Search results:', results);
                    console.log('🔍 First result structure:', results.results?.[0]);
                    console.log('🔍 First result keys:', results.results?.[0] ? Object.keys(results.results[0]) : 'No results');
                    
                    if (results.results && results.results.length > 0) {
                        await displaySearchResults(results.results);
                    } else {
                        searchResults.innerHTML = '<div class="no-results">No results found</div>';
                    }
                } catch (error) {
                    console.error('❌ Search error:', error);
                    searchResults.innerHTML = '<div class="search-error">Search temporarily unavailable</div>';
                }
            }

            async function displaySearchResults(results) {
                console.log('🔍 Displaying search results:', results);
                
                // Add results count header
                const resultsCount = results.length;
                const searchTerm = document.getElementById('search-input').value;
                const resultsHeader = `
                    <div class="search-results-header">
                        <h3 class="results-count">${resultsCount} RESULT${resultsCount !== 1 ? 'S' : ''} FOR '${searchTerm.toUpperCase()}'</h3>
                    </div>
                `;
                
                const resultsHTML = await Promise.all(results.map(async (result) => {
                    console.log('🔍 Individual result:', result);
                    console.log('🔍 Result keys:', Object.keys(result));
                    console.log('🔍 Result anchor property:', result.anchor);
                    console.log('🔍 Result meta:', result.meta);
                    
                    // Pagefind stores data in a function that needs to be called
                    let resultData = {};
                    try {
                        if (typeof result.data === 'function') {
                            resultData = await result.data();
                            console.log('🔍 Extracted result data:', resultData);
                            console.log('🔍 Result data keys:', Object.keys(resultData));
                        }
                    } catch (error) {
                        console.warn('⚠️ Error extracting result data:', error);
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
                        
                        console.log('🔍 Found anchor:', result.anchor);
                    }
                    
                    console.log('🔍 Processed result:', { title, url: anchorUrl, excerpt, anchorInfo });
                    
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
            }

            console.log('✅ Custom search modal initialized');
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
