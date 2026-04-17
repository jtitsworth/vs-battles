import { useState } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (Precision Brutalism)
───────────────────────────────────────────── */
const C = {
  bg:          "#0d0e12",
  surfLow:     "#121318",
  surf:        "#18191e",
  surfHigh:    "#1e1f25",
  surfHighest: "#24252b",
  primary:     "#ff8d8d",
  primaryDim:  "#e90036",
  secondary:   "#00e3fd",
  secondaryDim:"#00d4ec",
  tertiary:    "#ffe792",
  onSurface:   "#faf8fe",
  onSurfVar:   "#abaab0",
  outlineVar:  "#47484c",
  onPrimary:   "#640011",
  onSecondary: "#004d57",
};

const gStyle = {
  fontFamily: "'Manrope', sans-serif",
  background: C.bg,
  color: C.onSurface,
  minHeight: "100vh",
};

/* ─────────────────────────────────────────────
   FIGHTER ROSTER — color-coded initials for
   characters without local image files
───────────────────────────────────────────── */
const ROSTER = {
  GOKU:         { img: "/goku.png",           abbr: "GK", color: "#8c5200" },
  NARUTO:       { img: "/naruto.png",         abbr: "NT", color: "#b05a00" },
  SUPERMAN:     { img: "/superman.png",       abbr: "SM", color: "#0a2a7a" },
  LUFFY:        { img: "/luffy.png",          abbr: "LF", color: "#8a1010" },
  KRATOS:       { img: "/kratos.png",         abbr: "KR", color: "#5a1010" },
  DANTE:        { img: "/dante.png",          abbr: "DT", color: "#8a0000" },
  DOOM_SLAYER:  { img: "/doom slayer.png",    abbr: "DS", color: "#1a3a0a" },
  MASTER_CHIEF: { img: "/master chief.png",   abbr: "MC", color: "#0a3a1a" },
  RYU:          { img: "/ryu.png",            abbr: "RY", color: "#0a2040" },
  JIN_KAZAMA:   { img: "/jin kazama.png",      abbr: "JK", color: "#0a0a30" },
  SOL_BADGUY:   { img: "/sol badguy.png",     abbr: "SB", color: "#5a1000" },
  KIRBY:        { img: "/kirby.png",          abbr: "KB", color: "#7a1a50" },
  SCORPION:     { img: "/scorpion.png",       abbr: "SC", color: "#5a4000" },
  SHAGGY:       { img: "/shaggy rogers.png",  abbr: "SH", color: "#1a3a00" },
};

/* Renders either a real image or a color-block with initials */
function Avatar({ name, size = 44, grayscale = false, style: extraStyle = {} }) {
  const r = ROSTER[name] || { abbr: (name||"??").slice(0,2).toUpperCase(), color: "#2a2a2a", img: null };
  const base = { width: size, height: size, flexShrink: 0, overflow: "hidden", display:"flex", alignItems:"center", justifyContent:"center", filter: grayscale ? "grayscale(1)" : "none", transition: "filter 0.3s", ...extraStyle };
  if (r.img) {
    return (
      <div style={base}>
        <img src={r.img} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: r.color }}>
      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: Math.max(10, size * 0.33), fontWeight:900, color:"rgba(255,255,255,0.85)", userSelect:"none" }}>{r.abbr}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BATTLE DATA (hardcoded)
───────────────────────────────────────────── */
const BATTLES = {
  "1v1": {
    id:"1v1", type:"1v1",
    alpha: { name:"GOKU",     label:"TEAM ALPHA [RED]",  prob:"71%", stat:{ label:"POWER LEVEL",      val:"OVER 9000", pct:98 }, img:"/goku.png"     },
    bravo: { name:"SUPERMAN", label:"TEAM BRAVO [BLUE]", prob:"29%", stat:{ label:"SOLAR ABSORPTION", val:"MAXIMUM",   pct:95 }, img:"/superman.png" },
    stats: [
      { label:"STRENGTH",              alpha:95, bravo:96, winner:"bravo", alphaVal:"95.0", bravoVal:"96.0" },
      { label:"SPEED / REFLEXES",      alpha:98, bravo:95, winner:"alpha", alphaVal:"98.0", bravoVal:"95.0" },
      { label:"DURABILITY",            alpha:93, bravo:97, winner:"bravo", alphaVal:"93.0", bravoVal:"97.0" },
      { label:"VERSATILITY / ARSENAL", alpha:94, bravo:72, winner:"alpha", alphaVal:"94.0", bravoVal:"72.0" },
    ],
    projection:{ winner:"GOKU WINS", reliability:"78.4%", reason:"Ultra Instinct's autonomous combat reflexes give Goku a decisive edge. While Superman's raw durability marginally exceeds Goku's, the Saiyan's speed advantage and battle-trained adaptability tip the outcome." },
    rounds:[
      { title:"OPENING CLASH",          winner:"DRAW",    winTeam:"draw",  narrative:"The two titans collide with earth-shattering force, leveling mountains. Superman rockets forward with a haymaker Goku barely sidesteps, retaliating with a sharp ki blast.", reasoning:"Neither fighter gains a clear advantage in the opening exchange." },
      { title:"POWER ESCALATION",       winner:"SUPERMAN",winTeam:"bravo", narrative:"Goku powers to Super Saiyan Blue. Superman's eyes glow red as he unleashes heat vision. Goku deflects with Kamehameha — the beams collide in a blinding explosion.", reasoning:"Superman's heat vision overpowers Goku's Kamehameha at this power level." },
      { title:"ULTRA INSTINCT AWAKENS", winner:"GOKU",   winTeam:"alpha", narrative:"Pushed to his limit, Goku's hair turns silver. Ultra Instinct activates — movements become fluid and automatic, dodging Superman's barrage without conscious thought.", reasoning:"Ultra Instinct's autonomous dodging completely counters Superman's speed." },
      { title:"FINAL EXCHANGE",         winner:"GOKU",   winTeam:"alpha", narrative:"Superman charges a full-power punch. Goku winds up a Mastered Ultra Instinct Kamehameha. A blinding white explosion. When the light clears, Superman is on one knee.", reasoning:"Mastered Ultra Instinct's output surpasses what Superman can absorb." },
    ],
  },
  "2v2": {
    id:"2v2", type:"2v2",
    alpha:{ name:"ALPHA", label:"TEAM ALPHA [RED]", prob:"64%", fighters:[
      { name:"GOKU",   stat:{ label:"POWER LEVEL",      val:"OVER 9000", pct:98 }, img:"/goku.png"   },
      { name:"NARUTO", stat:{ label:"CHAKRA POTENTIAL", val:"S-RANK",    pct:92 }, img:"/naruto.png" },
    ]},
    bravo:{ name:"BRAVO", label:"TEAM BRAVO [BLUE]", prob:"36%", fighters:[
      { name:"SUPERMAN", stat:{ label:"SOLAR ABSORPTION", val:"MAXIMUM",  pct:95 }, img:"/superman.png" },
      { name:"LUFFY",    stat:{ label:"GEAR FIFTH POWER", val:"REALITY+", pct:88 }, img:"/luffy.png"    },
    ]},
    stats:[
      { label:"STRENGTH",               alpha:183, bravo:181, winner:"alpha", alphaVal:"183.0", bravoVal:"181.0" },
      { label:"INTELLIGENCE / TACTICS", alpha:150, bravo:150, winner:"draw",  alphaVal:"150.0", bravoVal:"150.0" },
      { label:"VERSATILITY / ARSENAL",  alpha:187, bravo:142, winner:"alpha", alphaVal:"187.0", bravoVal:"142.0" },
    ],
    projection:{ winner:"ALPHA WIN", reliability:"64.0%", reason:"Goku and Naruto's combat synergy is nearly telepathic. Superman's universe-level power kept Team Bravo competitive, but Luffy's chaos disrupted coordination. The dual transformation in Round 3 sealed it." },
    rounds:[
      { title:"TEAM TACTICS",        winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Goku engages Superman while Naruto floods the field with shadow clones aimed at Luffy. Team Bravo struggles to coordinate.",           reasoning:"Goku and Naruto's instinctive teamwork overwhelms the looser coordination of Team Bravo." },
      { title:"GEAR FIFTH CHAOS",    winner:"TEAM BRAVO", winTeam:"bravo", narrative:"Luffy activates Gear Fifth — the battlefield warps. He grabs the ground like rubber, hurls lightning at Naruto, and inflates his fist to island size.", reasoning:"Gear Fifth chaos disrupts Naruto's tactical plans and evens the field." },
      { title:"DUAL TRANSFORMATION", winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Goku hits Ultra Instinct while Naruto ignites Baryon Mode simultaneously — a blinding pulse radiates outward. Superman flies into Goku's autonomous counter-strike.", reasoning:"Simultaneous peak transformations overwhelm Team Bravo's ability to respond." },
      { title:"FINAL STAND",         winner:"TEAM ALPHA", winTeam:"alpha", narrative:"Superman throws a planetary punch. Goku teleports out via Instant Transmission while Naruto's clone absorbs the blow. They reappear behind Superman and unleash a combined Kamehameha-Rasenshuriken.", reasoning:"Instant Transmission + clone tactics creates an unstoppable coordinated finish." },
    ],
  },
};

/* ─────────────────────────────────────────────
   RECENT BATTLES  — Page 1 (main cast)
───────────────────────────────────────────── */
const RECENT_P1 = [
  { id:"r1", type:"1v1", time:"20:45 UTC", winnerColor:"alpha",
    winner:{ name:"GOKU",    sub:"Team Alpha",  rosterKey:"GOKU",    pct:98 }, loser:{ name:"SUPERMAN", rosterKey:"SUPERMAN" } },
  { id:"r2", type:"2v2", time:"19:12 UTC", winnerColor:"alpha",
    winner:{ name:"ALPHA SYNDICATE", sub:"Team Alpha" },
    fighters:[{ name:"GOKU",   rosterKey:"GOKU" },{ name:"NARUTO", rosterKey:"NARUTO" }],
    losers:[{ rosterKey:"SUPERMAN" },{ rosterKey:"LUFFY" }], loserName:"TEAM_BRAVO" },
  // featured 2v2 — rendered separately below
  { id:"r3", type:"1v1", time:"12:15 UTC", winnerColor:"bravo",
    winner:{ name:"LUFFY",  sub:"Team Bravo", rosterKey:"LUFFY",  pct:72 }, loser:{ name:"NARUTO",   rosterKey:"NARUTO" } },
  { id:"r4", type:"1v1", time:"08:44 UTC", winnerColor:"alpha",
    winner:{ name:"NARUTO", sub:"Team Alpha", rosterKey:"NARUTO", pct:85 }, loser:{ name:"LUFFY",    rosterKey:"LUFFY" } },
];

/* ─────────────────────────────────────────────
   RECENT BATTLES — Page 2 (new fighters)
───────────────────────────────────────────── */
const RECENT_P2 = [
  { id:"p2a", type:"1v1", time:"23:10 UTC", winnerColor:"alpha",
    winner:{ name:"KRATOS",      sub:"Combatant Alpha", rosterKey:"KRATOS",      pct:91 }, loser:{ name:"DANTE",       rosterKey:"DANTE" } },
  { id:"p2b", type:"2v2", time:"22:05 UTC", winnerColor:"bravo",
    winner:{ name:"DOOM PACT", sub:"Team Bravo" },
    fighters:[{ name:"DOOM SLAYER",  rosterKey:"DOOM_SLAYER" },{ name:"MASTER CHIEF", rosterKey:"MASTER_CHIEF" }],
    losers:[{ rosterKey:"RYU" },{ rosterKey:"JIN_KAZAMA" }], loserName:"STREET_TEKKEN" },
  // featured 2v2 — rendered separately below
  { id:"p2c", type:"1v1", time:"18:30 UTC", winnerColor:"alpha",
    winner:{ name:"SOL BADGUY",  sub:"Combatant Alpha", rosterKey:"SOL_BADGUY",  pct:78 }, loser:{ name:"SCORPION",    rosterKey:"SCORPION" } },
  { id:"p2d", type:"1v1", time:"16:55 UTC", winnerColor:"bravo",
    winner:{ name:"SHAGGY",      sub:"Combatant Beta",  rosterKey:"SHAGGY",      pct:99 }, loser:{ name:"KIRBY",       rosterKey:"KIRBY" } },
  { id:"p2e", type:"1v1", time:"14:22 UTC", winnerColor:"alpha",
    winner:{ name:"MASTER CHIEF",sub:"Combatant Alpha", rosterKey:"MASTER_CHIEF",pct:67 }, loser:{ name:"DOOM SLAYER", rosterKey:"DOOM_SLAYER" } },
  { id:"p2f", type:"2v2", time:"11:48 UTC", winnerColor:"alpha",
    winner:{ name:"WARRIOR PACT", sub:"Team Alpha" },
    fighters:[{ name:"KRATOS", rosterKey:"KRATOS" },{ name:"SOL BADGUY", rosterKey:"SOL_BADGUY" }],
    losers:[{ rosterKey:"SCORPION" },{ rosterKey:"SHAGGY" }], loserName:"CHAOS_UNIT" },
];

/* ─────────────────────────────────────────────
   RANKINGS DATA
   rating = wins/(wins+losses) as percentage
───────────────────────────────────────────── */
const PODIUM = [
  { rank:"01", name:"GOKU",    sub:"SAIYAN GOD",     wins:1240, losses:45,  rosterKey:"GOKU",    badge:"CHALLENGER", badgeColor:C.primary,   pct:97 },
  { rank:"02", name:"SUPERMAN",sub:"MAN OF STEEL",   wins:842,  losses:112, rosterKey:"SUPERMAN",badge:"DEFENDER",   badgeColor:C.secondary, pct:88 },
  { rank:"03", name:"NARUTO",  sub:"SEVENTH HOKAGE", wins:710,  losses:180, rosterKey:"NARUTO",  badge:"ELITE",      badgeColor:C.tertiary,  pct:80 },
];

const mkRow = (rank, name, sub, rosterKey, wins, losses, oneV, team, barColor) => ({
  rank, name, sub, rosterKey, wins, losses, oneV, team, barColor,
  rating: Math.round((wins/(wins+losses))*100),
});

const TABLE_ROWS = [
  mkRow("04","LUFFY",        "SUN GOD NIKA",       "LUFFY",        680,195,"340-80", "340-115",C.primary    ),
  mkRow("05","KRATOS",       "GOD OF WAR",          "KRATOS",       614,188,"420-62", "194-126",C.secondary  ),
  mkRow("06","SHAGGY",       "ULTRA INSTINCT",      "SHAGGY",       581,49, "571-19", "10-30",  C.tertiary   ),
  mkRow("07","DOOM SLAYER",  "DOOM ETERNAL",        "DOOM_SLAYER",  597,203,"381-77", "216-126",C.primaryDim ),
  mkRow("08","DANTE",        "SON OF SPARDA",       "DANTE",        556,244,"310-120","246-124",C.primary    ),
  mkRow("09","MASTER CHIEF", "SPARTAN-117",         "MASTER_CHIEF", 542,258,"270-114","272-144",C.secondary  ),
  mkRow("10","SOL BADGUY",   "GUILTY GEAR STRIVE",  "SOL_BADGUY",   520,280,"295-130","225-150",C.primary    ),
  mkRow("11","SCORPION",     "MORTAL KOMBAT 11",    "SCORPION",     498,302,"310-110","188-192",C.tertiary   ),
  mkRow("12","RYU",          "STREET FIGHTER 6",    "RYU",          471,329,"361-89", "110-240",C.secondary  ),
  mkRow("13","NARUTO",       "BARYON MODE",         "NARUTO",       459,291,"249-141","210-150",C.primaryDim ),
  mkRow("14","JIN KAZAMA",   "TEKKEN 8",            "JIN_KAZAMA",   440,360,"280-170","160-190",C.secondary  ),
  mkRow("15","SUPERMAN",     "SOLAR CHARGED",       "SUPERMAN",     428,322,"240-130","188-192",C.secondary  ),
  mkRow("16","KIRBY",        "COPY ABILITY",        "KIRBY",        390,360,"210-160","180-200",C.primary    ),
  mkRow("17","GOKU",         "ULTRA INSTINCT",      "GOKU",         371,279,"200-110","171-169",C.tertiary   ),
  mkRow("18","LUFFY",        "GEAR FIFTH",          "LUFFY",        342,408,"180-180","162-228",C.primaryDim ),
  mkRow("19","DANTE",        "DEVIL TRIGGER",       "DANTE",        310,390,"200-170","110-220",C.secondary  ),
  mkRow("20","SHAGGY",       "LIMITLESS POWER",     "SHAGGY",       291,109,"289-39", "2-70",   C.tertiary   ),
  mkRow("21","KRATOS",       "GHOST OF SPARTA",     "KRATOS",       260,240,"140-110","120-130",C.primary    ),
  mkRow("22","MASTER CHIEF", "LEGENDARY DIFF",      "MASTER_CHIEF", 228,272,"130-120","98-152", C.secondary  ),
  mkRow("23","SCORPION",     "HELLFIRE MODE",       "SCORPION",     198,302,"120-150","78-152", C.outlineVar ),
];

const TABLE_PAGE = 10;

/* ─────────────────────────────────────────────
   SHARED NAV
───────────────────────────────────────────── */
function TopNav({ page, setPage }) {
  const links = ["ARENA","RECENT BATTLES","RANKINGS"];
  const map = { "ARENA":"arena", "RECENT BATTLES":"recent", "RANKINGS":"rankings" };
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:C.bg, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
      <div onClick={()=>setPage("arena")} style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:900, fontStyle:"italic", color:"#FF003C", textTransform:"uppercase", letterSpacing:"-0.04em", cursor:"pointer" }}>KINETIC CONFLICT</div>
      <div style={{ display:"flex", gap:32 }}>
        {links.map(l=>{
          const active = map[l]===page;
          return <button key={l} onClick={()=>setPage(map[l])} style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"-0.02em", background:"none", border:"none", cursor:"pointer", color:active?"#FF003C":C.onSurfVar, borderBottom:active?"2px solid #FF003C":"2px solid transparent", paddingBottom:2 }}>{l}</button>;
        })}
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <span style={{ color:C.onSurfVar, cursor:"pointer", fontSize:20 }}>⊕</span>
        <span style={{ color:C.onSurfVar, cursor:"pointer", fontSize:20 }}>⏱</span>
      </div>
    </nav>
  );
}

function SideNav({ page, setPage }) {
  const items=[{key:"arena",label:"ARENA",icon:"⚔"},{key:"recent",label:"RECENT BATTLES",icon:"⏱"},{key:"rankings",label:"RANKINGS",icon:"▲"}];
  return (
    <aside style={{ position:"fixed", left:0, top:64, bottom:0, width:256, background:C.bg, display:"flex", flexDirection:"column", paddingTop:32, zIndex:40 }}>
      <div style={{ padding:"0 24px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, overflow:"hidden", flexShrink:0 }}>
            <img src="/goku.png" style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="op" />
          </div>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, color:"#FF003C", textTransform:"uppercase" }}>OPERATOR_01</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em" }}>TIER_ALPHA</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1 }}>
        {items.map(it=>{
          const active=page===it.key;
          return <button key={it.key} onClick={()=>setPage(it.key)} style={{ display:"flex", alignItems:"center", gap:16, width:"100%", padding:"14px 24px", background:active?C.surfHigh:"none", borderLeft:active?"4px solid #FF003C":"4px solid transparent", color:active?"#FF003C":"#64748b", fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", border:"none", cursor:"pointer" }}><span style={{ fontSize:16 }}>{it.icon}</span><span>{it.label}</span></button>;
        })}
      </nav>
      <div style={{ padding:"0 16px 32px" }}>
        <button onClick={()=>setPage("arena")} style={{ width:"100%", background:"#FF003C", color:C.onPrimary, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:13, textTransform:"uppercase", padding:"14px 0", border:"none", cursor:"pointer", letterSpacing:"0.08em" }}>NEW CONFLICT</button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   ARENA COMPONENTS
───────────────────────────────────────────── */
function StatBar2({ label, alphaVal, bravoVal, alphaPct, bravoPct, winner }) {
  const winLabel = winner==="alpha"?"ALPHA ADVANTAGE":winner==="bravo"?"BRAVO LEAD":"DEAD EVEN";
  const winColor = winner==="alpha"?C.tertiary:winner==="bravo"?C.secondary:C.onSurfVar;
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:6 }}>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#64748b", letterSpacing:"0.1em" }}>{label}</span>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:900, color:winColor, fontStyle:"italic" }}>{winLabel}</span>
      </div>
      <div style={{ display:"flex", gap:4, height:40 }}>
        <div style={{ flex:alphaPct, background:C.primary, position:"relative", overflow:"hidden", minWidth:40 }}>
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,transparent,${C.primaryDim})`, opacity:0.3 }}/>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontStyle:"italic", color:C.onPrimary, fontSize:14 }}>{alphaVal}</span>
        </div>
        <div style={{ flex:bravoPct, background:C.secondary, position:"relative", overflow:"hidden", minWidth:40 }}>
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(to left,transparent,${C.secondaryDim})`, opacity:0.3 }}/>
          <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontStyle:"italic", color:C.onSecondary, fontSize:14 }}>{bravoVal}</span>
        </div>
      </div>
    </div>
  );
}

function RoundRow({ round, idx }) {
  const [open, setOpen] = useState(false);
  const bc = round.winTeam==="alpha"?C.primary:round.winTeam==="bravo"?C.secondary:C.outlineVar;
  return (
    <div style={{ borderLeft:`4px solid ${bc}`, background:C.surfLow, marginBottom:4 }}>
      <button onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"12px 16px", background:"none", border:"none", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:24, height:24, background:bc, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontSize:11, fontWeight:900, color:C.onPrimary, flexShrink:0 }}>{idx+1}</div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, color:C.onSurface, textTransform:"uppercase" }}>{round.title}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, color:bc, background:`${bc}22`, padding:"2px 8px", textTransform:"uppercase" }}>{round.winner} WINS</span>
          <span style={{ color:C.onSurfVar, fontSize:12 }}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open && (
        <div style={{ padding:"12px 16px 14px", background:C.bg }}>
          <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, color:"rgba(250,248,254,0.8)", margin:"0 0 8px", lineHeight:1.7 }}>{round.narrative}</p>
          <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:12, color:C.onSurfVar, margin:0, fontStyle:"italic" }}>{round.reasoning}</p>
        </div>
      )}
    </div>
  );
}

function FighterCard({ fighter, side, height=240 }) {
  const color = side==="alpha"?C.primary:C.secondary;
  const onColor = side==="alpha"?C.onPrimary:C.onSecondary;
  const namePos = side==="alpha"?{left:0}:{right:0};
  const r = ROSTER[fighter.name.replace(" ","_").toUpperCase()] || {};
  return (
    <div style={{ background:C.surf, borderBottom:`4px solid ${color}` }}>
      <div style={{ position:"relative", height, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {fighter.img
          ? <img src={fighter.img} alt={fighter.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", filter:"grayscale(1)", transition:"filter 0.5s" }} onMouseEnter={e=>e.target.style.filter="grayscale(0)"} onMouseLeave={e=>e.target.style.filter="grayscale(1)"} />
          : <Avatar name={fighter.name.replace(" ","_").toUpperCase()} size={height} style={{ width:"100%", height:"100%" }} />
        }
        <div style={{ position:"absolute", bottom:0, ...namePos, background:color, padding:"8px 16px" }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:900, fontStyle:"italic", textTransform:"uppercase", color:onColor }}>{fighter.name}</span>
        </div>
      </div>
      <div style={{ padding:"12px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:"#64748b" }}>{fighter.stat.label}</span>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, color }}>{fighter.stat.val}</span>
        </div>
        <div style={{ height:4, background:C.surfHighest }}>
          <div style={{ width:`${fighter.stat.pct}%`, height:"100%", background:color }} />
        </div>
      </div>
    </div>
  );
}

function AddFighterSlot({ side }) {
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const color = side === "alpha" ? C.primary : C.secondary;
  const onColor = side === "alpha" ? C.onPrimary : C.onSecondary;

  function handleSubmit() {
    if (!url.trim()) return;
    setSubmitted(true);
  }

  function handleReset() {
    setUrl("");
    setSubmitted(false);
  }

  if (submitted) {
    // Parse a display name from the URL for visual feedback
    const slug = url.split("/").filter(Boolean).pop() || "UNKNOWN";
    const displayName = slug.replace(/_/g, " ").toUpperCase();
    return (
      <div style={{ background:C.surfLow, border:`2px solid ${color}`, padding:20, display:"flex", flexDirection:"column", gap:12, marginTop:12 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, textTransform:"uppercase", letterSpacing:"0.16em", color, marginBottom:4 }}>FIGHTER QUEUED</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:900, textTransform:"uppercase", color, lineHeight:1 }}>{displayName}</div>
          </div>
          <div style={{ width:10, height:10, borderRadius:"50%", background:color, boxShadow:`0 0 8px ${color}`, animation:"pulse 1.5s infinite" }} />
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, wordBreak:"break-all", opacity:0.6 }}>{url}</div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, height:2, background:`${color}33`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:color, width:"60%", animation:"scan 2s ease-in-out infinite" }} />
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:C.onSurfVar, flex:1 }}>SCRAPING FANDOM DATA...</div>
          <button onClick={handleReset}
            style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", color:C.onSurfVar, background:"none", border:`1px solid ${C.outlineVar}`, padding:"3px 10px", cursor:"pointer" }}>
            CLEAR
          </button>
        </div>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes scan  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ background:C.surfLow, border:`2px dashed ${C.outlineVar}`, padding:20, display:"flex", flexDirection:"column", gap:12, marginTop:12, transition:"border-color 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=color}
      onMouseLeave={e=>e.currentTarget.style.borderColor=C.outlineVar}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, border:`2px dashed ${C.outlineVar}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ color:C.onSurfVar, fontSize:18, lineHeight:1 }}>+</span>
        </div>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", color:C.onSurface }}>ADD FIGHTER</div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, marginTop:1 }}>Paste a Fandom character URL</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input
          value={url}
          onChange={e=>setUrl(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
          placeholder="https://dragonball.fandom.com/wiki/..."
          style={{ flex:1, background:C.surfHighest, border:`1px solid ${C.outlineVar}`, borderBottom:`2px solid ${color}`, color:C.onSurface, fontFamily:"'Inter',sans-serif", fontSize:12, padding:"10px 12px", outline:"none", transition:"border-color 0.2s" }}
          onFocus={e=>e.target.style.borderBottomColor=color}
        />
        <button onClick={handleSubmit}
          style={{ background:color, color:onColor, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:12, textTransform:"uppercase", padding:"0 16px", border:"none", cursor:"pointer", letterSpacing:"0.06em", flexShrink:0 }}>
          ADD
        </button>
      </div>
    </div>
  );
}

function ArenaPage() {
  const [tab, setTab] = useState("1v1");
  const b = BATTLES[tab];
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {["1v1","2v2"].map(t=><button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 24px", fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:900, textTransform:"uppercase", background:tab===t?"#FF003C":C.surfHigh, color:tab===t?C.onPrimary:C.onSurfVar, border:"none", cursor:"pointer", letterSpacing:"0.06em" }}>{t} SIMULATION</button>)}
      </div>
      <header style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ display:"inline-block", background:C.primaryDim, padding:"4px 16px", marginBottom:12 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.16em", color:C.onPrimary }}>ACTIVE SIMULATION</span>
        </div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(28px,5vw,60px)", fontWeight:900, fontStyle:"italic", textTransform:"uppercase", letterSpacing:"-0.04em", lineHeight:1, margin:"0 0 12px" }}>
          TEAM <span style={{ color:C.primary }}>ALPHA</span> VS TEAM <span style={{ color:C.secondary }}>BRAVO</span>
        </h1>
        <p style={{ fontFamily:"'Manrope',sans-serif", color:C.onSurfVar, maxWidth:560, margin:"0 auto", fontSize:14 }}>
          {tab==="1v1"?"1v1 Synchronized Combat Projection. Ultra Instinct vs Solar-Powered Durability.":"2v2 Synchronized Combat Projection. Aggregated data reveals high volatility in tactical execution."}
        </p>
      </header>

      {/* Fighter grids */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:48 }}>
        {(["alpha","bravo"]).map(side=>{
          const team = b[side];
          const color = side==="alpha"?C.primary:C.secondary;
          return (
            <div key={side}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`2px solid ${color}`, paddingBottom:8, marginBottom:16 }}>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:900, fontStyle:"italic", color, textTransform:"uppercase", margin:0 }}>{team.label}</h2>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700, color }}>WIN: {team.prob}</span>
              </div>
              {tab==="1v1"
                ? <FighterCard fighter={team} side={side} height={240} />
                : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>{team.fighters.map(f=><FighterCard key={f.name} fighter={f} side={side} height={180} />)}</div>
              }
              <AddFighterSlot side={side} />
            </div>
          );
        })}
      </div>

      <section style={{ background:C.surfLow, padding:32, position:"relative", marginBottom:48 }}>
        <div style={{ position:"absolute", top:0, left:0, width:4, bottom:0, background:C.tertiary }}/>
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:900, fontStyle:"italic", textTransform:"uppercase", margin:"0 0 32px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:C.tertiary }}>▣</span> AGGREGATE STATS COMPARISON
        </h3>
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {b.stats.map(s=><StatBar2 key={s.label} label={s.label} alphaVal={s.alphaVal} bravoVal={s.bravoVal} alphaPct={s.alpha} bravoPct={s.bravo} winner={s.winner} />)}
        </div>
      </section>

      <section style={{ marginBottom:48 }}>
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:900, textTransform:"uppercase", margin:"0 0 12px", color:C.onSurfVar, letterSpacing:"0.06em" }}>ROUND BY ROUND</h3>
        {b.rounds.map((r,i)=><RoundRow key={i} round={r} idx={i} />)}
      </section>

      <section style={{ textAlign:"center", paddingBottom:48 }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.2em", color:C.onSurfVar, textTransform:"uppercase", marginBottom:12 }}>SYNCHRONIZATION PROJECTION</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(48px,10vw,96px)", fontWeight:900, fontStyle:"italic", color:C.tertiary, lineHeight:1, marginBottom:16 }}>{b.projection.winner}</div>
        <p style={{ fontFamily:"'Manrope',sans-serif", color:"#64748b", fontSize:14, maxWidth:580, margin:"0 auto 32px", lineHeight:1.7 }}>{b.projection.reason} Predicted outcome is {b.projection.reliability} reliable.</p>
        <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
          <button style={{ background:C.tertiary, color:"#453900", fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:13, textTransform:"uppercase", padding:"14px 40px", border:"none", cursor:"pointer" }}>COMMIT RESULTS</button>
          <button style={{ background:C.surfHigh, color:C.onSurface, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:13, textTransform:"uppercase", padding:"14px 40px", border:`1px solid ${C.outlineVar}`, cursor:"pointer" }}>RERUN SIM</button>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECENT BATTLES COMPONENTS
───────────────────────────────────────────── */
function Card1v1({ b }) {
  const wc = b.winnerColor==="alpha"?C.primary:C.secondary;
  const oc = b.winnerColor==="alpha"?C.onPrimary:C.onSecondary;
  return (
    <div style={{ background:C.surfLow, display:"flex" }}>
      <div style={{ flex:1, padding:24, display:"flex", flexDirection:"column", justifyContent:"space-between", borderLeft:`4px solid ${wc}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <span style={{ background:wc, padding:"2px 8px", fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:900, color:oc, textTransform:"uppercase" }}>VICTORY</span>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:900, textTransform:"uppercase", color:wc, marginTop:6, lineHeight:1 }}>{b.winner.name}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, marginTop:3 }}>{b.winner.sub}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, textTransform:"uppercase" }}>1V1 DUEL</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:900, marginTop:4 }}>{b.time}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, background:C.surf, padding:12 }}>
          <Avatar name={b.winner.rosterKey} size={48} />
          <div style={{ flex:1, height:8, background:C.surfHighest, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, width:`${b.winner.pct}%`, background:wc }}/>
          </div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, color:wc, fontSize:16 }}>{b.winner.pct}%</span>
        </div>
      </div>
      <div style={{ width:148, background:C.surf, padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderLeft:`1px solid ${C.outlineVar}` }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:900, fontStyle:"italic", color:`${C.onSurfVar}44`, marginBottom:10 }}>VS</div>
        <Avatar name={b.loser.rosterKey} size={72} grayscale />
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", color:C.onSurfVar, marginTop:8 }}>{b.loser.name}</div>
      </div>
    </div>
  );
}

function Card2v2({ b }) {
  const wc = b.winnerColor==="alpha"?C.primary:C.secondary;
  const oc = b.winnerColor==="alpha"?C.onPrimary:C.onSecondary;
  return (
    <div style={{ background:C.surfLow, display:"flex" }}>
      <div style={{ flex:1, padding:24, display:"flex", flexDirection:"column", justifyContent:"space-between", borderLeft:`4px solid ${wc}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <span style={{ background:wc, padding:"2px 8px", fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:900, color:oc, textTransform:"uppercase" }}>VICTORY</span>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:900, textTransform:"uppercase", color:wc, marginTop:6, lineHeight:1 }}>{b.winner.name}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, marginTop:3 }}>{b.winner.sub}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:C.onSurfVar, textTransform:"uppercase" }}>2V2 SKIRMISH</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:900, marginTop:4 }}>{b.time}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {b.fighters.map(f=>(
            <div key={f.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Avatar name={f.rosterKey} size={36} />
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{f.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width:148, background:C.surf, padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderLeft:`1px solid ${C.outlineVar}` }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:900, fontStyle:"italic", color:`${C.onSurfVar}44`, marginBottom:10 }}>VS</div>
        <div style={{ display:"flex" }}>
          {b.losers.map((l,i)=>(
            <div key={i} style={{ marginLeft:i>0?-10:0, border:`2px solid ${C.surf}`, flexShrink:0 }}>
              <Avatar name={l.rosterKey} size={44} grayscale />
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", color:C.onSurfVar, marginTop:8 }}>{b.loserName}</div>
      </div>
    </div>
  );
}

function FeaturedCard({ teamName, fighters, losers, loserName, location, timestamp }) {
  return (
    <div style={{ gridColumn:"span 2", background:C.surfLow, borderLeft:`4px solid ${C.primary}`, padding:32 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <span style={{ background:C.primary, padding:"4px 12px", fontFamily:"'Space Grotesk',sans-serif", fontSize:11, fontWeight:900, color:C.onPrimary, textTransform:"uppercase", letterSpacing:"0.12em" }}>MAJOR VICTORY</span>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.04em", margin:"10px 0 0" }}>{teamName}</h2>
        </div>
        <div style={{ background:C.surf, padding:20, border:`1px solid ${C.outlineVar}`, textAlign:"center", minWidth:140 }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", color:C.onSurfVar, marginBottom:4 }}>MATCH TYPE</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:900, color:C.tertiary }}>2v2</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {fighters.map(f=>(
            <div key={f.name} style={{ background:C.surfHigh, borderBottom:`4px solid ${C.primary}`, aspectRatio:"1", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Avatar name={f.rosterKey} size={150} style={{ width:"100%", height:"100%" }} />
              <div style={{ position:"absolute", bottom:0, left:0, background:C.primary, padding:"4px 10px" }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:900, color:C.onPrimary }}>{f.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:900, fontStyle:"italic", color:`${C.outlineVar}77` }}>VS</div>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, opacity:0.4, filter:"grayscale(1)" }}>
          {losers.map((l,i)=>(
            <div key={i} style={{ background:C.surfHighest, borderBottom:`4px solid ${C.outlineVar}`, aspectRatio:"1", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Avatar name={l.rosterKey} size={150} style={{ width:"100%", height:"100%" }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid ${C.outlineVar}44`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:28 }}>
          <div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", color:C.onSurfVar }}>LOCATION</div><div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, marginTop:2 }}>{location}</div></div>
          <div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", color:C.onSurfVar }}>DURATION</div><div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, marginTop:2 }}>28:44</div></div>
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:C.onSurfVar }}>TIMESTAMP: {timestamp}</div>
      </div>
    </div>
  );
}

function RecentBattlesPage() {
  const [showMore, setShowMore] = useState(false);
  return (
    <div>
      <header style={{ marginBottom:40 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:48, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.04em", margin:"0 0 6px" }}>Recent Battles</h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", color:C.onSurfVar, margin:0 }}>LIVE SIMULATION LOG / SECTOR 7-G</p>
      </header>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:1100 }}>
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

      {/* ── PREVIOUS RECORDS ── */}
      {showMore && (
        <div style={{ marginTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, margin:"28px 0 20px", maxWidth:1100 }}>
            <div style={{ flex:1, height:1, background:C.outlineVar }}/>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:C.onSurfVar, whiteSpace:"nowrap" }}>PREVIOUS RECORDS — SECTOR_ARCHIVE</span>
            <div style={{ flex:1, height:1, background:C.outlineVar }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:1100 }}>
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
          style={{ background:C.surfHigh, color:C.onSurface, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:13, textTransform:"uppercase", letterSpacing:"0.06em", padding:"16px 48px", border:`2px solid ${showMore?C.primary:C.outlineVar}`, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
          {showMore?"COLLAPSE_RECORDS":"FETCH_PREVIOUS_RECORDS"}
          <span style={{ fontSize:18, display:"inline-block", transform:showMore?"rotate(180deg)":"none", transition:"transform 0.2s" }}>↓</span>
        </button>
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

  return (
    <div>
      <header style={{ marginBottom:40 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(40px,7vw,72px)", fontWeight:900, fontStyle:"italic", textTransform:"uppercase", letterSpacing:"-0.04em", lineHeight:1, margin:"0 0 8px" }}>
          Global <span style={{ color:"#FF003C" }}>Rankings</span>
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:12, color:C.onSurfVar, fontFamily:"'Inter',sans-serif", fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em" }}>
          <span>SEASON_04: REVENANT_STRIKE</span>
          <span style={{ width:6, height:6, background:C.primary, display:"inline-block" }}/>
          <span>LIVE DATA FEED</span>
        </div>
      </header>

      {/* Podium */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32, alignItems:"end" }}>
        {[PODIUM[1],PODIUM[0],PODIUM[2]].map((p,idx)=>{
          const isFirst = idx===1;
          const bc = isFirst?C.primary:idx===0?C.secondary:C.tertiary;
          const h = isFirst?380:idx===0?300:260;
          return (
            <div key={p.rank} style={{ background:isFirst?C.surf:C.surfLow, padding:isFirst?32:24, borderBottom:`${isFirst?8:4}px solid ${bc}`, height:h, display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
              {isFirst&&<div style={{ position:"absolute", top:12, right:12, fontSize:28, color:C.tertiary }}>★</div>}
              <div style={{ marginBottom:12 }}><span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:isFirst?56:40, fontWeight:900, fontStyle:isFirst?"italic":"normal", color:`${bc}44` }}>{p.rank}</span></div>
              <div style={{ position:"relative", marginBottom:14 }}>
                <Avatar name={p.rosterKey} size={isFirst?120:88} />
                <div style={{ position:"absolute", bottom:-6, right:-6, background:bc, padding:"3px 8px", fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:900, color:isFirst?C.onPrimary:idx===0?C.onSecondary:"#453900", textTransform:"uppercase" }}>{p.badge}</div>
              </div>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:isFirst?26:18, fontWeight:900, textTransform:"uppercase", lineHeight:1, margin:"0 0 4px" }}>{p.name}</h3>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", color:bc, margin:"0 0 12px" }}>{p.wins.toLocaleString()} WINS / {p.losses} LOSSES</p>
              <div style={{ height:isFirst?8:4, background:C.surfHighest, overflow:"hidden" }}>
                <div style={{ width:`${p.pct}%`, height:"100%", background:bc, boxShadow:isFirst?`0 0 12px ${bc}`:"none" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left" }}>
          <thead>
            <tr style={{ background:C.surfHigh }}>
              {["RANK","OPERATOR","TOTAL STATS","1V1 RECORD","TEAM RECORD","RATING"].map((h,i)=>(
                <th key={h} style={{ padding:"14px 20px", fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.2em", color:C.onSurfVar, textAlign:i===5?"right":"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r,i)=>(
              <tr key={r.rank+i}
                style={{ background:i%2===0?C.surfLow:C.bg, borderBottom:`1px solid ${C.surf}`, transition:"background 0.15s", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surf}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.surfLow:C.bg}
              >
                <td style={{ padding:"18px 20px", fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:900, color:"#334155" }}>{r.rank}</td>
                <td style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <Avatar name={r.rosterKey} size={44} grayscale />
                    <div>
                      <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:900, textTransform:"uppercase", lineHeight:1, margin:"0 0 3px" }}>{r.name}</p>
                      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#64748b", margin:0 }}>{r.sub}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:900, textTransform:"uppercase", marginBottom:4 }}>
                    <span>W: {r.wins}</span><span>L: {r.losses}</span>
                  </div>
                  <div style={{ height:4, background:C.surfHighest, width:110 }}>
                    <div style={{ height:"100%", width:`${r.rating}%`, background:r.barColor }}/>
                  </div>
                </td>
                <td style={{ padding:"18px 20px", fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700, color:C.tertiary }}>{r.oneV}</td>
                <td style={{ padding:"18px 20px", fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700, color:C.secondary }}>{r.team}</td>
                <td style={{ padding:"18px 20px", textAlign:"right", fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:900, fontStyle:"italic",
                  color: r.rating>=75?C.tertiary:r.rating>=55?C.onSurface:C.onSurfVar }}>
                  {r.rating}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:40, display:"flex", justifyContent:"center" }}>
        {hasMore
          ? <button onClick={()=>setPage(p=>p+1)} style={{ background:C.surfHigh, color:C.onSurface, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, fontSize:13, textTransform:"uppercase", letterSpacing:"0.08em", padding:"20px 48px", border:"none", borderRight:`4px solid ${C.primary}`, cursor:"pointer" }}>
              LOAD NEXT {Math.min(TABLE_PAGE, TABLE_ROWS.length-visible.length)} OPERATORS
            </button>
          : <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, textTransform:"uppercase", letterSpacing:"0.16em", color:C.onSurfVar, padding:"20px 0" }}>
              ALL OPERATORS LOADED — END OF SEASON_04 RECORD
            </div>
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */function BottomNav({ page, setPage }) {
  const items=[{key:"arena",label:"BATTLE",icon:"⚔"},{key:"recent",label:"RECORDS",icon:"⏱"},{key:"rankings",label:"ROSTER",icon:"▲"}];
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, height:70, background:C.bg, display:"flex", boxShadow:"0 -10px 30px rgba(0,0,0,0.5)" }}>
      {items.map(it=>{
        const active=page===it.key;
        return <button key={it.key} onClick={()=>setPage(it.key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, color:active?"#FF003C":"#64748b", background:active?C.surfHigh:"none", borderTop:active?"2px solid #FF003C":"2px solid transparent", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase" }}><span style={{ fontSize:18 }}>{it.icon}</span>{it.label}</button>;
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("arena");
  return (
    <div style={gStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        button { transition: opacity 0.15s, transform 0.1s; }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.98); }
        @media (max-width: 1024px) { .side-nav { display: none !important; } }
        @media (min-width: 1025px) { .bottom-nav { display: none !important; } }
      `}</style>

      <TopNav page={page} setPage={setPage} />
      <div className="side-nav"><SideNav page={page} setPage={setPage} /></div>

      <main style={{ paddingTop:88, paddingBottom:96, paddingLeft:"clamp(16px,2vw,32px)", paddingRight:"clamp(16px,2vw,32px)" }}>
        <style>{`@media (min-width: 1025px) { main { margin-left: 256px; } }`}</style>
        {page==="arena"    && <ArenaPage />}
        {page==="recent"   && <RecentBattlesPage />}
        {page==="rankings" && <RankingsPage />}
      </main>

      <div className="bottom-nav"><BottomNav page={page} setPage={setPage} /></div>
    </div>
  );
}
