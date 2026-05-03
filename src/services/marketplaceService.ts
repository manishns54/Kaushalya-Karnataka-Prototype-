import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, runTransaction, onSnapshot
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

// --- Types ---
export type UserRole = 'WORKER' | 'CUSTOMER' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'DECLINED' | 'REVIEWED';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  locality?: string;
  tradeCategory?: string;
  bio?: string;
  avgRating?: number;
  totalReviewCount?: number;
  totalJobs?: number;
  isActive?: boolean;
  photos?: string[];
}

export interface ServiceCard {
  id: string;
  workerId: string;
  name: string;
  category: string;
  priceType: 'Fixed' | 'Starting at';
  price: number;
  description?: string;
}

export interface HireRequest {
  id: string;
  customerId: string;
  workerId: string;
  customerName: string;
  workerName: string;
  serviceName: string;
  status: RequestStatus;
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: any;
  flagged?: boolean;
}

// --- User Service ---
export async function createUserProfile(profile: UserProfile) {
  try {
    await setDoc(doc(db, "users", profile.uid), {
      ...profile,
      avgRating: 0,
      totalReviewCount: 0,
      totalJobs: 0,
      isActive: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
}

export async function getActiveWorkers(category?: string): Promise<UserProfile[]> {
  try {
    let q = query(collection(db, "users"), where("role", "==", "WORKER"), where("isActive", "==", true));
    if (category && category !== 'All') {
      q = query(q, where("tradeCategory", "==", category));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "users");
    return [];
  }
}

// --- Service Service ---
export async function createServiceCard(card: Omit<ServiceCard, 'id'>) {
  try {
    const ref = doc(collection(db, "serviceCards"));
    await setDoc(ref, { ...card, id: ref.id });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "serviceCards");
  }
}

export async function getWorkerServiceCards(workerId: string): Promise<ServiceCard[]> {
  try {
    const q = query(collection(db, "serviceCards"), where("workerId", "==", workerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ServiceCard);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "serviceCards");
    return [];
  }
}

export async function deleteServiceCard(cardId: string) {
  try {
    await deleteDoc(doc(db, "serviceCards", cardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `serviceCards/${cardId}`);
  }
}

// --- Hire Service ---
export async function createHireRequest(data: Omit<HireRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  try {
    const ref = doc(collection(db, "hireRequests"));
    await setDoc(ref, {
      ...data,
      id: ref.id,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "hireRequests");
  }
}

export function subscribeToWorkerRequests(workerId: string, callback: (requests: HireRequest[]) => void) {
  const q = query(collection(db, "hireRequests"), where("workerId", "==", workerId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as HireRequest));
  }, (error) => handleFirestoreError(error, OperationType.LIST, "hireRequests"));
}

export function subscribeToCustomerRequests(customerId: string, callback: (requests: HireRequest[]) => void) {
  const q = query(collection(db, "hireRequests"), where("customerId", "==", customerId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as HireRequest));
  }, (error) => handleFirestoreError(error, OperationType.LIST, "hireRequests"));
}

export async function updateRequestStatus(requestId: string, status: RequestStatus) {
  try {
    await updateDoc(doc(db, "hireRequests", requestId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hireRequests/${requestId}`);
  }
}

// --- Review Service ---
export async function submitReview(review: Omit<Review, 'id' | 'createdAt' | 'flagged'>) {
  try {
    const reviewId = doc(collection(db, "reviews")).id;
    
    await runTransaction(db, async (transaction) => {
      // 1. Get worker profile
      const workerRef = doc(db, "users", review.workerId);
      const workerSnap = await transaction.get(workerRef);
      if (!workerSnap.exists()) throw new Error("Worker not found");
      
      const workerData = workerSnap.data() as UserProfile;
      const currentRating = workerData.avgRating || 0;
      const currentCount = workerData.totalReviewCount || 0;
      
      // 2. Calculate new rating
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;
      
      // 3. Update worker
      transaction.update(workerRef, {
        avgRating: Number(newRating.toFixed(1)),
        totalReviewCount: newCount,
        totalJobs: (workerData.totalJobs || 0) + 1
      });
      
      // 4. Update request status
      transaction.update(doc(db, "hireRequests", review.requestId), {
        status: 'REVIEWED',
        updatedAt: serverTimestamp()
      });
      
      // 5. Save review
      transaction.set(doc(db, "reviews", reviewId), {
        ...review,
        id: reviewId,
        createdAt: serverTimestamp(),
        flagged: false
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "reviews");
  }
}

export async function getWorkerReviews(workerId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"), where("workerId", "==", workerId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Review);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "reviews");
    return [];
  }
}

export async function flagReview(reviewId: string) {
  try {
    await updateDoc(doc(db, "reviews", reviewId), { flagged: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reviews/${reviewId}`);
  }
}

export async function getFlaggedReviews(): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"), where("flagged", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Review);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "reviews");
    return [];
  }
}

export async function toggleUserStatus(uid: string, isActive: boolean) {
  try {
    await updateDoc(doc(db, "users", uid), { isActive });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

export async function getAllWorkers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, "users"), where("role", "==", "WORKER"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "users");
    return [];
  }
}
