import re

app_path = 'src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove role from fullProfile
content = re.sub(r'role:\s*data\.role[^,]+,?\n?', '', content)
content = re.sub(r'role:\s*fullProfile\.role,?\n?', '', content)

# Remove role from post/reply creation
content = re.sub(r'role:\s*currentRole,?\n?', '', content)
content = re.sub(r'role:\s*userProfile\.role[^,]+,?\n?', '', content)
content = re.sub(r'role:\s*authorRole,?\n?', '', content)
content = re.sub(r'role:\s*post\.role,?\n?', '', content)
content = re.sub(r'role:\s*rep\.role,?\n?', '', content)
content = re.sub(r'role:\s*tempCommenterRole,?\n?', '', content)

# Remove other states
content = re.sub(r'const \[newPostRole, setNewPostRole\] = [^\n]+\n', '', content)
content = re.sub(r'const \[commenterRole, setCommenterRole\] = [^\n]+\n', '', content)
content = re.sub(r'const \[tempCommenterRole, setTempCommenterRole\] = [^\n]+\n', '', content)
content = re.sub(r'const currentDisplayRole = [^\n]+\n', '', content)
content = re.sub(r'const currentRole = [^\n]+\n', '', content)

# Remove authorRole from function params
content = content.replace('authorRole: string, ', '')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up App.tsx")
