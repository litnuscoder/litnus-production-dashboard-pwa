const ALLOWED=new Set(['status','config','snapshot','dashboard']);

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function fetchUpstream(url, action){
  const started=Date.now();
  const controller=new AbortController();
  const timeoutMs=action==='snapshot'?45000:180000;
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(url,{redirect:'follow',signal:controller.signal,headers:{'Accept':'application/json'}});
    const text=await r.text();
    const ct=r.headers.get('content-type')||'';
    let body=null;
    try{body=JSON.parse(text);}catch{}
    return {r,text,ct,body,elapsedMs:Date.now()-started};
  }finally{clearTimeout(timer);}
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex');

  const UPSTREAM=String(process.env.APPS_SCRIPT_URL||'').trim();
  const TOKEN=String(process.env.PWA_API_TOKEN||'').trim();
  if(!UPSTREAM || !TOKEN){
    return res.status(500).json({ok:false,error:'SERVER_ENV_NOT_CONFIGURED'});
  }

  const base='https://pwa.invalid';
  const u=new URL(req.url||'/api/read',base);
  const action=String(u.searchParams.get('action')||'status').toLowerCase();
  if(!ALLOWED.has(action)) return res.status(400).json({ok:false,error:'READ_ONLY_ACTION_NOT_ALLOWED'});

  const upstream=new URL(UPSTREAM);
  upstream.searchParams.set('pwa_api','1');
  upstream.searchParams.set('action',action);
  upstream.searchParams.set('token',TOKEN);

  if(action==='dashboard' || action==='snapshot'){
    const start=u.searchParams.get('start')||'';
    const end=u.searchParams.get('end')||'';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)){
      return res.status(400).json({ok:false,error:'INVALID_DATE_RANGE'});
    }
    upstream.searchParams.set('start',start);
    upstream.searchParams.set('end',end);
  }

  const requestStarted=Date.now();
  let attempts=0;
  let last=null;
  try{
    const maxAttempts=action==='snapshot'?2:1;
    while(attempts<maxAttempts){
      attempts++;
      last=await fetchUpstream(upstream,action);
      const {r,text,ct,body}=last;
      if(body){
        const bodyStatus=Number(body?.httpStatus||200);
        const ok=r.ok && bodyStatus>=200 && bodyStatus<300 && body?.ok!==false;
        // Retry only transient upstream/server failures on snapshot.
        if(action==='snapshot' && attempts<maxAttempts && (!ok && (r.status>=500 || bodyStatus>=500))){
          await sleep(700); continue;
        }
        const status=ok?200:(bodyStatus||502);
        return res.status(status).json({
          ok,action,attempts,
          upstreamHttpStatus:r.status,
          bodyHttpStatus:bodyStatus,
          contentType:ct,
          elapsedMs:Date.now()-requestStarted,
          apiVersion:body?.apiVersion||null,
          error:body?.error||null,
          message:body?.message||null,
          snapshotHit:body?.snapshotHit,
          storage:body?.storage||null,
          data:body
        });
      }
      // Non JSON can be a transient Apps Script HTML error/login/cold-start page.
      if(action==='snapshot' && attempts<maxAttempts){await sleep(700);continue;}
      return res.status(502).json({
        ok:false,action,attempts,error:'UPSTREAM_NON_JSON',
        upstreamHttpStatus:r.status,contentType:ct,
        preview:text.slice(0,320),elapsedMs:Date.now()-requestStarted
      });
    }
  }catch(err){
    return res.status(err?.name==='AbortError'?504:502).json({
      ok:false,action,attempts,error:err?.name==='AbortError'?'UPSTREAM_TIMEOUT':'UPSTREAM_FETCH_FAILED',
      message:String(err?.message||err),elapsedMs:Date.now()-requestStarted
    });
  }
};
