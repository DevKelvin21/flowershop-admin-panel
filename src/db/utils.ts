import type { Timestamp, FieldValue } from "firebase-admin/firestore";
import { db } from "./firestore";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";


export type InventoryItem = {
    id?: string;
    item: string;
    quantity: number;
    quality: string;
    lastUpdated?: Timestamp | FieldValue;
};

export async function getInventory(): Promise<InventoryItem[]> {
    const inventoryCollection = collection(db, "inventory");
    const snapshot = await getDocs(inventoryCollection);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
}

export async function updateInventory(items: InventoryItem[]): Promise<void> {
    const batch = writeBatch(db);

    for (const item of items) {
        const docId = item.id ?? `${item.item}_${item.quality}`;
        const itemRef = doc(db, "inventory", docId);
        const { id, ...itemData } = item;
        batch.set(itemRef, itemData);
    }

    await batch.commit();
}

export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const inventory = await getInventory();
    inventory.push(item);
    await updateInventory(inventory);
}

export async function removeInventoryItem(itemName: string): Promise<void> {
    let inventory = await getInventory();
    inventory = inventory.filter(item => item.item !== itemName);
    await updateInventory(inventory);
}