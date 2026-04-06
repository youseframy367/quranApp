import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "./loding"; 
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScrollToTop from "./scrollTop";
export default function YoutubeSelect() {
  const { category } = useParams();
  const navigate = useNavigate();
  
  // 1. كل الـ States في البداية
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [finalQuery, setFinalQuery] = useState("");

  const categoryKeywords = {
    abtehalat: "ابتهالات وموشحات دينية",
    lessons: "دروس دينية مؤثرة",
    tanmia: "تنمية بشرية وتطوير ذات",
    izahe: "إذاعة القرآن الكريم مصر"
  };

  const API_KEY = "AIzaSyCjftIHR4XlQItggugukB1WOMQvWjE_aik"; 

  // 2. الـ useEffect الخاصة بجلب البيانات
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = finalQuery || categoryKeywords[category] || category;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=50&q=${encodeURIComponent(query)}&key=${API_KEY}`
        );
        const data = await response.json();
        if (data.items) {
          const formattedChannels = data.items.map(item => ({
            id: item.snippet.channelId,
            name: item.snippet.title,
            img: item.snippet.thumbnails.high.url,
            description: item.snippet.description
          }));
          setChannels(formattedChannels);
        }
      } catch (err) {
        setError("فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [category, finalQuery]);

  // 3. الـ useEffect الخاصة بمراقبة السكرول (انقلناها هنا قبل الـ loading)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFinalQuery(searchTerm);
  };

  // 4. الآن نضع شروط الـ return المبكرة
  if (loading) return <Loading />;
  if (error) return <div style={{textAlign: "center", color: "red", marginTop: "50px"}}>{error}</div>;

  return (
    <div style={{
      direction: "rtl", 
      minHeight: "100vh",
      backgroundColor: "#f4f7f6",
      fontFamily: "cairo"
    }}>
      
      {/* الجزء الثابت (Sticky Header) */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "linear-gradient(to bottom, #53AEA1, #489a8e)",
        padding: "15px 20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "0 0 20px 20px"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: "15px" }}>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
            {finalQuery ? `نتائج: ${finalQuery}` : `قنوات مقترحة`}
          </h3>
          <ArrowBackIcon style={{ color: "#fff", cursor: "pointer" }} onClick={() => navigate(-1)} />
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", maxWidth: "600px", margin: "0 auto" }}>
          <input 
            type="text"
            placeholder="ابحث عن قناة يوتيوب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: "10px 15px", borderRadius: "15px", border: "none", outline: "none", fontSize: "14px", fontFamily: "cairo" }}
          />
          <button type="submit" style={{ padding: "8px 20px", borderRadius: "15px", backgroundColor: "#006754", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" ,fontFamily:"cairo"}}>
            بحث
          </button>
        </form>
      </div>

      {/* محتوى القنوات */}
<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
  
  {/* شرط: لو القائمة فيها بيانات، اعرضها */}
  {channels.length > 0 ? (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", 
      gap: "15px" 
    }}>
      {channels.map((channel) => (
        <div 
          key={channel.id} 
          onClick={() => navigate(`/channelVideos/${channel.id}`)}
          style={{ 
            background: "#fff", borderRadius: "15px", padding: "15px", 
            textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", 
            cursor: "pointer", transition: "0.3s" 
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <img src={channel.img} alt="" style={{ width: "70px", height: "70px", borderRadius: "50%", marginBottom: "10px", objectFit: "cover", border: "2px solid #53AEA1" }} />
          <h3 style={{ fontSize: "13px", color: "#333", margin: "0", height: "35px", overflow: "hidden", lineHeight: "1.3" }}>{channel.name}</h3>
        </div>
      ))}
    </div>
  ) : (
    /* شرط: لو القائمة فاضية (Empty State) */
    <div style={{ 
      textAlign: "center", 
      marginTop: "100px", 
      color: "#666",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{ fontSize: "50px", marginBottom: "20px" }}>🔍</div>
      <h2 style={{ fontSize: "20px", color: "#006754" }}>عذراً، لم نجد أي قنوات!</h2>
      <p style={{ fontSize: "14px" }}>تأكد من كتابة اسم القناة بشكل صحيح أو جرب كلمات بحث أخرى.</p>
      
      {/* زر اختياري لإعادة البحث أو العودة */}
      <button 
        onClick={() => setFinalQuery("")} 
        style={{
          marginTop: "20px",
          padding: "10px 25px",
          backgroundColor: "#53AEA1",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontFamily:"cairo"
        }}
      >
        عرض القنوات المقترحة
      </button>
    </div>
  )}
</div>


        <ScrollToTop/>
   
    </div>
  );
}