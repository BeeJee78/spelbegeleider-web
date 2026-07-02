import { useState } from 'react'
import type { Match } from './models'
import SetupView from './SetupView'
import MatchView from './MatchView'
import HistoryView from './HistoryView'
import RulesView from './RulesView'

export default function App() {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showRules, setShowRules] = useState(false)

  return (
    <>
      {activeMatch ? (
        <MatchView key={activeMatch.id} match={activeMatch} onDismiss={() => setActiveMatch(null)} />
      ) : (
        <SetupView
          onStartMatch={setActiveMatch}
          onShowHistory={() => setShowHistory(true)}
          onShowRules={() => setShowRules(true)}
        />
      )}
      {showHistory && <HistoryView onClose={() => setShowHistory(false)} />}
      {showRules && <RulesView onClose={() => setShowRules(false)} />}
    </>
  )
}
