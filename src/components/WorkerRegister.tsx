import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { createUserProfile, getUserProfile } from '../services/marketplaceService';
import { ChevronLeft } from 'lucide-react';

interface WorkerRegisterProps {
  onComplete: () => void;
  onBack: () => void;
}

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Painter", "Mechanic"];

export default function WorkerRegister({ onComplete, onBack }: WorkerRegisterProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tradeCategory: CATEGORIES[0],
    locality: ''
  });
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      const p = await getUserProfile(user.uid);
      if (p) {
        onComplete();
      } else {
        // If no profile, they need to fill the registration form
        // We set the email and name from google
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: user.email || ''
        }));
        setIsLogin(false);
      }
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        alert("Google sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onComplete();
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(user, { displayName: formData.name });
        await createUserProfile({
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role: 'WORKER',
          tradeCategory: formData.tradeCategory,
          locality: formData.locality,
          isActive: true
        });
        onComplete();
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Try signing in.");
        setIsLogin(true);
      } else {
        alert(isLogin ? "Sign in failed. Check credentials." : "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -300, opacity: 0 }}
      className="min-h-screen flex flex-col p-6 gap-6 bg-[#2A2A2A]"
    >
      <header className="flex items-center gap-4 text-white bg-[#003366] -mx-6 -mt-6 p-6 mb-4">
        <button onClick={onBack}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">{isLogin ? "Worker Login" : "Create Worker Account"}</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Full name</label>
            <input 
              required
              className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6600]"
              placeholder="Raju Kumar"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Email</label>
          <input 
            required
            type="email"
            className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6600]"
            placeholder="raju@email.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Password</label>
          <input 
            required
            type="password"
            className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6600]"
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>

        {!isLogin && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Trade category</label>
              <select 
                className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6600]"
                value={formData.tradeCategory}
                onChange={e => setFormData({...formData, tradeCategory: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Your locality</label>
              <input 
                required
                className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6600]"
                placeholder="Mysuru, Karnataka"
                value={formData.locality}
                onChange={e => setFormData({...formData, locality: e.target.value})}
              />
            </div>
          </>
        )}

        <button 
          disabled={loading}
          className="mt-6 py-4 bg-[#FF6600] text-white rounded-2xl text-2xl font-bold hover:bg-[#E65C00] transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
        </button>

        <div className="flex flex-col items-center gap-4 mt-4">
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
          
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-500 text-xs uppercase">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-[#333] border border-gray-600 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-[#444] transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </form>
    </motion.div>
  );
}
