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
6. **Testing**: Run tests before deployment (see Testing section below)

## Testing

The site includes a comprehensive test suite to ensure functionality before deployment:

### Browser Tests
- Open `tests.html` in your browser to run the interactive test suite
- Tests cover component loading, search functionality, and navigation
- Use "Run All Tests" for complete validation
- Use "Run Search Tests Only" for focused search testing

### Pre-Production Script
```bash
./run-tests.sh
```
This script performs:
- File structure validation
- HTML/CSS/JS syntax checking
- Search infrastructure verification
- Content structure validation
- Git status check

### Test Files
- `tests.html` - Browser-based test runner with visual interface
- `test-runner.js` - Test framework and all test cases
- `run-tests.sh` - Command-line pre-production validation script

### Running Tests
1. **Before any deployment**: Run `./run-tests.sh`
2. **After search changes**: Open `tests.html` and run search tests
3. **After major changes**: Run full browser test suite
4. **Before production push**: Ensure all tests pass

## Deployment

The site is deployed to rapscallion.com via direct file upload to web hosting provider. All files should be uploaded to the web server's root directory with `index.html` as the default document.

**Pre-deployment checklist:**
1. Run `./run-tests.sh` and ensure all tests pass
2. Open `tests.html` and verify browser tests pass
3. Test search functionality manually
4. Verify mobile responsiveness
5. Upload all files to production server

## Content Structure

Articles follow a pattern of:
- `/content/article-name.html` - Main article page
- `/content/Article Name/` - Directory with article assets
- `/content/Article Name/images/` - Article-specific images

The site maintains a content-focused approach with inspirational quotes, startup resources, and entrepreneurship guidance integrated into a visually appealing grid layout.