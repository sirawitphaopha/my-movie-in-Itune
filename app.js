/* ===== เวอร์ชัน + วันที่เผยแพร่ (แก้ที่นี่ที่เดียวเวลาออกเวอร์ชันใหม่) ===== */
const APP_VERSION = '0.9.5.0';
const BUILD_DATE = '21 มิ.ย. 2569';

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
    manualHdr: [],
    manualStars: 4,
    manualGb: '',
    manualPrice: '',
    manualTh: '',
    manualWd: 'n',
    manualTh2: false,
    manualPd: '',
    manualDur: '',
    manualUrl: '',
    manualOid: '',
    manualDi: '4K',
    manualAEng: ['5.1','2.0'],
    manualSEng: ['Sub'],
    manualATh: [],
    manualSTh: [],
    manualAspects: [{r:'2.39:1', n:''}],
    manualVersions: [],
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
  EDFIELDS = { y:{num:true}, run:{num:true}, mpaa:{}, studio:{}, imdb:{num:true,float:true}, imdbVotes:{num:true}, rt:{num:true}, rtCount:{num:true}, mc:{num:true}, metaCount:{num:true}, gb:{num:true,float:true}, bud:{num:true,mil:true}, ww:{num:true,mil:true}, dom:{num:true,mil:true}, dir:{}, wr:{}, dop:{}, ed:{}, mus:{}, cast:{}, ow:{num:true}, on:{num:true}, aw:{}, res:{}, color:{}, aspect:{}, aspect2:{}, di:{}, extraSub:{}, dur:{}, buyDate:{}, buyTime:{}, price:{num:true}, oid:{} };
  FIELD_OPTIONS = { hdr:['Dolby Vision','HDR'], audio:['Atmos','7.1','5.1','2.0'], audioEng:['Atmos','DD7.1','DD5.1','AAC2.0','AD'], subEng:['Eng','Eng UK','Eng US','SDH UK','SDH US','CC'], thai:['Sub','AAC2.0+Sub','DD5.1'], aEng:['Atmos','7.1','5.1','2.0','AD'], sEng:['Sub','Sub (US)','Sub (UK)','Sub (US)(UK)','CC','CC (US)','CC (UK)','CC (US)(UK)','SDH','SDH (US)','SDH (UK)','SDH (US)(UK)'], aTh:['5.1','2.0'], sTh:['Sub'], g:['Action','Adventure','Animation','Comedy','Crime','Drama','Fantasy','History','Horror','Music','Musical','Mystery','Romance','Sci-Fi','Thriller','War'] };
  FIELD_NAMES = { hdr:'ภาพ / HDR', audio:'เสียง', audioEng:'เสียง Eng', subEng:'ซับ Eng', thai:'ไทย', aEng:'เสียง อังกฤษ', sEng:'ซับ อังกฤษ', aTh:'เสียง ไทย', sTh:'ซับ ไทย', g:'แนวหนัง' };
  ASPECT_OPTIONS = ['1.19:1','1.33:1','1.37:1','1.43:1','1.50:1','1.55:1','1.56:1','1.66:1','1.78:1','1.85:1','1.90:1','2.00:1','2.20:1','2.25:1','2.35:1','2.39:1','2.40:1','5.95:1','16:9','270° ScreenX'];
  AENG_LABELS = {'Atmos':'Dolby Atmos','7.1':'Dolby Digital 7.1','5.1':'Dolby Digital 5.1','2.0':'AAC 2.0','AD':'AD'};
  VERSION_OPTIONS = ['Theatrical','Extended','Director\'s Cut','Unrated','Special Edition','Ultimate Edition','Final Cut','Remastered'];
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
      this.setState({ movies:saved.movies.map(m=>this.enrich(m)), customCols:saved.customCols||[], cvals:saved.cvals||{}, zoom: (saved.zoom==null?0:saved.zoom), hiddenGroups:saved.hiddenGroups||[], crewOpen:(saved.crewOpen==null?true:saved.crewOpen) });
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
        this.setState({ movies:cloud.movies.map(m=>this.enrich(m)), customCols:cloud.customCols||[], cvals:cloud.cvals||{}, zoom:(cloud.zoom==null?0:cloud.zoom), hiddenGroups:cloud.hiddenGroups||[], crewOpen:(cloud.crewOpen==null?true:cloud.crewOpen) }, ()=>{ this._cloudReady=true; });
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
  bulkWatched(v){ const ids=this.state.sel; this.setState(s=>({movies:s.movies.map(m=>ids.includes(m.id)?{...m,wd:v,ws:(v?'W':'n')}:m)})); this.toast((v?'ทำเป็นดูแล้ว ':'ทำเป็นยังไม่ดู ')+ids.length+' เรื่อง'); }
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
    const color = m.co==='ผสม' ? 'สี + ขาวดำ' : (m.co||'สี');
    const imdbVotes = Math.round((m.ww/1e6)*1400 + m.imdb*40000 + id*2300);
    const rtCount = 180 + ((id*23)%260);
    const metaCount = 28 + ((id*9)%34);
    const hh=String((9+id*2)%24).padStart(2,'0'), mm=String((id*13)%60).padStart(2,'0');
    return {...m, ws, wd:(ws!=='n'), res, hdr, audio, audioEng, subEng, thai, aEng, sEng, aTh, sTh, hasExtra, extraSub, aspect, aspect2, aspects:aspList, versions:(m.versions||[]), color, imdbVotes, rtCount, metaCount, buyDate:m.pd, buyTime:hh+':'+mm};
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
  audChip(on,t){ return 'padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(on?t.accent2:t.line)+';'+(on?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';')); }
  starArr(n,t,id){ const a=[]; for(let i=1;i<=5;i++) a.push({c:i<=n?(t.gold):(t.line), set:()=>this.setStars(id,i)}); return a; }

  // ---------- mutations ----------
  setView(v){ this.setState({view:v, selected:null}); }
  toggleWatched(id){ this.setState(s=>({movies:s.movies.map(m=>{ if(m.id!==id) return m; const cur=m.ws||(m.wd?'W':'n'); const next={n:'W',W:'w',w:'n'}[cur]; return {...m, ws:next, wd:(next!=='n')}; })})); }
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
    this.setState({addSel:p, addFetching:true, addReady:false,
      manualGb:'', manualPrice:'', manualTh:'', manualWd:'n', manualTh2:false, manualPd:'',
      manualDur:'', manualUrl:'', manualOid:'', manualDi:'4K', manualRes:'4K', manualHdr:[],
      manualAEng:['5.1','2.0'], manualSEng:['Sub'], manualATh:[], manualSTh:[], manualAspects:[{r:'2.39:1',n:''}], manualVersions:[]});
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
  }
  addCancel(){ this.setState({addSel:null, addFetching:false, addReady:false}); }
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
      ex:false, ar:((this.state.manualAspects[0]&&this.state.manualAspects[0].r)||'2.39:1'), aspects:this.state.manualAspects.filter(a=>a.r), versions:[...this.state.manualVersions], co:'สี', di:this.state.manualDi, dur:this.state.manualDur.trim(), iturl:this.state.manualUrl.trim(), oid:this.state.manualOid.trim(),
      pd:(this.state.manualPd||today), price:parseInt(this.state.manualPrice,10)||0,
      syn:p.syn||'—', tmdbId:p.tmdbId||null, imdbId:p.imdbId||'', c:['#5f7050','#c8c0b0']});
    this.setState(s=>({ movies:[mv, ...s.movies], addSel:null, addReady:false, addQuery:'', addResults:[],
      manualGb:'', manualPrice:'', manualTh:'', manualWd:'n', manualTh2:false, manualPd:'',
      manualDur:'', manualUrl:'', manualOid:'', manualDi:'4K', manualRes:'4K', manualHdr:[],
      manualAEng:['5.1','2.0'], manualSEng:['Sub'], manualATh:[], manualSTh:[], manualAspects:[{r:'2.39:1',n:''}], manualVersions:[], view:'table' }));
    this.toast('เพิ่ม “'+p.t+'” ลงคอลเลกชันแล้ว');
  }
  setManualRes(r){ this.setState({manualRes:r}); }
  addManualAspect(){ this.setState(s=>({manualAspects:[...s.manualAspects, {r:'2.39:1', n:''}]})); }
  delManualAspect(i){ this.setState(s=>({manualAspects:s.manualAspects.filter((_,j)=>j!==i)})); }
  setManualAspect(i,k,v){ this.setState(s=>({manualAspects:s.manualAspects.map((a,j)=>j===i?{...a,[k]:v}:a)})); }
  addEfAspect(){ this.setState(s=>({editForm:{...s.editForm, aspects:[...(s.editForm.aspects||[]), {r:'2.39:1', n:''}]}})); }
  delEfAspect(i){ this.setState(s=>({editForm:{...s.editForm, aspects:(s.editForm.aspects||[]).filter((_,j)=>j!==i)}})); }
  setEfAspect(i,k,v){ this.setState(s=>({editForm:{...s.editForm, aspects:(s.editForm.aspects||[]).map((a,j)=>j===i?{...a,[k]:v}:a)}})); }
  addManualVersion(){ this.setState(s=>({manualVersions:[...s.manualVersions, {name:'Theatrical', dur:'', bought:false}]})); }
  delManualVersion(i){ this.setState(s=>({manualVersions:s.manualVersions.filter((_,j)=>j!==i)})); }
  setManualVersion(i,k,v){ this.setState(s=>({manualVersions:s.manualVersions.map((a,j)=>j===i?{...a,[k]:v}:a)})); }
  addEfVersion(){ this.setState(s=>({editForm:{...s.editForm, versions:[...(s.editForm.versions||[]), {name:'Theatrical', dur:'', bought:false}]}})); }
  delEfVersion(i){ this.setState(s=>({editForm:{...s.editForm, versions:(s.editForm.versions||[]).filter((_,j)=>j!==i)}})); }
  setEfVersion(i,k,v){ this.setState(s=>({editForm:{...s.editForm, versions:(s.editForm.versions||[]).map((a,j)=>j===i?{...a,[k]:v}:a)}})); }
  setManualStars(n){ this.setState({manualStars:n}); }
  pickPoster(path){ this.setState(s=>({addSel:Object.assign({}, s.addSel, {p:path, img:this.IMGBASE+path})})); }
  toggleManualAudio(field, val){ this.setState(s=>{ const arr=s[field]||[]; return {[field]: arr.indexOf(val)>=0?arr.filter(x=>x!==val):arr.concat([val])}; }); }

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
    this.setState({modal:'edit', editForm:{id:m.id, t:m.t, th:m.th, y:m.y, run:m.run, mpaa:m.mpaa, studio:m.studio, color:m.color, aspect:m.aspect, aspect2:m.aspect2||'', aspects:(m.aspects&&m.aspects.length?m.aspects.map(a=>({r:a.r,n:a.n})):[{r:'2.39:1',n:''}]), versions:(m.versions||[]).map(v=>({name:v.name,dur:v.dur,bought:v.bought})),
      dir:m.dir, wr:m.wr, dop:m.dop, ed:m.ed, mus:m.mus, cast:m.cast,
      imdb:m.imdb, imdbVotes:m.imdbVotes, rt:m.rt, rtCount:m.rtCount, mc:m.mc, metaCount:m.metaCount,
      ow:m.ow, on:m.on, aw:m.aw,
      budM:Math.round(m.bud/1e6), wwM:Math.round(m.ww/1e6), domM:Math.round(m.dom/1e6),
      res:m.res, gb:m.gb, hdr:[...(m.hdr||[])], audio:[...(m.audio||[])], audioEng:[...(m.audioEng||[])], subEng:[...(m.subEng||[])], thai:[...(m.thai||[])], g:[...(m.g||[])],
      hasExtra:m.hasExtra, extraSub:m.extraSub||'', buyDate:m.buyDate, buyTime:m.buyTime, price:m.price,
      dur:m.dur||'', iturl:m.iturl||'', oid:m.oid||'', di:m.di||'4K',
      aEng:[...(m.aEng||[])], sEng:[...(m.sEng||[])], aTh:[...(m.aTh||[])], sTh:[...(m.sTh||[])], ws:(m.ws||(m.wd?'W':'n')),
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
        t:(f.t||'').trim()||m.t, th:(f.th||'').trim(), y:I(f.y,m.y), run:I(f.run,m.run), mpaa:f.mpaa, studio:f.studio, color:f.color, aspects:(f.aspects||[]).filter(a=>a.r), versions:[...(f.versions||[])], ar:((f.aspects&&f.aspects[0]&&f.aspects[0].r)||m.ar),
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
      const ws = m.ws||(m.wd?'W':'n');
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
        checkBorder:(ws==='W'?t.accent2:ws==='w'?t.accent:t.line), checkBg:(ws==='W'?t.accent2:ws==='w'?t.accent:'transparent'), checkMark:(ws!=='n'?'✓':''),
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
        eRes:mk('res',m.res), eColor:mk('color',m.color), eAspect:mk('aspect',m.aspect), eAspect2:mk('aspect2',m.aspect2||''), eDi:mk('di',m.di||''),
        eExtraSub:mk('extraSub',m.extraSub||''), eDur:mk('dur',m.dur||''), eBuyDate:mk('buyDate',m.buyDate), eBuyTime:mk('buyTime',m.buyTime), ePrice:mk('price',m.price), eOid:mk('oid',m.oid||''),
        openHdr:()=>this.openFieldMulti(m.id,'hdr'), openAEng:()=>this.openFieldMulti(m.id,'aEng'), openSEng:()=>this.openFieldMulti(m.id,'sEng'),
        openATh:()=>this.openFieldMulti(m.id,'aTh'), openSTh:()=>this.openFieldMulti(m.id,'sTh'), openGenre:()=>this.openFieldMulti(m.id,'g'),
        toggleExtra:()=>this.toggleField(m.id,'hasExtra'),
        // extended display fields
        imdbVotesLabel: m.imdbVotes.toLocaleString('en-US'), rtCountLabel: m.rtCount.toLocaleString('en-US'), mcCountLabel: m.metaCount.toLocaleString('en-US'),
        ow:m.ow, on:m.on, aw:m.aw,
        res:m.res, hdrTags:m.hdr||[], aEngTags:(m.aEng&&m.aEng.length?m.aEng:['—']), sEngTags:(m.sEng&&m.sEng.length?m.sEng:['—']), aThTags:(m.aTh&&m.aTh.length?m.aTh:['—']), sThTags:(m.sTh&&m.sTh.length?m.sTh:['—']),
        color:m.color, aspect:m.aspect, aspect2:(m.aspect2||'—'), di:(m.di||'—'),
        hasExtra:m.hasExtra, extraIcon:m.hasExtra?'✓':'—', extraSub:(m.extraSub||'—'),
        durLabel:(m.dur&&m.dur.trim()?m.dur:'—'), oidLabel:(m.oid&&m.oid.trim()?m.oid:'—'),
        hasIturl:!!(m.iturl&&m.iturl.trim()), iturlIcon:(m.iturl&&m.iturl.trim())?'▶':'—', openIturl:()=>{ if(m.iturl&&m.iturl.trim()){ window.open(m.iturl.trim(),'_blank','noopener'); } },
        iturlChip:(m.iturl&&m.iturl.trim()) ? ('display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,#e486c4,#9b7ad6);color:#fff;cursor:pointer;font-size:11px') : ('color:'+t.muted+';font-weight:700'),
        extraChip: m.hasExtra ? ('display:inline-flex;width:22px;height:22px;border-radius:6px;align-items:center;justify-content:center;background:'+t.accent2+';color:#fff;font-size:12px;font-weight:700') : ('color:'+t.muted+';font-weight:700'),
        buyDate:m.buyDate, buyTime:m.buyTime, priceLabel:'฿'+m.price,
        // hover popup (compact mode = no thumbnails)
        showPop: (!showThumb) && this.state.hoverId===m.id,
        enter:(e)=>this.setHover(m.id, e), leave:()=>this.setHover(null),
        selOn: this.state.sel.includes(m.id), toggleSel:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); this.toggleRow(m.id); }, selMark: this.state.sel.includes(m.id)?'✓':'',
        selChip: this.state.sel.includes(m.id) ? ('flex:none;width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;cursor:pointer;background:'+t.accent2+';border:1.5px solid '+t.accent2) : ('flex:none;width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid '+t.line),
      };
    };
    const GW={info:5, crew:(this.state.crewOpen?5:1), score:6, box:5, status:1, file:2, oscar:3, quality:5, audio:4, itunes:4, purchase:4, custom:this.state.customCols.length};
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
        watchedLabel: {n:'ยังไม่ได้ดู', W:'✓ ดูแล้ว', w:'✓ ดูแล้ว · นานมากจำไม่ค่อยได้'}[sel.ws||(sel.wd?'W':'n')],
        theaterLabel: sel.th2?'เคยดูในโรง':'ยังไม่เคยดูในโรง',
        infoRows:[{k:'แนว',v:(sel.g||[]).join(', ')},{k:'ประเทศ / สตูดิโอ',v:sel.studio},{k:'รางวัล',v:sel.aw},{k:'Oscar (ชนะ/ชิง)',v:sel.ow+' / '+sel.on}],
        crewRows:[{k:'ผู้กำกับ',v:sel.dir},{k:'นักเขียนบท',v:sel.wr},{k:'เรื่อง (Story)',v:sel.story},{k:'ตัวละคร (Characters)',v:sel.chars},{k:'นักแสดงนำ',v:sel.cast},{k:'กำกับภาพ',v:sel.dop},{k:'ตัดต่อ',v:sel.ed},{k:'เพลงประกอบ',v:sel.mus},{k:'โปรดิวเซอร์',v:sel.prod},{k:'ออกแบบงานสร้าง',v:sel.pdes},{k:'ออกแบบเครื่องแต่งกาย',v:sel.cost},{k:'เทคนิคภาพ (VFX)',v:sel.vfx}].filter(function(r){return r.v && r.v!=='—';}),
        boxRows:[{k:'ทุนสร้าง',v:this.money(sel.bud)},{k:'ทั่วโลก',v:this.money(sel.ww)},{k:'ในประเทศ',v:this.money(sel.dom)},{k:'ต่างประเทศ',v:this.money(intl)},{k:'% ในประเทศ',v:Math.round(sel.dom/sel.ww*100)+'%'}],
        fileRows:[{k:'ความละเอียด',v:sel.re.join(' · ')},{k:'DI · มาสเตอร์',v:sel.di||'—'},{k:'ขนาดไฟล์',v:sel.gb.toFixed(1)+' GB'},{k:'ความยาว iTunes',v:(sel.dur&&sel.dur.trim())?sel.dur:'—'},{k:'เสียง อังกฤษ',v:(sel.aEng&&sel.aEng.length)?sel.aEng.map(x=>this.AENG_LABELS[x]||x).join(' · '):'—'},{k:'ซับ อังกฤษ',v:(sel.sEng&&sel.sEng.length)?sel.sEng.join(' · '):'—'},{k:'เสียง ไทย',v:(sel.aTh&&sel.aTh.length)?sel.aTh.join(' · '):'—'},{k:'ซับ ไทย',v:(sel.sTh&&sel.sTh.length)?sel.sTh.join(' · '):'—'},{k:'Aspect',v:(sel.aspect||'—')+(sel.aspect2?' · '+sel.aspect2:'')},{k:'ราคา',v:'฿'+sel.price},{k:'Order ID',v:(sel.oid&&sel.oid.trim())?sel.oid:'—'}],
        iturl:(sel.iturl||''), hasItunes:!!(sel.iturl&&sel.iturl.trim()),
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
    const addAutoGroups = [];
    if(asel){
      const grp=(title, icon, fields)=>{ const rows=fields.filter(f=>f.v!=null && f.v!=='' && f.v!=='—' && f.v!==0 && f.v!=='0').map(f=>({k:f.k, v:String(f.v)})); if(rows.length) addAutoGroups.push({title:title, icon:icon, rows:rows}); };
      grp('ข้อมูลหนัง','🎬',[{k:'ปี',v:asel.y},{k:'แนว',v:asel.genre},{k:'ความยาว',v:asel.runtime?asel.runtime+' นาที':''},{k:'เรท MPAA',v:asel.mpaa},{k:'สตูดิโอ',v:asel.studio}]);
      grp('ทีมงาน · Academy Award categories','🎭',[{k:'Directing',v:asel.dir},{k:'Writing',v:asel.wr},{k:'Story',v:asel.story},{k:'Characters',v:asel.chars},{k:'Cast',v:asel.cast},{k:'Cinematography',v:asel.dop},{k:'Film editing',v:asel.ed},{k:'Music',v:asel.mus},{k:'Producer',v:asel.prod},{k:'Production design',v:asel.pdes},{k:'Costume design',v:asel.cost},{k:'Visual effects',v:asel.vfx}]);
      grp('คะแนน','⭐',[{k:'IMDb',v:asel.imdb},{k:'Rotten Tomatoes',v:asel.rt?asel.rt+'%':''},{k:'Metacritic',v:asel.mc}]);
      grp('Box Office','💰',[{k:'ทุนสร้าง',v:asel.bud?this.money(asel.bud):''},{k:'รายได้ทั่วโลก',v:asel.ww?this.money(asel.ww):''},{k:'รายได้ในประเทศ',v:asel.dom?this.money(asel.dom):''}]);
      grp('ออสการ์','🏆',[{k:'ชนะ',v:asel.ow},{k:'เข้าชิง',v:asel.on},{k:'รางวัล',v:asel.aw}]);
    }

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
    const mkMulti=(field)=> (this.FIELD_OPTIONS[field]||[]).map(o=>{ const on=ef0&&(ef0[field]||[]).includes(o); const lab=(field==='aEng'&&this.AENG_LABELS[o])?this.AENG_LABELS[o]:o; return {label:lab, style:efChip(on), toggle:()=>this.toggleEfArr(field,o)}; });
    const mkSingle=(field,opts)=> opts.map(o=>{ const on=ef0&&ef0[field]===o; return {label:o, style:efChip(on), set:()=>this.setEditField(field,o)}; });
    const efTextFields=['t','th','y','run','studio','dir','wr','dop','ed','mus','cast','imdb','imdbVotes','rt','rtCount','mc','metaCount','ow','on','aw','budM','wwM','domM','gb','buyDate','buyTime','price','dur','iturl','oid'];
    const efH={}; efTextFields.forEach(k=>{ efH[k]=(e)=>this.setEditField(k,e.target.value); });
    const efm = ef0 ? {
      g:mkMulti('g'), hdr:mkMulti('hdr'), audio:mkMulti('audio'), audioEng:mkMulti('audioEng'), subEng:mkMulti('subEng'), thai:mkMulti('thai'),
      aEng:mkMulti('aEng'), sEng:mkMulti('sEng'), aTh:mkMulti('aTh'), sTh:mkMulti('sTh'),
      res:mkSingle('res',['FHD','4K']), di:mkSingle('di',['2K','4K','Spherical','DI','ไม่ระบุ']), color:mkSingle('color',['สี','ขาวดำ','สี + ขาวดำ']),
      efShow4k: !!(ef0 && ef0.res==='4K'),
      wsLabel:{n:'ยังไม่ได้ดู',W:'✓ ดูแล้ว',w:'✓ ดูแล้ว · นานมากจำไม่ค่อยได้'}[ef0.ws||'n'],
      wsStyle:(ef0.ws==='W'?('height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid transparent;background:'+t.accent2+';color:#fff;'):ef0.ws==='w'?('height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid transparent;background:'+t.accent+';color:#fff;'):('height:36px;padding:0 14px;border-radius:9px;font-weight:600;font-size:12.5px;cursor:pointer;border:1px solid '+t.line+';background:'+t.bg+';color:'+t.muted+';')),
      cycleWs:()=>this.setState(s=>({editForm:{...s.editForm, ws:{n:'W',W:'w',w:'n'}[s.editForm.ws||'n']}})),
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
        {label:'FHD', set:()=>this.setManualRes('FHD'), style:this.resChip('FHD',t)},
        {label:'4K', set:()=>this.setManualRes('4K'), style:this.resChip('4K',t)},
      ],
      manualShow4k: this.state.manualRes==='4K',
      manualHdrBtns:['Dolby Vision','HDR'].map(v=>({label:v, set:()=>this.toggleManualAudio('manualHdr',v), style:this.audChip(this.state.manualHdr.indexOf(v)>=0,t)})),
      manualStarArr:[1,2,3,4,5].map(i=>({set:()=>this.setManualStars(i), c:i<=this.state.manualStars?t.gold:t.line})),
      // add-form: ช่องกรอกเอง (ข้อมูลส่วนตัวที่ API ไม่มี)
      manualGb:this.state.manualGb, onManualGb:(e)=>this.setState({manualGb:e.target.value}),
      manualPrice:this.state.manualPrice, onManualPrice:(e)=>this.setState({manualPrice:e.target.value}),
      manualTh:this.state.manualTh, onManualTh:(e)=>this.setState({manualTh:e.target.value}),
      manualPd:this.state.manualPd, onManualPd:(e)=>this.setState({manualPd:e.target.value}),
      manualDur:this.state.manualDur, onManualDur:(e)=>this.setState({manualDur:e.target.value}),
      manualUrl:this.state.manualUrl, onManualUrl:(e)=>this.setState({manualUrl:e.target.value}),
      manualOid:this.state.manualOid, onManualOid:(e)=>this.setState({manualOid:e.target.value}),
      manualAspectRows: this.state.manualAspects.map((a,i)=>{
        const cust=this.ASPECT_OPTIONS.indexOf(a.r)<0;
        return {
        ratio:a.r, note:a.n, custom:cust, notCustom:!cust, ratioSel:cust?'__custom__':a.r,
        options: this.ASPECT_OPTIONS.map(o=>({value:o, label:o})).concat([{value:'__custom__', label:'อื่นๆ (พิมพ์เอง)'}]),
        onSel:(e)=>this.setManualAspect(i,'r',e.target.value==='__custom__'?'':e.target.value),
        onR:(e)=>this.setManualAspect(i,'r',e.target.value), onN:(e)=>this.setManualAspect(i,'n',e.target.value),
        backToList:()=>this.setManualAspect(i,'r','2.39:1'),
        del:()=>this.delManualAspect(i), canDel:this.state.manualAspects.length>1
        };
      }),
      addManualAspect:()=>this.addManualAspect(),
      efAspectRows: (this.state.editForm && this.state.editForm.aspects ? this.state.editForm.aspects : []).map((a,i)=>{
        const cust=this.ASPECT_OPTIONS.indexOf(a.r)<0;
        return {
        ratio:a.r, note:a.n, custom:cust, notCustom:!cust, ratioSel:cust?'__custom__':a.r,
        options: this.ASPECT_OPTIONS.map(o=>({value:o, label:o})).concat([{value:'__custom__', label:'อื่นๆ (พิมพ์เอง)'}]),
        onSel:(e)=>this.setEfAspect(i,'r',e.target.value==='__custom__'?'':e.target.value),
        onR:(e)=>this.setEfAspect(i,'r',e.target.value), onN:(e)=>this.setEfAspect(i,'n',e.target.value),
        backToList:()=>this.setEfAspect(i,'r','2.39:1'),
        del:()=>this.delEfAspect(i), canDel:(this.state.editForm&&this.state.editForm.aspects&&this.state.editForm.aspects.length>1)
        };
      }),
      addEfAspect:()=>this.addEfAspect(),
      manualVersionRows: this.state.manualVersions.map((v,i)=>({
        name:v.name, dur:v.dur, bought:!!v.bought, options: this.VERSION_OPTIONS.map(o=>({value:o, label:o})),
        onName:(e)=>this.setManualVersion(i,'name',e.target.value), onDur:(e)=>this.setManualVersion(i,'dur',e.target.value),
        toggleBought:()=>this.setManualVersion(i,'bought',!v.bought), boughtStyle:this.audChip(!!v.bought,t), del:()=>this.delManualVersion(i)
      })),
      addManualVersion:()=>this.addManualVersion(),
      efVersionRows: (this.state.editForm && this.state.editForm.versions ? this.state.editForm.versions : []).map((v,i)=>({
        name:v.name, dur:v.dur, bought:!!v.bought, options: this.VERSION_OPTIONS.map(o=>({value:o, label:o})),
        onName:(e)=>this.setEfVersion(i,'name',e.target.value), onDur:(e)=>this.setEfVersion(i,'dur',e.target.value),
        toggleBought:()=>this.setEfVersion(i,'bought',!v.bought), boughtStyle:this.audChip(!!v.bought,t), del:()=>this.delEfVersion(i)
      })),
      addEfVersion:()=>this.addEfVersion(),
      manualDi:this.state.manualDi,
      manualDiBtns:['2K','4K','Spherical','DI','ไม่ระบุ'].map(d=>({label:d, set:()=>this.setState({manualDi:d}),
        style:'padding:5px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid '+(this.state.manualDi===d?t.accent2:t.line)+';'+(this.state.manualDi===d?('background:'+t.accent2+';color:#fff;'):('background:'+t.bg+';color:'+t.ink+';'))})),
      manualAEngBtns:['Atmos','7.1','5.1','2.0','AD'].map(v=>({label:this.AENG_LABELS[v]||v, set:()=>this.toggleManualAudio('manualAEng',v), style:this.audChip(this.state.manualAEng.indexOf(v)>=0,t)})),
      manualSEngBtns:this.FIELD_OPTIONS.sEng.map(v=>({label:v, set:()=>this.toggleManualAudio('manualSEng',v), style:this.audChip(this.state.manualSEng.indexOf(v)>=0,t)})),
      manualSubGroups:[
        {label:'Sub', btns:[['มี','Sub'],['US','Sub (US)'],['UK','Sub (UK)'],['US+UK','Sub (US)(UK)']]},
        {label:'CC', btns:[['มี','CC'],['US','CC (US)'],['UK','CC (UK)'],['US+UK','CC (US)(UK)']]},
        {label:'SDH', btns:[['มี','SDH'],['US','SDH (US)'],['UK','SDH (UK)'],['US+UK','SDH (US)(UK)']]}
      ].map(g=>({label:g.label, btns:g.btns.map(b=>({label:b[0], set:()=>this.toggleManualAudio('manualSEng',b[1]), style:this.audChip(this.state.manualSEng.indexOf(b[1])>=0,t)}))})),
      manualAThBtns:['5.1','2.0'].map(v=>({label:v, set:()=>this.toggleManualAudio('manualATh',v), style:this.audChip(this.state.manualATh.indexOf(v)>=0,t)})),
      manualSThBtns:['Sub'].map(v=>({label:v, set:()=>this.toggleManualAudio('manualSTh',v), style:this.audChip(this.state.manualSTh.indexOf(v)>=0,t)})),
      manualWdBtns:[
        {label:'ยังไม่ได้ดู', set:()=>this.setState({manualWd:'n'}), style:this.audChip(this.state.manualWd==='n',t)},
        {label:'✓ ดูแล้ว', set:()=>this.setState({manualWd:'W'}), style:this.audChip(this.state.manualWd==='W',t)},
        {label:'ดูแล้ว · จำไม่ค่อยได้', set:()=>this.setState({manualWd:'w'}), style:this.audChip(this.state.manualWd==='w',t)},
      ],
      manualTh2Btns:[
        {label:'ไม่เคย', set:()=>this.setState({manualTh2:false}), style:this.audChip(!this.state.manualTh2,t)},
        {label:'✓ เคยดูในโรง', set:()=>this.setState({manualTh2:true}), style:this.audChip(this.state.manualTh2,t)},
      ],
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
      cycleEfWs:()=>this.setState(s=>({editForm:{...s.editForm, ws:{n:'W',W:'w',w:'n'}[s.editForm.ws||'n']}})),
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
      addHasPosters: !!(asel && asel.posters && asel.posters.length>1),
      addPosters: (asel && asel.posters) ? asel.posters.map(po=>({
        thumb:po.thumb, full:po.img,
        wrapStyle:'width:62px;height:92px;border-radius:8px;overflow:hidden;cursor:pointer;flex:none;position:relative;border:2.5px solid '+(asel.p===po.path?t.accent2:'transparent')+';box-shadow:'+(asel.p===po.path?('0 0 0 2px '+t.soft):'none')+';transition:all .15s',
        pick:()=>this.pickPoster(po.path), zoom:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); this.setState({posterZoom:{img:po.img, path:po.path}}); }, imgErr:(e)=>this.hideImg(e)
      })) : [],
      showPosterZoom: !!this.state.posterZoom,
      posterZoomImg: this.state.posterZoom?this.state.posterZoom.img:'',
      closePosterZoom:()=>this.setState({posterZoom:null}),
      pickPosterZoom:()=>{ const pz=this.state.posterZoom; if(pz){this.pickPoster(pz.path);} this.setState({posterZoom:null}); },
      addAutoGroups, addCancel:()=>this.addCancel(), addSave:()=>this.addSave(),
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
