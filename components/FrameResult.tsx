"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Palette } from "lucide-react";

// 1. Definisikan pilihan style
const FRAME_STYLES = [
  {
    id: "light",
    name: "Classic White",
    previewBg: "bg-white",
    previewText: "text-gray-400",
    previewHighlight: "text-gray-600",
    exportBg: "#ffffff",
    exportText: "#9ca3af",
    exportHighlight: "#4b5563",
  },
  {
    id: "dark",
    name: "Midnight Dark",
    previewBg: "bg-gray-900",
    previewText: "text-gray-500",
    previewHighlight: "text-gray-300",
    exportBg: "#111827",
    exportText: "#6b7280",
    exportHighlight: "#d1d5db",
  },
  {
    id: "pink",
    name: "Sakura Pink",
    previewBg: "bg-pink-50",
    previewText: "text-pink-400",
    previewHighlight: "text-pink-600",
    exportBg: "#fdf2f8",
    exportText: "#f472b6",
    exportHighlight: "#db2777",
  },
];

export default function FrameResult({ photos }: { photos: string[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  
  // 2. State untuk menyimpan style terpilih (default: index 0 / Classic White)
  const [activeStyle, setActiveStyle] = useState(FRAME_STYLES[0]);

  const handleDownload = async () => {
    if (!frameRef.current) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "400px";
    iframe.style.height = "800px";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();

    // 3. Suntikkan variabel warna (exportBg, exportText, dll) ke dalam CSS iframe
    doc.write(`
        <html>
        <head>
            <style>
            body {
                margin: 0;
                background: ${activeStyle.exportBg};
                display: flex;
                justify-content: center;
                align-items: flex-start;
            }

            .frame {
                width: 260px;
                background: ${activeStyle.exportBg};
                padding: 16px;
                border-radius: 32px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }

            .photos {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .photos img {
                width: 100%;
                height: 160px;
                object-fit: cover;
                border-radius: 12px;
            }

            .footer {
                margin-top: 12px;
                text-align: center;
                font-size: 12px;
                color: ${activeStyle.exportText};
            }

            .footer span {
                display: block;
                color: ${activeStyle.exportHighlight};
                font-weight: 500;
            }
            </style>
        </head>
        <body>
            <div class="frame">
            <div class="photos">
                ${photos.map((src) => `<img src="${src}" />`).join("")}
            </div>
            <div class="footer">
                05 • 2026
                <span>your moment ♡</span>
            </div>
            </div>
        </body>
        </html>
    `);

    doc.close();

    // Beri sedikit jeda agar DOM iframe dirender sempurna sebelum di-capture
    await new Promise((resolve) => setTimeout(resolve, 100));

    const frameEl = doc.querySelector(".frame") as HTMLElement;

    const canvas = await html2canvas(frameEl, {
      scale: 3,
      backgroundColor: activeStyle.exportBg, // Sesuaikan background canvas
    });

    document.body.removeChild(iframe);

    const link = document.createElement("a");
    link.download = `korean-photobooth-${activeStyle.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      
      {/* Opsi Pemilihan Style */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
        <Palette size={16} className="text-gray-500 mr-2" />
        {FRAME_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setActiveStyle(style)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              activeStyle.id === style.id
                ? "border-blue-500 scale-110"
                : "border-transparent opacity-70 hover:opacity-100"
            } ${style.previewBg}`}
            title={style.name}
            // Fallback inline style untuk tombol dark/light agar terlihat bedanya
            style={{ backgroundColor: style.exportBg }}
          />
        ))}
      </div>

      {/* Preview (Tampilan dinamis mengikuti activeStyle) */}
      <div
        ref={frameRef}
        className={`${activeStyle.previewBg} p-4 rounded-3xl shadow-xl transition-colors duration-300`}
      >
        <div className="flex flex-col gap-3">
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="photo"
              className="w-60 h-40 object-cover rounded-xl"
            />
          ))}
        </div>

        <div className={`mt-4 text-center text-xs ${activeStyle.previewText}`}>
          <p>05 • 2026</p>
          <p className={`font-medium mt-0.5 ${activeStyle.previewHighlight}`}>
            your moment ♡
          </p>
        </div>
      </div>

      <Button
        onClick={handleDownload}
        className="rounded-full px-6 flex items-center gap-2"
      >
        <Download size={16} />
        Download ({activeStyle.name})
      </Button>
    </div>
  );
}