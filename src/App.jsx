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
  GOKU:         { img: "https://static.wikia.nocookie.net/vsbattles/images/6/65/GokuKamehameha1.jpeg/revision/latest",               franchise: "DBZ",         abbr: "GK", color: "#8c5200", wiki: "vsbattles",    page: "Son_Goku", displayName:"Son Goku"},
  NARUTO:       { img: "/naruto.png",             franchise: "NARUTO",      abbr: "NT", color: "#b05a00", wiki: "vsbattles",        page: "Naruto_Uzumaki_(Part_II:_Pre-War_Arc)", displayName:"Naruto Uzumaki (Part II: Pre-War Arc)"},
  SUPERMAN:     { img: "https://static.wikia.nocookie.net/vsbattles/images/8/8c/GA_Kal-L_render_by_HIT_IT.png/revision/latest",           franchise: "DC",          abbr: "SM", color: "#0a2a7a", wiki: "vsbattles",            page: "Superman", displayName:"Superman"},
  LUFFY:        { img: "https://static.wikia.nocookie.net/vsbattles/images/b/b5/Luffy_%28PostTimeskip%29_%28Original%29.png/revision/latest",              franchise: "ONE PIECE",   abbr: "LF", color: "#8a1010", wiki: "vsbattles",      page: "Monkey_D._Luffy_(Post-Timeskip)", displayName:"Monkey D. Luffy (Post-Timeskip)"},
  KRATOS:       { img: "https://static.wikia.nocookie.net/vsbattles/images/b/bd/Gow2kratosrender.png/revision/latest",             franchise: "GOW",         abbr: "KR", color: "#5a1010", wiki: "vsbattles",      page: "Kratos", displayName:"Kratos"},
  DANTE:        { img: "https://static.wikia.nocookie.net/vsbattles/images/2/20/Picsart-fd9baa7b-0557-42d0-8adc-01a6edc806cc.png/revision/latest",              franchise: "CAPCOM",      abbr: "DT", color: "#8a0000", wiki: "vsbattles",   page: "Dante_(Devil_May_Cry)", displayName:"Dante (Devil May Cry)"},
  DOOM_SLAYER:  { img: "https://static.wikia.nocookie.net/vsbattles/images/2/29/DoomguyRender.webp/revision/latest",        franchise: "DOOM",        abbr: "DS", color: "#1a3a0a", wiki: "vsbattles",          page: "Doomguy", displayName:"Doomguy"},
  MASTER_CHIEF: { img: "https://static.wikia.nocookie.net/vsbattles/images/a/a2/Halo_The_Fall_of_Reach_Master_Chief_%28Render%29.png/revision/latest",       franchise: "HALO",        abbr: "MC", color: "#0a3a1a", wiki: "vsbattles",          page: "Master_Chief", displayName:"Master Chief"},
  RYU:          { img: "/ryu.png",                franchise: "CAPCOM",      abbr: "RY", color: "#0a2040", wiki: "vsbattles", page: "Ryu", displayName:"Ryu"},
  JIN_KAZAMA:   { img: "https://static.wikia.nocookie.net/vsbattles/images/5/5e/Tekken_8_Jin.png/revision/latest",         franchise: "TEKKEN",      abbr: "JK", color: "#0a0a30", wiki: "vsbattles",        page: "Jin_Kazama", displayName:"Jin Kazama"},
  SOL_BADGUY:   { img: "https://static.wikia.nocookie.net/vsbattles/images/6/66/Sol_Guilty_Gear_Strive.png/revision/latest",         franchise: "GUILTY GEAR", abbr: "SB", color: "#5a1000", wiki: "vsbattles",    page: "Sol_Badguy", displayName:"Sol Badguy"},
  KIRBY:        { img: "https://static.wikia.nocookie.net/vsbattles/images/e/e0/KSA_Kirby_Artwork.png/revision/latest",              franchise: "NINTENDO",    abbr: "KB", color: "#7a1a50", wiki: "vsbattles",         page: "Kirby", displayName:"Kirby"},
  SCORPION:     { img: "https://static.wikia.nocookie.net/vsbattles/images/5/5f/Scorpion_%28Present%29%28MK11%29.png/revision/latest",           franchise: "MK",          abbr: "SC", color: "#5a4000", wiki: "vsbattles",  page: "Hanzo_Hasashi_(Second_Timeline)", displayName:"Hanzo Hasashi (Second Timeline)"},
  SHAGGY:       { img: "https://static.wikia.nocookie.net/vsbattles/images/3/33/OG_Shaggy_Render.png/revision/latest",      franchise: "WB",          abbr: "SH", color: "#1a3a00", wiki: "vsbattles",   page: "Shaggy_Rogers_(Cartoon)", displayName:"Shaggy Rogers (Cartoon)"},
  BROLY:        { img: "/broly.png",              franchise: "DBZ",         abbr: "BL", color: "#2a0a3a", wiki: "vsbattles",    page: "Broly", displayName:"Broly"},
  PSYLOCKE:     { img: "https://static.wikia.nocookie.net/vsbattles/images/7/75/Betsy_Braddock_.png/revision/latest",           franchise: "MARVEL",      abbr: "PL", color: "#4a0a6a", wiki: "vsbattles",        page: "Psylocke", displayName:"Psylocke"},
  WOLVERINE:    { img: "https://static.wikia.nocookie.net/vsbattles/images/0/00/Marvel_Comics_Wolverine_%28Render%29.webp/revision/latest",          franchise: "MARVEL",      abbr: "WV", color: "#3a1000", wiki: "vsbattles",        page: "Wolverine", displayName:"Wolverine"},
  VEGETA:       { img: "https://static.wikia.nocookie.net/vsbattles/images/b/be/Toei_Vegeta_Saiyan_Saga.png/revision/latest",             franchise: "DBZ",         abbr: "VG", color: "#1a0a3a", wiki: "vsbattles",    page: "Vegeta", displayName:"Vegeta"},
  CAP_AMERICA:  { img: "https://static.wikia.nocookie.net/vsbattles/images/1/18/ModernCap.png/revision/latest",    franchise: "MARVEL",      abbr: "CA", color: "#0a1a4a", wiki: "vsbattles",        page: "Captain_America_(Marvel_Comics)", displayName:"Captain America (Marvel Comics)"},
  CHUN_LI:      { img: "https://static.wikia.nocookie.net/vsbattles/images/d/da/JRender.png/revision/latest",            franchise: "CAPCOM",      abbr: "CL", color: "#0a2a5a", wiki: "vsbattles", page: "Chun-Li", displayName:"Chun-Li"},
  MOON_KNIGHT:  { img: "https://static.wikia.nocookie.net/vsbattles/images/3/35/NEWMKSUIT.png/revision/latest",        franchise: "MARVEL",      abbr: "MK", color: "#2a2a2a", wiki: "vsbattles",        page: "Moon_Knight_(Modern)", displayName:"Moon Knight (Modern)"},
  PICCOLO:      { img: "https://static.wikia.nocookie.net/vsbattles/images/7/7c/KidPiccolo.png/revision/latest",            franchise: "DBZ",         abbr: "PC", color: "#0a2a0a", wiki: "vsbattles",    page: "Piccolo_(Dragon_Ball)", displayName:"Piccolo (Dragon Ball)"},
  STORM:        { img: "https://static.wikia.nocookie.net/vsbattles/images/2/2d/Ororo_Munroe_%28Earth-12131%29_001.png/revision/latest",              franchise: "MARVEL",      abbr: "ST", color: "#0a1a3a", wiki: "vsbattles",        page: "Storm_(Marvel_Comics)", displayName:"Storm (Marvel Comics)"},
  SIEGFRIED:    { img: "https://static.wikia.nocookie.net/vsbattles/images/8/80/SC6_Siegfried.png/revision/latest",          franchise: "SOULCALIBUR", abbr: "SG", color: "#1a1a3a", wiki: "vsbattles",   page: "Siegfried_(Soul_Calibur)", displayName:"Siegfried (Soul Calibur)"},
  BATMAN:       { img: "/Batman.png",             franchise: "DC",          abbr: "BM", color: "#0a0a1a", wiki: "vsbattles",            page: "Batman", displayName:"Batman"},
  CAMMY:        { img: "https://static.wikia.nocookie.net/vsbattles/images/e/e7/Cammy_White_render.png/revision/latest",              franchise: "CAPCOM",      abbr: "CM", color: "#0a2a1a", wiki: "vsbattles", page: "Cammy_White", displayName:"Cammy White"},
  AKUMA:        { img: "https://static.wikia.nocookie.net/vsbattles/images/b/b6/ARender.png/revision/latest",              franchise: "CAPCOM",      abbr: "AK", color: "#3a0a0a", wiki: "vsbattles", page: "Akuma_(Street_Fighter)", displayName:"Akuma (Street Fighter)"},
  AMATERASU:    { img: "/Amaterasu.png",          franchise: "CAPCOM",      abbr: "AM", color: "#3a1a00", wiki: "vsbattles",         page: "Amaterasu", displayName:"Amaterasu"},
  VOLDO:        { img: "https://static.wikia.nocookie.net/vsbattles/images/9/93/SC6_Voldo_02.png/revision/latest",              franchise: "SOULCALIBUR", abbr: "VO", color: "#1a0a2a", wiki: "vsbattles",   page: "Voldo", displayName:"Voldo"},
  HARLEY_QUINN: { img: "https://static.wikia.nocookie.net/vsbattles/images/b/bb/Tumblr_ml2fe0BTvV1qifv4go10_r1_1280.png/revision/latest",       franchise: "DC",          abbr: "HQ", color: "#3a0a2a", wiki: "vsbattles",            page: "Harley_Quinn_(Post-Crisis)", displayName:"Harley Quinn (Post-Crisis)"},
  GOHAN:        { img: "https://static.wikia.nocookie.net/vsbattles/images/2/2f/Raditz_gohan.png/revision/latest",              franchise: "DBZ",         abbr: "GH", color: "#0a1a3a", wiki: "vsbattles",    page: "Son_Gohan_(Dragon_Ball_Z)", displayName:"Son Gohan (Dragon Ball Z)"},
  IVY:          { img: "https://static.wikia.nocookie.net/vsbattles/images/8/84/Ivy_SC6.png/revision/latest",                franchise: "SOULCALIBUR", abbr: "IV", color: "#1a0a1a", wiki: "vsbattles",   page: "Ivy_Valentine", displayName:"Ivy Valentine"},
  LEX_LUTHOR:   { img: "https://static.wikia.nocookie.net/vsbattles/images/b/b1/Lex_Luthor_DCU.png/revision/latest",         franchise: "DC",          abbr: "LL", color: "#1a1a00", wiki: "vsbattles",            page: "Lex_Luthor_(DC_Universe)", displayName:"Lex Luthor (DC Universe)"},
  VENOM:        { img: "https://static.wikia.nocookie.net/vsbattles/images/1/1b/Venom_Render_Marvel_Puzzle_Quest.png/revision/latest",              franchise: "MARVEL",      abbr: "VN", color: "#0a1a0a", wiki: "vsbattles",        page: "Venom_(Edward_Brock)", displayName:"Venom (Edward Brock)"},
  // ── VS Battles fighters (auto-generated) ──
  "PRINCESS_PEACH": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fc/Smbwonder_peach.png/revision/latest/scale-to-width-down/327?cb=20240305034153", franchise:"VS Battles", abbr:"PR", color:"#1a1a2a", wiki:"vsbattles", page:"Princess_Peach", displayName:"Princess Peach" },
  "OBANAI_IGURO": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c3/Obanai_anime_right_face.webp/revision/latest/scale-to-width-down/341?cb=20250103002314", franchise:"VS Battles", abbr:"OB", color:"#1a1a2a", wiki:"vsbattles", page:"Obanai_Iguro", displayName:"Obanai Iguro" },
  "CLEA_MARVEL_COMICS": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9b/Clea_616.png/revision/latest/scale-to-width-down/342?cb=20240505151238", franchise:"VS Battles", abbr:"CL", color:"#1a1a2a", wiki:"vsbattles", page:"Clea_(Marvel_Comics)", displayName:"Clea (Marvel Comics)" },
  "THE_UNDERTAKER": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e3/8-2-undertaker-png.png/revision/latest/scale-to-width-down/239?cb=20220611200503", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Undertaker", displayName:"The Undertaker" },
  "RYUK": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f1/Jump_Force_Ryuk_by_MrUncleBingo.png/revision/latest/scale-to-width-down/561?cb=20190403160219", franchise:"VS Battles", abbr:"RY", color:"#1a1a2a", wiki:"vsbattles", page:"Ryuk", displayName:"Ryuk" },
  "SAITAMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/22/Casual_Saitama.png/revision/latest/scale-to-width-down/311?cb=20250602063806", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Saitama", displayName:"Saitama" },
  "BLACEPHALON": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/17/Blacephalon_Lost_Thunder.jpg/revision/latest/scale-to-width-down/600?cb=20200325225254", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blacephalon", displayName:"Blacephalon" },
  "GUNTHER_WWE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a0/GUNTHERChopnxt.gif/revision/latest?cb=20230926063153", franchise:"VS Battles", abbr:"GU", color:"#1a1a2a", wiki:"vsbattles", page:"GUNTHER_(WWE)", displayName:"GUNTHER (WWE)" },
  "MEGURU_BACHIRA": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/23/Bachira_Uniforme_11_Blue_Lock.png/revision/latest/scale-to-width-down/236?cb=20250901225653", franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Meguru_Bachira", displayName:"Meguru Bachira" },
  "SANDY_CHEEKS": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/08/Sandy_Cheeks_%282019%29.webp/revision/latest/scale-to-width-down/600?cb=20251023235828", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sandy_Cheeks", displayName:"Sandy Cheeks" },
  "QU": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4c/Q0gLLq2.jpg/revision/latest/scale-to-width-down/424?cb=20210713205542", franchise:"VS Battles", abbr:"QU", color:"#1a1a2a", wiki:"vsbattles", page:"Qu", displayName:"Qu" },
  "CHOSO": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/88/Choso_Anime.webp/revision/latest/scale-to-width-down/410?cb=20220607043026", franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Choso", displayName:"Choso" },
  "RUMI_KPOP_DEMON_HUNTERS": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/5c/RumiKPOP.webp/revision/latest/scale-to-width-down/259?cb=20251011045631", franchise:"VS Battles", abbr:"RU", color:"#1a1a2a", wiki:"vsbattles", page:"Rumi_(KPop_Demon_Hunters)", displayName:"Rumi (KPop Demon Hunters)" },
  "DEXTER_LUMIS_WWE": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f9/6re0tL.gif/revision/latest?cb=20220416145454", franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Dexter_Lumis_(WWE)", displayName:"Dexter Lumis (WWE)" },
  "NICK_WILDE": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f4/NickRender.png/revision/latest/scale-to-width-down/482?cb=20191102071228", franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nick_Wilde", displayName:"Nick Wilde" },
  "SUGURU_GETO": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/db/Suguru_Geto_Anime_Young.webp/revision/latest/scale-to-width-down/420?cb=20230917143909", franchise:"VS Battles", abbr:"SU", color:"#1a1a2a", wiki:"vsbattles", page:"Suguru_Geto", displayName:"Suguru Geto" },
  "GALADRIEL": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/14/GaladrielBooks.jpg/revision/latest/scale-to-width-down/432?cb=20230318132208", franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Galadriel", displayName:"Galadriel" },
  "ERAGON": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e0/Eragon_and_saphira_s_markoy_by_apljck-dauryin.jpg/revision/latest/scale-to-width-down/302?cb=20180911101125", franchise:"VS Battles", abbr:"ER", color:"#1a1a2a", wiki:"vsbattles", page:"Eragon", displayName:"Eragon" },
  "ALABAI": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/24/Alabai2.png/revision/latest?cb=20221104142726", franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alabai", displayName:"Alabai" },
  "RYOMEN_SUKUNA": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e2/Sukuna_Anime.png/revision/latest/scale-to-width-down/260?cb=20231213010558", franchise:"VS Battles", abbr:"RY", color:"#1a1a2a", wiki:"vsbattles", page:"Ryomen_Sukuna", displayName:"Ryomen Sukuna" },
  "JILL_VALENTINE": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/12/Jill_Valentine_Render.png/revision/latest/scale-to-width-down/255?cb=20151023193414", franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jill_Valentine", displayName:"Jill Valentine" },
  "AUGUSTA_WUTHERING_WAVES": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/74/Augusta_Full_Sprite.webp/revision/latest/scale-to-width-down/436?cb=20250830051359", franchise:"VS Battles", abbr:"AU", color:"#1a1a2a", wiki:"vsbattles", page:"Augusta_(Wuthering_Waves)", displayName:"Augusta (Wuthering Waves)" },
  "CAPTAIN_HOOK_DISNEY": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/97/Captain_Hook_Transparent.png/revision/latest/scale-to-width-down/344?cb=20161008180234", franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Captain_Hook_(Disney)", displayName:"Captain Hook (Disney)" },
  "DOORMAN_MARVEL_COMICS": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/17/Door_Man.png/revision/latest/scale-to-width-down/338?cb=20200821010920", franchise:"VS Battles", abbr:"DO", color:"#1a1a2a", wiki:"vsbattles", page:"Doorman_(Marvel_Comics)", displayName:"Doorman (Marvel Comics)" },
  "CERYDRA": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/88/Epoch_Etched_in_Golden_Blood_V2.png/revision/latest/scale-to-width-down/430?cb=20251101002106", franchise:"VS Battles", abbr:"CE", color:"#1a1a2a", wiki:"vsbattles", page:"Cerydra", displayName:"Cerydra" },
  "RIMURU_TEMPEST_LIGHT_NOVEL": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/15/Rimuru_Tempest_illustration.png/revision/latest/scale-to-width-down/326?cb=20191204001217", franchise:"VS Battles", abbr:"RI", color:"#1a1a2a", wiki:"vsbattles", page:"Rimuru_Tempest_(Light_Novel)", displayName:"Rimuru Tempest (Light Novel)" },
  "CAPTAIN_PHASMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/ce/Phasma_02.png/revision/latest/scale-to-width-down/284?cb=20171222125724", franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Captain_Phasma", displayName:"Captain Phasma" },
  "KENJAKU": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f5/Kenjaku_website_render.png/revision/latest/scale-to-width-down/411?cb=20240312184200", franchise:"VS Battles", abbr:"KE", color:"#1a1a2a", wiki:"vsbattles", page:"Kenjaku", displayName:"Kenjaku" },
  "MASH_BURNEDEAD": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/45/MashBurnedeadSit_%28Original%29_%28fix%29.png/revision/latest/scale-to-width-down/359?cb=20220117060031", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Mash_Burnedead", displayName:"Mash Burnedead" },
  "ARTICUNO": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/63/20150110171054%21144Articuno.png/revision/latest?cb=20150318125805", franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Articuno", displayName:"Articuno" },
  "FIRE_SPIRIT_COOKIE": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c1/Fire_Spirit_Cookie.png/revision/latest?cb=20211213152344", franchise:"VS Battles", abbr:"FI", color:"#1a1a2a", wiki:"vsbattles", page:"Fire_Spirit_Cookie", displayName:"Fire Spirit Cookie" },
  "KOOPA_TROOPA": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4f/KoopaT.webp/revision/latest/scale-to-width-down/279?cb=20240713163752", franchise:"VS Battles", abbr:"KO", color:"#1a1a2a", wiki:"vsbattles", page:"Koopa_Troopa", displayName:"Koopa Troopa" },
  "MIGUEL_ODUOL": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8e/Miguel_%28Anime%29.png/revision/latest/scale-to-width-down/349?cb=20240327033332", franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miguel_Oduol", displayName:"Miguel Oduol" },
  "MANJIRO_SANO": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c5/Mikey_anime_render.png/revision/latest/scale-to-width-down/420?cb=20240629132903", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Manjiro_Sano", displayName:"Manjiro Sano" },
  "GLAMROCK_CHICA": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c1/Glamrock_Chica_by_Scrappyboi.webp/revision/latest/scale-to-width-down/488?cb=20260410191515", franchise:"VS Battles", abbr:"GL", color:"#1a1a2a", wiki:"vsbattles", page:"Glamrock_Chica", displayName:"Glamrock Chica" },
  "OKARUN": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/59/Okarun_in_his_school_uniform.png/revision/latest/scale-to-width-down/246?cb=20230217171039", franchise:"VS Battles", abbr:"OK", color:"#1a1a2a", wiki:"vsbattles", page:"Okarun", displayName:"Okarun" },
  "GORR_THE_GOD_BUTCHER_MARVEL_COMICS": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c6/Gorr_the_God_Butcher_render.png/revision/latest/scale-to-width-down/415?cb=20191119191820", franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Gorr_the_God_Butcher_(Marvel_Comics)", displayName:"Gorr the God Butcher (Marvel Comics)" },
  "THANOS_SQUID_GAME": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/cb/TheLegendTanos.png/revision/latest/scale-to-width-down/450?cb=20250625212248", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"Thanos_(Squid_Game)", displayName:"Thanos (Squid Game)" },
  "LOONA_HELLUVA_BOSS": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f7/Thank_goodness_for_Sharkrobot_-_Loona.png/revision/latest/scale-to-width-down/274?cb=20220213054337", franchise:"VS Battles", abbr:"LO", color:"#1a1a2a", wiki:"vsbattles", page:"Loona_(Helluva_Boss)", displayName:"Loona (Helluva Boss)" },
  "CYRENE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/08/Philia093_Renders.png/revision/latest/scale-to-width-down/422?cb=20251130101936", franchise:"VS Battles", abbr:"CY", color:"#1a1a2a", wiki:"vsbattles", page:"Cyrene", displayName:"Cyrene" },
  "CARTETHYIA": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0c/Cartethyia_Full_Sprite.webp/revision/latest/scale-to-width-down/413?cb=20250830044931", franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Cartethyia", displayName:"Cartethyia" },
  "LINK_TEARS_OF_THE_KINGDOM": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/cb/TotK_Link.png/revision/latest/scale-to-width-down/600?cb=20231214131822", franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Link_(Tears_of_the_Kingdom)", displayName:"Link (Tears of the Kingdom)" },
  "JEVIL": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/57/Five-Spade_Attack.gif/revision/latest/scale-to-width-down/600?cb=20230709214711", franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jevil", displayName:"Jevil" },
  "GUEST_1337_THE_LAST_GUEST": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8b/Last-Guest_Render.webp/revision/latest?cb=20250625114433", franchise:"VS Battles", abbr:"GU", color:"#1a1a2a", wiki:"vsbattles", page:"Guest_1337_(The_Last_Guest)", displayName:"Guest 1337 (The Last Guest)" },
  "CHARLIE_MORNINGSTAR": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/3f/Charlie_Morningstar_%28Main_Series%29.png/revision/latest/scale-to-width-down/260?cb=20251005011329", franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Charlie_Morningstar", displayName:"Charlie Morningstar" },
  "JING_YUAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/51/Before_Dawn.png/revision/latest/scale-to-width-down/422?cb=20230422070944", franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jing_Yuan", displayName:"Jing Yuan" },
  "THE_ELDEN_BEAST": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c9/Elden-ring-elden-beast.jpg/revision/latest/scale-to-width-down/600?cb=20220421160341", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Elden_Beast", displayName:"The Elden Beast" },
  "BETA_RAY_BILL": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9f/Beta_Ray_Bill_Portrait_Art.png/revision/latest/scale-to-width-down/501?cb=20211016210228", franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Beta_Ray_Bill", displayName:"Beta Ray Bill" },
  "SASSY_THE_SASQUATCH": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/68/Maxresdefault544534.jpg/revision/latest/scale-to-width-down/600?cb=20180425195125", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sassy_the_Sasquatch", displayName:"Sassy the Sasquatch" },
  "BOYFRIEND": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8a/BoyfriendRender.png/revision/latest/scale-to-width-down/600?cb=20260514191003", franchise:"VS Battles", abbr:"BO", color:"#1a1a2a", wiki:"vsbattles", page:"Boyfriend", displayName:"Boyfriend" },
  "REI_AYANAMI": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e6/Rei_Ayanami.png/revision/latest/scale-to-width-down/189?cb=20181014020559", franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rei_Ayanami", displayName:"Rei Ayanami" },
  "ATSUYA_KUSAKABE": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b6/Kusakabe_JJK.png/revision/latest/scale-to-width-down/385?cb=20220807173122", franchise:"VS Battles", abbr:"AT", color:"#1a1a2a", wiki:"vsbattles", page:"Atsuya_Kusakabe", displayName:"Atsuya Kusakabe" },
  "KAEYA_ALBERICH": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/de/Kaeya_Portrait.png/revision/latest/scale-to-width-down/397?cb=20230629103432", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kaeya_Alberich", displayName:"Kaeya Alberich" },
  "RENSUKE_KUNIGAMI": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/3d/Rensuke_Kunigami_suit_anime_design.webp/revision/latest/scale-to-width-down/420?cb=20240304190138", franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rensuke_Kunigami", displayName:"Rensuke Kunigami" },
  "KINGLER": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a8/KRABBY098.png/revision/latest?cb=20191115010120", franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Kingler", displayName:"Kingler" },
  "JOHN_PRICE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/08/Captain_Price_Full_Render.png/revision/latest/scale-to-width-down/222?cb=20230127013605", franchise:"VS Battles", abbr:"JO", color:"#1a1a2a", wiki:"vsbattles", page:"John_Price", displayName:"John Price" },
  "MAKIMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/33/Makima-Reze-Arc-Movie-Render.png/revision/latest/scale-to-width-down/151?cb=20251010030343", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Makima", displayName:"Makima" },
  "SON_GOKU_DBS_ANIME": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d6/Goku_whis_gi_by_shallotxl_dh8c3er-375w-2x.png/revision/latest/scale-to-width-down/406?cb=20240906131641", franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(DBS_Anime)", displayName:"Son Goku (DBS Anime)" },
  "NEUVILLETTE": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/36/NewValet.png/revision/latest/scale-to-width-down/319?cb=20260514024329", franchise:"VS Battles", abbr:"NE", color:"#1a1a2a", wiki:"vsbattles", page:"Neuvillette", displayName:"Neuvillette" },
  "KATE_BISHOP_MARVEL_CINEMATIC_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0e/Other_other_kate_render.png/revision/latest/scale-to-width-down/386?cb=20220305131405", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kate_Bishop_(Marvel_Cinematic_Universe)", displayName:"Kate Bishop (Marvel Cinematic Universe)" },
  "MIKE_DELTARUNE": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/34/Mikes_overworld.png/revision/latest/scale-to-width-down/600?cb=20260202014631", franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Mike_(Deltarune)", displayName:"Mike (Deltarune)" },
  "NATHAN_DRAKE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a7/Nathan_Drake_render.png/revision/latest?cb=20200309033631", franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nathan_Drake", displayName:"Nathan Drake" },
  "TENKA_IZUMO": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d4/Tenka_Izumo_Anime_Design_SS1.png/revision/latest/scale-to-width-down/360?cb=20260124193040", franchise:"VS Battles", abbr:"TE", color:"#1a1a2a", wiki:"vsbattles", page:"Tenka_Izumo", displayName:"Tenka Izumo" },
  "MIRANDA_RESIDENT_EVIL": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/34/Mother-miranda-resident-evil-village8.png/revision/latest/scale-to-width-down/282?cb=20210512203350", franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miranda_(Resident_Evil)", displayName:"Miranda (Resident Evil)" },
  "SON_GOKU_DRAGON_BALL": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d7/Blue_gi_goku.png/revision/latest/scale-to-width-down/506?cb=20240320233527", franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(Dragon_Ball)", displayName:"Son Goku (Dragon Ball)" },
  "PAPYRUS": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/27/Dficwfq-f25ee794-c8d6-4b00-9724-dc417aef3fa2.png/revision/latest/scale-to-width-down/303?cb=20230217222419", franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Papyrus", displayName:"Papyrus" },
  "MORGOTH": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b0/Melkor3.pjpg.jpg/revision/latest/scale-to-width-down/600?cb=20171123052216", franchise:"VS Battles", abbr:"MO", color:"#1a1a2a", wiki:"vsbattles", page:"Morgoth", displayName:"Morgoth" },
  "BARNACLE_BOY": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0b/BarnacleBoy.png/revision/latest/scale-to-width-down/237?cb=20191126161130", franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Barnacle_Boy", displayName:"Barnacle Boy" },
  "GABIMARU_THE_HOLLOW": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/31/Gabimarurheholloww.png/revision/latest?cb=20221111031520", franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Gabimaru_the_Hollow", displayName:"Gabimaru the Hollow" },
  "PERCIVAL_FOUR_KNIGHTS_OF_THE_APOCALYPSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/19/Percival12.png/revision/latest?cb=20240912002304", franchise:"VS Battles", abbr:"PE", color:"#1a1a2a", wiki:"vsbattles", page:"Percival_(Four_Knights_of_The_Apocalypse)", displayName:"Percival (Four Knights of The Apocalypse)" },
  "CHARLIE_DOMPLER_SMILING_FRIENDS": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fd/Charlie_SF.webp/revision/latest/scale-to-width-down/413?cb=20240729052010", franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Charlie_Dompler_(Smiling_Friends)", displayName:"Charlie Dompler (Smiling Friends)" },
  "CIPHER": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/28/Lies_Dance_on_the_Breeze.png/revision/latest/scale-to-width-down/430?cb=20250926174150", franchise:"VS Battles", abbr:"CI", color:"#1a1a2a", wiki:"vsbattles", page:"Cipher", displayName:"Cipher" },
  "AVENTURINE": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1e/Aventurine_Render.png/revision/latest/scale-to-width-down/600?cb=20240623101149", franchise:"VS Battles", abbr:"AV", color:"#1a1a2a", wiki:"vsbattles", page:"Aventurine", displayName:"Aventurine" },
  "SENJU_KAWARAGI": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a1/Senju_KawaragiFixed.png/revision/latest/scale-to-width-down/420?cb=20220704113445", franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Senju_Kawaragi", displayName:"Senju Kawaragi" },
  "DALE_GRIBBLE": { img:null, franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Dale_Gribble", displayName:"Dale Gribble" },
  "BLING_BLING_BOY": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4d/Blingbling.png/revision/latest?cb=20230623005243", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Bling-Bling_Boy", displayName:"Bling-Bling Boy" },
  "GALBRENA": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/35/Galbrena_Full_Sprite.webp/revision/latest/scale-to-width-down/392?cb=20251013085201", franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Galbrena", displayName:"Galbrena" },
  "REY_SKYWALKER": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/83/Star_wars_vii_rey_png_2_by_nickelbackloverxoxox-d9e4er9.png/revision/latest/scale-to-width-down/250?cb=20170416212426", franchise:"VS Battles", abbr:"RE", color:"#1a1a2a", wiki:"vsbattles", page:"Rey_Skywalker", displayName:"Rey Skywalker" },
  "KANAO_TSUYURI": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/ee/Kanao_anime2.png/revision/latest/scale-to-width-down/358?cb=20250103183518", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kanao_Tsuyuri", displayName:"Kanao Tsuyuri" },
  "EDWARD_ELRIC": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/3c/Bfadfbc_DV.png/revision/latest?cb=20220119202005", franchise:"VS Battles", abbr:"ED", color:"#1a1a2a", wiki:"vsbattles", page:"Edward_Elric", displayName:"Edward Elric" },
  "NAM_GYU": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/33/Nam-gyu_red_vest.png/revision/latest?cb=20250815035059", franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nam-gyu", displayName:"Nam-gyu" },
  "BALL_BASKET_AND_BALL": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/aa/Powerbar.png/revision/latest/scale-to-width-down/142?cb=20220524215216", franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Ball_(Basket_and_Ball)", displayName:"Ball (Basket and Ball)" },
  "ST_JAYGARCIA_SATURN": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6c/SaturnRenderBase.png/revision/latest/scale-to-width-down/457?cb=20250502191207", franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"St._Jaygarcia_Saturn", displayName:"St. Jaygarcia Saturn" },
  "MALEVOLA": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6b/Hero_Power_Malevola_-_Dispatch.png/revision/latest/scale-to-width-down/600?cb=20251101144205", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Malevola", displayName:"Malevola" },
  "MAJIN_DUU": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/39/Majin_Duu_design.webp/revision/latest/scale-to-width-down/454?cb=20250614134923", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Majin_Duu", displayName:"Majin Duu" },
  "MAVUIKA": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8a/Mavuika1.png/revision/latest/scale-to-width-down/600?cb=20250101155852", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Mavuika", displayName:"Mavuika" },
  "MARAUDER_DOOM": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/7b/MarauderFix.png/revision/latest/scale-to-width-down/351?cb=20210123230741", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Marauder_(DOOM)", displayName:"Marauder (DOOM)" },
  "HARU_URARA": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/96/Haru_Urara_Main.png/revision/latest/scale-to-width-down/448?cb=20251013162017", franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Haru_Urara", displayName:"Haru Urara" },
  "PHROLOVA": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/61/Phrolova_Full_Sprite.webp/revision/latest/scale-to-width-down/437?cb=20250830045026", franchise:"VS Battles", abbr:"PH", color:"#1a1a2a", wiki:"vsbattles", page:"Phrolova", displayName:"Phrolova" },
  "ALCINA_DIMITRESCU": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f3/Tall_Vampire_Lady.png/revision/latest/scale-to-width-down/285?cb=20211019060008", franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alcina_Dimitrescu", displayName:"Alcina Dimitrescu" },
  "LEON_S_KENNEDY": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/07/Leon_%281%29.png/revision/latest/scale-to-width-down/184?cb=20200218220116", franchise:"VS Battles", abbr:"LE", color:"#1a1a2a", wiki:"vsbattles", page:"Leon_S._Kennedy", displayName:"Leon S. Kennedy" },
  "LIBERTY_PRIME": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/51/Liberty_Prime_Render.png/revision/latest/scale-to-width-down/420?cb=20180804233513", franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Liberty_Prime", displayName:"Liberty Prime" },
  "DESTOROYAH": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/af/Destoroyah_Micro_Form_Z.png/revision/latest/scale-to-width-down/501?cb=20230815023453", franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Destoroyah", displayName:"Destoroyah" },
  "KYOKA_JIRO_EARPHONE_JACK": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/ea/Kyouka_Jirou_Full_Body_Uniform.png/revision/latest/scale-to-width-down/158?cb=20240801045312", franchise:"VS Battles", abbr:"KY", color:"#1a1a2a", wiki:"vsbattles", page:"Kyoka_Jiro_(Earphone_Jack)", displayName:"Kyoka Jiro (Earphone Jack)" },
  "KANG_SAE_BYEOK": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f4/Kang_Sae-byeok.png/revision/latest/scale-to-width-down/345?cb=20250708091228", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kang_Sae-byeok", displayName:"Kang Sae-byeok" },
  "BELLATRIX_LESTRANGE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/06/Bella2.jpg/revision/latest?cb=20160911143411", franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Bellatrix_Lestrange", displayName:"Bellatrix Lestrange" },
  "NOBARA_KUGISAKI": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b8/NobaraKugisaki_%28Anime%29.png/revision/latest/scale-to-width-down/301?cb=20240731140712", franchise:"VS Battles", abbr:"NO", color:"#1a1a2a", wiki:"vsbattles", page:"Nobara_Kugisaki", displayName:"Nobara Kugisaki" },
  "GRAYSON_WALLER_WWE": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/72/JOHNMORRISON.png/revision/latest/scale-to-width-down/481?cb=20230913232921", franchise:"VS Battles", abbr:"GR", color:"#1a1a2a", wiki:"vsbattles", page:"Grayson_Waller_(WWE)", displayName:"Grayson Waller (WWE)" },
  "TARRE_VIZSLA": { img:"https://static.wikia.nocookie.net/starwars/images/6/61/MandoDarksaber-SWGoH.png/revision/latest", franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tarre_Vizsla", displayName:"Tarre Vizsla" },
  "OBERYN_MARTELL_A_SONG_OF_ICE_AND_FIRE": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/db/T%C3%A9l%C3%A9charger.jpg/revision/latest?cb=20220408172026", franchise:"VS Battles", abbr:"OB", color:"#1a1a2a", wiki:"vsbattles", page:"Oberyn_Martell_(A_Song_of_Ice_and_Fire)", displayName:"Oberyn Martell (A Song of Ice and Fire)" },
  "DRACOVISH": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4c/157636072627.png/revision/latest/scale-to-width-down/586?cb=20191214223312", franchise:"VS Battles", abbr:"DR", color:"#1a1a2a", wiki:"vsbattles", page:"Dracovish", displayName:"Dracovish" },
  "DAEODON": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/75/Dtp-2.webp/revision/latest/scale-to-width-down/600?cb=20240724032903", franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Daeodon", displayName:"Daeodon" },
  "THE_LIVING_TRIBUNAL": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/51/The_Living_Tribunal.png/revision/latest/scale-to-width-down/320?cb=20181002031349", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Living_Tribunal", displayName:"The Living Tribunal" },
  "KAMEN_RIDER_ZX": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/3c/Ryo_Murasame.jpg/revision/latest?cb=20230326213332", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kamen_Rider_ZX", displayName:"Kamen Rider ZX" },
  "SATORU_GOJO": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/64/SatoruGojoRender.png/revision/latest/scale-to-width-down/337?cb=20240127030546", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Satoru_Gojo", displayName:"Satoru Gojo" },
  "OGURI_CAP": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/ac/Oguri_main_outfit_lesspx.png/revision/latest/scale-to-width-down/379?cb=20250903081432", franchise:"VS Battles", abbr:"OG", color:"#1a1a2a", wiki:"vsbattles", page:"Oguri_Cap", displayName:"Oguri Cap" },
  "THE_COLLECTOR_THE_OWL_HOUSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/37/The_Collector_%28True_Form%29.png/revision/latest/scale-to-width-down/411?cb=20230116084204", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Collector_(The_Owl_House)", displayName:"The Collector (The Owl House)" },
  "STAN_MARSH": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4a/Stan_Marsh.png/revision/latest/scale-to-width-down/372?cb=20220107125255", franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Stan_Marsh", displayName:"Stan Marsh" },
  "ROUXLS_KAARD": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/34/Rouxls-kaart.gif/revision/latest?cb=20211113051132", franchise:"VS Battles", abbr:"RO", color:"#1a1a2a", wiki:"vsbattles", page:"Rouxls_Kaard", displayName:"Rouxls Kaard" },
  "BLACK_SWAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/56/Reforged_Remembrance.png/revision/latest/scale-to-width-down/430?cb=20240623054142", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Black_Swan", displayName:"Black Swan" },
  "KAI_PARKER": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9e/814-060_Caroline-Kai.png/revision/latest/scale-to-width-down/600?cb=20210804062601", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kai_Parker", displayName:"Kai Parker" },
  "KING_K_ROOL": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/2a/DKB_Loading_Art_King_K._Rool_render.png/revision/latest/scale-to-width-down/600?cb=20260207174943", franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"King_K._Rool", displayName:"King K. Rool" },
  "KARL_HEISENBERG": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/10/Heisenberg_render.webp/revision/latest/scale-to-width-down/449?cb=20230408070749", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Karl_Heisenberg", displayName:"Karl Heisenberg" },
  "BENDER": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/af/Bender_Render.png/revision/latest/scale-to-width-down/325?cb=20190108183740", franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Bender", displayName:"Bender" },
  "EURON_GREYJOY_A_SONG_OF_ICE_AND_FIRE": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d7/A_Feast_for_a_Crow.jpg/revision/latest/scale-to-width-down/600?cb=20220515144909", franchise:"VS Battles", abbr:"EU", color:"#1a1a2a", wiki:"vsbattles", page:"Euron_Greyjoy_(A_Song_of_Ice_and_Fire)", displayName:"Euron Greyjoy (A Song of Ice and Fire)" },
  "GLEP_SMILING_FRIENDS": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/ab/Glep_SF.png.png/revision/latest?cb=20251202045936", franchise:"VS Battles", abbr:"GL", color:"#1a1a2a", wiki:"vsbattles", page:"Glep_(Smiling_Friends)", displayName:"Glep (Smiling Friends)" },
  "LUCIUS_ZOGRATIS": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/7d/Lucius_profile.webp/revision/latest/scale-to-width-down/409?cb=20230823203626", franchise:"VS Battles", abbr:"LU", color:"#1a1a2a", wiki:"vsbattles", page:"Lucius_Zogratis", displayName:"Lucius Zogratis" },
  "MAKI_ZENIN": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6f/Maki_pre-shibuya.png/revision/latest/scale-to-width-down/411?cb=20240312182721", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Maki_Zenin", displayName:"Maki Zenin" },
  "ANDREW_HUSSIE": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/67/Hussiescribble.gif/revision/latest/scale-to-width-down/600?cb=20140127201124", franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Andrew_Hussie", displayName:"Andrew Hussie" },
  "OMEN_VALORANT": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/18/Omen_artwork.webp/revision/latest/scale-to-width-down/391?cb=20220708223351", franchise:"VS Battles", abbr:"OM", color:"#1a1a2a", wiki:"vsbattles", page:"Omen_(Valorant)", displayName:"Omen (Valorant)" },
  "TARIQ_ST_PATRICK": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/bd/TariqStPatrick.png/revision/latest/scale-to-width-down/283?cb=20240828155048", franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tariq_St._Patrick", displayName:"Tariq St. Patrick" },
  "SHIZUKU_MURASAKI": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b6/Genei_shizu.jpg/revision/latest/scale-to-width-down/600?cb=20191002212841", franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shizuku_Murasaki", displayName:"Shizuku Murasaki" },
  "SERAPHIM_ONE_PIECE": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6d/S-Bear.png/revision/latest?cb=20240323184436", franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Seraphim_(One_Piece)", displayName:"Seraphim (One Piece)" },
  "POLKA_DOT_MAN_DC_EXTENDED_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/72/Polka_Dot_Man.png/revision/latest/scale-to-width-down/231?cb=20230603064944", franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Polka_Dot_Man_(DC_Extended_Universe)", displayName:"Polka Dot Man (DC Extended Universe)" },
  "CLAPTRAP_BORDERLANDS": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9c/Claptrap_Borderlands.png/revision/latest/scale-to-width-down/490?cb=20171111044649", franchise:"VS Battles", abbr:"CL", color:"#1a1a2a", wiki:"vsbattles", page:"Claptrap_(Borderlands)", displayName:"Claptrap (Borderlands)" },
  "THE_ROARING_KNIGHT": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1e/Roaring_Knight_Idle.png/revision/latest?cb=20251026044935", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Roaring_Knight", displayName:"The Roaring Knight" },
  "DUNCAN_THE_TALL_A_SONG_OF_ICE_AND_FIRE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0f/Duncan_vs_Lyonel.jpg/revision/latest/scale-to-width-down/450?cb=20150820152348", franchise:"VS Battles", abbr:"DU", color:"#1a1a2a", wiki:"vsbattles", page:"Duncan_the_Tall_(A_Song_of_Ice_and_Fire)", displayName:"Duncan the Tall (A Song of Ice and Fire)" },
  "ALIEN_X": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4f/Alien_x1.webp/revision/latest/scale-to-width-down/387?cb=20250718003904", franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alien_X", displayName:"Alien X" },
  "GOOMBA": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/7d/SMBW_Goomba.png/revision/latest?cb=20231212062446", franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Goomba", displayName:"Goomba" },
  "KRYPTO_THE_SUPERDOG_POST_CRISIS": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/13/Krypto.jpg/revision/latest/scale-to-width-down/398?cb=20210904125629", franchise:"VS Battles", abbr:"KR", color:"#1a1a2a", wiki:"vsbattles", page:"Krypto_the_Superdog_(Post_Crisis)", displayName:"Krypto the Superdog (Post Crisis)" },
  "MARCH_7TH": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/48/March_7th_Render.png/revision/latest/scale-to-width-down/566?cb=20230521020607", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"March_7th", displayName:"March 7th" },
  "LANCER_DELTARUNE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/ae/Lancer1.png/revision/latest/scale-to-width-down/441?cb=20211111043141", franchise:"VS Battles", abbr:"LA", color:"#1a1a2a", wiki:"vsbattles", page:"Lancer_(Deltarune)", displayName:"Lancer (Deltarune)" },
  "IPPO_MAKUNOUCHI": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/2a/IppoRender.png/revision/latest/scale-to-width-down/272?cb=20200822125725", franchise:"VS Battles", abbr:"IP", color:"#1a1a2a", wiki:"vsbattles", page:"Ippo_Makunouchi", displayName:"Ippo Makunouchi" },
  "RAMONA_FLOWERS": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1c/Ramona_Flowers_Scott_Pilgrim_Vs_the_World.png/revision/latest/scale-to-width-down/315?cb=20190309032717", franchise:"VS Battles", abbr:"RA", color:"#1a1a2a", wiki:"vsbattles", page:"Ramona_Flowers", displayName:"Ramona Flowers" },
  "MYDEI": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/91/Flame_of_Blood_Blaze%2C_My_Path.png/revision/latest/scale-to-width-down/430?cb=20250114054246", franchise:"VS Battles", abbr:"MY", color:"#1a1a2a", wiki:"vsbattles", page:"Mydei", displayName:"Mydei" },
  "QIN_SHI_HUANG_RECORD_OF_RAGNAROK": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/06/Qin_Shi_Huang_Blindfold_on.png/revision/latest/scale-to-width-down/350?cb=20240816205328", franchise:"VS Battles", abbr:"QI", color:"#1a1a2a", wiki:"vsbattles", page:"Qin_Shi_Huang_(Record_of_Ragnarok)", displayName:"Qin Shi Huang (Record of Ragnarok)" },
  "POKIO": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f4/SMOPokioModel.png/revision/latest/scale-to-width-down/600?cb=20220124023909", franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Pokio", displayName:"Pokio" },
  "GIYU_TOMIOKA": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/19/Giyu_anime_2.png/revision/latest/scale-to-width-down/381?cb=20250103163643", franchise:"VS Battles", abbr:"GI", color:"#1a1a2a", wiki:"vsbattles", page:"Giyu_Tomioka", displayName:"Giyu Tomioka" },
  "LEON_BRAWL_STARS": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b2/Leon-Skin-Default.png/revision/latest/scale-to-width-down/374?cb=20201013211734", franchise:"VS Battles", abbr:"LE", color:"#1a1a2a", wiki:"vsbattles", page:"Leon_(Brawl_Stars)", displayName:"Leon (Brawl Stars)" },
  "ASTRA_VALORANT": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b4/Astra_artwork.webp/revision/latest/scale-to-width-down/391?cb=20220707193537", franchise:"VS Battles", abbr:"AS", color:"#1a1a2a", wiki:"vsbattles", page:"Astra_(Valorant)", displayName:"Astra (Valorant)" },
  "JEFF_THE_LAND_SHARK": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f9/JeffLandShark.png/revision/latest/scale-to-width-down/450?cb=20241226155042", franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jeff_the_Land_Shark", displayName:"Jeff the Land Shark" },
  "DOEY_THE_DOUGHMAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b3/BaseDoeyRender2.webp/revision/latest/scale-to-width-down/485?cb=20250211114001", franchise:"VS Battles", abbr:"DO", color:"#1a1a2a", wiki:"vsbattles", page:"Doey_the_Doughman", displayName:"Doey the Doughman" },
  "MINERVA_MCGONAGALL": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/07/Minervamcgonagallpic.png/revision/latest/scale-to-width-down/329?cb=20220413001250", franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Minerva_McGonagall", displayName:"Minerva McGonagall" },
  "SAILOR_PLUTO_MANGA": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d0/Setsuna_Meiou_-_Manga.png/revision/latest/scale-to-width-down/134?cb=20220421042037", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sailor_Pluto_(Manga)", displayName:"Sailor Pluto (Manga)" },
  "SEONG_GI_HUN": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/19/SGDude.png/revision/latest?cb=20231210042017", franchise:"VS Battles", abbr:"SE", color:"#1a1a2a", wiki:"vsbattles", page:"Seong_Gi-hun", displayName:"Seong Gi-hun" },
  "MECHAGODZILLA_MONSTERVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f1/Mechagodzilla_wins_beam_clash.gif/revision/latest/scale-to-width-down/600?cb=20210919163124", franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Mechagodzilla_(MonsterVerse)", displayName:"Mechagodzilla (MonsterVerse)" },
  "GORR_THE_GOD_BUTCHER_MARVEL_CINEMATIC_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/73/Gorr_The_God_Butcher_%28MCU%29_FB_Render.png/revision/latest/scale-to-width-down/313?cb=20220709070807", franchise:"VS Battles", abbr:"GO", color:"#1a1a2a", wiki:"vsbattles", page:"Gorr_the_God_Butcher_(Marvel_Cinematic_Universe)", displayName:"Gorr the God Butcher (Marvel Cinematic Universe)" },
  "AMMIT_MARVEL_CINEMATIC_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a6/Marvel_cutout_ammit_mcu_by_theikariwarrior1_df77ci6-fullview.png/revision/latest/scale-to-width-down/476?cb=20220919124623", franchise:"VS Battles", abbr:"AM", color:"#1a1a2a", wiki:"vsbattles", page:"Ammit_(Marvel_Cinematic_Universe)", displayName:"Ammit (Marvel Cinematic Universe)" },
  "ONE_BATTLE_FOR_DREAM_ISLAND": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b0/One_smug_lol.webp/revision/latest/scale-to-width-down/468?cb=20250105093821", franchise:"VS Battles", abbr:"ON", color:"#1a1a2a", wiki:"vsbattles", page:"One_(Battle_for_Dream_Island)", displayName:"One (Battle for Dream Island)" },
  "EMPRESS_OF_LIGHT": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b7/EmpressofLight.gif/revision/latest?cb=20250104171553", franchise:"VS Battles", abbr:"EM", color:"#1a1a2a", wiki:"vsbattles", page:"Empress_of_Light", displayName:"Empress of Light" },
  "BLUE_ARCHIVE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a8/Sensei_icon.png/revision/latest?cb=20230903102755", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blue_Archive", displayName:"Blue Archive" },
  "ROSE_QUARTZ": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fa/Rose_Quartz_-_With_Weapon.png/revision/latest/scale-to-width-down/446?cb=20151021054536", franchise:"VS Battles", abbr:"RO", color:"#1a1a2a", wiki:"vsbattles", page:"Rose_Quartz", displayName:"Rose Quartz" },
  "HUEY_FREEMAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/27/Huey_Freeman.png/revision/latest?cb=20161008015139", franchise:"VS Battles", abbr:"HU", color:"#1a1a2a", wiki:"vsbattles", page:"Huey_Freeman", displayName:"Huey Freeman" },
  "MARX_KIRBY": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/f2/KARs_Marx.png/revision/latest/scale-to-width-down/528?cb=20251023180557", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Marx_(Kirby)", displayName:"Marx (Kirby)" },
  "NAHIDA": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/ca/Buer.png/revision/latest/scale-to-width-down/494?cb=20251109204558", franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nahida", displayName:"Nahida" },
  "THE_DREDGE": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/97/DBD_Killer_Dredge_only_1b3fa9f6ca.png/revision/latest/scale-to-width-down/600?cb=20220807195955", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Dredge", displayName:"The Dredge" },
  "DENJI_CHAINSAW_MAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/24/Denji-Reze-Arc-Movie-Render.png/revision/latest/scale-to-width-down/190?cb=20251010030131", franchise:"VS Battles", abbr:"DE", color:"#1a1a2a", wiki:"vsbattles", page:"Denji_(Chainsaw_Man)", displayName:"Denji (Chainsaw Man)" },
  "SID_ICE_AGE": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fd/Sid_%28IceAge%29.png/revision/latest/scale-to-width-down/370?cb=20220813194501", franchise:"VS Battles", abbr:"SI", color:"#1a1a2a", wiki:"vsbattles", page:"Sid_(Ice_Age)", displayName:"Sid (Ice Age)" },
  "CASTORICE": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/ff/Castorice_LC.webp/revision/latest?cb=20250514200136", franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Castorice", displayName:"Castorice" },
  "HILICHURL": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0a/Enemy_Hilichurl.png/revision/latest/scale-to-width-down/476?cb=20220305192931", franchise:"VS Battles", abbr:"HI", color:"#1a1a2a", wiki:"vsbattles", page:"Hilichurl", displayName:"Hilichurl" },
  "SKAR_KING": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/ed/Skar_king_the_new_empire_by_steampunk671213_dhdfprm.png/revision/latest/scale-to-width-down/316?cb=20240527042210", franchise:"VS Battles", abbr:"SK", color:"#1a1a2a", wiki:"vsbattles", page:"Skar_King", displayName:"Skar King" },
  "SON_GOKU_DBS_MANGA": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1b/Son_goku_by_butanobakaart_de4u8g2.png/revision/latest/scale-to-width-down/362?cb=20210421113152", franchise:"VS Battles", abbr:"SO", color:"#1a1a2a", wiki:"vsbattles", page:"Son_Goku_(DBS_Manga)", displayName:"Son Goku (DBS Manga)" },
  "LINK_TWILIGHT_PRINCESS": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/74/Link%28Twilight_Princess%29.png/revision/latest?cb=20181207182248", franchise:"VS Battles", abbr:"LI", color:"#1a1a2a", wiki:"vsbattles", page:"Link_(Twilight_Princess)", displayName:"Link (Twilight Princess)" },
  "ASKELADD": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/66/Chara_askeladd.png/revision/latest/scale-to-width-down/307?cb=20190717233719", franchise:"VS Battles", abbr:"AS", color:"#1a1a2a", wiki:"vsbattles", page:"Askeladd", displayName:"Askeladd" },
  "KOTAL_KAHN_SECOND_TIMELINE": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b5/KotalMK11.png/revision/latest/scale-to-width-down/292?cb=20210718101107", franchise:"VS Battles", abbr:"KO", color:"#1a1a2a", wiki:"vsbattles", page:"Kotal_Kahn_(Second_Timeline)", displayName:"Kotal Kahn (Second Timeline)" },
  "DISTORTUS_REX": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/bb/DistortusRexPosterRender.webp/revision/latest?cb=20260222085858", franchise:"VS Battles", abbr:"DI", color:"#1a1a2a", wiki:"vsbattles", page:"Distortus_Rex", displayName:"Distortus Rex" },
  "HARVEY_HARVINGTON": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/10/BMHarvey.png/revision/latest?cb=20250914051211", franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Harvey_Harvington", displayName:"Harvey Harvington" },
  "PANDA_JUJUTSU_KAISEN": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e1/PandaJJKImageReal.png/revision/latest/scale-to-width-down/507?cb=20250911052516", franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Panda_(Jujutsu_Kaisen)", displayName:"Panda (Jujutsu Kaisen)" },
  "DRACOZOLT": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fc/0880Dracozolt.png/revision/latest?cb=20241022162621", franchise:"VS Battles", abbr:"DR", color:"#1a1a2a", wiki:"vsbattles", page:"Dracozolt", displayName:"Dracozolt" },
  "SCOURGE_THE_HEDGEHOG": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/ce/Scourge_the_Hedgehog.png/revision/latest/scale-to-width-down/408?cb=20181006204237", franchise:"VS Battles", abbr:"SC", color:"#1a1a2a", wiki:"vsbattles", page:"Scourge_the_Hedgehog", displayName:"Scourge the Hedgehog" },
  "ELLIE_THE_LAST_OF_US": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/52/Ellie_TLOU1.png/revision/latest/scale-to-width-down/306?cb=20250713053045", franchise:"VS Battles", abbr:"EL", color:"#1a1a2a", wiki:"vsbattles", page:"Ellie_(The_Last_of_Us)", displayName:"Ellie (The Last of Us)" },
  "CYNO": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a2/Cyno_Portrait.png/revision/latest/scale-to-width-down/561?cb=20230625153235", franchise:"VS Battles", abbr:"CY", color:"#1a1a2a", wiki:"vsbattles", page:"Cyno", displayName:"Cyno" },
  "JIYAN_WUTHERING_WAVES": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/56/Jiyan_Full_Sprite.png/revision/latest/scale-to-width-down/576?cb=20250924195902", franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jiyan_(Wuthering_Waves)", displayName:"Jiyan (Wuthering Waves)" },
  "JAQEN_H_27GHAR": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/52/Jaqen_H%27ghar.png/revision/latest", franchise:"VS Battles", abbr:"JA", color:"#1a1a2a", wiki:"vsbattles", page:"Jaqen_H%27ghar", displayName:"Jaqen H'ghar" },
  "MAGICAL_GIRL_RAISING_PROJECT": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/63/MGRP_-_Snow_White_2.jpg/revision/latest?cb=20170722143920", franchise:"VS Battles", abbr:"MA", color:"#1a1a2a", wiki:"vsbattles", page:"Magical_Girl_Raising_Project", displayName:"Magical Girl Raising Project" },
  "AGLAEA": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/83/Time_Woven_Into_Gold.png/revision/latest/scale-to-width-down/430?cb=20241203063035", franchise:"VS Battles", abbr:"AG", color:"#1a1a2a", wiki:"vsbattles", page:"Aglaea", displayName:"Aglaea" },
  "TAPU_BULU": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/13/Sample_f0b454847ca7aef3b1cb4f7944083032.jpg/revision/latest/scale-to-width-down/600?cb=20170311212922", franchise:"VS Battles", abbr:"TA", color:"#1a1a2a", wiki:"vsbattles", page:"Tapu_Bulu", displayName:"Tapu Bulu" },
  "BASIL_OMORI": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/7e/Realbasil.png/revision/latest?cb=20230118040101", franchise:"VS Battles", abbr:"BA", color:"#1a1a2a", wiki:"vsbattles", page:"Basil_(OMORI)", displayName:"Basil (OMORI)" },
  "GANONDORF_TEARS_OF_THE_KINGDOM": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/85/GanondorfTOTK.png/revision/latest/scale-to-width-down/600?cb=20230504165728", franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Ganondorf_(Tears_of_the_Kingdom)", displayName:"Ganondorf (Tears of the Kingdom)" },
  "PATCHY_THE_PIRATE": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6c/Patchypic.png/revision/latest?cb=20180704090143", franchise:"VS Battles", abbr:"PA", color:"#1a1a2a", wiki:"vsbattles", page:"Patchy_the_Pirate", displayName:"Patchy the Pirate" },
  "PRINCESS_LUNA": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6e/Princess-Luna-Pictures-princess-luna-34772881-1280-1317.png/revision/latest/scale-to-width-down/583?cb=20151202063911", franchise:"VS Battles", abbr:"PR", color:"#1a1a2a", wiki:"vsbattles", page:"Princess_Luna", displayName:"Princess Luna" },
  "HYAKKIMARU": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/c9/Hyakkimaru_%28Manga%29.png/revision/latest?cb=20190408060838", franchise:"VS Battles", abbr:"HY", color:"#1a1a2a", wiki:"vsbattles", page:"Hyakkimaru", displayName:"Hyakkimaru" },
  "MERMAID_MAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0e/MermaidMan.png/revision/latest?cb=20190419133355", franchise:"VS Battles", abbr:"ME", color:"#1a1a2a", wiki:"vsbattles", page:"Mermaid_Man", displayName:"Mermaid Man" },
  "CITY_OF_HEROES": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/82/CoH_Homcoming_Verse_page_image.png/revision/latest/scale-to-width-down/600?cb=20240227074305", franchise:"VS Battles", abbr:"CI", color:"#1a1a2a", wiki:"vsbattles", page:"City_of_Heroes", displayName:"City of Heroes" },
  "SMAW": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6c/Mk_153_SMAW.png/revision/latest?cb=20200205154308", franchise:"VS Battles", abbr:"SM", color:"#1a1a2a", wiki:"vsbattles", page:"SMAW", displayName:"SMAW" },
  "KLEIN_MORETTI": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/b3/Moretti_Klein.webp/revision/latest/scale-to-width-down/461?cb=20250721130319", franchise:"VS Battles", abbr:"KL", color:"#1a1a2a", wiki:"vsbattles", page:"Klein_Moretti", displayName:"Klein Moretti" },
  "BUZZWOLE": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/97/Tumblr_p3h00u9TCV1tpvtc4o2_r1_500-1-.gif/revision/latest?cb=20200327043107", franchise:"VS Battles", abbr:"BU", color:"#1a1a2a", wiki:"vsbattles", page:"Buzzwole", displayName:"Buzzwole" },
  "LOLTH": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8e/LLOLLTLTLTLTTLTLTLTH.jpg/revision/latest/scale-to-width-down/489?cb=20190107013109", franchise:"VS Battles", abbr:"LO", color:"#1a1a2a", wiki:"vsbattles", page:"Lolth", displayName:"Lolth" },
  "POIPOLE": { img:"https://static.wikia.nocookie.net/vsbattles/images/e/e5/803Poipole.png/revision/latest/scale-to-width-down/600?cb=20171122003311", franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Poipole", displayName:"Poipole" },
  "KHAL_DROGO": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fa/Khal.png/revision/latest/scale-to-width-down/399?cb=20160306092048", franchise:"VS Battles", abbr:"KH", color:"#1a1a2a", wiki:"vsbattles", page:"Khal_Drogo", displayName:"Khal Drogo" },
  "CELL_MAX_ANIME": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/4c/Cell_Max.png/revision/latest/scale-to-width-down/600?cb=20250311112851", franchise:"VS Battles", abbr:"CE", color:"#1a1a2a", wiki:"vsbattles", page:"Cell_Max_(Anime)", displayName:"Cell Max (Anime)" },
  "AKAZA_KIMETSU_NO_YAIBA": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/28/Akaza_2.png/revision/latest/scale-to-width-down/329?cb=20250428151711", franchise:"VS Battles", abbr:"AK", color:"#1a1a2a", wiki:"vsbattles", page:"Akaza_(Kimetsu_no_Yaiba)", displayName:"Akaza (Kimetsu no Yaiba)" },
  "KAHHORI_MARVEL_CINEMATIC_UNIVERSE_WHAT_IF_3F": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/59/Kahhori_%28MCU-_What_If%29.png/revision/latest", franchise:"VS Battles", abbr:"KA", color:"#1a1a2a", wiki:"vsbattles", page:"Kahhori_(Marvel_Cinematic_Universe:_What_If...%3F)", displayName:"Kahhori (Marvel Cinematic Universe: What If...?)" },
  "STRIKER_HELLUVA_BOSS": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/57/Blitzhallucination.png/revision/latest/scale-to-width-down/600?cb=20230715032220", franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Striker_(Helluva_Boss)", displayName:"Striker (Helluva Boss)" },
  "PSYCHO_MANTIS": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d1/Psycho_Mantis.png/revision/latest?cb=20160306081911", franchise:"VS Battles", abbr:"PS", color:"#1a1a2a", wiki:"vsbattles", page:"Psycho_Mantis", displayName:"Psycho Mantis" },
  "BELISARIUS_CAWL": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/23/Cawl.png/revision/latest/scale-to-width-down/380?cb=20190605164910", franchise:"VS Battles", abbr:"BE", color:"#1a1a2a", wiki:"vsbattles", page:"Belisarius_Cawl", displayName:"Belisarius Cawl" },
  "KEYBLADE": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/30/Kingdom_Key_KH.png/revision/latest?cb=20160528032512", franchise:"VS Battles", abbr:"KE", color:"#1a1a2a", wiki:"vsbattles", page:"Keyblade", displayName:"Keyblade" },
  "DHALSIM": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/31/Dhalsim_ssf4.png/revision/latest/scale-to-width-down/539?cb=20160612133957", franchise:"VS Battles", abbr:"DH", color:"#1a1a2a", wiki:"vsbattles", page:"Dhalsim", displayName:"Dhalsim" },
  "HAJIME_KASHIMO": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/da/Kashimo.png/revision/latest/scale-to-width-down/387?cb=20230312002747", franchise:"VS Battles", abbr:"HA", color:"#1a1a2a", wiki:"vsbattles", page:"Hajime_Kashimo", displayName:"Hajime Kashimo" },
  "HIROMI_HIGURUMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/f/fb/Filters_quality%2895%29format%28webp%29_%282%29.webp/revision/latest/scale-to-width-down/411?cb=20260203222129", franchise:"VS Battles", abbr:"HI", color:"#1a1a2a", wiki:"vsbattles", page:"Hiromi_Higuruma", displayName:"Hiromi Higuruma" },
  "ARLECCHINO": { img:"https://static.wikia.nocookie.net/vsbattles/images/3/37/Arlecchino_Portrait.png/revision/latest/scale-to-width-down/389?cb=20250224012621", franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Arlecchino", displayName:"Arlecchino" },
  "HENRY_EMILY": { img:"https://static.wikia.nocookie.net/vsbattles/images/7/79/HenryEmilyImage1.webp/revision/latest?cb=20250225113003", franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Henry_Emily", displayName:"Henry Emily" },
  "PEPSIMAN_PS1": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1d/PepsimanArtworkPSX.jpg/revision/latest?cb=20240902235344", franchise:"VS Battles", abbr:"PE", color:"#1a1a2a", wiki:"vsbattles", page:"Pepsiman_(PS1)", displayName:"Pepsiman (PS1)" },
  "GREGOR_CLEGANE": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/be/Gregor_Clegane.png/revision/latest/scale-to-width-down/440?cb=20220216214946", franchise:"VS Battles", abbr:"GR", color:"#1a1a2a", wiki:"vsbattles", page:"Gregor_Clegane", displayName:"Gregor Clegane" },
  "KURUMI_TOKISAKI": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a3/Kurumi2.png/revision/latest/scale-to-width-down/600?cb=20250309091232", franchise:"VS Battles", abbr:"KU", color:"#1a1a2a", wiki:"vsbattles", page:"Kurumi_Tokisaki", displayName:"Kurumi Tokisaki" },
  "DISCORD_MY_LITTLE_PONY": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/42/Scots_Discord.png/revision/latest/scale-to-width-down/452?cb=20190415204823", franchise:"VS Battles", abbr:"DI", color:"#1a1a2a", wiki:"vsbattles", page:"Discord_(My_Little_Pony)", displayName:"Discord (My Little Pony)" },
  "MR_BURNS": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/2c/Videotogif_2017.11.24_21.11.02.gif/revision/latest?cb=20171125003546", franchise:"VS Battles", abbr:"MR", color:"#1a1a2a", wiki:"vsbattles", page:"Mr._Burns", displayName:"Mr. Burns" },
  "KI_ADI_MUNDI": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/64/Mundi_full_body.png/revision/latest/scale-to-width-down/244?cb=20180208165525", franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Ki-Adi-Mundi", displayName:"Ki-Adi-Mundi" },
  "THE_G_MAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/41/GmanHL1.png/revision/latest/scale-to-width-down/215?cb=20251122015834", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_G-Man", displayName:"The G-Man" },
  "BLONDE_BLAZER": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/67/Dossier_Blonde_Blazer_-_Dispatch.png/revision/latest/scale-to-width-down/600?cb=20251114215158", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Blonde_Blazer", displayName:"Blonde Blazer" },
  "JEWELRY_BONNEY": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/97/Jewelry_Bonney.png/revision/latest?cb=20190212171834", franchise:"VS Battles", abbr:"JE", color:"#1a1a2a", wiki:"vsbattles", page:"Jewelry_Bonney", displayName:"Jewelry Bonney" },
  "RABBID_NORMAL": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/1a/Early_Rabbid.png/revision/latest/scale-to-width-down/322?cb=20200305005323", franchise:"VS Battles", abbr:"RA", color:"#1a1a2a", wiki:"vsbattles", page:"Rabbid_(Normal)", displayName:"Rabbid (Normal)" },
  "BLACK_KNIGHT_MARVEL_COMICS": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/5c/Black_Knight_Marvel_XP.png/revision/latest?cb=20170806002804", franchise:"VS Battles", abbr:"BL", color:"#1a1a2a", wiki:"vsbattles", page:"Black_Knight_(Marvel_Comics)", displayName:"Black Knight (Marvel Comics)" },
  "SHINICHI_IZUMI": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d8/Shinichi_Izumi_Post_Timeskip_Render.webp/revision/latest/scale-to-width-down/191?cb=20251103143857", franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shinichi_Izumi", displayName:"Shinichi Izumi" },
  "POCO": { img:"https://static.wikia.nocookie.net/vsbattles/images/1/15/Poco_Skin-Default2.webp/revision/latest/scale-to-width-down/562?cb=20230714215903", franchise:"VS Battles", abbr:"PO", color:"#1a1a2a", wiki:"vsbattles", page:"Poco", displayName:"Poco" },
  "AMETHYST_STEVEN_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/57/Amethtstnew.png/revision/latest/scale-to-width-down/436?cb=20190122052515", franchise:"VS Battles", abbr:"AM", color:"#1a1a2a", wiki:"vsbattles", page:"Amethyst_(Steven_Universe)", displayName:"Amethyst (Steven Universe)" },
  "DAGOTH_UR": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a3/DagothMorrowind.png/revision/latest/scale-to-width-down/360?cb=20181212174246", franchise:"VS Battles", abbr:"DA", color:"#1a1a2a", wiki:"vsbattles", page:"Dagoth_Ur", displayName:"Dagoth Ur" },
  "BOOTHILL": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a0/Sailing_Towards_a_Second_Life.png/revision/latest/scale-to-width-down/430?cb=20240918091800", franchise:"VS Battles", abbr:"BO", color:"#1a1a2a", wiki:"vsbattles", page:"Boothill", displayName:"Boothill" },
  "MIU_IRUMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/d/d8/Danganronpa_V3_Miu_Iruma_Fullbody_Spritee.png/revision/latest/scale-to-width-down/237?cb=20210103161815", franchise:"VS Battles", abbr:"MI", color:"#1a1a2a", wiki:"vsbattles", page:"Miu_Iruma", displayName:"Miu Iruma" },
  "IMOTEKH_THE_STORMLORD": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/48/Imotekh_the_Stormlord.png/revision/latest/scale-to-width-down/437?cb=20190923083915", franchise:"VS Battles", abbr:"IM", color:"#1a1a2a", wiki:"vsbattles", page:"Imotekh_the_Stormlord", displayName:"Imotekh the Stormlord" },
  "NICOL_BOLAS": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9d/6ax4icpl8d711.png/revision/latest/scale-to-width-down/600?cb=20190702165932", franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nicol_Bolas", displayName:"Nicol Bolas" },
  "ALLIGATOR_LOKI": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/9e/AlligatorLoki.png/revision/latest?cb=20250102205904", franchise:"VS Battles", abbr:"AL", color:"#1a1a2a", wiki:"vsbattles", page:"Alligator_Loki", displayName:"Alligator Loki" },
  "ANAXA": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/42/Life_Should_Be_Cast_to_Flames.png/revision/latest/scale-to-width-down/430?cb=20250924205455", franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Anaxa", displayName:"Anaxa" },
  "ARJUNA_FATE": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/89/AgniGandiva.png/revision/latest/scale-to-width-down/543?cb=20180320140113", franchise:"VS Battles", abbr:"AR", color:"#1a1a2a", wiki:"vsbattles", page:"Arjuna_(Fate)", displayName:"Arjuna (Fate)" },
  "CHAIN_CHOMP": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/96/The_Chain_Chomp.png/revision/latest/scale-to-width-down/600?cb=20201005010731", franchise:"VS Battles", abbr:"CH", color:"#1a1a2a", wiki:"vsbattles", page:"Chain_Chomp", displayName:"Chain Chomp" },
  "BRUNO_MADRIGAL": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/aa/Bruno_Madrigal_Render.png/revision/latest?cb=20220127211650", franchise:"VS Battles", abbr:"BR", color:"#1a1a2a", wiki:"vsbattles", page:"Bruno_Madrigal", displayName:"Bruno Madrigal" },
  "PHAINON": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8d/Character_Phainon_Portrait.webp/revision/latest/scale-to-width-down/401?cb=20250731221025", franchise:"VS Battles", abbr:"PH", color:"#1a1a2a", wiki:"vsbattles", page:"Phainon", displayName:"Phainon" },
  "CASSIE_CAGE_SECOND_TIMELINE": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/64/Cassieeeeeee.png/revision/latest/scale-to-width-down/400?cb=20190307141317", franchise:"VS Battles", abbr:"CA", color:"#1a1a2a", wiki:"vsbattles", page:"Cassie_Cage_(Second_Timeline)", displayName:"Cassie Cage (Second Timeline)" },
  "JINGLIU": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8a/Jingliu.png/revision/latest/scale-to-width-down/431?cb=20230831083856", franchise:"VS Battles", abbr:"JI", color:"#1a1a2a", wiki:"vsbattles", page:"Jingliu", displayName:"Jingliu" },
  "STRAHD_VON_ZAROVICH": { img:"https://static.wikia.nocookie.net/vsbattles/images/4/46/Strahd1e.jpg/revision/latest?cb=20190225083945", franchise:"VS Battles", abbr:"ST", color:"#1a1a2a", wiki:"vsbattles", page:"Strahd_von_Zarovich", displayName:"Strahd von Zarovich" },
  "SHUMA_GORATH": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/86/Shuma-Gorath_%28Marvel_Comics%29_V2.png/revision/latest/scale-to-width-down/346?cb=20220418095411", franchise:"VS Battles", abbr:"SH", color:"#1a1a2a", wiki:"vsbattles", page:"Shuma-Gorath", displayName:"Shuma-Gorath" },
  "THE_THOUGHT_ROBOT": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/95/ThoughtRobotRender.png/revision/latest/scale-to-width-down/500?cb=20190721230929", franchise:"VS Battles", abbr:"TH", color:"#1a1a2a", wiki:"vsbattles", page:"The_Thought_Robot", displayName:"The Thought Robot" },
  "GHOST_GAME_OF_THRONES": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/62/GGoT.png/revision/latest/scale-to-width-down/600?cb=20250611060815", franchise:"VS Battles", abbr:"GH", color:"#1a1a2a", wiki:"vsbattles", page:"Ghost_(Game_of_Thrones)", displayName:"Ghost (Game of Thrones)" },
  "KILLER_ONE_PIECE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/0c/Killer._%28PreTimeskip%29_%28Original%29.png/revision/latest/scale-to-width-down/231?cb=20220406033805", franchise:"VS Battles", abbr:"KI", color:"#1a1a2a", wiki:"vsbattles", page:"Killer_(One_Piece)", displayName:"Killer (One Piece)" },
  "SALLY_ACORN_ARCHIE_POST_GENESIS_WAVE": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/00/Sally_Acorn_PSGW.png/revision/latest/scale-to-width-down/400?cb=20210602173357", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sally_Acorn_(Archie_Post-Genesis_Wave)", displayName:"Sally Acorn (Archie Post-Genesis Wave)" },
  "HELMUT_ZEMO_MARVEL_CINEMATIC_UNIVERSE": { img:"https://static.wikia.nocookie.net/vsbattles/images/5/51/Helmet_Zemo.jpg/revision/latest/scale-to-width-down/351?cb=20161201183952", franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Helmut_Zemo_(Marvel_Cinematic_Universe)", displayName:"Helmut Zemo (Marvel Cinematic Universe)" },
  "SALLY_ACORN_ARCHIE_PRE_GENESIS_WAVE": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/ab/OG_Archie_Sally_Acorn.png/revision/latest/scale-to-width-down/316?cb=20220331062707", franchise:"VS Battles", abbr:"SA", color:"#1a1a2a", wiki:"vsbattles", page:"Sally_Acorn_(Archie_Pre-Genesis_Wave)", displayName:"Sally Acorn (Archie Pre-Genesis Wave)" },
  "ANGEWOMON": { img:"https://static.wikia.nocookie.net/vsbattles/images/0/06/Angewomon_New_Century.png/revision/latest/scale-to-width-down/600?cb=20200629020602", franchise:"VS Battles", abbr:"AN", color:"#1a1a2a", wiki:"vsbattles", page:"Angewomon", displayName:"Angewomon" },
  "LUNA_SNOW_MARVEL_RIVALS": { img:"https://static.wikia.nocookie.net/vsbattles/images/b/ba/Luna_Snow_-_Default_Skin.webp/revision/latest?cb=20250224174826", franchise:"VS Battles", abbr:"LU", color:"#1a1a2a", wiki:"vsbattles", page:"Luna_Snow_(Marvel_Rivals)", displayName:"Luna Snow (Marvel Rivals)" },
  "GABRIEL_MALIGNANT": { img:"https://static.wikia.nocookie.net/vsbattles/images/c/ca/GabrielBlade.png/revision/latest/scale-to-width-down/440?cb=20211226160242", franchise:"VS Battles", abbr:"GA", color:"#1a1a2a", wiki:"vsbattles", page:"Gabriel_(Malignant)", displayName:"Gabriel (Malignant)" },
  "NEOPOLITAN": { img:"https://static.wikia.nocookie.net/vsbattles/images/a/a4/Neo_Politan_%28BlazBlue_Cross_Tag_Battle%2C_Character_Select_Artwork%29.png/revision/latest/scale-to-width-down/292?cb=20190829233133", franchise:"VS Battles", abbr:"NE", color:"#1a1a2a", wiki:"vsbattles", page:"Neopolitan", displayName:"Neopolitan" },
  "JACK_HANMA": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/8d/Jack_Hanma.jpg/revision/latest/scale-to-width-down/375?cb=20181011200009", franchise:"VS Battles", abbr:"JA", color:"#1a1a2a", wiki:"vsbattles", page:"Jack_Hanma", displayName:"Jack Hanma" },
  "NANACHI": { img:"https://static.wikia.nocookie.net/vsbattles/images/8/82/Nanachi.png/revision/latest/scale-to-width-down/316?cb=20220923072745", franchise:"VS Battles", abbr:"NA", color:"#1a1a2a", wiki:"vsbattles", page:"Nanachi", displayName:"Nanachi" },
  "NIKOLA_TESLA_RECORD_OF_RAGNAROK": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/2a/TeslaRoR.png/revision/latest/scale-to-width-down/328?cb=20230329132113", franchise:"VS Battles", abbr:"NI", color:"#1a1a2a", wiki:"vsbattles", page:"Nikola_Tesla_(Record_of_Ragnarok)", displayName:"Nikola Tesla (Record of Ragnarok)" },
  "HERMES_EPIC_THE_MUSICAL": { img:"https://static.wikia.nocookie.net/vsbattles/images/9/94/HermesEPIC.png/revision/latest/scale-to-width-down/600?cb=20241109054315", franchise:"VS Battles", abbr:"HE", color:"#1a1a2a", wiki:"vsbattles", page:"Hermes_(EPIC:_The_Musical)", displayName:"Hermes (EPIC: The Musical)" },
  "ERRON_BLACK": { img:"https://static.wikia.nocookie.net/vsbattles/images/2/2a/Erronblack_tn.png/revision/latest/scale-to-width-down/600?cb=20190313053718", franchise:"VS Battles", abbr:"ER", color:"#1a1a2a", wiki:"vsbattles", page:"Erron_Black", displayName:"Erron Black" },
  "IBUKI_MIODA": { img:"https://static.wikia.nocookie.net/vsbattles/images/6/6d/Ibuki_Mioda_Illustration.png/revision/latest/scale-to-width-down/600?cb=20210818085752", franchise:"VS Battles", abbr:"IB", color:"#1a1a2a", wiki:"vsbattles", page:"Ibuki_Mioda", displayName:"Ibuki Mioda" }

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
  const isCDN = r?.img && r.img.includes('wikia.nocookie.net');
  const [src, setSrc] = useState(() => {
    // Local files (/goku.png etc) work fine directly
    if (!r) return null;
    if (r.img && !isCDN) return r.img;
    const key = `${r.wiki}::${r.page}`;
    return IMG_CACHE[key] || null;
  });

  useEffect(() => {
    if (!r) return;
    // Local file - no fetch needed
    if (r.img && !isCDN) return;
    // Need to fetch via API (CDN URLs or wiki-only entries)
    if (!r.wiki) return;
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
const ALL_FIGHTERS_ALPHA = ["Aglaea", "Akaza (Kimetsu no Yaiba)", "Akuma", "Alabai", "Alcina Dimitrescu", "Alien X", "Alligator Loki", "Amaterasu", "Amethyst (Steven Universe)", "Ammit (Marvel Cinematic Universe)", "Anaxa", "Andrew Hussie", "Angewomon", "Arjuna (Fate)", "Arlecchino", "Articuno", "Askeladd", "Astra (Valorant)", "Atsuya Kusakabe", "Augusta (Wuthering Waves)", "Aventurine", "Ball (Basket and Ball)", "Barnacle Boy", "Basil (OMORI)", "Batman", "Belisarius Cawl", "Bellatrix Lestrange", "Bender", "Beta Ray Bill", "Blacephalon", "Black Knight (Marvel Comics)", "Black Swan", "Bling-Bling Boy", "Blonde Blazer", "Blue Archive", "Boothill", "Boyfriend", "Broly", "Bruno Madrigal", "Buzzwole", "Cammy White", "Captain America", "Captain Hook (Disney)", "Captain Phasma", "Cartethyia", "Cassie Cage (Second Timeline)", "Castorice", "Cell Max (Anime)", "Cerydra", "Chain Chomp", "Charlie Dompler (Smiling Friends)", "Charlie Morningstar", "Choso", "Chun-Li", "Cipher", "City of Heroes", "Claptrap (Borderlands)", "Clea (Marvel Comics)", "Cyno", "Cyrene", "Daeodon", "Dagoth Ur", "Dale Gribble", "Dante", "Denji (Chainsaw Man)", "Destoroyah", "Dexter Lumis (WWE)", "Dhalsim", "Discord (My Little Pony)", "Distortus Rex", "Doey the Doughman", "Doomguy", "Doorman (Marvel Comics)", "Dracovish", "Dracozolt", "Duncan the Tall (A Song of Ice and Fire)", "Edward Elric", "Ellie (The Last of Us)", "Empress of Light", "Eragon", "Erron Black", "Euron Greyjoy (A Song of Ice and Fire)", "Fire Spirit Cookie", "GUNTHER (WWE)", "Gabimaru the Hollow", "Gabriel (Malignant)", "Galadriel", "Galbrena", "Ganondorf (Tears of the Kingdom)", "Ghost (Game of Thrones)", "Giyu Tomioka", "Glamrock Chica", "Glep (Smiling Friends)", "Gohan", "Goomba", "Gorr the God Butcher (Marvel Cinematic Universe)", "Gorr the God Butcher (Marvel Comics)", "Grayson Waller (WWE)", "Gregor Clegane", "Guest 1337 (The Last Guest)", "Hajime Kashimo", "Harley Quinn", "Haru Urara", "Harvey Harvington", "Helmut Zemo (Marvel Cinematic Universe)", "Henry Emily", "Hermes (EPIC: The Musical)", "Hilichurl", "Hiromi Higuruma", "Huey Freeman", "Hyakkimaru", "Ibuki Mioda", "Imotekh the Stormlord", "Ippo Makunouchi", "Ivy Valentine", "Jack Hanma", "Jaqen H%27ghar", "Jaqen H'ghar", "Jeff the Land Shark", "Jevil", "Jewelry Bonney", "Jill Valentine", "Jin Kazama", "Jing Yuan", "Jingliu", "Jiyan (Wuthering Waves)", "John Price", "Kaeya Alberich", "Kahhori", "Kahhori (Marvel Cinematic Universe: What If...%3F)", "Kai Parker", "Kamen Rider ZX", "Kanao Tsuyuri", "Kang Sae-byeok", "Karl Heisenberg", "Kate Bishop (Marvel Cinematic Universe)", "Kenjaku", "Keyblade", "Khal Drogo", "Ki-Adi-Mundi", "Killer (One Piece)", "King K. Rool", "Kingler", "Kirby", "Klein Moretti", "Koopa Troopa", "Kotal Kahn (Second Timeline)", "Kratos", "Krypto the Superdog (Post Crisis)", "Kurumi Tokisaki", "Kyoka Jiro (Earphone Jack)", "Lancer (Deltarune)", "Leon (Brawl Stars)", "Leon S. Kennedy", "Lex Luthor", "Liberty Prime", "Link (Tears of the Kingdom)", "Link (Twilight Princess)", "Lolth", "Loona (Helluva Boss)", "Lucius Zogratis", "Luffy", "Luna Snow (Marvel Rivals)", "Magical Girl Raising Project", "Majin Duu", "Maki Zenin", "Makima", "Malevola", "Manjiro Sano", "Marauder (DOOM)", "March 7th", "Marx (Kirby)", "Mash Burnedead", "Master Chief", "Mavuika", "Mechagodzilla (MonsterVerse)", "Meguru Bachira", "Mermaid Man", "Miguel Oduol", "Mike (Deltarune)", "Minerva McGonagall", "Miranda (Resident Evil)", "Miu Iruma", "Moon Knight", "Morgoth", "Mr. Burns", "Mydei", "Nahida", "Nam-gyu", "Nanachi", "Naruto", "Nathan Drake", "Neopolitan", "Neuvillette", "Nick Wilde", "Nicol Bolas", "Nikola Tesla (Record of Ragnarok)", "Nobara Kugisaki", "Obanai Iguro", "Oberyn Martell (A Song of Ice and Fire)", "Oguri Cap", "Okarun", "Omen (Valorant)", "One (Battle for Dream Island)", "Panda (Jujutsu Kaisen)", "Papyrus", "Patchy the Pirate", "Pepsiman (PS1)", "Percival (Four Knights of The Apocalypse)", "Phainon", "Phrolova", "Piccolo", "Poco", "Poipole", "Pokio", "Polka Dot Man (DC Extended Universe)", "Princess Luna", "Princess Peach", "Psycho Mantis", "Psylocke", "Qin Shi Huang (Record of Ragnarok)", "Qu", "Rabbid (Normal)", "Ramona Flowers", "Rei Ayanami", "Rensuke Kunigami", "Rey Skywalker", "Rimuru Tempest (Light Novel)", "Rose Quartz", "Rouxls Kaard", "Rumi (KPop Demon Hunters)", "Ryomen Sukuna", "Ryu", "Ryuk", "SMAW", "Sailor Pluto (Manga)", "Saitama", "Sally Acorn (Archie Post-Genesis Wave)", "Sally Acorn (Archie Pre-Genesis Wave)", "Sandy Cheeks", "Sassy the Sasquatch", "Satoru Gojo", "Scorpion", "Scourge the Hedgehog", "Senju Kawaragi", "Seong Gi-hun", "Seraphim (One Piece)", "Shaggy Rogers", "Shinichi Izumi", "Shizuku Murasaki", "Shuma-Gorath", "Sid (Ice Age)", "Siegfried", "Skar King", "Sol Badguy", "Son Goku", "Son Goku (DBS Anime)", "Son Goku (DBS Manga)", "Son Goku (Dragon Ball)", "St. Jaygarcia Saturn", "Stan Marsh", "Storm", "Strahd von Zarovich", "Striker (Helluva Boss)", "Suguru Geto", "Superman", "Tapu Bulu", "Tariq St. Patrick", "Tarre Vizsla", "Tenka Izumo", "Thanos (Squid Game)", "The Collector (The Owl House)", "The Dredge", "The Elden Beast", "The G-Man", "The Living Tribunal", "The Roaring Knight", "The Thought Robot", "The Undertaker", "Vegeta", "Venom", "Voldo", "Wolverine"].sort((a,b)=>a.localeCompare(b));

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
  const [linkCopied, setLinkCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  }

  function handleGridSelect(key) {
    if (key === "__FIND__") { setModalSide(activeSide); setShowModal(true); return; }
    if (key === "__RANDOM__") {
      const keys = Object.keys(ROSTER);
      const rk1 = keys[Math.floor(Math.random()*keys.length)];
      const rk2 = keys[Math.floor(Math.random()*keys.length)];
      setAlpha1v1(rk1); setBravo1v1(rk2);
      setBattle(false);
      return;
    }
    // Route to active side
    if (activeSide === "alpha") setAlpha1v1(key);
    else setBravo1v1(key);
    setBattle(false);
  }

  function handleFindSelect(name) {
    // Check if this is one of the original roster fighters
    const ORIGINAL_ROSTER = {"Son Goku": "GOKU", "Naruto": "NARUTO", "Superman": "SUPERMAN", "Luffy": "LUFFY", "Kratos": "KRATOS", "Dante": "DANTE", "Doomguy": "DOOM_SLAYER", "Master Chief": "MASTER_CHIEF", "Ryu": "RYU", "Jin Kazama": "JIN_KAZAMA", "Sol Badguy": "SOL_BADGUY", "Kirby": "KIRBY", "Scorpion": "SCORPION", "Shaggy Rogers": "SHAGGY", "Broly": "BROLY", "Psylocke": "PSYLOCKE", "Wolverine": "WOLVERINE", "Vegeta": "VEGETA", "Captain America": "CAP_AMERICA", "Chun-Li": "CHUN_LI", "Moon Knight": "MOON_KNIGHT", "Piccolo": "PICCOLO", "Storm": "STORM", "Siegfried": "SIEGFRIED", "Batman": "BATMAN", "Cammy White": "CAMMY", "Akuma": "AKUMA", "Amaterasu": "AMATERASU", "Voldo": "VOLDO", "Harley Quinn": "HARLEY_QUINN", "Gohan": "GOHAN", "Ivy Valentine": "IVY", "Lex Luthor": "LEX_LUTHOR", "Venom": "VENOM", "Dale Gribble": "DALE_GRIBBLE"};
    const originalKey = ORIGINAL_ROSTER[name];
    if (originalKey) {
      if (modalSide === "alpha") setAlpha1v1(originalKey);
      else setBravo1v1(originalKey);
      setBattle(false);
      return;
    }
    // Auto-generated fighter
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

      {/* Share Results bottom bar — only shown after battle */}
      {battleStarted && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:90,
          background:"#000000", borderTop:"1px solid #8B8B8A",
          display:"flex", justifyContent:"center", alignItems:"center",
          padding:"10px 16px", gap:16, height:80,
        }}>
          <button onClick={handleShare} style={{
            width:290, height:60, background:"none",
            border:"1px solid #ffffff", cursor:"pointer",
            fontFamily:"'Teko',sans-serif", fontWeight:600, fontSize:24,
            letterSpacing:"0.04em", textTransform:"uppercase", color:"#ffffff",
            transition:"background 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}
          >
            {linkCopied ? "LINK COPIED" : "SHARE RESULTS"}
          </button>
          <button onClick={()=>{ setBattle(false); setLinkCopied(false); }} style={{
            width:290, height:60,
            background:"linear-gradient(90deg,#FF0030 0.97%,#700015 99.3%)",
            border:"none", cursor:"pointer",
            fontFamily:"'Teko',sans-serif", fontWeight:600, fontSize:24,
            letterSpacing:"0.04em", textTransform:"uppercase", color:"#ffffff",
            transition:"opacity 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >
            START NEW BATTLE
          </button>
        </div>
      )}
      {battleStarted && <div style={{ height:96 }} />}

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
// Maps full wiki names used in ROSTER displayNames to short names used in the lookup DB
const LOOKUP_NAME_MAP = {
  "Naruto Uzumaki (Part II: Pre-War Arc)": "Naruto",
  "Monkey D. Luffy (Post-Timeskip)": "Luffy",
  "Dante (Devil May Cry)": "Dante",
  "Hanzo Hasashi (Second Timeline)": "Scorpion",
  "Shaggy Rogers (Cartoon)": "Shaggy Rogers",
  "Captain America (Marvel Comics)": "Captain America",
  "Moon Knight (Modern)": "Moon Knight",
  "Piccolo (Dragon Ball)": "Piccolo",
  "Storm (Marvel Comics)": "Storm",
  "Siegfried (Soul Calibur)": "Siegfried",
  "Akuma (Street Fighter)": "Akuma",
  "Harley Quinn (Post-Crisis)": "Harley Quinn",
  "Son Gohan (Dragon Ball Z)": "Gohan",
  "Lex Luthor (DC Universe)": "Lex Luthor",
  "Venom (Edward Brock)": "Venom",
  "Kahhori (Marvel Cinematic Universe: What If...?)": "Kahhori",
};

function normalizeName(name) {
  return LOOKUP_NAME_MAP[name] || name;
}

function lookupOutcome(a, b) {
  if (!OUTCOMES_DB) return null;
  const na = normalizeName(a);
  const nb = normalizeName(b);
  // Try exact match first
  const exact = OUTCOMES_DB[`${na}__vs__${nb}`] || OUTCOMES_DB[`${nb}__vs__${na}`];
  if (exact) return exact;
  // Case-insensitive fallback
  const k1 = `${na}__vs__${nb}`.toLowerCase();
  const k2 = `${nb}__vs__${na}`.toLowerCase();
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
    </div>
  );
}
