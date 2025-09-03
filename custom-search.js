// Custom Search Implementation for Rapscallion
// Using Pagefind API with custom styling

class RapscallionSearch {
    constructor() {
        this.pagefind = null;
        this.isOpen = false;
        this.currentQuery = '';
        this.results = [];
        this.debounceTimer = null;
        
        // Initialize synchronously for immediate availability
        this.initSync();
        
        // Load Pagefind asynchronously in background
        this.loadPagefindAsync();
    }
    
    initSync() {
        // Create search UI immediately
        this.createSearchUI();
        
        // Bind events immediately
        this.bindEvents();
    }
    
    async loadPagefindAsync() {
        // Load Pagefind in background
        try {
            this.pagefind = await import('/pagefind/pagefind.js');
        } catch (error) {
            console.error('Custom search: Failed to load Pagefind:', error);
        }
    }
    
    createSearchUI() {
        // Remove any existing search overlay first
        const existingOverlay = document.getElementById('custom-search-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-search-overlay';
        overlay.id = 'custom-search-overlay';
        // Immediately hide the overlay to prevent flash
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'custom-search-modal';
        
        modal.innerHTML = `
            <button class="custom-search-close" aria-label="Close search">×</button>
            
            <div class="custom-search-header">
                <div class="custom-search-input-container">
                    <input 
                        type="text" 
                        class="custom-search-input" 
                        placeholder="Search..."
                        autocomplete="off"
                        spellcheck="false"
                    >
                </div>
                
                <div class="custom-search-stats"></div>
            </div>
            
            <div class="custom-search-results" id="custom-search-results">
                <!-- Results will appear here -->
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Store references
        this.overlay = overlay;
        this.modal = modal;
        this.input = modal.querySelector('.custom-search-input');
        this.results = modal.querySelector('.custom-search-results');
        this.stats = modal.querySelector('.custom-search-stats');
        this.closeBtn = modal.querySelector('.custom-search-close');
    }
    
    bindEvents() {
        // Search icon clicks with enhanced retry mechanism
        this.bindSearchIcons();
        
        // Retry binding search icons after header loads at various intervals
        setTimeout(() => this.bindSearchIcons(), 300);
        setTimeout(() => this.bindSearchIcons(), 800);
        setTimeout(() => this.bindSearchIcons(), 1500);
        setTimeout(() => this.bindSearchIcons(), 3000);
        
        // Also listen for any dynamic changes in the DOM that might add search icons
        const observer = new MutationObserver((mutations) => {
            // Check if header elements were added
            const headerAdded = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.id === 'header' || 
                        node.querySelector && node.querySelector('#search-icon-desktop, #search-icon-mobile')
                    )
                )
            );
            
            if (headerAdded) {
                console.log('🔗 Header detected in DOM, binding search icons...');
                setTimeout(() => this.bindSearchIcons(), 100);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
            
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // Search input
        this.input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Prevent form submission
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.selectFirstResult();
            }
        });
    }
    
    bindSearchIcons() {
        const searchIcons = [
            document.getElementById('search-icon-desktop'),
            document.getElementById('search-icon-mobile')
        ].filter(Boolean);
        
        searchIcons.forEach((icon, index) => {
            // Skip if already bound to prevent duplicate listeners
            if (icon.dataset.searchBound === 'true') {
                return;
            }
            
            // Remove any existing listeners first
            icon.onclick = null;
            
            // Add new click listener with better event handling
            const clickHandler = (e) => {
                // Only handle if this icon is actually visible (not hidden by CSS)
                const isVisible = window.getComputedStyle(icon).display !== 'none' && 
                                 window.getComputedStyle(icon).visibility !== 'hidden';
                
                if (!isVisible) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                this.open();
            };
            
            icon.addEventListener('click', clickHandler);
            
            // Mark as bound to prevent duplicates
            icon.dataset.searchBound = 'true';
        });
        
        return searchIcons.length > 0;
    }
    
    open() {
        if (!this.overlay) {
            return;
        }
        
        this.isOpen = true;
        this.overlay.classList.add('active');
        
        // Remove inline styles that prevent visibility (from flash fix)
        this.overlay.style.opacity = '';
        this.overlay.style.visibility = '';
        
        document.body.style.overflow = 'hidden';
        
        // Focus input after animation
        setTimeout(() => {
            if (this.input) {
                this.input.focus();
            }
        }, 100);
    }
    
    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        
        // Restore inline styles to prevent flash on next page load
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        
        document.body.style.overflow = '';
        this.input.value = '';
        this.currentQuery = '';
        this.showEmptyState();
        this.stats.classList.remove('visible');
        
        // Clear any pending debounce timers
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        // Ensure search icons are properly bound after navigation
        setTimeout(() => {
            this.bindSearchIcons();
        }, 100);
    }
    
    async handleSearch(query) {
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Debounce search
        this.debounceTimer = setTimeout(async () => {
            if (!query || query.trim().length < 2) {
                this.showEmptyState();
                this.stats.classList.remove('visible');
                return;
            }
            
            this.currentQuery = query.trim();
            await this.performSearch(this.currentQuery);
        }, 300);
    }
    
    async performSearch(query) {
        // Always attempt to ensure Pagefind is available
        if (!this.pagefind) {
            console.log('Pagefind not loaded, loading...');
            try {
                this.pagefind = await import('/pagefind/pagefind.js');
                console.log('✅ Pagefind loaded successfully');
            } catch (error) {
                console.error('❌ Failed to load Pagefind:', error);
                this.showError();
                return;
            }
        }
        
        // Additional check to ensure Pagefind search function is available
        if (!this.pagefind.search) {
            console.error('Pagefind search function not available, attempting reload...');
            try {
                this.pagefind = await import('/pagefind/pagefind.js');
                console.log('✅ Pagefind reloaded successfully');
            } catch (error) {
                console.error('❌ Failed to reload Pagefind:', error);
                this.showError();
                return;
            }
        }
        
        try {
            this.showLoading();
            
            const searchResults = await this.pagefind.search(query);
            
            if (searchResults.results.length === 0) {
                this.showNoResults(query);
                return;
            }
            
            // Get detailed data for each result
            const detailedResults = await Promise.all(
                searchResults.results.map(result => result.data())
            );
            
            this.displayResults(detailedResults, query);
            
            // Count total results including sub-results
            const totalResults = detailedResults.reduce((total, result) => {
                return total + 1 + (result.sub_results ? result.sub_results.length : 0);
            }, 0);
            
            this.updateStats(totalResults, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        }
    }
    
    displayResults(results, query) {
        const resultsHtml = results.map((result, index) => {
            console.log(`🔗 PROCESSING RESULT ${index + 1}:`, {
                title: result.meta.title,
                url: result.url,
                sub_results_count: result.sub_results ? result.sub_results.length : 0,
                sub_results: result.sub_results
            });
            
            // If we have sub-results, create individual clickable items for each
            if (result.sub_results && result.sub_results.length > 0) {
                return result.sub_results.map((sub, subIndex) => {
                    console.log(`🔗 SUB-RESULT ${subIndex + 1}:`, {
                        title: sub.title,
                        url: sub.url,
                        excerpt: sub.excerpt.substring(0, 100) + '...'
                    });
                    
                    // Use the sub-result URL directly if it has an anchor
                    let url;
                    if (sub.url && sub.url.includes('#')) {
                        // Sub-result already has full URL with anchor
                        const baseUrl = sub.url.split('#')[0];
                        const anchor = sub.url.split('#')[1];
                        url = `${baseUrl}?highlight=${encodeURIComponent(query)}#${anchor}`;
                        console.log(`🔗 DIRECT SUB-URL: ${url}`);
                    } else {
                        // Fallback to result URL with highlight
                        url = `${result.url}?highlight=${encodeURIComponent(query)}`;
                        console.log(`🔗 FALLBACK URL: ${url}`);
                    }
                    
                    return `
                        <a href="${url}" class="custom-search-result" data-search-result>
                            <div class="custom-search-result-title">${this.highlightText(result.meta.title, query)}</div>
                            <div class="custom-search-result-url">${this.formatUrl(result.url)}</div>
                            <div class="custom-search-sub-result">
                                <div class="custom-search-sub-result-title">${this.highlightText(sub.title, query)}</div>
                                <div class="custom-search-sub-result-excerpt">${this.highlightText(sub.excerpt, query)}</div>
                            </div>
                        </a>
                    `;
                }).join('');
            } else {
                // No sub-results, create a single result link
                const url = `${result.url}?highlight=${encodeURIComponent(query)}`;
                console.log(`🔗 MAIN RESULT URL: ${url}`);
                
                return `
                    <a href="${url}" class="custom-search-result" data-search-result>
                        <div class="custom-search-result-title">${this.highlightText(result.meta.title, query)}</div>
                        <div class="custom-search-result-url">${this.formatUrl(result.url)}</div>
                        <div class="custom-search-result-excerpt">${this.highlightText(result.excerpt, query)}</div>
                    </a>
                `;
            }
        }).join('');
        
        this.results.innerHTML = resultsHtml;
        
        // Add click handlers to search results
        this.results.querySelectorAll('[data-search-result]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                console.log('🔗 SEARCH RESULT CLICKED:', href);
                console.log('🔗 CURRENT URL BEFORE:', window.location.href);
                
                // Parse the destination URL
                const url = new URL(href, window.location.origin);
                const currentPath = window.location.pathname;
                const targetPath = url.pathname;
                const samePage = currentPath === targetPath;
                
                console.log('🔗 SAME PAGE NAVIGATION:', samePage);
                console.log('🔗 CURRENT PATH:', currentPath);
                console.log('🔗 TARGET PATH:', targetPath);
                
                // Always close the modal first
                this.close();
                
                if (samePage) {
                    // Same page navigation - handle manually
                    e.preventDefault();
                    
                    const anchor = url.hash ? url.hash.substring(1) : null;
                    const highlight = url.searchParams.get('highlight');
                    
                    console.log('🔗 MANUAL NAVIGATION - Anchor:', anchor);
                    console.log('🔗 MANUAL NAVIGATION - Highlight:', highlight);
                    
                    // Update URL without reloading
                    window.history.pushState({}, '', href);
                    
                    // Manually trigger highlighting and scrolling
                    setTimeout(() => {
                        this.handleSamePageNavigation(highlight, anchor);
                    }, 200);
                } else {
                    // Different page - let default navigation happen
                    // The browser will navigate and the search will be reinitialized on the new page
                    console.log('🔗 DIFFERENT PAGE - allowing default navigation');
                }
                
                // Log URL after close
                setTimeout(() => {
                    console.log('🔗 CURRENT URL AFTER:', window.location.href);
                    console.log('🔗 CURRENT HASH AFTER:', window.location.hash);
                }, 100);
            });
        });
    }
    
    highlightText(text, query) {
        if (!text || !query) return text;
        
        // Simple highlighting for search results display only
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark class="custom-search-highlight">$1</mark>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    formatUrl(url) {
        return url.replace(/^\//, '').replace(/\.html$/, '');
    }
    
    updateStats(count, query) {
        const subResultText = count === 1 ? 'result' : 'results';
        this.stats.innerHTML = `Found ${count} ${subResultText} for "${query}"`;
        this.stats.classList.add('visible');
    }
    
    showEmptyState() {
        this.results.innerHTML = '';
    }
    
    showLoading() {
        this.results.innerHTML = `
            <div class="custom-search-loading">
                <div class="custom-search-spinner"></div>
                <span>Searching...</span>
            </div>
        `;
    }
    
    showNoResults(query) {
        this.results.innerHTML = '';
        this.updateStats(0, query);
    }
    
    showError() {
        this.results.innerHTML = '';
    }
    
    selectFirstResult() {
        const firstResult = this.results.querySelector('.custom-search-result');
        if (firstResult) {
            firstResult.click();
        }
    }
    
    handleSamePageNavigation(highlight, anchor) {
        console.log('🎯 HANDLING SAME PAGE NAVIGATION:', { highlight, anchor });
        
        // Apply highlighting first if needed
        if (highlight && window.PagefindHighlight) {
            try {
                // Clear any existing highlights first
                const existingHighlights = document.querySelectorAll('mark[data-pagefind-match]');
                existingHighlights.forEach(mark => {
                    const parent = mark.parentNode;
                    parent.insertBefore(document.createTextNode(mark.textContent), mark);
                    parent.removeChild(mark);
                });
                
                new PagefindHighlight({ highlightParam: "highlight" });
                console.log('🎯 HIGHLIGHTING APPLIED FOR:', highlight);
            } catch (error) {
                console.error('🎯 HIGHLIGHTING ERROR:', error);
            }
        }
        
        // Scroll to target with priority for specific anchor
        setTimeout(() => {
            let scrollTarget = null;
            
            // STRICT PRIORITY: Only scroll to anchor if we have one, don't fall back
            if (anchor) {
                console.log('🎯 LOOKING FOR SPECIFIC ANCHOR:', anchor);
                try {
                    scrollTarget = document.getElementById(anchor);
                    console.log('🎯 ANCHOR TARGET FOUND:', !!scrollTarget);
                    
                    if (scrollTarget) {
                        console.log('🎯 SCROLLING TO SPECIFIC ANCHOR:', scrollTarget);
                        scrollTarget.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                        return; // Exit early - don't fall back to highlights
                    } else {
                        console.warn('🎯 SPECIFIC ANCHOR NOT FOUND:', anchor);
                        // Don't fall back to highlights - this indicates a real problem
                        return;
                    }
                } catch (error) {
                    console.error('🎯 ANCHOR ERROR:', error);
                    return;
                }
            }
            
            // Only scroll to first highlight if we don't have a specific anchor
            if (!anchor && highlight) {
                console.log('🎯 NO SPECIFIC ANCHOR - LOOKING FOR FIRST HIGHLIGHT');
                scrollTarget = document.querySelector('mark[data-pagefind-match]');
                console.log('🎯 HIGHLIGHT TARGET FOUND:', !!scrollTarget);
                
                if (scrollTarget) {
                    console.log('🎯 SCROLLING TO FIRST HIGHLIGHT:', scrollTarget);
                    scrollTarget.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
        }, 500); // Increased timeout to ensure highlighting is complete
    }
}

// Initialize custom search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple instances
    if (window.rapscallionSearch) {
        return;
    }
    
    try {
        // Initialize search immediately, then retry binding after components load
        window.rapscallionSearch = new RapscallionSearch();
    } catch (error) {
        console.error('Failed to create RapscallionSearch instance:', error);
    }
});

// Also try initialization if script loads after DOM is ready
if (document.readyState !== 'loading' && !window.rapscallionSearch) {
    try {
        window.rapscallionSearch = new RapscallionSearch();
    } catch (error) {
        console.error('Failed to create RapscallionSearch instance:', error);
    }
}