import { db } from "./firestore";
import { collection, getDocs, doc, writeBatch, deleteDoc, setDoc, query, where } from "firebase/firestore";
import type { InventoryItem, InventoryLoss } from "../shared/models/inventory";


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

export async function updateInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    const itemData = { ...item, lastUpdated: formatDateTime(new Date()) };
    await writeBatch(db).set(itemRef, itemData).commit();
    if (userEmail) {
        await logOperation({
            operation_type: 'update_inventory',
            user_name: userEmail,
            message: `Actualizó el inventario: ${item.item} (${item.quality}), cantidad: ${item.quantity}`
        });
    }
}

export async function addInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    const itemData = { ...item, lastUpdated: formatDateTime(new Date()) };
    await setDoc(itemRef, itemData);
    if (userEmail) {
        await logOperation({
            operation_type: 'add_inventory',
            user_name: userEmail,
            message: `Agregó al inventario: ${item.item} (${item.quality}), cantidad: ${item.quantity}`
        });
    }
}

export async function removeInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    const docId = item.id ?? `${item.item}_${item.quality}`;
    const itemRef = doc(db, "inventory", docId);
    await deleteDoc(itemRef);
    if (userEmail) {
        await logOperation({
            operation_type: 'remove_inventory',
            user_name: userEmail,
            message: `Eliminó del inventario: ${item.item} (${item.quality})`
        });
    }
}

export async function getInventoryLoss(): Promise<InventoryLoss[]> {
    const lossCollection = collection(db, "inventory_loss");
    const snapshot = await getDocs(lossCollection);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data() as InventoryLoss;
        return { id: docSnap.id, ...data };
    });
}

export async function addInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
    // Query only the relevant inventory item
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, where("item", "==", loss.item), where("quality", "==", loss.quality));
    const invSnap = await getDocs(q);
    const invItem = invSnap.docs.length > 0 ? { id: invSnap.docs[0].id, ...invSnap.docs[0].data() } as InventoryItem : null;
    if (!invItem || invItem.quantity < loss.quantity) throw new Error('No hay suficiente inventario para registrar la pérdida.');
    await updateInventoryItem({ ...invItem, quantity: invItem.quantity - loss.quantity }, userEmail);
    // Add loss doc
    const lossRef = doc(db, "inventory_loss", `${loss.item}_${loss.quality}_${Date.now()}`);
    await setDoc(lossRef, loss);
    if (userEmail) {
        await logOperation({
            operation_type: 'add_inventory_loss',
            user_name: userEmail,
            message: `Registró pérdida: ${loss.item} (${loss.quality}), cantidad: ${loss.quantity}`
        });
    }
}

export async function removeInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
    // Query only the relevant inventory item
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, where("item", "==", loss.item), where("quality", "==", loss.quality));
    const invSnap = await getDocs(q);
    const invItem = invSnap.docs.length > 0 ? { id: invSnap.docs[0].id, ...invSnap.docs[0].data() } as InventoryItem : null;
    if (!invItem) throw new Error('No se encontró el artículo en inventario.');
    await updateInventoryItem({ ...invItem, quantity: invItem.quantity + loss.quantity }, userEmail);
    // Remove loss doc
    const lossRef = doc(db, "inventory_loss", loss.id!);
    await deleteDoc(lossRef);
    if (userEmail) {
        await logOperation({
            operation_type: 'remove_inventory_loss',
            user_name: userEmail,
            message: `Eliminó pérdida y restauró inventario: ${loss.item} (${loss.quality}), cantidad: ${loss.quantity}`
        });
    }
}

export async function logOperation({ operation_type, user_name, message }: { operation_type: string, user_name: string, message: string }) {
    try {
        await fetch('https://cf-flowershop-logs-hanlder-265978683065.us-central1.run.app/log_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation_type, user_name, message })
        });
    } catch (err) {
        // Optionally handle logging error
        console.error('Error logging operation', err);
    }
}