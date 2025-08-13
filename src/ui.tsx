import { useRef, useState } from 'preact/hooks';
import Button from 'preact-material-components/Button';
import Card from 'preact-material-components/Card';
import TabBar from 'preact-material-components/TabBar';
import List from 'preact-material-components/List';
import type { Order } from './types';
import { ordersToCSV, csvToOrders } from './csv';

interface AppProps {
  orders: Order[];
  onFetch: () => Promise<void> | void;
  onImport: (orders: Order[]) => void;
}

export function App({ orders, onFetch, onImport }: AppProps) {
  const [tab, setTab] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = orders.reduce((sum, o) => sum + o.price, 0);
  const monthly: Record<string, number> = {};
  orders.forEach((o) => {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + o.price;
  });

  function handleSave() {
    const csv = ordersToCSV(orders);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleLoad(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const list = csvToOrders(text);
      onImport(list);
    };
    reader.readAsText(file);
    input.value = '';
  }

  return (
    <div style="padding: 16px">
      <h1>BOOTH Calculator</h1>
      <TabBar activeTabIndex={tab} onChange={(e: any) => setTab(e.detail.activeTabIndex)}>
        <TabBar.Tab>Orders</TabBar.Tab>
        <TabBar.Tab>Import/Export</TabBar.Tab>
      </TabBar>

      {tab === 0 && (
        <div>
          <Card>
            <div class="mdc-card__primary-action" style="padding:16px">
              <h2 class="mdc-typography--headline6">Totals</h2>
              <div style="margin:8px 0">{total} JPY</div>
              <List two-line>
                {Object.entries(monthly).map(([m, v]) => (
                  <List.Item>
                    <List.TextContainer>
                      <List.PrimaryText>{m}</List.PrimaryText>
                      <List.SecondaryText>{v} JPY</List.SecondaryText>
                    </List.TextContainer>
                  </List.Item>
                ))}
              </List>
            </div>
          </Card>
          <Button raised onClick={onFetch} style="margin:16px 0">
            Fetch from BOOTH
          </Button>
          <List two-line>
            {orders.map((o) => (
              <List.Item key={o.id}>
                <List.TextContainer>
                  <List.PrimaryText>{o.name}</List.PrimaryText>
                  <List.SecondaryText>
                    {o.createdAt.toISOString().split('T')[0]}
                  </List.SecondaryText>
                </List.TextContainer>
                <List.ItemMetaText>{o.price} JPY</List.ItemMetaText>
              </List.Item>
            ))}
          </List>
        </div>
      )}

      {tab === 1 && (
        <div>
          <Button raised onClick={handleSave} style="margin-right:8px">
            Save CSV
          </Button>
          <Button raised onClick={() => fileRef.current?.click()}>
            Load CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleLoad}
            style="display:none"
          />
        </div>
      )}
    </div>
  );
}

