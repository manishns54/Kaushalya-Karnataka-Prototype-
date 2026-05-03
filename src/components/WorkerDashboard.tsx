import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ServiceCard, getWorkerServiceCards, deleteServiceCard, createServiceCard, subscribeToWorkerRequests, updateRequestStatus, HireRequest, getWorkerReviews, Review } from '../services/marketplaceService';
import { Plus, Edit2, LogOut, Briefcase, Star, Bell, Image as ImageIcon, User, Check, X, Camera, RefreshCw, Trash2 } from 'lucide-react';
import { generateWorkerBio } from '../services/aiService';
import { db } from '../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';

interface WorkerDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function WorkerDashboard({ profile, onLogout }: WorkerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'DASH' | 'REQUESTS' | 'PROFILE' | 'PHOTOS' | 'REVIEWS'>('DASH');
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCard | null>(null);

  useEffect(() => {
    loadServices();
    loadReviews();
    const unsub = subscribeToWorkerRequests(profile.uid, setRequests);
    return () => unsub();
  }, []);

  const loadServices = async () => {
    const s = await getWorkerServiceCards(profile.uid);
    setServices(s);
  };

  const loadReviews = async () => {
    const r = await getWorkerReviews(profile.uid);
    setReviews(r);
  }

  const handleCreateService = async (service: Omit<ServiceCard, 'id' | 'workerId'>) => {
    await createServiceCard({ ...service, workerId: profile.uid });
    setShowAddService(false);
    loadServices();
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("Delete this service?")) {
      await deleteServiceCard(id);
      loadServices();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2A2A2A]">
      <header className="bg-[#003366] p-4 flex justify-between items-center text-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">My Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{profile.name?.split(' ')[0] || 'Worker'} K.</span>
          <button onClick={onLogout} className="text-gray-300 hover:text-white transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        {activeTab === 'DASH' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#3A3A3A] p-4 rounded-xl text-center">
                <p className="text-[#FF6600] text-xl font-bold">{profile.avgRating || '0.0'}</p>
                <p className="text-xs text-gray-400 uppercase">Rating</p>
              </div>
              <div className="bg-[#3A3A3A] p-4 rounded-xl text-center">
                <p className="text-xl font-bold">{profile.totalJobs || 0}</p>
                <p className="text-xs text-gray-400 uppercase">Jobs</p>
              </div>
              <div className="bg-[#3A3A3A] p-4 rounded-xl text-center relative">
                <div className="flex justify-center items-center gap-1">
                  <p className="text-[#00FF00] text-xl font-bold">{requests?.filter(r => r?.status === 'PENDING').length || 0}</p>
                  <div className="w-2 h-2 bg-[#FF6600] rounded-full animate-pulse" />
                </div>
                <p className="text-xs text-gray-400 uppercase">Requests</p>
              </div>
            </div>

            <section>
              <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-wider">My Services</h3>
              <div className="flex flex-col gap-3">
                {services?.map(s => (
                  <div key={s.id} className="bg-[#3A3A3A] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{s.name}</h4>
                      <p className="text-gray-400 text-sm">{s.description || 'Professional service'}</p>
                    </div>
                    <div className="text-right">
                      <p className="bg-[#003366] text-[#00FF00] px-3 py-1 rounded-full text-sm font-bold">
                        {s.priceType === 'Starting at' ? 'From ' : ''}₹{s.price}
                      </p>
                      <button onClick={() => setEditingService(s)} className="text-gray-500 mt-2 hover:text-white transition-colors"><Edit2 size={16} /></button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setShowAddService(true)}
                  className="bg-[#3A3A3A] p-6 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all"
                >
                  <Plus size={32} />
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'REQUESTS' && <RequestsView requests={requests} />}
        {activeTab === 'PROFILE' && <ProfileView profile={profile} services={services} />}
        {activeTab === 'PHOTOS' && <PhotosView profile={profile} />}
        {activeTab === 'REVIEWS' && <ReviewsView reviews={reviews} profile={profile} />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1A1A1A] border-t border-gray-800 p-2 grid grid-cols-5 gap-1">
        <NavBtn icon={<Briefcase size={20}/>} active={activeTab === 'DASH'} onClick={() => setActiveTab('DASH')} />
        <NavBtn icon={<Bell size={20}/>} active={activeTab === 'REQUESTS'} count={requests.filter(r => r.status === 'PENDING').length} onClick={() => setActiveTab('REQUESTS')} />
        <NavBtn icon={<ImageIcon size={20}/>} active={activeTab === 'PHOTOS'} onClick={() => setActiveTab('PHOTOS')} />
        <NavBtn icon={<Star size={20}/>} active={activeTab === 'REVIEWS'} onClick={() => setActiveTab('REVIEWS')} />
        <NavBtn icon={<User size={20}/>} active={activeTab === 'PROFILE'} onClick={() => setActiveTab('PROFILE')} />
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {(showAddService || editingService) && (
          <ServiceForm 
            service={editingService} 
            onClose={() => { setShowAddService(false); setEditingService(null); }} 
            onSave={handleCreateService} 
            onDelete={handleDeleteService}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavBtn({ icon, active, onClick, count }: { icon: any, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all ${active ? 'bg-[#3A3A3A] text-[#FF6600]' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon}
      {count ? <span className="absolute top-2 right-4 bg-[#FF6600] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#1A1A1A]">{count}</span> : null}
    </button>
  );
}

function ServiceForm({ service, onClose, onSave, onDelete }: { service: ServiceCard | null, onClose: () => void, onSave: (s: any) => void, onDelete: (id: string) => void }) {
  const [data, setData] = useState({
    name: service?.name || '',
    category: service?.category || 'Electrician',
    priceType: (service?.priceType || 'Fixed') as 'Fixed' | 'Starting at',
    price: service?.price || 0,
    description: service?.description || ''
  });

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-50 bg-[#2A2A2A] flex flex-col max-w-md mx-auto">
      <header className="bg-[#003366] p-4 flex items-center gap-4 text-white">
        <button onClick={onClose}><ChevronLeft /></button>
        <h2 className="text-xl font-bold">{service ? 'Edit Service Card' : 'Add New Service'}</h2>
      </header>
      <div className="p-6 flex flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Service name</label>
          <input className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="e.g. Fan repair" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Category tag</label>
          <div className="flex gap-2">
            {["Electrician", "Plumber", "Carpenter"].map(c => (
              <button 
                key={c}
                onClick={() => setData({...data, category: c})}
                className={`px-4 py-2 rounded-full border border-gray-600 transition-all ${data.category === c ? 'bg-[#003366] text-white' : 'bg-[#3A3A3A] text-gray-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setData({...data, priceType: 'Fixed'})} className={`py-3 rounded-lg border border-gray-600 transition-all ${data.priceType === 'Fixed' ? 'bg-[#003366] text-white' : 'bg-[#3A3A3A]'}`}>Fixed</button>
          <button onClick={() => setData({...data, priceType: 'Starting at'})} className={`py-3 rounded-lg border border-gray-600 transition-all ${data.priceType === 'Starting at' ? 'bg-[#003366] text-white' : 'bg-[#3A3A3A]'}`}>Starting at</button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Price (₹)</label>
          <input type="number" className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3" value={data.price} onChange={e => setData({...data, price: Number(e.target.value)})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">Description (optional)</label>
          <textarea className="bg-[#3A3A3A] border border-gray-600 rounded-lg p-3 h-24" value={data.description} onChange={e => setData({...data, description: e.target.value})} placeholder="Describe your service..." />
        </div>
        <button onClick={() => onSave(data)} className="bg-[#3A3A3A] border-2 border-gray-600 py-4 rounded-xl text-xl font-bold mt-4 hover:bg-[#4A4A4A]">Save card</button>
        {service && <button onClick={() => onDelete(service.id)} className="border-2 border-red-500 text-red-500 py-4 rounded-xl text-xl font-bold hover:bg-red-500 hover:text-white transition-all">Delete card</button>}
      </div>
    </motion.div>
  );
}

function RequestsView({ requests }: { requests: HireRequest[] }) {
  const pending = requests?.filter(r => r?.status === 'PENDING') || [];
  const accepted = requests?.filter(r => r?.status === 'ACCEPTED') || [];
  const completed = requests?.filter(r => r?.status === 'COMPLETED' || r?.status === 'REVIEWED') || [];
  const declined = requests?.filter(r => r?.status === 'DECLINED') || [];

  return (
    <div className="flex flex-col gap-6">
      <Section title="PENDING" items={pending} accentColor="#FF6600" actions={(r) => (
        <div className="flex gap-2 mt-3">
          <button onClick={() => updateRequestStatus(r.id, 'ACCEPTED')} className="flex-1 bg-[#006600] py-2 rounded-lg flex items-center justify-center gap-1 font-bold"><Check size={18}/> Accept</button>
          <button onClick={() => updateRequestStatus(r.id, 'DECLINED')} className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg flex items-center justify-center gap-1 font-bold"><X size={18}/> Decline</button>
        </div>
      )} />
      <Section title="ACCEPTED" items={accepted} accentColor="#00FF00" actions={(r) => (
        <button onClick={() => updateRequestStatus(r.id, 'COMPLETED')} className="w-full bg-[#E5E7EB] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-3">
          Mark as finished
        </button>
      )} />
      <Section title="COMPLETED" items={completed} accentColor="#3B82F6" />
      <Section title="DECLINED" items={declined} accentColor="#EF4444" />
    </div>
  );
}

function Section({ title, items, actions, accentColor }: { title: string, items: HireRequest[], actions?: (r: any) => any, accentColor: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
      {items?.map(r => (
        <div key={r.id} className="bg-[#3A3A3A] p-4 rounded-xl border-l-[6px]" style={{ borderColor: accentColor }}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg">{r.customerName}</h4>
              <p className="text-gray-400 text-sm">{r.serviceName} • {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
            </div>
            <span className="bg-[#1A1A1A] px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-700 capitalize">{r.status?.toLowerCase() || 'pending'}</span>
          </div>
          {actions && actions(r)}
        </div>
      ))}
    </div>
  );
}

function ProfileView({ profile, services }: { profile: UserProfile, services: ServiceCard[] }) {
  const [bio, setBio] = useState(profile.bio || '');
  const [generating, setGenerating] = useState(false);

  const handleGenerateBio = async () => {
    setGenerating(true);
    try {
      const newBio = await generateWorkerBio(services, profile.locality || '', profile.name || '');
      setBio(newBio);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const saveProfile = async () => {
    await updateDoc(doc(db, "users", profile.uid), { bio });
    alert("Profile saved!");
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Your bio</h3>
      <div className="bg-[#3A3A3A] p-4 rounded-xl border border-gray-700">
        <textarea 
          className="w-full bg-transparent text-gray-200 resize-none h-32 focus:outline-none" 
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Craft your story..."
        />
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleGenerateBio} 
          disabled={generating}
          className="flex-1 bg-[#FF6600] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#CC5200] transition-all"
        >
          {generating ? <RefreshCw className="animate-spin" size={18}/> : <Plus size={18}/>} Generate bio
        </button>
        <button onClick={handleGenerateBio} className="flex-1 border border-[#FF6600] text-[#FF6600] py-3 rounded-xl font-bold">Regenerate</button>
      </div>
      <p className="bg-[#D1FAE5] text-[#065F46] p-3 rounded-xl text-xs flex items-center gap-2">
        Gemini AI generated this bio from your {services.length} service cards.
      </p>
      <button onClick={saveProfile} className="bg-[#3A3A3A] border-2 border-gray-600 py-4 rounded-xl text-xl font-bold mt-2">Save profile</button>
    </div>
  );
}

function PhotosView({ profile }: { profile: UserProfile }) {
  const [photos, setPhotos] = useState<string[]>(profile.photos || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 10) {
      alert("Maximum 10 photos allowed");
      return;
    }

    setUploading(true);
    try {
      // Resize and compress image before base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension 800px
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          
          const newPhotos = [...photos, base64String];
          await updateDoc(doc(db, "users", profile.uid), { photos: newPhotos });
          setPhotos(newPhotos);
          setUploading(false);
          e.target.value = ''; // Reset input
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Failed to upload photo");
    }
  };

  const deletePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    try {
      await updateDoc(doc(db, "users", profile.uid), { photos: newPhotos });
      setPhotos(newPhotos);
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Uploaded Photos ({photos.length}/10)</h3>
        {uploading && <RefreshCw className="animate-spin text-[#FF6600]" size={16} />}
      </div>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*" 
        capture
        onChange={handleFileChange} 
      />

      <div className="grid grid-cols-2 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-700 bg-[#3A3A3A]">
            <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deletePhoto(i);
              }}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white backdrop-blur-sm hover:bg-red-600 active:scale-95 transition-all z-10"
              aria-label="Delete photo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {photos.length < 10 && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#3A3A3A] aspect-[4/3] rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-white hover:text-white transition-all"
          >
            <Plus size={24} />
            <span className="text-sm font-bold">Add</span>
          </button>
        )}
      </div>
      
      <p className="text-gray-500 text-[10px] italic">Supported formats: JPG, PNG. Max 10 images.</p>

      <div className="bg-[#3A3A3A] p-6 rounded-2xl border border-gray-700 flex flex-col gap-4 mt-2">
        <p className="font-bold">Add photo from</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-gray-600 rounded-xl hover:bg-[#4A4A4A] transition-all font-bold active:scale-95"
          >
            <Camera size={32}/> 
            <span className="text-sm">Camera</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-gray-600 rounded-xl hover:bg-[#4A4A4A] transition-all font-bold active:scale-95"
          >
            <ImageIcon size={32}/> 
            <span className="text-sm">Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewsView({ reviews, profile }: { reviews: Review[], profile: UserProfile }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#3A3A3A] p-6 rounded-2xl border border-gray-700 flex items-center gap-6">
        <h2 className="text-5xl font-bold text-[#FF6600]">{profile.avgRating && profile.avgRating > 0 ? profile.avgRating : '--'}</h2>
        <div className="flex flex-col">
          <p className="text-xl font-bold">{reviews.length} reviews</p>
          <p className="text-gray-400">{profile.totalJobs || 0} jobs completed</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {reviews.map(r => (
          <div key={r.id}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, onReport }: { review: Review, onReport?: (id: string) => void }) {
  return (
    <div className="bg-[#3A3A3A] p-4 rounded-xl border border-gray-700 flex gap-3 relative">
      <div className="w-12 h-12 bg-[#003366] rounded-full flex items-center justify-center font-bold text-lg">{review.customerName?.charAt(0) || '?'}</div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <h4 className="font-bold">{review.customerName || 'Customer'}</h4>
          <span className="text-xs text-gray-500">{review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= review.rating ? 'fill-[#FF6600] text-[#FF6600]' : 'text-gray-600'} />)}
        </div>
        <p className="text-gray-300 mt-1">{review.comment}</p>
      </div>
      {onReport && (
        <button onClick={() => onReport(review.id)} className="absolute bottom-4 right-4 bg-[#4A4A4A] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-600 transition-all">
          Report
        </button>
      )}
    </div>
  );
}

function ChevronLeft() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
