'use client';

import { useState, useRef } from 'react';
import { ScanLine, Camera, Keyboard, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatCurrency } from '@/lib/utils';
import type { ScanStep, ScanResult } from '@/types';

// ─── Mock card recognition ────────────────────────────────────
// TODO: Connect to real OCR/AI service:
// Option A: Google Vision API — label detection + web search
// Option B: Pokémon TCG API — match by barcode/set code
// Option C: Custom ML model trained on card images

const MOCK_SCAN_RESULTS: ScanResult[] = [
  { card_name: 'Charizard ex', set_name: 'Obsidian Flames', card_number: '125/197', rarity: 'Ultra Rare', image_url: 'https://images.pokemontcg.io/sv3/125_hires.png', confidence: 0.96, price_estimate: 42.50 },
  { card_name: 'Pikachu ex', set_name: 'Paldean Fates', card_number: '30/91', rarity: 'Ultra Rare', image_url: null, confidence: 0.91, price_estimate: 28.00 },
  { card_name: 'Umbreon VMAX', set_name: 'Evolving Skies', card_number: '215/203', rarity: 'Secret Rare', image_url: null, confidence: 0.88, price_estimate: 115.00 },
];

interface ScannerViewProps {
  onCardConfirmed?: (result: ScanResult) => void;
  onAddToInventory?: (result: ScanResult) => void;
}

export function ScannerView({ onCardConfirmed, onAddToInventory }: ScannerViewProps) {
  const [step, setStep] = useState<ScanStep>('ready');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualSearch, setManualSearch] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulate camera scan
  const handleCameraScan = async () => {
    setStep('scanning');

    // Request camera access
    try {
      // TODO: Connect real barcode/OCR scanning here
      // Option A: Use ZXing (zxing-js/browser) for barcodes
      // Option B: Use @tensorflow-models/mobilenet for image recognition
      // Option C: Call backend API with camera frame snapshot

      // Simulated 2.5s scan with "recognition"
      await new Promise(r => setTimeout(r, 2500));
      setStep('processing');
      await new Promise(r => setTimeout(r, 800));

      // Pick a random mock result
      const mockResult = MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)];
      setResult(mockResult);
      setStep('result');
    } catch {
      setStep('ready');
    }
  };

  // Simulate manual lookup
  const handleManualSearch = async () => {
    if (!manualSearch.trim()) return;
    setStep('processing');
    await new Promise(r => setTimeout(r, 1000));

    const mockResult = MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)];
    setResult({ ...mockResult, card_name: manualSearch.trim() || mockResult.card_name });
    setStep('result');
  };

  const handleConfirm = () => {
    if (result) {
      onCardConfirmed?.(result);
      setStep('confirm');
    }
  };

  const handleAddToInventory = () => {
    if (result) {
      onAddToInventory?.(result);
      setStep('add');
    }
  };

  const handleReset = () => {
    setStep('ready');
    setResult(null);
    setManualSearch('');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto gap-4">

      {/* Mode toggle */}
      {step === 'ready' && (
        <div className="flex bg-surface-2 rounded-2xl p-1 border border-zinc-700 w-full">
          <button
            onClick={() => setMode('camera')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              mode === 'camera' ? 'bg-brand-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              mode === 'manual' ? 'bg-brand-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <Keyboard className="w-4 h-4" />
            Search
          </button>
        </div>
      )}

      {/* Camera viewfinder */}
      {(step === 'ready' || step === 'scanning') && mode === 'camera' && (
        <div className="w-full aspect-[3/4] relative rounded-3xl overflow-hidden bg-zinc-900 border-2 border-zinc-700">
          {/* Fake viewfinder UI */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3 mx-auto">
                <Camera className="w-7 h-7 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-500">Camera preview</p>
              <p className="text-xs text-zinc-600 mt-1">
                {/* TODO: Replace with real <video> element + getUserMedia */}
                Connect camera API to enable live preview
              </p>
            </div>
          </div>

          {/* Scan overlay */}
          {step === 'scanning' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
              {/* Animated scan line */}
              <div className="w-48 h-48 border-2 border-brand-500/60 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-brand-500 animate-bounce top-1/2" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
              </div>
              <p className="text-white text-sm font-medium animate-pulse">Scanning card...</p>
            </div>
          )}

          {/* Corner guides (idle) */}
          {step === 'ready' && (
            <>
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-brand-400 rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-brand-400 rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-brand-400 rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-brand-400 rounded-br-xl" />
              <div className="absolute inset-0 flex items-end justify-center pb-6">
                <p className="text-xs text-zinc-400 bg-black/50 px-3 py-1 rounded-full">Position card in frame</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual search */}
      {step === 'ready' && mode === 'manual' && (
        <div className="w-full space-y-3">
          <Input
            placeholder="Search card name, set, number..."
            value={manualSearch}
            onChange={e => setManualSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
          />
          <Button fullWidth onClick={handleManualSearch} disabled={!manualSearch.trim()}>
            Search Card
          </Button>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
          </div>
          <p className="text-sm text-zinc-400">Identifying card...</p>
          <p className="text-xs text-zinc-600">Checking pricing databases</p>
        </div>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <div className="w-full animate-slide-up space-y-4">
          {/* Match confidence */}
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-2xl border',
            result.confidence > 0.9
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          )}>
            {result.confidence > 0.9
              ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              : <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            }
            <div>
              <p className={cn('text-sm font-medium', result.confidence > 0.9 ? 'text-green-400' : 'text-yellow-400')}>
                {result.confidence > 0.9 ? 'High confidence match' : 'Possible match'}
              </p>
              <p className="text-xs text-zinc-500">{Math.round(result.confidence * 100)}% confidence</p>
            </div>
          </div>

          {/* Card details */}
          <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-xl font-bold text-zinc-100">{result.card_name}</p>
              <p className="text-sm text-zinc-500">{result.set_name} · #{result.card_number}</p>
              {result.rarity && (
                <p className="text-xs text-brand-400 mt-1">{result.rarity}</p>
              )}
            </div>

            {result.price_estimate && (
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">Estimated Market Price</p>
                <p className="text-2xl font-bold text-brand-400">{formatCurrency(result.price_estimate)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button fullWidth size="lg" onClick={handleAddToInventory} leftIcon={<Plus className="w-4 h-4" />}>
              Add to Inventory
            </Button>
            <Button fullWidth variant="secondary" onClick={handleConfirm}>
              View Pricing Details
            </Button>
            <Button fullWidth variant="ghost" onClick={handleReset}>
              Scan Another
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {(step === 'add' || step === 'confirm') && (
        <div className="w-full flex flex-col items-center gap-4 py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-zinc-100">
              {step === 'add' ? 'Added to Inventory!' : 'Card Confirmed!'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">{result?.card_name}</p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            Scan Another Card
          </Button>
        </div>
      )}

      {/* Scan button */}
      {step === 'ready' && mode === 'camera' && (
        <Button fullWidth size="lg" onClick={handleCameraScan} leftIcon={<ScanLine className="w-5 h-5" />}>
          Start Scanning
        </Button>
      )}
    </div>
  );
}
