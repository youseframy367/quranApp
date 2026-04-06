import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "./loding"; 
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScrollToTop from "./scrollTop";
import SearchIcon from "@mui/icons-material/Search"; // ضفنا أيقونة للبحث

export default function YoutubeSelectCom() {
  const { category } = useParams();
  const navigate = useNavigate();
  
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

  const handleSearch = (e) => {
    e.preventDefault();
    setFinalQuery(searchTerm);
  };

  if (loading) return <Loading />;
  if (error) return <div style={{textAlign: "center", color: "red", marginTop: "100px"}}>{error}</div>;

  return (
    <div style={{
      direction: "rtl", 
      minHeight: "100vh",
      backgroundColor: "#f0f4f3", // خلفية أهدى للعين في الكمبيوتر
      fontFamily: "cairo"
    }}>
      
      {/* هيدر الكمبيوتر - Sticky Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "linear-gradient(90deg, #0b4f47, #53AEA1)",
        padding: "20px 5%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: "20px" }}>
          <div 
            onClick={() => navigate(-1)} 
            style={{ 
                backgroundColor: "rgba(255,255,255,0.2)", 
                padding: "8px", 
                borderRadius: "50%", 
                cursor: "pointer",
                display: "flex"
            }}>
            <ArrowBackIcon style={{ color: "#fff" }} />
          </div>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "22px" }}>
            {finalQuery ? `نتائج البحث عن: ${finalQuery}` : `اكتشف القنوات`}
          </h2>
        </div>

        <form onSubmit={handleSearch} style={{ 
            display: "flex", 
            gap: "0", 
            width: "40%", 
            position: "relative" 
        }}>
          <input 
            type="text"
            placeholder="ابحث عن قارئ أو قناة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
                flex: 1, 
                padding: "12px 45px 12px 15px", 
                borderRadius: "25px", 
                border: "none", 
                outline: "none", 
                fontSize: "16px",
                boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)"
            }}
          />
          <SearchIcon style={{ 
              position: "absolute", 
              right: "15px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#53AEA1" 
          }} />
        </form>
      </div>

      {/* محتوى القنوات - Grid محسّن للكمبيوتر */}
      <div style={{ padding: "40px 5%", maxWidth: "1400px", margin: "0 auto" }}>
        
        {channels.length > 0 ? (
          <div style={{ 
            display: "grid", 
            // 5 أعمدة في الشاشات الكبيرة، وتصغر مع صغر الشاشة
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
            gap: "30px" 
          }}>
            {channels.map((channel) => (
              <div 
                key={channel.id} 
                onClick={() => navigate(`/channelVideos/${channel.id}`)}
                style={{ 
                  background: "#fff", 
                  borderRadius: "20px", 
                  padding: "25px 15px", 
                  textAlign: "center", 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
                  cursor: "pointer", 
                  transition: "all 0.3s ease",
                  border: "1px solid #e0e7e5"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                    <img 
                        src={channel.img} 
                        alt="" 
                        style={{ 
                            width: "120px", 
                            height: "120px", 
                            borderRadius: "50%", 
                            marginBottom: "15px", 
                            objectFit: "cover", 
                            border: "4px solid #f0f4f3" 
                        }} 
                    />
                </div>
                <h3 style={{ 
                    fontSize: "16px", 
                    color: "#0b4f47", 
                    margin: "10px 0", 
                    fontWeight: "bold",
                    lineHeight: "1.4"
                }}>
                    {channel.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#888", height: "32px", overflow: "hidden" }}>
                    {channel.description?.substring(0, 60)}...
                </p>
                <div style={{ 
                    marginTop: "15px", 
                    color: "#53AEA1", 
                    fontSize: "14px", 
                    fontWeight: "600" 
                }}>
                    عرض المحتوى ←
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State للكمبيوتر */
          <div style={{ textAlign: "center", marginTop: "150px" }}>
            <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="Not found" style={{ width: "150px", opacity: 0.5 }} />
            <h2 style={{ fontSize: "24px", color: "#0b4f47", marginTop: "20px" }}>لم نجد ما تبحث عنه يا يوسف</h2>
            <button 
              onClick={() => {setFinalQuery(""); setSearchTerm("")}} 
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                backgroundColor: "#0b4f47",
                color: "white",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
fontFamily: "Cairo, sans-serif"
              }}
            >
              العودة للقنوات المقترحة
            </button>
          </div>
        )}
      </div>

      <ScrollToTop/>
    </div>
  );
}