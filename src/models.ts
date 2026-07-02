export type AgeCategory = 'JO8' | 'JO9' | 'JO10'
export const CATEGORIES: AgeCategory[] = ['JO8', 'JO9', 'JO10']

export type TeamSide = 'home' | 'away'

export interface Goal {
  id: string
  team: TeamSide
  minute: number
  quarter: number // 1-4 (interne periode)
  timestamp: number
  scorerName?: string
}

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  ageCategory: AgeCategory
  date: number
  goals: Goal[]
  isCompleted: boolean
}

export interface SavedTeam {
  id: string
  name: string
  ageCategory: AgeCategory
}

// Speelduur en regels conform KNVB pupillenvoetbal.
// Elke helft is verdeeld in 2 periodes (voor en na de time-out).
export function halfDurationMinutes(cat: AgeCategory): number {
  return cat === 'JO10' ? 25 : 20
}

export function periodDurationSeconds(cat: AgeCategory): number {
  return cat === 'JO10' ? 750 : 600
}

export function totalMatchMinutes(cat: AgeCategory): number {
  return halfDurationMinutes(cat) * 2
}

export const PLAYERS_PER_SIDE = 6
export const FIELD_SIZE = '42,5 × 30 m'

export function goalSize(cat: AgeCategory): string {
  return cat === 'JO10' ? '6 × 2 m' : '5 × 2 m'
}

export const KNVB_URL = 'https://www.knvb.nl/ontdek-voetbal/pupillenvoetbal/onder-8-t/m-10'
export const KNVB_INFOGRAPHIC_URL =
  'https://www.knvb.nl/downloads/sites/bestand/knvb/12343/infographic-6-tegen-6'

export function newMatch(homeTeam: string, awayTeam: string, ageCategory: AgeCategory): Match {
  return {
    id: crypto.randomUUID(),
    homeTeam,
    awayTeam,
    ageCategory,
    date: Date.now(),
    goals: [],
    isCompleted: false,
  }
}

export function homeGoals(m: Match): number {
  return m.goals.filter((g) => g.team === 'home').length
}

export function awayGoals(m: Match): number {
  return m.goals.filter((g) => g.team === 'away').length
}

export function scoreString(m: Match): string {
  return `${homeGoals(m)} - ${awayGoals(m)}`
}

export function shareText(m: Match): string {
  const lines: string[] = []
  lines.push(`⚽ ${m.ageCategory} · ${m.homeTeam} ${homeGoals(m)} – ${awayGoals(m)} ${m.awayTeam}`)
  if (m.goals.length > 0) {
    lines.push('')
    lines.push('Doelpunten:')
    for (const goal of m.goals) {
      const team = goal.team === 'home' ? m.homeTeam : m.awayTeam
      const half = goal.quarter <= 2 ? 'H1' : 'H2'
      const scorer = goal.scorerName ? ` (${goal.scorerName})` : ''
      lines.push(`⚽ ${team}${scorer} – ${half} ${goal.minute}'`)
    }
  }
  return lines.join('\n')
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
