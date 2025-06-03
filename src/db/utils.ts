import { db } from "./firestore";
import { collection, getDocs, doc, writeBatch, deleteDoc, setDoc } from "firebase/firestore";


export type InventoryItem = {
    id?: string;
    item: string;
    quantity: number;
    quality: string;
    lastUpdated?: string;
};

export async function getInventory(): Promise<InventoryItem[]> {
    const inventoryCollection = collection(db, "inventory");
    const snapshot = await getDocs(inventoryCollection);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
}

function formatDateTime(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export async function updateInventory(items: InventoryItem[]): Promise<void> {
    const batch = writeBatch(db);

    for (const item of items) {
        const docId = item.id ?? `${item.item}_${item.quality}`;
        const itemRef = doc(db, "inventory", docId);
        const { id, ...itemData } = item;
        itemData.lastUpdated = formatDateTime(new Date());
        batch.set(itemRef, itemData);
    }

    await batch.commit();
}

export async function updateInventoryItem(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    const itemData = { ...item, lastUpdated: formatDateTime(new Date()) };
    await writeBatch(db).set(itemRef, itemData).commit();
}

export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    const itemData = { ...item, lastUpdated: formatDateTime(new Date()) };
    await setDoc(itemRef, itemData);
}

export async function removeInventoryItem(item: InventoryItem): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    await deleteDoc(itemRef);
}