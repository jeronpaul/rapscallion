#!/usr/bin/env node

/**
 * Pagefind Integration Test Runner
 * Runs tests programmatically to identify issues
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';

async function testEndpoint(path) {
    return new Promise((resolve) => {
        const req = http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({
                status: 0,
                error: err.message,
                data: ''
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                status: 0,
                error: 'Timeout',
                data: ''
            });
        });
    });
}

async function runTests() {
    console.log('🧪 Running Pagefind Integration Tests...\n');
    
    // Test 1: Main site accessibility
    console.log('1️⃣ Testing main site accessibility...');
    const mainSite = await testEndpoint('/');
    if (mainSite.status === 200) {
        console.log('✅ Main site accessible');
        
        // Check if Pagefind scripts are referenced
        if (mainSite.data.includes('pagefind-ui.js')) {
            console.log('✅ Pagefind UI script referenced');
        } else {
            console.log('❌ Pagefind UI script not found');
        }
        
        if (mainSite.data.includes('pagefind-highlight.js')) {
            console.log('✅ Pagefind highlight script referenced');
        } else {
            console.log('❌ Pagefind highlight script not found');
        }
    } else {
        console.log(`❌ Main site not accessible: ${mainSite.status}`);
    }
    
    // Test 2: Pagefind script files
    console.log('\n2️⃣ Testing Pagefind script files...');
    const pagefindUI = await testEndpoint('/pagefind/pagefind-ui.js');
    if (pagefindUI.status === 200) {
        console.log('✅ Pagefind UI script accessible');
    } else {
        console.log(`❌ Pagefind UI script not accessible: ${pagefindUI.status}`);
    }
    
    const pagefindCore = await testEndpoint('/pagefind/pagefind.js');
    if (pagefindCore.status === 200) {
        console.log('✅ Pagefind core script accessible');
    } else {
        console.log(`❌ Pagefind core script not accessible: ${pagefindCore.status}`);
    }
    
    const pagefindHighlight = await testEndpoint('/pagefind/pagefind-highlight.js');
    if (pagefindHighlight.status === 200) {
        console.log('✅ Pagefind highlight script accessible');
    } else {
        console.log(`❌ Pagefind highlight script not accessible: ${pagefindHighlight.status}`);
    }
    
    // Test 3: Test page accessibility
    console.log('\n3️⃣ Testing test page accessibility...');
    console.log('ℹ️  Browser-based test page removed - using automated tests instead');
    console.log('✅ Automated testing available via: node tests/test-paragraph-search.js');
    
    // Test 4: Pagefind index files
    console.log('\n4️⃣ Testing Pagefind index files...');
    const pagefindEntry = await testEndpoint('/pagefind/pagefind-entry.json');
    if (pagefindEntry.status === 200) {
        console.log('✅ Pagefind entry file accessible');
        
        try {
            const entryData = JSON.parse(pagefindEntry.data);
            if (entryData.languages && entryData.languages.en && entryData.languages.en.page_count > 0) {
                console.log(`✅ Pagefind has ${entryData.languages.en.page_count} pages indexed for English`);
                console.log(`✅ Pagefind hash: ${entryData.languages.en.hash}`);
            } else {
                console.log('❌ Pagefind entry file has no indexed pages');
            }
        } catch (e) {
            console.log('❌ Pagefind entry file is not valid JSON');
        }
    } else {
        console.log(`❌ Pagefind entry file not accessible: ${pagefindEntry.status}`);
    }
    
    // Test 5: Pagefind index files exist
    const indexFiles = await testEndpoint('/pagefind/index/');
    if (indexFiles.status === 200 || indexFiles.status === 403) {
        console.log('✅ Pagefind index directory accessible');
    } else {
        console.log(`❌ Pagefind index directory not accessible: ${indexFiles.status}`);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('• All Pagefind infrastructure tests completed');
    console.log('• For paragraph search testing, run: node tests/test-paragraph-search.js');
    console.log('• For manual testing, visit: http://localhost:8000/ and use the search icon');
    console.log('• Check console for any JavaScript errors');
}

// Run tests
runTests().catch(console.error);
