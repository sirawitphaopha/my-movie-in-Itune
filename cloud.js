/* cloud.js — เชื่อมคลังหนังกับคลาวด์ (Supabase)
 * เก็บทั้งคลังเป็นก้อน JSON ก้อนเดียว (ยังไม่มีล็อกอิน — ใช้แถว id='shared')
 * ตอนทำระบบล็อกอิน (ขั้น 2.3 ท้ายสุด) จะเปลี่ยนเป็นผูกกับผู้ใช้แต่ละคน
 */
(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://ryewggkhunpuipgkgbfv.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_cSCNAQextpTq9SzUt189uw_lemUK6Ah';
  var TABLE = 'movie_state';
  var ROW_ID = 'shared';            // ก้อนเดียว (ยังไม่มีล็อกอิน)
  var DEBOUNCE_MS = 800;            // รอ 0.8 วิ ค่อยส่งขึ้นคลาวด์ กันยิงถี่

  var sb = null;
  try {
    if (global.supabase && global.supabase.createClient) {
      sb = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
      });
    } else {
      console.warn('[cloud] ไม่พบ supabase-js — แอปจะทำงานแบบเก็บในเครื่องอย่างเดียว');
    }
  } catch (e) {
    console.warn('[cloud] สร้าง client ไม่สำเร็จ', e);
  }

  var saveTimer = null;

  global.MovieCloud = {
    ready: !!sb,

    /* โหลดคลังจากคลาวด์ → คืน blob (object) หรือ null ถ้าไม่มี/พลาด */
    load: function () {
      if (!sb) return Promise.resolve(null);
      return sb.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle()
        .then(function (res) {
          if (res.error) { console.warn('[cloud] โหลดพลาด:', res.error.message); return null; }
          return res.data ? res.data.data : null;
        })
        .catch(function (e) { console.warn('[cloud] โหลดพลาด', e); return null; });
    },

    /* บันทึกขึ้นคลาวด์ (debounce กันยิงถี่ตอนพิมพ์/กดรัวๆ) */
    save: function (blob) {
      if (!sb) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        sb.from(TABLE)
          .upsert({ id: ROW_ID, data: blob, updated_at: new Date().toISOString() })
          .then(function (res) { if (res.error) console.warn('[cloud] บันทึกพลาด:', res.error.message); })
          .catch(function (e) { console.warn('[cloud] บันทึกพลาด', e); });
      }, DEBOUNCE_MS);
    }
  };
})(window);
