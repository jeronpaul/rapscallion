#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing PagefindUI Integration\n');

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

async function testPagefindUIIntegration() {
    try {
        console.log('1️⃣ Testing PagefindUI script availability...');
        const pagefindUI = await fetchPage('/pagefind/pagefind-ui.js');
        
        if (pagefindUI.includes('PagefindUI') && pagefindUI.includes('window.PagefindUI')) {
            console.log('✅ PagefindUI script found and contains PagefindUI class');
        } else {
            console.log('❌ PagefindUI script missing or incomplete');
            return false;
        }

        console.log('\n2️⃣ Testing components.js PagefindUI integration...');
        const componentsJS = await fetchPage('/components.js');
        
        if (componentsJS.includes('window.PagefindUI') && componentsJS.includes('new window.PagefindUI')) {
            console.log('✅ PagefindUI integration found in components.js');
        } else {
            console.log('❌ PagefindUI integration missing from components.js');
            return false;
        }

        console.log('\n3️⃣ Testing script loading approach...');
        if (componentsJS.includes('document.createElement(\'script\')') && 
            componentsJS.includes('script.src = \'/pagefind/pagefind-ui.js\'')) {
            console.log('✅ Script loading approach implemented correctly');
        } else {
            console.log('❌ Script loading approach not implemented correctly');
            return false;
        }

        console.log('\n🎯 Test Summary:');
        console.log('• PagefindUI script is available');
        console.log('• Components.js properly integrates with PagefindUI');
        console.log('• Script loading approach is implemented');
        
        console.log('\n🔍 Next Steps:');
        console.log('1. Open http://localhost:8000/ in your browser');
        console.log('2. Check browser console for any JavaScript errors');
        console.log('3. Test search functionality');
        console.log('4. Verify modal closing works consistently');

        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    }
}

// Run the test
testPagefindUIIntegration().then(success => {
    if (success) {
        console.log('\n✅ PagefindUI integration test completed successfully');
    } else {
        console.log('\n❌ PagefindUI integration test failed');
        process.exit(1);
    }
});
