import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, EyeOff, Flame, Droplets, Atom, CircleDot, Stars, ChevronUp, ChevronDown, Check } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  angle?: number;
  angularSpeed?: number;
  typeSpecific?: any;
  theme?: string;
}

export default function PhilosophicalCursor() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("tram_hoc_cursor_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [theme, setTheme] = useState<"fire" | "water" | "atoms" | "five_elements" | "ideas" | "synthesis">(() => {
    return (localStorage.getItem("tram_hoc_cursor_type") as any) || "fire";
  });

  const [intensity, setIntensity] = useState<number>(() => {
    const saved = localStorage.getItem("tram_hoc_cursor_intensity");
    return saved !== null ? parseFloat(saved) : 0.75;
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);

  // Keep track of theme and intensity in refs to avoid recreating event listeners or losing state in canvas loop
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
    localStorage.setItem("tram_hoc_cursor_type", theme);
  }, [theme]);

  const intensityRef = useRef(intensity);
  useEffect(() => {
    intensityRef.current = intensity;
    localStorage.setItem("tram_hoc_cursor_intensity", String(intensity));
  }, [intensity]);

  useEffect(() => {
    localStorage.setItem("tram_hoc_cursor_enabled", String(enabled));
  }, [enabled]);

  // Listen to game active/inactive event
  useEffect(() => {
    const handleGameStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsGameActive(!!customEvent.detail?.active);
    };
    window.addEventListener("game-status-changed", handleGameStatus);
    return () => {
      window.removeEventListener("game-status-changed", handleGameStatus);
    };
  }, []);

  // Mouse move handler
  useEffect(() => {
    if (!enabled || isGameActive) {
      mouseRef.current.active = false;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, isGameActive]);

  // Update canvas sizing & animation loop
  useEffect(() => {
    if (!enabled || isGameActive) {
      // Clear particles if disabled or game is active
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Helper function to draw stars
    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const m = mouseRef.current;
      const currentTheme = themeRef.current;
      const currentIntensity = intensityRef.current;

      // Spawn new particles if mouse is moving
      if (m.active) {
        const dx = m.x - m.lastX;
        const dy = m.y - m.lastY;
        const dist = Math.hypot(dx, dy);

        // Spawn based on mouse movement/distance and intensity scale
        if (dist > 1) {
          // intensity influences spawn density
          const densityDivisor = 1.8 / Math.sqrt(currentIntensity);
          const spawnCount = Math.min(Math.floor(dist / densityDivisor) + 2, Math.round(10 * currentIntensity));
          
          for (let i = 0; i < spawnCount; i++) {
            // Interpolate position between last and current mouse to make a smooth trace
            const ratio = i / spawnCount;
            const px = m.lastX + dx * ratio;
            const py = m.lastY + dy * ratio;

            let p: Particle;
            let activeType = currentTheme;
            if (currentTheme === "synthesis") {
              const types = ["fire", "water", "atoms", "five_elements", "ideas"];
              activeType = types[Math.floor(Math.random() * types.length)] as any;
            }

            if (activeType === "fire") {
              // Fire (Heraclitus) - rising upward sparks
              p = {
                x: px + (Math.random() * 8 - 4),
                y: py + (Math.random() * 8 - 4),
                vx: (Math.random() * 1.8 - 0.9),
                vy: -(Math.random() * 2.2 + 0.8), // Stronger upward speed
                size: (Math.random() * 6 + 4) * currentIntensity, // Scaled size
                color: `rgb(${210 + Math.floor(Math.random() * 45)}, ${90 + Math.floor(Math.random() * 105)}, ${Math.floor(Math.random() * 20)})`, // Richer fiery tones
                alpha: 1,
                life: 1.0,
                maxLife: 1.0,
              };
            } else if (activeType === "water") {
              // Water (Thales) - floating blue ripples & bubbles
              p = {
                x: px + (Math.random() * 12 - 6),
                y: py + (Math.random() * 12 - 6),
                vx: (Math.random() * 1.4 - 0.7),
                vy: (Math.random() * 0.8 - 0.2), // Gentle drift
                size: (Math.random() * 5 + 3) * currentIntensity, // Scaled size
                color: Math.random() > 0.4 ? "rgba(29, 78, 216, 0.9)" : "rgba(6, 182, 212, 0.95)", // Royal blue & cyan (highly visible on light bg)
                alpha: 0.95,
                life: 1.0,
                maxLife: 1.0,
                typeSpecific: {
                  growSpeed: (Math.random() * 0.05 + 0.02) * currentIntensity,
                  pulseAngle: Math.random() * Math.PI,
                },
              };
            } else if (activeType === "atoms") {
              // Atoms (Democritus) - fast subatomic gray/indigo rings
              p = {
                x: px,
                y: py,
                vx: (Math.random() * 7 - 3.5),
                vy: (Math.random() * 7 - 3.5),
                size: (Math.random() * 4 + 2) * currentIntensity, // Scaled size
                color: Math.random() > 0.4 ? "#4f46e5" : "#334155", // Indigo and Deep Slate (visible on white & dark)
                alpha: 1.0,
                life: 1.0,
                maxLife: 1.0,
              };
            } else if (activeType === "five_elements") {
              // Five Elements (Eastern Dialectics - Wood, Fire, Earth, Metal, Water)
              const colors = [
                "rgba(22, 163, 74, 0.95)",  // Wood (Mộc) - Forest Green
                "rgba(220, 38, 38, 0.95)",  // Fire (Hỏa) - Rich Red
                "rgba(217, 119, 6, 0.95)",  // Earth (Thổ) - Warm Amber
                "rgba(79, 70, 229, 0.95)",   // Metal (Kim) - Deep Steel/Indigo (visible on light bg)
                "rgba(29, 78, 216, 0.95)"   // Water (Thủy) - Royal Blue
              ];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const angle = Math.random() * Math.PI * 2;
              p = {
                x: px,
                y: py,
                vx: Math.cos(angle) * (Math.random() * 2.0 + 0.6),
                vy: Math.sin(angle) * (Math.random() * 2.0 + 0.6),
                size: (Math.random() * 5 + 4) * currentIntensity, // Scaled size
                color: randomColor,
                alpha: 1.0,
                life: 1.0,
                maxLife: 1.0,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: (Math.random() * 0.12 - 0.06),
                typeSpecific: {
                  orbitRadius: (Math.random() * 15 + 8) * currentIntensity,
                }
              };
            } else {
              // Idealism (Plato) - glowing star sparkles
              p = {
                x: px + (Math.random() * 18 - 9),
                y: py + (Math.random() * 18 - 9),
                vx: (Math.random() * 1.4 - 0.7),
                vy: (Math.random() * 1.4 - 0.7),
                size: (Math.random() * 8 + 5) * currentIntensity, // Scaled stars
                color: Math.random() > 0.5 ? "rgba(217, 119, 6, 1)" : "rgba(109, 40, 217, 1)", // Gold and mystical deep violet (great contrast)
                alpha: 1.0,
                life: 1.0,
                maxLife: 1.0,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: Math.random() * 0.1 - 0.05,
              };
            }

            p.theme = activeType;
            particlesRef.current.push(p);
          }
        }

        m.lastX = m.x;
        m.lastY = m.y;
      }

      // Update & Draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const pTheme = p.theme || "fire";

        // Decaying speed & life
        if (pTheme === "fire") {
          p.x += p.vx;
          p.y += p.vy;
          // Slowly rise and fade
          p.life -= 0.015;
          p.size = Math.max(0.1, p.size - 0.05);
        } else if (pTheme === "water") {
          p.x += p.vx + (p.typeSpecific?.pulseAngle ? Math.sin(p.typeSpecific.pulseAngle) : 0) * 0.3;
          p.y += p.vy;
          if (p.typeSpecific) {
            p.typeSpecific.pulseAngle = (p.typeSpecific.pulseAngle || 0) + 0.05;
            p.size += p.typeSpecific.growSpeed || 0.027;
          }
          // grow in size representing liquid expansion or ripple
          p.life -= 0.011;
        } else if (pTheme === "atoms") {
          p.x += p.vx;
          p.y += p.vy;
          // Rapid v, slight friction
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life -= 0.022; // Slower (was 0.035)
        } else if (pTheme === "five_elements") {
          // Orbiting effect
          p.angle = (p.angle || 0) + (p.angularSpeed || 0.02);
          const orbitRadius = p.typeSpecific?.orbitRadius || 10;
          const orbitX = Math.cos(p.angle) * orbitRadius;
          const orbitY = Math.sin(p.angle) * orbitRadius;

          p.x += p.vx + orbitX * 0.035;
          p.y += p.vy + orbitY * 0.035;
          p.life -= 0.014; // Slower (was 0.02)
          p.size = Math.max(0.5, p.size - 0.025);
        } else {
          // Ideas
          p.x += p.vx;
          p.y += p.vy;
          p.angle = (p.angle || 0) + (p.angularSpeed || 0.01);
          p.life -= 0.011; // Slower (was 0.015)
          p.size = Math.max(0.3, p.size - 0.03);
        }

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, p.life) * Math.min(currentIntensity, 1.3);

        // Drawing routine
        if (pTheme === "ideas") {
          drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2.5, p.color, alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;

          // Special shadow for element styling
          if (pTheme === "fire") {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
          } else if (pTheme === "water") {
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(6, 182, 212, 0.4)";
          } else if (pTheme === "five_elements") {
            ctx.shadowBlur = p.size;
            ctx.shadowColor = p.color;
          }

          ctx.fill();
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [enabled]);

  // Info details for explanations of philosophical stages
  const themesInfo = {
    fire: {
      title: "Lửa (Hê-ra-clít)",
      desc: "Học thuyết Biến đổi liên tục: 'Mọi thứ đều chảy' (Panta Rhei). Không ai tắm hai lần trên một dòng sông. Lửa thúc đẩy sự xung đột biện chứng sáng tạo thúc đẩy lịch sử vận động.",
      subText: "Hiệu ứng: Tàn lửa ấm áp bay ngược lên thể hiện chuyển động vĩnh hằng.",
      icon: <Flame className="w-4 h-4 text-orange-500 animate-pulse" />,
    },
    water: {
      title: "Nước (Ta-lét)",
      desc: "Thuyết Bản thể khởi nguồn: Nước là vật chất đầu tiên nguồn gốc của mọi sự sinh thành trong vũ trụ, đại diện thế giới quan duy vật chất phác nguyên bản nhất.",
      subText: "Hiệu ứng: Bọng nước nhẹ nhàng giãn nở, xê dịch nhẹ theo nhịp sóng.",
      icon: <Droplets className="w-4 h-4 text-cyan-400" />,
    },
    atoms: {
      title: "Nguyên tử (Đi-mô-crít)",
      desc: "Chủ nghĩa Duy vật cổ đại: Vũ trụ được thiết lập từ các hạt nhỏ nhất không thể phân chia (Nguyên tử) nhảy múa trong khoảng không hư vô tuyệt đối.",
      subText: "Hiệu ứng: Các hạt sẫm bạc bắn ra cực nhanh rồi dừng lại trong chân không.",
      icon: <Atom className="w-4 h-4 text-slate-300" />,
    },
    five_elements: {
      title: "Thái cực & Ngũ hành",
      desc: "Biện chứng Đông phương cổ đại: Sự tương tác đối cực Âm - Dương sinh ra ngũ hành Kim - Mộc - Thủy - Hỏa - Thổ tuần hoàn tương sinh tương khắc bất tận.",
      subText: "Hiệu ứng: Các hạt màu sắc tượng trưng xoay vòng xoáy thu hút tuyệt vời.",
      icon: <CircleDot className="w-4 h-4 text-amber-400" />,
    },
    ideas: {
      title: "Ý niệm (Pla-tôn)",
      desc: "Chủ nghĩa Duy tâm khách quan: Vật chất thực tại chỉ là bản sao, 'cái bóng' mờ nhạt từ bỏ chiếu từ Thế giới của các Ý niệm hoàn mỹ bất biến thượng tầng.",
      subText: "Hiệu ứng: Ánh sao đỉnh cao tâm linh lấp lánh phản chiếu quy luật ý niệm.",
      icon: <Stars className="w-4 h-4 text-yellow-300" />,
    },
    synthesis: {
      title: "Tổng hòa Biện chứng",
      desc: "Phép Biện chứng Toàn diện: Mọi sự vật và hiện tượng trong vũ trụ không tồn tại cô lập mà liên hệ, dung hợp và chuyển hóa lẫn nhau trong một tổng thể thống nhất, sinh động.",
      subText: "Hiệu ứng: Tổ hợp cả 5 hiệu ứng chuyển động cùng lúc cực kỳ bắt mắt.",
      icon: <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />,
    },
  };

  return (
    <>
      {/* Dynamic Cursor Canvas background overlay */}
      {enabled && (
        <canvas
          ref={canvasRef}
          id="philosophical-cursor-canvas"
          className="fixed inset-0 pointer-events-none z-50 w-full h-full block"
        />
      )}

      {/* Control Widget Panel */}
      <div 
        id="philosophy-mouse-panel"
        className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-40 font-sans text-xs"
      >
        {panelOpen ? (
          <div className="bg-neutral-900/90 backdrop-blur-md text-white rounded-2xl p-4 w-72 sm:w-80 shadow-2xl border border-white/10 space-y-4 animate-fade-in transition-all max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="font-serif font-bold text-neutral-100 tracking-wide">
                  Hiệu ứng Triết học
                </span>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition"
                title="Thu gọn"
              >
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Toggle Power */}
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium font-serif">
                Trạng thái hiệu ứng chuột
              </span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  enabled
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                }`}
              >
                {enabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" /> BẬT
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> TẮT
                  </>
                )}
              </button>
            </div>

            {/* Intensity Control Presets */}
            {enabled && (
              <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-neutral-300">
                  <span className="font-serif">Cường độ hiệu ứng:</span>
                  <span className="font-mono text-amber-400 font-bold uppercase text-[9px]">
                    {intensity === 0.5 ? "Nhẹ" : intensity === 0.75 ? "Vừa" : "Mạnh"} ({Math.round(intensity * 100)}%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "Nhẹ", value: 0.5 },
                    { label: "Vừa", value: 0.75 },
                    { label: "Mạnh", value: 1.0 }
                  ].map((preset) => {
                    const active = Math.abs(intensity - preset.value) < 0.05;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => setIntensity(preset.value)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-serif font-bold transition text-center ${
                          active
                            ? "bg-amber-400 text-neutral-950 shadow-md"
                            : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Theme */}
            {enabled && (
              <div className="space-y-2">
                <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
                  Chọn bản thể / Giai đoạn:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(themesInfo) as Array<keyof typeof themesInfo>).map((tKey) => {
                    const active = theme === tKey;
                    return (
                      <div key={tKey} className="space-y-1.5">
                        <button
                          onClick={() => setTheme(tKey)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition border ${
                            active
                              ? "bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold"
                              : "bg-white/5 border-transparent text-neutral-300 hover:bg-white/10 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {themesInfo[tKey].icon}
                            <span className="font-medium text-[11px] sm:text-xs">{themesInfo[tKey].title}</span>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        </button>
                        
                        {active && (
                          <div className="bg-amber-400/5 border border-amber-400/10 p-2.5 rounded-xl text-neutral-300 leading-relaxed text-[11px] space-y-1 animate-fade-in mx-0.5">
                            <p className="text-neutral-200">
                              {themesInfo[tKey].desc}
                            </p>
                            <p className="text-[10px] italic text-neutral-400 mt-1">
                              {themesInfo[tKey].subText}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white border border-white/10 hover:border-amber-400/50 hover:bg-neutral-950 py-2.5 px-3.5 rounded-full shadow-2xl transition-all duration-300 group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow group-hover:scale-110 transition-transform" />
            <span className="font-serif font-bold text-xs tracking-wider text-neutral-200">
              {enabled ? `Hiệu ứng: ${themesInfo[theme].title}` : "Hiệu ứng chuột"}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </div>
    </>
  );
}
