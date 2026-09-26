import Link from "next/link";
import { STAFF_ENTRY_PATH } from "./providers/maintenanceGateLogic";

type MaintenanceScreenProps = {
  message: string;
};

export default function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          TC Mudah
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Kami sedang melakukan perawatan
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
          {message}
        </p>
        <Link
          href={STAFF_ENTRY_PATH}
          className="mt-7 inline-flex rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Masuk sebagai staf
        </Link>
      </div>
    </main>
  );
}
