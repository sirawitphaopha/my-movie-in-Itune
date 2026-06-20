/* functions/api/tmdb/[[path]].js
 * ตัวกลาง (proxy) สำหรับ TMDb — รับคำขอจากหน้าเว็บ แล้วเติมกุญแจ (เก็บเป็น env var ฝั่งเซิร์ฟเวอร์)
 * จับทุกเส้นทางใต้ /api/tmdb/...  เช่น /api/tmdb/search/movie , /api/tmdb/movie/27205
 * กุญแจ TMDB_KEY ตั้งใน Cloudflare Pages → Settings → Environment variables
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // params.path = ส่วนที่อยู่หลัง /api/tmdb/ (อาร์เรย์) → ต่อกลับเป็น path เดิม
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');

  // คัดลอก query string เดิมจากหน้าเว็บ แล้วเติมกุญแจเข้าไป
  const incoming = new URL(request.url);
  const qs = new URLSearchParams(incoming.search);
  qs.set('api_key', env.TMDB_KEY || '');

  const target = 'https://api.themoviedb.org/3/' + path + '?' + qs.toString();

  try {
    const r = await fetch(target, { headers: { accept: 'application/json' } });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=86400'  // แคช 1 วัน ลดการยิงซ้ำ
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'tmdb proxy failed' }), {
      status: 502, headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
}
