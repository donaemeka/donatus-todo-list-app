import React from 'react';

function UserProfile({ user, onSignOut, onBack }) {
    const creationTime = user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="glass-panel p-8 w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5"
                    title="Back to Tasks"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-emerald-400">
                    User Profile
                </h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Email</label>
                    <div className="text-lg text-slate-200">{user.email}</div>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">User ID</label>
                    <div className="text-sm font-mono text-slate-400 truncate bg-black/20 p-2 rounded-lg">
                        {user.uid}
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Member Since</label>
                    <div className="text-slate-300">{creationTime}</div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
                <button
                    onClick={onSignOut}
                    className="w-full glass-button bg-red-900/50 hover:bg-red-800/50 border-red-500/30 text-red-200 hover:text-white"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default UserProfile;
