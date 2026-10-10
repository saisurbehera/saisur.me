'use client';
import { useEffect, useRef } from 'react';
export default function Map({ data, book, accounts, schematic, showPlaces, onSelect, focus }) {
    const element = useRef(null), map = useRef(null), leaflet = useRef(null);
    const callback = useRef(onSelect);
    callback.current = onSelect;
    useEffect(() => { let cancelled = false; let observer; import('leaflet').then(L => { if (cancelled || !element.current)
        return; leaflet.current = L; map.current = L.map(element.current).setView([-5, -62], 4); map.current.attributionControl.addAttribution('GeoNames · Natural Earth · HydroRIVERS'); observer = new ResizeObserver(() => map.current?.invalidateSize()); observer.observe(element.current); }); return () => { cancelled = true; observer?.disconnect(); map.current?.remove(); map.current = null; }; }, []);
    // Data can arrive before Leaflet, so render once initialization finishes too.
    useEffect(() => {
        let disposed = false;
        let layer;
        const draw = () => {
            if (disposed)
                return;
            if (!map.current || !leaflet.current) {
                timer = setTimeout(draw, 50);
                return;
            }
            if (!data)
                return;
            const L = leaflet.current;
            layer = L.layerGroup().addTo(map.current);
            L.geoJSON(data.countries, { style: { color: '#929292', weight: 1, fillColor: '#929292', fillOpacity: .07 } }).addTo(layer);
            L.geoJSON(data.rivers, { style: { color: '#8dabb5', weight: 1, opacity: .5 } }).addTo(layer);
            const color = (f) => accounts.find(a => a.id === f.properties.account_id)?.color || '#666';
            for (const f of [...data.river_routes.features, ...(schematic ? data.routes.features : [])]) {
                if (book && f.properties.account_id !== book)
                    continue;
                L.geoJSON(f, { style: { color: color(f), weight: 3, opacity: .85, dashArray: f.properties.route_type === 'schematic_connection' ? '5 7' : undefined } }).on('click', () => callback.current(f)).addTo(layer);
            }
            if (showPlaces)
                for (const f of data.places.features) {
                    if (book && !data.place_coverage[f.properties.id]?.accounts.includes(book))
                        continue;
                    const c = f.geometry;
                    const label = document.createElement('span');
                    label.textContent = `${f.properties.name} · provisional place reference`;
                    L.circleMarker([c.coordinates[1], c.coordinates[0]], { radius: 4, color: '#888', fillOpacity: 0, weight: 1 }).bindTooltip(label).on('click', () => callback.current(f)).addTo(layer);
                }
            for (const f of data.stops.features) {
                if (book && f.properties.account_id !== book)
                    continue;
                const c = f.geometry;
                L.circleMarker([c.coordinates[1], c.coordinates[0]], { radius: 5, color: color(f), fillColor: color(f), fillOpacity: 1, weight: 2 }).on('click', () => callback.current(f)).addTo(layer);
            }
        };
        let timer;
        draw();
        return () => { disposed = true; clearTimeout(timer); layer?.remove(); };
    }, [data, book, accounts, schematic, showPlaces]);
    useEffect(() => { if (!focus || !map.current)
        return; if (focus.geometry.type === 'Point') {
        const c = focus.geometry.coordinates;
        map.current.setView([c[1], c[0]], 7);
    }
    else if (leaflet.current) {
        const b = leaflet.current.geoJSON(focus).getBounds();
        map.current.fitBounds(b, { padding: [30, 30] });
    } }, [focus]);
    return <div className="eldorado-map" ref={element} aria-label="Amazon expedition map. All selected stops are also available in the Journeys list."/>;
}
