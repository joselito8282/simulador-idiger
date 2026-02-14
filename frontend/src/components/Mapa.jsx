import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function Mapa() {
  const ref = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    // Estilo raster de OpenStreetMap (sin bloqueos ni llaves)
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

    mapRef.current = new maplibregl.Map({
      container: ref.current,
      style,
      center: [-74.08, 4.65], // Bogotá
      zoom: 10.2
    })

    return () => mapRef.current?.remove()
  }, [])

  return <div ref={ref} className="w-full h-[520px]" />
}