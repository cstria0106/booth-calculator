import type { Order } from './types';
import { wait } from './utils';

interface OrderSummary {
  id: string;
  name: string;
  href: string;
}

function parseOrderId(href: string): string {
  const parts = href.split('/');
  return parts[parts.length - 1];
}

async function fetchOrderList(page: number): Promise<OrderSummary[]> {
  const res = await fetch(`https://accounts.booth.pm/orders?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const anchors = Array.from(doc.querySelectorAll('.l-orders-index > a'));
  return anchors.map((a) => {
    const href = a.getAttribute('href')!;
    const name = a.querySelector('.u-tpg-caption1')?.textContent?.trim() || '';
    return { id: parseOrderId(href), name, href: `https://accounts.booth.pm${href}` };
  });
}

function parseDetailMap(doc: Document): Record<string, string> {
  const map: Record<string, string> = {};
  const labels = Array.from(doc.querySelectorAll('.l-row .l-col-pc-3'));
  for (const labelEl of labels) {
    const label = labelEl.textContent?.trim();
    const value = labelEl.nextElementSibling?.textContent?.trim();
    if (label && value) map[label] = value;
  }
  return map;
}

async function fetchOrderDetail(summary: OrderSummary): Promise<Order> {
  const res = await fetch(summary.href);
  if (!res.ok) throw new Error('Failed to fetch order detail');
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const details = parseDetailMap(doc);
  const created = new Date(details['Created At']);
  const priceText = details['결제 금액'] || '0';
  const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
  return { id: summary.id, name: summary.name, createdAt: created, price };
}

function parsePageNumber(el: Element | null): number {
  if (!el) return 1;
  const href = el.getAttribute('href');
  if (!href) return 1;
  const match = href.match(/page=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

async function getLastPage(): Promise<number> {
  const res = await fetch('https://accounts.booth.pm/orders');
  if (!res.ok) throw new Error('Failed to fetch first page');
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let last = doc.querySelector('.nav-item.last-page');
  if (!last) last = doc.querySelector('li:last-child .nav-item');
  return parsePageNumber(last);
}

export async function fetchOrders(existingIds: Set<string>): Promise<Order[]> {
  const orders: Order[] = [];
  let page = 1;
  const lastPage = await getLastPage();
  while (page <= lastPage) {
    const list = await fetchOrderList(page);
    if (list.length === 0) break;
    for (const summary of list) {
      if (existingIds.has(summary.id)) {
        return orders;
      }
      const detail = await fetchOrderDetail(summary);
      orders.push(detail);
      await wait(1000);
    }
    page++;
    await wait(3000);
  }
  return orders;
}
