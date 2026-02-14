
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function Mapa(){
  const ref = useRef(null)
  const mapRef = useRef(null)

  useEffect(()=>{
    if(mapRef.current) return
    mapRef.current = new maplibregl.Map({
      container: ref.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-74.08, 4.65], // Bogotá
      zoom: 10.2
    })
    return ()=> mapRef.current?.remove()
  },[])
  return <div ref={ref} className="w-full h-[520px]"/>
}
