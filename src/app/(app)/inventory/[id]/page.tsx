'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Trash2, TrendingUp, TrendingDown, Package, Star, MapPin, CalendarDays, ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatCurrency, formatPercent, formatDate, conditionBadgeClass, statusBadgeClass, statusLabel, profitClass } from '@/lib/utils';

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { inventory, deleteInventoryItem, markAsSold } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const item = inventory.find(i => i.id === id);

  if (!item) {
    return (
      <div className="page-container">
        <EmptyState
          icon="🔍"
          title="Card not found"
          description="This card may have been deleted."
          action={{ label: 'Back to Inventory', onClick: () => router.push('/inventory') }}
        />
      </div>
    );
  }

  const unrealizedProfit = (item.current_market_price - item.cost_basis) * item.quantity;
  const roi = item.cost_basis > 0 ? ((item.current_market_price - item.cost_basis) / item.cost_basis) * 100 : 0;
  const isProfit = unrealizedProfit > 0;
  const TrendIcon = isProfit ? TrendingUp : TrendingDown;

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    deleteInventoryItem(item.id);
    toast.success('Card deleted');
    router.push('/inventory');
  };

  const handleMarkSold = () => {
    markAsSold(item.id);
    toast.success('Marked as sold. Log the full sale in Sold Log.');
    router.push('/sold');
  };

  return (
    <div className="page-container space-y-4 animate-fade-in">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Inventory
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/inventory/${id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="danger" size="icon" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-surface-1 border border-zinc-800 rounded-3xl overflow-hidden">
        {/* Image */}
        <div className="relative bg-zinc-900 flex items-center justify-center py-8 px-6">
          {item.image_url ? (
            <div className="relative w-36 h-52 rounded-xl overflow-hidden shadow-2xl">
              <Image src={item.image_url} alt={item.card_name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-36 h-52 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center gap-2">
              <Package className="w-10 h-10 text-zinc-600" />
              <p className="text-xs text-zinc-600">No image</p>
            </div>
          )}
          {item.is_graded && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              <span className="text-xs font-bold text-purple-300">{item.grading_company} {item.grade}</span>
            </div>
          )}
        </div>

        {/* Card header */}
        <div className="p-5 border-t border-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-100">{item.card_name}</h1>
          <p className="text-sm text-zinc-400 mt-1">{item.set_name} · #{item.card_number}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', conditionBadgeClass(item.condition))}>
              {item.condition}
            </span>
            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', statusBadgeClass(item.status))}>
              {statusLabel(item.status)}
            </span>
            {item.rarity && <Badge variant="default">{item.rarity}</Badge>}
            {item.language !== 'English' && <Badge variant="info">{item.language}</Badge>}
            {item.quantity > 1 && <Badge variant="default">×{item.quantity}</Badge>}
          </div>
        </div>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Market Price</p>
          <p className="text-2xl font-bold text-brand-400 mt-1">{formatCurrency(item.current_market_price)}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Cost Basis</p>
          <p className="text-2xl font-bold text-zinc-300 mt-1">{formatCurrency(item.cost_basis)}</p>
        </Card>
        <Card variant={unrealizedProfit > 0 ? 'success' : 'danger'}>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Unrealized P&L</p>
          <p className={cn('text-2xl font-bold mt-1', profitClass(unrealizedProfit))}>
            {unrealizedProfit >= 0 ? '+' : ''}{formatCurrency(unrealizedProfit)}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">ROI</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={cn('w-5 h-5', profitClass(roi))} />
            <p className={cn('text-2xl font-bold', profitClass(roi))}>{formatPercent(roi)}</p>
          </div>
        </Card>
      </div>

      {/* Listing info */}
      {(item.list_price || item.min_price) && (
        <Card>
          <p className="section-title">Pricing Strategy</p>
          <div className="flex gap-4">
            {item.list_price && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">List Price</p>
                <p className="text-lg font-bold text-zinc-200 mt-0.5">{formatCurrency(item.list_price)}</p>
              </div>
            )}
            {item.min_price && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Min Price</p>
                <p className="text-lg font-bold text-zinc-400 mt-0.5">{formatCurrency(item.min_price)}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Details */}
      <Card>
        <p className="section-title">Details</p>
        <div className="space-y-3">
          {item.storage_location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-600">Storage</p>
                <p className="text-sm text-zinc-300">{item.storage_location}</p>
              </div>
            </div>
          )}
          {item.purchase_date && (
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-600">Purchased</p>
                <p className="text-sm text-zinc-300">{formatDate(item.purchase_date)}</p>
              </div>
            </div>
          )}
          {item.source && (
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-600">Source</p>
                <p className="text-sm text-zinc-300">{item.source}</p>
              </div>
            </div>
          )}
          {item.notes && (
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-600 mb-1">Notes</p>
              <p className="text-sm text-zinc-400">{item.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      {item.status !== 'sold' && (
        <div className="flex gap-3">
          <Link href="/pricing" className="flex-1">
            <Button variant="secondary" fullWidth>Check Pricing</Button>
          </Link>
          <Button variant="primary" className="flex-1" onClick={handleMarkSold}>
            Record Sale
          </Button>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Remove ${item.card_name} from your inventory? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
