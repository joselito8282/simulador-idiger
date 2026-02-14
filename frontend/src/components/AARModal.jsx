
import { useMemo } from 'react'
import { useSimStore } from '../store/useSimStore'

export default function AARModal(){
  const { aarOpen, cerrarAAR, aarScore, aarSnapshot, descargarPdfAAR } = useSimStore()
  const visible = aarOpen && aarScore && aarSnapshot

  const puntajeColor = useMemo(()=>{
    if(!aarScore) return 'text-white'
    const t = aarScore.total
    if (t >= 80) return 'text-green-400'
    if (t >= 60) return 'text-yellow-300'
    return 'text-red-400'
  },[aarScore])

  if (!visible) return null
  const s = aarSnapshot
  const a = aarScore

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 w-[880px] max-w-[95vw] rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-idiger">Informe del ejercicio (AAR)</h2>
          <button onClick={cerrarAAR} className="text-slate-300 hover:text-white">✕</button>
        </div>

        <p className="text-sm opacity-80 mb-4">
          Participante: <b>{s.nombre || 'Sin nombre'}</b> · Fecha: {s.fecha} · Duración: {s.minutos} min
        </p>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <h3 className="font-semibold">KPIs finales</h3>
            <ul className="text-sm space-y-1">
              <li>Precipitación: <b>{s.fin.lluviaMMh} mm/h</b></li>
              <li>Acumulado: <b>{s.fin.acumuladoMM.toFixed(1)} mm</b></li>
              <li>Reportes: <b>{s.fin.reportes}</b></li>
              <li>Personas expuestas: <b>{s.fin.personasExpuestos.toLocaleString('es-CO')}</b></li>
              <li>Alerta SAB: <b>{s.fin.alertaSAB}</b></li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-6">
            <h3 className="font-semibold">Puntaje</h3>
            <div className={`text-4xl font-bold ${puntajeColor}`}>{a.total}</div>
            <div className="text-sm mt-2">
              <div>Oportunidad: <b>{a.detalle.oportunidad}</b> {a.timeToPMU!=null && <span>(PMU en {Math.round(a.timeToPMU)} s)</span>}</div>
              <div>Cobertura: <b>{a.detalle.cobertura}</b> {a.timeToEDRE!=null ? '(EDRE activado)' : '(sin EDRE)'}</div>
              <div>Impacto: <b>{a.detalle.impacto}</b></div>
              <div>Coherencia: <b>{a.detalle.coherencia}</b></div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-1">Línea de tiempo de decisiones</h3>
          <div className="max-h-48 overflow-auto text-sm bg-slate-900/60 border border-slate-700 rounded p-2">
            <ul className="space-y-1">
              {s.decisiones.map((d)=> (
                <li key={`${d.ts}-${d.tipo}`}>
                  [{d.t}] <b>{d.tipo}</b> — {d.detalle} <span className="opacity-70">({d.kpi.lluviaMMh} mm/h · {d.kpi.reportes} rep. · {d.kpi.personasExpuestas.toLocaleString('es-CO')} exp. · {d.kpi.alertaSAB})</span>
                </li>
              ))}
              {s.decisiones.length===0 && <li className="opacity-70">No se registraron decisiones.</li>}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={descargarPdfAAR}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded border border-green-700">
            Descargar PDF
          </button>
          <button onClick={cerrarAAR}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded border border-slate-600">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
