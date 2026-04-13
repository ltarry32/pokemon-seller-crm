'use client'

import { useState } from 'react'
import { useCreateSoldTransaction } from '@/hooks/useSoldLog'
import { useInventoryItems } from '@/hooks/useInventory'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { calcProfit } from '@/lib/utils'
import type { SoldTransactionInput } from '@/lib/validations'
import type { SalePlatform, PaymentMethod, CardCondition } from '@/types'

const PLATFORMS:       SalePlatform[]   = ['eBay','TCGPlayer','Facebook Marketplace','Card Show','Local','Whatnot','Instagram','Mercari','Other']
const PAYMENT_METHODS: PaymentMethod[]  = ['PayPal','Venmo','Cash','Credit Card','Zelle','Bank Transfer','Other']

const PLATFORM_FEES: Record<string, number> = {
  eBay: 13.25, TCGPlayer: 10.25, Whatnot: 10, Mercari: 10,
}

interface AddSaleFormProps {
  onSuccess?: () => void
}

export function AddSaleForm({ onSuccess }: AddSaleFormProps) {
  const { mutate: createSale, isPending } = useCreateSoldTransaction()
  const { data: inventory = [] } = useInventoryItems()

  const activeInventory = inventory.filter(i => i.status !== 'sold')

  const [form, setForm] = useState({
    linked_item_id:  '',
    card_name:       '',
    set_name:        '',
    card_number:     '',
    condition:       'Near Mint' as CardCondition,
    is_graded:       false,
    grade:           '',
    image_url:       null as string | null,
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
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const set = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleLinkItem = (id: string) => {
    set('linked_item_id', id)
    if (!id) return
    const item = inventory.find(i => i.id === id)
    if (item) {
      setForm(prev => ({
        ...prev,
        linked_item_id: id,
        card_name:      item.card_name,
        set_name:       item.set_name,
        card_number:    item.card_number ?? '',
        condition:      item.condition as CardCondition,
        is_graded:      item.is_graded,
        grade:          item.grade ?? '',
        cost_basis:     String(item.cost_basis),
        sold_price:     item.list_price ? String(item.list_price) : '',
        image_url:      item.image_url ?? null,
      }))
    }
  }

  const handlePlatformChange = (platform: SalePlatform) => {
    set('platform', platform)
    const soldPrice = Number(form.sold_price) || 0
    const feeRate = PLATFORM_FEES[platform]
    if (soldPrice > 0 && feeRate) {
      set('fees', (soldPrice * feeRate / 100).toFixed(2))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      inventory_item_id: form.linked_item_id || null,
      card_name:         form.card_name,
      set_name:          form.set_name || null,
      card_number:       form.card_number || null,
      condition:         form.condition || null,
      is_graded:         form.is_graded,
      grade:             form.is_graded ? form.grade || null : null,
      image_url:         form.image_url,
      sold_price:        Number(form.sold_price),
      platform:          form.platform || null,
      buyer_name:        form.buyer_name || null,
      fees:              Number(form.fees) || 0,
      shipping_cost:     Number(form.shipping_cost) || 0,
      packaging_cost:    Number(form.packaging_cost) || 0,
      cost_basis:        Number(form.cost_basis) || 0,
      payment_method:    form.payment_method || null,
      tracking_number:   form.tracking_number || null,
      date_sold:         (() => {
        const raw = form.date_sold?.trim()
        if (!raw) return new Date().toISOString()
        const d = new Date(raw + 'T12:00:00Z')
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
      })(),
      notes:             form.notes || null,
    }

    createSale(payload as SoldTransactionInput, {
      onSuccess: (result) => {
        if (!result.success) {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }
        onSuccess?.()
      },
    })
  }

  const previewProfit = calcProfit(
    Number(form.cost_basis) || 0,
    Number(form.sold_price) || 0,
    Number(form.fees) || 0,
    Number(form.shipping_cost) || 0,
    Number(form.packaging_cost) || 0,
  )

  const fe = (key: string) => fieldErrors[key]?.[0]

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
          <option value="">— Manual entry —</option>
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
          <Input label="Card Name *" value={form.card_name} onChange={e => set('card_name', e.target.value)} placeholder="e.g. Charizard ex" error={fe('card_name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Set" value={form.set_name} onChange={e => set('set_name', e.target.value)} />
            <Input label="Number" value={form.card_number} onChange={e => set('card_number', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Sale details */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sale Details</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sold Price ($) *" type="number" step="0.01" min="0" value={form.sold_price} onChange={e => set('sold_price', e.target.value)} error={fe('sold_price')} />
            <Input label="Cost Basis ($)" type="number" step="0.01" min="0" value={form.cost_basis} onChange={e => set('cost_basis', e.target.value)} hint="What you paid" />
          </div>

          <select value={form.platform} onChange={e => handlePlatformChange(e.target.value as SalePlatform)}
            className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500">
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Fees ($)" type="number" step="0.01" min="0" value={form.fees} onChange={e => set('fees', e.target.value)} />
            <Input label="Shipping ($)" type="number" step="0.01" min="0" value={form.shipping_cost} onChange={e => set('shipping_cost', e.target.value)} />
            <Input label="Packaging ($)" type="number" step="0.01" min="0" value={form.packaging_cost} onChange={e => set('packaging_cost', e.target.value)} />
          </div>

          {/* Live profit preview */}
          {form.sold_price && (
            <div className="bg-surface-2 rounded-xl border border-zinc-700 p-3">
              <p className="text-xs text-zinc-500 mb-1">Estimated Net Profit (computed server-side on save)</p>
              <p className={`text-lg font-bold ${previewProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                {previewProfit >= 0 ? '+' : ''}${previewProfit.toFixed(2)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Date Sold" type="date" value={form.date_sold} onChange={e => set('date_sold', e.target.value)} />
            <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500 mt-5">
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <Input label="Buyer Name / Username" value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} placeholder="Optional" />
          <Input label="Tracking Number" value={form.tracking_number} onChange={e => set('tracking_number', e.target.value)} placeholder="Optional" />
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </div>
      </section>

      <Button type="submit" fullWidth size="lg" loading={isPending}>
        Record Sale
      </Button>
    </form>
  )
}
