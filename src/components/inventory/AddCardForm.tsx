'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateInventoryItem } from '@/hooks/useInventory'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { InventoryItemInput } from '@/lib/validations'
import type { CardCondition, CardLanguage, CardRarity, GradingCompany, ItemStatus } from '@/types'

const CONDITIONS:   CardCondition[]   = ['Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged']
const LANGUAGES:    CardLanguage[]    = ['English','Japanese','Korean','Chinese','German','French','Spanish','Italian','Portuguese']
const RARITIES:     CardRarity[]      = ['Common','Uncommon','Rare','Holo Rare','Reverse Holo','Ultra Rare','Secret Rare','Rainbow Rare','Gold Rare','Promo','Illustration Rare','Special Illustration Rare','Hyper Rare']
const GRADING_COS:  GradingCompany[]  = ['PSA','BGS','CGC','SGC','ACE','HGA','Other']

interface AddCardFormProps {
  prefill?: {
    card_name?:   string
    set_name?:    string
    card_number?: string
    rarity?:      CardRarity | null
    image_url?:   string | null
  }
  onSuccess?: () => void
}

export function AddCardForm({ prefill, onSuccess }: AddCardFormProps) {
  const router  = useRouter()
  const { mutate: createItem, isPending } = useCreateInventoryItem()

  // Managed separately from the text form fields because it is
  // set asynchronously (upload fires on file selection, not submit).
  const [imageUrl, setImageUrl] = useState<string | null>(prefill?.image_url ?? null)

  const [form, setForm] = useState({
    card_name:        prefill?.card_name        ?? '',
    set_name:         prefill?.set_name         ?? '',
    card_number:      prefill?.card_number      ?? '',
    rarity:           prefill?.rarity           ?? 'Ultra Rare' as CardRarity,
    language:         'English' as CardLanguage,
    condition:        'Near Mint' as CardCondition,
    is_graded:        false,
    grade:            '',
    grading_company:  'PSA' as GradingCompany,
    quantity:         1,
    cost_basis:       0,
    list_price:       0,
    min_price:        0,
    status:           'in_inventory' as ItemStatus,
    source:           '',
    purchase_date:    new Date().toISOString().split('T')[0],
    storage_location: '',
    notes:            '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const set = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      card_name:            form.card_name,
      set_name:             form.set_name,
      card_number:          form.card_number || null,
      rarity:               form.rarity || null,
      language:             form.language,
      condition:            form.condition,
      is_graded:            form.is_graded,
      grade:                form.is_graded ? form.grade || null : null,
      grading_company:      form.is_graded ? form.grading_company : null,
      quantity:             Number(form.quantity),
      cost_basis:           Number(form.cost_basis),
      current_market_price: Number(form.list_price) || Number(form.cost_basis),
      list_price:           Number(form.list_price) || null,
      min_price:            Number(form.min_price)  || null,
      storage_location:     form.storage_location || null,
      status:               form.status,
      source:               form.source || null,
      purchase_date:        form.purchase_date || null,
      notes:                form.notes || null,
      image_url:            imageUrl,
    }

    createItem(payload as InventoryItemInput, {
      onSuccess: (result) => {
        if (!result.success) {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/inventory')
        }
      },
    })
  }

  const fe = (key: string) => fieldErrors[key]?.[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Image */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Card Image</h3>
        <ImageUpload currentUrl={imageUrl} onUrlChange={setImageUrl} />
      </section>

      {/* Card Identity */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Card Identity</h3>
        <div className="space-y-3">
          <Input label="Card Name *" placeholder="e.g. Charizard ex" value={form.card_name} onChange={e => set('card_name', e.target.value)} error={fe('card_name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Set Name *" placeholder="e.g. Obsidian Flames" value={form.set_name} onChange={e => set('set_name', e.target.value)} error={fe('set_name')} />
            <Input label="Card Number" placeholder="125/197" value={form.card_number} onChange={e => set('card_number', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Rarity" value={form.rarity} onChange={e => set('rarity', e.target.value)} options={RARITIES.map(r => ({ value: r, label: r }))} />
            <Select label="Language" value={form.language} onChange={e => set('language', e.target.value)} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
          </div>
        </div>
      </section>

      {/* Condition & Grade */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Condition & Grade</h3>
        <div className="space-y-3">
          <Select label="Condition" value={form.condition} onChange={e => set('condition', e.target.value)} options={CONDITIONS.map(c => ({ value: c, label: c }))} error={fe('condition')} />
          <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl border border-zinc-700">
            <input type="checkbox" id="is_graded" checked={form.is_graded} onChange={e => set('is_graded', e.target.checked)} className="w-4 h-4 rounded accent-brand-500" />
            <label htmlFor="is_graded" className="text-sm text-zinc-300 cursor-pointer">This card is professionally graded</label>
          </div>
          {form.is_graded && (
            <div className="grid grid-cols-2 gap-3">
              <Select label="Grading Company" value={form.grading_company} onChange={e => set('grading_company', e.target.value)} options={GRADING_COS.map(g => ({ value: g, label: g }))} error={fe('grading_company')} />
              <Input label="Grade" placeholder="e.g. 9, 9.5, 10" value={form.grade} onChange={e => set('grade', e.target.value)} />
            </div>
          )}
        </div>
      </section>

      {/* Financials */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Financials</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cost Basis ($) *" type="number" step="0.01" min="0" placeholder="0.00" value={form.cost_basis || ''} onChange={e => set('cost_basis', e.target.value)} error={fe('cost_basis')} hint="What you paid" />
            <Input label="List Price ($)" type="number" step="0.01" min="0" placeholder="0.00" value={form.list_price || ''} onChange={e => set('list_price', e.target.value)} hint="Your asking price" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Price ($)" type="number" step="0.01" min="0" placeholder="0.00" value={form.min_price || ''} onChange={e => set('min_price', e.target.value)} hint="Floor / break-even" />
            <Input label="Quantity" type="number" min="1" placeholder="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Purchase Details */}
      <section>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Purchase Details</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Source" placeholder="e.g. Card Show, eBay" value={form.source} onChange={e => set('source', e.target.value)} />
            <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
          </div>
          <Input label="Storage Location" placeholder="e.g. Binder A - Slot 4" value={form.storage_location} onChange={e => set('storage_location', e.target.value)} />
          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)} options={[
            { value: 'in_inventory', label: 'In Inventory' },
            { value: 'listed',       label: 'Listed' },
            { value: 'pending',      label: 'Pending' },
          ]} />
          <Textarea label="Notes" placeholder="Centering, surface issues, provenance..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
        </div>
      </section>

      <Button type="submit" fullWidth size="lg" loading={isPending}>
        Add to Inventory
      </Button>
    </form>
  )
}
