import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Mobile Components ---
import AllOption from "./select";
import StartBag from "./nStar";
import ChiohChoise from "./quranChioh";
import Hafiz from "./sourHafiz";
import ShowAiat from "./aiatTranslation";
import Audio from "./aiatOdue";
import SelectLison from "./selectLeson";
import LessonsDoc from "./lessonDoctor";
import LisonAudio from "./lisonAdio";
import PlaylistPage from "./PlaylistPage";
import ApthlatSelect from "./abtahlatSelect";
import ApthlatLison from "./apthlatLisson";
import DuaList from "./azkhrSelct";
import AzkarShow from "./azkarShow";
import IzahetQuran from "./azahetQoran";
import AzkarLisson from "./azahaLisson";
import Tanmaia from "./tanmia";
import TanmiaLisson from "./tanmiaLisson";
import YoutubeSelect from "./youtubeSelect";
import ChannelDetails from "./showCanal";

// --- Computer Components ---
import StartBagCom from "./computerDesin/bagStart";
import AllOptionCom from "./computerDesin/selectComputer";
import ChiohChoiseCom from "./computerDesin/quranChiohcomputer";
import QuranSelctCom from "./computerDesin/quranSelctComputer";
import ShowAiatCom from "./computerDesin/showAiatComputer";
import AudioCom from "./computerDesin/aiatAdiouComputer";
import ChiohSelctCom from "./computerDesin/chiohSelctComputer";
import LessonsDocCom from "./computerDesin/showLissonDocComputer";
import LisonVadioCom from "./computerDesin/vadioComputer";
import PlaylistPageCom from "./computerDesin/playList";
import ApthlatSelectCom from "./computerDesin/apthlatSelctComputer";
import ApthlatLisonCom from "./computerDesin/apthlatLisonComputer";
import DuaListCom from "./computerDesin/azkarSelctComputer";
import AzkarShowCom from "./computerDesin/azkarShowComputer";
import IzahetSelctCom from "./computerDesin/azahaSelctComputer";
import AzahaLissonCom from "./computerDesin/azahaLisonComouter";
import TanmaiaCom from "./computerDesin/tanmiaComputer";
import TanmiaLissonCom from "./computerDesin/tanmiaLisonComputer";

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const ResponsiveRoute = ({ mobile: MobileComp, desktop: DesktopComp }) => {
    return isMobile ? <MobileComp /> : <DesktopComp />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={<ResponsiveRoute mobile={StartBag} desktop={StartBagCom} />} />
        
        {/* الخيارات - دعم الرابطين */}
        <Route path="/AllOption" element={<ResponsiveRoute mobile={AllOption} desktop={AllOptionCom} />} />
        <Route path="/Select" element={<ResponsiveRoute mobile={AllOption} desktop={AllOptionCom} />} />

        {/* القرآن والشيوخ - دعم كل المسميات */}
        <Route path="/chioh" element={<ResponsiveRoute mobile={ChiohChoise} desktop={ChiohChoiseCom} />} />
        <Route path="/chiohCom" element={<ResponsiveRoute mobile={ChiohChoise} desktop={ChiohChoiseCom} />} />
        <Route path="/hafiz" element={<ResponsiveRoute mobile={Hafiz} desktop={QuranSelctCom} />} />
        <Route path="/quranSelct" element={<ResponsiveRoute mobile={Hafiz} desktop={QuranSelctCom} />} />
        <Route path="/surah" element={<ResponsiveRoute mobile={ShowAiat} desktop={ShowAiatCom} />} />
        <Route path="/showAiat" element={<ResponsiveRoute mobile={ShowAiat} desktop={ShowAiatCom} />} />
        <Route path="/audio" element={<ResponsiveRoute mobile={Audio} desktop={AudioCom} />} />
        <Route path="/aiatAduo" element={<ResponsiveRoute mobile={Audio} desktop={AudioCom} />} />
        
        {/* الدروس والمحاضرات */}
        <Route path="/SelectLisson" element={<ResponsiveRoute mobile={SelectLison} desktop={ChiohSelctCom} />} />
        <Route path="/chiohSelct" element={<ResponsiveRoute mobile={SelectLison} desktop={ChiohSelctCom} />} />
        <Route path="/ShowLisson" element={<ResponsiveRoute mobile={LessonsDoc} desktop={LessonsDocCom} />} />
        <Route path="/lisonDoc" element={<ResponsiveRoute mobile={LessonsDoc} desktop={LessonsDocCom} />} />
        <Route path="/lesonAdio" element={<ResponsiveRoute mobile={LisonAudio} desktop={LisonVadioCom} />} />
        <Route path="/vadio" element={<ResponsiveRoute mobile={LisonAudio} desktop={LisonVadioCom} />} />
        <Route path="/playlist" element={<ResponsiveRoute mobile={PlaylistPage} desktop={PlaylistPageCom} />} />
        <Route path="/playList" element={<ResponsiveRoute mobile={PlaylistPage} desktop={PlaylistPageCom} />} />

        {/* ابتهالات وأذكار */}
        <Route path="/selectApthlat" element={<ResponsiveRoute mobile={ApthlatSelect} desktop={ApthlatSelectCom} />} />
        <Route path="/apthlatSelct" element={<ResponsiveRoute mobile={ApthlatSelect} desktop={ApthlatSelectCom} />} />
        <Route path="/ApthlatLisson" element={<ResponsiveRoute mobile={ApthlatLison} desktop={ApthlatLisonCom} />} />
        <Route path="/apthlatLison" element={<ResponsiveRoute mobile={ApthlatLison} desktop={ApthlatLisonCom} />} />
        <Route path="/selectAzcar" element={<ResponsiveRoute mobile={DuaList} desktop={DuaListCom} />} />
        <Route path="/azkarSelct" element={<ResponsiveRoute mobile={DuaList} desktop={DuaListCom} />} />
        <Route path="/Azkar/:id" element={isMobile ? <AzkarShow /> : <AzkarShowCom />} />
        <Route path="/azkarShow/:d" element={isMobile ? <AzkarShow /> : <AzkarShowCom />} />

        {/* إذاعة وتنمية */}
        <Route path="/izaheSelect" element={<ResponsiveRoute mobile={IzahetQuran} desktop={IzahetSelctCom} />} />
        <Route path="/azaheSelct" element={<ResponsiveRoute mobile={IzahetQuran} desktop={IzahetSelctCom} />} />
        <Route path="/azkarLison" element={<ResponsiveRoute mobile={AzkarLisson} desktop={AzahaLissonCom} />} />
        <Route path="/azaheLison" element={<ResponsiveRoute mobile={AzkarLisson} desktop={AzahaLissonCom} />} />
        <Route path="/tanmia" element={<ResponsiveRoute mobile={Tanmaia} desktop={TanmaiaCom} />} />
        <Route path="/tanmiaLison" element={<ResponsiveRoute mobile={TanmiaLisson} desktop={TanmiaLissonCom} />} />

        {/* يوتيوب */}
        <Route path="/channelVideos/:channelId" element={<ChannelDetails />} />
        <Route path="/youtubeSelect/:category" element={<YoutubeSelect />} />
      </Routes>
    </BrowserRouter>
  );
}