"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type ReactWebcam from "react-webcam";
import type { WebcamProps } from "react-webcam";

// 1. Tambahkan Partial<> agar semua properti bawaan tidak dianggap wajib
type SafeWebcamProps = Partial<WebcamProps>;

const WebcamBase = dynamic(
  // 2. Gunakan SafeWebcamProps di sini
  () => import("react-webcam").then((mod) => mod.default as React.ComponentType<SafeWebcamProps>),
  { ssr: false }
);

// 3. Gunakan SafeWebcamProps di forwardRef
const Webcam = forwardRef<ReactWebcam, SafeWebcamProps>((props, ref) => {
  const DynamicWebcam = WebcamBase as React.ElementType;
  
  return <DynamicWebcam {...props} ref={ref} />;
});

Webcam.displayName = "Webcam";

export default Webcam;