import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Heart, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  User, 
  ChevronRight, 
  AlertCircle 
} from "lucide-react";
import { Registration } from "./types";
import RegistrationForm from "./components/RegistrationForm";
import InvitationCard from "./components/InvitationCard";
import MemoryWall from "./components/MemoryWall";
import OrganizerGate from "./components/OrganizerGate";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"register" | "wall">("register");
  
  // Registration and state caching
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [latestRegistration, setLatestRegistration] = useState<Registration | null>(null);
  const [selectedRegForCard, setSelectedRegForCard] = useState<Registration | null>(null);
  const [sysStatus, setSysStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isOrganizerUnlocked, setIsOrganizerUnlocked] = useState(false);

  // Read session persistent credential on launch
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem("gimt_cse_organizer_unlocked") === "true";
    if (isUnlocked) {
      setIsOrganizerUnlocked(true);
    }
  }, []);

  // Fetch all registrations from the full-stack server
  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setRegistrations(data);
        // Cache locally for faster offline load speeds
        localStorage.setItem("gimt_cse_farewell_manifest", JSON.stringify(data));
        setSysStatus("ready");
        return;
      }
      throw new Error("Local full-stack Express server not reachable, fallback to client-side database.");
    } catch (err) {
      console.warn("Could not retrieve master registrations list from network. Loading from local cache.", err);
      // Fallback load from localStorage check
      const cached = localStorage.getItem("gimt_cse_farewell_manifest");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegistrations(parsed);
            setSysStatus("ready");
            return;
          }
        } catch (e) {
          console.error("Localstorage cache parsing failed", e);
        }
      }
      
      setRegistrations([]);
    } finally {
      setSysStatus("ready");
    }
  };

  // Real-time Firestore sync
  useEffect(() => {
    if (db) {
      setSysStatus("loading");
      try {
        const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Registration[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Registration);
          });
          setRegistrations(list);
          setSysStatus("ready");
          localStorage.setItem("gimt_cse_farewell_manifest", JSON.stringify(list));
        }, (error) => {
          console.error("Firestore real-time snapshot error. Falling back to API polling...", error);
          fetchRegistrations();
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn("Could not start real-time Firestore sync. Falling back to API polling...", err);
        fetchRegistrations();
      }
    } else {
      fetchRegistrations();
    }
  }, []);

  // Handle successful form submit registration
  const handleRegistrationSuccess = async (newReg: Registration) => {
    setLatestRegistration(newReg);
    setRegistrations((prev) => {
      if (prev.some((r) => r.id === newReg.id)) return prev;
      return [newReg, ...prev];
    });
    
    // Automatically trigger visual display card right away
    setSelectedRegForCard(newReg);
    
    // Save state cache
    const updated = [newReg, ...registrations.filter((r) => r.id !== newReg.id)];
    localStorage.setItem("gimt_cse_farewell_manifest", JSON.stringify(updated));

    // Direct Firestore sync safeguard on the client side
    if (db) {
      try {
        await setDoc(doc(db, "registrations", newReg.id), newReg);
        console.log("Direct client-side Firestore sync: successfully saved registration!");
      } catch (e) {
        console.error("Direct client-side Firestore sync failed:", e);
      }
    }
  };

  // Delete registration (Organizer action)
  const handleDeleteRegistration = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to permanently delete this registration? This action cannot be undone.");
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Remove locally from state
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        // Remove from local storage cache
        const cached = localStorage.getItem("gimt_cse_farewell_manifest");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((r: any) => r.id !== id);
              localStorage.setItem("gimt_cse_farewell_manifest", JSON.stringify(updated));
            }
          } catch (e) {
            console.error("Failed to update cache on delete", e);
          }
        }
      } else {
        throw new Error("API responded with an error");
      }
    } catch (err) {
      console.warn("Delete request failed on backend. Removing from local state and cache directly.", err);
      // Direct client fallback
      if (db) {
        try {
          await deleteDoc(doc(db, "registrations", id));
        } catch (e) {
          console.error("Failed direct Firestore delete", e);
        }
      }
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      const cached = localStorage.getItem("gimt_cse_farewell_manifest");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter((r: any) => r.id !== id);
            localStorage.setItem("gimt_cse_farewell_manifest", JSON.stringify(updated));
          }
        } catch (e) {
          console.error("Failed to update cache during offline delete", e);
        }
      }
    }
  };

  // Back to registry controller button
  const handleResetCardForm = () => {
    setLatestRegistration(null);
    setSelectedRegForCard(null);
    setActiveTab("wall"); // Automatically show senior on memory wall after completion
    if (!db) {
      fetchRegistrations();
    }
  };

  return (
    <div id="farewell-portal-root" className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between selection:bg-gold-200">
      
      {/* Formal Top Navigation Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gold-250/20 sticky top-0 z-50 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-800 border border-amber-200/50">
              <GraduationCap size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-widest leading-none">
                GIMT WEST BENGAL
              </span>
              <h1 className="font-serif text-sm md:text-base font-bold text-slate-800 tracking-tight">
                CSE Department Farewell 2026
              </h1>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-amber-50/50 px-3 py-1 border border-gold-200/40 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-[10px] uppercase font-mono tracking-wider">
              {registrations.length} Seniors Registered
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full flex flex-col items-center">
        
        {/* Ceremonial Hero Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center mb-8 relative max-w-4xl"
        >
          {/* Subtle floral crown logo or elegant icon */}
          <div className="mx-auto w-12 h-12 flex items-center justify-center text-amber-600 mb-3 bg-amber-500/10 rounded-full border border-amber-200">
            <BookOpen size={24} />
          </div>
          
          <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Sayonara 2026
          </h2>
          <p className="font-serif italic text-amber-800 text-sm md:text-base mt-1.5">
            &ldquo;Code, Compile, and Carry Forward Infinite Loops of Memories&rdquo;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-2xs">
              <MapPin size={13} className="text-amber-700" />
              Global Institute of Management and Technology
            </span>
            <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-2xs">
              <Calendar size={13} className="text-amber-700" />
              Department of CSE (Comp Science Dept)
            </span>
          </div>

          <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Tab bookmark buttons (Registration vs Memory Wall) */}
        {!selectedRegForCard && (
          <div className="flex items-center justify-center gap-2 mb-8 bg-gold-50/75 border border-gold-200/50 p-1.5 rounded-xl w-full max-w-md shadow-inner">
            <button
              onClick={() => {
                setActiveTab("register");
                setSelectedRegForCard(null);
              }}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "register"
                  ? "bg-amber-700 text-white shadow-md font-semibold scale-102"
                  : "text-slate-600 hover:text-amber-900 hover:bg-gold-100/50"
              }`}
            >
              <Sparkles size={14} />
              Senior RSVP Card Form
            </button>
            <button
              onClick={() => {
                setActiveTab("wall");
                setSelectedRegForCard(null);
              }}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "wall"
                  ? "bg-amber-700 text-white shadow-md font-semibold scale-102"
                  : "text-slate-600 hover:text-amber-900 hover:bg-gold-100/50"
              }`}
            >
              <Heart size={14} />
              Seniors memory wall
            </button>
          </div>
        )}

        {/* Dynamic Panel rendering blocks (Form, Memory Wall, Card Viewer) */}
        <div className="w-full flex justify-center">
          {selectedRegForCard ? (
            /* Majestic Souvenir Card View screen */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="w-full max-w-2xl px-1 flex items-center justify-between">
                <button
                  onClick={handleResetCardForm}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <ArrowLeft size={13} />
                  Back to Memory Wall
                </button>

                {latestRegistration?.id === selectedRegForCard.id && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono py-1 px-3 rounded-full flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Registration Compiled Successfully!
                  </span>
                )}
              </div>

              {/* Elegant formal Invitation card with print layout */}
              <InvitationCard registration={selectedRegForCard} />

              {/* Helpful success guide message for seniors */}
              {latestRegistration?.id === selectedRegForCard.id && (
                <div className="max-w-xl text-center bg-amber-50/50 border border-gold-250/30 rounded-xl p-5 mt-2">
                  <h4 className="font-serif italic font-bold text-amber-950 text-sm">
                    ✨ Congratulations! Your spot is compiled into the grand valediction list.
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    We've saved your details! You can save your valediction ticket as PNG image with the download button above or print it directly. Read other classmates' cards on the <b>Seniors Memory Wall</b> tab.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Subviews (Wizard Form or Memory browse) */
            <div className="w-full">
              {activeTab === "register" ? (
                <div className="flex justify-center">
                  <RegistrationForm onSuccess={handleRegistrationSuccess} />
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  {!isOrganizerUnlocked ? (
                    <OrganizerGate onUnlock={() => setIsOrganizerUnlocked(true)} />
                  ) : sysStatus === "loading" ? (
                    <div className="text-center p-12 w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono mt-3">SYNCHRONIZING FAREWELL REGISTRIES...</p>
                    </div>
                  ) : (
                    <MemoryWall 
                      registrations={registrations} 
                      onSelectRegistration={(selected) => setSelectedRegForCard(selected)} 
                      isOrganizerUnlocked={isOrganizerUnlocked}
                      onDeleteRegistration={handleDeleteRegistration}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Decorative Traditional Bottom Margin Sign-off */}
      <footer className="border-t border-gold-200/40 py-6 mt-16 bg-white/40 text-center px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-serif italic font-semibold text-slate-700">
              Global Institute of Management and Technology
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              CSE Department &bull; Valedictory Souvenirs Portal &bull; Batch 2026 onwards
            </p>
          </div>
          <p className="text-[10px] text-slate-400 max-w-xs text-center sm:text-right">
            Designed for computer science students to catalog legacy memories and code paths beautifully. Made with 🤍 on behalf of CSE juniors.
          </p>
        </div>
      </footer>

    </div>
  );
}
