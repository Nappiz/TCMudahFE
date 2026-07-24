"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { XCircle, X } from "lucide-react";

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
      {errorMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a141b] border border-rose-500/20 rounded-2xl w-full max-w-md shadow-[0_0_40px_-10px_rgba(244,63,94,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-rose-500/10 rounded-xl shrink-0">
                  <XCircle className="w-8 h-8 text-rose-500" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-1">{errorTitle}</h3>
                  <p className="text-sm text-rose-200/70 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
                <button
                  onClick={closeError}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button
                onClick={closeError}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
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
