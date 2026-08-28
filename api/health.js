module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex');
  const configured=Boolean(String(process.env.APPS_SCRIPT_URL||'').trim() && String(process.env.PWA_API_TOKEN||'').trim());
  return res.status(200).json({
    ok:true,
    service:'litnus-production-dashboard-pwa',
    stage:'STAGE_1_6_CACHE_SNAPSHOT',
    upstreamConfigured:configured,
    mode:configured?'READ_ONLY_UPSTREAM':'ENV_NOT_CONFIGURED',
    now:new Date().toISOString()
  });
};
