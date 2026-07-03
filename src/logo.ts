// Verkleint een gekozen afbeelding naar een compact vierkant logo (dataURL),
// zodat het in localStorage past en snel rendert.

const LOGO_SIZE = 112

export function fileToLogoDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = LOGO_SIZE
      canvas.height = LOGO_SIZE
      const ctx = canvas.getContext('2d')!
      // 'contain': hele logo zichtbaar, transparante randen
      const scale = Math.min(LOGO_SIZE / img.width, LOGO_SIZE / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (LOGO_SIZE - w) / 2, (LOGO_SIZE - h) / 2, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('afbeelding laden mislukt'))
    }
    img.src = url
  })
}
