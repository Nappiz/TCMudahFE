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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [pending, setPending] = useState<Record<string, Role>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMe().then(setMe).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      try {
        setErr(null);
        const res = await fetchAdminUsers(page, limit, debouncedSearch, roleFilter);
        if (cancel) return;

        setTotal(res.total);
        setRows(res.data);
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
  }, [page, limit, debouncedSearch, roleFilter]);

  const canEdit = useMemo(
    () => !!(me && (me.role === "admin" || me.role === "superadmin")),
    [me],
  );

  const filtered = rows;

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
    page,
    setPage,
    limit,
    total,
    roleFilter,
    setRoleFilter,
  };
}
