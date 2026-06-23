/* ===== เวอร์ชัน + วันที่เผยแพร่ (แก้ที่นี่ที่เดียวเวลาออกเวอร์ชันใหม่) ===== */
const APP_VERSION = '0.9.6.0';
const BUILD_DATE = '23 มิ.ย. 2569';

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
    manualSource: [],
    manualSourceInput: '',
    efSourceInput: '',
    manualColor: 'สี',
    manualFilmLen: '',
    manualTime: '',
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
  SOURCE_OPTIONS = ['1080p','2K','2.8K','3.2K','3.4K','4K','4.5K','5K','6K','6.5K','7K','8K'];
  COLOR_OPTIONS = ['สี','ขาวดำ','สี+ขาวดำ'];
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

  GROUP_ORDER = [null,'genre','y','studio','wd'];
  GROUP_LABELS = {genre:'แนวหนัง', y:'ปี', studio:'สตูดิโอ', wd:'สถานะการดู'};
  render() {
    return window.DC.renderTemplate(this.renderVals());
  }
}
