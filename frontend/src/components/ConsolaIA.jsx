
import { useSimStore } from '../store/useSimStore'

export default function ConsolaIA(){
  const { mensajes } = useSimStore()
  const color = (t)=> t==='alerta' ? 'text-alerta'
                      : t==='met' ? 'text-sky-400'
                      : t==='riesgo' ? 'text-yellow-300' : 'text-white'
  return (
    <div className="bg-slate-800 rounded-lg p-3 h-[240px] overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Consola IA de Situación</h2>
      <ul className="space-y-1 text-sm">
        {mensajes.slice(-8).map(m=> (
          <li key={m.id} className={`${color(m.tipo)} leading-tight`}>
            [{m.t}] {m.txt}
          </li>
        ))}
      </ul>
    </div>
  )
}
