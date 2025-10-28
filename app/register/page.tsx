"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        alert("Registration successful!");
        router.push("/login");

        } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
            setError("This email is already registered. Please use a different one or log in.");
        } else if (err.code === "auth/invalid-email") {
            setError("Invalid email format. Please check again.");
        } else {
            setError("Registration failed. Please try again.");
        }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-black">
        <h1 className="text-3xl font-bold mb-6 text-white">Register</h1>

        <form
            onSubmit={handleRegister}
            className="flex flex-col gap-4 w-[300px] p-10 border border-white rounded-xl"
        >
            <input
            type="text"
            placeholder="Full Name"
            className="border px-3 py-2 rounded text-white border border-white rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
            <input
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
            Register
            </button>
        </form>

        <p className="mt-4 text-sm text-white">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 underline">
            Login here
            </a>
        </p>
        </div>
    );
}
