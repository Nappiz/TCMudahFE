"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  ChevronRight,
  ClipboardCheck,
  FileBox,
  FileVideo,
  GraduationCap,
  Home,
  Layers,
  Link2,
  type LucideIcon,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { apiMe } from "../../../../lib/api";
import {
  NotificationsProvider,
  type NotificationsSummary,
  useNotifications,
} from "../../../hooks/useNotifications";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

type MenuItem =
  | { href: string; label: string; icon: LucideIcon }
  | { type: "divider"; key: string };

const MENU_ITEMS: MenuItem[] = [
  { href: "/cms", label: "Overview", icon: Home },
  { href: "/cms/orders", label: "Orders", icon: BadgeCheck },
  { type: "divider", key: "commerce" },
  { href: "/cms/batches", label: "Batches", icon: Layers },
  { href: "/cms/classes", label: "Kelas", icon: GraduationCap },
  { href: "/cms/curriculum", label: "Kurikulum", icon: BookOpenText },
  { href: "/cms/materials", label: "Materi Video", icon: FileVideo },
  { href: "/cms/mentors", label: "Mentor", icon: Users },
  { type: "divider", key: "access" },
  { href: "/cms/user-role", label: "Users & Role", icon: Users },
  { href: "/cms/enrollments", label: "Enrollments", icon: FileBox },
  { type: "divider", key: "content" },
  { href: "/cms/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/cms/feedback", label: "Feedbacks", icon: MessageSquare },
  { href: "/cms/shortlinks", label: "Shortlinks", icon: Link2 },
  { type: "divider", key: "configuration" },
  { href: "/cms/settings", label: "Settings", icon: Settings },
];

export default function CMSLayoutClient({ children }: { children: ReactNode }) {
  return (
    <NotificationsProvider>
      <CMSLayoutContent>{children}</CMSLayoutContent>
    </NotificationsProvider>
  );
}

function CMSLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data: notifications } = useNotifications();

  useEffect(() => {
    if (pathname) setMobileMenuOpen(false);
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
        if (!cancel) {
          const next = pathname || "/cms";
          router.replace(`/login?next=${encodeURIComponent(next)}`);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [router, pathname]);

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
        <TopBar onOpenMenu={() => setMobileMenuOpen(true)} />

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({
  me,
  notifications,
}: {
  me: User;
  notifications: NotificationsSummary;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0B0E14]">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="relative h-6 w-6">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <span className="font-bold text-white tracking-tight">TC CMS</span>
        <span className="ml-auto text-[10px] font-mono text-white/20 px-1.5 py-0.5 rounded border border-white/10">
          v2.0
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        <NavLinks
          pathname={pathname}
          notifications={notifications}
          canManageSettings={me.role === "admin" || me.role === "superadmin"}
        />
      </nav>

      <div className="p-4 border-t border-white/5">
        <UserProfile me={me} />
      </div>
    </aside>
  );
}

function MobileSidebar({
  me,
  isOpen,
  onClose,
  notifications,
}: {
  me: User;
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationsSummary;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0B0E14] lg:hidden shadow-2xl"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-white tracking-tight">
                  TC CMS
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu navigasi"
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <NavLinks
                pathname={pathname}
                notifications={notifications}
                canManageSettings={
                  me.role === "admin" || me.role === "superadmin"
                }
              />
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

function NavLinks({
  pathname,
  notifications,
  canManageSettings,
}: {
  pathname: string;
  notifications: NotificationsSummary;
  canManageSettings: boolean;
}) {
  return (
    <>
      {MENU_ITEMS.map((item) => {
        if (
          !canManageSettings &&
          (("href" in item && item.href === "/cms/settings") ||
            ("type" in item && item.key === "configuration"))
        ) {
          return null;
        }
        if ("type" in item)
          return <div key={item.key} className="my-4 h-px bg-white/5" />;
        const Icon = item.icon;
        const isActive = pathname === item.href;

        let badgeCount = 0;
        if (item.href === "/cms/orders") badgeCount = notifications.new_orders;
        if (item.href === "/cms/user-role")
          badgeCount = notifications.new_users;
        if (item.href === "/cms/feedback")
          badgeCount = notifications.new_feedbacks;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400/70"}`}
              />
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
  );
}

function UserProfile({ me }: { me: User }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
        {me.full_name ? me.full_name[0] : "U"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-white truncate">
          {me.full_name}
        </div>
        <div className="text-[10px] text-slate-500 capitalize">{me.role}</div>
      </div>
    </div>
  );
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { data: notifications, loading } = useNotifications();
  const title =
    MENU_ITEMS.find(
      (item): item is Extract<MenuItem, { href: string }> =>
        "href" in item &&
        (item.href === pathname ||
          (item.href !== "/cms" && pathname.startsWith(`${item.href}/`))),
    )?.label || "Overview";
  const pendingOrders = notifications.new_orders;
  const actionFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0B0E14]/95 px-4 backdrop-blur lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu navigasi"
          className={`-ml-2 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden ${actionFocus}`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav
          aria-label="Lokasi halaman"
          className="flex min-w-0 items-center gap-2.5 text-sm"
        >
          <Link
            href="/cms"
            className={`hidden shrink-0 rounded text-slate-500 transition-colors hover:text-cyan-300 sm:inline ${actionFocus}`}
          >
            CMS
          </Link>
          <ChevronRight
            className="hidden h-3.5 w-3.5 shrink-0 text-slate-600 sm:block"
            aria-hidden="true"
          />
          <span
            aria-current="page"
            className="truncate font-medium text-slate-200"
          >
            {title}
          </span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/cms/orders"
          aria-label={
            !loading && pendingOrders > 0
              ? `Tinjau ${pendingOrders.toLocaleString("id-ID")} pesanan menunggu`
              : "Lihat pesanan"
          }
          className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 ${actionFocus}`}
        >
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {!loading && pendingOrders > 0 ? "Review pesanan" : "Pesanan"}
          </span>
          {!loading && pendingOrders > 0 && (
            <span
              className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 tabular-nums"
              aria-hidden="true"
            >
              {pendingOrders > 99 ? "99+" : pendingOrders}
            </span>
          )}
        </Link>
        <div
          className="hidden h-4 w-px bg-white/10 sm:block"
          aria-hidden="true"
        />
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buka website di tab baru"
          className={`flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300 sm:px-3 ${actionFocus}`}
        >
          <span className="hidden sm:inline">Buka website</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
