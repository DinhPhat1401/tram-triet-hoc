import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bird, AlertTriangle, Play, RefreshCw, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { PHILOSOPHY_QUIZ, QuizQuestion } from '../data/quizData';

const GRAVITY = 0.25;
const JUMP_STRENGTH = -5.5;
const PIPE_SPEED = 1.5;
const PIPE_SPAWN_RATE = 160; // in frames
const BIRD_SIZE = 36;
const PIPE_WIDTH = 60;
const GAP_SIZE = 180;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

export default function FlappyPhilosopher() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'quiz' | 'dead' | 'countdown'>('idle');
  const [countdownValue, setCountdownValue] = useState(3);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Use refs for high-frequency game state to avoid stale closures
  const birdY = useRef(GAME_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<Array<{ x: number; topHeight: number; passed: boolean }>>([]);
  const frameCount = useRef(0);
  const isInvulnerable = useRef(false);
  const invulnerableTimer = useRef(0);
  const requestRef = useRef<number>();

  // For rendering
  const [renderTrigger, setRenderTrigger] = useState(0);

  const jump = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('playing');
    } else if (gameState === 'playing') {
      birdVelocity.current = JUMP_STRENGTH;
    }
  }, [gameState]);

  const resetGame = () => {
    birdY.current = GAME_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    isInvulnerable.current = false;
    setScore(0);
    setGameState('playing');
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
  };

  const spawnPipe = () => {
    const minHeight = 50;
    const maxHeight = GAME_HEIGHT - GAP_SIZE - 50;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.current.push({ x: GAME_WIDTH, topHeight, passed: false });
  };

  const checkCollision = () => {
    if (isInvulnerable.current) return false;

    const birdRect = {
      left: 50,
      right: 50 + BIRD_SIZE,
      top: birdY.current,
      bottom: birdY.current + BIRD_SIZE,
    };

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

      const topPipeRect = {
        bottom: pipe.topHeight,
      };

      const bottomPipeRect = {
        top: pipe.topHeight + GAP_SIZE,
      };

      // Check horizontal overlap
      if (birdRect.right > pipeRect.left && birdRect.left < pipeRect.right) {
        // Check vertical overlap
        if (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top) {
          return true;
        }
      }
    }

    return false;
  };

  const triggerQuiz = () => {
    setGameState('quiz');
    const randomQuiz = PHILOSOPHY_QUIZ[Math.floor(Math.random() * PHILOSOPHY_QUIZ.length)];
    setCurrentQuiz(randomQuiz);
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Apply gravity
    birdVelocity.current += GRAVITY;
    birdY.current += birdVelocity.current;

    // Update pipes
    pipes.current.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;

      // Score logic
      if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
        pipe.passed = true;
        setScore((s) => s + 1);
      }
    });

    // Remove off-screen pipes
    if (pipes.current.length > 0 && pipes.current[0].x + PIPE_WIDTH < 0) {
      pipes.current.shift();
    }

    // Spawn new pipes
    frameCount.current++;
    if (frameCount.current % PIPE_SPAWN_RATE === 0) {
      spawnPipe();
    }

    // Handle invulnerability
    if (isInvulnerable.current) {
      invulnerableTimer.current--;
      if (invulnerableTimer.current <= 0) {
        isInvulnerable.current = false;
      }
    }

    // Check collision
    if (checkCollision()) {
      triggerQuiz();
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
        invulnerableTimer.current = 60; // 1 giây an toàn
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdownValue]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || !currentQuiz) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuiz.correctAnswerIndex;
    setIsAnswerCorrect(correct);

    setTimeout(() => {
      if (correct) {
        // Xóa sạch các cột hiện tại để có không gian trống bay tiếp
        pipes.current = [];
        
        // Spawn lại chim ở giữa màn hình
        birdVelocity.current = 0;
        birdY.current = GAME_HEIGHT / 2;
        
        setGameState('countdown');
        setCountdownValue(3);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
      } else {
        setBestScore(Math.max(bestScore, score));
        setGameState('dead');
      }
    }, 2500); // Wait 2.5s before continuing to read explanation
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
      <div className="bg-amber-50 w-full p-4 border-b border-amber-100 flex justify-between items-center">
        <h3 className="font-serif font-bold text-amber-900 flex items-center gap-2">
          <Bird className="w-5 h-5" /> Flappy Philosopher
        </h3>
        <div className="flex gap-4 font-bold text-neutral-600 font-mono">
          <span>Score: {score}</span>
          <span>Best: {bestScore}</span>
        </div>
      </div>

      <div 
        className="relative overflow-hidden bg-sky-100 select-none cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Background elements */}
        <div className="absolute bottom-0 w-full h-24 bg-emerald-600 border-t-8 border-emerald-500 z-10"></div>
        <div className="absolute bottom-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        {/* Pipes */}
        {pipes.current.map((pipe, i) => (
          <React.Fragment key={i}>
            {/* Top Pipe */}
            <div 
              className="absolute bg-green-500 border-4 border-green-700"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
              }}
            >
              <div className="absolute bottom-0 w-[110%] -left-[5%] h-6 bg-green-400 border-4 border-green-700"></div>
            </div>
            {/* Bottom Pipe */}
            <div 
              className="absolute bg-green-500 border-4 border-green-700"
              style={{
                left: pipe.x,
                top: pipe.topHeight + GAP_SIZE,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.topHeight + GAP_SIZE),
              }}
            >
              <div className="absolute top-0 w-[110%] -left-[5%] h-6 bg-green-400 border-4 border-green-700"></div>
            </div>
          </React.Fragment>
        ))}

        {/* Bird */}
        {(gameState === 'playing' || gameState === 'idle' || gameState === 'quiz' || gameState === 'countdown') && (
          <div
            className="absolute z-20 transition-transform duration-75"
            style={{
              left: 50,
              top: birdY.current,
              width: BIRD_SIZE,
              height: BIRD_SIZE,
              transform: `rotate(${Math.min(Math.max(birdVelocity.current * 4, -45), 90)}deg)`,
              opacity: isInvulnerable.current ? (Math.floor(Date.now() / 100) % 2 === 0 ? 0.5 : 1) : 1
            }}
          >
            <div className="w-full h-full bg-amber-400 rounded-full border-2 border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-sm">
              <div className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full"><div className="w-1 h-1 bg-black rounded-full ml-1 mt-0.5"></div></div>
              <div className="absolute top-4 -right-1 w-3 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Idle Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/40 z-30 flex flex-col items-center justify-center text-white p-6 text-center">
            <Bird className="w-16 h-16 mb-4 text-amber-300" />
            <h2 className="text-3xl font-bold font-serif mb-2">Flappy Philosopher</h2>
            <p className="mb-6 opacity-90">Nhấn Space hoặc Click để bay.<br/>Đụng cột sẽ phải trả lời triết học!</p>
            <button className="bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95">
              <Play className="w-5 h-5" fill="currentColor" /> Bắt đầu
            </button>
          </div>
        )}

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-black/40 z-30 flex flex-col items-center justify-center text-white">
            <h2 className="text-8xl font-bold font-serif animate-bounce text-amber-400 drop-shadow-lg">
              {countdownValue > 0 ? countdownValue : 'GO!'}
            </h2>
          </div>
        )}

        {/* Quiz Modal Overlay */}
        {gameState === 'quiz' && currentQuiz && (
          <div className="absolute inset-0 bg-neutral-900/90 z-40 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-2xl flex flex-col">
              <div className="flex items-center gap-2 text-rose-600 mb-3 font-bold">
                <AlertTriangle className="w-5 h-5" /> 
                <span>BẠN VỪA ĐỤNG CỘT!</span>
              </div>
              <p className="text-sm text-neutral-600 mb-4 italic">Trả lời đúng câu hỏi để được trao cơ hội sống lại:</p>
              
              <h4 className="font-bold text-neutral-800 mb-4">{currentQuiz.question}</h4>
              
              <div className="flex flex-col gap-2 mb-4">
                {currentQuiz.options.map((opt, i) => {
                  let btnClass = "text-left px-3 py-2 text-sm rounded-lg border transition-all ";
                  if (selectedAnswer === null) {
                    btnClass += "border-neutral-200 hover:bg-amber-50 hover:border-amber-300";
                  } else {
                    if (i === currentQuiz.correctAnswerIndex) {
                      btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800"; // Correct
                    } else if (i === selectedAnswer) {
                      btnClass += "bg-rose-100 border-rose-500 text-rose-800"; // Wrong selected
                    } else {
                      btnClass += "border-neutral-200 opacity-50"; // Not selected
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerSelect(i)}
                      className={btnClass}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${isAnswerCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {isAnswerCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                  <div>
                    <p className="font-bold mb-1">{isAnswerCorrect ? 'Chính xác! Bạn được hồi sinh.' : 'Sai rồi! Kết thúc hành trình.'}</p>
                    <p className="opacity-90">{currentQuiz.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dead Overlay */}
        {gameState === 'dead' && (
          <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-white p-6 text-center">
            <h2 className="text-4xl font-bold font-serif mb-2 text-rose-400">Game Over</h2>
            <p className="mb-6 opacity-90">Điểm số của bạn: <strong className="text-xl">{score}</strong></p>
            <button 
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="bg-white hover:bg-neutral-100 text-neutral-900 font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-5 h-5" /> Chơi Lại
            </button>
          </div>
        )}
      </div>

      <div className="bg-neutral-50 w-full p-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
        <BookOpen className="w-4 h-4 inline-block mr-1 opacity-60" />
        Sự thông thái là chiếc phao cứu sinh duy nhất của bạn.
      </div>
    </div>
  );
}
