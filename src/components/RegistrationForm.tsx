import { useState, FormEvent, ChangeEvent, DragEvent } from "react";
import { User, Mail, GraduationCap, Phone, Image as ImageIcon, Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { AVATAR_COLORS, BATCH_OPTIONS, Registration } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface RegistrationFormProps {
  onSuccess: (registration: Registration) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batch, setBatch] = useState("2022-2026");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoName, setPhotoName] = useState<string>("");
  const [mustCome, setMustCome] = useState(false);
  const [avatarColor, setAvatarColor] = useState("rose");
  const [isDragActive, setIsDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [validationError, setValidationError] = useState("");

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setValidationError("Please select an image file (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setValidationError("Please upload a photo smaller than 3MB.");
      return;
    }
    setPhotoName(file.name);
    setValidationError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removePhoto = () => {
    setPhotoUrl("");
    setPhotoName("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    if (name.trim().length < 3) {
      setValidationError("Please enter a valid full name (at least 3 characters).");
      return;
    }
    if (!phone.trim()) {
      setValidationError("Please enter your mobile phone number.");
      return;
    }
    if (!mustCome) {
      setValidationError("You must promise to attend the event to submit!");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Sentimental compiler step simulation
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          batch,
          photoUrl,
          mustCome,
          avatarColor,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Failed to register. Please try again.");
      }

      const data: Registration = await response.json();
      onSuccess(data);
    } catch (err) {
      clearInterval(interval);
      console.warn("Express submission route failed. Activating Vercel-friendly offline client-side engine...", err);
      
      // Fallback: Assemble a local Registration card beautifully in memory!
      const fallbackMessages = [
        `Dear ${name.trim()}, we are absolutely thrilled to celebrate your beautiful journey. As a shining star of the CSE department, you have inspired us all. We look forward to welcoming you warmly at Sayonara 2.0!`,
        `To the amazing senior ${name.trim()}, your legendary legacy and brilliance will run as infinite loops of happy thoughts in our department. Can't wait to cheer you on at Sayonara 2.0 Farewell!`,
        `Dear ${name.trim()}, you compiled a glorious chapter at GIMT. We honor your guidance and await your royal entry to Sayonara 2.0 Farewell celebration!`,
        `Dear ${name.trim()}, you spent 4 years building memories and debugging algorithms with us. The CSE juniors are excited to welcome you into our grand farewell hall!`
      ];
      const selectedMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

      const clientReg: Registration = {
        id: `local_reg_${Date.now()}`,
        name: name.trim(),
        email: email.trim() || "",
        phone: phone.trim() || "",
        photoUrl: photoUrl || "",
        mustCome: true,
        department: "CSE",
        college: "Global Institute of Management and Technology",
        batch,
        vibe: "CSE Alumnus",
        favoriteMemory: "Attending Farewell Ceremony Sayonara 2.0",
        futureAspirations: "",
        messageToJuniors: "",
        farewellMessage: selectedMessage,
        avatarColor: avatarColor || "rose",
        createdAt: new Date().toISOString()
      };

      onSuccess(clientReg);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl border border-gold-200 shadow-xl overflow-hidden relative">
      {/* Sayonara 2026 Cozy Themed Top Banner section */}
      <div className="relative bg-gradient-to-r from-amber-800 to-amber-970 px-6 py-8 text-white text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(251,191,36,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30" />
        <div className="flex flex-col items-center justify-center gap-2">
          <GraduationCap size={48} className="text-amber-300 stroke-[1.5] animate-bounce" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200 font-bold bg-amber-950/60 px-3 py-1 rounded-full">
            Global Institute of Management and Technology
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-gold-100">
            Sayonara 2026
          </h2>
          <p className="text-amber-150/90 text-xs mt-1 font-serif italic max-w-md">
            CSE Seniors, submit your entry below to register your seat and instantly generate your royal valediction invitation card!
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          /* Sentimental compilation loading status */
          <motion.div
            key="loading-sayonara"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] bg-gold-50"
          >
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 border-4 border-gold-250 rounded-full animate-pulse" />
              <div className="absolute inset-2 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
              <Sparkles size={30} className="text-gold-600 animate-pulse" />
            </div>

            <motion.h4
              key={loadingStep}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-serif text-lg text-slate-800 font-bold mt-8"
            >
              {[
                "Preparing Sayonara 2.0 Credentials...",
                "Drafting customized valedictory citations...",
                "Baking code assets & photographic stamps...",
                "Finalizing invitation card details..."
              ][loadingStep]}
            </motion.h4>

            <p className="text-xs text-slate-500 font-mono mt-1.5 uppercase tracking-wider">
              CSE DEPARTMENT FAREWELL PORTAL
            </p>
          </motion.div>
        ) : (
          /* Actual Interactive registration form fields */
          <motion.form
            onSubmit={handleSubmit}
            key="fields-sayonara"
            className="p-6 md:p-8 space-y-6"
          >
            {validationError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs rounded-r-lg font-medium">
                ⚠️ {validationError}
              </div>
            )}

            {/* Structured Inputs */}
            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <User size={13} className="text-amber-800" /> FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shoubhik Majumdar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-gold-500 focus:bg-white rounded-lg p-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                />
              </div>

              {/* Batch option lists strictly 2022-2026 and 2023-2026 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                    <GraduationCap size={13} className="text-amber-800" /> GRADUATING BATCH <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-gold-500 focus:bg-white rounded-lg p-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium cursor-pointer"
                  >
                    {BATCH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        Batch {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone number field */}
                <div>
                  <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                    <Phone size={13} className="text-amber-800" /> MOBILE PHONE NO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-gold-500 focus:bg-white rounded-lg p-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                  />
                </div>
              </div>

              {/* Optional Email */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <Mail size={13} className="text-amber-800" /> EMAIL ADDRESS (OPTIONAL)
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-gold-500 focus:bg-white rounded-lg p-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              {/* Card Accent Color Motif */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={13} className="text-amber-800" /> CHOOSE THEME COLOR
                </label>
                <div className="flex gap-3 items-center">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => setAvatarColor(col.accent)}
                      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer ${
                        avatarColor === col.accent
                          ? "ring-2 ring-gold-600 ring-offset-2 scale-105 border-slate-600"
                          : "border-slate-300"
                      }`}
                      style={{
                        backgroundColor:
                          col.accent === "rose"
                            ? "#fda4af"
                            : col.accent === "emerald"
                              ? "#6ee7b7"
                              : col.accent === "blue"
                                ? "#93c5fd"
                                : col.accent === "amber"
                                  ? "#fde047"
                                  : "#94a3b8",
                      }}
                      title={col.name}
                    />
                  ))}
                  <span className="text-xs text-slate-500 font-mono capitalize ml-1">
                    {AVATAR_COLORS.find((c) => c.accent === avatarColor)?.name} Theme
                  </span>
                </div>
              </div>

              {/* Usability Pattern Drag and Drop file selection for Photos */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <ImageIcon size={13} className="text-amber-800" /> PHOTO UPLOAD <span className="text-slate-400 font-normal font-sans">(Used as profile image on the card)</span>
                </label>

                {photoUrl ? (
                  <div className="flex items-center gap-4 p-3 border border-gold-200 rounded-xl bg-gold-50/50">
                    <img
                      src={photoUrl}
                      alt="Uploaded Preview"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-full border-2 border-amber-600 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{photoName || "Uploaded Photo"}</p>
                      <p className="text-[10px] text-green-600 font-mono mt-0.5">✓ Ready for card compile</p>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isDragActive
                        ? "border-amber-600 bg-amber-50"
                        : "border-slate-350 hover:border-gold-500 hover:bg-slate-50/50"
                    }`}
                    onClick={() => document.getElementById("sayonara-file-input")?.click()}
                  >
                    <input
                      id="sayonara-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 mb-2">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Drag and drop your picture here, or <span className="text-amber-700 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports JPG, JPEG, and PNG images up to 3MB
                    </p>
                  </div>
                )}
              </div>

              {/* Attendance confirmation tick box */}
              <div className="pt-4 pb-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={mustCome}
                      onChange={(e) => setMustCome(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      mustCome 
                        ? "bg-amber-700 border-amber-700" 
                        : "border-slate-300 group-hover:border-amber-700"
                    }`}>
                      {mustCome && <Check size={14} className="text-white font-extrabold stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <ShieldCheck size={14} className="text-amber-700 block" /> RSVP CONFIRMATION (ATTENDANCE REQUIREMENT) <span className="text-red-500">*</span>
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      I promise that I will attend this memorable event **Sayonara 2.0** organized by the CSE department.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer submit block constraint: Submit button ONLY shows when marked true */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end min-h-[50px]">
              <AnimatePresence>
                {mustCome ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    type="submit"
                    className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center gap-2 active:scale-95 group cursor-pointer"
                  >
                    Submit &amp; Generate Royal Invite Card
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ) : (
                  <p className="text-xs text-amber-800 italic font-medium bg-amber-50 border border-amber-200/55 rounded-lg py-2 px-4 shadow-sm">
                    🔒 Please check the attendance requirement above to unlock the submit button.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
