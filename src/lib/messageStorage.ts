import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { DoctorMessage } from "@/types";

const MESSAGES_COLLECTION = "messages";

/**
 * Sends a message using Firestore
 */
export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      senderId,
      receiverId,
      content: trimmed,
      sentAt: Timestamp.now(),
      isRead: false,
    });
  } catch (err: any) {
    console.error('[sendMessage] ❌ Failed to send message:', err);
    // Don't throw - allow app to continue even if Firebase fails
    // Error will be logged but won't crash the app
  }
}

/**
 * Fetches conversation partners for a doctor (one-time fetch)
 */
export async function getConversationPartners(doctorId: string): Promise<string[]> {
  try {
    const q1 = query(collection(db, MESSAGES_COLLECTION), where("senderId", "==", doctorId));
    const q2 = query(collection(db, MESSAGES_COLLECTION), where("receiverId", "==", doctorId));

    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const partners = new Set<string>();
    s1.forEach(d => partners.add(d.data().receiverId));
    s2.forEach(d => partners.add(d.data().senderId));

    return Array.from(partners);
  } catch (error) {
    console.warn('[getConversationPartners] Failed to fetch partners:', error);
    return []; // Return empty array on error
  }
}

const toMessage = (docSnap: any): DoctorMessage => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    content: data.content,
    sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate().toISOString() : (data.sentAt ?? new Date().toISOString()),
    readAt: data.readAt instanceof Timestamp ? data.readAt.toDate().toISOString() : data.readAt,
  };
};

/**
 * Subscribes to messages between two doctors in real-time.
 * Uses two parallel queries (one per direction), no composite index needed.
 */
export function subscribeToConversation(
  doctorId: string,
  otherDoctorId: string,
  callback: (messages: DoctorMessage[]) => void
) {
  try {
    // Query: doctorId → otherDoctorId (no orderBy = no composite index needed)
    const qSent = query(
      collection(db, MESSAGES_COLLECTION),
      where("senderId", "==", doctorId),
      where("receiverId", "==", otherDoctorId)
    );

    // Query: otherDoctorId → doctorId
    const qReceived = query(
      collection(db, MESSAGES_COLLECTION),
      where("senderId", "==", otherDoctorId),
      where("receiverId", "==", doctorId)
    );

    let sentMessages: DoctorMessage[] = [];
    let receivedMessages: DoctorMessage[] = [];

    const merge = () => {
      const all = [...sentMessages, ...receivedMessages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      callback(all);
    };

    const unsubSent = onSnapshot(qSent, 
      (snapshot) => {
        sentMessages = snapshot.docs.map(toMessage);
        merge();
      },
      (error) => {
        console.warn('[subscribeToConversation] Error in sent query:', error);
        // Continue with empty array
        sentMessages = [];
        merge();
      }
    );

    const unsubReceived = onSnapshot(qReceived, 
      (snapshot) => {
        receivedMessages = snapshot.docs.map(toMessage);
        merge();
      },
      (error) => {
        console.warn('[subscribeToConversation] Error in received query:', error);
        // Continue with empty array
        receivedMessages = [];
        merge();
      }
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  } catch (error) {
    console.warn('[subscribeToConversation] Failed to subscribe:', error);
    // Return empty unsubscribe function
    callback([]);
    return () => {};
  }
}

/**
 * Marks messages in a conversation as read using isRead flag
 */
export async function markConversationAsRead(currentDoctorId: string, otherDoctorId: string): Promise<void> {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("receiverId", "==", currentDoctorId),
      where("senderId", "==", otherDoctorId),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(q);
    const now = Timestamp.now();

    const updates = snapshot.docs.map(d => updateDoc(doc(db, MESSAGES_COLLECTION, d.id), {
      readAt: now,
      isRead: true,
    }));

    await Promise.all(updates);
  } catch (error) {
    console.warn('[markConversationAsRead] Failed to mark as read:', error);
    // Don't throw - allow app to continue
  }
}

/**
 * Subscribes to conversation partners for real-time sidebar updates.
 * Uses two separate single-field queries to avoid composite index requirement.
 */
export function subscribeToConversationPartners(doctorId: string, callback: (partners: string[]) => void) {
  try {
    const qSent = query(collection(db, MESSAGES_COLLECTION), where("senderId", "==", doctorId));
    const qReceived = query(collection(db, MESSAGES_COLLECTION), where("receiverId", "==", doctorId));

    let sentPartners: string[] = [];
    let receivedPartners: string[] = [];

    const merge = () => {
      const all = new Set([...sentPartners, ...receivedPartners]);
      callback(Array.from(all));
    };

    const unsubSent = onSnapshot(qSent, 
      (snapshot) => {
        sentPartners = snapshot.docs.map(d => d.data().receiverId).filter(Boolean);
        merge();
      },
      (error) => {
        console.warn('[subscribeToConversationPartners] Error in sent query:', error);
        sentPartners = [];
        merge();
      }
    );

    const unsubReceived = onSnapshot(qReceived, 
      (snapshot) => {
        receivedPartners = snapshot.docs.map(d => d.data().senderId).filter(Boolean);
        merge();
      },
      (error) => {
        console.warn('[subscribeToConversationPartners] Error in received query:', error);
        receivedPartners = [];
        merge();
      }
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  } catch (error) {
    console.warn('[subscribeToConversationPartners] Failed to subscribe:', error);
    callback([]);
    return () => {};
  }
}

/**
 * Subscribes to the total unread message count for a doctor.
 * Used for notification badges on the floating icon.
 */
export function subscribeToTotalUnreadCount(doctorId: string, callback: (count: number) => void) {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("receiverId", "==", doctorId),
      where("isRead", "==", false)
    );

    return onSnapshot(q, 
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.warn('[subscribeToTotalUnreadCount] Error:', error);
        // Return 0 on error
        callback(0);
      }
    );
  } catch (error) {
    console.warn('[subscribeToTotalUnreadCount] Failed to subscribe:', error);
    callback(0);
    return () => {};
  }
}
