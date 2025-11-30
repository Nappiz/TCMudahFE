import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import type { 
  AdminOrder, 
  OrderStatus, 
  Role, 
  Me,
  ClassItem,
  Mentor,
  Testimonial,
  Curriculum
} from "@/types/catalog"; 

export type DailyPoint = { key: string; label: string; value: number };

export type CMSStats = {
  // users
  totalUsers: number;
  superadmin: number;
  admin: number;
  mentor: number;
  peserta: number;
  newUsers30d: number;

  // konten
  totalCurr: number;
  totalT: number;
  visibleT: number;
  hiddenT: number;
  totalMentors: number;
  visibleMentors: number;
  totalClasses: number;
  visibleClasses: number;
  classPerMentor: number;

  // orders
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  expiredOrders: number;
  revenueApproved: number;
  revenue30d: number;
  participantsActive: number;
  aov: number;
  approvalRate: number;

  // chart
  orderSeries: DailyPoint[];
  revSeries: DailyPoint[];
};

export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at?: string;
};

/* =========================================================
 * Helpers
 * =======================================================*/

export function parseDate(d?: string) {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function isWithinDays(dateStr?: string, days = 30) {
  const t = parseDate(dateStr);
  if (!t) return false;
  return t >= daysAgo(days);
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString('id-ID', {
    month: "short",
    day: "numeric",
  });
}

function buildDailyBuckets(days: number): DailyPoint[] {
  const arr: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10); 
    arr.push({
      key,
      label: formatShortDate(d),
      value: 0,
    });
  }
  return arr;
}

function computeStats(
  users: UserRow[],
  curriculum: Curriculum[], 
  testimonials: Testimonial[], 
  mentors: Mentor[], 
  classes: ClassItem[], 
  orders: AdminOrder[]
): CMSStats {
  // Users
  const totalUsers = users.length;
  const superadmin = users.filter((x) => x.role === "superadmin").length;
  const admin = users.filter((x) => x.role === "admin").length;
  const mentor = users.filter((x) => x.role === "mentor").length;
  const peserta = users.filter((x) => x.role === "peserta").length;
  const newUsers30d = users.filter((u) => isWithinDays(u.created_at, 30)).length;

  // Curriculum
  const totalCurr = curriculum.length;

  // Testimonials
  const totalT = testimonials.length;
  const visibleT = testimonials.filter((x: any) => x.visible).length; 
  const hiddenT = totalT - visibleT;

  // Mentors
  const totalMentors = mentors.length;
  const visibleMentors = mentors.filter((x) => x.visible).length;

  // Classes
  const totalClasses = classes.length;
  const visibleClasses = classes.filter((c) => c.visible).length;
  const classPerMentor = totalMentors ? totalClasses / totalMentors : 0;

  // Orders
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const expiredOrders = orders.filter((o) => o.status === "expired").length;

  const revenueApproved = orders
    .filter((o) => o.status === "approved")
    .reduce((s, o) => s + (o.total || 0), 0);

  const participantsActive = (() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.status === "approved" && o.user_id) set.add(o.user_id);
    });
    return set.size;
  })();

  const aov = approvedOrders ? revenueApproved / approvedOrders : 0;
  const approvalRate = totalOrders
    ? Math.round((approvedOrders / totalOrders) * 100)
    : 0;

  const revenue30d = orders
    .filter((o) => o.status === "approved" && isWithinDays(o.created_at, 30))
    .reduce((s, o) => s + (o.total || 0), 0);

  const days = 14;
  const orderSeries = buildDailyBuckets(days);
  const revSeries = buildDailyBuckets(days);

  orders.forEach((o) => {
    const t = parseDate(o.created_at);
    if (!t) return;
    const key = t.toISOString().slice(0, 10);

    const os = orderSeries.find((d) => d.key === key);
    if (os) os.value += 1;

    const rs = revSeries.find((d) => d.key === key);
    if (rs && o.status === "approved") rs.value += o.total || 0;
  });

  return {
    totalUsers,
    superadmin,
    admin,
    mentor,
    peserta,
    newUsers30d,
    totalCurr,
    totalT,
    visibleT,
    hiddenT,
    totalMentors,
    visibleMentors,
    totalClasses,
    visibleClasses,
    classPerMentor,
    totalOrders,
    pendingOrders,
    approvedOrders,
    rejectedOrders,
    expiredOrders,
    revenueApproved,
    revenue30d,
    participantsActive,
    aov,
    approvalRate,
    orderSeries,
    revSeries,
  };
}

export function useCMSOverview() {
  const [me, setMe] = useState<Me | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]); 
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const m = await api<Me>("/me");
      setMe(m);

      const [u, c, t, mn, cl, od] = await Promise.allSettled([
        api<UserRow[]>("/admin/users"),
        api<Curriculum[]>("/curriculum"),
        api<Testimonial[]>("/admin/testimonials"),
        api<Mentor[]>("/admin/mentors"),
        api<ClassItem[]>("/admin/classes"), 
        api<AdminOrder[]>("/admin/orders"),
      ]);

      setUsers(u.status === "fulfilled" ? u.value : []);
      setCurriculum(c.status === "fulfilled" ? c.value : []);
      setTestimonials(t.status === "fulfilled" ? t.value : []);
      setMentors(mn.status === "fulfilled" ? mn.value : []);
      setClasses(cl.status === "fulfilled" ? cl.value : []);
      setOrders(od.status === "fulfilled" ? od.value : []);
      setLastLoadedAt(new Date());
    } catch (e: any) {
      setErr(e?.message ?? "Gagal memuat CMS.");
      setUsers([]);
      setCurriculum([]);
      setTestimonials([]);
      setMentors([]);
      setClasses([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const stats = useMemo(
    () =>
      computeStats(
        users,
        curriculum,
        testimonials,
        mentors,
        classes,
        orders
      ),
    [users, curriculum, testimonials, mentors, classes, orders]
  );

  return { me, stats, orders, classes, loading, err, lastLoadedAt, reload };
}