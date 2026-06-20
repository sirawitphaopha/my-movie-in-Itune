# CLAUDE.md — คู่มือโปรเจกต์ "คลังหนังของฉัน"

คู่มือสำหรับ Claude (แคลร์) เวลามาทำงานโปรเจกต์นี้ · เจ้าของ = พี่กัน (สิรวิชญ์ เผ่าผา)
> กฎการสื่อสาร/ภาษา/commit/push → อ่าน MEMORY.md ส่วนกลางก่อนเสมอ

## โปรเจกต์นี้คืออะไร
เว็บเก็บข้อมูลหนังที่ซื้อใน iTunes/Apple TV (ใช้คนเดียว) · UI ภาษาไทย
- Local: `D:\movie-library`
- GitHub: https://github.com/sirawitphaopha/my-movie-in-Itune
- ที่มา: พอร์ตจาก prototype ของ Claude design (เก็บไว้ที่ `D:\movie-platform` — อ้างอิงเท่านั้น ไม่ใช่ของจริง)

## 🧠 สถาปัตยกรรม (สำคัญสุด — เข้าใจอันนี้ก่อนแก้)
แอปนี้ **ไม่มีขั้นตอน build** ใช้ React โหลดจาก CDN + ไฟล์ JS ธรรมดา

หัวใจคือแยก "หน้าตา" ออกจาก "สมอง" แบบ MVVM:
1. **`app.js`** — `class App extends React.Component` (พอร์ตจาก logic เดิมเกือบ 1:1)
   - เมธอด `renderVals()` = หัวใจ — คืน object ~250 binding (ค่าที่คำนวณแล้ว + ฟังก์ชันปุ่ม + view-model ของการ์ด/แถว)
   - `render()` = `window.DC.renderTemplate(this.renderVals())`
2. **`template.html`** — markup ทั้งแอป เขียนด้วย directive พิเศษ:
   - `{{ path }}` = ดึงค่าจาก renderVals (เป็น path ล้วนๆ เช่น `m.stars`)
   - `<sc-if value="{{ cond }}">` = แสดงเมื่อจริง
   - `<sc-for list="{{ arr }}" as="x">` = วนลูป
   - `onClick="{{ handler }}"`, `style="..."`, `style-hover="..."`, `style-focus="..."`
3. **`dc-runtime.js`** — ตัวแปลที่แคลร์เขียนเอง (~200 บรรทัด): parse `template.html` เป็น XML แล้วเดินทรีสร้าง React element โดย resolve `{{ }}` กับ scope
   - `style-hover/focus` ทำผ่านคอมโพเนนต์ `Hov` (merge style ตอน hover/focus)
   - input/textarea/select: แปลง `onInput` → `onChange` อัตโนมัติ

**แก้ตรงไหน:**
- เปลี่ยน**หน้าตา/layout** → แก้ `template.html`
- เปลี่ยน**ตรรกะ/ข้อมูล/พฤติกรรม** → แก้ `app.js`
- ตัวแปลเองมีบั๊ก (พวก directive) → แก้ `dc-runtime.js`

## 📁 ไฟล์
```
index.html      โหลด React (CDN) + dc-runtime.js + app.js (มี ?v= กัน cache)
app.js          logic + ข้อมูล seed + POOL + APP_VERSION/BUILD_DATE
template.html   markup ทั้งแอป (fetch ตอนรันด้วย {cache:'no-cache'})
dc-runtime.js   ตัวแปลเทมเพลต → React
styles.css      reset + keyframes (spin/fadeUp/slideIn/pop/barGrow/pulse)
```

## 🏷️ ออกเวอร์ชันใหม่ (bump version) — แก้ 3 จุด
1. `app.js` บนสุด: `const APP_VERSION = 'X.X';` + `const BUILD_DATE = 'DD เดือนย่อ พ.ศ.';`
2. `index.html`: เปลี่ยน `?v=X.X` ที่ `<script src>` ทั้ง 2 ตัว (กันเบราว์เซอร์โหลดของเก่า)
3. footer แสดงเอง (binding `appVersion`/`buildDate`)
- ⚠️ อย่า bump เอง — รอพี่กันสั่ง · เช็ค `git log` ของ remote ก่อนเสมอว่า version ล่าสุดที่ push จริงคืออะไร

## ⚠️ จุดที่ยัง "ปลอม" (ปลอมมาตั้งแต่ prototype — รอทำจริง)
- **เพิ่มหนัง**: ค้นจาก `POOL` (รายชื่อฝังในโค้ด) ไม่ใช่ API จริง · "กำลังโหลด" เป็น setTimeout หลอก
- **รีเฟรชจาก API** (แผงรายละเอียด): หมุนเล่นๆ ไม่ดึงจริง
- **csvImport()** ในป๊อปอัป: toast หลอก "นำเข้า 247 แถว" (แต่ `importCsvFile()` จากไฟล์จริง = ทำงานจริง)
- เก็บข้อมูลแค่ localStorage (`mc_lib_v2`) เครื่องเดียว

## 🗺️ Roadmap
- ✅ ด่าน 1: พอร์ตเป็น React มาตรฐาน (เสร็จ v0.9) — seed เหลือ Dune เรื่องเดียว
- ⏳ ด่าน 2: เชื่อม Supabase + login → sync ทุกเครื่อง
- ⏳ ด่าน 3: ต่อ API จริง (TMDb/OMDb) → เพิ่มหนัง/รีเฟรช ใช้ได้จริง
- ⏳ ด่าน 4: ใส่หนังจริงของพี่กัน
- ⏳ ด่าน 5: deploy (Cloudflare Pages — เป็นเว็บ static ใช้ Pages ไม่ใช่ Workers)

## 🧪 รันเทส local
`python -m http.server 8770` ที่โฟลเดอร์นี้ → เปิด `localhost:8770`
(แก้เทมเพลตแล้วต้อง hard-refresh หรือเพิ่ม `?cb=` กัน cache)
