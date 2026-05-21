import {
  UtensilsCrossed,
  Bed,
  Train,
  Fuel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';

const CONFIG = {
  Food:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',   Icon: UtensilsCrossed },
  Stay:      { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)',   Icon: Bed },
  Transport: { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',   Icon: Train },
  Fuel:      { color: '#10B981', bg: 'rgba(16,185,129,0.15)',   Icon: Fuel },
  Entry:     { color: '#F43F5E', bg: 'rgba(244,63,94,0.15)',    Icon: Ticket },
  Shopping:  { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)',    Icon: ShoppingBag },
  Misc:      { color: '#A1A1AA', bg: 'rgba(161,161,170,0.15)',  Icon: MoreHorizontal },
};

export const CATEGORIES = Object.keys(CONFIG);

/**
 * Circular colored icon for an expense category.
 * @param {string} category - One of the CATEGORIES keys
 * @param {number} size - Icon container size in px (default 36)
 */
export default function CategoryIcon({ category = 'Misc', size = 36 }) {
  const cfg = CONFIG[category] || CONFIG.Misc;
  const { color, bg, Icon } = cfg;
  const iconSize = Math.round(size * 0.44);

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Icon style={{ color, width: iconSize, height: iconSize }} strokeWidth={1.75} />
    </div>
  );
}
