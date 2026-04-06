import React, { useEffect, useRef, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useNavigate, useLocation } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import lisningImg from "./imgComputer/Object.png";
import quranImg from "./imgComputer/Group 78(1).png";
import votart from "./imgComputer/Vector 1(1).png";
import startAiatImg from "./imgComputer/65a01e9511387c604ae7c852ca9a1900605bca88.png";
import "../sourHafiz.css";

// ============ IndexedDB helpers ============
const DB_NAME = "quranAudioDB";
const STORE_NAME = "audioFiles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
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
  } catch {
    return null;
  }
}

// ============ Component ============
export default function AudioCom() {
  const [sheikhName, setSheikhName] = useState("اسم القارئ");
  const [isRepeat, setIsRepeat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [surahName, setSurahName] = useState("سورة");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const blobUrlRef = useRef(null);

  const audioRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sheikhData = JSON.parse(sessionStorage.getItem("selectedSheikh") || "{}");
    const surahData = location.state?.surah || JSON.parse(sessionStorage.getItem("selectedSurah") || "{}");

    if (!sheikhData.id || !sheikhData.server || !surahData.number) {
      navigate("/hafiz");
      return;
    }

    setSheikhName(sheikhData.name || "اسم القارئ");
    setSurahName(surahData.arabic || "سورة");

    const formattedNumber = String(surahData.number).padStart(3, "0");
    const onlineUrl = `https://${sheikhData.server}.mp3quran.net/${sheikhData.id}/${formattedNumber}.mp3`;

    // شيك في IndexedDB الأول
    getAudioFromDB(sheikhData.id, surahData.number).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setAudioSrc(url);
        setIsOffline(true);
      } else {
        setAudioSrc(onlineUrl);
        setIsOffline(false);
      }
    });

    // تنظيف blob URL
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [location, navigate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div style={{
      backgroundImage: "linear-gradient(to bottom, #0B4F47, #0067541C, #AAD4C8)",
      height: "100vh",
      width: "100%",
      margin: "0px",
      overflow: "hidden"
    }}>

      {/* الهيدر */}
      <div style={{
        margin: "2% 7%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "170px",
        borderRadius: "23px",
        backgroundImage: `url(${votart}), linear-gradient(to bottom, #006754 , #87D1A4)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        color: "#fff"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <img style={{ width: "90px", height: "90px", margin: "40px" }} src={lisningImg} alt="listening" />
          <div style={{
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
            lineHeight: ".80", fontFamily: "Amiri, serif", color: "#fff"
          }}>
            <h1 style={{ fontWeight: "700", fontSize: "32px" }}>{surahName}</h1>
            <img src={startAiatImg} alt="basmala" style={{ width: "180px" }} />
          </div>
          <img style={{ width: "200px", height: "200px", transform: "rotate(-10deg)" }} src={quranImg} alt="Quran" />
        </div>

        {/* مؤشر offline/online */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "20px",
          fontSize: "11px",
          color: "#fff",
          background: isOffline ? "#22c55e55" : "#ffffff33",
          padding: "3px 10px",
          borderRadius: "20px",
        }}>
          {isOffline ? "🔇 offline" : "🌐 online"}
        </div>
      </div>

      <ArrowBackIcon
        style={{ width: "24px", height: "24px", margin: "10px", color: "#fff", cursor: "pointer", position: "absolute", top: "10px", left: "10px" }}
        onClick={() => navigate(-1)}
      />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img style={{ width: "25%", margin: "0px" }} src={quranImg} alt="Quran" />
      </div>

      {/* مشغل الصوت */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "90%", margin: "10px 40px" }}>
          <h2 style={{ fontFamily: "Amiri, serif", color: "#004B40", marginLeft: "60px" }}>{sheikhName}</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontFamily: "Amiri, serif", fontSize: "16px", color: "#8A9A9D", fontWeight: "700", marginLeft: "60px" }}>ترتيل</p>
            <div onClick={() => setIsFavorite(!isFavorite)} style={{ cursor: "pointer", marginRight: "80px" }}>
              {isFavorite ? (
                <FavoriteIcon style={{ color: "#004B40" }} />
              ) : (
                <FavoriteBorderIcon style={{ color: "#004B40" }} />
              )}
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => {
            if (isRepeat) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } else {
              setIsPlaying(false);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "80%", marginTop: "10px" }}>
          <span style={{ fontSize: "12px", marginRight: "10px" }}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: "12px", marginLeft: "10px" }}>{formatTime(duration)}</span>
        </div>

        <RepeatIcon
          onClick={() => setIsRepeat(!isRepeat)}
          style={{
            color: isRepeat ? "#006754" : "#ccc",
            fontSize: "32px",
            cursor: "pointer",
            width: "fitContent",
            margin: "30px 20px 20px -400px"
          }}
        />

        <button
          onClick={togglePlay}
          style={{
            backgroundColor: "#006754", border: "none", borderRadius: "50%",
            width: "60px", height: "60px", marginTop: "-50px",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}
        >
          {isPlaying ? (
            <PauseIcon style={{ color: "white", fontSize: "30px" }} />
          ) : (
            <PlayArrowIcon style={{ color: "white", fontSize: "30px" }} />
          )}
        </button>
      </div>
    </div>
  );
}