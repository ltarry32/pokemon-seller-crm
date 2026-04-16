'use client'

// =============================================================
// CARD IMAGE PICKER
// Modal that searches the Pokémon TCG API and lets the user
// choose the correct print from a scrollable grid of results.
//
// Usage:
//   <CardImagePicker
//     isOpen={showPicker}
//     onClose={() => setShowPicker(false)}
//     onSelect={handlePickerSelect}
//     cardName={form.card_name}
//     cardNumber={form.card_number}   // optional — narrows results
//     setName={form.set_name}         // optional — narrows results
//   />
// =============================================================

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Loader2, ImageOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { searchPokemonCards, mapRarity } from '@/lib/pokemonTcgApi'
import type { TcgCard } from '@/lib/pokemonTcgApi'

// ─── Public types ─────────────────────────────────────────────

/** Subset of card data passed back to the parent on selection. */
export interface PickedCard {
  image_url:   string
  card_number: string
  set_name:    string
  rarity:      string | null
}

// ─── Component ────────────────────────────────────────────────

interface CardImagePickerProps {
  isOpen:      boolean
  onClose:     () => void
  onSelect:    (card: PickedCard) => void
  cardName:    string
  cardNumber?: string
  setName?:    string
}

export function CardImagePicker({
  isOpen, onClose, onSelect,
  cardName, cardNumber, setName,
}: CardImagePickerProps) {
  const [cards,   setCards]   = useState<TcgCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Fetch whenever the modal opens. The `cancelled` flag prevents
  // a stale response from a previous open from updating state.
  useEffect(() => {
    if (!isOpen || !cardName.trim()) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setCards([])

    searchPokemonCards({
      card_name:   cardName,
      card_number: cardNumber || undefined,
      set_name:    setName    || undefined,
    }).then(results => {
      if (cancelled) return
      setLoading(false)
      if (results.length === 0) {
        setError('No official cards found. Try adjusting the card name.')
      } else {
        setCards(results)
      }
    })

    return () => { cancelled = true }
  }, [isOpen, cardName, cardNumber, setName])

  // ─── Subtitle ───────────────────────────────────────────────

  const subtitle = loading
    ? 'Searching Pokémon TCG database…'
    : cards.length > 0
      ? `${cards.length} result${cards.length !== 1 ? 's' : ''} — tap a card to use its image`
      : undefined

  // ─── Render ─────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Find Official Card Image"
      subtitle={subtitle}
      size="lg"
    >
      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-14">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
          <p className="text-xs text-zinc-500">Searching…</p>
        </div>
      )}

      {/* Empty / error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ImageOff className="w-8 h-8 text-zinc-700" />
          <p className="text-sm text-zinc-400">{error}</p>
          <p className="text-xs text-zinc-600">
            Check the card name spelling, or upload an image manually.
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              type="button"
              onClick={() =>
                onSelect({
                  image_url:   card.images.large,
                  card_number: card.number,
                  set_name:    card.set.name,
                  rarity:      mapRarity(card.rarity),
                })
              }
              className="group text-left rounded-2xl border border-zinc-800 bg-surface-1 overflow-hidden hover:border-brand-500/50 hover:bg-brand-500/5 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {/* Card thumbnail — small image loads fast in a grid */}
              <div className="relative w-full aspect-[2.5/3.5] bg-zinc-900">
                <Image
                  src={card.images.small}
                  alt={`${card.name} — ${card.set.name}`}
                  fill
                  className="object-contain p-1.5 group-hover:scale-[1.03] transition-transform duration-200"
                  sizes="(max-width: 640px) 44vw, 180px"
                />
              </div>

              {/* Info strip */}
              <div className="px-2.5 py-2 border-t border-zinc-800 space-y-0.5">
                <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                  {card.name}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{card.set.name}</p>
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <span className="text-[10px] font-mono text-zinc-600">
                    #{card.number}
                  </span>
                  {card.rarity && (
                    <span className="text-[10px] text-brand-500/80 truncate max-w-[60%] text-right leading-tight">
                      {card.rarity}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
