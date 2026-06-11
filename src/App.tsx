/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  ArrowLeft,
  Check,
  RotateCcw,
  BookMarked,
  Printer,
  ChevronLeft,
  X,
  User,
  Trash2,
  Edit,
  Download,
  Loader2,
  AlertTriangle,
  Gamepad2,
  Trophy,
} from "lucide-react";
import html2canvas from "html2canvas";
import { motion } from "motion/react";
import { STATIONS_DATA, BOOKS_DATA, FORUM_THREADS } from "./data";
import { Station, Book, DiscussionPost, UserProgress, Comment } from "./types";
import PhilosophicalCursor from "./components/PhilosophicalCursor";
import PhilosophersGallery from "./components/PhilosophersGallery";
import FlappyPhilosopher from "./components/FlappyPhilosopher";
import PhilosophicalMemory from "./components/PhilosophicalMemory";
import PenaltyGoalkeeper from "./components/PenaltyGoalkeeper";
import AuthModal from "./components/AuthModal";
import UserProfileModal from "./components/UserProfileModal";
import LeaderboardModal from "./components/LeaderboardModal";
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
  writeBatch,
  getDocs,
  getDoc,
  where
} from "firebase/firestore";
import { db, auth, initFirebaseAuth, OperationType, handleFirestoreError, signOut } from "./firebase";
import firebaseConfig from "../firebase-applet-config.json";

export default function App() {
  // Navigation & View States
  const [view, setView] = useState<"home" | "station" | "path" | "library" | "discussion" | "certificate" | "game">("home");
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<"flappy" | "memory" | "penalty" | null>(null);

  // Forum Threads State synced with Firestore
  const [forumPosts, setForumPosts] = useState<DiscussionPost[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFirebaseOffline, setIsFirebaseOffline] = useState(false);
  const [activePostComments, setActivePostComments] = useState<Comment[]>([]);
  const [myLikes, setMyLikes] = useState<{[postId: string]: boolean}>({});

  // active Thread selected in discussion board
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Forum input forms
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Khái luận triết học");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState(() => localStorage.getItem("tram_hoc_commenter_name") || "");
    const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commenterName, setCommenterName] = useState(() => localStorage.getItem("tram_hoc_commenter_name") || "");
    const [showCommenterNameModal, setShowCommenterNameModal] = useState(false);
  const [pendingPostIdToComment, setPendingPostIdToComment] = useState<string | null>(null);
  const [tempCommenterName, setTempCommenterName] = useState("");
  
  // Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);

  const currentDisplayName = userProfile?.name || commenterName;
  
  // User Progress Local Persistence State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("tram_hoc_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      currentStationId: 1,
      completedLessons: [],
      quizScores: {},
      completedQuizzes: [],
      savedQuotes: [],
      readBooks: [],
    };
  });



  // Quiz Interaction States
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<{ [qId: string]: boolean }>({});

  const toggleMarkQuestion = (qId: string) => {
    setMarkedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const isStationUnlocked = (stationId: number) => {
    if (stationId === 1) return true;
    return progress.completedQuizzes.includes(stationId - 1);
  };



  // Certificate client state
  const [studentName, setStudentName] = useState(() => localStorage.getItem("tram_hoc_cert_name") || "");
  const [certGenerated, setCertGenerated] = useState(() => localStorage.getItem("tram_hoc_cert_generated") === "true");
  const [initialCertName, setInitialCertName] = useState(() => localStorage.getItem("tram_hoc_cert_initial_name") || "");
  const [nameEditCount, setNameEditCount] = useState<number>(() => {
    const saved = localStorage.getItem("tram_hoc_cert_edit_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  const [certImageToShow, setCertImageToShow] = useState<string | null>(null);
  
  // Stable Certified UID state
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
    // Tiny delay to show the loader nicely
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    try {
      // 1. Create a high-res landscape canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 840;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create 2D canvas context");

      // Enable font smoothing
      ctx.imageSmoothingEnabled = true;

      // 2. Clear & Fill Background
      ctx.fillStyle = "#fcfbf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dot pattern watermark (mimicking the CSS background)
      ctx.fillStyle = "rgba(213, 227, 252, 0.35)";
      const dotSpacing = 24;
      for (let x = 12; x < canvas.width; x += dotSpacing) {
        for (let y = 12; y < canvas.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Double Amber Border (Highly Premium Certificate Styling)
      ctx.strokeStyle = "#d97706"; // border-amber-600
      ctx.lineWidth = 10;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

      // Draw subtle decorative corners
      ctx.strokeStyle = "#b45309"; // border-amber-700
      ctx.lineWidth = 2;
      const d = 50;
      ctx.beginPath();
      // Top left corner accent
      ctx.moveTo(d, d); ctx.lineTo(d + 40, d);
      ctx.moveTo(d, d); ctx.lineTo(d, d + 40);
      // Top right
      ctx.moveTo(canvas.width - d, d); ctx.lineTo(canvas.width - d - 40, d);
      ctx.moveTo(canvas.width - d, d); ctx.lineTo(canvas.width - d, d + 40);
      // Bottom left
      ctx.moveTo(d, canvas.height - d); ctx.lineTo(d + 40, canvas.height - d);
      ctx.moveTo(d, canvas.height - d); ctx.lineTo(d, canvas.height - d - 40);
      // Bottom right
      ctx.moveTo(canvas.width - d, canvas.height - d); ctx.lineTo(canvas.width - d - 40, canvas.height - d);
      ctx.moveTo(canvas.width - d, canvas.height - d); ctx.lineTo(canvas.width - d, canvas.height - d - 40);
      ctx.stroke();

      // 4. Draw Brand Title & Decorative Headings
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Header Brand
      ctx.fillStyle = "#b45309"; // amber-700
      ctx.font = "bold 16px 'Be Vietnam Pro', 'Montserrat', 'Helvetica Neue', sans-serif";
      ctx.fillText("TRẠM HỌC TRIẾT HỌC MÁC - LÊNIN", canvas.width / 2, 115);

      // Subhead Brand
      ctx.fillStyle = "#9ca3af"; // neutral-400
      ctx.font = "normal 12px 'Be Vietnam Pro', 'Montserrat', 'Helvetica Neue', sans-serif";
      ctx.fillText("Nền tảng số hóa tri thức khoa học hiện đại", canvas.width / 2, 140);

      // Certificate Title
      ctx.fillStyle = "#002045"; // main primary color
      ctx.font = "bold 44px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText("CHỨNG NHẬN HOÀN THÀNH TRẠM TRIẾT HỌC", canvas.width / 2, 215);

      // Divider line under Title
      ctx.strokeStyle = "#f59e0b"; // amber-500
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 80, 255);
      ctx.lineTo(canvas.width / 2 + 80, 255);
      ctx.stroke();

      // Greeting text
      ctx.fillStyle = "#6b7280"; // neutral-500
      ctx.font = "italic 16px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText(
        "Hội đồng Học thuật Trạm Học vinh hạnh chứng lý trân trọng trao tặng danh hiệu này tới:",
        canvas.width / 2,
        310
      );

      // Student Name with elegant styling
      ctx.fillStyle = "#002045"; // primary
      ctx.font = "bold 36px 'Playfair Display', 'Georgia', 'Times New Roman', serif";
      ctx.fillText(safeStudentName.toUpperCase(), canvas.width / 2, 380);

      // Decorative name underline
      ctx.strokeStyle = "#f59e0b"; // amber-500
      ctx.lineWidth = 1.5;
      const nameWidth = ctx.measureText(safeStudentName.toUpperCase()).width;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 15, 410);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 15, 410);
      ctx.stroke();

      // Description text wrapper helper
      ctx.fillStyle = "#4b5563"; // neutral-600
      ctx.font = "15px 'Be Vietnam Pro', 'Helvetica Neue', sans-serif";
      const desc = "Vì đã rèn luyện kiên định, đọc sâu sắc các tư tưởng bản thể luận và chủ nghĩa lịch sử mác-xít biện chứng khách quan; vượt qua các đợt thi lý thuyết sát sao đạt cấp học giả xuất sắc của Trạm.";
      
      const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
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

      // Bottom Divider Line
      ctx.strokeStyle = "rgba(229, 231, 235, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(130, 620);
      ctx.lineTo(canvas.width - 130, 620);
      ctx.stroke();

      // Footer - Verification ID Left
      ctx.textAlign = "left";
      ctx.fillStyle = "#9ca3af"; // neutral-400
      ctx.font = "bold 11px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("XÁC MINH SỐ HÓA", 130, 655);

      ctx.fillStyle = "#002045"; // primary
      ctx.font = "12px 'Courier New', Courier, monospace";
      ctx.fillText(`ID: THT-${certId}`, 130, 680);

      // Footer - Chair Right
      ctx.textAlign = "right";
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 11px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("CHỦ TỊCH HỘI ĐỒNG", canvas.width - 130, 655);

      ctx.fillStyle = "#b45309"; // amber-700
      ctx.font = "bold italic 15px 'Playfair Display', Georgia, serif";
      ctx.fillText("Thư Viện Trạm Học", canvas.width - 130, 680);

      // 5. Convert to data url and state it
      const generatedDataUrl = canvas.toDataURL("image/png");
      setCertImageToShow(generatedDataUrl);

      // 6. Attempt a direct programmatic download trigger
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
        "Lỗi tải xuống",
        "Có lỗi không ngờ xảy ra khi xuất chứng chỉ. Hãy dùng tính năng 'In hoặc xuất PDF' bên cạnh chụp ảnh màn hình nhé!"
      );
    } finally {
      setIsDownloadingCert(false);
    }
  };

  // Dialog modal state
  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onAccess?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onAccess: () => {
        onConfirm();
        setCustomModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const requestAlert = (title: string, message: string) => {
    setCustomModal({
      isOpen: true,
      type: "alert",
      title,
      message,
    });
  };

  const safeNavigate = (onNavigate: () => void) => {
    if (isQuizActive && !quizSubmitted) {
      requestConfirm(
        "Xác nhận thoát bài tập",
        "Bạn đang làm dở bài tập ôn tập, nếu rời đi kết quả lượt làm bài hiện tại sẽ không được lưu. Bạn có chắc chắn muốn rời đi?",
        () => {
          onNavigate();
        }
      );
    } else {
      onNavigate();
    }
  };

  // Save progress to local storage and Firestore
  useEffect(() => {
    localStorage.setItem("tram_hoc_progress", JSON.stringify(progress));
    if (auth.currentUser) {
      setDoc(doc(db, "userProfiles", auth.currentUser.uid), { uid: auth.currentUser.uid, progress: progress }, { merge: true }).catch(console.error);
    }
  }, [progress, auth.currentUser]);

  // Turn off cursor effect when playing game
  useEffect(() => {
    const isPlaying = view === "game" && selectedGameId !== null;
    window.dispatchEvent(new CustomEvent("game-status-changed", { detail: { active: isPlaying } }));
    
    // Clean up when unmounting or changing view
    return () => {
      window.dispatchEvent(new CustomEvent("game-status-changed", { detail: { active: false } }));
    };
  }, [view, selectedGameId]);

  // Reset selected game when leaving the game tab
  useEffect(() => {
    if (view !== "game") {
      setSelectedGameId(null);
    }
  }, [view]);

  // Sync with Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    initFirebaseAuth(async (success, error) => {
      if (!success) {
        console.warn("Firebase Auth initialized in offline/fallback sandbox mode:", error);
        setIsFirebaseOffline(true);
        // Load initial state from localStorage or fallback to FORUM_THREADS
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
          } catch (e) {}
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
            
            // Fix partial profiles created by progress merge
            const defaultName = user.displayName || user.email?.split('@')[0] || "Người dùng";
            const fullProfile = {
              ...data,
              name: data.name || defaultName,
              email: data.email || user.email || "",
              
            };
            
            setUserProfile(fullProfile);

            // Auto-heal missing fields in Firestore so Leaderboard displays correctly
            if (!data.name || !data.email) {
              updateDoc(docRef, {
                name: fullProfile.name,
                email: fullProfile.email,
                              }).catch(err => console.error("Auto-heal failed:", err));
            }

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
      // Seed if the database is clean & empty
      if (snapshot.empty) {
        console.log("Seeding initial forum threads to Firestore...");
        try {
          for (const post of FORUM_THREADS) {
            const postRef = doc(db, "forumPosts", post.id);
            const postPayload = {
              id: post.id,
              author: post.author,
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

      const posts: DiscussionPost[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let tsStr = "Vừa xong";
        if (d.createdAt) {
          try {
            const date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
            tsStr = date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
          } catch(e) {}
        }
        posts.push({
          id: docSnap.id,
          author: d.author || "Khách",
          avatarColor: d.avatarColor || "bg-neutral-400",
          title: d.title || "",
          content: d.content || "",
          category: d.category || "Chung",
          likes: d.likes || 0,
          timestamp: tsStr,
          hasLiked: myLikes[docSnap.id] || false,
          replies: new Array(d.repliesCount || 0).fill(null) as any,
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

  // Live snapshot listener for subcollection replies (comments) on selected post
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
      const comments: Comment[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let tsStr = "Mới đây";
        if (d.createdAt) {
          try {
            const date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
            tsStr = date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
          } catch(e) {}
        }
        comments.push({
          id: docSnap.id,
          author: d.author || "Học viên",
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

    // Also fetch the current user's like state for this post
    const uid = auth.currentUser?.uid;
    let unsubscribeLike: (() => void) | undefined;
    if (uid) {
      const likeDocRef = doc(db, "forumPosts", selectedPostId, "likes", uid);
      unsubscribeLike = onSnapshot(likeDocRef, (snapshot) => {
        setMyLikes(prev => ({
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

  // Sync comments in local offline mode
  useEffect(() => {
    if (!isFirebaseOffline || !selectedPostId) return;
    const currentPost = forumPosts.find((p) => p.id === selectedPostId);
    if (currentPost) {
      setActivePostComments(currentPost.replies || []);
    } else {
      setActivePostComments([]);
    }
  }, [selectedPostId, forumPosts, isFirebaseOffline]);

  // Thích (Like) a thread post of forum
  const handleLikePost = async (postId: string) => {
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
              hasLiked: !wasLiked,
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

    // Optimistic UI updates
    setMyLikes((prev) => ({ ...prev, [postId]: !wasLiked }));
    setForumPosts((posts) =>
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: wasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            hasLiked: !wasLiked,
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
      // Rollback optimistic state
      setMyLikes((prev) => ({ ...prev, [postId]: wasLiked }));
      handleFirestoreError(e, OperationType.UPDATE, `forumPosts/${postId}`);
    }
  };

  // Submit custom forum comment/reply to subcollection
  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    const contentToPost = commentInput;
    setCommentInput(""); // Clear immediately for instant client response
    await executeAddComment(postId, userProfile.name, userProfile.avatarUrl || null, contentToPost);
  };

  const executeAddComment = async (postId: string, authorName: string, avatarUrl: string | null, content: string) => {
    const replyId = "comment-" + Date.now();
    const colors = ["bg-amber-500", "bg-emerald-500", "bg-blue-500", "bg-indigo-500", "bg-rose-500", "bg-purple-500", "bg-pink-500", "bg-teal-500"];
    const hash = authorName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarColor = colors[hash % colors.length];

    const newComment = {
      id: replyId,
      author: authorName,
      
      avatarColor: avatarColor,
      content: content,
      timestamp: new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    if (isFirebaseOffline) {
      setForumPosts((posts) => {
        const updated = posts.map((post) => {
          if (post.id === postId) {
            const list = post.replies ? [...post.replies] : [];
            list.push(newComment as any);
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
        
        avatarColor: avatarColor,
        avatarUrl: avatarUrl,
        content: content,
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
  const [identityError, setIdentityError] = useState<string | null>(null);

  const handleSaveCommenterName = async () => {
    const name = tempCommenterName.trim().replace(/\s+/g, ' ');
    if (!name) return;

    const nameLower = name.toLowerCase();

    if (isFirebaseOffline) {
      localStorage.setItem("tram_hoc_commenter_name", name);
      setCommenterName(name);
      setNewPostAuthor(name);
      setShowCommenterNameModal(false);
      return;
    }

    if (!auth.currentUser) {
      setIdentityError("Bạn cần phải đăng nhập để thiết lập danh tính.");
      return;
    }

    setIsUpdatingIdentity(true);
    setIdentityError(null);

    try {
      const currentUid = auth.currentUser.uid;
      const profileDocRef = doc(db, "userProfiles", nameLower);
      
      let isTaken = false;
      let existingUid = "";

      // 1. Check standardization format (lowercase doc ID)
      const docSnap = await getDoc(profileDocRef);
      if (docSnap.exists()) {
        isTaken = true;
        existingUid = docSnap.data()?.uid || "";
      } else {
        // 2. Fallback check for legacy non-standardized (mixed-case doc ID)
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
        setIdentityError("Biệt danh này đã được sử dụng bởi học viên khác. Vui lòng chọn biệt danh khác!");
        setIsUpdatingIdentity(false);
        return;
      }

      // Claim identity and release old one inside an atomic session batch or sequential steps
      // Step 1: Create/Update the new profile
      try {
        await setDoc(profileDocRef, {
          uid: currentUid,
          name: name,
                    createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error creating new profile:", err);
        handleFirestoreError(err, OperationType.WRITE, `userProfiles/${nameLower}`);
      }

      // Step 2: Sweep historical forum posts and comments written by this user to update their author identity under their UID
      // 1. Update threads owned by this user
      const postsToUpdate = forumPosts.filter(p => p.authorUid === currentUid || (p.author === commenterName && !p.authorUid));
      for (const t of postsToUpdate) {
        try {
          await updateDoc(doc(db, "forumPosts", t.id), {
            author: name,
                        authorUid: currentUid
          });
        } catch (err) {
          console.error(`Error updating post ${t.id}:`, err);
          handleFirestoreError(err, OperationType.WRITE, `forumPosts/${t.id}`);
        }
      }

      // 2. Update replies owned by this user across all current threads
      for (const t of forumPosts) {
        const repliesRef = collection(db, "forumPosts", t.id, "replies");
        const repliesSnap = await getDocs(repliesRef);
        for (const replyDoc of repliesSnap.docs) {
          const replyData = replyDoc.data();
          if (replyData.authorUid === currentUid || (replyData.author === commenterName && !replyData.authorUid)) {
            try {
              await updateDoc(doc(db, "forumPosts", t.id, "replies", replyDoc.id), {
                author: name,
                                authorUid: currentUid
              });
            } catch (err) {
              console.error(`Error updating reply ${replyDoc.id} in post ${t.id}:`, err);
              handleFirestoreError(err, OperationType.WRITE, `forumPosts/${t.id}/replies/${replyDoc.id}`);
            }
          }
        }
      }

      // Step 3: Now that all historical posts have been sweeped and updated, we can safely delete the old profile document if we own it
      if (commenterName && commenterName.toLowerCase() !== nameLower) {
        // Clean up standard lowercase old profile
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

        // Clean up legacy mixed-case old profile if it exists
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
      setCommenterName(name);
      setNewPostAuthor(name);
      
      setShowCommenterNameModal(false);
      setPendingPostIdToComment(null);

      if (pendingPostIdToComment && commentInput.trim()) {
        const contentToPost = commentInput;
        setCommentInput("");
        executeAddComment(pendingPostIdToComment, name, null, contentToPost);
        setPendingPostIdToComment(null);
      }
    } catch (err) {
      console.error("Failed to update commenter identity:", err);
      setIdentityError("Đã xảy ra lỗi khi lưu danh tính. Vui lòng thử lại sau.");
    } finally {
      setIsUpdatingIdentity(false);
    }
  };

  // Submit new forum post thread to Firestore
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!auth.currentUser || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    const cleanAuthor = userProfile.name;
        const avatarUrl = userProfile.avatarUrl || null;

    const threadId = "thread-" + Date.now();
    const newPost = {
      id: threadId,
      author: cleanAuthor,
      
      avatarColor: "bg-cyan-700",
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      replies: [],
      timestamp: new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
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
        
        avatarColor: "bg-cyan-700",
        avatarUrl: avatarUrl,
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
    } catch (e) {
      console.error("Failed to create thread:", e);
      handleFirestoreError(e, OperationType.CREATE, `forumPosts/${threadId}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
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

  const handleDeleteComment = async (postId: string, commentId: string) => {
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



  // Global search filtering
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Helper mapping icon standard names to Lucide elements
  const getIcon = (name: string, className = "w-6 h-6") => {
    switch (name) {
      case "HelpCircle":
        return <HelpCircle className={className} />;
      case "Hub":
        return <Layers className={className} />;
      case "GitBranch":
        return <GitBranch className={className} />;
      case "Award":
        return <Award className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  // Switch to station details reader
  const handleSelectStation = (stationId: number, startWithQuiz = false) => {
    if (!isStationUnlocked(stationId)) {
      requestAlert(
        "Trạm đang bị khóa",
        `Trạm ${stationId} hiện đang khóa. Bạn cần trả lời đúng 100% tất cả các câu hỏi trắc nghiệm của Trạm ${stationId - 1} để mở khóa!`
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

  // Check if lesson is read
  const isLessonCompleted = (lessonId: string) => progress.completedLessons.includes(lessonId);

  // Toggle Read status of lesson
  const toggleLessonCompleted = (lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(lessonId);
      const updated = exists
        ? prev.completedLessons.filter((id) => id !== lessonId)
        : [...prev.completedLessons, lessonId];
      return { ...prev, completedLessons: updated };
    });
  };

  // Submit Active station quiz
  const handleAnswerQuiz = (qId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleNextQuestion = (total: number) => {
    if (activeQuestionIndex < total - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = (stationId: number, questionsCount: number) => {
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
      const updatedCompleted = isAllCorrect
        ? (prev.completedQuizzes.includes(stationId)
            ? prev.completedQuizzes
            : [...prev.completedQuizzes, stationId])
        : prev.completedQuizzes.filter((id) => id !== stationId);
      return {
        ...prev,
        quizScores: updatedScores,
        completedQuizzes: updatedCompleted,
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

  // Book reader persistence
  const toggleBookRead = (bookId: string) => {
    setProgress((prev) => {
      const exists = prev.readBooks.includes(bookId);
      const updated = exists ? prev.readBooks.filter((id) => id !== bookId) : [...prev.readBooks, bookId];
      return { ...prev, readBooks: updated };
    });
  };



  // Stats calculation
  const totalCompletedLessons = progress.completedLessons.length;
  const totalCompletedQuizzes = progress.completedQuizzes.length;
  const unlockedStationsCount = STATIONS_DATA.filter((st) => isStationUnlocked(st.id)).length;
  const totalCorrectAnswers = Object.values(progress.quizScores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
  const totalReadBooks = progress.readBooks.length;

  // Filter lessons or books based on search query
  const searchResults = () => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    const matchesLessons: { station: Station; lessonIndex: number; title: string; summary: string }[] = [];
    STATIONS_DATA.forEach((st) => {
      st.lessons.forEach((les, idx) => {
        if (
          les.title.toLowerCase().includes(query) ||
          les.summary.toLowerCase().includes(query) ||
          st.title.toLowerCase().includes(query)
        ) {
          matchesLessons.push({
            station: st,
            lessonIndex: idx,
            title: les.title,
            summary: les.summary,
          });
        }
      });
    });

    const matchesBooks = BOOKS_DATA.filter(
      (b) => b.title.toLowerCase().includes(query) || b.summary.toLowerCase().includes(query)
    );

    return { lessons: matchesLessons, books: matchesBooks };
  };

  const results = searchResults();

  // Reset all local progress for clean testing
  const resetAllProgress = () => {
    requestConfirm(
      "Đặt lại tiến trình học tập",
      "Bạn có chắc chắn muốn làm mới toàn bộ tiến trình học tập không?",
      () => {
        setProgress({
          currentStationId: 1,
          completedLessons: [],
          quizScores: {},
          completedQuizzes: [],
          savedQuotes: [],
          readBooks: [],
        });
        setSelectedStationId(null);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setView("home");
        
        // Clean certificate configuration
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

        requestAlert("Cài đặt lại thành công", "Hệ thống đã được cài đặt lại trạng thái ban đầu!");
      }
    );
  };

  return (
    <div id="root-app" className="min-h-screen bg-neutral-50 font-sans text-primary flex flex-col antialiased">
      <PhilosophicalCursor />
      <AuthModal 
        isOpen={isAuthModalOpen || (isAuthReady && !isFirebaseOffline && !currentUser)} 
        closable={!(isAuthReady && !isFirebaseOffline && !currentUser)}
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
        // Additional refresh logic if needed
      }} />
      <UserProfileModal isOpen={isUserProfileModalOpen} onClose={() => setIsUserProfileModalOpen(false)} uid={auth.currentUser?.uid || ""} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      
      {/* Dynamic top navigation bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 shadow-sm transition-all">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-7xl mx-auto w-full">
          <motion.div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              safeNavigate(() => {
                setView("home");
                setSelectedStationId(null);
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="font-serif font-bold text-lg">T</span>
            </div>
            <span className="font-serif text-lg md:text-xl text-primary font-bold tracking-tight group-hover:text-amber-600 transition-colors">
              Trạm Học Triết học
            </span>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-8">
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("home");
                  setSelectedStationId(null);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "home" && !selectedStationId
                  ? "text-primary border-primary font-bold"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              Trang Chủ
            </motion.button>
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("home");
                  setSelectedStationId(1);
                  handleSelectStation(1);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "station" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"
              }`}
            >
              Trạm Kiến Thức
            </motion.button>
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("path");
                  setSelectedStationId(null);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "path" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"
              }`}
            >
              Lộ Trình
            </motion.button>
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("library");
                  setSelectedStationId(null);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "library" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"
              }`}
            >
              Thư Viện
            </motion.button>
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("discussion");
                  setSelectedStationId(null);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "discussion" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"
              }`}
            >
              Diễn Đàn
            </motion.button>
            <motion.button
              onClick={() => {
                safeNavigate(() => {
                  setView("game");
                  setSelectedStationId(null);
                });
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer ${
                view === "game" ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent"
              }`}
            >
              Trò Chơi
            </motion.button>
            <motion.button
              onClick={() => {
                const footerEl = document.getElementById("app-footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-medium py-1 text-sm transition-all border-b-2 hover:text-primary cursor-pointer text-neutral-500 border-transparent"
            >
              Liên Hệ
            </motion.button>
          </div>

          <div className="flex items-center gap-3">



            {/* Auth/Profile Trigger */}
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
            )}

            {/* Mobile Menu toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 lg:hidden text-primary focus:outline-none"
            >
              <div className="flex flex-col gap-1 w-6">
                <span
                  className={`h-0.5 w-full bg-primary transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-primary transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-primary transition-all duration-300 ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 px-6 py-4 flex flex-col gap-3">

            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("home");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Trang Chủ
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  handleSelectStation(1);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Trạm Kiến Thức (Học Thuyết)
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("path");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Lộ Trình Tri Thức
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("library");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Thư Viện Sách Cổ Điển
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("discussion");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Diễn Đàn Học Tập
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("game");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Trò Chơi Trí Tuệ
            </button>
            <button
              onClick={() => {
                safeNavigate(() => {
                  setView("certificate");
                  setSelectedStationId(null);
                  setMobileMenuOpen(false);
                });
              }}
              className="text-left font-bold text-sm text-amber-600 hover:text-primary py-2 hover:pl-2 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-650" />
              Bảng Vàng Chứng Nhận
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTimeout(() => {
                  const footerEl = document.getElementById("app-footer");
                  if (footerEl) {
                    footerEl.scrollIntoView({ behavior: "smooth" });
                  }
                }, 150);
              }}
              className="text-left font-medium py-2 text-sm text-neutral-700 hover:text-primary hover:pl-2 transition-all"
            >
              Liên Hệ & Thành Viên Nhóm
            </button>
          </div>
        )}
      </nav>

      {/* Guest Warning Banner */}
      {!currentUser && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 flex justify-center items-center shadow-sm relative z-40 mt-16 text-center">
          <div className="flex items-center gap-2 max-w-7xl w-full mx-auto justify-center">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs sm:text-sm">
              Bạn đang truy cập ẩn danh. Hãy <button onClick={() => setIsAuthModalOpen(true)} className="font-bold underline text-amber-700 hover:text-amber-800 cursor-pointer">tạo tài khoản</button> để lưu trữ tiến độ học tập và ghi danh lên bảng xếp hạng nhé!
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className={`flex-grow ${!currentUser ? 'pt-0' : 'pt-16'}`}>
        {/* Search Overlay is active when text has been keyed in */}
        {searchQuery.trim() && (
          <div className="bg-neutral-50 py-10 px-4 md:px-12 border-b border-neutral-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-600" /> Kết quả tìm kiếm cho: "{searchQuery}"
                </h2>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full hover:bg-neutral-300 transition-all font-semibold"
                >
                  Xóa tìm kiếm
                </button>
              </div>

              {((results?.lessons && results.lessons.length > 0) || (results?.books && results.books.length > 0)) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.lessons && results.lessons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-neutral-400 border-b pb-1.5">
                        Bài học tương thích ({results.lessons.length})
                      </h3>
                      {results.lessons.map((match, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedStationId(match.station.id);
                            setActiveLessonIndex(match.lessonIndex);
                            setView("station");
                            setSearchQuery("");
                          }}
                          className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary/40 cursor-pointer shadow-sm transition-all"
                        >
                          <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                            Trạm {match.station.id}
                          </span>
                          <h4 className="font-serif text-sm font-semibold mt-1.5 text-primary">
                            {match.title}
                          </h4>
                          <p className="text-xs text-neutral-500 mt-1">
                            {match.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.books && results.books.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-neutral-400 border-b pb-1.5">
                        Sách kinh điển trùng khớp ({results.books.length})
                      </h3>
                      {results.books.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setView("library");
                            setSearchQuery("");
                          }}
                          className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary/40 cursor-pointer shadow-sm transition-all flex gap-3"
                        >
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded-md flex-shrink-0"
                          />
                          <div>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              {book.category}
                            </span>
                            <h4 className="font-serif text-sm font-semibold mt-1 text-primary">
                              {book.title}
                            </h4>
                            <p className="text-xs text-neutral-400 font-medium">Bởi {book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border">
                  <p className="text-sm text-neutral-500">
                    Không tìm thấy bài viết hoặc học liệu tương xứng với từ khóa "{searchQuery}". Hãy thử từ khóa khác như "vật chất", "quy luật lượng", "Marx".
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: HOME VIEW (Wireframe layout) */}
        {view === "home" && !selectedStationId && (
          <div>
            {/* HERO SECTION */}
            <section className="relative min-h-[620px] flex items-center justify-center hero-pattern px-4 md:px-12 py-16 md:py-24">
              <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-sans font-semibold text-xs tracking-wider uppercase animate-pulse">
                    Nền tảng học tập số hóa
                  </span>
                  <h1 className="font-serif text-[38px] md:text-[54px] text-primary font-bold leading-tight tracking-tight">
                    Trạm Học Triết học <br />
                    <span className="text-amber-600 italic font-medium">Mác - Lênin</span>
                  </h1>
                  <p className="font-sans text-neutral-600 text-sm md:text-base leading-relaxed max-w-lg">
                    Hệ thống lộ trình học tập chuyên sâu, được chia thành các chặng đường riêng biệt giúp bạn nắm vững tư
                    duy biện chứng và thế giới quan khoa học chân chính.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => handleSelectStation(1)}
                      className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-sans font-bold text-sm md:text-base hover:shadow-lg hover:translate-y-[-2px] transition-all cursor-pointer"
                    >
                      Bắt đầu học ngay
                    </button>
                    <button
                      onClick={() => setShowIntroModal(true)}
                      className="flex items-center gap-2 text-primary font-sans font-semibold text-sm px-6 py-4 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
                    >
                      <PlayCircle className="w-5 h-5 text-primary" />
                      Xem giới thiệu
                    </button>
                  </div>
                </div>

                <div className="relative pr-4 pb-4">
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 max-w-md mx-auto w-full h-[470px] bg-neutral-900 border border-neutral-800 flex items-center justify-center select-none">
                    <img
                      alt="Ảnh học thuật triết học"
                      className="w-full h-full object-cover rounded-2xl"
                      src={anhHocThuat}
                    />
                  </div>

                  {/* Progress overlay card widget */}
                  <div className="absolute -bottom-6 left-2 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 flex items-center gap-3.5 border border-neutral-100 max-w-[240px] z-20 hover:scale-105 transition-transform">
                    <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container flex-shrink-0 font-bold">
                      🎨
                    </div>
                    <div>
                      <p className="font-sans font-bold text-xs text-primary leading-tight">Tiến trình học</p>
                      <p className="text-[11px] text-neutral-500 font-medium">Lộ trình 4 trạm kiến thức</p>
                      {/* elegant micro-indicator bar */}
                      <div className="w-24 bg-neutral-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-amber-550 h-full transition-all"
                          style={{
                            width: `${Math.min(100, (totalCompletedLessons / 6) * 100)}%`,
                            backgroundColor: "#bf9220",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* THREE COLUMN STATS SECTION */}
            <section className="py-16 bg-primary text-white">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                <div className="flex flex-col items-center p-4">
                  <div className="text-[52px] font-serif font-bold text-amber-300 leading-none mb-2">4</div>
                  <h3 className="font-serif font-bold text-sm tracking-wider uppercase opacity-90">Trạm Kiến Thức</h3>
                  <p className="text-xs text-neutral-300 mt-2">Học theo lộ trình tuần tự bài bản từ gốc tới ngọn</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <div className="text-[52px] font-serif font-bold text-amber-300 leading-none mb-2">40</div>
                  <h3 className="font-serif font-bold text-sm tracking-wider uppercase opacity-90">Câu Trắc Nghiệm</h3>
                  <p className="text-xs text-neutral-300 mt-2">Được thiết kế sâu sắc kèm lời giải thích khách quan chi tiết</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <div className="text-[52px] font-serif font-bold text-amber-300 leading-none mb-2">1</div>
                  <h3 className="font-serif font-bold text-sm tracking-wider uppercase opacity-90">Luồng Học Duy Nhất</h3>
                  <p className="text-xs text-neutral-300 mt-2">Tối ưu hóa không gian hiển thị, tăng tối đa sự tập trung cao độ</p>
                </div>
              </div>
            </section>

            {/* STATIONS SECTION */}
            <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div className="max-w-2xl">
                  <h2 className="font-serif text-3xl md:text-4px text-primary font-bold mb-4">Lộ Trình Tri Thức</h2>
                  <p className="font-sans text-neutral-600 text-xs md:text-sm leading-relaxed">
                    Nội dung triết học chính thống được kết cấu thành 4 trạm học riêng biệt giúp bạn cọ xát kiến thức từ nền tảng đầu tiên của triết lý cho đến các vận động xã hội phức tạp.
                  </p>
                </div>
                <button
                  onClick={() => setView("path")}
                  className="flex items-center gap-1 text-sm font-sans font-bold text-primary border-b-2 border-amber-400 pb-1.5 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  Xem lộ trình trực quan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of 4 stations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {STATIONS_DATA.map((station) => {
                  const score = progress.quizScores[station.id];
                  const completed = progress.completedQuizzes.includes(station.id);
                  const unlocked = isStationUnlocked(station.id);
                  return (
                    <motion.div
                      key={station.id}
                      onClick={() => handleSelectStation(station.id)}
                      whileHover={unlocked ? { y: -8, scale: 1.025, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
                      whileTap={unlocked ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className={`glass-card p-6 rounded-2xl flex flex-col justify-between h-full cursor-pointer transition-all group duration-300 relative ${
                        unlocked ? "" : "opacity-65 bg-neutral-100/60 grayscale border-dashed"
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute top-4 right-4 bg-neutral-200 text-neutral-600 p-1.5 rounded-full z-10 text-xs">
                          🔒
                        </div>
                      )}
                      <div>
                        {/* Elegant custom color background icon wrapper */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-6 transition-colors duration-300 ${
                          unlocked ? "bg-neutral-100 group-hover:bg-primary group-hover:text-white" : "bg-neutral-200 text-neutral-400"
                        }`}>
                          {getIcon(station.iconName, "w-6 h-6")}
                        </div>

                        <h3 className="font-serif text-lg font-bold text-primary mb-3 flex items-center gap-1.5">
                          Trạm {station.id}
                          {!unlocked && <span className="text-[10px] font-sans text-neutral-400 font-normal">(Đang khóa)</span>}
                        </h3>
                        <p className="font-sans text-xs text-neutral-500 leading-relaxed min-h-[72px]">
                          {station.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-3">
                        {unlocked ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Lựa chọn:</span>
                              {completed ? (
                                <span className="text-[10px] bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold">
                                  Đã đạt: {score}/10
                                </span>
                              ) : (
                                <span className="text-[10px] bg-amber-550 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                                  Yêu cầu 10/10
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectStation(station.id, false);
                                }}
                                className="px-3 py-2 bg-neutral-50 hover:bg-neutral-205 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-neutral-500" /> Lý thuyết
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectStation(station.id, true);
                                }}
                                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-200" /> Làm bài tập
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-1 bg-neutral-50 border border-neutral-200/50 rounded-xl text-[11px] font-medium text-neutral-400 flex items-center justify-center gap-1">
                            🔒 Trạm đang bị khóa
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* EXPANSION INTERACTIVE WIDGET FOR REWARD / BADGE OVERVIEW */}
            <section className="bg-neutral-100/60 border-y py-16 px-4 md:px-12 w-full">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary">Tình trạng rèn luyện học thuật</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-md">
                    Tìm hiểu lý luận chuyên sâu và vượt qua cả 4 bài trắc nghiệm thực nghiệm với điểm 10/10 tuyệt đối để nhận ngay Bằng Chứng Nhận danh hạnh từ Trạm Học Triết Học.
                  </p>
                  {/* micro-meters matrix */}
                  <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="bg-white p-3 rounded-lg border text-center shadow-xs">
                      <span className="block text-xl font-bold text-primary">{unlockedStationsCount}/4</span>
                      <span className="text-[10px] text-neutral-400">Trạm đã mở khóa</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center shadow-xs">
                      <span className="block text-xl font-bold text-green-700">{totalCompletedQuizzes}/4</span>
                      <span className="text-[10px] text-neutral-400">Trạm đã vượt qua (10/10)</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border text-center shadow-xs">
                      <span className="block text-xl font-bold text-primary">
                        {totalCompletedQuizzes > 0 ? "100%" : "0%"}
                      </span>
                      <span className="text-[10px] text-neutral-400">Độ chuẩn xác cá nhân</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-white p-6 rounded-2xl border shadow-md w-full max-w-sm text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold mb-3">
                    👑
                  </div>
                  <h4 className="font-serif font-bold text-sm text-primary">Chứng nhận Triết học cổ điển</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-normal">
                    Sau khi hoàn thành tất cả các nấc thang nhận thức, bạn sẽ được hệ thống cấp Chứng chỉ số hóa chính quy cực kỳ đẹp mắt.
                  </p>
                  <button
                    onClick={() => {
                      setView("certificate");
                    }}
                    className="mt-4 bg-primary text-white w-full py-2.5 rounded-xl text-xs font-bold hover:shadow-md hover:bg-opacity-95 transition-all text-center"
                  >
                    Xem & In chứng nhận của bạn
                  </button>
                </div>
              </div>
            </section>

            {/* PHILOSOPHERS PORTRAITS GALLERY */}
            <PhilosophersGallery onLearnStation={(id) => handleSelectStation(id)} />

            {/* QUOTE SECTION */}
            <section className="py-24 bg-neutral-100 px-4 md:px-12 w-full">
              <div className="max-w-4xl mx-auto border-l-4 border-primary pl-8 md:pl-16 space-y-6">
                <span className="block text-5xl font-serif text-amber-500 opacity-40 leading-none">“</span>
                <blockquote className="font-serif italic text-2xl md:text-3xl text-primary leading-relaxed">
                  "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới."
                </blockquote>
                <cite className="block font-sans font-bold text-xs uppercase tracking-widest text-neutral-500 not-italic">
                  — KARL MARX
                </cite>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PORTAL/STATION LEARNING INTERACTIVE WRAPPER */}
        {view === "station" && selectedStationId && (
          <div className="bg-white min-h-[600px] py-10 px-4 md:px-12">
            <div className="max-w-7xl mx-auto">
              {/* Back navigation and title bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 mb-8 gap-4">
                <button
                  onClick={() => {
                    safeNavigate(() => {
                      setView("home");
                    });
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                </button>

                <div className="flex flex-wrap gap-2 items-center">
                  {STATIONS_DATA.map((st) => {
                    const unlocked = isStationUnlocked(st.id);
                    return (
                      <button
                        key={st.id}
                        onClick={() => {
                          if (isQuizActive && !quizSubmitted) {
                            requestConfirm(
                              "Chuyển trạm học",
                              "Bạn đang làm dở bài tập ôn tập, chuyển sang trạm học khác sẽ làm hủy lượt thi và điểm rèn luyện hiện tại. Bạn có chắc chắn muốn chuyển trạm không?",
                              () => {
                                handleSelectStation(st.id);
                              }
                            );
                            return;
                          }
                          handleSelectStation(st.id);
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                          selectedStationId === st.id
                            ? "bg-primary text-white"
                            : unlocked
                              ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                              : "bg-neutral-100 text-neutral-350 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {!unlocked && "🔒"} Trạm {st.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learning Hub Header layout */}
              {(() => {
                const station = STATIONS_DATA.find((s) => s.id === selectedStationId);
                if (!station) return <p>Không tìm thấy nội dung trạm này</p>;

                const activeLesson = station.lessons[activeLessonIndex] || station.lessons[0];

                return (
                  <div className="space-y-6">
                    {/* Mode Selector Tab Bar */}
                    <div className="flex border-b border-neutral-200">
                      <button
                        onClick={() => {
                          if (isQuizActive && !quizSubmitted) {
                            requestConfirm(
                              "Huỷ lượt thi",
                              "Bạn đang làm dở bài thi, chuyển sang đọc lý thuyết sẽ đặt lại bài thi này. Hãy xác nhận hủy lượt thi hiện tại?",
                              () => {
                                setIsQuizActive(false);
                                handleResetQuiz();
                              }
                            );
                            return;
                          }
                          setIsQuizActive(false);
                          handleResetQuiz();
                        }}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-serif text-xs md:text-sm font-bold transition-all cursor-pointer ${
                          !isQuizActive
                            ? "border-primary text-primary bg-neutral-50/50"
                            : "border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300"
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-primary" />
                        📖 1. Học Lý Thuyết
                      </button>
                      <button
                        onClick={() => {
                          if (!isQuizActive) {
                            setIsQuizActive(true);
                            handleResetQuiz();
                          }
                        }}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-serif text-xs md:text-sm font-bold transition-all relative cursor-pointer ${
                          isQuizActive
                            ? "border-amber-600 text-amber-900 bg-amber-50/20"
                            : "border-transparent text-neutral-500 hover:text-amber-600 hover:border-amber-300"
                        }`}
                      >
                        <Award className="w-4 h-4 text-amber-600" />
                        📝 2. Làm Bài Tập Ôn Tập
                        {progress.completedQuizzes.includes(station.id) && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        )}
                      </button>
                    </div>

                    {!isQuizActive ? (
                      /* THEORY MODE: 2 columns layout */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT PANEL: CHAPTER FLOW LIST */}
                        <div className="lg:col-span-3 space-y-4">
                          <div className="bg-neutral-50 p-4 rounded-2xl border space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="text-amber-550 text-xl font-bold bg-amber-100 p-1 rounded">🎓</div>
                              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-neutral-400">
                                Hạng mục bài học
                              </h4>
                            </div>
                            <p className="text-xs font-bold text-primary uppercase mt-1 leading-tight">{station.title}</p>

                            <div className="space-y-2 pt-2">
                              {station.lessons.map((les, index) => {
                                return (
                                  <button
                                    key={les.id}
                                    onClick={() => {
                                      setActiveLessonIndex(index);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-1.5 border cursor-pointer ${
                                      activeLessonIndex === index
                                        ? "bg-white border-primary/40 font-bold text-primary shadow-sm"
                                        : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
                                    }`}
                                  >
                                    <BookOpen className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                                    <span>{les.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Station exam sidebar shortcut widget */}
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/50">
                            <div className="flex items-center gap-1.5 text-amber-800">
                              <Award className="w-5 h-5 flex-shrink-0" />
                              <h4 className="font-serif font-bold text-sm">Bài thi trắc nghiệm</h4>
                            </div>
                            <p className="text-[11px] text-amber-700 mt-1 leading-normal">
                              Hãy học lý thuyết kỹ rồi thi thử nghiệm đợt trắc nghiệm 10 câu chất lượng cao để kiểm chứng mức độ hiểu sâu kiến thức của mình nhé!
                            </p>
                            <button
                              onClick={() => {
                                setIsQuizActive(true);
                                handleResetQuiz();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="mt-3 inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all text-left w-full justify-center cursor-pointer"
                            >
                              Thi trắc nghiệm ngay <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* INTERACTIVE LESSON MAIN BODY */}
                        <div className="lg:col-span-9 space-y-8">
                          {/* LESSON BOX */}
                          <div className="bg-neutral-50/60 p-6 md:p-10 rounded-3xl border">
                            <div className="space-y-2">
                              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {activeLesson.subtitle}
                              </span>
                              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mt-2">
                                {activeLesson.title}
                              </h2>
                              <p className="font-sans italic text-neutral-500 text-xs md:text-sm pt-1 pb-4 border-b border-neutral-200/80">
                                Tóm lược bài: {activeLesson.summary}
                              </p>
                            </div>

                            {/* Interactive dynamic paragraphs rendering */}
                            <div className="mt-8 space-y-6 text-neutral-700 leading-relaxed text-sm">
                              {activeLesson.sections.map((sec, secIdx) => (
                                <div key={secIdx} className="space-y-3">
                                  <h3 className="font-serif text-base md:text-lg font-bold text-primary pt-3">
                                    {sec.heading}
                                  </h3>
                                  {sec.paragraphs.map((p, pIdx) => (
                                    <p key={pIdx} className="font-sans leading-relaxed text-xs md:text-sm">
                                      {p}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>

                            {/* Complete lesson trigger */}
                            <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/20 p-5 rounded-2xl border border-amber-200/50">
                              <div className="space-y-1">
                                <h4 className="font-serif font-bold text-xs text-amber-900 leading-tight">Đã sẵn sàng kiểm tra kiến thức?</h4>
                                <p className="text-[11px] text-neutral-500">
                                  Khi bấm thi trắc nghiệm, hệ thống sẽ chuyển sang giao diện ôn luyện riêng biệt tập trung cao để bảo đảm khách quan học thuật.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setIsQuizActive(true);
                                  handleResetQuiz();
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-neutral-900 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                Khởi động Trắc nghiệm Trạm {selectedStationId} <ArrowRight className="w-4 h-4 ml-1 inline-block" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* EXCLUSIVE QUIZ PAGE MODE: 1 full-width focused layout */
                      <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="bg-amber-900 text-white p-6 rounded-2xl border border-amber-805 border-amber-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-amber-950/60 text-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">TRẠM {selectedStationId}</span>
                              <span className="text-xs text-amber-200 font-bold">KHÔNG GIAN KIỂM TRA</span>
                            </div>
                            <h2 className="font-serif text-lg font-bold mt-1.5 text-amber-100">Đang kiểm tra lý luận chuẩn trị (10 câu)</h2>
                            <p className="text-xs text-amber-200/85 mt-1 max-w-2xl leading-relaxed">
                              Bạn đã bước vào không gian thi trắc nghiệm độc lập chuyên biệt. Toàn bộ tài liệu bài học và cây mục lục đã được ẩn đi. Hãy vận dụng trí tuệ của mình để đạt điểm tuyệt đối 10/10 giúp mở khóa trạm tri thức tiếp theo!
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                if (!quizSubmitted) {
                                  requestConfirm(
                                    "Xác nhận thoát bài thi",
                                    "Bạn đang làm dở bài thi, trở về trang lý thuyết sẽ làm hủy lượt thi và điểm rèn luyện hiện tại. Bạn có chắc chắn muốn thoát?",
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
                              }}
                              className="px-4 py-2 bg-amber-950 hover:bg-neutral-800 font-sans border border-neutral-700/30 rounded-xl text-xs font-bold text-amber-100 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                            >
                              ← Quay lại học lý thuyết
                            </button>
                          </div>
                        </div>

                        {/* QUIZ SECTION FRAME */}
                        <div id="quiz-section" className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
                          <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-3">
                            <div>
                              <h3 className="font-serif text-lg md:text-xl font-bold text-primary flex items-center gap-1.5">
                                📝 Trắc Nghiệm Ôn Tập: Trạm {selectedStationId}
                              </h3>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                Bộ 10 câu hỏi lý luận chuyên sâu. Trả lời xong có hiển thị giải thích cụ thể triết học.
                              </p>
                            </div>
                            {quizSubmitted && (
                              <button
                                onClick={handleResetQuiz}
                                className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Làm lại bài thi
                              </button>
                            )}
                          </div>

                          {/* Question display controller */}
                          {(() => {
                            const questions = station.questions;
                            const currentQuestion = questions[activeQuestionIndex];
                            if (!currentQuestion) return null;

                            return (
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Column: Active Question and options */}
                                <div className="lg:col-span-8 space-y-6">
                                  {/* progress indicator of the quiz */}
                                  {(() => {
                                    const answeredQuestions = questions.filter((q) => quizAnswers[q.id] !== undefined);
                                    const answeredCount = answeredQuestions.length;
                                    const progressPercent = Math.round((answeredCount / questions.length) * 100);

                                    return (
                                      <>
                                        <div className="flex items-center justify-between text-xs text-neutral-400">
                                          <span>
                                            Đang xem câu hỏi <strong>{activeQuestionIndex + 1}</strong> trong số {questions.length} câu
                                          </span>
                                          <span>Đã trả lời: {answeredCount} / {questions.length} ({progressPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className="bg-amber-500 h-full transition-all duration-300"
                                            style={{ width: `${progressPercent}%` }}
                                          />
                                        </div>
                                      </>
                                    );
                                  })()}

                                  {/* Question title and Bookmark button */}
                                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-start gap-4">
                                    <p className="font-sans font-bold text-sm text-primary leading-relaxed flex-1">
                                      {currentQuestion.question}
                                    </p>
                                    <button
                                      onClick={() => toggleMarkQuestion(currentQuestion.id)}
                                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 focus:outline-none text-[10px] uppercase tracking-wider font-bold ${
                                        markedQuestions[currentQuestion.id]
                                          ? "bg-red-50 border-red-200 text-red-650 hover:bg-neutral-250 hover:bg-red-100"
                                          : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-650 hover:bg-neutral-50"
                                      }`}
                                      title="Đánh dấu câu hỏi để xem lại sau"
                                    >
                                      <Bookmark className={`w-4 h-4 ${markedQuestions[currentQuestion.id] ? "fill-red-500 text-red-500" : ""}`} />
                                      <span className="hidden sm:inline">
                                        {markedQuestions[currentQuestion.id] ? "Đã đánh dấu" : "Đánh dấu"}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Options List */}
                                  <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.options.map((opt, optIdx) => {
                                      const isSelected = quizAnswers[currentQuestion.id] === optIdx;
                                      const isCorrect = currentQuestion.correctIndex === optIdx;
                                      const hasSelectedCurrentQuestion = quizAnswers[currentQuestion.id] !== undefined;

                                      let btnStyle = "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50";

                                      if (hasSelectedCurrentQuestion) {
                                        if (isSelected) {
                                          if (quizSubmitted) {
                                            btnStyle = isCorrect
                                              ? "bg-green-100 border-green-500 text-green-905 text-green-900 font-semibold"
                                              : "bg-red-100 border-red-500 text-red-950";
                                          } else {
                                            btnStyle = "bg-amber-100 border-amber-500 text-amber-900 font-semibold";
                                          }
                                        } else {
                                          if (quizSubmitted && isCorrect) {
                                            btnStyle = "bg-green-100 border-green-500 text-green-905 text-green-900 font-semibold";
                                          }
                                        }
                                      }

                                      return (
                                        <motion.button
                                          key={optIdx}
                                          onClick={() => handleAnswerQuiz(currentQuestion.id, optIdx)}
                                          disabled={quizSubmitted}
                                          whileHover={!quizSubmitted ? { scale: 1.01, x: 4, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" } : {}}
                                          whileTap={!quizSubmitted ? { scale: 0.99 } : {}}
                                          className={`w-full text-left px-5 py-3.5 rounded-xl text-xs sm:text-sm border transition-all cursor-pointer flex gap-3 ${btnStyle}`}
                                        >
                                          <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs flex-shrink-0 text-neutral-500">
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span>{opt}</span>
                                        </motion.button>
                                      );
                                    })}
                                  </div>

                                  {/* Detailed philosophical explanation helper */}
                                  {quizSubmitted && (
                                    <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs text-amber-990 text-amber-900 space-y-1.5">
                                      <p className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wider text-[10px]">
                                        💡 GIẢI THÍCH CHI TIẾT
                                      </p>
                                      <p className="font-sans leading-relaxed text-xs">
                                        {currentQuestion.explanation}
                                      </p>
                                    </div>
                                  )}

                                  {/* Question switching buttons */}
                                  <div className="flex justify-between items-center pt-4 border-t gap-3 flex-wrap">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handlePrevQuestion}
                                        disabled={activeQuestionIndex === 0}
                                        className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                      >
                                        <ChevronLeft className="w-4 h-4 text-primary" />
                                      </button>
                                      <button
                                        onClick={() => handleNextQuestion(questions.length)}
                                        disabled={activeQuestionIndex === questions.length - 1}
                                        className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                      >
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                      </button>
                                    </div>

                                    {!quizSubmitted ? (
                                      <button
                                        onClick={() => {
                                          const unanswered = questions.filter((q) => quizAnswers[q.id] === undefined).length;
                                          if (unanswered > 0) {
                                            requestConfirm(
                                              "Nộp bài chưa hoàn thành",
                                              `Bạn còn lại ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài thi ngay không?`,
                                              () => {
                                                handleSubmitQuiz(selectedStationId, questions.length);
                                              }
                                            );
                                          } else {
                                            handleSubmitQuiz(selectedStationId, questions.length);
                                          }
                                        }}
                                        className="bg-amber-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-all cursor-pointer shadow-sm"
                                      >
                                        Nộp Bài Thi Ôn Tập
                                      </button>
                                    ) : (
                                      <span className="text-xs text-green-600 font-bold">
                                        Đã nộp bài thành công
                                      </span>
                                    )}
                                  </div>

                                  {/* Show results score when submitted */}
                                  {quizSubmitted && (
                                    <div className="bg-neutral-900 text-white p-6 rounded-2xl border text-center space-y-3">
                                      <h4 className="font-serif font-bold text-lg text-amber-300">Kết quả bài thi ôn tập</h4>
                                      <p className="text-sm">
                                        Bạn đã trả lời đúng{" "}
                                        <strong className="text-xl text-amber-300">
                                          {progress.quizScores[selectedStationId] || 0}
                                        </strong>{" "}
                                        trên {questions.length} câu hỏi.
                                      </p>
                                      {progress.completedQuizzes.includes(selectedStationId) ? (
                                        <div className="bg-green-950/40 text-green-300 border border-green-800 p-3 rounded-xl text-xs font-bold">
                                          🥳 Tuyệt vời! Bạn đạt điểm tuyệt đối 10/10. Trạm kế tiếp đã được mở khóa thành công!
                                        </div>
                                      ) : (
                                        <div className="bg-amber-950/40 text-amber-305 text-amber-300 border border-amber-800 p-3 rounded-xl text-xs">
                                          ⚠️ Bạn chưa đạt điểm tuyệt đối 10/10 cần thiết để mở khóa Trạm tiếp theo. Vui lòng bấm <strong>Làm lại bài thi</strong> phía trên để thi lại nhé!
                                        </div>
                                      )}
                                      <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                                        Giải thích chi tiết của từng câu đã xuất hiện bên dưới đáp án đã chọn. Bạn có thể bấm nút mũi tên trái/phải để xem lại toàn bộ đáp án và rèn luyện.
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Question select board */}
                                <div className="lg:col-span-4 bg-neutral-50/55 p-5 rounded-2xl border border-neutral-200/80 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-700">
                                      Bảng chọn câu hỏi
                                    </h4>
                                    <span className="text-[10px] text-neutral-400 font-sans font-bold">
                                      {questions.length} CÂU HỎI
                                    </span>
                                  </div>

                                  {/* Legend of colors */}
                                  <div className="grid grid-cols-3 gap-1 pb-3 border-b border-neutral-200/60 text-center">
                                    <div className="flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100">
                                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-200 border border-neutral-300 mb-1"></span>
                                      <span className="text-[9px] text-neutral-500 font-medium">Chưa làm</span>
                                    </div>
                                    <div className="flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100 pb-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-green-600 mb-1"></span>
                                      <span className="text-[9px] text-green-750 text-green-700 font-semibold font-medium">Đã trả lời</span>
                                    </div>
                                    <div className="flex flex-col items-center p-1 bg-white rounded-lg border border-neutral-100">
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 mb-1 animate-pulse"></span>
                                      <span className="text-[9px] text-red-650 text-red-600 font-semibold font-medium">Đánh dấu</span>
                                    </div>
                                  </div>

                                  {/* Question Navigation Grid */}
                                  <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => {
                                      const isCurrent = idx === activeQuestionIndex;
                                      const isMarked = markedQuestions[q.id];
                                      const isAnswered = quizAnswers[q.id] !== undefined;

                                      let pillBg = "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200/80";
                                      
                                      if (isMarked) {
                                        pillBg = "bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-sm font-bold";
                                      } else if (isAnswered) {
                                        pillBg = "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-sm font-bold";
                                      }

                                      return (
                                        <motion.button
                                          key={q.id}
                                          onClick={() => setActiveQuestionIndex(idx)}
                                          whileHover={{ scale: 1.1, y: -2 }}
                                          whileTap={{ scale: 0.9 }}
                                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                          className={`relative h-11 rounded-xl text-center font-sans text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${pillBg} ${
                                            isCurrent
                                              ? "ring-2 ring-amber-500 ring-offset-2 scale-105"
                                              : "hover:scale-102"
                                          }`}
                                        >
                                          <span>{idx + 1}</span>
                                          {isMarked && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-650 bg-red-600 border border-white" />
                                          )}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                  
                                  <div className="pt-2 relative">
                                    {!currentDisplayName && (
                                      <span className="text-[10px] text-amber-600 flex items-center gap-1 font-bold absolute right-0 top-0 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 pointer-events-none">
                                        Cần thiết lập danh tính!
                                      </span>
                                    )}
                                    <p className="text-[10px] text-neutral-400 text-center leading-relaxed italic">
                                      * Bấm vào từng ô số để đến nhanh câu hỏi tương ứng. Bạn có thể đánh dấu câu cần chú ý để xem lại trước khi nộp.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* VIEW: PATHWAY MAP TIMELINE */}
        {view === "path" && (
          <div className="bg-neutral-50 py-12 px-4 md:px-12 min-h-[600px]">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold text-primary">Sơ Đồ Di Trình Tri Thức Triết Học</h2>
                <p className="text-xs text-neutral-500 max-w-lg mx-auto">
                  Theo dõi chặng đường tự tiến hóa hàng ngàn năm của trí tuệ con người, giải phóng tư duy từ niềm tin thần thoại sơ sơ đến duy vật lịch sử mác-xít thực tiễn tối cao.
                </p>
              </div>

              {/* Graphical timeline with interactive nodes */}
              <div className="relative border-l-2 border-primary/20 pl-8 ml-4 md:ml-12 space-y-10 py-4">
                {/* timeline node 1 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" />
                  <div className="bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs">
                    <span className="text-[10px] text-amber-600 font-bold tracking-widest uppercase block">
                      Thế kỷ VIII - VI TCN
                    </span>
                    <h3 className="font-serif text-base font-bold text-primary mt-1">Giai đoạn Mythos sang Logos</h3>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Con người tiến từ tư duy gán ghép thiên tai sấm chớp cho các chúa tể thần phái, sang việc cố gắng dùng lý trí logic để khám phá ra chất gốc (Arché) của vạn vật như Thales, Heraclitus.
                    </p>
                  </div>
                </div>

                {/* timeline node 2 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" />
                  <div className="bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs">
                    <span className="text-[10px] text-amber-600 font-bold tracking-widest uppercase block">
                      Cổ đại Hy Lạp kiệt xuất
                    </span>
                    <h3 className="font-serif text-base font-bold text-primary mt-1">Đấu tranh giữa Phái Democritus và Plato</h3>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Sự rạch ròi lớn đầu tiên về bản thể luận: Democritus sáng chế thuyết Nguyên tử cổ đại khẳng định thế giới là vật thể khách quan, ngược lại Plato coi vật chất chỉ là cái bóng không hoàn mỹ của thiên quốc Ý niệm tối thượng.
                    </p>
                  </div>
                </div>

                {/* timeline node 3 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white" />
                  <div className="bg-white p-6 rounded-2xl border hover:border-amber-400 transition-all shadow-xs">
                    <span className="text-[10px] text-amber-600 font-bold tracking-widest uppercase block">
                      Thế kỷ XVIII - XIX
                    </span>
                    <h3 className="font-serif text-base font-bold text-primary mt-1">Triết học Cổ điển Đức</h3>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Sự nở rộ của tri thức: Phép biện chứng biện luận xoay chuyển dòng thời gian của Hegel cùng Chủ nghĩa duy vật chất phác con người của Feuerbach là nền tảng tiếp theo để triết học nảy mầm bứt phá.
                    </p>
                  </div>
                </div>

                {/* timeline node 4 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-amber-600 border-4 border-white flex items-center justify-center text-white" />
                  <div className="bg-gradient-to-br from-primary to-neutral-900 text-white p-6 rounded-2xl hover:border-amber-400 border transition-all shadow-md">
                    <span className="text-[10px] text-amber-300 font-bold tracking-widest uppercase block">
                      Từ năm 1840 trở đi
                    </span>
                    <h3 className="font-serif text-base font-bold text-amber-300 mt-1">Học thuyết Mác - Lênin Toàn Diện</h3>
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                      Sự kế thừa vĩ đại và cải tạo cách mạng: Karl Marx và Friedrich Engels đúc kết nên phép duy vật biện chứng hoàn chỉnh, giải mã trật tự xã hội bằng chủ nghĩa duy vật lịch sử đấu tranh sản xuất vật chất thực tiễn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: BIBLIOTHECA LIBRARY CARD VIEW */}
        {view === "library" && (
          <div className="bg-slate-100/50 py-12 px-4 md:px-12 min-h-[600px]">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold text-primary">Thư Viện Học Thư Triết học</h2>
                <p className="text-xs text-neutral-500 max-w-lg mx-auto">
                  Khảo cứu các danh tác triết học và chính trị nổi bật định hình nên dòng chảy thế giới quan khoa học của nhân loại.
                </p>
              </div>

              {/* Books list layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {BOOKS_DATA.map((book) => {
                  const isRead = progress.readBooks.includes(book.id);
                  return (
                    <motion.div
                      key={book.id}
                      whileHover={{ y: -6, scale: 1.015, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="bg-white rounded-2xl p-6 border shadow-xs flex flex-col sm:flex-row gap-6 transition-all"
                    >
                      <div className="w-full sm:w-36 h-48 bg-neutral-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex flex-col justify-between flex-grow space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2 flex-wrap">
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                              {book.category}
                            </span>
                            <span className="text-xs text-neutral-400 font-mono font-medium">Xuất bản: {book.year}</span>
                          </div>
                          <h3 className="font-serif text-base font-bold text-primary mt-1">{book.title}</h3>
                          <p className="text-[11px] text-neutral-400 font-bold">Tác giả: {book.author}</p>
                          <p className="text-neutral-600 text-xs leading-relaxed pt-2">
                            {book.summary}
                          </p>
                        </div>

                        {/* Interactive dynamic textbook quote panel */}
                        <div className="bg-neutral-50 p-3 rounded-lg border-l-2 border-amber-500 text-[11px] font-serif italic text-neutral-500">
                          "{book.keyQuote}"
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => toggleBookRead(book.id)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isRead
                                ? "bg-green-100 text-green-800 border"
                                : "bg-primary text-white hover:bg-opacity-95"
                            }`}
                          >
                            {isRead ? "✓ Đã nghiên cứu xong" : "Đánh dấu đã nghiên cứu"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DISCUSSION FORUM (REAL-TIME FIRESTORE WORKFLOWS) */}
        {view === "discussion" && (
          <div className="bg-slate-50 py-12 px-4 md:px-12 min-h-[600px]">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-sans font-bold text-[10px] tracking-wider uppercase">
                  ⭐ Diễn Đàn Khoa Học & Phản Biện ⭐
                </span>
                <h2 className="font-serif text-3xl font-bold text-primary">Diễn Đàn Thảo Luận Triết Học</h2>
                <p className="text-xs text-neutral-500 max-w-lg mx-auto">
                  Không gian đối thoại học thuật nghiêm túc, cùng chia sẻ quan điểm tư duy biện chứng và giải thích thế giới.
                </p>
              </div>

              {/* Sandbox Offline Mode Warning Panel */}
              {isFirebaseOffline && (
                <div className="bg-amber-50 border border-amber-200 text-neutral-800 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 text-lg mt-0.5">⚠️</span>
                    <div className="space-y-1">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-amber-900">
                        Chế Độ Xem Ngoại Tuyến (Offline Local Sandbox Mode)
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Diễn đàn hiện đang chạy ở <strong>chế độ offline riêng tư</strong> từ trình duyệt của bạn.
                        <br />
                        Mọi nội dung thảo luận sẽ được lưu trữ tự động trong bộ nhớ trình duyệt (localStorage) của bạn và vẫn hoàn toàn tương tác được!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Forum main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side list: threads titles */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-xs text-neutral-400 uppercase tracking-wider">
                      Danh sách chủ đề ({forumPosts.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreatePost(true)}
                      className="flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-opacity-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tạo bài thảo luận
                    </motion.button>
                  </div>


                  {/* Forum Threads list wrapper */}
                  <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                    {forumPosts.length === 0 ? (
                      <div className="bg-white rounded-xl p-6 text-center border text-neutral-400 text-xs">
                        Chưa có cuộc thảo luận nào được bắt đầu. Hãy kích hoạt bài thảo luận đầu tiên!
                      </div>
                    ) : (
                      forumPosts.map((post) => {
                        const isSelected = selectedPostId === post.id;
                        return (
                          <motion.div
                            key={post.id}
                            onClick={() => setSelectedPostId(post.id)}
                            whileHover={{ y: -2 }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-amber-50/50 border-amber-400 ring-1 ring-amber-400/30"
                                : "bg-white border-neutral-200 hover:border-neutral-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] bg-neutral-100 text-neutral-650 font-bold px-2 py-0.5 rounded-md border">
                                {post.category}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-mono">
                                {post.timestamp.split(" ")[0]}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-primary mt-2 group-hover:text-amber-700 leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-neutral-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-400 font-mono">
                              <span className="flex items-center gap-1 font-semibold">
                                <Heart className={`w-3 h-3 ${post.hasLiked ? "text-red-500 fill-red-500" : ""}`} />
                                {post.likes} thích
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right side detail view: single thread + comments */}
                <div className="lg:col-span-8">
                  {selectedPostId ? (() => {
                    const post = forumPosts.find((p) => p.id === selectedPostId);
                    if (!post) return (
                      <div className="bg-white rounded-2xl p-12 text-center border text-neutral-400 text-xs">
                        Bài thảo luận đã bị xóa hoặc không hợp lệ. Quý học viên vui lòng chọn chủ đề bên trái.
                      </div>
                    );

                    return (
                      <div className="bg-white rounded-2xl border p-6 md:p-8 space-y-6 shadow-sm">
                        
                        {/* Meta title & Tag */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2 flex-wrap">
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {post.category}
                            </span>
                            <div className="flex items-center gap-3">
                              {currentDisplayName && post.author === currentDisplayName && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-500 hover:text-red-700 text-[11px] flex items-center gap-1 cursor-pointer transition-all border border-red-200 bg-red-50/10 hover:bg-red-50 px-2.5 py-1 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Xóa bài viết
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedPostId(null)}
                                className="text-neutral-400 hover:text-neutral-600 text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" /> Đóng lại
                              </button>
                            </div>
                          </div>

                          <h3 className="font-serif text-2xl font-bold text-primary leading-tight">
                            {post.title}
                          </h3>

                          {/* Author meta row */}
                          <div className="flex items-center gap-3 pt-1 border-b pb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${post.avatarColor}`}>
                              {post.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-bold text-xs text-neutral-800">{post.author}</span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                Đăng lúc: {post.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                          {post.content}
                        </div>

                        {/* Thread operations: Like & share */}
                        <div className="flex items-center gap-4 pt-4 border-t justify-between">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              post.hasLiked
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.hasLiked ? "text-rose-500 fill-rose-500 animate-pulse" : ""}`} />
                            <span>{post.likes} Thích bài thảo luận</span>
                          </motion.button>

                          <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {activePostComments.length} bình luận phản hồi
                          </div>
                        </div>

                        {/* Replies header list */}
                        <div className="space-y-4 pt-4">
                          <h4 className="font-sans font-bold text-xs text-neutral-400 uppercase tracking-wider">
                            Ý kiến phản hồi bàn luận ({activePostComments.length})
                          </h4>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {activePostComments.length === 0 ? (
                              <div className="bg-neutral-50 p-6 rounded-xl text-center text-neutral-400 text-xs border border-dashed">
                                Chưa có ý kiến phản đối hay đóng góp nào. Bạn nghĩ sao về luận đề này? Hãy bình luận đầu tiên dưới đây nhé.
                              </div>
                            ) : (
                              activePostComments.map((comment) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  key={comment.id}
                                  className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-200 space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${comment.avatarColor}`}>
                                        {comment.author.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-bold text-xs text-neutral-800">{comment.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-neutral-400 font-mono">{comment.timestamp}</span>
                                      {currentDisplayName && comment.author === currentDisplayName && (
                                        <button
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="text-red-400 hover:text-red-600 p-1 hover:bg-neutral-105 rounded cursor-pointer transition-all"
                                          title="Xóa bình luận"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-neutral-600 text-xs leading-relaxed pl-8 animate-fade-in">
                                    {comment.content}
                                  </p>
                                </motion.div>
                              ))
                            )}
                          </div>

                          {/* Write feedback input area */}
                          <div className="pt-2">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold shrink-0 border border-neutral-300">
                                {currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : "?"}
                              </div>
                              <input
                                type="text"
                                placeholder="Ghi nhận xét phản đối hoặc đồng ý tại đây..."
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddComment(post.id);
                                  }
                                }}
                                className="flex-1 text-xs border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!currentDisplayName}
                                className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-opacity-95 transition-all disabled:bg-neutral-300"
                              >
                                Gửi phản hồi
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-neutral-400 mt-1.5 leading-normal">
                              <span>
                                ⚠️ Đăng nhận xét với tư cách: <strong className="text-neutral-700">{currentDisplayName || "Học viên ẩn danh"} </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="bg-white rounded-2xl p-12 text-center border space-y-4 min-h-[400px] flex flex-col justify-center items-center">
                      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-primary">Phản Biện Để Sáng Rõ Chân Lý</h3>
                      <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                        Nhấn chọn bất kỳ chủ đề thảo luận nào ở cột danh sách để bắt đầu theo dõi các cuộc tranh luận biện chứng từ nhiều góc nhìn khác nhau, hoặc tạo chủ đề thảo luận riêng của bạn.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* DIALOG POPUP: CREATE DISCUSSION POST MODAL */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full border overflow-hidden shadow-2xl"
            >
              <div className="bg-primary text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="font-serif font-bold text-base">Khởi Tạo Đề Tài Thảo Luận Mới</h3>
                </div>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-white/80 hover:text-white pointer-events-auto"
                >
                  <X className="w-5 h-5 pointer-events-none" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4 text-left">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wide">
                      Danh hiệu thảo luận *
                    </label>
                    <input
                      required
                      type="text"
                      readOnly
                      placeholder="Chưa thiết lập học hiệu"
                      value={currentDisplayName || ""}
                      className="w-full text-xs border rounded-lg px-3 py-2 bg-neutral-100 outline-none text-neutral-500 font-medium cursor-not-allowed"
                    />
                  </div>

                </div>
                {!currentDisplayName && (
                  <div className="text-center p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                    <p className="text-[11px] text-rose-700 font-medium">
                      ⚠️ Bạn cần thiết lập Học hiệu (biệt danh duy nhất) trước khi khởi tạo đề tài thảo luận nhé!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTempCommenterName("");
                        setIdentityError(null);
                        setShowCommenterNameModal(true);
                      }}
                      className="inline-block text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                    >
                      Thiết lập ngay
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide">
                    Chuyên mục chủ đề bàn thảo *
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full text-xs border rounded-lg px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="Khái luận triết học">Khái luận triết học chung</option>
                    <option value="Chủ nghĩa duy vật">Chủ nghĩa duy vật biện chứng</option>
                    <option value="Phép biện chứng">Phép biện chứng duy vật</option>
                    <option value="Chủ nghĩa lịch sử">Lịch sử và thực tiễn xã hội</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide">
                    Tiêu đề chủ đề thảo luận *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Mâu thuẫn nào đang là động lực phát triển?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-sans font-bold text-neutral-405 uppercase tracking-wide">
                    Nội dung luận đề muốn tranh luận *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Trình bày quan điểm cá nhân chi tiết và nêu câu hỏi khoa học gợi mở phản biện..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={!commenterName}
                    className="bg-primary hover:bg-opacity-95 disabled:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                  >
                    🚀 Công bố chủ đề
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VIEW: ACADEMIC CERTIFICATE GENERATION AND CUSTOM NAMES */}
        {view === "certificate" && (
          <div className="bg-neutral-100 py-12 px-4 md:px-12 min-h-[600px]">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl border text-center shadow-lg space-y-4">
                <h2 className="font-serif text-2xl font-bold text-primary">In Chứng Nhận Tốt Nghiệp Triết Học</h2>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Chứng chỉ danh hạnh được hệ thống Trạm Học số hóa cấp tặng trực tiếp dành riêng cho học viên vượt qua các chặng đường rèn luyện.
                </p>

                {/* status dashboard checklist */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left max-w-sm mx-auto space-y-2.5">
                  <h4 className="font-sans font-bold text-[10px] text-neutral-400 uppercase tracking-widest">
                    Yêu cầu nhận chứng nhận:
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    {totalCompletedQuizzes >= 4 ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span>Đạt điểm tối đa 10/10 tại tất cả 4 trạm trắc nghiệm (Đã đạt: {totalCompletedQuizzes}/4)</span>
                  </div>
                </div>

                {!certGenerated ? (
                  <div className="space-y-4 max-w-md mx-auto pt-4">
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        Nhập đầy đủ Họ tên tiếng Việt của bạn:
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="VD: TS. Nguyễn Cao Sơn"
                        className="w-full border border-neutral-200 text-sm p-3 rounded-xl focus:ring-1 focus:ring-primary/20 bg-neutral-50"
                      />
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-left space-y-1 mt-2">
                        <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Quy tắc cấp Chứng nhận Danh dự:
                        </span>
                        <p className="text-[10px] text-neutral-600 leading-relaxed font-sans">
                          • Bạn chỉ có quyền thay đổi thông tin họ tên <strong>tối đa 1 lần duy nhất (1/1)</strong> sau khi tạo.<br />
                          • Hệ thống sẽ tự động vô hiệu hóa tính năng đổi tên ở các lần sau nhằm đảm bảo sự minh chứng, trung thực học thuật.<br />
                          • Trạng thái thay đổi hiện tại: <strong className="text-amber-800">{nameEditCount >= 1 ? "Đã hết lượt sửa (1/1)" : "Còn 1 lượt sửa (0/1)"}</strong>.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (totalCompletedQuizzes < 4) {
                          requestAlert(
                            "Chưa đủ điều kiện",
                            "Bạn cần đạt điểm tuyệt đối 10/10 tại tất cả 4 trạm trắc nghiệm thì mới đủ điều kiện nhận chứng chỉ tốt nghiệp!"
                          );
                          return;
                        }
                        if (!studentName.trim()) {
                          requestAlert(
                            "Thiếu tên học viên",
                            "Hãy vui lòng ghi rõ Họ tên để ghi lên Chứng lý."
                          );
                          return;
                        }

                        const trimmedName = studentName.trim();
                        const existingInitialName = localStorage.getItem("tram_hoc_cert_initial_name") || "";

                        if (!existingInitialName) {
                          // First initialization
                          setInitialCertName(trimmedName);
                          setStudentName(trimmedName);
                          localStorage.setItem("tram_hoc_cert_initial_name", trimmedName);
                          localStorage.setItem("tram_hoc_cert_name", trimmedName);
                          localStorage.setItem("tram_hoc_cert_generated", "true");
                          setCertGenerated(true);
                        } else {
                          // This is an edit/save attempt
                          if (trimmedName !== existingInitialName) {
                            if (nameEditCount >= 1) {
                              requestAlert(
                                "Bị chặn đổi tên",
                                "Bạn đã hết lượt đổi tên trên chứng lý (Tối đa 1 lần). Thảo trình học thuật đã được lưu cố định!"
                              );
                              // Revert to last set name
                              const savedName = localStorage.getItem("tram_hoc_cert_name") || existingInitialName;
                              setStudentName(savedName);
                              return;
                            }

                            // Prompt warning confirmation before persisting edit
                            requestConfirm(
                              "Cảnh báo thay đổi thông tin",
                              `Họ tên trên chứng lý sẽ được đổi từ "${existingInitialName}" thành "${trimmedName}". Đây là lượt thay đổi DUY NHẤT dành cho tài khoản của bạn. Bạn chắc chắn chứ?`,
                              () => {
                                setNameEditCount(1);
                                localStorage.setItem("tram_hoc_cert_edit_count", "1");
                                localStorage.setItem("tram_hoc_cert_name", trimmedName);
                                localStorage.setItem("tram_hoc_cert_generated", "true");
                                setCertGenerated(true);
                              }
                            );
                          } else {
                            // User did not modify initial name, just hit generate again. No count increase.
                            localStorage.setItem("tram_hoc_cert_name", trimmedName);
                            localStorage.setItem("tram_hoc_cert_generated", "true");
                            setCertGenerated(true);
                          }
                        }
                      }}
                      className="bg-primary text-white w-full py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      Xác nhận thông tin & Khởi tạo Chứng lý
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 space-y-6">
                    {/* ENTIRE HIGH QUALITY ACADEMIC PRINT CHIEF LAYOUT */}
                    <div
                      id="printable-certificate"
                      className="bg-[#fcfbf9] p-8 md:p-12 rounded-lg border-8 border-double border-amber-600 shadow-md text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden"
                    >
                      {/* background watermarks style */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none certificate-dots" style={{ backgroundImage: "radial-gradient(#d5e3fc 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />

                      <div className="space-y-1">
                        <span className="font-sans text-xs uppercase tracking-widest text-amber-700 font-bold block">
                          TRẠM HỌC TRIẾT HỌC MÁC - LÊNIN
                        </span>
                        <span className="text-[10px] font-sans text-neutral-400 tracking-wider block">
                          Nền tảng số hóa tri thức khoa học hiện đại
                        </span>
                      </div>

                      <div className="py-2">
                        <h1 className="font-serif text-[28px] md:text-[34px] font-bold text-primary tracking-wide">
                          CHỨNG NHẬN HOÀN THÀNH TRẠM TRIẾT HỌC
                        </h1>
                        <span className="w-16 h-0.5 bg-amber-500 block mx-auto mt-2" />
                      </div>

                      <p className="font-serif italic text-neutral-500 text-xs md:text-sm">
                        Hội đồng Học thuật Trạm Học vinh hạnh chứng lý trân trọng trao tặng danh hiệu này tới:
                      </p>

                      <p className="font-serif text-2xl md:text-3xl font-extrabold text-primary tracking-wider uppercase underline decoration-amber-500 underline-offset-8">
                        {studentName}
                      </p>

                      <p className="font-sans text-xs text-neutral-600 leading-relaxed max-w-md mx-auto pt-3">
                        Vì đã rèn luyện kiên định, đọc sâu sắc các tư tưởng bản thể luận và chủ nghĩa lịch sử mác-xít biện chứng khách quan; vượt qua các đợt thi lý thuyết sát sao đạt cấp học giả xuất sắc của Trạm.
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-10 border-t border-neutral-200/50 text-left">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-bold">XÁC MINH SỐ HÓA</span>
                          <span className="font-mono text-[9px] text-primary block leading-none select-all">
                            ID: THT-{certId}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block font-bold">CHỦ TỊCH HỘI ĐỒNG</span>
                          <span className="font-serif italic text-xs font-bold text-amber-700 block">
                            Thư Viện Trạm Học
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto justify-center">
                      <button
                        onClick={handleDownloadCertificate}
                        disabled={isDownloadingCert}
                        className="bg-primary text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-opacity-90 flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 min-w-[150px] cursor-pointer"
                      >
                        {isDownloadingCert ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo ảnh...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Tải ảnh chứng nhận
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-amber-700 flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                      >
                        <Printer className="w-4 h-4" /> In hoặc xuất PDF
                      </button>
                      <button
                        onClick={() => {
                          if (nameEditCount >= 1) {
                            requestAlert(
                              "Hành trình đã khóa",
                              "Hành trình học thuật vinh danh đã ghi nhận họ tên chính thức của bạn và đã khóa chỉnh sửa (Đặc quyền 1 lần đổi tên đã được sử dụng)."
                            );
                            return;
                          }
                          
                          requestConfirm(
                            "Xác nhận thay đổi họ tên",
                            "Cảnh báo: Bạn sắp tiến hành đổi thông tin họ tên trên chứng lí. Quyền đổi tên chỉ được áp dụng TỐI ĐA 1 LẦN DUY NHẤT. Hãy chắc chắn rằng bạn kiểm tra thật kỹ chính tả sau đó!",
                            () => {
                              setCertGenerated(false);
                              localStorage.setItem("tram_hoc_cert_generated", "false");
                            }
                          );
                        }}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                          nameEditCount >= 1
                            ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {nameEditCount >= 1 ? "Đã khóa đổi tên (1/1)" : "Khai lại tên (0/1)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* INITIAL COMMENTER NAME PROMPT MODAL */}
      {showCommenterNameModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border relative shadow-2xl space-y-6">
            <button
              onClick={() => {
                setShowCommenterNameModal(false);
                setPendingPostIdToComment(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-2xl">🎓</span>
              <h3 className="font-serif text-lg md:text-xl font-bold text-primary">Thiết lập Học hiệu học tập</h3>
              <p className="text-xs text-neutral-500 leading-normal border-b pb-4 border-neutral-100">
                Biệt danh thảo luận của bạn là <b>duy nhất</b> trong cộng đồng học thuật của Trạm Học và được đồng bộ an toàn trên hệ thống.
              </p>
            </div>

            <div className="space-y-4">
              {identityError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
                  ⚠️ {identityError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Tên / Biệt danh thảo luận
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Triết gia trẻ, Học viên hiếu học..."
                  value={tempCommenterName}
                  onChange={(e) => setTempCommenterName(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400"
                  maxLength={50}
                  disabled={isUpdatingIdentity}
                />
              </div>

            </div>

            <button
              onClick={handleSaveCommenterName}
              disabled={!tempCommenterName.trim() || isUpdatingIdentity}
              className="w-full bg-primary disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 transition-all shadow cursor-pointer flex items-center justify-center gap-2"
            >
              {isUpdatingIdentity ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang kiểm tra & lưu danh tính...
                </>
              ) : (
                "Xác nhận & Lưu lại"
              )}
            </button>
          </div>
        </div>
      )}

      {/* INTRODUCTION MODAL (Plays simulation when "Xem giới thiệu" is clicked) */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowIntroModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-sm">📻</span>
              <h3 className="font-serif text-lg md:text-xl font-bold text-primary">Giới Thiệu Trạm Học Triết Học</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                Một giới thiệu cô đọng giải thích bước chuyển tri thức từ những thời điểm cổ kính sơ khai.
              </p>
            </div>

            {/* Simulated timeline audio / text content of presentation */}
            <div className="bg-neutral-50 p-4 rounded-xl border max-h-60 overflow-y-auto space-y-4 text-xs font-sans text-neutral-600 leading-relaxed">
              <p>
                <strong>Chào mừng bạn đến với Cổng tri thức số hóa Marxist-Leninist.</strong>
              </p>
              <p>
                Triết học không phải là những khối lý thuyết sáo rỗng vô hình đứng tách biệt ngoài đời sống xô bồ hàng ngày. Nó thực chất chính là thế giới quan biện chứng đúc kết từ hàng ngàn năm vận động thực tế của con người.
              </p>
              <p>
                Mọi hành vi, hệ thống tổ chức, và nền khoa học máy tính rực rỡ hiện đại hôm nay rốt cuộc đều tự quay về bài toán: Nhận thức thế giới thế nào và cải tạo thế giới ra sao như Karl Marx đã dặn dò.
              </p>
              <p>
                Hãy tuần tự bước qua Trạm 1 để biết gốc triết học là gì; Trạm 2 để thấu hiểu bản đồ 2 nguyên lý 3 quy luật 6 phạm trù; Trạm 3 để bóc tách quy luật nền kinh tế lịch sử xã hội; và Trạm 4 để biết cội nguồn Hy Lạp cổ đại vĩ đại. Chúc bạn thu được nhiều trí tuệ!
              </p>
            </div>

            <button
              onClick={() => {
                setShowIntroModal(false);
                handleSelectStation(1);
              }}
              className="w-full bg-primary text-white py-3 rounded-xl text-xs font-bold hover:bg-opacity-95 transition-all shadow"
            >
              Bắt đầu hành trình học ngay lập tức
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {/* VIEW: GAME TAB */}
      {view === "game" && (
        <div className="min-h-[80vh] bg-neutral-50 py-12 px-4 md:px-12 flex flex-col items-center justify-center relative">
          
          {/* Floating Leaderboard Button */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            title="Bảng Xếp Hạng"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:block">Bảng Xếp Hạng</span>
          </button>
          {selectedGameId === null ? (
            <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
              {/* Header */}
              <div className="mb-12 text-center max-w-2xl animate-fade-in">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Trạm Trò Chơi Triết Học
                </span>
                <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold tracking-tight">
                  Thử Thách Trí Tuệ & Giải Trí
                </h2>
                <p className="font-sans text-neutral-600 text-sm sm:text-base mt-4 leading-relaxed">
                  Vừa thư giãn vừa ôn tập các luận điểm triết học Mác-Lênin cốt lõi. Hãy chọn trò chơi yêu thích của bạn dưới đây.
                </p>
              </div>

              {/* Game Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {/* Flappy Philosopher Card */}
                <div className="group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                      🦅
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">Flappy Philosopher</h3>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold uppercase">Khó</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Hãy khéo léo điều khiển chú chim triết gia vượt qua các cột học thuyết lịch sử. Nếu xảy ra va chạm, câu hỏi triết học hóc búa sẽ xuất hiện để cứu sinh bạn!
                      </p>
                    </div>
                    
                    <div className="h-px bg-neutral-100 my-4"></div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block text-left">Cách chơi & Luật chơi:</span>
                        <p className="text-[11px] text-neutral-600 leading-relaxed text-left">
                          Nhấp chuột/chạm màn hình để điều khiển chim bay qua các khoảng trống. Nếu đụng cột, bạn có 30s để trả lời đúng một câu hỏi triết học nhằm <b>hồi sinh</b> (tối đa 10 lần).
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">Đặc điểm nổi bật:</span>
                        <ul className="text-[11px] text-neutral-600 space-y-1 list-disc pl-4 leading-normal text-left">
                          <li>Lối chơi "try-hard" cuốn hút, thử thách phản xạ.</li>
                          <li>Ôn tập kiến thức ngẫu nhiên cực kỳ hiệu quả.</li>
                          <li>Tự động lưu kỷ lục điểm cao nhất của bạn.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGameId("flappy")}
                    className="w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-amber-600"
                  >
                    Vào chơi ngay
                  </button>
                </div>

                {/* Philosophical Memory Card */}
                <div className="group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-sky-400/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                      🧩
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">Trí Tuệ Đối Hoàn</h3>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase">Vừa phải</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Thử thách trí nhớ bằng cách ghép đôi các triết gia nổi tiếng (Plato, Descartes, Marx...) với các tư tưởng biện chứng, ý niệm hoặc duy vật cốt lõi tương ứng của họ.
                      </p>
                    </div>

                    <div className="h-px bg-neutral-100 my-4"></div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block text-left">Cách chơi & Luật chơi:</span>
                        <p className="text-[11px] text-neutral-600 leading-relaxed text-left">
                          Lật mở từng cặp thẻ bài. Nếu 2 thẻ chứa khái niệm và định nghĩa khớp nhau, thẻ sẽ biến mất. Lật sai sẽ bị úp lại. Hãy dọn sạch bàn chơi với số lượt lật ít nhất!
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">Đặc điểm nổi bật:</span>
                        <ul className="text-[11px] text-neutral-600 space-y-1 list-disc pl-4 leading-normal text-left">
                          <li>Rèn luyện trí nhớ không gian sắc bén.</li>
                          <li>Giúp ghi nhớ sâu sắc các cặp phạm trù triết học.</li>
                          <li>Bảng thống kê kỷ lục thời gian tốt nhất.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGameId("memory")}
                    className="w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-sky-600"
                  >
                    Vào chơi ngay
                  </button>
                </div>

                {/* Penalty Goalkeeper Card */}
                <div className="group bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-emerald-400/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                      ⚽
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">Thủ Môn Triết Học</h3>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold uppercase">Khó</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Hóa thân thành thủ môn cản phá 10 loạt sút luân lưu. Trả lời đúng và nhanh các câu hỏi trắc nghiệm để bảo vệ khung thành và giành điểm thưởng thời gian!
                      </p>
                    </div>
                    
                    <div className="h-px bg-neutral-100 my-4"></div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block text-left">Cách chơi & Luật chơi:</span>
                        <p className="text-[11px] text-neutral-600 leading-relaxed text-left">
                          Đối mặt với 10 lượt sút luân lưu ngẫu nhiên. Mỗi lượt, bạn có 1 phút 30s để chọn đáp án đúng. Trả lời đúng thủ môn sẽ cản phá thành công, sai sẽ bị thủng lưới.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">Đặc điểm nổi bật:</span>
                        <ul className="text-[11px] text-neutral-600 space-y-1 list-disc pl-4 leading-normal text-left">
                          <li>Hệ thống 10 câu hỏi luôn được làm mới mỗi ván.</li>
                          <li>Cộng điểm thưởng (Time Bonus) cho tốc độ suy nghĩ nhanh.</li>
                          <li>Hiệu ứng bắt bóng đồ họa 2D sinh động, kịch tính.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGameId("penalty")}
                    className="w-full bg-primary hover:bg-neutral-900 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 group-hover:bg-emerald-600"
                  >
                    Vào chơi ngay
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center animate-fade-in">
              {selectedGameId === "flappy" ? (
                <FlappyPhilosopher onBackToHub={() => setSelectedGameId(null)} />
              ) : selectedGameId === "memory" ? (
                <PhilosophicalMemory onBackToHub={() => setSelectedGameId(null)} />
              ) : (
                <PenaltyGoalkeeper onBackToHub={() => setSelectedGameId(null)} />
              )}
            </div>
          )}
        </div>
      )}

      <footer id="app-footer" className="bg-primary text-white w-full py-12 mt-20 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-serif font-bold text-[22px] text-amber-400">Trạm Học</span>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-xs">
              © 2026 Trạm Học Triết học Mác - Lênin. Nền tảng học thuật số hiện đại dành cho sinh viên và những người
              yêu thích nghiên cứu triết học thực tiễn.
            </p>
            {/* developer resets shortcut trigger discreetly */}
            <div className="pt-2">
              <button
                onClick={resetAllProgress}
                className="text-[10px] text-neutral-400 hover:text-white underline transition"
              >
                Đặt lại tiến trình học tập ban đầu
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider">Học tập & Liên kết</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
              <button
                onClick={() => {
                  setView("home");
                  setSelectedStationId(null);
                }}
                className="text-left hover:text-white transition"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => {
                  setView("path");
                  setSelectedStationId(null);
                }}
                className="text-left hover:text-white transition"
              >
                Lộ Trình Tri Thức
              </button>
              <button
                onClick={() => {
                  setView("library");
                  setSelectedStationId(null);
                }}
                className="text-left hover:text-white transition"
              >
                Thư Viện Sách Cổ Điển
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider">Kết nối tri thức</h4>
            <p className="text-xs text-neutral-300">
              Email hỗ trợ giảng dạy:
              <br />
              <span className="font-mono text-neutral-100">jicamelpham.ginious@gmail.com</span>
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-primary hover:border-transparent transition-all"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="mailto:jicamelpham.ginious@gmail.com"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-primary hover:border-transparent transition-all"
              >
                <img
                  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='16' x='2' y='4' rx='2'/><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/></svg>"
                  alt="mail"
                  className="w-4 h-4 invert"
                />
              </a>
            </div>
          </div>
        </div>

        {/* THÔNG TIN NHÓM THỰC HIỆN */}
        <div className="border-t border-white/10 mt-8 pt-8 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-neutral-300 text-sm tracking-wide">
              Thiết kế bởi thành viên học thuật
            </h4>
            <span className="font-serif font-semibold text-amber-400 text-lg">Nhóm 4 - Half1_SE1802</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-8 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Phạm Đỗ Đình Phát - SE182630</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Phạm Tiến Dũng - SE192507</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Tôn Thành Vinh - SE194070</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Educational Dialog Modal */}
      {customModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center transform scale-100 transition-transform">
            <button
              onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              {customModal.type === "confirm" ? (
                <HelpCircle className="w-6 h-6 text-amber-600 animate-pulse" />
              ) : (
                <Award className="w-6 h-6 text-amber-600" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-base text-primary leading-tight">
                {customModal.title}
              </h3>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                {customModal.message}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {customModal.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
                    className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    onClick={() => {
                      if (customModal.onAccess) {
                        customModal.onAccess();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
                  className="w-full px-4 py-2.5 bg-primary text-white hover:bg-neutral-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Đồng ý
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer / Download Fallback Modal */}
      {certImageToShow && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-neutral-900 text-white rounded-3xl border border-neutral-800 p-6 max-w-2xl w-full shadow-2xl relative space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCertImageToShow(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer bg-neutral-800/50 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-amber-400">
                Chứng nhận của bạn đã sẵn sàng!
              </h3>
              <p className="font-sans text-xs text-neutral-400">
                Hệ thống đã tự khởi tạo ảnh thành công. Bạn có thể lưu ảnh trực tiếp theo hướng dẫn phía dưới.
              </p>
            </div>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 p-2 shadow-inner">
              <img
                src={certImageToShow}
                alt="Chứng nhận danh giá"
                className="w-full max-h-[50vh] object-contain rounded-xl select-all select-none"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left space-y-1">
              <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1.5">
                💡 Hướng dẫn lưu hình ảnh:
              </span>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                • <strong>Trên Điện thoại:</strong> Ấn giữ lâu vào ảnh và chọn <strong>"Lưu hình ảnh"</strong> hoặc <strong>"Mở trong tab mới"</strong> để tải về.<br />
                • <strong>Trên Máy tính:</strong> Click chuột phải vào hình ảnh và chọn <strong>"Lưu hình ảnh dưới dạng..." (Save image as...)</strong>.
              </p>
            </div>

            <button
              onClick={() => setCertImageToShow(null)}
              className="w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
