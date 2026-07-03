// Vooraf ingebouwde clublogo's (bron: logoapi.voetbal.nl).
// Wordt gebruikt als er nog geen eigen logo voor het team is ingesteld.

const PRESETS: Array<{ pattern: RegExp; src: string }> = [
  { pattern: /groen[\s-]*wit/i, src: 'logos/groenwit62.png' }, // sv Groen Wit '62 (BBKX18T)
]

export function presetLogo(teamName: string): string | undefined {
  return PRESETS.find((p) => p.pattern.test(teamName))?.src
}
