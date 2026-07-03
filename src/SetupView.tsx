import { useRef, useState } from 'react'
import type { AgeCategory, Match, SavedTeam } from './models'
import { CATEGORIES, halfDurationMinutes, newMatch, totalMatchMinutes } from './models'
import { savedTeams, saveTeam } from './storage'
import { lightTap } from './alarm'
import { fileToLogoDataURL } from './logo'
import { presetLogo } from './presetLogos'

interface Props {
  onStartMatch: (match: Match) => void
  onShowHistory: () => void
  onShowRules: () => void
}

export default function SetupView({ onStartMatch, onShowHistory, onShowRules }: Props) {
  const [category, setCategory] = useState<AgeCategory>('JO10')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [homeLogo, setHomeLogo] = useState<string | undefined>()
  const [awayLogo, setAwayLogo] = useState<string | undefined>()
  const teams = savedTeams()

  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''

  function start() {
    const home = homeTeam.trim()
    const away = awayTeam.trim()
    saveTeam(home, category, homeLogo)
    saveTeam(away, category, awayLogo)
    lightTap()
    onStartMatch(newMatch(home, away, category, homeLogo, awayLogo))
  }

  return (
    <div className="screen">
      <div className="setup">
        <header className="setup-header">
          <div className="ball">⚽</div>
          <h1 className="wordmark">
            SPEL<span>BEGELEIDER</span>
          </h1>
          <div className="subtitle-pill">JEUGDVOETBAL · JO8–JO10</div>
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
            logo={homeLogo}
            accent="var(--home-text)"
            teams={teams}
            onChange={(v) => {
              setHomeTeam(v)
              setHomeLogo(presetLogo(v))
            }}
            onLogo={setHomeLogo}
            onPick={(t) => {
              setHomeTeam(t.name)
              setHomeLogo(t.logo ?? presetLogo(t.name))
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
            logo={awayLogo}
            accent="var(--away-text)"
            teams={teams}
            onChange={(v) => {
              setAwayTeam(v)
              setAwayLogo(presetLogo(v))
            }}
            onLogo={setAwayLogo}
            onPick={(t) => {
              setAwayTeam(t.name)
              setAwayLogo(t.logo ?? presetLogo(t.name))
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
  logo?: string
  accent: string
  teams: SavedTeam[]
  onChange: (v: string) => void
  onLogo: (dataURL: string | undefined) => void
  onPick: (t: SavedTeam) => void
}

function TeamInput({ title, icon, placeholder, value, logo, accent, teams, onChange, onLogo, onPick }: TeamInputProps) {
  const [focused, setFocused] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const trimmed = value.trim()
  const filtered = (
    trimmed === ''
      ? teams
      : teams.filter((t) => t.name.toLowerCase().includes(trimmed.toLowerCase()))
  ).slice(0, 6)

  const showSuggestions = focused && filtered.length > 0

  async function pickLogo(file: File | undefined) {
    if (!file) return
    try {
      onLogo(await fileToLogoDataURL(file))
    } catch {
      // ongeldig bestand — negeren
    }
  }

  return (
    <div className="team-field" style={{ ['--focus-color' as string]: accent }}>
      <div className="field-title">
        <span style={{ fontSize: 11 }}>{icon}</span>
        <span className="section-label">{title}</span>
      </div>
      <div className="input-row">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        <button
          className="logo-pick"
          title="Clublogo kiezen"
          onClick={() => fileRef.current?.click()}
        >
          {logo ? <img src={logo} alt="" /> : <span>🛡️</span>}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void pickLogo(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
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
              {team.logo ? (
                <img className="suggestion-logo" src={team.logo} alt="" />
              ) : (
                <span style={{ fontSize: 12, opacity: 0.6 }}>🕐</span>
              )}
              {team.name}
              <span className="badge">{team.ageCategory}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
