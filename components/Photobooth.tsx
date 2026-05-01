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
import { Play } from "lucide-react";
import Webcam from "@/components/WebcamWrapper";
import type ReactWebcam from "react-webcam";

export default function Photobooth() {
  const webcamRef = useRef<ReactWebcam | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [intervalDuration, setIntervalDuration] = useState(3);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhotos((prev) => [...prev, imageSrc]);
    }
  };

  const startSequence = (remainingShots: number) => {
    setCountdown(intervalDuration);

    const run = (time: number) => {
      if (time === 0) {
        capture();

        if (remainingShots > 1) {
          timeoutRef.current = setTimeout(() => {
            startSequence(remainingShots - 1);
          }, 600);
        } else {
          setIsCapturing(false);
        }
        return;
      }

      setCountdown(time);
      timeoutRef.current = setTimeout(() => run(time - 1), 1000);
    };

    run(intervalDuration);
  };

  const handleStart = () => {
    setPhotos([]);
    setIsCapturing(true);
    startSequence(4);
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
          Korean Photobooth
        </h1>
        <p className="text-sm text-secondary">
          Capture your moment ✨
        </p>
      </div>

      {/* Camera Card */}
      {photos.length < 4 && (
        <div className="relative bg-card p-4 rounded-3xl shadow-xl">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            mirrored
            className="rounded-2xl w-[320px] h-105 object-cover"
          />

          {/* Countdown */}
          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[80px] font-bold text-white drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {!isCapturing && photos.length < 4 && (
        <div className="mt-6 flex flex-col items-center gap-3">

          <div className="flex gap-3">
            <Select
              onValueChange={(val) => setIntervalDuration(Number(val))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Durasi" />
                </SelectTrigger>

                <SelectContent>
                <SelectItem
                    value="3"
                    className="
                        rounded-lg px-3 py-2
                        transition
                        focus:bg-secondary
                        data-[state=checked]:bg-secondary
                        data-[state=checked]:text-secondary
                    "
                    >
                    3s
                    </SelectItem>
                <SelectItem
                    value="5"
                    className="
                        rounded-lg px-3 py-2
                        transition
                        focus:bg-secondary
                        data-[state=checked]:bg-secondary
                        data-[state=checked]:text-secondary
                    "
                    >
                    5s
                    </SelectItem>
                </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStart}
            className="rounded-full px-6 py-2 flex items-center gap-2"
          >
            <Play size={16} />
            Mulai
          </Button>
        </div>
      )}

      {/* Result */}
      {photos.length === 4 && <FrameResult photos={photos} />}
    </div>
  );
}