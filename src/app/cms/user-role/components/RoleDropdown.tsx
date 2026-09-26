"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export type RoleDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  labelId: string;
  value: string;
  onChange: (value: string) => void;
  options?: RoleDropdownOption[];
  disabled?: boolean;
};

const defaultOptions: RoleDropdownOption[] = [
  { value: "", label: "Semua role" },
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "mentor", label: "Mentor" },
  { value: "peserta", label: "Peserta" },
];

function firstEnabledIndex(options: RoleDropdownOption[]) {
  const index = options.findIndex((option) => !option.disabled);
  return index < 0 ? 0 : index;
}

function moveEnabledIndex(
  options: RoleDropdownOption[],
  currentIndex: number,
  direction: 1 | -1,
) {
  for (let step = 1; step <= options.length; step += 1) {
    const nextIndex =
      (currentIndex + direction * step + options.length) % options.length;
    if (!options[nextIndex].disabled) return nextIndex;
  }

  return currentIndex;
}

function edgeEnabledIndex(options: RoleDropdownOption[], fromEnd: boolean) {
  const indices = options.map((_, index) => index);
  if (fromEnd) indices.reverse();
  return indices.find((index) => !options[index].disabled) ?? 0;
}

export function RoleDropdown({
  labelId,
  value,
  onChange,
  options = defaultOptions,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusIndexRef = useRef(0);
  const menuId = useId();
  const valueId = menuId.concat("-value");
  const resolvedOptions = options.length ? options : defaultOptions;
  const selectedIndex = Math.max(
    0,
    resolvedOptions.findIndex((option) => option.value === value),
  );
  const selectedOption = resolvedOptions[selectedIndex];

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() => {
      optionRefs.current[focusIndexRef.current]?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu(true);
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [closeMenu, open]);

  function openMenu(index = selectedIndex) {
    const nextIndex = resolvedOptions[index]?.disabled
      ? firstEnabledIndex(resolvedOptions)
      : index;
    focusIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setOpen(true);
  }

  function chooseOption(nextValue: string) {
    onChange(nextValue);
    closeMenu(true);
  }

  function handleBlur(event: FocusEvent<HTMLButtonElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      closeMenu();
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(selectedIndex);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") {
      nextIndex = moveEnabledIndex(resolvedOptions, index, 1);
    } else if (event.key === "ArrowUp") {
      nextIndex = moveEnabledIndex(resolvedOptions, index, -1);
    } else if (event.key === "Home") {
      nextIndex = edgeEnabledIndex(resolvedOptions, false);
    } else if (event.key === "End") {
      nextIndex = edgeEnabledIndex(resolvedOptions, true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      focusIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      optionRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={menuId.concat("-trigger")}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-labelledby={labelId.concat(" ", valueId)}
        onBlur={handleBlur}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        className={
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-left text-sm outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/[0.1] " +
          (disabled
            ? "cursor-not-allowed border-white/[0.06] bg-white/[0.025] text-white/35"
            : value
              ? "cursor-pointer border-cyan-300/20 bg-cyan-300/[0.035] text-white hover:border-cyan-200/35"
              : "cursor-pointer border-white/[0.09] bg-[#0a0f16]/75 text-white hover:border-white/[0.15]") +
          " focus-visible:border-cyan-300/45"
        }
      >
        <span id={valueId}>{selectedOption.label}</span>
        <span
          aria-hidden="true"
          className={
            "h-2 w-2 shrink-0 border-b border-r transition duration-200 " +
            (open
              ? "rotate-[225deg] border-cyan-200/75"
              : disabled
                ? "rotate-45 border-white/20"
                : "rotate-45 border-white/45")
          }
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Pilihan role"
        aria-hidden={!open}
        inert={!open}
        className={
          "absolute left-0 right-0 top-full z-50 mt-2 origin-top rounded-2xl border border-white/[0.1] bg-[#0b111a]/[0.98] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-150 ease-out " +
          (open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0")
        }
      >
        {resolvedOptions.map((option, index) => {
          const selected = option.value === value;
          const active = index === activeIndex;
          const optionDisabled = disabled || !!option.disabled;

          return (
            <button
              key={option.value || "all"}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              id={menuId.concat("-option-", String(index))}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              tabIndex={open && active && !optionDisabled ? 0 : -1}
              onBlur={handleBlur}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => {
                if (!optionDisabled) setActiveIndex(index);
              }}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              onClick={() => !optionDisabled && chooseOption(option.value)}
              disabled={optionDisabled}
              className={
                "flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300/30 " +
                (optionDisabled
                  ? "cursor-not-allowed border-transparent text-white/30"
                  : selected
                    ? "cursor-pointer border-cyan-300/[0.14] bg-cyan-300/[0.07] font-medium text-white"
                    : "cursor-pointer border-transparent text-white/65 hover:bg-white/[0.045] hover:text-white") +
                (active && !optionDisabled
                  ? " shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]"
                  : "")
              }
            >
              <span>{option.label}</span>
              <span
                aria-hidden="true"
                className={
                  "flex h-4 w-4 items-center justify-center rounded-full border transition " +
                  (selected
                    ? "border-cyan-200/70 bg-cyan-200/[0.08]"
                    : "border-white/20")
                }
              >
                {selected ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
