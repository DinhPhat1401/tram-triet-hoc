import re

app_path = 'src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove setCommenterRole, setNewPostRole
content = re.sub(r'\n\s*setCommenterRole\([^)]+\);', '', content)
content = re.sub(r'\n\s*setNewPostRole\([^)]+\);', '', content)
content = re.sub(r'\n\s*setTempCommenterRole\([^)]+\);', '', content)

# Remove role: from DiscussionPost and Comment creates in App.tsx
content = re.sub(r'\n\s*role:[^,]+,', '', content)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

data_path = 'src/data.ts'
with open(data_path, 'r', encoding='utf-8') as f:
    data_content = f.read()

data_content = re.sub(r'\n\s*role:\s*"[^"]+",', '', data_content)
with open(data_path, 'w', encoding='utf-8') as f:
    f.write(data_content)

profile_path = 'src/components/UserProfileModal.tsx'
with open(profile_path, 'r', encoding='utf-8') as f:
    prof_content = f.read()

prof_content = re.sub(r'\n\s*role:\s*[^,]+,', '', prof_content)
prof_content = re.sub(r'profile\.role', '""', prof_content)

with open(profile_path, 'w', encoding='utf-8') as f:
    f.write(prof_content)

print("Fixed TS errors")
