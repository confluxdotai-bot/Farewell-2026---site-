import { useState, FormEvent } from "react";
import { ShieldAlert, Key, ArrowRight, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface OrganizerGateProps {
  onUnlock: () => void;
}

export default function OrganizerGate({ onUnlock }: OrganizerGateProps) {
  const [passcode, setPasscode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const normalized = passcode.trim().toUpperCase();
    // Valid organizer passcodes: CSE2026 or SAYONARA2026
    if (normalized === "CSE2026" || normalized === "SAYONARA2026" || normalized === "GIMT2026") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Persist session authentication
        sessionStorage.setItem("gimt_cse_organizer_unlocked", "true");
        onUnlock();
      }, 800);
    } else {
      setError("Incorrect passcode. Please check your credentials and try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md bg-white rounded-2xl border-2 border-amber-700/30 shadow-xl overflow-hidden relative p-6 md:p-8 text-center"
    >
      {/* Small lock emblem banner */}
      <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 mb-4 border border-amber-200/50 relative">
        <Lock size={26} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>

      <h3 className="font-serif italic font-extrabold text-xl text-slate-900">
        Organizer Access Required
      </h3>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        This restricted area hosts full RSVPs, senior profile photo files, mobile phone diaries, and the registration manifest spreadsheet.
      </p>

      {/* Warning message explaining standard visitor restrictions */}
      <div className="bg-red-50/50 border border-red-200/40 rounded-xl p-3 my-4 flex items-start gap-2.5 text-left text-[11px] text-red-900">
        <ShieldAlert size={16} className="text-red-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wide">Privacy Notice</span>
          <p className="mt-0.5 font-medium text-red-800">
            Student details and personal phone records are locked to comply with CSE event security regulations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Enter Organizer Passcode"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError("");
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-700 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-amber-700 text-slate-800 font-mono text-center tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <p className="text-[10px] font-semibold text-red-600 text-left font-sans">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            "Verifying Key Credentials..."
          ) : (
            <>
              Unlock Memory Wall
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
