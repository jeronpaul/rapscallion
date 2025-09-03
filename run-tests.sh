#!/bin/bash

# Rapscallion Pre-Production Test Script
# Run this before deploying to production

echo "🧪 Rapscallion Pre-Production Test Suite"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    echo "Running: $test_name"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_status "success" "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_status "error" "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "1. File Structure Tests"
echo "----------------------"

# Test that core files exist
run_test "index.html exists" "test -f index.html"
run_test "styles.css exists" "test -f styles.css"
run_test "components.js exists" "test -f components.js"
run_test "header.html exists" "test -f header.html"
run_test "footer.html exists" "test -f footer.html"
run_test "custom-search.js exists" "test -f custom-search.js"
run_test "custom-search.css exists" "test -f custom-search.css"

echo ""
echo "2. Search Infrastructure Tests"
echo "-----------------------------"

# Test Pagefind files exist
run_test "pagefind directory exists" "test -d pagefind"
run_test "pagefind.js exists" "test -f pagefind/pagefind.js"
run_test "pagefind-ui.js exists" "test -f pagefind/pagefind-ui.js"

echo ""
echo "3. Content Structure Tests"
echo "-------------------------"

# Test content directory structure
run_test "content directory exists" "test -d content"

# Count content files
CONTENT_FILES=$(find content -name "*.html" 2>/dev/null | wc -l)
if [ "$CONTENT_FILES" -gt 0 ]; then
    print_status "success" "Found $CONTENT_FILES content files"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_status "warning" "No content files found"
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "4. HTML Validation Tests"
echo "------------------------"

# Basic HTML syntax checks
validate_html() {
    local file=$1
    # Check for basic HTML structure
    if grep -q "<!DOCTYPE html>" "$file" && grep -q "<html" "$file" && grep -q "</html>" "$file"; then
        return 0
    else
        return 1
    fi
}

validate_html_fragment() {
    local file=$1
    # Check for valid HTML fragment (should have opening/closing tags)
    # Just check that file exists and has some HTML content
    if test -f "$file" && grep -q "<" "$file"; then
        return 0
    else
        return 1
    fi
}

run_test "index.html structure valid" "validate_html index.html"
run_test "header.html fragment valid" "validate_html_fragment header.html"
run_test "footer.html fragment valid" "validate_html_fragment footer.html"

echo ""
echo "5. JavaScript Syntax Tests"
echo "--------------------------"

# Basic JS syntax validation (if node is available)
if command -v node >/dev/null 2>&1; then
    validate_js() {
        node -c "$1" 2>/dev/null
    }
    
    run_test "components.js syntax valid" "validate_js components.js"
    run_test "custom-search.js syntax valid" "validate_js custom-search.js"
    run_test "test-runner.js syntax valid" "validate_js test-runner.js"
else
    print_status "warning" "Node.js not available, skipping JS syntax validation"
fi

echo ""
echo "6. CSS Validation Tests"
echo "-----------------------"

# Basic CSS syntax checks
validate_css() {
    local file=$1
    # Check for basic CSS structure (no unclosed braces)
    local open_braces=$(grep -o '{' "$file" | wc -l)
    local close_braces=$(grep -o '}' "$file" | wc -l)
    test "$open_braces" -eq "$close_braces"
}

run_test "styles.css brace balance" "validate_css styles.css"
run_test "custom-search.css brace balance" "validate_css custom-search.css"

echo ""
echo "7. Browser Test Recommendation"
echo "-----------------------------"
print_status "info" "Run browser tests by opening: tests.html"
print_status "info" "This will test search functionality and component loading"

echo ""
echo "8. Git Status Check"
echo "------------------"

if git status --porcelain | grep -q .; then
    print_status "warning" "Uncommitted changes detected"
    echo "  Run 'git status' to see changes"
else
    print_status "success" "No uncommitted changes"
fi

echo ""
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo "Tests run: $TESTS_RUN"
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    print_status "success" "All tests passed! Ready for production deployment."
    echo ""
    echo "📋 Pre-deployment checklist:"
    echo "  1. ✅ All files present and valid"
    echo "  2. 🌐 Open tests.html to run browser tests"
    echo "  3. 🔍 Verify search functionality works"
    echo "  4. 📱 Test on mobile devices"
    echo "  5. 🚀 Deploy to production"
    exit 0
else
    print_status "error" "$TESTS_FAILED tests failed. Fix issues before deployment."
    echo ""
    echo "🔧 Common fixes:"
    echo "  - Check file paths and permissions"
    echo "  - Validate HTML/CSS/JS syntax"
    echo "  - Ensure Pagefind index is built"
    exit 1
fi