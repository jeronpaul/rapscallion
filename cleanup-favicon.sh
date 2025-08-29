#!/bin/bash

# Script to completely clean up and properly place favicon in all HTML files

echo "Cleaning up and properly placing favicon in all HTML files..."

# Find all HTML files and fix favicon placement
find . -name "*.html" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line to properly place favicon
    while IFS= read -r line; do
        if [[ "$line" == *"<title>"* ]]; then
            # Write the title line
            echo "$line" >> "$temp_file"
            # Add favicon after title
            echo "    <link rel=\"icon\" type=\"image/png\" href=\"images/rapscallion-favicon.png\">" >> "$temp_file"
        elif [[ "$line" == *"<link rel=\"icon\""* ]]; then
            # Skip duplicate favicon lines
            continue
        else
            # Write all other lines
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace the original file with the cleaned version
    mv "$temp_file" "$file"
    
    echo "✓ Cleaned up favicon in $file"
done

echo "Done! Favicon has been properly placed in all HTML files."
