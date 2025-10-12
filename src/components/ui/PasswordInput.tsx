"use client";
import { useState } from "react";
import Input from "./Input";

export default function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="cursor-pointer absolute inset-y-0 right-2.5 my-auto h-8 rounded-md px-2 text-[11px] text-white/70 hover:text-white"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
