import type { Match, SavedTeam, AgeCategory } from './models'

const MATCHES_KEY = 'savedMatches_v1'
const TEAMS_KEY = 'savedTeams_v2'

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function save<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // opslag vol of niet beschikbaar — stilzwijgend negeren
  }
}

export function savedMatches(): Match[] {
  return load<Match>(MATCHES_KEY)
}

export function upsertMatch(match: Match) {
  const list = savedMatches()
  const i = list.findIndex((m) => m.id === match.id)
  if (i >= 0) list[i] = match
  else list.unshift(match)
  save(MATCHES_KEY, list)
}

export function deleteMatch(id: string) {
  save(
    MATCHES_KEY,
    savedMatches().filter((m) => m.id !== id),
  )
}

export function savedTeams(): SavedTeam[] {
  return load<SavedTeam>(TEAMS_KEY)
}

export function saveTeam(name: string, category: AgeCategory) {
  if (!name) return
  let teams = savedTeams().filter((t) => t.name.toLowerCase() !== name.toLowerCase())
  teams.unshift({ id: crypto.randomUUID(), name, ageCategory: category })
  save(TEAMS_KEY, teams.slice(0, 15))
}
