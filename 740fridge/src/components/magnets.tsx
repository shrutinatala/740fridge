import * as React from "react";

interface MagnetProps {
  className?: string;
  style?: React.CSSProperties;
}

function MagnetShell({
  className,
  style,
  children,
}: React.PropsWithChildren<MagnetProps>) {
  return (
    <div
      className={[
        "magnet pointer-events-none select-none absolute",
        "drop-shadow-sm",
        className ?? "",
      ].join(" ")}
      style={style}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function CircleMagnet({ className, style }: MagnetProps) {
  return (
    <MagnetShell className={className} style={style}>
      <div className="h-10 w-10 rounded-full bg-gradient-to-b from-white/60 to-white/0 p-[2px]">
        <div className="h-full w-full rounded-full bg-[color:var(--circle)] shadow-inner" />
      </div>
    </MagnetShell>
  );
}

export function UscMagnet({ className, style }: MagnetProps) {
  return (
    <MagnetShell className={className} style={style}>
      <div className="rounded-2xl bg-gradient-to-b from-white/65 to-white/0 p-[2px]">
        <div className="rounded-2xl bg-[#7A0019] px-4 py-2 text-sm font-extrabold tracking-widest text-[#FFC72C] shadow-inner">
          USC
        </div>
      </div>
    </MagnetShell>
  );
}

export function FlowerMagnet({
  className,
  style,
  fill = "#F9A8D4",
}: MagnetProps & { fill?: string }) {
  // Rounded, toy-like petals with a soft highlight.
  return (
    <MagnetShell className={className} style={style}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <defs>
          <filter id="inner" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dy="0.6" />
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite
              in="SourceGraphic"
              in2="blur"
              operator="arithmetic"
              k2="-1"
              k3="1"
            />
          </filter>
          <radialGradient id="shine" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="55%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g filter="url(#inner)">
          <path
            d="M22 6.5c3.2 0 4.5 3 4.5 5.2 0 1.2-.3 2.1-.8 3 1-.4 2-.6 3.3-.6 2.2 0 5.2 1.3 5.2 4.5 0 2.9-2.2 4.4-4.2 5 .8.5 1.6 1.2 2.3 2.1 1.3 1.8 1.9 4.9-.7 6.7-2.6 1.9-5.5.4-7-1.1-.8-.8-1.4-1.7-1.8-2.6-.4.9-1 1.8-1.8 2.6-1.5 1.5-4.4 3-7 1.1-2.6-1.8-2-4.9-.7-6.7.7-.9 1.5-1.6 2.3-2.1-2-.6-4.2-2.1-4.2-5 0-3.2 3-4.5 5.2-4.5 1.3 0 2.3.2 3.3.6-.5-.9-.8-1.8-.8-3C17.5 9.5 18.8 6.5 22 6.5Z"
            fill={fill}
          />
          <circle cx="22" cy="22.5" r="6.2" fill="#FDE68A" />
          <circle cx="22" cy="22.5" r="6.2" fill="url(#shine)" />
        </g>
      </svg>
    </MagnetShell>
  );
}
