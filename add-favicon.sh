#!/bin/bash

# Script to add favicon to all HTML files
# This adds the favicon link after the title tag in each HTML file

echo "Adding favicon to all HTML files..."

# Find all HTML files and add favicon
find . -name "*.html" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Add favicon after the title tag
    sed -i '' 's/<title>/<title>\n    <link rel="icon" type="image\/png" href="images\/rapscallion-favicon.png">/' "$file"
    
    echo "✓ Added favicon to $file"
done

echo "Done! Favicon has been added to all HTML files."
