import React, { useEffect, useState, useRef } from "react";
import Loading from "../loding";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import quranImg from "./imgComputer/quran tasbee 1.png";
import votart from "./imgComputer/Vector 1(1).png";
import { useLocation, useNavigate } from "react-router-dom";
import startAiatImg from "./imgComputer/65a01e9511387c604ae7c852ca9a1900605bca88.png";
import "../sourHafiz.css";
import quranImgTow from "./imgComputer/Group(5).png";

const DB_NAME = "quranAudioDB";

// دالة فتح القاعدة مع معالجة الأخطاء
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("audioFiles")) db.createObjectStore("audioFiles");
      if (!db.objectStoreNames.contains("surahContent")) db.createObjectStore("surahContent");
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
    req.onblocked = () => {
      // لو فيه تبويب تاني مفتوح، بنقفل القديم
      console.warn("Database blocked. Please close other tabs.");
    };
  });
}

async function getFromDB(storeName, key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function saveToDB(storeName, key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(data, key);
  } catch (e) { console.error("Save Error", e); }
}

function calculateFallbackTimings(ayahs, duration) {
  const BISMILLAH_OFFSET = 5.5; 
  const effectiveDuration = duration - BISMILLAH_OFFSET;
  const totalWords = ayahs.reduce((sum, a) => sum + (a.wordCount || 1), 0);
  let currentTime = BISMILLAH_OFFSET;
  return ayahs.map(ayah => {
    const ayahDuration = ((ayah.wordCount || 1) / totalWords) * effectiveDuration;
    const timing = { from: currentTime, to: currentTime + ayahDuration };
    currentTime += ayahDuration;
    return timing;
  });
}

export default function ShowAiatCom() {
  const audioRef = useRef(null);
  const ayahRefs = useRef([]);
  const blobUrlRef = useRef(null);
  const animFrameRef = useRef(null);
  const activeIndexRef = useRef(0);
  
  const [timings, setTimings] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false); 
  const [canScroll, setCanScroll] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const surah = location.state?.surah;

  useEffect(() => {
    if (!surah) { navigate("/"); return; }
    
    const loadData = async () => {
      setLoading(true);
      const surahNum = surah.number;
      const sheikhData = JSON.parse(sessionStorage.getItem("selectedSheikh") || "{}");

      try {
        // 1. محاولة جلب الصوت
        const audioBlob = await getFromDB("audioFiles", `${sheikhData.id}_${surahNum}`);
        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob);
          blobUrlRef.current = url;
          setAudioSrc(url);
          setIsOffline(true);
        } else if (sheikhData.id && sheikhData.server) {
          setAudioSrc(`https://${sheikhData.server}.mp3quran.net/${sheikhData.id}/${String(surahNum).padStart(3, "0")}.mp3`);
        }

        // 2. محاولة جلب الآيات من الـ DB
        let cached = await getFromDB("surahContent", surahNum);
        
        if (cached && cached.ayahs && cached.ayahs.length > 0) {
          setAyahs(cached.ayahs);
          setTimings(cached.timings || []);
          setIsReady(true);
          setLoading(false);
        } else {
          // 3. لو مفيش كاش، هات من النت فوراً
          const [arRes, enRes, wordsRes, tRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`),
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`),
            fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?words=true&per_page=286`),
            fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${surahNum}`).catch(() => null)
          ]);

          const arData = await arRes.json();
          const enData = await enRes.json();
          const wordsData = await wordsRes.json();
          
          let realTimings = [];
          if (tRes) {
            const tData = await tRes.json();
            realTimings = tData.audio_files?.[0]?.verse_timings?.map(vt => ({
              from: vt.timestamp_from / 1000,
              to: vt.timestamp_to / 1000
            })) || [];
          }

          const formatted = arData.data.ayahs.map((a, i) => ({
            numberInSurah: a.numberInSurah,
            text: a.text,
            translation: enData.data.ayahs[i]?.text || "",
            wordCount: wordsData.verses[i]?.words.filter(w => w.char_type_name === "word").length || 1,
          }));

          setAyahs(formatted);
          setTimings(realTimings);
          setLoading(false);
          setIsReady(true);
          
          // حفظ في الكاش للمرة الجاية
          saveToDB("surahContent", surahNum, { ayahs: formatted, timings: realTimings });
        }
      } catch (err) {
        console.error("Critical Load Error", err);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [surah, navigate]);

  const handleMetadata = () => {
    if (timings.length === 0 && audioRef.current?.duration) {
      setTimings(calculateFallbackTimings(ayahs, audioRef.current.duration));
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (isReady) setTimeout(() => setCanScroll(true), 3000);
  }, [isReady]);

  useEffect(() => {
    if (!isReady || timings.length === 0) return;
    const track = () => {
      const current = audioRef.current?.currentTime || 0;
      let found = -1;
      for (let i = 0; i < timings.length; i++) {
        if (current >= timings[i].from && current < timings[i].to) {
          found = i; break;
        }
      }
      if (found !== -1 && found !== activeIndexRef.current) {
        activeIndexRef.current = found;
        setActiveIndex(found);
        if (canScroll && ayahRefs.current[found]) {
          ayahRefs.current[found].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      animFrameRef.current = requestAnimationFrame(track);
    };
    animFrameRef.current = requestAnimationFrame(track);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isReady, canScroll, timings]);

  if (loading) return <Loading />;

  return (
    <div style={{ backgroundImage: "linear-gradient(to bottom, #0B4F47, #0067541C, #AAD4C8)", height: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
      {audioSrc && <audio ref={audioRef} src={audioSrc} autoPlay onLoadedMetadata={handleMetadata} style={{ display: "none" }} />}

      <div style={{ margin: "2% 7%", position:'fixed', top:"0%", display: "flex", alignItems: "center", justifyContent: "space-between", height: "170px", borderRadius: "23px", zIndex: 10, width: '86%', backgroundImage: `url(${votart}), linear-gradient(to bottom, #006754 , #87D1A4)`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "center bottom", padding: "20px", color: "#fff" }}>
        <img style={{ width: "100px", height: "60px" }} src={quranImgTow} alt="" />
        <div style={{ textAlign: "center", fontFamily: "Amiri, serif", flex: 1 }}>
          <h1 style={{ fontSize: "32px", margin: 0 }}>{surah?.arabic}</h1>
          <img src={startAiatImg} alt="basmala" style={{ width: "180px" }} />
        </div>
        <img style={{ width: "200px", height: "200px", transform: "rotate(-10deg)" }} src={quranImg} alt="Quran" />
        <div style={{ position: "absolute", bottom: "10px", left: "20px", fontSize: "11px", background: isOffline ? "#22c55e55" : "#ffffff33", padding: "3px 10px", borderRadius: "20px" }}>
          {isOffline ? "🔇 offline" : "🌐 online"}
        </div>
      </div>

      <ArrowBackIcon style={{ width: "24px", position: "fixed", color: "#fff", top: "32px", left: "21px", cursor: "pointer", zIndex: 20 }} onClick={() => navigate(-1)} />

      <div className="scroll-container" style={{ padding: "20px", height: "calc(100vh - 250px)", overflowY: "scroll", scrollBehavior: "smooth", margin: "250px 7% 0px 7%" }}>
        {ayahs.length > 0 ? ayahs.map((ayah, index) => (
          <div key={index} ref={(el) => (ayahRefs.current[index] = el)} style={{ marginBottom: "25px", padding: "15px", borderBottom: "1px solid #00675433", borderRadius: "12px", background: index === activeIndex ? "linear-gradient(to left, #006754aa, #87D1A433)" : "transparent", transition: "all 0.4s" }}>
            <p style={{ direction: "rtl", fontSize: index === activeIndex ? "24px" : "21px", fontFamily: "Amiri, serif", color: index === activeIndex ? "#003D32" : "#004B40", fontWeight: "700", lineHeight: "1.8" }}>
              {ayah.text} <span style={{ fontSize: "14px", color: index === activeIndex ? "#000" : "#999", fontWeight: "normal" }}>({ayah.numberInSurah})</span>
            </p>
            <p style={{ marginTop: "12px", fontSize: "15px", color: index === activeIndex ? "#222" : "#555", fontFamily: "sans-serif" }}>{ayah.translation}</p>
          </div>
        )) : <div style={{textAlign:'center', color:'#fff'}}>جاري تحميل الآيات...</div>}
      </div>
    </div>
  );
}