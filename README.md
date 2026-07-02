# Spelbegeleider (web)

Wedstrijdtimer en score-app voor spelbegeleiders in het jeugdvoetbal (JO8 t/m JO10), conform de KNVB-spelregels voor pupillenvoetbal. Progressive Web App: werkt in elke moderne browser, is toe te voegen aan het beginscherm en werkt daarna ook offline.

## Functies

- Leeftijdscategorie JO8/JO9/JO10 met automatische speelduur (2 × 20 of 2 × 25 min)
- Wedstrijdtimer per kwart met time-out afteller (2 min) en rust
- Alarm (geluid + trillen*) aan het einde van elke periode
- Doelpunten bijhouden met minuut en optionele naam van de scorer
- Lang indrukken op een scoreknop = laatste doelpunt ongedaan maken
- Opgeslagen teams met leeftijdscategorie (autocomplete)
- Wedstrijdhistorie met detailweergave
- Uitslag delen via de native share sheet (WhatsApp etc.)
- Spelregels-overzicht met links naar KNVB.nl
- Scherm blijft aan tijdens de wedstrijd (Wake Lock API)

*Trillen werkt op Android; iOS ondersteunt de Vibration API niet in de browser.

## Ontwikkelen

```bash
npm install
npm run dev        # dev server op http://localhost:5173
npm run build      # productiebuild in dist/
```

## Hosten

De app is volledig statisch (geen backend; data staat in localStorage van de browser). De inhoud van `dist/` kan overal gehost worden:

- **Netlify / Vercel**: repo koppelen, build command `npm run build`, publish directory `dist`
- **GitHub Pages**: `dist/` publiceren (de app gebruikt relatieve paden en werkt ook vanuit een submap)

HTTPS is vereist voor de service worker (offline gebruik) en de Wake Lock API — alle bovengenoemde hosts bieden dat standaard.

## Techniek

React 18 + TypeScript + Vite. Geen verdere dependencies. Web Audio API voor het alarm, Vibration API voor haptiek, Wake Lock API om het scherm aan te houden, `navigator.share` voor delen.
