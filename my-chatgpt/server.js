import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import OpenAI from 'openai';

const apiKey=process.env.OPENAI_API_KEY;
const password=process.env.APP_PASSWORD;
if(!apiKey||apiKey.startsWith('replace_')||!password||password.startsWith('replace_')||password.length<12){
  console.error('Set OPENAI_API_KEY and APP_PASSWORD (at least 12 characters).');
  process.exit(1);
}
const client=new OpenAI({apiKey});
const app=express();
const here=path.dirname(fileURLToPath(import.meta.url));
const model=process.env.OPENAI_MODEL||'gpt-5-mini';
const allowedOrigins=new Set((process.env.ALLOWED_ORIGINS||'https://pageportalsai-hash.github.io').split(',').map(x=>x.trim()).filter(Boolean));
app.disable('x-powered-by');
app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{
  defaultSrc:["'self'"],scriptSrc:["'self'","'unsafe-inline'"],
  styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],
  connectSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:null
}}}));
app.use((req,res,next)=>{
  const origin=req.get('origin');
  if(origin&&allowedOrigins.has(origin)){
    res.set('Access-Control-Allow-Origin',origin);
    res.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers','Content-Type, X-App-Password');
    res.set('Vary','Origin');
  }
  if(req.method==='OPTIONS')return res.sendStatus(!origin||allowedOrigins.has(origin)?204:403);
  next();
});
app.use(express.json({limit:'100kb'}));
app.get('/',(_req,res)=>res.sendFile(path.join(here,'index.html')));
app.get('/studio.js',(_req,res)=>res.type('js').sendFile(path.join(here,'studio.js')));
app.get('/studio.css',(_req,res)=>res.type('css').sendFile(path.join(here,'studio.css')));
app.get('/api/health',(_req,res)=>res.json({ok:true}));
const authRate=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-8',legacyHeaders:false});
const chatRate=rateLimit({windowMs:60*1000,limit:12,standardHeaders:'draft-8',legacyHeaders:false});
function authorized(value){
  if(typeof value!=='string')return false;
  const a=crypto.createHash('sha256').update(value).digest();
  const b=crypto.createHash('sha256').update(password).digest();
  return crypto.timingSafeEqual(a,b);
}
function requireAuth(req,res,next){
  if(!authorized(req.get('x-app-password')))return res.status(401).json({error:'Incorrect app password.'});
  next();
}
app.post('/api/auth',authRate,requireAuth,(_req,res)=>res.json({ok:true}));
app.post('/api/chat',chatRate,requireAuth,async(req,res)=>{
  const incoming=req.body?.messages;
  if(!Array.isArray(incoming)||incoming.length===0||incoming.length>40)
    return res.status(400).json({error:'A valid conversation is required.'});
  let total=0;const input=[];
  for(const m of incoming){
    if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'
      ||!m.content.trim()||m.content.length>12000)
      return res.status(400).json({error:'Invalid message.'});
    total+=m.content.length;input.push({role:m.role,content:m.content});
  }
  if(total>64000||input.at(-1).role!=='user)
    return res.status(400).json({error:'Conversation is too long or does not end with user text.'});
  const mode=req.body?.mode==='game'?'game':'chat';
  const instructions=mode==='game'
    ?'You are a skilled browser game developer. Return ONLY complete, playable, self-contained HTML with inline CSS and JavaScript. Make the game genuinely interactive, appealing, playable on keyboard and touch. Include a start/restart option. Avoid external files and network dependencies. Do not use markdown fences.'
    :'You are a helpful, accurate, creative assistant. Help with coding, writing, explanations, planning and game design. Be truthful and transparent. Never claim to have edited repositories, browsed the web or created images without tools.';
  try{
    const stream=await client.responses.create({
      model,input,store:false,max_output_tokens:mode==='game'?8500:3500,stream:true,instructions
    });
    res.status(200).set({'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-cache, no-transform'});
    res.flushHeaders();
    for await(const evt of stream){
      if(evt.type==='response.output_text.delta'&&evt.delta)res.write(JSON.stringify({type:'delta',text:evt.delta})+'\n');
      if(evt.type==='response.failed')throw Error(evt.response?.error?.message||'Model response failed');
    }
    res.end(JSON.stringify({type:'done'})+'\n');
  }catch(error){
    console.error('OpenAI error',error.status||'',error.message||'');
    const msg='Unable to get an AI reply. Check the API key, model, billing and token limits.';
    if(res.headersSent){res.end(JSON.stringify({type:'error',message:msg})+'\n')}
    else res.status(502).json({error:msg});
  }
});
app.use((_req,res)=>res.status(404).send('Not found'));
app.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('My ChatGPT Studio server running'));
