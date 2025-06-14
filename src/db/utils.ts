import { db } from "./firestore";
import { collection, getDocs, doc, writeBatch, deleteDoc, setDoc, query, where } from "firebase/firestore";


export type InventoryItem = {
    id?: string;
    item: string;
    quantity: number;
    quality: string;
    lastUpdated?: string;
};

export type InventoryLoss = {
    id?: string;
    item: string;
    quality: string;
    quantity: number;
    timestamp: string;
};

export async function getInventory(): Promise<InventoryItem[]> {
    const inventoryCollection = collection(db, "inventory");
    const snapshot = await getDocs(inventoryCollection);

    return snapshot.docs.map(docSnap => {
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

export async function getInventoryLoss(): Promise<InventoryLoss[]> {
    const lossCollection = collection(db, "inventory_loss");
    const snapshot = await getDocs(lossCollection);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data() as InventoryLoss;
        return { id: docSnap.id, ...data };
    });
}

export async function addInventoryLoss(loss: InventoryLoss): Promise<void> {
    // Query only the relevant inventory item
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, where("item", "==", loss.item), where("quality", "==", loss.quality));
    const invSnap = await getDocs(q);
    const invItem = invSnap.docs.length > 0 ? { id: invSnap.docs[0].id, ...invSnap.docs[0].data() } as InventoryItem : null;
    if (!invItem || invItem.quantity < loss.quantity) throw new Error('No hay suficiente inventario para registrar la pérdida.');
    await updateInventoryItem({ ...invItem, quantity: invItem.quantity - loss.quantity });
    // Add loss doc
    const lossRef = doc(db, "inventory_loss", `${loss.item}_${loss.quality}_${Date.now()}`);
    await setDoc(lossRef, loss);
}

export async function removeInventoryLoss(loss: InventoryLoss): Promise<void> {
    // Query only the relevant inventory item
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, where("item", "==", loss.item), where("quality", "==", loss.quality));
    const invSnap = await getDocs(q);
    const invItem = invSnap.docs.length > 0 ? { id: invSnap.docs[0].id, ...invSnap.docs[0].data() } as InventoryItem : null;
    if (!invItem) throw new Error('No se encontró el artículo en inventario.');
    await updateInventoryItem({ ...invItem, quantity: invItem.quantity + loss.quantity });
    // Remove loss doc
    const lossRef = doc(db, "inventory_loss", loss.id!);
    await deleteDoc(lossRef);
}