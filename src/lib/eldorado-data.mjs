import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export const accounts=JSON.parse(readFileSync(join(process.cwd(),'src/data/eldorado/accounts.json'),'utf8'));
export function source(id){
 if(!accounts.some(a=>a.id===id))return null;
 return readFileSync(join(process.cwd(),'data/eldorado/texts',`${id}.txt`),'utf8');
}
