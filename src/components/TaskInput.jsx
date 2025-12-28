import React, { useState } from 'react';

function TaskInput({ onAdd }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-10">
            <div className="flex gap-4">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What needs to be done?"
                    className="glass-input flex-1 text-lg"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Task
                </button>
            </div>
        </form>
    );
}

export default TaskInput;
