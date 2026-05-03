import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole, getUserProfile, createUserProfile } from '../services/marketplaceService';
import { ArrowRight, LogIn, ChevronLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

interface OnboardingProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function Onboarding({ onRoleSelect }: OnboardingProps) {
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        console.log("Admin login popup closed by user");
      } else {
        console.error("Admin login error:", e);
        alert("Admin login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      const p = await getUserProfile(user.uid);
      if (!p) {
        await createUserProfile({
          uid: user.uid,
          name: user.displayName || 'Customer',
          email: user.email || '',
          role: 'CUSTOMER',
          isActive: true
        });
      }
      onRoleSelect('CUSTOMER');
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        console.log("Customer login popup closed by user");
      } else {
        console.error("Customer login error:", e);
        alert("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, adminCreds.email, adminCreds.password);
    } catch (e) {
      alert("Admin login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (showAdminLogin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex flex-col p-8 bg-[#1A1A1A]">
        <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 mb-8 flex items-center gap-2"><ChevronLeft /> Back</button>
        <h2 className="text-2xl font-bold mb-6">Admin Secure Login</h2>
        <form onSubmit={handleAdminEmailLogin} className="flex flex-col gap-4">
          <input 
            className="bg-[#2A2A2A] border border-gray-700 p-4 rounded-xl" 
            placeholder="admin@kaushalya.in"
            value={adminCreds.email}
            onChange={e => setAdminCreds({...adminCreds, email: e.target.value})}
          />
          <input 
            type="password"
            className="bg-[#2A2A2A] border border-gray-700 p-4 rounded-xl" 
            placeholder="Password"
            value={adminCreds.password}
            onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
          />
          <button 
            disabled={loading}
            className="bg-[#FF6600] py-4 rounded-xl font-bold text-xl mt-4 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col"
    >
      <div className="bg-[#003366] p-12 text-center flex flex-col items-center justify-center gap-2">
        <h1 className="text-[#FF6600] text-5xl font-bold tracking-tighter">KK</h1>
        <h2 className="text-xl font-bold">Kaushalya-Karnataka</h2>
        <p className="text-gray-300 text-sm italic">Your Skill, Your Business</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 bg-[#2A2A2A]">
        <p className="text-xl text-gray-400 font-medium">Who are you?</p>
        
        <button 
          disabled={loading}
          onClick={() => onRoleSelect('WORKER')}
          className="w-full py-6 text-2xl font-bold border-2 border-gray-600 rounded-2xl hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
        >
          I am a Worker
        </button>

        <button 
          disabled={loading}
          onClick={handleCustomerLogin}
          className="w-full py-6 text-2xl font-bold border-2 border-gray-600 rounded-2xl hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "I am a Customer"}
        </button>

        <button 
          onClick={() => setShowAdminLogin(true)}
          className="mt-4 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
        >
          Admin login <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
