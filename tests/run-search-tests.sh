#!/bin/bash

echo "🧪 Running Search Functionality Tests"
echo "====================================="

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ Server not running on port 8000"
    echo "Please start the server with: python3 -m http.server 8000"
    exit 1
fi

echo "✅ Server is running on port 8000"
echo ""

# Test 1: Search functionality test
echo "🧪 Test 1: Search Functionality"
echo "Open: http://localhost:8000/tests/search-functionality.test.html"
echo ""

# Test 2: Main site test
echo "🧪 Test 2: Main Site Integration"
echo "Open: http://localhost:8000/ and check console for our debug messages"
echo ""

# Test 3: Check if key files exist
echo "🧪 Test 3: File Structure Check"
if [ -f "components.js" ]; then
    echo "✅ components.js exists"
else
    echo "❌ components.js missing"
fi

if [ -f "header.html" ]; then
    echo "✅ header.html exists"
else
    echo "❌ header.html missing"
fi

if [ -f "pagefind/pagefind-ui.js" ]; then
    echo "✅ pagefind-ui.js exists"
else
    echo "❌ pagefind-ui.js missing"
fi

echo ""
echo "📋 Test Instructions:"
echo "1. Open http://localhost:8000/tests/search-functionality.test.html in your browser"
echo "2. Check the test results - all should be green ✅"
echo "3. Open http://localhost:8000/ and check console for debug messages"
echo "4. Try clicking the search icon - it should trigger Pagefind search"
echo "5. Report back any red ❌ tests or issues"
echo ""
echo "🎯 Key Success Criteria:"
echo "- All tests should pass (green ✅)"
echo "- Search icon should be clickable"
echo "- Console should show our debug messages"
echo "- No JavaScript errors"
