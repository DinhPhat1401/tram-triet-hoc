import React, { useState } from "react";
import { X, AlertTriangle, User, Mail, Lock, Loader2 } from "lucide-react";
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  db,
  handleFirestoreError,
  OperationType
} from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  closable?: boolean;
}

export default function AuthModal({ isOpen, onClose, onSuccess, closable = true }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Đăng nhập
        await signInWithEmailAndPassword(auth, email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Đăng ký
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setIsLoading(false);
          return;
        }
        if (!fullName.trim()) {
          setError("Vui lòng nhập Họ và Tên.");
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Cập nhật Profile trong Firebase Auth
        await updateProfile(user, {
          displayName: fullName.trim()
        });

        // Tạo UserProfile trong Firestore
        const profileRef = doc(db, "userProfiles", user.uid);
        try {
          await setDoc(profileRef, {
            uid: user.uid,
            name: fullName.trim(),
            email: user.email,
            role: "Sinh viên", // Mặc định
            createdAt: serverTimestamp()
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `userProfiles/${user.uid}`);
        }

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email này đã được sử dụng.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email không hợp lệ.");
      } else if (err.code === "auth/weak-password") {
        setError("Mật khẩu quá yếu, vui lòng chọn mật khẩu dài hơn.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError("Đã xảy ra lỗi: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={() => { if (closable) onClose(); }}
      />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
        {closable && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-serif font-bold text-primary mb-2 text-center">
            {isLogin ? "Đăng nhập Trạm Học" : "Đăng ký thành viên"}
          </h2>
          <p className="text-center text-neutral-500 mb-6 text-sm">
            {isLogin
              ? "Tiếp tục hành trình khám phá triết học của bạn."
              : "Tạo tài khoản để lưu trữ tiến trình và cấp chứng chỉ."}
          </p>

          {!isLogin && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block mb-1">CẢNH BÁO QUAN TRỌNG:</span>
                Vui lòng nhập <b>chính xác Họ và Tên thật</b> của bạn. Tên này sẽ được sử dụng cố định cho việc <b>in Chứng chỉ hoàn thành khóa học</b>.
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-neutral-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg mt-2 transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Đăng nhập"
              ) : (
                "Đăng ký tài khoản"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={toggleMode}
              className="text-amber-600 hover:text-amber-700 font-bold hover:underline"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
