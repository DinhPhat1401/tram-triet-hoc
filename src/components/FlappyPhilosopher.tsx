import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bird, AlertTriangle, Play, RefreshCw, BookOpen, CheckCircle, XCircle, Star, ShieldAlert, Sparkles, Lock, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { PHILOSOPHY_QUIZ, QuizQuestion } from '../data/quizData';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const GRAVITY = 0.15;
const JUMP_STRENGTH = -4.5;
const BASE_PIPE_SPEED = 1.5;
const BASE_PIPE_SPAWN_RATE = 160; // in frames
const BIRD_SIZE = 36;
const PIPE_WIDTH = 60;
const GAP_SIZE = 180;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const STAR_SIZE = 24;

const SKINS = {
  bird: { icon: '🦅', name: 'Tân binh', requirement: 0 },
  marx: { icon: '🧔🏻‍♂️', name: 'Karl Marx', requirement: 20 },
  lenin: { icon: '👨🏻‍🦲', name: 'V.I. Lenin', requirement: 50 },
};

type SkinType = keyof typeof SKINS;

interface FlappyPhilosopherProps {
  onBackToHub: () => void;
}

export default function FlappyPhilosopher({ onBackToHub }: FlappyPhilosopherProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'quiz' | 'boss_quiz' | 'dead' | 'countdown'>('idle');
  const [countdownValue, setCountdownValue] = useState(3);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('flappy_best') || '0', 10));
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [activeSkin, setActiveSkin] = useState<SkinType>('bird');
  const [revivesUsed, setRevivesUsed] = useState(0);
  const MAX_REVIVES = 10;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const fetchBestScore = async () => {
        try {
          const docRef = doc(db, "userProfiles", auth.currentUser!.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const flappyBest = snap.data().bestScores?.flappy || 0;
            setBestScore(prev => {
              const newBest = Math.max(prev, flappyBest);
              localStorage.setItem('flappy_best', newBest.toString());
              return newBest;
            });
          }
        } catch (e) {
          console.error("Lỗi lấy điểm cao Flappy:", e);
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

  // Use refs for high-frequency game state to avoid stale closures
  const scoreRef = useRef(0);
  const birdY = useRef(GAME_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<Array<{ x: number; topHeight: number; passed: boolean }>>([]);
  const stars = useRef<Array<{ x: number; y: number; collected: boolean }>>([]);
  const particles = useRef<Array<{ id: number; x: number; y: number; text: string; opacity: number; life: number }>>([]);
  const frameCount = useRef(0);
  const particleIdCounter = useRef(0);
  const isInvulnerable = useRef(false);
  const invulnerableTimer = useRef(0);
  const lastBossScore = useRef(-1);
  const requestRef = useRef<number>();

  // For rendering
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    localStorage.setItem('flappy_best', bestScore.toString());
  }, [bestScore]);

  const saveBestScoreIfNeeded = useCallback(() => {
    if (scoreRef.current > 0) {
      setBestScore((currentBest) => {
        if (scoreRef.current > currentBest) {
          localStorage.setItem('flappy_best', scoreRef.current.toString());
          if (auth.currentUser) {
            const uid = auth.currentUser.uid;
            const docRef = doc(db, "userProfiles", uid);
            setDoc(docRef, { uid, bestScores: { flappy: scoreRef.current } }, { merge: true }).catch(console.error);
          }
          return scoreRef.current;
        }
        return currentBest;
      });
    }
  }, []);

  // Save on unmount to prevent lost scores
  useEffect(() => {
    return () => {
      saveBestScoreIfNeeded();
    };
  }, [saveBestScoreIfNeeded]);

  const addScore = (points: number) => {
    scoreRef.current += points;
    setScore(scoreRef.current);
  };

  const spawnParticle = (x: number, y: number, text: string) => {
    particles.current.push({
      id: particleIdCounter.current++,
      x,
      y,
      text,
      opacity: 1,
      life: 60 // 1 second at 60fps
    });
  };

  const startGame = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('countdown');
      setCountdownValue(3);
    }
  }, [gameState]);

  const jump = useCallback(() => {
    if (gameState === 'idle') {
      startGame();
    } else if (gameState === 'playing') {
      birdVelocity.current = JUMP_STRENGTH;
    }
  }, [gameState, startGame]);

  const resetGame = () => {
    birdY.current = GAME_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [];
    stars.current = [];
    particles.current = [];
    frameCount.current = 0;
    isInvulnerable.current = false;
    lastBossScore.current = -1;
    scoreRef.current = 0;
    setScore(0);
    setGameState('idle');
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setRevivesUsed(0);
  };

  const spawnEntities = () => {
    const minHeight = 50;
    const maxHeight = GAME_HEIGHT - GAP_SIZE - 50;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.current.push({ x: GAME_WIDTH, topHeight, passed: false });

    // 50% chance to spawn a star between pipes
    if (Math.random() > 0.5) {
      stars.current.push({
        x: GAME_WIDTH + PIPE_WIDTH / 2 - STAR_SIZE / 2,
        y: topHeight + GAP_SIZE / 2 - STAR_SIZE / 2,
        collected: false
      });
    }
  };

  const checkCollisions = () => {
    const birdRect = {
      left: 50,
      right: 50 + BIRD_SIZE,
      top: birdY.current,
      bottom: birdY.current + BIRD_SIZE,
    };

    // Check Star Collisions
    stars.current.forEach(star => {
      if (!star.collected) {
        const starRect = {
          left: star.x,
          right: star.x + STAR_SIZE,
          top: star.y,
          bottom: star.y + STAR_SIZE,
        };
        // Shrink hitbox slightly for fairness
        if (birdRect.right > starRect.left + 5 && birdRect.left < starRect.right - 5 &&
            birdRect.bottom > starRect.top + 5 && birdRect.top < starRect.bottom - 5) {
          star.collected = true;
          addScore(2);
          spawnParticle(star.x, star.y, "+2");
        }
      }
    });

    if (isInvulnerable.current) return false;

    // Ground or ceiling collision
    if (birdRect.bottom >= GAME_HEIGHT || birdRect.top <= 0) {
      return true;
    }

    // Pipe collision
    for (let pipe of pipes.current) {
      const pipeRect = {
        left: pipe.x,
        right: pipe.x + PIPE_WIDTH,
      };
      const topPipeRect = { bottom: pipe.topHeight };
      const bottomPipeRect = { top: pipe.topHeight + GAP_SIZE };

      // Shrink bird hitbox horizontally to make it less frustrating
      if (birdRect.right - 5 > pipeRect.left && birdRect.left + 5 < pipeRect.right) {
        if (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top) {
          return true;
        }
      }
    }

    return false;
  };

  const triggerQuiz = (isBoss: boolean = false) => {
    setGameState(isBoss ? 'boss_quiz' : 'quiz');
    const randomQuiz = PHILOSOPHY_QUIZ[Math.floor(Math.random() * PHILOSOPHY_QUIZ.length)];
    setCurrentQuiz(randomQuiz);
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Boss Fight trigger logic
    if (scoreRef.current > 0 && scoreRef.current % 100 === 0 && scoreRef.current !== lastBossScore.current) {
      lastBossScore.current = scoreRef.current;
      saveBestScoreIfNeeded();
      triggerQuiz(true);
      return;
    }

    // Calculate current difficulty based on score
    const currentSpeed = BASE_PIPE_SPEED + (scoreRef.current * 0.05);
    const currentSpawnRate = Math.max(80, BASE_PIPE_SPAWN_RATE - Math.floor(scoreRef.current * 1.5));

    // Apply gravity
    birdVelocity.current += GRAVITY;
    birdY.current += birdVelocity.current;

    // Update pipes
    pipes.current.forEach((pipe) => {
      pipe.x -= currentSpeed;
      if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
        pipe.passed = true;
        addScore(1);
      }
    });

    // Update stars
    stars.current.forEach(star => {
      star.x -= currentSpeed;
    });

    // Update particles
    particles.current.forEach(p => {
      p.y -= 1; // Float up
      p.life -= 1;
      p.opacity = p.life / 60;
    });

    // Cleanup arrays
    if (pipes.current.length > 0 && pipes.current[0].x + PIPE_WIDTH < 0) {
      pipes.current.shift();
    }
    stars.current = stars.current.filter(s => s.x + STAR_SIZE > 0);
    particles.current = particles.current.filter(p => p.life > 0);

    // Spawn new entities
    frameCount.current++;
    if (frameCount.current >= currentSpawnRate) {
      spawnEntities();
      frameCount.current = 0;
    }

    // Handle invulnerability
    if (isInvulnerable.current) {
      invulnerableTimer.current--;
      if (invulnerableTimer.current <= 0) {
        isInvulnerable.current = false;
      }
    }

    // Check collision
    if (checkCollisions()) {
      saveBestScoreIfNeeded();
      if (revivesUsed >= MAX_REVIVES) {
        setGameState('dead');
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
      } else {
        triggerQuiz(false);
      }
    }

    // Trigger re-render
    setRenderTrigger((prev) => prev + 1);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'countdown') {
      if (countdownValue > 0) {
        timer = setTimeout(() => {
          setCountdownValue(prev => prev - 1);
        }, 1000);
      } else {
        setGameState('playing');
        isInvulnerable.current = true;
        invulnerableTimer.current = 60; // 1 second safe
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdownValue]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || !currentQuiz) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuiz.correctAnswerIndex;
    setIsAnswerCorrect(correct);
  };

  const handleContinueGame = () => {
    const isBoss = gameState === 'boss_quiz';
    if (isBoss) {
      addScore(10);
      spawnParticle(GAME_WIDTH/2, GAME_HEIGHT/2, "+10 BOSS!");
    } else {
      setRevivesUsed(prev => prev + 1);
    }

    pipes.current = [];
    stars.current = [];
    birdVelocity.current = 0;
    birdY.current = GAME_HEIGHT / 2;
    
    setGameState('countdown');
    setCountdownValue(3);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    
    if (isBoss) {
      isInvulnerable.current = true;
      invulnerableTimer.current = 300; // 5 seconds safe
    }
  };

  // Determine Background CSS based on score (Eras of Philosophy)
  const getBackgroundClass = () => {
    if (score < 20) return 'bg-amber-100'; // Cổ đại
    if (score < 40) return 'bg-slate-800'; // Trung cổ
    if (score < 60) return 'bg-sky-200';   // Phục hưng / Cận đại
    return 'bg-rose-900'; // Mác - Lênin / Hiện đại
  };

  const getEraElementColor = () => {
    if (score < 20) return 'bg-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.5)]'; // Mặt trời chói Cổ đại
    if (score < 40) return 'bg-gray-300 shadow-[0_0_40px_rgba(209,213,219,0.3)]'; // Trăng mờ Trung cổ
    if (score < 60) return 'bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.5)]'; // Mặt trời Phục hưng
    return 'bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]'; // Ngôi sao / Hào quang đỏ
  };

  return (
    <div 
      ref={gameContainerRef}
      className={`flex flex-col items-center w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none max-w-none justify-center bg-neutral-950 border-none" : "relative"
      }`}
    >
      <div className="bg-amber-50 w-full p-4 border-b border-amber-100 flex justify-between items-center z-50 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveBestScoreIfNeeded();
              onBackToHub();
            }}
            className="p-1.5 bg-neutral-200/50 hover:bg-neutral-200 hover:text-neutral-800 rounded-lg text-neutral-600 transition flex items-center gap-1 text-[10px] cursor-pointer font-sans"
            title="Quay lại danh sách game"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
          </button>
          <h3 className="font-serif font-bold text-amber-900 flex items-center gap-1.5 text-sm sm:text-base">
            <Bird className="w-4 h-4 sm:w-5 sm:h-5" /> Flappy Philosopher
          </h3>
        </div>
        
        <div className="flex items-center gap-3 font-bold text-neutral-600 font-mono text-xs sm:text-sm">
          <span>Score: {score}</span>
          <span className="text-amber-600">Best: {bestScore}</span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-neutral-200/50 hover:bg-neutral-200 rounded-lg text-neutral-600 hover:text-neutral-800 transition cursor-pointer flex items-center justify-center"
            title={isFullscreen ? "Thu nhỏ màn hình" : "Phóng to toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div 
        className={`relative overflow-hidden transition-colors duration-1000 select-none cursor-pointer ${getBackgroundClass()}`}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Parallax Background Elements */}
        <div className={`absolute top-10 right-20 w-16 h-16 rounded-full transition-colors duration-1000 ${getEraElementColor()}`}></div>
        
        {/* Mountains/Cityscape parallax */}
        <div className="absolute bottom-24 w-[200%] h-32 flex opacity-40 transition-transform" style={{ transform: `translateX(-${(frameCount.current * 0.2) % 400}px)` }}>
          <svg className="w-full h-full text-current" viewBox="0 0 800 100" preserveAspectRatio="none">
            <path d="M0,100 L0,50 L50,80 L100,30 L150,70 L200,20 L250,60 L300,10 L350,50 L400,30 L450,80 L500,40 L550,90 L600,20 L650,70 L700,40 L750,80 L800,50 L800,100 Z" fill={score < 20 ? '#fde68a' : (score < 40 ? '#334155' : (score < 60 ? '#bae6fd' : '#9f1239'))} />
          </svg>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-[200%] h-24 bg-emerald-600 border-t-8 border-emerald-500 z-10 transition-transform" style={{ transform: `translateX(-${(frameCount.current * BASE_PIPE_SPEED) % 400}px)` }}></div>
        <div className="absolute bottom-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        {/* Pipes */}
        {pipes.current.map((pipe, i) => (
          <React.Fragment key={i}>
            <div className="absolute bg-green-500 border-4 border-green-700" style={{ left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.topHeight }}>
              <div className="absolute bottom-0 w-[110%] -left-[5%] h-6 bg-green-400 border-4 border-green-700"></div>
            </div>
            <div className="absolute bg-green-500 border-4 border-green-700" style={{ left: pipe.x, top: pipe.topHeight + GAP_SIZE, width: PIPE_WIDTH, height: GAME_HEIGHT - (pipe.topHeight + GAP_SIZE) }}>
              <div className="absolute top-0 w-[110%] -left-[5%] h-6 bg-green-400 border-4 border-green-700"></div>
            </div>
          </React.Fragment>
        ))}

        {/* Stars */}
        {stars.current.map((star, i) => !star.collected && (
          <div key={`star-${i}`} className="absolute z-10 text-amber-400 drop-shadow-md animate-pulse" style={{ left: star.x, top: star.y, width: STAR_SIZE, height: STAR_SIZE }}>
            <Star fill="currentColor" className="w-full h-full" />
          </div>
        ))}

        {/* Particles (VFX) */}
        {particles.current.map((p) => (
          <div key={p.id} className="absolute z-30 font-bold text-amber-300 text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none transition-opacity" style={{ left: p.x, top: p.y, opacity: p.opacity }}>
            {p.text}
          </div>
        ))}

        {/* Player (Bird or Skin) */}
        {(gameState === 'playing' || gameState === 'idle' || gameState === 'quiz' || gameState === 'boss_quiz' || gameState === 'countdown') && (
          <div
            className="absolute z-20 transition-transform duration-75 flex items-center justify-center text-3xl"
            style={{
              left: 50,
              top: birdY.current,
              width: BIRD_SIZE,
              height: BIRD_SIZE,
              transform: `rotate(${Math.min(Math.max(birdVelocity.current * 4, -45), 90)}deg)`,
              opacity: isInvulnerable.current ? (Math.floor(Date.now() / 100) % 2 === 0 ? 0.5 : 1) : 1
            }}
          >
            {activeSkin === 'bird' ? (
              <div className="w-full h-full bg-amber-400 rounded-full border-2 border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                <div className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full"><div className="w-1 h-1 bg-black rounded-full ml-1 mt-0.5"></div></div>
                <div className="absolute top-4 -right-1 w-3 h-2 bg-orange-500 rounded-full"></div>
              </div>
            ) : (
              <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {SKINS[activeSkin].icon}
              </div>
            )}
            
            {/* Invulnerable Aura */}
            {isInvulnerable.current && (
              <div className="absolute inset-[-10px] border-2 border-emerald-400 rounded-full animate-ping opacity-50"></div>
            )}
          </div>
        )}

        {/* Idle Overlay & Skin Selector */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm">
            <h2 className="text-4xl font-bold font-serif mb-2 text-amber-300 drop-shadow-lg">Flappy Philosopher</h2>
            <p className="mb-6 opacity-90 text-sm leading-relaxed max-w-[280px]">
              Nhấn Space hoặc Click để bay.<br/>
              Thu thập <Star className="inline w-4 h-4 text-amber-400" fill="currentColor"/> để nhận thêm 2 điểm.<br/>
              Vượt 100 điểm để khiêu chiến BOSS!
            </p>

            {/* Skins Selector */}
            <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-md border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-3">Chọn Nhân Vật</p>
              <div className="flex gap-3">
                {(Object.keys(SKINS) as SkinType[]).map(skinKey => {
                  const skin = SKINS[skinKey];
                  const isUnlocked = bestScore >= skin.requirement;
                  const isSelected = activeSkin === skinKey;
                  return (
                    <button
                      key={skinKey}
                      disabled={!isUnlocked}
                      onClick={(e) => { e.stopPropagation(); setActiveSkin(skinKey); }}
                      className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
                        isSelected ? 'bg-amber-500 border-2 border-white scale-110 shadow-lg' :
                        isUnlocked ? 'bg-white/20 hover:bg-white/30 border border-transparent' :
                        'bg-black/40 opacity-50 cursor-not-allowed border border-transparent'
                      }`}
                      title={isUnlocked ? skin.name : `Cần ${skin.requirement} điểm`}
                    >
                      <span className="text-2xl">{skin.icon}</span>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                          <Lock className="w-5 h-5 text-neutral-300" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Play className="w-5 h-5" fill="currentColor" /> Bắt đầu
            </button>
          </div>
        )}

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-black/40 z-30 flex flex-col items-center justify-center text-white">
            <h2 className="text-8xl font-bold font-serif animate-bounce text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">
              {countdownValue > 0 ? countdownValue : 'GO!'}
            </h2>
          </div>
        )}

        {/* Quiz Modal Overlay (Normal & Boss) */}
        {(gameState === 'quiz' || gameState === 'boss_quiz') && currentQuiz && (
          <div className="absolute inset-0 bg-neutral-900/95 z-40 flex flex-col items-center justify-center p-3 sm:p-4 backdrop-blur-md">
            <div className={`rounded-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-5 shadow-2xl flex flex-col relative overflow-hidden transition-all ${
              gameState === 'boss_quiz' ? 'bg-gradient-to-b from-rose-950 to-neutral-900 border border-rose-500' : 'bg-white border border-neutral-200'
            }`}>
              {/* Boss Background Glow */}
              {gameState === 'boss_quiz' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 blur-2xl rounded-full"></div>
              )}

              {/* Header Info - Hide when answered to save space */}
              {selectedAnswer === null && (
                <>
                  <div className={`flex items-center gap-1.5 font-bold mb-2 ${gameState === 'boss_quiz' ? 'text-rose-400' : 'text-rose-600'}`}>
                    {gameState === 'boss_quiz' ? <ShieldAlert className="w-4 h-4 animate-pulse" /> : <AlertTriangle className="w-4 h-4" />}
                    <span className="text-sm tracking-wide">{gameState === 'boss_quiz' ? 'BOSS FIGHT TRÍ TUỆ!' : 'BẠN VỪA ĐỤNG CỘT!'}</span>
                  </div>
                  <p className={`text-[10px] sm:text-xs mb-3 italic leading-normal ${gameState === 'boss_quiz' ? 'text-rose-200/60' : 'text-neutral-500'}`}>
                    {gameState === 'boss_quiz' 
                      ? 'Trả lời đúng để nhận 10 điểm và 5 giây bất tử!' 
                      : `Trả lời đúng câu hỏi để được trao cơ hội sống lại (còn ${MAX_REVIVES - revivesUsed} lần):`}
                  </p>
                </>
              )}

              {/* Question Text */}
              <h4 className={`font-bold text-xs sm:text-sm mb-3.5 leading-relaxed font-serif text-left ${
                gameState === 'boss_quiz' ? 'text-white' : 'text-neutral-800'
              }`}>
                {currentQuiz.question}
              </h4>
              
              {/* Answer selection / result exegesis display */}
              {selectedAnswer === null ? (
                <div className="flex flex-col gap-2 relative z-10">
                  {currentQuiz.options.map((opt, i) => {
                    let btnClass = "text-left px-3 py-2 text-xs rounded-xl border transition-all font-medium leading-tight ";
                    btnClass += gameState === 'boss_quiz' 
                      ? "border-rose-900/40 bg-neutral-950/50 text-neutral-300 hover:bg-rose-950 hover:border-rose-700" 
                      : "border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-950";

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(i)}
                        className={btnClass}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 relative z-10 animate-fade-in">
                  {/* Results Banner & Explanation */}
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed ${
                    isAnswerCorrect 
                      ? (gameState === 'boss_quiz' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/50') 
                      : (gameState === 'boss_quiz' ? 'bg-rose-950/60 text-rose-300 border border-rose-500/20' : 'bg-rose-50/85 text-rose-800 border border-rose-200/50')
                  }`}>
                    {isAnswerCorrect ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs mb-1 text-left">
                        {isAnswerCorrect 
                          ? (gameState === 'boss_quiz' ? 'Đúng! +10 điểm & Hồi sinh!' : 'Chính xác! Bạn được hồi sinh.') 
                          : 'Chưa chính xác!'}
                      </p>
                      <p className="opacity-90 text-[10px] leading-relaxed max-h-24 overflow-y-auto scrollbar-thin pr-1 text-left font-sans">
                        {currentQuiz.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Continue / Exits Action Button */}
                  {isAnswerCorrect ? (
                    <button
                      onClick={handleContinueGame}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 sm:py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Tiếp Tục Chơi 🚀
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        saveBestScoreIfNeeded();
                        setGameState('dead');
                        setSelectedAnswer(null);
                        setIsAnswerCorrect(null);
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 sm:py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Xem Kết Quả 💀
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dead Overlay */}
        {gameState === 'dead' && (
          <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm">
            <h2 className="text-5xl font-bold font-serif mb-2 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">Game Over</h2>
            <div className="bg-white/10 rounded-2xl p-6 my-6 border border-white/20 w-full max-w-[240px]">
              <p className="text-neutral-400 text-sm uppercase tracking-widest font-bold mb-1">Score</p>
              <p className="text-4xl font-mono font-bold text-amber-400 mb-4">{score}</p>
              <div className="h-px w-full bg-white/20 mb-4"></div>
              <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold mb-1">Best</p>
              <p className="text-xl font-mono font-bold">{bestScore}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="bg-white hover:bg-neutral-100 text-neutral-900 font-bold px-10 py-4 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <RefreshCw className="w-5 h-5" /> Chơi Lại Từ Đầu
            </button>
          </div>
        )}
      </div>

      <div className="bg-neutral-50 w-full p-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <BookOpen className="w-4 h-4 opacity-60" />
        Sự thông thái là chiếc phao cứu sinh duy nhất của bạn.
      </div>
    </div>
  );
}
