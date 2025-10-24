"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function EditPage() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [frameType, setFrameType] = useState<"none" | "wavy" | "straight">("none"); // ✅ default none
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const savedPhoto = localStorage.getItem("mergedPhoto");
    const savedFrameCount = localStorage.getItem("frameCount");
    if (savedPhoto) setBaseImage(savedPhoto);
    if (savedFrameCount) setFrameCount(parseInt(savedFrameCount));
  }, []);

  const addFrame = async (type: "wavy" | "straight") => {
    if (!baseImage) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.src = baseImage;
    await new Promise((res) => (img.onload = res));

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const frame = new Image();
    frame.src = `/frames/${type}Frame${frameCount}.png`;
    await new Promise((res) => (frame.onload = res));

    ctx.drawImage(frame, 0, 0, img.width, img.height);

    const final = canvas.toDataURL("image/png");
    setFinalImage(final);
    setFrameType(type);
  };

  const removeFrame = () => { //buat none
    setFinalImage(null);
    setFrameType("none");
  };

  const downloadFinal = () => {
    if (!finalImage) return;
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = "edited_clixia.png";
    link.click();
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black">
      <Link href="/">
        <img
          src="/arrow-back.png"
          alt="back"
          className=" absolute top-10 left-10 dark:invert object-cover w-[40px] h-[40px]"
        />
      </Link>
      <div className="flex flex-1 justify-center items-center">
        {baseImage ? (
          <div className="flex flex-col items-center">
            <canvas ref={canvasRef} className="hidden" />
            <img
              src={finalImage || baseImage}
              alt="Edited"
              className="max-h-[70vh] rounded-lg shadow-lg object-contain"
            />
          </div>
        ) : (
          <p className="text-gray-600">Tidak ada foto ditemukan.</p>
        )}
      </div>

      {baseImage && (
        <div className="flex justify-center items-center gap-4 p-4 bg-gray-200">
          <button
            onClick={removeFrame}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "none"
                ? "bg-black text-white" : "bg-white border text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            None
          </button>

          <button
            onClick={() => addFrame("wavy")}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "wavy"
                ? "bg-black text-white" : "bg-white border text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            Wavy
          </button>

          <button
            onClick={() => addFrame("straight")}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "straight"
                ? "bg-black text-white" : "bg-white border text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            Straight
          </button>

          <button
            onClick={downloadFinal}
            className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
