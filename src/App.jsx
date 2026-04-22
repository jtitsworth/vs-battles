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
   DESIGN TOKENS — VS Battles Figma reskin
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
   Computes any 1v1 or 2v2 matchup from stats
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
  "2v2": {
    id:"2v2", type:"2v2",
    alpha:{ name:"ALPHA", label:"TEAM ALPHA", prob:"64%", fighters:[
      { name:"GOKU",   rosterKey:"GOKU",   stat:{ label:"POWER LEVEL",      val:"OVER 9000", pct:98 } },
      { name:"NARUTO", rosterKey:"NARUTO", stat:{ label:"CHAKRA POTENTIAL", val:"S-RANK",    pct:92 } },
    ]},
    bravo:{ name:"BRAVO", label:"TEAM BRAVO", prob:"36%", fighters:[
      { name:"SUPERMAN", rosterKey:"SUPERMAN", stat:{ label:"SOLAR ABSORPTION", val:"MAXIMUM",  pct:95 } },
      { name:"LUFFY",    rosterKey:"LUFFY",    stat:{ label:"GEAR FIFTH POWER", val:"REALITY+", pct:88 } },
    ]},
    stats:[
      { label:"STRENGTH",               alpha:183, bravo:181, winner:"alpha", alphaVal:"183.0", bravoVal:"181.0" },
      { label:"INTELLIGENCE / TACTICS", alpha:150, bravo:150, winner:"draw",  alphaVal:"150.0", bravoVal:"150.0" },
      { label:"VERSATILITY / ARSENAL",  alpha:187, bravo:142, winner:"alpha", alphaVal:"187.0", bravoVal:"142.0" },
    ],
    projection:{ winner:"ALPHA WIN", reliability:"64.0%", reason:"Goku and Naruto's combat synergy is nearly telepathic." },
    rounds:[
      { title:"TEAM TACTICS",        winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Goku engages Superman while Naruto floods the field.", reasoning:"Instinctive teamwork overwhelms Team Bravo." },
      { title:"GEAR FIFTH CHAOS",    winner:"TEAM BRAVO", winTeam:"bravo", narrative:"Luffy activates Gear Fifth — the battlefield warps.", reasoning:"Gear Fifth chaos disrupts Naruto's tactical plans." },
      { title:"DUAL TRANSFORMATION", winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Goku hits Ultra Instinct while Naruto ignites Baryon Mode.", reasoning:"Simultaneous peak transformations overwhelm Team Bravo." },
      { title:"FINAL STAND",         winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Combined Kamehameha-Rasenshuriken finishes it.", reasoning:"Instant Transmission + clone tactics creates an unstoppable finish." },
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
  { id:"r2", type:"2v2", time:"19:12 UTC", winnerColor:"alpha", winner:{ name:"ALPHA SYNDICATE", sub:"Team Alpha" }, fighters:[{ name:"GOKU", rosterKey:"GOKU" },{ name:"NARUTO", rosterKey:"NARUTO" }], losers:[{ rosterKey:"SUPERMAN" },{ rosterKey:"LUFFY" }], loserName:"TEAM_BRAVO" },
  { id:"r3", type:"1v1", time:"12:15 UTC", winnerColor:"bravo", winner:{ name:"LUFFY", sub:"Team Bravo", rosterKey:"LUFFY", pct:72 }, loser:{ name:"NARUTO", rosterKey:"NARUTO" } },
  { id:"r4", type:"1v1", time:"08:44 UTC", winnerColor:"alpha", winner:{ name:"NARUTO", sub:"Team Alpha", rosterKey:"NARUTO", pct:85 }, loser:{ name:"LUFFY", rosterKey:"LUFFY" } },
];
const RECENT_P2 = [
  { id:"p2a", type:"1v1", time:"23:10 UTC", winnerColor:"alpha", winner:{ name:"KRATOS", sub:"Combatant Alpha", rosterKey:"KRATOS", pct:91 }, loser:{ name:"DANTE", rosterKey:"DANTE" } },
  { id:"p2b", type:"2v2", time:"22:05 UTC", winnerColor:"bravo", winner:{ name:"DOOM PACT", sub:"Team Bravo" }, fighters:[{ name:"DOOM SLAYER", rosterKey:"DOOM_SLAYER" },{ name:"MASTER CHIEF", rosterKey:"MASTER_CHIEF" }], losers:[{ rosterKey:"RYU" },{ rosterKey:"JIN_KAZAMA" }], loserName:"STREET_TEKKEN" },
  { id:"p2c", type:"1v1", time:"18:30 UTC", winnerColor:"alpha", winner:{ name:"SOL BADGUY", sub:"Combatant Alpha", rosterKey:"SOL_BADGUY", pct:78 }, loser:{ name:"SCORPION", rosterKey:"SCORPION" } },
  { id:"p2d", type:"1v1", time:"16:55 UTC", winnerColor:"bravo", winner:{ name:"SHAGGY", sub:"Combatant Beta", rosterKey:"SHAGGY", pct:99 }, loser:{ name:"KIRBY", rosterKey:"KIRBY" } },
  { id:"p2e", type:"1v1", time:"14:22 UTC", winnerColor:"alpha", winner:{ name:"MASTER CHIEF", sub:"Combatant Alpha", rosterKey:"MASTER_CHIEF", pct:67 }, loser:{ name:"DOOM SLAYER", rosterKey:"DOOM_SLAYER" } },
  { id:"p2f", type:"2v2", time:"11:48 UTC", winnerColor:"alpha", winner:{ name:"WARRIOR PACT", sub:"Team Alpha" }, fighters:[{ name:"KRATOS", rosterKey:"KRATOS" },{ name:"SOL BADGUY", rosterKey:"SOL_BADGUY" }], losers:[{ rosterKey:"SCORPION" },{ rosterKey:"SHAGGY" }], loserName:"CHAOS_UNIT" },
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
    { key:"recent",   label:"RECENT BATTLES" },
    { key:"rankings", label:"RANKINGS" },
  ];
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(6,6,8,0.95)", backdropFilter:"blur(12px)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",
      height:52, display:"flex", alignItems:"center", padding:"0 24px", gap:24 }}>
      {/* Logo — VS BATTLES in Zen Dots with skew */}
      <div onClick={()=>setPage("arena")} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", flexShrink:0 }}>
        <span style={{ fontFamily:"'Zen Dots',sans-serif", fontSize:22, fontWeight:400,
          color:"#fff", transform:"matrix(1,0,-0.23,0.97,0,0)", display:"inline-block",
          lineHeight:"38px", whiteSpace:"nowrap" }}>VS BATTLES</span>
      </div>

      {/* Nav links — centered */}
      <div style={{ flex:1, display:"flex", justifyContent:"center", gap:44 }}>
        {links.map(l=>{
          const active = page===l.key;
          return (
            <button key={l.key} onClick={()=>setPage(l.key)}
              style={{ fontFamily:"'Zen Dots',sans-serif", fontSize:16, fontWeight:400,
                lineHeight:"19px", background:"none", border:"none", cursor:"pointer",
                color: active ? "#fff" : "#DAD9D9",
                borderBottom: active ? "2px solid #FF003C" : "2px solid transparent",
                paddingBottom:4, paddingTop:22, transition:"color 0.2s" }}>
              {l.label}
            </button>
          );
        })}
      </div>

      <div style={{ width:80 }} />
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
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.boxShadow="0 4px 20px #fff8"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.boxShadow="none"; }}>
        <span style={{ fontSize:26 }}>?</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700,
          color:C.mutedLight, letterSpacing:"0.08em" }}>RANDOM</span>
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
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.boxShadow="0 4px 20px #fff8"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.boxShadow="none"; }}>
        <span style={{ fontSize:22 }}>🔍</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700,
          color:C.mutedLight, letterSpacing:"0.08em" }}>FIND FIGHTER</span>
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

  const boxShadow = isSelAlpha ? `0 4px 20px ${C.alpha}`
    : isSelBravo ? `0 4px 20px ${C.bravo}`
    : hovered ? "0 4px 20px #ffffff"
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
        {/* Franchise tag — overlaid on image bottom-left */}
        <div style={{ position:"absolute", bottom:0, left:0, zIndex:3,
          background:"#4D4D4C", padding:"2px 6px" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600,
            color:"#fff", letterSpacing:"0.06em" }}>{r.franchise||""}</span>
        </div>
      </div>

      {/* Name area below image */}
      <div style={{ padding:"4px 6px 5px", background:"#000" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700,
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

/* ─────────────────────────────────────────────
   SUMMON FIGHTER MODAL
───────────────────────────────────────────── */
function SummonModal({ onClose, onAdd }) {
  const [query, setQuery] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.8)",
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#1a1a22", border:"1px solid rgba(255,255,255,0.1)",
        width:"min(480px,90vw)", padding:32, position:"relative" }}>
        {/* Close */}
        <button onClick={onClose}
          style={{ position:"absolute", top:16, right:16, background:"none", border:"none",
            color:C.mutedLight, fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>

        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900,
          textTransform:"uppercase", letterSpacing:"0.06em", color:C.onSurface, margin:"0 0 10px" }}>
          SUMMON NEW FIGHTER
        </h2>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, color:C.mutedLight,
          margin:"0 0 24px", lineHeight:1.5 }}>
          Enter the name of any character to summon them into the VS Battle.
        </p>

        {/* Search input */}
        <div style={{ display:"flex", alignItems:"center", gap:10,
          background:C.surfHigh, border:"1px solid rgba(255,255,255,0.12)", padding:"10px 14px", marginBottom:16 }}>
          <span style={{ color:C.muted, fontSize:16 }}>🔍</span>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&query.trim()&&onAdd(query.trim())}
            placeholder="Enter a character...."
            style={{ flex:1, background:"none", border:"none", outline:"none",
              fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, color:C.onSurface,
              letterSpacing:"0.02em" }} autoFocus />
        </div>

        <button onClick={()=>query.trim()&&onAdd(query.trim())}
          style={{ width:"100%", background:C.alpha, border:"none", cursor:"pointer",
            padding:"14px 0", fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:900,
            textTransform:"uppercase", letterSpacing:"0.1em", color:"#fff",
            transition:"background 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.alphaDim}
          onMouseLeave={e=>e.currentTarget.style.background=C.alpha}>
          ADD TO BATTLE
        </button>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────
   ARENA PAGE
───────────────────────────────────────────── */
function ArenaPage() {
  const [tab, setTab]           = useState("1v1");
  const [activeSide, setActiveSide] = useState("alpha"); // which side next grid click goes to

  // 1v1 selections
  const [alpha1v1, setAlpha1v1] = useState("GOKU");
  const [bravo1v1, setBravo1v1] = useState("SUPERMAN");

  // 2v2 selections — up to 2 per side, tracked by slot index
  const [alpha2v2, setAlpha2v2] = useState(["GOKU", "NARUTO"]);
  const [bravo2v2, setBravo2v2] = useState(["SUPERMAN", "LUFFY"]);
  const [activeSlot, setActiveSlot] = useState(0); // 0 or 1 for 2v2

  const [showModal, setShowModal] = useState(false);
  const [battleStarted, setBattle] = useState(false);

  function handleGridSelect(key) {
    if (key === "__FIND__") { setShowModal(true); return; }
    if (key === "__RANDOM__") {
      const keys = Object.keys(ROSTER);
      const rk1 = keys[Math.floor(Math.random()*keys.length)];
      const rk2 = keys[Math.floor(Math.random()*keys.length)];
      if (tab === "1v1") { setAlpha1v1(rk1); setBravo1v1(rk2); }
      else {
        setAlpha2v2([rk1, keys[Math.floor(Math.random()*keys.length)]]);
        setBravo2v2([rk2, keys[Math.floor(Math.random()*keys.length)]]);
      }
      return;
    }
    // Route to whichever side/slot is active
    if (tab === "1v1") {
      if (activeSide === "alpha") setAlpha1v1(key);
      else setBravo1v1(key);
    } else {
      if (activeSide === "alpha") {
        setAlpha2v2(prev => { const n=[...prev]; n[activeSlot]=key; return n; });
      } else {
        setBravo2v2(prev => { const n=[...prev]; n[activeSlot]=key; return n; });
      }
    }
    setBattle(false);
  }

  function handleAddFighter(name) {
    const key = name.toUpperCase().replace(/\s+/g,"_");
    if (!ROSTER[key]) {
      ROSTER[key] = { img:null, franchise:"CUSTOM", abbr: name.slice(0,2).toUpperCase(), color:"#2a0a2a", wiki:null, page:null };
    }
    handleGridSelect(key);
    setShowModal(false);
  }

  function handleReset() {
    setAlpha1v1("GOKU"); setBravo1v1("SUPERMAN");
    setAlpha2v2(["GOKU","NARUTO"]); setBravo2v2(["SUPERMAN","LUFFY"]);
    setActiveSide("alpha"); setActiveSlot(0); setBattle(false);
  }

  const sideIndicatorStyle = (side) => ({
    display:"inline-flex", alignItems:"center", gap:8,
    cursor:"pointer", padding:"4px 10px",
    border: activeSide===side ? `1.5px solid ${side==="alpha"?C.alphaBorder:C.bravoBorder}` : "1.5px solid transparent",
    borderRadius:2, transition:"border-color 0.15s",
  });

  // What's selected for the active tab
  const selAlpha = tab==="1v1" ? alpha1v1 : null;
  const selBravo = tab==="1v1" ? bravo1v1 : null;

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
            fontWeight:900, textTransform:"uppercase", color:C.onSurface, margin:"0 0 20px", lineHeight:1 }}>
            CHOOSE YOUR FIGHTERS
          </h1>
          <div style={{ display:"inline-flex", background:C.surf, borderRadius:999,
            padding:3, gap:2, border:"1px solid rgba(255,255,255,0.08)" }}>
            {[["1v1","1 VS 1 SIMULATION"],["2v2","2 VS 2 SIMULATION"]].map(([key,label])=>(
              <button key={key} onClick={()=>{ setTab(key); setBattle(false); }}
                style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                  padding:"8px 24px", borderRadius:999, border:"none", cursor:"pointer",
                  background: tab===key ? C.alpha : "transparent",
                  color: tab===key ? "#fff" : C.muted, transition:"all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Team headers — click to set active side */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:8 }}>
          <div>
            <div onClick={()=>{ setActiveSide("alpha"); setActiveSlot(0); }}
              style={sideIndicatorStyle("alpha")}>
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:20, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.06em", color:C.alpha }}>
                <span style={{ marginRight:8, fontSize:16, opacity:0.8 }}>»»</span>TEAM ALPHA
              </span>
              {activeSide==="alpha" && (
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                  color:C.alpha, letterSpacing:"0.1em" }}>← SELECTING</span>
              )}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div onClick={()=>{ setActiveSide("bravo"); setActiveSlot(0); }}
              style={{ ...sideIndicatorStyle("bravo"), justifyContent:"flex-end" }}>
              {activeSide==="bravo" && (
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                  color:C.bravoBorder, letterSpacing:"0.1em" }}>SELECTING →</span>
              )}
              <span style={{ fontFamily:"'Teko',sans-serif", fontSize:20, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.06em", color:C.bravoBorder }}>
                TEAM BRAVO<span style={{ marginLeft:8, fontSize:16, opacity:0.8 }}>«««</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero portraits */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, marginBottom:20 }}>
          {tab==="1v1" ? (
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
          ) : (
            <>
              {/* 2v2 — each slot individually clickable */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                {alpha2v2.map((rk, i)=>(
                  <div key={i} onClick={()=>{ setActiveSide("alpha"); setActiveSlot(i); }}
                    style={{ cursor:"pointer",
                      outline: activeSide==="alpha" && activeSlot===i ? `2px solid ${C.alphaBorder}` : "2px solid transparent",
                      outlineOffset:2, transition:"outline-color 0.15s" }}>
                    <HeroPortrait rosterKey={rk} name={rk.replace(/_/g," ")} side="alpha" />
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                {bravo2v2.map((rk, i)=>(
                  <div key={i} onClick={()=>{ setActiveSide("bravo"); setActiveSlot(i); }}
                    style={{ cursor:"pointer",
                      outline: activeSide==="bravo" && activeSlot===i ? `2px solid ${C.bravoBorder}` : "2px solid transparent",
                      outlineOffset:2, transition:"outline-color 0.15s" }}>
                    <HeroPortrait rosterKey={rk} name={rk.replace(/_/g," ")} side="bravo" />
                  </div>
                ))}
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
              selectedAlpha={tab==="1v1" ? alpha1v1 : alpha2v2[activeSlot]}
              selectedBravo={tab==="1v1" ? bravo1v1 : bravo2v2[activeSlot]}
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
              tab={tab}
              alpha1v1={alpha1v1} bravo1v1={bravo1v1}
              alpha2v2={alpha2v2} bravo2v2={bravo2v2}
            />
          </div>
        )}
      </div>

      {showModal && (
        <SummonModal onClose={()=>setShowModal(false)} onAdd={handleAddFighter} />
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

  const prompt = `You are the narrator for VS Battles, a fighting simulation app. Write a dramatic 4-round battle breakdown for ${alphaName} (${alphaTitle} — ${alphaFlavor}) vs ${bravoName} (${bravoTitle} — ${bravoFlavor}) in a ${tab} match. The predicted winner is ${winner}.

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
- Make the narrative feel like a real VS Battles wiki debate come to life`;

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
        model: "gpt-5.4-mini",
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

function BattleResults({ tab, alpha1v1, bravo1v1, alpha2v2, bravo2v2 }) {
  const battle = tab==="1v1"
    ? computeBattle1v1(alpha1v1, bravo1v1)
    : computeBattle2v2(alpha2v2, bravo2v2);

  const alphaName = tab==="1v1" ? alpha1v1.replace(/_/g," ") : (alpha2v2||[]).map(k=>k.replace(/_/g," ")).join(" & ");
  const bravoName = tab==="1v1" ? bravo1v1.replace(/_/g," ") : (bravo2v2||[]).map(k=>k.replace(/_/g," ")).join(" & ");

  const alphaStats = FIGHTER_STATS[alpha1v1] || FIGHTER_STATS[alpha2v2?.[0]] || {};
  const bravoStats = FIGHTER_STATS[bravo1v1] || FIGHTER_STATS[bravo2v2?.[0]] || {};

  const [aiRounds, setAiRounds]         = useState(null);
  const [aiProjection, setAiProjection] = useState(null);
  const [aiFinalBlow, setAiFinalBlow]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [battleImg, setBattleImg]       = useState(null);
  const [imgLoading, setImgLoading]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setAiRounds(null);
    setAiProjection(null);
    setAiFinalBlow(null);
    setBattleImg(null);

    fetchBattleNarrative(alphaName, bravoName, alphaStats, bravoStats, battle.projection.winner, tab)
      .then(result => {
        if (result?.rounds) {
          setAiRounds(result.rounds);
          setAiProjection(result.projection);
          // Extract final blow from last round narrative for image prompt
          const finalRound = result.rounds[result.rounds.length - 1];
          const blow = finalRound?.narrative?.slice(0, 120) || "";
          setAiFinalBlow(blow);
          // Kick off image generation in parallel
          setImgLoading(true);
          const winnerName = battle.projection.winner.replace(" WINS","").replace(" WIN","").trim();
          const loserName  = battle.projection.winner.includes(alphaName) ? bravoName : alphaName;
          fetchBattleImage(winnerName, loserName, alphaStats.flavor || bravoStats.flavor || "", blow)
            .then(url => { if (url) setBattleImg(url); })
            .finally(() => setImgLoading(false));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [alpha1v1, bravo1v1, alpha2v2?.join(","), bravo2v2?.join(","), tab]);

  // Merge AI rounds with computed stat data
  const displayRounds = aiRounds
    ? battle.rounds.map((r, i) => ({
        ...r,
        ...(aiRounds[i] || {}),
      }))
    : battle.rounds;

  return (
    <div>
      {/* Win probability banner */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", marginBottom:3 }}>
        <div style={{ background:C.alpha, padding:"12px 20px" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.7)", marginBottom:2 }}>
            {alphaName} — WIN PROBABILITY
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, color:"#fff" }}>
            {battle.alphaProb}
          </div>
          {tab==="1v1" && battle.alphaTitle && (
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>
              {battle.alphaTitle}
            </div>
          )}
        </div>
        <div style={{ background:C.bravo, padding:"12px 20px", textAlign:"right" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.7)", marginBottom:2 }}>
            {bravoName} — WIN PROBABILITY
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, color:"#fff" }}>
            {battle.bravoProb}
          </div>
          {tab==="1v1" && battle.bravoTitle && (
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>
              {battle.bravoTitle}
            </div>
          )}
        </div>
      </div>

      {/* Stat bars */}
      <section style={{ background:C.surf, padding:28, marginBottom:16, borderLeft:"3px solid #ffe792" }}>
        <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900,
          textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 20px", color:"#ffe792" }}>
          AGGREGATE STATS
        </h3>
        {battle.stats.map(s=>(
          <StatBar key={s.label} {...s} />
        ))}
      </section>

      {/* Rounds */}
      <section style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.12em", color:C.muted, margin:0 }}>
            ROUND BY ROUND
          </h3>
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.alphaBorder,
                animation:"pulse 1s infinite" }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11,
                color:C.muted, letterSpacing:"0.1em" }}>GENERATING NARRATIVE...</span>
            </div>
          )}
          {!loading && aiRounds && (
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
              color:"#ffe792", letterSpacing:"0.1em", background:"#ffe79222", padding:"2px 8px" }}>
              ✦ AI GENERATED
            </span>
          )}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
        {displayRounds.map((r,i)=><RoundRow key={i} round={r} idx={i} />)}
      </section>

      {/* Projection */}
      <div style={{ textAlign:"center", padding:"32px 0" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
          letterSpacing:"0.2em", color:C.muted, textTransform:"uppercase", marginBottom:12 }}>
          SYNCHRONIZATION PROJECTION
        </div>

        {/* Final narrative line */}
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", color:C.mutedLight, fontSize:15,
          maxWidth:640, margin:"0 auto 32px", lineHeight:1.6 }}>
          {aiProjection || battle.projection.reason} Predicted outcome is {battle.projection.reliability} reliable.
        </p>

        {/* AI Battle Image */}
        <div style={{ maxWidth:480, margin:"0 auto 36px", position:"relative" }}>
          {imgLoading && (
            <div style={{ background:C.surf, height:220, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:16,
              border:`1px solid ${C.surfHigh}` }}>
              <div style={{ display:"flex", gap:6 }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#ffe792",
                    animation:`imgPulse 1.2s ${i*0.2}s infinite ease-in-out` }} />
                ))}
              </div>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12,
                color:C.muted, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                RENDERING FINAL BLOW...
              </span>
              <style>{`@keyframes imgPulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
            </div>
          )}
          {battleImg && !imgLoading && (
            <div style={{ position:"relative" }}>
              <img src={battleImg} alt="Battle result"
                style={{ width:"100%", display:"block", borderTop:`3px solid #ffe792`,
                  borderBottom:`3px solid ${C.alphaBorder}` }} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0,
                background:"linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                padding:"24px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                  color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  ✦ AI GENERATED — DALL·E 3
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Winner name — only shown after AI narrative is done */}
        {!loading && aiRounds && (
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:"clamp(48px,10vw,88px)", fontWeight:900, color:"#ffe792",
            lineHeight:1, textTransform:"uppercase",
            animation:"fadeIn 0.6s ease-out" }}>
            {battle.projection.winner}
          </div>
        )}
        {loading && (
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16,
            color:C.muted, letterSpacing:"0.2em", textTransform:"uppercase",
            animation:"pulse 1.2s infinite" }}>
            CALCULATING OUTCOME...
          </div>
        )}
        <style>{`@keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }`}</style>
      </div>
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
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#fff", textTransform:"uppercase" }}>2V2 SKIRMISH</div>
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
            color:"#fff", letterSpacing:"0.18px" }}>2v2</span>
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
          <Card2v2 b={RECENT_P1[1]} />
          <FeaturedCard
            teamName="ALPHA_SYNDICATE"
            fighters={[{ name:"GOKU", rosterKey:"GOKU" },{ name:"NARUTO", rosterKey:"NARUTO" }]}
            losers={[{ rosterKey:"SUPERMAN" },{ rosterKey:"LUFFY" }]}
            loserName="TEAM_BRAVO" location="WORLD_OF_VOID" timestamp="2026-04-15 // 09:40:12"
          />
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
              <Card2v2 b={RECENT_P2[1]} />
              <FeaturedCard
                teamName="DOOM_PACT"
                fighters={[{ name:"DOOM SLAYER", rosterKey:"DOOM_SLAYER" },{ name:"KRATOS", rosterKey:"KRATOS" }]}
                losers={[{ rosterKey:"RYU" },{ rosterKey:"JIN_KAZAMA" }]}
                loserName="STREET_TEKKEN" location="HELL_CITADEL_3" timestamp="2026-04-14 // 22:05:44"
              />
              <Card1v1 b={RECENT_P2[2]} />
              <Card1v1 b={RECENT_P2[3]} />
              <Card1v1 b={RECENT_P2[4]} />
              <Card2v2 b={RECENT_P2[5]} />
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
    1: { accent:"#C8A84B", tag:"CHAMPION",   tagBg:"#F0C040",  numColor:"#fff",    barFill:"#C8A84B",  winColor:"#C8A84B" },
    2: { accent:"#38B2D8", tag:"CONTENDER",  tagBg:"#38B2D8",  numColor:"#fff",    barFill:"#38B2D8",  winColor:"#38B2D8" },
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
            <div style={{ width:9, height:9, background:"#FF0030", borderRadius:"50%" }} />
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:16, color:"#fff", letterSpacing:"0.18px" }}>
              LIVE DATA FEED
            </span>
          </div>
        </header>

        {/* Podium */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, marginBottom:48, alignItems:"end" }}>
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
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left" }}>
            <thead>
              <tr style={{ background:"#1E1F25" }}>
                {["RANK","FIGHTER","TOTAL STATS","1V1 RECORD","TEAM RECORD","RATING"].map((h,i)=>(
                  <th key={h} style={{ padding:"13px 20px", fontFamily:"'Inter',sans-serif",
                    fontSize:12, fontWeight:900, textTransform:"uppercase", letterSpacing:"2px",
                    color:"#fff", textAlign:i===5?"right":"left" }}>{h}</th>
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
                          background:"#fff", mixBlendMode:"saturation" }}>
                          {rr.img
                            ? <img src={rr.img} alt={r.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", filter:"grayscale(1)" }} />
                            : <div style={{ width:"100%", height:"100%", background:rr.color||"#333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:900, color:"#fff", filter:"grayscale(1)" }}>{rr.abbr}</span>
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

                    {/* Team record */}
                    <td style={{ padding:"26px 20px" }}>
                      <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700,
                        letterSpacing:"0.18px", color:r.barColor }}>{r.team}</span>
                    </td>

                    {/* Rating */}
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
      `}</style>
      <NavBar page={page} setPage={setPage} />
      {page==="arena"    && <ArenaPage />}
      {page==="recent"   && <RecentBattlesPage />}
      {page==="rankings" && <RankingsPage />}
    </div>
  );
}
