export const DEMO_DESCRIPTION =
  '3 haftay se sar dard hai, kabhi BP high hota hai aur ye meri purani report hai.'

function makeSampleReportDataUrl() {
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 900
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 700, 900)

  ctx.fillStyle = '#0a3d2c'
  ctx.fillRect(0, 0, 700, 92)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px Georgia, serif'
  ctx.fillText('City Care Hospital', 40, 42)
  ctx.font = '16px Arial, sans-serif'
  ctx.fillText('Laboratory Report - Lahore', 40, 70)

  ctx.fillStyle = '#0b0f0a'
  ctx.font = 'bold 18px Arial, sans-serif'
  ctx.fillText('Patient: Ali Raza', 40, 132)
  ctx.font = '15px Arial, sans-serif'
  ctx.fillText('Ref by: Dr. S. Khan    Date: 12 Aug 2026', 40, 160)

  ctx.fillStyle = '#0b0f0a'
  ctx.fillRect(40, 182, 620, 2)

  const rows = [
    ['Test', 'Result', 'Reference'],
    ['Hemoglobin', '12.4 g/dL', '13.0 - 17.0'],
    ['Blood Pressure', '150/95 mmHg', '< 120/80'],
    ['Pulse', '86 bpm', '60 - 100'],
    ['Random Glucose', '112 mg/dL', '70 - 140'],
    ['WBC Count', '7,800 /uL', '4,000 - 11,000'],
    ['Remarks', 'Reported episodic headache with raised BP readings.', '']
  ]
  let y = 212
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = '#f6f3ec'
      ctx.fillRect(40, y - 6, 620, 34)
    }
    ctx.fillStyle = i === 0 ? '#0a3d2c' : '#0b0f0a'
    ctx.font = i === 0 ? 'bold 15px Arial, sans-serif' : '14px Arial, sans-serif'
    ctx.fillText(row[0], 50, y + 17)
    ctx.fillText(row[1], 260, y + 17)
    ctx.fillText(row[2], 500, y + 17)
    y += 34
  })

  ctx.fillStyle = '#6f766b'
  ctx.font = '13px Arial, sans-serif'
  ctx.fillText('Sample report for demo purposes - not a real medical document', 40, 800)

  return canvas.toDataURL('image/png')
}

export function makeDemoFile() {
  const dataUrl = makeSampleReportDataUrl()
  return {
    name: 'sample-report.png',
    type: 'image/png',
    dataUrl,
    size: dataUrl ? Math.round((dataUrl.length * 3) / 4) : 0
  }
}