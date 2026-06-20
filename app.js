/* ===== เวอร์ชัน + วันที่เผยแพร่ (แก้ที่นี่ที่เดียวเวลาออกเวอร์ชันใหม่) ===== */
const APP_VERSION = '0.9.1.0';
const BUILD_DATE = '20 มิ.ย. 2569';

class App extends React.Component {
  state = {
    view: 'poster',
    search: '',
    filter: 'all',
    genre: 'ทุกแนว',
    sortKey: '',
    sortDir: 'desc',
    selected: null,
    refreshing: false,
    toast: '',
    addQuery: '',
    addResults: [],
    addSel: null,
    addFetching: false,
    addReady: false,
    movies: null,
    collapsed: false,
    psize: 2,
    customCols: [],
    cvals: {},
    modal: null,
    newColName: '',
    newColType: 'ข้อความ',
    newColOptions: '',
    cedit: {key:null, val:''},
    mselTarget: null,
    msel: [],
    manualRes: '4K',
    manualStars: 4,
    manualGb: '',
    manualPrice: '',
    manualTh: '',
    manualWd: false,
    manualPd: '',
    group: null,
    editForm: null,
    edit: {id:null, field:null, val:''},
    crewOpen: true,
    showPoster: true,
    zoom: 0,
    hoverId: null,
    hoverPos: {x:0,y:0},
    peopleFilter: [],
    peopleSearch: '',
    hiddenGroups: [],
    sel: [],
  };
  ROLES = [{key:'dir',label:'ผู้กำกับ'},{key:'wr',label:'ผู้เขียนบท'},{key:'dop',label:'กำกับภาพ'},{key:'ed',label:'ลำดับภาพ'},{key:'mus',label:'ดนตรีประกอบ'},{key:'cast',label:'นักแสดงนำ'}];
  EDFIELDS = { y:{num:true}, run:{num:true}, mpaa:{}, studio:{}, imdb:{num:true,float:true}, imdbVotes:{num:true}, rt:{num:true}, rtCount:{num:true}, mc:{num:true}, metaCount:{num:true}, gb:{num:true,float:true}, bud:{num:true,mil:true}, ww:{num:true,mil:true}, dom:{num:true,mil:true}, dir:{}, wr:{}, dop:{}, ed:{}, mus:{}, cast:{}, ow:{num:true}, on:{num:true}, aw:{}, res:{}, color:{}, aspect:{}, aspect2:{}, extraSub:{}, buyDate:{}, buyTime:{}, price:{num:true} };
  FIELD_OPTIONS = { hdr:['SDR','HDR','Vision'], audio:['Atmos','7.1','5.1','2.0'], audioEng:['Atmos','DD7.1','DD5.1','AAC2.0','AD'], subEng:['Eng','Eng UK','Eng US','SDH UK','SDH US','CC'], thai:['Sub','AAC2.0+Sub','DD5.1'], g:['Action','Adventure','Animation','Comedy','Crime','Drama','Fantasy','History','Horror','Music','Musical','Mystery','Romance','Sci-Fi','Thriller','War'] };
  FIELD_NAMES = { hdr:'ภาพ / HDR', audio:'เสียง', audioEng:'เสียง Eng', subEng:'ซับ Eng', thai:'ไทย', g:'แนวหนัง' };
  IMGBASE = 'https://image.tmdb.org/t/p/w500';

  TONES = {
    warm:  {bg:'#f5f1ea',surface:'#fffdf9',surf2:'#f1ebe1',ink:'#3a352f',muted:'#9c9286',line:'#ece5d9',accent:'#889a76',accent2:'#5f7050',soft:'#e7ecdf',gold:'#cf9b3f'},
    blush: {bg:'#faf4f1',surface:'#fffcfb',surf2:'#f6e9e4',ink:'#4a3a37',muted:'#a99089',line:'#f0e2dc',accent:'#c98b86',accent2:'#a8625c',soft:'#f5e3df',gold:'#cf9b3f'},
    sky:   {bg:'#f3f5fa',surface:'#fefeff',surf2:'#e9eef7',ink:'#34384a',muted:'#8b91a6',line:'#e3e8f2',accent:'#8198c4',accent2:'#5d76a8',soft:'#e6ecf6',gold:'#cf9b3f'},
    mono:  {bg:'#f6f6f4',surface:'#ffffff',surf2:'#efefec',ink:'#33352f',muted:'#979488',line:'#e8e8e3',accent:'#6f8a82',accent2:'#4d6b62',soft:'#e8efeb',gold:'#b98f43'},
    teal:  {bg:'#eef4f3',surface:'#fbfefe',surf2:'#e2eeeb',ink:'#26393a',muted:'#7e958f',line:'#daeae6',accent:'#57aa9b',accent2:'#2f7d6e',soft:'#d8efe9',gold:'#cf9b3f'},
    amber: {bg:'#f8f2e6',surface:'#fffdf6',surf2:'#f3e8d3',ink:'#43382a',muted:'#a8946f',line:'#eee1c9',accent:'#e0a23f',accent2:'#b3700f',soft:'#f7e7c4',gold:'#c98a25'},
    tealamber: {bg:'#f1f4f2',surface:'#fdfefc',surf2:'#e6efea',ink:'#283a35',muted:'#85968d',line:'#dce9e2',accent:'#e0a23f',accent2:'#2f7d6e',soft:'#dceee6',gold:'#d2912f'},
  };

  componentDidMount() {
    // 1) โหลดจากเครื่องก่อน (เร็ว เห็นทันที แม้เน็ตหลุด)
    let saved=null;
    try { saved=JSON.parse(localStorage.getItem('mc_lib_v2')); } catch(e) {}
    if(saved && Array.isArray(saved.movies) && saved.movies.length){
      this.setState({ movies:saved.movies, customCols:saved.customCols||[], cvals:saved.cvals||{}, zoom: (saved.zoom==null?0:saved.zoom), hiddenGroups:saved.hiddenGroups||[], crewOpen:(saved.crewOpen==null?true:saved.crewOpen) });
    } else {
      this.setState({ movies: this.seed().map(m=>this.enrich(m)) });
    }
    // 2) แล้วค่อย sync กับคลาวด์
    this._syncFromCloud();
  }
  // รวมสถานะคลังเป็นก้อนเดียว (ใช้ทั้งเก็บในเครื่อง + คลาวด์)
  _blob() {
    return { movies:this.state.movies, customCols:this.state.customCols, cvals:this.state.cvals, zoom:this.state.zoom, hiddenGroups:this.state.hiddenGroups, crewOpen:this.state.crewOpen };
  }
  _syncFromCloud() {
    if(!(window.MovieCloud && window.MovieCloud.ready)){ this._cloudReady=true; return; }
    window.MovieCloud.load().then((cloud)=>{
      if(cloud && Array.isArray(cloud.movies) && cloud.movies.length){
        // คลาวด์มีข้อมูล → ใช้ของคลาวด์ (sync ข้ามเครื่อง)
        this.setState({ movies:cloud.movies, customCols:cloud.customCols||[], cvals:cloud.cvals||{}, zoom:(cloud.zoom==null?0:cloud.zoom), hiddenGroups:cloud.hiddenGroups||[], crewOpen:(cloud.crewOpen==null?true:cloud.crewOpen) }, ()=>{ this._cloudReady=true; });
      } else {
        // คลาวด์ยังว่าง → ดันสถานะปัจจุบันขึ้นไปตั้งต้น
        this._cloudReady=true;
        if(this.state.movies) window.MovieCloud.save(this._blob());
      }
    }).catch(()=>{ this._cloudReady=true; });
  }
  componentDidUpdate() {
    if(!this.state.movies) return;
    const blob = this._blob();
    try { localStorage.setItem('mc_lib_v2', JSON.stringify(blob)); } catch(e) {}
    // ดันขึ้นคลาวด์ (เฉพาะหลัง sync รอบแรกเสร็จ กันเขียนทับข้อมูลคลาวด์ตอนเพิ่งเปิด)
    if(this._cloudReady && window.MovieCloud && window.MovieCloud.ready){ window.MovieCloud.save(blob); }
  }
  resetLibrary() {
    if(!confirm('รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าตัวอย่าง? ข้อมูลที่แก้ไว้จะหายทั้งหมด')) return;
    this.setState({ movies:this.seed().map(m=>this.enrich(m)), customCols:[], cvals:{}, sel:[], hiddenGroups:[] });
    this.toast('รีเซ็ตคลังกลับเป็นค่าตัวอย่างแล้ว');
  }
  // delete + bulk select
  deleteMovie(id){ const m=this.state.movies.find(x=>x.id===id); if(!m) return; if(!confirm('ลบ “'+m.t+'” ออกจากคลัง?')) return; this.setState(s=>({movies:s.movies.filter(x=>x.id!==id), sel:s.sel.filter(x=>x!==id), selected:null})); this.toast('ลบ “'+m.t+'” แล้ว'); }
  toggleRow(id){ this.setState(s=>({sel: s.sel.includes(id)?s.sel.filter(x=>x!==id):[...s.sel,id]})); }
  selectIds(ids){ this.setState({sel:[...ids]}); }
  clearSel(){ this.setState({sel:[]}); }
  bulkWatched(v){ const ids=this.state.sel; this.setState(s=>({movies:s.movies.map(m=>ids.includes(m.id)?{...m,wd:v}:m)})); this.toast((v?'ทำเป็นดูแล้ว ':'ทำเป็นยังไม่ดู ')+ids.length+' เรื่อง'); }
  bulkDelete(){ const ids=this.state.sel; if(!ids.length) return; if(!confirm('ลบ '+ids.length+' เรื่องที่เลือกออกจากคลัง?')) return; this.setState(s=>({movies:s.movies.filter(m=>!ids.includes(m.id)), sel:[]})); this.toast('ลบ '+ids.length+' เรื่องแล้ว'); }
  // column visibility
  toggleGroup(k){ this.setState(s=>({hiddenGroups: s.hiddenGroups.includes(k)?s.hiddenGroups.filter(x=>x!==k):[...s.hiddenGroups,k]})); }
  showAllGroups(){ this.setState({hiddenGroups:[]}); }
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
  }
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
  }

  abbr(n){ if(n>=1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M'; if(n>=1e3) return Math.round(n/1e3)+'K'; return ''+n; }

  enrich(m){
    const id=m.id, au=m.au||[], su=m.su||[], re=m.re||[];
    const res = m.di==='4K' ? '4K' : 'FHD';
    let hdr; if(re.includes('Dolby Vision')) hdr=['HDR','Vision']; else if(re.includes('HDR')) hdr=['HDR']; else hdr=['SDR'];
    const audio=[]; if(au.includes('Atmos')) audio.push('Atmos'); if(au.includes('7.1')) audio.push('7.1'); else if(au.includes('5.1')) audio.push('5.1');
    const audioEng=[]; if(au.includes('Atmos')) audioEng.push('Atmos','DD7.1'); else if(au.includes('7.1')) audioEng.push('DD7.1'); if(au.includes('5.1')) audioEng.push('DD5.1'); audioEng.push('AAC2.0'); if(id%3===0) audioEng.push('AD');
    const subEng=['Eng']; subEng.push(id%2===0?'Eng US':'Eng UK'); if(su.includes('Eng(SDH)')) subEng.push(id%2===0?'SDH US':'SDH UK'); if(id%4===0) subEng.push('CC');
    const thai=[]; if(su.includes('Thai')){ thai.push('Sub'); if(id%2===0) thai.push('AAC2.0+Sub'); if(id%3===0) thai.push('DD5.1'); }
    const hasExtra=!!m.ex;
    const extraSub = hasExtra ? ['Eng SDH','Eng','ไทย','ไม่มี'][id%4] : '';
    const aspect = m.ar==='multi' ? '1.85:1' : m.ar;
    const aspect2 = (m.ar==='multi'||m.ar==='2.20:1'||id%5===0) ? 'IMAX 1.43:1' : '';
    const color = m.co==='ผสม' ? 'สี + ขาวดำ' : (m.co||'สี');
    const imdbVotes = Math.round((m.ww/1e6)*1400 + m.imdb*40000 + id*2300);
    const rtCount = 180 + ((id*23)%260);
    const metaCount = 28 + ((id*9)%34);
    const hh=String((9+id*2)%24).padStart(2,'0'), mm=String((id*13)%60).padStart(2,'0');
    return {...m, res, hdr, audio, audioEng, subEng, thai, hasExtra, extraSub, aspect, aspect2, color, imdbVotes, rtCount, metaCount, buyDate:m.pd, buyTime:hh+':'+mm};
  }

  seed() {
    const M = (o) => o;
    return [
      M({id:1,p:'/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',t:'Dune',th:'ดูน',y:2021,g:['Sci-Fi','Adventure'],run:155,mpaa:'PG-13',studio:'Legendary',dir:'Denis Villeneuve',wr:'Jon Spaihts, Eric Roth',cast:'Timothée Chalamet, Zendaya, Rebecca Ferguson',dop:'Greig Fraser',ed:'Joe Walker',mus:'Hans Zimmer',imdb:8.0,rt:83,mc:74,aw:'ชนะ 6 ออสการ์',ow:6,on:10,bud:165e6,ww:402e6,dom:108e6,wd:true,th2:true,mine:5,re:['4K','Dolby Vision'],gb:48.2,au:['Atmos','5.1'],su:['Eng','Thai'],ex:true,ar:'2.39:1',co:'สี',di:'4K',pd:'2022-03-10',price:599,syn:'พอล อะเทรดีส เดินทางสู่ดาวอาราคิสที่อันตรายที่สุดในจักรวาล เพื่อปกป้องอนาคตของครอบครัวและผู้คนของเขา',c:['#c8a97e','#6e4f37']})
    ];
  }

  POOL = [
    {id:101,p:'/k68nPLbIST6NP96JmTxmZijEvCA.jpg',t:'Tenet',y:2020,sub:'Christopher Nolan · Sci-Fi, Action',grad:'linear-gradient(150deg,#3a4a5a,#9fb0bf)',imdb:7.3,rt:69,runtime:150,studio:'Warner Bros.',dir:'Christopher Nolan',genre:'Sci-Fi, Action',mpaa:'PG-13',mc:69},
    {id:102,p:'/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',t:'Coco',y:2017,sub:'Lee Unkrich · Animation, Family',grad:'linear-gradient(150deg,#c2453f,#f0b94a)',imdb:8.4,rt:97,runtime:105,studio:'Pixar',dir:'Lee Unkrich',genre:'Animation, Family',mpaa:'PG',mc:81},
    {id:103,p:'/k4FwHlMhuRR5BISY2Gm2QZHlH5Q.jpg',t:'The Shape of Water',y:2017,sub:'Guillermo del Toro · Fantasy, Romance',grad:'linear-gradient(150deg,#2f6b6b,#8fc4bf)',imdb:7.3,rt:92,runtime:123,studio:'Fox Searchlight',dir:'Guillermo del Toro',genre:'Fantasy, Romance',mpaa:'R',mc:87},
    {id:104,p:'/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',t:'Top Gun: Maverick',y:2022,sub:'Joseph Kosinski · Action, Drama',grad:'linear-gradient(150deg,#2a3b55,#cfa45e)',imdb:8.2,rt:96,runtime:131,studio:'Paramount',dir:'Joseph Kosinski',genre:'Action, Drama',mpaa:'PG-13',mc:78},
    {id:105,p:'/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg',t:'Soul',y:2020,sub:'Pete Docter · Animation, Fantasy',grad:'linear-gradient(150deg,#3a5a8a,#b59ad0)',imdb:8.0,rt:95,runtime:100,studio:'Pixar',dir:'Pete Docter',genre:'Animation, Fantasy',mpaa:'PG',mc:83},
    {id:106,p:'/k3waqVXSnvCZWfJYNtdamixpO9X.jpg',t:'Past Lives',y:2023,sub:'Celine Song · Romance, Drama',grad:'linear-gradient(150deg,#7a5a6b,#d8b8c4)',imdb:7.8,rt:95,runtime:105,studio:'A24',dir:'Celine Song',genre:'Romance, Drama',mpaa:'PG-13',mc:94},
  ];

  // ---------- helpers ----------
  money(n){ if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B'; if(n>=1e6) return '$'+Math.round(n/1e6)+'M'; if(n>=1e3) return '$'+Math.round(n/1e3)+'K'; return '$'+n; }
  rtColor(v){ return v>=85?'#5b8c5a':v>=60?'#7a9b58':'#c97a6d'; }
  mcColor(v){ return v>=75?'#5b8c5a':v>=50?'#caa53a':'#c97a6d'; }
  grad(c){ return 'linear-gradient(150deg,'+c[0]+','+c[1]+')'; }
  resChip(lab,t){ const on=this.state.manualRes===lab; return 'padding:5px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';')); }
  starArr(n,t,id){ const a=[]; for(let i=1;i<=5;i++) a.push({c:i<=n?(t.gold):(t.line), set:()=>this.setStars(id,i)}); return a; }

  // ---------- mutations ----------
  setView(v){ this.setState({view:v, selected:null}); }
  toggleWatched(id){ this.setState(s=>({movies:s.movies.map(m=>m.id===id?{...m,wd:!m.wd}:m)})); }
  setStars(id,n){ this.setState(s=>({movies:s.movies.map(m=>m.id===id?{...m,mine:n}:m)})); }
  editGb(id){ const m=this.state.movies.find(x=>x.id===id); const v=prompt('แก้ขนาดไฟล์ (GB) ของ '+m.t, m.gb); if(v!==null&&!isNaN(parseFloat(v))) this.setState(s=>({movies:s.movies.map(x=>x.id===id?{...x,gb:parseFloat(v)}:x)})); }
  open(id){ this.setState({selected:id}); }
  close(){ this.setState({selected:null, refreshing:false}); }
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
        dop:full.dop!=='—'?full.dop:x.dop, ed:full.ed!=='—'?full.ed:x.ed, mus:full.mus!=='—'?full.mus:x.mus,
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
  }
  toast(msg){ this.setState({toast:msg}); setTimeout(()=>this.setState({toast:''}),2600); }
  sort(k){ this.setState(s=>({sortKey:k, sortDir: s.sortKey===k&&s.sortDir==='desc'?'asc':'desc'})); }
  sval(m,k){ if(k==='t')return (m.t||'').toLowerCase(); if(k==='genre')return ((m.g||[])[0]||'').toLowerCase(); if(k==='intl')return m.ww-m.dom; if(k==='pctDom')return m.dom/m.ww; const v=m[k]; return typeof v==='string'?v.toLowerCase():v; }

  // inline editing (Excel-like)
  startEdit(id, field, raw){ this.setState({edit:{id, field, val:String(raw==null?'':raw)}}); }
  changeEdit(v){ this.setState(s=>({edit:{...s.edit, val:v}})); }
  cancelEdit(){ this.setState({edit:{id:null, field:null, val:''}}); }
  commitEdit(){
    const {id, field, val} = this.state.edit;
    if(id==null||field==null){ return; }
    const cfg = this.EDFIELDS[field] || {};
    let v = val;
    if(cfg.mil){ const n=parseFloat(val); if(isNaN(n)){ this.cancelEdit(); return; } v=n*1e6; }
    else if(cfg.num){ const n=cfg.float?parseFloat(val):parseInt(val,10); if(isNaN(n)){ this.cancelEdit(); return; } v=n; }
    else { v=val.trim(); }
    this.setState(s=>({ movies:s.movies.map(m=>m.id===id?{...m,[field]:v}:m), edit:{id:null,field:null,val:''} }));
  }
  toggleCrew(){ this.setState(s=>({crewOpen:!s.crewOpen})); }
  togglePoster(){ this.setState(s=>({showPoster:!s.showPoster})); }
  setZoom(d){ this.setState(s=>({zoom: Math.max(0, Math.min(2, s.zoom+d))})); }
  setHover(id, e){ this.setState({hoverId:id, hoverPos: e?{x:e.clientX, y:e.clientY}:this.state.hoverPos}); }
  toggleField(mid, field){ this.setState(s=>({movies:s.movies.map(m=>m.id===mid?{...m,[field]:!m[field]}:m)})); }
  togglePerson(token){ this.setState(s=>({peopleFilter: s.peopleFilter.includes(token)?s.peopleFilter.filter(x=>x!==token):[...s.peopleFilter, token]})); }
  clearPeople(){ this.setState({peopleFilter:[]}); }
  onPeopleSearch(v){ this.setState({peopleSearch:v}); }

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
  }
  pickAdd(p){
    this.setState({addSel:p, addFetching:true, addReady:false});
    if(window.MovieAPI && window.MovieAPI.ready && p.tmdbId){
      window.MovieAPI.details(p).then(full=>{
        const sel=Object.assign({}, full, {
          tmdbId:p.tmdbId,
          genre:(full.g||[]).join(', '),    // alias ให้ UI เดิมใช้ได้
          runtime:full.run,
          img: full.p ? (this.IMGBASE+full.p) : (p.img||''),
          grad: this.grad(['#5f7050','#c8c0b0'])
        });
        this.setState({addSel:sel, addFetching:false, addReady:true});
      }).catch(()=>{ this.setState({addFetching:false, addReady:true}); });
    } else {
      setTimeout(()=>this.setState({addFetching:false, addReady:true}),1200); // fallback (POOL)
    }
  }
  addCancel(){ this.setState({addSel:null, addFetching:false, addReady:false}); }
  addSave(){
    const p=this.state.addSel; if(!p) return;
    const newId=Math.max(0,...this.state.movies.map(x=>x.id))+1;
    const today=new Date().toISOString().slice(0,10);
    const mv=this.enrich({id:newId, p:p.p||'', t:p.t, th:(this.state.manualTh.trim()||p.th||p.t), y:p.y,
      g: p.g || (p.genre||'').split(',').map(s=>s.trim()).filter(Boolean),
      run:(p.run!=null?p.run:p.runtime)||0, mpaa:p.mpaa||'—', studio:p.studio||'—',
      dir:p.dir||'—', wr:p.wr||'—', cast:p.cast||'—', dop:p.dop||'—', ed:p.ed||'—', mus:p.mus||'—',
      imdb:p.imdb||0, rt:p.rt||0, mc:p.mc||0, aw:p.aw||'—', ow:p.ow||0, on:p.on||0,
      bud:p.bud||0, ww:p.ww||0, dom:p.dom||0, wd:this.state.manualWd, th2:false,
      mine:this.state.manualStars, re:[this.state.manualRes], gb:parseFloat(this.state.manualGb)||0, au:['5.1'], su:['Eng','Thai'],
      ex:false, ar:'2.39:1', co:'สี', di:this.state.manualRes==='HD'?'2K':'4K', pd:(this.state.manualPd||today), price:parseInt(this.state.manualPrice,10)||0,
      syn:p.syn||'—', tmdbId:p.tmdbId||null, imdbId:p.imdbId||'', c:['#5f7050','#c8c0b0']});
    this.setState(s=>({ movies:[mv, ...s.movies], addSel:null, addReady:false, addQuery:'', addResults:[],
      manualGb:'', manualPrice:'', manualTh:'', manualWd:false, manualPd:'', view:'table' }));
    this.toast('เพิ่ม “'+p.t+'” ลงคอลเลกชันแล้ว');
  }
  setManualRes(r){ this.setState({manualRes:r}); }
  setManualStars(n){ this.setState({manualStars:n}); }

  // ui controls
  toggleCollapse(){ this.setState(s=>({collapsed:!s.collapsed})); }
  setPsize(i){ this.setState({psize:i}); }
  openModal(m){ this.setState({modal:m, newColName:'', newColType:'ข้อความ', newColOptions:''}); }
  closeModal(){ this.setState({modal:null, mselTarget:null}); }
  onColOptions(v){ this.setState({newColOptions:v}); }

  // custom columns (flexible table)
  addColumn(){
    const name=(this.state.newColName||'').trim()||'คอลัมน์ใหม่';
    const type=this.state.newColType;
    const options=(type==='ตัวเลือกเดียว'||type==='หลายตัวเลือก')
      ? (this.state.newColOptions||'').split(/[,\n]/).map(s=>s.trim()).filter(Boolean) : [];
    const col={id:'c'+Date.now(), name, type, options};
    this.setState(s=>({customCols:[...s.customCols, col], modal:null}));
    this.toast('เพิ่มคอลัมน์ “'+name+'” ('+type+') แล้ว');
  }
  delColumn(cid){ this.setState(s=>({customCols:s.customCols.filter(c=>c.id!==cid)})); }
  // inline custom-cell editors
  startCText(key, cur){ this.setState({cedit:{key, val:String(cur==null?'':cur)}}); }
  cChange(v){ this.setState(s=>({cedit:{...s.cedit, val:v}})); }
  cCommit(){ const {key,val}=this.state.cedit; if(key==null) return; this.setState(s=>({cvals:{...s.cvals,[key]:val}, cedit:{key:null,val:''}})); }
  cCancel(){ this.setState({cedit:{key:null,val:''}}); }
  setCVal(key,val){ this.setState(s=>({cvals:{...s.cvals,[key]:val}})); }
  toggleCheckVal(key){ this.setState(s=>({cvals:{...s.cvals,[key]:!s.cvals[key]}})); }
  openMulti(mid,col){ const key=mid+'_'+col.id; const cur=this.state.cvals[key]; this.setState({modal:'mselect', mselTarget:{kind:'col', key, name:col.name, options:col.options}, msel:Array.isArray(cur)?[...cur]:[]}); }
  openFieldMulti(mid, field){ const m=this.state.movies.find(x=>x.id===mid); const cur=m?m[field]:[]; this.setState({modal:'mselect', mselTarget:{kind:'field', mid, field, name:this.FIELD_NAMES[field]||field, options:this.FIELD_OPTIONS[field]||[]}, msel:Array.isArray(cur)?[...cur]:[]}); }
  toggleMsel(opt){ this.setState(s=>({msel: s.msel.includes(opt)?s.msel.filter(x=>x!==opt):[...s.msel,opt]})); }
  saveMsel(){ const tg=this.state.mselTarget; if(!tg){return;} if(tg.kind==='field'){ this.setState(s=>({movies:s.movies.map(m=>m.id===tg.mid?{...m,[tg.field]:[...s.msel]}:m), modal:null, mselTarget:null})); } else { this.setState(s=>({cvals:{...s.cvals,[tg.key]:[...s.msel]}, modal:null, mselTarget:null})); } }
  csvImport(){ this.setState({modal:null}); this.toast('นำเข้า 247 แถวจาก CSV และจับคู่คอลัมน์เรียบร้อย'); }

  GROUP_ORDER = [null,'genre','y','studio','wd'];
  GROUP_LABELS = {genre:'แนวหนัง', y:'ปี', studio:'สตูดิโอ', wd:'สถานะการดู'};
  groupCycle(){
    const i=this.GROUP_ORDER.indexOf(this.state.group);
    const next=this.GROUP_ORDER[(i+1)%this.GROUP_ORDER.length];
    this.setState({group:next});
    this.toast(next?('จัดกลุ่มตาม'+this.GROUP_LABELS[next]):'ยกเลิกการจัดกลุ่ม');
  }
  groupKeyOf(m){
    const g=this.state.group;
    if(g==='genre') return (m.g||[])[0]||'อื่นๆ';
    if(g==='y') return String(m.y);
    if(g==='studio') return m.studio;
    if(g==='wd') return m.wd?'ดูแล้ว':'ยังไม่ดู';
    return '';
  }

  editDetail(){
    const m=this.state.movies.find(x=>x.id===this.state.selected);
    if(!m) return;
    const cv={};
    this.state.customCols.forEach(c=>{ const raw=this.state.cvals[m.id+'_'+c.id]; cv[c.id]= c.type==='หลายตัวเลือก'?(Array.isArray(raw)?[...raw]:[]) : (raw==null?'':raw); });
    this.setState({modal:'edit', editForm:{id:m.id, t:m.t, th:m.th, y:m.y, run:m.run, mpaa:m.mpaa, studio:m.studio, color:m.color, aspect:m.aspect, aspect2:m.aspect2||'',
      dir:m.dir, wr:m.wr, dop:m.dop, ed:m.ed, mus:m.mus, cast:m.cast,
      imdb:m.imdb, imdbVotes:m.imdbVotes, rt:m.rt, rtCount:m.rtCount, mc:m.mc, metaCount:m.metaCount,
      ow:m.ow, on:m.on, aw:m.aw,
      budM:Math.round(m.bud/1e6), wwM:Math.round(m.ww/1e6), domM:Math.round(m.dom/1e6),
      res:m.res, gb:m.gb, hdr:[...(m.hdr||[])], audio:[...(m.audio||[])], audioEng:[...(m.audioEng||[])], subEng:[...(m.subEng||[])], thai:[...(m.thai||[])], g:[...(m.g||[])],
      hasExtra:m.hasExtra, extraSub:m.extraSub||'', buyDate:m.buyDate, buyTime:m.buyTime, price:m.price,
      mine:m.mine, wd:m.wd, th2:m.th2, re:[...m.re], cv}});
  }
  setEditField(k,v){ this.setState(s=>({editForm:{...s.editForm, [k]:v}})); }
  toggleEfArr(field,opt){ this.setState(s=>{ const arr=s.editForm[field]||[]; const next=arr.includes(opt)?arr.filter(x=>x!==opt):[...arr,opt]; return {editForm:{...s.editForm,[field]:next}}; }); }
  toggleEfBool(field){ this.setState(s=>({editForm:{...s.editForm,[field]:!s.editForm[field]}})); }
  setEfCv(cid,v){ this.setState(s=>({editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:v}}})); }
  toggleEfCvMulti(cid,opt){ this.setState(s=>{ const arr=s.editForm.cv[cid]||[]; const next=arr.includes(opt)?arr.filter(x=>x!==opt):[...arr,opt]; return {editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:next}}}; }); }
  toggleEfCvCheck(cid){ this.setState(s=>({editForm:{...s.editForm, cv:{...s.editForm.cv, [cid]:!s.editForm.cv[cid]}}})); }
  toggleEditRes(r){ this.setState(s=>{ const has=s.editForm.re.includes(r); return {editForm:{...s.editForm, re: has?s.editForm.re.filter(x=>x!==r):[...s.editForm.re, r]}}; }); }
  saveEdit(){
    const f=this.state.editForm; if(!f) return;
    const cvUpdates={};
    (f.cv? Object.keys(f.cv):[]).forEach(cid=>{ cvUpdates[f.id+'_'+cid]=f.cv[cid]; });
    const I=(v,d)=>{ const n=parseInt(v,10); return isNaN(n)?d:n; };
    const F=(v,d)=>{ const n=parseFloat(v); return isNaN(n)?d:n; };
    this.setState(s=>({
      movies:s.movies.map(m=>m.id===f.id?{...m,
        t:(f.t||'').trim()||m.t, th:(f.th||'').trim(), y:I(f.y,m.y), run:I(f.run,m.run), mpaa:f.mpaa, studio:f.studio, color:f.color, aspect:f.aspect, aspect2:f.aspect2,
        dir:f.dir, wr:f.wr, dop:f.dop, ed:f.ed, mus:f.mus, cast:f.cast,
        imdb:F(f.imdb,m.imdb), imdbVotes:I(f.imdbVotes,m.imdbVotes), rt:I(f.rt,m.rt), rtCount:I(f.rtCount,m.rtCount), mc:I(f.mc,m.mc), metaCount:I(f.metaCount,m.metaCount),
        ow:I(f.ow,m.ow), on:I(f.on,m.on), aw:f.aw,
        bud:I(f.budM,Math.round(m.bud/1e6))*1e6, ww:I(f.wwM,Math.round(m.ww/1e6))*1e6, dom:I(f.domM,Math.round(m.dom/1e6))*1e6,
        res:f.res, gb:F(f.gb,m.gb), hdr:[...f.hdr], audio:[...f.audio], audioEng:[...f.audioEng], subEng:[...f.subEng], thai:[...f.thai], g:[...f.g],
        hasExtra:f.hasExtra, extraSub:f.extraSub, buyDate:f.buyDate, buyTime:f.buyTime, price:I(f.price,m.price),
        mine:f.mine, wd:f.wd, th2:f.th2}:m),
      cvals:{...s.cvals, ...cvUpdates},
      modal:null, editForm:null
    }));
    this.toast('บันทึกการแก้ไข “'+((f.t||'').trim())+'” แล้ว');
  }
  hideImg(e){ if(e&&e.target) e.target.style.display='none'; }

  renderVals(){
    const t = this.TONES[this.props.tone] || this.TONES.warm;
    const dense = this.props.density==='compact';
    const editorial = this.props.posterStyle==='editorial';
    const movies = this.state.movies || [];
    const view = this.state.view;

    const PSIZES=['128px','152px','180px','214px','252px'];
    const ZOOMPAD=['1px 7px','6px 11px','11px 14px'];
    const ZOOMFS=['11.5px','12.5px','13px'];
    const zoom=this.state.zoom;
    const showThumb = zoom>0; // compact level hides posters (spreadsheet look)
    const themeStyle = {display:'contents','--bg':t.bg,'--surface':t.surface,'--surf2':t.surf2,'--ink':t.ink,'--muted':t.muted,'--line':t.line,'--accent':t.accent,'--accent2':t.accent2,'--soft':t.soft,'--gold':t.gold,
      '--rowpad': (ZOOMPAD[zoom]||'6px 11px'), '--tfs': (ZOOMFS[zoom]||'13px'), '--cardmin': PSIZES[this.state.psize]||'180px'};
    const collapsed=this.state.collapsed, expanded=!collapsed;

    // filtering
    const q = this.state.search.trim().toLowerCase();
    const pf = this.state.peopleFilter;
    let list = movies.filter(m=>{
      if(q && !((m.t||'').toLowerCase().includes(q) || (m.th||'').includes(this.state.search.trim()))) return false;
      if(this.state.filter==='watched' && !m.wd) return false;
      if(this.state.filter==='unwatched' && m.wd) return false;
      if(this.state.genre!=='ทุกแนว' && !(m.g||[]).includes(this.state.genre)) return false;
      if(pf.length){ const ok = pf.some(tok=>{ const i=tok.indexOf('::'); const role=tok.slice(0,i), name=tok.slice(i+2); return String(m[role]||'').includes(name); }); if(!ok) return false; }
      return true;
    });
    // sort
    const sk=this.state.sortKey, dir=this.state.sortDir==='asc'?1:-1;
    if(sk){ list=[...list].sort((a,b)=>{ const av=this.sval(a,sk), bv=this.sval(b,sk); if(av<bv)return -1*dir; if(av>bv)return 1*dir; return 0; }); }

    const cards = list.map((m,i)=>({
      id:m.id, t:m.t, th:m.th, y:m.y, genre:(m.g||[])[0]||'', imdb:m.imdb.toFixed(1), rt:m.rt+'%',
      rtColor:this.rtColor(m.rt), grad:this.grad(m.c), watched:m.wd, mine:m.mine, delay:(i*0.03).toFixed(2)+'s',
      initial:(m.t||'?')[0], imdbNum:m.imdb.toFixed(1),
      img:m.p?(this.IMGBASE+m.p):'', hasImg:!!m.p, noImg:!m.p, imgErr:(e)=>this.hideImg(e),
      stars:this.starArr(m.mine,t,m.id), open:()=>this.open(m.id),
    }));

    const crewCellBase='text-align:left;padding:var(--rowpad,10px 13px);border-bottom:1px solid '+t.line+';cursor:cell;font-size:12.5px;color:'+t.ink+';white-space:nowrap;';
    const makeRow = (m)=>{
      const intl = m.ww - m.dom;
      const eo=(f)=> this.state.edit.id===m.id && this.state.edit.field===f;
      const mk=(f,raw)=>({on:eo(f), off:!eo(f), start:()=>this.startEdit(m.id,f,raw)});
      const crewCells = this.state.crewOpen
        ? [['dir',m.dir],['wr',m.wr],['dop',m.dop],['ed',m.ed],['mus',m.mus]].map((c,i,a)=>({
            on:eo(c[0]), off:!eo(c[0]), start:()=>this.startEdit(m.id,c[0],c[1]), val:c[1],
            style:crewCellBase+(i===a.length-1?('border-right:2px solid '+t.line+';'):'')
          }))
        : [{ on:false, off:true, start:()=>this.toggleCrew(), val:m.dir, style:crewCellBase+'color:'+t.muted+';border-right:2px solid '+t.line+';' }];
      return {
        isGroup:false, isRow:true, initial:(m.t||'?')[0],
        id:m.id, t:m.t, th:m.th, y:m.y, genre:(m.g||[])[0]||'', runtime:m.run+' น.', mpaa:m.mpaa, studio:m.studio,
        imdb:m.imdb.toFixed(1), rt:m.rt+'%', rtColor:this.rtColor(m.rt), mc:m.mc, mcColor:this.mcColor(m.mc),
        budget:this.money(m.bud), ww:this.money(m.ww), dom:this.money(m.dom), intl:this.money(intl),
        pctDom:Math.round(m.dom/m.ww*100)+'%', grad:this.grad(m.c),
        checkBorder:m.wd?t.accent2:t.line, checkBg:m.wd?t.accent2:'transparent', checkMark:m.wd?'✓':'',
        stars:this.starArr(m.mine,t,m.id), resTags:m.re, gb:m.gb.toFixed(1),
        img:m.p?(this.IMGBASE+m.p):'', hasImg:!!m.p, imgErr:(e)=>this.hideImg(e),
        customCells:this.state.customCols.map(c=>{
          const key=m.id+'_'+c.id; const raw=this.state.cvals[key]; const editingThis=this.state.cedit.key===key;
          const base={key, type:c.type, name:c.name};
          if(c.type==='ตัวเลือกเดียว'){
            return {...base, ctSingle:true, singleVal:(raw||''),
              selOptions:[{value:'',label:'— เลือก —'}].concat((c.options||[]).map(o=>({value:o,label:o}))),
              onSingle:(e)=>this.setCVal(key, e.target.value)};
          }
          if(c.type==='หลายตัวเลือก'){
            const arr=Array.isArray(raw)?raw:[];
            return {...base, ctMulti:true, multiChips:(arr.length?arr:['—']), openMulti:()=>this.openMulti(m.id,c)};
          }
          if(c.type==='checkbox'){
            const on=!!raw;
            return {...base, ctCheck:true, checked:on, toggleCheck:()=>this.toggleCheckVal(key), checkIcon:on?'✓':'',
              checkChip: on ? ('display:inline-flex;width:20px;height:20px;border-radius:6px;align-items:center;justify-content:center;background:'+t.accent2+';color:#fff;font-size:12px;font-weight:700;cursor:pointer') : ('display:inline-flex;width:20px;height:20px;border-radius:6px;align-items:center;justify-content:center;border:1.5px solid '+t.line+';cursor:pointer')};
          }
          if(c.type==='คะแนนดาว'){
            const n=parseInt(raw)||0;
            return {...base, ctStar:true, starArr:[1,2,3,4,5].map(i=>({c:i<=n?t.gold:t.line, set:()=>this.setCVal(key,i)}))};
          }
          const disp=(raw==null||raw==='')?'—':String(raw);
          return {...base, ctText:true, textOn:editingThis, textOff:!editingThis, start:()=>this.startCText(key, raw==null?'':raw), display:disp};
        }),
        toggle:()=>this.toggleWatched(m.id), editGb:()=>this.editGb(m.id), open:()=>this.open(m.id),
        crewCells,
        eY:mk('y',m.y), eRun:mk('run',m.run), eMpaa:mk('mpaa',m.mpaa), eStudio:mk('studio',m.studio),
        eImdb:mk('imdb',m.imdb), eRt:mk('rt',m.rt), eMc:mk('mc',m.mc),
        eBud:mk('bud',Math.round(m.bud/1e6)), eWw:mk('ww',Math.round(m.ww/1e6)), eDom:mk('dom',Math.round(m.dom/1e6)),
        eGb:mk('gb',m.gb), eOw:mk('ow',m.ow), eOn:mk('on',m.on), eAw:mk('aw',m.aw),
        eRes:mk('res',m.res), eColor:mk('color',m.color), eAspect:mk('aspect',m.aspect), eAspect2:mk('aspect2',m.aspect2||''),
        eExtraSub:mk('extraSub',m.extraSub||''), eBuyDate:mk('buyDate',m.buyDate), eBuyTime:mk('buyTime',m.buyTime), ePrice:mk('price',m.price),
        openHdr:()=>this.openFieldMulti(m.id,'hdr'), openAudio:()=>this.openFieldMulti(m.id,'audio'), openAudioEng:()=>this.openFieldMulti(m.id,'audioEng'),
        openSubEng:()=>this.openFieldMulti(m.id,'subEng'), openThai:()=>this.openFieldMulti(m.id,'thai'), openGenre:()=>this.openFieldMulti(m.id,'g'),
        toggleExtra:()=>this.toggleField(m.id,'hasExtra'),
        // extended display fields
        imdbVotesLabel: m.imdbVotes.toLocaleString('en-US'), rtCountLabel: m.rtCount.toLocaleString('en-US'), mcCountLabel: m.metaCount.toLocaleString('en-US'),
        ow:m.ow, on:m.on, aw:m.aw,
        res:m.res, hdrTags:m.hdr||[], audioTags:m.audio||[], audioEngTags:m.audioEng||[], subEngTags:m.subEng||[], thaiTags:(m.thai&&m.thai.length?m.thai:['—']),
        color:m.color, aspect:m.aspect, aspect2:(m.aspect2||'—'),
        hasExtra:m.hasExtra, extraIcon:m.hasExtra?'✓':'—', extraSub:(m.extraSub||'—'),
        extraChip: m.hasExtra ? ('display:inline-flex;width:22px;height:22px;border-radius:6px;align-items:center;justify-content:center;background:'+t.accent2+';color:#fff;font-size:12px;font-weight:700') : ('color:'+t.muted+';font-weight:700'),
        buyDate:m.buyDate, buyTime:m.buyTime, priceLabel:'฿'+m.price,
        // hover popup (compact mode = no thumbnails)
        showPop: (!showThumb) && this.state.hoverId===m.id,
        enter:(e)=>this.setHover(m.id, e), leave:()=>this.setHover(null),
        selOn: this.state.sel.includes(m.id), toggleSel:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); this.toggleRow(m.id); }, selMark: this.state.sel.includes(m.id)?'✓':'',
        selChip: this.state.sel.includes(m.id) ? ('flex:none;width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;cursor:pointer;background:'+t.accent2+';border:1.5px solid '+t.accent2) : ('flex:none;width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid '+t.line),
      };
    };
    const GW={info:5, crew:(this.state.crewOpen?5:1), score:6, box:5, status:2, file:2, oscar:3, quality:4, audio:4, itunes:2, purchase:3, custom:this.state.customCols.length};
    const hidG=this.state.hiddenGroups||[];
    let visCols=0; ['info','crew','score','box','status','file','oscar','quality','audio','itunes','purchase','custom'].forEach(k=>{ if(!hidG.includes(k)) visCols+=GW[k]; });
    const groupColspan = visCols;
    let rows;
    if(this.state.group){
      const groups={};
      list.forEach(m=>{ const k=this.groupKeyOf(m); (groups[k]=groups[k]||[]).push(m); });
      const keys=Object.keys(groups).sort((a,b)=> this.state.group==='y' ? (Number(b)-Number(a)) : a.localeCompare(b,'th'));
      rows=[];
      keys.forEach(k=>{
        rows.push({isGroup:true, isRow:false, groupLabel:k, groupCount:groups[k].length+' เรื่อง', groupColspan});
        groups[k].forEach(m=>rows.push(makeRow(m)));
      });
    } else {
      rows = list.map(makeRow);
    }

    // table footer
    const sumGb = list.reduce((a,m)=>a+m.gb,0);
    const avgImdb = list.length? (list.reduce((a,m)=>a+m.imdb,0)/list.length):0;
    const avgRt = list.length? Math.round(list.reduce((a,m)=>a+m.rt,0)/list.length):0;
    const avgDomPct = list.length? Math.round(list.reduce((a,m)=>a+m.dom/m.ww*100,0)/list.length):0;

    // dashboard (use all movies)
    const all=movies;
    const totalGb=all.reduce((a,m)=>a+m.gb,0);
    const watchedN=all.filter(m=>m.wd).length;
    const watchedPct=all.length?Math.round(watchedN/all.length*100):0;
    const spend=all.reduce((a,m)=>a+m.price,0);
    const avgImdbAll=all.length?(all.reduce((a,m)=>a+m.imdb,0)/all.length):0;
    const avgRtAll=all.length?Math.round(all.reduce((a,m)=>a+m.rt,0)/all.length):0;
    const avgMcAll=all.length?Math.round(all.reduce((a,m)=>a+m.mc,0)/all.length):0;
    const theaterN=all.filter(m=>m.th2).length;

    // by year
    const yearMap={}; all.forEach(m=>{yearMap[m.y]=(yearMap[m.y]||0)+1;});
    const years=Object.keys(yearMap).map(Number).sort((a,b)=>a-b);
    const maxY=Math.max(1,...years.map(y=>yearMap[y]));
    const byYear=years.map(y=>({y:y, n:yearMap[y], h:Math.round(yearMap[y]/maxY*150)+'px'}));

    // by genre
    const genreMap={}; all.forEach(m=>(m.g||[]).forEach(g=>{genreMap[g]=(genreMap[g]||0)+1;}));
    const gEntries=Object.entries(genreMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const maxG=Math.max(1,...gEntries.map(e=>e[1]));
    const byGenre=gEntries.map(([name,n])=>({name, n, w:Math.round(n/maxG*100)+'%'}));

    // by resolution
    const r4k=all.filter(m=>m.re.includes('4K')).length;
    const rdv=all.filter(m=>m.re.includes('Dolby Vision')).length;
    const rhd=all.filter(m=>m.re.includes('HD')&&!m.re.includes('4K')).length;
    const maxR=Math.max(1,r4k,rhd,rdv);
    const byRes=[
      {name:'4K UHD', n:r4k, w:Math.round(r4k/maxR*100)+'%', c:t.accent2},
      {name:'Dolby Vision', n:rdv, w:Math.round(rdv/maxR*100)+'%', c:t.accent},
      {name:'HD', n:rhd, w:Math.round(rhd/maxR*100)+'%', c:t.muted},
    ];

    const pie = 'conic-gradient('+t.accent2+' 0 '+watchedPct+'%, '+t.accent+' '+watchedPct+'% 100%)';

    // genre options
    const gset=new Set(); all.forEach(m=>(m.g||[]).forEach(g=>gset.add(g)));
    const genreOptions=['ทุกแนว',...Array.from(gset).sort()];

    // detail
    const sel=movies.find(m=>m.id===this.state.selected);
    let d=null;
    if(sel){
      const intl=sel.ww-sel.dom;
      const enc=encodeURIComponent(sel.t+' '+sel.y);
      d={
        imdbUrl:'https://www.imdb.com/find/?q='+enc+'&s=tt',
        rtUrl:'https://www.rottentomatoes.com/search?search='+encodeURIComponent(sel.t),
        mcUrl:'https://www.metacritic.com/search/'+encodeURIComponent(sel.t)+'/?category=2',
        t:sel.t, th:sel.th, y:sel.y, runtime:sel.run, mpaa:sel.mpaa, imdb:sel.imdb.toFixed(1), rt:sel.rt+'%',
        rtColor:this.rtColor(sel.rt), mc:sel.mc, mcColor:this.mcColor(sel.mc), grad:this.grad(sel.c), syn:sel.syn,
        img:sel.p?(this.IMGBASE+sel.p):'', hasImg:!!sel.p,
        stars:this.starArr(sel.mine,t,sel.id),
        watchedLabel: sel.wd?'✓ ดูแล้ว':'ยังไม่ได้ดู',
        theaterLabel: sel.th2?'เคยดูในโรง':'ยังไม่เคยดูในโรง',
        infoRows:[{k:'แนว',v:(sel.g||[]).join(', ')},{k:'ประเทศ / สตูดิโอ',v:sel.studio},{k:'รางวัล',v:sel.aw},{k:'Oscar (ชนะ/ชิง)',v:sel.ow+' / '+sel.on}],
        crewRows:[{k:'ผู้กำกับ',v:sel.dir},{k:'นักเขียนบท',v:sel.wr},{k:'นักแสดงนำ',v:sel.cast},{k:'กำกับภาพ',v:sel.dop},{k:'ตัดต่อ',v:sel.ed},{k:'เพลงประกอบ',v:sel.mus}],
        boxRows:[{k:'ทุนสร้าง',v:this.money(sel.bud)},{k:'ทั่วโลก',v:this.money(sel.ww)},{k:'ในประเทศ',v:this.money(sel.dom)},{k:'ต่างประเทศ',v:this.money(intl)},{k:'% ในประเทศ',v:Math.round(sel.dom/sel.ww*100)+'%'}],
        fileRows:[{k:'ความละเอียด',v:sel.re.join(' · ')},{k:'ขนาดไฟล์',v:sel.gb.toFixed(1)+' GB'},{k:'เสียง',v:sel.au.join(', ')},{k:'ซับไตเติล',v:sel.su.join(', ')},{k:'Aspect',v:sel.ar},{k:'ราคา',v:'฿'+sel.price}],
      };
    }

    // nav styles
    const navBase='display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;font-size:14px;font-weight:600;text-align:left;width:100%;white-space:nowrap;overflow:hidden;transition:background .15s;'+(collapsed?'justify-content:center;':'');
    const navOn=navBase+'background:'+t.accent2+';color:#fff;';
    const navOff=navBase+'background:transparent;color:'+t.ink+';';
    const asideW=collapsed?'76px':'248px';
    const asideStyle='width:'+asideW+';min-width:'+asideW+';max-width:'+asideW+';flex:0 0 '+asideW+';overflow:hidden;background:var(--surface,#fffdf9);border-right:1px solid var(--line,#ece5d9);display:flex;flex-direction:column;padding:18px '+(collapsed?'12px':'16px')+';transition:width .22s ease,flex-basis .22s ease,padding .22s ease';

    // poster size buttons
    const psizeLabels=['XS','S','M','L','XL'];
    const psBtnBase='width:30px;height:28px;border-radius:7px;font-size:11px;font-weight:700;transition:all .15s;';
    const psizeBtns=psizeLabels.map((lab,i)=>({label:lab, set:()=>this.setPsize(i),
      style: psBtnBase+(this.state.psize===i?('background:'+t.accent2+';color:#fff;'):('background:transparent;color:'+t.muted+';'))}));

    // custom columns + type chooser
    const customCols=this.state.customCols.map(c=>({name:c.name, del:()=>this.delColumn(c.id)}));
    const colTypes=['ข้อความ','ข้อความยาว','ตัวเลข','คะแนนดาว','วันที่','ตัวเลือกเดียว','หลายตัวเลือก','checkbox','ลิงก์ URL','รูปภาพ','คำนวณ'];
    const typeBtns=colTypes.map(ty=>({label:ty, set:()=>this.setState({newColType:ty}),
      style:'padding:7px 12px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid '+(this.state.newColType===ty?t.accent2:t.line)+';'+(this.state.newColType===ty?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'))}));

    // toolbar filter chips
    const chip='padding:6px 13px;border-radius:8px;font-size:12.5px;font-weight:600;transition:all .15s;';
    const chipOn=chip+'background:'+t.surface+';color:'+t.accent2+';box-shadow:0 1px 3px rgba(60,53,47,.12);';
    const chipOff=chip+'background:transparent;color:'+t.muted+';';

    // table header styles
    const thBase='top:37px;position:sticky;z-index:4;background:'+t.surf2+';text-align:center;padding:9px 12px;font-weight:600;color:'+t.muted+';border-bottom:2px solid '+t.line+';';
    const thBaseR=thBase+'border-right:2px solid '+t.line+';';
    const thBaseCalc=thBase.replace('background:'+t.surf2,'background:'+t.soft)+'color:'+t.accent2+';font-style:italic;';
    const thBaseCalcR=thBaseCalc+'border-right:2px solid '+t.line+';';
    const tdC='text-align:center;padding:var(--rowpad,10px 13px);border-bottom:1px solid '+t.line+';';
    const tdCR=tdC+'border-right:2px solid '+t.line+';';
    const tdL='text-align:left;padding:var(--rowpad,10px 13px);border-bottom:1px solid '+t.line+';';
    const tdLR=tdL+'border-right:2px solid '+t.line+';';
    const tdCalc=tdC+'background:'+t.soft+';color:'+t.accent2+';font-style:italic;font-variant-numeric:tabular-nums;';
    const tdCalcR=tdCalc+'border-right:2px solid '+t.line+';';

    const titles={poster:['คอลเลกชัน','มุมมองโปสเตอร์'],table:['ตารางข้อมูล','ระบบยืดหยุ่นแบบ Excel'],dashboard:['สถิติคอลเลกชัน','ภาพรวมและกราฟ'],add:['เพิ่มหนังใหม่','ดึงข้อมูลอัตโนมัติ'],people:['บุคลากร','กรองหนังตามรายชื่อทีมงาน']};
    const arr=(k)=> this.state.sortKey===k ? (this.state.sortDir==='asc'?' ▲':' ▼') : '';

    // add results
    const aq=this.state.addQuery.trim().toLowerCase();
    const apiOn = !!(window.MovieAPI && window.MovieAPI.ready);
    const rawResults = apiOn ? (this.state.addResults||[]) : this.POOL.filter(p=>!aq||p.t.toLowerCase().includes(aq));
    const addResults=rawResults.map(p=>({...p, img:(p.img||(p.p?(this.IMGBASE+p.p):'')), hasImg:(p.hasImg!=null?p.hasImg:!!p.p), imgErr:(e)=>this.hideImg(e), pick:()=>this.pickAdd(p)}));
    const asel=this.state.addSel;
    const addAutoFields = asel?[
      {k:'ปี',v:asel.y},{k:'แนว',v:asel.genre},{k:'ความยาว',v:asel.runtime+' นาที'},
      {k:'เรท MPAA',v:asel.mpaa},{k:'สตูดิโอ',v:asel.studio},{k:'ผู้กำกับ',v:asel.dir},
      {k:'IMDb',v:asel.imdb},{k:'Metacritic',v:asel.mc},
    ]:[];

    // sortable headers (every column)
    const sorters={}, arrows={};
    ['t','y','genre','run','mpaa','studio','imdb','imdbVotes','rt','rtCount','mc','metaCount','bud','ww','dom','intl','pctDom','gb','dir','wr','dop','ed','mus','ow','on','res','color','aspect','hasExtra','buyDate','buyTime','price'].forEach(k=>{ sorters[k]=()=>this.sort(k); arrows[k]=arr(k); });

    // people filter tab
    const psearch = this.state.peopleSearch.trim().toLowerCase();
    const peopleGroups = this.ROLES.map(r=>{
      const counts={};
      movies.forEach(m=>{
        String(m[r.key]||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(name=>{ counts[name]=(counts[name]||0)+1; });
      });
      const items = Object.keys(counts).sort((a,b)=>a.localeCompare(b))
        .filter(name=>!psearch || name.toLowerCase().includes(psearch))
        .map(name=>{ const tok=r.key+'::'+name; const checked=pf.includes(tok); return {name, count:counts[name], checked, toggle:()=>this.togglePerson(tok),
          check: checked?'✓':'',
          box: 'flex:none;width:19px;height:19px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;cursor:pointer;border:1.5px solid '+(checked?t.accent2:t.line)+';background:'+(checked?t.accent2:'transparent')
        }; });
      return {label:r.label, key:r.key, items, count:items.length};
    }).filter(g=>g.items.length>0);
    const peopleActive = pf.length>0;

    // crew column group (collapsible)
    const crewOpen=this.state.crewOpen;
    const crewColspan=crewOpen?5:1;
    const crewChevron=crewOpen?'▾':'▸';
    const crewHeaders = crewOpen
      ? [['ผกก.','dir'],['บท','wr'],['กำกับภาพ','dop'],['ตัดต่อ','ed'],['เพลง','mus']].map((h,i,a)=>({
          label:h[0], sort:sorters[h[1]], arrow:arrows[h[1]],
          style:(i===a.length-1?thBaseR:thBase)+'cursor:pointer'
        }))
      : [{label:'ทีมงาน', sort:()=>this.toggleCrew(), arrow:'', style:thBaseR+'cursor:pointer'}];

    // inline cell editor
    const inlineInputStyle='width:100%;min-width:48px;max-width:120px;height:28px;border:1.5px solid '+t.accent2+';border-radius:6px;background:'+t.surface+';padding:0 6px;font-size:13px;color:'+t.ink+';font-family:inherit;text-align:inherit;box-sizing:border-box;';
    const cselStyle='max-width:140px;height:26px;border:1px solid '+t.line+';border-radius:7px;background:'+t.surface+';color:'+t.ink+';font-size:12px;font-family:inherit;padding:0 4px;cursor:pointer;';
    const efInput='width:100%;height:40px;border-radius:10px;border:1px solid '+t.line+';background:'+t.bg+';padding:0 12px;font-size:13.5px;color:'+t.ink+';font-family:inherit;box-sizing:border-box;';

    // edit-form custom controls
    const ef0=this.state.editForm;
    const efCustom = ef0 ? this.state.customCols.map(c=>{
      const val=(ef0.cv||{})[c.id];
      const base={name:c.name, id:c.id, type:c.type};
      if(c.type==='ตัวเลือกเดียว') return {...base, isSingle:true, val:(val||''), options:[{value:'',label:'— เลือก —'}].concat((c.options||[]).map(o=>({value:o,label:o}))), on:(e)=>this.setEfCv(c.id,e.target.value)};
      if(c.type==='หลายตัวเลือก'){ const arr=Array.isArray(val)?val:[]; return {...base, isMulti:true, opts:(c.options||[]).map(o=>{ const on=arr.includes(o); return {label:o, toggle:()=>this.toggleEfCvMulti(c.id,o), chip:'padding:6px 12px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'))}; })}; }
      if(c.type==='checkbox') return {...base, isCheck:true, checked:!!val, toggle:()=>this.toggleEfCvCheck(c.id), btnStyle:'height:38px;padding:0 16px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;border:1px solid '+(val?'transparent':t.line)+';'+(val?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')), btnLabel:val?'✓ ใช่':'ไม่'};
      if(c.type==='คะแนนดาว'){ const n=parseInt(val)||0; return {...base, isStar:true, stars:[1,2,3,4,5].map(i=>({c:i<=n?t.gold:t.line, set:()=>this.setEfCv(c.id,i)}))}; }
      return {...base, isText:true, val:(val==null?'':val), on:(e)=>this.setEfCv(c.id,e.target.value), efInput};
    }) : [];

    // hover poster preview (compact rows)
    const hovM = (!showThumb && this.state.hoverId!=null) ? movies.find(x=>x.id===this.state.hoverId) : null;
    const hovPop = hovM ? {show:true, hasImg:!!hovM.p, img:hovM.p?this.IMGBASE+hovM.p:'', initial:(hovM.t||'?')[0], t:hovM.t, th:hovM.th} : {show:false};
    const hp=this.state.hoverPos; const vh=(typeof window!=='undefined'?window.innerHeight:800);
    const hovStyle='position:fixed;left:'+(hp.x+18)+'px;top:'+Math.max(10,Math.min(hp.y-96, vh-210))+'px;z-index:80;width:132px;height:196px;border-radius:12px;overflow:hidden;background:'+(hovM?this.grad(hovM.c):'#ccc')+';box-shadow:0 18px 44px -10px rgba(0,0,0,.55);border:2px solid #fff;display:flex;align-items:center;justify-content:center;pointer-events:none;';

    // comprehensive edit-form controls
    const efChip=(on)=>'padding:6px 12px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'));
    const mkMulti=(field)=> (this.FIELD_OPTIONS[field]||[]).map(o=>{ const on=ef0&&(ef0[field]||[]).includes(o); return {label:o, style:efChip(on), toggle:()=>this.toggleEfArr(field,o)}; });
    const mkSingle=(field,opts)=> opts.map(o=>{ const on=ef0&&ef0[field]===o; return {label:o, style:efChip(on), set:()=>this.setEditField(field,o)}; });
    const efTextFields=['t','th','y','run','studio','aspect','aspect2','dir','wr','dop','ed','mus','cast','imdb','imdbVotes','rt','rtCount','mc','metaCount','ow','on','aw','budM','wwM','domM','gb','buyDate','buyTime','price'];
    const efH={}; efTextFields.forEach(k=>{ efH[k]=(e)=>this.setEditField(k,e.target.value); });
    const efm = ef0 ? {
      g:mkMulti('g'), hdr:mkMulti('hdr'), audio:mkMulti('audio'), audioEng:mkMulti('audioEng'), subEng:mkMulti('subEng'), thai:mkMulti('thai'),
      res:mkSingle('res',['FHD','4K']), color:mkSingle('color',['สี','ขาวดำ','สี + ขาวดำ']),
      mpaa:mkSingle('mpaa',['G','PG','PG-13','R','NC-17']), extraSub:mkSingle('extraSub',['Eng SDH','Eng','ไทย','ไม่มี']),
      wdStyle:'height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid '+(ef0.wd?'transparent':t.line)+';'+(ef0.wd?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')), wdLabel:ef0.wd?'✓ ดูแล้ว':'ยังไม่ดู',
      th2Style:'height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid '+(ef0.th2?'transparent':t.line)+';'+(ef0.th2?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')), th2Label:ef0.th2?'✓ เคยดูในโรง':'ไม่เคยดูในโรง',
      exStyle:'height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid '+(ef0.hasExtra?'transparent':t.line)+';'+(ef0.hasExtra?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')), exLabel:ef0.hasExtra?'✓ มี iTunes Extra':'ไม่มี Extra',
    } : {};

    return {
      themeStyle,
      // nav
      navPoster: view==='poster'?navOn:navOff, navTable: view==='table'?navOn:navOff,
      navDash: view==='dashboard'?navOn:navOff, navAdd: view==='add'?navOn:navOff,
      goPoster:()=>this.setView('poster'), goTable:()=>this.setView('table'),
      goDash:()=>this.setView('dashboard'), goAdd:()=>this.setView('add'),
      navPeople: view==='people'?navOn:navOff, goPeople:()=>this.setView('people'), isPeople: view==='people',
      // poster / zoom controls
      showPoster:this.state.showPoster, togglePoster:()=>this.togglePoster(),
      posterToggleStyle:'height:32px;padding:0 13px;border-radius:9px;font-weight:600;font-size:12.5px;white-space:nowrap;cursor:pointer;'+(this.state.showPoster?('border:1px solid transparent;background:'+t.accent2+';color:#fff;'):('border:1px solid '+t.line+';background:'+t.surface+';color:'+t.ink+';')),
      posterToggleLabel:this.state.showPoster?'🖼 รูป: เปิด':'🖼 รูป: ปิด',
      zoomOut:()=>this.setZoom(-1), zoomIn:()=>this.setZoom(1), zoomLabel:['กะทัดรัด','ปกติ','ขยาย'][this.state.zoom],
      // people tab
      peopleGroups, peopleActive, peopleCount:pf.length,
      peopleSearch:this.state.peopleSearch, onPeopleSearch:(e)=>this.onPeopleSearch(e.target.value), clearPeople:()=>this.clearPeople(),
      peopleBanner: peopleActive ? ('กำลังกรองตามทีมงาน '+pf.length+' คน') : '',
      showPeopleBanner: peopleActive && (view==='poster'||view==='table'),
      // sidebar stats
      stat_total: all.length, stat_gb:(totalGb/1024).toFixed(2)+' TB', stat_watched: watchedN+'/'+all.length,
      // view flags
      isPoster: view==='poster', isTable: view==='table', isDash: view==='dashboard', isAdd: view==='add',
      showToolbar: view==='poster'||view==='table',
      viewTitle:(titles[view]||['',''])[0], viewSub:(titles[view]||['',''])[1],
      // search/filter
      search:this.state.search, onSearch:(e)=>this.setState({search:e.target.value}),
      filterAll:()=>this.setState({filter:'all'}), filterWatched:()=>this.setState({filter:'watched'}), filterUnwatched:()=>this.setState({filter:'unwatched'}),
      fAll: this.state.filter==='all'?chipOn:chipOff, fWatched:this.state.filter==='watched'?chipOn:chipOff, fUnwatched:this.state.filter==='unwatched'?chipOn:chipOff,
      genreFilter:this.state.genre, onGenre:(e)=>this.setState({genre:e.target.value}), genreOptions,
      // poster
      cards, noResults: list.length===0, editorial, classic:!editorial, imgh:{err:(e)=>this.hideImg(e)},
      psizeBtns,
      // sidebar collapse
      collapsed, expanded, asideStyle, toggleCollapse:()=>this.toggleCollapse(), collapseIcon: collapsed?'»':'«',
      // custom columns + table tools
      customCols, hasCustom: this.state.customCols.length>0, customColsCount: this.state.customCols.length,
      openAddCol:()=>this.openModal('addcol'), openCsv:()=>this.openModal('csv'), groupBtn:()=>this.groupCycle(),
      groupLabel: this.state.group ? ('⊟ จัดกลุ่ม: '+this.GROUP_LABELS[this.state.group]) : '⊟ จัดกลุ่ม',
      groupBtnStyle: 'height:32px;padding:0 13px;border-radius:9px;font-weight:600;font-size:12.5px;white-space:nowrap;cursor:pointer;'+(this.state.group?('border:1px solid transparent;background:'+t.accent2+';color:#fff;'):('border:1px solid '+t.line+';background:'+t.surface+';color:'+t.ink+';')),
      groupActive: !!this.state.group,
      showAddCol: this.state.modal==='addcol', showCsv: this.state.modal==='csv', closeModal:()=>this.closeModal(),
      // edit modal
      showEdit: this.state.modal==='edit', ef: this.state.editForm || {},
      setEfTitle:(e)=>this.setEditField('t', e.target.value),
      setEfTh:(e)=>this.setEditField('th', e.target.value),
      setEfYear:(e)=>this.setEditField('y', e.target.value),
      setEfRun:(e)=>this.setEditField('run', e.target.value),
      setEfGb:(e)=>this.setEditField('gb', e.target.value),
      setEfPrice:(e)=>this.setEditField('price', e.target.value),
      efWatchedLabel: (this.state.editForm&&this.state.editForm.wd)?'✓ ดูแล้ว':'ยังไม่ได้ดู',
      efWatchedStyle: 'height:38px;padding:0 16px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;border:1px solid '+((this.state.editForm&&this.state.editForm.wd)?'transparent':t.line)+';'+((this.state.editForm&&this.state.editForm.wd)?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')),
      efStars:[1,2,3,4,5].map(i=>({set:()=>this.setEditField('mine',i), c:(this.state.editForm&&i<=this.state.editForm.mine)?t.gold:t.line})),
      efResBtns:['HD','4K','Dolby Vision','HDR','Atmos'].map(r=>{ const on=this.state.editForm&&this.state.editForm.re.includes(r); return {label:r, set:()=>this.toggleEditRes(r),
        style:'padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'))}; }),
      efWatched: this.state.editForm?this.state.editForm.wd:false,
      toggleEfWatched:()=>this.setState(s=>({editForm:{...s.editForm, wd:!s.editForm.wd}})),
      saveEdit:()=>this.saveEdit(),
      newColName:this.state.newColName, onColName:(e)=>this.setState({newColName:e.target.value}),
      typeBtns, addColumn:()=>this.addColumn(), csvImport:()=>this.csvImport(), editDetail:()=>this.editDetail(),
      csvMap:[{from:'Title',to:'ชื่อหนัง'},{from:'Year',to:'ปี'},{from:'IMDb Rating',to:'IMDb'},{from:'GB Size',to:'ขนาด (GB)'},{from:'Watched',to:'ดูแล้ว/ยัง'}],
      // add-form manual controls
      manualResBtns:[
        {label:'HD', set:()=>this.setManualRes('HD'), style:this.resChip('HD',t)},
        {label:'4K', set:()=>this.setManualRes('4K'), style:this.resChip('4K',t)},
        {label:'Dolby Vision', set:()=>this.setManualRes('Dolby Vision'), style:this.resChip('Dolby Vision',t)},
      ],
      manualStarArr:[1,2,3,4,5].map(i=>({set:()=>this.setManualStars(i), c:i<=this.state.manualStars?t.gold:t.line})),
      // add-form: ช่องกรอกเอง (ข้อมูลส่วนตัวที่ API ไม่มี)
      manualGb:this.state.manualGb, onManualGb:(e)=>this.setState({manualGb:e.target.value}),
      manualPrice:this.state.manualPrice, onManualPrice:(e)=>this.setState({manualPrice:e.target.value}),
      manualTh:this.state.manualTh, onManualTh:(e)=>this.setState({manualTh:e.target.value}),
      manualPd:this.state.manualPd, onManualPd:(e)=>this.setState({manualPd:e.target.value}),
      manualWd:this.state.manualWd, toggleManualWd:()=>this.setState(s=>({manualWd:!s.manualWd})),
      manualWdLabel:this.state.manualWd?'✓ ดูแล้ว':'ยังไม่ได้ดู',
      manualWdStyle:'height:40px;padding:0 16px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;width:100%;border:1px solid '+(this.state.manualWd?'transparent':t.line)+';'+(this.state.manualWd?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')),
      // table
      rows, rowCount:list.length, thBase, thBaseR, thBaseCalc, thBaseCalcR, tdC, tdCR, tdL, tdLR, tdCalc, tdCalcR,
      sorters, arrows,
      // crew group
      crewOpen, crewColspan, crewChevron, crewHeaders, toggleCrew:()=>this.toggleCrew(),
      footColspan: groupColspan,
      // column visibility
      showCrew:!hidG.includes('crew'), showBox:!hidG.includes('box'), showOscar:!hidG.includes('oscar'), showQuality:!hidG.includes('quality'), showAudio:!hidG.includes('audio'), showItunes:!hidG.includes('itunes'), showPurchase:!hidG.includes('purchase'),
      showCols: this.state.modal==='cols', openCols:()=>this.openModal('cols'), showAllGroups:()=>this.showAllGroups(),
      groupToggles: [['crew','🎭 ทีมงานสร้าง'],['box','💰 Box Office'],['oscar','🏆 ออสการ์'],['quality','🎞️ คุณภาพภาพ'],['audio','🔊 เสียง & ซับ'],['itunes','🎁 iTunes Extra'],['purchase','🛒 การซื้อ']].map(it=>{ const on=!hidG.includes(it[0]); return {label:it[1], toggle:()=>this.toggleGroup(it[0]), style:'padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.muted+';')), mark:on?'✓ ':''}; }),
      // bulk select
      selCount:this.state.sel.length, hasSel:this.state.sel.length>0,
      selectVisible:()=>this.selectIds(list.map(m=>m.id)), clearSel:()=>this.clearSel(),
      bulkWatched:()=>this.bulkWatched(true), bulkUnwatched:()=>this.bulkWatched(false), bulkDelete:()=>this.bulkDelete(),
      // csv + library
      exportCsv:()=>this.exportCsv(), importCsvFile:(e)=>this.importCsvFile(e),
      deleteSelected:()=>this.deleteMovie(this.state.selected), resetLibrary:()=>this.resetLibrary(),
      // inline editor
      inlineInputStyle, editVal:this.state.edit.val,
      editChange:(e)=>this.changeEdit(e.target.value),
      editKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); this.commitEdit(); } else if(e.key==='Escape'){ e.preventDefault(); this.cancelEdit(); } },
      commitEdit:()=>this.commitEdit(),
      // density / thumbnails
      showThumb,
      // hover poster preview (compact mode)
      hoverPop: hovPop, hoverPopStyle: hovStyle,
      // custom-cell inline editors
      cselStyle, ceditVal:this.state.cedit.val,
      cChange:(e)=>this.cChange(e.target.value),
      cKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); this.cCommit(); } else if(e.key==='Escape'){ e.preventDefault(); this.cCancel(); } },
      cCommit:()=>this.cCommit(),
      // add-column options + multiselect modal
      newColOptions:this.state.newColOptions, onColOptions:(e)=>this.onColOptions(e.target.value),
      colNeedsOptions: (this.state.newColType==='ตัวเลือกเดียว'||this.state.newColType==='หลายตัวเลือก'),
      showMsel: this.state.modal==='mselect',
      mselName: this.state.mselTarget?this.state.mselTarget.name:'',
      mselOptions: this.state.mselTarget ? this.state.mselTarget.options.map(o=>{ const on=this.state.msel.includes(o); return {label:o, toggle:()=>this.toggleMsel(o),
        style:'padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'))}; }) : [],
      saveMsel:()=>this.saveMsel(),
      // edit-form custom fields
      efCustom,
      // comprehensive edit form
      efm, efH, efInput,
      toggleEfWd:()=>this.toggleEfBool('wd'), toggleEfTh2:()=>this.toggleEfBool('th2'), toggleEfExtra:()=>this.toggleEfBool('hasExtra'),
      sum_gb:sumGb.toFixed(1)+' GB', sum_imdb:avgImdb.toFixed(1), sum_rt:avgRt+'%', avgDomLabel:'เฉลี่ย '+avgDomPct+'%',
      // dashboard
      stat_tb:(totalGb/1024).toFixed(2)+' TB', avg_imdb:avgImdbAll.toFixed(1), avg_rt:avgRtAll+'%', avg_mc:avgMcAll,
      stat_spend:spend.toLocaleString(), byYear, byGenre, byRes, pie,
      watchedPct:watchedPct+'%', unwatchedPct:(100-watchedPct)+'%', watchedN, unwatchedN:all.length-watchedN, theaterN,
      // detail
      hasSelected:!!sel, d: d||{}, closeMovie:()=>this.close(), stop:(e)=>e.stopPropagation(),
      refreshMovie:()=>this.refresh(), refreshLabel:this.state.refreshing?'กำลังรีเฟรช…':'รีเฟรชจาก API',
      refreshSpin:this.state.refreshing?'display:inline-block;animation:spin .8s linear infinite':'',
      // add
      addQuery:this.state.addQuery, onAddQuery:(e)=>this.onAddQuery(e), addResults,
      addShowResults: !this.state.addFetching && !this.state.addReady,
      addFetching:this.state.addFetching, addReady:this.state.addReady,
      addSelTitle: asel?asel.t:'', addSelYear: asel?asel.y:'', addSelGrad: asel?asel.grad:'',
      addSelImg: asel?(asel.img||''):'', addSelHasImg: asel?!!asel.img:false,
      addSelImdb: asel?asel.imdb:'', addSelRt: asel?(asel.rt+'%'):'', addSelRuntime: asel?asel.runtime:'',
      addAutoFields, addCancel:()=>this.addCancel(), addSave:()=>this.addSave(),
      // toast
      showToast:!!this.state.toast, toastMsg:this.state.toast,
      // footer: เวอร์ชัน + วันที่เผยแพร่
      appVersion: APP_VERSION, buildDate: BUILD_DATE,
    };
  }

  render() {
    return window.DC.renderTemplate(this.renderVals());
  }
}


/* ---- เริ่มแอป: โหลดเทมเพลต → ติดตั้งตัวแปล → render ---- */
(function () {
  var PROPS = { tone: "tealamber", posterStyle: "editorial", density: "comfortable" };
  fetch("template.html?v=" + APP_VERSION, { cache: "no-cache" })
    .then(function (r) { return r.text(); })
    .then(function (tpl) {
      window.DC.init(tpl);
      var root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(React.createElement(App, PROPS));
    })
    .catch(function (err) {
      document.getElementById("root").innerHTML =
        "<pre style=\"padding:20px;color:#b00;white-space:pre-wrap\">โหลดแอปไม่สำเร็จ: " + (err && err.message || err) + "</pre>";
      console.error(err);
    });
})();
