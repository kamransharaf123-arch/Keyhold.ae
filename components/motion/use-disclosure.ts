"use client";

import { useEffect, useRef, useState } from "react";

export function useDisclosure(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return { open, setOpen, close: () => setOpen(false), toggle: () => setOpen((value) => !value), rootRef };
}
