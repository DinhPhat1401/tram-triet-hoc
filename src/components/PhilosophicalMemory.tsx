import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Timer, Award, CheckCircle2, Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft, BookOpen, Sparkles, X } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

interface MemoryCard {
  id: string; // unique card instance ID (e.g., '1-philosopher' or '1-concept')
  pairId: number; // links the philosopher and concept together
  text: string; // content to show (name or quote)
  type: "philosopher" | "concept";
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_PAIRS = [
  {
    id: 1,
    philosopher: "Karl Marx",
    concept: "Chủ nghĩa Duy vật Lịch sử",
    icon: "🧔🏻‍♂️",
    explanation: "Karl Marx sáng lập Chủ nghĩa duy vật lịch sử - phát hiện vĩ đại của triết học giải thích sự phát triển xã hội loài người. Học thuyết khẳng định phương thức sản xuất vật chất là nhân tố quyết định cấu trúc xã hội và tiến trình lịch sử. Trong đó, Lực lượng sản xuất quyết định Quan hệ sản xuất; tổ hợp các quan hệ sản xuất tạo nên Cơ sở hạ tầng kinh tế, từ đó quyết định Kiến trúc thượng tầng (chính trị, pháp luật, tôn giáo, triết học). Sự mâu thuẫn biện chứng giữa lực lượng sản xuất phát triển và quan hệ sản xuất lỗi thời là động lực cốt lõi thúc đẩy các cuộc cách mạng xã hội thay thế các hình thái kinh tế - xã hội từ thấp đến cao."
  },
  {
    id: 2,
    philosopher: "Heraclitus",
    concept: "Mọi thứ đều trôi chảy (Panta Rhei)",
    icon: "🔥",
    explanation: "Heraclitus của Ephesus (Hy Lạp cổ đại) được tôn vinh là người đặt nền móng cho phép biện chứng. Với luận điểm kinh điển 'Panta Rhei' (Vạn vật đều trôi chảy) và ẩn dụ 'Không ai tắm hai lần trên cùng một dòng sông', ông chỉ ra bản chất của vũ trụ là một quá trình vận động, biến đổi không ngừng và vĩnh viễn sinh thành. Triết lý của ông nhấn mạnh sự thống nhất và đấu tranh giữa các mặt đối lập (như ngày và đêm, chiến tranh và hòa bình) chính là nguồn gốc nội tại thúc đẩy sự phát triển của vạn vật dưới sự chi phối của quy luật khách quan Logos."
  },
  {
    id: 3,
    philosopher: "Thales",
    concept: "Nước là bản nguyên vũ trụ",
    icon: "💧",
    explanation: "Thales xứ Miletus được Aristotle tôn vinh là triết gia đầu tiên trong truyền thống triết học Hy Lạp cổ đại. Ông đặt nền móng cho trường phái Miletus bằng việc tìm kiếm 'Arche' (bản nguyên) - chất liệu đầu tiên và cuối cùng cấu thành nên toàn bộ vũ trụ mà không cần viện dẫn các yếu tố thần thoại hay thần thánh. Thales khẳng định bản nguyên ấy chính là Nước (Hydor), bởi ông quan sát thấy mọi sinh vật đều cần độ ẩm để duy trì sự sống, hạt giống của mọi loài có bản chất ẩm ướt, và nước có khả năng chuyển hóa linh hoạt giữa các thể rắn, lỏng, khí."
  },
  {
    id: 4,
    philosopher: "René Descartes",
    concept: "Tôi tư duy, nên tôi tồn tại (Cogito ergo sum)",
    icon: "💭",
    explanation: "René Descartes, cha đẻ của triết học cận đại, đã thiết lập một hệ thống triết học duy lý dựa trên phương pháp 'hoài nghi triệt để' (hoài nghi Descartes). Để tìm kiếm một điểm tựa tri thức tuyệt đối không thể bị lung lay, ông đã hoài nghi tất cả: từ giác quan, thế giới vật lý đến cả toán học. Cuối cùng, ông phát hiện ra rằng: dù có nghi ngờ mọi thứ, bản thân hành vi hoài nghi (hay tư duy) vẫn đang diễn ra. Từ đó dẫn đến mệnh đề bất hủ 'Cogito, ergo sum' (Tôi tư duy, nên tôi tồn tại), khẳng định sự tồn tại tự thân của ý thức/chủ thể tư duy là chân lý tiên nghiệm đầu tiên, làm nền tảng vững chắc cho mọi tri thức khoa học."
  },
  {
    id: 5,
    philosopher: "Democritus",
    concept: "Thuyết Nguyên tử cổ đại",
    icon: "⚛️",
    explanation: "Democritus cùng người thầy Leucippus đã phát triển Thuyết nguyên tử cổ đại - đỉnh cao của triết học duy vật Hy Lạp cổ đại. Ông cho rằng thế giới vật chất được cấu thành từ hai yếu tố: 'Nguyên tử' (Atomos - những hạt vật chất cực kỳ nhỏ bé, không thể phân chia, không thể phá hủy, đồng nhất về chất nhưng khác nhau về hình dáng, kích thước và trật tự sắp xếp) và 'Khoảng không' (chân không, nơi các nguyên tử chuyển động). Mọi sự sinh thành, biến đổi hay tiêu vong của vạn vật trong vũ trụ chỉ đơn thuần là sự tụ hội, phân tách và sắp xếp lại của các hạt nguyên tử này trong không gian."
  },
  {
    id: 6,
    philosopher: "Plato",
    concept: "Thế giới của các Ý niệm",
    icon: "🏛️",
    explanation: "Plato, nhà tư tưởng kiệt xuất của triết học duy tâm khách quan Hy Lạp cổ đại, đã phát triển Thuyết Ý niệm (Theory of Forms). Ông chia thế giới làm hai phần: 'Thế giới của các Ý niệm' (hệ thống các bản mẫu phổ quát, phi vật chất, vĩnh hằng, hoàn mỹ và chân thực) và 'Thế giới cảm tính/vật chất' (thế giới ta nhìn thấy, sờ thấy, vốn chỉ là những bản sao mờ nhạt, biến đổi và không chân thực của thế giới ý niệm). Qua câu chuyện ngụ ngôn nổi tiếng 'Hang động', Plato nhấn mạnh nhiệm vụ của triết học là giải thoát tư duy khỏi ảo ảnh của thế giới vật chất để vươn tới nhận thức chân lý tối thượng trong thế giới Ý niệm."
  },
  {
    id: 7,
    philosopher: "Socrates",
    concept: "Tôi biết rằng tôi không biết gì cả",
    icon: "🗣️",
    explanation: "Socrates là nhân vật chuyển hướng lịch sử triết học Hy Lạp cổ đại từ tìm hiểu tự nhiên sang khám phá con người và đạo đức học. Phát ngôn nghịch lý nổi tiếng 'Tôi biết rằng tôi không biết gì cả' phản ánh sự khiêm tốn trí tuệ sâu sắc và là khởi điểm cho phương pháp hộ sinh (Maieutics) - nghệ thuật đàm thoại phản biện. Bằng cách đặt câu hỏi liên tục để đẩy đối phương đến chỗ tự phát hiện ra mâu thuẫn trong lập luận của chính mình, Socrates giúp họ tự nhận ra giới hạn của tri thức bản thân, từ đó giải phóng tâm trí khỏi các định kiến sai lầm để tự mình khám phá chân lý bên trong."
  },
  {
    id: 8,
    philosopher: "V.I. Lenin",
    concept: "Thực tại khách quan độc lập với ý thức",
    icon: "👨🏻‍🦲",
    explanation: "Trong tác phẩm kinh điển 'Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán' (1909), V.I. Lenin đã đưa ra định nghĩa khoa học, toàn diện về vật chất nhằm chống lại chủ nghĩa duy tâm và khủng hoảng vật lý học đương thời: 'Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh và tồn tại không lệ thuộc vào cảm giác'. Định nghĩa này khẳng định thuộc tính cơ bản nhất của vật chất là tồn tại khách quan bên ngoài và độc lập với ý thức con người, đồng thời khẳng định con người hoàn toàn có khả năng nhận thức được thế giới khách quan."
  }
];

// Sound Synthesizer via Web Audio API
const playSound = (type: "click" | "match" | "mismatch" | "victory", soundEnabled: boolean) => {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "match") {
      // Ascending pleasant chord
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.25);
      });
    } else if (type === "mismatch") {
      // Descending low tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      // Filter high frequencies to make it softer
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "victory") {
      // Sparkly victory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.4);
      });
    }
  } catch (e) {
    console.error("Audio Context initialization failed", e);
  }
};

interface PhilosophicalMemoryProps {
  onBackToHub: () => void;
}

export default function PhilosophicalMemory({ onBackToHub }: PhilosophicalMemoryProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // holds indices
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [matchedExplanations, setMatchedExplanations] = useState<string[]>([]);
  const [activeExplanation, setActiveExplanation] = useState<{
    philosopher: string;
    concept: string;
    icon: string;
    explanation: string;
  } | null>(null);

  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem("memory_best_score") || "0", 10));

  const [isStudyPhase, setIsStudyPhase] = useState(true);
  const [isRevealPhase, setIsRevealPhase] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState(10);
  const [isVictoryModalDismissed, setIsVictoryModalDismissed] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const fetchBestScore = async () => {
        try {
          const docRef = doc(db, "userProfiles", auth.currentUser!.uid);
          const snap = await getDoc(docRef);
          const bestFromDb = snap.exists() ? (snap.data().bestScores?.memory || 0) : 0;
            setBestScore(prev => {
              const newBest = Math.max(prev, bestFromDb);
              localStorage.setItem('memory_best_score', newBest.toString());
              if (prev > bestFromDb) {
                setDoc(docRef, { uid: auth.currentUser!.uid, bestScores: { memory: prev } }, { merge: true }).catch(console.error);
              }
              return newBest;
            });
        } catch (e) {
          console.error("Lỗi lấy điểm cao Memory:", e);
        }
      };
      fetchBestScore();
    }
  }, []);

  // Reveal countdown effect
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    let finishTimeout: NodeJS.Timeout;

    if (isRevealPhase) {
      countdownInterval = setInterval(() => {
        setRevealCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      finishTimeout = setTimeout(() => {
        setIsRevealPhase(false);
        setCards((prevCards) =>
          prevCards.map((card) => ({ ...card, isFlipped: false }))
        );
        setIsPlaying(true); // Start gameplay
      }, 10000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (finishTimeout) clearTimeout(finishTimeout);
    };
  }, [isRevealPhase]);

  // Initialize and shuffle cards
  const initializeGame = () => {
    const formattedCards: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((item) => {
      // Add philosopher card (start flipped)
      formattedCards.push({
        id: `${item.id}-philosopher`,
        pairId: item.id,
        text: item.philosopher,
        type: "philosopher",
        icon: item.icon,
        isFlipped: true,
        isMatched: false,
      });
      // Add concept card (start flipped)
      formattedCards.push({
        id: `${item.id}-concept`,
        pairId: item.id,
        text: item.concept,
        type: "concept",
        icon: item.icon,
        isFlipped: true,
        isMatched: false,
      });
    });

    // Shuffle cards using Fisher-Yates algorithm
    for (let i = formattedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [formattedCards[i], formattedCards[j]] = [formattedCards[j], formattedCards[i]];
    }

    setCards(formattedCards);
    setSelectedCards([]);
    setMoves(0);
    setTimer(0);
    setIsPlaying(false); // Do not run timer yet
    setIsStudyPhase(false);
    setIsRevealPhase(true);
    setRevealCountdown(10);
    setMatchedExplanations([]);
    setActiveExplanation(null);
    setIsVictoryModalDismissed(false);
  };

  // Start game on mount
  useEffect(() => {
    // wait for study phase to complete before starting game
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Fullscreen change handler and auto-enter fullscreen on mount
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Auto-enter fullscreen
    if (gameContainerRef.current) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        console.warn("Auto-fullscreen blocked or failed:", err);
      });
    }

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Lỗi khi chuyển chế độ toàn màn hình:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Card click handler
  const handleCardClick = (index: number) => {
    if (!isPlaying || isRevealPhase) return;
    // Don't click already flipped, matched, or if we already selected 2 cards
    if (cards[index].isFlipped || cards[index].isMatched || selectedCards.length >= 2) return;

    playSound("click", soundEnabled);

    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      // Check for match
      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // MATCH FOUND
        const matchedStateCards = [...updatedCards];
        matchedStateCards[firstIdx].isMatched = true;
        matchedStateCards[secondIdx].isMatched = true;
        const allMatched = matchedStateCards.every((card) => card.isMatched);

        // Save score synchronously immediately to prevent loss if unmounted during animation
        if (allMatched) {
          const finalTime = timer;
          const finalMoves = moves + 1;
          const finalScore = Math.max(100, 10000 - (finalMoves * 100) - (finalTime * 15));
          
          setBestScore((currentBest) => {
            if (finalScore > currentBest) {
              localStorage.setItem("memory_best_score", finalScore.toString());
              if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                const docRef = doc(db, "userProfiles", uid);
                setDoc(docRef, { uid, bestScores: { memory: finalScore } }, { merge: true }).catch(console.error);
              }
              return finalScore;
            }
            return currentBest;
          });
        }

        setTimeout(() => {
          playSound("match", soundEnabled);
          setCards(matchedStateCards);
          setSelectedCards([]);

          // Show exegesis explanation
          const pairDetails = MEMORY_PAIRS.find((p) => p.id === card1.pairId);
          if (pairDetails) {
            setActiveExplanation(pairDetails);
            setMatchedExplanations((prev) => [
              pairDetails.philosopher,
              ...prev.filter((p) => p !== pairDetails.philosopher)
            ]);
          }

          // Check Win Condition UI updates
          if (allMatched) {
            setIsPlaying(false);
            playSound("victory", soundEnabled);
          }
        }, 500);
      } else {
        // MISMATCH
        setTimeout(() => {
          playSound("mismatch", soundEnabled);
          const resetFlippedCards = [...updatedCards];
          resetFlippedCards[firstIdx].isFlipped = false;
          resetFlippedCards[secondIdx].isFlipped = false;
          setCards(resetFlippedCards);
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainSecs.toString().padStart(2, "0")}`;
  };

  if (isStudyPhase) {
    return (
      <div 
        ref={gameContainerRef}
        className={`w-full max-w-4xl mx-auto flex flex-col items-center justify-center bg-radial from-neutral-900 via-neutral-950 to-black p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 font-sans overflow-y-auto ${
          isFullscreen ? "fixed inset-0 z-[9999] rounded-none p-8" : "relative"
        }`}
      >
        <div className="flex w-full justify-between items-center mb-6 z-10 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm md:text-lg font-serif font-bold text-neutral-100">Trí Tuệ Đối Hoàn</h2>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="z-10 w-full max-w-4xl bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-6 text-center overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <div>
            <h3 className="text-xl font-serif font-bold text-amber-400 mb-2">Ôn Tập Kiến Thức</h3>
            <p className="text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed">Hãy đọc qua các cặp nhà triết học và quan điểm nổi bật dưới đây. Khi bạn đã sẵn sàng thử thách trí nhớ của mình, nhấn "Bắt đầu ghi nhớ" để vào trò chơi!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEMORY_PAIRS.map((pair) => (
              <div key={pair.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-3 text-left hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-white/5 p-2 rounded-xl border border-white/10">{pair.icon}</span>
                  <div>
                    <h4 className="font-serif font-bold text-amber-300 text-sm">{pair.philosopher}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-bold">{pair.concept}</p>
                  </div>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
                
                <p className="text-xs text-neutral-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {pair.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={initializeGame}
            className="w-full sm:w-auto mx-auto mt-2 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold text-sm py-3.5 px-8 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            Bắt đầu ghi nhớ 10s <Timer className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={gameContainerRef}
      className={`w-full max-w-4xl mx-auto flex flex-col items-center bg-radial from-neutral-900 via-neutral-950 to-black p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 overflow-y-auto ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none p-4 md:p-8" : "relative"
      }`}
    >
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-5 flex-wrap gap-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition flex items-center gap-1.5 text-xs cursor-pointer font-sans"
            title="Quay lại danh sách game"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          
          <h3 className="font-serif font-bold text-amber-400 text-lg flex items-center gap-2 tracking-wide">
            <Sparkles className="w-5 h-5 animate-spin-slow text-amber-400" /> Trí Tuệ Đối Hoàn
          </h3>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-300 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>Thời gian: {formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lượt lật: {moves}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-amber-400 font-bold">
            <span>Điểm: {Math.max(100, 10000 - (moves * 100) - (timer * 15))}</span>
          </div>
          {bestScore > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-emerald-400 font-bold">
              <span>Kỷ lục: {bestScore}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? "Thu nhỏ màn hình" : "Phóng to toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={initializeGame}
            className="p-2 bg-amber-500 hover:bg-amber-400 border border-amber-500 hover:border-amber-400 rounded-xl text-neutral-900 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Chơi lại ván mới"
          >
            <RefreshCw className="w-4 h-4" /> Chơi lại
          </button>
        </div>
      </div>

      {/* Game Content Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch z-10">
        
        {/* Memory Grid Area */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center">
          {isRevealPhase ? (
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl text-xs text-amber-300 font-bold animate-pulse text-center w-full max-w-lg mb-4 flex items-center justify-center gap-2 font-mono">
              <span>🧠 Hãy ghi nhớ các thẻ bài:</span>
              <span className="text-sm text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30 font-bold">{revealCountdown}s</span>
            </div>
          ) : (
            <div className="h-10 mb-4 hidden lg:block"></div> /* Small spacing spacer to align layout */
          )}
          
          <div className="grid grid-cols-4 gap-3 w-full max-w-lg aspect-square">
            {cards.map((card, index) => {
              const isOpen = card.isFlipped || card.isMatched;
              
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className="relative w-full aspect-square rounded-2xl cursor-pointer hover:scale-105 active:scale-95"
                  disabled={card.isMatched || !isPlaying}
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                    transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  {/* Card Back */}
                  <div 
                    className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center border shadow-lg transition-all ${
                      isPlaying 
                        ? "bg-gradient-to-br from-neutral-800 to-neutral-900 border-white/10 hover:border-amber-400/50 shadow-amber-500/5" 
                        : "bg-neutral-800/40 border-neutral-700/30 opacity-60"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      position: "absolute",
                      inset: 0
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 shadow-inner group">
                      <HelpCircle className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 transition-colors duration-300" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-serif font-bold">Trạm Học</span>
                  </div>

                  {/* Card Front */}
                  <div 
                    className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-2 text-center border shadow-xl ${
                      card.isMatched
                        ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-200 shadow-emerald-500/10"
                        : card.type === "philosopher"
                        ? "bg-sky-950/80 border-sky-500/50 text-sky-100"
                        : "bg-purple-950/80 border-purple-500/50 text-purple-100"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      position: "absolute",
                      inset: 0,
                      transform: "rotateY(180deg)"
                    }}
                  >
                    {/* Top small icon */}
                    <span className="text-xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{card.icon}</span>
                    
                    {/* Text content */}
                    <p className={`font-medium leading-normal tracking-wide text-center select-none ${
                      card.type === "philosopher" 
                        ? "font-serif text-xs sm:text-sm font-bold" 
                        : "font-sans text-[10px] sm:text-xs leading-tight opacity-90"
                    }`}>
                      {card.text}
                    </p>
                    
                    {/* Role badge */}
                    <span className={`absolute bottom-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                      card.isMatched
                        ? "bg-emerald-500/20 text-emerald-300"
                        : card.type === "philosopher"
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {card.isMatched ? "Đã ghép" : card.type === "philosopher" ? "Triết gia" : "Tư tưởng"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exegesis & Explanations Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col min-h-[300px] overflow-hidden">
            <h4 className="font-serif font-bold text-neutral-200 text-sm border-b border-white/10 pb-2 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Bản Thể Khải Luận
            </h4>

            {activeExplanation ? (
              <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-white/5 p-2 rounded-xl border border-white/10">
                      {activeExplanation.icon}
                    </span>
                    <div>
                      <h5 className="font-serif font-bold text-amber-300 text-sm">{activeExplanation.philosopher}</h5>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-bold">{activeExplanation.concept}</p>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
                  
                  <p className="text-xs text-neutral-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {activeExplanation.explanation}
                  </p>
                </div>

                <div className="bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl flex items-start gap-2 text-[10px] text-amber-300/90 leading-normal mt-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Chúc mừng! Bạn đã tìm được một cặp trùng khớp để mở khóa tri thức này. Tìm tiếp các cặp khác nhé!
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                  <HelpCircle className="w-6 h-6 animate-pulse text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                  Lật thẻ bài và ghép đúng cặp Triết gia với Tư tưởng tương ứng để nhận giải nghĩa học thuật tại đây.
                </p>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Victory Overlay Absolute Modal */}
      {!isPlaying && cards.length > 0 && cards.every(c => c.isMatched) && !isVictoryModalDismissed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in rounded-3xl">
          <div className="bg-gradient-to-br from-emerald-950/95 to-neutral-900/95 border border-emerald-500/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale-up relative">
            <button
              onClick={() => setIsVictoryModalDismissed(true)}
              className="absolute top-4 right-4 text-emerald-500/50 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-3xl animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              🎉
            </div>
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-emerald-300 text-2xl">Học Thuyết Hài Hòa!</h4>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans text-center">
                Chúc mừng bạn đã hoàn thành thử thách Lật Bài Triết Học trong <b>{formatTime(timer)}</b> với <b>{moves}</b> lượt lật.
              </p>
              
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 mt-4">
                <p className="text-xs text-neutral-400 mb-1 uppercase tracking-widest font-bold">Điểm số đạt được</p>
                <p className="text-3xl text-amber-400 font-mono font-bold drop-shadow-md">
                  {Math.max(100, 10000 - (moves * 100) - (timer * 15))}
                </p>
              </div>

              {Math.max(100, 10000 - (moves * 100) - (timer * 15)) >= bestScore && bestScore > 0 && (
                <p className="text-xs text-emerald-400 font-bold animate-pulse mt-2 py-1 bg-emerald-500/10 rounded-lg inline-block px-3">🎉 KỶ LỤC ĐIỂM SỐ MỚI!</p>
              )}
            </div>
            
            <button
              onClick={initializeGame}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <RefreshCw className="w-5 h-5" /> Chơi Ván Mới
            </button>
          </div>
        </div>
      )}

      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
    </div>
  );
}
