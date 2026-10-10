import {search} from '../../../lib/eldorado-search.mjs';
import {accounts} from '../../../lib/eldorado-data.mjs';
export default function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed.'});}
 const q=req.query.q??'',book=req.query.book??'',offset=Number(req.query.offset??0);
 if(typeof q!=='string'||typeof book!=='string'||Array.isArray(req.query.offset)||q.length>256||!Number.isInteger(offset)||offset<0||offset>100000||book&&!accounts.some(a=>a.id===book))return res.status(400).json({error:'Invalid search parameters.'});
 res.setHeader('Cache-Control','private, no-store');
 return res.status(200).json(search(q,book,offset));
}
