import React, { useState, useEffect } from "react";
import { ideaAPI } from "../services/api";

export default function VoterDashboard() {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [votingFor, setVotingFor] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);  // ⬅️ ÚJ STATE
    const [votedIdeaTitle, setVotedIdeaTitle] = useState("");  // ⬅️ ÚJ STATE

    const loadIdeas = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await ideaAPI.getApproved();
            setIdeas(response.data);
        } catch (err) {
            setError("Nem sikerült betölteni az ötleteket.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIdeas();
    }, []);

    const handleVote = async (ideaId, ideaTitle) => {
        if (hasVoted) {
            alert(`Már szavaztál! (${votedIdeaTitle})`);
            return;
        }

        setVotingFor(ideaId);
        try {
            const response = await ideaAPI.vote(ideaId);

            // Frissítjük a szavazatot a listában
            setIdeas(ideas.map(idea =>
                idea.id === ideaId ? response.data : idea
            ));

            // Beállítjuk, hogy már szavazott
            setHasVoted(true);
            setVotedIdeaTitle(ideaTitle);

            alert(`Szavazatod leadva erre az ötletre: "${ideaTitle}"!`);
        } catch (err) {
            if (err.response?.status === 409) {
                // Backend visszaadja, melyik ötletre szavazott
                const errorMsg = err.response?.data?.message || "Már szavaztál ebben a sessionben!";
                setHasVoted(true);

                // Próbáljuk kinyerni az ötlet címét a hibaüzenetből
                const match = errorMsg.match(/Már szavaztál erre az ötletre: (.+)/);
                if (match) {
                    setVotedIdeaTitle(match[1]);
                }

                alert(errorMsg);
            } else if (err.response?.status === 404) {
                alert("Az ötlet nem található!");
            } else {
                alert("Hiba történt a szavazás során.");
            }
        } finally {
            setVotingFor(null);
        }
    };

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

    if (ideas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Nincsenek még elfogadott ötletek
                </h2>
                <p className="text-gray-500">Várj, amíg az admin jóváhagyja az ötleteket.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Szavazásra bocsátott ötletek</h2>
                <div className="flex gap-2 items-center">
                    {hasVoted && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Szavaztál: {votedIdeaTitle}
                        </span>
                    )}
                    <button
                        onClick={loadIdeas}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                        🔄 Frissítés
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea) => (
                    <div
                        key={idea.id}
                        className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                            <p className="text-gray-600 mb-2">{idea.description}</p>
                            <p className="text-sm text-gray-500">
                                Létrehozva: {new Date(idea.createdAt).toLocaleString('hu-HU')}
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-gray-700 font-medium text-lg">
                                👍 {idea.votes} szavazat
                            </span>
                            <button
                                onClick={() => handleVote(idea.id, idea.title)}
                                disabled={hasVoted || votingFor === idea.id}
                                className={`px-4 py-2 rounded transition ${
                                    hasVoted
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : votingFor === idea.id
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                            >
                                {hasVoted
                                    ? "Már szavaztál"
                                    : votingFor === idea.id
                                        ? "Szavazás..."
                                        : "Szavazok"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}