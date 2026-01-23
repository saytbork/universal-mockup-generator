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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { GalleryImage } from "../services/galleryService";
import { PLAN_CONFIG, type PlanTier } from "../constants/planConfig";
import { deleteLocalGalleryEntry, listLocalGalleryEntries } from "../services/localGallery";

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
  plan: string;
  inviteUsed?: boolean;
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

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
        const act = await fetch("/api/activity/list");
        if (act.ok) {
          const actData = await act.json();
          if (mounted) setActivity(actData.activity || []);
        }
      } catch {
        navigate("/login", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const creditsLabel = useMemo(() => {
    if (!user) return "0";
    const credits = Number(user.credits ?? 0);
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
                <p className="text-sm text-gray-600">
                  Plan: {user.plan || "free"} {user.plan === "free" ? "– 2 credits included" : ""}
                </p>
                {user.inviteUsed && (
                  <p className="text-xs text-indigo-600 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Welcome gift applied (+10 credits)
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
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${Number(user.credits ?? 0) > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <Wand2 className="h-4 w-4" /> Generate an Image
              </a>
              {Number(user.credits ?? 0) <= 0 && (
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
                      <p className="text-sm font-medium capitalize">{item.type}</p>
                      <p className="text-xs text-gray-600">{formatTimeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {item.type === "invite" && "+10 credits"}
                    {item.type === "image" && (item.meta?.delta ?? -1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

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
              <h3 className="text-lg font-semibold">Your Generated Images</h3>
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
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadGallery = async () => {
      try {
        const { listPublicGallery } = await import('../services/galleryService');
        const allImages = await listPublicGallery();

        const currentUserEmail = String(userEmail || '').trim().toLowerCase();
        const userId = currentUserEmail;

        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const userImages = allImages.filter(img => {
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
        });

        const LOCAL_GALLERY_CACHE_KEY = 'ugc-free-gallery';
        let localImages: GalleryImage[] = [];
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

        let indexedDbImages: GalleryImage[] = [];
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

    setBusyId(image.id);
    try {
      const isLocal = String(image.id || '').startsWith('local-') || String(image.imageUrl || '').toLowerCase().startsWith('data:');
      if (isLocal) {
        try {
          await deleteLocalGalleryEntry(image.id);
        } catch (err) {
          console.warn('Local gallery delete warning', err);
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
        await deleteFromGallery(image.id);
      }

      const urlKey = String(image.imageUrl || '');
      setImages(prev =>
        prev.filter(i => String(i.imageUrl || '') !== urlKey && String(i.id || '') !== String(image.id || ''))
      );
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.message || 'Failed to delete image.');
    } finally {
      setBusyId(null);
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
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[11px] text-amber-800 font-medium">
          Images are available for 30 days. Download anything you want to keep.
        </p>
      </div>
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
            key={image.id}
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
                  disabled={busyId === image.id}
                  className="flex-1 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(image)}
                  disabled={busyId === image.id}
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
    </div>
  );
}
