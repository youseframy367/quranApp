import React, { useEffect, useState, useRef } from "react";
import Loading from "./loding";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import quranImg from "./img/Group (4).png";
import votart from "./img/Vector 1 (3).png";
import { useLocation, useNavigate } from "react-router-dom";
import startAiatImg from "./img/bismillah-vector-download-vector-bismillah-format-cdr-svg-eps-dodo-5 1 (1).png";
import "./sourHafiz.css";

// ============ إعدادات المخزن (IndexedDB) ============
const DB_NAME = "quranAudioDB";
const STORE_NAME = "audioFiles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function getAudioFromDB(sheikhId, surahNum) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const key = `${sheikhId}_${surahNum}`;
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

// دالة الحساب مع مراعاة البسملة (Offset)
function calculateBackupTimings(ayahs, duration) {
  const BISMILLAH_DURATION = 6.5; // متوسط وقت البسملة بالثواني
  const remainingDuration = duration - BISMILLAH_DURATION;
  const totalWords = ayahs.reduce((sum, a) => sum + (a.wordCount || 1), 0);
  
  let currentTime = BISMILLAH_DURATION; // نبدأ الحساب من بعد البسملة
  
  return ayahs.map(ayah => {
    const ayahDuration = ((ayah.wordCount || 1) / totalWords) * remainingDuration;
    const timing = { from: currentTime, to: currentTime + ayahDuration };
    currentTime += ayahDuration;
    return timing;
  });
}

export default function ShowAiat() {
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const ayahRefs = useRef([]);
  const blobUrlRef = useRef(null);
  const animFrameRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [timings, setTimings] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const surah = location.state?.surah;

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    if (!surah) { navigate("/hafiz"); return; }

    const sheikhData = JSON.parse(sessionStorage.getItem("selectedSheikh") || "{}");
    const { id: sheikhId, server } = sheikhData;
    const surahNum = surah.number;

    getAudioFromDB(sheikhId, surahNum).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setAudioSrc(url);
        setIsOffline(true);
      } else if (sheikhId && server) {
        const num = String(surahNum).padStart(3, "0");
        setAudioSrc(`https://${server}.mp3quran.net/${sheikhId}/${num}.mp3`);
        setIsOffline(false);
      }
    });

    const fetchData = async () => {
      try {
        const [arRes, enRes, wordsRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`),
          fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?words=true&per_page=286`)
        ]);

        const arData = await arRes.json();
        const enData = await enRes.json();
        const wordsData = await wordsRes.json();

        const formatted = arData.data.ayahs.map((a, i) => ({
          ...a,
          translation: enData.data.ayahs[i].text,
          wordCount: wordsData.verses[i]?.words.filter(w => w.char_type_name === "word").length || 1
        }));

        setAyahs(formatted);
        setLoading(false);

        // محاولة جلب التوقيت الحقيقي (لو متاح بيصلح مشكلة البسملة تلقائياً)
        try {
          const tRes = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${surahNum}`);
          const tData = await tRes.json();
          if (tData.audio_files && tData.audio_files[0].verse_timings) {
            const realTimings = tData.audio_files[0].verse_timings.map(vt => ({
              from: vt.timestamp_from / 1000,
              to: vt.timestamp_to / 1000
            }));
            setTimings(realTimings);
            setIsReady(true);
          }
        } catch (e) {
          console.log("Real timings failed, using backup with offset.");
        }
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [surah, navigate]);

  const handleLoadedMetadata = () => {
    if (timings.length === 0) {
      const duration = audioRef.current?.duration;
      if (duration && ayahs.length > 0) {
        const backup = calculateBackupTimings(ayahs, duration);
        setTimings(backup);
        setIsReady(true);
      }
    }
  };

  useEffect(() => {
    if (isReady) {
      setTimeout(() => setCanScroll(true), 1000);
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady || timings.length === 0) return;

    const track = () => {
      const current = audioRef.current?.currentTime || 0;
      let found = -1;

      for (let i = 0; i < timings.length; i++) {
        if (current >= timings[i].from && current < timings[i].to) {
          found = i;
          break;
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
    <div style={{
      backgroundImage: "linear-gradient(to bottom, #53AEA1 , #D4DFDC , #C5D8D3 , #FFFFFF)",
      height: "100vh", width: "100%", overflow: "hidden", position: "relative"
    }}>
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} onLoadedMetadata={handleLoadedMetadata} autoPlay style={{ display: "none" }} />
      )}

      {/* الهيدر */}
      <div style={{
        display: "flex", flexDirection: "column", padding: "20px", position: "relative",
        backgroundImage: "linear-gradient(to bottom, #006754 , #87D1A4)", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", zIndex: 2 }}>
          <div style={{
            position: "absolute", bottom: "10px", left: "20px", fontSize: "11px", color: "#fff",
            background: isOffline ? "#22c55e55" : "#ffffff33", padding: "3px 10px", borderRadius: "20px",
          }}>
            {isOffline ? "🔇 offline" : "🌐 online"}
          </div>
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            lineHeight: ".80", fontFamily: 'Amiri, serif', color: "#fff", flex: 1
          }}>
            <h1 style={{ fontWeight: '700', fontSize: "28px" }}>{surah.arabic}</h1>
            <img src={startAiatImg} alt="basmala" style={{ width: "130px" }} />
          </div>
          <img style={{ width: "80px", height: "80px", transform: "rotate(-10deg)" }} src={quranImg} alt="Quran" />
        </div>
        <img style={{ position: "absolute", bottom: "-30px", left: "-5%", width: "110%", height: "100px", opacity: 0.5 }} src={votart} alt="decoration" />
      </div>

      <ArrowBackIcon
        style={{ width: "24px", height: "24px", position: "absolute", color: "#fff", top: "32px", left: "21px", zIndex: 10 }}
        onClick={() => navigate(-1)}
      />

      {/* منطقة الآيات */}
      <div className="scroll-container" ref={scrollRef} style={{
        padding: "15px", height: "calc(100vh - 180px)", overflowY: "scroll", scrollBehavior: "smooth"
      }}>
        {ayahs.map((ayah, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              ref={(el) => (ayahRefs.current[index] = el)}
              style={{
                marginBottom: "15px", padding: "12px", borderRadius: "10px",
                transition: "all 0.3s",
                background: isActive ? "rgba(0, 103, 84, 0.1)" : "transparent",
                borderRight: isActive ? "4px solid #006754" : "4px solid transparent"
              }}
            >
              <p style={{
                direction: "rtl", fontSize: isActive ? "22px" : "19px",
                fontFamily: "Amiri, serif", color: isActive ? "#003D32" : "#004B40",
                fontWeight: "700"
              }}>
                {ayah.text} <span style={{ fontSize: "12px", color: "#999" }}>({ayah.numberInSurah})</span>
              </p>
              <p style={{ marginTop: "8px", fontSize: "13px", color: isActive ? "#000" : "#666" }}>
                {ayah.translation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}