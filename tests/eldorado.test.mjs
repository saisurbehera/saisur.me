import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {accounts,source} from '../src/lib/eldorado-data.mjs';
import {paragraphs,search,searchRecords} from '../src/lib/eldorado-search.mjs';
const root=new URL('../',import.meta.url);
test('exported books and images preserve checksums and source provenance',async()=>{
 assert.equal(accounts.length,28);
 for(const a of accounts){const bytes=await readFile(new URL(`data/eldorado/texts/${a.id}.txt`,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.source_sha256);}
 const atlas=JSON.parse(await readFile(new URL('public/static/eldorado/atlas.json',root),'utf8'));
 assert.equal(atlas.places.features.length,96);assert.equal(atlas.artworks.length,9);
 for(const art of atlas.artworks){const bytes=await readFile(new URL(`public${art.image}`,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),art.sha256);}
 assert.equal(source('../accounts'),null);
});
test('book search preserves source offsets and bounded pagination',()=>{
 const raw=source('bates');const result=search('canoe','bates');assert.ok(result.total>20);assert.equal(result.hits.length,20);
 const next=search('canoe','bates',20);assert.notEqual(result.hits[0].id,next.hits[0].id);
 for(const hit of [...result.hits,...next.hits])assert.equal(raw.slice(hit.char_start,hit.char_end),hit.excerpt);
 const fixtures=paragraphs('Canoe at Belém.\n\nThe other town.','bates');
 assert.equal(searchRecords(fixtures,accounts,'canoe belem','bates').total,1);
 assert.equal(searchRecords(fixtures,accounts,'canoe belem','wallace').total,0);
});
