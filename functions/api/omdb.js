/* functions/api/omdb.js
 * ตัวกลาง (proxy) สำหรับ OMDb — รับคำขอจากหน้าเว็บ แล้วเติมกุญแจ (เก็บเป็น env var ฝั่งเซิร์ฟเวอร์)
 * เรียกที่ /api/omdb?t=ชื่อหนัง&y=ปี
 * กุญแจ OMDB_KEY ตั้งใน Cloudflare Pages → Settings → Environment variables
 */
export async function onRequest(context) {
  const { request, env } = context;

  // คัดลอก query string เดิม (t, y, ...) แล้วเติมกุญแจ
  const incoming = new URL(request.url);
  const qs = new URLSearchParams(incoming.search);
  qs.set('apikey', env.OMDB_KEY || '');

  const target = 'https://www.omdbapi.com/?' + qs.toString();

  try {
    const r = await fetch(target, { headers: { accept: 'application/json' } });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=86400'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ Response: 'False', Error: 'omdb proxy failed' }), {
      status: 502, headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
}
