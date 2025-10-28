"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      
      {/* Tombol Login dan Register di pojok kanan atas */}
      <div className="absolute top-6 right-6 flex gap-4">
        <Link href="/login">
          <button className="px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-4 py-2 rounded-full border border-white hover:bg-white hover:text-black font-semibold">
            Register
          </button>
        </Link>
      </div>

      {/* Teks utama di tengah */}
      <div className="text-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-blue-400">Clixia</span>!
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-10">
          Capture your memory with us!
        </p>

        <Link href="/login">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}
