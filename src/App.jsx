import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

// Mobile Components
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
import YoutubeSelect from "./youtubeSelect"; // المكون الجديد
import ChannelDetails from "./showCanal";
// Computer Components
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
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <BrowserRouter>
      {isMobile ? (
        <Routes>
          <Route path="/" element={<StartBag />} />
          <Route path="/AllOption" element={<AllOption />} />
          <Route path="/chioh" element={<ChiohChoise />} />
          <Route path="/hafiz" element={<Hafiz />} />
          <Route path="/surah" element={<ShowAiat />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/SelectLisson" element={<SelectLison />} />
          <Route path="/ShowLisson" element={<LessonsDoc />} />
          <Route path="/lesonAdio" element={<LisonAudio />} />
          <Route path="/playlist" element={<PlaylistPage />} />
          <Route path="/selectApthlat" element={<ApthlatSelect />} />
          <Route path="/selectAzcar" element={<DuaList />} />
          <Route path="/Azkar/:id" element={<AzkarShow />} />
          <Route path="/ApthlatLisson" element={<ApthlatLison />} />
          <Route path="/izaheSelect" element={<IzahetQuran />} />
          <Route path="/azkarLison" element={<AzkarLisson />} />
          <Route path="/tanmia" element={<Tanmaia />} />
          <Route path="/tanmiaLison" element={<TanmiaLisson />} />
          <Route path="/channelVideos/:channelId" element={<ChannelDetails />} />
          {/* رابط اليوتيوب موبايل */}
          <Route path="/youtubeSelect/:category" element={<YoutubeSelect />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<StartBagCom />} />
          <Route path="/Select" element={<AllOptionCom />} />
          <Route path="/chiohCom" element={<ChiohChoiseCom />} />
          <Route path="/quranSelct" element={<QuranSelctCom />} />
          <Route path="/showAiat" element={<ShowAiatCom />} />
          <Route path="/aiatAduo" element={<AudioCom />} />
          <Route path="/chiohSelct" element={<ChiohSelctCom />} />
          <Route path="/lisonDoc" element={<LessonsDocCom />} />
          <Route path="/vadio" element={<LisonVadioCom />} />
          <Route path="/playList" element={<PlaylistPageCom />} />
          <Route path="/apthlatSelct" element={<ApthlatSelectCom />} />
          <Route path="/apthlatLison" element={<ApthlatLisonCom />} />
          <Route path="/azkarSelct" element={<DuaListCom />} />
          <Route path="/azkarShow/:d" element={<AzkarShowCom />} />
          <Route path="/azaheSelct" element={<IzahetSelctCom />} />
          <Route path="/azaheLison" element={<AzahaLissonCom />} />
          <Route path="/tanmia" element={<TanmaiaCom />} />
          <Route path="/tanmiaLison" element={<TanmiaLissonCom />} />
          {/* أضفت لك الرابط هنا برضه للكمبيوتر عشان يشتغل في الحالتين */}
          <Route path="/youtubeSelect/:category" element={<YoutubeSelect />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}