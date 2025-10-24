"use client";
import React, {useRef, useState, useEffect} from "react";
import Webcam from "react-webcam";

export default function SimpleCamera(){
  const webcamRef = useRef<Webcam>(null); //bikin var webcamRef, isinya bisa berubah tapi ga re-render (tampilan kamera), tipe data harus webcam, isi awal null
  const [photos, setPhotos] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); //bikin variabel tipe canvas untuk merge gambar dan hasil akhir dikonversi jadi image
  const [frameCount, setFrameCount] = useState(1); //awalnya selalu 1 frame doang
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [maxDisplayHeight, setMaxDisplayHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => setMaxDisplayHeight(window.innerHeight * 0.9); 
    // *0.9 supaya sedikit di bawah tinggi layar, biar gak mentok banget*
    updateHeight(); // jalanin pertama kali pas komponen muncul
    window.addEventListener("resize", updateHeight); // update kalau jendela diresize

    return () => window.removeEventListener("resize", updateHeight); // bersihin listener-nya
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
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
        <div className="relative w-1/2 flex justify-center items-center bg-gray-100 p-4">
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
                className="w-full h-full bg-gray-300 flex justify-center items-center rounded-lg overflow-hidden"
                >
                  {photos[i] ? (
                    <img
                    src={photos[i]}
                    alt={`photo_${i + 1}`}
                    className="object-cover w-[320px] h-[240px]"
                    />
                  ):(
                    <p className="text-gray-500 text-sm">Belum ada foto</p>
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

      <div className="flex justify-center items-center gap-4 p-4 bg-gray-200">
        {[1,2,3,4].map((count)=> (
          <button
          key={count}
          onClick={() => changeFrame(count)}
          className={`px-4 py-2 rounded-full font-semibold ${
            frameCount === count
            ? "bg-black text-white" : "bg-white text-black border border-gray-400 hover:bg-gray-100"
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
