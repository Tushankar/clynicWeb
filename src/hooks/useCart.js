import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Storefront cart (Ultra Premium, UP-D). Persisted in localStorage, keyed per clinic slug
 * (`clynic_store_cart_${slug}`) so two clinics' carts never bleed into each other. Backed by a
 * module-level store + useSyncExternalStore, so every component on a store page (navbar badge,
 * product page, cart) reflects a change instantly without a Provider wrapping the routes.
 *
 * Item shape: { medicineId, name, price, qty, prescriptionRequired, unit, imageUrl }.
 */
const KEY = (slug) => `clynic_store_cart_${slug}`;

const mem = new Map(); // slug -> items[]  (cached reference; stable until write() replaces it)
const listeners = new Map(); // slug -> Set<fn>

function read(slug) {
  if (mem.has(slug)) return mem.get(slug);
  let items = [];
  try {
    const raw = localStorage.getItem(KEY(slug));
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }
  if (!Array.isArray(items)) items = [];
  mem.set(slug, items);
  return items;
}

function write(slug, items) {
  mem.set(slug, items);
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(items));
  } catch {
    /* storage unavailable — cart still lives in memory for this tab */
  }
  listeners.get(slug)?.forEach((fn) => fn());
}

function subscribe(slug, fn) {
  if (!listeners.has(slug)) listeners.set(slug, new Set());
  listeners.get(slug).add(fn);
  return () => listeners.get(slug)?.delete(fn);
}

export function useCart(slug) {
  const items = useSyncExternalStore(
    useCallback((cb) => subscribe(slug, cb), [slug]),
    useCallback(() => read(slug), [slug]),
    useCallback(() => read(slug), [slug])
  );

  const add = useCallback(
    (item, qty = 1) => {
      if (!item?.medicineId) return;
      const current = read(slug);
      const idx = current.findIndex((i) => i.medicineId === item.medicineId);
      if (idx >= 0) {
        const next = current.slice();
        next[idx] = { ...next[idx], qty: Math.max(1, (next[idx].qty || 0) + qty) };
        write(slug, next);
      } else {
        write(slug, [
          ...current,
          {
            medicineId: item.medicineId,
            name: item.name,
            price: Number(item.price) || 0,
            qty: Math.max(1, qty),
            prescriptionRequired: !!item.prescriptionRequired,
            unit: item.unit || '',
            imageUrl: item.imageUrl || '',
          },
        ]);
      }
    },
    [slug]
  );

  const setQty = useCallback(
    (medicineId, qty) => {
      const current = read(slug);
      const n = Math.floor(Number(qty) || 0);
      if (n <= 0) {
        write(slug, current.filter((i) => i.medicineId !== medicineId));
        return;
      }
      write(slug, current.map((i) => (i.medicineId === medicineId ? { ...i, qty: n } : i)));
    },
    [slug]
  );

  const remove = useCallback(
    (medicineId) => write(slug, read(slug).filter((i) => i.medicineId !== medicineId)),
    [slug]
  );

  const clear = useCallback(() => write(slug, []), [slug]);

  const count = useMemo(() => items.reduce((s, i) => s + (i.qty || 0), 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price) || 0) * (i.qty || 0), 0),
    [items]
  );

  return { items, add, setQty, remove, clear, count, subtotal };
}
