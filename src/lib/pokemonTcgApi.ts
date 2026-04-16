// =============================================================
// POKÉMON TCG API — card lookup helper
// Docs: https://docs.pokemontcg.io/
//
// Free tier: ~1 000 requests/day with no key.
// For higher limits, get a free key at https://dev.pokemontcg.io/
// and add it to .env.local:
//   NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_key_here
// =============================================================

export interface TcgCard {
  id:      string
  name:    string
  number:  string
  set:     { name: string; series: string }
  rarity?: string
  images:  { small: string; large: string }
}

// Maps Pokémon TCG API rarity strings → our CardRarity union.
// Keys are what the API returns; values are what we store.
const RARITY_MAP: Record<string, string> = {
  'Common':                      'Common',
  'Uncommon':                    'Uncommon',
  'Rare':                        'Rare',
  'Rare Holo':                   'Holo Rare',
  'Rare Holo Reverse':           'Reverse Holo',
  'Rare Ultra':                  'Ultra Rare',
  'Ultra Rare':                  'Ultra Rare',
  'Double Rare':                 'Ultra Rare',
  'Rare Secret':                 'Secret Rare',
  'Rare Rainbow':                'Rainbow Rare',
  'Rare Shiny':                  'Secret Rare',
  'Rare Shiny GX':               'Secret Rare',
  'Amazing Rare':                'Rare',
  'Promo':                       'Promo',
  'ACE SPEC Rare':               'Ultra Rare',
  'Illustration Rare':           'Illustration Rare',
  'Special Illustration Rare':   'Special Illustration Rare',
  'Hyper Rare':                  'Hyper Rare',
  'Trainer Gallery Rare Holo':   'Holo Rare',
}

/** Convert an API rarity string to our stored enum value (or null). */
export function mapRarity(apiRarity?: string): string | null {
  if (!apiRarity) return null
  return RARITY_MAP[apiRarity] ?? null
}

// ─── Fetch ────────────────────────────────────────────────────

const BASE_URL = 'https://api.pokemontcg.io/v2'

function buildHeaders(): HeadersInit {
  const key = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY
  return key ? { 'X-Api-Key': key } : {}
}

// ─── Shared query builder ─────────────────────────────────────

function buildQuery(opts: {
  card_name:    string
  card_number?: string
  set_name?:    string
}): string {
  const { card_name, card_number, set_name } = opts
  const parts: string[] = [`name:"${card_name.trim()}"`]
  // The API expects just the numeric part — strip "125/197" → "125"
  const numericPart = card_number?.split('/')?.[0]?.trim()
  if (numericPart)      parts.push(`number:${numericPart}`)
  else if (set_name?.trim()) parts.push(`set.name:"${set_name.trim()}"`)
  return parts.join(' ')
}

/**
 * Return the single best match for a card, or null.
 * Used by the scanner's manual search.
 */
export async function searchPokemonCard(opts: {
  card_name:    string
  card_number?: string
  set_name?:    string
}): Promise<TcgCard | null> {
  if (!opts.card_name.trim()) return null
  const q   = buildQuery(opts)
  const url = `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=1&select=id,name,number,set,rarity,images`
  try {
    const res  = await fetch(url, { headers: buildHeaders() })
    if (!res.ok) return null
    const json = (await res.json()) as { data: TcgCard[] }
    return json.data[0] ?? null
  } catch {
    return null
  }
}

/**
 * Return up to `pageSize` matches for the picker UI.
 * Results are ordered newest-set-first so the most relevant prints
 * appear at the top of the grid.
 */
export async function searchPokemonCards(opts: {
  card_name:    string
  card_number?: string
  set_name?:    string
  pageSize?:    number
}): Promise<TcgCard[]> {
  const { pageSize = 20 } = opts
  if (!opts.card_name.trim()) return []
  const q   = buildQuery(opts)
  const url = `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=${pageSize}&orderBy=-set.releaseDate&select=id,name,number,set,rarity,images`
  try {
    const res  = await fetch(url, { headers: buildHeaders() })
    if (!res.ok) return []
    const json = (await res.json()) as { data: TcgCard[] }
    return json.data ?? []
  } catch {
    return []
  }
}
