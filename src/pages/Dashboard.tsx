import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut,
  Sparkles,
  ArrowUpRight,
  Wand2,
  Image as ImageIcon,
  UploadCloud,
  Shield,
  Zap,
  Clock,
  Gift,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { GalleryImage } from "../services/galleryService";
import { PLAN_CONFIG, type PlanTier } from "../constants/planConfig";
import { deleteLocalGalleryEntry, deleteLocalGalleryEntriesByImageUrl, listLocalGalleryEntries } from "../services/localGallery";

type GalleryEntry = GalleryImage & {
  source: "cloud" | "localStorage" | "indexedDb";
};

type ActivityItem = {
  id: string;
  email: string;
  type: "login" | "image" | "invite" | "upgrade" | "logout";
  timestamp: number;
  meta?: Record<string, any>;
};

type UserInfo = {
  email: string;
  credits?: number;
  remaining_credits?: number;
  trial_remaining?: number;
  invite_remaining?: number;
  subscription_remaining?: number;
  plan: string;
  is_admin?: boolean;
  inviteUsed?: boolean;
};

type AdminSummary = {
  total: number;
  free: number;
  creator: number;
  studio: number;
  other: number;
};

type AdminUserRow = {
  email: string;
  plan: string;
  remaining_credits: number;
  created_at: number | null;
  last_login_at: number | null;
};

type DebugLogRow = {
  id: string;
  timestamp: number;
  kind: string;
  email?: string;
  data?: Record<string, any>;
};

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const activityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "login":
      return <Shield className="h-4 w-4 text-indigo-600" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-indigo-600" />;
    case "invite":
      return <Gift className="h-4 w-4 text-indigo-600" />;
    case "upgrade":
      return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    case "logout":
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const activityTitle = (item: ActivityItem) => {
  if (item.type === "image" && item.meta?.kind === "generation") {
    const status = String(item.meta?.status || "").toLowerCase();
    return status === "error" ? "generation failed" : "generation success";
  }
  return item.type;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);
  const [adminPlanFilter, setAdminPlanFilter] = useState<"all" | "free" | "creator" | "studio" | "other">("all");
  const [adminSearch, setAdminSearch] = useState("");
  const [debugLogs, setDebugLogs] = useState<DebugLogRow[]>([]);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugKindFilter, setDebugKindFilter] = useState("all");
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/user?action=me");
        if (!res.ok) {
          navigate("/login", { replace: true });
          return;
        }
        const data = await res.json();
        const email = typeof data.email === "string" ? data.email.trim() : "";
        if (!email) {
          navigate("/login", { replace: true });
          return;
        }
        if (mounted) setUser({ ...data, email });

        const isAdmin = Boolean(data?.is_admin);
        if (isAdmin) {
          const adminRes = await fetch("/api/admin/users?limit=500");
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            if (mounted) {
              setAdminSummary(adminData.summary || null);
              setAdminUsers(Array.isArray(adminData.users) ? adminData.users : []);
              setAdminStatus(null);
            }
          } else if (mounted) {
            const body = await adminRes.json().catch(() => ({} as any));
            setAdminSummary(null);
            setAdminUsers([]);
            setDebugLogs([]);
            if (adminRes.status === 401) {
              setAdminStatus("Admin panel unavailable: session not authenticated.");
            } else if (adminRes.status === 403) {
              setAdminStatus("Admin panel unavailable: this account is not authorized (check ADMIN_EMAILS / UNLIMITED_CREDITS_EMAILS).");
            } else {
              const reason = typeof body?.error === "string" ? body.error : `HTTP ${adminRes.status}`;
              setAdminStatus(`Admin panel unavailable: ${reason}`);
            }
          }
        } else if (mounted) {
          setAdminSummary(null);
          setAdminUsers([]);
          setDebugLogs([]);
          setAdminStatus(null);
        }
        const act = await fetch("/api/activity");
        if (act.ok) {
          const actData = await act.json();
          if (mounted) setActivity(actData.activity || []);
        }
      } catch {
        navigate("/login", { replace: true });
      } finally {
        if (mounted) {
          setAdminChecked(true);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!adminSummary) return;
    let mounted = true;
    const loadDebugLogs = async () => {
      setDebugLoading(true);
      setDebugError(null);
      try {
        const params = new URLSearchParams({ action: "debug", limit: "120" });
        if (debugKindFilter !== "all") params.set("kind", debugKindFilter);
        const debugRes = await fetch(`/api/activity?${params.toString()}`);
        if (!mounted) return;
        if (debugRes.ok) {
          const debugData = await debugRes.json();
          setDebugLogs(Array.isArray(debugData.logs) ? debugData.logs : []);
        } else {
          const body = await debugRes.json().catch(() => ({} as any));
          setDebugError(typeof body?.error === "string" ? body.error : `Failed to load debug logs (${debugRes.status})`);
          setDebugLogs([]);
        }
      } catch {
        if (mounted) setDebugError("Failed to load debug logs.");
        if (mounted) setDebugLogs([]);
      } finally {
        if (mounted) setDebugLoading(false);
      }
    };
    void loadDebugLogs();
    return () => {
      mounted = false;
    };
  }, [adminSummary, debugKindFilter]);

  const creditsLabel = useMemo(() => {
    if (!user) return "0";
    const credits = Number(user.remaining_credits ?? user.credits ?? 0);
    return `${credits} credits`;
  }, [user]);

  const openPlanModal = () => {
    setPlanNotice(null);
    setShowPlanModal(true);
  };

  const currentPlanTier: PlanTier = useMemo(() => {
    const raw = String(user?.plan || "free").trim().toLowerCase();
    if (raw === "creator" || raw === "studio" || raw === "free") return raw;
    return "free";
  }, [user?.plan]);

  const handlePlanTierSelect = (tier: PlanTier) => {
    if (tier === currentPlanTier) return;
    if (tier === "free") {
      setPlanNotice("To downgrade, cancel the subscription from your Stripe receipt or contact support.");
      return;
    }
    const targetUrl = PLAN_CONFIG[tier].stripeUrl;
    if (!targetUrl) {
      setPlanNotice("Checkout is not configured yet.");
      return;
    }
    const email = String(user?.email || "").trim();
    if (!email) {
      setPlanNotice("Please sign in to continue.");
      return;
    }
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("prefilled_email", email);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      setPlanNotice("Could not open checkout. Please try again.");
    }
  };

  const filteredAdminUsers = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    return adminUsers.filter((row) => {
      const plan = String(row.plan || "free").trim().toLowerCase();
      const planBucket =
        plan === "free" || plan === "creator" || plan === "studio" ? plan : "other";
      const matchPlan = adminPlanFilter === "all" || planBucket === adminPlanFilter;
      const matchSearch = !q || row.email.toLowerCase().includes(q);
      return matchPlan && matchSearch;
    });
  }, [adminUsers, adminPlanFilter, adminSearch]);

  const exportAdminCsv = () => {
    const headers = ["email", "plan", "remaining_credits", "created_at", "last_login_at"];
    const lines = filteredAdminUsers.map((row) =>
      [
        row.email,
        row.plan,
        String(row.remaining_credits ?? 0),
        row.created_at ? new Date(row.created_at).toISOString() : "",
        row.last_login_at ? new Date(row.last_login_at).toISOString() : "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-plans-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const refreshDebugLogs = async () => {
    if (!adminSummary) return;
    setDebugLoading(true);
    setDebugError(null);
    try {
      const params = new URLSearchParams({ action: "debug", limit: "120" });
      if (debugKindFilter !== "all") params.set("kind", debugKindFilter);
      const debugRes = await fetch(`/api/activity?${params.toString()}`);
      if (debugRes.ok) {
        const debugData = await debugRes.json();
        setDebugLogs(Array.isArray(debugData.logs) ? debugData.logs : []);
      } else {
        const body = await debugRes.json().catch(() => ({} as any));
        setDebugError(typeof body?.error === "string" ? body.error : `Failed to load debug logs (${debugRes.status})`);
        setDebugLogs([]);
      }
    } catch {
      setDebugError("Failed to load debug logs.");
      setDebugLogs([]);
    } finally {
      setDebugLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-xl bg-white border border-gray-200 px-8 py-6"
        >
          <p className="text-sm text-gray-600">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-md shadow-indigo-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-indigo-600">Manage plan</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">Choose what fits your launch</h3>
              </div>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setPlanNotice(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.keys(PLAN_CONFIG) as PlanTier[]).map((tier) => {
                const config = PLAN_CONFIG[tier];
                const isCurrent = currentPlanTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => handlePlanTierSelect(tier)}
                    disabled={isCurrent}
                    className={`rounded-xl border p-4 text-left transition ${isCurrent
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105 duration-500"
                      : "border-gray-200 bg-gray-100 text-gray-600 hover:border-indigo-600 hover:text-gray-900"
                      }`}
                  >
                    <p className="text-lg font-semibold flex items-center justify-between">
                      <span>{config.label}</span>
                      <span className="text-sm font-medium">{config.priceLabel}</span>
                    </p>
                    <p className={`text-sm mt-2 ${isCurrent ? "text-white/90" : "text-gray-600"}`}>
                      {config.description}
                    </p>
                    <p className="text-xs mt-2">
                      {isCurrent ? "Current plan" : "Go to checkout"}
                    </p>
                  </button>
                );
              })}
            </div>
            {planNotice && <p className="text-xs text-gray-500">{planNotice}</p>}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 rounded-xl bg-white border border-gray-200 px-6 py-5"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Dashboard</p>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-indigo-600 hover:bg-indigo-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credits */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-indigo-600 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Credits Available
                </p>
                <h2 className="text-4xl font-bold">{creditsLabel}</h2>
                <p className="text-sm text-gray-600">Plan: {user.plan || "free"}</p>
                {user.inviteUsed && (
                  <p className="text-xs text-indigo-600 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Welcome gift applied
                  </p>
                )}
              </div>
              <button
                onClick={openPlanModal}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold transition hover:bg-indigo-700"
              >
                Upgrade Plan <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/app/generator"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${Number(user.remaining_credits ?? user.credits ?? 0) > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <Wand2 className="h-4 w-4" /> Generate an Image
              </a>
              {Number(user.remaining_credits ?? user.credits ?? 0) <= 0 && (
                <span className="text-xs text-gray-500">You have no credits left. Upgrade your plan to continue.</span>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="rounded-xl bg-white border border-gray-200 p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Quick Actions
            </div>
            <div className="space-y-3">
              {[
                { label: "Create UGC Image", href: "/app/generator", icon: <ImageIcon className="h-4 w-4" /> },
                { label: "Product Upload", href: "/app/generator?mode=upload", icon: <UploadCloud className="h-4 w-4" /> },
                { label: "Hero Mode Generator", href: "/app/generator?hero=true", icon: <Shield className="h-4 w-4" /> },
                { label: "Upgrade Plan", href: "#upgrade", icon: <ArrowUpRight className="h-4 w-4" />, action: openPlanModal },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => (item.action ? item.action() : (window.location.href = item.href))}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition cursor-pointer hover:border-indigo-600 hover:bg-indigo-50"
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="rounded-xl bg-white border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-indigo-600">Recent Activity</p>
              <h3 className="text-lg font-semibold">Latest events</h3>
            </div>
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-600">No activity yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-auto pr-1 custom-scrollbar">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-600 transition"
                >
                  <div className="flex items-center gap-3">
                    {activityIcon(item.type)}
                    <div>
                      <p className="text-sm font-medium capitalize">{activityTitle(item)}</p>
                      {item.type === "image" && item.meta?.kind === "generation" && (
                        <p className="text-[11px] text-gray-500">
                          {String(item.meta?.sceneType || "scene")} · {String(item.meta?.mode || "mode")} · {String(item.meta?.aspectRatio || "ratio")}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">{formatTimeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {item.type === "invite" && (() => {
                      const bonus = Number(item.meta?.bonus ?? 10);
                      const safeBonus = Number.isFinite(bonus) && bonus > 0 ? Math.floor(bonus) : 10;
                      return `+${safeBonus} credits`;
                    })()}
                    {item.type === "image" && item.meta?.kind !== "generation" && (item.meta?.delta ?? -1)}
                    {item.type === "image" && item.meta?.kind === "generation" && (
                      String(item.meta?.status || "").toLowerCase() === "error" ? "error" : "ok"
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {adminSummary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
            className="rounded-xl bg-white border border-gray-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-600">Admin / Plans</p>
                <h3 className="text-lg font-semibold">Users by plan</h3>
              </div>
              <span className="text-xs text-gray-500">{adminSummary.total} users</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={adminPlanFilter}
                onChange={(e) => setAdminPlanFilter(e.target.value as any)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="all">All plans</option>
                <option value="free">Free</option>
                <option value="creator">Creator</option>
                <option value="studio">Studio</option>
                <option value="other">Other</option>
              </select>
              <input
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search email"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 min-w-[220px]"
              />
              <button
                type="button"
                onClick={exportAdminCsv}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-700"
              >
                Export CSV
              </button>
              <span className="text-xs text-gray-500">{filteredAdminUsers.length} filtered</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Free", value: adminSummary.free },
                { label: "Creator", value: adminSummary.creator },
                { label: "Studio", value: adminSummary.studio },
                { label: "Other", value: adminSummary.other },
                { label: "Total", value: adminSummary.total },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Plan</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Credits</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Created</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminUsers.slice(0, 500).map((row) => (
                    <tr key={row.email} className="border-t border-gray-200">
                      <td className="px-3 py-2 text-gray-900">{row.email}</td>
                      <td className="px-3 py-2 text-gray-700">{row.plan}</td>
                      <td className="px-3 py-2 text-gray-700">{row.remaining_credits}</td>
                      <td className="px-3 py-2 text-gray-700">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {row.last_login_at ? new Date(row.last_login_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {user?.is_admin && !adminSummary && adminChecked && adminStatus && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {adminStatus}
          </motion.div>
        )}

        {adminSummary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.14 }}
            className="rounded-xl bg-white border border-gray-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-600">Admin / Debug</p>
                <h3 className="text-lg font-semibold">Debug logs (last 24h)</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={debugKindFilter}
                  onChange={(e) => setDebugKindFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <option value="all">All kinds</option>
                  <option value="generate.success">generate.success</option>
                  <option value="generate.error">generate.error</option>
                  <option value="generate.reject.missing_parts">reject.missing_parts</option>
                  <option value="generate.reject.missing_api_key">reject.missing_api_key</option>
                  <option value="generate.reject.no_credits">reject.no_credits</option>
                </select>
                <button
                  type="button"
                  onClick={refreshDebugLogs}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-700"
                >
                  {debugLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="overflow-auto rounded-xl border border-gray-200">
              {debugError && (
                <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {debugError}
                </div>
              )}
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Time</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Kind</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Prompt Hash</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {debugLogs.length === 0 ? (
                    <tr className="border-t border-gray-200">
                      <td className="px-3 py-3 text-gray-500" colSpan={5}>
                        {debugLoading ? "Loading debug logs..." : "No debug logs yet."}
                      </td>
                    </tr>
                  ) : (
                    debugLogs.map((row) => (
                      <tr key={row.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-gray-700">
                          {row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-900 font-medium">{row.kind}</td>
                        <td className="px-3 py-2 text-gray-700">{row.email || "-"}</td>
                        <td className="px-3 py-2 text-gray-700 font-mono text-xs">
                          {String(row.data?.promptHash || "-")}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {String(
                            row.data?.error ||
                            row.data?.sceneType ||
                            row.data?.mode ||
                            row.data?.aspectRatio ||
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* My Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="rounded-xl bg-white border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-indigo-600">My Gallery</p>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Your Generated Images</h3>
                <button
                  type="button"
                  aria-label="Gallery retention help"
                  title={`Your generated images.\nAvailable for 30 days.`}
                  className="inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ImageIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <GallerySection userEmail={user.email} />
        </motion.div>
      </div>
    </div>
  );
}

// Gallery Section Component
function GallerySection({ userEmail }: { userEmail: string }) {
  const [images, setImages] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadGallery = async () => {
      try {
        const { listPublicGallery } = await import('../services/galleryService');
        const allImages = await listPublicGallery();

        const currentUserEmail = String(userEmail || '').trim().toLowerCase();
        const userId = currentUserEmail;

        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const userImages: GalleryEntry[] = allImages
          .filter(img => {
          const createdDate =
            img.createdAt?.toDate?.() ||
            (typeof (img.createdAt as any)?.seconds === 'number' ? new Date((img.createdAt as any).seconds * 1000) : null) ||
            (typeof (img.createdAt as any) === 'number' ? new Date(img.createdAt as any) : null) ||
            null;
          const createdAtMs = createdDate ? createdDate.getTime() : 0;
          const isMine =
            String(img.userId || '').trim().toLowerCase() === userId ||
            (String(img.userId || '').trim().toLowerCase() === 'guest' && userId === currentUserEmail);
          return isMine && createdAtMs >= thirtyDaysAgo;
          })
          .map(img => ({ ...img, source: "cloud" as const }));

        const LOCAL_GALLERY_CACHE_KEY = 'ugc-free-gallery';
        let localImages: GalleryEntry[] = [];
        try {
          const stored = window.localStorage.getItem(LOCAL_GALLERY_CACHE_KEY);
          const parsed = stored ? JSON.parse(stored) : [];
          if (Array.isArray(parsed)) {
            localImages = parsed
              .filter(item => item && typeof item.imageUrl === 'string')
              .map(item => ({
                id: String(item.id || `local-${Math.random().toString(36).slice(2)}`),
                imageUrl: String(item.imageUrl),
                userId: String(item.userId || '').trim().toLowerCase(),
                plan: String(item.plan || 'free'),
                createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
                width: item.width,
                height: item.height,
                modelReferenceUsed: item.modelReferenceUsed,
                productsUsed: item.productsUsed,
                source: "localStorage" as const,
              }))
              .filter(img => img.userId === userId)
              .filter(img => {
                const createdAtMs =
                  typeof img.createdAt === 'number'
                    ? img.createdAt
                    : (typeof (img.createdAt as any)?.seconds === 'number' ? (img.createdAt as any).seconds * 1000 : 0);
                return createdAtMs >= thirtyDaysAgo;
              });
          }
        } catch (err) {
          console.warn('Unable to load local gallery cache', err);
        }

        let indexedDbImages: GalleryEntry[] = [];
        try {
          const indexed = await listLocalGalleryEntries(userId, 30);
          indexedDbImages = indexed.map(entry => ({
            id: entry.id,
            imageUrl: entry.imageUrl,
            userId: entry.userId,
            plan: entry.plan || 'free',
            createdAt: entry.createdAt,
            width: entry.width,
            height: entry.height,
            modelReferenceUsed: undefined,
            productsUsed: undefined,
            source: "indexedDb" as const,
          }));
        } catch (err) {
          console.warn('Unable to load IndexedDB gallery cache', err);
        }

        const merged = [...userImages, ...localImages, ...indexedDbImages];
        const seen = new Set<string>();
        const deduped = merged.filter(img => {
          const key = String(img.imageUrl || '');
          if (!key) return false;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const sorted = [...deduped].sort((a, b) => {
          const aDate =
            a.createdAt?.toDate?.() ||
            (typeof (a.createdAt as any)?.seconds === 'number' ? new Date((a.createdAt as any).seconds * 1000) : null) ||
            (typeof (a.createdAt as any) === 'number' ? new Date(a.createdAt as any) : null) ||
            new Date(0);
          const bDate =
            b.createdAt?.toDate?.() ||
            (typeof (b.createdAt as any)?.seconds === 'number' ? new Date((b.createdAt as any).seconds * 1000) : null) ||
            (typeof (b.createdAt as any) === 'number' ? new Date(b.createdAt as any) : null) ||
            new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

        if (mounted) {
          setImages(sorted);
        }
      } catch (err: any) {
        console.error('Failed to load user gallery:', err);
        if (mounted) {
          setError(err.message || 'Failed to load gallery');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadGallery();
    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const handleDownload = async (imageUrl: string, imageName?: string) => {
    try {
      const { downloadImage } = await import('../services/galleryService');
      await downloadImage(imageUrl, imageName);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image.');
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    const ok = window.confirm('Delete this image from your gallery?');
    if (!ok) return;

    const busy = `${(image as any)?.source ?? "unknown"}:${String(image.id || "")}`;
    setBusyKey(busy);
    try {
      const entry = image as GalleryEntry;
      const safeUserId = String(userEmail || "").trim().toLowerCase();
      if (entry.source !== "cloud") {
        try {
          await deleteLocalGalleryEntry(entry.id);
        } catch (err) {
          console.warn('Local gallery delete warning', err);
        }
        try {
          await deleteLocalGalleryEntriesByImageUrl(safeUserId, entry.imageUrl);
        } catch (err) {
          console.warn('Local gallery url delete warning', err);
        }
        try {
          const LOCAL_GALLERY_CACHE_KEY = 'ugc-free-gallery';
          const stored = window.localStorage.getItem(LOCAL_GALLERY_CACHE_KEY);
          const parsed = stored ? JSON.parse(stored) : [];
          if (Array.isArray(parsed)) {
            const next = parsed.filter((item: any) => String(item?.imageUrl || '') !== String(image.imageUrl || ''));
            window.localStorage.setItem(LOCAL_GALLERY_CACHE_KEY, JSON.stringify(next));
          }
        } catch (err) {
          console.warn('LocalStorage gallery delete warning', err);
        }
      } else {
        const { deleteFromGallery } = await import('../services/galleryService');
        try {
          await deleteFromGallery(entry.id);
        } catch (err: any) {
          const message = String(err?.message || "");
          // Treat already-deleted entries as success and proceed with local cleanup.
          if (!message.includes("Not found")) throw err;
        }

        // Also remove any local cache copies of the same image URL.
        try {
          await deleteLocalGalleryEntriesByImageUrl(safeUserId, entry.imageUrl);
        } catch (err) {
          console.warn('Local gallery url delete warning', err);
        }
        try {
          const LOCAL_GALLERY_CACHE_KEY = 'ugc-free-gallery';
          const stored = window.localStorage.getItem(LOCAL_GALLERY_CACHE_KEY);
          const parsed = stored ? JSON.parse(stored) : [];
          if (Array.isArray(parsed)) {
            const next = parsed.filter((item: any) => String(item?.imageUrl || '') !== String(entry.imageUrl || ''));
            window.localStorage.setItem(LOCAL_GALLERY_CACHE_KEY, JSON.stringify(next));
          }
        } catch (err) {
          console.warn('LocalStorage gallery delete warning', err);
        }
      }

      const urlKey = String(image.imageUrl || '');
      setImages(prev =>
        prev.filter(i => String(i.imageUrl || '') !== urlKey && String(i.id || '') !== String(image.id || ''))
      );
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.message || 'Failed to delete image.');
    } finally {
      setBusyKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600">Loading your gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <ImageIcon className="h-12 w-12 text-gray-500" />
        <p className="text-sm text-gray-600">No images generated yet</p>
        <a
          href="/app/generator"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold transition hover:bg-indigo-700"
        >
          <Wand2 className="h-4 w-4" />
          Generate Your First Image
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => {
        const createdDate =
          image.createdAt?.toDate?.() ||
          (typeof (image.createdAt as any)?.seconds === 'number' ? new Date((image.createdAt as any).seconds * 1000) : null) ||
          (typeof (image.createdAt as any) === 'number' ? new Date(image.createdAt as any) : null) ||
          new Date();
        const dateStr = createdDate.toLocaleDateString();

        return (
          <div
            key={`${image.source}:${image.id}`}
            className="rounded-xl overflow-hidden border border-gray-200 bg-white transition hover:border-indigo-600"
          >
            <img
              src={image.imageUrl}
              alt={`Generated on ${dateStr}`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4 space-y-2">
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">Created: {dateStr}</p>
                <p className="text-gray-600">Plan: {image.plan || 'free'}</p>
                {image.width && image.height ? (
                  <p className="text-gray-600">Size: {image.width}×{image.height}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(image.imageUrl, `ugc-image-${image.id}.png`)}
                  disabled={busyKey === `${image.source}:${image.id}`}
                  className="flex-1 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(image)}
                  disabled={busyKey === `${image.source}:${image.id}`}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600 disabled:opacity-50"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
