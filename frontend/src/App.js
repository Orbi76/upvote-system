import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VoterDashboard from "./components/VoterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import IdeaForm from "./components/IdeaForm";
import { authAPI } from "./services/api";

export default function App() {
    const [user, setUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    // Debug - nézd meg, mi a user állapot
    useEffect(() => {
        console.log("👤 Current user state:", user);
    }, [user]);

    const handleRegister = (newUser) => {
        console.log("📝 Register - Setting user:", newUser);
        setUser(newUser);
        setShowRegister(false);
    };

    const handleLogin = (loggedInUser) => {
        console.log("🔐 Login - Setting user:", loggedInUser);
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        console.log("👋 Logout");
        authAPI.clearAuth();
        setUser(null);
    };

    // Ha nincs user, mutasd a login/register formot
    if (!user) {
        console.log("🚫 No user - showing login/register");
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">
                        Upvote Rendszer
                    </h1>
                    <p className="text-gray-600">
                        Oszd meg ötleteid és szavazz mások javaslataira!
                    </p>
                </div>

                {showRegister ? (
                    <RegisterForm
                        onRegister={handleRegister}
                        setShowRegister={setShowRegister}
                    />
                ) : (
                    <LoginForm
                        onLogin={handleLogin}
                        setShowRegister={setShowRegister}
                    />
                )}
            </div>
        );
    }

    // Admin nézet
    if (user.role === "admin") {
        console.log("👑 Rendering admin dashboard");
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-gray-800 text-white flex justify-between items-center p-4 shadow-lg">
                    <div>
                        <h1 className="text-xl font-semibold">Admin Panel</h1>
                        <p className="text-sm text-gray-300">Üdv, {user.username}!</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Kijelentkezés
                    </button>
                </header>

                <AdminDashboard />
            </div>
        );
    }

    // User nézet
    console.log("👤 Rendering user dashboard");
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white flex justify-between items-center p-4 shadow-lg">
                <div>
                    <h1 className="text-xl font-semibold">Upvote Rendszer</h1>
                    <p className="text-sm text-blue-100">Üdv, {user.username}!</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Kijelentkezés
                </button>
            </header>

            <main className="p-4">
                <IdeaForm />
                <VoterDashboard />
            </main>
        </div>
    );
}