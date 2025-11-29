import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { email, loading } = useSession(true);
  const { logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl bg-white/5 border border-white/10 px-8 py-6 shadow-2xl backdrop-blur-lg"
        >
          <p className="text-sm text-gray-300">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-4 shadow-xl backdrop-blur-lg"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Dashboard</p>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="rounded-3xl bg-white/5 border border-white/10 p-8 shadow-xl backdrop-blur-lg"
        >
          <h2 className="text-lg font-semibold mb-2">Your workspace</h2>
          <p className="text-sm text-gray-400">
            You are authenticated via magic link. Use the app experience from the main navigation.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
