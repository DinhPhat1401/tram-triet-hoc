import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, BookOpen, CheckCircle, XCircle, ArrowLeft, Timer, Award, AlertTriangle, ChevronRight, ShieldCheck, Target, Maximize2, Minimize2 } from 'lucide-react';
import { PHILOSOPHY_QUIZ, QuizQuestion } from '../data/quizData';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface PenaltyGoalkeeperProps {
  onBackToHub: () => void;
}

export default function PenaltyGoalkeeper({ onBackToHub }: PenaltyGoalkeeperProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'animating' | 'explanation' | 'game_over'>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('penalty_best') || '0', 10));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Animation states
  const [ballPos, setBallPos] = useState<{ x: string, y: string, scale: number }>({ x: '50%', y: '90%', scale: 1 });
  const [keeperPos, setKeeperPos] = useState<{ x: string, rotate: number }>({ x: '50%', rotate: 0 });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const fetchBestScore = async () => {
        try {
          const docRef = doc(db, "userProfiles", auth.currentUser!.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const penaltyBest = snap.data().bestScores?.penalty || 0;
            setBestScore(prev => {
              const newBest = Math.max(prev, penaltyBest);
              localStorage.setItem('penalty_best', newBest.toString());
              return newBest;
            });
          }
        } catch (e) {
          console.error("Lỗi lấy điểm cao Penalty:", e);
        }
      };
      fetchBestScore();
    }
  }, []);

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

  const saveBestScoreIfNeeded = (finalScore: number) => {
    setBestScore(currentBest => {
      if (finalScore > currentBest) {
        localStorage.setItem("penalty_best", finalScore.toString());
        if (auth.currentUser) {
          const uid = auth.currentUser.uid;
          const docRef = doc(db, "userProfiles", uid);
          setDoc(docRef, { uid, bestScores: { penalty: finalScore } }, { merge: true }).catch(console.error);
        }
        return finalScore;
      }
      return currentBest;
    });
  };

  const startGame = () => {
    // Shuffle and pick 10
    const shuffled = [...PHILOSOPHY_QUIZ].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
    resetPositions();
    startTimer();
  };

  const resetPositions = () => {
    setBallPos({ x: '50%', y: '85%', scale: 1 }); // Penalty spot
    setKeeperPos({ x: '50%', rotate: 0 }); // Center goal
  };

  const startTimer = () => {
    setTimeLeft(90);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    triggerAnimationAndResult(null, false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (gameState !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const currentQ = questions[currentQuestionIndex];
    const correct = optionIndex === currentQ.correctAnswerIndex;
    triggerAnimationAndResult(optionIndex, correct);
  };

  const triggerAnimationAndResult = (optionIndex: number | null, correct: boolean) => {
    setGameState('animating');
    setSelectedAnswer(optionIndex);
    setIsCorrect(correct);

    let earnedPoints = 0;
    if (correct) {
      earnedPoints = 100 + timeLeft;
      const newScore = score + earnedPoints;
      setScore(newScore);
      saveBestScoreIfNeeded(newScore);
    }

    // Determine animation target
    // If correct: Ball goes center, Keeper stays center to catch
    // If incorrect: Ball goes top-left/right, Keeper dives opposite
    const isLeft = Math.random() > 0.5;

    if (correct) {
      // Caught
      setBallPos({ x: '50%', y: '35%', scale: 0.6 });
      setKeeperPos({ x: '50%', rotate: 0 });
    } else {
      // Missed / Goal
      setBallPos({ x: isLeft ? '20%' : '80%', y: '25%', scale: 0.5 }); // Top corner
      setKeeperPos({ x: isLeft ? '80%' : '20%', rotate: isLeft ? 90 : -90 }); // Dive opposite
    }

    // Wait for animation, then show explanation
    setTimeout(() => {
      setGameState('explanation');
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex >= 9) {
      setGameState('game_over');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetPositions();
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState('playing');
      startTimer();
    }
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div 
      ref={gameContainerRef}
      className={`w-full max-w-2xl mx-auto flex flex-col items-center bg-radial from-emerald-800 via-emerald-950 to-neutral-950 p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none p-8" : "relative min-h-[600px]"
      }`}
    >
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-wrap gap-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition flex items-center gap-1.5 text-xs cursor-pointer font-sans"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          
          <h3 className="font-serif font-bold text-amber-400 text-lg flex items-center gap-2 tracking-wide">
            ⚽ Bắt Penalty Triết Học
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-300 flex-wrap">
          {gameState !== 'idle' && (
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>Lượt: {Math.min(currentQuestionIndex + 1, 10)}/10</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-amber-400 font-bold">
            <span>Điểm: {score}</span>
          </div>
          {bestScore > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-emerald-400 font-bold">
              <span>Kỷ lục: {bestScore}</span>
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* GAME AREA */}
      <div className="w-full flex-1 flex flex-col relative z-10">
        
        {/* FOOTBALL FIELD & GOAL */}
        {(gameState === 'playing' || gameState === 'animating' || gameState === 'explanation') && (
          <div className="relative w-full h-[250px] mb-4 bg-emerald-700/30 rounded-2xl border-2 border-white/20 overflow-hidden flex-shrink-0 flex flex-col justify-end perspective-[800px]">
            {/* Field lines */}
            <div className="absolute inset-0 border-x-4 border-t-4 border-white/20 mx-12 mt-4 opacity-50 transform origin-bottom perspective-100 rotateX-12"></div>
            
            {/* Goal Post */}
            <div className="absolute top-4 left-[15%] right-[15%] h-[120px] border-t-8 border-x-8 border-white/90 shadow-2xl z-10">
              {/* Net pattern */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}></div>
            </div>

            {/* Goalkeeper */}
            <motion.div
              className="absolute text-5xl z-20 origin-bottom"
              animate={{
                left: keeperPos.x,
                rotate: keeperPos.rotate,
                bottom: keeperPos.rotate !== 0 ? '10%' : '30%',
                x: '-50%'
              }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
            >
              🧤
            </motion.div>

            {/* Ball */}
            <motion.div
              className="absolute text-3xl z-30"
              animate={{
                left: ballPos.x,
                top: ballPos.y,
                scale: ballPos.scale,
                x: '-50%',
                y: '-50%'
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              ⚽
            </motion.div>
          </div>
        )}

        {/* UI OVERLAYS */}
        {gameState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-amber-200">
              <span className="text-4xl">⚽</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-amber-400 mb-4">Sút Phạt Luân Lưu Triết Học</h2>
            <p className="text-neutral-300 text-sm max-w-sm mb-8 leading-relaxed">
              Bạn là thủ môn triết học! Đối phương sẽ sút 10 quả penalty bằng những câu hỏi hóc búa. 
              Hãy trả lời đúng để bắt gọn bóng. Thời gian càng nhanh, điểm cản phá càng cao!
            </p>
            <button
              onClick={startGame}
              className="bg-primary hover:bg-neutral-900 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <Play className="w-5 h-5" /> Bắt đầu trận đấu
            </button>
          </div>
        )}

        {gameState === 'playing' && currentQ && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Cú sút thứ {currentQuestionIndex + 1}</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-bold ${timeLeft > 30 ? 'text-emerald-400 bg-emerald-400/10' : timeLeft > 10 ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10 animate-pulse'}`}>
                <Timer className="w-4 h-4" />
                {timeLeft}s
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl border-b-4 border-neutral-200 mb-4 flex-shrink-0">
              <p className="text-sm md:text-base font-medium text-neutral-800 leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 text-left transition-all text-sm text-neutral-100 hover:border-amber-400/50 group cursor-pointer flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-white/10 text-neutral-400 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-amber-400 group-hover:text-primary transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed pt-0.5">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'animating' || gameState === 'explanation') && currentQ && (
          <div className="flex-1 flex flex-col bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-slide-up border border-neutral-100">
            {isCorrect === true && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            )}
            {isCorrect === false && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {isCorrect ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className={`font-serif font-bold text-lg md:text-xl ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isCorrect ? 'Cản phá xuất thần! 🧤' : 'Vào lưới mất rồi! ⚽'}
                </h3>
                {isCorrect && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    +100 điểm & +{timeLeft} điểm thưởng thời gian
                  </p>
                )}
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 md:p-5 border border-neutral-100 text-sm text-neutral-700 leading-relaxed flex-1 overflow-y-auto">
              <div className="mb-4 space-y-3">
                {isCorrect === false && selectedAnswer !== null && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Bạn đã chọn:</span>
                    <span className="font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 inline-block line-through opacity-80">
                      {currentQ.options[selectedAnswer]}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Đáp án chính xác:</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 inline-block">
                    {currentQ.options[currentQ.correctAnswerIndex]}
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-neutral-200 my-4"></div>
              <p className="italic text-neutral-600">
                <BookOpen className="w-4 h-4 inline-block mr-2 text-primary" />
                {currentQ.explanation}
              </p>
            </div>

            {gameState === 'explanation' && (
              <button
                onClick={nextQuestion}
                className="w-full mt-4 bg-primary hover:bg-neutral-900 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {currentQuestionIndex < 9 ? 'Cú sút tiếp theo' : 'Xem kết quả'} <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {gameState === 'game_over' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl shadow-2xl animate-fade-in border border-neutral-100">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-100">
              <Award className="w-12 h-12 text-amber-500" />
            </div>
            
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">Tiếng Còi Mãn Cuộc!</h2>
            <p className="text-neutral-500 text-sm mb-8">Bạn đã cản phá xong 10 loạt sút luân lưu triết học.</p>
            
            <div className="bg-neutral-50 w-full max-w-sm rounded-2xl p-6 border border-neutral-100 mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Tổng Điểm Trận Đấu</span>
                <span className="text-3xl font-bold text-amber-500 font-mono">{score}</span>
              </div>
              {score >= bestScore && score > 0 && (
                <div className="bg-amber-100 text-amber-800 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 animate-pulse">
                  <span className="text-base">🏆</span> Kỷ lục cản phá mới!
                </div>
              )}
            </div>
            
            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={onBackToHub}
                className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Về phòng thay đồ
              </button>
              <button
                onClick={startGame}
                className="flex-1 px-4 py-3 bg-primary hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Bắt lại trận khác
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
