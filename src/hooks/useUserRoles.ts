import { useEffect, useMemo, useState } from "react";
import {
  fetchMe,
  fetchAdminUsers,
  updateUserRole,
  type Role,
  type User,
} from "../../lib/admin";

export function useUserRoles() {
  const [me, setMe] = useState<User | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Record<string, Role>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setErr(null);
        const [meRes, list] = await Promise.all([fetchMe(), fetchAdminUsers()]);
        if (cancel) return;

        const top = list.find((u) => u.id === meRes.id);
        const rest = list.filter((u) => u.id !== meRes.id);

        setMe(meRes);
        setRows(top ? [top, ...rest] : list);
      } catch (e: any) {
        if (!cancel) {
          setErr(e?.message || "Gagal memuat data");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const canEdit = useMemo(
    () => !!(me && (me.role === "admin" || me.role === "superadmin")),
    [me],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((u: any) => {
      const fullName = u.full_name?.toLowerCase?.() ?? "";
      const email = u.email?.toLowerCase?.() ?? "";
      const role = u.role?.toLowerCase?.() ?? "";
      const nim = u.nim?.toLowerCase?.() ?? ""; // kalau ada nim

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        nim.includes(q) ||
        role.includes(q)
      );
    });
  }, [rows, search]);

  const setPendingRole = (userId: string, role: Role) => {
    setPending((p) => ({ ...p, [userId]: role }));
  };

  const saveUserRole = async (user: User): Promise<User | null> => {
    const newRole = (pending[user.id] ?? user.role) as Role;
    if (newRole === user.role) return null;

    setSaving((s) => ({ ...s, [user.id]: true }));

    try {
      const updated = await updateUserRole(user.id, newRole);

      setRows((rs) =>
        rs.map((r) => (r.id === user.id ? { ...r, role: updated.role } : r)),
      );

      setPending((p) => {
        const { [user.id]: _, ...rest } = p;
        return rest;
      });

      return updated;
    } catch (e: any) {
      throw e;
    } finally {
      setSaving((s) => ({ ...s, [user.id]: false }));
    }
  };

  return {
    me,
    rows,
    loading,
    err,
    search,
    setSearch,
    canEdit,
    filtered,
    pending,
    saving,
    setPendingRole,
    saveUserRole,
  };
}
