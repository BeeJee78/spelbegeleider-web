// Grasveld van bovenaf als vaste achtergrond: maai-banen, veldlijnen,
// middencirkel en strafschopgebieden. Bewust donker en subtiel gehouden
// zodat de content leesbaar blijft.
export default function FieldBackground() {
  const line = 'rgba(255,255,255,0.055)'
  return (
    <svg className="field-bg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#122913" />
          <stop offset="50%" stopColor="#0C1D0D" />
          <stop offset="100%" stopColor="#102412" />
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill="url(#grass)" />

      {/* Maai-banen */}
      {[0, 2, 4, 6, 8].map((i) => (
        <rect key={i} x="0" y={i * 105.5} width="390" height="52.75" fill="rgba(255,255,255,0.02)" />
      ))}

      {/* Veldlijnen */}
      <g fill="none" stroke={line} strokeWidth="2">
        {/* Zijlijnen */}
        <rect x="28" y="40" width="334" height="764" rx="2" />
        {/* Middenlijn + cirkel */}
        <line x1="28" y1="422" x2="362" y2="422" />
        <circle cx="195" cy="422" r="58" />
        {/* Strafschopgebieden */}
        <rect x="103" y="40" width="184" height="88" />
        <rect x="103" y="716" width="184" height="88" />
        {/* Doelgebieden */}
        <rect x="145" y="40" width="100" height="36" />
        <rect x="145" y="768" width="100" height="36" />
        {/* Strafschopbogen */}
        <path d="M 158 128 A 48 48 0 0 0 232 128" />
        <path d="M 158 716 A 48 48 0 0 1 232 716" />
        {/* Hoekschopbogen */}
        <path d="M 28 52 A 12 12 0 0 0 40 40" />
        <path d="M 350 40 A 12 12 0 0 0 362 52" />
        <path d="M 40 804 A 12 12 0 0 0 28 792" />
        <path d="M 362 792 A 12 12 0 0 0 350 804" />
      </g>

      {/* Middenstip en strafschopstippen */}
      <g fill={line}>
        <circle cx="195" cy="422" r="3.5" />
        <circle cx="195" cy="98" r="2.5" />
        <circle cx="195" cy="746" r="2.5" />
      </g>
    </svg>
  )
}
