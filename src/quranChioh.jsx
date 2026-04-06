import React, { useEffect, useState, useRef } from "react";
import ComponentRepeat from "./ncomponntRepeat";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import quranImg from "./img/Group (4).png"; 
import "./sourHafiz.css";

// ============ إعدادات المخزن (IndexedDB) ============
const DB_NAME = "quranAudioDB";
const STORE_NAME = "audioFiles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => {
      if (!e.target.result.objectStoreNames.contains(STORE_NAME)) {
        e.target.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function isSurahCached(sheikhId, surahNum) {
  const db = await openDB();
  return new Promise((resolve) => {
    const key = `${sheikhId}_${surahNum}`;
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getKey(key);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

async function saveSurahToDB(sheikhId, surahNum, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const key = `${sheikhId}_${surahNum}`;
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

async function countCachedSurahs(sheikhId) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      const keys = req.result;
      const count = keys.filter(key => typeof key === 'string' && key.startsWith(`${sheikhId}_`)).length;
      resolve(count);
    };
    req.onerror = () => resolve(0);
  });
}

// ============ تقسيم الشيوخ إلى 4 أقسام ============
export const categorizedChioh = {
  "ترتيل هادئ": [
    { name: "محمد صديق المنشاوي", id: "minsh", server: "server10" },
    { name: "محمود خليل الحصري", id: "husr", server: "server13" },
    { name: "عبد الباسط عبد الصمد", id: "basit", server: "server7" },
    { name: "محمود علي البنا", id: "bna", server: "server8" },
    { name: "مصطفى إسماعيل", id: "mustafa/Almusshaf-Al-Mojawwad", server: "server8" },
    { name: "محمد الطبلاوي", id: "tblawi", server: "server12" },
    { name: "أحمد نعينع", id: "ahmad_nu", server: "server11" },
  ],
  "أئمة الحرمين": [
    { name: "ماهر المعيقلي", id: "maher", server: "server12" },
    { name: "عبد الرحمن السديس", id: "sds", server: "server11" },
    { name: "سعود الشريم", id: "shur", server: "server7" },
    { name: "ياسر الدوسري", id: "yasser", server: "server11" },
    { name: "عبد الله عواد الجهني", id: "jhn", server: "server13" },
    { name: "صلاح البدير", id: "s_bud", server: "server6" },
    { name: "علي الحذيفي", id: "thubti", server: "server6" },
  ],
  "أصوات حديثة": [
    { name: "إسلام صبحي", id: "islam/Rewayat-Hafs-A-n-Assem", server: "server14" },
    { name: "مشاري العفاسي", id: "afs", server: "server8" },
    { name: "سعد الغامدي", id: "s_gmd", server: "server7" },
    { name: "أحمد العجمي", id: "ajm", server: "server10" },
    { name: "فارس عباد", id: "frs_a", server: "server8" },
    { name: "رعد الكردي", id: "raad", server: "server12" },
    { name: "هزاع البلوشي", id: "hazza", server: "server11" },
    { name: "ناصر القطامي", id: "qtm", server: "server6" },
  ],
  "قراءات نادرة": [
    { name: "محمد رفعت", id: "refat", server: "server14" },
    { name: "عبد الله بصفر", id: "bsfr", server: "server6" },
    { name: "محمد جبرائيل", id: "jbrl", server: "server8" },
    { name: "أبو بكر الشاطري", id: "shatri", server: "server11" },
    { name: "العيون الكوشي", id: "koshi", server: "server11" },
    { name: "إدريس أبكر", id: "abkr", server: "server6" },
    { name: "محمد أيوب", id: "ayyoub2/Rewayat-Hafs-A-n-Assem", server: "server16" },
  ]
};

const allChioh = Object.values(categorizedChioh).flat();

export default function ChiohChoise() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ترتيل هادئ");
  const [downloadState, setDownloadState] = useState({});
  const [progress, setProgress] = useState({});
  const pauseFlags = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      const states = {};
      const progresses = {};
      for (const sheikh of allChioh) {
        const count = await countCachedSurahs(sheikh.id);
        const pct = Math.round((count / 114) * 100);
        progresses[sheikh.id] = pct;
        if (count === 114) states[sheikh.id] = "done";
        else if (count > 0) states[sheikh.id] = "paused";
        else states[sheikh.id] = "idle";
      }
      setDownloadState(states);
      setProgress(progresses);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const goToSurah = (item) => {
    sessionStorage.setItem("selectedSheikh", JSON.stringify({ id: item.id, server: item.server, name: item.name }));
    navigate("/hafiz");
  };

  const startDownload = async (e, item) => {
    e.stopPropagation();
    if (downloadState[item.id] === "downloading" || downloadState[item.id] === "done") return;
    pauseFlags.current[item.id] = false;
    setDownloadState((prev) => ({ ...prev, [item.id]: "downloading" }));
    let count = await countCachedSurahs(item.id);
    for (let i = 1; i <= 114; i++) {
      if (pauseFlags.current[item.id]) return;
      const already = await isSurahCached(item.id, i);
      if (already) continue;
      const num = String(i).padStart(3, "0");
      const url = `https://${item.server}.mp3quran.net/${item.id}/${num}.mp3`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        await saveSurahToDB(item.id, i, blob);
        count++;
        setProgress((prev) => ({ ...prev, [item.id]: Math.round((count / 114) * 100) }));
      } catch (err) { console.warn(`فشل تحميل سورة ${i}`); }
    }
    setDownloadState((prev) => ({ ...prev, [item.id]: "done" }));
  };

  const pauseDownload = (e, item) => {
    e.stopPropagation();
    pauseFlags.current[item.id] = true;
    setDownloadState((prev) => ({ ...prev, [item.id]: "paused" }));
  };

  const renderRightSide = (item) => {
    const state = downloadState[item.id] || "idle";
    const pct = progress[item.id] || 0;
    if (state === "done") {
      return (
        <div style={{ position: "relative" }}>
          <img src={quranImg} alt="done" style={{ width: "55px", height: "55px", opacity: 0.8 }} />
          <div style={{ position: "absolute", top: 0, right: 0, background: "#22c55e", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>✓</div>
        </div>
      );
    }
    if (state === "downloading") {
      const radius = 22;
      const circ = 2 * Math.PI * radius;
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={(e) => pauseDownload(e, item)}>
          <div style={{ position: "relative", width: "55px", height: "55px" }}>
            <svg width="55" height="55">
              <circle cx="27" cy="27" r={radius} fill="none" stroke="#eee" strokeWidth="3" />
              <circle cx="27" cy="27" r={radius} fill="none" stroke="#006754" strokeWidth="3" strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ} transform="rotate(-90 27 27)" style={{ transition: "0.3s" }} />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "10px", height: "10px", borderLeft: "3px solid #006754", borderRight: "3px solid #006754" }} />
          </div>
          <span style={{ fontSize: "10px", color: "#006754" }}>{pct}%</span>
        </div>
      );
    }
    return (
      <div onClick={(e) => startDownload(e, item)} style={{ width: "50px", height: "50px", borderRadius: "50%", border: "2px solid #006754", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {state === "paused" ? <span style={{ fontSize: "10px", color: "#006754" }}>{pct}%</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006754" strokeWidth="2"><path d="M12 5v10M7 15l5 5 5-5M4 20h16" /></svg>}
      </div>
    );
  };

return (
    <div style={{
      backgroundImage: "linear-gradient(to bottom, #53AEA1 , #D4DFDC , #C5D8D3 , #FFFFFF)",
      minHeight: "100vh", 
      padding: "10px 0", // قللت البادينج اللي فوق عشان الهيدر الجديد
      width: "100%", 
      boxSizing: "border-box", 
      overflow: "hidden", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center"
    }}>

      {/* الهيدر الجديد: الأيقونة والفلتر جنب بعض */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        
        width: "100%", 
        maxWidth: "450px", 
        gap: "10px", 
        marginBottom: "20px",
        marginTop: "20px", // مسافة عشان نوتش الموبايل
        padding: "0"
      }}>
        
        {/* أيقونة الرجوع */}
        <div 
          onClick={() => navigate(-1)} 
          style={{ 
            cursor: "pointer", 
            width: "40px", 
            height: "40px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            backgroundColor: "rgba(0, 103, 84, 0.8)", 
            borderRadius: "12px", 
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            flexShrink: 0 // تمنع الأيقونة إنها تصغر في الشاشات الضيقة
          }}
        >
          <ArrowBackIcon style={{ color: "#fff", fontSize: "20px" }} />
        </div>

        {/* التابس (الفلتر) */}
        <div 
          className="hide-scrollbar"
          style={{ 
            display: "flex", 
            gap: "8px", 
            overflowX: "auto", 
            flexGrow: 1, 
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            padding: "5px 0"
          }} 
        >
          {Object.keys(categorizedChioh).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{
                padding: "8px 16px", 
                borderRadius: "20px", 
                border: "none", 
                fontSize: "11px", 
                fontWeight: "bold", 
                whiteSpace: "nowrap",
                fontFamily: "Cairo, sans-serif",
                backgroundColor: activeTab === tab ? "#006754" : "rgba(255,255,255,0.8)", 
                color: activeTab === tab ? "#fff" : "#006754", 
                boxShadow: activeTab === tab ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 5px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                flexShrink: 0
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الشيوخ */}
      <div ref={scrollContainerRef} className="scroll-container" style={{ width: "100%", overflowY: "auto", height: "calc(100vh - 150px)" }}>
        <ul style={{ display: "flex", flexDirection: "column", gap: "15px", padding: 0, margin: "0 auto", width: "90%", maxWidth: "370px", listStyle: "none" }}>
          {categorizedChioh[activeTab].map((item, index) => (
            <li key={index} onClick={() => goToSurah(item)} style={{ width: "100%", display: "flex", justifyContent: "center", transition: "0.1s" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"} onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ width: "100%" }}>
                <ComponentRepeat nameContent={item.name} lastSora="القرآن الكريم" rightContent={renderRightSide(item)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}