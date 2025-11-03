import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../db/firestore';
import type { InventoryLoss } from '../../shared/models/inventory';
import type { ILossRepository } from '../interfaces/loss.repository';

/**
 * Firebase implementation of ILossRepository
 */
export class FirebaseLossRepository implements ILossRepository {
  async getAll(): Promise<InventoryLoss[]> {
    const lossCollection = collection(db, 'inventory_loss');
    const snapshot = await getDocs(lossCollection);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as InventoryLoss;
      return { id: docSnap.id, ...data };
    });
  }

  async getById(id: string): Promise<InventoryLoss | null> {
    const snapshot = await getDocs(collection(db, 'inventory_loss'));
    const found = snapshot.docs.find((d) => d.id === id);
    if (!found) return null;
    const data = found.data() as InventoryLoss;
    return { id: found.id, ...data };
  }

  async add(loss: InventoryLoss): Promise<void> {
    const lossRef = doc(db, 'inventory_loss', `${loss.item}_${loss.quality}_${Date.now()}`);
    await setDoc(lossRef, loss);
  }

  async remove(loss: InventoryLoss): Promise<void> {
    const lossRef = doc(db, 'inventory_loss', loss.id!);
    await deleteDoc(lossRef);
  }
}

