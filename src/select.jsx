import React from "react";
import { useNavigate } from "react-router-dom";
import ComponentRepeat from "./ncomponntRepeat";
import quranImg from "./img/Group (4).png";
import listImg from "./img/Group 79.png";
import lisningImg from "./img/Group(1).png";
import AhdesImg from "./img/Group 80.png";

const optionsList = [
  {
    name: "القرآن الكريم",
    image: quranImg,
    path: "/chioh",
    widthImg: "120px",
    heightImg: "120px",
  },
  {
    name: "دروس دينيه",
    image: listImg,
    path: "/youtubeSelect/lessons", // تعديل المسار لليوتيوب
    widthImg: "120px",
    heightImg: "120px",
  },
  {
    name: "ابتهالات",
    image: lisningImg,
    path: "/youtubeSelect/abtehalat", // التعديل هنا (شيلنا التكرار)
    widthImg: "100px",
    heightImg: "100px",
  },
  {
    name: "أحاديث نبويه",
    image: AhdesImg,
    path: "/selectAzcar",
    widthImg: "100px",
    heightImg: "100px",
  },
  {
    name: "من اذاعه القرءان الكريم",
    image: quranImg,
    path: "/youtubeSelect/izahe", // تعديل المسار لليوتيوب
    widthImg: "120px",
    heightImg: "120px",
  },
  {
    name: "تنميه هادفه",
    image: AhdesImg,
    path: "/youtubeSelect/tanmia", // تعديل المسار لليوتيوب
    widthImg: "100px",
    heightImg: "100px",
    left: "20px",
    top: "30px"
  },
];






export default function AllOption() {
  const navigate = useNavigate();

// تعديل الـ map في ملف AllOption.jsx
// تعديل الـ map لاستخدام مقاسات الأيقونة الخاصة بكل عنصر
const getOptions = optionsList.map((item, index) => (
  <li
    key={index}
    style={{
      cursor: "pointer",
      width: "100%",
      maxWidth: "370px",
      listStyle: "none",
    }}
    onClick={() => navigate(item.path)}
  >
    <ComponentRepeat 
      nameContent={item.name} 
      /* هنا بنبعت الأيقونة وبنخلي عرضها وطولها جاي من البيانات اللي أنت حددتها */
      rightContent={
        <img 
          src={item.image} 
          alt={item.name} 
          style={{ 
            width: item.widthImg,  // هيقرأ مثلاً "120px" أو "100px" حسب العنصر
            height: item.heightImg, 
            objectFit: "contain" ,
            position:"relative",
         position: "relative",
            // لو الـ left موجود في البيانات هيستخدمه، لو مش موجود هيبقى 0
            left: item.left || "0px",
            // أضفنا الـ top كمان عشان لو حبيت ترفع أو تنزل الأيقونة
            top: item.top || "0px",
          }} 
        />
      } 
      style={{ margin: "0px", width: "98%" }}
    />
  </li>
));
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // توسيط العمود أفقيًا
        padding: "35px 0px",
        width: "100%",
      margin:"0px",
        backgroundImage:
          "linear-gradient(to bottom, #53AEA1 , #D4DFDC , #C5D8D3 , #FFFFFF)",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      
      <ul
        style={{
          display: "flex",
          flexDirection: "column", // ترتيب عمودي
          alignItems: "center",    // توسيط العناصر أفقيًا
          gap: "20px",              // مسافة بين العناصر
          padding: 0,
          margin: 0,
          width: "100%",
          maxWidth: "370px",       // نفس عرض الكمبوننت
        }}
      >
        {getOptions}
      </ul>
    </div>
  );
}
