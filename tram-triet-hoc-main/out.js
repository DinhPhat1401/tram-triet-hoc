import { Fragment, jsx, jsxs } from "react/jsx-runtime";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import {
  HelpCircle,
  Layers,
  GitBranch,
  Award,
  Search,
  ChevronRight,
  PlayCircle,
  BookOpen,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Plus,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Printer,
  ChevronLeft,
  X,
  User,
  Trash2,
  Edit,
  Download,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import { STATIONS_DATA, BOOKS_DATA, FORUM_THREADS } from "./data";
import PhilosophicalCursor from "./components/PhilosophicalCursor";
import PhilosophersGallery from "./components/PhilosophersGallery";
import FlappyPhilosopher from "./components/FlappyPhilosopher";
import PhilosophicalMemory from "./components/PhilosophicalMemory";
import PenaltyGoalkeeper from "./components/PenaltyGoalkeeper";
import AuthModal from "./components/AuthModal";
import UserProfileModal from "./components/UserProfileModal";
import anhHocThuat from "./anh_hoc_thuat.png";
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getDocs,
  getDoc
} from "firebase/firestore";
import { db, auth, initFirebaseAuth, OperationType, handleFirestoreError, signOut } from "./firebase";
export default function App() {
  const [view, setView] = useState("home");
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [forumPosts, setForumPosts] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFirebaseOffline, setIsFirebaseOffline] = useState(false);
  const [activePostComments, setActivePostComments] = useState([]);
  const [myLikes, setMyLikes] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Kh\xE1i lu\u1EADn tri\u1EBFt h\u1ECDc");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState(() => localStorage.getItem("tram_hoc_commenter_name") || "");
  const [newPostRole, setNewPostRole] = useState(() => localStorage.getItem("tram_hoc_commenter_role") || "Sinh vi\xEAn");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commenterName, setCommenterName] = useState(() => localStorage.getItem("tram_hoc_commenter_name") || "");
  const [commenterRole, setCommenterRole] = useState(() => localStorage.getItem("tram_hoc_commenter_role") || "Sinh vi\xEAn");
  const [showCommenterNameModal, setShowCommenterNameModal] = useState(false);
  const [pendingPostIdToComment, setPendingPostIdToComment] = useState(null);
  const [tempCommenterName, setTempCommenterName] = useState("");
  const [tempCommenterRole, setTempCommenterRole] = useState("Sinh vi\xEAn");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const currentDisplayName = userProfile?.name || commenterName;
  const currentDisplayRole = userProfile?.role || commenterRole;
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("tram_hoc_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
      }
    }
    return {
      currentStationId: 1,
      completedLessons: [],
      quizScores: {},
      completedQuizzes: [],
      savedQuotes: [],
      readBooks: []
    };
  });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState({});
  const toggleMarkQuestion = (qId) => {
    setMarkedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };
  const isStationUnlocked = (stationId) => {
    if (stationId === 1) return true;
    return progress.completedQuizzes.includes(stationId - 1);
  };
  const [studentName, setStudentName] = useState(() => localStorage.getItem("tram_hoc_cert_name") || "");
  const [certGenerated, setCertGenerated] = useState(() => localStorage.getItem("tram_hoc_cert_generated") === "true");
  const [initialCertName, setInitialCertName] = useState(() => localStorage.getItem("tram_hoc_cert_initial_name") || "");
  const [nameEditCount, setNameEditCount] = useState(() => {
    const saved = localStorage.getItem("tram_hoc_cert_edit_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  const [certImageToShow, setCertImageToShow] = useState(null);
  const [certId, setCertId] = useState(() => {
    const saved = localStorage.getItem("tram_hoc_cert_id");
    if (saved) return saved;
    const newId = Date.now().toString().slice(-6);
    localStorage.setItem("tram_hoc_cert_id", newId);
    return newId;
  });
  const handleDownloadCertificate = async () => {
    if (!auth.currentUser || !userProfile?.name) {
      setIsAuthModalOpen(true);
      return;
    }
    const safeStudentName = userProfile.name;
    setIsDownloadingCert(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 840;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create 2D canvas context");
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = "#fcfbf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(213, 227, 252, 0.35)";
      const dotSpacing = 24;
      for (let x = 12; x < canvas.width; x += dotSpacing) {
        for (let y = 12; y < canvas.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 10;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2;
      const d = 50;
      ctx.beginPath();
      ctx.moveTo(d, d);
      ctx.lineTo(d + 40, d);
      ctx.moveTo(d, d);
      ctx.lineTo(d, d + 40);
      ctx.moveTo(canvas.width - d, d);
      ctx.lineTo(canvas.width - d - 40, d);
      ctx.moveTo(canvas.width - d, d);
      ctx.lineTo(canvas.width - d, d + 40);
      ctx.moveTo(d, canvas.height - d);
      ctx.lineTo(d + 40, canvas.height - d);
      ctx.moveTo(d, canvas.height - d);
      ctx.lineTo(d, canvas.height - d - 40);
      ctx.moveTo(canvas.width - d, canvas.height - d);
      ctx.lineTo(canvas.width - d - 40, canvas.height - d);
      ctx.moveTo(canvas.width - d, canvas.height - d);
      ctx.lineTo(canvas.width - d, canvas.height - d - 40);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 16px 'Be Vietnam Pro', 'Montserrat', 'Helvetica Neue', sans-serif";
      ctx.fillText("TR\u1EA0M H\u1ECCC TRI\u1EBET H\u1ECCC M\xC1C - L\xCANIN", canvas.width / 2, 115);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "normal 12px 'Be Vietnam Pro', 'Montserrat', 'Helvetica Neue', sans-serif";
      ctx.fillText("N\u1EC1n t\u1EA3ng s\u1ED1 h\xF3a tri th\u1EE9c khoa h\u1ECDc hi\u1EC7n \u0111\u1EA1i", canvas.width / 2, 140);
      ctx.fillStyle = "#002045";
      ctx.font = "bold 44px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText("CH\u1EE8NG NH\u1EACN HO\xC0N TH\xC0NH TR\u1EA0M TRI\u1EBET H\u1ECCC", canvas.width / 2, 215);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 80, 255);
      ctx.lineTo(canvas.width / 2 + 80, 255);
      ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.font = "italic 16px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText(
        "H\u1ED9i \u0111\u1ED3ng H\u1ECDc thu\u1EADt Tr\u1EA1m H\u1ECDc vinh h\u1EA1nh ch\u1EE9ng l\xFD tr\xE2n tr\u1ECDng trao t\u1EB7ng danh hi\u1EC7u n\xE0y t\u1EDBi:",
        canvas.width / 2,
        310
      );
      ctx.fillStyle = "#002045";
      ctx.font = "bold 36px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText(safeStudentName.toUpperCase(), canvas.width / 2, 380);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      const nameWidth = ctx.measureText(safeStudentName.toUpperCase()).width;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 15, 410);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 15, 410);
      ctx.stroke();
      ctx.fillStyle = "#4b5563";
      ctx.font = "15px 'Be Vietnam Pro', 'Helvetica Neue', sans-serif";
      const desc = "V\xEC \u0111\xE3 r\xE8n luy\u1EC7n ki\xEAn \u0111\u1ECBnh, \u0111\u1ECDc s\xE2u s\u1EAFc c\xE1c t\u01B0 t\u01B0\u1EDFng b\u1EA3n th\u1EC3 lu\u1EADn v\xE0 ch\u1EE7 ngh\u0129a l\u1ECBch s\u1EED m\xE1c-x\xEDt bi\u1EC7n ch\u1EE9ng kh\xE1ch quan; v\u01B0\u1EE3t qua c\xE1c \u0111\u1EE3t thi l\xFD thuy\u1EBFt s\xE1t sao \u0111\u1EA1t c\u1EA5p h\u1ECDc gi\u1EA3 xu\u1EA5t s\u1EAFc c\u1EE7a Tr\u1EA1m.";
      const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(" ");
        let line = "";
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, x, currentY);
      };
      wrapText(ctx, desc, canvas.width / 2, 475, 800, 26);
      ctx.strokeStyle = "rgba(229, 231, 235, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(130, 620);
      ctx.lineTo(canvas.width - 130, 620);
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 11px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("X\xC1C MINH S\u1ED0 H\xD3A", 130, 655);
      ctx.fillStyle = "#002045";
      ctx.font = "12px 'Courier New', Courier, monospace";
      ctx.fillText(`ID: THT-${certId}`, 130, 680);
      ctx.textAlign = "right";
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 11px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("CH\u1EE6 T\u1ECACH H\u1ED8I \u0110\u1ED2NG", canvas.width - 130, 655);
      ctx.fillStyle = "#b45309";
      ctx.font = "bold italic 15px 'Playfair Display', Georgia, serif";
      ctx.fillText("Th\u01B0 Vi\u1EC7n Tr\u1EA1m H\u1ECDc", canvas.width - 130, 680);
      const generatedDataUrl = canvas.toDataURL("image/png");
      setCertImageToShow(generatedDataUrl);
      try {
        const link = document.createElement("a");
        link.download = `Chung_Nhan_Tram_Hoc_${safeStudentName.trim().replace(/\s+/g, "_")}.png`;
        link.href = generatedDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (browserBlockErr) {
        console.warn("Direct download link download blocked by sandboxing; fallback popup is active.", browserBlockErr);
      }
    } catch (err) {
      console.error("Canvas draw failed:", err);
      requestAlert(
        "L\u1ED7i t\u1EA3i xu\u1ED1ng",
        "C\xF3 l\u1ED7i kh\xF4ng ng\u1EDD x\u1EA3y ra khi xu\u1EA5t ch\u1EE9ng ch\u1EC9. H\xE3y d\xF9ng t\xEDnh n\u0103ng 'In ho\u1EB7c xu\u1EA5t PDF' b\xEAn c\u1EA1nh ch\u1EE5p \u1EA3nh m\xE0n h\xECnh nh\xE9!"
      );
    } finally {
      setIsDownloadingCert(false);
    }
  };
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: ""
  });
  const requestConfirm = (title, message, onConfirm) => {
    setCustomModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onAccess: () => {
        onConfirm();
        setCustomModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const requestAlert = (title, message) => {
    setCustomModal({
      isOpen: true,
      type: "alert",
      title,
      message
    });
  };
  const safeNavigate = (onNavigate) => {
    if (isQuizActive && !quizSubmitted) {
      requestConfirm(
        "X\xE1c nh\u1EADn tho\xE1t b\xE0i t\u1EADp",
        "B\u1EA1n \u0111ang l\xE0m d\u1EDF b\xE0i t\u1EADp \xF4n t\u1EADp, n\u1EBFu r\u1EDDi \u0111i k\u1EBFt qu\u1EA3 l\u01B0\u1EE3t l\xE0m b\xE0i hi\u1EC7n t\u1EA1i s\u1EBD kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u. B\u1EA1n c\xF3 ch\u1EAFc ch\u1EAFn mu\u1ED1n r\u1EDDi \u0111i?",
        () => {
          onNavigate();
        }
      );
    } else {
      onNavigate();
    }
  };
  useEffect(() => {
    localStorage.setItem("tram_hoc_progress", JSON.stringify(progress));
    if (auth.currentUser) {
      setDoc(doc(db, "userProfiles", auth.currentUser.uid), { uid: auth.currentUser.uid, progress }, { merge: true }).catch(console.error);
    }
  }, [progress, auth.currentUser]);
  useEffect(() => {
    const isPlaying = view === "game" && selectedGameId !== null;
    window.dispatchEvent(new CustomEvent("game-status-changed", { detail: { active: isPlaying } }));
    return () => {
      window.dispatchEvent(new CustomEvent("game-status-changed", { detail: { active: false } }));
    };
  }, [view, selectedGameId]);
  useEffect(() => {
    if (view !== "game") {
      setSelectedGameId(null);
    }
  }, [view]);
  useEffect(() => {
    let unsubscribe;
    initFirebaseAuth(async (success, error) => {
      if (!success) {
        console.warn("Firebase Auth initialized in offline/fallback sandbox mode:", error);
        setIsFirebaseOffline(true);
        const savedPosts = localStorage.getItem("tram_hoc_local_posts");
        const savedLikes = localStorage.getItem("tram_hoc_local_likes");
        if (savedPosts) {
          try {
            setForumPosts(JSON.parse(savedPosts));
          } catch (e) {
            setForumPosts(FORUM_THREADS);
          }
        } else {
          setForumPosts(FORUM_THREADS);
        }
        if (savedLikes) {
          try {
            setMyLikes(JSON.parse(savedLikes));
          } catch (e) {
          }
        }
        setIsAuthReady(true);
        return;
      }
      unsubscribe = auth.onAuthStateChanged(async (user) => {
        setCurrentUser(user);
        if (user && user.isAnonymous) {
          console.log("Found legacy anonymous session, signing out...");
          await signOut(auth);
          setUserProfile(null);
          setIsAuthReady(true);
          return;
        }
        if (user) {
          const currentUid = user.uid;
          try {
            const docRef = doc(db, "userProfiles", currentUid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log("Loaded student profile from Firestore:", data);
              const defaultName = user.displayName || user.email?.split("@")[0] || "Ng\u01B0\u1EDDi d\xF9ng";
              const fullProfile = {
                ...data,
                name: data.name || defaultName,
                email: data.email || user.email || "",
                role: data.role || "Sinh vi\xEAn"
              };
              setUserProfile(fullProfile);
              if (data.progress) {
                setProgress(data.progress);
              }
            } else {
              console.log("No profile on Firestore yet for this UID");
              setUserProfile(null);
            }
          } catch (err) {
            console.warn("Failed to fetch user profile, switching to Local Sandbox Mode:", err);
            setIsFirebaseOffline(true);
          }
        } else {
          setUserProfile(null);
        }
        setIsAuthReady(true);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!isAuthReady || isFirebaseOffline) return;
    const postsQuery = query(collection(db, "forumPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding initial forum threads to Firestore...");
        try {
          for (const post of FORUM_THREADS) {
            const postRef = doc(db, "forumPosts", post.id);
            const postPayload = {
              id: post.id,
              author: post.author,
              role: post.role,
              avatarColor: post.avatarColor,
              title: post.title,
              content: post.content,
              category: post.category,
              likes: post.likes || 0,
              repliesCount: post.replies.length,
              createdAt: serverTimestamp()
            };
            try {
              await setDoc(postRef, postPayload);
              console.log(`Seeded post successfully: ${post.id}`);
            } catch (postError) {
              console.error(`Failed to seed post doc: ${post.id}`, postError);
              handleFirestoreError(postError, OperationType.CREATE, `forumPosts/${post.id}`);
            }
            for (const rep of post.replies) {
              const replyRef = doc(db, "forumPosts", post.id, "replies", rep.id);
              const replyPayload = {
                id: rep.id,
                author: rep.author,
                role: rep.role,
                avatarColor: rep.avatarColor,
                content: rep.content,
                createdAt: serverTimestamp()
              };
              try {
                await setDoc(replyRef, replyPayload);
                console.log(`Seeded replies successfully: ${rep.id} of ${post.id}`);
              } catch (replyError) {
                console.error(`Failed to seed reply doc: ${rep.id} under ${post.id}`, replyError);
                handleFirestoreError(replyError, OperationType.CREATE, `forumPosts/${post.id}/replies/${rep.id}`);
              }
            }
          }
        } catch (e) {
          console.error("Failed to seed initial forum threads:", e);
        }
        return;
      }
      const posts = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let tsStr = "V\u1EEBa xong";
        if (d.createdAt) {
          try {
            const date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
            tsStr = date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          } catch (e) {
          }
        }
        posts.push({
          id: docSnap.id,
          author: d.author || "Kh\xE1ch",
          role: d.role || "Sinh vi\xEAn",
          avatarColor: d.avatarColor || "bg-neutral-400",
          title: d.title || "",
          content: d.content || "",
          category: d.category || "Chung",
          likes: d.likes || 0,
          timestamp: tsStr,
          hasLiked: myLikes[docSnap.id] || false,
          replies: new Array(d.repliesCount || 0).fill(null),
          authorUid: d.authorUid || null
        });
      });
      setForumPosts(posts);
    }, (error) => {
      console.warn("Firestore collection forumPosts listener error, switching to Local Sandbox Mode:", error);
      setIsFirebaseOffline(true);
      const savedPosts = localStorage.getItem("tram_hoc_local_posts");
      if (savedPosts) {
        try {
          setForumPosts(JSON.parse(savedPosts));
        } catch (e) {
          setForumPosts(FORUM_THREADS);
        }
      } else {
        setForumPosts(FORUM_THREADS);
      }
    });
    return unsubscribe;
  }, [isAuthReady, isFirebaseOffline, myLikes]);
  useEffect(() => {
    if (!selectedPostId || !isAuthReady || isFirebaseOffline) {
      if (isFirebaseOffline && selectedPostId) {
        const currentPost = forumPosts.find((p) => p.id === selectedPostId);
        if (currentPost) {
          setActivePostComments(currentPost.replies || []);
        } else {
          setActivePostComments([]);
        }
      } else {
        setActivePostComments([]);
      }
      return;
    }
    const repliesRef = collection(db, "forumPosts", selectedPostId, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let tsStr = "M\u1EDBi \u0111\xE2y";
        if (d.createdAt) {
          try {
            const date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
            tsStr = date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          } catch (e) {
          }
        }
        comments.push({
          id: docSnap.id,
          author: d.author || "H\u1ECDc vi\xEAn",
          role: d.role || "Th\xE0nh vi\xEAn Tr\u1EA1m H\u1ECDc",
          avatarColor: d.avatarColor || "bg-amber-500",
          content: d.content || "",
          timestamp: tsStr,
          authorUid: d.authorUid || null
        });
      });
      setActivePostComments(comments);
    }, (error) => {
      console.warn("Firestore replies listener unavailable, using local mock/cache replies:", error);
      const currentPost = forumPosts.find((p) => p.id === selectedPostId);
      if (currentPost) {
        setActivePostComments(currentPost.replies || []);
      } else {
        setActivePostComments([]);
      }
    });
    const uid = auth.currentUser?.uid;
    let unsubscribeLike;
    if (uid) {
      const likeDocRef = doc(db, "forumPosts", selectedPostId, "likes", uid);
      unsubscribeLike = onSnapshot(likeDocRef, (snapshot) => {
        setMyLikes((prev) => ({
          ...prev,
          [selectedPostId]: snapshot.exists()
        }));
      }, (err) => {
        console.warn("Firestore likeDocRef subscription error, using local state instead:", err);
      });
    }
    return () => {
      unsubscribe();
      if (unsubscribeLike) unsubscribeLike();
    };
  }, [selectedPostId, isAuthReady, isFirebaseOffline]);
  useEffect(() => {
    if (!isFirebaseOffline || !selectedPostId) return;
    const currentPost = forumPosts.find((p) => p.id === selectedPostId);
    if (currentPost) {
      setActivePostComments(currentPost.replies || []);
    } else {
      setActivePostComments([]);
    }
  }, [selectedPostId, forumPosts, isFirebaseOffline]);
  const handleLikePost = async (postId) => {
    const wasLiked = myLikes[postId];
    if (isFirebaseOffline) {
      setMyLikes((prev) => {
        const updated = { ...prev, [postId]: !wasLiked };
        localStorage.setItem("tram_hoc_local_likes", JSON.stringify(updated));
        return updated;
      });
      setForumPosts((posts) => {
        const updated = posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: wasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
              hasLiked: !wasLiked
            };
          }
          return post;
        });
        localStorage.setItem("tram_hoc_local_posts", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const likeDocRef = doc(db, "forumPosts", postId, "likes", uid);
    const postRef = doc(db, "forumPosts", postId);
    setMyLikes((prev) => ({ ...prev, [postId]: !wasLiked }));
    setForumPosts(
      (posts) => posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: wasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            hasLiked: !wasLiked
          };
        }
        return post;
      })
    );
    try {
      if (wasLiked) {
        await deleteDoc(likeDocRef);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
      } else {
        await setDoc(likeDocRef, {
          userId: uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          likes: increment(1)
        });
      }
    } catch (e) {
      console.error("Failed to like/unlike post:", e);
      setMyLikes((prev) => ({ ...prev, [postId]: wasLiked }));
      handleFirestoreError(e, OperationType.UPDATE, `forumPosts/${postId}`);
    }
  };
  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    const contentToPost = commentInput;
    setCommentInput("");
    await executeAddComment(postId, userProfile.name, userProfile.role || "Sinh vi\xEAn", userProfile.avatarUrl || null, contentToPost);
  };
  const executeAddComment = async (postId, authorName, authorRole, avatarUrl, content) => {
    const replyId = "comment-" + Date.now();
    const colors = ["bg-amber-500", "bg-emerald-500", "bg-blue-500", "bg-indigo-500", "bg-rose-500", "bg-purple-500", "bg-pink-500", "bg-teal-500"];
    const hash = authorName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarColor = colors[hash % colors.length];
    const newComment = {
      id: replyId,
      author: authorName,
      role: authorRole,
      avatarColor,
      content,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
    if (isFirebaseOffline) {
      setForumPosts((posts) => {
        const updated = posts.map((post) => {
          if (post.id === postId) {
            const list = post.replies ? [...post.replies] : [];
            list.push(newComment);
            return {
              ...post,
              replies: list
            };
          }
          return post;
        });
        localStorage.setItem("tram_hoc_local_posts", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    if (!auth.currentUser) return;
    const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
    const postRef = doc(db, "forumPosts", postId);
    try {
      await setDoc(replyRef, {
        id: replyId,
        author: authorName,
        role: authorRole,
        avatarColor,
        avatarUrl,
        content,
        authorUid: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        repliesCount: increment(1)
      });
    } catch (e) {
      console.error("Failed to post comment:", e);
      handleFirestoreError(e, OperationType.CREATE, `forumPosts/${postId}/replies/${replyId}`);
    }
  };
  const [isUpdatingIdentity, setIsUpdatingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState(null);
  const handleSaveCommenterName = async () => {
    const name = tempCommenterName.trim().replace(/\s+/g, " ");
    if (!name) return;
    const nameLower = name.toLowerCase();
    if (isFirebaseOffline) {
      localStorage.setItem("tram_hoc_commenter_name", name);
      localStorage.setItem("tram_hoc_commenter_role", tempCommenterRole);
      setCommenterName(name);
      setCommenterRole(tempCommenterRole);
      setNewPostAuthor(name);
      setNewPostRole(tempCommenterRole);
      setShowCommenterNameModal(false);
      return;
    }
    if (!auth.currentUser) {
      setIdentityError("B\u1EA1n c\u1EA7n ph\u1EA3i \u0111\u0103ng nh\u1EADp \u0111\u1EC3 thi\u1EBFt l\u1EADp danh t\xEDnh.");
      return;
    }
    setIsUpdatingIdentity(true);
    setIdentityError(null);
    try {
      const currentUid = auth.currentUser.uid;
      const profileDocRef = doc(db, "userProfiles", nameLower);
      let isTaken = false;
      let existingUid = "";
      const docSnap = await getDoc(profileDocRef);
      if (docSnap.exists()) {
        isTaken = true;
        existingUid = docSnap.data()?.uid || "";
      } else {
        if (name !== nameLower) {
          const legacyRef = doc(db, "userProfiles", name);
          const legacySnap = await getDoc(legacyRef);
          if (legacySnap.exists()) {
            isTaken = true;
            existingUid = legacySnap.data()?.uid || "";
          }
        }
      }
      if (isTaken && existingUid !== currentUid) {
        setIdentityError("Bi\u1EC7t danh n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng b\u1EDFi h\u1ECDc vi\xEAn kh\xE1c. Vui l\xF2ng ch\u1ECDn bi\u1EC7t danh kh\xE1c!");
        setIsUpdatingIdentity(false);
        return;
      }
      try {
        await setDoc(profileDocRef, {
          uid: currentUid,
          name,
          role: tempCommenterRole,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error creating new profile:", err);
        handleFirestoreError(err, OperationType.WRITE, `userProfiles/${nameLower}`);
      }
      const postsToUpdate = forumPosts.filter((p) => p.authorUid === currentUid || p.author === commenterName && !p.authorUid);
      for (const t of postsToUpdate) {
        try {
          await updateDoc(doc(db, "forumPosts", t.id), {
            author: name,
            role: tempCommenterRole,
            authorUid: currentUid
          });
        } catch (err) {
          console.error(`Error updating post ${t.id}:`, err);
          handleFirestoreError(err, OperationType.WRITE, `forumPosts/${t.id}`);
        }
      }
      for (const t of forumPosts) {
        const repliesRef = collection(db, "forumPosts", t.id, "replies");
        const repliesSnap = await getDocs(repliesRef);
        for (const replyDoc of repliesSnap.docs) {
          const replyData = replyDoc.data();
          if (replyData.authorUid === currentUid || replyData.author === commenterName && !replyData.authorUid) {
            try {
              await updateDoc(doc(db, "forumPosts", t.id, "replies", replyDoc.id), {
                author: name,
                role: tempCommenterRole,
                authorUid: currentUid
              });
            } catch (err) {
              console.error(`Error updating reply ${replyDoc.id} in post ${t.id}:`, err);
              handleFirestoreError(err, OperationType.WRITE, `forumPosts/${t.id}/replies/${replyDoc.id}`);
            }
          }
        }
      }
      if (commenterName && commenterName.toLowerCase() !== nameLower) {
        try {
          const oldProfileRef = doc(db, "userProfiles", commenterName.toLowerCase());
          const oldSnap = await getDoc(oldProfileRef);
          if (oldSnap.exists()) {
            const oldData = oldSnap.data();
            if (oldData && oldData.uid === currentUid) {
              await deleteDoc(oldProfileRef);
              console.log(`Successfully deleted old profile document: ${commenterName.toLowerCase()}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to clean up standard old profile ${commenterName.toLowerCase()} (non-fatal):`, err);
        }
        if (commenterName !== commenterName.toLowerCase()) {
          try {
            const legacyOldProfileRef = doc(db, "userProfiles", commenterName);
            const legacyOldSnap = await getDoc(legacyOldProfileRef);
            if (legacyOldSnap.exists()) {
              const legacyOldData = legacyOldSnap.data();
              if (legacyOldData && legacyOldData.uid === currentUid) {
                await deleteDoc(legacyOldProfileRef);
                console.log(`Successfully deleted legacy format old profile document: ${commenterName}`);
              }
            }
          } catch (err) {
            console.warn(`Failed to clean up legacy format old profile ${commenterName} (non-fatal):`, err);
          }
        }
      }
      localStorage.setItem("tram_hoc_commenter_name", name);
      localStorage.setItem("tram_hoc_commenter_role", tempCommenterRole);
      setCommenterName(name);
      setCommenterRole(tempCommenterRole);
      setNewPostAuthor(name);
      setNewPostRole(tempCommenterRole);
      setShowCommenterNameModal(false);
      setPendingPostIdToComment(null);
      if (pendingPostIdToComment && commentInput.trim()) {
        const contentToPost = commentInput;
        setCommentInput("");
        executeAddComment(pendingPostIdToComment, name, tempCommenterRole, contentToPost);
        setPendingPostIdToComment(null);
      }
    } catch (err) {
      console.error("Failed to update commenter identity:", err);
      setIdentityError("\u0110\xE3 x\u1EA3y ra l\u1ED7i khi l\u01B0u danh t\xEDnh. Vui l\xF2ng th\u1EED l\u1EA1i sau.");
    } finally {
      setIsUpdatingIdentity(false);
    }
  };
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    const cleanAuthor = userProfile.name;
    const currentRole = userProfile.role || "Sinh vi\xEAn";
    const avatarUrl = userProfile.avatarUrl || null;
    const threadId = "thread-" + Date.now();
    const newPost = {
      id: threadId,
      author: cleanAuthor,
      role: currentRole,
      avatarColor: currentRole === "Sinh vi\xEAn" ? "bg-cyan-700" : "bg-purple-800",
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      replies: [],
      timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      authorUid: auth.currentUser?.uid || null
    };
    if (isFirebaseOffline) {
      setForumPosts((posts) => {
        const updated = [newPost, ...posts];
        localStorage.setItem("tram_hoc_local_posts", JSON.stringify(updated));
        return updated;
      });
      setNewPostTitle("");
      setNewPostContent("");
      setShowCreatePost(false);
      setSelectedPostId(threadId);
      return;
    }
    if (!auth.currentUser) return;
    const postRef = doc(db, "forumPosts", threadId);
    try {
      await setDoc(postRef, {
        id: threadId,
        author: cleanAuthor,
        role: currentRole,
        avatarColor: currentRole === "Sinh vi\xEAn" ? "bg-cyan-700" : "bg-purple-800",
        avatarUrl,
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        likes: 0,
        repliesCount: 0,
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setNewPostTitle("");
      setNewPostContent("");
      setShowCreatePost(false);
      setSelectedPostId(threadId);
    } catch (e2) {
      console.error("Failed to create thread:", e2);
      handleFirestoreError(e2, OperationType.CREATE, `forumPosts/${threadId}`);
    }
  };
  const handleDeletePost = async (postId) => {
    if (isFirebaseOffline) {
      setForumPosts((posts) => {
        const updated = posts.filter((p) => p.id !== postId);
        localStorage.setItem("tram_hoc_local_posts", JSON.stringify(updated));
        return updated;
      });
      setSelectedPostId(null);
      return;
    }
    if (!auth.currentUser) return;
    const postRef = doc(db, "forumPosts", postId);
    try {
      await deleteDoc(postRef);
      setForumPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPostId(null);
    } catch (e) {
      console.error("Failed to delete post:", e);
      handleFirestoreError(e, OperationType.DELETE, `forumPosts/${postId}`);
    }
  };
  const handleDeleteComment = async (postId, commentId) => {
    if (isFirebaseOffline) {
      setForumPosts((posts) => {
        const updated = posts.map((post) => {
          if (post.id === postId) {
            const list = post.replies ? post.replies.filter((r) => r.id !== commentId) : [];
            return {
              ...post,
              replies: list,
              repliesCount: Math.max(0, (post.repliesCount || 0) - 1)
            };
          }
          return post;
        });
        localStorage.setItem("tram_hoc_local_posts", JSON.stringify(updated));
        return updated;
      });
      setActivePostComments((prev) => prev.filter((r) => r.id !== commentId));
      return;
    }
    if (!auth.currentUser) return;
    const replyRef = doc(db, "forumPosts", postId, "replies", commentId);
    const postRef = doc(db, "forumPosts", postId);
    try {
      await deleteDoc(replyRef);
      await updateDoc(postRef, {
        repliesCount: increment(-1)
      });
      setActivePostComments((prev) => prev.filter((r) => r.id !== commentId));
    } catch (e) {
      console.error("Failed to delete comment:", e);
      handleFirestoreError(e, OperationType.DELETE, `forumPosts/${postId}/replies/${commentId}`);
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const getIcon = (name, className = "w-6 h-6") => {
    switch (name) {
      case "HelpCircle":
        return /* @__PURE__ */ jsx(HelpCircle, { className });
      case "Hub":
        return /* @__PURE__ */ jsx(Layers, { className });
      case "GitBranch":
        return /* @__PURE__ */ jsx(GitBranch, { className });
      case "Award":
        return /* @__PURE__ */ jsx(Award, { className });
      default:
        return /* @__PURE__ */ jsx(HelpCircle, { className });
    }
  };
  const handleSelectStation = (stationId, startWithQuiz = false) => {
    if (!isStationUnlocked(stationId)) {
      requestAlert(
        "Tr\u1EA1m \u0111ang b\u1ECB kh\xF3a",
        `Tr\u1EA1m ${stationId} hi\u1EC7n \u0111ang kh\xF3a. B\u1EA1n c\u1EA7n tr\u1EA3 l\u1EDDi \u0111\xFAng 100% t\u1EA5t c\u1EA3 c\xE1c c\xE2u h\u1ECFi tr\u1EAFc nghi\u1EC7m c\u1EE7a Tr\u1EA1m ${stationId - 1} \u0111\u1EC3 m\u1EDF kh\xF3a!`
      );
      return;
    }
    setSelectedStationId(stationId);
    setActiveLessonIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveQuestionIndex(0);
    setIsQuizActive(startWithQuiz);
    setView("station");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const isLessonCompleted = (lessonId) => progress.completedLessons.includes(lessonId);
  const toggleLessonCompleted = (lessonId) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(lessonId);
      const updated = exists ? prev.completedLessons.filter((id) => id !== lessonId) : [...prev.completedLessons, lessonId];
      return { ...prev, completedLessons: updated };
    });
  };
  const handleAnswerQuiz = (qId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };
  const handleNextQuestion = (total) => {
    if (activeQuestionIndex < total - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };
  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };
  const handleSubmitQuiz = (stationId, questionsCount) => {
    const station = STATIONS_DATA.find((s) => s.id === stationId);
    if (!station) return;
    let score = 0;
    station.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    const isAllCorrect = score === station.questions.length;
    setProgress((prev) => {
      const updatedScores = { ...prev.quizScores, [stationId]: score };
      const updatedCompleted = isAllCorrect ? prev.completedQuizzes.includes(stationId) ? prev.completedQuizzes : [...prev.completedQuizzes, stationId] : prev.completedQuizzes.filter((id) => id !== stationId);
      return {
        ...prev,
        quizScores: updatedScores,
        completedQuizzes: updatedCompleted
      };
    });
    setQuizSubmitted(true);
  };
  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveQuestionIndex(0);
    setMarkedQuestions({});
  };
  const toggleBookRead = (bookId) => {
    setProgress((prev) => {
      const exists = prev.readBooks.includes(bookId);
      const updated = exists ? prev.readBooks.filter((id) => id !== bookId) : [...prev.readBooks, bookId];
      return { ...prev, readBooks: updated };
    });
  };
  const totalCompletedLessons = progress.completedLessons.length;
  const totalCompletedQuizzes = progress.completedQuizzes.length;
  const unlockedStationsCount = STATIONS_DATA.filter((st) => isStationUnlocked(st.id)).length;
  const totalCorrectAnswers = Object.values(progress.quizScores).reduce((a, b) => a + b, 0);
  const totalReadBooks = progress.readBooks.length;
  const searchResults = () => {
    if (!searchQuery.trim()) return null;
    const query2 = searchQuery.toLowerCase();
    const matchesLessons = [];
    STATIONS_DATA.forEach((st) => {
      st.lessons.forEach((les, idx) => {
        if (les.title.toLowerCase().includes(query2) || les.summary.toLowerCase().includes(query2) || st.title.toLowerCase().includes(query2)) {
          matchesLessons.push({
            station: st,
            lessonIndex: idx,
            title: les.title,
            summary: les.summary
          });
        }
      });
    });
    const matchesBooks = BOOKS_DATA.filter(
      (b) => b.title.toLowerCase().includes(query2) || b.summary.toLowerCase().includes(query2)
    );
    return { lessons: matchesLessons, books: matchesBooks };
  };
  const results = searchResults();
  const resetAllProgress = () => {
    requestConfirm(
      "\u0110\u1EB7t l\u1EA1i ti\u1EBFn tr\xECnh h\u1ECDc t\u1EADp",
      "B\u1EA1n c\xF3 ch\u1EAFc ch\u1EAFn mu\u1ED1n l\xE0m m\u1EDBi to\xE0n b\u1ED9 ti\u1EBFn tr\xECnh h\u1ECDc t\u1EADp kh\xF4ng?",
      () => {
        setProgress({
          currentStationId: 1,
          completedLessons: [],
          quizScores: {},
          completedQuizzes: [],
          savedQuotes: [],
          readBooks: []
        });
        setSelectedStationId(null);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setView("home");
        setStudentName("");
        setInitialCertName("");
        setCertGenerated(false);
        setNameEditCount(0);
        const newId = Date.now().toString().slice(-6);
        setCertId(newId);
        localStorage.setItem("tram_hoc_cert_id", newId);
        localStorage.removeItem("tram_hoc_cert_name");
        localStorage.removeItem("tram_hoc_cert_initial_name");
        localStorage.removeItem("tram_hoc_cert_generated");
        localStorage.removeItem("tram_hoc_cert_edit_count");
        requestAlert("C\xE0i \u0111\u1EB7t l\u1EA1i th\xE0nh c\xF4ng", "H\u1EC7 th\u1ED1ng \u0111\xE3 \u0111\u01B0\u1EE3c c\xE0i \u0111\u1EB7t l\u1EA1i tr\u1EA1ng th\xE1i ban \u0111\u1EA7u!");
      }
    );
  };
  return /* @__PURE__ */ jsxs("div", { id: "root-app", className: "min-h-screen bg-neutral-50 font-sans text-primary flex flex-col antialiased", children: [
    /* @__PURE__ */ jsx(PhilosophicalCursor, {}),
    /* @__PURE__ */ jsx(
      AuthModal,
      {
        isOpen: isAuthModalOpen || isAuthReady && !isFirebaseOffline && !currentUser,
        closable: !(isAuthReady && !isFirebaseOffline && !currentUser),
        onClose: () => setIsAuthModalOpen(false),
        onSuccess: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(UserProfileModal, { isOpen: isUserProfileModalOpen, onClose: () => setIsUserProfileModalOpen(false), uid: auth.currentUser?.uid || "" }),
    /* @__PURE__ */ jsxs("nav", { className: "fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 shadow-sm transition-all", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-4 md:px-12 py-4 max-w-7xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "flex items-center gap-2 cursor-pointer group",
            onClick: () => {
              safeNavigate(() => {
                setView("home");
                setSelectedStationId(null);
              });
            },
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white", children: /* @__PURE__ */ jsx("span", { className: "font-serif font-bold text-lg", children: "T" }) }),
              /* @__PURE__ */ jsx("span", { className: "font-serif text-lg md:text-xl text-primary font-bold tracking-tight group-hover:text-amber-600 transition-colors", children: "Tr\u1EA1m H\u1ECDc Tri\u1EBFt h\u1ECDc" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center gap-6 lg:gap-8", children: [
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("home");
                  setSelectedStationId(null);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "home" && !selectedStationId ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "Trang Ch\u1EE7"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("home");
                  setSelectedStationId(1);
                  handleSelectStation(1);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "station" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "Tr\u1EA1m Ki\u1EBFn Th\u1EE9c"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("path");
                  setSelectedStationId(null);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "path" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "L\u1ED9 Tr\xECnh"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("library");
                  setSelectedStationId(null);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "library" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "Th\u01B0 Vi\u1EC7n"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("discussion");
                  setSelectedStationId(null);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "discussion" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "Di\u1EC5n \u0110\xE0n"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("game");
                  setSelectedStationId(null);
                });
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${view === "game" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"}`,
              children: "Tr\xF2 Ch\u01A1i"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              onClick: () => {
                const footerEl = document.getElementById("app-footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              },
              whileHover: { y: -1, scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: "font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer text-neutral-500 border-transparent",
              children: "Li\xEAn H\u1EC7"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          auth.currentUser ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsUserProfileModalOpen(true),
              className: "flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-primary px-3 py-1.5 rounded-full font-sans font-semibold text-xs hover:bg-neutral-200 transition-all shadow-sm",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-full overflow-hidden bg-primary/10", children: userProfile?.avatarUrl ? /* @__PURE__ */ jsx("img", { src: userProfile.avatarUrl, alt: "Avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "w-4 h-4 m-1 text-primary" }) }),
                /* @__PURE__ */ jsx("span", { className: "max-w-[100px] truncate", children: userProfile?.name || auth.currentUser.email })
              ]
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsAuthModalOpen(true),
              className: "bg-amber-600 text-white px-5 py-2 rounded-full font-sans font-bold text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-sm flex items-center gap-2",
              children: "\u0110\u0103ng nh\u1EADp"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: "p-1 lg:hidden text-primary focus:outline-none",
              children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 w-6", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `h-0.5 w-full bg-primary transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `h-0.5 w-full bg-primary transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `h-0.5 w-full bg-primary transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`
                  }
                )
              ] })
            }
          )
        ] })
      ] }),
      mobileMenuOpen && /* @__PURE__ */ jsxs("div", { className: "lg:hidden bg-white border-b border-neutral-200 px-6 py-4 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("home");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Trang Ch\u1EE7"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                handleSelectStation(1);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Tr\u1EA1m Ki\u1EBFn Th\u1EE9c (H\u1ECDc Thuy\u1EBFt)"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("path");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "L\u1ED9 Tr\xECnh Tri Th\u1EE9c"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("library");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Th\u01B0 Vi\u1EC7n S\xE1ch C\u1ED5 \u0110i\u1EC3n"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("discussion");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Di\u1EC5n \u0110\xE0n H\u1ECDc T\u1EADp"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("game");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Tr\xF2 Ch\u01A1i Tr\xED Tu\u1EC7"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              safeNavigate(() => {
                setView("certificate");
                setSelectedStationId(null);
                setMobileMenuOpen(false);
              });
            },
            className: "text-left font-bold text-sm text-amber-600 hover:text-primary py-2 hover:pl-2 transition-all flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Award, { className: "w-4 h-4 text-amber-650" }),
              "B\u1EA3ng V\xE0ng Ch\u1EE9ng Nh\u1EADn"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setMobileMenuOpen(false);
              setTimeout(() => {
                const footerEl = document.getElementById("app-footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              }, 150);
            },
            className: "text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all",
            children: "Li\xEAn H\u1EC7 & Th\xE0nh Vi\xEAn Nh\xF3m"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-grow pt-16", children: [
      searchQuery.trim() && /* @__PURE__ */ jsx("div", { className: "bg-neutral-50 py-10 px-4 md:px-12 border-b border-neutral-200", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-serif font-bold text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Search, { className: "w-5 h-5 text-amber-600" }),
            ' K\u1EBFt qu\u1EA3 t\xECm ki\u1EBFm cho: "',
            searchQuery,
            '"'
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "text-sm bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full hover:bg-neutral-300 transition-all font-semibold",
              children: "X\xF3a t\xECm ki\u1EBFm"
            }
          )
        ] }),
        results?.lessons && results.lessons.length > 0 || results?.books && results.books.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          results.lessons && results.lessons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-sans font-bold text-xs uppercase tracking-widest text-neutral-400 border-b pb-1.5", children: [
              "B\xE0i h\u1ECDc t\u01B0\u01A1ng th\xEDch (",
              results.lessons.length,
              ")"
            ] }),
            results.lessons.map((match, i) => /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => {
                  setSelectedStationId(match.station.id);
                  setActiveLessonIndex(match.lessonIndex);
                  setView("station");
                  setSearchQuery("");
                },
                className: "bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary/40 cursor-pointer shadow-sm transition-all",
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full", children: [
                    "Tr\u1EA1m ",
                    match.station.id
                  ] }),
                  /* @__PURE__ */ jsx("h4", { className: "font-serif text-sm font-semibold mt-1.5 text-primary", children: match.title }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: match.summary })
                ]
              },
              i
            ))
          ] }),
          results.books && results.books.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-sans font-bold text-xs uppercase tracking-widest text-neutral-400 border-b pb-1.5", children: [
              "S\xE1ch kinh \u0111i\u1EC3n tr\xF9ng kh\u1EDBp (",
              results.books.length,
              ")"
            ] }),
            results.books.map((book) => /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => {
                  setView("library");
                  setSearchQuery("");
                },
                className: "bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary/40 cursor-pointer shadow-sm transition-all flex gap-3",
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: book.coverImage,
                      alt: book.title,
                      className: "w-10 h-14 object-cover rounded-md flex-shrink-0"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full", children: book.category }),
                    /* @__PURE__ */ jsx("h4", { className: "font-serif text-sm font-semibold mt-1 text-primary", children: book.title }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-400 font-medium", children: [
                      "B\u1EDFi ",
                      book.author
                    ] })
                  ] })
                ]
              },
              book.id
            ))
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl p-8 text-center border", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-500", children: [
          'Kh\xF4ng t\xECm th\u1EA5y b\xE0i vi\u1EBFt ho\u1EB7c h\u1ECDc li\u1EC7u t\u01B0\u01A1ng x\u1EE9ng v\u1EDBi t\u1EEB kh\xF3a "',
          searchQuery,
          '". H\xE3y th\u1EED t\u1EEB kh\xF3a kh\xE1c nh\u01B0 "v\u1EADt ch\u1EA5t", "quy lu\u1EADt l\u01B0\u1EE3ng", "Marx".'
        ] }) })
      ] }) }),
      view === "home" && !selectedStationId && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("section", { className: "relative min-h-[620px] flex items-center justify-center hero-pattern px-4 md:px-12 py-16 md:py-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-sans font-semibold text-xs tracking-wider uppercase animate-pulse", children: "N\u1EC1n t\u1EA3ng h\u1ECDc t\u1EADp s\u1ED1 h\xF3a" }),
            /* @__PURE__ */ jsxs("h1", { className: "font-serif text-[38px] md:text-[54px] text-primary font-bold leading-tight tracking-tight", children: [
              "Tr\u1EA1m H\u1ECDc Tri\u1EBFt h\u1ECDc ",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-amber-600 italic font-medium", children: "M\xE1c - L\xEAnin" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-sans text-neutral-600 text-sm md:text-base leading-relaxed max-w-lg", children: "H\u1EC7 th\u1ED1ng l\u1ED9 tr\xECnh h\u1ECDc t\u1EADp chuy\xEAn s\xE2u, \u0111\u01B0\u1EE3c chia th\xE0nh c\xE1c ch\u1EB7ng \u0111\u01B0\u1EDDng ri\xEAng bi\u1EC7t gi\xFAp b\u1EA1n n\u1EAFm v\u1EEFng t\u01B0 duy bi\u1EC7n ch\u1EE9ng v\xE0 th\u1EBF gi\u1EDBi quan khoa h\u1ECDc ch\xE2n ch\xEDnh." }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 pt-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleSelectStation(1),
                  className: "bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-sans font-bold text-sm md:text-base hover:shadow-lg hover:translate-y-[-2px] transition-all cursor-pointer",
                  children: "B\u1EAFt \u0111\u1EA7u h\u1ECDc ngay"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowIntroModal(true),
                  className: "flex items-center gap-2 text-primary font-sans font-semibold text-sm px-6 py-4 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(PlayCircle, { className: "w-5 h-5 text-primary" }),
                    "Xem gi\u1EDBi thi\u1EC7u"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative pr-4 pb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "relative z-10 rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 max-w-md mx-auto w-full h-[470px] bg-neutral-900 border border-neutral-800 flex items-center justify-center select-none", children: /* @__PURE__ */ jsx(
              "img",
              {
                alt: "\u1EA2nh h\u1ECDc thu\u1EADt tri\u1EBFt h\u1ECDc",
                className: "w-full h-full object-cover rounded-2xl",
                src: anhHocThuat
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-6 left-2 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 flex items-center gap-3.5 border border-neutral-100 max-w-[240px] z-20 hover:scale-105 transition-transform", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container flex-shrink-0 font-bold", children: "\u{1F3A8}" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-sans font-bold text-xs text-primary leading-tight", children: "Ti\u1EBFn tr\xECnh h\u1ECDc" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-500 font-medium", children: "L\u1ED9 tr\xECnh 4 tr\u1EA1m ki\u1EBFn th\u1EE9c" }),
                /* @__PURE__ */ jsx("div", { className: "w-24 bg-neutral-100 h-1.5 rounded-full mt-1.5 overflow-hidden", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "bg-amber-550 h-full transition-all",
                    style: {
                      width: `${Math.min(100, totalCompletedLessons / 6 * 100)}%`,
                      backgroundColor: "#bf9220"
                    }
                  }
                ) })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("section", { className: "py-16 bg-primary text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[52px] font-serif font-bold text-amber-300 leading-none mb-2", children: "4" }),
            /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-sm tracking-wider uppercase opacity-90", children: "Tr\u1EA1m Ki\u1EBFn Th\u1EE9c" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300 mt-2", children: "H\u1ECDc theo l\u1ED9 tr\xECnh tu\u1EA7n t\u1EF1 b\xE0i b\u1EA3n t\u1EEB g\u1ED1c t\u1EDBi ng\u1ECDn" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[52px] font-serif font-bold text-amber-300 leading-none mb-2", children: "40" }),
            /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-sm tracking-wider uppercase opacity-90", children: "C\xE2u Tr\u1EAFc Nghi\u1EC7m" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300 mt-2", children: "\u0110\u01B0\u1EE3c thi\u1EBFt k\u1EBF s\xE2u s\u1EAFc k\xE8m l\u1EDDi gi\u1EA3i th\xEDch kh\xE1ch quan chi ti\u1EBFt" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[52px] font-serif font-bold text-amber-300 leading-none mb-2", children: "1" }),
            /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-sm tracking-wider uppercase opacity-90", children: "Lu\u1ED3ng H\u1ECDc Duy Nh\u1EA5t" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300 mt-2", children: "T\u1ED1i \u01B0u h\xF3a kh\xF4ng gian hi\u1EC3n th\u1ECB, t\u0103ng t\u1ED1i \u0111a s\u1EF1 t\u1EADp trung cao \u0111\u1ED9" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("section", { className: "py-24 px-4 md:px-12 max-w-7xl mx-auto w-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl md:text-4px text-primary font-bold mb-4", children: "L\u1ED9 Tr\xECnh Tri Th\u1EE9c" }),
              /* @__PURE__ */ jsx("p", { className: "font-sans text-neutral-600 text-xs md:text-sm leading-relaxed", children: "N\u1ED9i dung tri\u1EBFt h\u1ECDc ch\xEDnh th\u1ED1ng \u0111\u01B0\u1EE3c k\u1EBFt c\u1EA5u th\xE0nh 4 tr\u1EA1m h\u1ECDc ri\xEAng bi\u1EC7t gi\xFAp b\u1EA1n c\u1ECD x\xE1t ki\u1EBFn th\u1EE9c t\u1EEB n\u1EC1n t\u1EA3ng \u0111\u1EA7u ti\xEAn c\u1EE7a tri\u1EBFt l\xFD cho \u0111\u1EBFn c\xE1c v\u1EADn \u0111\u1ED9ng x\xE3 h\u1ED9i ph\u1EE9c t\u1EA1p." })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setView("path"),
                className: "flex items-center gap-1 text-sm font-sans font-bold text-primary border-b-2 border-amber-400 pb-1.5 hover:text-amber-600 transition-colors cursor-pointer",
                children: [
                  "Xem l\u1ED9 tr\xECnh tr\u1EF1c quan",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6", children: STATIONS_DATA.map((station) => {
            const score = progress.quizScores[station.id];
            const completed = progress.completedQuizzes.includes(station.id);
            const unlocked = isStationUnlocked(station.id);
            return /* @__PURE__ */ jsxs(
              motion.div,
              {
                onClick: () => handleSelectStation(station.id),
                whileHover: unlocked ? { y: -8, scale: 1.025, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {},
                whileTap: unlocked ? { scale: 0.98 } : {},
                transition: { type: "spring", stiffness: 350, damping: 20 },
                className: `glass-card p-6 rounded-2xl flex flex-col justify-between h-full cursor-pointer transition-all group duration-300 relative ${unlocked ? "" : "opacity-65 bg-neutral-100/60 grayscale border-dashed"}`,
                children: [
                  !unlocked && /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-neutral-200 text-neutral-600 p-1.5 rounded-full z-10 text-xs", children: "\u{1F512}" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-6 transition-colors duration-300 ${unlocked ? "bg-neutral-100 group-hover:bg-primary group-hover:text-white" : "bg-neutral-200 text-neutral-400"}`, children: getIcon(station.iconName, "w-6 h-6") }),
                    /* @__PURE__ */ jsxs("h3", { className: "font-serif text-lg font-bold text-primary mb-3 flex items-center gap-1.5", children: [
                      "Tr\u1EA1m ",
                      station.id,
                      !unlocked && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-sans text-neutral-400 font-normal", children: "(\u0110ang kh\xF3a)" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "font-sans text-xs text-neutral-500 leading-relaxed min-h-[72px]", children: station.description })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-3", children: unlocked ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400 font-bold uppercase tracking-wider", children: "L\u1EF1a ch\u1ECDn:" }),
                      completed ? /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold", children: [
                        "\u0110\xE3 \u0111\u1EA1t: ",
                        score,
                        "/10"
                      ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-amber-550 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold", children: "Y\xEAu c\u1EA7u 10/10" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2", children: [
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            handleSelectStation(station.id, false);
                          },
                          className: "px-3 py-2 bg-neutral-50 hover:bg-neutral-205 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
                          children: [
                            /* @__PURE__ */ jsx(BookOpen, { className: "w-3.5 h-3.5 text-neutral-500" }),
                            " L\xFD thuy\u1EBFt"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            handleSelectStation(station.id, true);
                          },
                          className: "px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm",
                          children: [
                            /* @__PURE__ */ jsx(Award, { className: "w-3.5 h-3.5 text-amber-200" }),
                            " L\xE0m b\xE0i t\u1EADp"
                          ]
                        }
                      )
                    ] })
                  ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-1 bg-neutral-50 border border-neutral-200/50 rounded-xl text-[11px] font-medium text-neutral-400 flex items-center justify-center gap-1", children: "\u{1F512} Tr\u1EA1m \u0111ang b\u1ECB kh\xF3a" }) })
                ]
              },
              station.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx("section", { className: "bg-neutral-100/60 border-y py-16 px-4 md:px-12 w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold text-primary", children: "T\xECnh tr\u1EA1ng r\xE8n luy\u1EC7n h\u1ECDc thu\u1EADt" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1 max-w-md", children: "T\xECm hi\u1EC3u l\xFD lu\u1EADn chuy\xEAn s\xE2u v\xE0 v\u01B0\u1EE3t qua c\u1EA3 4 b\xE0i tr\u1EAFc nghi\u1EC7m th\u1EF1c nghi\u1EC7m v\u1EDBi \u0111i\u1EC3m 10/10 tuy\u1EC7t \u0111\u1ED1i \u0111\u1EC3 nh\u1EADn ngay B\u1EB1ng Ch\u1EE9ng Nh\u1EADn danh h\u1EA1nh t\u1EEB Tr\u1EA1m H\u1ECDc Tri\u1EBFt H\u1ECDc." }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6 mt-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-lg border text-center shadow-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "block text-xl font-bold text-primary", children: [
                  unlockedStationsCount,
                  "/4"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400", children: "Tr\u1EA1m \u0111\xE3 m\u1EDF kh\xF3a" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-lg border text-center shadow-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "block text-xl font-bold text-green-700", children: [
                  totalCompletedQuizzes,
                  "/4"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400", children: "Tr\u1EA1m \u0111\xE3 v\u01B0\u1EE3t qua (10/10)" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-lg border text-center shadow-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "block text-xl font-bold text-primary", children: totalCompletedQuizzes > 0 ? "100%" : "0%" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400", children: "\u0110\u1ED9 chu\u1EA9n x\xE1c c\xE1 nh\xE2n" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center bg-white p-6 rounded-2xl border shadow-md w-full max-w-sm text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold mb-3", children: "\u{1F451}" }),
            /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-sm text-primary", children: "Ch\u1EE9ng nh\u1EADn Tri\u1EBFt h\u1ECDc c\u1ED5 \u0111i\u1EC3n" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-400 mt-1 max-w-xs leading-normal", children: "Sau khi ho\xE0n th\xE0nh t\u1EA5t c\u1EA3 c\xE1c n\u1EA5c thang nh\u1EADn th\u1EE9c, b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c h\u1EC7 th\u1ED1ng c\u1EA5p Ch\u1EE9ng ch\u1EC9 s\u1ED1 h\xF3a ch\xEDnh quy c\u1EF1c k\u1EF3 \u0111\u1EB9p m\u1EAFt." }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setView("certificate");
                },
                className: "mt-4 bg-primary text-white w-full py-2.5 rounded-xl text-xs font-bold hover:shadow-md hover:bg-opacity-95 transition-all text-center",
                children: "Xem & In ch\u1EE9ng nh\u1EADn c\u1EE7a b\u1EA1n"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(PhilosophersGallery, { onLearnStation: (id) => handleSelectStation(id) }),
        /* @__PURE__ */ jsx("section", { className: "py-24 bg-neutral-100 px-4 md:px-12 w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto border-l-4 border-primary pl-8 md:pl-16 space-y-6", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-5xl font-serif text-amber-500 opacity-40 leading-none", children: "\u201C" }),
          /* @__PURE__ */ jsx("blockquote", { className: "font-serif italic text-2xl md:text-3xl text-primary leading-relaxed", children: '"C\xE1c nh\xE0 tri\u1EBFt h\u1ECDc \u0111\xE3 ch\u1EC9 gi\u1EA3i th\xEDch th\u1EBF gi\u1EDBi b\u1EB1ng nhi\u1EC1u c\xE1ch kh\xE1c nhau, song v\u1EA5n \u0111\u1EC1 l\xE0 c\u1EA3i t\u1EA1o th\u1EBF gi\u1EDBi."' }),
          /* @__PURE__ */ jsx("cite", { className: "block font-sans font-bold text-xs uppercase tracking-widest text-neutral-500 not-italic", children: "\u2014 KARL MARX" })
        ] }) })
      ] }),
      view === "station" && selectedStationId && /* @__PURE__ */ jsx("div", { className: "bg-white min-h-[600px] py-10 px-4 md:px-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 mb-8 gap-4", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                safeNavigate(() => {
                  setView("home");
                });
              },
              className: "flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
                " Quay l\u1EA1i trang ch\u1EE7"
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 items-center", children: STATIONS_DATA.map((st) => {
            const unlocked = isStationUnlocked(st.id);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  if (isQuizActive && !quizSubmitted) {
                    requestConfirm(
                      "Chuy\u1EC3n tr\u1EA1m h\u1ECDc",
                      "B\u1EA1n \u0111ang l\xE0m d\u1EDF b\xE0i t\u1EADp \xF4n t\u1EADp, chuy\u1EC3n sang tr\u1EA1m h\u1ECDc kh\xE1c s\u1EBD l\xE0m h\u1EE7y l\u01B0\u1EE3t thi v\xE0 \u0111i\u1EC3m r\xE8n luy\u1EC7n hi\u1EC7n t\u1EA1i. B\u1EA1n c\xF3 ch\u1EAFc ch\u1EAFn mu\u1ED1n chuy\u1EC3n tr\u1EA1m kh\xF4ng?",
                      () => {
                        handleSelectStation(st.id);
                      }
                    );
                    return;
                  }
                  handleSelectStation(st.id);
                },
                className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${selectedStationId === st.id ? "bg-primary text-white" : unlocked ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-200" : "bg-neutral-100 text-neutral-350 cursor-not-allowed opacity-50"}`,
                children: [
                  !unlocked && "\u{1F512}",
                  " Tr\u1EA1m ",
                  st.id
                ]
              },
              st.id
            );
          }) })
        ] }),
        (() => {
          const station = STATIONS_DATA.find((s) => s.id === selectedStationId);
          if (!station) return /* @__PURE__ */ jsx("p", { children: "Kh\xF4ng t\xECm th\u1EA5y n\u1ED9i dung tr\u1EA1m n\xE0y" });
          const activeLesson = station.lessons[activeLessonIndex] || station.lessons[0];
          return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex border-b border-neutral-200", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    if (isQuizActive && !quizSubmitted) {
                      requestConfirm(
                        "Hu\u1EF7 l\u01B0\u1EE3t thi",
                        "B\u1EA1n \u0111ang l\xE0m d\u1EDF b\xE0i thi, chuy\u1EC3n sang \u0111\u1ECDc l\xFD thuy\u1EBFt s\u1EBD \u0111\u1EB7t l\u1EA1i b\xE0i thi n\xE0y. H\xE3y x\xE1c nh\u1EADn h\u1EE7y l\u01B0\u1EE3t thi hi\u1EC7n t\u1EA1i?",
                        () => {
                          setIsQuizActive(false);
                          handleResetQuiz();
                        }
                      );
                      return;
                    }
                    setIsQuizActive(false);
                    handleResetQuiz();
                  },
                  className: `flex items-center gap-2 px-6 py-3 border-b-2 font-serif text-xs md:text-sm font-bold transition-all cursor-pointer ${!isQuizActive ? "border-primary text-primary bg-neutral-50/50" : "border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300"}`,
                  children: [
                    /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-primary" }),
                    "\u{1F4D6} 1. H\u1ECDc L\xFD Thuy\u1EBFt"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    if (!isQuizActive) {
                      setIsQuizActive(true);
                      handleResetQuiz();
                    }
                  },
                  className: `flex items-center gap-2 px-6 py-3 border-b-2 font-serif text-xs md:text-sm font-bold transition-all relative cursor-pointer ${isQuizActive ? "border-amber-600 text-amber-900 bg-amber-50/20" : "border-transparent text-neutral-500 hover:text-amber-600 hover:border-amber-300"}`,
                  children: [
                    /* @__PURE__ */ jsx(Award, { className: "w-4 h-4 text-amber-600" }),
                    "\u{1F4DD} 2. L\xE0m B\xE0i T\u1EADp \xD4n T\u1EADp",
                    progress.completedQuizzes.includes(station.id) && /* @__PURE__ */ jsxs("span", { className: "absolute -top-1 -right-1 flex h-2 w-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" }),
                      /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
                    ] })
                  ]
                }
              )
            ] }),
            !isQuizActive ? (
              /* THEORY MODE: 2 columns layout */
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start", children: [
                /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 space-y-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 p-4 rounded-2xl border space-y-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-amber-550 text-xl font-bold bg-amber-100 p-1 rounded", children: "\u{1F393}" }),
                      /* @__PURE__ */ jsx("h4", { className: "font-sans font-bold text-xs uppercase tracking-wider text-neutral-400", children: "H\u1EA1ng m\u1EE5c b\xE0i h\u1ECDc" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-primary uppercase mt-1 leading-tight", children: station.title }),
                    /* @__PURE__ */ jsx("div", { className: "space-y-2 pt-2", children: station.lessons.map((les, index) => {
                      return /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: () => {
                            setActiveLessonIndex(index);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          },
                          className: `w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-1.5 border cursor-pointer ${activeLessonIndex === index ? "bg-white border-primary/40 font-bold text-primary shadow-sm" : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"}`,
                          children: [
                            /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" }),
                            /* @__PURE__ */ jsx("span", { children: les.title })
                          ]
                        },
                        les.id
                      );
                    }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-amber-800", children: [
                      /* @__PURE__ */ jsx(Award, { className: "w-5 h-5 flex-shrink-0" }),
                      /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-sm", children: "B\xE0i thi tr\u1EAFc nghi\u1EC7m" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-amber-700 mt-1 leading-normal", children: "H\xE3y h\u1ECDc l\xFD thuy\u1EBFt k\u1EF9 r\u1ED3i thi th\u1EED nghi\u1EC7m \u0111\u1EE3t tr\u1EAFc nghi\u1EC7m 10 c\xE2u ch\u1EA5t l\u01B0\u1EE3ng cao \u0111\u1EC3 ki\u1EC3m ch\u1EE9ng m\u1EE9c \u0111\u1ED9 hi\u1EC3u s\xE2u ki\u1EBFn th\u1EE9c c\u1EE7a m\xECnh nh\xE9!" }),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setIsQuizActive(true);
                          handleResetQuiz();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        },
                        className: "mt-3 inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all text-left w-full justify-center cursor-pointer",
                        children: [
                          "Thi tr\u1EAFc nghi\u1EC7m ngay ",
                          /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" })
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "lg:col-span-9 space-y-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50/60 p-6 md:p-10 rounded-3xl border", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", children: activeLesson.subtitle }),
                    /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl md:text-3xl font-bold text-primary mt-2", children: activeLesson.title }),
                    /* @__PURE__ */ jsxs("p", { className: "font-sans italic text-neutral-500 text-xs md:text-sm pt-1 pb-4 border-b border-neutral-200/80", children: [
                      "T\xF3m l\u01B0\u1EE3c b\xE0i: ",
                      activeLesson.summary
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-6 text-neutral-700 leading-relaxed text-sm", children: activeLesson.sections.map((sec, secIdx) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-serif text-base md:text-lg font-bold text-primary pt-3", children: sec.heading }),
                    sec.paragraphs.map((p, pIdx) => /* @__PURE__ */ jsx("p", { className: "font-sans leading-relaxed text-xs md:text-sm", children: p }, pIdx))
                  ] }, secIdx)) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/20 p-5 rounded-2xl border border-amber-200/50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-xs text-amber-900 leading-tight", children: "\u0110\xE3 s\u1EB5n s\xE0ng ki\u1EC3m tra ki\u1EBFn th\u1EE9c?" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-500", children: "Khi b\u1EA5m thi tr\u1EAFc nghi\u1EC7m, h\u1EC7 th\u1ED1ng s\u1EBD chuy\u1EC3n sang giao di\u1EC7n \xF4n luy\u1EC7n ri\xEAng bi\u1EC7t t\u1EADp trung cao \u0111\u1EC3 b\u1EA3o \u0111\u1EA3m kh\xE1ch quan h\u1ECDc thu\u1EADt." })
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setIsQuizActive(true);
                          handleResetQuiz();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        },
                        className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-neutral-900 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer",
                        children: [
                          "Kh\u1EDFi \u0111\u1ED9ng Tr\u1EAFc nghi\u1EC7m Tr\u1EA1m ",
                          selectedStationId,
                          " ",
                          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1 inline-block" })
                        ]
                      }
                    )
                  ] })
                ] }) })
              ] })
            ) : (
              /* EXCLUSIVE QUIZ PAGE MODE: 1 full-width focused layout */
              /* @__PURE__ */ jsxs("div", { className: "space-y-8 max-w-4xl mx-auto", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-amber-900 text-white p-6 rounded-2xl border border-amber-805 border-amber-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-xs bg-amber-950/60 text-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest", children: [
                        "TR\u1EA0M ",
                        selectedStationId
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-amber-200 font-bold", children: "KH\xD4NG GIAN KI\u1EC2M TRA" })
                    ] }),
                    /* @__PURE__ */ jsx("h2", { className: "font-serif text-lg font-bold mt-1.5 text-amber-100", children: "\u0110ang ki\u1EC3m tra l\xFD lu\u1EADn chu\u1EA9n tr\u1ECB (10 c\xE2u)" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-200/85 mt-1 max-w-2xl leading-relaxed", children: "B\u1EA1n \u0111\xE3 b\u01B0\u1EDBc v\xE0o kh\xF4ng gian thi tr\u1EAFc nghi\u1EC7m \u0111\u1ED9c l\u1EADp chuy\xEAn bi\u1EC7t. To\xE0n b\u1ED9 t\xE0i li\u1EC7u b\xE0i h\u1ECDc v\xE0 c\xE2y m\u1EE5c l\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c \u1EA9n \u0111i. H\xE3y v\u1EADn d\u1EE5ng tr\xED tu\u1EC7 c\u1EE7a m\xECnh \u0111\u1EC3 \u0111\u1EA1t \u0111i\u1EC3m tuy\u1EC7t \u0111\u1ED1i 10/10 gi\xFAp m\u1EDF kh\xF3a tr\u1EA1m tri th\u1EE9c ti\u1EBFp theo!" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        if (!quizSubmitted) {
                          requestConfirm(
                            "X\xE1c nh\u1EADn tho\xE1t b\xE0i thi",
                            "B\u1EA1n \u0111ang l\xE0m d\u1EDF b\xE0i thi, tr\u1EDF v\u1EC1 trang l\xFD thuy\u1EBFt s\u1EBD l\xE0m h\u1EE7y l\u01B0\u1EE3t thi v\xE0 \u0111i\u1EC3m r\xE8n luy\u1EC7n hi\u1EC7n t\u1EA1i. B\u1EA1n c\xF3 ch\u1EAFc ch\u1EAFn mu\u1ED1n tho\xE1t?",
                            () => {
                              setIsQuizActive(false);
                              handleResetQuiz();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          );
                        } else {
                          setIsQuizActive(false);
                          handleResetQuiz();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      },
                      className: "px-4 py-2 bg-amber-950 hover:bg-neutral-800 font-sans border border-neutral-700/30 rounded-xl text-xs font-bold text-amber-100 hover:text-white transition-all cursor-pointer whitespace-nowrap",
                      children: "\u2190 Quay l\u1EA1i h\u1ECDc l\xFD thuy\u1EBFt"
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { id: "quiz-section", className: "bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "border-b pb-4 flex justify-between items-center flex-wrap gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("h3", { className: "font-serif text-lg md:text-xl font-bold text-primary flex items-center gap-1.5", children: [
                        "\u{1F4DD} Tr\u1EAFc Nghi\u1EC7m \xD4n T\u1EADp: Tr\u1EA1m ",
                        selectedStationId
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-0.5", children: "B\u1ED9 10 c\xE2u h\u1ECFi l\xFD lu\u1EADn chuy\xEAn s\xE2u. Tr\u1EA3 l\u1EDDi xong c\xF3 hi\u1EC3n th\u1ECB gi\u1EA3i th\xEDch c\u1EE5 th\u1EC3 tri\u1EBFt h\u1ECDc." })
                    ] }),
                    quizSubmitted && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: handleResetQuiz,
                        className: "text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                          " L\xE0m l\u1EA1i b\xE0i thi"
                        ]
                      }
                    )
                  ] }),
                  (() => {
                    const questions = station.questions;
                    const currentQuestion = questions[activeQuestionIndex];
                    if (!currentQuestion) return null;
                    return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start", children: [
                      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
                        (() => {
                          const answeredQuestions = questions.filter((q) => quizAnswers[q.id] !== void 0);
                          const answeredCount = answeredQuestions.length;
                          const progressPercent = Math.round(answeredCount / questions.length * 100);
                          return /* @__PURE__ */ jsxs(Fragment, { children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-neutral-400", children: [
                              /* @__PURE__ */ jsxs("span", { children: [
                                "\u0110ang xem c\xE2u h\u1ECFi ",
                                /* @__PURE__ */ jsx("strong", { children: activeQuestionIndex + 1 }),
                                " trong s\u1ED1 ",
                                questions.length,
                                " c\xE2u"
                              ] }),
                              /* @__PURE__ */ jsxs("span", { children: [
                                "\u0110\xE3 tr\u1EA3 l\u1EDDi: ",
                                answeredCount,
                                " / ",
                                questions.length,
                                " (",
                                progressPercent,
                                "%)"
                              ] })
                            ] }),
                            /* @__PURE__ */ jsx("div", { className: "w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                              "div",
                              {
                                className: "bg-amber-500 h-full transition-all duration-300",
                                style: { width: `${progressPercent}%` }
                              }
                            ) })
                          ] });
                        })(),
                        /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-start gap-4", children: [
                          /* @__PURE__ */ jsx("p", { className: "font-sans font-bold text-sm text-primary leading-relaxed flex-1", children: currentQuestion.question }),
                          /* @__PURE__ */ jsxs(
                            "button",
                            {
                              onClick: () => toggleMarkQuestion(currentQuestion.id),
                              className: `p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 focus:outline-none text-[10px] uppercase tracking-wider font-bold ${markedQuestions[currentQuestion.id] ? "bg-red-50 border-red-200 text-red-650 hover:bg-neutral-250 hover:bg-red-100" : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-650 hover:bg-neutral-50"}`,
                              title: "\u0110\xE1nh d\u1EA5u c\xE2u h\u1ECFi \u0111\u1EC3 xem l\u1EA1i sau",
                              children: [
                                /* @__PURE__ */ jsx(Bookmark, { className: `w-4 h-4 ${markedQuestions[currentQuestion.id] ? "fill-red-500 text-red-500" : ""}` }),
                                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: markedQuestions[currentQuestion.id] ? "\u0110\xE3 \u0111\xE1nh d\u1EA5u" : "\u0110\xE1nh d\u1EA5u" })
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: currentQuestion.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[currentQuestion.id] === optIdx;
                          const isCorrect = currentQuestion.correctIndex === optIdx;
                          const hasSelectedCurrentQuestion = quizAnswers[currentQuestion.id] !== void 0;
                          let btnStyle = "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50";
                          if (hasSelectedCurrentQuestion) {
                            if (isSelected) {
                              if (quizSubmitted) {
                                btnStyle = isCorrect ? "bg-green-100 border-green-500 text-green-905 text-green-900 font-semibold" : "bg-red-100 border-red-500 text-red-950";
                              } else {
                                btnStyle = "bg-amber-100 border-amber-500 text-amber-900 font-semibold";
                              }
                            } else {
                              if (quizSubmitted && isCorrect) {
                                btnStyle = "bg-green-100 border-green-500 text-green-905 text-green-900 font-semibold";
                              }
                            }
                          }
                          return /* @__PURE__ */ jsxs(
                            motion.button,
                            {
                              onClick: () => handleAnswerQuiz(currentQuestion.id, optIdx),
                              disabled: quizSubmitted,
                              whileHover: !quizSubmitted ? { scale: 1.01, x: 4, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" } : {},
                              whileTap: !quizSubmitted ? { scale: 0.99 } : {},
                              className: `w-full text-left px-5 py-3.5 rounded-xl text-xs sm:text-sm border transition-all cursor-pointer flex gap-3 ${btnStyle}`,
                              children: [
                                /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs flex-shrink-0 text-neutral-500", children: String.fromCharCode(65 + optIdx) }),
                                /* @__PURE__ */ jsx("span", { children: opt })
                              ]
                            },
                            optIdx
                          );
                        }) }),
                        quizSubmitted && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs text-amber-990 text-amber-900 space-y-1.5", children: [
                          /* @__PURE__ */ jsx("p", { className: "font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wider text-[10px]", children: "\u{1F4A1} GI\u1EA2I TH\xCDCH CHI TI\u1EBET" }),
                          /* @__PURE__ */ jsx("p", { className: "font-sans leading-relaxed text-xs", children: currentQuestion.explanation })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-4 border-t gap-3 flex-wrap", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: handlePrevQuestion,
                                disabled: activeQuestionIndex === 0,
                                className: "p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent",
                                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 text-primary" })
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: () => handleNextQuestion(questions.length),
                                disabled: activeQuestionIndex === questions.length - 1,
                                className: "p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent",
                                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-primary" })
                              }
                            )
                          ] }),
                          !quizSubmitted ? /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => {
                                const unanswered = questions.filter((q) => quizAnswers[q.id] === void 0).length;
                                if (unanswered > 0) {
                                  requestConfirm(
                                    "N\u1ED9p b\xE0i ch\u01B0a ho\xE0n th\xE0nh",
                                    `B\u1EA1n c\xF2n l\u1EA1i ${unanswered} c\xE2u ch\u01B0a tr\u1EA3 l\u1EDDi. B\u1EA1n c\xF3 ch\u1EAFc ch\u1EAFn mu\u1ED1n n\u1ED9p b\xE0i thi ngay kh\xF4ng?`,
                                    () => {
                                      handleSubmitQuiz(selectedStationId, questions.length);
                                    }
                                  );
                                } else {
                                  handleSubmitQuiz(selectedStationId, questions.length);
                                }
                              },
                              className: "bg-amber-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-all cursor-pointer shadow-sm",
                              children: "N\u1ED9p B\xE0i Thi \xD4n T\u1EADp"
                            }
                          ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-green-600 font-bold", children: "\u0110\xE3 n\u1ED9p b\xE0i th\xE0nh c\xF4ng" })
                        ] }),
                        quizSubmitted && /* @__PURE__ */ jsxs("div", { className: "bg-neutral-900 text-white p-6 rounded-2xl border text-center space-y-3", children: [
                          /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-lg text-amber-300", children: "K\u1EBFt qu\u1EA3 b\xE0i thi \xF4n t\u1EADp" }),
                          /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
                            "B\u1EA1n \u0111\xE3 tr\u1EA3 l\u1EDDi \u0111\xFAng",
                            " ",
                            /* @__PURE__ */ jsx("strong", { className: "text-xl text-amber-300", children: progress.quizScores[selectedStationId] || 0 }),
                            " ",
                            "tr\xEAn ",
                            questions.length,
                            " c\xE2u h\u1ECFi."
                          ] }),
                          progress.completedQuizzes.includes(selectedStationId) ? /* @__PURE__ */ jsx("div", { className: "bg-green-950/40 text-green-300 border border-green-800 p-3 rounded-xl text-xs font-bold", children: "\u{1F973} Tuy\u1EC7t v\u1EDDi! B\u1EA1n \u0111\u1EA1t \u0111i\u1EC3m tuy\u1EC7t \u0111\u1ED1i 10/10. Tr\u1EA1m k\u1EBF ti\u1EBFp \u0111\xE3 \u0111\u01B0\u1EE3c m\u1EDF kh\xF3a th\xE0nh c\xF4ng!" }) : /* @__PURE__ */ jsxs("div", { className: "bg-amber-950/40 text-amber-305 text-amber-300 border border-amber-800 p-3 rounded-xl text-xs", children: [
                            "\u26A0\uFE0F B\u1EA1n ch\u01B0a \u0111\u1EA1t \u0111i\u1EC3m tuy\u1EC7t \u0111\u1ED1i 10/10 c\u1EA7n thi\u1EBFt \u0111\u1EC3 m\u1EDF kh\xF3a Tr\u1EA1m ti\u1EBFp theo. Vui l\xF2ng b\u1EA5m ",
                            /* @__PURE__ */ jsx("strong", { children: "L\xE0m l\u1EA1i b\xE0i thi" }),
                            " ph\xEDa tr\xEAn \u0111\u1EC3 thi l\u1EA1i nh\xE9!"
                          ] }),
                          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed", children: "Gi\u1EA3i th\xEDch chi ti\u1EBFt c\u1EE7a t\u1EEBng c\xE2u \u0111\xE3 xu\u1EA5t hi\u1EC7n b\xEAn d\u01B0\u1EDBi \u0111\xE1p \xE1n \u0111\xE3 ch\u1ECDn. B\u1EA1n c\xF3 th\u1EC3 b\u1EA5m n\xFAt m\u0169i t\xEAn tr\xE1i/ph\u1EA3i \u0111\u1EC3 xem l\u1EA1i to\xE0n b\u1ED9 \u0111\xE1p \xE1n v\xE0 r\xE8n luy\u1EC7n." })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 bg-neutral-50/55 p-5 rounded-2xl border border-neutral-200/80 space-y-4", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-xs uppercase tracking-wider text-neutral-700", children: "B\u1EA3ng ch\u1ECDn c\xE2u h\u1ECFi" }),
                          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-neutral-400 font-sans font-bold", children: [
                            questions.length,
                            " C\xC2U H\u1ECEI"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-1 pb-3 border-b border-neutral-200/60 text-center", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100", children: [
                            /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-neutral-200 border border-neutral-300 mb-1" }),
                            /* @__PURE__ */ jsx("span", { className: "text-[9px] text-neutral-500 font-medium", children: "Ch\u01B0a l\xE0m" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100 pb-1.5", children: [
                            /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-green-600 mb-1" }),
                            /* @__PURE__ */ jsx("span", { className: "text-[9px] text-green-750 text-green-700 font-semibold font-medium", children: "\u0110\xE3 tr\u1EA3 l\u1EDDi" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100", children: [
                            /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-red-500 mb-1 animate-pulse" }),
                            /* @__PURE__ */ jsx("span", { className: "text-[9px] text-red-650 text-red-600 font-semibold font-medium", children: "\u0110\xE1nh d\u1EA5u" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: questions.map((q, idx) => {
                          const isCurrent = idx === activeQuestionIndex;
                          const isMarked = markedQuestions[q.id];
                          const isAnswered = quizAnswers[q.id] !== void 0;
                          let pillBg = "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200/80";
                          if (isMarked) {
                            pillBg = "bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-sm font-bold";
                          } else if (isAnswered) {
                            pillBg = "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-sm font-bold";
                          }
                          return /* @__PURE__ */ jsxs(
                            motion.button,
                            {
                              onClick: () => setActiveQuestionIndex(idx),
                              whileHover: { scale: 1.1, y: -2 },
                              whileTap: { scale: 0.9 },
                              transition: { type: "spring", stiffness: 400, damping: 15 },
                              className: `relative h-11 rounded-xl text-center font-sans text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${pillBg} ${isCurrent ? "ring-2 ring-amber-500 ring-offset-2 scale-105" : "hover:scale-102"}`,
                              children: [
                                /* @__PURE__ */ jsx("span", { children: idx + 1 }),
                                isMarked && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-650 bg-red-600 border border-white" })
                              ]
                            },
                            q.id
                          );
                        }) }),
                        /* @__PURE__ */ jsxs("div", { className: "pt-2 relative", children: [
                          !currentDisplayName && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600 flex items-center gap-1 font-bold absolute right-0 top-0 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 pointer-events-none", children: "C\u1EA7n thi\u1EBFt l\u1EADp danh t\xEDnh!" }),
                          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-neutral-400 text-center leading-relaxed italic", children: "* B\u1EA5m v\xE0o t\u1EEBng \xF4 s\u1ED1 \u0111\u1EC3 \u0111\u1EBFn nhanh c\xE2u h\u1ECFi t\u01B0\u01A1ng \u1EE9ng. B\u1EA1n c\xF3 th\u1EC3 \u0111\xE1nh d\u1EA5u c\xE2u c\u1EA7n ch\xFA \xFD \u0111\u1EC3 xem l\u1EA1i tr\u01B0\u1EDBc khi n\u1ED9p." })
                        ] })
                      ] })
                    ] });
                  })()
                ] })
              ] })
            )
          ] });
        })()
      ] }) }),
      view === "path" && /* @__PURE__ */ jsx("div", { className: "bg-neutral-50 py-12 px-4 md:px-12 min-h-[600px]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl font-bold text-primary", children: "S\u01A1 \u0110\u1ED3 Di Tr\xECnh Tri Th\u1EE9c Tri\u1EBFt H\u1ECDc" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 max-w-lg mx-auto", children: "Theo d\xF5i ch\u1EB7ng \u0111\u01B0\u1EDDng t\u1EF1 ti\u1EBFn h\xF3a h\xE0ng ng\xE0n n\u0103m c\u1EE7a tr\xED tu\u1EC7 con ng\u01B0\u1EDDi, gi\u1EA3i ph\xF3ng t\u01B0 duy t\u1EEB ni\u1EC1m tin th\u1EA7n tho\u1EA1i s\u01A1 s\u01A1 \u0111\u1EBFn duy v\u1EADt l\u1ECBch s\u1EED m\xE1c-x\xEDt th\u1EF1c ti\u1EC5n t\u1ED1i cao." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative border-l-2 border-primary/20 pl-8 ml-4 md:ml-12 space-y-10 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600 font-bold tracking-widest uppercase block", children: "Th\u1EBF k\u1EF7 VIII - VI TCN" }),
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-base font-bold text-primary mt-1", children: "Giai \u0111o\u1EA1n Mythos sang Logos" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-2 leading-relaxed", children: "Con ng\u01B0\u1EDDi ti\u1EBFn t\u1EEB t\u01B0 duy g\xE1n gh\xE9p thi\xEAn tai s\u1EA5m ch\u1EDBp cho c\xE1c ch\xFAa t\u1EC3 th\u1EA7n ph\xE1i, sang vi\u1EC7c c\u1ED1 g\u1EAFng d\xF9ng l\xFD tr\xED logic \u0111\u1EC3 kh\xE1m ph\xE1 ra ch\u1EA5t g\u1ED1c (Arch\xE9) c\u1EE7a v\u1EA1n v\u1EADt nh\u01B0 Thales, Heraclitus." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600 font-bold tracking-widest uppercase block", children: "C\u1ED5 \u0111\u1EA1i Hy L\u1EA1p ki\u1EC7t xu\u1EA5t" }),
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-base font-bold text-primary mt-1", children: "\u0110\u1EA5u tranh gi\u1EEFa Ph\xE1i Democritus v\xE0 Plato" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-2 leading-relaxed", children: "S\u1EF1 r\u1EA1ch r\xF2i l\u1EDBn \u0111\u1EA7u ti\xEAn v\u1EC1 b\u1EA3n th\u1EC3 lu\u1EADn: Democritus s\xE1ng ch\u1EBF thuy\u1EBFt Nguy\xEAn t\u1EED c\u1ED5 \u0111\u1EA1i kh\u1EB3ng \u0111\u1ECBnh th\u1EBF gi\u1EDBi l\xE0 v\u1EADt th\u1EC3 kh\xE1ch quan, ng\u01B0\u1EE3c l\u1EA1i Plato coi v\u1EADt ch\u1EA5t ch\u1EC9 l\xE0 c\xE1i b\xF3ng kh\xF4ng ho\xE0n m\u1EF9 c\u1EE7a thi\xEAn qu\u1ED1c \xDD ni\u1EC7m t\u1ED1i th\u01B0\u1EE3ng." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600 font-bold tracking-widest uppercase block", children: "Th\u1EBF k\u1EF7 XVIII - XIX" }),
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-base font-bold text-primary mt-1", children: "Tri\u1EBFt h\u1ECDc C\u1ED5 \u0111i\u1EC3n \u0110\u1EE9c" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-2 leading-relaxed", children: "S\u1EF1 n\u1EDF r\u1ED9 c\u1EE7a tri th\u1EE9c: Ph\xE9p bi\u1EC7n ch\u1EE9ng bi\u1EC7n lu\u1EADn xoay chuy\u1EC3n d\xF2ng th\u1EDDi gian c\u1EE7a Hegel c\xF9ng Ch\u1EE7 ngh\u0129a duy v\u1EADt ch\u1EA5t ph\xE1c con ng\u01B0\u1EDDi c\u1EE7a Feuerbach l\xE0 n\u1EC1n t\u1EA3ng ti\u1EBFp theo \u0111\u1EC3 tri\u1EBFt h\u1ECDc n\u1EA3y m\u1EA7m b\u1EE9t ph\xE1." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-amber-600 border-4 border-white flex items-center justify-center text-white" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-primary to-neutral-900 text-white p-6 rounded-2xl hover:border-amber-400 border transition-all shadow-md", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-300 font-bold tracking-widest uppercase block", children: "T\u1EEB n\u0103m 1840 tr\u1EDF \u0111i" }),
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-base font-bold text-amber-300 mt-1", children: "H\u1ECDc thuy\u1EBFt M\xE1c - L\xEAnin To\xE0n Di\u1EC7n" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300 mt-2 leading-relaxed", children: "S\u1EF1 k\u1EBF th\u1EEBa v\u0129 \u0111\u1EA1i v\xE0 c\u1EA3i t\u1EA1o c\xE1ch m\u1EA1ng: Karl Marx v\xE0 Friedrich Engels \u0111\xFAc k\u1EBFt n\xEAn ph\xE9p duy v\u1EADt bi\u1EC7n ch\u1EE9ng ho\xE0n ch\u1EC9nh, gi\u1EA3i m\xE3 tr\u1EADt t\u1EF1 x\xE3 h\u1ED9i b\u1EB1ng ch\u1EE7 ngh\u0129a duy v\u1EADt l\u1ECBch s\u1EED \u0111\u1EA5u tranh s\u1EA3n xu\u1EA5t v\u1EADt ch\u1EA5t th\u1EF1c ti\u1EC5n." })
            ] })
          ] })
        ] })
      ] }) }),
      view === "library" && /* @__PURE__ */ jsx("div", { className: "bg-slate-100/50 py-12 px-4 md:px-12 min-h-[600px]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl font-bold text-primary", children: "Th\u01B0 Vi\u1EC7n H\u1ECDc Th\u01B0 Tri\u1EBFt h\u1ECDc" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 max-w-lg mx-auto", children: "Kh\u1EA3o c\u1EE9u c\xE1c danh t\xE1c tri\u1EBFt h\u1ECDc v\xE0 ch\xEDnh tr\u1ECB n\u1ED5i b\u1EADt \u0111\u1ECBnh h\xECnh n\xEAn d\xF2ng ch\u1EA3y th\u1EBF gi\u1EDBi quan khoa h\u1ECDc c\u1EE7a nh\xE2n lo\u1EA1i." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: BOOKS_DATA.map((book) => {
          const isRead = progress.readBooks.includes(book.id);
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              whileHover: { y: -6, scale: 1.015, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
              transition: { type: "spring", stiffness: 350, damping: 22 },
              className: "bg-white rounded-2xl p-6 border shadow-xs flex flex-col sm:flex-row gap-6 transition-all",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-full sm:w-36 h-48 bg-neutral-200 rounded-xl overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: book.coverImage, alt: book.title, className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between flex-grow space-y-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start gap-2 flex-wrap", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full", children: book.category }),
                      /* @__PURE__ */ jsxs("span", { className: "text-xs text-neutral-400 font-mono font-medium", children: [
                        "Xu\u1EA5t b\u1EA3n: ",
                        book.year
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("h3", { className: "font-serif text-base font-bold text-primary mt-1", children: book.title }),
                    /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-neutral-400 font-bold", children: [
                      "T\xE1c gi\u1EA3: ",
                      book.author
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-neutral-600 text-xs leading-relaxed pt-2", children: book.summary })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 p-3 rounded-lg border-l-2 border-amber-500 text-[11px] font-serif italic text-neutral-500", children: [
                    '"',
                    book.keyQuote,
                    '"'
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-2", children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => toggleBookRead(book.id),
                      className: `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isRead ? "bg-green-100 text-green-800 border" : "bg-primary text-white hover:bg-opacity-95"}`,
                      children: isRead ? "\u2713 \u0110\xE3 nghi\xEAn c\u1EE9u xong" : "\u0110\xE1nh d\u1EA5u \u0111\xE3 nghi\xEAn c\u1EE9u"
                    }
                  ) })
                ] })
              ]
            },
            book.id
          );
        }) })
      ] }) }),
      view === "discussion" && /* @__PURE__ */ jsx("div", { className: "bg-slate-50 py-12 px-4 md:px-12 min-h-[600px]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-sans font-bold text-[10px] tracking-wider uppercase", children: "\u2B50 Di\u1EC5n \u0110\xE0n Khoa H\u1ECDc & Ph\u1EA3n Bi\u1EC7n \u2B50" }),
          /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl font-bold text-primary", children: "Di\u1EC5n \u0110\xE0n Th\u1EA3o Lu\u1EADn Tri\u1EBFt H\u1ECDc" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 max-w-lg mx-auto", children: "Kh\xF4ng gian \u0111\u1ED1i tho\u1EA1i h\u1ECDc thu\u1EADt nghi\xEAm t\xFAc, c\xF9ng chia s\u1EBB quan \u0111i\u1EC3m t\u01B0 duy bi\u1EC7n ch\u1EE9ng v\xE0 gi\u1EA3i th\xEDch th\u1EBF gi\u1EDBi." })
        ] }),
        isFirebaseOffline && /* @__PURE__ */ jsx("div", { className: "bg-amber-50 border border-amber-200 text-neutral-800 p-5 rounded-2xl space-y-3 shadow-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-600 text-lg mt-0.5", children: "\u26A0\uFE0F" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-sans font-bold text-xs uppercase tracking-wider text-amber-900", children: "Ch\u1EBF \u0110\u1ED9 Xem Ngo\u1EA1i Tuy\u1EBFn (Offline Local Sandbox Mode)" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-600 leading-relaxed", children: [
              "Di\u1EC5n \u0111\xE0n hi\u1EC7n \u0111ang ch\u1EA1y \u1EDF ",
              /* @__PURE__ */ jsx("strong", { children: "ch\u1EBF \u0111\u1ED9 offline ri\xEAng t\u01B0" }),
              " t\u1EEB tr\xECnh duy\u1EC7t c\u1EE7a b\u1EA1n.",
              /* @__PURE__ */ jsx("br", {}),
              "M\u1ECDi n\u1ED9i dung th\u1EA3o lu\u1EADn s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u tr\u1EEF t\u1EF1 \u0111\u1ED9ng trong b\u1ED9 nh\u1EDB tr\xECnh duy\u1EC7t (localStorage) c\u1EE7a b\u1EA1n v\xE0 v\u1EABn ho\xE0n to\xE0n t\u01B0\u01A1ng t\xE1c \u0111\u01B0\u1EE3c!"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("h3", { className: "font-sans font-bold text-xs text-neutral-400 uppercase tracking-wider", children: [
                "Danh s\xE1ch ch\u1EE7 \u0111\u1EC1 (",
                forumPosts.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxs(
                motion.button,
                {
                  whileHover: { scale: 1.03 },
                  whileTap: { scale: 0.98 },
                  onClick: () => setShowCreatePost(true),
                  className: "flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-opacity-95 shadow-sm",
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                    " T\u1EA1o b\xE0i th\u1EA3o lu\u1EADn"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50/80 border border-neutral-200/60 rounded-2xl p-4 flex items-center justify-between shadow-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${currentDisplayRole === "Sinh vi\xEAn" ? "bg-cyan-700" : "bg-purple-800"}`, children: currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "?" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[9px] text-neutral-400 font-sans font-semibold uppercase tracking-wider", children: "Danh t\xEDnh th\u1EA3o lu\u1EADn" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-serif text-xs font-bold text-neutral-800 truncate max-w-[125px]", title: currentDisplayName || "H\u1ECDc vi\xEAn \u1EA9n danh", children: currentDisplayName || "H\u1ECDc vi\xEAn \u1EA9n danh" }),
                    /* @__PURE__ */ jsx("span", { className: `text-[9px] font-semibold px-1.5 py-0.5 rounded ${currentDisplayRole === "Sinh vi\xEAn" ? "bg-cyan-50 border border-cyan-100 text-cyan-800" : "bg-purple-50 border border-purple-100 text-purple-800"}`, children: currentDisplayRole })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setTempCommenterName(currentDisplayName);
                    setTempCommenterRole(currentDisplayRole);
                    setIdentityError(null);
                    setShowCommenterNameModal(true);
                  },
                  className: "text-[11px] text-primary hover:text-opacity-80 font-bold flex items-center gap-1 border border-primary/20 hover:border-primary/40 px-2.5 py-1.5 rounded-xl bg-white transition-all cursor-pointer shadow-2xs",
                  children: [
                    /* @__PURE__ */ jsx(Edit, { className: "w-3 h-3" }),
                    " S\u1EEDa danh t\xEDnh"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[550px] overflow-y-auto pr-1", children: forumPosts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl p-6 text-center border text-neutral-400 text-xs", children: "Ch\u01B0a c\xF3 cu\u1ED9c th\u1EA3o lu\u1EADn n\xE0o \u0111\u01B0\u1EE3c b\u1EAFt \u0111\u1EA7u. H\xE3y k\xEDch ho\u1EA1t b\xE0i th\u1EA3o lu\u1EADn \u0111\u1EA7u ti\xEAn!" }) : forumPosts.map((post) => {
              const isSelected = selectedPostId === post.id;
              return /* @__PURE__ */ jsxs(
                motion.div,
                {
                  onClick: () => setSelectedPostId(post.id),
                  whileHover: { y: -2 },
                  className: `p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-amber-50/50 border-amber-400 ring-1 ring-amber-400/30" : "bg-white border-neutral-200 hover:border-neutral-300"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-neutral-100 text-neutral-650 font-bold px-2 py-0.5 rounded-md border", children: post.category }),
                      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-neutral-400 font-mono", children: post.timestamp.split(" ")[0] })
                    ] }),
                    /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-sm text-primary mt-2 group-hover:text-amber-700 leading-snug line-clamp-2", children: post.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-neutral-500 text-xs line-clamp-2 mt-1 leading-relaxed", children: post.content }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 mt-3 text-[10px] text-neutral-400 font-mono", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-semibold", children: [
                      /* @__PURE__ */ jsx(Heart, { className: `w-3 h-3 ${post.hasLiked ? "text-red-500 fill-red-500" : ""}` }),
                      post.likes,
                      " th\xEDch"
                    ] }) })
                  ]
                },
                post.id
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-8", children: selectedPostId ? (() => {
            const post = forumPosts.find((p) => p.id === selectedPostId);
            if (!post) return /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl p-12 text-center border text-neutral-400 text-xs", children: "B\xE0i th\u1EA3o lu\u1EADn \u0111\xE3 b\u1ECB x\xF3a ho\u1EB7c kh\xF4ng h\u1EE3p l\u1EC7. Qu\xFD h\u1ECDc vi\xEAn vui l\xF2ng ch\u1ECDn ch\u1EE7 \u0111\u1EC1 b\xEAn tr\xE1i." });
            return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border p-6 md:p-8 space-y-6 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider", children: post.category }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    currentDisplayName && post.author === currentDisplayName && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => handleDeletePost(post.id),
                        className: "text-red-500 hover:text-red-700 text-[11px] flex items-center gap-1 cursor-pointer transition-all border border-red-200 bg-red-50/10 hover:bg-red-50 px-2.5 py-1 rounded-lg",
                        children: [
                          /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
                          " X\xF3a b\xE0i vi\u1EBFt"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => setSelectedPostId(null),
                        className: "text-neutral-400 hover:text-neutral-600 text-[11px] flex items-center gap-1 cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 h-3.5" }),
                          " \u0110\xF3ng l\u1EA1i"
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl font-bold text-primary leading-tight", children: post.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-1 border-b pb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${post.avatarColor}`, children: post.author.charAt(0).toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-xs text-neutral-800", children: post.author }),
                      /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full", children: post.role })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-neutral-400 font-mono mt-0.5", children: [
                      "\u0110\u0103ng l\xFAc: ",
                      post.timestamp
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-serif", children: post.content }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 pt-4 border-t justify-between", children: [
                /* @__PURE__ */ jsxs(
                  motion.button,
                  {
                    whileTap: { scale: 0.9 },
                    onClick: () => handleLikePost(post.id),
                    className: `flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${post.hasLiked ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`,
                    children: [
                      /* @__PURE__ */ jsx(Heart, { className: `w-4 h-4 ${post.hasLiked ? "text-rose-500 fill-rose-500 animate-pulse" : ""}` }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        post.likes,
                        " Th\xEDch b\xE0i th\u1EA3o lu\u1EADn"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-neutral-400 font-mono flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(MessageSquare, { className: "w-3.5 h-3.5" }),
                  " ",
                  activePostComments.length,
                  " b\xECnh lu\u1EADn ph\u1EA3n h\u1ED3i"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
                /* @__PURE__ */ jsxs("h4", { className: "font-sans font-bold text-xs text-neutral-400 uppercase tracking-wider", children: [
                  "\xDD ki\u1EBFn ph\u1EA3n h\u1ED3i b\xE0n lu\u1EADn (",
                  activePostComments.length,
                  ")"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-4 max-h-[300px] overflow-y-auto pr-1", children: activePostComments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-neutral-50 p-6 rounded-xl text-center text-neutral-400 text-xs border border-dashed", children: "Ch\u01B0a c\xF3 \xFD ki\u1EBFn ph\u1EA3n \u0111\u1ED1i hay \u0111\xF3ng g\xF3p n\xE0o. B\u1EA1n ngh\u0129 sao v\u1EC1 lu\u1EADn \u0111\u1EC1 n\xE0y? H\xE3y b\xECnh lu\u1EADn \u0111\u1EA7u ti\xEAn d\u01B0\u1EDBi \u0111\xE2y nh\xE9." }) : activePostComments.map((comment) => /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 5 },
                    animate: { opacity: 1, y: 0 },
                    className: "bg-neutral-50/50 p-4 rounded-xl border border-neutral-200 space-y-2",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${comment.avatarColor}`, children: comment.author.charAt(0).toUpperCase() }),
                          /* @__PURE__ */ jsx("span", { className: "font-bold text-xs text-neutral-800", children: comment.author }),
                          /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-neutral-200 text-neutral-600 font-semibold px-1.5 py-0.5 rounded", children: comment.role })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-neutral-400 font-mono", children: comment.timestamp }),
                          currentDisplayName && comment.author === currentDisplayName && /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => handleDeleteComment(post.id, comment.id),
                              className: "text-red-400 hover:text-red-600 p-1 hover:bg-neutral-105 rounded cursor-pointer transition-all",
                              title: "X\xF3a b\xECnh lu\u1EADn",
                              children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-neutral-600 text-xs leading-relaxed pl-8 animate-fade-in", children: comment.content })
                    ]
                  },
                  comment.id
                )) }),
                /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold shrink-0 border border-neutral-300", children: currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "?" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "Ghi nh\u1EADn x\xE9t ph\u1EA3n \u0111\u1ED1i ho\u1EB7c \u0111\u1ED3ng \xFD t\u1EA1i \u0111\xE2y...",
                        value: commentInput,
                        onChange: (e) => setCommentInput(e.target.value),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        },
                        className: "flex-1 text-xs border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => handleAddComment(post.id),
                        disabled: !currentDisplayName,
                        className: "bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-opacity-95 transition-all disabled:bg-neutral-300",
                        children: "G\u1EEDi ph\u1EA3n h\u1ED3i"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap text-[10px] text-neutral-400 mt-1.5 leading-normal", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u26A0\uFE0F \u0110\u0103ng nh\u1EADn x\xE9t v\u1EDBi t\u01B0 c\xE1ch: ",
                      /* @__PURE__ */ jsxs("strong", { className: "text-neutral-700", children: [
                        currentDisplayName || "H\u1ECDc vi\xEAn \u1EA9n danh",
                        " (",
                        currentDisplayRole,
                        ")"
                      ] })
                    ] }),
                    !auth.currentUser && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setTempCommenterName(currentDisplayName);
                          setTempCommenterRole(currentDisplayRole);
                          setShowCommenterNameModal(true);
                        },
                        className: "text-primary hover:underline font-bold cursor-pointer inline-flex items-center gap-0.5 shrink-0",
                        children: [
                          /* @__PURE__ */ jsx(Edit, { className: "w-2.5 h-2.5" }),
                          " \u0110\u1ED5i danh t\xEDnh"
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            ] });
          })() : /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl p-12 text-center border space-y-4 min-h-[400px] flex flex-col justify-center items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600", children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-8 h-8" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg font-bold text-primary", children: "Ph\u1EA3n Bi\u1EC7n \u0110\u1EC3 S\xE1ng R\xF5 Ch\xE2n L\xFD" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 max-w-sm leading-relaxed", children: "Nh\u1EA5n ch\u1ECDn b\u1EA5t k\u1EF3 ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn n\xE0o \u1EDF c\u1ED9t danh s\xE1ch \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u theo d\xF5i c\xE1c cu\u1ED9c tranh lu\u1EADn bi\u1EC7n ch\u1EE9ng t\u1EEB nhi\u1EC1u g\xF3c nh\xECn kh\xE1c nhau, ho\u1EB7c t\u1EA1o ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn ri\xEAng c\u1EE7a b\u1EA1n." })
          ] }) })
        ] })
      ] }) }),
      showCreatePost && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          className: "bg-white rounded-2xl max-w-lg w-full border overflow-hidden shadow-2xl",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-primary text-white p-5 flex justify-between items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-amber-300" }),
                /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-base", children: "Kh\u1EDFi T\u1EA1o \u0110\u1EC1 T\xE0i Th\u1EA3o Lu\u1EADn M\u1EDBi" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowCreatePost(false),
                  className: "text-white/80 hover:text-white pointer-events-auto",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 pointer-events-none" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleCreatePost, className: "p-6 space-y-4 text-left", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wide", children: "Danh hi\u1EC7u th\u1EA3o lu\u1EADn *" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      required: true,
                      type: "text",
                      readOnly: true,
                      placeholder: "Ch\u01B0a thi\u1EBFt l\u1EADp h\u1ECDc hi\u1EC7u",
                      value: currentDisplayName || "",
                      className: "w-full text-xs border rounded-lg px-3 py-2 bg-neutral-100 outline-none text-neutral-500 font-medium cursor-not-allowed"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide", children: "V\u1ECB tr\xED / Vai tr\xF2 th\u1EA3o lu\u1EADn *" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      required: true,
                      type: "text",
                      readOnly: true,
                      placeholder: "Ch\u01B0a thi\u1EBFt l\u1EADp vai tr\xF2",
                      value: currentDisplayRole || "",
                      className: "w-full text-xs border rounded-lg px-3 py-2 bg-neutral-100 outline-none text-neutral-500 font-medium cursor-not-allowed"
                    }
                  )
                ] })
              ] }),
              !currentDisplayName && /* @__PURE__ */ jsxs("div", { className: "text-center p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-rose-700 font-medium", children: "\u26A0\uFE0F B\u1EA1n c\u1EA7n thi\u1EBFt l\u1EADp H\u1ECDc hi\u1EC7u (bi\u1EC7t danh duy nh\u1EA5t) tr\u01B0\u1EDBc khi kh\u1EDFi t\u1EA1o \u0111\u1EC1 t\xE0i th\u1EA3o lu\u1EADn nh\xE9!" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setTempCommenterName("");
                      setTempCommenterRole("Sinh vi\xEAn");
                      setIdentityError(null);
                      setShowCommenterNameModal(true);
                    },
                    className: "inline-block text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs",
                    children: "Thi\u1EBFt l\u1EADp ngay"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide", children: "Chuy\xEAn m\u1EE5c ch\u1EE7 \u0111\u1EC1 b\xE0n th\u1EA3o *" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: newPostCategory,
                    onChange: (e) => setNewPostCategory(e.target.value),
                    className: "w-full text-xs border rounded-lg px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-primary/20",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Kh\xE1i lu\u1EADn tri\u1EBFt h\u1ECDc", children: "Kh\xE1i lu\u1EADn tri\u1EBFt h\u1ECDc chung" }),
                      /* @__PURE__ */ jsx("option", { value: "Ch\u1EE7 ngh\u0129a duy v\u1EADt", children: "Ch\u1EE7 ngh\u0129a duy v\u1EADt bi\u1EC7n ch\u1EE9ng" }),
                      /* @__PURE__ */ jsx("option", { value: "Ph\xE9p bi\u1EC7n ch\u1EE9ng", children: "Ph\xE9p bi\u1EC7n ch\u1EE9ng duy v\u1EADt" }),
                      /* @__PURE__ */ jsx("option", { value: "Ch\u1EE7 ngh\u0129a l\u1ECBch s\u1EED", children: "L\u1ECBch s\u1EED v\xE0 th\u1EF1c ti\u1EC5n x\xE3 h\u1ED9i" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide", children: "Ti\xEAu \u0111\u1EC1 ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    required: true,
                    type: "text",
                    placeholder: "M\xE2u thu\u1EABn n\xE0o \u0111ang l\xE0 \u0111\u1ED9ng l\u1EF1c ph\xE1t tri\u1EC3n?",
                    value: newPostTitle,
                    onChange: (e) => setNewPostTitle(e.target.value),
                    className: "w-full text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/20"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide", children: "N\u1ED9i dung lu\u1EADn \u0111\u1EC1 mu\u1ED1n tranh lu\u1EADn *" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    required: true,
                    rows: 4,
                    placeholder: "Tr\xECnh b\xE0y quan \u0111i\u1EC3m c\xE1 nh\xE2n chi ti\u1EBFt v\xE0 n\xEAu c\xE2u h\u1ECFi khoa h\u1ECDc g\u1EE3i m\u1EDF ph\u1EA3n bi\u1EC7n...",
                    value: newPostContent,
                    onChange: (e) => setNewPostContent(e.target.value),
                    className: "w-full text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed resize-none"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-3 border-t", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowCreatePost(false),
                    className: "px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-neutral-50 cursor-pointer",
                    children: "H\u1EE7y b\u1ECF"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: !commenterName,
                    className: "bg-primary hover:bg-opacity-95 disabled:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm",
                    children: "\u{1F680} C\xF4ng b\u1ED1 ch\u1EE7 \u0111\u1EC1"
                  }
                )
              ] })
            ] })
          ]
        }
      ) }),
      view === "certificate" && /* @__PURE__ */ jsx("div", { className: "bg-neutral-100 py-12 px-4 md:px-12 min-h-[600px]", children: /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto space-y-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 md:p-8 rounded-2xl border text-center shadow-lg space-y-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl font-bold text-primary", children: "In Ch\u1EE9ng Nh\u1EADn T\u1ED1t Nghi\u1EC7p Tri\u1EBFt H\u1ECDc" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 max-w-md mx-auto", children: "Ch\u1EE9ng ch\u1EC9 danh h\u1EA1nh \u0111\u01B0\u1EE3c h\u1EC7 th\u1ED1ng Tr\u1EA1m H\u1ECDc s\u1ED1 h\xF3a c\u1EA5p t\u1EB7ng tr\u1EF1c ti\u1EBFp d\xE0nh ri\xEAng cho h\u1ECDc vi\xEAn v\u01B0\u1EE3t qua c\xE1c ch\u1EB7ng \u0111\u01B0\u1EDDng r\xE8n luy\u1EC7n." }),
        /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left max-w-sm mx-auto space-y-2.5", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-sans font-bold text-[10px] text-neutral-400 uppercase tracking-widest", children: "Y\xEAu c\u1EA7u nh\u1EADn ch\u1EE9ng nh\u1EADn:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            totalCompletedQuizzes >= 4 ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-red-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "\u0110\u1EA1t \u0111i\u1EC3m t\u1ED1i \u0111a 10/10 t\u1EA1i t\u1EA5t c\u1EA3 4 tr\u1EA1m tr\u1EAFc nghi\u1EC7m (\u0110\xE3 \u0111\u1EA1t: ",
              totalCompletedQuizzes,
              "/4)"
            ] })
          ] })
        ] }),
        !certGenerated ? /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-md mx-auto pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-left", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-neutral-600 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-primary" }),
              "Nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 H\u1ECD t\xEAn ti\u1EBFng Vi\u1EC7t c\u1EE7a b\u1EA1n:"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: studentName,
                onChange: (e) => setStudentName(e.target.value),
                placeholder: "VD: TS. Nguy\u1EC5n Cao S\u01A1n",
                className: "w-full border border-neutral-200 text-sm p-3 rounded-xl focus:ring-1 focus:ring-primary/20 bg-neutral-50"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 rounded-xl p-3 border border-amber-200 text-left space-y-1 mt-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-amber-700 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
                "Quy t\u1EAFc c\u1EA5p Ch\u1EE9ng nh\u1EADn Danh d\u1EF1:"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-neutral-600 leading-relaxed font-sans", children: [
                "\u2022 B\u1EA1n ch\u1EC9 c\xF3 quy\u1EC1n thay \u0111\u1ED5i th\xF4ng tin h\u1ECD t\xEAn ",
                /* @__PURE__ */ jsx("strong", { children: "t\u1ED1i \u0111a 1 l\u1EA7n duy nh\u1EA5t (1/1)" }),
                " sau khi t\u1EA1o.",
                /* @__PURE__ */ jsx("br", {}),
                "\u2022 H\u1EC7 th\u1ED1ng s\u1EBD t\u1EF1 \u0111\u1ED9ng v\xF4 hi\u1EC7u h\xF3a t\xEDnh n\u0103ng \u0111\u1ED5i t\xEAn \u1EDF c\xE1c l\u1EA7n sau nh\u1EB1m \u0111\u1EA3m b\u1EA3o s\u1EF1 minh ch\u1EE9ng, trung th\u1EF1c h\u1ECDc thu\u1EADt.",
                /* @__PURE__ */ jsx("br", {}),
                "\u2022 Tr\u1EA1ng th\xE1i thay \u0111\u1ED5i hi\u1EC7n t\u1EA1i: ",
                /* @__PURE__ */ jsx("strong", { className: "text-amber-800", children: nameEditCount >= 1 ? "\u0110\xE3 h\u1EBFt l\u01B0\u1EE3t s\u1EEDa (1/1)" : "C\xF2n 1 l\u01B0\u1EE3t s\u1EEDa (0/1)" }),
                "."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                if (totalCompletedQuizzes < 4) {
                  requestAlert(
                    "Ch\u01B0a \u0111\u1EE7 \u0111i\u1EC1u ki\u1EC7n",
                    "B\u1EA1n c\u1EA7n \u0111\u1EA1t \u0111i\u1EC3m tuy\u1EC7t \u0111\u1ED1i 10/10 t\u1EA1i t\u1EA5t c\u1EA3 4 tr\u1EA1m tr\u1EAFc nghi\u1EC7m th\xEC m\u1EDBi \u0111\u1EE7 \u0111i\u1EC1u ki\u1EC7n nh\u1EADn ch\u1EE9ng ch\u1EC9 t\u1ED1t nghi\u1EC7p!"
                  );
                  return;
                }
                if (!studentName.trim()) {
                  requestAlert(
                    "Thi\u1EBFu t\xEAn h\u1ECDc vi\xEAn",
                    "H\xE3y vui l\xF2ng ghi r\xF5 H\u1ECD t\xEAn \u0111\u1EC3 ghi l\xEAn Ch\u1EE9ng l\xFD."
                  );
                  return;
                }
                const trimmedName = studentName.trim();
                const existingInitialName = localStorage.getItem("tram_hoc_cert_initial_name") || "";
                if (!existingInitialName) {
                  setInitialCertName(trimmedName);
                  setStudentName(trimmedName);
                  localStorage.setItem("tram_hoc_cert_initial_name", trimmedName);
                  localStorage.setItem("tram_hoc_cert_name", trimmedName);
                  localStorage.setItem("tram_hoc_cert_generated", "true");
                  setCertGenerated(true);
                } else {
                  if (trimmedName !== existingInitialName) {
                    if (nameEditCount >= 1) {
                      requestAlert(
                        "B\u1ECB ch\u1EB7n \u0111\u1ED5i t\xEAn",
                        "B\u1EA1n \u0111\xE3 h\u1EBFt l\u01B0\u1EE3t \u0111\u1ED5i t\xEAn tr\xEAn ch\u1EE9ng l\xFD (T\u1ED1i \u0111a 1 l\u1EA7n). Th\u1EA3o tr\xECnh h\u1ECDc thu\u1EADt \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u c\u1ED1 \u0111\u1ECBnh!"
                      );
                      const savedName = localStorage.getItem("tram_hoc_cert_name") || existingInitialName;
                      setStudentName(savedName);
                      return;
                    }
                    requestConfirm(
                      "C\u1EA3nh b\xE1o thay \u0111\u1ED5i th\xF4ng tin",
                      `H\u1ECD t\xEAn tr\xEAn ch\u1EE9ng l\xFD s\u1EBD \u0111\u01B0\u1EE3c \u0111\u1ED5i t\u1EEB "${existingInitialName}" th\xE0nh "${trimmedName}". \u0110\xE2y l\xE0 l\u01B0\u1EE3t thay \u0111\u1ED5i DUY NH\u1EA4T d\xE0nh cho t\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n. B\u1EA1n ch\u1EAFc ch\u1EAFn ch\u1EE9?`,
                      () => {
                        setNameEditCount(1);
                        localStorage.setItem("tram_hoc_cert_edit_count", "1");
                        localStorage.setItem("tram_hoc_cert_name", trimmedName);
                        localStorage.setItem("tram_hoc_cert_generated", "true");
                        setCertGenerated(true);
                      }
                    );
                  } else {
                    localStorage.setItem("tram_hoc_cert_name", trimmedName);
                    localStorage.setItem("tram_hoc_cert_generated", "true");
                    setCertGenerated(true);
                  }
                }
              },
              className: "bg-primary text-white w-full py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5",
              children: "X\xE1c nh\u1EADn th\xF4ng tin & Kh\u1EDFi t\u1EA1o Ch\u1EE9ng l\xFD"
            }
          )
        ] }) : /* @__PURE__ */ jsxs("div", { className: "pt-6 space-y-6", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              id: "printable-certificate",
              className: "bg-[#fcfbf9] p-8 md:p-12 rounded-lg border-8 border-double border-amber-600 shadow-md text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden",
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10 pointer-events-none certificate-dots", style: { backgroundImage: "radial-gradient(#d5e3fc 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" } }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-sans text-xs uppercase tracking-widest text-amber-700 font-bold block", children: "TR\u1EA0M H\u1ECCC TRI\u1EBET H\u1ECCC M\xC1C - L\xCANIN" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-sans text-neutral-400 tracking-wider block", children: "N\u1EC1n t\u1EA3ng s\u1ED1 h\xF3a tri th\u1EE9c khoa h\u1ECDc hi\u1EC7n \u0111\u1EA1i" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "py-2", children: [
                  /* @__PURE__ */ jsx("h1", { className: "font-serif text-[28px] md:text-[34px] font-bold text-primary tracking-wide", children: "CH\u1EE8NG NH\u1EACN HO\xC0N TH\xC0NH TR\u1EA0M TRI\u1EBET H\u1ECCC" }),
                  /* @__PURE__ */ jsx("span", { className: "w-16 h-0.5 bg-amber-500 block mx-auto mt-2" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "font-serif italic text-neutral-500 text-xs md:text-sm", children: "H\u1ED9i \u0111\u1ED3ng H\u1ECDc thu\u1EADt Tr\u1EA1m H\u1ECDc vinh h\u1EA1nh ch\u1EE9ng l\xFD tr\xE2n tr\u1ECDng trao t\u1EB7ng danh hi\u1EC7u n\xE0y t\u1EDBi:" }),
                /* @__PURE__ */ jsx("p", { className: "font-serif text-2xl md:text-3xl font-extrabold text-primary tracking-wider uppercase underline decoration-amber-500 underline-offset-8", children: studentName }),
                /* @__PURE__ */ jsx("p", { className: "font-sans text-xs text-neutral-600 leading-relaxed max-w-md mx-auto pt-3", children: "V\xEC \u0111\xE3 r\xE8n luy\u1EC7n ki\xEAn \u0111\u1ECBnh, \u0111\u1ECDc s\xE2u s\u1EAFc c\xE1c t\u01B0 t\u01B0\u1EDFng b\u1EA3n th\u1EC3 lu\u1EADn v\xE0 ch\u1EE7 ngh\u0129a l\u1ECBch s\u1EED m\xE1c-x\xEDt bi\u1EC7n ch\u1EE9ng kh\xE1ch quan; v\u01B0\u1EE3t qua c\xE1c \u0111\u1EE3t thi l\xFD thuy\u1EBFt s\xE1t sao \u0111\u1EA1t c\u1EA5p h\u1ECDc gi\u1EA3 xu\u1EA5t s\u1EAFc c\u1EE7a Tr\u1EA1m." }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 pt-10 border-t border-neutral-200/50 text-left", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400 block font-bold", children: "X\xC1C MINH S\u1ED0 H\xD3A" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] text-primary block leading-none select-all", children: [
                      "ID: THT-",
                      certId
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-400 block font-bold", children: "CH\u1EE6 T\u1ECACH H\u1ED8I \u0110\u1ED2NG" }),
                    /* @__PURE__ */ jsx("span", { className: "font-serif italic text-xs font-bold text-amber-700 block", children: "Th\u01B0 Vi\u1EC7n Tr\u1EA1m H\u1ECDc" })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2 max-w-md mx-auto justify-center", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleDownloadCertificate,
                disabled: isDownloadingCert,
                className: "bg-primary text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-opacity-90 flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 min-w-[150px] cursor-pointer",
                children: isDownloadingCert ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                  " \u0110ang t\u1EA1o \u1EA3nh..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                  " T\u1EA3i \u1EA3nh ch\u1EE9ng nh\u1EADn"
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  window.print();
                },
                className: "bg-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-amber-700 flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }),
                  " In ho\u1EB7c xu\u1EA5t PDF"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  if (nameEditCount >= 1) {
                    requestAlert(
                      "H\xE0nh tr\xECnh \u0111\xE3 kh\xF3a",
                      "H\xE0nh tr\xECnh h\u1ECDc thu\u1EADt vinh danh \u0111\xE3 ghi nh\u1EADn h\u1ECD t\xEAn ch\xEDnh th\u1EE9c c\u1EE7a b\u1EA1n v\xE0 \u0111\xE3 kh\xF3a ch\u1EC9nh s\u1EEDa (\u0110\u1EB7c quy\u1EC1n 1 l\u1EA7n \u0111\u1ED5i t\xEAn \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng)."
                    );
                    return;
                  }
                  requestConfirm(
                    "X\xE1c nh\u1EADn thay \u0111\u1ED5i h\u1ECD t\xEAn",
                    "C\u1EA3nh b\xE1o: B\u1EA1n s\u1EAFp ti\u1EBFn h\xE0nh \u0111\u1ED5i th\xF4ng tin h\u1ECD t\xEAn tr\xEAn ch\u1EE9ng l\xED. Quy\u1EC1n \u0111\u1ED5i t\xEAn ch\u1EC9 \u0111\u01B0\u1EE3c \xE1p d\u1EE5ng T\u1ED0I \u0110A 1 L\u1EA6N DUY NH\u1EA4T. H\xE3y ch\u1EAFc ch\u1EAFn r\u1EB1ng b\u1EA1n ki\u1EC3m tra th\u1EADt k\u1EF9 ch\xEDnh t\u1EA3 sau \u0111\xF3!",
                    () => {
                      setCertGenerated(false);
                      localStorage.setItem("tram_hoc_cert_generated", "false");
                    }
                  );
                },
                className: `py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1 ${nameEditCount >= 1 ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`,
                children: nameEditCount >= 1 ? "\u0110\xE3 kh\xF3a \u0111\u1ED5i t\xEAn (1/1)" : "Khai l\u1EA1i t\xEAn (0/1)"
              }
            )
          ] })
        ] })
      ] }) }) })
    ] }),
    showCommenterNameModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border relative shadow-2xl space-y-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setShowCommenterNameModal(false);
            setPendingPostIdToComment(null);
          },
          className: "absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "\u{1F393}" }),
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg md:text-xl font-bold text-primary", children: "Thi\u1EBFt l\u1EADp H\u1ECDc hi\u1EC7u h\u1ECDc t\u1EADp" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 leading-normal border-b pb-4 border-neutral-100", children: [
          "Bi\u1EC7t danh th\u1EA3o lu\u1EADn c\u1EE7a b\u1EA1n l\xE0 ",
          /* @__PURE__ */ jsx("b", { children: "duy nh\u1EA5t" }),
          " trong c\u1ED9ng \u0111\u1ED3ng h\u1ECDc thu\u1EADt c\u1EE7a Tr\u1EA1m H\u1ECDc v\xE0 \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 an to\xE0n tr\xEAn h\u1EC7 th\u1ED1ng."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        identityError && /* @__PURE__ */ jsxs("div", { className: "bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium", children: [
          "\u26A0\uFE0F ",
          identityError
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: "T\xEAn / Bi\u1EC7t danh th\u1EA3o lu\u1EADn" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "V\xED d\u1EE5: Tri\u1EBFt gia tr\u1EBB, H\u1ECDc vi\xEAn hi\u1EBFu h\u1ECDc...",
              value: tempCommenterName,
              onChange: (e) => setTempCommenterName(e.target.value),
              className: "w-full text-xs border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400",
              maxLength: 50,
              disabled: isUpdatingIdentity
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: "Vai tr\xF2 h\u1ECDc t\u1EADp" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: tempCommenterRole,
              onChange: (e) => setTempCommenterRole(e.target.value),
              className: "w-full text-xs border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 bg-white",
              disabled: isUpdatingIdentity,
              children: [
                /* @__PURE__ */ jsx("option", { value: "Sinh vi\xEAn", children: "Sinh vi\xEAn" }),
                /* @__PURE__ */ jsx("option", { value: "Ng\u01B0\u1EDDi nghi\xEAn c\u1EE9u", children: "Ng\u01B0\u1EDDi nghi\xEAn c\u1EE9u" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSaveCommenterName,
          disabled: !tempCommenterName.trim() || isUpdatingIdentity,
          className: "w-full bg-primary disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 transition-all shadow cursor-pointer flex items-center justify-center gap-2",
          children: isUpdatingIdentity ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "\u0110ang ki\u1EC3m tra & l\u01B0u danh t\xEDnh..."
          ] }) : "X\xE1c nh\u1EADn & L\u01B0u l\u1EA1i"
        }
      )
    ] }) }),
    showIntroModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border relative shadow-2xl space-y-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowIntroModal(false),
          className: "absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u{1F4FB}" }),
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg md:text-xl font-bold text-primary", children: "Gi\u1EDBi Thi\u1EC7u Tr\u1EA1m H\u1ECDc Tri\u1EBFt H\u1ECDc" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 leading-normal", children: "M\u1ED9t gi\u1EDBi thi\u1EC7u c\xF4 \u0111\u1ECDng gi\u1EA3i th\xEDch b\u01B0\u1EDBc chuy\u1EC3n tri th\u1EE9c t\u1EEB nh\u1EEFng th\u1EDDi \u0111i\u1EC3m c\u1ED5 k\xEDnh s\u01A1 khai." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 p-4 rounded-xl border max-h-60 overflow-y-auto space-y-4 text-xs font-sans text-neutral-600 leading-relaxed", children: [
        /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi C\u1ED5ng tri th\u1EE9c s\u1ED1 h\xF3a Marxist-Leninist." }) }),
        /* @__PURE__ */ jsx("p", { children: "Tri\u1EBFt h\u1ECDc kh\xF4ng ph\u1EA3i l\xE0 nh\u1EEFng kh\u1ED1i l\xFD thuy\u1EBFt s\xE1o r\u1ED7ng v\xF4 h\xECnh \u0111\u1EE9ng t\xE1ch bi\u1EC7t ngo\xE0i \u0111\u1EDDi s\u1ED1ng x\xF4 b\u1ED3 h\xE0ng ng\xE0y. N\xF3 th\u1EF1c ch\u1EA5t ch\xEDnh l\xE0 th\u1EBF gi\u1EDBi quan bi\u1EC7n ch\u1EE9ng \u0111\xFAc k\u1EBFt t\u1EEB h\xE0ng ng\xE0n n\u0103m v\u1EADn \u0111\u1ED9ng th\u1EF1c t\u1EBF c\u1EE7a con ng\u01B0\u1EDDi." }),
        /* @__PURE__ */ jsx("p", { children: "M\u1ECDi h\xE0nh vi, h\u1EC7 th\u1ED1ng t\u1ED5 ch\u1EE9c, v\xE0 n\u1EC1n khoa h\u1ECDc m\xE1y t\xEDnh r\u1EF1c r\u1EE1 hi\u1EC7n \u0111\u1EA1i h\xF4m nay r\u1ED1t cu\u1ED9c \u0111\u1EC1u t\u1EF1 quay v\u1EC1 b\xE0i to\xE1n: Nh\u1EADn th\u1EE9c th\u1EBF gi\u1EDBi th\u1EBF n\xE0o v\xE0 c\u1EA3i t\u1EA1o th\u1EBF gi\u1EDBi ra sao nh\u01B0 Karl Marx \u0111\xE3 d\u1EB7n d\xF2." }),
        /* @__PURE__ */ jsx("p", { children: "H\xE3y tu\u1EA7n t\u1EF1 b\u01B0\u1EDBc qua Tr\u1EA1m 1 \u0111\u1EC3 bi\u1EBFt g\u1ED1c tri\u1EBFt h\u1ECDc l\xE0 g\xEC; Tr\u1EA1m 2 \u0111\u1EC3 th\u1EA5u hi\u1EC3u b\u1EA3n \u0111\u1ED3 2 nguy\xEAn l\xFD 3 quy lu\u1EADt 6 ph\u1EA1m tr\xF9; Tr\u1EA1m 3 \u0111\u1EC3 b\xF3c t\xE1ch quy lu\u1EADt n\u1EC1n kinh t\u1EBF l\u1ECBch s\u1EED x\xE3 h\u1ED9i; v\xE0 Tr\u1EA1m 4 \u0111\u1EC3 bi\u1EBFt c\u1ED9i ngu\u1ED3n Hy L\u1EA1p c\u1ED5 \u0111\u1EA1i v\u0129 \u0111\u1EA1i. Ch\xFAc b\u1EA1n thu \u0111\u01B0\u1EE3c nhi\u1EC1u tr\xED tu\u1EC7!" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setShowIntroModal(false);
            handleSelectStation(1);
          },
          className: "w-full bg-primary text-white py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 transition-all shadow",
          children: "B\u1EAFt \u0111\u1EA7u h\xE0nh tr\xECnh h\u1ECDc ngay l\u1EADp t\u1EE9c"
        }
      )
    ] }) }),
    view === "game" && /* @__PURE__ */ jsx("div", { className: "min-h-[80vh] bg-neutral-50 py-12 px-4 md:px-12 flex flex-col items-center justify-center", children: selectedGameId === null ? /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto flex flex-col items-center w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center max-w-2xl animate-fade-in", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3 text-emerald-600" }),
          " Tr\u1EA1m Tr\xF2 Ch\u01A1i Tri\u1EBFt H\u1ECDc"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl md:text-5xl text-primary font-bold tracking-tight", children: "Th\u1EED Th\xE1ch Tr\xED Tu\u1EC7 & Gi\u1EA3i Tr\xED" }),
        /* @__PURE__ */ jsx("p", { className: "font-sans text-neutral-600 text-sm sm:text-base mt-4 leading-relaxed", children: "V\u1EEBa th\u01B0 gi\xE3n v\u1EEBa \xF4n t\u1EADp c\xE1c lu\u1EADn \u0111i\u1EC3m tri\u1EBFt h\u1ECDc M\xE1c-L\xEAnin c\u1ED1t l\xF5i. H\xE3y ch\u1ECDn tr\xF2 ch\u01A1i y\xEAu th\xEDch c\u1EE7a b\u1EA1n d\u01B0\u1EDBi \u0111\xE2y." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform", children: "\u{1F985}" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl sm:text-2xl font-bold text-primary", children: "Flappy Philosopher" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold uppercase", children: "Kh\xF3" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 leading-relaxed", children: "H\xE3y kh\xE9o l\xE9o \u0111i\u1EC1u khi\u1EC3n ch\xFA chim tri\u1EBFt gia v\u01B0\u1EE3t qua c\xE1c c\u1ED9t h\u1ECDc thuy\u1EBFt l\u1ECBch s\u1EED. N\u1EBFu x\u1EA3y ra va ch\u1EA1m, c\xE2u h\u1ECFi tri\u1EBFt h\u1ECDc h\xF3c b\xFAa s\u1EBD xu\u1EA5t hi\u1EC7n \u0111\u1EC3 c\u1EE9u sinh b\u1EA1n!" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-neutral-100 my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left", children: "\u0110i\u1EC3m n\u1ED5i b\u1EADt:" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-xs text-neutral-600 space-y-1.5 list-disc pl-4 leading-normal text-left", children: [
                /* @__PURE__ */ jsx("li", { children: "\u0110\u1EA5u Boss tr\xED tu\u1EC7 \u1EDF c\xE1c m\u1ED1c \u0111i\u1EC3m 100, 200, 300..." }),
                /* @__PURE__ */ jsx("li", { children: "M\u1EDF kh\xF3a nh\xE2n v\u1EADt n\u1ED5i ti\u1EBFng nh\u01B0 Karl Marx, Lenin." }),
                /* @__PURE__ */ jsx("li", { children: "Y\xEAu c\u1EA7u ph\u1EA3n x\u1EA1 cao k\u1EBFt h\u1EE3p tr\xED tu\u1EC7 tri\u1EBFt h\u1ECDc." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedGameId("flappy"),
              className: "w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-amber-600",
              children: "V\xE0o ch\u01A1i ngay \u{1F680}"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-sky-400/50 hover:-translate-y-1 transition-all duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform", children: "\u{1F9E9}" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl sm:text-2xl font-bold text-primary", children: "Tr\xED Tu\u1EC7 \u0110\u1ED1i Ho\xE0n" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase", children: "V\u1EEBa ph\u1EA3i" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 leading-relaxed", children: "Th\u1EED th\xE1ch tr\xED nh\u1EDB b\u1EB1ng c\xE1ch gh\xE9p \u0111\xF4i c\xE1c tri\u1EBFt gia n\u1ED5i ti\u1EBFng (Plato, Descartes, Marx...) v\u1EDBi c\xE1c t\u01B0 t\u01B0\u1EDFng bi\u1EC7n ch\u1EE9ng, \xFD ni\u1EC7m ho\u1EB7c duy v\u1EADt c\u1ED1t l\xF5i t\u01B0\u01A1ng \u1EE9ng c\u1EE7a h\u1ECD." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-neutral-100 my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left", children: "\u0110i\u1EC3m n\u1ED5i b\u1EADt:" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-xs text-neutral-600 space-y-1.5 list-disc pl-4 leading-normal text-left", children: [
                /* @__PURE__ */ jsx("li", { children: "Luy\u1EC7n tr\xED nh\u1EDB h\u1ECDc thu\u1EADt v\xE0 gi\u1EA3i ngh\u0129a l\xFD thuy\u1EBFt t\u1EE9c th\xEC." }),
                /* @__PURE__ */ jsx("li", { children: "Hi\u1EC7u \u1EE9ng \xE2m thanh h\u1EA5p d\u1EABn, tr\u1EF1c quan." }),
                /* @__PURE__ */ jsx("li", { children: "B\u1EA3ng th\u1ED1ng k\xEA k\u1EF7 l\u1EE5c th\u1EDDi gian t\u1ED1t nh\u1EA5t l\u01B0u tr\u1EEF c\u1EE5c b\u1ED9." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedGameId("memory"),
              className: "w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-sky-600",
              children: "V\xE0o ch\u01A1i ngay \u{1F9E9}"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-emerald-400/50 hover:-translate-y-1 transition-all duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform", children: "\u26BD" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl sm:text-2xl font-bold text-primary", children: "Th\u1EE7 M\xF4n Tri\u1EBFt H\u1ECDc" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold uppercase", children: "Kh\xF3" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 leading-relaxed", children: "H\xF3a th\xE2n th\xE0nh th\u1EE7 m\xF4n c\u1EA3n ph\xE1 10 lo\u1EA1t s\xFAt lu\xE2n l\u01B0u. Tr\u1EA3 l\u1EDDi \u0111\xFAng v\xE0 nhanh c\xE1c c\xE2u h\u1ECFi tr\u1EAFc nghi\u1EC7m \u0111\u1EC3 b\u1EA3o v\u1EC7 khung th\xE0nh v\xE0 gi\xE0nh \u0111i\u1EC3m th\u01B0\u1EDFng th\u1EDDi gian!" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-neutral-100 my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left", children: "\u0110i\u1EC3m n\u1ED5i b\u1EADt:" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-xs text-neutral-600 space-y-1.5 list-disc pl-4 leading-normal text-left", children: [
                /* @__PURE__ */ jsx("li", { children: "Luy\u1EC7n tr\u1EAFc nghi\u1EC7m 10 c\xE2u ng\u1EABu nhi\xEAn." }),
                /* @__PURE__ */ jsx("li", { children: "\u0110i\u1EC3m th\u01B0\u1EDFng theo th\u1EDDi gian suy ngh\u0129 (Time Bonus)." }),
                /* @__PURE__ */ jsx("li", { children: "Hi\u1EC7u \u1EE9ng c\u1EA3n ph\xE1 b\xF3ng vui nh\u1ED9n." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedGameId("penalty"),
              className: "w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-emerald-600",
              children: "V\xE0o ch\u01A1i ngay \u{1F9E4}"
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "w-full max-w-4xl mx-auto flex flex-col items-center justify-center animate-fade-in", children: selectedGameId === "flappy" ? /* @__PURE__ */ jsx(FlappyPhilosopher, { onBackToHub: () => setSelectedGameId(null) }) : selectedGameId === "memory" ? /* @__PURE__ */ jsx(PhilosophicalMemory, { onBackToHub: () => setSelectedGameId(null) }) : /* @__PURE__ */ jsx(PenaltyGoalkeeper, { onBackToHub: () => setSelectedGameId(null) }) }) }),
    /* @__PURE__ */ jsxs("footer", { id: "app-footer", className: "bg-primary text-white w-full py-12 mt-20 border-t border-white/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 px-6 md:px-12 max-w-7xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-serif font-bold text-[22px] text-amber-400", children: "Tr\u1EA1m H\u1ECDc" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300 leading-relaxed max-w-xs", children: "\xA9 2026 Tr\u1EA1m H\u1ECDc Tri\u1EBFt h\u1ECDc M\xE1c - L\xEAnin. N\u1EC1n t\u1EA3ng h\u1ECDc thu\u1EADt s\u1ED1 hi\u1EC7n \u0111\u1EA1i d\xE0nh cho sinh vi\xEAn v\xE0 nh\u1EEFng ng\u01B0\u1EDDi y\xEAu th\xEDch nghi\xEAn c\u1EE9u tri\u1EBFt h\u1ECDc th\u1EF1c ti\u1EC5n." }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: resetAllProgress,
              className: "text-[10px] text-neutral-400 hover:text-white underline transition",
              children: "\u0110\u1EB7t l\u1EA1i ti\u1EBFn tr\xECnh h\u1ECDc t\u1EADp ban \u0111\u1EA7u"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-sm text-amber-400 uppercase tracking-wider", children: "H\u1ECDc t\u1EADp & Li\xEAn k\u1EBFt" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-neutral-300", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setView("home");
                  setSelectedStationId(null);
                },
                className: "text-left hover:text-white transition",
                children: "Trang Ch\u1EE7"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setView("path");
                  setSelectedStationId(null);
                },
                className: "text-left hover:text-white transition",
                children: "L\u1ED9 Tr\xECnh Tri Th\u1EE9c"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setView("library");
                  setSelectedStationId(null);
                },
                className: "text-left hover:text-white transition",
                children: "Th\u01B0 Vi\u1EC7n S\xE1ch C\u1ED5 \u0110i\u1EC3n"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-sm text-amber-400 uppercase tracking-wider", children: "K\u1EBFt n\u1ED1i tri th\u1EE9c" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-300", children: [
            "Email h\u1ED7 tr\u1EE3 gi\u1EA3ng d\u1EA1y:",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-neutral-100", children: "jicamelpham.ginious@gmail.com" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                className: "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-primary hover:border-transparent transition-all",
                children: /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "mailto:jicamelpham.ginious@gmail.com",
                className: "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-primary hover:border-transparent transition-all",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='16' x='2' y='4' rx='2'/><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/></svg>",
                    alt: "mail",
                    className: "w-4 h-4 invert"
                  }
                )
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-white/10 mt-8 pt-8 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-neutral-300 text-sm tracking-wide", children: "Thi\u1EBFt k\u1EBF b\u1EDFi th\xE0nh vi\xEAn h\u1ECDc thu\u1EADt" }),
          /* @__PURE__ */ jsx("span", { className: "font-serif font-semibold text-amber-400 text-lg", children: "Nh\xF3m 4 - Half1_SE1802" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-8 text-xs text-neutral-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }),
            /* @__PURE__ */ jsx("span", { children: "Ph\u1EA1m \u0110\u1ED7 \u0110\xECnh Ph\xE1t - SE182630" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }),
            /* @__PURE__ */ jsx("span", { children: "Ph\u1EA1m Ti\u1EBFn D\u0169ng - SE192507" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }),
            /* @__PURE__ */ jsx("span", { children: "T\xF4n Th\xE0nh Vinh - SE194070" })
          ] })
        ] })
      ] })
    ] }),
    customModal.isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-neutral-200 p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center transform scale-100 transition-transform", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCustomModal((prev) => ({ ...prev, isOpen: false })),
          className: "absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors cursor-pointer",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center", children: customModal.type === "confirm" ? /* @__PURE__ */ jsx(HelpCircle, { className: "w-6 h-6 text-amber-600 animate-pulse" }) : /* @__PURE__ */ jsx(Award, { className: "w-6 h-6 text-amber-600" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-base text-primary leading-tight", children: customModal.title }),
        /* @__PURE__ */ jsx("p", { className: "font-sans text-xs text-neutral-500 leading-relaxed", children: customModal.message })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 pt-2", children: customModal.type === "confirm" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCustomModal((prev) => ({ ...prev, isOpen: false })),
            className: "flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer",
            children: "B\u1ECF qua"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (customModal.onAccess) {
                customModal.onAccess();
              }
            },
            className: "flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer",
            children: "X\xE1c nh\u1EADn"
          }
        )
      ] }) : /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCustomModal((prev) => ({ ...prev, isOpen: false })),
          className: "w-full px-4 py-2.5 bg-primary text-white hover:bg-neutral-900 rounded-xl text-xs font-bold transition-all cursor-pointer",
          children: "\u0110\u1ED3ng \xFD"
        }
      ) })
    ] }) }),
    certImageToShow && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "bg-neutral-900 text-white rounded-3xl border border-neutral-800 p-6 max-w-2xl w-full shadow-2xl relative space-y-4 text-center animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCertImageToShow(null),
          className: "absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer bg-neutral-800/50 p-1.5 rounded-full",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-lg text-amber-400", children: "Ch\u1EE9ng nh\u1EADn c\u1EE7a b\u1EA1n \u0111\xE3 s\u1EB5n s\xE0ng!" }),
        /* @__PURE__ */ jsx("p", { className: "font-sans text-xs text-neutral-400", children: "H\u1EC7 th\u1ED1ng \u0111\xE3 t\u1EF1 kh\u1EDFi t\u1EA1o \u1EA3nh th\xE0nh c\xF4ng. B\u1EA1n c\xF3 th\u1EC3 l\u01B0u \u1EA3nh tr\u1EF1c ti\u1EBFp theo h\u01B0\u1EDBng d\u1EABn ph\xEDa d\u01B0\u1EDBi." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 p-2 shadow-inner", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: certImageToShow,
          alt: "Ch\u1EE9ng nh\u1EADn danh gi\xE1",
          className: "w-full max-h-[50vh] object-contain rounded-xl select-all select-none"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left space-y-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#f59e0b] flex items-center gap-1.5", children: "\u{1F4A1} H\u01B0\u1EDBng d\u1EABn l\u01B0u h\xECnh \u1EA3nh:" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-neutral-300 leading-relaxed font-sans", children: [
          "\u2022 ",
          /* @__PURE__ */ jsx("strong", { children: "Tr\xEAn \u0110i\u1EC7n tho\u1EA1i:" }),
          " \u1EA4n gi\u1EEF l\xE2u v\xE0o \u1EA3nh v\xE0 ch\u1ECDn ",
          /* @__PURE__ */ jsx("strong", { children: '"L\u01B0u h\xECnh \u1EA3nh"' }),
          " ho\u1EB7c ",
          /* @__PURE__ */ jsx("strong", { children: '"M\u1EDF trong tab m\u1EDBi"' }),
          " \u0111\u1EC3 t\u1EA3i v\u1EC1.",
          /* @__PURE__ */ jsx("br", {}),
          "\u2022 ",
          /* @__PURE__ */ jsx("strong", { children: "Tr\xEAn M\xE1y t\xEDnh:" }),
          " Click chu\u1ED9t ph\u1EA3i v\xE0o h\xECnh \u1EA3nh v\xE0 ch\u1ECDn ",
          /* @__PURE__ */ jsx("strong", { children: '"L\u01B0u h\xECnh \u1EA3nh d\u01B0\u1EDBi d\u1EA1ng..." (Save image as...)' }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCertImageToShow(null),
          className: "w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer",
          children: "Ho\xE0n t\u1EA5t & \u0110\xF3ng"
        }
      )
    ] }) })
  ] });
}
