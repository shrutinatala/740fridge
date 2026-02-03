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
        "pointer-events-none select-none absolute",
        "drop-shadow-[0_10px_18px_rgba(17,24,39,0.18)]",
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
