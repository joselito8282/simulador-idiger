import { create } from 'zustand'

const initial = {
  startTs: Date.now(),
  nombre: '',
  time: 0,
  lluviaMMh: 28,           // más acción al inicio
  acumuladoMM: 8,
  reportes: 0,
  alertaSAB: 'Verde',
  personasExpuestas: 1200,
  edreNivel: 0,
  pmuActivo: false,
  mensajes: [
    { id: 'init', t: new Date().toLocaleTimeString(), txt: 'Simulación iniciada. Monitoreando precipitación y reportes…', tipo: 'info' }
  ],
  decisiones: [],          // ← registraremos decisiones del usuario
  incidentes: []
}

const pushMsg = (arr, txt, tipo='info') =>
  [...arr, { id: (globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)), t: new Date().toLocaleTimeString(), txt, tipo }]

const fmt = (n)=> new Intl.NumberFormat('es-CO').format(n)

export const useSimStore = create((set,get)=>({
  ...initial,

  setNombre(nombre){ set({ nombre }) },

  registrarDecision(tipo, detalle){
    const s = get()
    const entrada = {
      ts: Date.now(),
      t: new Date().toLocaleTimeString(),
      tipo, detalle,
      kpi: {
        lluviaMMh: s.lluviaMMh,
        reportes: s.reportes,
        personasExpuestas: s.personasExpuestas,
        alertaSAB: s.alertaSAB
      }
    }
    set({ decisiones: [...s.decisiones, entrada] })
  },

  tick(){
    const s = get()
    // Variación simple de lluvia
    const delta = Math.random() < 0.6 ? +1 : -1
    const lluviaMMh = Math.max(0, s.lluviaMMh + delta * Math.ceil(Math.random()*3))
    const acumuladoMM = s.acumuladoMM + Math.max(0, delta>0 ? Math.random()*2 : 0)

    // Umbrales SAB
    let alertaSAB = 'Verde'
    if (lluviaMMh >= 50) alertaSAB = 'Rojo'
    else if (lluviaMMh >= 35) alertaSAB = 'Naranja'
    else if (lluviaMMh >= 20) alertaSAB = 'Amarillo'

    // KPIs responden a lluvia y a decisiones (EDRE/PMU)
    let reportes = Math.max(0, s.reportes + Math.round(lluviaMMh/10) - (s.pmuActivo?2:0))
    const personasExpuestas = Math.max(0,
      Math.round( s.personasExpuestas + (lluviaMMh-10)*5 - (s.edreNivel*80) - (s.pmuActivo?120:0) )
    )

    // Mensajería IA (más sensible: 2 mm/h)
    let mensajes = s.mensajes
    if (alertaSAB !== s.alertaSAB) mensajes = pushMsg(mensajes, `Alerta SAB cambia a ${alertaSAB}.`, 'alerta')
    if (lluviaMMh - s.lluviaMMh >= 2) mensajes = pushMsg(mensajes, `Precipitación sube a ${lluviaMMh} mm/h.`, 'met')
    if (reportes - s.reportes >= 3) mensajes = pushMsg(mensajes, `+${reportes-s.reportes} reportes en los últimos segundos. Evaluar PMU.`, 'riesgo')

    set({
      time: s.time + 3,
      lluviaMMh, acumuladoMM, alertaSAB, reportes, personasExpuestas, mensajes
    })
  },

  activarEDRE(n=1){
    const s = get()
    set({
      edreNivel: n,
      mensajes: pushMsg(s.mensajes, `EDRE Nivel ${n} activado. Coordinación interinstitucional priorizada.`, 'accion')
    })
    get().registrarDecision('EDRE', `Se activa EDRE nivel ${n}`)
  },

  convocarPMU(){
    const s = get()
    set({
      pmuActivo: true,
      mensajes: pushMsg(s.mensajes, `PMU convocado. Canaliza decisiones y seguimiento.`, 'accion')
    })
    get().registrarDecision('PMU', 'Se convoca PMU (coordinación interinstitucional)')
  },

  emitirAlerta(nivel){
    const s = get()
    set({
      alertaSAB: nivel,
      mensajes: pushMsg(s.mensajes, `Se emite Alerta SAB ${nivel}.`, 'alerta')
    })
    get().registrarDecision('Alerta SAB', `Nivel ${nivel}`)
  },

  generarInforme(){
    const s = get()
    const fin = Date.now()
    const duracionMin = Math.max(1, Math.round((fin - s.startTs)/60000))
    const cab = [
      `Informe de Ejercicio — Simulador IDIGER`,
      `Fecha: ${new Date(s.startTs).toLocaleString()}`,
      `Duración (min): ${duracionMin}`,
      `Participante: ${s.nombre || 'Sin nombre'}`,
      `----------------------------------------------`
    ].join('\n')

    const kpis = [
      `KPI final:`,
      `- Precipitación: ${s.lluviaMMh} mm/h`,
      `- Acumulado: ${s.acumuladoMM.toFixed(1)} mm`,
      `- Reportes: ${s.reportes}`,
      `- Personas expuestas: ${fmt(s.personasExpuestas)}`,
      `- Alerta SAB: ${s.alertaSAB}`,
      `----------------------------------------------`
    ].join('\n')

    const decs = ['Línea de tiempo de decisiones:']
      .concat(s.decisiones.map(d => `  [${d.t}] ${d.tipo} — ${d.detalle} (lluvia ${d.kpi.lluviaMMh} mm/h, reportes ${d.kpi.reportes}, expuestos ${fmt(d.kpi.personasExpuestas)}, alerta ${d.kpi.alertaSAB})`))
      .join('\n')

    const txt = `${cab}\n${kpis}\n${decs}\n`
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const nombreSeguro = (s.nombre || 'participante').replace(/[^a-zA-Z0-9-_]/g,'_')
    a.href = url
    a.download = `informe_${nombreSeguro}_${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  limpiar(){ set(initial) }
}))