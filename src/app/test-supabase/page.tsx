'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signUp = async () => {
    setMessage('Signing up...')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Signup worked. Check your email if confirmation is on.')
  }

  const signIn = async () => {
    setMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Signed in successfully.')
  }

  const insertTestInventory = async () => {
    setMessage('Adding test inventory item...')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('No user logged in.')
      return
    }

    const { error } = await supabase.from('inventory_items').insert([
      {
        user_id: user.id,
        card_name: 'Test Charizard',
        set_name: 'Base Set',
        card_number: '4/102',
        condition: 'Near Mint',
        quantity: 1,
        cost_basis: 100,
        current_market_price: 150,
        status: 'in_inventory',
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Test inventory item inserted successfully.')
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Supabase Test</h1>

        <input
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={signUp}
            className="px-4 py-2 rounded bg-orange-500 text-black font-semibold"
          >
            Sign Up
          </button>

          <button
            onClick={signIn}
            className="px-4 py-2 rounded bg-white text-black font-semibold"
          >
            Sign In
          </button>

          <button
            onClick={insertTestInventory}
            className="px-4 py-2 rounded bg-green-500 text-black font-semibold"
          >
            Insert Test Item
          </button>
        </div>

        {message && <p className="text-sm text-zinc-300">{message}</p>}
      </div>
    </div>
  )
}