import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      await sendMagicLink(email);
      setStatus("success");
      setMessage("You will receive your login link shortly.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to send magic link.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-lg p-10 space-y-6"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">BoostUGC</p>
          <h1 className="text-3xl font-bold">Access your workspace</h1>
          <p className="text-sm text-gray-400">Secure magic link sign-in. No passwords.</p>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <label className="block text-sm text-gray-300">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="you@company.com"
            />
            <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-500" />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-lg font-semibold shadow-lg hover:from-indigo-400 hover:to-purple-400 transition flex items-center justify-center gap-2 disabled:opacity-60"
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
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                status === "success"
                  ? "bg-green-500/10 border border-green-400/30 text-green-100"
                  : "bg-rose-500/10 border border-rose-400/30 text-rose-100"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Loader2 className="h-5 w-5" />
              )}
              <span className="text-sm">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-center text-gray-500">You will receive your login link shortly.</p>
      </motion.div>
    </div>
  );
}
