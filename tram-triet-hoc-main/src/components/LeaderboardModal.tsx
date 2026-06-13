import React, { useState, useEffect } from "react";
import { X, Trophy, Medal, Star, Gamepad2, Brain, Activity } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameTab = "flappy" | "memory" | "penalty";

interface LeaderboardEntry {
  uid: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  score: number;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<GameTab>("flappy");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, "userProfiles");
        const q = query(
          usersRef,
          orderBy(`bestScores.${activeTab}`, "desc"),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const data: LeaderboardEntry[] = [];
        snapshot.forEach((doc) => {
          const profile = doc.data();
          const score = profile.bestScores?.[activeTab] || 0;
          if (score > 0) {
            data.push({
              uid: profile.uid,
              name: profile.name,
              email: profile.email,
              avatarUrl: profile.avatarUrl,
              score,
            });
          }
        });

        setLeaderboardData(data);
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err.message || "Không thể tải bảng xếp hạng lúc này.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const renderRankIcon = (index: number) => {
    if (index === 0) return <Medal className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
    if (index === 1) return <Medal className="w-6 h-6 text-neutral-300 drop-shadow-md" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-md" />;
    return <span className="text-sm font-bold text-neutral-400 w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 animate-scale-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-neutral-950/50 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold font-serif text-white tracking-wide">Bảng Xếp Hạng</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-4 gap-2 bg-neutral-950/30 overflow-x-auto border-b border-neutral-800 custom-scrollbar">
          <button
            onClick={() => setActiveTab("flappy")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "flappy" 
                ? "text-sky-400 border-sky-400 bg-sky-400/5" 
                : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> Flappy Philosopher
          </button>
          <button
            onClick={() => setActiveTab("memory")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "memory" 
                ? "text-amber-400 border-amber-400 bg-amber-400/5" 
                : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <Brain className="w-4 h-4" /> Trí Tuệ Đối Hoàn
          </button>
          <button
            onClick={() => setActiveTab("penalty")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "penalty" 
                ? "text-emerald-400 border-emerald-400 bg-emerald-400/5" 
                : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <Activity className="w-4 h-4" /> Penalty Goalkeeper
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-neutral-900/50 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4 py-12">
              <Trophy className="w-8 h-8 animate-pulse text-amber-500/50" />
              <p className="text-sm">Đang tải bảng xếp hạng...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2 py-12">
              <p className="text-sm font-bold">{error}</p>
              <button 
                onClick={() => setActiveTab(activeTab)} 
                className="text-xs text-neutral-400 underline hover:text-neutral-300 cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-3 py-12">
              <Star className="w-12 h-12 text-neutral-700" />
              <p className="text-sm">Chưa có ai ghi điểm ở trò chơi này.</p>
              <p className="text-xs">Hãy chơi thử và trở thành người dẫn đầu!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((user, index) => (
                <div 
                  key={user.uid} 
                  className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-colors ${
                    index === 0 
                      ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                      : index === 1
                      ? "bg-neutral-100/5 border-neutral-100/20"
                      : index === 2
                      ? "bg-amber-700/10 border-amber-700/20"
                      : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8">
                      {renderRankIcon(index)}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name || "User"} 
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            index === 0 ? "border-amber-400" : index === 1 ? "border-neutral-300" : index === 2 ? "border-amber-600" : "border-neutral-700"
                          }`}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                          index === 0 ? "bg-amber-900/50 text-amber-400 border-amber-400" : index === 1 ? "bg-neutral-800 text-neutral-300 border-neutral-400" : index === 2 ? "bg-amber-950 text-amber-600 border-amber-700" : "bg-neutral-800 text-neutral-500 border-neutral-700"
                        }`}>
                          {(user.name || user.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className={`font-bold text-sm md:text-base ${
                          index === 0 ? "text-amber-400" : index === 1 ? "text-neutral-200" : index === 2 ? "text-amber-500" : "text-neutral-300"
                        }`}>
                          {user.name || user.email?.split("@")[0] || "Người chơi bí ẩn"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className={`font-mono font-bold text-lg md:text-xl drop-shadow-sm ${
                      index === 0 ? "text-amber-400" : index === 1 ? "text-neutral-200" : index === 2 ? "text-amber-500" : "text-emerald-400"
                    }`}>
                      {user.score.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Điểm</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
