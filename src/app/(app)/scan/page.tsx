'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScannerView } from '@/components/scanner/ScannerView';
import { AddCardForm } from '@/components/inventory/AddCardForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import type { ScanResult, InventoryItem } from '@/types';

export default function ScanPage() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleAddToInventory = (result: ScanResult) => {
    setScanResult(result);
    setShowAddForm(true);
  };

  const handleCardConfirmed = (_result: ScanResult) => {
    router.push('/pricing');
  };

  // Map ScanResult to partial InventoryItem for form prefill
  const prefill: Partial<InventoryItem> | undefined = scanResult ? {
    card_name:   scanResult.card_name,
    set_name:    scanResult.set_name,
    card_number: scanResult.card_number,
    rarity:      scanResult.rarity ?? undefined,
    image_url:   scanResult.image_url,
    current_market_price: scanResult.price_estimate ?? 0,
  } : undefined;

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Scan Card"
        subtitle="Use camera or search to identify a card"
      />

      {/* Info tip */}
      <Card className="mb-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-medium text-blue-300 mb-0.5">Demo Scanner</p>
            <p className="text-xs text-zinc-500">
              The camera scanner flow is mocked. Real card recognition can be connected via
              Google Vision API, Pokémon TCG API, or a custom ML model. See{' '}
              <code className="text-brand-400">ScannerView.tsx</code> for integration points.
            </p>
          </div>
        </div>
      </Card>

      <ScannerView
        onCardConfirmed={handleCardConfirmed}
        onAddToInventory={handleAddToInventory}
      />

      {/* Add to inventory modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add to Inventory"
        subtitle={scanResult?.card_name}
        size="lg"
      >
        <AddCardForm
          prefill={prefill}
          onSuccess={() => {
            setShowAddForm(false);
            router.push('/inventory');
          }}
        />
      </Modal>
    </div>
  );
}
