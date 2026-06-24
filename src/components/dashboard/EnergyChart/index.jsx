import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'

export default function EnergyChart({ data, dataKey = 'capacity', xKey = 'year', label = 'Capacity (MW)', targetLine, targetLabel }) {
  return (
    <div className="h-72 w-full" role="img" aria-label={`Chart showing ${label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0077B6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Legend />
          {targetLine != null && (
            <ReferenceLine
              y={targetLine}
              stroke="#C9A227"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{ value: targetLabel || `Target ${targetLine}`, fill: '#C9A227', fontSize: 11, position: 'insideTopRight' }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke="#0077B6"
            fill="url(#energyGrad)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#0077B6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#0077B6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
