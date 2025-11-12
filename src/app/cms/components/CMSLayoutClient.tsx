"use client";

import {
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import {
  BadgeCheck,
  Home,
  Users,
  BookOpenText,
  MessageSquare,
  GraduationCap,
  FileBox,
  FileVideo,
  Link2,
} from "lucide-react";

import { apiMe } from "../../../../lib/api";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MENU_ITEMS: MenuItem[] = [
  { href: "/cms", label: "Home", icon: Home },
  { href: "/cms/user-role", label: "User Role", icon: Users },
  { href: "/cms/curriculum", label: "Kurikulum", icon: BookOpenText },
  { href: "/cms/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/cms/mentors", label: "Mentor", icon: Users },
  { href: "/cms/classes", label: "Kelas", icon: GraduationCap },
  { href: "/cms/orders", label: "Orders", icon: BadgeCheck },
  { href: "/cms/enrollments", label: "Enrollments", icon: FileBox },
  { href: "/cms/materials", label: "Materials", icon: FileVideo },
  { href: "/cms/feedback", label: "Feedbacks", icon: MessageSquare },
  { href: "/cms/shortlinks", label: "Shortlinks", icon: Link2 },
];

export default function CMSLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

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
        if (!cancel) {
          router.replace("/");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [router]);

  const activeLabel = useMemo(() => {
    if (pathname === "/cms") return "Home";
    const last = pathname.split("/").filter(Boolean).slice(-1)[0] ?? "";
    return last.replace(/-/g, " ");
  }, [pathname]);

  if (loading) {
    return (
      <main className="min-h-[60vh] py-24">
        <Container className="max-w-7xl px-4 md:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse text-white/70">
            Memuat CMS…
          </div>
        </Container>
      </main>
    );
  }

  if (!me) return null;

  return (
    <main className="min-h-screen py-20">
      {/* Background accent */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_460px_at_18%_-10%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(820px_480px_at_85%_0%,rgba(99,102,241,0.14),transparent_60%)]" />
      </div>

      <Container className="max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar me={me} pathname={pathname} />

          <section className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(15,23,42,0.55)]">
            <TopBar activeLabel={activeLabel} role={me.role} />

            <div className="p-5">{children}</div>
          </section>
        </div>
      </Container>
    </main>
  );
}

/* =========================================================
 * Sub Components
 * =======================================================*/

function Sidebar({ me, pathname }: { me: User; pathname: string }) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(15,23,42,0.65)]">
      <div className="relative overflow-hidden rounded-t-2xl border-b border-white/10 p-4">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs text-white/60">Masuk sebagai</div>
              <div className="truncate text-sm font-semibold text-white">
                {me.full_name}
              </div>
              <div className="truncate text-xs text-white/60">
                {me.email}
              </div>
            </div>
            <RoleBadge role={me.role} />
          </div>
        </div>
      </div>

      <nav className="p-2">
        {MENU_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
        active
          ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset]"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4 opacity-90" />
      <span className="truncate">{item.label}</span>
      {active && (
        <span className="absolute inset-y-1 right-1 w-[3px] rounded-full bg-cyan-400" />
      )}
    </Link>
  );
}

function TopBar({
  activeLabel,
  role,
}: {
  activeLabel: string;
  role: Role;
}) {
  return (
    <div className="sticky top-16 z-10 rounded-t-2xl border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="text-white/80">CMS</span>
          <span className="text-white/30">/</span>
          <span className="capitalize">{activeLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          Role aktif:{" "}
          <span className="capitalize text-white">{role}</span>
          <BadgeCheck className="h-4 w-4 text-emerald-300" />
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; color: string }> = {
    superadmin: { label: "Superadmin", color: "from-rose-400 to-pink-500" },
    admin: { label: "Admin", color: "from-amber-400 to-orange-500" },
    mentor: { label: "Mentor", color: "from-emerald-400 to-teal-500" },
    peserta: { label: "Peserta", color: "from-slate-300 to-slate-400" },
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg bg-gradient-to-r ${map[role].color} px-2 py-1 text-[10px] font-semibold text-slate-900`}
    >
      {map[role].label}
    </span>
  );
}
