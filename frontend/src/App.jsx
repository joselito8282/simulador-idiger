
import { useEffect } from 'react'
import { useSimStore } from './store/useSimStore'
import Mapa from './components/Mapa'
import PanelDecisiones from './components/PanelDecisiones'
import ConsolaIA from './components/ConsolaIA'
import KPI from './components/KPI'
import AARModal from './components/AARModal'

export default function App(){
  const { tick, lluviaMMh, acumuladoMM, reportes, personasExpuestas, alertaSAB } = useSimStore()

  useEffect(()=>{
    const id = setInterval(()=> tick(), 3000)
    return ()=> clearInterval(id)
  }, [tick])

  return (
    <div className="grid grid-cols-12 gap-4 p-4 min-h-screen">
      <section className="col-span-12 lg:col-span-3 bg-slate-800 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-idiger">Simulador de Decisiones</h1>
        <p className="mt-3 text-sm opacity-80">
          Lluvias intensas pronosticadas para Bogotá. Evalúa y coordina acciones (EDRE, PMU, SAB).
        </p>
        <div className="mt-4 space-y-2">
          <KPI label="Precipitación" value={`${lluviaMMh} mm/h`} />
          <KPI label="Acumulado" value={`${acumuladoMM.toFixed(1)} mm`} />
          <KPI label="Reportes" value={reportes} />
          <KPI label="Personas expuestas" value={personasExpuestas.toLocaleString()} />
          <KPI label="Alerta SAB" value={alertaSAB} color />
        </div>
      </section>

      <section className="col-span-12 lg:col-span-6 bg-slate-800 rounded-lg overflow-hidden">
        <Mapa />
      </section>

      <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <PanelDecisiones />
        <ConsolaIA />
      </section>

      <AARModal />
    </div>
  )
}
