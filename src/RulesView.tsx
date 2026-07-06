import { useState } from 'react'
import type { AgeCategory } from './models'
import {
  CATEGORIES,
  FIELD_SIZE,
  KNVB_INFOGRAPHIC_URL,
  KNVB_URL,
  PLAYERS_PER_SIDE,
  GOAL_SIZE,
  halfDurationMinutes,
  totalMatchMinutes,
} from './models'

export default function RulesView({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<AgeCategory>('JO10')

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Spelregels</h2>
        <button className="close" onClick={onClose}>Klaar</button>
      </div>
      <div className="panel-body">
        <div className="chip-row">
          {CATEGORIES.map((cat) => (
            <button key={cat} className={`chip ${category === cat ? 'selected' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="rules-card">
          <div className="head">
            <div>
              <h3>{category}</h3>
              <div className="sub">
                Pupillenvoetbal · {PLAYERS_PER_SIDE} tegen {PLAYERS_PER_SIDE}
              </div>
            </div>
            <span className="ball">⚽</span>
          </div>
          <RuleRow icon="👥" label="Spelers" value={`${PLAYERS_PER_SIDE} per team (incl. keeper)`} />
          <RuleRow
            icon="🕐"
            label="Speelduur"
            value={`2 × ${halfDurationMinutes(category)} min (totaal ${totalMatchMinutes(category)} min)`}
          />
          <RuleRow icon="⏱️" label="Time-out" value="Halverwege elke helft · max. 2 min." />
          <RuleRow icon="⏸️" label="Rust" value={`Na ${halfDurationMinutes(category)} min · max. 10 min.`} />
          <RuleRow icon="↔️" label="Veldmaat" value={FIELD_SIZE} />
          <RuleRow icon="🥅" label="Doel" value={GOAL_SIZE} />
          <RuleRow icon="🚩" label="Buitenspel" value="Nee" accent />
          <RuleRow icon="🚶" label="Uitbal" value="Indribbelen (geen ingooi)" />
        </div>

        <a className="link-btn" href={KNVB_URL} target="_blank" rel="noopener noreferrer">
          <span style={{ fontSize: 16 }}>🌐</span>
          <div>
            <div className="lt">Spelregels op KNVB.nl</div>
            <div className="ls">Officiële pagina pupillenvoetbal</div>
          </div>
          <span className="chev">›</span>
        </a>
        <a className="link-btn" href={KNVB_INFOGRAPHIC_URL} target="_blank" rel="noopener noreferrer">
          <span style={{ fontSize: 16 }}>📄</span>
          <div>
            <div className="lt">Infographic 6 tegen 6</div>
            <div className="ls">KNVB overzicht veld en regels (PDF)</div>
          </div>
          <span className="chev">›</span>
        </a>

        <div className="source-note">Bron: KNVB</div>
      </div>
    </div>
  )
}

function RuleRow({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rule-row">
      <span style={{ fontSize: 14, width: 22, textAlign: 'center' }}>{icon}</span>
      <span className="rlabel">{label}</span>
      <span className={`rvalue ${accent ? 'accent' : ''}`}>{value}</span>
    </div>
  )
}
