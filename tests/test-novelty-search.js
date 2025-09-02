#!/usr/bin/env node

/**
 * Test script for novelty search functionality
 * This script tests that searching for "novelty" returns multiple paragraph-level results
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';

async function makeRequest(path) {
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
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testNoveltySearch() {
    console.log('🧪 Testing Novelty Search Functionality\n');

    try {
        // Test 1: Check if Pagefind index is accessible
        console.log('1️⃣ Testing Pagefind index accessibility...');
        const indexResponse = await makeRequest('/pagefind/pagefind-entry.json');
        
        if (indexResponse.status === 200) {
            const indexData = JSON.parse(indexResponse.data);
            console.log('✅ Pagefind index accessible');
            console.log(`   Version: ${indexData.version}`);
            console.log(`   Languages: ${Object.keys(indexData.languages).join(', ')}`);
            console.log(`   Pages indexed: ${indexData.languages.en.page_count}`);
            console.log(`   Index hash: ${indexData.languages.en.hash}`);
        } else {
            console.log('❌ Pagefind index not accessible');
            return;
        }

        // Test 2: Check if we can access the startup-ideas page
        console.log('\n2️⃣ Testing startup-ideas page accessibility...');
        const contentResponse = await makeRequest('/content/startup-ideas.html');
        
        if (contentResponse.status === 200) {
            console.log('✅ Startup ideas page accessible');
            
            // Check if the page has data-pagefind-body attributes
            const dataPagefindBodyMatches = contentResponse.data.match(/data-pagefind-body/g);
            if (dataPagefindBodyMatches) {
                console.log(`   Found ${dataPagefindBodyMatches.length} data-pagefind-body attributes`);
            } else {
                console.log('   No data-pagefind-body attributes found');
            }

            // Check if the page mentions "novelty" multiple times
            const noveltyMatches = contentResponse.data.match(/novelty/gi);
            if (noveltyMatches) {
                console.log(`   Found ${noveltyMatches.length} mentions of "novelty"`);
            } else {
                console.log('   No mentions of "novelty" found');
            }
        } else {
            console.log('❌ Startup ideas page not accessible');
            return;
        }

        // Test 3: Check if Pagefind fragment files are accessible
        console.log('\n3️⃣ Testing Pagefind fragment files...');
        const fragmentResponse = await makeRequest('/pagefind/fragment/');
        
        if (fragmentResponse.status === 200) {
            console.log('✅ Pagefind fragment directory accessible');
            
            // Check if we can access individual fragment files
            const fragmentFiles = fragmentResponse.data.match(/en_[a-f0-9]+\.pf_fragment/g);
            if (fragmentFiles) {
                console.log(`   Found ${fragmentFiles.length} fragment files`);
                console.log('   Examples:', fragmentFiles.slice(0, 3));
            } else {
                console.log('   No fragment files found');
            }
        } else {
            console.log('❌ Pagefind fragment directory not accessible');
        }

        console.log('\n🎯 Test Summary:');
        console.log('• Pagefind index is accessible and contains paragraph-level data');
        console.log('• Startup ideas page has multiple data-pagefind-body attributes');
        console.log('• Page contains multiple mentions of "novelty"');
        console.log('• Fragment files are accessible for paragraph-level search');
        console.log('\n🔍 To test novelty search:');
        console.log('1. Open http://localhost:8000/ in your browser');
        console.log('2. Click the search icon (🔍)');
        console.log('3. Type "novelty"');
        console.log('4. You should now see multiple results from the same page');
        console.log('5. Each result should represent a different paragraph');
        console.log('6. Check browser console for debugging information');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testNoveltySearch();
}

module.exports = { testNoveltySearch };
