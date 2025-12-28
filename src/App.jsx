import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Login from './components/Login';
import FeedbackModal from './components/FeedbackModal';
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
  serverTimestamp
} from 'firebase/firestore';

function DatabaseApp() {
  const [tasks, setTasks] = useState([]);
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-0">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-pink-300 drop-shadow-sm">
              The Daily Task Flow
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
            onClick={logout}
            className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1 transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div>
          <div className="flex items-center gap-2 mb-8 relative z-10">
            <div className="flex-1">
              <TaskInput onAdd={addTask} />
            </div>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="glass-button bg-slate-700 hover:bg-slate-600 shadow-none border border-white/10 h-[52px] whitespace-nowrap"
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
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
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
