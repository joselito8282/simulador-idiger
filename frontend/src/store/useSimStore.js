
import { create } from 'zustand'

const initial = {
  time: 0,
  lluviaMMh: 12,
  acumuladoMM: 8,
  reportes: 0,
  alertaSAB: 'Verde',
  personasExpuestas: 1200,
  edreNivel: 0,
  pmuActivo: false,
  mensajes: [],
  incidentes: []
}

const pushMsg = (arr, txt, tipo='info') =>
  [...arr, { id: (globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)), t: new Date().toLocaleTimeString(), txt, tipo }]

export const useSimStore = create((set,get)=>({
  ...initial,
  tick(){
    const s = get()
    const delta = Math.random() < 0.6 ? +1 : -1
    const lluviaMMh = Math.max(0, s.lluviaMMh + delta * Math.ceil(Math.random()*3))
    const acumuladoMM = s.acumuladoMM + Math.max(0, delta>0 ? Math.random()*2 : 0)

    let alertaSAB = 'Verde'
    if (lluviaMMh >= 50) alertaSAB = 'Rojo'
    else if (lluviaMMh >= 35) alertaSAB = 'Naranja'
    else if (lluviaMMh >= 20) alertaSAB = 'Amarillo'

    let reportes = Math.max(0, s.reportes + Math.round(lluviaMMh/10) - (s.pmuActivo?2:0))
    const personasExpuestas = Math.max(0,
      Math.round( s.personasExpuestas + (lluviaMMh-10)*5 - (s.edreNivel*80) - (s.pmuActivo?120:0) )
    )

    let mensajes = s.mensajes
    if (alertaSAB !== s.alertaSAB) {
      mensajes = pushMsg(mensajes, `Alerta SAB cambia a ${alertaSAB}.`, 'alerta')
    }
    if (lluviaMMh - s.lluviaMMh >= 5) {
      mensajes = pushMsg(mensajes, `Precipitación sube a ${lluviaMMh} mm/h.`, 'met')
    }
    if (reportes - s.reportes >= 3) {
      mensajes = pushMsg(mensajes, `+${reportes-s.reportes} reportes en 30s. Evaluar PMU.`, 'riesgo')
    }

    set({
      time: s.time + 10,
      lluviaMMh, acumuladoMM, alertaSAB, reportes, personasExpuestas, mensajes
    })
  },
  activarEDRE(n=1){ set(s=>({
    edreNivel: n,
    mensajes: pushMsg(s.mensajes, `EDRE Nivel ${n} activado. Coordinación interinstitucional priorizada.`, 'accion')
  }))},
  convocarPMU(){ set(s=>({
    pmuActivo: true,
    mensajes: pushMsg(s.mensajes, `PMU convocado. Canaliza decisiones y seguimiento.`, 'accion')
  }))},
  emitirAlerta(nivel){ set(s=>({
    alertaSAB: nivel,
    mensajes: pushMsg(s.mensajes, `Se emite Alerta SAB ${nivel}.`, 'alerta')
  }))},
  limpiar(){ set(initial) }
}))
