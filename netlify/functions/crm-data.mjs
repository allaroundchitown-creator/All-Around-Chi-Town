import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';
const json=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'same-origin'},body:JSON.stringify(data)});
const empty=()=>({leads:[],bookings:[],campaigns:[]});
function validAuth(header){const expected=process.env.ADMIN_API_TOKEN;if(!expected||expected.length<32||!header?.startsWith('Bearer '))return false;const a=Buffer.from(header.slice(7)),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
export const handler=async event=>{
 if(!validAuth(event.headers.authorization||event.headers.Authorization))return json(401,{error:'Unauthorized or ADMIN_API_TOKEN not configured (minimum 32 characters)'});
 if(!['GET','PUT'].includes(event.httpMethod))return json(405,{error:'Method not allowed'});
 try{
  const store=getStore('aact-crm');
  if(event.httpMethod==='GET')return json(200,(await store.get('records',{type:'json'}))||empty());
  if((event.body||'').length>500000)return json(413,{error:'Payload too large'});
  const data=JSON.parse(event.body||'{}');
  if(!['leads','bookings','campaigns'].every(k=>Array.isArray(data[k])&&data[k].length<=5000&&data[k].every(x=>x&&typeof x.id==='string'&&x.id.length<200)))return json(422,{error:'Invalid CRM data'});
  await store.setJSON('records',data);return json(200,{ok:true});
 }catch(e){console.error('CRM function failed',e?.message);return json(500,{error:'CRM storage unavailable'})}
};