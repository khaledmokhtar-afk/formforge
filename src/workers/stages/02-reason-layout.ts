import Anthropic from '@anthropic-ai/sdk'
import { uploadToS3 } from '../../lib/s3'
import type { ParsedGeometry, NormalizedGeometry } from '../../types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function reasonLayout(
  jobId: string,
  parsed: ParsedGeometry
): Promise<NormalizedGeometry> {
  console.log('[Stage2] Reasoning about layout geometry...')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `You are an expert 3D architectural modeller specializing in commercial interior fit-out.

Given this parsed geometry from a professional architectural drawing, produce a clean
normalized geometry dataset ready for 3D extrusion.

This is an INTERIOR FIT-OUT drawing (not structural). Rules:
- Base build elements (concrete core, stairs, lifts) are NOT fit-out scope but MUST
  appear in the 3D model as non-interactive background elements
- Fit-out walls are typically 100mm (internal partitions) or 150mm (acoustic walls)
- Structural concrete core walls are 200-350mm thick
- External glazed curtain wall: treat as 50mm thick glass panel, full height 3000mm
- Default ceiling height: 3000mm unless annotated otherwise
- Phone booths: self-contained pods, extrude to 2400mm (lower than ceiling)
- Meeting rooms: full height partitions 3000mm
- Open plan areas: no ceiling — open to structural slab above
- Furniture: extrude to correct heights (desk 750mm, chair 900mm, cabinet 1200mm,
  full height cabinet 2400mm, lockers 1800mm)
- Column grid columns: 400x400mm concrete, full height 3000mm

MERGE these wall segments:
- Colinear segments with same type and within 50mm endpoint tolerance -> merge
- Remove duplicate overlapping walls
- Connect wall endpoints that are within 20mm of each other (snap to grid)

OUTPUT: Return ONLY valid JSON, no markdown, no explanation.

Input parsed data:
${JSON.stringify(parsed, null, 2)}

Return this structure:
{
  "walls": [
    {
      "id": "w001",
      "start": [0, 0],
      "end": [6000, 0],
      "thickness": 200,
      "height": 3000,
      "material": "concrete",
      "layer": "A-WALL-FULL",
      "isExternal": false,
      "isStructural": true,
      "isFitout": false,
      "color": "#CCCCCC"
    }
  ],
  "glazing": [
    {
      "id": "gl001",
      "start": [0, 0],
      "end": [6000, 0],
      "height": 3000,
      "thickness": 50,
      "layer": "A-GLAZ",
      "color": "#88CCEE"
    }
  ],
  "doors": [
    {
      "id": "d001",
      "wallId": "w001",
      "insertionPoint": [3000, 0],
      "width": 900,
      "height": 2100,
      "thickness": 50,
      "swingAngle": 90,
      "layer": "A-DOOR"
    }
  ],
  "columns": [
    {
      "id": "col_a1_aA",
      "gridRef": "a1/aA",
      "position": [0, 0],
      "width": 400,
      "depth": 400,
      "height": 3000,
      "material": "concrete",
      "layer": "A-COLS"
    }
  ],
  "rooms": [
    {
      "id": "114-001",
      "name": "Reception",
      "number": "114-001",
      "boundary": [[0,0],[6000,0],[6000,4000],[0,4000]],
      "area": 24.0,
      "ceilingHeight": 3000,
      "floorFinish": "carpet",
      "roomType": "reception",
      "layer": "A-ROOM-TAG",
      "centroid": [3000, 2000]
    }
  ],
  "furniture": [
    {
      "id": "f001",
      "type": "reception_desk",
      "label": "Reception",
      "position": [1000, 500],
      "width": 2796,
      "depth": 800,
      "height": 750,
      "rotation": 0,
      "layer": "A-FURN",
      "color": "#8B6914"
    }
  ],
  "pods": [
    {
      "id": "pod001",
      "type": "phone_booth",
      "position": [5000, 2000],
      "width": 1000,
      "depth": 1000,
      "height": 2400,
      "layer": "A-FURN-SYST",
      "color": "#4A4A6A"
    }
  ],
  "coreAreas": [
    {
      "id": "core001",
      "name": "Restroom Female",
      "boundary": [[10000,5000],[13000,5000],[13000,9000],[10000,9000]],
      "height": 3000,
      "type": "base_build",
      "layer": "A-FLOR-HATCH",
      "color": "#888888"
    }
  ],
  "structuralGrid": {
    "horizontalLines": [
      {"id": "a1", "x": 0, "yStart": 0, "yEnd": 34500},
      {"id": "a2", "x": 6000, "yStart": 0, "yEnd": 34500}
    ],
    "verticalLines": [
      {"id": "aA", "y": 0, "xStart": 0, "xEnd": 60000},
      {"id": "aB", "y": 3000, "xStart": 0, "xEnd": 60000}
    ],
    "layer": "A-GRID"
  },
  "bounds": {
    "minX": 0, "maxX": 60000,
    "minY": 0, "maxY": 34500,
    "width": 60000,
    "depth": 34500
  },
  "defaults": {
    "ceilingHeight": 3000,
    "units": "mm",
    "scale": "1:100",
    "drawingType": "interior_fitout"
  },
  "confidence": 0.92,
  "notes": "External walls are curtain wall glazing. Core areas shown as base build (not fit-out scope). Phone booths extruded to 2400mm pod height."
}`
    }],
  })

  const text = message.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')

  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const geometry = JSON.parse(clean) as NormalizedGeometry

    await uploadToS3(
      `intermediate/${jobId}/geometry.json`,
      Buffer.from(JSON.stringify(geometry, null, 2)),
      'application/json'
    )

    console.log(`[Stage2] Normalized: ${geometry.walls?.length ?? 0} walls, ${geometry.rooms?.length ?? 0} rooms, ${geometry.columns?.length ?? 0} columns`)
    return geometry

  } catch {
    throw new Error('Stage 2 failed: Claude returned invalid JSON in reasoning step')
  }
}
