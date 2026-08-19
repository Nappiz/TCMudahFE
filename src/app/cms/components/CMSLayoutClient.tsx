"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BadgeCheck, Home, Users, BookOpenText, MessageSquare, 
  GraduationCap, FileBox, FileVideo, Link2, Search, Bell, Menu, X, Layers
} from "lucide-react";
import { apiMe } from "../../../../lib/api";
import { useNotifications, NotificationsSummary } from "../../../hooks/useNotifications";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

const MENU_ITEMS = [
  { href: "/cms", label: "Overview", icon: Home },
  { href: "/cms/orders", label: "Orders", icon: BadgeCheck },
  { type: "divider" },
  { href: "/cms/batches", label: "Batches", icon: Layers },
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
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname(); 
  
  const { data: notifications, fetchNotifications } = useNotifications();

  useEffect(() => {
    setMobileMenuOpen(false);
    
    // Update local storage when visiting specific pages
    let updated = false;
    if (pathname === "/cms/user-role") {
      localStorage.setItem("cms_last_seen_users", new Date().toISOString());
      updated = true;
    }
    if (pathname === "/cms/feedback") {
      localStorage.setItem("cms_last_seen_feedbacks", new Date().toISOString());
      updated = true;
    }
    
    if (updated) {
      // Re-fetch to clear the badge immediately
      fetchNotifications();
    }
  }, [pathname]);

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
      <Sidebar me={me} notifications={notifications} />
      <MobileSidebar 
        me={me} 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        notifications={notifications}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar me={me} onOpenMenu={() => setMobileMenuOpen(true)} />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
           <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ me, notifications }: { me: User, notifications: NotificationsSummary }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0B0E14]">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="relative h-6 w-6">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <span className="font-bold text-white tracking-tight">TC CMS</span>
        <span className="ml-auto text-[10px] font-mono text-white/20 px-1.5 py-0.5 rounded border border-white/10">v2.0</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        <NavLinks pathname={pathname} notifications={notifications} />
      </nav>

      <div className="p-4 border-t border-white/5">
        <UserProfile me={me} />
      </div>
    </aside>
  );
}

function MobileSidebar({ me, isOpen, onClose, notifications }: { me: User; isOpen: boolean; onClose: () => void; notifications: NotificationsSummary }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0B0E14] lg:hidden shadow-2xl"
          >
             <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative h-6 w-6">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-white tracking-tight">TC CMS</span>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
             </div>

             <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <NavLinks pathname={pathname} notifications={notifications} />
             </nav>

             <div className="p-4 border-t border-white/5">
                <UserProfile me={me} />
             </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function NavLinks({ pathname, notifications }: { pathname: string, notifications: NotificationsSummary }) {
    return (
        <>
            {MENU_ITEMS.map((item, i) => {
                if (item.type === "divider") return <div key={i} className="my-4 h-px bg-white/5" />;
                const Icon = item.icon as any;
                const isActive = pathname === item.href;
                
                let badgeCount = 0;
                if (item.href === "/cms/orders") badgeCount = notifications.new_orders;
                if (item.href === "/cms/user-role") badgeCount = notifications.new_users;
                if (item.href === "/cms/feedback") badgeCount = notifications.new_feedbacks;
                
                return (
                    <Link
                    key={item.href}
                    href={item.href!}
                    prefetch={true}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                    }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400/70"}`} />
                        {item.label}
                      </div>
                      {badgeCount > 0 && (
                        <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500/10 px-1.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </div>
                      )}
                    </Link>
                );
            })}
        </>
    )
}

function UserProfile({ me }: { me: User }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
           <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
              {me.full_name ? me.full_name[0] : "U"}
           </div>
           <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{me.full_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{me.role}</div>
           </div>
        </div>
    )
}

function TopBar({ me, onOpenMenu }: { me: User; onOpenMenu: () => void }) {
    const pathname = usePathname();
    const title = MENU_ITEMS.find(i => i.href === pathname)?.label || "Overview";

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onOpenMenu}
                    className="p-2 -ml-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        placeholder="Search..." 
                        className="h-9 w-40 lg:w-64 rounded-full bg-white/5 border border-white/5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-[#0B0E14]"></span>
                </button>
                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>
                <Link href="/" className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors hidden sm:block">
                    View Site
                </Link>
            </div>
        </header>
    )
}