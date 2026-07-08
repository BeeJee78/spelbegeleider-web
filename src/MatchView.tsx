import { useRef, useState } from 'react'
import type { ClubColor, Goal, Match, TeamSide } from './models'
import { clubColor, formatSeconds, homeGoals, awayGoals } from './models'
import { shareMatchImage } from './shareImage'
import {
  useMatch,
  periodTitle,
  timerSubtitle,
  endOfPeriodTitle,
  endOfPeriodSubtitle,
  endOfPeriodIcon,
  continuePeriodLabel,
} from './useMatch'

interface Props {
  match: Match
  onDismiss: () => void
}

type ConfirmKind = 'stop' | 'endPeriod' | 'endMatch' | null

export default function MatchView({ match: initialMatch, onDismiss }: Props) {
  const {
    state,
    periodDuration,
    startOrResume,
    pause,
    startNextPeriod,
    forceEndCurrentPeriod,
    forceEndMatch,
    addGoal,
    updateScorerName,
    undoLastGoal,
  } = useMatch(initialMatch)

  const { match, currentPeriod, secondsElapsed, isRunning, periodJustEnded, matchCompleted, timeoutRemaining } = state

  const [confirm, setConfirm] = useState<ConfirmKind>(null)
  const [flashTeam, setFlashTeam] = useState<TeamSide | null>(null)
  const [pendingGoal, setPendingGoal] = useState<Goal | null>(null)

  const remaining = Math.max(0, periodDuration - secondsElapsed)
  const progress = periodDuration > 0 ? Math.min(1, secondsElapsed / periodDuration) : 0

  const controlLabel = isRunning ? 'PAUZE' : secondsElapsed === 0 && currentPeriod === 1 ? 'START' : 'HERVAT'

  function scoreGoal(team: TeamSide) {
    const goal = addGoal(team)
    setFlashTeam(team)
    setTimeout(() => setFlashTeam(null), 900)
    setPendingGoal(goal)
  }

  async function share() {
    await shareMatchImage(match)
  }

  return (
    <div className="match">
      {/* Vaste bovenkant */}
      <div className="match-top">
        <button
          className="stop-btn"
          onClick={() => {
            pause()
            setConfirm('stop')
          }}
        >
          ✕ Stoppen
        </button>
        <span className="app-title">⚽ Spelbegeleider</span>
        <span className="cat-badge">{match.ageCategory}</span>
      </div>

      <div className="period-indicator">
        <div className="period-bars">
          <div className="half">
            {[1, 2].map((p) => (
              <div key={p} className={`bar ${p <= currentPeriod ? 'active' : ''}`} />
            ))}
          </div>
          <span className="rust">R</span>
          <div className="half">
            {[3, 4].map((p) => (
              <div key={p} className={`bar ${p <= currentPeriod ? 'active' : ''}`} />
            ))}
          </div>
        </div>
        <div className="period-title">{periodTitle(currentPeriod)}</div>
      </div>

      {/* Scrollbaar middengedeelte */}
      <div className="match-scroll">
        <div className="card timer-card">
          <div className="time">{formatSeconds(remaining)}</div>
          <div className="sub">{timerSubtitle(currentPeriod)}</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className="card score-card">
          <div className="score-numbers">
            <span className="num">{homeGoals(match)}</span>
            <span className="dash">—</span>
            <span className="num">{awayGoals(match)}</span>
          </div>
          <div className="team-names">
            <div className="side">
              {match.homeLogo && <img className="side-logo" src={match.homeLogo} alt="" />}
              <div className="tag home-color" style={{ opacity: 0.5 }}>THUIS</div>
              <div className="name home-color">{match.homeTeam}</div>
            </div>
            <div className="divider" />
            <div className="side">
              {match.awayLogo && <img className="side-logo" src={match.awayLogo} alt="" />}
              <div className="tag away-color" style={{ opacity: 0.5 }}>UIT</div>
              <div className="name away-color">{match.awayTeam}</div>
            </div>
          </div>
        </div>

        <div className="goal-buttons">
          <GoalButton
            color={buttonColor(match.homeTeam, 'home')}
            name={match.homeTeam}
            logo={match.homeLogo}
            onGoal={() => scoreGoal('home')}
            onUndo={() => undoLastGoal('home')}
          />
          <GoalButton
            color={buttonColor(match.awayTeam, 'away')}
            name={match.awayTeam}
            logo={match.awayLogo}
            onGoal={() => scoreGoal('away')}
            onUndo={() => undoLastGoal('away')}
          />
        </div>

        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>Doelpunten</div>
          {match.goals.length === 0 ? (
            <div className="no-goals">Nog geen doelpunten</div>
          ) : (
            <div className="goals-list">
              {[...match.goals].reverse().map((goal) => (
                <GoalRow key={goal.id} goal={goal} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vaste onderkant */}
      <div className="match-bottom">
        <div className="early-end">
          <button
            className="btn-small"
            disabled={matchCompleted}
            onClick={() => {
              pause()
              setConfirm('endPeriod')
            }}
          >
            🏁 Einde periode
          </button>
          <button
            className="btn-small"
            disabled={matchCompleted}
            onClick={() => {
              pause()
              setConfirm('endMatch')
            }}
          >
            🏆 Einde wedstrijd
          </button>
        </div>
        <button className={`btn-control ${isRunning ? 'running' : ''}`} onClick={() => (isRunning ? pause() : startOrResume())}>
          {isRunning ? '⏸' : '▶'} {controlLabel}
        </button>
      </div>

      {/* Einde periode / wedstrijd overlay */}
      {(periodJustEnded || matchCompleted) && (
        <div className="overlay">
          <div className="end-content">
            <div>
              <div className="icon">{endOfPeriodIcon(currentPeriod)}</div>
              <h2>{endOfPeriodTitle(currentPeriod)}</h2>
              {(currentPeriod === 1 || currentPeriod === 3) && !matchCompleted ? (
                <div className={`timeout-countdown ${timeoutRemaining === 0 ? 'expired' : ''}`} style={{ marginTop: 8 }}>
                  <div className="time">{formatSeconds(timeoutRemaining)}</div>
                  <div className="label">{timeoutRemaining === 0 ? 'Klaar om te hervatten' : 'time-out afteller'}</div>
                </div>
              ) : (
                endOfPeriodSubtitle(currentPeriod, match.ageCategory) && (
                  <div className="subtitle">{endOfPeriodSubtitle(currentPeriod, match.ageCategory)}</div>
                )
              )}
            </div>

            <div>
              <div className="end-score">
                <span>{homeGoals(match)}</span>
                <span className="dash">—</span>
                <span>{awayGoals(match)}</span>
              </div>
              <div className="end-teams">
                <span className="home-color">{match.homeTeam}</span>
                <span className="away-color">{match.awayTeam}</span>
              </div>
            </div>

            <div className="end-actions">
              {matchCompleted ? (
                <>
                  <button className="btn-share" onClick={share}>
                    ↗ Uitslag delen
                  </button>
                  <button className="btn-primary" onClick={onDismiss}>
                    ✓ Klaar
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={startNextPeriod}>
                  ▶ {continuePeriodLabel(currentPeriod)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Doelpunt flash */}
      {flashTeam && (
        <div className={`goal-flash ${flashTeam}`}>
          <div className="inner">
            <div className="ball">⚽</div>
            <h2>DOELPUNT!</h2>
            <div className={`team ${flashTeam === 'home' ? 'home-color' : 'away-color'}`}>
              {flashTeam === 'home' ? match.homeTeam : match.awayTeam}
            </div>
          </div>
        </div>
      )}

      {/* Scorer sheet */}
      {pendingGoal && (
        <ScorerSheet
          goal={pendingGoal}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          onDone={(name) => {
            if (name) updateScorerName(pendingGoal.id, name)
            setPendingGoal(null)
          }}
        />
      )}

      {/* Bevestigingsdialogen */}
      {confirm && (
        <ConfirmDialog
          kind={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'stop') {
              pause()
              onDismiss()
            } else if (confirm === 'endPeriod') {
              forceEndCurrentPeriod()
            } else {
              forceEndMatch()
            }
            setConfirm(null)
          }}
        />
      )}
    </div>
  )
}

// ---------- Subcomponents ----------

// Clubs met een kleur in de naam (bijv. "Groen Wit", "Blauw Zwart") krijgen
// een scoort-knop in die kleur in plaats van standaard blauw/rood.
const DEFAULT_COLORS: Record<TeamSide, ClubColor> = {
  home: { bg: 'rgba(21, 101, 192, 0.85)', shadow: 'rgba(21, 101, 192, 0.45)', fg: '#fff' },
  away: { bg: 'rgba(183, 28, 28, 0.85)', shadow: 'rgba(183, 28, 28, 0.45)', fg: '#fff' },
}

function buttonColor(teamName: string, side: TeamSide): ClubColor {
  return clubColor(teamName) ?? DEFAULT_COLORS[side]
}

function GoalButton({ color, name, logo, onGoal, onUndo }: { color: ClubColor; name: string; logo?: string; onGoal: () => void; onUndo: () => void }) {
  const longPressTimer = useRef<number | null>(null)
  const longPressFired = useRef(false)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  function clearTimer() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function down(e: React.PointerEvent) {
    startPos.current = { x: e.clientX, y: e.clientY }
    moved.current = false
    longPressFired.current = false
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true
      onUndo()
    }, 600)
  }

  function move(e: React.PointerEvent) {
    // Veegbeweging (scrollen/swipen) mag geen doelpunt registreren
    if (!startPos.current || moved.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (Math.hypot(dx, dy) > 10) {
      moved.current = true
      clearTimer()
    }
  }

  function up() {
    clearTimer()
    if (!longPressFired.current && !moved.current) onGoal()
    startPos.current = null
  }

  function cancel() {
    clearTimer()
    longPressFired.current = false
    startPos.current = null
  }

  return (
    <button
      className="goal-btn"
      style={{ background: color.bg, boxShadow: `0 4px 10px ${color.shadow}`, color: color.fg }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {logo ? <img className="btn-logo" src={logo} alt="" draggable={false} /> : <div className="ball">⚽</div>}
      <div className="scoort" style={{ color: color.fg, opacity: 0.65 }}>SCOORT</div>
      <div className="team">{name}</div>
    </button>
  )
}

function GoalRow({ goal, homeTeam, awayTeam }: { goal: Goal; homeTeam: string; awayTeam: string }) {
  const isHome = goal.team === 'home'
  return (
    <div className="goal-row">
      <span className="dot" style={{ background: isHome ? 'var(--home-blue)' : 'var(--away-red)' }} />
      <span style={{ fontSize: 13 }}>⚽</span>
      <div className="info">
        <div className="team">{isHome ? homeTeam : awayTeam}</div>
        {goal.scorerName && (
          <div className={`scorer ${isHome ? 'home-color' : 'away-color'}`}>{goal.scorerName}</div>
        )}
      </div>
      <span className="when">
        H{goal.quarter <= 2 ? 1 : 2} · {goal.minute}'
      </span>
    </div>
  )
}

function ScorerSheet({ goal, homeTeam, awayTeam, onDone }: { goal: Goal; homeTeam: string; awayTeam: string; onDone: (name: string | null) => void }) {
  const [name, setName] = useState('')
  const teamName = goal.team === 'home' ? homeTeam : awayTeam
  const canSave = name.trim() !== ''

  return (
    <div className="sheet-backdrop" onClick={() => onDone(null)}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>⚽ Doelpunt!</h3>
        <div className="meta">
          <span className={goal.team === 'home' ? 'home-color' : 'away-color'}>{teamName}</span>
          {' · '}
          {goal.minute}'
        </div>
        <input
          type="text"
          placeholder="Wie scoorde? (optioneel)"
          value={name}
          autoFocus
          enterKeyHint="done"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onDone(canSave ? name : null)
          }}
        />
        <div className="buttons">
          <button className="skip" onClick={() => onDone(null)}>Overslaan</button>
          <button className="save" disabled={!canSave} onClick={() => onDone(name)}>Opslaan</button>
        </div>
      </div>
    </div>
  )
}

const CONFIRM_TEXT: Record<Exclude<ConfirmKind, null>, { title: string; body: string; action: string }> = {
  stop: {
    title: 'Wedstrijd stoppen?',
    body: 'De wedstrijd wordt automatisch opgeslagen.',
    action: 'Stoppen',
  },
  endPeriod: {
    title: 'Periode beëindigen?',
    body: 'De huidige periode wordt vroegtijdig afgesloten. Het alarm gaat af en de score wordt opgeslagen.',
    action: 'Ja, beëindigen',
  },
  endMatch: {
    title: 'Wedstrijd beëindigen?',
    body: 'De wedstrijd wordt definitief beëindigd en opgeslagen. Dit kan niet ongedaan worden.',
    action: 'Ja, einde wedstrijd',
  },
}

function ConfirmDialog({ kind, onCancel, onConfirm }: { kind: Exclude<ConfirmKind, null>; onCancel: () => void; onConfirm: () => void }) {
  const t = CONFIRM_TEXT[kind]
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h3>{t.title}</h3>
        <p>{t.body}</p>
        <div className="buttons">
          <button className="cancel" onClick={onCancel}>Annuleren</button>
          <button className="destructive" onClick={onConfirm}>{t.action}</button>
        </div>
      </div>
    </div>
  )
}
