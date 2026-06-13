import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix TS error first and remove role usage
content = content.replace(/executeAddComment\(pendingPostIdToComment, name, tempCommenterRole, contentToPost\);/g, 
                          'executeAddComment(pendingPostIdToComment, name, null, contentToPost);');

// Remove role from executeAddComment signature
content = content.replace(/executeAddComment = async \(postId: string, authorName: string, authorRole: string, avatarUrl: string \| null, content: string\)/g,
                          'executeAddComment = async (postId: string, authorName: string, avatarUrl: string | null, content: string)');

// Remove role references in executeAddComment body
content = content.replace(/role: authorRole,/g, '');

// handleAddComment
content = content.replace(/await executeAddComment\(postId, userProfile\.name, userProfile\.role \|\| "Sinh viên", userProfile\.avatarUrl \|\| null, contentToPost\);/g,
                          'await executeAddComment(postId, userProfile.name, userProfile.avatarUrl || null, contentToPost);');

// handleCreatePost
content = content.replace(/const currentRole = userProfile\.role \|\| "Sinh viên";\n    const avatarUrl/g,
                          'const avatarUrl');
content = content.replace(/role: currentRole,/g, '');
content = content.replace(/avatarColor: currentRole === "Sinh viên" \? "bg-cyan-700" : "bg-purple-800",/g,
                          'avatarColor: "bg-cyan-700",');

// Remove role from UI rendering
content = content.replace(/<span className="bg-neutral-100 text-neutral-500 px-2 py-0\.5 rounded text-\[10px\] font-semibold uppercase tracking-wider">\s*\{post\.role\}\s*<\/span>/g, '');
content = content.replace(/<span className="bg-neutral-100 text-neutral-500 px-2 py-0\.5 rounded text-\[9px\] font-semibold uppercase tracking-wider">\s*\{comment\.role\}\s*<\/span>/g, '');

// Remove role from comment placeholder
content = content.replace(/\(\{currentDisplayRole\}\)/g, '');

// Clean up commenterRole state variables
// Actually we can just leave the unused state variables to avoid breaking hooks order,
// but we'll remove the UI that lets them select it.

content = content.replace(/<div className="space-y-1\.5">[\s\S]*?<label className="text-xs font-bold text-neutral-600 block">Vai trò của bạn.*?<\/select>\s*<\/div>/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
