import React from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import votart from "./computerDesin/imgComputer/Vector 1(1).png";

export default function ComponentRepeat({ nameContent, lastSora, rightContent }) {
  
  // دالة ذكية للتأكد من طريقة عرض الجزء الأيمن
  const renderRightPart = () => {
    if (!rightContent) return null;

    // لو اللي مبعوث عبارة عن "نص" (يعني مسار صورة زي اللي في AllOptionCom)
    if (typeof rightContent === 'string') {
      return (
        <img 
          src={rightContent} 
          alt="icon" 
          style={{  objectFit: "contain" }} 
        />
      );
    }

    // لو اللي مبعوث عبارة عن Object أو Component (زي دايرة التحميل في صفحة الشيوخ)
    return rightContent;
  };

  return (
    <div
      style={{
        maxWidth: "370px",
        height: "170px",
        borderRadius: "23px",
        backgroundImage: "linear-gradient(to bottom, #006754, #87D1A4)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden", 
        color: "#fff",
      }}
    >
      {/* الخلفية الأصلية */}
      <img 
        src={votart} 
        alt="decoration" 
        style={{ 
          position: "absolute", 
          bottom: "0px", 
          right: "0", 
          width: "130%", 
          height: "90px",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.8 
        }} 
      />

      <div style={{ 
          display: "flex", 
          width: "100%", 
          zIndex: "10", 
          alignItems: "center",
          justifyContent: "space-between" 
        }}>
        
        <div style={{ flex: 1, zIndex: 20 }}>
          <p style={{ fontSize: "12px", marginBottom: "5px", opacity: 0.9 }}>
            {lastSora || "القرآن الكريم"}
          </p>
          <h2 style={{ 
              margin: "5px 0", 
              fontSize: "22px", 
              fontWeight: "700", 
              fontFamily: "'Amiri', serif" 
            }}>
            {nameContent}
          </h2>

          <button style={{
              marginTop: "12px",
              padding: "10px 18px",
              borderRadius: "30px",
              border: "none",
              backgroundColor: "#fff",
              color: "#000",
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}>
            Continue
            <ArrowForwardIcon style={{ marginLeft: "10px", fontSize: "18px" }} />
          </button>
        </div>

        {/* الجزء الأيمن المرن */}
        <div style={{
            width: "120px",
            height: "120px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
            position: "relative"
          }}>
          {renderRightPart()}
        </div>
      </div>
    </div>
  );
}