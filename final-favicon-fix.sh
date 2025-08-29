#!/bin/bash

# Final script to properly fix title tags and favicon placement

echo "Final fix for title tags and favicon placement..."

# Find all HTML files and fix them
find . -name "*.html" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        if [[ "$line" == *"<title>"* && "$line" != *"</title>"* ]]; then
            # This is an opening title tag, write it and add favicon
            echo "$line" >> "$temp_file"
            echo "    <link rel=\"icon\" type=\"image/png\" href=\"images/rapscallion-favicon.png\">" >> "$temp_file"
        elif [[ "$line" == *"<link rel=\"icon\""* ]]; then
            # Skip any existing favicon lines
            continue
        else
            # Write all other lines
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace the original file
    mv "$temp_file" "$file"
    
    echo "✓ Fixed $file"
done

echo "Done! Title tags and favicon placement have been fixed."
