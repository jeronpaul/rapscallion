# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rapscallion is a static website for rapscallion.com, serving as an angel capital platform with a focus on entrepreneurship resources. The site features inspirational content, startup guidance, and maintains a minimalistic, modern design aesthetic.

## Architecture

This is a static HTML/CSS/JavaScript website with:

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **Styling**: Modern CSS with variables, Flexbox, and Google Fonts (Plus Jakarta Sans)
- **Search**: Pagefind for static site search functionality
- **Components**: Dynamic loading of header/footer via `components.js`
- **Forms**: Formspree integration for newsletter signup
- **Content**: Long-form articles stored in `/content/` subdirectories with embedded images

### Key Files

- `index.html` - Main homepage with hero section and content grid
- `styles.css` - Main stylesheet (large file with comprehensive styling)
- `components.js` - Handles dynamic component loading, navigation, and Pagefind search integration
- `header.html` / `footer.html` - Reusable components loaded dynamically
- `/content/` - Directory containing article pages with associated image folders
- `/images/` - Site-wide image assets
- `/pagefind/` - Pagefind search index and UI files

### Component System

The site uses a simple component system where:
- `components.js` dynamically loads header and footer HTML
- Path resolution handles both root-level and `/content/` subdirectory pages
- Active navigation states are set based on current page
- Search functionality is initialized with PagefindUI modal integration

### Search Integration

- Uses Pagefind for static site search
- PagefindUI provides modal search interface
- Search content is marked with `data-pagefind-body` attributes
- Keyboard shortcut: Ctrl/Cmd + K opens search
- Search indexes are generated separately (visible in git status as untracked files)

## Development Workflow

Since this is a static site with no build process:

1. **Local Development**: Open `index.html` directly in browser
2. **Styling**: Edit `styles.css` and refresh browser
3. **Content**: Add new articles in `/content/` with associated image folders
4. **Components**: Modify `header.html`, `footer.html`, or `components.js` as needed
5. **Search**: Pagefind indexes are generated separately and appear as untracked files

## Deployment

The site is deployed to rapscallion.com via direct file upload to web hosting provider. All files should be uploaded to the web server's root directory with `index.html` as the default document.

## Content Structure

Articles follow a pattern of:
- `/content/article-name.html` - Main article page
- `/content/Article Name/` - Directory with article assets
- `/content/Article Name/images/` - Article-specific images

The site maintains a content-focused approach with inspirational quotes, startup resources, and entrepreneurship guidance integrated into a visually appealing grid layout.