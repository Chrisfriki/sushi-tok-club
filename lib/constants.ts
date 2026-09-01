import {
  IceCream,
  Coffee,
  CupSoda,
  GlassWater,
  CakeSlice,
  BadgeEuro,
  Percent,
  Utensils,
  UtensilsCrossed,
  Users,
  Sparkles,
  Gift,
  type LucideIcon,
} from 'lucide-react'

export const TERMS_VERSION = '2026-01'

export type RewardLevel = 'BAJO' | 'MEDIO' | 'ALTO' | 'PREMIUM'
export type CodeStatus = 'AVAILABLE' | 'CLAIMED' | 'BLOCKED' | 'INVALID'
export type UserRewardStatus = 'AVAILABLE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED'
export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'ENDED'
  | 'ARCHIVED'
export type UserRole = 'client' | 'staff' | 'manager' | 'admin'

export const LEVEL_META: Record<
  RewardLevel,
  { label: string; dot: string; text: string; bg: string; ring: string }
> = {
  BAJO: {
    label: 'Bajo',
    dot: 'bg-[var(--level-bajo)]',
    text: 'text-[var(--level-bajo)]',
    bg: 'bg-[var(--level-bajo)]/12',
    ring: 'ring-[var(--level-bajo)]/30',
  },
  MEDIO: {
    label: 'Medio',
    dot: 'bg-[var(--level-medio)]',
    text: 'text-[var(--level-medio)]',
    bg: 'bg-[var(--level-medio)]/12',
    ring: 'ring-[var(--level-medio)]/30',
  },
  ALTO: {
    label: 'Alto',
    dot: 'bg-[var(--level-alto)]',
    text: 'text-[var(--level-alto)]',
    bg: 'bg-[var(--level-alto)]/12',
    ring: 'ring-[var(--level-alto)]/30',
  },
  PREMIUM: {
    label: 'Premium',
    dot: 'bg-[var(--level-premium)]',
    text: 'text-[var(--level-premium)]',
    bg: 'bg-[var(--level-premium)]/12',
    ring: 'ring-[var(--level-premium)]/30',
  },
}

export const REWARD_ICONS: Record<string, LucideIcon> = {
  'ice-cream': IceCream,
  coffee: Coffee,
  'cup-soda': CupSoda,
  'glass-water': GlassWater,
  'cake-slice': CakeSlice,
  'badge-euro': BadgeEuro,
  percent: Percent,
  utensils: Utensils,
  'utensils-crossed': UtensilsCrossed,
  users: Users,
  sparkles: Sparkles,
}

export function rewardIcon(icon?: string | null): LucideIcon {
  if (icon && REWARD_ICONS[icon]) return REWARD_ICONS[icon]
  return Gift
}

export const USER_REWARD_STATUS_META: Record<
  UserRewardStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: 'Disponible',
    className: 'bg-[var(--level-bajo)]/15 text-[var(--level-bajo)]',
  },
  REDEEMED: {
    label: 'Canjeado',
    className: 'bg-muted text-muted-foreground',
  },
  EXPIRED: {
    label: 'Caducado',
    className: 'bg-destructive/12 text-destructive',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'bg-muted text-muted-foreground',
  },
}

/** Maps a claim_code / redeem RPC error to a friendly Spanish message. */
export function claimErrorMessage(code: string): string {
  switch (code) {
    case 'NOT_FOUND':
      return 'Este código no es válido.'
    case 'ALREADY_CLAIMED':
      return 'Este rasca ya ha sido utilizado.'
    case 'CAMPAIGN_ENDED':
      return 'Esta promoción ya ha finalizado.'
    case 'BLOCKED':
      return 'Este código no está disponible. Contacta con Sushi Tok.'
    case 'INVALID':
      return 'Este código no es válido.'
    case 'NOT_AUTHENTICATED':
      return 'Debes iniciar sesión para reclamar tu premio.'
    default:
      return 'No se ha podido validar el código. Inténtalo de nuevo.'
  }
}

export function redeemErrorMessage(code: string): string {
  switch (code) {
    case 'TOKEN_NOT_FOUND':
      return 'QR no válido.'
    case 'TOKEN_USED':
      return 'Este QR ya ha sido utilizado.'
    case 'TOKEN_EXPIRED':
      return 'El QR ha caducado. Pide al cliente que genere uno nuevo.'
    case 'ALREADY_REDEEMED':
      return 'Este premio ya fue canjeado.'
    case 'REWARD_EXPIRED':
      return 'El premio ha caducado.'
    case 'NOT_AVAILABLE':
      return 'El premio no está disponible.'
    case 'FORBIDDEN':
      return 'No tienes permiso para canjear premios.'
    default:
      return 'No se ha podido completar el canje.'
  }
}
