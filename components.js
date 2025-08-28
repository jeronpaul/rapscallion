// Load header and footer components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
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
        
        document.getElementById(elementId).innerHTML = html;
        
        // Set active states based on current page
        setActiveStates();
    } catch (error) {
        console.error(`Error loading ${componentPath}:`, error);
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
    } else if (currentPage === 'lore.html') {
        document.querySelector('.dropdown-toggle').classList.add('active');
        document.querySelector('.dropdown-menu a[href="lore.html"]').classList.add('active');
    } else if (currentPage === 'way-of-openness.html') {
        document.querySelector('.dropdown-toggle').classList.add('active');
        document.querySelector('.dropdown-menu a[href="way-of-openness.html"]').classList.add('active');
               } else if (currentPage === 'heists.html') {
               document.querySelector('.nav-links a[href="heists.html"]').classList.add('active');
    } else if (currentPage === 'gang.html') {
        document.querySelector('.nav-links a[href="gang.html"]').classList.add('active');
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header', 'header.html');
    loadComponent('footer', 'footer.html');
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    setTimeout(() => {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = currentYear;
        }
    }, 200);
});
