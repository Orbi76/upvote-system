import React, { useState } from "react";
import { authAPI } from "../services/api";

export default function RegisterForm({ onRegister, setShowRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password || !email) {
            setError("Töltsd ki az összes mezőt!");
            return;
        }

        if (password.length < 6) {
            setError("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
            return;
        }

        setLoading(true);

        try {
            // Regisztráció
            await authAPI.register(username, password, email);

            // Automatikus bejelentkezés
            authAPI.setAuth(username, password);
            const response = await authAPI.getCurrentUser();
            const userData = response.data;

            const user = {
                username: userData.username,
                email: userData.email,
                roles: userData.roles,
                role: "user",
            };

            onRegister(user);
        } catch (err) {
            if (err.response?.status === 409) {
                setError("Ez a felhasználónév vagy email már foglalt!");
            } else if (err.response?.data) {
                // Validációs hibák kezelése
                const errors = err.response.data;
                if (typeof errors === "object") {
                    setError(Object.values(errors).join(", "));
                } else {
                    setError(errors);
                }
            } else {
                setError("Hiba történt a regisztráció során.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleRegister}
            className="flex flex-col w-full max-w-sm bg-white p-6 rounded shadow mx-auto mt-10"
        >
            <h2 className="text-xl font-bold mb-4 text-center">Regisztráció</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            <input
                type="text"
                placeholder="Felhasználónév"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 mb-4 rounded"
                required
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 mb-4 rounded"
                required
            />

            <input
                type="password"
                placeholder="Jelszó (min. 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-4 rounded"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded transition ${
                    loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                }`}
            >
                {loading ? "Regisztráció..." : "Regisztráció"}
            </button>

            <p className="text-center mt-4 text-sm">
                Már van fiókod?{" "}
                <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="text-blue-500 underline hover:text-blue-700"
                >
                    Jelentkezz be
                </button>
            </p>
        </form>
    );
}