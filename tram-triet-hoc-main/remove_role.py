import os

rules_path = 'firestore.rules'
with open(rules_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences exactly
content = content.replace(", 'role'", "")
content = content.replace("'role', ", "")
content = content.replace("        && (!data.keys().hasAny(['role']) || (data.role is string))\n", "")
content = content.replace("            && request.resource.data.role == resource.data.role\n", "")

with open(rules_path, 'w', encoding='utf-8') as f:
    f.write(content)

app_path = 'src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(", role: fullProfile.role", "")
app_content = app_content.replace("role: data.role || \"Sinh viên\"", "")
app_content = app_content.replace("role: data.role || \"Sinh viAn\"", "") # Check encoding
app_content = app_content.replace("role: \"Sinh viên\",", "")
app_content = app_content.replace("role: currentRole,", "")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Removed role")
