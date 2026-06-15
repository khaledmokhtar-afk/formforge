import Anthropic from '@anthropic-ai/sdk'
import { downloadFromS3, uploadToS3 } from '../../lib/s3'
import { fromBuffer } from 'pdf2pic'
import type { ParsedGeometry } from '../../types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function parsePDF(jobId: string, inputKey: string, pagesCount?: number): Promise<ParsedGeometry> {
  console.log(`[Stage1] Downloading PDF from R2: ${inputKey}`)

  // Download PDF from R2
  const pdfBuffer = await downloadFromS3(inputKey)

  // Convert PDF pages to high-resolution PNG images
  // 200 DPI is optimal for 1:100 architectural drawings
  const converter = fromBuffer(pdfBuffer, {
    density: 200,
    format: 'png',
    width: 3000,
    height: 2100,
    preserveAspectRatio: true,
  })

  // Process up to 3 pages (most architectural GA plans are single sheet)
  const pageCount = Math.min(3, pagesCount ?? 1)
  const pageImages: string[] = []

  for (let page = 1; page <= pageCount; page++) {
    console.log(`[Stage1] Converting page ${page} to image...`)
    const result = await converter(page, { responseType: 'buffer' })
    if (result.buffer) {
      pageImages.push(result.buffer.toString('base64'))
      // Save page images to R2 for debugging
      await uploadToS3(
        `intermediate/${jobId}/page-${String(page).padStart(3, '0')}.png`,
        result.buffer,
        'image/png'
      )
    }
  }

  if (pageImages.length === 0) throw new Error('No pages could be extracted from PDF')

  console.log(`[Stage1] Sending ${pageImages.length} page(s) to Claude Vision...`)

  // Build message content with all pages
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = []
  for (let i = 0; i < pageImages.length; i++) {
    (content as any[]).push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: pageImages[i] },
    })
    ;(content as any[]).push({ type: 'text', text: `Page ${i + 1} of ${pageImages.length}` })
  }

  ;(content as any[]).push({
    type: 'text',
    text: `You are an expert architectural drawing parser specializing in commercial interior fit-out
drawings produced by Australian and Middle Eastern design practices.

These drawings follow these conventions:
- Scale: 1:100 or 1:200. Units: MILLIMETERS.
- Structural column grid labeled with letters+numbers (e.g. a1, a2, aA, aB)
- Room tags format: FLOOR-ROOM number (e.g. 114-001 = Level 14, Room 001)
- Multiple views on one sheet: GA Plan + Key Plan + Detail views
- Wall types: heavy cross-hatch = concrete core, diagonal hatch = custom joinery,
  solid lines = full-height partitions, dashed = demountable/furniture
- Perimeter = floor-to-ceiling glazing curtain wall system
- Standard ceiling height: 3000mm (commercial fit-out, Dubai/UAE)
- Phone booths: typically 1000x1000mm to 1000x2000mm
- Meeting rooms labeled by capacity: 4PAX, 6PAX, 8PAX
- Equipment legend uses codes: CM=Coffee Machine, UCF=Under Counter Fridge,
  DW=Dishwasher, ZT=ZipTap, REF=Refrigerator, MV=Microwave, WD=Water Dispenser,
  CP=Copy/Printer, LED=LED Screen, NS=Nespresso, SH=Shredder, ST=Sterilizer

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no code blocks. Raw JSON only.

Return this exact structure:
{
  "drawingType": "architectural",
  "subType": "interior_fitout",
  "scale": "1:100",
  "units": "mm",
  "viewType": "plan",
  "totalWidth": 60000,
  "totalDepth": 34500,
  "ceilingHeight": 3000,
  "structuralGrid": {
    "horizontal": [
      {"id": "a1", "x": 0},
      {"id": "a2", "x": 6000}
    ],
    "vertical": [
      {"id": "aA", "y": 0},
      {"id": "aB", "y": 3000}
    ],
    "columnSize": 400
  },
  "walls": [
    {
      "id": "w001",
      "type": "concrete_core",
      "start": [0, 0],
      "end": [6000, 0],
      "thickness": 300,
      "height": 3000,
      "isExternal": false,
      "isStructural": true,
      "isFitout": false
    }
  ],
  "glazing": [
    {
      "id": "g001",
      "start": [0, 0],
      "end": [6000, 0],
      "height": 3000,
      "type": "curtain_wall"
    }
  ],
  "doors": [
    {
      "id": "d001",
      "wallId": "w001",
      "position": [3000, 0],
      "width": 900,
      "height": 2100,
      "swingDirection": "left",
      "type": "single_swing"
    }
  ],
  "rooms": [
    {
      "id": "114-001",
      "name": "Reception",
      "boundary": [[0,0],[6000,0],[6000,4000],[0,4000]],
      "area": 24,
      "ceilingHeight": 3000,
      "roomType": "reception"
    }
  ],
  "furniture": [
    {
      "id": "f001",
      "type": "desk",
      "label": "Reception desk",
      "position": [1000, 500],
      "width": 2796,
      "depth": 800,
      "height": 750,
      "rotation": 0
    }
  ],
  "equipment": [
    {
      "id": "eq001",
      "code": "CM",
      "name": "Coffee Machine",
      "position": [1000, 2000]
    }
  ],
  "dimensions": [
    {
      "value": 6000,
      "unit": "mm",
      "from": [0, 0],
      "to": [6000, 0],
      "label": "6000"
    }
  ],
  "annotations": [
    {
      "text": "PHONE BOOTH",
      "position": [1000, 1000],
      "fontSize": "medium"
    }
  ],
  "coreAreas": [
    {
      "id": "core001",
      "name": "Restroom Female",
      "boundary": [[10000,5000],[13000,5000],[13000,9000],[10000,9000]],
      "type": "base_build",
      "hatchType": "heavy_cross"
    }
  ],
  "titleBlock": {
    "client": "Accenture",
    "project": "One Za'abeel Tower",
    "drawingTitle": "Level 14 General Arrangement Plan",
    "drawingNumber": "BH3198-BHG-OFF-14-DRG-ID-21140",
    "revision": "P04",
    "scale": "1:100",
    "architect": "Bluehaus Group"
  }
}

Parse ALL elements visible in the drawing. Be precise with coordinates — use the
dimension strings shown to derive real millimeter coordinates. The structural grid
bays visible are typically 3000mm, 6000mm, or 7500mm wide. Normalize all
coordinates so the bottom-left of the plan = [0, 0].`
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: content as any }],
  })

  const responseText = message.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')

  try {
    const clean = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean) as ParsedGeometry

    await uploadToS3(
      `intermediate/${jobId}/parsed.json`,
      Buffer.from(JSON.stringify(parsed, null, 2)),
      'application/json'
    )

    console.log(`[Stage1] Parsed: ${parsed.rooms?.length ?? 0} rooms, ${parsed.walls?.length ?? 0} walls`)
    return parsed

  } catch {
    console.error('[Stage1] Claude response was not valid JSON:', responseText.slice(0, 500))
    throw new Error('Stage 1 failed: Claude returned invalid JSON')
  }
}
