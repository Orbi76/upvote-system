import React, { useState, useEffect } from "react";
import { ideaAPI } from "../services/api";

export default function AdminDashboard() {
    const [pendingIdeas, setPendingIdeas] = useState([]);
    const [approvedIdeas, setApprovedIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Ötletek betöltése
    const loadIdeas = async () => {
        setLoading(true);
        setError("");
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                ideaAPI.getPending(),
                ideaAPI.getApproved(),
            ]);
            setPendingIdeas(pendingRes.data);
            setApprovedIdeas(approvedRes.data);
        } catch (err) {
            setError("Nem sikerült betölteni az ötleteket.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIdeas();
    }, []);

    // Jóváhagyás
    const handleApprove = async (ideaId) => {
        try {
            await ideaAPI.approve(ideaId);
            alert("Ötlet jóváhagyva!");
            loadIdeas(); // Újratöltés
        } catch (err) {
            alert("Hiba történt a jóváhagyás során.");
        }
    };

    // Törlés
    const handleDelete = async (ideaId) => {
        if (!window.confirm("Biztosan törlöd ezt az ötletet?")) return;

        try {
            await ideaAPI.delete(ideaId);
            alert("Ötlet törölve!");
            loadIdeas(); // Újratöltés
        } catch (err) {
            alert("Hiba történt a törlés során.");
        }
    };

    const totalVotes = approvedIdeas.reduce((sum, idea) => sum + idea.votes, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="text-lg">Betöltés...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 text-red-700 rounded">
                {error}
                <button
                    onClick={loadIdeas}
                    className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                    Újra
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Felület</h1>
                <button
                    onClick={loadIdeas}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    🔄 Frissítés
                </button>
            </div>

            {/* Engedélyre váró ötletek */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
                    Engedélyre váró ötletek ({pendingIdeas.length})
                </h2>

                {pendingIdeas.length === 0 ? (
                    <p className="text-gray-600">Nincs engedélyre váró ötlet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingIdeas.map((idea) => (
                            <div
                                key={idea.id}
                                className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-lg font-bold mb-2">{idea.title}</h3>
                                    <p className="text-gray-700 mb-2">{idea.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Létrehozva: {new Date(idea.createdAt).toLocaleString('hu-HU')}
                                    </p>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={() => handleApprove(idea.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        ✅ Engedélyez
                                    </button>
                                    <button
                                        onClick={() => handleDelete(idea.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        ❌ Töröl
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Elfogadott ötletek és szavazások állása */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-green-700">
                    Elfogadott ötletek és szavazatok állása ({approvedIdeas.length})
                </h2>

                {approvedIdeas.length === 0 ? (
                    <p className="text-gray-600">Még nincs elfogadott ötlet.</p>
                ) : (
                    <>
                        <p className="text-gray-700 mb-4 text-lg">
                            Összes szavazat: <strong>{totalVotes}</strong>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {approvedIdeas
                                .sort((a, b) => b.votes - a.votes) // Szavazatok szerint rendezés
                                .map((idea) => (
                                    <div
                                        key={idea.id}
                                        className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <h3 className="text-lg font-bold mb-2">{idea.title}</h3>
                                            <p className="text-gray-700 mb-3">{idea.description}</p>
                                            <p className="text-sm text-gray-500 mb-2">
                                                Létrehozva: {new Date(idea.createdAt).toLocaleString('hu-HU')}
                                            </p>
                                            <p className="font-medium text-blue-600 text-xl">
                                                👍 {idea.votes} szavazat
                                            </p>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => handleDelete(idea.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                🗑️ Törlés
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}