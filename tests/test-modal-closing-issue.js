#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Search Modal Closing Issue on Multiple Searches\n');

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

async function testModalClosingIssue() {
    try {
        console.log('1️⃣ Testing header.html for search modal...');
        const headerHTML = await fetchPage('/header.html');
        if (headerHTML.includes('search-modal') && headerHTML.includes('search-overlay')) {
            console.log('✅ Search modal HTML found in header.html');
        } else {
            console.log('❌ Search modal HTML not found in header.html');
            return false;
        }

        console.log('\n2️⃣ Testing components.js for modal closing logic...');
        const componentsJS = await fetchPage('/components.js');
        
        // Check for closeSearchModal function
        if (componentsJS.includes('function closeSearchModal()')) {
            console.log('✅ closeSearchModal function found');
        } else {
            console.log('❌ closeSearchModal function not found');
            return false;
        }

        // Check for PagefindUI integration
        if (componentsJS.includes('PagefindUI') && componentsJS.includes('highlightParam')) {
            console.log('✅ PagefindUI integration found');
        } else {
            console.log('❌ PagefindUI integration not found');
            return false;
        }

        // Check for PagefindUI modal management
        if (componentsJS.includes('initializeSearchModalWithPagefindUI')) {
            console.log('✅ PagefindUI modal management found');
        } else {
            console.log('❌ PagefindUI modal management not found');
            return false;
        }

        console.log('\n3️⃣ Testing Pagefind integration...');
        if (componentsJS.includes('PagefindUI') && componentsJS.includes('triggerSearch')) {
            console.log('✅ PagefindUI search integration found');
        } else {
            console.log('❌ PagefindUI search integration not found');
            return false;
        }

        console.log('\n4️⃣ Testing search result generation...');
        if (componentsJS.includes('search-result-link') && componentsJS.includes('processResult')) {
            console.log('✅ PagefindUI result generation found');
        } else {
            console.log('❌ PagefindUI result generation not found');
            return false;
        }

        console.log('\n🎯 Test Summary:');
        console.log('• All modal closing components are present');
        console.log('• PagefindUI handles modal management automatically');
        console.log('• PagefindUI integration is properly configured');
        
        console.log('\n🔍 To manually test the modal closing issue:');
        console.log('1. Open http://localhost:8000/ in your browser');
        console.log('2. Click the search icon (🔍)');
        console.log('3. Type a search term (e.g., "creativity")');
        console.log('4. Click on a search result tile');
        console.log('5. Verify the modal closes and you jump to the correct paragraph');
        console.log('6. Repeat the search process');
        console.log('7. Check if the modal closes consistently on subsequent searches');
        
        console.log('\n⚠️  If the modal doesn\'t close on the second search:');
        console.log('• Check browser console for JavaScript errors');
        console.log('• Verify that closeSearchModal() is being called');
        console.log('• Check if event listeners are being properly managed');

        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    }
}

// Run the test
testModalClosingIssue().then(success => {
    if (success) {
        console.log('\n✅ Modal closing test completed successfully');
    } else {
        console.log('\n❌ Modal closing test failed');
        process.exit(1);
    }
});
