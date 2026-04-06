import React, { useEffect, useState, useRef } from "react";
import ComponentRepeatCom from "../ncomponntRepeat";
import quranImg from "./imgComputer/quran tasbee 1.png";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../sourHafiz.css";
import votart from "./imgComputer/Vector 1(1).png";

// ============ تقسيم الشيوخ (نفس تصنيفات الموبايل) ============
const categorizedChioh = {
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

// ============ IndexedDB Utilities ============
const DB_NAME = "quranAudioDB";
const STORE_NAME = "audioFiles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
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
  const key = `${sheikhId}_${surahNum}`;
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(blob, key);
}

async function countCachedSurahs(sheikhId) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => {
      const keys = req.result;
      resolve(keys.filter(k => typeof k === 'string' && k.startsWith(`${sheikhId}_`)).length);
    };
    req.onerror = () => resolve(0);
  });
}

export default function ChiohChoiseCom() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ترتيل هادئ");
  const [downloadState, setDownloadState] = useState({});
  const [progress, setProgress] = useState({});
  const pauseFlags = useRef({});

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

  const goToSurah = (item) => {
    sessionStorage.setItem("selectedSheikh", JSON.stringify({ id: item.id, server: item.server, name: item.name }));
    navigate("/quranSelct");
  };

  const startDownload = async (e, item) => {
    e.stopPropagation();
    if (downloadState[item.id] === "downloading" || downloadState[item.id] === "done") return;
    pauseFlags.current[item.id] = false;
    setDownloadState(prev => ({ ...prev, [item.id]: "downloading" }));
    let count = await countCachedSurahs(item.id);
    for (let i = 1; i <= 114; i++) {
      if (pauseFlags.current[item.id]) return;
      if (await isSurahCached(item.id, i)) continue;
      try {
        const res = await fetch(`https://${item.server}.mp3quran.net/${item.id}/${String(i).padStart(3, "0")}.mp3`);
        if (!res.ok) throw new Error();
        await saveSurahToDB(item.id, i, await res.blob());
        count++;
        setProgress(prev => ({ ...prev, [item.id]: Math.round((count / 114) * 100) }));
      } catch (err) { console.warn(`فشل تحميل سورة ${i}`); }
    }
    setDownloadState(prev => ({ ...prev, [item.id]: "done" }));
  };

  const pauseDownload = (e, item) => {
    e.stopPropagation();
    pauseFlags.current[item.id] = true;
    setDownloadState(prev => ({ ...prev, [item.id]: "paused" }));
  };

  const renderRightSide = (item) => {
    const state = downloadState[item.id] || "idle";
    const pct = progress[item.id] || 0;

    if (state === "done") {
      return (
        <div style={{ position: "relative" }}>
          <img src={quranImg} alt="done" style={{ width: "60px", height: "60px" }} />
          <span style={{ position: "absolute", bottom: -4, right: -4, background: "#22c55e", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", fontWeight: "bold" }}>✓</span>
        </div>
      );
    }

    if (state === "downloading") {
      const radius = 24, circ = 2 * Math.PI * radius;
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: "60px", height: "60px" }} onClick={(e) => pauseDownload(e, item)}>
            <svg width="60" height="60"><circle cx="30" cy="30" r={radius} fill="none" stroke="#ffffff33" strokeWidth="4" /><circle cx="30" cy="30" r={radius} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ} transform="rotate(-90 30 30)" style={{ transition: "0.3s" }} /></svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "12px", height: "12px", borderLeft: "3px solid #fff", borderRight: "3px solid #fff" }} />
          </div>
          <span style={{ color: "#fff", fontSize: "11px" }}>{pct}%</span>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div onClick={(e) => startDownload(e, item)} style={{ width: "54px", height: "54px", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {state === "paused" ? <span style={{color:'#fff', fontSize:'11px'}}>{pct}%</span> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v10M7 15l5 5 5-5M4 20h16" /></svg>}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundImage: "linear-gradient(to bottom, #0B4F47, #0067541C, #AAD4C8)",
      minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0"
    }}>
      <ArrowBackIcon style={{ position: "fixed", color: "#fff", top: "30px", left: "30px", zIndex: 100, cursor: "pointer", fontSize: "30px" }} onClick={() => navigate(-1)} />

      {/* شريط الفلتر العلوي */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "50px", background: "rgba(255,255,255,0.1)", padding: "10px 25px", borderRadius: "30px",  }}>
        {Object.keys(categorizedChioh).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 25px", borderRadius: "20px", border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer", transition: "0.3s",
            backgroundColor: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? "#006754" : "#fff", fontFamily:"cairo"
          }}>{tab}</button>
        ))}
      </div>

      {/* عرض الشيوخ في عمودين */}
    <ul style={{
    display: "grid", 
    gridTemplateColumns: "repeat(2, 1fr)", 
    gap: "40px 100px", 
    padding: 0, 
    // التعديل هنا: 0 للمسافة فوق وتحت، و auto عشان يسنتر يمين وشمال
    margin: "0 auto", 
    width: "100%", 
    maxWidth: "1100px", 
    listStyle: "none",
    // إضافة اختيارية عشان نضمن إن العناصر جوا الجريد متسنترة برضه
    justifyItems: "center" 
}}>
        {categorizedChioh[activeTab].map((item, index) => (
         <li
  key={index}
  onClick={() => goToSurah(item)}
  style={{
    cursor: "pointer",
    width: "100%",
    maxWidth: "370px",
    listStyle: "none",
    // هنا التعديل السحري:
    boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.3)", 
    borderRadius: "23px",
    position: "relative",
    transition: "transform 0.2s ease"
  }}
>
  <ComponentRepeatCom 
    nameContent={item.name} 
    lastSora="القرآن الكريم" 
    rightContent={renderRightSide(item)} 
  />
</li>
        ))}
      </ul>
      
      <img src={votart} alt="Decoration" style={{ position: "fixed", bottom: 0, width: "100%", zIndex: -1, opacity: 0.5 }} />
    </div>
  );
}