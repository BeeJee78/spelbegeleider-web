// Ingebouwde clublogo's van clubs uit de regio Apeldoorn
// (bron: logoapi.voetbal.nl, op KNVB-clubcode).

const PRESETS: Array<{ pattern: RegExp; src: string }> = [
  { pattern: /groen[\s-]*wit/i, src: 'logos/groenwit62.png' },        // sv Groen Wit '62 (BBKX18T)
  { pattern: /alexandria|wka/i, src: 'logos/alexandria.png' },        // WKA Alexandria (BBKT91Q)
  { pattern: /apeldoornse\s*boys/i, src: 'logos/apeldoornseboys.png' }, // Apeldoornse Boys (BBKY03M)
  { pattern: /\bwsv\b/i, src: 'logos/wsv.png' },                      // WSV (BBKV16H)
  { pattern: /columbia/i, src: 'logos/columbia.png' },                // AVV Columbia (BBKT36D)
  { pattern: /beekbergen/i, src: 'logos/beekbergen.png' },            // VV Beekbergen (BBKS368)
  { pattern: /klarenbeek/i, src: 'logos/klarenbeek.png' },            // SC Klarenbeek (BBKV945)
  { pattern: /albatross/i, src: 'logos/albatross.png' },              // Albatross (BBKW917)
  { pattern: /victoria/i, src: 'logos/victoriaboys.png' },            // Victoria Boys (BBKX462)
  { pattern: /agovv/i, src: 'logos/agovv.png' },                      // AGOVV (BBKX88G)
  { pattern: /\bzvv\b/i, src: 'logos/zvv56.png' },                    // ZVV '56 (BBKX484)
  { pattern: /robur/i, src: 'logos/robur.png' },                      // Robur et Velocitas (BBKR21T)
  { pattern: /wwna/i, src: 'logos/wwna.png' },                        // WWNA (BBKZ347)
  { pattern: /loenermark/i, src: 'logos/loenermark.png' },            // sv Loenermark (BBKX41V)
  { pattern: /\bcsv\b/i, src: 'logos/csvapeldoorn.png' },             // csv Apeldoorn (BBKR75E)
]

export function presetLogo(teamName: string): string | undefined {
  return PRESETS.find((p) => p.pattern.test(teamName))?.src
}
