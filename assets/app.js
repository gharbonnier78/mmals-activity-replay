(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const COLORS = ['#78f0ad', '#62bfe1', '#e1bd63', '#b18ada', '#e0763d'];
  const TRACE_COLORS = { accuracy:'#78f0ad', loss:'#e0763d', dominance:'#62bfe1', entropy:'#e1bd63', route_drift:'#b18ada', latent_drift:'#f06f6f' };
  const state = {
    manifest: null,
    events: [],
    filtered: [],
    index: 0,
    playing: false,
    timer: null,
    speed: 1,
    pinned: null,
    trail: [],
    validation: { errors: [], warnings: [], checks: [] },
    sourceFiles: new Map(),
    domain: 'core'
  };

  const els = {
    displayMode: $('displayMode'), activityMode: $('activityMode'), modelSelect: $('modelSelect'), seedSelect: $('seedSelect'),
    lensSelect: $('lensSelect'), domainSelect: $('domainSelect'), bundleInput: $('bundleInput'), compactInput: $('compactInput'),
    csvInput: $('csvInput'), exportCompactBtn: $('exportCompactBtn'), demoBtn: $('demoBtn'), compactDemoBtn: $('compactDemoBtn'),
    playBtn: $('playBtn'), stepBtn: $('stepBtn'), pinBtn: $('pinBtn'), timeSlider: $('timeSlider'), stepReadout: $('stepReadout'),
    speedSlider: $('speedSlider'), speedReadout: $('speedReadout'), statusLine: $('statusLine'), manifestCards: $('manifestCards'),
    validationBadge: $('validationBadge'), validationReport: $('validationReport'), ecosystemCanvas: $('ecosystemCanvas'),
    simplexCanvas: $('simplexCanvas'), traceCanvas: $('traceCanvas'), routeWeights: $('routeWeights'), routeStatus: $('routeStatus'),
    currentEvent: $('currentEvent'), deltaPanel: $('deltaPanel')
  };

  function safeNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
  function mean(xs) { return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }
  function entropy(route) { return -route.reduce((s,p)=> p > 0 ? s + p * Math.log(p) : s, 0); }
  function normalizeRoute(route) {
    const cleaned = route.map(v => Math.max(0, safeNumber(v)));
    const sum = cleaned.reduce((a,b)=>a+b,0);
    return sum > 0 ? cleaned.map(v=>v/sum) : cleaned.map(()=>1/Math.max(1, cleaned.length));
  }
  function fmt(v, digits=3) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
    return Number(v).toFixed(digits);
  }
  function statusClass(s) { return `source-${s || 'derived'}`; }
  function textStatus(s) { return s || 'derived'; }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', inQuotes = false;
    for (let i=0;i<text.length;i++) {
      const c=text[i], n=text[i+1];
      if (c==='"' && inQuotes && n==='"') { cell+='"'; i++; }
      else if (c==='"') inQuotes=!inQuotes;
      else if (c===',' && !inQuotes) { row.push(cell); cell=''; }
      else if ((c==='\n' || c==='\r') && !inQuotes) {
        if (c==='\r' && n==='\n') i++;
        row.push(cell); cell='';
        if (row.some(x=>x!=='')) rows.push(row);
        row=[];
      } else cell+=c;
    }
    if (cell || row.length) { row.push(cell); if (row.some(x=>x!=='')) rows.push(row); }
    if (!rows.length) return [];
    const headers = rows[0].map(h=>h.trim());
    return rows.slice(1).map(r => Object.fromEntries(headers.map((h,i)=>[h,(r[i]??'').trim()])));
  }

  function guessModel(row) { return row.model || row.method || row.policy || 'unknown'; }
  function guessSeed(row) { return String(row.seed ?? row.random_seed ?? '0'); }
  function findHostColumns(rows) {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(k => /^host_\d+$/.test(k)).sort((a,b)=>safeNumber(a.split('_')[1])-safeNumber(b.split('_')[1]));
  }

  function metricFromRow(row, names) {
    for (const n of names) if (row[n] !== undefined && row[n] !== '') return safeNumber(row[n], null);
    return null;
  }

  function adaptLegacyCSVs(namedRows) {
    const allSets = [...namedRows.entries()].map(([name, rows]) => ({name, rows, hosts:findHostColumns(rows)}));
    const routeSet = allSets.find(s=>s.hosts.length) || allSets[0];
    if (!routeSet || !routeSet.rows.length) throw new Error('No usable CSV rows were found.');
    const hostCols = routeSet.hosts.length ? routeSet.hosts : ['host_0','host_1','host_2','host_3','host_4'];
    const primary = routeSet.rows;
    const models = [...new Set(primary.map(guessModel))];
    const events = [];

    function matchingRows(set, base) {
      return set.rows.filter(r => {
        const sameModel = guessModel(r)===guessModel(base) || guessModel(r)==='unknown';
        const sameSeed = guessSeed(r)===guessSeed(base) || guessSeed(r)==='0';
        const taskA = r.task_id ?? r.after_task ?? r.task ?? '';
        const taskB = base.task_id ?? base.after_task ?? base.task ?? '';
        const epochA = r.epoch ?? r.step ?? '';
        const epochB = base.epoch ?? base.step ?? '';
        return sameModel && sameSeed && (taskA==='' || taskB==='' || String(taskA)===String(taskB)) && (epochA==='' || epochB==='' || String(epochA)===String(epochB));
      });
    }

    primary.forEach((row, i) => {
      const route = normalizeRoute(hostCols.map(c=>safeNumber(row[c], 0)));
      const event = {
        step: safeNumber(row.step, i),
        activity: row.activity || row.mode || 'train',
        phase: row.phase || 'checkpoint',
        event_type: row.event_type || 'route_checkpoint',
        model: guessModel(row), seed: guessSeed(row),
        task_id: safeNumber(row.task_id ?? row.after_task, 0), epoch: safeNumber(row.epoch, i),
        objective_id: row.objective_id || 'not_logged',
        route,
        metrics: {
          loss: metricFromRow(row,['task_loss','loss']),
          accuracy: metricFromRow(row,['acc','accuracy','final_accuracy']),
          dominance: Math.max(...route), entropy: entropy(route),
          route_drift: metricFromRow(row,['route_drift','route_drift_Dr']),
          latent_drift: metricFromRow(row,['latent_drift','latent_drift_Dz']),
          output_drift: metricFromRow(row,['output_drift','output_drift_Dy']),
          mutualistic_gain: metricFromRow(row,['mutualistic_gain','gain','host_gain']),
          carbon_cost: metricFromRow(row,['carbon_cost','energy_cost','route_entropy'])
        },
        provenance: { route:'observed', metrics:'observed', source_file:routeSet.name },
        note: 'Legacy CSV adapter checkpoint.'
      };
      allSets.filter(s=>s!==routeSet).forEach(set => {
        const matches = matchingRows(set,row);
        if (!matches.length) return;
        const m=matches[matches.length-1];
        const candidates = {
          loss: metricFromRow(m,['task_loss','loss']), accuracy: metricFromRow(m,['acc','accuracy','final_accuracy']),
          route_drift: metricFromRow(m,['route_drift','route_drift_Dr']), latent_drift: metricFromRow(m,['latent_drift','latent_drift_Dz']),
          output_drift: metricFromRow(m,['output_drift','output_drift_Dy']), mutualistic_gain: metricFromRow(m,['mutualistic_gain','gain']),
          carbon_cost: metricFromRow(m,['carbon_cost','energy_cost']), dominance: metricFromRow(m,['dominance','route_dominance']),
          entropy: metricFromRow(m,['entropy','route_entropy'])
        };
        Object.entries(candidates).forEach(([k,v])=>{ if(v!==null) event.metrics[k]=v; });
      });
      events.push(event);
    });

    return {
      manifest: {
        schema_version:'mmals-replay-bundle-v1', bundle_profile:'standard', run_id:`legacy-${Date.now()}`,
        project:'MMALS', experiment:'legacy_csv_import', experiment_version:'unknown', domain_pack:'route-function',
        source:{ repository:'local browser files', commit:'not supplied', notebook:'not supplied' },
        dataset:{ name:'not supplied', protocol:'legacy import' },
        available_lenses:['balanced','performance','stability','ecology','efficiency'],
        provenance:{ status:'mixed', note:'Adapted in-browser from legacy CSV exports.' },
        compatibility:{ legacy_csv:true, detected_models:models }
      }, events
    };
  }

  function canonicalEvent(raw, i=0) {
    const routeRaw = raw.route || raw.route_weights || raw.host_weights || [1,0,0,0,0];
    const route = normalizeRoute(Array.isArray(routeRaw) ? routeRaw : Object.keys(routeRaw).sort().map(k=>routeRaw[k]));
    const metrics = {...(raw.metrics || {})};
    metrics.dominance = metrics.dominance ?? Math.max(...route);
    metrics.entropy = metrics.entropy ?? entropy(route);
    return {
      step:safeNumber(raw.step,i), activity:raw.activity||raw.mode||'train', phase:raw.phase||'checkpoint',
      event_type:raw.event_type||'route_checkpoint', model:raw.model||raw.method||'MMALS', seed:String(raw.seed??'0'),
      task_id:safeNumber(raw.task_id,0), epoch:safeNumber(raw.epoch,i), objective_id:raw.objective_id||'not_logged',
      route, metrics, regime:raw.regime||raw.complexity_mode||'unknown', note:raw.note||raw.description||'',
      provenance:{ route:raw.provenance?.route||raw.status?.route||'observed', metrics:raw.provenance?.metrics||raw.status?.metrics||'observed', source_file:raw.provenance?.source_file||'compact replay' }
    };
  }

  async function fetchText(path) {
    const r=await fetch(path,{cache:'no-store'});
    if(!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
    return r.text();
  }
  async function fetchJSON(path) { return JSON.parse(await fetchText(path)); }

  async function loadHostedManifest(path) {
    setStatus(`Loading manifest ${path}…`);
    const manifest=await fetchJSON(path);
    const base=path.slice(0,path.lastIndexOf('/')+1);
    const namedRows=new Map();
    const directEvents=[];
    for(const file of manifest.files || []) {
      const full=new URL(file.path, new URL(base, location.href)).toString();
      if(file.format==='csv') namedRows.set(file.path,parseCSV(await fetchText(full)));
      else if(file.format==='json') {
        const obj=await fetchJSON(full);
        if(Array.isArray(obj)) directEvents.push(...obj);
        else if(Array.isArray(obj.events)) directEvents.push(...obj.events);
      } else if(file.format==='jsonl') {
        const txt=await fetchText(full);
        directEvents.push(...txt.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line)));
      }
    }
    let events=[];
    if(directEvents.length) events=directEvents.map(canonicalEvent);
    else if(namedRows.size) events=adaptLegacyCSVs(namedRows).events;
    loadRun(manifest,events);
  }

  async function readFiles(files) {
    const map=new Map();
    await Promise.all([...files].map(async f=>map.set(f.name,await f.text())));
    return map;
  }

  async function loadBundleFiles(files) {
    const map=await readFiles(files);
    const manifestEntry=[...map.entries()].find(([name])=>/run_manifest\.json$/i.test(name));
    if(!manifestEntry) throw new Error('Bundle selection must include run_manifest.json.');
    const manifest=JSON.parse(manifestEntry[1]);
    const namedRows=new Map(), direct=[];
    for(const spec of manifest.files || []) {
      const basename=spec.path.split('/').pop();
      const text=map.get(spec.path) ?? map.get(basename);
      if(text===undefined) {
        if(spec.required!==false) state.validation.errors.push(`Missing required file: ${spec.path}`);
        continue;
      }
      if(spec.format==='csv') namedRows.set(spec.path,parseCSV(text));
      else if(spec.format==='json') { const obj=JSON.parse(text); direct.push(...(Array.isArray(obj)?obj:(obj.events||[]))); }
      else if(spec.format==='jsonl') direct.push(...text.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x)));
    }
    const events=direct.length?direct.map(canonicalEvent):adaptLegacyCSVs(namedRows).events;
    loadRun(manifest,events);
  }

  function validateManifest(m, events) {
    const v={errors:[],warnings:[],checks:[]};
    const required=['schema_version','bundle_profile','run_id','project','experiment','domain_pack','source'];
    required.forEach(k=>m?.[k]===undefined?v.errors.push(`Manifest missing '${k}'.`):v.checks.push(`Manifest field '${k}' present.`));
    if(m?.schema_version!=='mmals-replay-bundle-v1') v.errors.push(`Unsupported schema_version: ${m?.schema_version}`);
    if(!['full','standard','compact'].includes(m?.bundle_profile)) v.errors.push(`Invalid bundle_profile: ${m?.bundle_profile}`);
    if(!events.length) v.errors.push('No replay events loaded.');
    let prev=-Infinity;
    events.forEach((e,i)=>{
      if(e.step<prev) v.warnings.push(`Event ${i} is out of step order.`); prev=e.step;
      if(!Array.isArray(e.route)||!e.route.length) v.errors.push(`Event ${i} has no route.`);
      const s=e.route.reduce((a,b)=>a+b,0);
      if(Math.abs(s-1)>1e-5) v.errors.push(`Event ${i} route does not sum to one (${s}).`);
      if(e.route.some(x=>x<0)) v.errors.push(`Event ${i} contains negative route weights.`);
    });
    if(!m?.source?.commit || m.source.commit==='not supplied') v.warnings.push('Source commit is not supplied.');
    if(!m?.checksums) v.warnings.push('No checksums declared; integrity is not cryptographically verified.');
    if(m?.provenance?.status==='synthetic') v.warnings.push('This bundle is explicitly synthetic and must not be presented as experimental evidence.');
    v.checks.push(`${events.length} events parsed.`);
    return v;
  }

  function loadRun(manifest, events) {
    state.manifest=manifest; state.events=events.map(canonicalEvent); state.validation=validateManifest(manifest,state.events);
    state.domain=manifest.domain_pack||'core';
    if([...els.domainSelect.options].some(o=>o.value===state.domain)) els.domainSelect.value=state.domain;
    populateSelectors(); applyFilters(); renderManifest(); renderAll();
    setStatus(`Loaded ${manifest.run_id}: ${events.length} events (${manifest.bundle_profile}).`);
  }

  function populateSelectors() {
    const models=[...new Set(state.events.map(e=>e.model))];
    const seeds=[...new Set(state.events.map(e=>e.seed))];
    els.modelSelect.innerHTML=models.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    els.seedSelect.innerHTML=seeds.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
  }

  function applyFilters() {
    const model=els.modelSelect.value, seed=els.seedSelect.value, activity=els.activityMode.value;
    let filtered=state.events.filter(e=>(!model||e.model===model)&&(!seed||e.seed===seed));
    const activityExact=filtered.filter(e=>e.activity===activity || (activity==='audit' && ['inference','audit'].includes(e.activity)));
    if(activityExact.length) filtered=activityExact;
    state.filtered=filtered.sort((a,b)=>a.step-b.step);
    state.index=clamp(state.index,0,Math.max(0,state.filtered.length-1));
    els.timeSlider.max=Math.max(0,state.filtered.length-1); els.timeSlider.value=state.index;
    state.trail=[];
  }

  function card(label,value,cls='') { return `<div class="card"><span>${escapeHtml(label)}</span><strong class="${cls}">${escapeHtml(value)}</strong></div>`; }
  function renderManifest() {
    const m=state.manifest;
    if(!m){els.manifestCards.innerHTML='';return;}
    els.manifestCards.innerHTML=[
      card('Run ID',m.run_id),card('Profile',m.bundle_profile),card('Experiment',`${m.experiment} ${m.experiment_version||''}`),card('Domain pack',m.domain_pack),
      card('Dataset',m.dataset?.name||'not supplied'),card('Code commit',m.source?.commit||'not supplied'),card('Notebook',m.source?.notebook||'not supplied'),card('Provenance',m.provenance?.status||'mixed')
    ].join('');
    const v=state.validation;
    els.validationBadge.textContent=v.errors.length?'invalid':(v.warnings.length?'valid with warnings':'valid');
    els.validationBadge.className=`badge ${v.errors.length?'bad':v.warnings.length?'neutral':''}`;
    els.validationReport.innerHTML=[...v.checks.map(x=>`<div class="ok">✓ ${escapeHtml(x)}</div>`),...v.warnings.map(x=>`<div>⚠ ${escapeHtml(x)}</div>`),...v.errors.map(x=>`<div class="error">✕ ${escapeHtml(x)}</div>`)].join('');
  }

  function current() { return state.filtered[state.index] || null; }
  function lensScores(e) {
    const m=e.metrics||{}, lens=els.lensSelect.value;
    const base={accuracy:safeNumber(m.accuracy), stability:1-clamp(mean([safeNumber(m.route_drift),safeNumber(m.latent_drift),safeNumber(m.output_drift)])), ecology:clamp(safeNumber(m.mutualistic_gain,.5)), efficiency:1-clamp(safeNumber(m.carbon_cost, safeNumber(m.entropy)/Math.log(Math.max(2,e.route.length))))};
    if(lens==='performance') return base.accuracy;
    if(lens==='stability') return base.stability;
    if(lens==='ecology') return base.ecology;
    if(lens==='efficiency') return base.efficiency;
    return mean(Object.values(base));
  }

  function drawEcosystem(e) {
    const c=els.ecosystemCanvas, ctx=c.getContext('2d'), w=c.width,h=c.height; ctx.clearRect(0,0,w,h); ctx.fillStyle='#0a0f0d';ctx.fillRect(0,0,w,h);
    const center={x:w*.5,y:h*.52}, radius=Math.min(w,h)*.36;
    const hosts=e.route.map((_,i)=>({x:center.x+Math.cos(-Math.PI/2+i*2*Math.PI/e.route.length)*radius,y:center.y+Math.sin(-Math.PI/2+i*2*Math.PI/e.route.length)*radius}));
    const memory={x:w*.82,y:h*.18}, head={x:w*.82,y:h*.78};
    function edge(a,b,color,width,dash=[]){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.globalAlpha=.78;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();}
    hosts.forEach((p,i)=>{edge(p,center,'#62bfe1',1+e.route[i]*12); if(e.activity==='train') edge(center,p,'#b18ada',.8+e.route[i]*5,[5,5]);});
    edge(memory,center,'#e1bd63',2,[7,5]); edge(center,head,'#78f0ad',4+Math.max(...e.route)*5);
    function node(p,r,fill,label,sub){ctx.beginPath();ctx.fillStyle=fill;ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#dce8e0';ctx.lineWidth=1;ctx.stroke();ctx.textAlign='center';ctx.fillStyle='#e2ece5';ctx.font='600 13px system-ui';ctx.fillText(label,p.x,p.y+r+18);ctx.fillStyle='#8b9b92';ctx.font='11px ui-monospace';ctx.fillText(sub,p.x,p.y+r+33);}
    hosts.forEach((p,i)=>node(p,13+e.route[i]*22,COLORS[i%COLORS.length],`Host ${i}`,fmt(e.route[i],2)));
    node(center,30,'#264d3a','Fungal medium',e.phase); node(memory,20,'#6c5a27','Memory',e.provenance.route); node(head,22,'#285566','Readout',e.objective_id);
    ctx.fillStyle='#8b9b92';ctx.textAlign='left';ctx.font='12px ui-monospace';ctx.fillText(`event: ${e.event_type} · activity: ${e.activity}`,20,h-18);
  }

  function simplexPoint(route,w,h) {
    const cx=w/2,cy=h/2+5,r=Math.min(w,h)*.39;
    const vertices=route.map((_,i)=>({x:cx+Math.cos(-Math.PI/2+i*2*Math.PI/route.length)*r,y:cy+Math.sin(-Math.PI/2+i*2*Math.PI/route.length)*r}));
    return {vertices,x:route.reduce((s,p,i)=>s+p*vertices[i].x,0),y:route.reduce((s,p,i)=>s+p*vertices[i].y,0)};
  }

  function drawSimplex(e) {
    const c=els.simplexCanvas,ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a0f0d';ctx.fillRect(0,0,w,h);
    const p=simplexPoint(e.route,w,h), verts=p.vertices;
    ctx.strokeStyle='#33443d';ctx.lineWidth=2;ctx.beginPath();verts.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.stroke();
    ctx.strokeStyle='#1d2b25';ctx.lineWidth=1;verts.forEach(v=>{ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(v.x,v.y);ctx.stroke();});
    verts.forEach((v,i)=>{ctx.fillStyle=COLORS[i%COLORS.length];ctx.beginPath();ctx.arc(v.x,v.y,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e2ece5';ctx.font='12px ui-monospace';ctx.textAlign='center';ctx.fillText(`H${i}`,v.x,v.y+24);});
    state.trail.push({x:p.x,y:p.y}); if(state.trail.length>80) state.trail.shift();
    state.trail.forEach((q,i)=>{ctx.globalAlpha=(i+1)/state.trail.length*.45;ctx.fillStyle='#78f0ad';ctx.beginPath();ctx.arc(q.x,q.y,2.5,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    ctx.shadowColor='#78f0ad';ctx.shadowBlur=18;ctx.fillStyle='#78f0ad';ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#8b9b92';ctx.textAlign='left';ctx.font='12px ui-monospace';ctx.fillText('2D barycentric projection of route simplex',18,h-18);
    els.routeWeights.innerHTML=e.route.map((v,i)=>`<div class="weight"><span>host_${i}</span><b style="color:${COLORS[i%COLORS.length]}">${fmt(v,3)}</b></div>`).join('');
    els.routeStatus.textContent=`dominance ${fmt(Math.max(...e.route),2)} · ${textStatus(e.provenance.route)}`;
  }

  function drawTraces() {
    const events=state.filtered,c=els.traceCanvas,ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a0f0d';ctx.fillRect(0,0,w,h);
    if(!events.length)return;
    const keys=['accuracy','loss','dominance','entropy','route_drift','latent_drift'];
    const vals={}; keys.forEach(k=>vals[k]=events.map(e=>e.metrics?.[k]).filter(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))).map(Number));
    const ranges={};keys.forEach(k=>{const a=vals[k];ranges[k]=a.length?[Math.min(...a),Math.max(...a)]:[0,1];if(ranges[k][0]===ranges[k][1])ranges[k][1]+=1;});
    ctx.strokeStyle='#24312b';ctx.lineWidth=1;for(let y=35;y<h-25;y+=50){ctx.beginPath();ctx.moveTo(45,y);ctx.lineTo(w-15,y);ctx.stroke();}
    keys.forEach(k=>{ctx.strokeStyle=TRACE_COLORS[k];ctx.lineWidth=2;ctx.beginPath();let started=false;events.forEach((e,i)=>{const v=e.metrics?.[k];if(v===null||v===undefined||!Number.isFinite(Number(v)))return;const [mn,mx]=ranges[k];const x=45+i/Math.max(1,events.length-1)*(w-65);const y=h-30-(Number(v)-mn)/(mx-mn)*(h-65);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);});ctx.stroke();});
    const px=45+state.index/Math.max(1,events.length-1)*(w-65);ctx.strokeStyle='#e2ece5';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(px,20);ctx.lineTo(px,h-25);ctx.stroke();ctx.setLineDash([]);
    let lx=48;keys.forEach(k=>{ctx.fillStyle=TRACE_COLORS[k];ctx.fillRect(lx,8,12,3);ctx.fillStyle='#8b9b92';ctx.font='10px ui-monospace';ctx.fillText(k,lx+17,12);lx+=17+ctx.measureText(k).width+18;});
  }

  function renderEvent(e) {
    if(!e){els.currentEvent.innerHTML='<p>No event.</p>';return;}
    const m=e.metrics||{};
    els.currentEvent.innerHTML=[
      card('Step / phase',`${e.step} / ${e.phase}`),card('Task / epoch',`${e.task_id} / ${e.epoch}`),card('Objective',e.objective_id),card('Regime',e.regime),
      card('Accuracy',fmt(m.accuracy),statusClass(e.provenance.metrics)),card('Loss',fmt(m.loss),statusClass(e.provenance.metrics)),card('Dominance',fmt(m.dominance),'source-derived'),card('Entropy',fmt(m.entropy),'source-derived'),
      card('Route drift',fmt(m.route_drift),statusClass(e.provenance.metrics)),card('Latent drift',fmt(m.latent_drift),statusClass(e.provenance.metrics)),card('Output drift',fmt(m.output_drift),statusClass(e.provenance.metrics)),card('Lens score',fmt(lensScores(e)),'source-derived'),
      card('Route source',e.provenance.route,statusClass(e.provenance.route)),card('Metric source',e.provenance.metrics,statusClass(e.provenance.metrics)),card('Source file',e.provenance.source_file||'—'),card('Note',e.note||'—')
    ].join('');
  }

  function renderDelta(e) {
    const a=state.pinned;if(!a||!e){els.deltaPanel.innerHTML='<p>No A snapshot pinned.</p>';return;}
    const routeDelta=Math.sqrt(e.route.reduce((s,v,i)=>s+(v-(a.route[i]||0))**2,0));
    const keys=['accuracy','loss','dominance','entropy','route_drift','latent_drift'];
    els.deltaPanel.innerHTML=[card('A → B step',`${a.step} → ${e.step}`),card('Route L2 delta',fmt(routeDelta),'source-derived'),card('Objective',`${a.objective_id} → ${e.objective_id}`),card('Regime',`${a.regime} → ${e.regime}`),...keys.map(k=>card(`Δ ${k}`,fmt(safeNumber(e.metrics?.[k])-safeNumber(a.metrics?.[k])),'source-derived'))].join('');
  }

  function renderAll() {
    const e=current();
    els.timeSlider.max=Math.max(0,state.filtered.length-1);els.timeSlider.value=state.index;
    els.stepReadout.textContent=`step ${state.filtered.length?state.index+1:0} / ${state.filtered.length}`;
    if(e){drawEcosystem(e);drawSimplex(e);drawTraces();renderEvent(e);renderDelta(e);} else {renderEvent(null);}
  }

  function setStatus(msg) { els.statusLine.textContent=msg; }
  function stop(){state.playing=false;clearInterval(state.timer);state.timer=null;els.playBtn.textContent='▶ Play';}
  function play(){if(!state.filtered.length)return;if(state.playing){stop();return;}state.playing=true;els.playBtn.textContent='❚❚ Pause';state.timer=setInterval(()=>{if(state.index>=state.filtered.length-1){stop();return;}state.index++;renderAll();},Math.max(50,650/state.speed));}
  function updateMode(){document.body.classList.toggle('compact',els.displayMode.value==='compact');const url=new URL(location.href);url.searchParams.set('mode',els.displayMode.value);history.replaceState({},'',url);}

  function compactExample() {
    const routes=[[.62,.18,.08,.07,.05],[.55,.22,.09,.08,.06],[.42,.31,.11,.09,.07],[.28,.45,.12,.08,.07],[.20,.49,.15,.09,.07],[.18,.40,.25,.10,.07],[.15,.33,.34,.11,.07],[.13,.29,.40,.11,.07]];
    return {
      manifest:{schema_version:'mmals-replay-bundle-v1',bundle_profile:'compact',run_id:'v020-contract-demo',project:'MMALS',experiment:'replay_contract_demo',experiment_version:'v0.2.0',domain_pack:'route-function',source:{repository:'mmals-activity-replay',commit:'example-only',notebook:'none'},dataset:{name:'synthetic',protocol:'contract demonstration'},available_lenses:['balanced','performance','stability','ecology','efficiency'],provenance:{status:'synthetic',note:'UI and contract example only; not experimental evidence.'}},
      events:routes.map((r,i)=>({step:i,activity:i<6?'train':'audit',phase:i<6?'checkpoint':'inference',event_type:'route_checkpoint',model:'contract_demo',seed:'0',task_id:Math.floor(i/2),epoch:i,objective_id:'not_logged',route:r,regime:i<2?'simple':i<6?'ambiguous':'stable',metrics:{accuracy:.72+i*.028,loss:.82-i*.075,route_drift:i?0.025+i*.008:0,latent_drift:i?0.041+i*.012:0,output_drift:i?0.018+i*.005:0,mutualistic_gain:.32+i*.04,carbon_cost:.54-i*.035},provenance:{route:'observed',metrics:'derived',source_file:'embedded compact example'},note:'Synthetic v0.2.0 contract demonstration.'}))
    };
  }

  function exportCompact() {
    if(!state.manifest||!state.filtered.length)return;
    const payload={manifest:{...state.manifest,bundle_profile:'compact',derived_from:state.manifest.run_id},events:state.filtered.map((e,i)=>i%Math.max(1,Math.ceil(state.filtered.length/80))===0?e:null).filter(Boolean)};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${state.manifest.run_id}.compact.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  els.demoBtn.addEventListener('click',()=>loadHostedManifest('bundles/route-function-v09-compat/run_manifest.json').catch(err=>{console.error(err);setStatus(`Hosted v0.9 data unavailable (${err.message}); loaded compact contract demo instead.`);const d=compactExample();loadRun(d.manifest,d.events);}));
  els.compactDemoBtn.addEventListener('click',()=>{const d=compactExample();loadRun(d.manifest,d.events);});
  els.bundleInput.addEventListener('change',async e=>{try{await loadBundleFiles(e.target.files);}catch(err){setStatus(`Bundle error: ${err.message}`);console.error(err);}});
  els.compactInput.addEventListener('change',async e=>{try{const obj=JSON.parse(await e.target.files[0].text());loadRun(obj.manifest||obj.run_manifest,(obj.events||[]).map(canonicalEvent));}catch(err){setStatus(`Compact replay error: ${err.message}`);}});
  els.csvInput.addEventListener('change',async e=>{try{const map=await readFiles(e.target.files);const rows=new Map([...map].map(([n,t])=>[n,parseCSV(t)]));const adapted=adaptLegacyCSVs(rows);loadRun(adapted.manifest,adapted.events);}catch(err){setStatus(`CSV error: ${err.message}`);}});
  [els.activityMode,els.modelSelect,els.seedSelect].forEach(el=>el.addEventListener('change',()=>{applyFilters();renderAll();}));
  [els.lensSelect,els.domainSelect].forEach(el=>el.addEventListener('change',renderAll));
  els.displayMode.addEventListener('change',updateMode);els.playBtn.addEventListener('click',play);els.stepBtn.addEventListener('click',()=>{stop();state.index=(state.index+1)%Math.max(1,state.filtered.length);renderAll();});
  els.pinBtn.addEventListener('click',()=>{state.pinned=current()?JSON.parse(JSON.stringify(current())):null;renderAll();});
  els.timeSlider.addEventListener('input',()=>{stop();state.index=safeNumber(els.timeSlider.value,0);renderAll();});
  els.speedSlider.addEventListener('input',()=>{state.speed=safeNumber(els.speedSlider.value,1);els.speedReadout.textContent=`${state.speed.toFixed(2)}×`;if(state.playing){stop();play();}});
  els.exportCompactBtn.addEventListener('click',exportCompact);

  const params=new URLSearchParams(location.search);if(params.get('mode')==='compact'){els.displayMode.value='compact';updateMode();}
  const d=compactExample();loadRun(d.manifest,d.events);
})();
