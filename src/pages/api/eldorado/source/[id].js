import {source} from '../../../../lib/eldorado-data.mjs';
export default function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed.');}
 const text=typeof req.query.id==='string'?source(req.query.id):null;
 if(text===null)return res.status(404).send('Unknown book');
 res.setHeader('Content-Type','text/plain; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');return res.status(200).send(text);
}
