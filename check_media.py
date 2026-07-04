import sys

def check_media(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    depth = 0
    in_media = False
    media_depth = 0
    line_num = 1
    
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        if '@media' in line:
            print(f"Media starts at line {i+1}")
            
        for char in line:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                
        if '.site-footer' in line:
            print(f".site-footer found at depth {depth}")

check_media('/Users/bankimkamila/Tevar/src/app/globals.css')
