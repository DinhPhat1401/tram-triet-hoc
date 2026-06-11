import re
import os

file_path = os.path.join(r"d:\FPT\Ky_8\MLN111V2\tram-triet-hoc\src\App.tsx")
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import PhilosophicalMemory from "./components/PhilosophicalMemory";',
    'import PhilosophicalMemory from "./components/PhilosophicalMemory";\nimport AuthModal from "./components/AuthModal";\nimport UserProfileModal from "./components/UserProfileModal";'
)

content = content.replace(
    'import { db, auth, initFirebaseAuth, OperationType, handleFirestoreError } from "./firebase";',
    'import { db, auth, initFirebaseAuth, OperationType, handleFirestoreError, signOut } from "./firebase";'
)

# 2. Add New States
old_role_state = '  const [tempCommenterRole, setTempCommenterRole] = useState<"Sinh viên" | "Người nghiên cứu">("Sinh viên");'
new_role_state = '  const [tempCommenterRole, setTempCommenterRole] = useState<"Sinh viên" | "Người nghiên cứu">("Sinh viên");\n\n  // Auth Modals\n  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);\n  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);\n  const [userProfile, setUserProfile] = useState<any>(null);'
content = content.replace(old_role_state, new_role_state)


# 3. Update initFirebaseAuth useEffect
# Due to the complexity, I will replace the block from "initFirebaseAuth((success, error) => {" to "setIsAuthReady(true);\n    });"
pattern_init_auth = r"initFirebaseAuth\(\(success, error\) => \{.*?\setIsAuthReady\(true\);\n    \}\);"
new_init_auth = """initFirebaseAuth(async (success, error) => {
      setIsAuthReady(true);
      if (auth.currentUser) {
        const docRef = doc(db, "userProfiles", auth.currentUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            if (data.progress) {
              setProgress(data.progress);
            }
          }
        } catch (e) {
          console.error("Error loading user profile", e);
        }
      } else {
        setUserProfile(null);
      }
    });"""

content = re.sub(pattern_init_auth, new_init_auth, content, flags=re.DOTALL)


# 4. Progress Sync
sync_progress_old = """  // Save progress to local storage
  useEffect(() => {
    localStorage.setItem("tram_hoc_progress", JSON.stringify(progress));
  }, [progress]);"""

sync_progress_new = """  // Save progress to local storage and Firestore
  useEffect(() => {
    localStorage.setItem("tram_hoc_progress", JSON.stringify(progress));
    if (auth.currentUser && userProfile) {
      updateDoc(doc(db, "userProfiles", auth.currentUser.uid), { progress: progress }).catch(console.error);
    }
  }, [progress, auth.currentUser]);"""

content = content.replace(sync_progress_old, sync_progress_new)

# 5. Header Avatar/Login Button
header_button_old = """            {/* Quick dashboard trigger */}
            <button
              onClick={() => {
                safeNavigate(() => {
                  handleSelectStation(1);
                });
              }}
              className="bg-primary text-white px-5 py-2 rounded-full font-sans font-semibold text-xs hover:bg-opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Bắt đầu học
            </button>"""

header_button_new = """            {/* Auth/Profile Trigger */}
            {auth.currentUser ? (
              <button
                onClick={() => setIsUserProfileModalOpen(true)}
                className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-primary px-3 py-1.5 rounded-full font-sans font-semibold text-xs hover:bg-neutral-200 transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10">
                   {userProfile?.avatarUrl ? (
                     <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-4 h-4 m-1 text-primary" />
                   )}
                </div>
                <span className="max-w-[100px] truncate">{userProfile?.name || auth.currentUser.email}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-amber-600 text-white px-5 py-2 rounded-full font-sans font-bold text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                Đăng nhập
              </button>
            )}"""

content = content.replace(header_button_old, header_button_new)

# 6. Forum creation block replacement
create_post_old = """  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !commenterName.trim()) return;

    // Use synced checked and saved identity
    const cleanAuthor = commenterName.trim();
    const currentRole = commenterRole as any;"""

create_post_new = """  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    const cleanAuthor = userProfile.name;
    const currentRole = userProfile.role || "Sinh viên";
    const avatarUrl = userProfile.avatarUrl || null;"""

content = content.replace(create_post_old, create_post_new)

create_post_firebase_old = """      await setDoc(postRef, {
        id: threadId,
        author: cleanAuthor,
        role: currentRole,
        avatarColor: currentRole === "Sinh viên" ? "bg-cyan-700" : "bg-purple-800",
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        likes: 0,
        repliesCount: 0,
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });"""

create_post_firebase_new = """      await setDoc(postRef, {
        id: threadId,
        author: cleanAuthor,
        role: currentRole,
        avatarColor: currentRole === "Sinh viên" ? "bg-cyan-700" : "bg-purple-800",
        avatarUrl: avatarUrl,
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        likes: 0,
        repliesCount: 0,
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });"""

content = content.replace(create_post_firebase_old, create_post_firebase_new)

# 7. Comment creation replacement
add_comment_old = """  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;

    if (!commenterName || !commenterName.trim()) {
      setTempCommenterName("");
      setTempCommenterRole("Sinh viên");
      setPendingPostIdToComment(postId);
      setShowCommenterNameModal(true);
      return;
    }

    const contentToPost = commentInput;
    setCommentInput(""); // Clear immediately for instant client response
    await executeAddComment(postId, commenterName, commenterRole, contentToPost);
  };

  const executeAddComment = async (postId: string, authorName: string, authorRole: string, content: string) => {"""

add_comment_new = """  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    const contentToPost = commentInput;
    setCommentInput(""); // Clear immediately for instant client response
    await executeAddComment(postId, userProfile.name, userProfile.role || "Sinh viên", userProfile.avatarUrl || null, contentToPost);
  };

  const executeAddComment = async (postId: string, authorName: string, authorRole: string, avatarUrl: string | null, content: string) => {"""

content = content.replace(add_comment_old, add_comment_new)

comment_firebase_old = """      await setDoc(replyRef, {
        id: replyId,
        author: authorName,
        role: authorRole,
        avatarColor: avatarColor,
        content: content,
        authorUid: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });"""

comment_firebase_new = """      await setDoc(replyRef, {
        id: replyId,
        author: authorName,
        role: authorRole,
        avatarColor: avatarColor,
        avatarUrl: avatarUrl,
        content: content,
        authorUid: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });"""

content = content.replace(comment_firebase_old, comment_firebase_new)

# 8. Modals mounting
modals_mounting_old = """      <PhilosophicalCursor />
      {/* Dynamic top navigation bar */}"""

modals_mounting_new = """      <PhilosophicalCursor />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => {
        // Additional refresh logic if needed
      }} />
      <UserProfileModal isOpen={isUserProfileModalOpen} onClose={() => setIsUserProfileModalOpen(false)} uid={auth.currentUser?.uid || ""} />
      
      {/* Dynamic top navigation bar */}"""

content = content.replace(modals_mounting_old, modals_mounting_new)

# 9. Avatar rendering in posts
avatar_post_old = """                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${post.avatarColor}`}>
                  {post.author.charAt(0).toUpperCase()}
                </div>"""

avatar_post_new = """                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${post.avatarColor} overflow-hidden`}>
                  {post.avatarUrl ? <img src={post.avatarUrl} alt="avt" className="w-full h-full object-cover" /> : post.author.charAt(0).toUpperCase()}
                </div>"""

content = content.replace(avatar_post_old, avatar_post_new)

avatar_comment_old = """                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${reply.avatarColor}`}>
                    {reply.author.charAt(0).toUpperCase()}
                  </div>"""

avatar_comment_new = """                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${reply.avatarColor} overflow-hidden`}>
                    {reply.avatarUrl ? <img src={reply.avatarUrl} alt="avt" className="w-full h-full object-cover" /> : reply.author.charAt(0).toUpperCase()}
                  </div>"""

content = content.replace(avatar_comment_old, avatar_comment_new)

# 10. Fix user identity buttons in Forum (remove "Thay đổi tên")
remove_name_btn_old = """                <button 
                  onClick={() => {
                    setTempCommenterName(commenterName);
                    setTempCommenterRole(commenterRole as any);
                    setShowCommenterNameModal(true);
                  }}
                  className="text-xs text-amber-600 font-semibold flex items-center gap-1 hover:underline ml-3 bg-amber-50 px-2 py-0.5 rounded-full"
                >
                  <Edit className="w-3 h-3" /> Chỉnh sửa
                </button>"""

remove_name_btn_new = """ """
content = content.replace(remove_name_btn_old, remove_name_btn_new)

# 11. Protect Certificate Download
protect_cert_old = """  const handleDownloadCertificate = async () => {
    setIsDownloadingCert(true);"""

protect_cert_new = """  const handleDownloadCertificate = async () => {
    if (!auth.currentUser || !userProfile?.name) {
      setIsAuthModalOpen(true);
      return;
    }
    const safeStudentName = userProfile.name;
    setIsDownloadingCert(true);"""

content = content.replace(protect_cert_old, protect_cert_new)

# In handleDownloadCertificate we must replace studentName with safeStudentName
# But instead of finding all of them, just replacing it contextually
cert_name_old = """      ctx.fillText(studentName.toUpperCase(), canvas.width / 2, 380);"""
cert_name_new = """      ctx.fillText(safeStudentName.toUpperCase(), canvas.width / 2, 380);"""
content = content.replace(cert_name_old, cert_name_new)

cert_name_old2 = """      const nameWidth = ctx.measureText(studentName.toUpperCase()).width;"""
cert_name_new2 = """      const nameWidth = ctx.measureText(safeStudentName.toUpperCase()).width;"""
content = content.replace(cert_name_old2, cert_name_new2)

cert_name_old3 = """        link.download = `Chung_Nhan_Tram_Hoc_${studentName.trim().replace(/\s+/g, "_")}.png`;"""
cert_name_new3 = """        link.download = `Chung_Nhan_Tram_Hoc_${safeStudentName.trim().replace(/\s+/g, "_")}.png`;"""
content = content.replace(cert_name_old3, cert_name_new3)

# 12. Fix Edit delete permissions to strict uid checking
del_post_old = """post.author === commenterName || post.authorUid === auth.currentUser?.uid"""
del_post_new = """post.authorUid === auth.currentUser?.uid"""
content = content.replace(del_post_old, del_post_new)

del_comment_old = """reply.author === commenterName || reply.authorUid === auth.currentUser?.uid"""
del_comment_new = """reply.authorUid === auth.currentUser?.uid"""
content = content.replace(del_comment_old, del_comment_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("App.tsx transformations completed!")
