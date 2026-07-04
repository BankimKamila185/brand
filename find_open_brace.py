import sys

with open('/Users/bankimkamila/Tevar/src/app/globals.css', 'r') as f:
    lines = f.readlines()

depth = 0
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
    if i + 1 == 1181:
        print(f"At line 1181, depth is {depth}")
        break
