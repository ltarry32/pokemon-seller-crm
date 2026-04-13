'use client'

import { AddCardForm } from '@/components/inventory/AddCardForm'
import { PageHeader } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'

export default function AddCardPage() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Add Card" subtitle="Add a new card to your inventory" />
      <Card>
        <AddCardForm />
      </Card>
    </div>
  )
}
