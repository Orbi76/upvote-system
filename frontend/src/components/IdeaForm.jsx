import React, { useState } from "react";
import { ideaAPI } from "../services/api";

export default function IdeaForm({ onSubmitSuccess }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!title.trim() || !description.trim()) {
            setError("Töltsd ki mindkét mezőt!");
            return;
        }

        if (title.length > 200) {
            setError("A cím maximum 200 karakter lehet!");
            return;
        }

        if (description.length > 4000) {
            setError("A leírás maximum 4000 karakter lehet!");
            return;
        }

        setLoading(true);

        try {
            await ideaAPI.submit(title, description);
            setSuccess("Ötleted elküldve! Admin jóváhagyásra vár.");
            setTitle("");
            setDescription("");

            // Ha van callback, hívjuk meg
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (err) {
            if (err.response?.data) {
                const errors = err.response.data;
                if (typeof errors === "object") {
                    setError(Object.values(errors).join(", "));
                } else {
                    setError(errors);
                }
            } else {
                setError("Hiba történt az ötlet beküldése során.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-md bg-white p-6 rounded shadow mx-auto mb-6"
        >
            <h2 className="text-xl font-bold mb-4 text-center">Új ötlet beküldése</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                    {success}
                </div>
            )}

            <input
                type="text"
                placeholder="Ötlet címe (max. 200 karakter)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 mb-4 rounded"
                maxLength={200}
                required
            />

            <textarea
                placeholder="Ötlet leírása (max. 4000 karakter)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 mb-4 rounded min-h-[100px]"
                maxLength={4000}
                required
            />

            <div className="text-sm text-gray-600 mb-4">
                Cím: {title.length}/200 | Leírás: {description.length}/4000
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded transition ${
                    loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                }`}
            >
                {loading ? "Küldés..." : "Elküld"}
            </button>
        </form>
    );
}