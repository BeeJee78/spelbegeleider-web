export type AgeCategory = 'JO8' | 'JO9' | 'JO10' | 'JO11' | 'JO12'
export const CATEGORIES: AgeCategory[] = ['JO8', 'JO9', 'JO10', 'JO11', 'JO12']

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
  homeLogo?: string // dataURL
  awayLogo?: string
  ageCategory: AgeCategory
  date: number
  goals: Goal[]
  isCompleted: boolean
}

export interface SavedTeam {
  id: string
  name: string
  ageCategory: AgeCategory
  logo?: string // dataURL
}

// Clubkleur op basis van een kleurwoord in de teamnaam (bijv. "Groen Wit").
// "Wit" telt alleen als er geen andere kleur in de naam staat.
export interface ClubColor {
  bg: string
  shadow: string
  fg: string
}

const CLUB_COLORS: Record<string, ClubColor> = {
  groen:  { bg: 'rgba(46, 125, 50, 0.9)',   shadow: 'rgba(76, 175, 80, 0.45)',   fg: '#fff' },
  blauw:  { bg: 'rgba(21, 101, 192, 0.85)', shadow: 'rgba(21, 101, 192, 0.45)',  fg: '#fff' },
  rood:   { bg: 'rgba(183, 28, 28, 0.85)',  shadow: 'rgba(183, 28, 28, 0.45)',   fg: '#fff' },
  geel:   { bg: 'rgba(249, 168, 37, 0.92)', shadow: 'rgba(249, 168, 37, 0.4)',   fg: '#111' },
  oranje: { bg: 'rgba(230, 81, 0, 0.9)',    shadow: 'rgba(230, 81, 0, 0.45)',    fg: '#fff' },
  zwart:  { bg: 'rgba(33, 43, 48, 0.95)',   shadow: 'rgba(0, 0, 0, 0.5)',        fg: '#fff' },
  wit:    { bg: 'rgba(236, 239, 241, 0.92)', shadow: 'rgba(255, 255, 255, 0.25)', fg: '#111' },
  paars:  { bg: 'rgba(106, 27, 154, 0.9)',  shadow: 'rgba(106, 27, 154, 0.45)',  fg: '#fff' },
}

export function clubColor(teamName: string): ClubColor | null {
  const found = [...teamName.toLowerCase().matchAll(/groen|blauw|rood|geel|oranje|zwart|wit|paars/g)].map(
    (m) => m[0],
  )
  if (found.length === 0) return null
  const color = found.find((c) => c !== 'wit') ?? 'wit'
  return CLUB_COLORS[color]
}

// Speelduur en regels conform KNVB pupillenvoetbal (infographics seizoen 2026/'27):
// O8/O9/O10 spelen 6 tegen 6, O11/O12 spelen 8 tegen 8.
// Elke helft is verdeeld in 2 periodes (voor en na de time-out).

export function isEightVsEight(cat: AgeCategory): boolean {
  return cat === 'JO11' || cat === 'JO12'
}

export function halfDurationMinutes(cat: AgeCategory): number {
  if (isEightVsEight(cat)) return 30
  return cat === 'JO10' ? 25 : 20
}

export function periodDurationSeconds(cat: AgeCategory): number {
  // Halve helft (tot aan de time-out) in seconden
  return halfDurationMinutes(cat) * 30
}

export function totalMatchMinutes(cat: AgeCategory): number {
  return halfDurationMinutes(cat) * 2
}

export function restMinutes(cat: AgeCategory): number {
  return isEightVsEight(cat) ? 15 : 10
}

export function playersPerSide(cat: AgeCategory): number {
  return isEightVsEight(cat) ? 8 : 6
}

export function fieldSize(cat: AgeCategory): string {
  return isEightVsEight(cat) ? '64 × 42,5 m' : '42,5 × 30 m'
}

export function ballSize(cat: AgeCategory): string {
  return isEightVsEight(cat) ? 'Maat 5 (320 gr)' : 'Maat 4 (290 gr)'
}

export function penaltyDistance(cat: AgeCategory): string {
  return isEightVsEight(cat) ? '9 meter' : '7 meter'
}

export function matchLeader(cat: AgeCategory): string {
  return isEightVsEight(cat) ? 'Pupillenscheidsrechter (12+)' : 'Spelbegeleider'
}

// Alle categorieën spelen met het pupillendoel
export const GOAL_SIZE = '5 × 2 m'

export function knvbURL(cat: AgeCategory): string {
  return isEightVsEight(cat)
    ? 'https://www.knvb.nl/ontdek-voetbal/pupillenvoetbal/onder-11-t/m-12'
    : 'https://www.knvb.nl/ontdek-voetbal/pupillenvoetbal/onder-8-t/m-10'
}

export function knvbInfographicURL(cat: AgeCategory): string {
  return isEightVsEight(cat)
    ? 'https://www.knvb.nl/downloads/sites/bestand/knvb/14647/infographic-8-tegen-8'
    : 'https://www.knvb.nl/downloads/sites/bestand/knvb/12343/infographic-6-tegen-6'
}

export function newMatch(
  homeTeam: string,
  awayTeam: string,
  ageCategory: AgeCategory,
  homeLogo?: string,
  awayLogo?: string,
): Match {
  return {
    id: crypto.randomUUID(),
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
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
