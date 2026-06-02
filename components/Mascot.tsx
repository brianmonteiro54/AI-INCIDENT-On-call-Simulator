"use client";

import { m } from "framer-motion";

export type MascotExpression = "default" | "happy" | "sad" | "thinking" | "celebrate" | "alert";

interface Props {
  expression?: MascotExpression;
  size?: number;
  className?: string;
}

export function Mascot({ expression = "default", size = 120, className = "" }: Props) {
  // Eye state
  const eyeY = expression === "celebrate" ? 76 : expression === "sad" ? 84 : 80;
  const eyeSize = expression === "celebrate" ? 0 : expression === "happy" ? 4 : 5;

  // Antenna color
  const antennaColor =
    expression === "happy" || expression === "celebrate" ? "#58CC02" :
    expression === "sad" ? "#FF4B4B" :
    expression === "thinking" ? "#FFC800" :
    expression === "alert" ? "#FF4B4B" :
    "#1CB0F6";

  // Cheek (blush)
  const showCheeks = expression === "happy" || expression === "celebrate";

  // Body bob animation variants
  const bodyAnim =
    expression === "celebrate" ? { y: [0, -10, 0], rotate: [-3, 3, -3] } :
    expression === "happy" ? { y: [0, -4, 0] } :
    expression === "sad" ? { y: [0, 1, 0] } :
    expression === "alert" ? { rotate: [-2, 2, -2] } :
    { y: [0, -3, 0] };

  const bodyTransition =
    expression === "celebrate" ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } :
    expression === "alert" ? { duration: 0.25, repeat: Infinity } :
    { duration: 2.4, repeat: Infinity, ease: "easeInOut" };

  return (
    <m.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size * 1.05 }}
      animate={bodyAnim}
      transition={bodyTransition}
    >
      <svg viewBox="0 0 160 168" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <line x1="80" y1="26" x2="80" y2="44" stroke="#3C3C3C" strokeWidth="3.5" strokeLinecap="round" />
        <m.circle
          cx="80"
          cy="22"
          r="6.5"
          fill={antennaColor}
          stroke="#3C3C3C"
          strokeWidth="2"
          animate={expression === "alert" ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        />

        {/* Shadow under body */}
        <ellipse cx="80" cy="158" rx="42" ry="4" fill="rgba(60, 60, 60, 0.15)" />

        {/* Body (rounded rect) */}
        <rect x="32" y="50" width="96" height="92" rx="22" ry="22" fill="#FF9600" stroke="#3C3C3C" strokeWidth="3.5" />

        {/* Body inner highlight */}
        <rect x="38" y="56" width="84" height="10" rx="5" fill="#FFB347" opacity="0.6" />

        {/* Face screen (inner panel) */}
        <rect x="46" y="68" width="68" height="44" rx="12" ry="12" fill="#FFFBEF" stroke="#3C3C3C" strokeWidth="2.5" />

        {/* Eyes */}
        {expression !== "celebrate" && (
          <>
            <circle cx={expression === "thinking" ? 63 : 64} cy={eyeY} r={eyeSize} fill="#3C3C3C" />
            <circle cx="96" cy={eyeY} r={eyeSize} fill="#3C3C3C" />
            {/* Eye shine */}
            <circle cx={expression === "thinking" ? 64 : 65} cy={eyeY - 1.5} r={1.4} fill="white" />
            <circle cx="97" cy={eyeY - 1.5} r={1.4} fill="white" />
          </>
        )}
        {/* Celebrate eyes — closed curves */}
        {expression === "celebrate" && (
          <>
            <path d="M 56 78 Q 64 72, 72 78" stroke="#3C3C3C" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 88 78 Q 96 72, 104 78" stroke="#3C3C3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Cheeks */}
        {showCheeks && (
          <>
            <ellipse cx="55" cy="95" rx="5" ry="3" fill="#FF6B9D" opacity="0.7" />
            <ellipse cx="105" cy="95" rx="5" ry="3" fill="#FF6B9D" opacity="0.7" />
          </>
        )}

        {/* Mouth */}
        {expression === "happy" && (
          <path d="M 66 100 Q 80 110, 94 100" stroke="#3C3C3C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {expression === "sad" && (
          <path d="M 66 106 Q 80 96, 94 106" stroke="#3C3C3C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {expression === "celebrate" && (
          <path d="M 64 98 Q 80 112, 96 98 L 64 98 Z" fill="#3C3C3C" />
        )}
        {expression === "thinking" && (
          <path d="M 66 102 Q 74 98, 82 102 Q 90 106, 94 102" stroke="#3C3C3C" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {expression === "default" && (
          <line x1="68" y1="102" x2="92" y2="102" stroke="#3C3C3C" strokeWidth="3" strokeLinecap="round" />
        )}
        {expression === "alert" && (
          <ellipse cx="80" cy="100" rx="8" ry="5" fill="#3C3C3C" />
        )}

        {/* Arms */}
        <rect x="18" y="74" width="16" height="44" rx="8" fill="#FF9600" stroke="#3C3C3C" strokeWidth="3" />
        <rect x="126" y="74" width="16" height="44" rx="8" fill="#FF9600" stroke="#3C3C3C" strokeWidth="3" />

        {/* Hands */}
        <circle cx="26" cy="120" r="9" fill="#FF9600" stroke="#3C3C3C" strokeWidth="3" />
        <circle cx="134" cy="120" r="9" fill="#FF9600" stroke="#3C3C3C" strokeWidth="3" />

        {/* Feet */}
        <ellipse cx="58" cy="148" rx="14" ry="7" fill="#3C3C3C" />
        <ellipse cx="102" cy="148" rx="14" ry="7" fill="#3C3C3C" />

        {/* Sparkles for celebrate */}
        {expression === "celebrate" && (
          <>
            <m.g
              animate={{ scale: [0, 1.2, 0], rotate: [0, 180] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.1 }}
              style={{ transformOrigin: "30px 30px" }}
            >
              <path d="M 30 22 L 32 28 L 38 30 L 32 32 L 30 38 L 28 32 L 22 30 L 28 28 Z" fill="#FFC800" />
            </m.g>
            <m.g
              animate={{ scale: [0, 1, 0], rotate: [0, -180] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }}
              style={{ transformOrigin: "130px 40px" }}
            >
              <path d="M 130 32 L 132 38 L 138 40 L 132 42 L 130 48 L 128 42 L 122 40 L 128 38 Z" fill="#1CB0F6" />
            </m.g>
            <m.g
              animate={{ scale: [0, 1.2, 0], rotate: [0, 180] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.8 }}
              style={{ transformOrigin: "140px 80px" }}
            >
              <path d="M 140 72 L 142 78 L 148 80 L 142 82 L 140 88 L 138 82 L 132 80 L 138 78 Z" fill="#FF4B4B" />
            </m.g>
          </>
        )}

        {/* Question mark for thinking */}
        {expression === "thinking" && (
          <m.text
            x="118"
            y="60"
            fontSize="22"
            fontWeight="900"
            fill="#FFC800"
            stroke="#3C3C3C"
            strokeWidth="1.5"
            fontFamily="var(--font-bricolage), sans-serif"
            animate={{ y: [60, 55, 60], rotate: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ transformOrigin: "118px 55px" }}
          >
            ?
          </m.text>
        )}

        {/* Sweat drop for sad */}
        {expression === "sad" && (
          <m.g
            animate={{ y: [0, 6, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path d="M 116 60 Q 120 70, 116 76 Q 112 70, 116 60 Z" fill="#1CB0F6" stroke="#3C3C3C" strokeWidth="1.5" />
          </m.g>
        )}

        {/* Alert ! for alert */}
        {expression === "alert" && (
          <m.g
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: "118px 60px" }}
          >
            <circle cx="118" cy="60" r="11" fill="#FF4B4B" stroke="#3C3C3C" strokeWidth="2.5" />
            <text x="118" y="67" fontSize="16" fontWeight="900" fill="white" textAnchor="middle" fontFamily="var(--font-bricolage), sans-serif">!</text>
          </m.g>
        )}

        {/* AWS label on body */}
        <text x="80" y="132" fontSize="9" fontWeight="800" fill="white" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" letterSpacing="1.5">
          ON-CALL
        </text>
      </svg>
    </m.div>
  );
}
