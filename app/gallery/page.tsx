"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function GalleryPage() {
    const [photos, setPhotos] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("gallery") || "[]");
        setPhotos(stored);
    }, []);

    const deletePhoto = (index: number) => {
        const updated = photos.filter((_, i) => i !== index);
        setPhotos(updated);
        localStorage.setItem("gallery", JSON.stringify(updated));
    };

    const downloadPhoto = (src: string) => {
        const link = document.createElement("a");
        link.href = src;
        link.download = "gallery_photo.png";
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
        <Link href="/takephoto">
            <img
            src="/arrow-back.png"
            alt="back"
            className="absolute z-50 top-6 right-10 dark:invert object-cover w-[40px] h-[40px]"
            />
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-white">My Gallery</h1>
        {photos.length === 0 ? (
            <p className="text-gray-500">Belum ada foto di galeri.</p>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((src, i) => (
                <img
                key={i}
                src={src}
                alt={`photo-${i}`}
                className="w-full h-40 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-all duration-200 shadow-md"
                onClick={() => setSelected(src)}
                />
            ))}
            </div>
        )}

        {selected && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="relative text-center">
                <img
                src={selected}
                alt="Selected"
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
                />
                <div className="flex justify-center gap-4 mt-4">
                <button
                    onClick={() => downloadPhoto(selected)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
                >
                    Download
                </button>
                <button
                    onClick={() => {
                    const index = photos.findIndex((p) => p === selected);
                    deletePhoto(index);
                    setSelected(null);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                >
                    Hapus
                </button>
                <button
                    onClick={() => setSelected(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700"
                >
                    Tutup
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}
