
import { useSimStore } from '../store/useSimStore'

const Btn = ({children, onClick}) => (
  <button onClick={onClick}
    className="w-full bg-slate-800/60 hover:bg-slate-700 text-left px-4 py-3 rounded-lg border border-slate-600">
    {children}
  </button>
)

export default function PanelDecisiones(){
  const { activarEDRE, convocarPMU, emitirAlerta } = useSimStore()
  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-2">
      <h2 className="text-lg font-semibold mb-2">Panel de Decisiones</h2>
      <Btn onClick={()=> activarEDRE(1)}>Activar EDRE</Btn>
      <Btn onClick={()=> convocarPMU()}>Convocar PMU</Btn>
      <Btn onClick={()=> emitirAlerta('Amarillo')}>Emitir Alerta SAB Amarillo</Btn>
      <Btn onClick={()=> emitirAlerta('Naranja')}>Emitir Alerta SAB Naranja</Btn>
      <Btn onClick={()=> emitirAlerta('Rojo')}>Emitir Alerta SAB Rojo</Btn>
    </div>
  )
}
