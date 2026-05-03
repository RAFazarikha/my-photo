"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FrameResult from "./FrameResult";
import { Play, RefreshCcw, ArrowRight } from "lucide-react"; // Tambahan icon
import Webcam from "@/components/WebcamWrapper";
import type ReactWebcam from "react-webcam";

export default function Photobooth() {
  const webcamRef = useRef<ReactWebcam | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null); // State untuk foto sementara
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [intervalDuration, setIntervalDuration] = useState(3);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi untuk memotret dan memasukkan ke state sementara
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setTempPhoto(imageSrc);
    }
    setIsCapturing(false);
  };

  // Fungsi untuk memulai hitungan mundur 1x jepretan
  const startCountdown = () => {
    setIsCapturing(true);
    setTempPhoto(null);
    setCountdown(intervalDuration);

    const run = (time: number) => {
      if (time === 0) {
        capture();
        return;
      }
      setCountdown(time);
      timeoutRef.current = setTimeout(() => run(time - 1), 1000);
    };

    run(intervalDuration);
  };

  const handleStart = () => {
    setPhotos([]);
    startCountdown();
  };

  const handleRetake = () => {
    startCountdown(); // Ulangi hitungan mundur tanpa menambah array photos
  };

  const handleContinue = () => {
    if (tempPhoto) {
      const newPhotos = [...photos, tempPhoto];
      setPhotos(newPhotos);
      setTempPhoto(null);

      // Jika foto belum mencapai 4, otomatis mulai hitung mundur selanjutnya
      if (newPhotos.length < 4) {
        startCountdown();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-b from-primary to-secondary p-6">

      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Anakha Photobooth
        </h1>
        <p className="text-sm text-secondary">
          Capture your moment ✨
        </p>
        <p className="text-xs font-bold mt-2">
          {photos.length} / 4 Foto
        </p>
      </div>

      {/* Camera / Preview Card */}
      {photos.length < 4 && (
        <div className="relative bg-card p-4 rounded-3xl shadow-xl border-4">
          {tempPhoto ? (
            // Tampilkan hasil foto sementara
            <img
              src={tempPhoto}
              alt="Preview"
              className="rounded-2xl w-[320px] h-105 object-cover"
            />
          ) : (
            // Tampilkan Kamera
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              mirrored
              className="rounded-2xl w-[320px] h-105 object-cover"
            />
          )}

          {/* Countdown Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl">
              <span className="text-[80px] font-bold text-white drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls: Mode Awal (Belum mulai memotret) */}
      {!isCapturing && !tempPhoto && photos.length < 4 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <Select onValueChange={(val) => setIntervalDuration(Number(val))}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Durasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3s</SelectItem>
                <SelectItem value="5">5s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStart}
            className="rounded-full px-6 py-2 flex items-center gap-2 border-2"
          >
            <Play size={16} fill="currentColor" />
            Mulai
          </Button>
        </div>
      )}

      {/* Controls: Mode Preview (Setelah menjepret 1 foto) */}
      {!isCapturing && tempPhoto && photos.length < 4 && (
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleRetake}
            variant="secondary"
            className="rounded-full px-6 py-2 flex items-center gap-2 border-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <RefreshCcw size={16} />
            Ulangi
          </Button>

          <Button
            onClick={handleContinue}
            className="rounded-full px-6 py-2 flex items-center gap-2 border-2"
          >
            Lanjut
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Result */}
      {photos.length === 4 && <FrameResult photos={photos} />}
    </div>
  );
}