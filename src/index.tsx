document.body.innerHTML = "";
import "twind/shim";

import { render } from "preact";
import { useState } from "preact/hooks";
import { fetchOrders } from "./booth";
import type { Order } from "./types";
import { App } from "./ui";
import { mergeOrders } from "./utils";

function Root() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function handleFetch() {
    const existing = new Set(orders.map((o) => o.id));
    const fetched = await fetchOrders(existing);
    setOrders((prev) => mergeOrders(prev, fetched));
  }

  function handleImport(list: Order[]) {
    setOrders((prev) => mergeOrders(prev, list));
  }

  return <App orders={orders} onFetch={handleFetch} onImport={handleImport} />;
}

render(<Root />, document.body);
