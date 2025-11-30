"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Home, Users, BookOpenText, MessageSquare, GraduationCap, FileBox, FileVideo, Link2, Search, Bell, LogOut } from "lucide-react";
import { apiMe } from "../../../../lib/api";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

const MENU_ITEMS = [
  { href: "/cms", label: "Overview", icon: Home },
  { href: "/cms/orders", label: "Orders", icon: BadgeCheck }, 
  { type: "divider" },
  { href: "/cms/classes", label: "Kelas", icon: GraduationCap },
  { href: "/cms/curriculum", label: "Kurikulum", icon: BookOpenText },
  { href: "/cms/materials", label: "Materi Video", icon: FileVideo },
  { href: "/cms/mentors", label: "Mentor", icon: Users },
  { type: "divider" },
  { href: "/cms/user-role", label: "Users & Role", icon: Users },
  { href: "/cms/enrollments", label: "Enrollments", icon: FileBox },
  { type: "divider" },
  { href: "/cms/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/cms/feedback", label: "Feedbacks", icon: MessageSquare },
  { href: "/cms/shortlinks", label: "Shortlinks", icon: Link2 },
];

export default function CMSLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const u = await apiMe();
        if (cancel) return;
        if (u.role === "peserta") {
          router.replace("/");
          return;
        }
        setMe(u as User);
      } catch {
        if (!cancel) router.replace("/");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [router]);

  if (loading) return null; 
  if (!me) return null;

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar me={me} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar me={me} />
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
           <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ me }: { me: User }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0B0E14]">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="relative h-6 w-6">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <span className="font-bold text-white tracking-tight">TC Mudah CMS</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_ITEMS.map((item, i) => {
          if (item.type === "divider") return <div key={i} className="my-4 h-px bg-white/5" />;
          const Icon = item.icon as any;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
           <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
              {me.full_name[0]}
           </div>
           <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{me.full_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{me.role}</div>
           </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ me }: { me: User }) {
    const pathname = usePathname();
    const title = MENU_ITEMS.find(i => i.href === pathname)?.label || "Overview";

    return (
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur sticky top-0 z-20">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            
            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-white/10 mx-1"></div>
                <Link href="/" className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                    View Site
                </Link>
            </div>
        </header>
    )
}