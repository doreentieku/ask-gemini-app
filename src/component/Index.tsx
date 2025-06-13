'use client';
import { useState } from 'react';

// Main App component
export default function Index() {
    // State variables to manage the component's data and UI
    const [question, setQuestion] = useState("Generate a limerick about flying. Make it melancholy and forgetfulnes but a little charming"); // Holds the user's question
    const [answer, setAnswer] = useState(""); // Holds the API's response
    const [isLoading, setIsLoading] = useState(false); // Tracks loading state
    const [error, setError] = useState<string | null>(null); // Holds any error messages

    // --- Handler for form submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true); // Set loading to true while fetching data
        setError(null); // Clear previous errors
        setAnswer(""); // Clear previous answer

        // --- API Key ---
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        // Updated check for the environment variable.
        if (!apiKey) {
            setError("API key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file.");
            setIsLoading(false);
            return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_GEMINI_API_URL}key=${apiKey}`;

        // --- Request Payload ---
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: question,
                        },
                    ],
                },
            ],
        };

        try {
            // --- Making the API Call ---
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Handle non-2xx responses
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // --- Extracting and Setting the Answer ---
            // Safely access the text from the response
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                setAnswer(text);
            } else {
                setAnswer("No content received from the API.");
            }

        } catch (err) {
            // --- Error Handling ---
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
            console.error("API call failed:", err);
        } finally {
            // --- Resetting Loading State ---
            setIsLoading(false);
        }
    };

    // --- Render the Component ---
    return (
        <div className="bg-gray-900 min-h-screen flex flex-col font-sans text-white pb-10">
            <div className="flex-grow w-full max-w-6xl mx-auto p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-teal-400">Ask anything!</h1>
                </div>

                {/* --- Display Area for the Answer --- */}
                {answer && (
                    <div className="p-6 mt-6 bg-gray-700/50 border border-gray-600 rounded-lg">
                        <h2 className="text-2xl font-semibold text-teal-300 mb-3">Answer:</h2>
                        <div
                            className="prose prose-invert max-w-none text-gray-300 space-y-4"
                            dangerouslySetInnerHTML={{
                                __html: answer.replace(/\n/g, '<br />'),
                            }}
                        />
                    </div>
                )}

                {/* --- Display Area for Errors --- */}
                {error && (
                    <div className="p-4 mt-4 text-sm text-red-300 bg-red-900/50 border border-red-500/50 rounded-lg">
                        <p className="font-semibold">An error occurred:</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* --- Sticky Form at Bottom --- */}
            <div className="sticky bottom-0 w-full max-w-6xl mx-auto px-8 py-6 rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="question-input" className="sr-only">Your Question</label>
                        <input
                            id="question-input"
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="hey"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 font-bold text-gray-900 bg-teal-400 rounded-lg hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-400 transition-transform transform hover:scale-105"
                    >
                        {isLoading ? 'Thinking...' : 'Ask'}
                    </button>
                </form>
            </div>
        </div>
    );

}
