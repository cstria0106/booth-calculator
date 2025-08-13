import type { Order } from './types';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mergeOrders(existing: Order[], incoming: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const order of existing) {
    map.set(order.id, order);
  }
  for (const order of incoming) {
    map.set(order.id, order);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
