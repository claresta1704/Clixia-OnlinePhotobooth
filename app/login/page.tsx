"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/takephoto");
        } catch (err: any) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-black">
            <h1 className="text-3xl text-white font-bold mb-6">Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-[300px] p-10 border border-white rounded-xl">
                <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="Email"
                    className="border px-3 py-2 rounded text-white border border-white rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border px-3 py-2 rounded text-white border border-white rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold cursor-pointer"
                >
                    Login
                </button>
            </form>
            <p className="mt-4 text-sm text-white">
                Don’t have an account?{" "}
                <a href="/register" className="text-blue-600 underline">
                    Register here
                </a>
            </p>
        </div>
    );
}
