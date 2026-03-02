import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isAuthBypassEnabled } from "../lib/auth/authBypass";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { sendMagicLink, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const normalizedEmail = email.trim();
  const normalizedCode = invitationCode.trim();

  useEffect(() => {
    if (isAuthBypassEnabled()) {
      window.location.replace("/app");
    }
  }, []);

  const requestMagicLink = async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const result = await sendMagicLink(email, invitationCode);
      if (result?.autoLoggedIn) {
        window.location.href = result.redirect || "/app";
        return;
      }
      setStatus("success");
      setMessage("You will receive your login link shortly.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to send magic link.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestMagicLink();
  };

  const handleRedeem = async () => {
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    if (!normalizedCode) {
      setStatus("error");
      setMessage("Enter a code.");
      return;
    }
    await requestMagicLink();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-white border border-gray-200  p-10 space-y-4 text-center">
          <h1 className="text-2xl font-semibold">You’re already signed in</h1>
          <p className="text-gray-600">Continue to your workspace.</p>
          <a
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-6 py-3 text-lg font-semibold  hover:bg-indigo-600 text-white transition"
          >
            Go to App
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg rounded-xl bg-white border border-gray-200  p-10 space-y-6"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-600">Perfect Mockup</p>
          <h1 className="text-3xl font-bold">Access your workspace</h1>
          <p className="text-sm text-gray-600">Secure magic link sign-in. No passwords.</p>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <label className="block text-sm text-gray-600">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="you@company.com"
            />
            <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-500" />
          </div>
          <label className="block text-sm text-gray-600">
            Invitation Code
          </label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your code"
              />
              <button
                type="button"
                onClick={handleRedeem}
                disabled={status === "loading"}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Redeem
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-indigo-600 text-white py-3 text-lg font-semibold  hover:bg-indigo-600 text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
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
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-whiteTint px-4 py-3 text-gray-600"
            >
              {status === "success" ? <CheckCircle2 className="h-5 w-5 text-indigo-600" /> : <Loader2 className="h-5 w-5" />}
              <span className="text-sm">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-center text-gray-500">You will receive your login link shortly.</p>
      </motion.div>
    </div>
  );
}
