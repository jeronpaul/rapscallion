#!/bin/bash

# Script to fix favicon placement in all HTML files
# This moves the favicon link to be after the title tag, not inside it

echo "Fixing favicon placement in all HTML files..."

# Find all HTML files and fix favicon placement
find . -name "*.html" -type f | while read -r file; do
    echo "Processing: $file"
    
    # First, remove the incorrectly placed favicon from inside title tags
    sed -i '' 's/<title>\n    <link rel="icon" type="image\/png" href="images\/rapscallion-favicon.png">/<title>/' "$file"
    
    # Then add the favicon after the title tag
    sed -i '' 's/<\/title>/<\/title>\n    <link rel="icon" type="image\/png" href="images\/rapscallion-favicon.png">/' "$file"
    
    echo "✓ Fixed favicon placement in $file"
done

echo "Done! Favicon placement has been fixed in all HTML files."
