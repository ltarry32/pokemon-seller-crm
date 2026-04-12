'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { tempId, calcProfit } from '@/lib/utils';
import type { SoldTransaction, SalePlatform, PaymentMethod, CardCondition } from '@/types';

const PLATFORMS: SalePlatform[] = ['eBay','TCGPlayer','Facebook Marketplace','Card Show','Local','Whatnot','Instagram','Mercari','Other'];
const PAYMENT_METHODS: PaymentMethod[] = ['PayPal','Venmo','Cash','Credit Card','Zelle','Bank Transfer','Other'];

interface AddSaleFormProps {
  onSuccess?: () => void;
}

export function AddSaleForm({ onSuccess }: AddSaleFormProps) {
  const { addSoldTransaction, markAsSold, inventory } = useAppStore();
  const activeInventory = inventory.filter(i => i.status !== 'sold');

  const [form, setForm] = useState({
    linked_item_id:  '',
    card_name:       '',
    set_name:        '',
    card_number:     '',
    condition:       'Near Mint' as CardCondition,
    is_graded:       false,
    grade:           '',
    sold_price:      '',
    platform:        'eBay' as SalePlatform,
    buyer_name:      '',
    fees:            '',
    shipping_cost:   '',
    packaging_cost:  '',
    cost_basis:      '',
    payment_method:  'PayPal' as PaymentMethod,
    tracking_number: '',
    date_sold:       new Date().toISOString().split('T')[0],
    notes:           '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  // Auto-fill from linked inventory item
  const handleLinkItem = (id: string) => {
    set('linked_item_id', id);
    if (!id) return;
    const item = inventory.find(i => i.id === id);
    if (item) {
      setForm(prev => ({
        ...prev,
        linked_item_id:  id,
        card_name:       item.card_name,
        set_name:        item.set_name,
        card_number:     item.card_number,
        condition:       item.condition,
        is_graded:       item.is_graded,
        grade:           item.grade ?? '',
        cost_basis:      String(item.cost_basis),
        sold_price:      item.list_price ? String(item.list_price) : '',
      }));
    }
  };

  // Auto-compute fees from platform
  const handlePlatformChange = (platform: SalePlatform) => {
    set('platform', platform);
    const soldPrice = Number(form.sold_price) || 0;
    const platformFees: Record<string, number> = {
      eBay:      0.1325,
      TCGPlayer: 0.1025,
      Whatnot:   0.10,
      Mercari:   0.10,
    };
    if (soldPrice > 0 && platformFees[platform]) {
      set('fees', (soldPrice * platformFees[platform]).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.card_name || !form.sold_price) {
      toast.error('Card name and sold price are required');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const sold_price     = Number(form.sold_price);
    const fees           = Number(form.fees) || 0;
    const shipping_cost  = Number(form.shipping_cost) || 0;
    const packaging_cost = Number(form.packaging_cost) || 0;
    const cost_basis     = Number(form.cost_basis) || 0;
    const net_profit     = calcProfit(cost_basis, sold_price, fees, shipping_cost, packaging_cost);

    const tx: SoldTransaction = {
      id:                 tempId(),
      user_id:            'user-demo',
      inventory_item_id:  form.linked_item_id || null,
      card_name:          form.card_name,
      set_name:           form.set_name,
      card_number:        form.card_number,
      condition:          form.condition,
      is_graded:          form.is_graded,
      grade:              form.is_graded ? form.grade || null : null,
      image_url:          null,
      sold_price,
      platform:           form.platform,
      buyer_name:         form.buyer_name || null,
      fees,
      shipping_cost,
      packaging_cost,
      cost_basis,
      net_profit,
      payment_method:     form.payment_method,
      tracking_number:    form.tracking_number || null,
      date_sold:          new Date(form.date_sold).toISOString(),
      notes:              form.notes || null,
      created_at:         new Date().toISOString(),
    };

    addSoldTransaction(tx);
    if (form.linked_item_id) markAsSold(form.linked_item_id);

    toast.success(`Sale recorded! Net profit: $${net_profit.toFixed(2)}`);
    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Link to inventory */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Link to Inventory (optional)</h3>
        <select
          value={form.linked_item_id}
          onChange={e => handleLinkItem(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">— Manual entry (not linked) —</option>
          {activeInventory.map(item => (
            <option key={item.id} value={item.id}>
              {item.card_name} — {item.set_name} #{item.card_number}
            </option>
          ))}
        </select>
      </section>

      {/* Card info */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Card Info</h3>
        <div className="space-y-3">
          <Input label="Card Name *" value={form.card_name} onChange={e => set('card_name', e.target.value)} placeholder="e.g. Charizard ex" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Set" value={form.set_name} onChange={e => set('set_name', e.target.value)} placeholder="Set name" />
            <Input label="Number" value={form.card_number} onChange={e => set('card_number', e.target.value)} placeholder="125/197" />
          </div>
        </div>
      </section>

      {/* Sale details */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sale Details</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sold Price ($) *" type="number" step="0.01" min="0" value={form.sold_price} onChange={e => set('sold_price', e.target.value)} />
            <Input label="Cost Basis ($)" type="number" step="0.01" min="0" value={form.cost_basis} onChange={e => set('cost_basis', e.target.value)} hint="What you paid" />
          </div>

          <select
            value={form.platform}
            onChange={e => handlePlatformChange(e.target.value as SalePlatform)}
            className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Fees ($)" type="number" step="0.01" min="0" value={form.fees} onChange={e => set('fees', e.target.value)} />
            <Input label="Shipping ($)" type="number" step="0.01" min="0" value={form.shipping_cost} onChange={e => set('shipping_cost', e.target.value)} />
            <Input label="Packaging ($)" type="number" step="0.01" min="0" value={form.packaging_cost} onChange={e => set('packaging_cost', e.target.value)} />
          </div>

          {/* Net profit preview */}
          {form.sold_price && (
            <div className="bg-surface-2 rounded-xl border border-zinc-700 p-3">
              <p className="text-xs text-zinc-500 mb-1">Estimated Net Profit</p>
              {(() => {
                const profit = calcProfit(
                  Number(form.cost_basis) || 0,
                  Number(form.sold_price) || 0,
                  Number(form.fees) || 0,
                  Number(form.shipping_cost) || 0,
                  Number(form.packaging_cost) || 0,
                );
                return (
                  <p className={`text-lg font-bold ${profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                  </p>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Date Sold" type="date" value={form.date_sold} onChange={e => set('date_sold', e.target.value)} />
            <select
              value={form.payment_method}
              onChange={e => set('payment_method', e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500 mt-5"
            >
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <Input label="Buyer Name / Username" value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} placeholder="Optional" />
          <Input label="Tracking Number" value={form.tracking_number} onChange={e => set('tracking_number', e.target.value)} placeholder="Optional" />
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Notes about the sale..." />
        </div>
      </section>

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Record Sale
      </Button>
    </form>
  );
}
