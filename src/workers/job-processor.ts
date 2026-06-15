import { PrismaClient } from '@prisma/client'
import { parsePDF }      from './stages/01-parse-pdf'
import { reasonLayout }  from './stages/02-reason-layout'
import { generate3D }    from './stages/03-generate-3d'
import { exportCAD }     from './stages/04-export-cad'

// Use a dedicated prisma instance for the worker process
const prisma = new PrismaClient()

export async function processJob(jobId: string, inputKey: string, pagesCount: number) {
  const startMs = Date.now()

  const setStage = async (stage: string) => {
    console.log(`[Job ${jobId}] Stage ${stage} starting...`)
    await prisma.job.update({
      where: { id: jobId },
      data: { stage, status: 'PROCESSING' },
    })
  }

  const fail = async (msg: string) => {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMsg: msg },
    })
  }

  try {
    // Stage 1: Parse PDF pages with Claude Vision
    await setStage('CLASSIFY')
    const parsedData = await parsePDF(jobId, inputKey, pagesCount)
    await prisma.job.update({
      where: { id: jobId },
      data: { parsedData: parsedData as any, drawingType: parsedData.drawingType },
    })

    // Stage 2: Reason about layout semantics with Claude Text
    await setStage('EXTRACT')
    const geometryData = await reasonLayout(jobId, parsedData)
    await prisma.job.update({
      where: { id: jobId },
      data: { geometryData: geometryData as any },
    })

    // Stage 3: Generate 3D model with Three.js
    await setStage('GENERATE')
    const gltfKey = await generate3D(jobId, geometryData)

    // Stage 4: Export CAD files (DXF + OBJ)
    await setStage('EXPORT')
    const outputKeys = await exportCAD(jobId, geometryData, gltfKey)

    // Mark complete
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETE',
        stage: 'EXPORT',
        outputKeys,
        processingMs: Date.now() - startMs,
        completedAt: new Date(),
      },
    })

    console.log(`[Job ${jobId}] Complete in ${Date.now() - startMs}ms`)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[Job ${jobId}] FAILED:`, msg)
    await fail(msg)
    throw err
  }
}
