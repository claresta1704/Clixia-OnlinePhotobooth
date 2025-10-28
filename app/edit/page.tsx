"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

type Sticker = { id: number; src: string; x: number; y: number;};

export default function EditPage() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [frameType, setFrameType] = useState<"none" | "wavy" | "straight">("none");
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user?.displayName) {
          setUserName(user.displayName);
        } else {
          setUserName("Guest");
        }
      });
      return () => unsubscribe();
    }, []);

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

  const removeFrame = () => {
    setFinalImage(null);
    setFrameType("none");
  };

  const addSticker = (src: string) => {
    setStickers((prev) => [
      ...prev,
      { id: Date.now(), src, x: 50, y: 50 },
    ]);
  };

  const finalizeWithStickers = async () => {
    const base = new Image();
    base.src = finalImage || baseImage!;
    await new Promise((r) => (base.onload = r));

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = base.width;
    canvas.height = base.height;

    ctx.drawImage(base, 0, 0);

    const displayedImg = document.querySelector("img[alt='Edited']") as HTMLImageElement;
    if (!displayedImg) return;
    const displayWidth = displayedImg.clientWidth;
    const displayHeight = displayedImg.clientHeight;

    const scaleX = base.width / displayWidth;
    const scaleY = base.height / displayHeight;

    for (const s of stickers) {
      const img = new Image();
      img.src = s.src;
      await new Promise((r) => (img.onload = r));

      ctx.drawImage(img, s.x * scaleX, s.y * scaleY, 80 * scaleX, 80 * scaleY);
    }

    const merged = canvas.toDataURL("image/png");
    setFinalImage(merged);
    setStickers([]);
  };


  const handleDrag = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingId(id);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setStickers((prev) =>
        prev.map((s) => (s.id === draggingId ? { ...s, x, y } : s))
      );
    }
  };

  const handleDrop = () => setDraggingId(null);

  const downloadFinal = () => {
    if (!finalImage) return;
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = "edited-clixia.png";
    link.click();

    try {
      const existingGallery = JSON.parse(localStorage.getItem("gallery") || "[]");
      const updatedGallery = [...existingGallery, finalImage];
      localStorage.setItem("gallery", JSON.stringify(updatedGallery));
      console.log("Foto disimpan ke galeri");
    } catch (error) {
      console.error("Gagal menyimpan foto ke galeri", error);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
        <span className="text-white font-semibold text-lg">
          {userName}
        </span>
        <p>|</p>
        <button
          onClick={() => router.push("/gallery")}
          className="text-white cursor-pointer"
        >
          Gallery
        </button>
        <p>|</p>
        <Link href="/" className="text-white cursor-pointer">
          Logout
        </Link>
      </div>

      <Link href="/takephoto">
        <img
          src="/arrow-back.png"
          alt="back"
          className="absolute z-50 top-1/2 left-10 dark:invert object-cover w-[40px] h-[40px]"
        />
      </Link>

      <div className="flex flex-1 justify-center items-center relative">
        {baseImage ? (
          <div
            className="photo-area relative flex flex-col items-center"
            onMouseMove={handleMove}
            onMouseUp={handleDrop}
          >
            <canvas ref={canvasRef} className="hidden" />
            <img
              src={finalImage || baseImage}
              alt="Edited"
              className="max-h-[70vh] rounded-lg shadow-lg object-contain"
            />

            {stickers.map((s) => (
              <img
                key={s.id}
                src={s.src}
                onMouseDown={(e) => handleDrag(e, s.id)}
                className="absolute w-[80px] h-[80px] cursor-grab select-none cursor-grab select-none"
                style={{
                  left: s.x,
                  top: s.y,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Tidak ada foto</p>
        )}
      </div>

      <div className="absolute top-0 right-0 h-full w-[100px] bg-[rgb(10,25,47)] bg-opacity-80 overflow-y-scroll z-10 p-2 flex flex-col items-center gap-2">
        {[...Array(20)].map((_, i) => (
          <img
            key={i}
            src={`/stickers/${i + 1}.png`}
            alt={`sticker-${i + 1}`}
            className="w-[70px] h-[70px] object-contain cursor-pointer hover:scale-105 transition-transform"
            onClick={() => addSticker(`/stickers/${i + 1}.png`)}
          />
        ))}
      </div>

      {baseImage && (
        <div className="flex justify-center items-center gap-4 p-4">
          <button
            onClick={removeFrame}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "none"
                ? "bg-black text-white border border-white" : "bg-white border text-black border-black hover:bg-white hover:text-black"
            }`}>
            None
          </button>

          <button
            onClick={() => addFrame("wavy")}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "wavy"
                ? "bg-black text-white" : "bg-white border text-black border-black hover:bg-black hover:text-white"
            }`}>
            Wavy
          </button>

          <button
            onClick={() => addFrame("straight")}
            className={`px-4 py-2 rounded-full font-semibold ${
              frameType === "straight"
                ? "bg-black text-white" : "bg-white border text-black border-black hover:bg-black hover:text-white"
            }`}>
            Straight
          </button>

          <button
            onClick={finalizeWithStickers}
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
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
