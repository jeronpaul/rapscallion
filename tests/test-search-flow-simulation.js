#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Search Flow Simulation to Identify Modal Closing Issue\n');

async function fetchPage(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testSearchFlowSimulation() {
    try {
        console.log('1️⃣ Analyzing search flow in components.js...');
        const componentsJS = await fetchPage('/components.js');
        
        // Check the search flow step by step
        console.log('\n📋 Search Flow Analysis:');
        
        // Step 1: Search icon click
        if (componentsJS.includes('searchIcons.forEach((icon, index) => {')) {
            console.log('✅ Step 1: Search icon click handlers found');
        } else {
            console.log('❌ Step 1: Search icon click handlers missing');
        }
        
        // Step 2: Modal opening
        if (componentsJS.includes('openSearchModal()')) {
            console.log('✅ Step 2: Modal opening function found');
        } else {
            console.log('❌ Step 2: Modal opening function missing');
        }
        
        // Step 3: Search input handling
        if (componentsJS.includes('searchInput.addEventListener(\'input\'')) {
            console.log('✅ Step 3: Search input event listener found');
        } else {
            console.log('❌ Step 3: Search input event listener missing');
        }
        
        // Step 4: Search execution
        if (componentsJS.includes('performSearch(query)')) {
            console.log('✅ Step 4: Search execution function found');
        } else {
            console.log('❌ Step 4: Search execution function missing');
        }
        
        // Step 5: Results display
        if (componentsJS.includes('displaySearchResults(allResults)')) {
            console.log('✅ Step 5: Results display function found');
        } else {
            console.log('❌ Step 5: Results display function missing');
        }
        
        // Step 6: Click handlers on results
        if (componentsJS.includes('addSearchResultClickHandlers()')) {
            console.log('✅ Step 6: Result click handlers found');
        } else {
            console.log('❌ Step 6: Result click handlers missing');
        }
        
        // Step 7: Modal closing
        if (componentsJS.includes('closeSearchModal()')) {
            console.log('✅ Step 7: Modal closing function found');
        } else {
            console.log('❌ Step 7: Modal closing function missing');
        }

        console.log('\n2️⃣ Analyzing potential issues...');
        
        // Check for event listener management
        if (componentsJS.includes('cloneNode(true)') && componentsJS.includes('replaceChild')) {
            console.log('✅ Event listener duplication prevention implemented');
        } else {
            console.log('❌ Event listener duplication prevention missing');
        }
        
        // Check for proper function calls
        if (componentsJS.includes('setTimeout(() => {') && componentsJS.includes('closeSearchModal()')) {
            console.log('✅ Modal closing with setTimeout implemented');
        } else {
            console.log('❌ Modal closing with setTimeout missing');
        }
        
        // Check for search result generation
        if (componentsJS.includes('search-result-link') && componentsJS.includes('data-search-term')) {
            console.log('✅ Search result generation with proper attributes');
        } else {
            console.log('❌ Search result generation missing proper attributes');
        }

        console.log('\n3️⃣ Checking Pagefind integration patterns...');
        
        // Check if we're following Pagefind best practices
        if (componentsJS.includes('showSubResults: true')) {
            console.log('✅ Using Pagefind showSubResults option');
        } else {
            console.log('❌ Missing Pagefind showSubResults option');
        }
        
        if (componentsJS.includes('result.data()') && componentsJS.includes('sub_results')) {
            console.log('✅ Properly handling Pagefind sub-results');
        } else {
            console.log('❌ Missing proper Pagefind sub-results handling');
        }

        console.log('\n🎯 Potential Issues Identified:');
        console.log('\n🔍 Issue 1: Event Listener Management');
        console.log('• Current approach: cloneNode + replaceChild');
        console.log('• Potential problem: This might interfere with Pagefind\'s internal event handling');
        console.log('• Recommendation: Check if Pagefind has its own event management');
        
        console.log('\n🔍 Issue 2: Modal State Management');
        console.log('• Current approach: setTimeout with closeSearchModal');
        console.log('• Potential problem: Race condition between navigation and modal closing');
        console.log('• Recommendation: Ensure modal closes before navigation');
        
        console.log('\n🔍 Issue 3: Pagefind Integration');
        console.log('• Current approach: Custom search implementation');
        console.log('• Potential problem: Not following Pagefind\'s standard UI patterns');
        console.log('• Recommendation: Check Pagefind documentation for standard approaches');

        console.log('\n📚 Next Steps:');
        console.log('1. Check Pagefind documentation for standard search UI patterns');
        console.log('2. Verify if our custom implementation conflicts with Pagefind internals');
        console.log('3. Test with a simpler event listener approach');
        console.log('4. Consider using Pagefind\'s built-in UI components if available');

        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    }
}

// Run the test
testSearchFlowSimulation().then(success => {
    if (success) {
        console.log('\n✅ Search flow analysis completed successfully');
    } else {
        console.log('\n❌ Search flow analysis failed');
        process.exit(1);
    }
});
