const ALLOWED=new Set(['status','config','snapshot','dashboard']);

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

  const started=Date.now();
  try{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(), action==='snapshot'?30000:180000);
    const r=await fetch(upstream,{redirect:'follow',signal:controller.signal,headers:{'Accept':'application/json'}});
    clearTimeout(timer);
    const text=await r.text();
    const ct=r.headers.get('content-type')||'';
    let body;
    try{ body=JSON.parse(text); }
    catch{
      return res.status(502).json({ok:false,error:'UPSTREAM_NON_JSON',upstreamHttpStatus:r.status,contentType:ct,preview:text.slice(0,180),elapsedMs:Date.now()-started});
    }

    const bodyStatus=Number(body?.httpStatus||200);
    const ok=r.ok && bodyStatus>=200 && bodyStatus<300 && body?.ok!==false;
    const status=ok?200:(bodyStatus||502);
    return res.status(status).json({
      ok,action,
      upstreamHttpStatus:r.status,
      bodyHttpStatus:bodyStatus,
      contentType:ct,
      elapsedMs:Date.now()-started,
      apiVersion:body?.apiVersion||null,
      error:body?.error||null,
      message:body?.message||null,
      data:body
    });
  }catch(err){
    return res.status(err?.name==='AbortError'?504:502).json({ok:false,error:err?.name==='AbortError'?'UPSTREAM_TIMEOUT':'UPSTREAM_FETCH_FAILED',message:String(err?.message||err),elapsedMs:Date.now()-started});
  }
};
