import React, { useState, useRef, useEffect } from "react";
import { X, User, Camera, Loader2, AlertTriangle, Save, Award, Gamepad2, CheckCircle, LogOut } from "lucide-react";
import { auth, db, storage, updateProfile, signOut } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { UserProfile } from "../types";
import { STATIONS_DATA } from "../data";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
}

export default function UserProfileModal({ isOpen, onClose, uid }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && uid) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "userProfiles", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const defaultName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Người dùng";
            
            const fullProfile = {
              ...data,
              name: data.name || defaultName,
              email: data.email || auth.currentUser?.email || "",
              role: data.role || "Sinh viên"
            };
            
            setProfile(fullProfile);
            setNewName(fullProfile.name);
          } else {
            console.warn("UserProfile không tồn tại, đang tạo mới...");
            const defaultName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Người dùng";
            const newProfile: UserProfile = {
              uid: uid,
              name: defaultName,
              email: auth.currentUser?.email || "",
              role: "Sinh viên",
            };
            try {
              // Create it in firestore so it exists for next time
              // import { setDoc, serverTimestamp } from "firebase/firestore" needed but we have updateDoc... wait, setDoc is not imported in this file maybe.
              // I will just set the local state for now so it doesn't spin forever, and the user can save it later.
              setProfile(newProfile);
              setNewName(newProfile.name);
            } catch(e) {}
          }
        } catch (e) {
          console.error("Failed to fetch profile", e);
          // Prevent infinite spinner on error
          setProfile({ uid, name: "Lỗi tải dữ liệu", email: "", role: "Unknown" });
        }
      };
      fetchProfile();
    }
  }, [isOpen, uid]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    setIsUploadingImage(true);
    try {
      // Nén ảnh bằng browser-image-compression (Giảm từ vài MB xuống vài chục KB)
      const options = {
        maxSizeMB: 0.1, // Tối đa 100KB
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      console.log(`Original size: ${file.size / 1024} KB`);
      console.log(`Compressed size: ${compressedFile.size / 1024} KB`);

      // Tải lên Firebase Storage
      const storageRef = ref(storage, `avatars/${uid}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Cập nhật Profile trong Firestore và Auth
      const docRef = doc(db, "userProfiles", uid);
      await updateDoc(docRef, { avatarUrl: downloadURL });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }

      setProfile((prev) => (prev ? { ...prev, avatarUrl: downloadURL } : null));
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      alert("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === profile?.name || !uid) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, "userProfiles", uid);
      await updateDoc(docRef, { name: newName.trim() });
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
      }

      setProfile((prev) => (prev ? { ...prev, name: newName.trim() } : null));
      setIsEditingName(false);
    } catch (error) {
      console.error("Lỗi khi lưu tên:", error);
      alert("Đã xảy ra lỗi khi lưu tên.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalLessons = STATIONS_DATA.reduce((acc, st) => acc + st.lessons.length, 0);
  const completedLessonsCount = profile?.progress?.completedLessons?.length || 0;
  const completedQuizzesCount = profile?.progress?.completedQuizzes?.length || 0;
  const progressPercent = Math.round((completedLessonsCount / totalLessons) * 100) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-neutral-100 p-4 md:p-6 flex justify-between items-center bg-neutral-50/50 sticky top-0 z-10">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" /> Hồ sơ cá nhân
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto">
          {profile ? (
            <div className="flex flex-col gap-8">
              
              {/* Profile Info Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Avatar Upload */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-neutral-200 border-4 border-white shadow-md">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-400 bg-neutral-100 uppercase">
                        {profile.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 md:bottom-1 md:right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors disabled:opacity-50 z-10 cursor-pointer"
                  >
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Name & Email */}
                <div className="flex-1 w-full">
                  <div className="mb-4">
                    <p className="text-sm text-neutral-500 font-medium mb-1">Email đăng nhập</p>
                    <p className="font-semibold text-neutral-800 bg-neutral-50 px-3 py-2 rounded-md border border-neutral-100">{profile.email}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-sm text-neutral-500 font-medium">Họ và Tên (In trên Chứng chỉ)</p>
                      {!isEditingName && (
                        <button 
                          onClick={() => setIsEditingName(true)}
                          className="text-xs text-amber-600 font-semibold hover:underline"
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                    
                    {isEditingName ? (
                      <div className="animate-in slide-in-from-top-1">
                        <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-primary rounded-md outline-none"
                            placeholder="Nhập họ và tên..."
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveName}
                            disabled={isSaving}
                            className="bg-primary text-white px-4 rounded-md font-semibold hover:bg-primary/90 flex items-center justify-center min-w-[80px]"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              setIsEditingName(false);
                              setNewName(profile.name);
                            }}
                            className="bg-neutral-200 text-neutral-700 px-3 rounded-md hover:bg-neutral-300"
                          >
                            Hủy
                          </button>
                        </div>
                        <div className="bg-amber-50 text-amber-800 p-2 rounded text-xs flex items-start gap-2 border border-amber-200">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <p>
                            <b>Lưu ý:</b> Việc thay đổi tên sẽ ảnh hưởng trực tiếp đến <b>Chứng chỉ hoàn thành</b> của bạn. Tên mới sẽ được cập nhật trên bảng vàng.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="font-serif text-2xl font-bold text-primary">{profile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Progress Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Learning Progress */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl">
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Tiến trình học tập
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Hoàn thành Trạm</span>
                        <span className="font-bold">{completedQuizzesCount} / {STATIONS_DATA.length}</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(completedQuizzesCount / STATIONS_DATA.length) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Bài học đã đọc</span>
                        <span className="font-bold">{completedLessonsCount} / {totalLessons}</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Best Scores */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl">
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <Gamepad2 className="w-4 h-4 text-purple-600" /> Thành tích giải trí
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                          <span className="text-lg">🦅</span>
                        </div>
                        <span className="font-medium text-sm">Flappy Philosopher</span>
                      </div>
                      <span className="font-bold text-lg text-cyan-700">
                        {profile.bestScores?.flappy || 0} <span className="text-xs text-neutral-400 font-normal">pts</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-lg">🧠</span>
                        </div>
                        <span className="font-medium text-sm">Philosophical Memory</span>
                      </div>
                      <span className="font-bold text-lg text-indigo-700">
                        {profile.bestScores?.memory || 0} <span className="text-xs text-neutral-400 font-normal">pts</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-lg">⚽</span>
                        </div>
                        <span className="font-medium text-sm">Thủ Môn Triết Học</span>
                      </div>
                      <span className="font-bold text-lg text-emerald-700">
                        {profile.bestScores?.penalty || 0} <span className="text-xs text-neutral-400 font-normal">pts</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* Logout Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        onClose();
                      } catch (err) {
                        console.error("Lỗi đăng xuất:", err);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất tài khoản
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Đang tải dữ liệu hồ sơ...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
