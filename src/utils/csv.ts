import { parse, unparse } from "papaparse";
import type { Order } from "../types";

export function ordersToCSV(orders: Order[]): string {
  return unparse(
    orders.map((o) => ({
      id: o.id,
      name: o.name,
      image: o.image,
      createdAt: o.createdAt.toISOString(),
      price: o.price,
    })),
    { columns: ["id", "name", "image", "createdAt", "price"] }
  );
}

export function csvToOrders(csv: string): Order[] {
  const { data } = parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  return (data as Record<string, string>[]).map((row) => ({
    id: row.id,
    name: row.name,
    image: row.image,
    createdAt: new Date(row.createdAt),
    price: Number(row.price),
  }));
}
