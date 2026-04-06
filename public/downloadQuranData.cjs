// downloadQuranData.cjs
// شغّله: node downloadQuranData.cjs

const fs = require("fs");
const path = require("path");
const https = require("https");

const OUTPUT_DIR = "./public/quranData";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function downloadAll() {
  console.log("بدأ تحميل بيانات القرآن الكريم...\n");

  for (let i = 1; i <= 114; i++) {
    const filePath = path.join(OUTPUT_DIR, `${i}.json`);

    if (fs.existsSync(filePath)) {
      console.log(`سورة ${i} موجودة بالفعل`);
      continue;
    }

    try {
      console.log(`تحميل سورة ${i}...`);
      const [arabicData, transData] = await Promise.all([
        fetchJSON(`https://api.alquran.cloud/v1/surah/${i}/ar.alafasy`),
        fetchJSON(`https://api.alquran.cloud/v1/surah/${i}/en.asad`),
      ]);

      const surahData = {
        number: i,
        ayahs: arabicData.data.ayahs.map((a) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
        })),
        translation: transData.data.ayahs.map((a) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
        })),
      };

      fs.writeFileSync(filePath, JSON.stringify(surahData), "utf8");
      console.log(`تم: سورة ${i}`);

      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`فشل سورة ${i}:`, err.message);
    }
  }

  console.log("\nخلص! كل البيانات في public/quranData/");
}

downloadAll();
