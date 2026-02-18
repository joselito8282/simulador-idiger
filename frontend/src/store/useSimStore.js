
import { create } from 'zustand'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)

const initial = {
  startTs: Date.now(),
  nombre: '',
  time: 0,
  lluviaMMh: 28,
  incidentes: [],   // puntos dinámicos que pintaremos en el mapa
  acumuladoMM: 8,
  reportes: 0,
  alertaSAB: 'Verde',
  personasExpuestas: 1200,
  edreNivel: 0,
  pmuActivo: false,
  mensajes: [
    { id: 'init', t: new Date().toLocaleTimeString(), txt: 'Simulación iniciada. Monitoreando precipitación y reportes…', tipo: 'info' }
  ],
  decisiones: [],
  aarOpen: false,
  aarScore: null,
  aarSnapshot: null
}

const pushMsg = (arr, txt, tipo='info') =>
  [...arr, { id: (globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)), t: new Date().toLocaleTimeString(), txt, tipo }]

export const useSimStore = create((set, get)=>({
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

  finalizarEjercicio(){
    const s = get()
    const finTs = Date.now()
    const minutos = Math.max(1, Math.round((finTs - s.startTs)/60000))

    const inicio = { lluviaMMh: 28, acumuladoMM: 8, reportes: 0, personasExpuestas: 1200, alertaSAB: 'Verde' }
    const fin = {
      lluviaMMh: s.lluviaMMh,
      acumuladoMM: s.acumuladoMM,
      reportes: s.reportes,
      personasExpuestos: s.personasExpuestas,
      alertaSAB: s.alertaSAB
    }

    const d = s.decisiones
    const firstPMU = d.find(x=> x.tipo==='PMU')
    const firstEDRE = d.find(x=> x.tipo==='EDRE')
    const timeToPMU = firstPMU ? (firstPMU.ts - s.startTs)/1000 : null
    const timeToEDRE = firstEDRE ? (firstEDRE.ts - s.startTs)/1000 : null

    let oportunidad = 0
    if (timeToPMU!=null){
      oportunidad = timeToPMU <= 60 ? 50 : timeToPMU <= 120 ? 35 : 15
    }

    const cobertura = firstEDRE ? 20 : 0

    const deltaExpo = s.personasExpuestas - 1200
    let impacto = 20
    if (deltaExpo > 0) impacto = Math.max(0, 20 - Math.floor(deltaExpo/300))

    let coherencia = 10
    for (let i=1; i<d.length; i++){
      const prev = d[i-1], cur = d[i]
      if (prev.tipo==='Alerta SAB' && cur.tipo==='Alerta SAB'){
        const toLevel = cur.detalle.includes('Amarillo')
        const fromOrange = prev.detalle.includes('Naranja') || prev.detalle.includes('Rojo')
        if (toLevel && fromOrange && cur.kpi.lluviaMMh > 25) coherencia = Math.max(0, coherencia - 5)
      }
    }

    const total = Math.max(0, Math.min(100, oportunidad + cobertura + impacto + coherencia))

    set({
      aarOpen: true,
      aarScore: { total, detalle:{oportunidad, cobertura, impacto, coherencia}, timeToPMU, timeToEDRE },
      aarSnapshot: { inicio, fin, minutos, decisiones: d, nombre: s.nombre, fecha: new Date(s.startTs).toLocaleString() }
    })
  },

  cerrarAAR(){ set({ aarOpen: false }) },

  descargarPdfAAR: async () => {
    const s = get()
    const snap = s.aarSnapshot
    if (!snap) return

    const doc = new jsPDF({ unit:'pt', format:'A4' })
    const marginX = 48, lineY = 30
    let y = 64

    try {
      const logo = await import('../assets/logo-idiger.png')
      doc.addImage(logo.default, 'PNG', marginX, y-24, 80, 32)
    } catch {}

    doc.setFont('helvetica','bold'); doc.setFontSize(16)
    doc.text('Informe de Ejercicio — Simulador IDIGER', marginX+90, y); y += lineY

    doc.setFont('helvetica',''); doc.setFontSize(11)
    doc.text(`Fecha: ${snap.fecha}`, marginX, y); y += lineY
    doc.text(`Duración (min): ${snap.minutos}`, marginX, y); y += lineY
    doc.text(`Participante: ${snap.nombre || 'Sin nombre'}`, marginX, y); y += lineY*0.6

    const a = get().aarScore
    doc.setFont('helvetica','bold'); doc.text(`Puntaje: ${a.total}/100`, marginX, y); y += lineY
    doc.setFont('helvetica',''); 
    doc.text(`Oportunidad: ${a.detalle.oportunidad}  |  Cobertura: ${a.detalle.cobertura}  |  Impacto: ${a.detalle.impacto}  |  Coherencia: ${a.detalle.coherencia}`, marginX, y); y += lineY

    doc.setFont('helvetica','bold'); doc.text('KPIs', marginX, y); y += 12
    doc.autoTable({
      startY: y,
      head:[["Métrica","Inicial","Final"]],
      body:[
        ['Precipitación (mm/h)', String(snap.inicio.lluviaMMh), String(snap.fin.lluviaMMh)],
        ['Acumulado (mm)', snap.inicio.acumuladoMM.toFixed(1), snap.fin.acumuladoMM.toFixed(1)],
        ['Reportes', String(snap.inicio.reportes), String(snap.fin.reportes)],
        ['Personas expuestas', fmt(snap.inicio.personasExpuestas), fmt(snap.fin.personasExpuestos)],
        ['Alerta SAB', snap.inicio.alertaSAB, snap.fin.alertaSAB],
      ],
      styles:{ font:'helvetica', fontSize:10 },
      headStyles:{ fillColor:[11,76,115] },
      margin:{ left: marginX, right: marginX }
    })
    y = doc.lastAutoTable.finalY + 24

    doc.setFont('helvetica','bold'); doc.text('Línea de tiempo de decisiones', marginX, y); y += 8
    const body = snap.decisiones.map(d => [
      d.t, d.tipo, d.detalle,
      `${d.kpi.lluviaMMh} mm/h`, String(d.kpi.reportes), fmt(d.kpi.personasExpuestas), d.kpi.alertaSAB
    ])
    doc.autoTable({
      startY: y,
      head:[["Hora","Tipo","Detalle","Lluvia","Reportes","Expuestos","Alerta"]],
      body,
      styles:{ font:'helvetica', fontSize:9, cellPadding: 3 },
      headStyles:{ fillColor:[70,70,70] },
      margin:{ left: marginX, right: marginX }
    })

    const file = `AAR_${(snap.nombre||'participante').replace(/[^a-zA-Z0-9-_]/g,'_')}_${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.pdf`
    doc.save(file)
  },

  limpiar(){ set(initial) }
}))
