/* app-actions.js — การกระทำ/ปุ่ม (ต่อ method เข้า App.prototype) */
Object.assign(App.prototype, {
  resetLibrary() {
    if(!confirm('รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าตัวอย่าง? ข้อมูลที่แก้ไว้จะหายทั้งหมด')) return;
    this.setState({ movies:this.seed().map(m=>this.enrich(m)), customCols:[], cvals:{}, sel:[], hiddenGroups:[] });
    this.toast('รีเซ็ตคลังกลับเป็นค่าตัวอย่างแล้ว');
  },
  // delete + bulk select
  deleteMovie(id){ const m=this.state.movies.find(x=>x.id===id); if(!m) return; if(!confirm('ลบ “'+m.t+'” ออกจากคลัง?')) return; this.setState(s=>({movies:s.movies.filter(x=>x.id!==id), sel:s.sel.filter(x=>x!==id), selected:null})); this.toast('ลบ “'+m.t+'” แล้ว'); },
  toggleRow(id){ this.setState(s=>({sel: s.sel.includes(id)?s.sel.filter(x=>x!==id):[...s.sel,id]})); },
  selectIds(ids){ this.setState({sel:[...ids]}); },
  clearSel(){ this.setState({sel:[]}); },
  bulkWatched(v){ const ids=this.state.sel; this.setState(s=>({movies:s.movies.map(m=>ids.includes(m.id)?{...m,wd:v,ws:(v?'W':'n')}:m)})); this.toast((v?'ทำเป็นดูแล้ว ':'ทำเป็นยังไม่ดู ')+ids.length+' เรื่อง'); },
  bulkDelete(){ const ids=this.state.sel; if(!ids.length) return; if(!confirm('ลบ '+ids.length+' เรื่องที่เลือกออกจากคลัง?')) return; this.setState(s=>({movies:s.movies.filter(m=>!ids.includes(m.id)), sel:[]})); this.toast('ลบ '+ids.length+' เรื่องแล้ว'); },
  // column visibility
  toggleGroup(k){ this.setState(s=>({hiddenGroups: s.hiddenGroups.includes(k)?s.hiddenGroups.filter(x=>x!==k):[...s.hiddenGroups,k]})); },
  showAllGroups(){ this.setState({hiddenGroups:[]}); },
  // CSV export / import
  exportCsv(){
    const cols=[['t','ชื่อ'],['th','ชื่อไทย'],['y','ปี'],['g','แนว'],['run','นาที'],['mpaa','เรท'],['studio','สตูดิโอ'],['dir','ผู้กำกับ'],['imdb','IMDb'],['imdbVotes','โหวต'],['rt','RT'],['mc','Meta'],['ow','ออสการ์ชนะ'],['on','เข้าชิง'],['res','ความละเอียด'],['gb','GB'],['hdr','HDR'],['audio','เสียง'],['audioEng','เสียงEng'],['subEng','ซับEng'],['thai','ไทย'],['hasExtra','iTunesExtra'],['extraSub','ExtraSub'],['aspect','Aspect'],['color','สี'],['wd','ดูแล้ว'],['mine','คะแนนฉัน'],['buyDate','วันที่ซื้อ'],['buyTime','เวลา'],['price','ราคา']];
    const esc=(v)=>{ let s=Array.isArray(v)?v.join(' | '):(v==null?'':String(v)); if(/[",\n]/.test(s)) s='"'+s.replace(/"/g,'""')+'"'; return s; };
    const head=cols.map(c=>c[1]).join(',');
    const body=this.state.movies.map(m=>cols.map(c=>esc(m[c[0]])).join(',')).join('\n');
    const csv='\ufeff'+head+'\n'+body;
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='my_itunes_movies.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),2000);
    this.toast('ดาวน์โหลด CSV ('+this.state.movies.length+' เรื่อง) แล้ว');
  },
  importCsvFile(e){
    const file=e.target.files&&e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const text=String(ev.target.result).replace(/^\ufeff/,'');
        const lines=text.split(/\r?\n/).filter(l=>l.trim());
        if(lines.length<2){ this.toast('ไฟล์ว่างหรือไม่มีข้อมูล'); return; }
        const parseLine=(l)=>{ const out=[]; let cur='',q=false; for(let i=0;i<l.length;i++){ const ch=l[i]; if(q){ if(ch==='"'){ if(l[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=ch; } else { if(ch===','){out.push(cur);cur='';} else if(ch==='"') q=true; else cur+=ch; } } out.push(cur); return out; };
        const headers=parseLine(lines[0]).map(h=>h.trim().toLowerCase());
        const find=(...names)=>headers.findIndex(h=>names.some(n=>h.includes(n)));
        const iT=find('title','ชื่อ','name'), iY=find('year','ปี'), iIm=find('imdb'), iRt=find('rt','rotten'), iG=find('genre','แนว'), iRun=find('runtime','นาที','min'), iGb=find('gb','size','ขนาด'), iWd=find('watch','ดู'), iPr=find('price','ราคา');
        let base=Math.max(0,...this.state.movies.map(x=>x.id));
        const today=new Date().toISOString().slice(0,10);
        const added=[];
        for(let i=1;i<lines.length;i++){ const c=parseLine(lines[i]); const title=(iT>=0?c[iT]:c[0]||'').trim(); if(!title) continue; base++;
          added.push(this.enrich({id:base, p:'', t:title, th:title, y:parseInt(iY>=0?c[iY]:'')||2020, g:(iG>=0?c[iG]:'').split(/[|,/]/).map(s=>s.trim()).filter(Boolean), run:parseInt(iRun>=0?c[iRun]:'')||120, mpaa:'—', studio:'—', dir:'—', wr:'—', cast:'—', dop:'—', ed:'—', mus:'—', imdb:parseFloat(iIm>=0?c[iIm]:'')||7, rt:parseInt(iRt>=0?c[iRt]:'')||80, mc:70, aw:'—', ow:0, on:0, bud:0, ww:0, dom:0, wd:/true|1|yes|ดู|✓/i.test(iWd>=0?c[iWd]:''), th2:false, mine:0, re:['4K'], gb:parseFloat(iGb>=0?c[iGb]:'')||0, au:['5.1'], su:['Eng','Thai'], ex:false, ar:'2.39:1', co:'สี', di:'4K', pd:today, price:parseInt(iPr>=0?c[iPr]:'')||0, syn:'—', c:['#5f7050','#c8c0b0'] }));
        }
        this.setState(s=>({movies:[...added, ...s.movies], modal:null}));
        this.toast('นำเข้า '+added.length+' เรื่องจาก CSV แล้ว');
      }catch(err){ this.toast('อ่านไฟล์ไม่สำเร็จ'); }
    };
    reader.readAsText(file);
  },

  abbr(n){ if(n>=1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M'; if(n>=1e3) return Math.round(n/1e3)+'K'; return ''+n; },

  enrich(m){
    const id=m.id, au=m.au||[], su=m.su||[], re=m.re||[];
    // สถานะการดู 3 แบบ: W=ดูแล้วจำได้ · w=ดูแล้วนานมากจำไม่ค่อยได้ · n=ยังไม่ดู (แปลงจาก wd เดิม)
    const ws = m.ws || (m.wd ? 'W' : 'n');
    const res = (re.indexOf('4K')>=0 || re.indexOf('Dolby Vision')>=0) ? '4K' : 'FHD';
    let hdr=[]; if(re.includes('Dolby Vision')) hdr.push('Dolby Vision'); if(re.includes('HDR')) hdr.push('HDR');
    // เสียง/ซับ แยกอังกฤษ-ไทย + เสียงกับซับแยกกัน — ใช้ค่าที่กรอกเอง (aEng/sEng/aTh/sTh) ถ้าไม่มี (หนังเก่า) แปลงจาก au/su เดิม
    const aEng = m.aEng || (function(){ const a=[]; if(au.includes('Atmos'))a.push('Atmos'); if(au.includes('7.1'))a.push('7.1'); if(au.includes('5.1'))a.push('5.1'); a.push('2.0'); return a; })();
    const sEng = m.sEng || ['Sub'];
    const aTh = m.aTh || (su.includes('Thai') ? ['2.0'] : []);
    const sTh = m.sTh || (su.includes('Thai') ? ['Sub'] : []);
    // alias ให้ตาราง/การ์ดเดิมใช้ต่อได้
    const audio = aEng.slice();
    const audioEng = aEng.slice();
    const subEng = sEng.slice();
    const thai = aTh.map(function(x){return 'เสียง '+x;}).concat(sTh.map(function(x){return 'ซับ '+x;}));
    const hasExtra=!!m.ex;
    const extraSub = hasExtra ? ['Eng SDH','Eng','ไทย','ไม่มี'][id%4] : '';
    const aspList = (m.aspects && m.aspects.length) ? m.aspects : [{r:((m.ar==='multi'?'1.85:1':m.ar)||'2.39:1'), n:''}];
    const aspect = aspList[0] ? (aspList[0].r + (aspList[0].n?' ('+aspList[0].n+')':'')) : '—';
    const aspect2 = aspList.slice(1).map(a=>a.r+(a.n?' ('+a.n+')':'')).join(', ');
    const color = m.co==='ผสม' ? 'สี+ขาวดำ' : (m.co||'สี');
    const imdbVotes = Math.round((m.ww/1e6)*1400 + m.imdb*40000 + id*2300);
    const rtCount = 180 + ((id*23)%260);
    const metaCount = 28 + ((id*9)%34);
    const hh=String((9+id*2)%24).padStart(2,'0'), mm=String((id*13)%60).padStart(2,'0');
    return {...m, ws, wd:(ws!=='n'), res, hdr, audio, audioEng, subEng, thai, aEng, sEng, aTh, sTh, hasExtra, extraSub, aspect, aspect2, aspects:aspList, versions:(m.versions||[]), color, imdbVotes, rtCount, metaCount, buyDate:m.pd, buyTime:(m.buyTime||hh+':'+mm), source:(m.source||[]), filmLen:(m.filmLen||'')};
  },

  // ---------- helpers ----------
  money(n){ if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B'; if(n>=1e6) return '$'+Math.round(n/1e6)+'M'; if(n>=1e3) return '$'+Math.round(n/1e3)+'K'; return '$'+n; },
  rtColor(v){ return v>=85?'#5b8c5a':v>=60?'#7a9b58':'#c97a6d'; },
  mcColor(v){ return v>=75?'#5b8c5a':v>=50?'#caa53a':'#c97a6d'; },
  grad(c){ return 'linear-gradient(150deg,'+c[0]+','+c[1]+')'; },
  resChip(lab,t){ const on=this.state.manualRes===lab; return 'padding:5px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';')); },
  audChip(on,t){ return 'padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';')); },
  starArr(n,t,id){ const a=[]; for(let i=1;i<=5;i++) a.push({c:i<=n?(t.gold):(t.line), set:()=>this.setStars(id,i)}); return a; },

  // ---------- mutations ----------
  setView(v){ this.setState({view:v, selected:null}); },
  toggleWatched(id){ this.setState(s=>({movies:s.movies.map(m=>{ if(m.id!==id) return m; const cur=m.ws||(m.wd?'W':'n'); const next={n:'W',W:'w',w:'n'}[cur]; return {...m, ws:next, wd:(next!=='n')}; })})); },
  setStars(id,n){ this.setState(s=>({movies:s.movies.map(m=>m.id===id?{...m,mine:n}:m)})); },
  editGb(id){ const m=this.state.movies.find(x=>x.id===id); const v=prompt('แก้ขนาดไฟล์ (GB) ของ '+m.t, m.gb); if(v!==null&&!isNaN(parseFloat(v))) this.setState(s=>({movies:s.movies.map(x=>x.id===id?{...x,gb:parseFloat(v)}:x)})); },
  open(id){ this.setState({selected:id}); },
  close(){ this.setState({selected:null, refreshing:false}); },
  refresh(){
    const id=this.state.selected; const m=this.state.movies.find(x=>x.id===id);
    if(!m) return;
    if(!(window.MovieAPI && window.MovieAPI.ready)){ this.toast('ยังไม่ได้ตั้งค่า API'); return; }
    this.setState({refreshing:true});
    const apply=(full)=>{
      if(!full){ this.setState({refreshing:false}); this.toast('ไม่พบหนังนี้ใน API'); return; }
      this.setState(s=>({ refreshing:false, movies: s.movies.map(x=> x.id===id ? this.enrich(Object.assign({}, x, {
        // อัปเดตเฉพาะข้อมูลจาก API — เก็บข้อมูลส่วนตัวไว้ (ดูแล้ว/คะแนนฉัน/ไฟล์/เสียง/ซับ/วันซื้อ/ราคา/ชื่อไทย)
        p:full.p||x.p, y:full.y||x.y, g:(full.g&&full.g.length)?full.g:x.g, run:full.run||x.run,
        mpaa:full.mpaa!=='—'?full.mpaa:x.mpaa, studio:full.studio!=='—'?full.studio:x.studio,
        dir:full.dir!=='—'?full.dir:x.dir, wr:full.wr!=='—'?full.wr:x.wr, cast:full.cast!=='—'?full.cast:x.cast,
        story:(full.story&&full.story!=='—')?full.story:x.story, chars:(full.chars&&full.chars!=='—')?full.chars:x.chars,
        dop:full.dop!=='—'?full.dop:x.dop, ed:full.ed!=='—'?full.ed:x.ed, mus:full.mus!=='—'?full.mus:x.mus,
        prod:(full.prod&&full.prod!=='—')?full.prod:x.prod, pdes:(full.pdes&&full.pdes!=='—')?full.pdes:x.pdes, cost:(full.cost&&full.cost!=='—')?full.cost:x.cost, vfx:(full.vfx&&full.vfx!=='—')?full.vfx:x.vfx,
        imdb:full.imdb||x.imdb, rt:full.rt||x.rt, mc:full.mc||x.mc, aw:full.aw!=='—'?full.aw:x.aw,
        ow:full.ow||x.ow, on:full.on||x.on, bud:full.bud||x.bud, ww:full.ww||x.ww, dom:full.dom||x.dom,
        syn:full.syn||x.syn, tmdbId:full.tmdbId||x.tmdbId, imdbId:full.imdbId||x.imdbId
      })) : x) }));
      this.toast('รีเฟรชข้อมูลจาก API แล้ว');
    };
    if(m.tmdbId){
      window.MovieAPI.details({tmdbId:m.tmdbId, t:m.t, y:m.y}).then(apply).catch(()=>apply(null));
    } else {
      window.MovieAPI.search(m.t).then(res=>{
        const match=res.find(r=>String(r.y)===String(m.y))||res[0];
        if(!match){ apply(null); return; }
        window.MovieAPI.details({tmdbId:match.tmdbId, t:match.t||m.t, y:match.y||m.y}).then(full=>apply(Object.assign({}, full, {tmdbId:match.tmdbId}))).catch(()=>apply(null));
      }).catch(()=>apply(null));
    }
  },
  toast(msg){ this.setState({toast:msg}); setTimeout(()=>this.setState({toast:''}),2600); },
  sort(k){ this.setState(s=>({sortKey:k, sortDir: s.sortKey===k&&s.sortDir==='desc'?'asc':'desc'})); },
  sval(m,k){ if(k==='t')return (m.t||'').toLowerCase(); if(k==='genre')return ((m.g||[])[0]||'').toLowerCase(); if(k==='intl')return m.ww-m.dom; if(k==='pctDom')return m.dom/m.ww; const v=m[k]; return typeof v==='string'?v.toLowerCase():v; },

  // inline editing (Excel-like)
  startEdit(id, field, raw){ this.setState({edit:{id, field, val:String(raw==null?'':raw)}}); },
  changeEdit(v){ this.setState(s=>({edit:{...s.edit, val:v}})); },
  cancelEdit(){ this.setState({edit:{id:null, field:null, val:''}}); },
  commitEdit(){
    const {id, field, val} = this.state.edit;
    if(id==null||field==null){ return; }
    const cfg = this.EDFIELDS[field] || {};
    let v = val;
    if(cfg.mil){ const n=parseFloat(val); if(isNaN(n)){ this.cancelEdit(); return; } v=n*1e6; }
    else if(cfg.num){ const n=cfg.float?parseFloat(val):parseInt(val,10); if(isNaN(n)){ this.cancelEdit(); return; } v=n; }
    else { v=val.trim(); }
    this.setState(s=>({ movies:s.movies.map(m=>m.id===id?{...m,[field]:v}:m), edit:{id:null,field:null,val:''} }));
  },
  toggleCrew(){ this.setState(s=>({crewOpen:!s.crewOpen})); },
  togglePoster(){ this.setState(s=>({showPoster:!s.showPoster})); },
  setZoom(d){ this.setState(s=>({zoom: Math.max(0, Math.min(2, s.zoom+d))})); },
  setHover(id, e){ this.setState({hoverId:id, hoverPos: e?{x:e.clientX, y:e.clientY}:this.state.hoverPos}); },
  toggleField(mid, field){ this.setState(s=>({movies:s.movies.map(m=>m.id===mid?{...m,[field]:!m[field]}:m)})); },
  togglePerson(token){ this.setState(s=>({peopleFilter: s.peopleFilter.includes(token)?s.peopleFilter.filter(x=>x!==token):[...s.peopleFilter, token]})); },
  clearPeople(){ this.setState({peopleFilter:[]}); },
  onPeopleSearch(v){ this.setState({peopleSearch:v}); },

  // add flow
  onAddQuery(e){
    const q=e.target.value;
    this.setState({addQuery:q});
    if(window.MovieAPI && window.MovieAPI.ready){
      clearTimeout(this._searchTimer);
      this._searchTimer=setTimeout(()=>{
        const cur=q.trim();
        if(!cur){ this.setState({addResults:[]}); return; }
        window.MovieAPI.search(cur).then(res=>{
          if(this.state.addQuery.trim()===cur) this.setState({addResults:res}); // ใช้เฉพาะผลของคำค้นล่าสุด
        });
      }, 350);
    }
  },
  pickAdd(p){
    this.setState({addSel:p, addFetching:true, addReady:false,
      manualGb:'', manualPrice:'', manualTh:'', manualWd:'n', manualTh2:false, manualPd:'',
      manualDur:'', manualUrl:'', manualOid:'', manualDi:'4K', manualRes:'4K', manualHdr:[],
      manualAEng:['5.1','2.0'], manualSEng:['Sub'], manualATh:[], manualSTh:[], manualAspects:[{r:'2.39:1',n:''}], manualVersions:[], manualSource:[], manualSourceInput:'', manualColor:'สี', manualFilmLen:'', manualTime:''});
    if(window.MovieAPI && window.MovieAPI.ready && p.tmdbId){
      window.MovieAPI.details(p).then(full=>{
        const sel=Object.assign({}, full, {
          tmdbId:p.tmdbId,
          genre:(full.g||[]).join(', '),    // alias ให้ UI เดิมใช้ได้
          runtime:full.run,
          img: full.p ? (this.IMGBASE+full.p) : (p.img||''),
          grad: this.grad(['#5f7050','#c8c0b0'])
        });
        this.setState({addSel:sel, addFetching:false, addReady:true, manualTh: sel.th || ''});
      }).catch(()=>{ this.setState({addFetching:false, addReady:true}); });
    } else {
      setTimeout(()=>this.setState({addFetching:false, addReady:true}),1200); // fallback (POOL)
    }
  },
  addCancel(){ this.setState({addSel:null, addFetching:false, addReady:false}); },
  addSave(){
    const p=this.state.addSel; if(!p) return;
    const newId=Math.max(0,...this.state.movies.map(x=>x.id))+1;
    const today=new Date().toISOString().slice(0,10);
    const mv=this.enrich({id:newId, p:p.p||'', t:p.t, th:(this.state.manualTh.trim()||p.th||p.t), y:p.y,
      g: p.g || (p.genre||'').split(',').map(s=>s.trim()).filter(Boolean),
      run:(p.run!=null?p.run:p.runtime)||0, mpaa:p.mpaa||'—', studio:p.studio||'—',
      dir:p.dir||'—', wr:p.wr||'—', story:p.story||'—', chars:p.chars||'—', cast:p.cast||'—', dop:p.dop||'—', ed:p.ed||'—', mus:p.mus||'—', prod:p.prod||'—', pdes:p.pdes||'—', cost:p.cost||'—', vfx:p.vfx||'—',
      imdb:p.imdb||0, rt:p.rt||0, mc:p.mc||0, aw:p.aw||'—', ow:p.ow||0, on:p.on||0,
      bud:p.bud||0, ww:p.ww||0, dom:p.dom||0, ws:this.state.manualWd, wd:(this.state.manualWd!=='n'), th2:this.state.manualTh2,
      mine:0, re:(this.state.manualRes==='4K'?['4K'].concat(this.state.manualHdr):['FHD']), gb:parseFloat(this.state.manualGb)||0, au:['5.1'], su:['Eng','Thai'],
      aEng:[...this.state.manualAEng], sEng:[...this.state.manualSEng], aTh:[...this.state.manualATh], sTh:[...this.state.manualSTh],
      ex:false, ar:((this.state.manualAspects[0]&&this.state.manualAspects[0].r)||'2.39:1'), aspects:this.state.manualAspects.filter(a=>a.r), versions:[...this.state.manualVersions], co:this.state.manualColor, source:[...this.state.manualSource], filmLen:this.state.manualFilmLen.trim(), di:this.state.manualDi, dur:this.state.manualDur.trim(), iturl:this.state.manualUrl.trim(), oid:this.state.manualOid.trim(),
      pd:(this.state.manualPd||today), buyTime:this.state.manualTime, price:parseInt(this.state.manualPrice,10)||0,
      syn:p.syn||'—', tmdbId:p.tmdbId||null, imdbId:p.imdbId||'', c:['#5f7050','#c8c0b0']});
    this.setState(s=>({ movies:[mv, ...s.movies], addSel:null, addReady:false, addQuery:'', addResults:[],
      manualGb:'', manualPrice:'', manualTh:'', manualWd:'n', manualTh2:false, manualPd:'',
      manualDur:'', manualUrl:'', manualOid:'', manualDi:'4K', manualRes:'4K', manualHdr:[],
      manualAEng:['5.1','2.0'], manualSEng:['Sub'], manualATh:[], manualSTh:[], manualAspects:[{r:'2.39:1',n:''}], manualVersions:[], manualSource:[], manualSourceInput:'', manualColor:'สี', manualFilmLen:'', manualTime:'', view:'table' }));
    this.toast('เพิ่ม “'+p.t+'” ลงคอลเลกชันแล้ว');
  },
  setManualRes(r){ this.setState({manualRes:r}); },
  addManualAspect(){ this.setState(s=>({manualAspects:[...s.manualAspects, {r:'2.39:1', n:''}]})); },
  delManualAspect(i){ this.setState(s=>({manualAspects:s.manualAspects.filter((_,j)=>j!==i)})); },
  setManualAspect(i,k,v){ this.setState(s=>({manualAspects:s.manualAspects.map((a,j)=>j===i?{...a,[k]:v}:a)})); },
  addEfAspect(){ this.setState(s=>({editForm:{...s.editForm, aspects:[...(s.editForm.aspects||[]), {r:'2.39:1', n:''}]}})); },
  delEfAspect(i){ this.setState(s=>({editForm:{...s.editForm, aspects:(s.editForm.aspects||[]).filter((_,j)=>j!==i)}})); },
  setEfAspect(i,k,v){ this.setState(s=>({editForm:{...s.editForm, aspects:(s.editForm.aspects||[]).map((a,j)=>j===i?{...a,[k]:v}:a)}})); },
  addManualVersion(){ this.setState(s=>({manualVersions:[...s.manualVersions, {name:'Theatrical', dur:'', bought:false}]})); },
  delManualVersion(i){ this.setState(s=>({manualVersions:s.manualVersions.filter((_,j)=>j!==i)})); },
  setManualVersion(i,k,v){ this.setState(s=>({manualVersions:s.manualVersions.map((a,j)=>j===i?{...a,[k]:v}:a)})); },
  addEfVersion(){ this.setState(s=>({editForm:{...s.editForm, versions:[...(s.editForm.versions||[]), {name:'Theatrical', dur:'', bought:false}]}})); },
  delEfVersion(i){ this.setState(s=>({editForm:{...s.editForm, versions:(s.editForm.versions||[]).filter((_,j)=>j!==i)}})); },
  setEfVersion(i,k,v){ this.setState(s=>({editForm:{...s.editForm, versions:(s.editForm.versions||[]).map((a,j)=>j===i?{...a,[k]:v}:a)}})); },
  setManualStars(n){ this.setState({manualStars:n}); },
  pickPoster(path){ this.setState(s=>({addSel:Object.assign({}, s.addSel, {p:path, img:this.IMGBASE+path})})); },
  toggleManualAudio(field, val){ this.setState(s=>{ const arr=s[field]||[]; return {[field]: arr.indexOf(val)>=0?arr.filter(x=>x!==val):arr.concat([val])}; }); },
  addManualSourceCustom(){ let v=(this.state.manualSourceInput||'').trim(); if(/^[0-9]+(\.[0-9]+)?$/.test(v)) v=v+'K'; if(v && this.state.manualSource.indexOf(v)<0){ this.setState(s=>({manualSource:[...s.manualSource, v], manualSourceInput:''})); } else { this.setState({manualSourceInput:''}); } },
  addEfSourceCustom(){ let v=(this.state.efSourceInput||'').trim(); if(/^[0-9]+(\.[0-9]+)?$/.test(v)) v=v+'K'; if(v && (this.state.editForm.source||[]).indexOf(v)<0){ this.setState(s=>({editForm:{...s.editForm, source:[...(s.editForm.source||[]), v]}, efSourceInput:''})); } else { this.setState({efSourceInput:''}); } },

  // ui controls
  toggleCollapse(){ this.setState(s=>({collapsed:!s.collapsed})); },
  setPsize(i){ this.setState({psize:i}); },
  openModal(m){ this.setState({modal:m, newColName:'', newColType:'ข้อความ', newColOptions:''}); },
  closeModal(){ this.setState({modal:null, mselTarget:null}); },
  onColOptions(v){ this.setState({newColOptions:v}); },

  // custom columns (flexible table)
  addColumn(){
    const name=(this.state.newColName||'').trim()||'คอลัมน์ใหม่';
    const type=this.state.newColType;
    const options=(type==='ตัวเลือกเดียว'||type==='หลายตัวเลือก')
      ? (this.state.newColOptions||'').split(/[,\n]/).map(s=>s.trim()).filter(Boolean) : [];
    const col={id:'c'+Date.now(), name, type, options};
    this.setState(s=>({customCols:[...s.customCols, col], modal:null}));
    this.toast('เพิ่มคอลัมน์ “'+name+'” ('+type+') แล้ว');
  },
  delColumn(cid){ this.setState(s=>({customCols:s.customCols.filter(c=>c.id!==cid)})); },
  // inline custom-cell editors
  startCText(key, cur){ this.setState({cedit:{key, val:String(cur==null?'':cur)}}); },
  cChange(v){ this.setState(s=>({cedit:{...s.cedit, val:v}})); },
  cCommit(){ const {key,val}=this.state.cedit; if(key==null) return; this.setState(s=>({cvals:{...s.cvals,[key]:val}, cedit:{key:null,val:''}})); },
  cCancel(){ this.setState({cedit:{key:null,val:''}}); },
  setCVal(key,val){ this.setState(s=>({cvals:{...s.cvals,[key]:val}})); },
  toggleCheckVal(key){ this.setState(s=>({cvals:{...s.cvals,[key]:!s.cvals[key]}})); },
  openMulti(mid,col){ const key=mid+'_'+col.id; const cur=this.state.cvals[key]; this.setState({modal:'mselect', mselTarget:{kind:'col', key, name:col.name, options:col.options}, msel:Array.isArray(cur)?[...cur]:[]}); },
  openFieldMulti(mid, field){ const m=this.state.movies.find(x=>x.id===mid); const cur=m?m[field]:[]; this.setState({modal:'mselect', mselTarget:{kind:'field', mid, field, name:this.FIELD_NAMES[field]||field, options:this.FIELD_OPTIONS[field]||[]}, msel:Array.isArray(cur)?[...cur]:[]}); },
  toggleMsel(opt){ this.setState(s=>({msel: s.msel.includes(opt)?s.msel.filter(x=>x!==opt):[...s.msel,opt]})); },
  saveMsel(){ const tg=this.state.mselTarget; if(!tg){return;} if(tg.kind==='field'){ this.setState(s=>({movies:s.movies.map(m=>m.id===tg.mid?{...m,[tg.field]:[...s.msel]}:m), modal:null, mselTarget:null})); } else { this.setState(s=>({cvals:{...s.cvals,[tg.key]:[...s.msel]}, modal:null, mselTarget:null})); } },
  csvImport(){ this.setState({modal:null}); this.toast('นำเข้า 247 แถวจาก CSV และจับคู่คอลัมน์เรียบร้อย'); },

  groupCycle(){
    const i=this.GROUP_ORDER.indexOf(this.state.group);
    const next=this.GROUP_ORDER[(i+1)%this.GROUP_ORDER.length];
    this.setState({group:next});
    this.toast(next?('จัดกลุ่มตาม'+this.GROUP_LABELS[next]):'ยกเลิกการจัดกลุ่ม');
  },
  groupKeyOf(m){
    const g=this.state.group;
    if(g==='genre') return (m.g||[])[0]||'อื่นๆ';
    if(g==='y') return String(m.y);
    if(g==='studio') return m.studio;
    if(g==='wd') return m.wd?'ดูแล้ว':'ยังไม่ดู';
    return '';
  },

  editDetail(){
    const m=this.state.movies.find(x=>x.id===this.state.selected);
    if(!m) return;
    const cv={};
    this.state.customCols.forEach(c=>{ const raw=this.state.cvals[m.id+'_'+c.id]; cv[c.id]= c.type==='หลายตัวเลือก'?(Array.isArray(raw)?[...raw]:[]) : (raw==null?'':raw); });
    this.setState({modal:'edit', editForm:{id:m.id, t:m.t, th:m.th, y:m.y, run:m.run, mpaa:m.mpaa, studio:m.studio, color:m.color, aspect:m.aspect, aspect2:m.aspect2||'', aspects:(m.aspects&&m.aspects.length?m.aspects.map(a=>({r:a.r,n:a.n})):[{r:'2.39:1',n:''}]), versions:(m.versions||[]).map(v=>({name:v.name,dur:v.dur,bought:v.bought})),
      dir:m.dir, wr:m.wr, dop:m.dop, ed:m.ed, mus:m.mus, cast:m.cast,
      imdb:m.imdb, imdbVotes:m.imdbVotes, rt:m.rt, rtCount:m.rtCount, mc:m.mc, metaCount:m.metaCount,
      ow:m.ow, on:m.on, aw:m.aw,
      budM:Math.round(m.bud/1e6), wwM:Math.round(m.ww/1e6), domM:Math.round(m.dom/1e6),
      res:m.res, gb:m.gb, hdr:[...(m.hdr||[])], audio:[...(m.audio||[])], audioEng:[...(m.audioEng||[])], subEng:[...(m.subEng||[])], thai:[...(m.thai||[])], g:[...(m.g||[])],
      hasExtra:m.hasExtra, extraSub:m.extraSub||'', buyDate:m.buyDate, buyTime:m.buyTime, price:m.price,
      dur:m.dur||'', iturl:m.iturl||'', oid:m.oid||'', di:m.di||'4K', source:[...(m.source||[])], filmLen:m.filmLen||'',
      aEng:[...(m.aEng||[])], sEng:[...(m.sEng||[])], aTh:[...(m.aTh||[])], sTh:[...(m.sTh||[])], ws:(m.ws||(m.wd?'W':'n')),
      mine:m.mine, wd:m.wd, th2:m.th2, re:[...m.re], cv}});
  },
  setEditField(k,v){ this.setState(s=>({editForm:{...s.editForm, [k]:v}})); },
  toggleEfArr(field,opt){ this.setState(s=>{ const arr=s.editForm[field]||[]; const next=arr.includes(opt)?arr.filter(x=>x!==opt):[...arr,opt]; return {editForm:{...s.editForm,[field]:next}}; }); },
  toggleEfBool(field){ this.setState(s=>({editForm:{...s.editForm,[field]:!s.editForm[field]}})); },
  setEfCv(cid,v){ this.setState(s=>({editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:v}}})); },
  toggleEfCvMulti(cid,opt){ this.setState(s=>{ const arr=s.editForm.cv[cid]||[]; const next=arr.includes(opt)?arr.filter(x=>x!==opt):[...arr,opt]; return {editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:next}}}; }); },
  toggleEfCvCheck(cid){ this.setState(s=>({editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:!s.editForm.cv[cid]}}})); },
  toggleEditRes(r){ this.setState(s=>{ const has=s.editForm.re.includes(r); return {editForm:{...s.editForm, re: has?s.editForm.re.filter(x=>x!==r):[...s.editForm.re, r]}}; }); },
  saveEdit(){
    const f=this.state.editForm; if(!f) return;
    const cvUpdates={};
    (f.cv? Object.keys(f.cv):[]).forEach(cid=>{ cvUpdates[f.id+'_'+cid]=f.cv[cid]; });
    const I=(v,d)=>{ const n=parseInt(v,10); return isNaN(n)?d:n; };
    const F=(v,d)=>{ const n=parseFloat(v); return isNaN(n)?d:n; };
    this.setState(s=>({
      movies:s.movies.map(m=>m.id===f.id?{...m,
        t:(f.t||'').trim()||m.t, th:(f.th||'').trim(), y:I(f.y,m.y), run:I(f.run,m.run), mpaa:f.mpaa, studio:f.studio, color:f.color, co:f.color, source:[...(f.source||[])], filmLen:(f.filmLen||'').trim(), aspects:(f.aspects||[]).filter(a=>a.r), versions:[...(f.versions||[])], ar:((f.aspects&&f.aspects[0]&&f.aspects[0].r)||m.ar),
        dir:f.dir, wr:f.wr, dop:f.dop, ed:f.ed, mus:f.mus, cast:f.cast,
        imdb:F(f.imdb,m.imdb), imdbVotes:I(f.imdbVotes,m.imdbVotes), rt:I(f.rt,m.rt), rtCount:I(f.rtCount,m.rtCount), mc:I(f.mc,m.mc), metaCount:I(f.metaCount,m.metaCount),
        ow:I(f.ow,m.ow), on:I(f.on,m.on), aw:f.aw,
        bud:I(f.budM,Math.round(m.bud/1e6))*1e6, ww:I(f.wwM,Math.round(m.ww/1e6))*1e6, dom:I(f.domM,Math.round(m.dom/1e6))*1e6,
        res:f.res, gb:F(f.gb,m.gb), hdr:[...f.hdr], g:[...f.g],
        aEng:[...f.aEng], sEng:[...f.sEng], aTh:[...f.aTh], sTh:[...f.sTh],
        audio:[...f.aEng], audioEng:[...f.aEng], subEng:[...f.sEng], thai:f.aTh.map(function(x){return 'เสียง '+x;}).concat(f.sTh.map(function(x){return 'ซับ '+x;})),
        di:f.di, dur:(f.dur||'').trim(), iturl:(f.iturl||'').trim(), oid:(f.oid||'').trim(),
        hasExtra:f.hasExtra, extraSub:f.extraSub, buyDate:f.buyDate, buyTime:f.buyTime, price:I(f.price,m.price),
        mine:f.mine, ws:f.ws, wd:(f.ws!=='n'), th2:f.th2}:m),
      cvals:{...s.cvals, ...cvUpdates},
      modal:null, editForm:null
    }));
    this.toast('บันทึกการแก้ไข “'+((f.t||'').trim())+'” แล้ว');
  },
  hideImg(e){ if(e&&e.target) e.target.style.display='none'; }

});
