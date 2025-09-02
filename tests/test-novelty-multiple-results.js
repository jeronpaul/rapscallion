#!/usr/bin/env node

/**
 * Test script to verify that searching for "novelty" returns multiple results
 * This ensures our paragraph-level indexing with data-pagefind-body is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';
const SEARCH_TERM = 'novelty';

async function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Test-Script/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testPagefindIndexAccess() {
    console.log('🔍 Testing Pagefind index accessibility...');
    
    try {
        const response = await makeRequest('/pagefind/pagefind-entry.json');
        if (response.statusCode === 200) {
            console.log('✅ Pagefind index is accessible');
            return true;
        } else {
            console.log(`❌ Pagefind index returned status ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Failed to access Pagefind index:', error.message);
        return false;
    }
}

async function testNoveltySearchResults() {
    console.log(`🔍 Testing search for "${SEARCH_TERM}"...`);
    
    try {
        // First, let's check if we can access the Pagefind search API
        const searchResponse = await makeRequest('/pagefind/pagefind.js');
        if (searchResponse.statusCode !== 200) {
            console.log('❌ Pagefind search script not accessible');
            return false;
        }

        // Now let's check the content to see how many paragraphs mention "novelty"
        const contentResponse = await makeRequest('/content/startup-ideas.html');
        if (contentResponse.statusCode !== 200) {
            console.log('❌ Startup ideas content not accessible');
            return false;
        }

        // Count paragraphs with data-pagefind-body that mention "novelty"
        const content = contentResponse.data;
        const noveltyParagraphs = [];
        
        // Find all paragraphs with data-pagefind-body that contain "novelty"
        const paragraphRegex = /<p[^>]*data-pagefind-body[^>]*>.*?novelty.*?<\/p>/gi;
        let match;
        while ((match = paragraphRegex.exec(content)) !== null) {
            noveltyParagraphs.push(match[0].substring(0, 100) + '...');
        }

        console.log(`📊 Found ${noveltyParagraphs.length} paragraphs with data-pagefind-body mentioning "${SEARCH_TERM}"`);
        
        if (noveltyParagraphs.length > 1) {
            console.log('✅ Multiple paragraphs are indexed for novelty search');
            noveltyParagraphs.forEach((para, index) => {
                console.log(`   ${index + 1}. ${para}`);
            });
            return true;
        } else {
            console.log('❌ Only one or no paragraphs found with data-pagefind-body mentioning novelty');
            return false;
        }

    } catch (error) {
        console.log('❌ Failed to test novelty search:', error.message);
        return false;
    }
}

async function testPagefindFragments() {
    console.log('🔍 Testing Pagefind fragment accessibility...');
    
    try {
        // Check if we can access Pagefind fragment files
        const response = await makeRequest('/pagefind/fragment/');
        if (response.statusCode === 200) {
            console.log('✅ Pagefind fragments are accessible');
            return true;
        } else {
            console.log(`❌ Pagefind fragments returned status ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Failed to access Pagefind fragments:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Novelty Search Multiple Results Test\n');
    
    const tests = [
        { name: 'Pagefind Index Access', fn: testPagefindIndexAccess },
        { name: 'Novelty Search Results', fn: testNoveltySearchResults },
        { name: 'Pagefind Fragments', fn: testPagefindFragments }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        console.log(`\n--- ${test.name} ---`);
        const result = await test.fn();
        if (result) {
            passedTests++;
        }
    }

    console.log('\n📊 Test Results Summary');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! The novelty search should return multiple results.');
        console.log('\n📝 Manual Testing Instructions:');
        console.log('1. Open http://localhost:8000 in your browser');
        console.log('2. Click the search icon (🔍)');
        console.log('3. Type "novelty" in the search box');
        console.log('4. Verify you see multiple search results from different sections');
        console.log('5. Each result should link to a different part of the startup-ideas.html page');
    } else {
        console.log('\n⚠️  Some tests failed. Check the output above for details.');
        console.log('\n🔧 Troubleshooting:');
        console.log('- Ensure the HTTP server is running on port 8000');
        console.log('- Verify Pagefind index has been regenerated after adding data-pagefind-body attributes');
        console.log('- Check that content/startup-ideas.html has multiple paragraphs with data-pagefind-body mentioning "novelty"');
    }

    process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
});
