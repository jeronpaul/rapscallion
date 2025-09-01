# Tests Directory

This directory contains our lightweight TDD (Test-Driven Development) tests for debugging and validating the search functionality.

## Test Files

### `test-javascript-loading.html`
- **Purpose**: Tests basic JavaScript execution and DOM manipulation
- **Usage**: Open in browser to verify JavaScript is working at all
- **What it tests**: Basic console logging, DOM element access, and JavaScript functionality

### `test-main-site.html`
- **Purpose**: Tests the main site's component loading and search functionality
- **Usage**: Opens the main site in an iframe and tests component loading
- **What it tests**: Header/footer loading, search icon presence, and overall site functionality

### `run-tests.sh`
- **Purpose**: Test runner script that checks server status and provides test URLs
- **Usage**: Run `./run-tests.sh` from the project root
- **What it does**: 
  - Verifies server is running
  - Checks if header.html contains expected search functionality
  - Provides URLs for manual testing

## TDD Workflow

1. **Run the test runner**: `./tests/run-tests.sh`
2. **Open test URLs** in browser as instructed
3. **Check console output** for errors or debug messages
4. **Report findings** to identify issues
5. **Fix issues** based on test results
6. **Re-run tests** to verify fixes

## Current Status

✅ **Fixed**: `components.js` null reference errors  
🔄 **In Progress**: Testing search modal functionality  
⏳ **Next**: Verify search icon click opens modal and search works

## Test URLs

- Basic JavaScript Test: `http://localhost:8000/tests/test-javascript-loading.html`
- Main Site Test: `http://localhost:8000/tests/test-main-site.html`
- Main Site: `http://localhost:8000/`
