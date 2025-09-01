// Embedded Search functionality for Rapscallion site
// This implementation provides deep linking to specific sections and highlights search terms

class EmbeddedSearchManager {
    constructor() {
        this.isInitialized = false;
        this.pagefind = null;
        this.searchOverlay = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchClose = null;
        this.searchIcons = [];
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready AND header to be loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.waitForHeaderAndSetup());
            } else {
                this.waitForHeaderAndSetup();
            }
        } catch (error) {
            console.error('❌ Failed to initialize Embedded Search Manager:', error);
        }
    }
    
    async waitForHeaderAndSetup() {
        // Wait for header elements to be available
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (attempts < maxAttempts) {
            const searchOverlay = document.getElementById('search-overlay');
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            
            if (searchOverlay && searchInput && searchResults) {
                await this.setupSearch();
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.error('❌ Timeout waiting for header elements to load');
    }
    
    async setupSearch() {
        try {
            // Get DOM elements
            this.searchOverlay = document.getElementById('search-overlay');
            this.searchInput = document.getElementById('search-input');
            this.searchResults = document.getElementById('search-results');
            this.searchClose = document.getElementById('search-close');
            this.searchIcons = [
                document.getElementById('search-icon-mobile'),
                document.getElementById('search-icon-desktop')
            ].filter(Boolean);
            
            if (!this.searchOverlay || !this.searchResults || !this.searchInput) {
                console.error('❌ Required search elements not found');
                return;
            }
            
            // Initialize Pagefind
            await this.initializePagefind();
            
            // Bind events
            this.bindEvents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Failed to setup search:', error);
        }
    }
    
    async initializePagefind() {
        try {
            // Load Pagefind JavaScript
            this.pagefind = await import('/pagefind/pagefind.js');
            
        } catch (error) {
            console.error('❌ Failed to load Pagefind:', error);
        }
    }
    
    bindEvents() {
        // Search icon clicks
        this.searchIcons.forEach((icon) => {
            if (icon) {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openSearch();
                });
            }
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
        
        // Search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    this.handleSearch(query);
                } else {
                    this.searchResults.innerHTML = '';
                }
            });
            
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                }
            });
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
    }
    
    async handleSearch(query) {
        if (!this.pagefind || !query.trim()) {
            return;
        }
        
        try {
            const search = await this.pagefind.search(query);
            
            if (!search.results || search.results.length === 0) {
                this.displayResults([], query);
                return;
            }
            
            // Process results with paragraph-level support
            const results = await Promise.all(
                search.results.slice(0, 10).map(async (result) => {
                    try {
                        const data = await result.data();
                        return {
                            url: result.url,
                            title: data.meta?.title || 'Untitled',
                            excerpt: data.excerpt || 'No excerpt available',
                            score: result.score,
                            meta: data.meta,
                            anchors: data.anchors || []
                        };
                    } catch (error) {
                        console.error('❌ Error processing result:', error);
                        return {
                            url: result.url,
                            title: 'Error loading result',
                            excerpt: 'Could not load this result',
                            score: result.score
                        };
                    }
                })
            );
            
            this.displayResults(results, query);
            
        } catch (error) {
            console.error('❌ Search error:', error);
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
        
        const resultsHTML = results.map((result, index) => {
            const fixedUrl = this.fixResultUrl(result.url, result.title);
            const highlightedTitle = this.highlightText(result.title, query);
            const highlightedExcerpt = this.highlightText(result.excerpt, query);
            
            return `
                <div class="search-result">
                    <a href="${fixedUrl}?highlight=${encodeURIComponent(query)}" class="result-link">
                        <h4 class="result-title">${highlightedTitle}</h4>
                        <p class="result-excerpt">${highlightedExcerpt}</p>
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
        
        // Add click event listeners to the result links
        setTimeout(() => {
            const links = this.searchResults.querySelectorAll('.result-link');
            links.forEach((link) => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    window.location.href = href;
                });
            });
        }, 100);
    }
    
    highlightText(text, query) {
        if (!query || !text) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    fixResultUrl(url, title) {
        if (!url) {
            // Fallback URL mapping based on title
            const urlMap = {
                'Startup Ideas: How the Best Founders Get Them and Why Novelty Is Overrated': '/content/startup-ideas.html',
                'Essential Reading': '/content/essential-reading.html',
                'Getting to Profitability without Cutting Bone [Checklist Included]': '/content/getting-to-profitability.html',
                'Heists (Our Portfolio)': '/heists.html',
                'Jeron Paul': '/gang.html',
                'The Way of Openness': '/content/way-of-openness.html',
                'Angel capital for the audacious.': '/',
                'Lore': '/lore.html',
                'About': '/about.html'
            };
            
            const mappedUrl = urlMap[title];
            if (mappedUrl) {
                return mappedUrl;
            }
            
            return '#';
        }
        
        // Remove any double slashes or incorrect paths
        let fixedUrl = url.replace(/\/+/g, '/');
        
        // Ensure content pages have correct paths
        if (fixedUrl.includes('content/') && !fixedUrl.startsWith('/content/')) {
            fixedUrl = '/' + fixedUrl;
        }
        
        return fixedUrl;
    }
    
    showError(message) {
        this.searchResults.innerHTML = `
            <div class="search-error">
                <p>${message}</p>
            </div>
        `;
    }
    
    openSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.add('active');
            
            // Focus search input after a short delay to ensure overlay is visible
            setTimeout(() => {
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }, 100);
        } else {
            console.error('❌ Cannot open search - searchOverlay not found');
        }
    }
    
    closeSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.remove('active');
            
            // Clear search input
            if (this.searchInput) {
                this.searchInput.value = '';
            }
            
            // Clear results
            if (this.searchResults) {
                this.searchResults.innerHTML = '';
            }
        } else {
            console.error('❌ Cannot close search - searchOverlay not found');
        }
    }
}

// Initialize embedded search when DOM is ready
let embeddedSearchManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        embeddedSearchManager = new EmbeddedSearchManager();
    });
} else {
    embeddedSearchManager = new EmbeddedSearchManager();
}
