import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Login from './components/Login';
import FeedbackModal from './components/FeedbackModal';
import UserProfile from './components/UserProfile';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

function DatabaseApp() {
  const [tasks, setTasks] = useState([]);
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [view, setView] = useState('tasks'); // tasks, profile

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      // If error is permission-denied, it might be due to missing indexes or rules
    });

    return unsubscribe;
  }, [currentUser]);

  const addTask = async (text) => {
    if (!currentUser) return;
    try {
      console.log(`Attempting to add task for user ${currentUser.uid}: ${text}`);
      await addDoc(collection(db, 'tasks'), {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        uid: currentUser.uid
      });
      console.log("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await updateDoc(doc(db, 'tasks', id), {
        completed: !task.completed
      });
    } catch (error) {
      console.error("Error updating task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  const clearCompleted = async () => {
    const batch = writeBatch(db);
    const completedTasks = tasks.filter(t => t.completed);

    if (completedTasks.length === 0) return;

    completedTasks.forEach(task => {
      const docRef = doc(db, 'tasks', task.id);
      batch.delete(docRef);
    });

    try {
      await batch.commit();
      console.log("Cleared completed tasks");
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  if (view === 'profile') {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-0 flex flex-col items-center">
        <UserProfile
          user={currentUser}
          onSignOut={logout}
          onBack={() => setView('tasks')}
        />
        <footer className="text-center text-slate-500 text-sm mt-12 pb-4">
          <p>© 2025 Donatus Emeka Anyalebechi. Built with React & Tailwind CSS.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-0">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-emerald-400 drop-shadow-sm">
              MyDay 🎄
            </h1>
            <p className="text-slate-300 text-sm max-w-md">
              A private, cloud-synced to-do list for managing daily tasks.
            </p>
            <p className="text-slate-400 font-medium">
              {currentUser.email} • {tasks.length > 0
                ? `${completedCount} of ${tasks.length} tasks completed`
                : 'Ready to organize your day?'}
            </p>
          </div>
          <button
            onClick={() => setView('profile')}
            className="text-right group"
          >
            <div className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors">
              {currentUser.email}
            </div>
            <div className="text-xs text-slate-500 group-hover:text-emerald-500/70 transition-colors uppercase tracking-wider">
              View Profile
            </div>
          </button>
        </div>

        {/* Main Content */}
        <div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 relative z-10">
            <div className="flex-1 w-full">
              <TaskInput onAdd={addTask} />
            </div>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="glass-button bg-slate-700 hover:bg-slate-600 shadow-none border border-white/10 h-[52px] w-full sm:w-auto whitespace-nowrap"
              title="Share Feedback"
            >
              Feedback
            </button>
          </div>

          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
          />

          {loading ? (
            <div className="text-center text-slate-500 py-10">Loading your tasks...</div>
          ) : (
            <>
              {/* Filters */}
              {tasks.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2">
                  <div className="flex p-1 bg-slate-800/50 rounded-lg border border-white/5">
                    {['all', 'active', 'completed'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${filter === f
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {completedCount > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Clear Completed
                    </button>
                  )}
                </div>
              )}

              <TaskList
                tasks={filteredTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            </>
          )}
        </div>
      </div>

      <footer className="text-center text-slate-500 text-sm mt-12 pb-4">
        <p>© 2025 Donatus Emeka Anyalebechi. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  return currentUser ? <DatabaseApp /> : <Login />;
}

export default App;
