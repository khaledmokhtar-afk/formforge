'use client'

type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'EXPIRED'

const STAGES = [
  { id: 'CLASSIFY', label: 'Parse PDF',     sub: 'Claude Vision reads your drawing' },
  { id: 'EXTRACT',  label: 'Reason Layout', sub: 'Geometry is cleaned and structured' },
  { id: 'GENERATE', label: 'Build 3D',      sub: 'Walls and rooms are extruded' },
  { id: 'EXPORT',   label: 'Export CAD',     sub: 'DXF, OBJ, and GLTF files created' },
]

const STAGE_ORDER = ['UPLOAD', 'CLASSIFY', 'EXTRACT', 'GENERATE', 'EXPORT']

interface Props {
  stage: string
  status: JobStatus
}

export function PipelineStatus({ stage, status }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(stage)

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-6 left-6 right-6 h-px bg-[rgba(0,200,232,0.1)]" />

      <div className="relative flex justify-between">
        {STAGES.map((s, i) => {
          const stageIdx   = STAGE_ORDER.indexOf(s.id)
          const isComplete = status === 'COMPLETE' || currentIdx > stageIdx
          const isActive   = currentIdx === stageIdx && (status === 'PROCESSING' || status === 'QUEUED')
          const isFailed   = status === 'FAILED' && currentIdx === stageIdx
          const isPending  = currentIdx < stageIdx && status !== 'COMPLETE'

          return (
            <div key={s.id} className="flex flex-col items-center gap-3 flex-1">
              {/* Node */}
              <div className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-500
                ${isComplete ? 'bg-[rgba(16,217,140,0.2)] border-[#10D98C] shadow-[0_0_16px_rgba(16,217,140,0.3)]' : ''}
                ${isActive   ? 'bg-[rgba(139,92,246,0.2)] border-[#8B5CF6] animate-pulse' : ''}
                ${isFailed   ? 'bg-[rgba(239,68,68,0.2)] border-[#EF4444]' : ''}
                ${isPending  ? 'bg-[#101E35] border-[rgba(0,200,232,0.15)]' : ''}
              `}>
                {isComplete ? (
                  <span className="text-[#10D98C] text-lg">&#10003;</span>
                ) : isActive ? (
                  <span className="text-[#8B5CF6] font-mono font-bold text-sm">{i + 1}</span>
                ) : isFailed ? (
                  <span className="text-[#EF4444] text-lg">&#10005;</span>
                ) : (
                  <span className="text-[#344B63] font-mono text-sm">{i + 1}</span>
                )}
              </div>

              {/* Labels */}
              <div className="text-center">
                <p className={`text-sm font-medium transition-colors ${
                  (isComplete || isActive) ? 'text-[#E2EEF8]' : 'text-[#344B63]'
                }`}>
                  {s.label}
                </p>
                <p className="text-xs text-[#344B63] mt-0.5 hidden sm:block max-w-[100px]">
                  {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
