import { useMemo } from 'react';

const COLORS = ['#2f9d6a', '#d4a017', '#9a7420', '#d64555', '#4a7fd4', '#e8a0bf'];

type Piece = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: number;
  rotate: number;
};

function makePieces(side: 'left' | 'right', count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: side === 'left'
      ? `${4 + Math.random() * 18}%`
      : `${78 + Math.random() * 18}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${2.2 + Math.random() * 1.6}s`,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    rotate: Math.floor(Math.random() * 360),
  }));
}

export function Confetti() {
  const pieces = useMemo(
    () => [...makePieces('left', 28), ...makePieces('right', 28)],
    [],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={`${p.left}-${p.id}`}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size * 0.55,
            animationDelay: p.delay,
            animationDuration: p.duration,
            ['--spin' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

export function isJohannesWinner(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === 'johannes' || n === 'jopi' || n === 'jo';
}
