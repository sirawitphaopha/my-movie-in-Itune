/* api.js — ตัวเชื่อมข้อมูลหนังจริง (TMDb สำหรับค้นหา+โปสเตอร์ · OMDb สำหรับคะแนน)
 * คืนข้อมูลตาม data model ของแอป (ช่องเดียวกับที่ตาราง/การ์ดใช้)
 *
 * โหมดกุญแจ (สลับอัตโนมัติ):
 *  - ในเครื่อง (local): มี config.js → เรียก TMDb/OMDb ตรง ใส่กุญแจใน URL
 *  - บนเน็ต (online): ไม่มี config.js → เรียกผ่าน "ตัวกลาง" /api/tmdb, /api/omdb
 *    (Cloudflare Pages Functions เก็บกุญแจเป็น env var ฝั่งเซิร์ฟเวอร์ — กุญแจไม่หลุดมากับหน้าเว็บ)
 */
(function (global) {
  'use strict';
  var cfg = global.MOVIE_CONFIG || {};
  var TMDB = cfg.TMDB_KEY || '';
  var OMDB = cfg.OMDB_KEY || '';
  var USE_PROXY = !TMDB;            // ไม่มีกุญแจในเครื่อง = อยู่บนเน็ต = เรียกผ่านตัวกลาง
  var TMDB_BASE = 'https://api.themoviedb.org/3';
  var IMG = 'https://image.tmdb.org/t/p/w500';

  // TMDb ใช้ชื่อแนวบางอันไม่ตรงกับแอป → แปลงให้ตรง
  var GENRE_MAP = { 'Science Fiction': 'Sci-Fi' };

  // สร้าง URL ของ TMDb — สลับระหว่างเรียกตรง (local) กับผ่านตัวกลาง (online)
  function tmdbURL(path, params) {
    if (USE_PROXY) return '/api/tmdb' + path + (params ? ('?' + params) : '');
    return TMDB_BASE + path + '?api_key=' + TMDB + (params ? ('&' + params) : '');
  }
  // สร้าง URL ของ OMDb เช่นกัน (params = query string ที่ยังไม่รวมกุญแจ)
  function omdbURL(params) {
    if (USE_PROXY) return '/api/omdb?' + params;
    return 'https://www.omdbapi.com/?apikey=' + OMDB + '&' + params;
  }

  function tmdb(path, params) {
    return fetch(tmdbURL(path, params)).then(function (r) { return r.json(); });
  }

  function crewBy(crew, jobs) {
    var names = crew.filter(function (c) { return jobs.indexOf(c.job) >= 0; }).map(function (c) { return c.name; });
    // เอาชื่อไม่ซ้ำ สูงสุด 2 คน
    var uniq = [];
    names.forEach(function (n) { if (uniq.indexOf(n) < 0) uniq.push(n); });
    return uniq.length ? uniq.slice(0, 2).join(', ') : '—';
  }

  /* ค้นหาหนัง → คืนผลลัพธ์แบบย่อ (ไว้โชว์ในหน้าเพิ่มหนัง) */
  function search(query) {
    if (!query) return Promise.resolve([]);
    return tmdb('/search/movie', 'include_adult=false&query=' + encodeURIComponent(query))
      .then(function (j) {
        return (j.results || []).slice(0, 12).map(function (m) {
          return {
            tmdbId: m.id,
            t: m.title,
            y: (m.release_date || '').slice(0, 4),
            p: m.poster_path || '',
            img: m.poster_path ? (IMG + m.poster_path) : '',
            hasImg: !!m.poster_path,
            overview: m.overview || ''
          };
        });
      })
      .catch(function (e) { console.warn('[api] ค้นหาพลาด', e); return []; });
  }

  /* ดึงรายละเอียดเต็ม (TMDb + OMDb พร้อมกัน) → object หนังตาม data model
   * รับ result = {tmdbId, t, y} (จากผลค้นหา) เพื่อยิง OMDb ด้วยชื่อ+ปีขนานไปเลย ไม่ต้องรอ imdb_id */
  function details(result) {
    if (typeof result === 'number' || typeof result === 'string') result = { tmdbId: result };
    var tmdbP = tmdb('/movie/' + result.tmdbId, 'append_to_response=credits,release_dates,external_ids,images,translations&include_image_language=en,null');
    var omdbP = result.t
      ? fetch(omdbURL('t=' + encodeURIComponent(result.t) + (result.y ? ('&y=' + result.y) : '')))
          .then(function (r) { return r.json(); }).catch(function () { return null; })
      : Promise.resolve(null);

    return Promise.all([tmdbP, omdbP]).then(function (arr) {
        var d = arr[0] || {};
        var omdbEarly = arr[1];
        var crew = (d.credits && d.credits.crew) || [];
        var cast = (d.credits && d.credits.cast) || [];

        // เรท MPAA จาก release_dates (US)
        var mpaa = '—';
        try {
          var us = (d.release_dates.results || []).find(function (r) { return r.iso_3166_1 === 'US'; });
          if (us) {
            var cert = (us.release_dates || []).map(function (x) { return x.certification; }).filter(Boolean)[0];
            if (cert) mpaa = cert;
          }
        } catch (e) {}

        var genres = (d.genres || []).map(function (g) { return GENRE_MAP[g.name] || g.name; });

        // ชื่อไทยจาก translations (TMDb) — ถ้ามีคนแปลไว้
        var thaiTitle = '';
        try {
          var trans = (d.translations && d.translations.translations) || [];
          var thTr = trans.find(function (x) { return x.iso_639_1 === 'th'; });
          if (thTr && thTr.data && thTr.data.title) thaiTitle = thTr.data.title;
        } catch (e) {}

        var movie = {
          p: d.poster_path || '',
          t: d.title || '',
          th: thaiTitle,                // ชื่อไทยจาก API (ถ้ามี) ไม่งั้นเว้นว่างให้กรอกเอง
          y: parseInt((d.release_date || '').slice(0, 4), 10) || 0,
          g: genres,
          run: d.runtime || 0,
          mpaa: mpaa,
          studio: (d.production_companies && d.production_companies[0] && d.production_companies[0].name) || '—',
          dir: crewBy(crew, ['Director']),
          wr: crewBy(crew, ['Screenplay', 'Writer']),
          story: crewBy(crew, ['Story']),
          chars: crewBy(crew, ['Characters']),
          cast: cast.slice(0, 3).map(function (c) { return c.name; }).join(', ') || '—',
          dop: crewBy(crew, ['Director of Photography', 'Cinematography']),
          ed: crewBy(crew, ['Editor']),
          mus: crewBy(crew, ['Original Music Composer', 'Music']),
          prod: crewBy(crew, ['Producer']),
          pdes: crewBy(crew, ['Production Design']),
          cost: crewBy(crew, ['Costume Design']),
          vfx: crewBy(crew, ['Visual Effects Supervisor', 'VFX Supervisor', 'Visual Effects Producer']),
          bud: d.budget || 0,
          ww: d.revenue || 0,
          dom: 0,
          syn: d.overview || '',
          imdbId: (d.external_ids && d.external_ids.imdb_id) || '',
          imdb: d.vote_average ? Number(d.vote_average.toFixed(1)) : 0,
          posters: ((d.images && d.images.posters) || []).slice(0, 12).map(function (im) {
            return { path: im.file_path, img: IMG + im.file_path, thumb: 'https://image.tmdb.org/t/p/w185' + im.file_path };
          }),
          rt: 0, mc: 0, aw: '—', ow: 0, on: 0
        };

        // เสริมคะแนน IMDb/RT/Meta + รางวัล + box office จาก OMDb (ดึงขนานมาพร้อมกันแล้ว)
        var o = omdbEarly;
        if (o && o.Response === 'True') {
          if (o.imdbRating && o.imdbRating !== 'N/A') movie.imdb = parseFloat(o.imdbRating) || movie.imdb;
          (o.Ratings || []).forEach(function (r) {
            if (r.Source === 'Rotten Tomatoes') movie.rt = parseInt(r.Value, 10) || 0;
            if (r.Source === 'Metacritic') movie.mc = parseInt(r.Value, 10) || 0;
          });
          if (!movie.mc && o.Metascore && o.Metascore !== 'N/A') movie.mc = parseInt(o.Metascore, 10) || 0;
          if (o.Awards && o.Awards !== 'N/A') movie.aw = o.Awards;
          if (movie.mpaa === '—' && o.Rated && o.Rated !== 'N/A') movie.mpaa = o.Rated;
          if (o.BoxOffice && o.BoxOffice !== 'N/A') movie.dom = parseInt(o.BoxOffice.replace(/[^0-9]/g, ''), 10) || 0;
          if (!movie.imdbId && o.imdbID) movie.imdbId = o.imdbID;
          var win = /Won (\d+) Oscar/i.exec(o.Awards || ''); if (win) movie.ow = parseInt(win[1], 10) || 0;
          var nom = /Nominated for (\d+) Oscar/i.exec(o.Awards || ''); if (nom) movie.on = parseInt(nom[1], 10) || 0;
        }
        return movie;
      });
  }

  // พร้อมใช้เสมอ: local มีกุญแจ / online มีตัวกลาง (proxy)
  global.MovieAPI = { ready: true, search: search, details: details, IMG: IMG };
})(window);
