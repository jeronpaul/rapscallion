#!/bin/bash

echo "🧪 Running JavaScript Loading Tests"
echo "=================================="

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ Server not running on port 8000"
    echo "Please start the server with: python3 -m http.server 8000"
    exit 1
fi

echo "✅ Server is running on port 8000"
echo ""

# Test 1: Basic JavaScript loading test
echo "🧪 Test 1: Basic JavaScript Loading"
echo "Open: http://localhost:8000/tests/test-javascript-loading.html"
echo ""

# Test 2: Main site test
echo "🧪 Test 2: Main Site JavaScript"
echo "Open: http://localhost:8000/tests/test-main-site.html"
echo ""

# Test 3: Check if header.html is accessible
echo "🧪 Test 3: Header.html Accessibility"
if curl -s http://localhost:8000/header.html | grep -q "pagefind-ui.js"; then
    echo "✅ Header.html contains pagefind-ui.js"
else
    echo "❌ Header.html does not contain pagefind-ui.js"
fi

if curl -s http://localhost:8000/header.html | grep -q "search-overlay"; then
    echo "✅ Header.html contains search-overlay"
else
    echo "❌ Header.html does not contain search-overlay"
fi

echo ""

# Test 4: Check if pagefind-ui.js is accessible
echo "🧪 Test 4: Pagefind UI Script Accessibility"
if curl -s -I http://localhost:8000/pagefind/pagefind-ui.js | grep -q "200 OK"; then
    echo "✅ pagefind-ui.js is accessible"
else
    echo "❌ pagefind-ui.js is not accessible"
fi

echo ""

# Test 5: Check main site
echo "🧪 Test 5: Main Site"
if curl -s http://localhost:8000/ | grep -q "pagefind-ui.js"; then
    echo "✅ Main site contains pagefind-ui.js"
else
    echo "❌ Main site does not contain pagefind-ui.js"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open http://localhost:8000/tests/test-javascript-loading.html in your browser"
echo "2. Check the console for any JavaScript errors"
echo "3. Open http://localhost:8000/tests/test-main-site.html to test the main site"
echo "4. Report back what you see in the console and test results"
