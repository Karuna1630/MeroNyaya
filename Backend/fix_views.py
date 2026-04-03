
import sys

def fix_khalti_initiate(content):
    # This string matches what I saw in grep_search and view_file
    # I will be very careful with indentation here.
    
    target = """            khalti_response = requests.post(
                base_url = settings.KHALTI_BASE_URL.rstrip('/')
                initiate_url = f"{base_url}/epayment/initiate/"
                khalti_response = requests.post(
                    initiate_url,"""
    
    replacement = """            # Ensure the URL doesn't have double slashes
            base_url = settings.KHALTI_BASE_URL.rstrip('/')
            initiate_url = f"{base_url}/epayment/initiate/"

            khalti_response = requests.post(
                initiate_url,"""
    
    return content.replace(target, replacement)

file_path = r"d:\MeroNaya\Backend\payment\views.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find exactly where it is.
# Using a slightly safer approach for multiple occurrences.

new_content = fix_khalti_initiate(content)

if new_content == content:
    print("No matches found for target string. Checking alternative whitespace...")
    # Alternative with potential CRLF issues
    target_crlf = target.replace('\\n', '\\r\\n')
    new_content = content.replace(target_crlf, replacement.replace('\\n', '\\r\\n'))

if new_content != content:
    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print("Successfully fixed payment/views.py")
else:
    print("Failed to find and replace the broken syntax. Listing a few lines to check again.")
    print(repr(content[content.find("requests.post(")-50:content.find("requests.post(")+200]))
