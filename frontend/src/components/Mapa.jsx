import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import puntos from '../data/puntos_criticos.json'

export default function Mapa() {
  const ref = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    // Estilo raster OSM (sin llaves)
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
      // Fuente GeoJSON con puntos críticos (demo)
      map.addSource('criticos', { type: 'geojson', data: puntos })

      // Circles por severidad
      map.addLayer({
        id: 'criticos-circles',
        type: 'circle',
        source: 'criticos',
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'match', ['get', 'sev'],
            'alta', '#ef4444',     // rojo
            'media', '#f59e0b',    // naranja
            'baja', '#22c55e',     // verde
            '#3b82f6'              // default (azul)
          ],
          'circle-stroke-color': '#0f172a',
          'circle-stroke-width': 1.5
        }
      })

      // Etiquetas (nombre)
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

      // Popup al hacer clic
      map.on('click', 'criticos-circles', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const { nombre, sev, desc } = f.properties
        const [lng, lat] = f.geometry.coordinates
        new maplibregl.Popup()
          .setLngLat([lng, lat])
          .setHTML(
            `<div style="min-width:220px">
              <div style="font-weight:600;margin-bottom:4px">${nombre}</div>
              <div><b>Severidad:</b> ${sev}</div>
              <div style="margin-top:4px">${desc}</div>
            </div>`
          )
          .addTo(map)
      })

      // Cambiar cursor al pasar sobre puntos
      map.on('mouseenter', 'criticos-circles', () => map.getCanvas().style.cursor = 'pointer')
      map.on('mouseleave', 'criticos-circles', () => map.getCanvas().style.cursor = '')
    })

    return () => map?.remove()
  }, [])

  return (
    <div className="relative">
      {/* Mapa */}
      <div ref={ref} className="w-full h-[520px]" />

      {/* Leyenda simple */}
      <div className="absolute bottom-2 left-2 bg-slate-800/85 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#ef4444'}}></span> Alta
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#f59e0b', marginLeft:8}}></span> Media
          <span className="inline-block w-3 h-3 rounded-full" style={{background:'#22c55e', marginLeft:8}}></span> Baja
        </div>
      </div>
    </div>
  )
}