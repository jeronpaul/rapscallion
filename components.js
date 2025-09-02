// Load header and footer components

// Check if the current page needs search functionality
function shouldInitializeSearch() {
    // Disable default PagefindUI in favor of custom search implementation
    return false;
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
            console.log('🔧 Header loaded, starting initialization...');
            
            setTimeout(() => {
                setActiveStates();
                initializeHamburgerMenu();
                
                // Load search files first, then initialize
                loadSearchFiles().then(() => {
                    console.log('✅ Search files loaded, calling initializeSearchIcon');
                    initializeSearchIcon();
                }).catch(error => {
                    console.error('❌ Failed to load search files:', error);
                });
                
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



// Load search CSS and JS files dynamically
async function loadSearchFiles() {
    console.log('🏁 COMPONENTS.JS: Starting search file loading...');
    console.log('🏁 Current pathname:', window.location.pathname);
    
    // Dynamically determine correct path based on current location
    const isInContentFolder = window.location.pathname.includes('/content/');
    const timestamp = Date.now();
    const searchCssPath = isInContentFolder ? `../custom-search.css?v=${timestamp}` : `custom-search.css?v=${timestamp}`;
    const searchJsPath = isInContentFolder ? `../custom-search.js?v=${timestamp}` : `custom-search.js?v=${timestamp}`;

    console.log('🔍 Search file paths:', { 
        isInContentFolder, 
        searchCssPath, 
        searchJsPath,
        timestamp 
    });

    // Test if JS file is reachable
    try {
        const response = await fetch(searchJsPath);
        console.log('🔍 Fetch test for JS file:', response.ok ? '✅ OK' : '❌ FAILED', response.status);
        if (!response.ok) {
            throw new Error(`JS file not found: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ JS file fetch test failed:', searchJsPath, error);
        throw error;
    }

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = searchCssPath;
    cssLink.onload = () => console.log('✅ Custom search CSS loaded successfully');
    cssLink.onerror = () => console.error('❌ Failed to load custom search CSS:', searchCssPath);
    document.head.appendChild(cssLink);

    console.log('🎨 CSS link added to head');

    // Load JS and wait for it
    return new Promise((resolve, reject) => {
        const jsScript = document.createElement('script');
        jsScript.src = searchJsPath;
        jsScript.onload = () => {
            console.log('✅ Custom search JS file loaded successfully');
            
            // Wait for the script to execute and create the search instance
            const checkForInstance = (attempts = 0) => {
                console.log('🔍 Checking for window.rapscallionSearch (attempt', attempts + 1, '):', !!window.rapscallionSearch);
                
                if (window.rapscallionSearch) {
                    console.log('🎉 Search instance found!');
                    console.log('🔍 Available methods:', typeof window.rapscallionSearch.bindSearchIcons);
                    resolve();
                } else if (attempts < 20) {
                    setTimeout(() => checkForInstance(attempts + 1), 100);
                } else {
                    console.error('❌ Search instance never created after 2 seconds');
                    reject(new Error('Search instance timeout'));
                }
            };
            
            checkForInstance();
        };
        jsScript.onerror = (error) => {
            console.error('❌ Failed to load custom search JS:', searchJsPath, error);
            reject(error);
        };
        
        document.head.appendChild(jsScript);
        console.log('🚀 JS script added to head, waiting for load...');
    });
}

// Search icon functionality - ensure binding when header loads
function initializeSearchIcon() {
    console.log('🔗 COMPONENTS.JS: initializeSearchIcon called');
    console.log('🔗 Current window.rapscallionSearch:', !!window.rapscallionSearch);
    
    // Trigger search icon binding from custom-search.js if available
    setTimeout(() => {
        console.log('🔗 First timeout (100ms) - checking search instance...');
        if (window.rapscallionSearch && window.rapscallionSearch.bindSearchIcons) {
            console.log('🔍 ✅ Found search instance, binding icons...');
            window.rapscallionSearch.bindSearchIcons();
        } else {
            // Search instance not ready yet, retry
            console.log('🔍 ❌ Search instance not ready, retrying in 1000ms...');
            console.log('🔍 Available methods on window:', Object.keys(window).filter(key => key.includes('search')));
            
            setTimeout(() => {
                console.log('🔗 Second timeout (1000ms) - checking again...');
                if (window.rapscallionSearch && window.rapscallionSearch.bindSearchIcons) {
                    console.log('🔍 ✅ Found search instance on retry, binding icons...');
                    window.rapscallionSearch.bindSearchIcons();
                } else {
                    console.error('🔍 ❌ Search instance still not available after 1100ms total wait');
                    console.log('🔍 Final window check:', !!window.rapscallionSearch);
                }
            }, 1000);
        }
    }, 100);
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
                        // Initialize PagefindUI with enhanced configuration
                        const pagefindUI = new window.PagefindUI({
                            element: "#search",
                            showImages: false,
                            showSubResults: true,
                            highlightParam: "highlight",
                            excerptLength: 15,
                            resetStyles: false,
                            showEmptyFilters: true,
                            translations: {
                                placeholder: "Search Rapscallion content...",
                                clear_search: "Clear",
                                load_more: "Load more results",
                                search_label: "Search this site",
                                filters_label: "Filters",
                                zero_results: "No results for [SEARCH_TERM]",
                                many_results: "[COUNT] results for [SEARCH_TERM]",
                                one_result: "1 result for [SEARCH_TERM]",
                                alt_search: "No results for [SEARCH_TERM]. Showing results for [DIFFERENT_TERM] instead",
                                search_suggestion: "Try searching for [DIFFERENT_TERM]",
                                searching: "Searching..."
                            }
                        });
                        
                        // Store the PagefindUI instance globally
                        globalPagefindUI = pagefindUI;
                        
                        // Initialize the search modal with PagefindUI integration
                        initializeSearchModalWithPagefindUI(pagefindUI);
                        
                        // Add custom result enhancement
                        enhanceSearchResults();
                        
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

        // Enhance search results with deep linking and highlighting
        function enhanceSearchResults() {
            // Watch for search results being added to the DOM
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        const searchResults = document.querySelectorAll('.pagefind-ui__result');
                        searchResults.forEach(result => {
                            if (!result.dataset.enhanced) {
                                enhanceIndividualResult(result);
                                result.dataset.enhanced = 'true';
                            }
                        });
                    }
                });
            });

            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Enhance individual search result with deep linking
        function enhanceIndividualResult(resultElement) {
            const resultLink = resultElement.querySelector('a[href]');
            if (!resultLink) return;

            const originalHref = resultLink.getAttribute('href');
            
            // Extract search term from current search
            const searchInput = document.querySelector('.pagefind-ui__search-input');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            if (searchTerm) {
                // Add highlight parameter to the link
                const separator = originalHref.includes('?') ? '&' : '?';
                resultLink.href = `${originalHref}${separator}highlight=${encodeURIComponent(searchTerm)}`;
            }

            // Add click handler for highlighting
            resultLink.addEventListener('click', (e) => {
                if (searchTerm) {
                    setTimeout(() => {
                        highlightSearchTermsOnPage(searchTerm);
                    }, 100);
                }
            });
        }

        // Highlight search terms on the current page using only Pagefind's built-in highlighting
        function highlightSearchTermsOnPage(searchTerm) {
            const urlParams = new URLSearchParams(window.location.search);
            const highlightParam = urlParams.get('highlight') || searchTerm;
            
            if (highlightParam && window.PagefindHighlight) {
                // Use only Pagefind's built-in highlighting to avoid conflicts
                new PagefindHighlight({ highlightParam: "highlight" });
            }
        }

        // Initialize highlighting on page load if highlight parameter exists
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const highlightTerm = urlParams.get('highlight');
            if (highlightTerm) {
                // Wait for content to load, then apply highlighting
                setTimeout(() => {
                    highlightSearchTermsOnPage(highlightTerm);
                    
                    // After highlighting, scroll to target with single attempt
                    setTimeout(() => {
                        let scrollTarget = null;
                        
                        // First priority: scroll to hash anchor if exists
                        if (window.location.hash && window.location.hash.length > 1) {
                            console.log(`🎯 SCROLL DEBUG - Looking for anchor: ${window.location.hash}`);
                            try {
                                scrollTarget = document.querySelector(window.location.hash);
                                console.log(`🎯 SCROLL DEBUG - Found target:`, scrollTarget);
                            } catch (error) {
                                console.log(`🎯 SCROLL DEBUG - Invalid hash selector: ${window.location.hash}`);
                            }
                        }
                        
                        // Second priority: scroll to first highlight
                        if (!scrollTarget) {
                            scrollTarget = document.querySelector('mark[data-pagefind-match]');
                        }
                        
                        // Scroll to target if found, respecting existing scroll-margin CSS
                        if (scrollTarget) {
                            // Use smooth scrolling but let CSS scroll-margin handle positioning
                            scrollTarget.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start',
                                inline: 'nearest'
                            });
                        }
                    }, 200);
                }, 800);
            }
        });

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
