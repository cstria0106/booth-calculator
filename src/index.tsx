document.documentElement.innerHTML = "";

import "twind/shim";

import { render } from "preact";
import { useRef, useState } from "preact/hooks";
import { App } from "./App";
import { ToastProvider, useToast } from "./toast";
import type { Order } from "./types";
import { streamOrders } from "./utils/booth";
import { mergeOrders } from "./utils/order";

function Root() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const toast = useToast();

  async function handleFetch() {
    if (isFetching) return;
    const toastId = toast.loading("BOOTH에서 주문 내역 불러오는 중...");

    const existing = new Set(orders.map((o) => o.id));
    const controller = new AbortController();
    abortRef.current = controller;
    setIsFetching(true);
    try {
      for await (const order of streamOrders(existing, {
        signal: controller.signal,
      })) {
        setOrders((prev) => mergeOrders(prev, [order]));
      }
      toast.success("주문 내역을 불러왔습니다!");
    } finally {
      toast.dismiss(toastId);
      setIsFetching(false);
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  function handleImport(list: Order[]) {
    setOrders((prev) => mergeOrders(prev, list));
  }

  return (
    <App
      orders={orders}
      onFetch={handleFetch}
      onCancel={handleCancel}
      isFetching={isFetching}
      onImport={handleImport}
    />
  );
}

render(
  <ToastProvider>
    <Root />
  </ToastProvider>,
  document.body
);
