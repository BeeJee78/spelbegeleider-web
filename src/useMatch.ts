import { useCallback, useEffect, useRef, useState } from 'react'
import type { AgeCategory, Goal, Match, TeamSide } from './models'
import { periodDurationSeconds, restMinutes } from './models'
import { triggerPeriodEnd, goalHaptic, lightTap, initAudio } from './alarm'
import { upsertMatch } from './storage'

// Structuur per wedstrijd: 4 periodes
//  Periode 1 → einde: TIME-OUT (1e helft, voor time-out)
//  Periode 2 → einde: RUST     (1e helft, na time-out)
//  Periode 3 → einde: TIME-OUT (2e helft, voor time-out)
//  Periode 4 → einde: EINDE WEDSTRIJD

const TIMEOUT_SECONDS = 120

export interface MatchState {
  match: Match
  currentPeriod: number
  secondsElapsed: number
  isRunning: boolean
  periodJustEnded: boolean
  matchCompleted: boolean
  timeoutRemaining: number
}

export function useMatch(initial: Match) {
  const [match, setMatch] = useState(initial)
  const [currentPeriod, setCurrentPeriod] = useState(1)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [periodJustEnded, setPeriodJustEnded] = useState(false)
  const [matchCompleted, setMatchCompleted] = useState(false)
  const [timeoutRemaining, setTimeoutRemaining] = useState(TIMEOUT_SECONDS)

  // Op timestamps gebaseerde klok: overleeft throttling van achtergrondtabbladen
  const startedAtRef = useRef<number | null>(null)
  const baseElapsedRef = useRef(0)
  const intervalRef = useRef<number | null>(null)
  const timeoutStartRef = useRef<number | null>(null)
  const timeoutIntervalRef = useRef<number | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const periodDuration = periodDurationSeconds(match.ageCategory)

  const persist = useCallback((m: Match) => {
    upsertMatch(m)
    return m
  }, [])

  const requestWakeLock = useCallback(async () => {
    try {
      wakeLockRef.current = await navigator.wakeLock?.request('screen')
    } catch {
      // wake lock niet beschikbaar of geweigerd — geen probleem
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    void wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  const stopClock = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (startedAtRef.current !== null) {
      baseElapsedRef.current += (Date.now() - startedAtRef.current) / 1000
      startedAtRef.current = null
    }
  }, [])

  const stopTimeoutClock = useCallback(() => {
    if (timeoutIntervalRef.current !== null) {
      clearInterval(timeoutIntervalRef.current)
      timeoutIntervalRef.current = null
    }
    timeoutStartRef.current = null
    setTimeoutRemaining(TIMEOUT_SECONDS)
  }, [])

  const endPeriodRef = useRef<() => void>(() => {})

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return
    const elapsed = Math.floor(baseElapsedRef.current + (Date.now() - startedAtRef.current) / 1000)
    setSecondsElapsed(Math.min(elapsed, periodDuration))
    if (elapsed >= periodDuration) endPeriodRef.current()
  }, [periodDuration])

  const startOrResume = useCallback(() => {
    if (matchCompleted || periodJustEnded) return
    initAudio()
    void requestWakeLock()
    setIsRunning(true)
    startedAtRef.current = Date.now()
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(tick, 250)
  }, [matchCompleted, periodJustEnded, requestWakeLock, tick])

  const pause = useCallback(() => {
    setIsRunning(false)
    stopClock()
  }, [stopClock])

  const startTimeoutClock = useCallback(() => {
    timeoutStartRef.current = Date.now()
    setTimeoutRemaining(TIMEOUT_SECONDS)
    timeoutIntervalRef.current = window.setInterval(() => {
      if (timeoutStartRef.current === null) return
      const gone = Math.floor((Date.now() - timeoutStartRef.current) / 1000)
      const left = Math.max(0, TIMEOUT_SECONDS - gone)
      setTimeoutRemaining(left)
      if (left === 0 && timeoutIntervalRef.current !== null) {
        clearInterval(timeoutIntervalRef.current)
        timeoutIntervalRef.current = null
      }
    }, 250)
  }, [])

  const endPeriod = useCallback(
    (periodOverride?: number) => {
      const period = periodOverride ?? currentPeriod
      setIsRunning(false)
      stopClock()
      baseElapsedRef.current = periodDuration
      setSecondsElapsed(periodDuration)
      setPeriodJustEnded(true)

      if (period >= 4) {
        setMatchCompleted(true)
        setMatch((m) => persist({ ...m, isCompleted: true }))
        releaseWakeLock()
      } else {
        setMatch((m) => persist(m))
        if (period === 1 || period === 3) startTimeoutClock()
      }
      triggerPeriodEnd()
    },
    [currentPeriod, periodDuration, persist, releaseWakeLock, startTimeoutClock, stopClock],
  )

  useEffect(() => {
    endPeriodRef.current = () => endPeriod()
  }, [endPeriod])

  const startNextPeriod = useCallback(() => {
    if (currentPeriod >= 4 || matchCompleted) return
    stopTimeoutClock()
    setCurrentPeriod((p) => p + 1)
    baseElapsedRef.current = 0
    setSecondsElapsed(0)
    setPeriodJustEnded(false)
    initAudio()
    void requestWakeLock()
    setIsRunning(true)
    startedAtRef.current = Date.now()
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(tick, 250)
  }, [currentPeriod, matchCompleted, requestWakeLock, stopTimeoutClock, tick])

  const forceEndCurrentPeriod = useCallback(() => {
    if (matchCompleted) return
    endPeriod()
  }, [endPeriod, matchCompleted])

  const forceEndMatch = useCallback(() => {
    if (matchCompleted) return
    setCurrentPeriod(4)
    endPeriod(4)
  }, [endPeriod, matchCompleted])

  const addGoal = useCallback(
    (team: TeamSide): Goal => {
      const liveElapsed =
        startedAtRef.current !== null
          ? baseElapsedRef.current + (Date.now() - startedAtRef.current) / 1000
          : baseElapsedRef.current
      const totalElapsed = (currentPeriod - 1) * periodDuration + Math.floor(liveElapsed)
      const goal: Goal = {
        id: crypto.randomUUID(),
        team,
        minute: Math.floor(totalElapsed / 60) + 1,
        quarter: currentPeriod,
        timestamp: Date.now(),
      }
      setMatch((m) => persist({ ...m, goals: [...m.goals, goal] }))
      goalHaptic()
      return goal
    },
    [currentPeriod, periodDuration, persist],
  )

  const updateScorerName = useCallback(
    (goalId: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setMatch((m) =>
        persist({
          ...m,
          goals: m.goals.map((g) => (g.id === goalId ? { ...g, scorerName: trimmed } : g)),
        }),
      )
    },
    [persist],
  )

  const undoLastGoal = useCallback(
    (team: TeamSide) => {
      setMatch((m) => {
        const idx = m.goals.map((g) => g.team).lastIndexOf(team)
        if (idx < 0) return m
        const goals = [...m.goals]
        goals.splice(idx, 1)
        return persist({ ...m, goals })
      })
      lightTap()
    },
    [persist],
  )

  // Opruimen bij unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
      if (timeoutIntervalRef.current !== null) clearInterval(timeoutIntervalRef.current)
      void wakeLockRef.current?.release()
    }
  }, [])

  // Wake lock opnieuw aanvragen wanneer de pagina weer zichtbaar wordt
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isRunning) void requestWakeLock()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [isRunning, requestWakeLock])

  const state: MatchState = {
    match,
    currentPeriod,
    secondsElapsed,
    isRunning,
    periodJustEnded,
    matchCompleted,
    timeoutRemaining,
  }

  return {
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
  }
}

// Afgeleide labels — zelfde teksten als de iOS-app

export function periodTitle(period: number): string {
  switch (period) {
    case 1: return '1e Helft · 1e Kwart'
    case 2: return '1e Helft · 2e Kwart'
    case 3: return '2e Helft · 1e Kwart'
    default: return '2e Helft · 2e Kwart'
  }
}

export function timerSubtitle(period: number): string {
  switch (period) {
    case 1:
    case 3: return 'resterend tot time-out'
    case 2: return 'resterend tot rust'
    default: return 'resterend in wedstrijd'
  }
}

export function endOfPeriodTitle(period: number): string {
  switch (period) {
    case 1:
    case 3: return 'TIME-OUT'
    case 2: return 'RUST'
    default: return 'EINDE WEDSTRIJD'
  }
}

export function endOfPeriodSubtitle(period: number, cat: AgeCategory): string {
  return period === 2 ? `Max. ${restMinutes(cat)} minuten` : ''
}

export function endOfPeriodIcon(period: number): string {
  switch (period) {
    case 1:
    case 3: return '⏱️'
    case 2: return '🔄'
    default: return '🏆'
  }
}

export function continuePeriodLabel(period: number): string {
  switch (period) {
    case 1: return 'Hervat 1e Helft'
    case 2: return 'Start 2e Helft'
    case 3: return 'Hervat 2e Helft'
    default: return 'Klaar'
  }
}
