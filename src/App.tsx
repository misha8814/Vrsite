/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Gamepad2,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Check,
  X,
  Plus,
  Minus,
  Send,
  Phone,
  ShieldCheck,
  Zap,
  Star,
  Map,
  Volume2,
  Wind,
  Info,
  Layers,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Definitions of visual design variants (presets) representing the user requested variations
type SiteStyle = "cyber-ocean" | "neon-sunset" | "cosmic-portal";

interface GameAttraction {
  id: string;
  title: string;
  category: "extreme" | "exploration" | "action" | "kids";
  categoryRu: string;
  description: string;
  duration: string;
  price: number;
  imageUrl: string;
  intensity: "Высокая" | "Средняя" | "Спокойная";
  ageLimit: string;
}

export default function App() {
  // Website variation selection state representing core user request: "сделай варианты и предложи их мне"
  const [currentStyle, setCurrentStyle] = useState<SiteStyle>("cyber-ocean");

  // Booking details pop-up state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>("");

  // Live session price calculator state
  const [calcGameId, setCalcGameId] = useState<string>("beat-saber");
  const [calcPlayers, setCalcPlayers] = useState<number>(1);
  const [calcDuration, setCalcDuration] = useState<number>(15); // minutes

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAgreed, setFormAgreed] = useState(true);

  // State to toggle instruction panel at the bottom
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);

  // Exact 4 games from the SochiVR Telegram channel
  const gamesList: GameAttraction[] = [
    {
      id: "pistol-whip",
      title: "PISTOL WHIP",
      category: "action",
      categoryRu: "Ритм-шутер",
      description: "Кинематографичный ритм-экшен, объединяющий динамичную стрельбу и взрывные музыкальные биты. Уклоняйтесь от пуль в стиле Нео из «Матрицы», двигайтесь в такт музыке и уничтожайте врагов на потрясающих неоновых уровнях. Погружение в шлеме подарит незабываемые эмоции!",
      duration: "10-15 мин",
      price: 400,
      imageUrl: "/src/assets/images/vr_pistol_whip_1780011363408.png",
      intensity: "Высокая",
      ageLimit: "12+"
    },
    {
      id: "beat-saber",
      title: "BEAT SABER",
      category: "action",
      categoryRu: "Музыкальный экшен",
      description: "Легендарный VR-хит, в котором вы вооружитесь двумя светящимися лазерными мечами (красным и синим) для рассекания ритмичных неоновых кубов под зажигательные треки. Тренируйте реакцию, ловите драйв и соревнуйтесь в рекордах на побережье Солоники!",
      duration: "10-15 min",
      price: 400,
      imageUrl: "/src/assets/images/vr_beat_saber_1780011380999.png",
      intensity: "Средняя",
      ageLimit: "6+"
    },
    {
      id: "underdogs",
      title: "UNDERDOGS",
      category: "extreme",
      categoryRu: "Механические бои",
      description: "Суровый футуристический роуглайк об арене подпольных боев гигантских пилотируемых роботов. Управляйте многотонным бронированным ОБЧР кабиной от первого лица и крушите врагов тяжелыми гидравлическими кулаками. Невероятный драйв и полное 3D погружение!",
      duration: "15 мин",
      price: 450,
      imageUrl: "/src/assets/images/vr_underdogs_1780011398517.png",
      intensity: "Высокая",
      ageLimit: "14+"
    },
    {
      id: "superhot",
      title: "SUPERHOT VR",
      category: "action",
      categoryRu: "Тактический шутер",
      description: "Инновационный шутер, где время движется только тогда, когда двигаетесь вы! Оцените боевую хореографию в слоу-моушн: уворачивайтесь от летящих пуль, просчитывайте шаги и разбивайте кристально-светящихся врагов голыми руками и подручными средствами.",
      duration: "10-15 мин",
      price: 400,
      imageUrl: "/src/assets/images/vr_superhot_1780011420310.png",
      intensity: "Средняя",
      ageLimit: "12+"
    }
  ];

  // Live dynamic pricing calculator
  const calculateResultPrice = () => {
    const selectedGame = gamesList.find(g => g.id === calcGameId) || gamesList[0];
    let basePrice = selectedGame.price;

    // Time scaling modifier
    let timeMultiplier = 1;
    if (calcDuration === 30) timeMultiplier = 1.8; // bulk discount built-in
    if (calcDuration === 45) timeMultiplier = 2.5;

    return Math.round((basePrice * timeMultiplier) * calcPlayers);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    setBookingLoading(true);
    setBookingError("");

    const selectedGame = gamesList.find(g => g.id === selectedGameId);
    const gameTitle = selectedGame ? selectedGame.title : "Решат на месте";

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          game: gameTitle
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setBookingSuccess(true);
      } else {
        if (resData.error === "telegram_chat_id_not_found") {
          setBookingError("Чат-ID администратора не определен. Пожалуйста, отправьте вашему боту любое сообщение в Telegram (например, напишите /start), а затем нажмите кнопку снова!");
        } else {
          setBookingError(resData.message || resData.error || "Произошла непредвиденная ошибка при отправке!");
        }
      }
    } catch (err: any) {
      console.error("api call error:", err);
      setBookingError("Сбой подключения. Пожалуйста, проверьте подключение или обратитесь к нам в ТГ @sochiVR");
    } finally {
      setBookingLoading(false);
    }
  };

  const triggerBooking = (gameId: string) => {
    setSelectedGameId(gameId);
    setBookingSuccess(false);
    setBookingLoading(false);
    setBookingError("");
    setIsBookingOpen(true);
  };

  // Aesthetic custom configurations for each design variant
  const stylePresets = {
    "cyber-ocean": {
      bg: "bg-gradient-to-b from-stone-950 via-slate-900 to-stone-950",
      accentText: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500",
      accentBtn: "bg-cyan-500 hover:bg-cyan-400 text-stone-950 shadow-cyan-500/20",
      borderTheme: "border-cyan-500/10",
      cardBg: "bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30",
      accentColor: "cyan",
      primaryText: "text-cyan-400",
      iconBoxBg: "bg-cyan-500/10 text-cyan-400",
      pillAccent: "bg-cyan-950 border-cyan-900 text-cyan-400",
      glowBg: "bg-cyan-500/5",
      navActive: "text-cyan-400 border-b-2 border-cyan-400"
    },
    "neon-sunset": {
      bg: "bg-gradient-to-b from-stone-950 via-rose-950 to-stone-950",
      accentText: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-purple-500",
      accentBtn: "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-stone-950 shadow-orange-500/20",
      borderTheme: "border-orange-500/10",
      cardBg: "bg-stone-900/60 border-rose-950/40 hover:border-orange-500/30",
      accentColor: "orange",
      primaryText: "text-orange-400",
      iconBoxBg: "bg-orange-500/10 text-orange-400",
      pillAccent: "bg-orange-950 border-orange-900 text-orange-400",
      glowBg: "bg-rose-500/5",
      navActive: "text-orange-400 border-b-2 border-orange-400"
    },
    "cosmic-portal": {
      bg: "bg-gradient-to-b from-stone-950 via-neutral-900 to-stone-950",
      accentText: "text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-yellow-400",
      accentBtn: "bg-lime-400 hover:bg-lime-300 text-neutral-950 shadow-lime-400/20",
      borderTheme: "border-lime-500/10",
      cardBg: "bg-neutral-950/80 border-neutral-800 hover:border-lime-400/35",
      accentColor: "lime",
      primaryText: "text-lime-400",
      iconBoxBg: "bg-lime-400/10 text-lime-400",
      pillAccent: "bg-lime-950 border-lime-800 text-lime-400",
      glowBg: "bg-lime-500/5",
      navActive: "text-lime-400 border-b-2 border-lime-400"
    }
  };

  const style = stylePresets[currentStyle];

  return (
    <div id="beach-vr-root" className={`min-h-screen text-stone-100 ${style.bg} font-sans transition-all duration-700 ease-in-out selection:bg-orange-500 selection:text-stone-950`}>
      
      {/* Upper header notifications bar with location & TG links */}
      <div className="bg-stone-950/90 border-b border-stone-900/60 py-2.5 px-6" id="top-announcement-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-stone-400 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Сезон 2026: Работаем ежедневно с 10:00 до 23:00</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-stone-300 font-sans">
              <MapPin className="w-3.5 h-3.5 mr-1 text-orange-500" /> Сочи, пос. Солоники, <b>пляж Солоники-1</b>
            </span>
            <a href="https://t.me/sochiVR" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors flex items-center bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-[11px] text-sky-400 font-bold">
              <Send className="w-3 h-3 mr-1" /> @sochiVR
            </a>
          </div>
        </div>
      </div>

      {/* Primary Header with Logo, Navigation, and Design Variant Selection */}
      <header id="site-header" className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-900/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-900 to-stone-800 flex items-center justify-center border border-stone-700 overflow-hidden shadow-md">
              <Gamepad2 className="w-5 h-5 text-orange-400 relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-orange-500/5 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base text-white tracking-tight uppercase leading-none group-hover:text-orange-400 transition-colors">
                SOCHI<span className="text-orange-500 font-extrabold">VR</span>
              </span>
              <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">СОЛОНИКИ ПЛЯЖ</span>
            </div>
          </div>

          {/* Core Interactive User Feature: Switcher presenting the 3 Website design options */}
          <div className="hidden lg:flex items-center bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl space-x-2 shadow-inner" id="stylePresetSwitcher">
            <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase pr-1.5 flex items-center">
              <Layers className="w-3 h-3 mr-1 text-orange-500" /> Вариант сайта:
            </span>
            
            <button
              onClick={() => setCurrentStyle("cyber-ocean")}
              className={`px-3 py-1 text-xs rounded-lg cursor-pointer transition-all ${
                currentStyle === "cyber-ocean" 
                  ? "bg-cyan-500 text-stone-950 font-extrabold shadow" 
                  : "text-stone-400 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              Кибер-Океан
            </button>

            <button
              onClick={() => setCurrentStyle("neon-sunset")}
              className={`px-3 py-1 text-xs rounded-lg cursor-pointer transition-all ${
                currentStyle === "neon-sunset" 
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-stone-950 font-extrabold shadow" 
                  : "text-stone-400 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              Черноморский Закат
            </button>

            <button
              onClick={() => setCurrentStyle("cosmic-portal")}
              className={`px-3 py-1 text-xs rounded-lg cursor-pointer transition-all ${
                currentStyle === "cosmic-portal" 
                  ? "bg-lime-400 text-stone-950 font-extrabold shadow" 
                  : "text-stone-400 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              Звёздный Космос
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="#interactive-calculator"
              className="hidden md:inline-flex items-center space-x-1 font-mono text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded border border-stone-800 hover:border-stone-700 transition"
            >
              <span>Калькулятор</span>
            </a>

            <button
              onClick={() => triggerBooking("")}
              className={`flex items-center space-x-1 ${style.accentBtn} font-display font-extrabold text-xs px-4 py-2.5 rounded-lg transition-transform active:scale-95 shadow cursor-pointer`}
            >
              <span>Играть со скидкой</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Design Presets Switcher Banner */}
      <div className="lg:hidden block bg-stone-950 border-b border-stone-900/60 py-2 px-6" id="mobile-preset-banner">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-stone-500 text-[10px] uppercase">Вариант сайта:</span>
          <div className="flex space-x-1.5">
            {(["cyber-ocean", "neon-sunset", "cosmic-portal"] as SiteStyle[]).map((sty) => (
              <button
                key={sty}
                onClick={() => setCurrentStyle(sty)}
                className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                  currentStyle === sty 
                    ? "bg-orange-500 text-stone-950 font-bold border-orange-500" 
                    : "text-stone-400 bg-stone-900 border-stone-800"
                }`}
              >
                {sty === "cyber-ocean" ? "Океан" : sty === "neon-sunset" ? "Закат" : "Космос"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Showcase Block */}
      <section id="hero" className="relative pt-16 pb-20 px-6 overflow-hidden flex items-center">
        {/* Dynamic lights coordinating with selected preset */}
        <div className={`absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-700 ${style.glowBg}`} />
        <div className={`absolute bottom-0 left-10 w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none opacity-15 transition-all duration-700 ${style.glowBg}`} />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 flex flex-col items-start space-y-6" id="hero-info-panel">
            
            {/* Real-time active badge focused on the new Soloniki-1 beach specification */}
            <div className="inline-flex items-center space-x-2 bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-full" id="beach-badge">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping shrink-0" />
              <span className="font-mono text-[10px] text-stone-300 tracking-wider font-semibold uppercase">
                ЭКСКЛЮЗИВНЫЙ ПАВИЛЬОН // СОЧИ, ПЛЯЖ СОЛОНИКИ-1
              </span>
            </div>

            {/* Core Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[106%]">
              Виртуальные Приключения <br />
              <span className={style.accentText}>
                Прямо у Морского Прибоя!
              </span>
            </h1>

            <p className="font-sans text-stone-300 text-base md:text-lg font-normal leading-relaxed max-w-xl">
              Точка аттракционов виртуальной реальности следующего поколения <span className="text-orange-400 font-semibold">SOCHI VR</span> теперь эксклюзивно в <b>посёлке Солоники на центральном пляже Солоники-1</b>! Погрузитесь в невероятные виртуальные миры в новейших сверхчётких автономных шлемах Meta Quest 3. Вас ждут самые популярные и захватывающие игры с полным эффектом присутствия.
            </p>

            {/* Specifications Details styled elegantly as metrics */}
            <div className="grid grid-cols-3 gap-6 py-4 w-full max-w-md border-t border-b border-stone-850 my-2" id="quick-specs-grid">
              <div>
                <span className="block font-mono text-2xl font-black text-white">4 Игры</span>
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">Мировых хитов в шлеме</span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-white">от 350₽</span>
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">Доступная цена сеанса</span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-white">Quest 3</span>
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">Новое поколение линз</span>
              </div>
            </div>

            {/* Quick Actions and CTA */}
            <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto pt-2" id="hero-primary-actions">
              <button
                onClick={() => triggerBooking("")}
                className={`flex items-center justify-center space-x-2 ${style.accentBtn} font-display font-black text-sm px-7 py-4 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer w-full sm:w-auto`}
              >
                <span>Забронировать игру со скидкой 10%</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="#attractions-catalogue"
                className="flex items-center justify-center space-x-2 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white font-sans text-sm font-semibold px-6 py-4 rounded-xl border border-stone-800 transition-colors active:scale-95 w-full sm:w-auto cursor-pointer"
              >
                <span>Узнать больше об играх</span>
              </a>
            </div>

            {/* Interactive incentive explaining Telegram connection */}
            <div className="flex items-center space-x-3 mt-4 text-xs bg-stone-900/65 p-3.5 rounded-xl border border-stone-800 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0 border border-sky-500/20">
                <Send className="w-4 h-4" />
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <span className="text-sky-400 font-bold">Особая акция канала @sochiVR:</span> Подпишитесь на наш телеграм, покажите активный статус подписки администратору нашего павильона на пляже Солоники-1 и мгновенно получите <span className="text-orange-400 font-semibold">+3 минуты бонусного катания</span> бесплатно ко второму сеансу!
              </p>
            </div>

          </div>

          {/* Right Hero Frame: Premium render showing the Sochi VR Soloniki Spot view */}
          <div className="lg:col-span-5 flex justify-center" id="hero-station-frame">
            <div className="relative group w-full max-w-[420px]">
              
              {/* Radial backdrop neon shadow */}
              <div className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r ${
                currentStyle === "cyber-ocean" 
                  ? "from-cyan-500/15 to-blue-500/10" 
                  : currentStyle === "neon-sunset" 
                    ? "from-orange-500/15 to-purple-500/10" 
                    : "from-lime-400/15 to-emerald-500/10"
              } opacity-75 blur-lg group-hover:opacity-100 transition duration-500`} />

              {/* Console visual box */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 flex flex-col shadow-2xl">
                
                {/* Simulated hardware header */}
                <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest">SOCHIVR ACTIVE DECK STATION</span>
                </div>

                {/* Main Hero Shot showing cozy Soloniki beach set representation at sunset */}
                <div className="aspect-[4/3] bg-stone-950 overflow-hidden relative">
                  <img
                    src="/src/assets/images/vr_wooden_beach_booth_1780011816012.png"
                    alt="VR Sochi Soloniki beach wooden booth sunset backdrop"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent p-4 flex flex-col justify-end">
                    <span className="font-mono text-[8px] text-orange-400 uppercase tracking-widest font-bold">ОФИЦИАЛЬНОЕ ФОТО</span>
                    <h3 className="font-display font-extrabold text-sm text-white">Деревянный павильон SOCHI VR — Пляж Солоники-1</h3>
                  </div>
                </div>

                {/* Spec metrics list info */}
                <div className="p-4 bg-stone-950/95 space-y-3.5 border-t border-stone-800">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-stone-500 uppercase block font-mono">Аппаратная платформа</span>
                      <span className="text-stone-200 font-bold">Автономные шлемы 4K Ultra HD</span>
                    </div>
                    <div className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded font-mono text-[10px] text-orange-400 font-bold">
                      120 FPS
                    </div>
                  </div>

                  {/* Effects tags list */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-stone-900 text-[10px] text-stone-400">
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Комфортная зона отдыха</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Панорамный 3D Звук</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Exclusively exactly 4 games from Telegram channel @sochiVR */}
      <section id="attractions-catalogue" className="py-24 px-6 bg-stone-950/80 border-t border-stone-900 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16" id="catalogue-heading">
            <div className="flex flex-col space-y-3 max-w-xl">
              <span className="font-mono text-xs text-orange-500 font-bold uppercase tracking-wider">
                КАТАЛОГ СЕАНСОВ // ВСЕГО 4 ОРИГИНАЛЬНЫХ ХИТА
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Доступные Виртуальные Миры
              </h2>
              <p className="font-sans text-stone-400 text-sm">
                Ниже представлены ровно 4 легендарные VR-игры из официальной программы Telegram-канала <span className="text-white font-bold">@sochiVR</span>.
              </p>
            </div>

            <div className="bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center space-x-2 text-xs text-stone-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Оригинальные Скриншоты Игр Активны</span>
            </div>
          </div>

          {/* Core grid detailing the exact 5 products with custom renders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="games-grids">
            {gamesList.map((game) => (
              <div
                key={game.id}
                className="group bg-stone-900/40 border border-stone-850 p-4.5 rounded-2xl flex flex-col justify-between hover:border-orange-500/20 hover:bg-stone-900/60 transition-all duration-300 shadow-lg"
                id={`game-item-${game.id}`}
              >
                <div>
                  {/* High fidelity image box with standard properties */}
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 relative mb-4">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Upper right limit label */}
                    <span className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-sm border border-stone-800 font-mono text-[9px] text-orange-400 font-bold px-2 py-0.5 rounded shadow">
                      Возраст: {game.ageLimit}
                    </span>

                    {/* Category Overlay tag */}
                    <span className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-sm border border-stone-850 text-[10px] text-stone-300 font-medium px-2 py-0.5 rounded">
                      {game.categoryRu}
                    </span>
                  </div>

                  {/* Operational Time & Intensity metadata info */}
                  <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-stone-500">
                    <span className="flex items-center text-stone-400">
                      <Clock className="w-3.5 h-3.5 mr-1 text-orange-500 shrink-0" /> {game.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[5px] text-[8px] font-black uppercase tracking-wide ${
                      game.intensity === "Высокая" 
                        ? "bg-red-950/60 border border-red-900/60 text-red-400" 
                        : game.intensity === "Средняя"
                          ? "bg-yellow-950/60 border border-yellow-900/60 text-yellow-400"
                          : "bg-green-950/60 border border-green-900/60 text-green-400"
                    }`}>
                      Эффекты: {game.intensity}
                    </span>
                  </div>

                  {/* Game Name */}
                  <h3 className="font-display font-extrabold text-lg text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {game.title}
                  </h3>

                  {/* Plain Text Description */}
                  <p className="font-sans text-stone-300 text-xs leading-relaxed mb-6">
                    {game.description}
                  </p>
                </div>

                {/* Bottom Trigger Action bar detailing real transparent cost per game */}
                <div className="pt-4 border-t border-stone-900 flex justify-between items-center mt-auto" id={`game-price-box-${game.id}`}>
                  <div>
                    <span className="block text-[8px] font-mono text-stone-500 uppercase">Обычный сеанс</span>
                    <span className="font-mono text-base font-bold text-white">{game.price} ₽</span>
                  </div>
                  
                  <button
                    onClick={() => triggerBooking(game.id)}
                    className="font-display font-extrabold text-xs bg-stone-900 text-stone-300 group-hover:bg-orange-500 group-hover:text-stone-950 px-4.5 py-2.5 rounded-xl border border-stone-800 group-hover:border-transparent transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    Занять Шлем
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Live Interactive Price Configurator & Calculator for Beach visitors */}
      <section id="interactive-calculator" className="py-24 px-6 bg-stone-900/10 border-t border-stone-900 relative">
        <div className="max-w-5xl mx-auto bg-stone-950 border border-stone-850 p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-orange-600/5 rounded-full blur-[80px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Explanation card */}
            <div className="lg:col-span-6 space-y-6" id="calc-intro">
              <span className="font-mono text-[10px] text-orange-400 font-bold uppercase tracking-widest bg-stone-900 px-3 py-1 rounded border border-stone-800">
                Живой Калькулятор Симулятора
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-black text-white leading-tight">
                Настройте свой идеальный запуск прямо сейчас!
              </h2>
              <p className="font-sans text-stone-400 text-sm leading-relaxed">
                Интерактивная панель позволяет точно рассчитать групповые сеансы на пляже Солоники-1 с учетом времени и количества участников.
              </p>

              {/* Guarantees specifications */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-stone-300">
                  <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>10% автоматическая скидка на предварительную запись</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-stone-300">
                  <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Оплата наличными или переводом перед игрой</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-stone-300">
                  <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Возможность бесплатной отмены в любой момент</span>
                </div>
              </div>
            </div>

            {/* Interactive controls */}
            <div className="lg:col-span-6 bg-stone-900/50 border border-stone-850 p-6 sm:p-8 rounded-2xl" id="calc-input-panel">
              <div className="space-y-6">
                
                {/* 1. Game Selection */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase mb-2">
                    1. Выберите игру из официального списка:
                  </label>
                  <select
                    value={calcGameId}
                    onChange={(e) => setCalcGameId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-lg px-3.5 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {gamesList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} (базовая цена: {g.price}₽)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Duration Selector */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase mb-2">
                    2. Время погружения в шлем:
                  </label>
                  <div className="grid grid-cols-3 gap-2" id="calc-durations">
                    {[
                      { val: 15, label: "15 мин", text: "Стандарт" },
                      { val: 30, label: "30 мин", text: "-10% Скидка" },
                      { val: 45, label: "45 мин", text: "-15% Скидка" }
                    ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => setCalcDuration(d.val)}
                        className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          calcDuration === d.val
                            ? "bg-orange-500 text-stone-950 font-bold border-orange-500"
                            : "bg-stone-950 border-stone-850 text-stone-300"
                        }`}
                      >
                        <span className="block text-xs font-bold">{d.label}</span>
                        <span className="block text-[8px] opacity-80 leading-none mt-1">{d.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Number of headset users */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase mb-2">
                    3. Количество играющих человек:
                  </label>
                  <div className="flex items-center justify-between bg-stone-950 border border-stone-850 px-4 py-2.5 rounded-xl">
                    <span className="text-xs text-stone-300 font-sans">
                      Игровые шлемы одновременно:
                    </span>
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={() => setCalcPlayers(Math.max(1, calcPlayers - 1))}
                        className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer active:scale-90 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-base font-bold text-white w-4 text-center">{calcPlayers}</span>
                      <button
                        onClick={() => setCalcPlayers(Math.min(4, calcPlayers + 1))}
                        className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer active:scale-90 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Output live calculation results */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 flex items-center justify-between" id="calcs-summary">
                  <div>
                    <span className="block text-[8px] font-mono text-stone-500 uppercase">Ориентировочная сумма</span>
                    <span className="font-mono text-2xl font-black text-white">{calculateResultPrice()} ₽</span>
                  </div>
                  <button
                    onClick={() => triggerBooking(calcGameId)}
                    className="bg-orange-500 hover:bg-orange-400 text-stone-950 font-display font-extrabold text-xs px-5 py-3 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    Зарезервировать
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cozy Location section centered strictly on Soloniki Beach 1 */}
      <section id="location-guide" className="py-24 px-6 bg-stone-950 border-t border-stone-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="location-panel">
            
            <div className="lg:col-span-5 space-y-6" id="cozy-soloniki-brief">
              <span className="font-mono text-xs text-orange-500 font-bold uppercase tracking-wider">
                ГДЕ НАС НАЙТИ // ОДНА ЕДИНСТВЕННАЯ ТОЧКА
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Где мы находимся в Солониках
              </h2>
              <p className="font-sans text-stone-300 text-sm leading-relaxed">
                Мы намеренно отказались от шумных и переполненных сочинских точек в пользу уютного семейного пляжа в Солониках. Здесь, у чистейшей бирюзовой воды, вас ждет наш стильный деревянный павильон.
              </p>

              {/* Soloniki beach address card */}
              <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-850" id="soloniki-card">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-base text-white">Пляж Солоники-1 (Главный пляж посёлка)</h4>
                    <p className="font-sans text-stone-300 text-xs mt-2 leading-relaxed">
                      Черноморское побережье, пос. Солоники, Сочи. Павильон расположен прямо посередине галечной полосы, всего в 50 метрах от ж/д перехода Soloniki и в 100 метрах слева от центрального прогулочного пирса.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      <span className="font-mono text-[9px] bg-stone-950 border border-stone-800 text-stone-400 px-2.5 py-1 rounded">
                        Шлемы Quest 3
                      </span>
                      <span className="font-mono text-[9px] bg-stone-950 border border-stone-800 text-stone-400 px-2.5 py-1 rounded">
                        Панорамный 3D Звук
                      </span>
                      <span className="font-mono text-[9px] bg-stone-950 border border-stone-800 text-stone-400 px-2.5 py-1 rounded">
                        Сверхчёткие 4K линзы
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe guides details */}
              <div className="flex items-start space-x-2.5 text-xs text-stone-400">
                <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p>
                  <b>Как ориентироваться:</b> Спускаясь со станции "Солоники" через железнодорожный переход к центральному входу на пляж, поверните направо вдоль торговых рядов. Наша неоновая вывеска и музыка слышны издалека!
                </p>
              </div>
            </div>

            {/* Custom stylized vector graphic illustration map representing Soloniki-1 beach layout */}
            <div className="lg:col-span-7" id="soloniki-vector-map">
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 p-5 shadow-2xl flex flex-col space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2.5 border-b border-stone-800 gap-2">
                  <span className="text-[10px] font-mono text-stone-300 uppercase tracking-widest flex items-center font-bold">
                    <Map className="w-4 h-4 mr-1.5 text-blue-400" /> ИНТЕРАКТИВНАЯ СХЕМА СТАНЦИИ И ПЛЯЖА
                  </span>
                  <span className="text-[9px] font-mono bg-blue-950 border border-blue-900 text-blue-400 px-2 py-0.5 rounded uppercase font-semibold">
                    Карта Пляжа Солоники-1
                  </span>
                </div>

                {/* Interactive High-Fidelity Map Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-950 border border-stone-850 p-4 select-none" id="interactive-map-frame">
                  
                  {/* Grid Pattern Background overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#2c2c2c_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                  {/* SEA ZONE (Far left) */}
                  <div className="absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-sky-950/40 to-stone-950 border-r border-sky-900/10 flex flex-col justify-between py-6 items-center text-center">
                     <span className="font-mono text-[7px] text-sky-500/40 rotate-90 tracking-widest uppercase my-4">ЧЕРНОЕ МОРЕ</span>
                     <div className="flex flex-col space-y-1 opacity-20">
                       <span className="text-sky-400 text-xs animate-pulse">~</span>
                       <span className="text-sky-400 text-xs">~</span>
                       <span className="text-sky-400 text-xs animate-pulse">~</span>
                     </div>
                     <span className="font-mono text-[7px] text-sky-500/40 rotate-90 tracking-widest uppercase my-4 font-bold">BLACK SEA</span>
                  </div>

                  {/* BEACH & WALKWAY ZONE (Left-middle area, sandy background accent) */}
                  <div className="absolute inset-y-0 left-[20%] w-[32%] bg-amber-950/[0.04] border-r border-stone-850 flex flex-col items-center justify-between py-8">
                     <span className="font-mono text-[6px] text-stone-600 uppercase tracking-widest rotate-270">Пешеходная Пляжная Зона</span>
                     <span className="font-mono text-[6px] text-stone-600 uppercase tracking-widest rotate-270">Галечный Берег пляжа</span>
                  </div>

                  {/* TOWN AREA BUILDINGS (Right side of the railway) */}
                  {/* Building 15/2 */}
                  <div className="absolute top-[8%] right-[6%] w-[18%] h-[12%] bg-stone-900/80 border border-stone-800 rounded-lg flex flex-col justify-center items-center p-1 text-center shadow-md">
                     <span className="font-mono font-black text-[9px] text-stone-100">15/2</span>
                     <span className="text-[7px] font-sans text-stone-500">Жилой сектор</span>
                  </div>

                  {/* Building 1Б/2 */}
                  <div className="absolute top-[26%] right-[6%] w-[16%] h-[10%] bg-stone-900/80 border border-stone-800 rounded-lg flex flex-col justify-center items-center p-1 text-center shadow-md">
                     <span className="font-mono font-black text-[9px] text-stone-100">1Б/2</span>
                  </div>

                  {/* Building 1A/1 */}
                  <div className="absolute top-[44%] right-[22%] w-[16%] h-[12%] bg-stone-900/80 border border-stone-800 rounded-lg flex flex-col justify-center items-center p-1 text-center shadow-md">
                     <span className="font-mono font-black text-[9px] text-stone-100">1А/1</span>
                     <span className="text-[7px] font-sans text-stone-500">Магазины</span>
                  </div>

                  {/* Building 1Б */}
                  <div className="absolute top-[41%] right-[6%] w-[14%] h-[10%] bg-stone-900/80 border border-stone-800 rounded-lg flex flex-col justify-center items-center p-1 text-center shadow-md">
                     <span className="font-mono font-black text-[9px] text-stone-100">1Б</span>
                  </div>

                  {/* Building 15 */}
                  <div className="absolute bottom-[20%] right-[10%] w-[20%] h-[15%] bg-stone-900/80 border border-stone-800 rounded-lg flex flex-col justify-center items-center p-1 text-center shadow-md">
                     <span className="font-mono font-black text-[9px] text-stone-100">15</span>
                     <span className="text-[7px] font-sans text-stone-500">Гостевой дом</span>
                  </div>

                  {/* RAILWAY TRACKS (Nearly vertical, crossing center-right) */}
                  <div className="absolute inset-y-0 right-[42%] w-[6%] flex justify-between px-1 relative">
                    {/* Steel Rails */}
                    <div className="w-[2px] h-full bg-gradient-to-b from-stone-700 via-stone-500 to-stone-700 shadow-[0_0_2px_rgba(255,255,255,0.2)]" />
                    <div className="w-[2px] h-full bg-gradient-to-b from-stone-700 via-stone-500 to-stone-700 shadow-[0_0_2px_rgba(255,255,255,0.2)]" />
                    {/* Ties/Sleepers */}
                    <div className="absolute inset-y-0 inset-x-0 flex flex-col justify-between py-1 opacity-40">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-full h-[1.5px] bg-stone-600" />
                      ))}
                    </div>
                  </div>

                  {/* 1. BLUE ELONGATED PLATFORM (Синяя полоса - Ж/Д Платформа "Солоники") */}
                  <div className="absolute top-[10%] right-[48%] w-[4.5%] h-[36%] rounded-full bg-blue-600/90 shadow-[0_0_12px_#3b82f6] border border-blue-400 z-10 flex items-center justify-center group cursor-pointer transition-transform hover:scale-105">
                     <div className="absolute -left-44 top-1/2 transform -translate-y-1/2 flex items-center space-x-1.5 bg-stone-900/95 border border-blue-500/40 px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                       <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                       <span className="font-mono text-[8px] font-black text-white">СИНЯЯ ПОЛОСА // ПЛАТФОРМА</span>
                     </div>
                  </div>

                  {/* 2. PEDESTRIAN TRANSITION (Пешеходный переход) */}
                  <div className="absolute top-[46.5%] right-[38%] w-[15%] h-[3.5%] flex flex-col justify-between items-center opacity-80 z-10">
                     <div className="w-full h-[2px] bg-stone-400 border-dashed border-b border-stone-500" />
                     <span className="font-mono text-[6px] text-stone-350 bg-stone-900 border border-stone-800 px-1.5 py-px rounded tracking-tight scale-90 whitespace-nowrap">
                       Пешеходный переход
                     </span>
                     <div className="w-full h-[2px] bg-stone-400 border-dashed border-b border-stone-500" />
                  </div>

                  {/* Light path indicator towards VR spot */}
                  <svg className="absolute top-[50%] left-[26%] w-[24%] h-[20%] pointer-events-none z-0 opacity-40" viewBox="0 0 100 100" fill="none">
                    <path d="M 90 10 Q 50 20, 50 80" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                    <circle cx="50" cy="80" r="3" fill="#3b82f6" className="animate-ping" />
                  </svg>

                  {/* 3. CAFE "ВЕРАНДА" ☕ */}
                  <div className="absolute top-[54%] left-[22%] z-20 flex items-center bg-stone-900/95 border border-orange-500/20 px-2 py-1 rounded-lg shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5 flex items-center justify-center text-[7px] text-white font-serif">☕</span>
                    <span className="font-display font-medium text-[8px] text-stone-200">Кафе "Веранда"</span>
                  </div>

                  {/* 4. VR PAVILION BLUE POINT (Синяя точка - Деревянный Павильон SOCHI VR) */}
                  <div className="absolute top-[71%] left-[25%] transform -translate-x-[20%] -translate-y-1/2 z-30 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute -top-1.5" />
                    <div className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] border-2 border-white flex items-center justify-center relative cursor-cell transition-transform hover:scale-110">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                    
                    {/* Flag banner for the VR pavilion location */}
                    <div className="bg-stone-900 border-2 border-blue-500 text-[9px] text-stone-100 px-2.5 py-1.5 rounded-xl mt-2 shadow-2xl flex flex-col items-center text-center relative z-10 w-44">
                      <span className="font-black text-[9px] text-white tracking-wide uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" /> СИНЯЯ ТОЧКА // SOCHI VR
                      </span>
                      <span className="text-[7.5px] text-blue-450 font-mono font-extrabold mt-0.5 text-blue-400">
                        Деревянный павильон
                      </span>
                      <span className="text-[7px] text-stone-400 mt-0.5">
                        Прямо за Кафе "Веранда"
                      </span>
                      <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-blue-500" />
                    </div>
                  </div>

                  {/* Coordinates overlay info */}
                  <div className="absolute bottom-3 left-4 font-mono text-[7px] text-stone-500 uppercase tracking-widest hidden sm:flex items-center gap-2">
                    <span>📍 43.8967° N, 39.3804° E</span>
                    <span className="text-stone-700">|</span>
                    <span>Пляж Солоники-1</span>
                  </div>

                </div>

                {/* Legend describing markers accurately */}
                <div className="grid grid-cols-3 gap-2 text-center" id="map-legend">
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-850/60 flex flex-col justify-center items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6] mb-1 shrink-0" />
                    <span className="text-[8px] font-mono text-zinc-300 font-bold uppercase">Синяя Точка</span>
                    <span className="text-[7.5px] text-zinc-500 font-sans">Павильон SOCHI VR</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-850/60 flex flex-col justify-center items-center">
                    <span className="w-10 h-1.5 rounded-full bg-blue-600 shadow-[0_0_6px_#3b82f6] mb-1.5 shrink-0" />
                    <span className="text-[8px] font-mono text-zinc-300 font-bold uppercase">Синяя Полоса</span>
                    <span className="text-[7.5px] text-zinc-500 font-sans">Ж/Д Платформа ст.Солоники</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-850/60 flex flex-col justify-center items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mb-1 shrink-0" />
                    <span className="text-[8px] font-mono text-zinc-300 font-bold uppercase">Кафе "Веранда"</span>
                    <span className="text-[7.5px] text-zinc-500 font-sans">Ориентир перед входом</span>
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-850 p-3 rounded-xl flex items-center justify-between text-xs text-stone-400">
                  <span>🗺️ До пляжного павильона всего 1 минута неспешной ходьбы от ж/д перехода.</span>
                  <a href="https://t.me/sochiVR" target="_blank" rel="noopener noreferrer" className="text-orange-400 font-bold hover:underline">
                    Написать в ТГ @sochiVR
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Booking Dialog Modal Component */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" id="booking-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
              id="booking-form-panel"
            >
              {/* Header */}
              <div className="px-6 py-4.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest font-bold">БРОНИРОВАНИЕ ОЧЕРЕДИ ONLINE</span>
                </div>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="text-stone-400 hover:text-white p-1 hover:bg-stone-850 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body and Outcomes */}
              <div className="p-6 md:p-8">
                {!bookingSuccess ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    
                    <div>
                      <span className="block text-[11px] text-stone-400 font-sans mb-3 text-center bg-stone-950 rounded-lg p-2.5 border border-stone-850 leading-relaxed">
                        Вы бронируете время на пляже <b>Солоники-1</b>. Скидка 10% гарантирована. Оплата на месте.
                      </span>
                    </div>

                    {/* Pre-fill or select custom game to play */}
                    <div>
                      <label className="block text-xs font-mono text-stone-400 uppercase mb-1.5">
                        Выберите желаемую игру:
                      </label>
                      <select
                        value={selectedGameId}
                        disabled={bookingLoading}
                        onChange={(e) => setSelectedGameId(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                      >
                        <option value="">-- На месте решим, какую включить --</option>
                        {gamesList.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Name input */}
                    <div>
                      <label className="block text-xs font-mono text-stone-400 uppercase mb-1.5">
                        Ваше имя:
                      </label>
                      <input
                        type="text"
                        required
                        disabled={bookingLoading}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Например, Михаил"
                        className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                        id="booking-input-name"
                      />
                    </div>

                    {/* Contact Phone input */}
                    <div>
                      <label className="block text-xs font-mono text-stone-400 uppercase mb-1.5">
                        Номер мобильного телефона:
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={bookingLoading}
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                        id="booking-input-phone"
                      />
                    </div>

                    {/* Explicit Agreement checkbox */}
                    <div className="flex items-start space-x-2.5 pt-1">
                      <input
                        type="checkbox"
                        checked={formAgreed}
                        disabled={bookingLoading}
                        onChange={(e) => setFormAgreed(e.target.checked)}
                        className="mt-0.5"
                        id="form-checkbox-agree"
                      />
                      <label htmlFor="form-checkbox-agree" className="text-[10px] text-stone-400 leading-normal">
                        Согласен на обработку персональных данных для информирования о бронировании.
                      </label>
                    </div>

                    {/* Error display if telegram integration has issue */}
                    {bookingError && (
                      <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-red-200 text-xs leading-relaxed text-center" id="booking-error-panel">
                        ⚠️ {bookingError}
                      </div>
                    )}

                    {/* Trigger action submit */}
                    <button
                      type="submit"
                      disabled={!formAgreed || bookingLoading}
                      className={`w-full flex items-center justify-center space-x-2 ${style.accentBtn} font-display font-extrabold text-xs py-3 rounded-xl mt-6 transition-all active:scale-98 cursor-pointer disabled:opacity-50`}
                      id="submit-booking-action"
                    >
                      {bookingLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Отправка в телеграм бота...</span>
                        </>
                      ) : (
                        <>
                          <span>Записаться в Книгу Очереди</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>

                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4" id="success-message">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-white">
                      Успешная запись!
                    </h3>
                    <p className="font-sans text-stone-300 text-xs leading-relaxed max-w-xs mx-auto">
                      Михаил, ваше время зарезервировано на пляже <b>Солоники-1</b>. Скидка 10% закреплена за номером {formPhone}. Мы свяжемся с вами за 15 минут до свободного шлема. Ждем вас в нашем павильоне!
                    </p>
                    <div className="p-3 bg-stone-950 border border-stone-850 rounded-xl max-w-xs mx-auto">
                      <span className="font-mono text-[9px] text-orange-400 block uppercase font-extrabold">Код брони со скидкой</span>
                      <span className="font-mono text-base font-black text-white">SOLONIKI-VR-2026</span>
                    </div>

                    <button
                      onClick={() => setIsBookingOpen(false)}
                      className="bg-stone-800 hover:bg-stone-750 text-stone-300 font-sans text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                    >
                      Закрыть окно
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deployment & Launch Guide - Core Developer Resource for static single-app launches */}
      <footer className="bg-stone-950 border-t border-stone-900 py-12 px-6 relative" id="site-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <span className="font-display font-bold text-sm text-stone-200">SOCHI VR // ПЛЯЖ СОЛОНИКИ-1</span>
            <p className="font-sans text-stone-400 text-xs">
              Все права защищены © 2026. Страница подготовлена на основе материалов Telegram-канала @sochiVR.
            </p>
          </div>

          {/* Quick toggle command guide for site owner */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
              className="text-stone-400 hover:text-white px-3.5 py-2 rounded-lg border border-stone-800 hover:border-stone-700 bg-stone-900/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
              id="toggle-deployment-guide"
            >
              <Info className="w-3.5 h-3.5 text-orange-500" />
              <span>{showDeploymentGuide ? "Скрыть справку запуска" : "Инструкция по запуску сайта"}</span>
            </button>
            
            <a
              href="https://t.me/sochiVR"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-400 text-stone-950 font-sans text-xs font-extrabold px-4 py-2 rounded-lg transition-transform active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@sochiVR в Telegram</span>
            </a>
          </div>
        </div>

        {/* Expandable Command/Build Spec sheet details for static single html setups */}
        <AnimatePresence>
          {showDeploymentGuide && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-4xl mx-auto mt-8 bg-stone-900/90 border border-stone-800 p-6 rounded-2xl font-mono text-xs text-stone-300 space-y-3.5"
              id="guide-box"
            >
              <h4 className="font-display font-bold text-sm text-white font-sans flex items-center">
                <Sparkle className="w-4 h-4 text-orange-500 mr-1.5" /> Справка по развертыванию и запуску веб-сайта на вашем сервере
              </h4>
              <p className="font-sans text-stone-400 text-[11px] leading-relaxed">
                Этот веб-сайт представляет собой высокоэффективное одностраничное приложение (React + Vite + Tailwind CSS), оптимизированное для работы на любом виртуальном хостинге, выделенном сервере или в облачных контейнерах.
              </p>

              <div className="border-t border-stone-800 pt-3">
                <span className="text-orange-400 block font-bold font-sans">1. Команда компиляции проекта:</span>
                <p className="text-stone-400 font-sans text-[11px] mt-1">
                  Запустите локальную сборку статических HTML/JS/CSS файлов с помощью npm. Все оптимизированные выходные данные будут скомпилированы в защищенную директорию <b>/dist</b>:
                </p>
                <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-850 text-stone-200 mt-2">
                  npm run build
                </div>
              </div>

              <div>
                <span className="text-orange-400 block font-bold font-sans">2. Подключение к серверу (Хостингу):</span>
                <ul className="list-disc pl-5 font-sans text-stone-400 text-[11px] space-y-1.5 mt-2">
                  <li>Загрузите все содержимое папки <b className="text-stone-200">dist/</b> в корневую директорию вашего веб-сервера (например, <b className="text-stone-250">/public_html</b> или <b className="text-stone-250">/var/www/html</b>).</li>
                  <li>Для веб-сервера <b className="text-stone-200">Nginx</b> рекомендуется использовать стандартную статическую конфигурацию: <code className="bg-stone-950 px-1 py-0.5 rounded text-stone-300">try_files $uri $uri/ /index.html;</code> для бесшовных роутингов.</li>
                  <li>Для веб-сервера <b className="text-stone-200">Apache</b> достаточно разместить стандартный файл <code className="text-stone-300">.htaccess</code>, обеспечивающий SPA-редиректы.</li>
                </ul>
              </div>

              <div>
                <span className="text-orange-400 block font-bold font-sans">3. Настройка собственных API ключей или мессенджеров:</span>
                <p className="font-sans text-stone-400 text-[11px]">
                  Чтобы изменить ссылку на телеграм, вы можете обновить переменную в исходном коде или прописать в <code className="bg-stone-950 px-1 py-0.5 rounded text-stone-300">.env.example</code>. Никаких конфиденциальных API ключей для работы витрины не требуется.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>

    </div>
  );
}
