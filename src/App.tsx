/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, createUserProfile, UserProfile } from './services/marketplaceService';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import WorkerDashboard from './components/WorkerDashboard';
import CustomerMarketplace from './components/CustomerMarketplace';
import AdminDashboard from './components/AdminDashboard';
import WorkerRegister from './components/WorkerRegister';
import { AnimatePresence, motion } from 'motion/react';

export type Screen = 
  | 'SPLASH' 
  | 'ONBOARDING' 
  | 'WORKER_REGISTER'
  | 'CUSTOMER_REGISTER'
  | 'WORKER_DASH' 
  | 'CUSTOMER_MARKET' 
  | 'ADMIN_DASH';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    let profileUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (u) {
        const { onSnapshot, doc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        
        profileUnsub = onSnapshot(doc(db, 'users', u.uid), (docSnap) => {
          if (docSnap.exists()) {
            const p = docSnap.data() as UserProfile;
            setProfile(p);
            if (p.role === 'WORKER') setCurrentScreen('WORKER_DASH');
            else if (p.role === 'ADMIN') setCurrentScreen('ADMIN_DASH');
            else setCurrentScreen('CUSTOMER_MARKET');
          } else {
            setCurrentScreen('ONBOARDING');
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setCurrentScreen('ONBOARDING');
        setLoading(false);
      }
    });

    return () => {
      unsub();
      if (profileUnsub) profileUnsub();
      clearTimeout(splashTimer);
    };
  }, []);

  if (loading) return <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white font-sans overflow-x-hidden max-w-md mx-auto relative shadow-2xl">
      {showSplash && <SplashScreen />}
      <AnimatePresence mode="wait">
        {currentScreen === 'ONBOARDING' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Onboarding onRoleSelect={(role) => setCurrentScreen(role === 'WORKER' ? 'WORKER_REGISTER' : 'CUSTOMER_MARKET')} />
          </motion.div>
        )}
        {currentScreen === 'WORKER_REGISTER' && (
          <motion.div key="worker-reg" initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
            <WorkerRegister onComplete={() => setCurrentScreen('WORKER_DASH')} onBack={() => setCurrentScreen('ONBOARDING')} />
          </motion.div>
        )}
        {currentScreen === 'WORKER_DASH' && profile && (
          <motion.div key="worker-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WorkerDashboard profile={profile} onLogout={() => auth.signOut()} />
          </motion.div>
        )}
        {currentScreen === 'CUSTOMER_MARKET' && (
          <motion.div key="customer-market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CustomerMarketplace user={user} profile={profile} onLogout={() => auth.signOut()} onAuthRequired={() => setCurrentScreen('ONBOARDING')} />
          </motion.div>
        )}
        {currentScreen === 'ADMIN_DASH' && profile && (
          <motion.div key="admin-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard profile={profile} onLogout={() => auth.signOut()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
