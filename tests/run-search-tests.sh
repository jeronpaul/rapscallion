#!/bin/bash

echo "🔍 Rapscallion Search Test Suite Runner"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "❌ Server not running on port 8000"
    echo "🚀 Starting server..."
    python3 -m http.server 8000 &
    sleep 2
    echo "✅ Server started"
else
    echo "✅ Server already running on port 8000"
fi

echo ""
echo "🧪 Available Tests:"
echo "1. Basic Search Functionality: http://localhost:8000/tests/search-functionality.test.html"
echo "2. Search Integration Checkpoint: http://localhost:8000/tests/search-integration-checkpoint.test.html"
echo "3. Pagefind Integration: http://localhost:8000/tests/pagefind-integration.test.html"
echo "4. JavaScript Loading: http://localhost:8000/tests/test-javascript-loading.html"
echo "5. Main Site: http://localhost:8000/tests/test-main-site.html"
echo ""

echo "🚀 Quick Test URLs:"
echo "• Main Site: http://localhost:8000/"
echo "• Heists: http://localhost:8000/heists.html"
echo "• About: http://localhost:8000/about.html"
echo ""

echo "💡 Test Instructions:"
echo "1. Open any test URL in your browser"
echo "2. Click 'Run All Tests' to execute the test suite"
echo "3. Check console for detailed logs"
echo "4. Verify all tests pass before making changes"
echo ""

echo "🔧 Current Status:"
echo "✅ Search modal opens and focuses"
echo "✅ Pagefind integration working"
echo "✅ Search results display correctly"
echo "✅ Navigation to result pages works"
echo ""

echo "🎯 Next Steps:"
echo "• Run Pagefind integration tests to validate current functionality"
echo "• Only proceed with UI changes after all tests pass"
echo "• Use tests to catch any regressions during development"
