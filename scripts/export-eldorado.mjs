// Refresh the self-contained website snapshot from the research workspace.
// Usage: node scripts/export-eldorado.mjs /path/to/eldorado
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(process.argv[2]||path.join(root,'../../eldorado'));
const read=async file=>JSON.parse(await readFile(path.join(source,file),'utf8'));
const save=async(file,content)=>{const target=path.join(root,file);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);};
const accounts=await read('data/processed/accounts.json'),summary=await read('data/processed/summary.json');
await save('src/data/eldorado/accounts.json',JSON.stringify(accounts.map(({raw_path,...account})=>account),null,2)+'\n');
await save('src/data/eldorado/summary.json',JSON.stringify(summary,null,2)+'\n');
for(const account of accounts){
 const bytes=await readFile(path.join(source,'data/raw/texts',`${account.id}.txt`));
 if(createHash('sha256').update(bytes).digest('hex')!==account.source_sha256)throw Error(`Source checksum mismatch: ${account.id}`);
 await save(`data/eldorado/texts/${account.id}.txt`,bytes);
}
const keys={journeys:'journeys.json',places:'places.geojson',stops:'stops.geojson',routes:'routes.geojson',river_routes:'river_routes.geojson',routing_issues:'routing_issues.json',conflicts:'conflicts.json',unresolved:'unresolved.json',candidate_places:'candidate_places.json',rivers:'rivers.geojson',countries:'countries.geojson',coverage:'coverage.json'};
const atlas={};for(const [key,file] of Object.entries(keys))atlas[key]=await read(`data/processed/${file}`);
atlas.place_coverage={};for(const mention of await read('data/processed/mentions.json')){
 const item=atlas.place_coverage[mention.place_id]??={passages:0,accounts:[]};item.passages++;if(!item.accounts.includes(mention.account_id))item.accounts.push(mention.account_id);
}
atlas.artworks=await read('data/artworks.json');
for(const art of atlas.artworks){
 const bytes=await readFile(path.join(source,'public',art.image));
 if(createHash('sha256').update(bytes).digest('hex')!==art.sha256)throw Error(`Art checksum mismatch: ${art.id}`);
 art.image=`/static/eldorado/art/${path.basename(art.image)}`;
 await save(`public${art.image}`,bytes);
}
await save('public/static/eldorado/atlas.json',JSON.stringify(atlas));
// Vendor Leaflet's unchanged CSS/assets for this page only.
const leaflet=path.join(root,'node_modules/leaflet/dist');
await save('public/static/eldorado/leaflet.css',await readFile(path.join(leaflet,'leaflet.css')));
for(const name of ['layers.png','layers-2x.png','marker-icon.png','marker-icon-2x.png','marker-shadow.png'])await save(`public/static/eldorado/images/${name}`,await readFile(path.join(leaflet,'images',name)));
await save('public/static/eldorado/LEAFLET-LICENSE',await readFile(path.join(root,'node_modules/leaflet/LICENSE')));
await save('data/eldorado/provenance.json',JSON.stringify({source:'Eldorado research workspace',accounts:accounts.map(a=>({id:a.id,source_url:a.source_url,sha256:a.source_sha256})),artworks:atlas.artworks.map(a=>({id:a.id,image_source_url:a.image_source_url,sha256:a.sha256}))},null,2)+'\n');
console.log(`Exported ${accounts.length} volumes, ${atlas.places.features.length} places, and ${atlas.artworks.length} illustrations.`);
