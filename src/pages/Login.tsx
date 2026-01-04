import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { sendMagicLink, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      await sendMagicLink(email, invitationCode);
      setStatus("success");
      setMessage("You will receive your login link shortly.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to send magic link.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-textPrimary flex items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-bg text-textPrimary flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl bg-surface border border-borderSubtle shadow-md shadow-accent-glow p-10 space-y-4 text-center">
          <h1 className="text-2xl font-semibold">You’re already signed in</h1>
          <p className="text-textSecondary">Continue to your workspace.</p>
          <a
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 text-lg font-semibold shadow-md shadow-accent-glow hover:bg-accent transition"
          >
            Go to App
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-textPrimary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg rounded-3xl bg-surface border border-borderSubtle shadow-md shadow-accent-glow p-10 space-y-6"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">BoostUGC</p>
          <h1 className="text-3xl font-bold">Access your workspace</h1>
          <p className="text-sm text-textSecondary">Secure magic link sign-in. No passwords.</p>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <label className="block text-sm text-textSecondary">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-borderSubtle bg-surface px-4 py-3 text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              placeholder="you@company.com"
            />
            <Mail className="absolute right-3 top-3 h-5 w-5 text-textMuted" />
          </div>
          <label className="block text-sm text-textSecondary">
            Invitation Code
            <div className="text-xs text-textMuted mt-1">Optional — unlock 20 credits</div>
          </label>
          <div className="relative">
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full rounded-2xl border border-borderSubtle bg-surface px-4 py-3 text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              placeholder="Enter your code"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-accent py-3 text-lg font-semibold shadow-md shadow-accent-glow hover:bg-accent transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Magic Link"}
          </button>
        </form>
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-3 rounded-2xl border border-borderSubtle bg-surfaceTint px-4 py-3 text-textSecondary"
            >
              {status === "success" ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <Loader2 className="h-5 w-5" />}
              <span className="text-sm">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-center text-textMuted">You will receive your login link shortly.</p>
      </motion.div>
    </div>
  );
}
