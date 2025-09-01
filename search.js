// Advanced Search functionality for Rapscallion site - v21 (With Anchor Links)
// This file handles the search interface and results display with comprehensive content crawling

// DOM elements
let searchInput, searchButton, searchModal, searchResults, searchQueryDisplay, searchCloseBtn;

// Initialize search functionality
function initSearch() {
    // Get DOM elements
    searchInput = document.getElementById('search-input');
    searchButton = document.getElementById('search-button');
    searchModal = document.getElementById('search-modal');
    searchResults = document.getElementById('search-results');
    searchQueryDisplay = document.getElementById('search-query-display');
    searchCloseBtn = document.getElementById('search-close-btn');

    if (!searchInput || !searchButton || !searchModal || !searchResults || !searchQueryDisplay || !searchCloseBtn) {
        console.error('Search elements not found');
        return;
    }
    
    async init() {
        try {
            // Initialize Pagefind from local files
            this.pagefind = await import('./pagefind/pagefind.js');
            this.isInitialized = true;
            console.log('🔍 Pagefind initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Pagefind:', error);
            this.showError('Search is temporarily unavailable');
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        console.log('🔍 Binding events...');
        
        // Search icon clicks
        this.searchIcons.forEach((icon, index) => {
            console.log(`🔍 Adding click listener to search icon ${index}`);
            icon.addEventListener('click', (e) => {
                console.log('🔍 Search icon clicked!', e);
                this.openSearch();
            });
        });
        
        // Close button
        if (this.searchClose) {
            this.searchClose.addEventListener('click', () => this.closeSearch());
        }
        
        // Overlay click to close
        if (this.searchOverlay) {
            this.searchOverlay.addEventListener('click', (e) => {
                if (e.target === this.searchOverlay) {
                    this.closeSearch();
                }
            });
        }
        
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                console.log('🔍 Input event, query:', query, 'length:', query.length);
                if (query.length > 2) {
                    console.log('🔍 Triggering search for:', query);
                    this.handleSearch(query);
                } else {
                    console.log('🔍 Clearing results (query too short)');
                    this.searchResults.innerHTML = '';
                }
            });
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
        
        console.log('🔍 Events bound successfully');
    }
    
    openSearch() {
        console.log('🔍 openSearch called');
        console.log('🔍 searchOverlay:', this.searchOverlay);
        console.log('🔍 searchInput:', this.searchInput);
        
        if (this.searchOverlay && this.searchInput) {
            this.searchOverlay.classList.add('active');
            this.searchInput.focus();
            document.body.style.overflow = 'hidden';
            console.log('🔍 Search overlay opened successfully');
        } else {
            console.error('❌ Cannot open search - missing elements');
        }
    }
    
    closeSearch() {
        this.searchOverlay.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
        document.body.style.overflow = '';
        this.searchInput.blur();
    }
    
        async handleSearch(query) {
        console.log('🔍 handleSearch called with query:', query);
        console.log('🔍 isInitialized:', this.isInitialized);
        console.log('🔍 pagefind instance:', this.pagefind);
        
        if (!this.isInitialized || !query.trim()) {
            console.log('🔍 Search not initialized or empty query');
            this.searchResults.innerHTML = '';
            return;
        }
        
        try {
            console.log('🔍 Calling pagefind.search...');
            const search = await this.pagefind.search(query);
            console.log('🔍 Search response:', search);
            console.log('🔍 Number of results:', search.results?.length || 0);
            
            // Debug the structure of the first result
            if (search.results && search.results.length > 0) {
                console.log('🔍 First result structure:', {
                    url: search.results[0].url,
                    score: search.results[0].score,
                    keys: Object.keys(search.results[0])
                });
            }
            
            if (!search.results || search.results.length === 0) {
                console.log('🔍 No results found');
                this.displayResults([], query);
                return;
            }
            
            const results = await Promise.all(
                search.results.slice(0, 10).map(async (result) => {
                    try {
                        const data = await result.data();
                        console.log('🔍 Search result data:', {
                            url: result.url,
                            title: data.meta?.title,
                            excerpt: data.excerpt?.substring(0, 100),
                            meta: data.meta,
                            excerpt_full: data.excerpt
                        });
                        
                        // Check if we have a URL in the result
                        let resultUrl = result.url;
                        if (!resultUrl && data.meta?.url) {
                            resultUrl = data.meta.url;
                            console.log('🔍 Using URL from meta:', resultUrl);
                        }
                        
                        return {
                            url: resultUrl,
                            title: data.meta?.title || 'Untitled',
                            excerpt: data.excerpt || 'No excerpt available',
                            score: result.score,
                            meta: data.meta
                        };
                    } catch (resultError) {
                        console.error('❌ Error processing result:', resultError);
                        return {
                            url: result.url,
                            title: 'Error loading result',
                            excerpt: 'Could not load this result',
                            score: result.score
                        };
                    }
                })
            );
            
            console.log('🔍 Processed results:', results);
            this.displayResults(results, query);
        } catch (error) {
            console.error('❌ Search error:', error);
            console.error('❌ Error stack:', error.stack);
            this.showError(`Search failed: ${error.message}`);
        }
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <p>No results found for "<strong>${query}</strong>"</p>
                    <p>Try different keywords or check your spelling.</p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(result => {
            // Handle Pagefind URLs properly
            let fixedUrl = result.url;
            
            // Safety check for undefined URLs
            if (!fixedUrl) {
                console.error('❌ Result has no URL:', result);
                console.log('🔍 Full result object:', result);
                
                // Try to extract URL from meta data if available
                if (result.meta && result.meta.url) {
                    fixedUrl = result.meta.url;
                    console.log('🔍 Found URL in meta:', fixedUrl);
                } else {
                    // Generate fallback URL based on title
                    fixedUrl = this.generateFallbackUrl(result.title);
                    console.log('🔍 Generated fallback URL:', fixedUrl);
                }
            }
            
            // Remove leading slash if present
            if (fixedUrl.startsWith('/')) {
                fixedUrl = fixedUrl.substring(1);
            }
            
            // Handle the new content folder structure
            // Pagefind might be generating URLs like "content/filename.html" or just "filename.html"
            console.log('🔍 Processing URL:', result.url, '→', fixedUrl);
            
            // Map of old file names to new content paths
            const filePathMap = {
                'startup-ideas.html': 'content/startup-ideas.html',
                'essential-reading.html': 'content/essential-reading.html',
                'getting-to-profitability.html': 'content/getting-to-profitability.html',
                'way-of-openness.html': 'content/way-of-openness.html',
                // Also handle potential content/ prefixed versions
                'content/startup-ideas.html': 'content/startup-ideas.html',
                'content/essential-reading.html': 'content/essential-reading.html',
                'content/getting-to-profitability.html': 'content/getting-to-profitability.html',
                'content/way-of-openness.html': 'content/way-of-openness.html'
            };
            
            // Check if we have a mapped path for this file
            if (filePathMap[fixedUrl]) {
                fixedUrl = filePathMap[fixedUrl];
                console.log('🔍 Mapped URL:', result.url, '→', fixedUrl);
            } else if (fixedUrl.startsWith('content/')) {
                // URL already has content/ prefix, use as is
                console.log('🔍 URL already has content prefix:', fixedUrl);
            } else {
                console.log('🔍 Using URL as is:', fixedUrl);
            }
            
            // Final URL validation
            console.log('🔍 Final URL for link:', fixedUrl);
            
            return `
                <div class="search-result">
                    <a href="${fixedUrl}" class="result-link">
                        <h4 class="result-title">${this.highlightText(result.title, query)}</h4>
                        <p class="result-excerpt">${this.highlightText(result.excerpt, query)}</p>
                        <span class="result-url">${fixedUrl}</span>
                    </a>
                </div>
            `;
        }).join('');
        
        this.searchResults.innerHTML = `
            <div class="results-header">
                <p>Found ${results.length} result${results.length === 1 ? '' : 's'} for "<strong>${query}</strong>"</p>
            </div>
            ${resultsHTML}
        `;
    }
    
    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    showError(message) {
        this.searchResults.innerHTML = `
            <div class="search-error">
                <p>${message}</p>
            </div>
        `;
    }
    
    generateFallbackUrl(title) {
        // Map titles to their actual file paths
        const titleToPath = {
            'Startup Ideas: How the Best Founders Get Them and Why Novelty Is Overrated': 'content/startup-ideas.html',
            'Essential Reading': 'content/essential-reading.html',
            'Getting to Profitability without Cutting Bone [Checklist Included]': 'content/getting-to-profitability.html',
            'The Way of Openness': 'content/way-of-openness.html',
            'Heists (Our Portfolio)': 'heists.html',
            'Lore': 'lore.html',
            'Jeron Paul': 'about.html',
            'Angel capital for the audacious.': 'index.html'
        };
        
        return titleToPath[title] || '#';
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM loaded, initializing SearchManager...');
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        new SearchManager();
    }, 100);
});
