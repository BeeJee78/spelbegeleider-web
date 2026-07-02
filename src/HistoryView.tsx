import { useState } from 'react'
import type { Goal, Match } from './models'
import { homeGoals, awayGoals, scoreString } from './models'
import { savedMatches, deleteMatch } from './storage'
import { shareMatchImage } from './shareImage'

export default function HistoryView({ onClose }: { onClose: () => void }) {
  const [matches, setMatches] = useState<Match[]>(savedMatches())
  const [selected, setSelected] = useState<Match | null>(null)

  function remove(id: string) {
    deleteMatch(id)
    setMatches(savedMatches())
  }

  if (selected) {
    return <MatchDetail match={selected} onClose={() => setSelected(null)} />
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Historie</h2>
        <button className="close" onClick={onClose}>Klaar</button>
      </div>
      <div className="panel-body">
        {matches.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>Nog geen wedstrijden</h3>
            <p>Gespeelde wedstrijden verschijnen hier.</p>
          </div>
        ) : (
          matches.map((match) => (
            <HistoryRow key={match.id} match={match} onOpen={() => setSelected(match)} onDelete={() => remove(match.id)} />
          ))
        )}
      </div>
    </div>
  )
}

function HistoryRow({ match, onOpen, onDelete }: { match: Match; onOpen: () => void; onDelete: () => void }) {
  const date = new Date(match.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div className="history-row" onClick={onOpen}>
      <div className="top">
        <span className="badge">{match.ageCategory}</span>
        <span className="date">{date}</span>
        {match.isCompleted && <span className="check">✓</span>}
      </div>
      <div className="scoreline">
        <span className="team home-color">{match.homeTeam}</span>
        <span className="score">{scoreString(match)}</span>
        <span className="team away away-color">{match.awayTeam}</span>
      </div>
      <button
        className="delete"
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm('Wedstrijd verwijderen?')) onDelete()
        }}
      >
        Verwijderen
      </button>
    </div>
  )
}

function MatchDetail({ match, onClose }: { match: Match; onClose: () => void }) {
  async function share() {
    await shareMatchImage(match)
  }

  const goalsByPeriod = new Map<number, Goal[]>()
  for (const goal of match.goals) {
    const list = goalsByPeriod.get(goal.quarter) ?? []
    list.push(goal)
    goalsByPeriod.set(goal.quarter, list)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <button className="close" onClick={onClose}>‹ Terug</button>
        <button className="close" onClick={share}>↗ Delen</button>
      </div>
      <div className="panel-body">
        <div className="detail-score-card">
          <span className="badge">{match.ageCategory}</span>
          <div className="nums">
            <span>{homeGoals(match)}</span>
            <span className="dash">—</span>
            <span>{awayGoals(match)}</span>
          </div>
          <div className="team-names" style={{ marginTop: 14 }}>
            <div className="side">
              <div className="tag home-color" style={{ opacity: 0.5 }}>THUIS</div>
              <div className="name home-color">{match.homeTeam}</div>
            </div>
            <div className="divider" />
            <div className="side">
              <div className="tag away-color" style={{ opacity: 0.5 }}>UIT</div>
              <div className="name away-color">{match.awayTeam}</div>
            </div>
          </div>
        </div>

        {match.goals.length === 0 ? (
          <div className="no-goals">Geen doelpunten gescoord</div>
        ) : (
          <>
            <div className="section-label">Doelpunten</div>
            {[1, 2, 3, 4].map((period) => {
              const goals = goalsByPeriod.get(period)
              if (!goals) return null
              return (
                <div key={period}>
                  <div className="half-label">{period <= 2 ? '1e Helft' : '2e Helft'}</div>
                  <div className="goals-list">
                    {goals.map((goal) => (
                      <div key={goal.id} className="goal-row">
                        <span
                          className="dot"
                          style={{ background: goal.team === 'home' ? 'var(--home-blue)' : 'var(--away-red)' }}
                        />
                        <span style={{ fontSize: 13 }}>⚽</span>
                        <div className="info">
                          <div className="team">{goal.team === 'home' ? match.homeTeam : match.awayTeam}</div>
                          {goal.scorerName && (
                            <div className={`scorer ${goal.team === 'home' ? 'home-color' : 'away-color'}`}>
                              {goal.scorerName}
                            </div>
                          )}
                        </div>
                        <span className="when">{goal.minute}'</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
