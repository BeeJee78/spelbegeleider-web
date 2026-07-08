import { useState } from 'react'
import type { AgeCategory } from './models'
import {
  CATEGORIES,
  GOAL_SIZE,
  ballSize,
  fieldSize,
  halfDurationMinutes,
  isEightVsEight,
  knvbInfographicURL,
  knvbURL,
  matchLeader,
  penaltyDistance,
  playersPerSide,
  restMinutes,
  totalMatchMinutes,
} from './models'

export default function RulesView({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<AgeCategory>('JO10')
  const players = playersPerSide(category)
  const eightVsEight = isEightVsEight(category)

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
                Pupillenvoetbal · {players} tegen {players}
              </div>
            </div>
            <span className="ball">⚽</span>
          </div>
          <RuleRow icon="👥" label="Spelers" value={`${players} per team (incl. keeper)`} />
          <RuleRow
            icon="🕐"
            label="Speelduur"
            value={`2 × ${halfDurationMinutes(category)} min (totaal ${totalMatchMinutes(category)} min)`}
          />
          <RuleRow icon="⏱️" label="Time-out" value="Halverwege elke helft · max. 2 min." />
          <RuleRow
            icon="⏸️"
            label="Rust"
            value={`Na ${halfDurationMinutes(category)} min · max. ${restMinutes(category)} min.`}
          />
          <RuleRow icon="↔️" label="Veldmaat" value={fieldSize(category)} />
          <RuleRow icon="🥅" label="Doel" value={GOAL_SIZE} />
          <RuleRow icon="⚽" label="Bal" value={ballSize(category)} />
          <RuleRow icon="🎯" label="Strafschop" value={penaltyDistance(category)} />
          <RuleRow icon="🚩" label="Buitenspel" value="Nee" accent />
          <RuleRow icon="🚶" label="Uitbal" value="Indribbelen (geen ingooi)" />
          <RuleRow icon="📣" label="Leiding" value={matchLeader(category)} />
        </div>

        <div className="tip-card">
          <div className="tip-title">💡 Veld uitzetten</div>
          {eightVsEight ? (
            <>
              <p>
                Zet de hoekpionnen <strong>18,75 meter naast elke paal van het pupillendoel</strong>{' '}
                (samen 42,5 m breed) en zet het veld <strong>64 m diep</strong> uit.
              </p>
              <p>
                Markeer het keepersgebied met twee pionnen in een afwijkende kleur{' '}
                <strong>ter hoogte van de zijkant van de 16 meter</strong>.
              </p>
            </>
          ) : (
            <>
              <p>
                Zet de hoekpionnen <strong>12,5 meter naast elke paal van het pupillendoel</strong>{' '}
                (samen 30 m breed) en zet het veld <strong>42,5 m diep</strong> uit.
              </p>
              <p>
                Markeer het keepersgebied met twee pionnen in een afwijkende kleur op{' '}
                <strong>7 meter van de achterlijn</strong>.
              </p>
            </>
          )}
        </div>

        <a className="link-btn" href={knvbURL(category)} target="_blank" rel="noopener noreferrer">
          <span style={{ fontSize: 16 }}>🌐</span>
          <div>
            <div className="lt">Spelregels op KNVB.nl</div>
            <div className="ls">Officiële pagina pupillenvoetbal</div>
          </div>
          <span className="chev">›</span>
        </a>
        <a className="link-btn" href={knvbInfographicURL(category)} target="_blank" rel="noopener noreferrer">
          <span style={{ fontSize: 16 }}>📄</span>
          <div>
            <div className="lt">Infographic {players} tegen {players}</div>
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
