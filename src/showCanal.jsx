import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "./loding"; 
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

export default function ChannelDetails() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  const API_KEY = "AIzaSyCjftIHR4XlQItggugukB1WOMQvWjE_aik"; 

  // دالة لتخزين الفيديو المختار في الـ LocalStorage ليعرض في الـ Banner
  const saveToLastLesson = (video, channelTitle) => {
    const videoData = {
      id: video.id,
      title: video.title,           // العنوان اللي هيظهر في الـ Banner
      titleEn: "فيديو من اليوتيوب",   // الوصف الصغير
      url: `https://www.youtube.com/watch?v=${video.id}`,
      img: video.img,               // الصورة اللي هتظهر في الـ Banner
      sheikhName: channelTitle,     // اسم القناة كبديل لاسم الشيخ
      channelId: channelId,         // عشان لما يضغط Continue يرجع هنا
      isYoutube: true               // علامة عشان تفرق بينه وبين دروس الأبلكيشن
    };
    localStorage.setItem("lastLesson", JSON.stringify(videoData));
  };

  const sendCommand = (func, args = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      sendCommand("pauseVideo");
    } else {
      sendCommand("playVideo");
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const fetchChannelContent = async () => {
      setLoading(true);
      try {
        // جلب بيانات القناة
        const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`);
        const channelJson = await channelRes.json();
        const currentChannel = channelJson.items ? channelJson.items[0] : null;
        setChannelData(currentChannel);

        // جلب الفيديوهات
        const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${API_KEY}`);
        const videosJson = await videosRes.json();

        if (videosJson.items) {
          const formatted = videosJson.items.map(v => ({
            id: v.id.videoId,
            title: v.snippet.title,
            img: v.snippet.thumbnails.high.url,
            date: new Date(v.snippet.publishedAt).toLocaleDateString('ar-EG')
          }));
          setVideos(formatted);

          if (formatted.length > 0) {
            setSelectedVideo(formatted[0]);
            // تخزين أول فيديو تلقائياً عند فتح القناة
            saveToLastLesson(formatted[0], currentChannel?.snippet?.title);
          }
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchChannelContent();
  }, [channelId]);

  const handleVideoSelect = (video) => {
    setIsPlayerActive(false); 
    setSelectedVideo(video);
    setIsPlaying(true);
    
    // تخزين الفيديو الجديد عند الضغط عليه
    saveToLastLesson(video, channelData?.snippet?.title);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPlayerActive(true), 200);
  };

  if (loading) return <Loading />;

  return (
    <div style={{ direction: "rtl", minHeight: "100vh", backgroundColor: "#f1f5f4", fontFamily: "cairo" }}>
      
      {/* 1. منطقة المشغل */}
      <div style={{ background: "#0b4f47", padding: "40px 0", position: "relative" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
          
          <ArrowBackIcon 
            style={{ position: "absolute", right: "30px", top: "20px", color: "#fff", cursor: "pointer", fontSize: "30px" }} 
            onClick={() => navigate(-1)} 
          />

          <div style={{ 
            width: "100%", aspectRatio: "16/9", backgroundColor: "#000", 
            borderRadius: "20px", overflow: "hidden", position: "relative",
            boxShadow: "0 15px 40px rgba(0,0,0,0.4)"
          }}>
            {!isPlayerActive ? (
              <div 
                onClick={() => setIsPlayerActive(true)}
                style={{ 
                  width: "100%", height: "100%", cursor: "pointer",
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${selectedVideo?.img})`, 
                  backgroundSize: "cover", backgroundPosition: "center",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <PlayCircleOutlineIcon style={{ color: "#fff", fontSize: "80px" }} />
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo?.id}?enablejsapi=1&autoplay=1&origin=${window.location.origin}`}
                title={selectedVideo?.title}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            )}
          </div>

          {isPlayerActive && (
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
               <button onClick={() => sendCommand("seekTo", [10, true])} style={btnStyle}>+10s</button>
               <button onClick={togglePlay} style={btnStyle}>
                 {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
               </button>
               <button onClick={() => sendCommand("seekTo", [-10, true])} style={btnStyle}>-10s</button>
            </div>
          )}
        </div>
      </div>

      {/* 2. تفاصيل الفيديو الحالي */}
      <div style={{ background: "#fff", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "20px" }}>
            <img src={channelData?.snippet?.thumbnails?.default?.url} style={{ width: "60px", height: "60px", borderRadius: "50%", border: "3px solid #0b4f47" }} alt="" />
            <div>
              <h2 style={{ fontSize: "20px", color: "#0b4f47", margin: 0 }}>{selectedVideo?.title}</h2>
              <p style={{ color: "#777", margin: "5px 0 0" }}>قناة: {channelData?.snippet?.title}</p>
            </div>
        </div>
      </div>

      {/* 3. قائمة الفيديوهات المقترحة */}
      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{ marginBottom: "25px", color: "#0b4f47", borderRight: "4px solid #0b4f47", paddingRight: "15px" }}>باقي المحتوى</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
          {videos.map((video) => (
            <div 
              key={video.id} 
              onClick={() => handleVideoSelect(video)}
              style={{
                background: "#fff", borderRadius: "15px", overflow: "hidden", cursor: "pointer",
                border: video.id === selectedVideo?.id ? "2px solid #0b4f47" : "1px solid #ddd",
                transition: "0.3s", transform: video.id === selectedVideo?.id ? "translateY(-5px)" : "none"
              }}
            >
              <img src={video.img} style={{ width: "100%", height: "160px", objectFit: "cover" }} alt="" />
              <div style={{ padding: "15px" }}>
                <h4 style={{ fontSize: "14px", lineHeight: "1.5", height: "42px", overflow: "hidden", margin: 0 }}>{video.title}</h4>
                <span style={{ fontSize: "12px", color: "#999", marginTop: "10px", display: "block" }}>{video.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.4)",
  padding: "10px 20px",
  borderRadius: "30px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  backdropFilter: "blur(5px)"
};