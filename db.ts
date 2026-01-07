
import { Material, InboundTransaction, OutboundTransaction, InboundSource, User } from './types';

const MATERIALS_KEY = 'warehouse_materials';
const INBOUND_KEY = 'warehouse_inbound';
const OUTBOUND_KEY = 'warehouse_outbound';
const USERS_KEY = 'warehouse_users';

const DUMMY_MATERIALS: Material[] = [
  { id: '1', material_number: 'MTR-001', material_name: 'Kabel Twisted AL 3x70+1x50 mm2', unit: 'Meter', current_stock: 1200 },
  { id: '2', material_number: 'MTR-002', material_name: 'Isolator Tumpu 20kV', unit: 'Pcs', current_stock: 450 },
  { id: '3', material_number: 'MTR-003', material_name: 'Trafo Distribusi 200kVA', unit: 'Unit', current_stock: 12 },
  { id: '4', material_number: 'MTR-004', material_name: 'Tiang Beton 9 Meter', unit: 'Batang', current_stock: 85 },
  { id: '5', material_number: 'MTR-005', material_name: 'Circuit Breaker 100A', unit: 'Set', current_stock: 30 }
];

const INITIAL_USER: User = { id: '1', username: 'admin', password: 'admin123', role: 'admin' };

export const db = {
  // --- Materials ---
  getMaterials: (): Material[] => {
    const data = localStorage.getItem(MATERIALS_KEY);
    if (!data) {
      localStorage.setItem(MATERIALS_KEY, JSON.stringify(DUMMY_MATERIALS));
      return DUMMY_MATERIALS;
    }
    return JSON.parse(data);
  },

  addMaterial: (material: Omit<Material, 'id'>): void => {
    const materials = db.getMaterials();
    const newMaterial = { ...material, id: crypto.randomUUID() };
    localStorage.setItem(MATERIALS_KEY, JSON.stringify([...materials, newMaterial]));
  },

  updateMaterial: (id: string, updates: Partial<Material>): void => {
    const materials = db.getMaterials();
    const updated = materials.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(updated));
  },

  deleteMaterial: (id: string): void => {
    const materials = db.getMaterials();
    const filtered = materials.filter(m => m.id !== id);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(filtered));
  },

  batchAddMaterials: (newMaterials: Omit<Material, 'id'>[]): void => {
    const materials = db.getMaterials();
    const prepared = newMaterials.map(m => ({ ...m, id: crypto.randomUUID() }));
    localStorage.setItem(MATERIALS_KEY, JSON.stringify([...materials, ...prepared]));
  },

  // --- Users ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify([INITIAL_USER]));
      return [INITIAL_USER];
    }
    return JSON.parse(data);
  },

  addUser: (user: Omit<User, 'id'>): void => {
    const users = db.getUsers();
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...user, id: crypto.randomUUID() }]));
  },

  updateUser: (id: string, updates: Partial<User>): void => {
    const users = db.getUsers();
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  },

  deleteUser: (id: string): void => {
    const users = db.getUsers();
    if (users.length <= 1) return; // Prevent deleting last user
    localStorage.setItem(USERS_KEY, JSON.stringify(users.filter(u => u.id !== id)));
  },

  // --- Transactions ---
  getInboundTransactions: (): InboundTransaction[] => {
    const data = localStorage.getItem(INBOUND_KEY);
    return data ? JSON.parse(data) : [];
  },

  getOutboundTransactions: (): OutboundTransaction[] => {
    const data = localStorage.getItem(OUTBOUND_KEY);
    return data ? JSON.parse(data) : [];
  },

  getNextSequenceNumber: (): string => {
    const outbound = db.getOutboundTransactions();
    const currentYear = new Date().getFullYear();
    const yearTransactions = outbound.filter(t => new Date(t.date).getFullYear() === currentYear);
    const uniqueSlips = new Set(yearTransactions.map(t => t.request_number));
    return (uniqueSlips.size + 1).toString().padStart(5, '0');
  },

  updateTug9Number: (id: string, tug9: string): void => {
    const outbound = db.getOutboundTransactions();
    const updated = outbound.map(tx => tx.id === id ? { ...tx, tug9_number: tug9 } : tx);
    localStorage.setItem(OUTBOUND_KEY, JSON.stringify(updated));
  },

  updateOutboundTransaction: (id: string, updates: Partial<OutboundTransaction>): void => {
    const outbound = db.getOutboundTransactions();
    const updated = outbound.map(tx => tx.id === id ? { ...tx, ...updates } : tx);
    localStorage.setItem(OUTBOUND_KEY, JSON.stringify(updated));
  },

  saveInboundBatch: (common: Omit<InboundTransaction, 'id' | 'material_id' | 'volume_in'>, items: { material_id: string, volume_in: number }[]): void => {
    const materials = db.getMaterials();
    const inbound = db.getInboundTransactions();
    const newTransactions: InboundTransaction[] = items.map(item => ({ ...common, id: crypto.randomUUID(), ...item }));
    const updatedMaterials = materials.map(m => {
      const batchItem = items.find(i => i.material_id === m.id);
      return batchItem ? { ...m, current_stock: m.current_stock + batchItem.volume_in } : m;
    });
    localStorage.setItem(INBOUND_KEY, JSON.stringify([...inbound, ...newTransactions]));
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(updatedMaterials));
  },

  saveOutboundBatch: (common: Omit<OutboundTransaction, 'id' | 'material_id' | 'volume_out' | 'request_number'>, items: { material_id: string, volume_out: number }[]): OutboundTransaction[] => {
    const materials = db.getMaterials();
    const outbound = db.getOutboundTransactions();
    const sequence = db.getNextSequenceNumber();
    const newTransactions: OutboundTransaction[] = items.map(item => ({
      ...common,
      request_number: sequence,
      id: crypto.randomUUID(),
      ...item
    }));
    const updatedMaterials = materials.map(m => {
      const batchItem = items.find(i => i.material_id === m.id);
      return batchItem ? { ...m, current_stock: m.current_stock - batchItem.volume_out } : m;
    });
    localStorage.setItem(OUTBOUND_KEY, JSON.stringify([...outbound, ...newTransactions]));
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(updatedMaterials));
    return newTransactions;
  },

  getMaterialHistory: (materialId: string) => {
    const inbound = db.getInboundTransactions().filter(t => t.material_id === materialId);
    const outbound = db.getOutboundTransactions().filter(t => t.material_id === materialId);
    const history = [
      ...inbound.map(t => ({ id: t.id, date: t.date, type: 'IN' as const, reference: t.contract_number, info: t.source, volume: t.volume_in })),
      ...outbound.map(t => ({ id: t.id, date: t.date, type: 'OUT' as const, reference: t.request_number, info: t.purpose, volume: t.volume_out }))
    ];
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
