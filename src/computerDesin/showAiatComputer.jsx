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

// دالة حساب التوقيت بناءً على الكلمات (عشان السكرول يظبط في كل السور)
function generateFallbackTimings(ayahs, duration, hasBasmalah) {
  const START_OFFSET = hasBasmalah ? 5.5 : 0; 
  const effectiveDuration = duration - START_OFFSET;
  const totalWords = ayahs.reduce((sum, a) => sum + (a.wordCount || 1), 0);
  let currentTime = START_OFFSET;

  return ayahs.map((ayah, index) => {
    const ayahDuration = ((ayah.wordCount || 1) / totalWords) * effectiveDuration;
    const timing = {
      verseNumber: index + 1,
      from: currentTime,
      to: currentTime + ayahDuration
    };
    currentTime += ayahDuration;
    return timing;
  });
}

export default function ShowAiatCom() {
  const audioRef = useRef(null);
  const ayahRefs = useRef({}); 
  const lastVerseRef = useRef(-1);
  
  const [ayahs, setAyahs] = useState([]);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isOffline, setIsOffline] = useState(false); // الحالة دي هي اللي بتنور في الهيدر

  const location = useLocation();
  const navigate = useNavigate();
  const surah = location.state?.surah;

  useEffect(() => {
    if (!surah) { navigate("/"); return; }
    
    const loadData = async () => {
      setLoading(true);
      const sheikhData = JSON.parse(sessionStorage.getItem("selectedSheikh") || "{}");

      try {
        // 1. فحص الـ IndexedDB أولاً (Offline Check)
        const audioBlob = await getFromDB("audioFiles", `${sheikhData.id}_${surah.number}`);
        
        if (audioBlob) {
          setAudioSrc(URL.createObjectURL(audioBlob));
          setIsOffline(true); // هنا بنعرف إنه شغال أوفلاين
        } else {
          setAudioSrc(`https://${sheikhData.server}.mp3quran.net/${sheikhData.id}/${String(surah.number).padStart(3, "0")}.mp3`);
          setIsOffline(false); // هنا شغال أونلاين
        }

        // 2. تحميل نص الآيات
        const [arRes, enRes, wordsRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/en.asad`),
          fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.number}?words=true&per_page=286`)
        ]);

        const arData = await arRes.json();
        const enData = await enRes.json();
        const wordsData = await wordsRes.json();

        const formatted = arData.data.ayahs.map((a, i) => {
          let text = a.text;
          if (i === 0 && surah.number !== 1 && surah.number !== 9) {
            text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
          }
          return {
            numberInSurah: a.numberInSurah,
            text,
            translation: enData.data.ayahs[i]?.text || "",
            wordCount: wordsData.verses[i]?.words?.length || 5
          };
        });

        setAyahs(formatted);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    loadData();
  }, [surah]);

  // حساب التوقيتات أول ما الصوت يجهز
  const initTimings = () => {
    if (audioRef.current && ayahs.length > 0) {
      const hasBasmalah = surah.number !== 1 && surah.number !== 9;
      const calculated = generateFallbackTimings(ayahs, audioRef.current.duration, hasBasmalah);
      setTimings(calculated);
    }
  };

  // محرك السكرول التلقائي
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const time = audio.currentTime;
      const current = timings.find(t => time >= t.from && time < t.to);

      if (current && current.verseNumber !== lastVerseRef.current) {
        lastVerseRef.current = current.verseNumber;
        const el = ayahRefs.current[current.verseNumber];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [timings]);

  if (loading) return <Loading />;

  return (
    <div style={{ backgroundImage: "linear-gradient(to bottom, #0B4F47, #0067541C, #AAD4C8)", height: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          autoPlay 
          onLoadedMetadata={initTimings}
          onDurationChange={initTimings}
          style={{ display: "none" }} 
        />
      )}

      {/* Header المظبوط بالـ Offline Badge */}
      <div style={{ margin: "2% 7%", position:'fixed', top:"0%", display: "flex", alignItems: "center", justifyContent: "space-between", height: "170px", borderRadius: "23px", zIndex: 10, width: '86%', backgroundImage: `url(${votart}), linear-gradient(to bottom, #006754 , #87D1A4)`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "center bottom", padding: "20px", color: "#fff" }}>
        <img style={{ width: "100px", height: "60px" }} src={quranImgTow} alt="" />
        
        <div style={{ textAlign: "center", fontFamily: "Amiri, serif", flex: 1 }}>
          <h1 style={{ fontSize: "32px", margin: 0 }}>{surah?.arabic}</h1>
          <img src={startAiatImg} alt="basmala" style={{ width: "180px" }} />
        </div>

        <img style={{ width: "200px", height: "200px", transform: "rotate(-10deg)" }} src={quranImg} alt="Quran" />

        {/* الجزء اللي بيعرف المستخدم أوفلاين ولا أونلاين */}
        <div style={{ 
            position: "absolute", 
            bottom: "10px", 
            left: "20px", 
            fontSize: "11px", 
            background: isOffline ? "#22c55e55" : "#ffffff33", 
            padding: "3px 10px", 
            borderRadius: "20px",
            border: isOffline ? "1px solid #22c55e" : "1px solid #ffffff55"
        }}>
          {isOffline ? "🔇 Offline (Saved)" : "🌐 Online (Streaming)"}
        </div>
      </div>

      <ArrowBackIcon style={{ width: "24px", position: "fixed", color: "#fff", top: "32px", left: "21px", cursor: "pointer", zIndex: 20 }} onClick={() => navigate(-1)} />

      <div className="scroll-container" style={{ padding: "20px", height: "calc(100vh - 250px)", overflowY: "auto", margin: "250px 7% 0px 7%", scrollBehavior: "smooth" }}>
        {ayahs.map((ayah) => (
          <div 
            key={ayah.numberInSurah} 
            ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)} 
            style={{ marginBottom: "25px", padding: "15px", borderBottom: "1px solid #00675433", borderRadius: "12px" }}
          >
            <p style={{ direction: "rtl", fontSize: "22px", fontFamily: "Amiri, serif", color: "#004B40", fontWeight: "700", lineHeight: "1.8" }}>
              {ayah.text} <span style={{ fontSize: "14px", color: "#999" }}>({ayah.numberInSurah})</span>
            </p>
            <p style={{ marginTop: "12px", fontSize: "15px", color: "#555", fontFamily: "sans-serif" }}>{ayah.translation}</p>
          </div>
        ))}
        <div style={{ height: "400px" }}></div>
      </div>
    </div>
  );
}

// دالة IndexedDB
async function getFromDB(storeName, key) {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) { resolve(null); return; }
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
    };
    request.onerror = () => resolve(null);
  });
}