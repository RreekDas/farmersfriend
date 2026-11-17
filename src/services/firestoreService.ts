import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
  BotanicalTaxonomies,
  ConciergeMessage,
  ConciergeThread,
  HeroBannerConfig,
  InquiryStatus,
  OrderInquiry,
  Specimen,
  UserProfile,
} from '../types/botanical';

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function sanitizeId(raw: string, prefix = 'id'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  if (!cleaned || !ID_PATTERN.test(cleaned)) {
    return `${prefix}-${Date.now()}`;
  }
  return cleaned;
}

export function clampString(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const normalized = (value ?? '').trim();
  if (!normalized) return fallback;
  return normalized.slice(0, maxLen);
}

/**
 * Compresses large uploaded image Data URLs so documents stay cleanly
 * below Firestore limits and satisfy blueprint maxLength (500,000 chars).
 */
export function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1280,
  maxHeight = 1500
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Empty image data.'));
        return;
      }

      if (dataUrl.length <= 360000) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl.slice(0, 490000));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let compressed = canvas.toDataURL('image/jpeg', 0.82);
        if (compressed.length > 460000) {
          compressed = canvas.toDataURL('image/jpeg', 0.65);
        }
        resolve(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function formatTimestampLabel(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  return user.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function syncUserAccountDocuments(
  user: User,
  initialDetails?: { displayName?: string; phone?: string; neighborhood?: string }
): Promise<UserProfile> {
  const uid = sanitizeId(user.uid, 'user');
  const publicPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;
  const isBootAdmin = Boolean(
    user.emailVerified && user.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const publicRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');

  let existingPublic: Record<string, unknown> | null = null;
  let existingPrivate: Record<string, unknown> | null = null;

  try {
    const pubSnap = await getDoc(publicRef);
    if (pubSnap.exists()) existingPublic = pubSnap.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, publicPath);
  }

  try {
    const privSnap = await getDoc(privateRef);
    if (privSnap.exists()) existingPrivate = privSnap.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }

  const displayName = clampString(
    (existingPublic?.displayName as string | undefined) ||
      initialDetails?.displayName ||
      user.displayName ||
      'Botanical Member',
    120,
    'Botanical Member'
  );
  const photoURL = clampString(user.photoURL, 500, '');
  const email = clampString(user.email, 200, 'member@farmersfriend.in');
  const phone = clampString(
    (existingPrivate?.phone as string | undefined) || initialDetails?.phone,
    30,
    ''
  );
  const neighborhood = clampString(
    (existingPrivate?.neighborhood as string | undefined) || initialDetails?.neighborhood,
    200,
    ''
  );
  const role: 'customer' | 'admin' = isBootAdmin ? 'admin' : 'customer';

  try {
    if (!existingPublic) {
      await setDoc(publicRef, {
        uid,
        displayName,
        photoURL,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(publicRef, {
        displayName,
        photoURL,
        ...(isBootAdmin && existingPublic.role !== 'admin' ? { role: 'admin' } : {}),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }

  try {
    if (!existingPrivate) {
      await setDoc(privateRef, {
        uid,
        email,
        phone,
        neighborhood,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privateRef, {
        email,
        phone,
        neighborhood,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }

  return {
    uid,
    displayName,
    photoURL,
    role,
    email,
    phone,
    neighborhood,
  };
}

export async function updateUserProfileDetails(
  uid: string,
  email: string,
  displayName: string,
  phone: string,
  neighborhood: string
): Promise<void> {
  const safeUid = sanitizeId(uid, 'user');
  const publicPath = `users/${safeUid}`;
  const privatePath = `users/${safeUid}/private/info`;

  try {
    await updateDoc(doc(db, 'users', safeUid), {
      displayName: clampString(displayName, 120, 'Botanical Member'),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, publicPath);
  }

  try {
    await updateDoc(doc(db, 'users', safeUid, 'private', 'info'), {
      email: clampString(email, 200, 'member@farmersfriend.in'),
      phone: clampString(phone, 30, ''),
      neighborhood: clampString(neighborhood, 200, ''),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, privatePath);
  }
}

export function subscribeToSpecimens(
  onData: (specimens: Specimen[]) => void
): Unsubscribe {
  const path = 'specimens';
  const q = query(collection(db, path), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Specimen[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id ?? d.id),
          commonName: String(data.commonName ?? ''),
          latinName: String(data.latinName ?? ''),
          family: String(data.family ?? ''),
          category: String(data.category ?? ''),
          price: Number(data.price ?? 0),
          stock: Number(data.stock ?? 0),
          light: String(data.light ?? ''),
          water: String(data.water ?? ''),
          heightRange: String(data.heightRange ?? ''),
          potDiameter: String(data.potDiameter ?? ''),
          origin: String(data.origin ?? ''),
          humidity: String(data.humidity ?? ''),
          soilMix: String(data.soilMix ?? ''),
          petSafe: Boolean(data.petSafe),
          isRareSeasonal: Boolean(data.isRareSeasonal),
          provenanceNote: String(data.provenanceNote ?? ''),
          careGuide: String(data.careGuide ?? ''),
          imageUrl: String(data.imageUrl ?? ''),
        };
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToBannerConfig(
  onData: (banner: HeroBannerConfig) => void
): Unsubscribe {
  const path = 'banner_config/default';
  return onSnapshot(
    doc(db, 'banner_config', 'default'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onData({
          imageUrl: String(data.imageUrl ?? ''),
          eyebrow: String(data.eyebrow ?? ''),
          captionTitle: String(data.captionTitle ?? ''),
          captionLatin: String(data.captionLatin ?? ''),
          locationTag: String(data.locationTag ?? ''),
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToTaxonomyConfig(
  onData: (taxonomies: BotanicalTaxonomies) => void
): Unsubscribe {
  const path = 'taxonomy_config/default';
  return onSnapshot(
    doc(db, 'taxonomy_config', 'default'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (
          Array.isArray(data.categories) &&
          Array.isArray(data.lightOptions) &&
          Array.isArray(data.waterOptions)
        ) {
          onData({
            categories: data.categories.map(String),
            lightOptions: data.lightOptions.map(String),
            waterOptions: data.waterOptions.map(String),
          });
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

function buildSpecimenPayload(specimen: Specimen, adminUid: string) {
  const id = sanitizeId(specimen.id, 'spec');
  return {
    id,
    commonName: clampString(specimen.commonName, 140, 'Collection Plant'),
    latinName: clampString(specimen.latinName, 160, 'Glasshouse Selection'),
    family: clampString(specimen.family, 100, 'Tropical Foliage'),
    category: clampString(specimen.category, 100, 'Architectural Flora'),
    price: Math.max(1, Math.min(10000000, Number(specimen.price) || 1000)),
    stock: Math.max(0, Math.min(100000, Math.round(Number(specimen.stock) || 0))),
    light: clampString(specimen.light, 100, 'Bright Indirect'),
    water: clampString(specimen.water, 100, 'Weekly Mist & Soak'),
    heightRange: clampString(specimen.heightRange, 80, ''),
    potDiameter: clampString(specimen.potDiameter, 40, ''),
    origin: clampString(specimen.origin, 160, ''),
    humidity: clampString(specimen.humidity, 60, ''),
    soilMix: clampString(specimen.soilMix, 200, ''),
    petSafe: Boolean(specimen.petSafe),
    isRareSeasonal: Boolean(specimen.isRareSeasonal),
    provenanceNote: clampString(specimen.provenanceNote, 400, ''),
    careGuide: clampString(specimen.careGuide, 1200, ''),
    imageUrl: clampString(specimen.imageUrl, 500000, '/assets/aistudio/wholsale_a950266d.jpg'),
    updatedAt: serverTimestamp(),
    updatedBy: sanitizeId(adminUid, 'admin'),
  };
}

export async function saveSpecimenInFirestore(
  specimen: Specimen,
  adminUid: string
): Promise<void> {
  const payload = buildSpecimenPayload(specimen, adminUid);
  const path = `specimens/${payload.id}`;
  try {
    await setDoc(doc(db, 'specimens', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSpecimenInFirestore(specimenId: string): Promise<void> {
  const safeId = sanitizeId(specimenId, 'spec');
  const path = `specimens/${safeId}`;
  try {
    await deleteDoc(doc(db, 'specimens', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedDefaultsIfNeeded(
  initialSpecimens: Specimen[],
  defaultBanner: HeroBannerConfig,
  defaultTaxonomies: BotanicalTaxonomies,
  adminUid: string
): Promise<void> {
  try {
    const existingSpecs = await getDocs(query(collection(db, 'specimens'), limit(1)));
    const batch = writeBatch(db);
    let hasWrites = false;

    if (existingSpecs.empty) {
      for (const spec of initialSpecimens) {
        const payload = buildSpecimenPayload(spec, adminUid);
        batch.set(doc(db, 'specimens', payload.id), payload);
      }
      hasWrites = true;
    }

    const bannerSnap = await getDoc(doc(db, 'banner_config', 'default'));
    if (!bannerSnap.exists()) {
      batch.set(doc(db, 'banner_config', 'default'), {
        imageUrl: clampString(defaultBanner.imageUrl, 500000, '/assets/aistudio/wholsale_a950266d.jpg'),
        eyebrow: clampString(defaultBanner.eyebrow, 160, 'Farmers Friend'),
        captionTitle: clampString(defaultBanner.captionTitle, 160, 'Showroom'),
        captionLatin: clampString(defaultBanner.captionLatin, 160, ''),
        locationTag: clampString(defaultBanner.locationTag, 100, 'New Alipore, Kolkata'),
        updatedAt: serverTimestamp(),
        updatedBy: sanitizeId(adminUid, 'admin'),
      });
      hasWrites = true;
    }

    const taxSnap = await getDoc(doc(db, 'taxonomy_config', 'default'));
    if (!taxSnap.exists()) {
      batch.set(doc(db, 'taxonomy_config', 'default'), {
        categories: defaultTaxonomies.categories.slice(0, 30).map((s) => clampString(s, 100)),
        lightOptions: defaultTaxonomies.lightOptions.slice(0, 20).map((s) => clampString(s, 100)),
        waterOptions: defaultTaxonomies.waterOptions.slice(0, 20).map((s) => clampString(s, 100)),
        updatedAt: serverTimestamp(),
        updatedBy: sanitizeId(adminUid, 'admin'),
      });
      hasWrites = true;
    }

    if (hasWrites) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'specimens');
  }
}

export async function resetCatalogInFirestore(
  initialSpecimens: Specimen[],
  adminUid: string
): Promise<void> {
  try {
    const existing = await getDocs(collection(db, 'specimens'));
    const batch = writeBatch(db);
    existing.docs.forEach((d) => batch.delete(d.ref));
    initialSpecimens.forEach((spec) => {
      const payload = buildSpecimenPayload(spec, adminUid);
      batch.set(doc(db, 'specimens', payload.id), payload);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'specimens');
  }
}

export async function saveBannerInFirestore(
  banner: HeroBannerConfig,
  adminUid: string
): Promise<void> {
  const path = 'banner_config/default';
  try {
    await setDoc(doc(db, 'banner_config', 'default'), {
      imageUrl: clampString(banner.imageUrl, 500000, '/assets/aistudio/wholsale_a950266d.jpg'),
      eyebrow: clampString(banner.eyebrow, 160, 'Farmers Friend · One Stop Botanical Solution'),
      captionTitle: clampString(banner.captionTitle, 160, 'Artisanal Planter & Botanical Showroom'),
      captionLatin: clampString(banner.captionLatin, 160, ''),
      locationTag: clampString(banner.locationTag, 100, 'New Alipore, Kolkata'),
      updatedAt: serverTimestamp(),
      updatedBy: sanitizeId(adminUid, 'admin'),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTaxonomiesInFirestore(
  taxonomies: BotanicalTaxonomies,
  adminUid: string,
  updatedSpecimens: Specimen[] = []
): Promise<void> {
  const path = 'taxonomy_config/default';
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'taxonomy_config', 'default'), {
      categories: taxonomies.categories.slice(0, 30).map((s) => clampString(s, 100, 'Category')),
      lightOptions: taxonomies.lightOptions.slice(0, 20).map((s) => clampString(s, 100, 'Bright Indirect')),
      waterOptions: taxonomies.waterOptions.slice(0, 20).map((s) => clampString(s, 100, 'Weekly')),
      updatedAt: serverTimestamp(),
      updatedBy: sanitizeId(adminUid, 'admin'),
    });

    for (const spec of updatedSpecimens) {
      const payload = buildSpecimenPayload(spec, adminUid);
      batch.set(doc(db, 'specimens', payload.id), payload);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveOrderInquiryInFirestore(
  inquiry: OrderInquiry,
  userId: string
): Promise<void> {
  const safeId = sanitizeId(inquiry.id, 'INQ');
  const safeUid = sanitizeId(userId, 'user');
  const path = `enquiries/${safeId}`;
  try {
    await setDoc(doc(db, 'enquiries', safeId), {
      id: safeId,
      userId: safeUid,
      specimenId: clampString(inquiry.specimenId, 128, ''),
      specimenName: clampString(inquiry.specimenName, 160, 'Conservatory Consultation'),
      latinName: clampString(inquiry.latinName, 160, ''),
      planterName: clampString(inquiry.planterName, 120, 'Private Session'),
      quantity: Math.max(1, Math.min(1000, Math.round(Number(inquiry.quantity) || 1))),
      totalPrice: Math.max(0, Math.min(100000000, Number(inquiry.totalPrice) || 0)),
      customerName: clampString(inquiry.customerName, 120, 'Conservatory Guest'),
      neighborhood: clampString(inquiry.neighborhood, 200, ''),
      deliveryMethod: inquiry.deliveryMethod,
      message: clampString(inquiry.message, 1000, ''),
      status: 'pending',
      createdAtLabel: clampString(inquiry.createdAt, 60, ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInquiryStatusInFirestore(
  enquiryId: string,
  status: InquiryStatus
): Promise<void> {
  const safeId = sanitizeId(enquiryId, 'INQ');
  const path = `enquiries/${safeId}`;
  try {
    await updateDoc(doc(db, 'enquiries', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToUserEnquiries(
  userId: string,
  onData: (inquiries: OrderInquiry[]) => void
): Unsubscribe {
  const safeUid = sanitizeId(userId, 'user');
  const path = 'enquiries';
  const q = query(collection(db, path), where('userId', '==', safeUid), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((d) => {
        const data = d.data();
        const tsMillis =
          data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
        return {
          tsMillis,
          inquiry: {
            id: String(data.id ?? d.id),
            userId: String(data.userId ?? ''),
            specimenId: String(data.specimenId ?? ''),
            specimenName: String(data.specimenName ?? ''),
            latinName: String(data.latinName ?? ''),
            planterName: String(data.planterName ?? ''),
            quantity: Number(data.quantity ?? 1),
            totalPrice: Number(data.totalPrice ?? 0),
            customerName: String(data.customerName ?? ''),
            neighborhood: String(data.neighborhood ?? ''),
            deliveryMethod:
              data.deliveryMethod === 'Conservatory Pickup'
                ? 'Conservatory Pickup'
                : 'White-Glove Courier',
            message: String(data.message ?? ''),
            status: (data.status as InquiryStatus) ?? 'pending',
            createdAt: String(data.createdAtLabel || formatTimestampLabel(data.createdAt)),
            savedToCloud: true,
          } as OrderInquiry,
        };
      });
      rows.sort((a, b) => b.tsMillis - a.tsMillis);
      onData(rows.slice(0, 25).map((r) => r.inquiry));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToAllEnquiriesForAdmin(
  onData: (inquiries: OrderInquiry[]) => void
): Unsubscribe {
  const path = 'enquiries';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(40));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: String(data.id ?? d.id),
            userId: String(data.userId ?? ''),
            specimenId: String(data.specimenId ?? ''),
            specimenName: String(data.specimenName ?? ''),
            latinName: String(data.latinName ?? ''),
            planterName: String(data.planterName ?? ''),
            quantity: Number(data.quantity ?? 1),
            totalPrice: Number(data.totalPrice ?? 0),
            customerName: String(data.customerName ?? ''),
            neighborhood: String(data.neighborhood ?? ''),
            deliveryMethod:
              data.deliveryMethod === 'Conservatory Pickup'
                ? 'Conservatory Pickup'
                : 'White-Glove Courier',
            message: String(data.message ?? ''),
            status: (data.status as InquiryStatus) ?? 'pending',
            createdAt: String(data.createdAtLabel || formatTimestampLabel(data.createdAt)),
            savedToCloud: true,
          };
        })
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function sendConciergeMessageInFirestore(params: {
  threadUserId: string;
  customerName: string;
  senderUid: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  specimenRef?: string;
}): Promise<void> {
  const threadUid = sanitizeId(params.threadUserId, 'user');
  const senderUid = sanitizeId(params.senderUid, 'user');
  const messageId = sanitizeId(`msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'msg');
  const threadPath = `concierge_threads/${threadUid}`;

  try {
    const threadRef = doc(db, 'concierge_threads', threadUid);
    const threadSnap = await getDoc(threadRef);
    const batch = writeBatch(db);

    const preview = clampString(params.text, 300, 'New message');
    const custName = clampString(params.customerName, 120, 'Botanical Guest');

    if (!threadSnap.exists()) {
      batch.set(threadRef, {
        userId: threadUid,
        customerName: custName,
        lastMessagePreview: preview,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.update(threadRef, {
        customerName: custName,
        lastMessagePreview: preview,
        status: 'open',
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(doc(db, 'concierge_threads', threadUid, 'messages', messageId), {
      id: messageId,
      threadUserId: threadUid,
      senderUid,
      senderName: clampString(params.senderName, 120, 'Guest'),
      senderRole: params.senderRole,
      text: clampString(params.text, 1500, ''),
      specimenRef: clampString(params.specimenRef, 140, ''),
      createdAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, threadPath);
  }
}

export async function updateConciergeThreadStatus(
  threadUserId: string,
  status: 'open' | 'resolved'
): Promise<void> {
  const threadUid = sanitizeId(threadUserId, 'user');
  const path = `concierge_threads/${threadUid}`;
  try {
    await updateDoc(doc(db, 'concierge_threads', threadUid), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToConciergeMessages(
  threadUserId: string,
  onData: (messages: ConciergeMessage[]) => void
): Unsubscribe {
  const threadUid = sanitizeId(threadUserId, 'user');
  const path = `concierge_threads/${threadUid}/messages`;
  const q = query(collection(db, path), orderBy('createdAt', 'asc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: String(data.id ?? d.id),
            threadUserId: String(data.threadUserId ?? threadUid),
            senderUid: String(data.senderUid ?? ''),
            senderName: String(data.senderName ?? ''),
            senderRole: data.senderRole === 'admin' ? 'admin' : 'customer',
            text: String(data.text ?? ''),
            specimenRef: String(data.specimenRef ?? ''),
            createdAtLabel: formatTimestampLabel(data.createdAt),
          };
        })
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToConciergeThreadHeader(
  threadUserId: string,
  onData: (thread: ConciergeThread | null) => void
): Unsubscribe {
  const threadUid = sanitizeId(threadUserId, 'user');
  const path = `concierge_threads/${threadUid}`;
  return onSnapshot(
    doc(db, 'concierge_threads', threadUid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      onData({
        userId: String(data.userId ?? threadUid),
        customerName: String(data.customerName ?? ''),
        lastMessagePreview: String(data.lastMessagePreview ?? ''),
        status: data.status === 'resolved' ? 'resolved' : 'open',
        updatedAtLabel: formatTimestampLabel(data.updatedAt),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToAllConciergeThreadsForAdmin(
  onData: (threads: ConciergeThread[]) => void
): Unsubscribe {
  const path = 'concierge_threads';
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'), limit(40));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            userId: String(data.userId ?? d.id),
            customerName: String(data.customerName ?? 'Botanical Guest'),
            lastMessagePreview: String(data.lastMessagePreview ?? ''),
            status: data.status === 'resolved' ? 'resolved' : 'open',
            updatedAtLabel: formatTimestampLabel(data.updatedAt),
          };
        })
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
