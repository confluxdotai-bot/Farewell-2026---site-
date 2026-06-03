import { useRef, useState } from "react";
import { Download, Share2, Sparkles, Printer, Copy, Check } from "lucide-react";
import { Registration } from "../types";
import { motion } from "motion/react";

interface InvitationCardProps {
  registration: Registration;
}

export default function InvitationCard({ registration }: InvitationCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Functional copy helper
  const handleCopyShareText = async () => {
    const text = `🎓 SAYONARA 2.0 — Official Invitation 🎓\n\nDear ${registration.name},\n\nYou are cordially invited to the event (Sayonara 2.0) Farewell 2026, organised by the Department of CSE, Global Institute of Management and Technology.\n\n✨ Invitation Details:\nSenior Name: ${registration.name}\nBatch: ${registration.batch}\n\nCome and celebrate your graduation with us! 🎓❤️`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Canvas Souvenir Export Engine (supporting portrait image rendering)
  const handleDownloadPNG = () => {
    setIsDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-resolution dimensions for print-ready aspect ratio
    canvas.width = 1000;
    canvas.height = 700;

    const exportCard = (photoImg?: HTMLImageElement) => {
      // 1. Draw Royal Cream Backdrop
      ctx.fillStyle = "#faf7ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Paper noise textures
      ctx.fillStyle = "rgba(181, 152, 55, 0.04)";
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 60 + 10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // 2. Multi-layered Gold Borders & Vintage Edges
      ctx.strokeStyle = "#9a7829";
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      ctx.strokeStyle = "#e8d393";
      ctx.lineWidth = 4;
      ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

      ctx.strokeStyle = "#6b541d";
      ctx.lineWidth = 1;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

      // Vintage corner circles
      const drawCircleDecoration = (cx: number, cy: number, r: number) => {
        ctx.strokeStyle = "#9a7829";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#9a7829";
        ctx.beginPath();
        ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCircleDecoration(42, 42, 14);
      drawCircleDecoration(canvas.width - 42, 42, 14);
      drawCircleDecoration(42, canvas.height - 42, 14);
      drawCircleDecoration(canvas.width - 42, canvas.height - 42, 14);

      // 3. Title Header text
      ctx.textAlign = "center";
      ctx.fillStyle = "#634c1b";
      ctx.font = "bold 22px monospace";
      ctx.fillText("S A Y O N A R A  2.0", canvas.width / 2, 85);

      ctx.fillStyle = "#c52a1a";
      ctx.font = "bold italic 34px Georgia";
      ctx.fillText("Farewell Invitation Card 2026", canvas.width / 2, 130);

      // Decorative vector line
      ctx.strokeStyle = "rgba(154, 120, 41, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 155);
      ctx.lineTo(750, 155);
      ctx.stroke();

      // 4. Invitee core block layout
      // Left coordinate start for name and invite info
      let leftMargin = 85;
      let textWidthLimit = 500;

      if (!photoImg) {
        // Center text structure if there's no picture
        leftMargin = canvas.width / 2;
        ctx.textAlign = "center";
        textWidthLimit = 750;
      } else {
        ctx.textAlign = "left";
        
        // Enforce large photo dimensions with a golden vector frame
        const imgX = 630;
        const imgY = 210;
        const imgW = 280;
        const imgH = 340;

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 12;
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.shadowColor = "transparent"; // Reset shadow

        // Golden image border
        ctx.strokeStyle = "#9a7829";
        ctx.lineWidth = 4;
        ctx.strokeRect(imgX, imgY, imgW, imgH);

        // Draw image inside frame
        ctx.drawImage(photoImg, imgX + 8, imgY + 8, imgW - 16, imgH - 16);
      }

      // Invitation salutation
      ctx.fillStyle = "#735c2b";
      ctx.font = "italic 22px Georgia";
      const salutationY = 240;
      ctx.fillText("This honorary invitation is cordially extended to our senior,", leftMargin, salutationY);

      // Senior Name
      ctx.fillStyle = "#1e1a14";
      ctx.font = "bold italic 48px Georgia";
      const nameY = 310;
      ctx.fillText(registration.name, leftMargin, nameY);

      // Batch Tag Details
      ctx.fillStyle = "#c52a1a";
      ctx.font = "bold 15px monospace";
      const batchY = 355;
      ctx.fillText(`CLASS OF ${registration.batch} (COMPUTER SCIENCE & ENGINEERING)`, leftMargin, batchY);

      // Main Invitation Phrase (SAYONARA 2.0 Bold and Standout rendering on canvas)
      const invitePhrase = `You are invited in the event (Sayonara 2.0) Farewell 2026, organised by department of CSE, Global Institute of Management and Technology.`;
      
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(" ");
        let line = "";
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + " ";
          let metrics = ctx.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, currentY);
        return currentY;
      };

      ctx.fillStyle = "#1e1a14";
      ctx.font = "bold italic 20px Georgia";
      const phraseY = 410;
      wrapText(invitePhrase, leftMargin, phraseY, textWidthLimit, 28);

      // 6. Sign-off Footer credentials (Removed the bottom citation block msgBoxY code completely to give spacious elegance)
      ctx.textAlign = "center";
      ctx.fillStyle = "#634c1b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("WITH LOVE & ADMIRATION FROM YOUR CSE JUNIORS", canvas.width / 2, 610);

      ctx.font = "italic 12px Georgia";
      ctx.fillText("Global Institute of Management & Technology, West Bengal", canvas.width / 2, 635);

      // Save to PNG
      const link = document.createElement("a");
      link.download = `SAYONARA_Invite_${registration.name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsDownloading(false);
    };

    // Load base64 portrait if present
    if (registration.photoUrl) {
      const img = new Image();
      img.onload = () => exportCard(img);
      img.onerror = () => exportCard();
      img.src = registration.photoUrl;
    } else {
      exportCard();
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div id="souvenir-card-panel" className="flex flex-col items-center w-full">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #active-printable-card, #active-printable-card * {
            visibility: visible;
          }
          #active-printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            background-color: #faf7ee !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Main card with spring entry */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full max-w-2xl px-1"
      >
        <div
          id="active-printable-card"
          className="bg-[#faf7ee] border-8 border-amber-700/80 p-6 md:p-10 rounded-2xl shadow-xl relative overflow-hidden my-4"
        >
          {/* Symmetrical golden corner embellishments */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-amber-600/60 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-600/60 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-600/60 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-amber-600/60 rounded-br-lg pointer-events-none" />

          {/* Symmetrical design layout */}
          <div className="flex flex-col items-center">
            {/* Event Name Loud and First */}
            <span className="text-[11px] tracking-[0.2em] font-mono text-amber-800 font-bold uppercase mb-1">
              • S A Y O N A R A  2.0 •
            </span>
            <div className="w-16 h-[1.5px] bg-amber-600/40 my-1" />
            <h2 className="font-serif italic font-extrabold text-2xl md:text-3xl text-red-800 text-center mt-1">
              Farewell Celebration 2026
            </h2>

            <div className="w-full h-[1px] bg-amber-600/20 my-5" />

            {/* Content Segment: Name and text + Image on the right side */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 w-full text-center md:text-left">
              {/* Left Side: Invitation message */}
              <div className="flex-1 space-y-4">
                <p className="text-xs font-serif italic text-amber-850">
                  This honorary invitation is cordially extended to our senior,
                </p>

                {/* Senior full Name */}
                <h1 className="font-serif italic font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
                  {registration.name}
                </h1>

                {/* Batch marker */}
                <div>
                  <span className="inline-block bg-red-50 border border-red-200/60 text-red-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    CLASS OF {registration.batch}
                  </span>
                </div>

                {/* Specific exact invitation phrase from the user */}
                <p className="text-sm md:text-base font-serif font-bold text-slate-900 leading-relaxed pt-3 border-t border-amber-600/10">
                  You are invited in the event <span className="font-extrabold text-red-800 font-sans">(Sayonara 2.0) Farewell 2026</span>, organised by department of CSE, Global Institute of Management and Technology.
                </p>
              </div>

              {/* Right Side: Uploaded senior photo */}
              {registration.photoUrl ? (
                <div className="w-40 h-48 md:w-48 md:h-56 rounded-2xl border-4 border-amber-800/80 overflow-hidden shadow-md bg-white shrink-0 mt-4 md:mt-0 flex items-center justify-center p-2 hover:scale-105 transition-transform duration-300">
                  <img
                    src={registration.photoUrl}
                    alt={registration.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-40 h-48 md:w-48 md:h-56 rounded-2xl border-4 border-dashed border-amber-600/30 overflow-hidden bg-slate-50/50 shrink-0 mt-4 md:mt-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl text-amber-600 opacity-60 animate-bounce">🎓</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-2 block font-bold">
                    No Portrait
                  </span>
                </div>
              )}
            </div>

            {/* Footer Signature stamp */}
            <div className="mt-8 pt-4 border-t border-amber-600/20 w-full text-center">
              <p className="text-[9px] font-mono tracking-widest text-[#634c1b] font-bold uppercase">
                DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
              </p>
              <p className="text-[10px] text-slate-500 font-serif italic mt-0.5">
                Global Institute of Management and Technology
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Buttons for export */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 mb-2">
        <button
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Download size={14} />
          {isDownloading ? "Generating Image..." : "Download Souvenir Card (PNG)"}
        </button>

        <button
          onClick={handlePrintCard}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
        >
          <Printer size={14} />
          Print Ticket / PDF
        </button>

        <button
          onClick={handleCopyShareText}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? "Copied Shareable Text" : "Copy Tribute Text"}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
