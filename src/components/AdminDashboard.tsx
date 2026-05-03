import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Review, getFlaggedReviews, getAllWorkers, toggleUserStatus, flagReview } from '../services/marketplaceService';
import { Shield, Users, Flag, LogOut, Check, X, Star } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function AdminDashboard({ profile, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'WORKERS' | 'REVIEWS'>('WORKERS');
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'WORKERS') {
      const w = await getAllWorkers();
      setWorkers(w);
    } else {
      const r = await getFlaggedReviews();
      setFlaggedReviews(r);
    }
    setLoading(false);
  };

  const handleToggleWorker = async (uid: string, current: boolean) => {
    await toggleUserStatus(uid, !current);
    loadData();
  };

  const handleResolveReview = async (reviewId: string) => {
    // Unflag it
    await updateDoc(doc(db, "reviews", reviewId), { flagged: false });
    loadData();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A]">
      <header className="bg-[#003366] p-4 flex justify-between items-center text-white sticky top-0 z-10 border-b border-[#FF6600]/30">
        <div className="flex items-center gap-2">
          <Shield className="text-[#FF6600]" />
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-white"><LogOut size={20} /></button>
      </header>

      <div className="flex p-2 bg-[#2A2A2A]">
        <button 
          onClick={() => setActiveTab('WORKERS')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'WORKERS' ? 'bg-[#FF6600] text-white' : 'text-gray-500'}`}
        >
          <Users size={18} /> Workers
        </button>
        <button 
          onClick={() => setActiveTab('REVIEWS')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'REVIEWS' ? 'bg-[#FF6600] text-white' : 'text-gray-500'}`}
        >
          <Flag size={18} /> Flagged
        </button>
      </div>

      <main className="flex-1 p-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500 italic">Syncing with source...</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {activeTab === 'WORKERS' ? (
              workers?.map(w => (
                <div key={w.uid} className="bg-[#2A2A2A] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center font-bold">{w.name?.charAt(0) || '?'}</div>
                    <div>
                      <h4 className="font-bold">{w.name || 'Unknown Worker'}</h4>
                      <p className="text-xs text-gray-400">{w.tradeCategory} • {w.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleWorker(w.uid, w.isActive ?? true)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${w.isActive === false ? 'bg-red-900 text-red-100 border border-red-500' : 'bg-green-900 text-green-100 border border-green-500'}`}
                  >
                    {w.isActive === false ? 'DISABLED' : 'ACTIVE'}
                  </button>
                </div>
              ))
            ) : (
              flaggedReviews?.map(r => (
                <div key={r.id} className="bg-[#2A2A2A] p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-[#FF6600] text-[#FF6600]' : 'text-gray-600'} />)}
                    </div>
                    <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">FLAGGED</span>
                  </div>
                  <p className="text-sm border-l-2 border-gray-700 pl-3 py-1 italic">"{r.comment}"</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] text-gray-500">By {r.customerName || 'Unknown'} for worker ID: {r.workerId?.slice(0, 8) || 'unknown'}...</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleResolveReview(r.id)} className="p-2 bg-green-900 text-green-300 rounded-lg hover:bg-green-800 transition-all"><Check size={16}/></button>
                      <button className="p-2 bg-red-900 text-red-300 rounded-lg hover:bg-red-800 transition-all"><X size={16}/></button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {((activeTab === 'WORKERS' && workers.length === 0) || (activeTab === 'REVIEWS' && flaggedReviews.length === 0)) && (
              <div className="text-center text-gray-600 mt-10 italic">No items found in this category.</div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
