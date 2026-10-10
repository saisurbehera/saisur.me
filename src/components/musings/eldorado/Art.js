'use client';
import { useEffect, useRef, useState } from 'react';
export default function Art({ data, book, onPlace }) {
    const [selected, setSelected] = useState(null);
    const dialog = useRef(null);
    useEffect(() => { if (selected)
        dialog.current?.showModal(); }, [selected]);
    const artworks = data.artworks.filter(a => !book || a.account_id === book);
    return <><p className="eldorado-ui-meta">Original illustrations from the downloaded editions. Browse the visual record alongside the travel accounts.</p>{!artworks.length && <p>No illustrations have been imported for this book yet. Select “All books and explorers” to browse the collection.</p>}
 {artworks.map(art => <figure className="eldorado-art-row" key={art.id}><button className="eldorado-art-button" onClick={() => setSelected(art)} aria-label={`Enlarge ${art.title}`}><img src={art.image} alt={art.title} loading="lazy"/></button><figcaption><strong>{art.title}</strong><p className="eldorado-ui-meta">{art.credit}</p><div className="eldorado-links"><a href={art.source_url} target="_blank" rel="noreferrer">Source edition ↗</a>{art.place_id && <button className="eldorado-link" onClick={() => { const f = data.places.features.find(f => f.properties.id === art.place_id); if (f)
        onPlace(f); }}>Locate captioned city</button>}</div></figcaption></figure>)}
 {selected && <dialog ref={dialog} className="eldorado-art-dialog" aria-labelledby="art-title" onCancel={() => setSelected(null)} onClick={e => { if (e.target === dialog.current)
        setSelected(null); }}><div className="eldorado-evidence-heading"><h2 id="art-title" className="eldorado-ui-heading-20">{selected.title}</h2><button autoFocus className="eldorado-ui-button" onClick={() => setSelected(null)}>Close artwork</button></div><img src={selected.image} alt={selected.title}/><p className="eldorado-ui-meta">{selected.credit}</p><p className="eldorado-ui-caption">{selected.note} {selected.rights}</p><a href={selected.source_url} target="_blank" rel="noreferrer">View source edition ↗</a></dialog>}
 </>;
}
