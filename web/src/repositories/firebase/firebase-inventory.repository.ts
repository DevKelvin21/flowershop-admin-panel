import { collection, getDocs, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../db/firestore';
import type { InventoryItem } from '../../shared/models/inventory';
import type { IInventoryRepository } from '../interfaces/inventory.repository';
import { formatDateTime } from '../utils/date-formatter';

/**
 * Firebase implementation of IInventoryRepository
 */
export class FirebaseInventoryRepository implements IInventoryRepository {
  async getAll(): Promise<InventoryItem[]> {
    const inventoryCollection = collection(db, 'inventory');
    const snapshot = await getDocs(inventoryCollection);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as InventoryItem;
      let formattedLastUpdated = data.lastUpdated;
      if (formattedLastUpdated && /T/.test(formattedLastUpdated)) {
        // Parse ISO string and format
        const date = new Date(formattedLastUpdated);
        formattedLastUpdated = formatDateTime(date);
      }
      return { id: docSnap.id, ...data, lastUpdated: formattedLastUpdated };
    });
  }

  async getById(id: string): Promise<InventoryItem | null> {
    // For now, get all and filter - Firestore requires indexes for complex queries
    // In production, consider using a direct document read with doc() and getDoc()
    const allItems = await this.getAll();
    const found = allItems.find((item) => item.id === id);
    return found || null;
  }

  async add(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, 'inventory', docId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...itemData } = item;
    itemData.lastUpdated = formatDateTime(new Date());
    await setDoc(itemRef, itemData);
  }

  async update(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, 'inventory', docId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...itemData } = item;
    itemData.lastUpdated = formatDateTime(new Date());
    await writeBatch(db).set(itemRef, itemData).commit();
  }

  async remove(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, 'inventory', docId);
    await deleteDoc(itemRef);
  }

  async updateBatch(items: InventoryItem[]): Promise<void> {
    const batch = writeBatch(db);

    for (const item of items) {
      const docId = item.id ?? `${item.item}_${item.quality}`;
      const itemRef = doc(db, 'inventory', docId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...itemData } = item;
      itemData.lastUpdated = formatDateTime(new Date());
      batch.set(itemRef, itemData);
    }

    await batch.commit();
  }
}

