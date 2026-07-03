import type { Match } from './models'
import { awayGoals, homeGoals, shareText } from './models'

// Rendert de uitslag als afbeelding in de stijl van de app en deelt die
// via de native share sheet. Valt terug op tekst delen of downloaden.

const W = 1080
const COLORS = {
  bg: '#090F0A',
  surface: '#111E13',
  accent: '#76FF03',
  green: '#4CAF50',
  homeText: '#90CAF9',
  awayText: '#EF9A9A',
  homeBlue: '#1565C0',
  awayRed: '#B71C1C',
  white: '#FFFFFF',
}

export async function shareMatchImage(match: Match): Promise<void> {
  const blob = await renderMatchImage(match)
  const file = new File([blob], 'uitslag.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return // gebruiker annuleerde
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ text: shareText(match) })
      return
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return
    }
  }

  // Laatste terugval: afbeelding downloaden
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'uitslag.png'
  a.click()
  URL.revokeObjectURL(url)
}

export async function renderMatchImage(match: Match): Promise<Blob> {
  // Logo's vooraf laden (dataURLs)
  const [homeLogoImg, awayLogoImg] = await Promise.all([
    loadImage(match.homeLogo),
    loadImage(match.awayLogo),
  ])
  const hasLogos = !!(homeLogoImg || awayLogoImg)

  const goals = match.goals
  const goalsH1 = goals.filter((g) => g.quarter <= 2)
  const goalsH2 = goals.filter((g) => g.quarter > 2)

  // Hoogte afhankelijk van het aantal doelpunten
  const goalRowH = 78
  const halfHeaderH = 70
  let goalsHeight = 0
  if (goals.length > 0) {
    goalsHeight = 120 // sectielabel + marge
    if (goalsH1.length > 0) goalsHeight += halfHeaderH + goalsH1.length * goalRowH
    if (goalsH2.length > 0) goalsHeight += halfHeaderH + goalsH2.length * goalRowH
  }
  const logoExtra = hasLogos ? 80 : 0
  const H = (goals.length > 0 ? 760 + goalsHeight + 30 : 900) + logoExtra

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Achtergrond met subtiel raster
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += 72) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += 72) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  const cx = W / 2

  // Kop: app-naam + datum
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 34px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('⚽ SPELBEGELEIDER', cx, 110)

  const date = new Date(match.date).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '400 30px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(date, cx, 162)

  // Categorie-badge
  ctx.font = '700 34px -apple-system, "Segoe UI", Roboto, sans-serif'
  const badgeText = match.ageCategory
  const badgeW = ctx.measureText(badgeText).width + 56
  ctx.fillStyle = COLORS.accent
  roundRect(ctx, cx - badgeW / 2, 200, badgeW, 62, 31)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.fillText(badgeText, cx, 244)

  // Scorekaart
  const cardY = 310
  const cardH = hasLogos ? 440 : 360
  ctx.fillStyle = COLORS.surface
  roundRect(ctx, 60, cardY, W - 120, cardH, 36)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 2
  roundRect(ctx, 60, cardY, W - 120, cardH, 36)
  ctx.stroke()

  // Score
  ctx.fillStyle = COLORS.white
  ctx.font = '900 170px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(String(homeGoals(match)), cx - 190, cardY + 190)
  ctx.fillText(String(awayGoals(match)), cx + 190, cardY + 190)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '200 90px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('—', cx, cardY + 175)

  // Clublogo's
  if (hasLogos) {
    const logoSize = 90
    const logoY = cardY + 238
    if (homeLogoImg) ctx.drawImage(homeLogoImg, cx - 230 - logoSize / 2, logoY, logoSize, logoSize)
    if (awayLogoImg) ctx.drawImage(awayLogoImg, cx + 230 - logoSize / 2, logoY, logoSize, logoSize)
  }

  // Teamnamen
  const labelY = cardY + (hasLogos ? 360 : 255)
  ctx.font = '500 24px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillStyle = 'rgba(144,202,249,0.55)'
  ctx.fillText('THUIS', cx - 230, labelY)
  ctx.fillStyle = 'rgba(239,154,154,0.55)'
  ctx.fillText('UIT', cx + 230, labelY)

  drawTeamName(ctx, match.homeTeam, cx - 230, labelY + 50, 400, COLORS.homeText)
  drawTeamName(ctx, match.awayTeam, cx + 230, labelY + 50, 400, COLORS.awayText)

  // Scheidslijntje
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.moveTo(cx, cardY + 235)
  ctx.lineTo(cx, labelY + 65)
  ctx.stroke()

  // Doelpunten
  let y = cardY + cardH + 90
  if (goals.length > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '600 28px -apple-system, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('D O E L P U N T E N', cx, y)
    y += 40

    for (const [label, list] of [
      ['1e Helft', goalsH1],
      ['2e Helft', goalsH2],
    ] as const) {
      if (list.length === 0) continue
      y += halfHeaderH
      ctx.fillStyle = 'rgba(118,255,3,0.8)'
      ctx.font = '600 30px -apple-system, "Segoe UI", Roboto, sans-serif'
      ctx.fillText(label, cx, y - 22)

      for (const goal of list) {
        const isHome = goal.team === 'home'
        // Rij-achtergrond
        ctx.fillStyle = COLORS.surface
        roundRect(ctx, 90, y, W - 180, goalRowH - 14, 18)
        ctx.fill()
        // Kleurstip
        ctx.fillStyle = isHome ? COLORS.homeBlue : COLORS.awayRed
        ctx.beginPath()
        ctx.arc(140, y + (goalRowH - 14) / 2, 11, 0, Math.PI * 2)
        ctx.fill()
        // Team + scorer
        ctx.textAlign = 'left'
        ctx.fillStyle = COLORS.white
        ctx.font = '600 32px -apple-system, "Segoe UI", Roboto, sans-serif'
        const teamName = isHome ? match.homeTeam : match.awayTeam
        const scorer = goal.scorerName ? `  ·  ${goal.scorerName}` : ''
        ctx.fillText(fitText(ctx, teamName + scorer, 640), 180, y + 44)
        // Minuut
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '500 30px ui-monospace, Menlo, monospace'
        ctx.fillText(`${goal.minute}'`, W - 130, y + 44)
        ctx.textAlign = 'center'
        y += goalRowH
      }
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = 'italic 400 30px -apple-system, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('Geen doelpunten gescoord', cx, y)
    y += 40
  }

  // Voetnoot
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = '400 26px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Spelbegeleider · jeugdvoetbal app', cx, H - 60)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('render mislukt'))), 'image/png')
  })
}

function loadImage(dataURL: string | undefined): Promise<HTMLImageElement | null> {
  if (!dataURL) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = dataURL
  })
}

function drawTeamName(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  maxWidth: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.font = '700 38px -apple-system, "Segoe UI", Roboto, sans-serif'
  if (ctx.measureText(name).width <= maxWidth) {
    ctx.fillText(name, x, y)
    return
  }
  // Te lang: verdeel over twee regels op een spatie
  const words = name.split(' ')
  let line1 = ''
  let line2 = ''
  for (const word of words) {
    const attempt = line1 ? `${line1} ${word}` : word
    if (line2 === '' && ctx.measureText(attempt).width <= maxWidth) line1 = attempt
    else line2 = line2 ? `${line2} ${word}` : word
  }
  ctx.font = '700 32px -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(fitText(ctx, line1, maxWidth), x, y - 18)
  if (line2) ctx.fillText(fitText(ctx, line2, maxWidth), x, y + 22)
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}
