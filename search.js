// Pagefind Search Integration
class SearchManager {
    constructor() {
        console.log('🔍 SearchManager constructor called');
        
        this.searchOverlay = document.getElementById('search-overlay');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchClose = document.getElementById('search-close');
        this.searchIcons = document.querySelectorAll('.search-icon');
        
        console.log('🔍 Elements found:', {
            searchOverlay: !!this.searchOverlay,
            searchInput: !!this.searchInput,
            searchResults: !!this.searchResults,
            searchClose: !!this.searchClose,
            searchIcons: this.searchIcons.length
        });
        
        this.pagefind = null;
        this.isInitialized = false;
        
        this.init();
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
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
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
        if (!this.isInitialized || !query.trim()) {
            this.searchResults.innerHTML = '';
            return;
        }
        
        try {
            const search = await this.pagefind.search(query);
            const results = await Promise.all(
                search.results.slice(0, 10).map(async (result) => {
                    const data = await result.data();
                    return {
                        url: result.url,
                        title: data.meta?.title || 'Untitled',
                        excerpt: data.excerpt || 'No excerpt available',
                        score: result.score
                    };
                })
            );
            
            this.displayResults(results, query);
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('Search failed. Please try again.');
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
        
        const resultsHTML = results.map(result => `
            <div class="search-result">
                <a href="${result.url}" class="result-link">
                    <h4 class="result-title">${this.highlightText(result.title, query)}</h4>
                    <p class="result-excerpt">${this.highlightText(result.excerpt, query)}</p>
                    <span class="result-url">${result.url}</span>
                </a>
            </div>
        `).join('');
        
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
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM loaded, initializing SearchManager...');
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        new SearchManager();
    }, 100);
});
