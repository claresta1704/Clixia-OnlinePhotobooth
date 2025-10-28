"use client";
import React, {useRef, useState, useEffect} from "react";
import Webcam from "react-webcam";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SimpleCamera(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webcamRef = useRef<any>(null); //bikin var webcamRef, isinya bisa berubah tapi ga re-render (tampilan kamera), tipe data harus webcam, isi awal null
  const [photos, setPhotos] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); //bikin variabel tipe canvas untuk merge gambar dan hasil akhir dikonversi jadi image
  const [frameCount, setFrameCount] = useState(1); //awalnya selalu 1 frame doang
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [maxDisplayHeight, setMaxDisplayHeight] = useState<number>(0);
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
    const updateHeight = () => setMaxDisplayHeight(window.innerHeight * 0.9); 
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const takePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && photos.length < frameCount) {
      const newPhotos = [...photos, imageSrc];
      setPhotos(newPhotos);

      if (newPhotos.length === frameCount) {
        mergePhotos(newPhotos);
      }
    }
  };

  const mergePhotos = async (images: string[]) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const loadedImages = await Promise.all(
      images.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
          })
      )
    );

    const width = loadedImages[0].width; //ambil width&height foto pertama untuk patokan
    const height = loadedImages[0].height;

    if (frameCount === 4) {
      canvas.width = width*2;
      canvas.height = height*2;
      loadedImages.forEach((img, i) => {
        const x = (i % 2) * width; //foto pertama&ketiga di kolom kiri (x=0), foto kedua&keempat di kolom kanan (x=width (sejauh 1 lebar gambar ke kanan))
        const y = Math.floor(i/2)*height; //foto pertama&kedua di baris atas (y=0), foto ketiga&keempat di baris bawah (y=height)
        ctx.drawImage(img, x, y, width, height); //tempel img di posisi (x,y) di canvas, ukuran width dan height
      });
    } else {
      canvas.width = width;
      canvas.height = height*frameCount;
      loadedImages.forEach((img, i) => {
        ctx.drawImage(img, 0, i * height, width, height);
      });
    }

    if (canvas.height > maxDisplayHeight) {
      const scale = maxDisplayHeight / canvas.height;
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;
      const scaledCtx = scaledCanvas.getContext("2d")!;
      scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

      const final = scaledCanvas.toDataURL("image/png");
      setMergedImage(final);
    } else {
      const final = canvas.toDataURL("image/png");
      setMergedImage(final);
    }
  };

  const changeFrame = (count: number) => {
    setFrameCount(count);
    setPhotos([]);
    setMergedImage(null);
  };

  const deletePhotos = () => {
    setPhotos([]);
    setMergedImage(null);
  }

  const downloadMerged = () => {
    if (!mergedImage) return;
    const link = document.createElement("a");
    link.href = mergedImage;
    link.download = "clixia.png";
    link.click();

    try {
      const existingGallery = JSON.parse(localStorage.getItem("gallery") || "[]");
      const updatedGallery = [...existingGallery, mergedImage];
      localStorage.setItem("gallery", JSON.stringify(updatedGallery));
      console.log("Foto disimpan ke galeri");
    } catch (error) {
      console.error("Gagal menyimpan foto ke galeri", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
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

      <div className="flex flex-row flex-1">
        <div className="relative w-1/2 flex justify-center items-center bg-black">
          <div className="relative w-[400px] h-[300px]">
            <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            className="relative object-cover w-full h-full rounded-lg"
            />
            <button 
            onClick={takePhoto}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black text-white rounded-full px-4 py-2 hover:bg-gray-300 hover:text-black">Snapshoot</button>
          </div>
        </div>
        <div className="relative w-1/2 flex justify-center items-center bg-black border-l border-white p-4">
          {!mergedImage ? (
            <div
            className={`grid gap-2 w-full h-full ${
              frameCount === 1
              ? "grid-cols-1 grid-rows-1" : frameCount === 2
              ? "grid-cols-1 grid-rows-2" : frameCount === 3
              ? "grid-cols-1 grid-rows-3" : "grid-cols-2 grid-rows-2"
            }`}
            >
              {Array.from({ length: frameCount}).map((_, i) => (
                <div
                key={i}
                className="w-full h-full bg-[rgb(84,76,76)] flex justify-center items-center rounded-lg overflow-hidden"
                >
                  {photos[i] ? (
                    <img
                    src={photos[i]}
                    alt={`photo_${i + 1}`}
                    className="object-cover w-[320px] h-[240px]"
                    />
                  ):(
                    <p className="text-white text-sm">Belum ada foto</p>
                  )}
                  </div>
              ))}
            </div>
          ):(
            <img
            src={mergedImage}
            alt="merged result"
            className="object-contain rounded-lg shadow-lg"
            />
          )}
          {mergedImage && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
              <button onClick={downloadMerged} className="bg-green-600 text-white rounded-full px-4 py-2 hover:bg-green-700">Download</button>
              <button
                onClick={() => {
                  if (mergedImage) {
                    localStorage.setItem("mergedPhoto", mergedImage);
                    localStorage.setItem("frameCount", frameCount.toString());
                    window.location.href = "/edit";
                  }
                }}
                className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700 flex items-center justify-center">
                Edit
              </button>
            </div>
          )}
          <button onClick={deletePhotos} className="absolute top-6 right-6 z-10 bg-red-500 text-white rounded-full px-4 py-2 hover:bg-black">
            Delete
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 p-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {[1,2,3,4].map((count)=> (
          <button
          key={count}
          onClick={() => changeFrame(count)}
          className={`px-4 py-2 rounded-full font-semibold ${
            frameCount === count
            ? "bg-black text-white border border-white" : "bg-white text-black border border-gray-400 hover:bg-gray-100"
          }`}
          >
            Frame {count}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="hidden"/>
    </div>
  );
}
