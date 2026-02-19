import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import puntos from '../data/puntos_criticos.json'
import { useSimStore } from '../store/useSimStore'

export default function Mapa() {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const incidentes = useSimStore(s => s.incidentes)

  // 1) Inicializar el mapa una sola vez
  useEffect(() => {
    if (mapRef.current) return

    // Estilo OSM raster (sin llaves)
    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    }

    const map = new maplibregl.Map({
      container: ref.current,
      style,
      center: [-74.08, 4.65], // Bogotá
      zoom: 11
    })
    mapRef.current = map

    map.on('load', () => {
      // === Puntos críticos (demo) ===
      map.addSource('criticos', { type: 'geojson', data: puntos })

      map.addLayer({
        id: 'criticos-circles',
        type: 'circle',
        source: 'criticos',
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'match', ['get', 'sev'],
            'alta',   '#ef4444',  // rojo
            'media',  '#f59e0b',  // naranja
            'baja',   '#22c55e',  // verde
            /* else */ '#3b82f6'
          ],
          'circle-stroke-color': '#0f172a',
          'circle-stroke-width': 1.5
        }
      })

      map.addLayer({
        id: 'criticos-labels',
        type: 'symbol',
        source: 'criticos',
        layout: {
          'text-field': ['get', 'nombre'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': '#0f172a',
          'text-halo-width': 1
        }
      })

      map.on('click', 'criticos-circles', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const { nombre, sev, desc } = f.properties
        const [lng, lat] = f.geometry.coordinates
        new maplibregl.Popup({ className: 'popup-dark', maxWidth: '280px' })
          .setLngLat([lng, lat])
          .setHTML(`
            <div class="popup-dark-body">
              <div class="title">${nombre}</div>
              <div><b>Severidad:</b> ${sev}</div>
              <div style="margin-top:4px">${desc}</div>
            </div>
          `)
          .addTo(map)
      })

      // === Incidentes (dinámico) ===
      map.addSource('incidentes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })

      map.addLayer({
        id: 'incidentes-circles',
        type: 'circle',
        source: 'incidentes',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match', ['get', 'tipo'],
            'semaforos',  '#f59e0b',  // naranja
            'inundacion', '#ef4444',  // rojo
            /* else */   '#3b82f6'
          ],
          'circle-stroke-color':'#0f172a',
          'circle-stroke-width':1.5
        }
      })

      // Popup oscuro para incidentes con color en el título por severidad
      map.on('click','incidentes-circles',(e)=>{
        const f = e.features?.[0]; if(!f) return;
        const { titulo, detalle, tipo, severidad } = f.properties
        const [lng, lat] = f.geometry.coordinates
        const sevColor = { alta:'#ef4444', media:'#f59e0b', baja:'#22c55e' }

        new maplibregl.Popup({ className:'popup-dark', maxWidth:'280px' })
          .setLngLat([lng,lat])
          .setHTML(`
            <div class="popup-dark-body">
              <div class="title" style="color:${sevColor[severidad]||'#e2e8f0'}">${titulo}</div>
              <div><b>Tipo:</b> ${tipo} · <b>Sev:</b> ${severidad}</div>
              <div style="margin-top:4px">${detalle}</div>
            </div>
          `)
          .addTo(map)
      })
    })

    return () => map.remove()
  }, [])

  // 2) Sincronizar 'incidentes' y auto-zoom
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const src = map.getSource('incidentes')
    if (!src) return

    const features = incidentes.map(i => ({
      type: 'Feature',
      properties: {
        tipo: i.tipo, titulo: i.titulo, detalle: i.detalle, severidad: i.severidad
      },
      geometry: { type: 'Point', coordinates: i.coord }
    }))

    src.setData({ type: 'FeatureCollection', features })

    // Auto-encuadre si hay incidentes
    if (features.length) {
      const bounds = new maplibregl.LngLatBounds()
      features.forEach(f => bounds.extend(f.geometry.coordinates))
      map.fitBounds(bounds, { padding: 40, duration: 600 })
    }
  }, [incidentes])

  return (
    <div className="relative">
      {/* Mapa */}
      <div ref={ref} className="w-full h-[520px]" />

      {/* Leyenda simple */}
      <div className="absolute bottom-2 left-2 bg-slate-800/85 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#ef4444'}} />
          Alta
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#f59e0b', marginLeft:8}} />
          Media
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#22c55e', marginLeft:8}} />
          Baja
        </div>
      </div>
    </div>
  )
}