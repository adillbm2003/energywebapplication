import { useEffect, useRef, useState } from 'react'

const SIMULATOR_SRC = (import.meta.env.BASE_URL || '/') + 'energy-simulator.html'

export default function BermudaEnergySimulator() {
  const [height, setHeight] = useState(2400)
  const pendingHeight = useRef(null)

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.type !== 'simulator-height' || typeof event.data.height !== 'number') return

      const nextHeight = Math.max(Math.ceil(event.data.height + 32), 1200)
      pendingHeight.current = nextHeight

      window.requestAnimationFrame(() => {
        if (pendingHeight.current != null) {
          setHeight(pendingHeight.current)
          pendingHeight.current = null
        }
      })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="w-full bg-[#f0f2f5] px-2 pb-6 sm:px-4">
      <iframe
        src={SIMULATOR_SRC}
        title="Home Energy Consumption Simulator"
        className="mx-auto block w-full max-w-[1440px] rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ height: `${height}px`, minHeight: '1200px' }}
      />
    </div>
  )
}
