"use client";
import React, {useRef, useState} from "react";
import Webcam from "react-webcam";

export default function SimpleCamera(){
  const webcamRef = useRef<Webcam>(null); //bikin var webcamRef, isinya bisa berubah tapi ga re-render (tampilan kamera), tipe data harus webcam, isi awal null
  const [photo, setPhoto] = useState<string | null>(null); //bikin variabel photo yang isinya bisa berubah pakai fungsi setPhoto, tipe data bisa string atau null, isi awal null
  const takePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
    }
  };

  return (
    <div className="flex flex-row min-w-screen min-h-screen pt-10 bg-white">
      <div className="relative w-full h-full flex justify-center">
        <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/png"
        className="object-cover"/>
        <button 
        onClick={takePhoto}
        className="absolute bottom-10 z-10 bg-black text-white rounded-full px-4 py-2 hover:bg-gray-300 hover:text-black">Snapshoot</button>
      </div>

      <div className="w-full h-full m-0 p-0 flex justify-center">
        {!photo && (
          <p className="text-black">Belum ada foto</p>
        )}
        {photo && (
          <img
          src={photo}
          alt="photo"
          className="object-cover"/>
        )}
      </div>
    </div>
  );
}
