import { useState } from 'react'
import type { AgeCategory, Match, SavedTeam } from './models'
import { CATEGORIES, halfDurationMinutes, newMatch, totalMatchMinutes } from './models'
import { savedTeams, saveTeam } from './storage'
import { lightTap } from './alarm'

interface Props {
  onStartMatch: (match: Match) => void
  onShowHistory: () => void
  onShowRules: () => void
}

export default function SetupView({ onStartMatch, onShowHistory, onShowRules }: Props) {
  const [category, setCategory] = useState<AgeCategory>('JO10')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const teams = savedTeams()

  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''

  function start() {
    const home = homeTeam.trim()
    const away = awayTeam.trim()
    saveTeam(home, category)
    saveTeam(away, category)
    lightTap()
    onStartMatch(newMatch(home, away, category))
  }

  return (
    <div className="screen">
      <div className="grid-bg" />
      <div className="setup">
        <header className="setup-header">
          <div className="ball">⚽</div>
          <h1>Spelbegeleider</h1>
          <div className="subtitle">Jeugdvoetbal app</div>
        </header>

        <div className="card">
          <div className="section-label">Leeftijdscategorie</div>
          <div className="chip-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'selected' : ''}`}
                onClick={() => {
                  setCategory(cat)
                  lightTap()
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="duration-note">
            <span className="clock">🕐</span>
            2 × {halfDurationMinutes(category)} minuten · totaal {totalMatchMinutes(category)} min
          </div>
        </div>

        <div className="card">
          <TeamInput
            title="Thuisteam"
            icon="🏠"
            placeholder="Naam thuisteam"
            value={homeTeam}
            accent="var(--home-text)"
            teams={teams}
            onChange={setHomeTeam}
            onPick={(t) => {
              setHomeTeam(t.name)
              setCategory(t.ageCategory)
            }}
          />
          <div className="vs-divider">
            <hr />
            <span>VS</span>
            <hr />
          </div>
          <TeamInput
            title="Uitteam"
            icon="✈️"
            placeholder="Naam uitteam"
            value={awayTeam}
            accent="var(--away-text)"
            teams={teams}
            onChange={setAwayTeam}
            onPick={(t) => {
              setAwayTeam(t.name)
              setCategory(t.ageCategory)
            }}
          />
        </div>

        <button className="btn-start" disabled={!canStart} onClick={start}>
          ▶ START WEDSTRIJD
        </button>

        <div className="bottom-buttons">
          <button className="btn-secondary" onClick={onShowHistory}>
            🏆 Historie
          </button>
          <button className="btn-secondary" onClick={onShowRules}>
            📖 Spelregels
          </button>
        </div>
      </div>
    </div>
  )
}

interface TeamInputProps {
  title: string
  icon: string
  placeholder: string
  value: string
  accent: string
  teams: SavedTeam[]
  onChange: (v: string) => void
  onPick: (t: SavedTeam) => void
}

function TeamInput({ title, icon, placeholder, value, accent, teams, onChange, onPick }: TeamInputProps) {
  const [focused, setFocused] = useState(false)

  const trimmed = value.trim()
  const filtered = (
    trimmed === ''
      ? teams
      : teams.filter((t) => t.name.toLowerCase().includes(trimmed.toLowerCase()))
  ).slice(0, 6)

  const showSuggestions = focused && filtered.length > 0

  return (
    <div className="team-field" style={{ ['--focus-color' as string]: accent }}>
      <div className="field-title">
        <span style={{ fontSize: 11 }}>{icon}</span>
        <span className="section-label">{title}</span>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showSuggestions && (
        <div className="suggestions">
          {filtered.map((team) => (
            <button
              key={team.id}
              className="suggestion"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(team)
                setFocused(false)
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.6 }}>🕐</span>
              {team.name}
              <span className="badge">{team.ageCategory}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
