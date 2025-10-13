"use client";

export default function IconButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-white/10 bg-white/10 p-1.5 text-white hover:bg-white/15"
      type="button"
    >
      {children}
    </button>
  );
}
