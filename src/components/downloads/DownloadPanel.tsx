interface DownloadFile {
  format: string
  label: string
  description: string
  icon: string
  url?: string
  extension: string
}

interface Props {
  outputUrls: Record<string, string | undefined>
  inputName: string
}

export function DownloadPanel({ outputUrls, inputName }: Props) {
  const baseName = inputName.replace(/\.pdf$/i, '')

  const files: DownloadFile[] = [
    {
      format:      'dxf',
      label:       'DXF File',
      description: 'AutoCAD, Civil 3D, LibreCAD',
      icon:        '\u2B21',
      url:         outputUrls.dxf,
      extension:   'dxf',
    },
    {
      format:      'obj',
      label:       'OBJ File',
      description: 'Blender, Maya, 3ds Max',
      icon:        '\u25C8',
      url:         outputUrls.obj,
      extension:   'obj',
    },
    {
      format:      'gltf',
      label:       'GLTF Model',
      description: 'Three.js, Unity, Unreal, web 3D',
      icon:        '\u25C9',
      url:         outputUrls.gltf,
      extension:   'glb',
    },
  ]

  return (
    <div className="card p-6">
      <p className="section-label">Downloads</p>
      <p className="text-[#6B8FAF] text-sm mb-5">
        Files are available for 7 days. Links expire after that.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.format}
            className="border border-[rgba(0,200,232,0.12)] rounded-xl p-5 flex flex-col gap-3 hover:border-[rgba(0,200,232,0.3)] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,200,232,0.1)] border border-[rgba(0,200,232,0.2)] flex items-center justify-center text-[#00C8E8] text-lg">
                {file.icon}
              </div>
              <div>
                <p className="text-[#E2EEF8] font-medium text-sm">{file.label}</p>
                <p className="text-[#344B63] text-xs">{file.description}</p>
              </div>
            </div>
            {file.url ? (
              <a
                href={file.url}
                download={`${baseName}.${file.extension}`}
                className="btn-primary text-center text-sm !py-2 !px-4"
              >
                Download
              </a>
            ) : (
              <div className="bg-[#101E35] border border-[rgba(0,200,232,0.08)] rounded-lg py-2 px-4 text-[#344B63] text-sm text-center">
                Not available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
