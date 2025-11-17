import React, { useState } from "react";
import { authAPI } from "../services/api";

export default function LoginForm({ onLogin, setShowRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        console.log("🔍 Login attempt:", { username });  // ⬅️ DEBUG


        if (!username || !password) {
            setError("Töltsd ki mindkét mezőt!");
            return;
        }

        setLoading(true);

        try {
            // Basic Auth beállítása
            console.log("📤 Setting auth...");  // ⬅️ DEBUG
            authAPI.setAuth(username, password);

            // User info lekérése
            console.log("📤 Getting current user...");  // ⬅️ DEBUG
            const response = await authAPI.getCurrentUser();

            console.log("✅ User response:", response.data);  // ⬅️ DEBUG
            const userData = response.data;

            // User objektum összeállítása
            const user = {
                username: userData.username,
                email: userData.email,
                roles: userData.roles,
                role: userData.roles.includes("ROLE_ADMIN") ? "admin" : "user",
            };

            console.log("✅ Calling onLogin with:", user);  // ⬅️ DEBUG
            onLogin(user);
        } catch (err) {

            console.error("❌ Login error:", err);  // ⬅️ DEBUG
            console.error("❌ Error response:", err.response);  // ⬅️ DEBUG
            authAPI.clearAuth();
            if (err.response?.status === 401) {
                setError("Hibás felhasználónév vagy jelszó!");
            } else {
                setError("Hiba történt a bejelentkezés során.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleLogin}
            className="flex flex-col w-full max-w-sm bg-white p-6 rounded shadow mx-auto mt-10"
        >
            <h2 className="text-xl font-bold mb-4 text-center">Bejelentkezés</h2>

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
                autoComplete="username"
                required
            />

            <input
                type="password"
                placeholder="Jelszó"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-4 rounded"
                autoComplete="current-password"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded transition ${
                    loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
                {loading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>

            <p className="text-center mt-4 text-sm">
                Nincs még fiókod?{" "}
                <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="text-blue-500 underline hover:text-blue-700"
                >
                    Regisztrálj itt
                </button>
            </p>
        </form>
    );
}