import { useSimStore } from '../store/useSimStore'
import { useState } from 'react'

const Btn = ({children, onClick}) =>
  <button onClick={onClick}
    className="w-full bg-slate-800/60 hover:bg-slate-700 text-left px-4 py-3 rounded-lg border border-slate-600">
    {children}
  </button>

export default function PanelDecisiones(){
  const { activarEDRE, convocarPMU, emitirAlerta, tick, setNombre, generarInforme } = useSimStore()
  const [n, setN] = useState('')

  const onGuardar = ()=>{
    setNombre(n.trim())
  }

  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-2">
      <h2 className="text-lg font-semibold mb-2">Panel de Decisiones</h2>

      {/* Nombre del participante */}
      <div className="mb-2">
        <label className="block text-sm mb-1 opacity-80">Nombre del participante</label>
        <div className="flex gap-2">
          <input value={n} onChange={e=>setN(e.target.value)}
            placeholder="Escribe tu nombre"
            className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none" />
          <button onClick={onGuardar}
            className="bg-idiger hover:opacity-90 text-white px-3 py-2 rounded">Guardar</button>
        </div>
      </div>

      {/* Acciones IDIGER (coordinación) */}
      <Btn onClick={()=> activarEDRE(1)}>Activar EDRE</Btn>
      <Btn onClick={()=> convocarPMU()}>Convocar PMU</Btn>
      <Btn onClick={()=> emitirAlerta('Amarillo')}>Emitir Alerta SAB Amarillo</Btn>
      <Btn onClick={()=> emitirAlerta('Naranja')}>Emitir Alerta SAB Naranja</Btn>
      <Btn onClick={()=> emitirAlerta('Rojo')}>Emitir Alerta SAB Rojo</Btn>

      {/* Utilidades */}
      <Btn onClick={()=> tick()}>Forzar tick (debug)</Btn>
      <button onClick={generarInforme}
        className="w-full bg-green-600 hover:bg-green-500 text-left px-4 py-3 rounded-lg border border-green-700 text-white">
        Generar informe (.txt)
      </button>
    </div>
  )
}