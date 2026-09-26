"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { StatusModal } from "@/components/modal/StatusModal";

type ErrorContextType = {
  showError: (message: string, title?: string) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);

  const showError = (message: string, title?: string) => {
    setErrorMsg(message);
    setErrorTitle(title || "Terjadi Kesalahan");
  };

  const closeError = () => {
    setErrorMsg(null);
    setErrorTitle(null);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <StatusModal
        open={errorMsg !== null}
        onClose={closeError}
        title={errorTitle || "Terjadi Kesalahan"}
        variant="error"
      >
        <p className="text-sm leading-relaxed text-white/70">{errorMsg}</p>
      </StatusModal>
    </ErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useGlobalError must be used within an ErrorProvider");
  }
  return context;
}
