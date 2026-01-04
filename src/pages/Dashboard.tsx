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
import axios from "axios";

type ActivityItem = {
  id: string;
  email: string;
  type: "login" | "image" | "invite" | "upgrade" | "logout";
  timestamp: number;
  meta?: Record<string, any>;
};

type UserInfo = {
  email: string;
  credits: number;
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
  const priceCreator = import.meta.env.VITE_STRIPE_PRICE_CREATOR as string | undefined;
  const priceStudio = import.meta.env.VITE_STRIPE_PRICE_STUDIO as string | undefined;

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
        if (mounted) setUser(data);
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
    return `${user.credits} credits`;
  }, [user]);

  const startCheckout = async (plan: "creator" | "studio") => {
    try {
      const priceId = plan === "creator" ? priceCreator : priceStudio;
      if (!priceId) {
        alert("Pricing configuration missing. Please set price IDs.");
        return;
      }
      const res = await axios.post("/api/stripe/create-checkout-session", {
        userId: user?.email,
        priceId,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert("Unable to start checkout.");
      }
    } catch (err) {
      console.error("checkout error", err);
      alert("Unable to start checkout.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl bg-white border border-gray-200 px-8 py-6 shadow-md shadow-md shadow-indigo-500/20"
        >
          <p className="text-sm text-gray-600">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-gray-200 px-6 py-5 shadow-md shadow-md shadow-indigo-500/20"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Dashboard</p>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-whiteTint px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-whiteTint"
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
            className="lg:col-span-2 rounded-3xl bg-whiteTint border border-gray-200 p-6 shadow-md shadow-md shadow-indigo-500/20"
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
                    <Sparkles className="h-4 w-4" /> Welcome gift applied (+20 credits)
                  </p>
                )}
              </div>
              <button
                onClick={() => startCheckout("creator")}
                className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-semibold shadow-md shadow-md shadow-indigo-500/20 transition"
              >
                Upgrade Plan <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/app/generator"
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${user.credits > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-600"
                  : "bg-whiteTint text-gray-600 cursor-not-allowed"
                  }`}
              >
                <Wand2 className="h-4 w-4" /> Generate an Image
              </a>
              {user.credits <= 0 && (
                <span className="text-xs text-gray-500">You have no credits left. Upgrade your plan to continue.</span>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="rounded-3xl bg-whiteTint border border-gray-200 p-5 shadow-md shadow-md shadow-indigo-500/20 space-y-4"
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
                { label: "Upgrade Plan", href: "#upgrade", icon: <ArrowUpRight className="h-4 w-4" />, action: () => startCheckout("creator") },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => (item.action ? item.action() : (window.location.href = item.href))}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-whiteTint px-4 py-3 text-sm text-gray-900 hover:border-indigo-600/50 hover:bg-indigo-600 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-gray-600" />
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
          className="rounded-3xl bg-whiteTint border border-gray-200 p-6 shadow-md shadow-md shadow-indigo-500/20"
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
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-whiteTint px-4 py-3 hover:border-indigo-600 transition"
                >
                  <div className="flex items-center gap-3">
                    {activityIcon(item.type)}
                    <div>
                      <p className="text-sm font-medium capitalize">{item.type}</p>
                      <p className="text-xs text-gray-600">{formatTimeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {item.type === "invite" && "+20 credits"}
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
          className="rounded-3xl bg-whiteTint border border-gray-200 p-6 shadow-md shadow-md shadow-indigo-500/20"
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
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadGallery = async () => {
      try {
        const { listPublicGallery } = await import('../services/galleryService');
        const allImages = await listPublicGallery();

        const currentUserEmail = userEmail;
        const userId = userEmail;

        const userImages = allImages.filter(img =>
          img.userId === userId ||
          (img.userId === 'guest' && userId === currentUserEmail)
        );

        if (mounted) {
          setImages(userImages);
          console.log(`📸 Mostrando ${userImages.length} imágenes en el dashboard`);
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
      downloadImage(imageUrl, imageName);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image. Opening in new tab...');
      window.open(imageUrl, '_blank');
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
      <div className="rounded-2xl border border-gray-200 bg-whiteTint p-4">
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
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
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
        const createdDate = image.createdAt?.toDate?.() || new Date(image.createdAt?.seconds * 1000 || Date.now());
        const dateStr = createdDate.toLocaleDateString();

        return (
          <div
            key={image.id}
            className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-whiteTint transition hover:border-indigo-600/50"
          >
            <img
              src={image.imageUrl}
              alt={`Generated on ${dateStr}`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-whiteTint opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4 space-y-2">
              <div className="text-xs text-gray-600 space-y-1">
                <p>Plan: {image.plan || 'free'}</p>
                {image.width && image.height && (
                  <p>Size: {image.width}×{image.height}</p>
                )}
                <p>Created: {dateStr}</p>
              </div>
              <button
                onClick={() => handleDownload(image.imageUrl, `ugc-image-${image.id}.png`)}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
              >
                Download
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
