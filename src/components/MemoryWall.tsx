import { useState } from "react";
import { Search, Heart, Sparkles, Filter, FileSpreadsheet, Eye, User, Calendar, Phone, Trash2 } from "lucide-react";
import { Registration } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MemoryWallProps {
  registrations: Registration[];
  onSelectRegistration: (reg: Registration) => void;
  isOrganizerUnlocked?: boolean;
  onDeleteRegistration?: (id: string) => void;
}

export default function MemoryWall({ 
  registrations, 
  onSelectRegistration,
  isOrganizerUnlocked = false,
  onDeleteRegistration
}: MemoryWallProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");

  // Filter registrations matching parameters
  const filteredRegs = registrations.filter((reg) => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch === "all" || reg.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  // Calculate stats
  const totalRSVPs = registrations.length;
  const countBatch22 = registrations.filter((r) => r.batch === "2022-2026").length;
  const countBatch23 = registrations.filter((r) => r.batch === "2023-2026").length;

  // Generate and download CSV registration manifest
  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    
    const headers = [
      "ID",
      "Full Name",
      "Batch",
      "Email Address",
      "Mobile Phone",
      "Commitment Confirmed",
      "Department",
      "College",
      "Tribute Message",
      "Registered On"
    ];

    const escapeCSVCell = (strVal: string) => {
      if (!strVal) return '""';
      const escaped = strVal.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvRows = [
      headers.join(","),
      ...registrations.map((reg) =>
        [
          reg.id,
          escapeCSVCell(reg.name),
          reg.batch,
          escapeCSVCell(reg.email),
          escapeCSVCell(reg.phone),
          reg.mustCome ? "YES" : "NO",
          reg.department,
          escapeCSVCell(reg.college),
          escapeCSVCell(reg.farewellMessage),
          reg.createdAt
        ].join(",")
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `Sayonara_Farewell_RSVP_Manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* RSVP Dashboard Overview */}
      <div className="bg-white rounded-2xl border border-gold-200 p-5 md:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-xl text-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Total RSVPs</span>
            <span className="text-xl md:text-2xl font-serif italic text-amber-950 font-extrabold">{totalRSVPs} Seniors</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2 text-left rounded-xl text-xs flex flex-col justify-center">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Batch 2022-2026: <b>{countBatch22}</b>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Batch 2023-2026: <b>{countBatch23}</b>
            </div>
          </div>
        </div>

        {totalRSVPs > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            Download RSVP Guestlist (CSV)
          </button>
        )}
      </div>

      {/* Simplified Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search senior by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:outline-none focus:bg-white text-slate-700"
          />
        </div>

        {/* Batch Select Filter */}
        <div className="relative flex items-center">
          <Filter className="absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:outline-none cursor-pointer text-slate-700 font-medium"
          >
            <option value="all">Degree Batch: All Registered Years</option>
            <option value="2022-2026">Batch (2022-2026)</option>
            <option value="2023-2026">Batch (2023-2026)</option>
          </select>
        </div>
      </div>

      {/* Grid of registered cards */}
      {filteredRegs.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-gold-200 shadow-sm">
          <Heart size={44} className="mx-auto text-amber-200 stroke-[1.5] mb-4 animate-pulse" />
          <h4 className="font-serif text-lg text-slate-800 font-bold">No Registrations Found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            No RSVPs found matching your search. Seniors, select the form tab and secure your spot!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRegs.map((reg) => {
              return (
                <motion.div
                  layout
                  key={reg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-amber-700/30 hover:shadow-lg shadow-sm transition-all flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Visual Theme Stripe */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      backgroundColor:
                        reg.avatarColor === "rose"
                          ? "#fda4af"
                          : reg.avatarColor === "emerald"
                            ? "#6ee7b7"
                            : reg.avatarColor === "blue"
                              ? "#93c5fd"
                              : reg.avatarColor === "amber"
                                ? "#fde047"
                                : "#94a3b8",
                    }}
                  />

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Name, batch info and photo layout */}
                      <div className="flex items-start gap-3">
                        {/* Little profile image if present */}
                        {reg.photoUrl ? (
                          <img
                            src={reg.photoUrl}
                            alt={reg.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-14 object-cover rounded-lg border-2 border-amber-600 bg-white shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-14 rounded-lg bg-amber-50 border-2 border-dashed border-amber-600/30 shrink-0 flex items-center justify-center text-xl">
                            🎓
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif italic font-extrabold text-base text-slate-900 leading-tight truncate">
                            {reg.name}
                          </h4>
                          <span className="inline-block mt-1 text-[10px] font-mono font-bold text-red-800 bg-red-50/50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                            Batch {reg.batch}
                          </span>
                          <span className="block text-[8px] font-mono text-slate-400 mt-1 uppercase">
                            CSE Department • GIMT
                          </span>
                        </div>
                      </div>

                      {/* Customized blessing/tribute message */}
                      <div className="mt-4 bg-[#fdfdfc] rounded-xl p-3.5 border border-slate-100 min-h-[60px] flex items-center justify-center">
                        <p className="text-xs text-slate-650 font-serif italic leading-relaxed text-center">
                          &ldquo;{reg.farewellMessage}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      {/* Public Attendance flag */}
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        RSVP Confirmed
                      </span>

                      <div className="flex items-center gap-2">
                        {isOrganizerUnlocked && onDeleteRegistration && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRegistration(reg.id);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 rounded-lg border border-red-200 transition-all cursor-pointer flex items-center justify-center animate-fade-in"
                            title="Delete RSVP Entry"
                          >
                            <Trash2 size={12} className="stroke-[2.5]" />
                          </button>
                        )}

                        {/* View Invitation card button */}
                        <button
                          onClick={() => onSelectRegistration(reg)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={11} />
                          View Invitation Card
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
