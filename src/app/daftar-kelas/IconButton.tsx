"use client";

import { motion } from "framer-motion";

export default function IconButton({
  onClick,
  children,
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-colors"
      type="button"
    >
      {children}
    </motion.button>
  );
}