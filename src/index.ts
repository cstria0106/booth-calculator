type Order = { href: string; name: string };

(async () => {
  document.body.innerHTML = `
    <h1>BOOTH Calculator</h1>
    <div id="total"></div>
    <div id="status"></div>
    <style>
        #status {
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
            border: 1px solid #ccc;
        }
    </style>
  `;

  const getStatusElement = () => {
    return document.getElementById("status");
  };

  const getTotalElement = () => {
    return document.getElementById("total");
  };

  function print(text: string): void {
    const statusElement = getStatusElement();
    if (!statusElement) return;
    const newElement = document.createElement("div");
    newElement.textContent = text;
    statusElement.appendChild(newElement);
    statusElement.scrollTop = statusElement.scrollHeight;
  }

  let total = 0;
  function addTotal(value: number): void {
    total += value;
    const totalElement = getTotalElement();
    if (!totalElement) return;
    totalElement.textContent = `Total: ${total} JPY`;
  }

  async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function listOrders(page: number): Promise<Order[]> {
    const response = await fetch(
      `https://accounts.booth.pm/orders?page=${page}`
    );

    if (response.ok) {
      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/html");
      const orders = Array.from(doc.querySelectorAll(".l-orders-index > a"));
      return orders
        .map((order) => {
          const href = order.getAttribute("href");
          const name = order.querySelector(".u-tpg-caption1");
          if (!href || !name || name.textContent === null) {
            return null;
          }
          return {
            href: `https://accounts.booth.pm${href}`,
            name: name.textContent.trim(),
          };
        })
        .filter((order) => order !== null);
    }

    throw new Error("Failed to fetch orders");
  }

  function parsePageNumber(element: Element): number {
    const href = element.getAttribute("href");
    if (!href) return 1; // Default to page 1 if no href
    const match = href.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  async function getLastPage(): Promise<number> {
    const response = await fetch("https://accounts.booth.pm/orders");
    if (!response.ok) {
      throw new Error("Failed to fetch the first page of orders");
    }
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    let lastPageButton = doc.querySelector(".nav-item.last-page");
    if (!lastPageButton) {
      lastPageButton = doc.querySelector("li:last-child .nav-item");
    }
    return lastPageButton ? parsePageNumber(lastPageButton) : 1;
  }

  async function getOrderPrice(order: Order): Promise<number> {
    const response = await fetch(order.href);
    if (!response.ok) {
      throw new Error(`Failed to fetch order details for ${order.name}`);
    }
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    const priceElements = doc.querySelectorAll(
      ".u-tpg-caption1.u-text-gray-500"
    );
    if (priceElements.length === 0) {
      throw new Error(`No price found for order ${order.name}`);
    }
    const priceText = priceElements[0].textContent?.trim();
    const boostText = priceElements[1].textContent?.trim();
    if (!priceText || !boostText) {
      throw new Error(`Price or boost text not found for order ${order.name}`);
    }

    // price text is formatted like '1,800 JPY'
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10);
    const boost = parseInt(boostText.replace(/[^0-9]/g, ""), 10);
    if (isNaN(price) || isNaN(boost)) {
      throw new Error(`Invalid price or boost for order ${order.name}`);
    }
    return price + boost;
  }

  async function main() {
    let page = 1;
    const lastPage = await getLastPage();
    await wait(1000);
    while (true) {
      print(`주문 목록 불러오는 중 ${page}/${lastPage}...`);
      const orders = await listOrders(page);
      if (orders.length === 0 || page >= lastPage) {
        print("모든 주문 내용을 불러왔습니다.");
        break;
      }
      for (const order of orders) {
        const price = await getOrderPrice(order);
        addTotal(price);
        await wait(1000);
        print(`주문: ${order.name}, 가격: ${price} JPY`);
      }
      page++;
      await wait(3000);
    }
  }

  main().catch((error) => {
    alert("An error occurred: " + error.message);
    console.error(error);
  });
})();
