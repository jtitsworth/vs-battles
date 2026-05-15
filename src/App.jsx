import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   FANDOM IMAGE CACHE + FETCHER
───────────────────────────────────────────── */
const IMG_CACHE = {};

async function fetchFandomImg(wiki, pageTitle) {
  const key = `${wiki}::${pageTitle}`;
  if (IMG_CACHE[key] !== undefined) return IMG_CACHE[key];
  IMG_CACHE[key] = null;
  try {
    const url = `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=400&format=json&origin=*`;
    const r = await fetch(url);
    const d = await r.json();
    const pages = d?.query?.pages || {};
    const page = Object.values(pages)[0];
    const src = page?.thumbnail?.source || null;
    IMG_CACHE[key] = src;
    return src;
  } catch(e) {
    IMG_CACHE[key] = null;
    return null;
  }
}



/* ─────────────────────────────────────────────
   DESIGN TOKENS — Arena Battles
───────────────────────────────────────────── */
const C = {
  bg:          "#0a0a0f",
  bgDeep:      "#060608",
  surf:        "#111118",
  surfMid:     "#16161f",
  surfHigh:    "#1c1c28",
  alpha:       "#cc1a2e",   // red
  alphaDim:    "#8a0e1a",
  alphaBorder: "#ff2a42",
  bravo:       "#1a3acc",   // blue
  bravoDim:    "#0e208a",
  bravoBorder: "#2a5aff",
  onSurface:   "#f0eeff",
  muted:       "#6b6b80",
  mutedLight:  "#9090a8",
};

/* ─────────────────────────────────────────────
   ROSTER — existing fighter images + new chars
───────────────────────────────────────────── */
// wiki: fandom subdomain, page: wiki page title
const ROSTER = {
  GOKU:         { img: "/goku.png",               franchise: "DBZ",         abbr: "GK", color: "#8c5200", wiki: "dragonball",    page: "Goku" },
  NARUTO:       { img: "/naruto.png",             franchise: "NARUTO",      abbr: "NT", color: "#b05a00", wiki: "naruto",        page: "Naruto_Uzumaki" },
  SUPERMAN:     { img: "/superman.png",           franchise: "DC",          abbr: "SM", color: "#0a2a7a", wiki: "dc",            page: "Superman" },
  LUFFY:        { img: "/luffy.png",              franchise: "ONE PIECE",   abbr: "LF", color: "#8a1010", wiki: "onepiece",      page: "Monkey_D._Luffy" },
  KRATOS:       { img: "/kratos.png",             franchise: "GOW",         abbr: "KR", color: "#5a1010", wiki: "godofwar",      page: "Kratos" },
  DANTE:        { img: "/dante.png",              franchise: "CAPCOM",      abbr: "DT", color: "#8a0000", wiki: "devilmaycry",   page: "Dante" },
  DOOM_SLAYER:  { img: "/doom slayer.png",        franchise: "DOOM",        abbr: "DS", color: "#1a3a0a", wiki: "doom",          page: "Doom_Slayer" },
  MASTER_CHIEF: { img: "/master chief.png",       franchise: "HALO",        abbr: "MC", color: "#0a3a1a", wiki: "halo",          page: "Master_Chief" },
  RYU:          { img: "/ryu.png",                franchise: "CAPCOM",      abbr: "RY", color: "#0a2040", wiki: "streetfighter", page: "Ryu" },
  JIN_KAZAMA:   { img: "/jin kazama.png",         franchise: "TEKKEN",      abbr: "JK", color: "#0a0a30", wiki: "tekken",        page: "Jin_Kazama" },
  SOL_BADGUY:   { img: "/sol badguy.png",         franchise: "GUILTY GEAR", abbr: "SB", color: "#5a1000", wiki: "guiltygear",    page: "Sol_Badguy" },
  KIRBY:        { img: "/kirby.png",              franchise: "NINTENDO",    abbr: "KB", color: "#7a1a50", wiki: "kirby",         page: "Kirby" },
  SCORPION:     { img: "/scorpion.png",           franchise: "MK",          abbr: "SC", color: "#5a4000", wiki: "mortalkombat",  page: "Scorpion" },
  SHAGGY:       { img: "/shaggy rogers.png",      franchise: "WB",          abbr: "SH", color: "#1a3a00", wiki: "scooby-doo",   page: "Shaggy_Rogers" },
  BROLY:        { img: "/broly.png",              franchise: "DBZ",         abbr: "BL", color: "#2a0a3a", wiki: "dragonball",    page: "Broly" },
  PSYLOCKE:     { img: "/Psylocke.png",           franchise: "MARVEL",      abbr: "PL", color: "#4a0a6a", wiki: "marvel",        page: "Psylocke" },
  WOLVERINE:    { img: "/Wolverine.png",          franchise: "MARVEL",      abbr: "WV", color: "#3a1000", wiki: "marvel",        page: "Wolverine" },
  VEGETA:       { img: "/Vegeta.png",             franchise: "DBZ",         abbr: "VG", color: "#1a0a3a", wiki: "dragonball",    page: "Vegeta" },
  CAP_AMERICA:  { img: "/Captain America.png",    franchise: "MARVEL",      abbr: "CA", color: "#0a1a4a", wiki: "marvel",        page: "Captain_America" },
  CHUN_LI:      { img: "/Chun-Li.png",            franchise: "CAPCOM",      abbr: "CL", color: "#0a2a5a", wiki: "streetfighter", page: "Chun-Li" },
  MOON_KNIGHT:  { img: "/Moon Knight.png",        franchise: "MARVEL",      abbr: "MK", color: "#2a2a2a", wiki: "marvel",        page: "Moon_Knight" },
  PICCOLO:      { img: "/Piccolo.png",            franchise: "DBZ",         abbr: "PC", color: "#0a2a0a", wiki: "dragonball",    page: "Piccolo" },
  STORM:        { img: "/Storm.png",              franchise: "MARVEL",      abbr: "ST", color: "#0a1a3a", wiki: "marvel",        page: "Storm" },
  SIEGFRIED:    { img: "/Siegfried.png",          franchise: "SOULCALIBUR", abbr: "SG", color: "#1a1a3a", wiki: "soulcalibur",   page: "Siegfried_Schtauffen" },
  BATMAN:       { img: "/Batman.png",             franchise: "DC",          abbr: "BM", color: "#0a0a1a", wiki: "dc",            page: "Batman" },
  CAMMY:        { img: "/Cammy.png",              franchise: "CAPCOM",      abbr: "CM", color: "#0a2a1a", wiki: "streetfighter", page: "Cammy" },
  AKUMA:        { img: "/Akuma.png",              franchise: "CAPCOM",      abbr: "AK", color: "#3a0a0a", wiki: "streetfighter", page: "Akuma" },
  AMATERASU:    { img: "/Amaterasu.png",          franchise: "CAPCOM",      abbr: "AM", color: "#3a1a00", wiki: "okami",         page: "Amaterasu" },
  VOLDO:        { img: "/Voldo.png",              franchise: "SOULCALIBUR", abbr: "VO", color: "#1a0a2a", wiki: "soulcalibur",   page: "Voldo" },
  HARLEY_QUINN: { img: "/Harley Quinn.png",       franchise: "DC",          abbr: "HQ", color: "#3a0a2a", wiki: "dc",            page: "Harley_Quinn" },
  GOHAN:        { img: "/Gohan.png",              franchise: "DBZ",         abbr: "GH", color: "#0a1a3a", wiki: "dragonball",    page: "Gohan" },
  IVY:          { img: "/Ivy.png",                franchise: "SOULCALIBUR", abbr: "IV", color: "#1a0a1a", wiki: "soulcalibur",   page: "Ivy_Valentine" },
  LEX_LUTHOR:   { img: "/Lex Luthor.png",         franchise: "DC",          abbr: "LL", color: "#1a1a00", wiki: "dc",            page: "Lex_Luthor" },
  VENOM:        { img: "/Venom.png",              franchise: "MARVEL",      abbr: "VN", color: "#0a1a0a", wiki: "marvel",        page: "Venom" },
  // ── VS Battles fighters (auto-generated) ──
  "PRINCESS_PEACH":{ img:null, franchise:"VS Battles", abbr:"PR", color:"#1a1a2a", wiki:"vsbattles", page:"Princess_Peach", displayName:"Princess Peach" },
  "OBANAI_IGURO":{ img:null, franchise:"VS Battles", abbr:"OB", color:"#1a1a2a", wiki:"vsbattles", page:"Obanai_Iguro", displayName:"Obanai Iguro" },
  "CLEA_MARVEL_COMICS":{ img:null, franchise:"VS Battles", abbr:"CL", color:"#1a1a2a", wiki:"vsbattles", page:"Clea_(Marvel_Comics)", displayName:"Clea (Marvel Comics)" },
  "THE_UNDERTAKER":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Undertaker", displayName:"The Undertaker" },
  "RYUK":{ img:null, franchise:"VS Battles", abbr:"RY", color:"#1a1a2a", wiki:"vsbattles", page:"Ryuk", displayName:"Ryuk" },
  "SAITAMA":{ img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Saitama", displayName:"Saitama" },
  "BLACEPHALON":{ img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blacephalon", displayName:"Blacephalon" },
  "GUNTHER_WWE":{ img:null, franchise:"VS Battles", abbr:"GU", color:"#1a1a2a", wiki:"vsbattles", page:"GUNTHER_(WWE)", displayName:"GUNTHER (WWE)" },
  "MEGURU_BACHIRA":{ img:null, franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Meguru_Bachira", displayName:"Meguru Bachira" },
  "SANDY_CHEEKS":{ img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sandy_Cheeks", displayName:"Sandy Cheeks" },
  "QU":{ img:null, franchise:"VS Battles", abbr:"QU", color:"#1a1a2a", wiki:"vsbattles", page:"Qu", displayName:"Qu" },
  "CHOSO":{ img:null, franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Choso", displayName:"Choso" },
  "RUMI_KPOP_DEMON_HUNTERS":{ img:null, franchise:"VS Battles", abbr:"RU", color:"#1a1a2a", wiki:"vsbattles", page:"Rumi_(KPop_Demon_Hunters)", displayName:"Rumi (KPop Demon Hunters)" },
  "DEXTER_LUMIS_WWE":{ img:null, franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Dexter_Lumis_(WWE)", displayName:"Dexter Lumis (WWE)" },
  "NICK_WILDE":{ img:null, franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nick_Wilde", displayName:"Nick Wilde" },
  "SUGURU_GETO":{ img:null, franchise:"VS Battles", abbr:"SU", color:"#1a1a2a", wiki:"vsbattles", page:"Suguru_Geto", displayName:"Suguru Geto" },
  "GALADRIEL":{ img:null, franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Galadriel", displayName:"Galadriel" },
  "ERAGON":{ img:null, franchise:"VS Battles", abbr:"ER", color:"#1a1a2a", wiki:"vsbattles", page:"Eragon", displayName:"Eragon" },
  "ALABAI":{ img:null, franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alabai", displayName:"Alabai" },
  "RYOMEN_SUKUNA":{ img:null, franchise:"VS Battles", abbr:"RY", color:"#1a1a2a", wiki:"vsbattles", page:"Ryomen_Sukuna", displayName:"Ryomen Sukuna" },
  "JILL_VALENTINE":{ img:null, franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jill_Valentine", displayName:"Jill Valentine" },
  "AUGUSTA_WUTHERING_WAVES":{ img:null, franchise:"VS Battles", abbr:"AU", color:"#1a1a2a", wiki:"vsbattles", page:"Augusta_(Wuthering_Waves)", displayName:"Augusta (Wuthering Waves)" },
  "CAPTAIN_HOOK_DISNEY":{ img:null, franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Captain_Hook_(Disney)", displayName:"Captain Hook (Disney)" },
  "DOORMAN_MARVEL_COMICS":{ img:null, franchise:"VS Battles", abbr:"DO", color:"#1a1a2a", wiki:"vsbattles", page:"Doorman_(Marvel_Comics)", displayName:"Doorman (Marvel Comics)" },
  "CERYDRA":{ img:null, franchise:"VS Battles", abbr:"CE", color:"#1a1a2a", wiki:"vsbattles", page:"Cerydra", displayName:"Cerydra" },
  "RIMURU_TEMPEST_LIGHT_NOVEL":{ img:null, franchise:"VS Battles", abbr:"RI", color:"#1a1a2a", wiki:"vsbattles", page:"Rimuru_Tempest_(Light_Novel)", displayName:"Rimuru Tempest (Light Novel)" },
  "CAPTAIN_PHASMA":{ img:null, franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Captain_Phasma", displayName:"Captain Phasma" },
  "KENJAKU":{ img:null, franchise:"VS Battles", abbr:"KE", color:"#1a1a2a", wiki:"vsbattles", page:"Kenjaku", displayName:"Kenjaku" },
  "MASH_BURNEDEAD":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Mash_Burnedead", displayName:"Mash Burnedead" },
  "ARTICUNO":{ img:null, franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Articuno", displayName:"Articuno" },
  "FIRE_SPIRIT_COOKIE":{ img:null, franchise:"VS Battles", abbr:"FI", color:"#1a1a2a", wiki:"vsbattles", page:"Fire_Spirit_Cookie", displayName:"Fire Spirit Cookie" },
  "KOOPA_TROOPA":{ img:null, franchise:"VS Battles", abbr:"KO", color:"#1a1a2a", wiki:"vsbattles", page:"Koopa_Troopa", displayName:"Koopa Troopa" },
  "MIGUEL_ODUOL":{ img:null, franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miguel_Oduol", displayName:"Miguel Oduol" },
  "MANJIRO_SANO":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Manjiro_Sano", displayName:"Manjiro Sano" },
  "GLAMROCK_CHICA":{ img:null, franchise:"VS Battles", abbr:"GL", color:"#1a1a2a", wiki:"vsbattles", page:"Glamrock_Chica", displayName:"Glamrock Chica" },
  "OKARUN":{ img:null, franchise:"VS Battles", abbr:"OK", color:"#1a1a2a", wiki:"vsbattles", page:"Okarun", displayName:"Okarun" },
  "GORR_THE_GOD_BUTCHER_MARVEL_COMICS":{ img:null, franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Gorr_the_God_Butcher_(Marvel_Comics)", displayName:"Gorr the God Butcher (Marvel Comics)" },
  "THANOS_SQUID_GAME":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"Thanos_(Squid_Game)", displayName:"Thanos (Squid Game)" },
  "LOONA_HELLUVA_BOSS":{ img:null, franchise:"VS Battles", abbr:"LO", color:"#1a1a2a", wiki:"vsbattles", page:"Loona_(Helluva_Boss)", displayName:"Loona (Helluva Boss)" },
  "CYRENE":{ img:null, franchise:"VS Battles", abbr:"CY", color:"#1a1a2a", wiki:"vsbattles", page:"Cyrene", displayName:"Cyrene" },
  "CARTETHYIA":{ img:null, franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Cartethyia", displayName:"Cartethyia" },
  "LINK_TEARS_OF_THE_KINGDOM":{ img:null, franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Link_(Tears_of_the_Kingdom)", displayName:"Link (Tears of the Kingdom)" },
  "JEVIL":{ img:null, franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jevil", displayName:"Jevil" },
  "GUEST_1337_THE_LAST_GUEST":{ img:null, franchise:"VS Battles", abbr:"GU", color:"#1a1a2a", wiki:"vsbattles", page:"Guest_1337_(The_Last_Guest)", displayName:"Guest 1337 (The Last Guest)" },
  "CHARLIE_MORNINGSTAR":{ img:null, franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Charlie_Morningstar", displayName:"Charlie Morningstar" },
  "JING_YUAN":{ img:null, franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jing_Yuan", displayName:"Jing Yuan" },
  "THE_ELDEN_BEAST":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Elden_Beast", displayName:"The Elden Beast" },
  "BETA_RAY_BILL":{ img:null, franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Beta_Ray_Bill", displayName:"Beta Ray Bill" },
  "SASSY_THE_SASQUATCH":{ img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sassy_the_Sasquatch", displayName:"Sassy the Sasquatch" },
  "BOYFRIEND":{ img:null, franchise:"VS Battles", abbr:"BO", color:"#1a1a2a", wiki:"vsbattles", page:"Boyfriend", displayName:"Boyfriend" },
  "REI_AYANAMI":{ img:null, franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rei_Ayanami", displayName:"Rei Ayanami" },
  "ATSUYA_KUSAKABE":{ img:null, franchise:"VS Battles", abbr:"AT", color:"#1a1a2a", wiki:"vsbattles", page:"Atsuya_Kusakabe", displayName:"Atsuya Kusakabe" },
  "KAEYA_ALBERICH":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kaeya_Alberich", displayName:"Kaeya Alberich" },
  "RENSUKE_KUNIGAMI":{ img:null, franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rensuke_Kunigami", displayName:"Rensuke Kunigami" },
  "KINGLER":{ img:null, franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Kingler", displayName:"Kingler" },
  "JOHN_PRICE":{ img:null, franchise:"VS Battles", abbr:"JO", color:"#1a1a2a", wiki:"vsbattles", page:"John_Price", displayName:"John Price" },
  "MAKIMA":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Makima", displayName:"Makima" },
  "SON_GOKU_DBS_ANIME":{ img:null, franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(DBS_Anime)", displayName:"Son Goku (DBS Anime)" },
  "NEUVILLETTE":{ img:null, franchise:"VS Battles", abbr:"NE", color:"#1a1a2a", wiki:"vsbattles", page:"Neuvillette", displayName:"Neuvillette" },
  "KATE_BISHOP_MARVEL_CINEMATIC_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kate_Bishop_(Marvel_Cinematic_Universe)", displayName:"Kate Bishop (Marvel Cinematic Universe)" },
  "MIKE_DELTARUNE":{ img:null, franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Mike_(Deltarune)", displayName:"Mike (Deltarune)" },
  "NATHAN_DRAKE":{ img:null, franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nathan_Drake", displayName:"Nathan Drake" },
  "TENKA_IZUMO":{ img:null, franchise:"VS Battles", abbr:"TE", color:"#1a1a2a", wiki:"vsbattles", page:"Tenka_Izumo", displayName:"Tenka Izumo" },
  "MIRANDA_RESIDENT_EVIL":{ img:null, franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miranda_(Resident_Evil)", displayName:"Miranda (Resident Evil)" },
  "SON_GOKU_DRAGON_BALL":{ img:null, franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(Dragon_Ball)", displayName:"Son Goku (Dragon Ball)" },
  "PAPYRUS":{ img:null, franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Papyrus", displayName:"Papyrus" },
  "MORGOTH":{ img:null, franchise:"VS Battles", abbr:"MO", color:"#1a1a2a", wiki:"vsbattles", page:"Morgoth", displayName:"Morgoth" },
  "BARNACLE_BOY":{ img:null, franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Barnacle_Boy", displayName:"Barnacle Boy" },
  "GABIMARU_THE_HOLLOW":{ img:null, franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Gabimaru_the_Hollow", displayName:"Gabimaru the Hollow" },
  "PERCIVAL_FOUR_KNIGHTS_OF_THE_APOCALYPSE":{ img:null, franchise:"VS Battles", abbr:"PE", color:"#1a1a2a", wiki:"vsbattles", page:"Percival_(Four_Knights_of_The_Apocalypse)", displayName:"Percival (Four Knights of The Apocalypse)" },
  "CHARLIE_DOMPLER_SMILING_FRIENDS":{ img:null, franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Charlie_Dompler_(Smiling_Friends)", displayName:"Charlie Dompler (Smiling Friends)" },
  "CIPHER":{ img:null, franchise:"VS Battles", abbr:"CI", color:"#1a1a2a", wiki:"vsbattles", page:"Cipher", displayName:"Cipher" },
  "AVENTURINE":{ img:null, franchise:"VS Battles", abbr:"AV", color:"#1a1a2a", wiki:"vsbattles", page:"Aventurine", displayName:"Aventurine" },
  "SENJU_KAWARAGI":{ img:null, franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Senju_Kawaragi", displayName:"Senju Kawaragi" },
  "DALE_GRIBBLE":{ img:null, franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Dale_Gribble", displayName:"Dale Gribble" },
  "BLING-BLING_BOY": { img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Bling-Bling_Boy", displayName:"Bling-Bling Boy" },
  "GALBRENA":{ img:null, franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Galbrena", displayName:"Galbrena" },
  "REY_SKYWALKER":{ img:null, franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rey_Skywalker", displayName:"Rey Skywalker" },
  "KANAO_TSUYURI":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kanao_Tsuyuri", displayName:"Kanao Tsuyuri" },
  "EDWARD_ELRIC":{ img:null, franchise:"VS Battles", abbr:"ED", color:"#1a1a2a", wiki:"vsbattles", page:"Edward_Elric", displayName:"Edward Elric" },
  "NAM-GYU": { img:null, franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nam-gyu", displayName:"Nam-gyu" },
  "BALL_BASKET_AND_BALL":{ img:null, franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Ball_(Basket_and_Ball)", displayName:"Ball (Basket and Ball)" },
  "ST_JAYGARCIA_SATURN":{ img:null, franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"St._Jaygarcia_Saturn", displayName:"St. Jaygarcia Saturn" },
  "MALEVOLA":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Malevola", displayName:"Malevola" },
  "MAJIN_DUU":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Majin_Duu", displayName:"Majin Duu" },
  "MAVUIKA":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Mavuika", displayName:"Mavuika" },
  "MARAUDER_DOOM":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Marauder_(DOOM)", displayName:"Marauder (DOOM)" },
  "HARU_URARA":{ img:null, franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Haru_Urara", displayName:"Haru Urara" },
  "PHROLOVA":{ img:null, franchise:"VS Battles", abbr:"PH", color:"#1a1a2a", wiki:"vsbattles", page:"Phrolova", displayName:"Phrolova" },
  "ALCINA_DIMITRESCU":{ img:null, franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alcina_Dimitrescu", displayName:"Alcina Dimitrescu" },
  "LEON_S_KENNEDY":{ img:null, franchise:"VS Battles", abbr:"LE", color:"#1a1a2a", wiki:"vsbattles", page:"Leon_S._Kennedy", displayName:"Leon S. Kennedy" },
  "LIBERTY_PRIME":{ img:null, franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Liberty_Prime", displayName:"Liberty Prime" },
  "DESTOROYAH":{ img:null, franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Destoroyah", displayName:"Destoroyah" },
  "KYOKA_JIRO_EARPHONE_JACK":{ img:null, franchise:"VS Battles", abbr:"KY", color:"#1a1a2a", wiki:"vsbattles", page:"Kyoka_Jiro_(Earphone_Jack)", displayName:"Kyoka Jiro (Earphone Jack)" },
  "KANG_SAE-BYEOK": { img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kang_Sae-byeok", displayName:"Kang Sae-byeok" },
  "BELLATRIX_LESTRANGE":{ img:null, franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Bellatrix_Lestrange", displayName:"Bellatrix Lestrange" },
  "NOBARA_KUGISAKI":{ img:null, franchise:"VS Battles", abbr:"NO", color:"#1a1a2a", wiki:"vsbattles", page:"Nobara_Kugisaki", displayName:"Nobara Kugisaki" },
  "GRAYSON_WALLER_WWE":{ img:null, franchise:"VS Battles", abbr:"GR", color:"#1a1a2a", wiki:"vsbattles", page:"Grayson_Waller_(WWE)", displayName:"Grayson Waller (WWE)" },
  "TARRE_VIZSLA":{ img:null, franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tarre_Vizsla", displayName:"Tarre Vizsla" },
  "OBERYN_MARTELL_A_SONG_OF_ICE_AND_FIRE":{ img:null, franchise:"VS Battles", abbr:"OB", color:"#1a1a2a", wiki:"vsbattles", page:"Oberyn_Martell_(A_Song_of_Ice_and_Fire)", displayName:"Oberyn Martell (A Song of Ice and Fire)" },
  "DRACOVISH":{ img:null, franchise:"VS Battles", abbr:"DR", color:"#1a1a2a", wiki:"vsbattles", page:"Dracovish", displayName:"Dracovish" },
  "DAEODON":{ img:null, franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Daeodon", displayName:"Daeodon" },
  "THE_LIVING_TRIBUNAL":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Living_Tribunal", displayName:"The Living Tribunal" },
  "KAMEN_RIDER_ZX":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kamen_Rider_ZX", displayName:"Kamen Rider ZX" },
  "SATORU_GOJO":{ img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Satoru_Gojo", displayName:"Satoru Gojo" },
  "OGURI_CAP":{ img:null, franchise:"VS Battles", abbr:"OG", color:"#1a1a2a", wiki:"vsbattles", page:"Oguri_Cap", displayName:"Oguri Cap" },
  "THE_COLLECTOR_THE_OWL_HOUSE":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Collector_(The_Owl_House)", displayName:"The Collector (The Owl House)" },
  "STAN_MARSH":{ img:null, franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Stan_Marsh", displayName:"Stan Marsh" },
  "ROUXLS_KAARD":{ img:null, franchise:"VS Battles", abbr:"RO", color:"#1a1a2a", wiki:"vsbattles", page:"Rouxls_Kaard", displayName:"Rouxls Kaard" },
  "BLACK_SWAN":{ img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Black_Swan", displayName:"Black Swan" },
  "KAI_PARKER":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kai_Parker", displayName:"Kai Parker" },
  "KING_K_ROOL":{ img:null, franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"King_K._Rool", displayName:"King K. Rool" },
  "KARL_HEISENBERG":{ img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Karl_Heisenberg", displayName:"Karl Heisenberg" },
  "BENDER":{ img:null, franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Bender", displayName:"Bender" },
  "EURON_GREYJOY_A_SONG_OF_ICE_AND_FIRE":{ img:null, franchise:"VS Battles", abbr:"EU", color:"#1a1a2a", wiki:"vsbattles", page:"Euron_Greyjoy_(A_Song_of_Ice_and_Fire)", displayName:"Euron Greyjoy (A Song of Ice and Fire)" },
  "GLEP_SMILING_FRIENDS":{ img:null, franchise:"VS Battles", abbr:"GL", color:"#1a1a2a", wiki:"vsbattles", page:"Glep_(Smiling_Friends)", displayName:"Glep (Smiling Friends)" },
  "LUCIUS_ZOGRATIS":{ img:null, franchise:"VS Battles", abbr:"LU", color:"#1a1a2a", wiki:"vsbattles", page:"Lucius_Zogratis", displayName:"Lucius Zogratis" },
  "MAKI_ZENIN":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Maki_Zenin", displayName:"Maki Zenin" },
  "ANDREW_HUSSIE":{ img:null, franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Andrew_Hussie", displayName:"Andrew Hussie" },
  "OMEN_VALORANT":{ img:null, franchise:"VS Battles", abbr:"OM", color:"#1a1a2a", wiki:"vsbattles", page:"Omen_(Valorant)", displayName:"Omen (Valorant)" },
  "TARIQ_ST_PATRICK":{ img:null, franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tariq_St._Patrick", displayName:"Tariq St. Patrick" },
  "SHIZUKU_MURASAKI":{ img:null, franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shizuku_Murasaki", displayName:"Shizuku Murasaki" },
  "SERAPHIM_ONE_PIECE":{ img:null, franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Seraphim_(One_Piece)", displayName:"Seraphim (One Piece)" },
  "POLKA_DOT_MAN_DC_EXTENDED_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Polka_Dot_Man_(DC_Extended_Universe)", displayName:"Polka Dot Man (DC Extended Universe)" },
  "CLAPTRAP_BORDERLANDS":{ img:null, franchise:"VS Battles", abbr:"CL", color:"#1a1a2a", wiki:"vsbattles", page:"Claptrap_(Borderlands)", displayName:"Claptrap (Borderlands)" },
  "THE_ROARING_KNIGHT":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Roaring_Knight", displayName:"The Roaring Knight" },
  "DUNCAN_THE_TALL_A_SONG_OF_ICE_AND_FIRE":{ img:null, franchise:"VS Battles", abbr:"DU", color:"#1a1a2a", wiki:"vsbattles", page:"Duncan_the_Tall_(A_Song_of_Ice_and_Fire)", displayName:"Duncan the Tall (A Song of Ice and Fire)" },
  "ALIEN_X":{ img:null, franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alien_X", displayName:"Alien X" },
  "GOOMBA":{ img:null, franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Goomba", displayName:"Goomba" },
  "KRYPTO_THE_SUPERDOG_POST_CRISIS":{ img:null, franchise:"VS Battles", abbr:"KR", color:"#1a1a2a", wiki:"vsbattles", page:"Krypto_the_Superdog_(Post_Crisis)", displayName:"Krypto the Superdog (Post Crisis)" },
  "MARCH_7TH":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"March_7th", displayName:"March 7th" },
  "LANCER_DELTARUNE":{ img:null, franchise:"VS Battles", abbr:"LA", color:"#1a1a2a", wiki:"vsbattles", page:"Lancer_(Deltarune)", displayName:"Lancer (Deltarune)" },
  "IPPO_MAKUNOUCHI":{ img:null, franchise:"VS Battles", abbr:"IP", color:"#1a1a2a", wiki:"vsbattles", page:"Ippo_Makunouchi", displayName:"Ippo Makunouchi" },
  "RAMONA_FLOWERS":{ img:null, franchise:"VS Battles", abbr:"RA", color:"#1a1a2a", wiki:"vsbattles", page:"Ramona_Flowers", displayName:"Ramona Flowers" },
  "MYDEI":{ img:null, franchise:"VS Battles", abbr:"MY", color:"#1a1a2a", wiki:"vsbattles", page:"Mydei", displayName:"Mydei" },
  "QIN_SHI_HUANG_RECORD_OF_RAGNAROK":{ img:null, franchise:"VS Battles", abbr:"QI", color:"#1a1a2a", wiki:"vsbattles", page:"Qin_Shi_Huang_(Record_of_Ragnarok)", displayName:"Qin Shi Huang (Record of Ragnarok)" },
  "POKIO":{ img:null, franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Pokio", displayName:"Pokio" },
  "GIYU_TOMIOKA":{ img:null, franchise:"VS Battles", abbr:"GI", color:"#1a1a2a", wiki:"vsbattles", page:"Giyu_Tomioka", displayName:"Giyu Tomioka" },
  "LEON_BRAWL_STARS":{ img:null, franchise:"VS Battles", abbr:"LE", color:"#1a1a2a", wiki:"vsbattles", page:"Leon_(Brawl_Stars)", displayName:"Leon (Brawl Stars)" },
  "ASTRA_VALORANT":{ img:null, franchise:"VS Battles", abbr:"AS", color:"#1a1a2a", wiki:"vsbattles", page:"Astra_(Valorant)", displayName:"Astra (Valorant)" },
  "JEFF_THE_LAND_SHARK":{ img:null, franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jeff_the_Land_Shark", displayName:"Jeff the Land Shark" },
  "DOEY_THE_DOUGHMAN":{ img:null, franchise:"VS Battles", abbr:"DO", color:"#1a1a2a", wiki:"vsbattles", page:"Doey_the_Doughman", displayName:"Doey the Doughman" },
  "MINERVA_MCGONAGALL":{ img:null, franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Minerva_McGonagall", displayName:"Minerva McGonagall" },
  "SAILOR_PLUTO_MANGA":{ img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sailor_Pluto_(Manga)", displayName:"Sailor Pluto (Manga)" },
  "SEONG_GI-HUN": { img:null, franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Seong_Gi-hun", displayName:"Seong Gi-hun" },
  "MECHAGODZILLA_MONSTERVERSE":{ img:null, franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Mechagodzilla_(MonsterVerse)", displayName:"Mechagodzilla (MonsterVerse)" },
  "GORR_THE_GOD_BUTCHER_MARVEL_CINEMATIC_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Gorr_the_God_Butcher_(Marvel_Cinematic_Universe)", displayName:"Gorr the God Butcher (Marvel Cinematic Universe)" },
  "AMMIT_MARVEL_CINEMATIC_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"AM", color:"#1a1a2a", wiki:"vsbattles", page:"Ammit_(Marvel_Cinematic_Universe)", displayName:"Ammit (Marvel Cinematic Universe)" },
  "ONE_BATTLE_FOR_DREAM_ISLAND":{ img:null, franchise:"VS Battles", abbr:"ON", color:"#1a1a2a", wiki:"vsbattles", page:"One_(Battle_for_Dream_Island)", displayName:"One (Battle for Dream Island)" },
  "EMPRESS_OF_LIGHT":{ img:null, franchise:"VS Battles", abbr:"EM", color:"#1a1a2a", wiki:"vsbattles", page:"Empress_of_Light", displayName:"Empress of Light" },
  "BLUE_ARCHIVE":{ img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blue_Archive", displayName:"Blue Archive" },
  "ROSE_QUARTZ":{ img:null, franchise:"VS Battles", abbr:"RO", color:"#1a1a2a", wiki:"vsbattles", page:"Rose_Quartz", displayName:"Rose Quartz" },
  "HUEY_FREEMAN":{ img:null, franchise:"VS Battles", abbr:"HU", color:"#1a1a2a", wiki:"vsbattles", page:"Huey_Freeman", displayName:"Huey Freeman" },
  "MARX_KIRBY":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Marx_(Kirby)", displayName:"Marx (Kirby)" },
  "NAHIDA":{ img:null, franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nahida", displayName:"Nahida" },
  "THE_DREDGE":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Dredge", displayName:"The Dredge" },
  "DENJI_CHAINSAW_MAN":{ img:null, franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Denji_(Chainsaw_Man)", displayName:"Denji (Chainsaw Man)" },
  "SID_ICE_AGE":{ img:null, franchise:"VS Battles", abbr:"SI", color:"#1a1a2a", wiki:"vsbattles", page:"Sid_(Ice_Age)", displayName:"Sid (Ice Age)" },
  "CASTORICE":{ img:null, franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Castorice", displayName:"Castorice" },
  "HILICHURL":{ img:null, franchise:"VS Battles", abbr:"HI", color:"#1a1a2a", wiki:"vsbattles", page:"Hilichurl", displayName:"Hilichurl" },
  "SKAR_KING":{ img:null, franchise:"VS Battles", abbr:"SK", color:"#1a1a2a", wiki:"vsbattles", page:"Skar_King", displayName:"Skar King" },
  "SON_GOKU_DBS_MANGA":{ img:null, franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(DBS_Manga)", displayName:"Son Goku (DBS Manga)" },
  "LINK_TWILIGHT_PRINCESS":{ img:null, franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Link_(Twilight_Princess)", displayName:"Link (Twilight Princess)" },
  "ASKELADD":{ img:null, franchise:"VS Battles", abbr:"AS", color:"#1a1a2a", wiki:"vsbattles", page:"Askeladd", displayName:"Askeladd" },
  "KOTAL_KAHN_SECOND_TIMELINE":{ img:null, franchise:"VS Battles", abbr:"KO", color:"#1a1a2a", wiki:"vsbattles", page:"Kotal_Kahn_(Second_Timeline)", displayName:"Kotal Kahn (Second Timeline)" },
  "DISTORTUS_REX":{ img:null, franchise:"VS Battles", abbr:"DI", color:"#1a1a2a", wiki:"vsbattles", page:"Distortus_Rex", displayName:"Distortus Rex" },
  "HARVEY_HARVINGTON":{ img:null, franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Harvey_Harvington", displayName:"Harvey Harvington" },
  "PANDA_JUJUTSU_KAISEN":{ img:null, franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Panda_(Jujutsu_Kaisen)", displayName:"Panda (Jujutsu Kaisen)" },
  "DRACOZOLT":{ img:null, franchise:"VS Battles", abbr:"DR", color:"#1a1a2a", wiki:"vsbattles", page:"Dracozolt", displayName:"Dracozolt" },
  "SCOURGE_THE_HEDGEHOG":{ img:null, franchise:"VS Battles", abbr:"SC", color:"#1a1a2a", wiki:"vsbattles", page:"Scourge_the_Hedgehog", displayName:"Scourge the Hedgehog" },
  "ELLIE_THE_LAST_OF_US":{ img:null, franchise:"VS Battles", abbr:"EL", color:"#1a1a2a", wiki:"vsbattles", page:"Ellie_(The_Last_of_Us)", displayName:"Ellie (The Last of Us)" },
  "CYNO":{ img:null, franchise:"VS Battles", abbr:"CY", color:"#1a1a2a", wiki:"vsbattles", page:"Cyno", displayName:"Cyno" },
  "JIYAN_WUTHERING_WAVES":{ img:null, franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jiyan_(Wuthering_Waves)", displayName:"Jiyan (Wuthering Waves)" },
  "JAQEN_H%27GHAR": { img:null, franchise:"VS Battles", abbr:"JA", color:"#1a1a2a", wiki:"vsbattles", page:"Jaqen_H%27ghar", displayName:"Jaqen H%27ghar" },
  "MAGICAL_GIRL_RAISING_PROJECT":{ img:null, franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Magical_Girl_Raising_Project", displayName:"Magical Girl Raising Project" },
  "AGLAEA":{ img:null, franchise:"VS Battles", abbr:"AG", color:"#1a1a2a", wiki:"vsbattles", page:"Aglaea", displayName:"Aglaea" },
  "TAPU_BULU":{ img:null, franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tapu_Bulu", displayName:"Tapu Bulu" },
  "BASIL_OMORI":{ img:null, franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Basil_(OMORI)", displayName:"Basil (OMORI)" },
  "GANONDORF_TEARS_OF_THE_KINGDOM":{ img:null, franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Ganondorf_(Tears_of_the_Kingdom)", displayName:"Ganondorf (Tears of the Kingdom)" },
  "PATCHY_THE_PIRATE":{ img:null, franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Patchy_the_Pirate", displayName:"Patchy the Pirate" },
  "PRINCESS_LUNA":{ img:null, franchise:"VS Battles", abbr:"PR", color:"#1a1a2a", wiki:"vsbattles", page:"Princess_Luna", displayName:"Princess Luna" },
  "HYAKKIMARU":{ img:null, franchise:"VS Battles", abbr:"HY", color:"#1a1a2a", wiki:"vsbattles", page:"Hyakkimaru", displayName:"Hyakkimaru" },
  "MERMAID_MAN":{ img:null, franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Mermaid_Man", displayName:"Mermaid Man" },
  "CITY_OF_HEROES":{ img:null, franchise:"VS Battles", abbr:"CI", color:"#1a1a2a", wiki:"vsbattles", page:"City_of_Heroes", displayName:"City of Heroes" },
  "SMAW":{ img:null, franchise:"VS Battles", abbr:"SM", color:"#1a1a2a", wiki:"vsbattles", page:"SMAW", displayName:"SMAW" },
  "KLEIN_MORETTI":{ img:null, franchise:"VS Battles", abbr:"KL", color:"#1a1a2a", wiki:"vsbattles", page:"Klein_Moretti", displayName:"Klein Moretti" },
  "BUZZWOLE":{ img:null, franchise:"VS Battles", abbr:"BU", color:"#1a1a2a", wiki:"vsbattles", page:"Buzzwole", displayName:"Buzzwole" },
  "LOLTH":{ img:null, franchise:"VS Battles", abbr:"LO", color:"#1a1a2a", wiki:"vsbattles", page:"Lolth", displayName:"Lolth" },
  "POIPOLE":{ img:null, franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Poipole", displayName:"Poipole" },
  "KHAL_DROGO":{ img:null, franchise:"VS Battles", abbr:"KH", color:"#1a1a2a", wiki:"vsbattles", page:"Khal_Drogo", displayName:"Khal Drogo" },
  "CELL_MAX_ANIME":{ img:null, franchise:"VS Battles", abbr:"CE", color:"#1a1a2a", wiki:"vsbattles", page:"Cell_Max_(Anime)", displayName:"Cell Max (Anime)" },
  "AKAZA_KIMETSU_NO_YAIBA":{ img:null, franchise:"VS Battles", abbr:"AK", color:"#1a1a2a", wiki:"vsbattles", page:"Akaza_(Kimetsu_no_Yaiba)", displayName:"Akaza (Kimetsu no Yaiba)" },
  KAHHORI_MARVEL_CINEMATIC_UNIVERSE:_WHAT_IF_%3F: { img:null, franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kahhori_(Marvel_Cinematic_Universe:_What_If...%3F)", displayName:"Kahhori (Marvel Cinematic Universe: What If...%3F)" },
  "STRIKER_HELLUVA_BOSS":{ img:null, franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Striker_(Helluva_Boss)", displayName:"Striker (Helluva Boss)" },
  "PSYCHO_MANTIS":{ img:null, franchise:"VS Battles", abbr:"PS", color:"#1a1a2a", wiki:"vsbattles", page:"Psycho_Mantis", displayName:"Psycho Mantis" },
  "BELISARIUS_CAWL":{ img:null, franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Belisarius_Cawl", displayName:"Belisarius Cawl" },
  "KEYBLADE":{ img:null, franchise:"VS Battles", abbr:"KE", color:"#1a1a2a", wiki:"vsbattles", page:"Keyblade", displayName:"Keyblade" },
  "DHALSIM":{ img:null, franchise:"VS Battles", abbr:"DH", color:"#1a1a2a", wiki:"vsbattles", page:"Dhalsim", displayName:"Dhalsim" },
  "HAJIME_KASHIMO":{ img:null, franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Hajime_Kashimo", displayName:"Hajime Kashimo" },
  "HIROMI_HIGURUMA":{ img:null, franchise:"VS Battles", abbr:"HI", color:"#1a1a2a", wiki:"vsbattles", page:"Hiromi_Higuruma", displayName:"Hiromi Higuruma" },
  "ARLECCHINO":{ img:null, franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Arlecchino", displayName:"Arlecchino" },
  "HENRY_EMILY":{ img:null, franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Henry_Emily", displayName:"Henry Emily" },
  "PEPSIMAN_PS1":{ img:null, franchise:"VS Battles", abbr:"PE", color:"#1a1a2a", wiki:"vsbattles", page:"Pepsiman_(PS1)", displayName:"Pepsiman (PS1)" },
  "GREGOR_CLEGANE":{ img:null, franchise:"VS Battles", abbr:"GR", color:"#1a1a2a", wiki:"vsbattles", page:"Gregor_Clegane", displayName:"Gregor Clegane" },
  "KURUMI_TOKISAKI":{ img:null, franchise:"VS Battles", abbr:"KU", color:"#1a1a2a", wiki:"vsbattles", page:"Kurumi_Tokisaki", displayName:"Kurumi Tokisaki" },
  "DISCORD_MY_LITTLE_PONY":{ img:null, franchise:"VS Battles", abbr:"DI", color:"#1a1a2a", wiki:"vsbattles", page:"Discord_(My_Little_Pony)", displayName:"Discord (My Little Pony)" },
  "MR_BURNS":{ img:null, franchise:"VS Battles", abbr:"MR", color:"#1a1a2a", wiki:"vsbattles", page:"Mr._Burns", displayName:"Mr. Burns" },
  "KI-ADI-MUNDI": { img:null, franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Ki-Adi-Mundi", displayName:"Ki-Adi-Mundi" },
  "THE_G-MAN": { img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_G-Man", displayName:"The G-Man" },
  "BLONDE_BLAZER":{ img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blonde_Blazer", displayName:"Blonde Blazer" },
  "JEWELRY_BONNEY":{ img:null, franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jewelry_Bonney", displayName:"Jewelry Bonney" },
  "RABBID_NORMAL":{ img:null, franchise:"VS Battles", abbr:"RA", color:"#1a1a2a", wiki:"vsbattles", page:"Rabbid_(Normal)", displayName:"Rabbid (Normal)" },
  "BLACK_KNIGHT_MARVEL_COMICS":{ img:null, franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Black_Knight_(Marvel_Comics)", displayName:"Black Knight (Marvel Comics)" },
  "SHINICHI_IZUMI":{ img:null, franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shinichi_Izumi", displayName:"Shinichi Izumi" },
  "POCO":{ img:null, franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Poco", displayName:"Poco" },
  "AMETHYST_STEVEN_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"AM", color:"#1a1a2a", wiki:"vsbattles", page:"Amethyst_(Steven_Universe)", displayName:"Amethyst (Steven Universe)" },
  "DAGOTH_UR":{ img:null, franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Dagoth_Ur", displayName:"Dagoth Ur" },
  "BOOTHILL":{ img:null, franchise:"VS Battles", abbr:"BO", color:"#1a1a2a", wiki:"vsbattles", page:"Boothill", displayName:"Boothill" },
  "MIU_IRUMA":{ img:null, franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miu_Iruma", displayName:"Miu Iruma" },
  "IMOTEKH_THE_STORMLORD":{ img:null, franchise:"VS Battles", abbr:"IM", color:"#1a1a2a", wiki:"vsbattles", page:"Imotekh_the_Stormlord", displayName:"Imotekh the Stormlord" },
  "NICOL_BOLAS":{ img:null, franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nicol_Bolas", displayName:"Nicol Bolas" },
  "ALLIGATOR_LOKI":{ img:null, franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alligator_Loki", displayName:"Alligator Loki" },
  "ANAXA":{ img:null, franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Anaxa", displayName:"Anaxa" },
  "ARJUNA_FATE":{ img:null, franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Arjuna_(Fate)", displayName:"Arjuna (Fate)" },
  "CHAIN_CHOMP":{ img:null, franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Chain_Chomp", displayName:"Chain Chomp" },
  "BRUNO_MADRIGAL":{ img:null, franchise:"VS Battles", abbr:"BR", color:"#1a1a2a", wiki:"vsbattles", page:"Bruno_Madrigal", displayName:"Bruno Madrigal" },
  "PHAINON":{ img:null, franchise:"VS Battles", abbr:"PH", color:"#1a1a2a", wiki:"vsbattles", page:"Phainon", displayName:"Phainon" },
  "CASSIE_CAGE_SECOND_TIMELINE":{ img:null, franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Cassie_Cage_(Second_Timeline)", displayName:"Cassie Cage (Second Timeline)" },
  "JINGLIU":{ img:null, franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jingliu", displayName:"Jingliu" },
  "STRAHD_VON_ZAROVICH":{ img:null, franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Strahd_von_Zarovich", displayName:"Strahd von Zarovich" },
  "SHUMA-GORATH": { img:null, franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shuma-Gorath", displayName:"Shuma-Gorath" },
  "THE_THOUGHT_ROBOT":{ img:null, franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Thought_Robot", displayName:"The Thought Robot" },
  "GHOST_GAME_OF_THRONES":{ img:null, franchise:"VS Battles", abbr:"GH", color:"#1a1a2a", wiki:"vsbattles", page:"Ghost_(Game_of_Thrones)", displayName:"Ghost (Game of Thrones)" },
  "KILLER_ONE_PIECE":{ img:null, franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Killer_(One_Piece)", displayName:"Killer (One Piece)" },
  "SALLY_ACORN_ARCHIE_POST-GENESIS_WAVE": { img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sally_Acorn_(Archie_Post-Genesis_Wave)", displayName:"Sally Acorn (Archie Post-Genesis Wave)" },
  "HELMUT_ZEMO_MARVEL_CINEMATIC_UNIVERSE":{ img:null, franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Helmut_Zemo_(Marvel_Cinematic_Universe)", displayName:"Helmut Zemo (Marvel Cinematic Universe)" },
  "SALLY_ACORN_ARCHIE_PRE-GENESIS_WAVE": { img:null, franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sally_Acorn_(Archie_Pre-Genesis_Wave)", displayName:"Sally Acorn (Archie Pre-Genesis Wave)" },
  "ANGEWOMON":{ img:null, franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Angewomon", displayName:"Angewomon" },
  "LUNA_SNOW_MARVEL_RIVALS":{ img:null, franchise:"VS Battles", abbr:"LU", color:"#1a1a2a", wiki:"vsbattles", page:"Luna_Snow_(Marvel_Rivals)", displayName:"Luna Snow (Marvel Rivals)" },
  "GABRIEL_MALIGNANT":{ img:null, franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Gabriel_(Malignant)", displayName:"Gabriel (Malignant)" },
  "NEOPOLITAN":{ img:null, franchise:"VS Battles", abbr:"NE", color:"#1a1a2a", wiki:"vsbattles", page:"Neopolitan", displayName:"Neopolitan" },
  "JACK_HANMA":{ img:null, franchise:"VS Battles", abbr:"JA", color:"#1a1a2a", wiki:"vsbattles", page:"Jack_Hanma", displayName:"Jack Hanma" },
  "NANACHI":{ img:null, franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nanachi", displayName:"Nanachi" },
  "NIKOLA_TESLA_RECORD_OF_RAGNAROK":{ img:null, franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nikola_Tesla_(Record_of_Ragnarok)", displayName:"Nikola Tesla (Record of Ragnarok)" },
  HERMES_EPIC:_THE_MUSICAL: { img:null, franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Hermes_(EPIC:_The_Musical)", displayName:"Hermes (EPIC: The Musical)" },
  "ERRON_BLACK":{ img:null, franchise:"VS Battles", abbr:"ER", color:"#1a1a2a", wiki:"vsbattles", page:"Erron_Black", displayName:"Erron Black" },
  "IBUKI_MIODA":{ img:null, franchise:"VS Battles", abbr:"IB", color:"#1a1a2a", wiki:"vsbattles", page:"Ibuki_Mioda", displayName:"Ibuki Mioda" }
};

// Fighter grid roster (order matters for display)
const FIGHTER_GRID = [
  "BROLY","GOKU","WOLVERINE","VEGETA","CAP_AMERICA","CHUN_LI","MOON_KNIGHT","PICCOLO",
  "PSYLOCKE","STORM","SIEGFRIED","__RANDOM__","__FIND__","BATMAN","CAMMY","AKUMA",
  "AMATERASU","VOLDO","SUPERMAN","VENOM","HARLEY_QUINN","GOHAN","IVY","LEX_LUTHOR",
];

/* ─────────────────────────────────────────────
   FIGHTER STATS — power ratings for every fighter
   str=strength, spd=speed, dur=durability, int=intelligence, ver=versatility
   Each 0-100. These drive the dynamic battle engine.
───────────────────────────────────────────── */
const FIGHTER_STATS = {
  GOKU:         { str:99, spd:99, dur:95, int:72, ver:97, title:"Ultra Instinct", flavor:"The Saiyan God whose power transcends mortal limits." },
  BROLY:        { str:100,spd:88, dur:99, int:45, ver:72, title:"Legendary Super Saiyan", flavor:"Unbridled berserker energy with near-infinite stamina." },
  VEGETA:       { str:96, spd:95, dur:93, int:82, ver:90, title:"Super Saiyan Blue", flavor:"Royal pride and tactical brilliance in equal measure." },
  GOHAN:        { str:94, spd:90, dur:91, int:90, ver:88, title:"Ultimate Gohan", flavor:"Latent power that rivals the gods when fully unleashed." },
  PICCOLO:      { str:82, spd:80, dur:84, int:90, ver:85, title:"Namekian Warrior", flavor:"Strategic genius with regenerative durability and ki mastery." },
  NARUTO:       { str:90, spd:92, dur:88, int:78, ver:94, title:"Seventh Hokage", flavor:"Sage of Six Paths chakra and an army of shadow clones." },
  LUFFY:        { str:91, spd:88, dur:89, int:65, ver:92, title:"Sun God Nika", flavor:"Gear Fifth reality warping makes him a wildcard in any fight." },
  SUPERMAN:     { str:97, spd:96, dur:98, int:80, ver:85, title:"Man of Steel", flavor:"Solar-powered godhood with near-invincible durability." },
  BATMAN:       { str:72, spd:78, dur:70, int:99, ver:97, title:"World's Greatest Detective", flavor:"Peak human with gear and tactics that defeat near-gods." },
  LEX_LUTHOR:   { str:60, spd:55, dur:65, int:100,ver:90, title:"Apex Intellect", flavor:"The most dangerous human alive — planning wins wars." },
  HARLEY_QUINN: { str:68, spd:74, dur:65, int:80, ver:82, title:"Clown Princess", flavor:"Unpredictable chaos and gymnastic lethality in a mallet swing." },
  WOLVERINE:    { str:80, spd:78, dur:95, int:74, ver:78, title:"Adamantium Berserker", flavor:"Regeneration and adamantium claws make him nearly unkillable." },
  CAP_AMERICA:  { str:76, spd:78, dur:78, int:88, ver:85, title:"Super Soldier", flavor:"Peak human enhanced by serum — leadership and shield mastery." },
  PSYLOCKE:     { str:72, spd:85, dur:70, int:82, ver:85, title:"Psi-Blade Assassin", flavor:"Telepathic strikes that bypass physical defenses entirely." },
  STORM:        { str:70, spd:82, dur:72, int:80, ver:90, title:"Omega-Level Mutant", flavor:"Weather manipulation on a planetary scale — lightning made flesh." },
  MOON_KNIGHT:  { str:74, spd:76, dur:74, int:78, ver:80, title:"Avatar of Khonshu", flavor:"Moon-powered resilience and multiple personalities as tactical assets." },
  VENOM:        { str:85, spd:80, dur:86, int:72, ver:84, title:"Lethal Protector", flavor:"Symbiote bonding grants strength, stealth and spider-sense immunity." },
  KRATOS:       { str:96, spd:82, dur:94, int:78, ver:88, title:"God of War", flavor:"Godslayer. Has killed Zeus, Ares, and entire pantheons." },
  DANTE:        { str:88, spd:90, dur:86, int:74, ver:95, title:"Son of Sparda", flavor:"Half-demon stylishness meets demon-slaying firepower." },
  DOOM_SLAYER:  { str:90, spd:86, dur:92, int:76, ver:88, title:"Doom Eternal", flavor:"Rage incarnate — literally too angry to die." },
  MASTER_CHIEF: { str:78, spd:76, dur:82, int:86, ver:86, title:"Spartan-117", flavor:"MJOLNIR armor, tactical genius, and two lucky feet." },
  RYU:          { str:78, spd:82, dur:78, int:80, ver:82, title:"Street Fighter", flavor:"Hadoken discipline and Satsui no Hado in perfect balance." },
  JIN_KAZAMA:   { str:82, spd:84, dur:80, int:76, ver:80, title:"Devil Gene", flavor:"Tekken mastery fused with demonic transformation." },
  SOL_BADGUY:   { str:86, spd:85, dur:84, int:78, ver:88, title:"Guilty Gear Strive", flavor:"Prototype Gear with raw magical power and Fireseal mastery." },
  AKUMA:        { str:88, spd:88, dur:84, int:78, ver:86, title:"Master of the Fist", flavor:"Satsui no Hado at its purest — seeks only to fight and die." },
  CAMMY:        { str:70, spd:90, dur:68, int:78, ver:78, title:"Delta Red Operative", flavor:"Fastest strikes in street fighting — Spiral Arrow never misses." },
  CHUN_LI:      { str:72, spd:90, dur:70, int:80, ver:80, title:"Strongest Woman", flavor:"Lightning kicks and Interpol tactical training combined." },
  SIEGFRIED:    { str:84, spd:74, dur:86, int:72, ver:76, title:"Soul Calibur Knight", flavor:"Soul Calibur chosen wielder — holy blade that purifies evil." },
  IVY:          { str:76, spd:78, dur:74, int:84, ver:88, title:"Ivy Valentine", flavor:"Snake Sword alchemy and centuries of alchemical knowledge." },
  VOLDO:        { str:74, spd:86, dur:74, int:50, ver:82, title:"Hell Guard", flavor:"Blindfolded contortionist whose unpredictability is his armor." },
  AMATERASU:    { str:72, spd:88, dur:76, int:82, ver:90, title:"Origin of All Things", flavor:"Solar deity with celestial brush techniques and divine weapons." },
  SCORPION:     { str:80, spd:82, dur:80, int:72, ver:80, title:"Hellfire Ninja", flavor:"Undead vengeance with hellfire chains and GET OVER HERE." },
  KIRBY:        { str:70, spd:72, dur:88, int:78, ver:99, title:"Copy Ability", flavor:"Absorbs any power — theoretically limitless adaptability." },
  SHAGGY:       { str:99, spd:99, dur:99, int:60, ver:99, title:"Ultra Instinct Shaggy", flavor:"0.01% of his power casually reshapes reality. Zoinks." },
};

/* ─────────────────────────────────────────────
   DYNAMIC BATTLE ENGINE
   Computes 1v1 matchup from stats
───────────────────────────────────────────── */
const STAT_LABELS = ["STRENGTH","SPEED / REFLEXES","DURABILITY","INT / TACTICS","VERSATILITY"];
const STAT_KEYS   = ["str","spd","dur","int","ver"];

// Specific narrative lines for key matchups
const MATCH_LORE = {
  "GOKU|SUPERMAN":    { rounds:["OPENING CLASH","POWER ESCALATION","ULTRA INSTINCT AWAKENS","FINAL EXCHANGE"], alphaWinLine:"Ultra Instinct's autonomous reflexes outpace solar-powered durability.", bravoWinLine:"Superman's nigh-infinite stamina outlasts Goku's transformation windows." },
  "GOKU|BROLY":       { rounds:["SAIYAN CLASH","BERSERKER SURGE","LIMITS BROKEN","FINAL KAMEHAMEHA"],          alphaWinLine:"Goku's mastered forms give him the edge in technical precision.", bravoWinLine:"Broly's legendary power has no ceiling — raw output overwhelms." },
  "GOKU|VEGETA":      { rounds:["RIVAL OPENING","BLUE EVOLUTION","PRIDE OF SAIYANS","FINAL LIMIT"],            alphaWinLine:"Ultra Instinct is a wall Vegeta's pride alone cannot break.", bravoWinLine:"Ultra Ego's destruction-fueled growth finally surpasses the limit." },
  "NARUTO|SASUKE":    { rounds:["RIVAL CLASH","POWER SURGE","FINAL VALLEY","LAST JUTSU"],                      alphaWinLine:"Six Paths Sage Mode edges out in the final exchange.", bravoWinLine:"Rinnegan precision and Indra's arrow tip the scales." },
  "BATMAN|SUPERMAN":  { rounds:["PREP TIME","KRYPTONITE","BATTLE OF WILLS","FINAL GAMBIT"],                    alphaWinLine:"Prep time and kryptonite neutralize Superman's power advantage.", bravoWinLine:"No amount of prep survives solar-powered fists at full output." },
  "KRATOS|DANTE":     { rounds:["GODSLAYER VS DEMON SLAYER","DIVINE FURY","STYLISH RAMPAGE","FINAL STRIKE"],   alphaWinLine:"Godslayer experience and divine rage overwhelm Dante's style.", bravoWinLine:"Devil Trigger firepower and regeneration outlast Kratos's stamina." },
  "SHAGGY|GOKU":      { rounds:["0.01% POWER","REALITY CRACKS","GODS NOTICE","ZOINKS"],                       alphaWinLine:"Shaggy reveals 0.01% of his power. Goku never stood a chance.", bravoWinLine:"Goku pushes Shaggy past 0.01%. The universe thanks him." },
  "KIRBY|GOKU":       { rounds:["INHALE ATTEMPT","POWER COPY","ADAPTED FORM","FINAL CLASH"],                  alphaWinLine:"Kirby copies Ultra Instinct. The rest is history.", bravoWinLine:"Goku moves too fast for the inhale. Kirby cannot copy what it cannot catch." },
  "DOOM_SLAYER|KRATOS":{ rounds:["RAGE MEETS RAGE","ARSENAL UNLEASHED","GODS AND DEMONS","RIPPING AND TEARING"], alphaWinLine:"The Doom Slayer's pure rage is a force even a god of war respects.", bravoWinLine:"Kratos has killed actual gods. Demons are Tuesday." },
};

function getMatchLore(aKey, bKey) {
  return MATCH_LORE[`${aKey}|${bKey}`] || MATCH_LORE[`${bKey}|${aKey}`] || null;
}

function computeBattle1v1(alphaKey, bravoKey) {
  const A = FIGHTER_STATS[alphaKey] || { str:70,spd:70,dur:70,int:70,ver:70, title:"Unknown", flavor:"A mysterious challenger enters the arena." };
  const B = FIGHTER_STATS[bravoKey] || { str:70,spd:70,dur:70,int:70,ver:70, title:"Unknown", flavor:"A mysterious challenger enters the arena." };

  const aName = alphaKey.replace(/_/g," ");
  const bName = bravoKey.replace(/_/g," ");

  // Compute per-stat winners
  const stats = STAT_KEYS.map((k, i) => {
    const av = A[k], bv = B[k];
    const winner = av > bv+2 ? "alpha" : bv > av+2 ? "bravo" : "draw";
    return { label:STAT_LABELS[i], alpha:av, bravo:bv, winner,
             alphaVal:av.toFixed(1), bravoVal:bv.toFixed(1) };
  });

  // Overall score
  const aTotal = STAT_KEYS.reduce((s,k)=>s+A[k],0);
  const bTotal = STAT_KEYS.reduce((s,k)=>s+B[k],0);
  const diff = aTotal - bTotal;
  const alphaWins = diff > 5;
  const bravoWins = diff < -5;
  const close = Math.abs(diff) <= 5;

  const winnerKey  = alphaWins ? alphaKey : bravoWins ? bravoKey : alphaKey;
  const winnerName = alphaWins ? aName    : bravoWins ? bName    : aName;
  const winSide    = alphaWins ? "alpha"  : "bravo";
  const reliability = close ? `${52 + Math.abs(diff)}%` : alphaWins ? `${60+Math.min(diff,35)}%` : `${60+Math.min(-diff,35)}%`;
  const alphaProb  = close ? "52%" : alphaWins ? `${55+Math.min(diff/2,35)}%` : `${Math.max(15, 45+diff/2)}%`;
  const bravoProb  = `${100-parseInt(alphaProb)}%`;

  const lore = getMatchLore(alphaKey, bravoKey);
  const roundTitles = lore?.rounds || ["OPENING CLASH","POWER ESCALATION","TURNING POINT","FINAL EXCHANGE"];

  // Generate rounds
  const statWins = stats.filter(s=>s.winner!=="draw");
  const rounds = roundTitles.map((title, i) => {
    const roundWinner = i===0 ? (close?"draw":winSide) : i===1 ? (alphaWins?"bravo":"alpha") : i===2 ? winSide : winSide;
    const winTeam = roundWinner;
    const wName = roundWinner==="alpha" ? aName : roundWinner==="bravo" ? bName : "BOTH";
    return {
      title,
      winner: roundWinner==="draw" ? "DRAW" : wName,
      winTeam: roundWinner,
      narrative: generateRoundNarrative(i, roundWinner, aName, bName, A, B),
      reasoning: generateRoundReasoning(i, roundWinner, aName, bName, A, B, stats),
    };
  });

  const reason = alphaWins
    ? (lore?.alphaWinLine || `${aName}'s superior ${STAT_LABELS[STAT_KEYS.indexOf(STAT_KEYS.reduce((best,k)=>A[k]-B[k]>A[best]-B[best]?k:best,STAT_KEYS[0]))].toLowerCase()} proves decisive.`)
    : bravoWins
    ? (lore?.bravoWinLine || `${bName}'s superior ${STAT_LABELS[STAT_KEYS.indexOf(STAT_KEYS.reduce((best,k)=>B[k]-A[k]>B[best]-A[best]?k:best,STAT_KEYS[0]))].toLowerCase()} proves decisive.`)
    : `An extraordinarily even matchup. Both fighters push each other to the limit.`;

  return {
    stats,
    projection:{ winner: `${winnerName} WINS`, reliability, reason },
    rounds,
    alphaProb, bravoProb,
    alphaTitle: A.title, bravoTitle: B.title,
  };
}

function computeBattle2v2(alphaKeys, bravoKeys) {
  const sumStats = (keys) => keys.reduce((acc, k) => {
    const s = FIGHTER_STATS[k] || { str:70,spd:70,dur:70,int:70,ver:70 };
    STAT_KEYS.forEach(sk => acc[sk] = (acc[sk]||0) + s[sk]);
    return acc;
  }, {});

  const A = sumStats(alphaKeys);
  const B = sumStats(bravoKeys);

  const stats = STAT_KEYS.map((k,i) => {
    const av = A[k], bv = B[k];
    const winner = av > bv+4 ? "alpha" : bv > av+4 ? "bravo" : "draw";
    return { label:STAT_LABELS[i], alpha:av, bravo:bv, winner,
             alphaVal:av.toFixed(1), bravoVal:bv.toFixed(1) };
  });

  const aTotal = STAT_KEYS.reduce((s,k)=>s+A[k],0);
  const bTotal = STAT_KEYS.reduce((s,k)=>s+B[k],0);
  const diff = aTotal - bTotal;
  const alphaWins = diff > 0;
  const winSide = alphaWins ? "alpha" : "bravo";
  const reliability = `${55+Math.min(Math.abs(diff)/5,35)}%`;
  const alphaProb = alphaWins ? `${55+Math.min(diff/10,35)}%` : `${Math.max(20,45+diff/10)}%`;

  const aNames = alphaKeys.map(k=>k.replace(/_/g," ")).join(" & ");
  const bNames = bravoKeys.map(k=>k.replace(/_/g," ")).join(" & ");
  const winnerName = alphaWins ? aNames : bNames;

  const roundTitles = ["TEAM TACTICS","POWER SURGE","TURNING POINT","FINAL STAND"];
  const rounds = roundTitles.map((title,i) => {
    const roundWinner = i===0 ? winSide : i===1 ? (alphaWins?"bravo":"alpha") : i===2 ? winSide : winSide;
    const wName = roundWinner==="alpha" ? aNames : bNames;
    return {
      title, winner: wName, winTeam: roundWinner,
      narrative: `${roundWinner==="alpha"?aNames:bNames} seizes the momentum in ${title.toLowerCase()}, pressing their advantage with coordinated strikes.`,
      reasoning: `Combined stats favor ${roundWinner==="alpha"?"Team Alpha":"Team Bravo"} in this phase of the fight.`,
    };
  });

  return {
    stats,
    projection:{ winner:`${winnerName} WIN`, reliability,
      reason:`Combined power ratings give ${winnerName} the edge. Synergy between ${alphaWins?aNames:bNames} proves too much to overcome.` },
    rounds,
    alphaProb, bravoProb: `${100-parseInt(alphaProb)}%`,
  };
}

function generateRoundNarrative(idx, winner, aName, bName, A, B) {
  const wName = winner==="alpha"?aName:winner==="bravo"?bName:"both fighters";
  const lName = winner==="alpha"?bName:winner==="bravo"?aName:null;
  const narratives = [
    `${aName} and ${bName} collide with seismic force. The opening exchange is fast and brutal — neither willing to yield an inch.`,
    `${wName} surges forward, pressing the advantage. ${lName||"The opposition"} digs deep but absorbs punishment.`,
    `The tide turns. ${wName} finds an opening and exploits it decisively, shifting the entire momentum of the battle.`,
    `In the final exchange, ${wName} channels everything into one devastating strike. The arena shakes. When the dust clears, there is only one standing.`,
  ];
  return narratives[Math.min(idx, narratives.length-1)];
}

function generateRoundReasoning(idx, winner, aName, bName, A, B, stats) {
  const wName = winner==="alpha"?aName:winner==="bravo"?bName:"Neither fighter";
  const topStat = stats.sort((a,b)=>Math.abs(b.alpha-b.bravo)-Math.abs(a.alpha-a.bravo))[0];
  const reasons = [
    `Early exchanges favor ${wName} slightly due to ${topStat?.label?.toLowerCase()||"raw power"} advantages.`,
    `${winner==="alpha"?bName:aName} adapts and temporarily reverses the momentum.`,
    `${wName}'s superior ${topStat?.label?.toLowerCase()||"versatility"} creates the decisive opening.`,
    `${wName} delivers the finishing blow. ${topStat?.label} differential of ${Math.abs(topStat?.alpha-topStat?.bravo).toFixed(0)} points makes the difference.`,
  ];
  return reasons[Math.min(idx, reasons.length-1)];
}

/* ─────────────────────────────────────────────
   BATTLE DATA (fallback — used for default hardcoded display
───────────────────────────────────────────── */
const BATTLES = {
  "1v1": {
    id:"1v1", type:"1v1",
    alpha: { name:"GOKU",     rosterKey:"GOKU",     label:"TEAM ALPHA", prob:"71%", stat:{ label:"POWER LEVEL", val:"OVER 9000", pct:98 } },
    bravo: { name:"SUPERMAN", rosterKey:"SUPERMAN", label:"TEAM BRAVO", prob:"29%", stat:{ label:"SOLAR ABSORPTION", val:"MAXIMUM", pct:95 } },
    stats: [
      { label:"STRENGTH",              alpha:95, bravo:96, winner:"bravo", alphaVal:"95.0", bravoVal:"96.0" },
      { label:"SPEED / REFLEXES",      alpha:98, bravo:95, winner:"alpha", alphaVal:"98.0", bravoVal:"95.0" },
      { label:"DURABILITY",            alpha:93, bravo:97, winner:"bravo", alphaVal:"93.0", bravoVal:"97.0" },
      { label:"VERSATILITY / ARSENAL", alpha:94, bravo:72, winner:"alpha", alphaVal:"94.0", bravoVal:"72.0" },
    ],
    projection:{ winner:"GOKU WINS", reliability:"78.4%", reason:"Ultra Instinct's autonomous combat reflexes give Goku a decisive edge." },
    rounds:[
      { title:"OPENING CLASH",          winner:"DRAW",    winTeam:"draw",  narrative:"The two titans collide with earth-shattering force.", reasoning:"Neither fighter gains a clear advantage." },
      { title:"POWER ESCALATION",       winner:"SUPERMAN",winTeam:"bravo", narrative:"Superman's heat vision overpowers Goku's Kamehameha.",  reasoning:"Superman's heat vision overpowers at this power level." },
      { title:"ULTRA INSTINCT AWAKENS", winner:"GOKU",   winTeam:"alpha", narrative:"Ultra Instinct activates — movements become fluid and automatic.", reasoning:"Ultra Instinct's autonomous dodging counters Superman's speed." },
      { title:"FINAL EXCHANGE",         winner:"GOKU",   winTeam:"alpha", narrative:"A blinding white explosion. Superman is on one knee.", reasoning:"Mastered Ultra Instinct surpasses what Superman can absorb." },
    ],
  },
};

/* ─────────────────────────────────────────────
   RANKINGS DATA (unchanged)
───────────────────────────────────────────── */
const PODIUM = [
  { rank:"01", name:"GOKU",    sub:"SAIYAN GOD",     wins:1240, losses:45,  rosterKey:"GOKU",    badge:"CHALLENGER", badgeColor:C.alphaBorder, pct:97 },
  { rank:"02", name:"SUPERMAN",sub:"MAN OF STEEL",   wins:842,  losses:112, rosterKey:"SUPERMAN",badge:"DEFENDER",   badgeColor:C.bravoBorder, pct:88 },
  { rank:"03", name:"NARUTO",  sub:"SEVENTH HOKAGE", wins:710,  losses:180, rosterKey:"NARUTO",  badge:"ELITE",      badgeColor:"#ffe792",     pct:80 },
];

const mkRow = (rank,name,sub,rosterKey,wins,losses,oneV,team,barColor) => ({
  rank,name,sub,rosterKey,wins,losses,oneV,team,barColor,
  rating:Math.round((wins/(wins+losses))*100),
});
const TABLE_ROWS = [
  mkRow("04","LUFFY","SUN GOD NIKA","LUFFY",680,195,"340-80","340-115",C.alphaBorder),
  mkRow("05","KRATOS","GOD OF WAR","KRATOS",614,188,"420-62","194-126",C.bravoBorder),
  mkRow("06","SHAGGY","ULTRA INSTINCT","SHAGGY",581,49,"571-19","10-30","#ffe792"),
  mkRow("07","DOOM SLAYER","DOOM ETERNAL","DOOM_SLAYER",597,203,"381-77","216-126",C.alpha),
  mkRow("08","DANTE","SON OF SPARDA","DANTE",556,244,"310-120","246-124",C.alphaBorder),
  mkRow("09","MASTER CHIEF","SPARTAN-117","MASTER_CHIEF",542,258,"270-114","272-144",C.bravoBorder),
  mkRow("10","SOL BADGUY","GUILTY GEAR STRIVE","SOL_BADGUY",520,280,"295-130","225-150",C.alphaBorder),
  mkRow("11","SCORPION","MORTAL KOMBAT 11","SCORPION",498,302,"310-110","188-192","#ffe792"),
  mkRow("12","RYU","STREET FIGHTER 6","RYU",471,329,"361-89","110-240",C.bravoBorder),
  mkRow("13","NARUTO","BARYON MODE","NARUTO",459,291,"249-141","210-150",C.alpha),
  mkRow("14","JIN KAZAMA","TEKKEN 8","JIN_KAZAMA",440,360,"280-170","160-190",C.bravoBorder),
  mkRow("15","SUPERMAN","SOLAR CHARGED","SUPERMAN",428,322,"240-130","188-192",C.bravoBorder),
  mkRow("16","KIRBY","COPY ABILITY","KIRBY",390,360,"210-160","180-200",C.alphaBorder),
  mkRow("17","GOKU","ULTRA INSTINCT","GOKU",371,279,"200-110","171-169","#ffe792"),
  mkRow("18","LUFFY","GEAR FIFTH","LUFFY",342,408,"180-180","162-228",C.alpha),
  mkRow("19","DANTE","DEVIL TRIGGER","DANTE",310,390,"200-170","110-220",C.bravoBorder),
  mkRow("20","SHAGGY","LIMITLESS POWER","SHAGGY",291,109,"289-39","2-70","#ffe792"),
  mkRow("21","KRATOS","GHOST OF SPARTA","KRATOS",260,240,"140-110","120-130",C.alphaBorder),
  mkRow("22","MASTER CHIEF","LEGENDARY DIFF","MASTER_CHIEF",228,272,"130-120","98-152",C.bravoBorder),
  mkRow("23","SCORPION","HELLFIRE MODE","SCORPION",198,302,"120-150","78-152","#6b6b80"),
];
const TABLE_PAGE = 10;

/* ─────────────────────────────────────────────
   RECENT BATTLES DATA (unchanged)
───────────────────────────────────────────── */
const RECENT_P1 = [
  { id:"r1", type:"1v1", time:"20:45 UTC", winnerColor:"alpha", winner:{ name:"GOKU", sub:"Team Alpha", rosterKey:"GOKU", pct:98 }, loser:{ name:"SUPERMAN", rosterKey:"SUPERMAN" } },

  { id:"r3", type:"1v1", time:"12:15 UTC", winnerColor:"bravo", winner:{ name:"LUFFY", sub:"Team Bravo", rosterKey:"LUFFY", pct:72 }, loser:{ name:"NARUTO", rosterKey:"NARUTO" } },
  { id:"r4", type:"1v1", time:"08:44 UTC", winnerColor:"alpha", winner:{ name:"NARUTO", sub:"Team Alpha", rosterKey:"NARUTO", pct:85 }, loser:{ name:"LUFFY", rosterKey:"LUFFY" } },
];
const RECENT_P2 = [
  { id:"p2a", type:"1v1", time:"23:10 UTC", winnerColor:"alpha", winner:{ name:"KRATOS", sub:"Combatant Alpha", rosterKey:"KRATOS", pct:91 }, loser:{ name:"DANTE", rosterKey:"DANTE" } },

  { id:"p2c", type:"1v1", time:"18:30 UTC", winnerColor:"alpha", winner:{ name:"SOL BADGUY", sub:"Combatant Alpha", rosterKey:"SOL_BADGUY", pct:78 }, loser:{ name:"SCORPION", rosterKey:"SCORPION" } },
  { id:"p2d", type:"1v1", time:"16:55 UTC", winnerColor:"bravo", winner:{ name:"SHAGGY", sub:"Combatant Beta", rosterKey:"SHAGGY", pct:99 }, loser:{ name:"KIRBY", rosterKey:"KIRBY" } },
  { id:"p2e", type:"1v1", time:"14:22 UTC", winnerColor:"alpha", winner:{ name:"MASTER CHIEF", sub:"Combatant Alpha", rosterKey:"MASTER_CHIEF", pct:67 }, loser:{ name:"DOOM SLAYER", rosterKey:"DOOM_SLAYER" } },

];

/* ─────────────────────────────────────────────
   AVATAR component
───────────────────────────────────────────── */
function Avatar({ rosterKey, size = 44, grayscale = false, style: extra = {}, imgSrc = null }) {
  const r = ROSTER[rosterKey] || { abbr: "??", color: "#222", img: null };
  // Use local img first, then prop override (from fandom fetch), then fallback
  const src = r.img || imgSrc;
  const base = { width: size, height: size, flexShrink: 0, overflow: "hidden",
    display:"flex", alignItems:"center", justifyContent:"center",
    filter: grayscale ? "grayscale(1) brightness(0.6)" : "none", ...extra };
  if (src) {
    return (
      <div style={base}>
        <img src={src} alt={rosterKey}
          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }}
          onError={e=>{ e.target.style.display="none"; }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: r.color }}>
      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: Math.max(10,size*0.35), fontWeight:900, color:"rgba(255,255,255,0.85)", userSelect:"none" }}>{r.abbr}</span>
    </div>
  );
}

/* Hook to fetch + cache a fandom image for a roster entry */
function useFandomImg(rosterKey) {
  const r = ROSTER[rosterKey];
  const [src, setSrc] = useState(() => {
    if (!r || r.img) return r?.img || null;
    const key = `${r.wiki}::${r.page}`;
    return IMG_CACHE[key] || null;
  });

  useEffect(() => {
    if (!r || r.img || !r.wiki) return; // has local img or no wiki info
    const key = `${r.wiki}::${r.page}`;
    if (IMG_CACHE[key]) { setSrc(IMG_CACHE[key]); return; }
    let cancelled = false;
    fetchFandomImg(r.wiki, r.page).then(url => {
      if (!cancelled && url) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [rosterKey]);

  return src;
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function NavBar({ page, setPage }) {
  const links = [
    { key:"arena",    label:"ARENA" },
    { key:"rankings", label:"RANKINGS" },
  ];
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"#111029", borderBottom:"1px solid rgba(255,255,255,0.08)",
      height:52, display:"flex", alignItems:"stretch", padding:"0 0 0 0" }}>

      {/* Left: Fandom heart + logo */}
      <div style={{ display:"flex", alignItems:"center", gap:0, flexShrink:0 }}>
        {/* Fandom heart icon */}
        <div style={{ width:52, height:52, display:"flex", alignItems:"center", justifyContent:"center",
          borderRight:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16S1 11.5 1 5.5C1 3 3 1 5.5 1 7 1 8.5 1.8 9 3 9.5 1.8 11 1 12.5 1 15 1 17 3 17 5.5 17 11.5 9 16 9 16Z" fill="#00D6D6"/>
          </svg>
        </div>
        {/* Site logo/name */}
        <div onClick={()=>setPage("arena")} style={{ display:"flex", alignItems:"center",
          gap:8, cursor:"pointer", padding:"0 16px", height:"100%",
          borderRight:"1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontFamily:"'Zen Dots',sans-serif", fontSize:16, fontWeight:400,
            color:"#fff", whiteSpace:"nowrap", letterSpacing:"0.04em" }}>ARENA BATTLES</span>
        </div>
      </div>

      {/* Center: Nav links — VS Battles style tabs */}
      <div style={{ flex:1, display:"flex", alignItems:"stretch" }}>
        {links.map(l=>{
          const active = page===l.key;
          return (
            <button key={l.key} onClick={()=>setPage(l.key)}
              style={{ fontFamily:"'Rubik',sans-serif", fontSize:13, fontWeight:500,
                letterSpacing:"0.04em", textTransform:"uppercase",
                background:"none", border:"none", cursor:"pointer",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                borderBottom: active ? "3px solid #FF003C" : "3px solid transparent",
                borderTop: "3px solid transparent",
                padding:"0 20px", transition:"color 0.15s, border-color 0.15s",
                whiteSpace:"nowrap" }}>
              {l.label}
            </button>
          );
        })}
      </div>

      {/* Right: placeholder for future search/sign in */}
      <div style={{ width:52, borderLeft:"1px solid rgba(255,255,255,0.08)", display:"flex",
        alignItems:"center", justifyContent:"center" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          <path d="M10.5 10.5L14 14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   FIGHTER CARD (big hero portrait)
───────────────────────────────────────────── */
function HeroPortrait({ rosterKey, name, side, selected = true }) {
  const r = ROSTER[rosterKey] || {};
  const fandomSrc = useFandomImg(rosterKey);
  const imgSrc = r.img || fandomSrc;
  const isAlpha = side === "alpha";
  const borderColor = isAlpha ? C.alphaBorder : C.bravoBorder;
  const glowColor   = isAlpha ? C.alpha       : C.bravo;
  const gradDir     = isAlpha ? "to right"    : "to left";
  const nameAlign   = isAlpha ? "left" : "right";

  return (
    <div style={{ position:"relative", width:"100%", height:280, overflow:"hidden",
      border:`2px solid ${borderColor}`,
      boxShadow: selected ? `0 0 30px ${glowColor}55, inset 0 0 30px ${glowColor}11` : "none",
      background: imgSrc ? undefined : r.color || C.surf }}>

      {/* Background gradient overlay */}
      <div style={{ position:"absolute", inset:0, zIndex:1,
        background:`linear-gradient(${gradDir}, ${glowColor}66 0%, transparent 60%), linear-gradient(to top, ${C.bgDeep}dd 0%, transparent 50%)` }} />

      {/* Character image */}
      {imgSrc ? (
        <img src={imgSrc} alt={name}
          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", display:"block" }} />
      ) : (
        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:80, fontWeight:900,
            color:`${borderColor}33`, letterSpacing:"-0.04em" }}>{r.abbr||"?"}</span>
        </div>
      )}

      {/* Name label */}
      <div style={{ position:"absolute", bottom:16, [nameAlign]:16, zIndex:2 }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900,
          textTransform:"uppercase", letterSpacing:"0.04em", color:C.onSurface,
          textShadow:"0 2px 12px rgba(0,0,0,0.9)" }}>
          {name}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FIGHTER GRID CARD
───────────────────────────────────────────── */
function GridCard({ rosterKey, onSelect, selectedAlpha, selectedBravo, activeSide="alpha" }) {

  const r = ROSTER[rosterKey] || {};
  const fandomSrc = useFandomImg(rosterKey);
  const imgSrc = r.img || fandomSrc;
  const [hovered, setHovered] = useState(false);

  const isSelAlpha = selectedAlpha === rosterKey;
  const isSelBravo = selectedBravo === rosterKey;

  // Special cards
  if (rosterKey === "__RANDOM__") {
    return (
      <button onClick={()=>onSelect(rosterKey)}
        style={{ background:C.surfHigh, border:"2px solid transparent", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:6, position:"relative", aspectRatio:"1/1.1", overflow:"hidden",
          transition:"border-color 0.15s, box-shadow 0.15s" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#FF003C"; e.currentTarget.style.boxShadow="0 4px 20px #FF003C88"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.boxShadow="none"; }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
          <polyline points="16 3 21 3 21 8"/><polyline points="8 21 3 21 3 16"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
        <span style={{ fontFamily:"'Teko',sans-serif", fontSize:12, fontWeight:400,
          color:C.mutedLight, letterSpacing:"0.08em", textTransform:"uppercase" }}>RANDOM</span>
      </button>
    );
  }
  if (rosterKey === "__FIND__") {
    return (
      <button onClick={()=>onSelect(rosterKey)}
        style={{ background:C.surfHigh, border:"2px solid transparent", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:6, position:"relative", aspectRatio:"1/1.1", overflow:"hidden",
          transition:"border-color 0.15s, box-shadow 0.15s" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#4D9ED9"; e.currentTarget.style.boxShadow="0 4px 20px #4D9ED988"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.boxShadow="none"; }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span style={{ fontFamily:"'Teko',sans-serif", fontSize:12, fontWeight:400,
          color:C.mutedLight, letterSpacing:"0.08em", textTransform:"uppercase" }}>FIND</span>
      </button>
    );
  }

  // Determine visual state
  // Selected-Red, Selected-Blue, Hover, Default
  const imgBg = isSelAlpha
    ? "linear-gradient(180deg, #F3012F 0%, #BE0729 100%)"
    : isSelBravo
    ? "linear-gradient(180deg, #6EB4E8 0%, #006EB7 100%)"
    : "#4D4D4C";



  const hoverBorder = activeSide==="alpha" ? C.alphaBorder : C.bravoBorder;
  const borderColor = isSelAlpha ? C.alphaBorder
    : isSelBravo ? C.bravoBorder
    : hovered ? hoverBorder
    : "transparent";

  const hoverGlow = activeSide==="alpha" ? `0 0 16px ${C.alpha}88` : `0 0 16px ${C.bravo}88`;
  const boxShadow = isSelAlpha ? `0 0 20px ${C.alpha}, 0 0 40px ${C.alpha}55`
    : isSelBravo ? `0 0 20px ${C.bravo}, 0 0 40px ${C.bravo}55`
    : hovered ? hoverGlow
    : "none";

  return (
    <button
      onClick={()=>onSelect(rosterKey)}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{ background:"#000", border:`1.5px solid ${borderColor}`,
        boxShadow, cursor:"pointer", display:"flex", flexDirection:"column",
        position:"relative", aspectRatio:"1/1.1", overflow:"hidden",
        transition:"border-color 0.15s, box-shadow 0.15s", padding:0 }}>

      {/* Image area */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", width:"100%" }}>
        {/* Color-tinted background behind image */}
        <div style={{ position:"absolute", inset:0, background:imgBg }} />
        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, zIndex:1,
          background:"linear-gradient(180deg, rgba(102,102,102,0) 53%, #000 100%)" }} />
        {/* Image */}
        {imgSrc ? (
          <img src={imgSrc} alt={rosterKey}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center",
              display:"block", position:"relative", zIndex:2 }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", position:"relative", zIndex:2 }}>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900,
              color:"rgba(255,255,255,0.4)" }}>{r.abbr}</span>
          </div>
        )}

      </div>

      {/* Name area below image */}
      <div style={{ padding:"4px 6px 5px", background:"#000" }}>
        <div style={{ fontFamily:"'Teko',sans-serif", fontSize:20, fontWeight:400,
          textTransform:"uppercase", letterSpacing:"0.02em", color:"#fff", lineHeight:1.1 }}>
          {rosterKey.replace(/_/g," ")}
        </div>
        {/* Hover subtitle — franchise shown below name on hover */}
        {hovered && !isSelAlpha && !isSelBravo && (
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:"#DAD9D9",
            textTransform:"uppercase", marginTop:1, opacity:0.8 }}>
            {r.franchise||""}
          </div>
        )}
      </div>
    </button>
  );
}

const FIGHTER_WIKI_MAP = {
  "Princess Peach": "Princess_Peach",
  "Obanai Iguro": "Obanai_Iguro",
  "Clea (Marvel Comics)": "Clea_(Marvel_Comics)",
  "The Undertaker": "The_Undertaker",
  "Ryuk": "Ryuk",
  "Saitama": "Saitama",
  "Blacephalon": "Blacephalon",
  "GUNTHER (WWE)": "GUNTHER_(WWE)",
  "Meguru Bachira": "Meguru_Bachira",
  "Sandy Cheeks": "Sandy_Cheeks",
  "Qu": "Qu",
  "Choso": "Choso",
  "Rumi (KPop Demon Hunters)": "Rumi_(KPop_Demon_Hunters)",
  "Dexter Lumis (WWE)": "Dexter_Lumis_(WWE)",
  "Nick Wilde": "Nick_Wilde",
  "Suguru Geto": "Suguru_Geto",
  "Galadriel": "Galadriel",
  "Eragon": "Eragon",
  "Alabai": "Alabai",
  "Ryomen Sukuna": "Ryomen_Sukuna",
  "Jill Valentine": "Jill_Valentine",
  "Augusta (Wuthering Waves)": "Augusta_(Wuthering_Waves)",
  "Captain Hook (Disney)": "Captain_Hook_(Disney)",
  "Doorman (Marvel Comics)": "Doorman_(Marvel_Comics)",
  "Cerydra": "Cerydra",
  "Rimuru Tempest (Light Novel)": "Rimuru_Tempest_(Light_Novel)",
  "Captain Phasma": "Captain_Phasma",
  "Kenjaku": "Kenjaku",
  "Mash Burnedead": "Mash_Burnedead",
  "Articuno": "Articuno",
  "Fire Spirit Cookie": "Fire_Spirit_Cookie",
  "Koopa Troopa": "Koopa_Troopa",
  "Miguel Oduol": "Miguel_Oduol",
  "Manjiro Sano": "Manjiro_Sano",
  "Glamrock Chica": "Glamrock_Chica",
  "Okarun": "Okarun",
  "Gorr the God Butcher (Marvel Comics)": "Gorr_the_God_Butcher_(Marvel_Comics)",
  "Thanos (Squid Game)": "Thanos_(Squid_Game)",
  "Loona (Helluva Boss)": "Loona_(Helluva_Boss)",
  "Cyrene": "Cyrene",
  "Cartethyia": "Cartethyia",
  "Link (Tears of the Kingdom)": "Link_(Tears_of_the_Kingdom)",
  "Jevil": "Jevil",
  "Guest 1337 (The Last Guest)": "Guest_1337_(The_Last_Guest)",
  "Charlie Morningstar": "Charlie_Morningstar",
  "Jing Yuan": "Jing_Yuan",
  "The Elden Beast": "The_Elden_Beast",
  "Beta Ray Bill": "Beta_Ray_Bill",
  "Sassy the Sasquatch": "Sassy_the_Sasquatch",
  "Boyfriend": "Boyfriend",
  "Rei Ayanami": "Rei_Ayanami",
  "Atsuya Kusakabe": "Atsuya_Kusakabe",
  "Kaeya Alberich": "Kaeya_Alberich",
  "Rensuke Kunigami": "Rensuke_Kunigami",
  "Kingler": "Kingler",
  "John Price": "John_Price",
  "Makima": "Makima",
  "Son Goku (DBS Anime)": "Son_Goku_(DBS_Anime)",
  "Neuvillette": "Neuvillette",
  "Kate Bishop (Marvel Cinematic Universe)": "Kate_Bishop_(Marvel_Cinematic_Universe)",
  "Mike (Deltarune)": "Mike_(Deltarune)",
  "Nathan Drake": "Nathan_Drake",
  "Tenka Izumo": "Tenka_Izumo",
  "Miranda (Resident Evil)": "Miranda_(Resident_Evil)",
  "Son Goku (Dragon Ball)": "Son_Goku_(Dragon_Ball)",
  "Papyrus": "Papyrus",
  "Morgoth": "Morgoth",
  "Barnacle Boy": "Barnacle_Boy",
  "Gabimaru the Hollow": "Gabimaru_the_Hollow",
  "Percival (Four Knights of The Apocalypse)": "Percival_(Four_Knights_of_The_Apocalypse)",
  "Charlie Dompler (Smiling Friends)": "Charlie_Dompler_(Smiling_Friends)",
  "Cipher": "Cipher",
  "Aventurine": "Aventurine",
  "Senju Kawaragi": "Senju_Kawaragi",
  "Dale Gribble": "Dale_Gribble",
  "Bling-Bling Boy": "Bling-Bling_Boy",
  "Galbrena": "Galbrena",
  "Rey Skywalker": "Rey_Skywalker",
  "Kanao Tsuyuri": "Kanao_Tsuyuri",
  "Edward Elric": "Edward_Elric",
  "Nam-gyu": "Nam-gyu",
  "Ball (Basket and Ball)": "Ball_(Basket_and_Ball)",
  "St. Jaygarcia Saturn": "St._Jaygarcia_Saturn",
  "Malevola": "Malevola",
  "Majin Duu": "Majin_Duu",
  "Mavuika": "Mavuika",
  "Marauder (DOOM)": "Marauder_(DOOM)",
  "Haru Urara": "Haru_Urara",
  "Phrolova": "Phrolova",
  "Alcina Dimitrescu": "Alcina_Dimitrescu",
  "Leon S. Kennedy": "Leon_S._Kennedy",
  "Liberty Prime": "Liberty_Prime",
  "Destoroyah": "Destoroyah",
  "Kyoka Jiro (Earphone Jack)": "Kyoka_Jiro_(Earphone_Jack)",
  "Kang Sae-byeok": "Kang_Sae-byeok",
  "Bellatrix Lestrange": "Bellatrix_Lestrange",
  "Nobara Kugisaki": "Nobara_Kugisaki",
  "Grayson Waller (WWE)": "Grayson_Waller_(WWE)",
  "Tarre Vizsla": "Tarre_Vizsla",
  "Oberyn Martell (A Song of Ice and Fire)": "Oberyn_Martell_(A_Song_of_Ice_and_Fire)",
  "Dracovish": "Dracovish",
  "Daeodon": "Daeodon",
  "The Living Tribunal": "The_Living_Tribunal",
  "Kamen Rider ZX": "Kamen_Rider_ZX",
  "Satoru Gojo": "Satoru_Gojo",
  "Oguri Cap": "Oguri_Cap",
  "The Collector (The Owl House)": "The_Collector_(The_Owl_House)",
  "Stan Marsh": "Stan_Marsh",
  "Rouxls Kaard": "Rouxls_Kaard",
  "Black Swan": "Black_Swan",
  "Kai Parker": "Kai_Parker",
  "King K. Rool": "King_K._Rool",
  "Karl Heisenberg": "Karl_Heisenberg",
  "Bender": "Bender",
  "Euron Greyjoy (A Song of Ice and Fire)": "Euron_Greyjoy_(A_Song_of_Ice_and_Fire)",
  "Glep (Smiling Friends)": "Glep_(Smiling_Friends)",
  "Lucius Zogratis": "Lucius_Zogratis",
  "Maki Zenin": "Maki_Zenin",
  "Andrew Hussie": "Andrew_Hussie",
  "Omen (Valorant)": "Omen_(Valorant)",
  "Tariq St. Patrick": "Tariq_St._Patrick",
  "Shizuku Murasaki": "Shizuku_Murasaki",
  "Seraphim (One Piece)": "Seraphim_(One_Piece)",
  "Polka Dot Man (DC Extended Universe)": "Polka_Dot_Man_(DC_Extended_Universe)",
  "Claptrap (Borderlands)": "Claptrap_(Borderlands)",
  "The Roaring Knight": "The_Roaring_Knight",
  "Duncan the Tall (A Song of Ice and Fire)": "Duncan_the_Tall_(A_Song_of_Ice_and_Fire)",
  "Alien X": "Alien_X",
  "Goomba": "Goomba",
  "Krypto the Superdog (Post Crisis)": "Krypto_the_Superdog_(Post_Crisis)",
  "March 7th": "March_7th",
  "Lancer (Deltarune)": "Lancer_(Deltarune)",
  "Ippo Makunouchi": "Ippo_Makunouchi",
  "Ramona Flowers": "Ramona_Flowers",
  "Mydei": "Mydei",
  "Qin Shi Huang (Record of Ragnarok)": "Qin_Shi_Huang_(Record_of_Ragnarok)",
  "Pokio": "Pokio",
  "Giyu Tomioka": "Giyu_Tomioka",
  "Leon (Brawl Stars)": "Leon_(Brawl_Stars)",
  "Astra (Valorant)": "Astra_(Valorant)",
  "Jeff the Land Shark": "Jeff_the_Land_Shark",
  "Doey the Doughman": "Doey_the_Doughman",
  "Minerva McGonagall": "Minerva_McGonagall",
  "Sailor Pluto (Manga)": "Sailor_Pluto_(Manga)",
  "Seong Gi-hun": "Seong_Gi-hun",
  "Mechagodzilla (MonsterVerse)": "Mechagodzilla_(MonsterVerse)",
  "Gorr the God Butcher (Marvel Cinematic Universe)": "Gorr_the_God_Butcher_(Marvel_Cinematic_Universe)",
  "Ammit (Marvel Cinematic Universe)": "Ammit_(Marvel_Cinematic_Universe)",
  "One (Battle for Dream Island)": "One_(Battle_for_Dream_Island)",
  "Empress of Light": "Empress_of_Light",
  "Blue Archive": "Blue_Archive",
  "Rose Quartz": "Rose_Quartz",
  "Huey Freeman": "Huey_Freeman",
  "Marx (Kirby)": "Marx_(Kirby)",
  "Nahida": "Nahida",
  "The Dredge": "The_Dredge",
  "Denji (Chainsaw Man)": "Denji_(Chainsaw_Man)",
  "Sid (Ice Age)": "Sid_(Ice_Age)",
  "Castorice": "Castorice",
  "Hilichurl": "Hilichurl",
  "Skar King": "Skar_King",
  "Son Goku (DBS Manga)": "Son_Goku_(DBS_Manga)",
  "Link (Twilight Princess)": "Link_(Twilight_Princess)",
  "Askeladd": "Askeladd",
  "Kotal Kahn (Second Timeline)": "Kotal_Kahn_(Second_Timeline)",
  "Distortus Rex": "Distortus_Rex",
  "Harvey Harvington": "Harvey_Harvington",
  "Panda (Jujutsu Kaisen)": "Panda_(Jujutsu_Kaisen)",
  "Dracozolt": "Dracozolt",
  "Scourge the Hedgehog": "Scourge_the_Hedgehog",
  "Ellie (The Last of Us)": "Ellie_(The_Last_of_Us)",
  "Cyno": "Cyno",
  "Jiyan (Wuthering Waves)": "Jiyan_(Wuthering_Waves)",
  "Jaqen H%27ghar": "Jaqen_H%27ghar",
  "Magical Girl Raising Project": "Magical_Girl_Raising_Project",
  "Aglaea": "Aglaea",
  "Tapu Bulu": "Tapu_Bulu",
  "Basil (OMORI)": "Basil_(OMORI)",
  "Ganondorf (Tears of the Kingdom)": "Ganondorf_(Tears_of_the_Kingdom)",
  "Patchy the Pirate": "Patchy_the_Pirate",
  "Princess Luna": "Princess_Luna",
  "Hyakkimaru": "Hyakkimaru",
  "Mermaid Man": "Mermaid_Man",
  "City of Heroes": "City_of_Heroes",
  "SMAW": "SMAW",
  "Klein Moretti": "Klein_Moretti",
  "Buzzwole": "Buzzwole",
  "Lolth": "Lolth",
  "Poipole": "Poipole",
  "Khal Drogo": "Khal_Drogo",
  "Cell Max (Anime)": "Cell_Max_(Anime)",
  "Akaza (Kimetsu no Yaiba)": "Akaza_(Kimetsu_no_Yaiba)",
  "Kahhori (Marvel Cinematic Universe: What If...%3F)": "Kahhori_(Marvel_Cinematic_Universe:_What_If...%3F)",
  "Striker (Helluva Boss)": "Striker_(Helluva_Boss)",
  "Psycho Mantis": "Psycho_Mantis",
  "Belisarius Cawl": "Belisarius_Cawl",
  "Keyblade": "Keyblade",
  "Dhalsim": "Dhalsim",
  "Hajime Kashimo": "Hajime_Kashimo",
  "Hiromi Higuruma": "Hiromi_Higuruma",
  "Arlecchino": "Arlecchino",
  "Henry Emily": "Henry_Emily",
  "Pepsiman (PS1)": "Pepsiman_(PS1)",
  "Gregor Clegane": "Gregor_Clegane",
  "Kurumi Tokisaki": "Kurumi_Tokisaki",
  "Discord (My Little Pony)": "Discord_(My_Little_Pony)",
  "Mr. Burns": "Mr._Burns",
  "Ki-Adi-Mundi": "Ki-Adi-Mundi",
  "The G-Man": "The_G-Man",
  "Blonde Blazer": "Blonde_Blazer",
  "Jewelry Bonney": "Jewelry_Bonney",
  "Rabbid (Normal)": "Rabbid_(Normal)",
  "Black Knight (Marvel Comics)": "Black_Knight_(Marvel_Comics)",
  "Shinichi Izumi": "Shinichi_Izumi",
  "Poco": "Poco",
  "Amethyst (Steven Universe)": "Amethyst_(Steven_Universe)",
  "Dagoth Ur": "Dagoth_Ur",
  "Boothill": "Boothill",
  "Miu Iruma": "Miu_Iruma",
  "Imotekh the Stormlord": "Imotekh_the_Stormlord",
  "Nicol Bolas": "Nicol_Bolas",
  "Alligator Loki": "Alligator_Loki",
  "Anaxa": "Anaxa",
  "Arjuna (Fate)": "Arjuna_(Fate)",
  "Chain Chomp": "Chain_Chomp",
  "Bruno Madrigal": "Bruno_Madrigal",
  "Phainon": "Phainon",
  "Cassie Cage (Second Timeline)": "Cassie_Cage_(Second_Timeline)",
  "Jingliu": "Jingliu",
  "Strahd von Zarovich": "Strahd_von_Zarovich",
  "Shuma-Gorath": "Shuma-Gorath",
  "The Thought Robot": "The_Thought_Robot",
  "Ghost (Game of Thrones)": "Ghost_(Game_of_Thrones)",
  "Killer (One Piece)": "Killer_(One_Piece)",
  "Sally Acorn (Archie Post-Genesis Wave)": "Sally_Acorn_(Archie_Post-Genesis_Wave)",
  "Helmut Zemo (Marvel Cinematic Universe)": "Helmut_Zemo_(Marvel_Cinematic_Universe)",
  "Sally Acorn (Archie Pre-Genesis Wave)": "Sally_Acorn_(Archie_Pre-Genesis_Wave)",
  "Angewomon": "Angewomon",
  "Luna Snow (Marvel Rivals)": "Luna_Snow_(Marvel_Rivals)",
  "Gabriel (Malignant)": "Gabriel_(Malignant)",
  "Neopolitan": "Neopolitan",
  "Jack Hanma": "Jack_Hanma",
  "Nanachi": "Nanachi",
  "Nikola Tesla (Record of Ragnarok)": "Nikola_Tesla_(Record_of_Ragnarok)",
  "Hermes (EPIC: The Musical)": "Hermes_(EPIC:_The_Musical)",
  "Erron Black": "Erron_Black",
  "Ibuki Mioda": "Ibuki_Mioda"
};

/* ─────────────────────────────────────────────
   FIND FIGHTER MODAL
───────────────────────────────────────────── */
const ALL_FIGHTERS_ALPHA = ["Aglaea", "Akaza (Kimetsu no Yaiba)", "Alabai", "Alcina Dimitrescu", "Alien X", "Alligator Loki", "Amethyst (Steven Universe)", "Ammit (Marvel Cinematic Universe)", "Anaxa", "Andrew Hussie", "Angewomon", "Arjuna (Fate)", "Arlecchino", "Articuno", "Askeladd", "Astra (Valorant)", "Atsuya Kusakabe", "Augusta (Wuthering Waves)", "Aventurine", "Ball (Basket and Ball)", "Barnacle Boy", "Basil (OMORI)", "Belisarius Cawl", "Bellatrix Lestrange", "Bender", "Beta Ray Bill", "Blacephalon", "Black Knight (Marvel Comics)", "Black Swan", "Bling-Bling Boy", "Blonde Blazer", "Blue Archive", "Boothill", "Boyfriend", "Bruno Madrigal", "Buzzwole", "Captain Hook (Disney)", "Captain Phasma", "Cartethyia", "Cassie Cage (Second Timeline)", "Castorice", "Cell Max (Anime)", "Cerydra", "Chain Chomp", "Charlie Dompler (Smiling Friends)", "Charlie Morningstar", "Choso", "Cipher", "City of Heroes", "Claptrap (Borderlands)", "Clea (Marvel Comics)", "Cyno", "Cyrene", "Daeodon", "Dagoth Ur", "Dale Gribble", "Denji (Chainsaw Man)", "Destoroyah", "Dexter Lumis (WWE)", "Dhalsim", "Discord (My Little Pony)", "Distortus Rex", "Doey the Doughman", "Doorman (Marvel Comics)", "Dracovish", "Dracozolt", "Duncan the Tall (A Song of Ice and Fire)", "Edward Elric", "Ellie (The Last of Us)", "Empress of Light", "Eragon", "Erron Black", "Euron Greyjoy (A Song of Ice and Fire)", "Fire Spirit Cookie", "GUNTHER (WWE)", "Gabimaru the Hollow", "Gabriel (Malignant)", "Galadriel", "Galbrena", "Ganondorf (Tears of the Kingdom)", "Ghost (Game of Thrones)", "Giyu Tomioka", "Glamrock Chica", "Glep (Smiling Friends)", "Goomba", "Gorr the God Butcher (Marvel Cinematic Universe)", "Gorr the God Butcher (Marvel Comics)", "Grayson Waller (WWE)", "Gregor Clegane", "Guest 1337 (The Last Guest)", "Hajime Kashimo", "Haru Urara", "Harvey Harvington", "Helmut Zemo (Marvel Cinematic Universe)", "Henry Emily", "Hermes (EPIC: The Musical)", "Hilichurl", "Hiromi Higuruma", "Huey Freeman", "Hyakkimaru", "Ibuki Mioda", "Imotekh the Stormlord", "Ippo Makunouchi", "Jack Hanma", "Jaqen H%27ghar", "Jeff the Land Shark", "Jevil", "Jewelry Bonney", "Jill Valentine", "Jing Yuan", "Jingliu", "Jiyan (Wuthering Waves)", "John Price", "Kaeya Alberich", "Kahhori (Marvel Cinematic Universe: What If...%3F)", "Kai Parker", "Kamen Rider ZX", "Kanao Tsuyuri", "Kang Sae-byeok", "Karl Heisenberg", "Kate Bishop (Marvel Cinematic Universe)", "Kenjaku", "Keyblade", "Khal Drogo", "Ki-Adi-Mundi", "Killer (One Piece)", "King K. Rool", "Kingler", "Klein Moretti", "Koopa Troopa", "Kotal Kahn (Second Timeline)", "Krypto the Superdog (Post Crisis)", "Kurumi Tokisaki", "Kyoka Jiro (Earphone Jack)", "Lancer (Deltarune)", "Leon (Brawl Stars)", "Leon S. Kennedy", "Liberty Prime", "Link (Tears of the Kingdom)", "Link (Twilight Princess)", "Lolth", "Loona (Helluva Boss)", "Lucius Zogratis", "Luna Snow (Marvel Rivals)", "Magical Girl Raising Project", "Majin Duu", "Maki Zenin", "Makima", "Malevola", "Manjiro Sano", "Marauder (DOOM)", "March 7th", "Marx (Kirby)", "Mash Burnedead", "Mavuika", "Mechagodzilla (MonsterVerse)", "Meguru Bachira", "Mermaid Man", "Miguel Oduol", "Mike (Deltarune)", "Minerva McGonagall", "Miranda (Resident Evil)", "Miu Iruma", "Morgoth", "Mr. Burns", "Mydei", "Nahida", "Nam-gyu", "Nanachi", "Nathan Drake", "Neopolitan", "Neuvillette", "Nick Wilde", "Nicol Bolas", "Nikola Tesla (Record of Ragnarok)", "Nobara Kugisaki", "Obanai Iguro", "Oberyn Martell (A Song of Ice and Fire)", "Oguri Cap", "Okarun", "Omen (Valorant)", "One (Battle for Dream Island)", "Panda (Jujutsu Kaisen)", "Papyrus", "Patchy the Pirate", "Pepsiman (PS1)", "Percival (Four Knights of The Apocalypse)", "Phainon", "Phrolova", "Poco", "Poipole", "Pokio", "Polka Dot Man (DC Extended Universe)", "Princess Luna", "Princess Peach", "Psycho Mantis", "Qin Shi Huang (Record of Ragnarok)", "Qu", "Rabbid (Normal)", "Ramona Flowers", "Rei Ayanami", "Rensuke Kunigami", "Rey Skywalker", "Rimuru Tempest (Light Novel)", "Rose Quartz", "Rouxls Kaard", "Rumi (KPop Demon Hunters)", "Ryomen Sukuna", "Ryuk", "SMAW", "Sailor Pluto (Manga)", "Saitama", "Sally Acorn (Archie Post-Genesis Wave)", "Sally Acorn (Archie Pre-Genesis Wave)", "Sandy Cheeks", "Sassy the Sasquatch", "Satoru Gojo", "Scourge the Hedgehog", "Senju Kawaragi", "Seong Gi-hun", "Seraphim (One Piece)", "Shinichi Izumi", "Shizuku Murasaki", "Shuma-Gorath", "Sid (Ice Age)", "Skar King", "Son Goku (DBS Anime)", "Son Goku (DBS Manga)", "Son Goku (Dragon Ball)", "St. Jaygarcia Saturn", "Stan Marsh", "Strahd von Zarovich", "Striker (Helluva Boss)", "Suguru Geto", "Tapu Bulu", "Tariq St. Patrick", "Tarre Vizsla", "Tenka Izumo", "Thanos (Squid Game)", "The Collector (The Owl House)", "The Dredge", "The Elden Beast", "The G-Man", "The Living Tribunal", "The Roaring Knight", "The Thought Robot", "The Undertaker"].sort((a,b)=>a.localeCompare(b));

function FindFighterModal({ onClose, onSelect, side }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);
  const filtered = query.trim() ? ALL_FIGHTERS_ALPHA.filter(n => n.toLowerCase().includes(query.toLowerCase())) : ALL_FIGHTERS_ALPHA;
  const sc = side === "alpha" ? C.alpha : C.bravo;
  const sb = side === "alpha" ? C.alphaBorder : C.bravoBorder;
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#13131c",border:`1px solid ${sb}55`,width:"min(520px,92vw)",maxHeight:"78vh",display:"flex",flexDirection:"column",borderRadius:2}}>
        <div style={{padding:"20px 24px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <span style={{fontFamily:"'Teko',sans-serif",fontSize:22,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",color:C.onSurface}}>SELECT FIGHTER</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:sc,letterSpacing:"0.12em",marginLeft:10,textTransform:"uppercase"}}>TEAM {side.toUpperCase()}</span>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.mutedLight,fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.surfHigh,border:`1px solid ${sb}55`,padding:"9px 14px",borderRadius:2}}>
            <span style={{color:C.muted,fontSize:14}}>🔍</span>
            <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
              placeholder={`Search ${ALL_FIGHTERS_ALPHA.length} fighters...`}
              style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,color:C.onSurface}} />
            {query && <button onClick={()=>setQuery("")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>✕</button>}
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:C.muted,marginTop:7}}>{filtered.length} fighters — alphabetical</div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {filtered.length===0
            ? <div style={{padding:"36px 24px",textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,color:C.muted}}>No fighters match "{query}"</div>
            : filtered.map((name,i)=>(
              <button key={name} onClick={()=>{onSelect(name);onClose();}}
                style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"10px 24px",textAlign:"left",display:"flex",alignItems:"center",gap:12,borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${sc}18`}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span style={{fontFamily:"'Teko',sans-serif",fontSize:12,color:C.muted,width:26,textAlign:"right",flexShrink:0}}>{i+1}</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,color:C.onSurface,fontWeight:500}}>{name}</span>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────
   ARENA PAGE
───────────────────────────────────────────── */
function ArenaPage() {
  const [activeSide, setActiveSide] = useState("alpha"); // which side next grid click goes to

  // 1v1 selections
  const [alpha1v1, setAlpha1v1] = useState("GOKU");
  const [bravo1v1, setBravo1v1] = useState("SUPERMAN");


  const [showModal, setShowModal] = useState(false);
  const [modalSide, setModalSide]   = useState("alpha");
  const [battleStarted, setBattle] = useState(false);

  function handleGridSelect(key) {
    if (key === "__FIND__") { setModalSide(activeSide); setShowModal(true); return; }
    if (key === "__RANDOM__") {
      const keys = Object.keys(ROSTER);
      const rk1 = keys[Math.floor(Math.random()*keys.length)];
      const rk2 = keys[Math.floor(Math.random()*keys.length)];
      setAlpha1v1(rk1); setBravo1v1(rk2);
      return;
    }
    // Route to active side
    if (activeSide === "alpha") setAlpha1v1(key);
    else setBravo1v1(key);
    setBattle(false);
  }

  function handleFindSelect(name) {
    const key = name.toUpperCase().replace(/[\s().,']/g,"_").replace(/_+/g,"_").replace(/_+$/g,"");
    if (!ROSTER[key]) {
      const wikiPage = FIGHTER_WIKI_MAP[name] || null;
      ROSTER[key] = {
        img: null,
        franchise: "CUSTOM",
        abbr: name.slice(0,2).toUpperCase(),
        color: "#1a1a2a",
        wiki: wikiPage ? "vsbattles" : null,
        page: wikiPage,
        displayName: name,
      };
    }
    if (modalSide === "alpha") setAlpha1v1(key);
    else setBravo1v1(key);
    setBattle(false);
  }

  function handleReset() {
    setAlpha1v1("GOKU"); setBravo1v1("SUPERMAN");
    setActiveSide("alpha"); setBattle(false);
  }

  const sideIndicatorStyle = (side) => ({
    display:"inline-flex", alignItems:"center", gap:8,
    cursor:"pointer", padding:"4px 10px",
    border: activeSide===side ? `1.5px solid ${side==="alpha"?C.alphaBorder:C.bravoBorder}` : "1.5px solid transparent",
    borderRadius:2, transition:"border-color 0.15s",
  });

  // What's selected for the active tab
  const selAlpha = alpha1v1;
  const selBravo = bravo1v1;

  return (
    <div style={{ paddingTop:52, minHeight:"100vh", background:C.bg }}>
      <div style={{ position:"fixed", top:0, left:0, width:400, height:400, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at top left, rgba(180,15,30,0.18) 0%, transparent 70%)" }} />
      <div style={{ position:"fixed", top:0, right:0, width:400, height:400, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at top right, rgba(20,40,200,0.15) 0%, transparent 70%)" }} />

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 24px 80px", position:"relative", zIndex:1 }}>

        {/* Reset */}
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"16px 0 0" }}>
          <button onClick={handleReset}
            style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700,
              letterSpacing:"0.12em", color:C.mutedLight, background:"none", border:"none",
              cursor:"pointer", textTransform:"uppercase" }}>
            RESET BATTLE
          </button>
        </div>

        {/* Header */}
        <header style={{ textAlign:"center", padding:"24px 0 24px" }}>
          <h1 style={{ fontFamily:"'Teko',sans-serif", fontSize:"clamp(36px,6vw,64px)",
            fontWeight:400, textTransform:"uppercase", color:C.onSurface, margin:"0 0 20px", lineHeight:1 }}>
            CHOOSE YOUR FIGHTERS
          </h1>

        </header>

        {/* Team headers — click to set active side */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:8 }}>
          <div>
            <div onClick={()=>{ setActiveSide("alpha"); }}
              style={sideIndicatorStyle("alpha")}>
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:40, fontWeight:400, fontStyle:"normal",
                textTransform:"uppercase", letterSpacing:"0.06em", color:"#fff", textAlign:"left" }}>
                <span style={{ marginRight:8, fontSize:16, color: activeSide==="alpha" ? "#FF003C" : "rgba(255,255,255,0.4)" }}>»»</span>TEAM ALPHA
              </span>
              {activeSide==="alpha" && (
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                  color:C.alpha, letterSpacing:"0.1em" }}>← SELECTING</span>
              )}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div onClick={()=>{ setActiveSide("bravo"); }}
              style={{ ...sideIndicatorStyle("bravo"), justifyContent:"center" }}>
              {activeSide==="bravo" && (
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                  color:C.bravoBorder, letterSpacing:"0.1em" }}>SELECTING →</span>
              )}
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:40, fontWeight:400, fontStyle:"normal",
                textTransform:"uppercase", letterSpacing:"0.06em", color:"#fff" }}>
                TEAM BRAVO<span style={{ marginLeft:8, fontSize:16, color: activeSide==="bravo" ? "#4D9ED9" : "rgba(255,255,255,0.4)" }}>«««</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero portraits */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, marginBottom:20 }}>
          {(
            <>
              {/* Clicking portrait sets that side as active */}
              <div onClick={()=>setActiveSide("alpha")} style={{ cursor:"pointer",
                outline: activeSide==="alpha" ? `2px solid ${C.alphaBorder}` : "2px solid transparent",
                outlineOffset:2, transition:"outline-color 0.15s" }}>
                <HeroPortrait rosterKey={alpha1v1} name={alpha1v1.replace(/_/g," ")} side="alpha" />
              </div>
              <div onClick={()=>setActiveSide("bravo")} style={{ cursor:"pointer",
                outline: activeSide==="bravo" ? `2px solid ${C.bravoBorder}` : "2px solid transparent",
                outlineOffset:2, transition:"outline-color 0.15s" }}>
                <HeroPortrait rosterKey={bravo1v1} name={bravo1v1.replace(/_/g," ")} side="bravo" />
              </div>
            </>

          )}
        </div>

        {/* Hint text */}
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:C.muted,
          textAlign:"center", marginBottom:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          Click a portrait or team label to select a side, then pick from the grid below
        </p>

        {/* Fighter grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4, marginBottom:32 }}>
          {FIGHTER_GRID.map((key,i)=>(
            <GridCard key={key+i} rosterKey={key}
              onSelect={handleGridSelect}
              selectedAlpha={alpha1v1}
              selectedBravo={bravo1v1}
              activeSide={activeSide} />
          ))}
        </div>

        {/* Start Battle */}
        <div style={{ display:"flex", justifyContent:"center" }}>
          <button onClick={()=>setBattle(true)}
            style={{ background:C.alpha, border:"none", cursor:"pointer",
              padding:"18px 80px", fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:18, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.12em",
              color:"#fff", transition:"background 0.2s, transform 0.1s",
              boxShadow:`0 4px 24px ${C.alpha}66` }}
            onMouseEnter={e=>{ e.currentTarget.style.background=C.alphaDim; e.currentTarget.style.transform="scale(1.02)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=C.alpha; e.currentTarget.style.transform="scale(1)"; }}>
            START BATTLE
          </button>
        </div>

        {/* Battle results */}
        {battleStarted && (
          <div style={{ marginTop:48 }}>
            <BattleResults
              alpha1v1={alpha1v1} bravo1v1={bravo1v1}
            />
          </div>
        )}
      </div>

      {showModal && (
        <FindFighterModal onClose={()=>setShowModal(false)} onSelect={handleFindSelect} side={modalSide} />
      )}
    </div>
  );
}

/* Cache so the same matchup doesn't re-fetch */
const NARRATIVE_CACHE = {};
const IMAGE_CACHE = {};

async function fetchBattleImage(winnerName, loserName, winnerFlavor, finalBlow) {
  const cacheKey = `${winnerName}|${loserName}`;
  if (IMAGE_CACHE[cacheKey]) return IMAGE_CACHE[cacheKey];

  const prompt = `Epic fantasy battle artwork, cinematic wide shot: ${winnerName} standing triumphant over the defeated ${loserName}. ${winnerName} delivers the final blow — ${finalBlow || "a devastating strike"}. Dynamic action pose, dramatic lighting with red and blue energy, dark arena background with smoke and debris. High detail, painterly style, no text, no watermarks.`;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      }),
    });
    const data = await res.json();
    console.log("[VS-Battles] Image response keys:", Object.keys(data), data.data?.[0] ? Object.keys(data.data[0]) : "no data");
    // gpt-image-2 returns base64 in b64_json, or a url — handle both
    const b64 = data.data?.[0]?.b64_json || null;
    const url = data.data?.[0]?.url || null;
    if (b64) {
      const dataUrl = `data:image/png;base64,${b64}`;
      IMAGE_CACHE[cacheKey] = dataUrl;
      return dataUrl;
    }
    if (url) {
      // Fetch and convert to base64 so it never expires
      const imgRes = await fetch(url);
      const blob = await imgRes.blob();
      const dataUrl = await new Promise(res => {
        const r = new FileReader();
        r.onloadend = () => res(r.result);
        r.readAsDataURL(blob);
      });
      IMAGE_CACHE[cacheKey] = dataUrl;
      return dataUrl;
    }
    console.error("[VS-Battles] No image data in response:", JSON.stringify(data).slice(0,300));
    return null;
  } catch(e) {
    console.error("[VS-Battles] Image gen failed:", e);
    return null;
  }
}

async function fetchBattleNarrative(alphaName, bravoName, alphaStats, bravoStats, winner, tab) {
  const cacheKey = `${alphaName}|${bravoName}|${tab}`;
  if (NARRATIVE_CACHE[cacheKey]) return NARRATIVE_CACHE[cacheKey];

  const alphaFlavor = alphaStats.flavor || "";
  const bravoFlavor = bravoStats.flavor || "";
  const alphaTitle  = alphaStats.title  || "";
  const bravoTitle  = bravoStats.title  || "";

  const prompt = `You are the narrator for Arena Battles, a fighting simulation app. Write a dramatic 4-round battle breakdown for ${alphaName} (${alphaTitle} — ${alphaFlavor}) vs ${bravoName} (${bravoTitle} — ${bravoFlavor}) in a ${tab} match. The predicted winner is ${winner}.

Return ONLY a JSON object with this exact shape, no markdown, no extra text:
{
  "rounds": [
    { "title": "ROUND TITLE IN CAPS", "winner": "FIGHTER NAME OR DRAW", "winTeam": "alpha|bravo|draw", "narrative": "2-3 sentence vivid combat description referencing each fighter's specific abilities", "reasoning": "1 sentence tactical explanation" },
    { "title": "...", "winner": "...", "winTeam": "...", "narrative": "...", "reasoning": "..." },
    { "title": "...", "winner": "...", "winTeam": "...", "narrative": "...", "reasoning": "..." },
    { "title": "...", "winner": "...", "winTeam": "...", "narrative": "...", "reasoning": "..." }
  ],
  "projection": "2-3 sentence final analysis explaining why ${winner} wins, referencing their key abilities and what tipped the balance."
}

Rules:
- Round titles should be dramatic and specific to this matchup (e.g. "ULTRA INSTINCT AWAKENS", "HELLFIRE CHAINS", "DIVINE ARMAMENT")
- winTeam must be "alpha" if ${alphaName} wins that round, "bravo" if ${bravoName} wins, "draw" if tied
- winner field should be the fighter's name (or "DRAW")
- The predicted overall winner (${winner}) should win rounds 3 and 4
- Make the narrative feel like a real Arena Battles wiki debate come to life`;

  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  console.log("[VS-Battles] API key present:", !!apiKey, "| length:", apiKey?.length);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_completion_tokens: 900,
        temperature: 0.85,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    console.log("[VS-Battles] API status:", res.status);
    const data = await res.json();
    console.log("[VS-Battles] API response:", JSON.stringify(data).slice(0, 200));
    if (!res.ok) {
      console.error("[VS-Battles] API error:", data);
      return null;
    }
    const text = data.choices?.[0]?.message?.content || "";
    console.log("[VS-Battles] Raw narrative:", text.slice(0, 200));
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    NARRATIVE_CACHE[cacheKey] = parsed;
    return parsed;
  } catch(e) {
    console.error("[VS-Battles] Narrative fetch failed:", e);
    return null;
  }
}

/* ─────────────────────────────────────────────
   PRE-GENERATED OUTCOMES LOOKUP
───────────────────────────────────────────── */
let OUTCOMES_DB = null;
let OUTCOMES_LOADING = false;
let OUTCOMES_CBS = [];
let OUTCOMES_INDEX = {}; // lowercase key -> original key
function loadOutcomesDB() {
  if (OUTCOMES_DB) return Promise.resolve(OUTCOMES_DB);
  if (OUTCOMES_LOADING) return new Promise(r => OUTCOMES_CBS.push(r));
  OUTCOMES_LOADING = true;
  return fetch("/arena_narratives_lookup.json")
    .then(r => r.json())
    .then(data => {
      OUTCOMES_DB = data;
      // Build lowercase index for case-insensitive lookup
      OUTCOMES_INDEX = {};
      Object.keys(data).forEach(k => { OUTCOMES_INDEX[k.toLowerCase()] = k; });
      OUTCOMES_LOADING = false;
      OUTCOMES_CBS.forEach(cb=>cb(data));
      OUTCOMES_CBS=[];
      return data;
    })
    .catch(() => { OUTCOMES_DB = {}; OUTCOMES_LOADING = false; return {}; });
}
loadOutcomesDB();
function lookupOutcome(a, b) {
  if (!OUTCOMES_DB) return null;
  // Try exact match first
  const exact = OUTCOMES_DB[`${a}__vs__${b}`] || OUTCOMES_DB[`${b}__vs__${a}`];
  if (exact) return exact;
  // Case-insensitive fallback
  const k1 = `${a}__vs__${b}`.toLowerCase();
  const k2 = `${b}__vs__${a}`.toLowerCase();
  const origKey = OUTCOMES_INDEX[k1] || OUTCOMES_INDEX[k2];
  return origKey ? OUTCOMES_DB[origKey] : null;
}
function outcomeLabel(ot) {
  return ot==="stomp"?"DECISIVE STOMP":ot==="decisive"?"CLEAR VICTORY":ot==="competitive"?"COMPETITIVE BATTLE":ot==="close"?"RAZOR CLOSE":"BATTLE COMPLETE";
}


function BattleResults({ alpha1v1, bravo1v1 }) {
  // Use stored displayName if available (preserves original casing + parentheses)
  const alphaName = ROSTER[alpha1v1]?.displayName || alpha1v1.replace(/_/g, " ");
  const bravoName = ROSTER[bravo1v1]?.displayName || bravo1v1.replace(/_/g, " ");

  const [outcome, setOutcome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setOutcome(null);
    loadOutcomesDB().then(() => {
      setOutcome(lookupOutcome(alphaName, bravoName));
      setLoading(false);
    });
  }, [alpha1v1, bravo1v1]);

  const winner      = outcome?.w || alphaName;
  const ot          = outcome?.ot || "competitive";
  const narrative   = outcome?.n  || "";
  const wFranchise  = outcome?.wf || "";
  const isAlphaWins = winner.toLowerCase() === alphaName.toLowerCase();
  const winColor    = isAlphaWins ? C.alphaBorder : C.bravoBorder;

  return (
    <div style={{ marginTop: 32 }}>

      {/* Winner banner */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 24
      }}>
        <div style={{
          background: isAlphaWins ? C.alpha : C.alphaDim,
          padding: "14px 20px",
          borderBottom: isAlphaWins ? "3px solid #ffe792" : "3px solid transparent"
        }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
            TEAM ALPHA
          </div>
          <div style={{ fontFamily: "'Teko',sans-serif", fontSize: 22, fontWeight: 600,
            color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {alphaName}
          </div>
          {isAlphaWins && (
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11,
              color: "#ffe792", marginTop: 4, letterSpacing: "0.1em" }}>✦ PREDICTED WINNER</div>
          )}
        </div>
        <div style={{
          background: !isAlphaWins ? C.bravo : C.bravoDim,
          padding: "14px 20px", textAlign: "right",
          borderBottom: !isAlphaWins ? "3px solid #ffe792" : "3px solid transparent"
        }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
            TEAM BRAVO
          </div>
          <div style={{ fontFamily: "'Teko',sans-serif", fontSize: 22, fontWeight: 600,
            color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {bravoName}
          </div>
          {!isAlphaWins && (
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11,
              color: "#ffe792", marginTop: 4, letterSpacing: "0.1em", textAlign: "right" }}>
              ✦ PREDICTED WINNER
            </div>
          )}
        </div>
      </div>

      {/* Outcome badge */}
      {!loading && outcome && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.14em",
            color: "#ffe792", background: "#ffe79218",
            border: "1px solid #ffe79244", padding: "4px 16px", borderRadius: 2
          }}>
            ✦ {outcomeLabel(ot)}
          </span>
        </div>
      )}

      {/* Narrative */}
      <div style={{
        background: C.surf, borderLeft: `3px solid ${winColor}`,
        padding: "28px 32px", marginBottom: 32
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.alphaBorder,
              animation: "pulse 1s infinite" }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14,
              color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              LOADING OUTCOME...
            </span>
          </div>
        ) : (
          <p style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, lineHeight: 1.8,
            color: C.onSurface, margin: 0, letterSpacing: "0.01em"
          }}>
            {narrative || "No narrative available for this matchup."}
          </p>
        )}
      </div>

      {/* Winner reveal */}
      {!loading && (
        <div style={{ textAlign: "center", padding: "12px 0 40px" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: 16 }}>
            BATTLE OUTCOME
          </div>
          <div style={{
            fontFamily: "'Teko',sans-serif",
            fontSize: "clamp(44px,9vw,80px)", fontWeight: 700,
            color: "#ffe792", lineHeight: 1, textTransform: "uppercase",
            animation: "fadeIn 0.5s ease-out", letterSpacing: "0.02em"
          }}>
            {winner} WINS
          </div>
          {wFranchise && (
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13,
              color: C.muted, letterSpacing: "0.1em", marginTop: 10, textTransform: "uppercase" }}>
              {wFranchise}
            </div>
          )}
        </div>
      )}

      <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}



function StatBar({ label, alphaVal, bravoVal, alpha, bravo, winner }) {
  const wc = winner==="alpha" ? C.alphaBorder : winner==="bravo" ? C.bravoBorder : C.muted;
  const wl = winner==="alpha" ? "ALPHA ADVANTAGE" : winner==="bravo" ? "BRAVO LEAD" : "DEAD EVEN";
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
          textTransform:"uppercase", letterSpacing:"0.1em", color:C.muted }}>{label}</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:900,
          color:wc, fontStyle:"italic" }}>{wl}</span>
      </div>
      <div style={{ display:"flex", gap:3, height:36 }}>
        <div style={{ flex:alpha, background:C.alpha, position:"relative", display:"flex",
          alignItems:"center", paddingLeft:10, minWidth:40 }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:14,
            color:"rgba(255,255,255,0.9)" }}>{alphaVal}</span>
        </div>
        <div style={{ flex:bravo, background:C.bravo, position:"relative", display:"flex",
          alignItems:"center", justifyContent:"flex-end", paddingRight:10, minWidth:40 }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:14,
            color:"rgba(255,255,255,0.9)" }}>{bravoVal}</span>
        </div>
      </div>
    </div>
  );
}

function RoundRow({ round, idx }) {
  const [open, setOpen] = useState(false);
  const bc = round.winTeam==="alpha" ? C.alphaBorder : round.winTeam==="bravo" ? C.bravoBorder : C.muted;
  return (
    <div style={{ borderLeft:`3px solid ${bc}`, background:C.surf, marginBottom:3 }}>
      <button onClick={()=>setOpen(!open)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          width:"100%", padding:"12px 16px", background:"none", border:"none", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:22, height:22, background:bc, display:"flex", alignItems:"center",
            justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:12, fontWeight:900, color:"#000", flexShrink:0 }}>{idx+1}</div>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700,
            color:C.onSurface, textTransform:"uppercase", letterSpacing:"0.06em" }}>{round.title}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
            color:bc, background:`${bc}22`, padding:"2px 8px", textTransform:"uppercase" }}>
            {round.winner} WINS
          </span>
          <span style={{ color:C.muted, fontSize:11 }}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open && (
        <div style={{ padding:"10px 16px 14px", background:C.bgDeep }}>
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, color:C.mutedLight,
            margin:"0 0 8px", lineHeight:1.6 }}>{round.narrative}</p>
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:C.muted,
            margin:0, fontStyle:"italic" }}>{round.reasoning}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECENT BATTLES PAGE
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   RECENT BATTLES — Card components
───────────────────────────────────────────── */
function Card1v1({ b }) {
  const isAlpha = b.winnerColor === "alpha";
  const borderColor = isAlpha ? "#FB0130" : "#006EB7";
  const victoryBg   = isAlpha ? "#B50022" : "#006EB7";
  const barColor    = isAlpha ? "#FB0130" : "#006EB7";
  const r = ROSTER[b.winner.rosterKey] || {};

  return (
    <div style={{ display:"flex", background:"#000", borderLeft:`4px solid ${borderColor}` }}>
      {/* Main content */}
      <div style={{ flex:1, padding:"24px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        {/* Top row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ position:"relative" }}>
              <div style={{ background:victoryBg, padding:"2px 10px", display:"inline-block" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:"0.18px", textTransform:"uppercase", color:"#fff" }}>VICTORY</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:36, fontWeight:500,
                lineHeight:"24px", textTransform:"uppercase", color:"#fff", letterSpacing:"0.18px" }}>
                {b.winner.name}
              </span>
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:14, fontWeight:400,
                lineHeight:"26px", textTransform:"uppercase", color:"#DAD9D9", letterSpacing:"0.18px" }}>
                {b.winner.sub}
              </span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:400,
              textTransform:"uppercase", color:"#fff", letterSpacing:"0.18px" }}>1V1 DUEL</span>
            <span style={{ fontFamily:"'Teko',sans-serif", fontSize:16, fontWeight:700,
              lineHeight:"26px", color:"#FAF8FE", letterSpacing:"0.18px" }}>{b.time}</span>
          </div>
        </div>

        {/* Win bar */}
        <div style={{ background:"#2A2A29", padding:12, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:48, height:48, overflow:"hidden", flexShrink:0 }}>
            {r.img
              ? <img src={r.img} alt={b.winner.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
              : <div style={{ width:"100%", height:"100%", background:r.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:900, color:"#fff" }}>{r.abbr}</span>
                </div>
            }
          </div>
          <div style={{ flex:1, height:8, background:"#24252B", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, width:`${b.winner.pct||90}%`, background:barColor }} />
          </div>
          <span style={{ fontFamily:"'Teko',sans-serif", fontSize:24, fontWeight:500,
            lineHeight:"26px", color:"#fff", letterSpacing:"0.18px", minWidth:36, textAlign:"center" }}>
            {b.winner.pct}%
          </span>
        </div>
      </div>

      {/* Loser panel */}
      <div style={{ width:148, background:"#18191E", borderLeft:"1px solid #47484C",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:20 }}>
        <span style={{ fontFamily:"'Teko',sans-serif", fontSize:36, fontWeight:500,
          color:"#DAD9D9", letterSpacing:"0.18px", opacity:0.4 }}>VS</span>
        <div style={{ width:72, height:72, overflow:"hidden", filter:"grayscale(1)", opacity:0.4 }}>
          {(() => { const lr = ROSTER[b.loser.rosterKey]||{}; return lr.img
            ? <img src={lr.img} alt={b.loser.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
            : <div style={{ width:"100%", height:"100%", background:lr.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:"#fff" }}>{lr.abbr}</span>
              </div>;
          })()}
        </div>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700,
          textTransform:"uppercase", color:"#ABAAB0", letterSpacing:"0.18px", textAlign:"center" }}>
          {b.loser.name}
        </span>
      </div>
    </div>
  );
}

function Card2v2({ b }) {
  const isAlpha = b.winnerColor === "alpha";
  const borderColor = isAlpha ? "#FB0130" : "#006EB7";
  const victoryBg   = isAlpha ? "#B50022" : "#006EB7";

  return (
    <div style={{ display:"flex", background:"#000", borderLeft:`4px solid ${borderColor}` }}>
      <div style={{ flex:1, padding:"24px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:victoryBg, padding:"2px 10px", display:"inline-block" }}>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
                letterSpacing:"0.18px", textTransform:"uppercase", color:"#fff" }}>VICTORY</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Teko',sans-serif", fontSize:28, fontWeight:500,
                textTransform:"uppercase", color:"#fff", letterSpacing:"0.18px", lineHeight:1 }}>{b.winner.name}</div>
              <div style={{ fontFamily:"'Teko',sans-serif", fontSize:14, color:"#DAD9D9",
                textTransform:"uppercase", letterSpacing:"0.18px" }}>{b.winner.sub}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#fff", textTransform:"uppercase" }}>1V1 DUEL</div>
            <div style={{ fontFamily:"'Teko',sans-serif", fontSize:16, fontWeight:700, color:"#FAF8FE" }}>{b.time}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {b.fighters.map(f => {
            const fr = ROSTER[f.rosterKey]||{};
            return (
              <div key={f.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:36, height:36, overflow:"hidden", flexShrink:0 }}>
                  {fr.img
                    ? <img src={fr.img} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                    : <div style={{ width:"100%", height:"100%", background:fr.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:900, color:"#fff" }}>{fr.abbr}</span>
                      </div>
                  }
                </div>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700,
                  textTransform:"uppercase", color:"#fff" }}>{f.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ width:148, background:"#18191E", borderLeft:"1px solid #47484C",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:20 }}>
        <span style={{ fontFamily:"'Teko',sans-serif", fontSize:36, fontWeight:500, color:"#DAD9D9", opacity:0.4 }}>VS</span>
        <div style={{ display:"flex" }}>
          {b.losers.map((l,i) => {
            const lr = ROSTER[l.rosterKey]||{};
            return (
              <div key={i} style={{ marginLeft:i>0?-8:0, width:36, height:36, overflow:"hidden",
                filter:"grayscale(1)", opacity:0.4, border:"2px solid #18191E" }}>
                {lr.img
                  ? <img src={lr.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                  : <div style={{ width:"100%", height:"100%", background:lr.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:900, color:"#fff" }}>{lr.abbr}</span>
                    </div>
                }
              </div>
            );
          })}
        </div>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700,
          textTransform:"uppercase", color:"#ABAAB0", textAlign:"center" }}>{b.loserName}</span>
      </div>
    </div>
  );
}

function FeaturedCard({ teamName, fighters, losers, loserName, location, timestamp }) {
  return (
    <div style={{ gridColumn:"span 2", background:"#121318", borderLeft:"4px solid #DC012A", padding:32 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"#B50022", padding:"2px 10px", display:"inline-block" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
              letterSpacing:"1.32px", textTransform:"uppercase", color:"#fff" }}>MAJOR VICTORY</span>
          </div>
          <h2 style={{ fontFamily:"'Teko',sans-serif", fontSize:44, fontWeight:500, lineHeight:"52px",
            textTransform:"uppercase", letterSpacing:"-1.76px", color:"#fff", margin:0 }}>{teamName}</h2>
        </div>
        <div style={{ background:"#18191E", border:"1px solid #47484C", padding:20,
          display:"flex", flexDirection:"column", alignItems:"center", gap:4, minWidth:140 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase",
            color:"#fff", letterSpacing:"0.18px" }}>MATCH TYPE</span>
          <span style={{ fontFamily:"'Teko',sans-serif", fontSize:32, fontWeight:700,
            color:"#fff", letterSpacing:"0.18px" }}>1v1</span>
        </div>
      </div>

      {/* Fighters grid */}
      <div style={{ display:"flex", gap:28, alignItems:"center", marginBottom:28 }}>
        {/* Winners */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flex:1 }}>
          {fighters.map(f => {
            const fr = ROSTER[f.rosterKey]||{};
            return (
              <div key={f.name} style={{ background:"#1E1F25", borderBottom:"4px solid #B50022",
                aspectRatio:"1", position:"relative", overflow:"hidden", display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                {fr.img
                  ? <img src={fr.img} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                  : <div style={{ width:"100%", height:"100%", background:fr.color||"#1E1F25", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, color:"rgba(255,255,255,0.4)" }}>{fr.abbr}</span>
                    </div>
                }
                <div style={{ position:"absolute", bottom:0, left:0, background:"#B50022", padding:"3px 10px" }}>
                  <span style={{ fontFamily:"'Teko',sans-serif", fontSize:24, fontWeight:500,
                    color:"#fff", letterSpacing:"0.18px" }}>{f.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* VS */}
        <span style={{ fontFamily:"'Teko',sans-serif", fontSize:28, fontWeight:700,
          color:"#DAD9D9", letterSpacing:"0.18px", opacity:0.5, flexShrink:0 }}>VS</span>

        {/* Losers */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flex:1,
          opacity:0.4, filter:"grayscale(1)" }}>
          {losers.map((l,i) => {
            const lr = ROSTER[l.rosterKey]||{};
            return (
              <div key={i} style={{ background:"#24252B", borderBottom:"4px solid #47484C",
                aspectRatio:"1", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {lr.img
                  ? <img src={lr.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                  : <div style={{ width:"100%", height:"100%", background:lr.color||"#24252B", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, color:"rgba(255,255,255,0.4)" }}>{lr.abbr}</span>
                    </div>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid rgba(71,72,76,0.267)", paddingTop:20,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:28 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase",
              color:"#DAD9D9", letterSpacing:"0.18px" }}>DURATION</span>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:900,
              color:"#FAF8FE", letterSpacing:"0.18px" }}>28:44</span>
          </div>
        </div>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase",
          letterSpacing:"1.2px", color:"#DAD9D9" }}>TIMESTAMP: {timestamp}</span>
      </div>
    </div>
  );
}

function RecentBattlesPage() {
  const [showMore, setShowMore] = useState(false);
  return (
    <div style={{ paddingTop:52, background:"#000", minHeight:"100vh" }}>
      {/* Ambient glows */}
      <div style={{ position:"fixed", top:0, left:52, width:750, height:991, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(56.54% 56.54% at 53.44% 50%, #BE0729 0%, #580313 100%)",
        filter:"blur(250px)", borderRadius:5000, opacity:0.35 }} />
      <div style={{ position:"fixed", top:0, right:0, width:816, height:998, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(56.54% 56.54% at 53.44% 50%, #0710BE 0%, #08005C 100%)",
        filter:"blur(250px)", borderRadius:5000, opacity:0.35 }} />

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"40px 24px 80px", position:"relative", zIndex:1 }}>
        <header style={{ textAlign:"center", marginBottom:48 }}>
          <h1 style={{ fontFamily:"'Teko',sans-serif", fontSize:64, fontWeight:400, lineHeight:"92px",
            color:"#fff", margin:0 }}>RECENT BATTLES</h1>
        </header>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, maxWidth:1100 }}>
          <Card1v1 b={RECENT_P1[0]} />
          <Card1v1 b={RECENT_P1[2]} />
          <Card1v1 b={RECENT_P1[3]} />
        </div>

        {showMore && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, margin:"28px 0 16px" }}>
              <div style={{ flex:1, height:1, background:"#1E1F25" }}/>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b6b80", whiteSpace:"nowrap" }}>
                PREVIOUS RECORDS — SECTOR_ARCHIVE
              </span>
              <div style={{ flex:1, height:1, background:"#1E1F25" }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, maxWidth:1100 }}>
              <Card1v1 b={RECENT_P2[0]} />
              <Card1v1 b={RECENT_P2[2]} />
              <Card1v1 b={RECENT_P2[3]} />
              <Card1v1 b={RECENT_P2[4]} />
            </div>
          </div>
        )}

        <div style={{ marginTop:48, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>setShowMore(s=>!s)}
            style={{ background:"#1E1F25", color:"#FAF8FE", fontFamily:"'Inter',sans-serif",
              fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"1.04px",
              padding:"20px 48px", border:"none", borderRight:`3.6px solid #FF8D8D`,
              cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
            {showMore ? "COLLAPSE RECORDS" : "FETCH PREVIOUS RECORDS"}
            <span style={{ fontSize:16, display:"inline-block", transform:showMore?"rotate(180deg)":"none", transition:"transform 0.2s" }}>↓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RANKINGS PAGE
───────────────────────────────────────────── */
function RankingsPage() {
  const [page, setPage] = useState(0);
  const visible = TABLE_ROWS.slice(0, (page+1)*TABLE_PAGE);
  const hasMore = visible.length < TABLE_ROWS.length;

  const podiumOrder = [PODIUM[1], PODIUM[0], PODIUM[2]]; // 2nd, 1st, 3rd
  const podiumColors = {
    0: { accent:"#BE0729", tag:"RUNNER UP",  tagBg:"#BE0729",  numColor:"#fff",    barFill:"#BE0729",  winColor:"#FF8589" },
    1: { accent:"#C8A84B", tag:"CHAMPION",   tagBg:"#F0C040",  numColor:"#fff",    barFill:"#F0C040",  winColor:"#F0C040" },
    2: { accent:"#8B8B8A", tag:"CONTENDER",  tagBg:"#8B8B8A",  numColor:"#fff",    barFill:"#8B8B8A",  winColor:"#8B8B8A" },
  };

  return (
    <div style={{ paddingTop:52, background:"#000", minHeight:"100vh" }}>
      {/* Ambient glows */}
      <div style={{ position:"fixed", top:155, left:0, width:750, height:991, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(56.54% 56.54% at 53.44% 50%, #BE0729 0%, #580313 100%)",
        filter:"blur(250px)", borderRadius:5000, opacity:0.4 }} />
      <div style={{ position:"fixed", top:155, right:0, width:816, height:998, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(56.54% 56.54% at 53.44% 50%, #0710BE 0%, #08005C 100%)",
        filter:"blur(250px)", borderRadius:5000, opacity:0.4 }} />

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"40px 24px 80px", position:"relative", zIndex:1 }}>

        {/* Header */}
        <header style={{ textAlign:"center", marginBottom:48 }}>
          <h1 style={{ fontFamily:"'Teko',sans-serif", fontSize:64, fontWeight:400, lineHeight:"92px",
            color:"#fff", margin:"0 0 4px" }}>GLOBAL RANKINGS</h1>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:16, color:"#fff", letterSpacing:"0.18px" }}>
              SEASON_04: REVENANT_STRIKE
            </span>
            <button style={{ display:"flex", alignItems:"center", gap:8,
              background:"transparent", border:"1px solid #FF0030", borderRadius:2,
              padding:"4px 12px", cursor:"default",
              animation:"livePulse 2.5s ease-in-out infinite" }}>
              <div style={{ width:7, height:7, background:"#FF0030", borderRadius:"50%" }} />
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700,
                color:"#FF0030", letterSpacing:"0.12em", textTransform:"uppercase" }}>
                LIVE DATA FEED
              </span>
            </button>
          </div>
        </header>

        {/* Podium */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:30, marginBottom:48, alignItems:"end" }}>
          {podiumOrder.map((p, idx) => {
            const pc = podiumColors[idx];
            const isFirst = idx === 1;
            const cardH = isFirst ? 480 : idx===0 ? 380 : 340;
            const r = ROSTER[p.rosterKey]||{};
            const imgH = isFirst ? 188 : 160;

            return (
              <div key={p.rank} style={{ position:"relative", height:cardH, background:"#2A2A29",
                display:"flex", flexDirection:"column", overflow:"hidden" }}>

                {/* Star watermark for #1 */}
                {isFirst && (
                  <div style={{ position:"absolute", top:"14%", left:"50%", transform:"translateX(-50%)",
                    fontFamily:"'Arial',sans-serif", fontSize:177, color:"#F0C040", opacity:0.11,
                    lineHeight:1, userSelect:"none", pointerEvents:"none" }}>★</div>
                )}

                {/* Rank number */}
                <div style={{ textAlign:"center", paddingTop:isFirst?20:16 }}>
                  <span style={{ fontFamily:"'Teko',sans-serif", fontSize:isFirst?110:100, fontWeight:500,
                    lineHeight:1, color:"#fff", letterSpacing:"0.18px" }}>{p.rank}</span>
                </div>

                {/* Fighter image */}
                <div style={{ width:imgH, height:imgH, margin:"0 auto", overflow:"hidden", position:"relative" }}>
                  {r.img
                    ? <img src={r.img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                    : <div style={{ width:"100%", height:"100%", background:r.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:40, fontWeight:900, color:"rgba(255,255,255,0.5)" }}>{r.abbr}</span>
                      </div>
                  }
                </div>

                {/* Tag */}
                <div style={{ textAlign:"center", marginTop:8 }}>
                  <span style={{ fontFamily:"'Teko',sans-serif", fontSize:20, fontWeight:500,
                    lineHeight:"24px", color: idx===1?"#000":"#fff", letterSpacing:"0.18px",
                    background:pc.tagBg, padding:"6px 14px 4px", display:"inline-block" }}>
                    {pc.tag}
                  </span>
                </div>

                {/* Name */}
                <div style={{ textAlign:"center", marginTop:6 }}>
                  <div style={{ fontFamily:"'Teko',sans-serif", fontSize:40, fontWeight:700,
                    lineHeight:"57px", color:"#fff", textAlign:"center" }}>{p.name}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:isFirst?16:15, fontWeight:700,
                    color:pc.winColor, textAlign:"center", marginBottom:8 }}>
                    {p.wins.toLocaleString()} WINS / {p.losses} LOSSES
                  </div>
                </div>

                {/* Win bar */}
                <div style={{ position:"relative", height:4, background:"#8B8B8A", margin:"0 16px 16px" }}>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0,
                    width:`${p.pct}%`, background:pc.barFill }} />
                </div>

                {/* Bottom accent line */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:pc.accent }} />
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", msOverflowStyle:"none", scrollbarWidth:"none" }}
          onTouchStart={e=>e.stopPropagation()}>
          <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left" }}>
            <thead>
              <tr style={{ background:"#1E1F25" }}>
                {["RANK","FIGHTER","TOTAL STATS","RECORD","WIN %"].map((h,i)=>(
                  <th key={h} style={{ padding:"13px 20px", fontFamily:"'Inter',sans-serif",
                    fontSize:12, fontWeight:900, textTransform:"uppercase", letterSpacing:"2px",
                    color:"#fff", textAlign:i===4?"right":"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r,i)=>{
                const rr = ROSTER[r.rosterKey]||{};
                return (
                  <tr key={r.rank+i}
                    style={{ background:"#000", borderBottom:"0.9px solid #18191E", cursor:"pointer",
                      transition:"background 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#111"}
                    onMouseLeave={e=>e.currentTarget.style.background="#000"}>

                    {/* Rank */}
                    <td style={{ padding:"26px 20px" }}>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700,
                        letterSpacing:"0.18px", color:"#fff" }}>{r.rank}</span>
                    </td>

                    {/* Fighter */}
                    <td style={{ padding:"0 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:44, height:44, overflow:"hidden", flexShrink:0,
                          borderRadius:2, border:"1px solid rgba(255,255,255,0.1)" }}>
                          {rr.img
                            ? <img src={rr.img} alt={r.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                            : <div style={{ width:"100%", height:"100%", background:rr.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:900, color:"#fff" }}>{rr.abbr}</span>
                              </div>
                          }
                        </div>
                        <div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:16, fontWeight:700,
                            textTransform:"uppercase", letterSpacing:"0.18px", color:"#fff" }}>{r.name}</div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:400,
                            letterSpacing:"0.18px", color:"#DAD9D9" }}>{r.sub}</div>
                        </div>
                      </div>
                    </td>

                    {/* Total stats */}
                    <td style={{ padding:"23px 20px 23px 40px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4,
                        fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:900,
                        textTransform:"uppercase", letterSpacing:"0.18px", color:"#fff", width:115 }}>
                        <span>W: {r.wins}</span><span>L: {r.losses}</span>
                      </div>
                      <div style={{ width:110, height:4, background:"#8B8B8A", position:"relative" }}>
                        <div style={{ position:"absolute", left:0, top:0, bottom:0,
                          width:`${r.rating}%`, background:r.barColor }} />
                      </div>
                    </td>

                    {/* 1v1 record */}
                    <td style={{ padding:"26px 20px" }}>
                      <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700,
                        letterSpacing:"0.18px", color:"#fff" }}>{r.oneV}</span>
                    </td>

                    {/* Win % */}
                    <td style={{ padding:"26px 20px", textAlign:"right" }}>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700,
                        letterSpacing:"0.18px", color:"#fff" }}>{r.rating}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          {hasMore
            ? <button onClick={()=>setPage(p=>p+1)}
                style={{ background:"#1E1F25", color:"#FAF8FE", fontFamily:"'Inter',sans-serif",
                  fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"1.04px",
                  padding:"20px 48px", border:"none", borderRight:"3.6px solid #FF8D8D",
                  cursor:"pointer" }}>
                LOAD NEXT {Math.min(TABLE_PAGE, TABLE_ROWS.length-visible.length)} FIGHTERS
              </button>
            : <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, textTransform:"uppercase",
                letterSpacing:"0.16em", color:"#6b6b80", padding:"20px 0" }}>
                ALL OPERATORS LOADED — END OF SEASON_04 RECORD
              </div>
          }
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [page, setPage] = useState("arena");
  return (
    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", background:C.bg, color:C.onSurface, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,900;1,700;1,900&family=Barlow:wght@400;500;600;700&family=Teko:wght@400;500;600;700&family=Zen+Dots&family=Inter:wght@400;500;600;700;900&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { transition: opacity 0.15s, transform 0.1s; }
        button:active { transform: scale(0.98); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; }
        @keyframes livePulse { 0%,100%{ opacity:1; } 50%{ opacity:0.35; } }
        .rankings-scroll::-webkit-scrollbar { display:none; }
      `}</style>
      <NavBar page={page} setPage={setPage} />
      {page==="arena"    && <ArenaPage />}
      {page==="rankings" && <RankingsPage />}
    </div>
  );
}
