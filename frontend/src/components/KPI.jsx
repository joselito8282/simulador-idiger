
export default function KPI({label, value, color=false}){
  const cls = color ? 'text-alerta' : 'text-white'
  return (
    <div className="flex items-baseline justify-between border-b border-slate-700 pb-1">
      <span className="text-sm opacity-80">{label}</span>
      <span className={`text-xl font-semibold ${cls}`}>{value}</span>
    </div>
  )
}
