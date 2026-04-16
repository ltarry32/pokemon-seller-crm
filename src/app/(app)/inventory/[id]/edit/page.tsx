'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Search } from 'lucide-react'
import { useInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { EmptyState, CardSkeleton } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/layout/Header'
import { CardImagePicker } from '@/components/inventory/CardImagePicker'
import type { PickedCard } from '@/components/inventory/CardImagePicker'
import type { InventoryItemUpdateInput } from '@/lib/validations'
import type { InventoryItemRow } from '@/lib/supabase/database.types'
import type { CardCondition, CardLanguage, CardRarity, GradingCompany, ItemStatus } from '@/types'

// ─── Constants (same as AddCardForm) ──────────────────────────

const CONDITIONS:  CardCondition[]  = ['Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged']
const LANGUAGES:   CardLanguage[]   = ['English','Japanese','Korean','Chinese','German','French','Spanish','Italian','Portuguese']
const RARITIES:    CardRarity[]     = ['Common','Uncommon','Rare','Holo Rare','Reverse Holo','Ultra Rare','Secret Rare','Rainbow Rare','Gold Rare','Promo','Illustration Rare','Special Illustration Rare','Hyper Rare']
const GRADING_COS: GradingCompany[] = ['PSA','BGS','CGC','SGC','ACE','HGA','Other']

// ─── Form ─────────────────────────────────────────────────────

function buildInitialForm(item: InventoryItemRow) {
  return {
    card_name:        item.card_name,
    set_name:         item.set_name,
    card_number:      item.card_number      ?? '',
    rarity:           (item.rarity          ?? 'Ultra Rare') as CardRarity,
    language:         (item.language        ?? 'English')    as CardLanguage,
    condition:        item.condition                          as CardCondition,
    is_graded:        item.is_graded,
    grade:            item.grade            ?? '',
    grading_company:  (item.grading_company ?? 'PSA')        as GradingCompany,
    quantity:         item.quantity,
    cost_basis:       item.cost_basis,
    current_market_price: item.current_market_price,
    list_price:       item.list_price       ?? 0,
    min_price:        item.min_price        ?? 0,
    status:           item.status                             as ItemStatus,
    source:           item.source           ?? '',
    purchase_date:    item.purchase_date    ?? '',
    storage_location: item.storage_location ?? '',
    notes:            item.notes            ?? '',
  }
}

interface EditFormProps {
  item: InventoryItemRow
}

function EditCardForm({ item }: EditFormProps) {
  const router = useRouter()
  const { mutate: updateItem, isPending } = useUpdateInventoryItem(item.id)
  const [form, setForm] = useState(() => buildInitialForm(item))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  // Managed outside the main form state because the upload is async.
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url ?? null)

  const [showPicker, setShowPicker] = useState(false)

  // Called when the user picks a card from the picker.
  // Always sets the image; fills in set/number only when blank
  // (the user's existing typed values are intentional and never overwritten).
  // Rarity is deliberately left untouched on edit.
  const handlePickerSelect = (picked: PickedCard) => {
    setImageUrl(picked.image_url)
    if (!form.card_number) set('card_number', picked.card_number)
    if (!form.set_name)    set('set_name',    picked.set_name)
    setShowPicker(false)
  }

  const set = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload: InventoryItemUpdateInput = {
      card_name:            form.card_name,
      set_name:             form.set_name,
      card_number:          form.card_number          || null,
      rarity:               (form.rarity              || null) as CardRarity | null,
      language:             form.language              as CardLanguage,
      condition:            form.condition             as CardCondition,
      is_graded:            form.is_graded,
      grade:                form.is_graded ? form.grade || null : null,
      grading_company:      form.is_graded ? form.grading_company as GradingCompany : null,
      quantity:             Number(form.quantity),
      cost_basis:           Number(form.cost_basis),
      current_market_price: Number(form.current_market_price) || Number(form.cost_basis),
      list_price:           Number(form.list_price)   || null,
      min_price:            Number(form.min_price)    || null,
      storage_location:     form.storage_location     || null,
      status:               form.status               as ItemStatus,
      source:               form.source               || null,
      purchase_date:        form.purchase_date        || null,
      notes:                form.notes                || null,
      image_url:            imageUrl,
    }

    updateItem(payload, {
      onSuccess: (result) => {
        if (!result.success) {
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          toast.error(result.error ?? 'Update failed')
          return
        }
        toast.success('Card updated')
        router.push(`/inventory/${item.id}`)
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

        {form.card_name.trim() && (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-brand-400 transition-colors"
          >
            <Search className="w-3 h-3" />
            {imageUrl ? 'Replace with official card image' : 'Search official card images'}
          </button>
        )}

        <CardImagePicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handlePickerSelect}
          cardName={form.card_name}
          cardNumber={form.card_number || undefined}
          setName={form.set_name       || undefined}
        />
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
            <Input label="Market Price ($)" type="number" step="0.01" min="0" placeholder="0.00" value={form.current_market_price || ''} onChange={e => set('current_market_price', e.target.value)} hint="Current value" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="List Price ($)" type="number" step="0.01" min="0" placeholder="0.00" value={form.list_price || ''} onChange={e => set('list_price', e.target.value)} hint="Your asking price" />
            <Input label="Min Price ($)" type="number" step="0.01" min="0" placeholder="0.00" value={form.min_price || ''} onChange={e => set('min_price', e.target.value)} hint="Floor / break-even" />
          </div>
          <Input label="Quantity" type="number" min="1" placeholder="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
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
            { value: 'sold',         label: 'Sold' },
          ]} />
          <Textarea label="Notes" placeholder="Centering, surface issues, provenance..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <Link href={`/inventory/${item.id}`} className="flex-1">
          <Button type="button" variant="secondary" fullWidth>Cancel</Button>
        </Link>
        <Button type="submit" variant="primary" className="flex-1" loading={isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function EditCardPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { data: item, isLoading, error } = useInventoryItem(id)

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/inventory/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <PageHeader title="Edit Card" subtitle="Update inventory item" />
      </div>

      {isLoading && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {(error || (!isLoading && !item)) && (
        <EmptyState
          icon="🔍"
          title="Card not found"
          description="This card may have been deleted."
          action={{ label: 'Back to Inventory', onClick: () => router.push('/inventory') }}
        />
      )}

      {item && <EditCardForm item={item} />}
    </div>
  )
}
