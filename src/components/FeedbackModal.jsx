import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function FeedbackModal({ isOpen, onClose }) {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                text: text.trim(),
                uid: currentUser.uid,
                email: currentUser.email,
                createdAt: serverTimestamp()
            });
            setText('');
            onClose();
            // Optional: Add toast or alert here
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="glass-panel w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-white mb-2">Share Feedback</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Have a suggestion? We'd love to hear from you.
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="glass-input w-full h-32 resize-none mb-4"
                        placeholder="Type your suggestion here..."
                        autoFocus
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white px-4 py-2 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!text.trim() || isSubmitting}
                            className="glass-button disabled:opacity-50"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackModal;
