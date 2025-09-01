// Load header and footer components
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
        
        // Set active states based on current page
        setActiveStates();
        
        // Initialize hamburger menu if loading header
        if (componentPath === 'header.html') {
            initializeHamburgerMenu();
            initializeSearchIcon();
        }
    } catch (error) {
        console.error(`❌ Error loading ${componentPath}:`, error);
    }
}

// Set active states for navigation
function setActiveStates() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove all active classes first
    document.querySelectorAll('.nav-links a, .dropdown-toggle').forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active state based on current page
    if (currentPage === 'index.html' || currentPage === '') {
        // Home page - no active nav items
    } else if (currentPage === 'about.html') {
        document.querySelector('.dropdown-toggle').classList.add('active');
        document.querySelector('.dropdown-menu a[href="about.html"]').classList.add('active');
    } else if (currentPage === 'way-of-openness.html') {
    document.querySelector('.dropdown-toggle').classList.add('active');
            document.querySelector('.dropdown-menu a[href="content/way-of-openness.html"]').classList.add('active');
    } else if (currentPage === 'lore.html') {
        document.querySelector('.nav-links a[href="lore.html"]').classList.add('active');
    } else if (currentPage === 'heists.html') {
        document.querySelector('.nav-links a[href="heists.html"]').classList.add('active');
    } else if (currentPage === 'gang.html') {
        document.querySelector('.nav-links a[href="gang.html"]').classList.add('active');
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
