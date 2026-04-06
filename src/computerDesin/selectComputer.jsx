import React from "react";
import { useNavigate } from "react-router-dom";
import quranImg from "./imgComputer/quran tasbee 1.png";
import listImg from "./imgComputer/Group 79(1).png";
import lisningImg from "./imgComputer/Object.png";
import AhdesImg from "./imgComputer/Group 80(1).png";
import votart from "./imgComputer/Vector 1(1).png";
import ComponentRepeatCom from "../ncomponntRepeat";

// بيانات الخيارات - تعديل الـ paths لترتبط بصفحة اليوتيوب
const optionsList = [
  {
    name: "القرآن الكريم",
    image: quranImg,
    path: "/chiohCom", // دي غالباً صفحة المشايخ اللي عندك
  },
  {
    name: "دروس دينيه",
    image: listImg,
    path: "/youtubeSelect/lessons", // لاحظ بعتنا كلمة lessons
  },
  {
    name: "ابتهالات",
    image: lisningImg,
    path: "/youtubeSelect/abtehalat", // بعتنا abtehalat
  },
  {
    name: "أحاديث نبويه",
    image: AhdesImg,
    path: "/azkarSelct", 
  },
  {
    name: "من اذاعه القرءان الكريم",
    image: quranImg,
    path: "/youtubeSelect/izahe", // بعتنا izahe
  },
  {
    name: "تنميه هادفه",
    image: AhdesImg,
    path: "/youtubeSelect/tanmia", // بعتنا tanmia
  },
];

// ... الاستيرادات كما هي ...

export default function AllOptionCom() {
  const navigate = useNavigate();

  const getOptions = optionsList.map((item, index) => (
    <li
      key={index}
      style={{
        cursor: "pointer",
        width: "100%",
        maxWidth: "370px",
        listStyle: "none",
        boxShadow: "15px 0px 25px #004B40",
        overflow: "hidden",
        borderRadius: "23px",
        zIndex: "100"
      }}
      onClick={() => navigate(item.path)}
    >
      {/* التعديل هنا: غيرنا imgContent لـ rightContent */}
      <ComponentRepeatCom 
        nameContent={item.name} 
        rightContent={item.image} // بعتنا مسار الصورة هنا
        style={{ margin: "0px", width: "98%" }}
      />
    </li>
  ));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "35px 0px",
        width: "100%",
        margin: "0px",
        backgroundImage: "linear-gradient(to bottom, #0B4F47, #0067541C, #AAD4C8)",
        overflowX: "hidden",
        overflowY: "auto",
        minHeight: "100vh" // خليها minHeight عشان الـ gradient يغطي الصفحة كلها
      }}
    >
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "130px",
          padding: 0,
          margin: 0,
          width: "1000px",
        }}
      >
        {getOptions}
      </ul>
      <img src={votart} alt="Decoration" className="bottom" />
    </div>
  );
}