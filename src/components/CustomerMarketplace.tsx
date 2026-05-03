import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ServiceCard, getActiveWorkers, getWorkerServiceCards, createHireRequest, subscribeToCustomerRequests, HireRequest, updateRequestStatus, submitReview, getWorkerReviews, Review } from '../services/marketplaceService';
import { Search, Star, MapPin, ChevronLeft, LogOut, History, ShoppingBag, Send, Flag, ThumbsUp } from 'lucide-react';
import { User } from 'firebase/auth';

interface CustomerMarketplaceProps {
  user: User | null;
  profile: UserProfile | null;
  onLogout: () => void;
  onAuthRequired: () => void;
}

const CATEGORIES = ["All", "Electrician", "Plumber", "Carpenter", "Painter", "Mechanic"];

export default function CustomerMarketplace({ user, profile, onLogout, onAuthRequired }: CustomerMarketplaceProps) {
  const [view, setView] = useState<'SEARCH' | 'WORKER_DETAIL' | 'HISTORY' | 'RATE'>('SEARCH');
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<UserProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<UserProfile | null>(null);
  const [workerServices, setWorkerServices] = useState<ServiceCard[]>([]);
  const [workerReviews, setWorkerReviews] = useState<Review[]>([]);
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [ratingRequest, setRatingRequest] = useState<HireRequest | null>(null);

  useEffect(() => {
    loadWorkers();
    if (user) {
      const unsub = subscribeToCustomerRequests(user.uid, setRequests);
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    let w = workers || [];
    if (selectedCategory !== "All") w = w.filter(x => x.tradeCategory === selectedCategory);
    if (searchQuery) w = w.filter(x => x.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredWorkers(w);
  }, [selectedCategory, searchQuery, workers]);

  const loadWorkers = async () => {
    const w = await getActiveWorkers();
    setWorkers(w);
    setFilteredWorkers(w);
  };

  const handleWorkerSelect = async (worker: UserProfile) => {
    setSelectedWorker(worker);
    const s = await getWorkerServiceCards(worker.uid);
    const r = await getWorkerReviews(worker.uid);
    setWorkerServices(s);
    setWorkerReviews(r);
    setView('WORKER_DETAIL');
  };

  const handleHire = async (serviceName: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!selectedWorker) return;

    await createHireRequest({
      customerId: user.uid,
      workerId: selectedWorker.uid,
      customerName: profile?.name || user.displayName || 'Customer',
      workerName: selectedWorker.name,
      serviceName
    });
    alert("Hire request sent!");
    setView('HISTORY');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2A2A2A]">
      <header className="bg-[#003366] p-4 flex justify-between items-center text-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {view !== 'SEARCH' && <button onClick={() => setView('SEARCH')}><ChevronLeft /></button>}
          <h1 className="text-xl font-bold">{view === 'SEARCH' ? 'Find a Worker' : view === 'HISTORY' ? 'My requests' : selectedWorker?.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button 
                onClick={() => setView('HISTORY')} 
                className={`relative p-2 transition-all ${view === 'HISTORY' ? 'text-[#FF6600]' : 'text-gray-300'}`}
              >
                <History size={20} />
                {requests.filter(r => r.status === 'COMPLETED').length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6600] rounded-full" />}
              </button>
              <button onClick={onLogout} className="text-gray-300 hover:text-white"><LogOut size={20} /></button>
            </>
          ) : (
            <button onClick={onAuthRequired} className="text-sm font-bold bg-[#FF6600] px-3 py-1 rounded-full">Sign In</button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {view === 'SEARCH' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-500" size={18} />
                <input 
                  className="w-full bg-[#3A3A3A] border border-gray-600 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF6600]"
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(c => (
                  <button 
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-4 py-2 rounded-full border border-gray-600 whitespace-nowrap transition-all ${selectedCategory === c ? 'bg-[#003366] text-white border-[#003366]' : 'bg-[#3A3A3A] text-gray-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {filteredWorkers?.map(w => (
                  <button 
                    key={w.uid} 
                    onClick={() => handleWorkerSelect(w)}
                    className="bg-[#3A3A3A] p-4 rounded-3xl flex items-center gap-4 hover:bg-[#4A4A4A] transition-all text-left group"
                  >
                    <div className="w-14 h-14 bg-[#E5E7EB] rounded-full flex items-center justify-center text-[#003366] font-bold text-xl uppercase group-hover:scale-105 transition-transform">{w.name?.charAt(0) || '?'}{w.name?.split(' ').pop()?.charAt(0) || ''}</div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg">{w.name || 'Worker'}</h4>
                        <span className="text-xs bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full font-bold">{w.tradeCategory}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className={w.avgRating && w.avgRating > 0 ? "fill-[#FF6600] text-[#FF6600]" : "text-gray-600"} />
                        <span className="text-[#FF6600] font-bold text-sm">
                          {w.avgRating && w.avgRating > 0 ? w.avgRating : 'New'}
                        </span>
                        <span className="text-gray-500 text-sm italic ml-1">· {w.locality}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'WORKER_DETAIL' && selectedWorker && (
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#E5E7EB] rounded-full flex items-center justify-center text-[#003366] font-bold text-3xl">{selectedWorker.name?.charAt(0) || '?'}</div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold">{selectedWorker.name || 'Worker'}</h2>
                  <p className="text-gray-400">{selectedWorker.locality} · {selectedWorker.tradeCategory}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={16} className={selectedWorker.avgRating && selectedWorker.avgRating > 0 ? "fill-[#FF6600] text-[#FF6600]" : "text-gray-600"} />
                    <span className="text-[#FF6600] font-bold">
                      {selectedWorker.avgRating && selectedWorker.avgRating > 0 ? selectedWorker.avgRating : 'New'}
                    </span>
                    <span className="text-gray-500 text-sm">({selectedWorker.totalReviewCount || 0})</span>
                    <ThumbsUp size={14} className="ml-2 text-[#00FF00]" />
                    <span className="text-[#00FF00] text-sm ml-1">{selectedWorker.totalJobs || 0}</span>
                  </div>
                </div>
              </div>

              {selectedWorker.bio && (
                <div className="bg-[#3A3A3A] p-4 rounded-xl text-gray-300 italic border-l-4 border-[#FF6600]">
                  "{selectedWorker.bio}"
                </div>
              )}

              {selectedWorker.photos && selectedWorker.photos.length > 0 && (
                <section>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Work Samples</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {selectedWorker.photos.map((url, i) => (
                      <div key={i} className="min-w-[200px] aspect-[4/3] rounded-xl overflow-hidden border border-gray-700 bg-[#3A3A3A] flex-shrink-0">
                        <img src={url} alt={`Work ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">SERVICES</h3>
                <div className="flex flex-col gap-3">
                  {workerServices.map(s => (
                    <div key={s.id} className="bg-[#3A3A3A] p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{s.name}</h4>
                        <p className="text-sm text-gray-400">{s.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-[#1A1A1A] border border-gray-700 px-3 py-1 rounded-full text-[#00FF00] font-bold">
                          {s.priceType === 'Starting at' ? 'From ' : ''}₹{s.price}
                        </span>
                        <button 
                          onClick={() => handleHire(s.name)}
                          className="w-full mt-3 flex items-center justify-center gap-2 border-2 border-gray-600 p-3 rounded-xl font-bold hover:bg-[#4A4A4A] transition-all"
                        >
                          Hire me <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-10">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 underline">Recent Reviews</h3>
                <div className="flex flex-col gap-4">
                  {workerReviews.map(r => (
                    <div key={r.id} className="bg-[#3A3A3A] p-4 rounded-xl border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{r.customerName}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating ? 'fill-[#FF6600] text-[#FF6600]' : 'text-gray-600'} />)}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'HISTORY' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 ">
              <HistorySection title="COMPLETED" items={requests?.filter(r => r?.status === 'COMPLETED') || []} accentColor="#3B82F6" actions={(r) => (
                <div className="bg-[#3A3A3A] p-4 rounded-xl mt-3 border-2 border-dashed border-[#FF6600] relative">
                  <p className="text-xs text-gray-400 mb-2">Worker has completed the job!</p>
                  <button 
                    onClick={() => { setRatingRequest(r); setView('RATE'); }}
                    className="w-full bg-[#FF6600] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 animate-bounce"
                  >
                    Rate this job <Send size={18} />
                  </button>
                </div>
              )} />
              <HistorySection title="REVIEWED" items={requests?.filter(r => r?.status === 'REVIEWED') || []} accentColor="#00FF00" />
              <HistorySection title="ACCEPTED — IN PROGRESS" items={requests?.filter(r => r?.status === 'ACCEPTED') || []} accentColor="#EAB308" footer="Worker is on the way or starting the job" />
              <HistorySection title="PENDING" items={requests?.filter(r => r?.status === 'PENDING') || []} accentColor="#FF6600" footer="Waiting for worker to respond to your request" />
              <HistorySection title="DECLINED" items={requests?.filter(r => r?.status === 'DECLINED') || []} accentColor="#EF4444" />
            </motion.div>
          )}

          {view === 'RATE' && ratingRequest && (
            <RateView request={ratingRequest} onComplete={() => setView('HISTORY')} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function HistorySection({ title, items, actions, accentColor, footer }: { title: string, items: HireRequest[], actions?: (r: any) => any, accentColor: string, footer?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
      {items?.map(r => (
        <div key={r.id} className="bg-[#3A3A3A] p-4 rounded-xl border-l-[6px]" style={{ borderColor: accentColor }}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg">{r.workerName || 'Worker'}</h4>
              <p className="text-gray-400 text-sm">{r.serviceName} • {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
            </div>
            <span className="bg-[#1A1A1A] px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-700 capitalize">{r.status?.toLowerCase() || 'pending'}</span>
          </div>
          {actions && actions(r)}
          {footer && <p className="text-xs text-gray-500 mt-2 italic">{footer}</p>}
        </div>
      ))}
    </div>
  );
}

function RateView({ request, onComplete }: { request: HireRequest, onComplete: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await submitReview({
      requestId: request.id,
      customerId: request.customerId,
      customerName: request.customerName,
      workerId: request.workerId,
      rating,
      comment
    });
    setLoading(false);
    onComplete();
  };

  return (
    <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Rate your experience</h2>
      <p className="text-gray-400">How was the job done by {request.workerName}?</p>

      <div className="flex justify-center gap-3 py-6">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-125">
            <Star size={48} className={s <= rating ? 'fill-[#FF6600] text-[#FF6600]' : 'text-gray-600'} />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-400 text-sm">Your feedback (optional)</label>
        <textarea 
          className="bg-[#3A3A3A] border border-gray-600 rounded-2xl p-4 text-white h-32 focus:outline-none focus:border-[#FF6600]"
          placeholder="Excellent work, very professional..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <button 
        disabled={loading}
        onClick={handleSubmit} 
        className="bg-[#FF6600] py-4 rounded-2xl font-bold text-xl hover:bg-[#CC5200] transition-all disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

      <button onClick={onComplete} className="text-gray-500">Cancel</button>
    </motion.div>
  );
}
