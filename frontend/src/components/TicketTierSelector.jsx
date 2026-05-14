import { formatCurrency } from '../utils/formatters'

export default function TicketTierSelector({ tiers, selections, onChange }) {
  const handleQtyChange = (tierId, delta) => {
    const current = selections[tierId] || 0
    const tier = tiers.find(t => t.id === tierId)
    const available = tier.totalQuantity - tier.soldQuantity
    const next = Math.max(0, Math.min(current + delta, available, 10))
    onChange(tierId, next)
  }

  return (
    <div className="space-y-3">
      {tiers.map((tier) => {
        const available = tier.totalQuantity - tier.soldQuantity
        const qty = selections[tier.id] || 0
        const soldOut = available <= 0

        return (
          <div key={tier.id} className={`border rounded-xl p-4 transition-all duration-150 ${qty > 0 ? 'border-crimson bg-crimson/5' : 'border-border bg-white'} ${soldOut ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-navy text-sm">{tier.name}</span>
                  {soldOut && <span className="badge bg-gray-100 text-gray-500 text-xs">Sold Out</span>}
                  {!soldOut && available <= 10 && (
                    <span className="badge bg-orange-100 text-orange-600 text-xs">Only {available} left</span>
                  )}
                </div>
                {tier.description && (
                  <p className="text-text-secondary text-xs leading-relaxed">{tier.description}</p>
                )}
                <p className="font-bold text-crimson mt-1.5 text-sm">
                  {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                </p>
              </div>

              {!soldOut && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleQtyChange(tier.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                  </button>
                  <span className="w-6 text-center font-bold text-navy text-sm">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(tier.id, 1)}
                    disabled={qty >= Math.min(available, 10)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
