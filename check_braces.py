import sys

def check_braces(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    depth = 0
    line_num = 1
    for char in content:
        if char == '\n':
            line_num += 1
        elif char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth < 0:
                print(f"Error: Unexpected '}}' at line {line_num}")
                return
    
    if depth > 0:
        print(f"Error: Missing {depth} '}}' at end of file")
    elif depth == 0:
        print("Braces are balanced!")

check_braces('/Users/bankimkamila/Tevar/src/app/globals.css')
