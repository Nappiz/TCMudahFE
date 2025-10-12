"use client";
import { useCallback, useState } from "react";

export function useModal(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  return { open, onOpen, onClose, setOpen };
}
