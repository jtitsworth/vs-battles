import { useState } from "react";

const IMAGES = {
  Goku: "https://images2.imgbox.com/x76EZ2v.png",
  Luffy: "https://i.imgur.com/MEGAXtT.png",
  Naruto: "https://i.imgur.com/gi5Py5r.png",
  Superman: "https://i.imgur.com/zaR7KXy.png",
};

// Fallback: load images via fetch to bypass hotlink protection
function ImgWithFallback({ src, alt, style, fallback }) {
  const [imgSrc, setImgSrc] = React.useState(src);
  return <img src={imgSrc} alt={alt} style={style} onError={() => setImgSrc(null)} />;
}

const TEAM_COLORS = ["#e8b800", "#4A90D9"];

const MATCHUPS = [
  {
    id: "goku-superman",
    label: "Goku vs Superman",
    type: "1v1",
    teams: [
      [{ name: "Goku", wiki: "Dragon Ball Super", tier: "Universe level+", stats: { Strength: 95, Speed: 98, Durability: 93, Intelligence: 72 }, abilities: ["Ultra Instinct", "Super Saiyan Blue", "Kamehameha", "Ki Sensing", "Instant Transmission"] }],
      [{ name: "Superman", wiki: "DC Comics", tier: "Universe level", stats: { Strength: 96, Speed: 95, Durability: 97, Intelligence: 80 }, abilities: ["Heat Vision", "Flight", "Invulnerability", "Solar Absorption", "Super Speed"] }],
    ],
    matchup_summary: "Both fighters operate at universe-level power, but Goku's Ultra Instinct gives him an edge in pure combat reflexes. Superman's solar-powered durability and heat vision make him a formidable opponent, but Goku's battle experience and transformations tip the scales.",
    advantage: "Goku",
    advantage_reason: "Ultra Instinct autonomous dodging neutralizes Superman's raw power advantage.",
    match_title: "The Clash of Legends",
    location: "The World of Void",
    rounds: [
      { title: "Opening Clash", narrative: "The two titans collide with earth-shattering force, their first exchange leveling mountains across the horizon. Superman rockets forward with a haymaker that Goku barely sidesteps, retaliating with a sharp ki blast to the midsection. Both fighters size each other up — the air between them crackling with raw energy.", winner: "Draw", winner_team: 0, reasoning: "Neither fighter gains a clear advantage in the opening exchange." },
      { title: "Power Escalation", narrative: "Goku powers up to Super Saiyan Blue, his aura surging teal and golden. Superman absorbs ambient solar energy, his eyes glowing red as he unleashes a sustained heat vision beam. Goku deflects it with a Kamehameha, the beams colliding in a blinding explosion that shakes the arena.", winner: "Superman", winner_team: 1, reasoning: "Superman's heat vision overpowers Goku's Kamehameha at this power level, forcing Goku back." },
      { title: "Ultra Instinct Awakens", narrative: "Pushed to his limit, Goku's hair turns silver — Ultra Instinct Sign activates. His movements become fluid and automatic, dodging Superman's barrage without conscious thought. Each of Goku's counterstrikes lands with surgical precision, sending Superman crashing through a series of crystalline pillars.", winner: "Goku", winner_team: 0, reasoning: "Ultra Instinct's autonomous dodging completely counters Superman's speed and strength." },
      { title: "Final Exchange", narrative: "Superman summons every ounce of solar energy and charges a full-power punch while Goku winds up a Mastered Ultra Instinct Kamehameha. The two attacks meet — a blinding white explosion consumes the arena. When the light clears, Superman is on one knee, his cape torn.", winner: "Goku", winner_team: 0, reasoning: "Mastered Ultra Instinct's power output surpasses what Superman can absorb and redirect." },
    ],
    winning_team: "Goku",
    winner_team_index: 0,
    mvp: "Goku",
    finish: "Mastered Ultra Instinct Kamehameha",
    verdict: "Goku's Mastered Ultra Instinct proves to be the decisive factor in this legendary battle. While Superman's raw power and solar absorption make him nearly indestructible, Goku's autonomous combat reflexes allow him to consistently land clean hits while avoiding Superman's attacks entirely. The Saiyan warrior's lifelong dedication to surpassing his limits edges out the Man of Steel in a battle for the ages.",
  },
  {
    id: "naruto-luffy",
    label: "Naruto vs Luffy",
    type: "1v1",
    teams: [
      [{ name: "Naruto", wiki: "Naruto (New Era)", tier: "Large Star level", stats: { Strength: 88, Speed: 90, Durability: 85, Intelligence: 78 }, abilities: ["Baryon Mode", "Six Paths Sage Mode", "Rasenshuriken", "Shadow Clones", "Kurama Chakra"] }],
      [{ name: "Luffy", wiki: "One Piece", tier: "Star level", stats: { Strength: 85, Speed: 87, Durability: 82, Intelligence: 70 }, abilities: ["Gear Fifth", "Conqueror's Haki", "Advanced Armament Haki", "Rubber Body", "Sun God Nika"] }],
    ],
    matchup_summary: "Two of anime's most iconic protagonists clash in a battle of pure willpower and imagination. Naruto's Baryon Mode gives him a raw power edge while Luffy's Gear Fifth toon physics introduce unpredictability that even Naruto's combat experience struggles to account for.",
    advantage: "Naruto",
    advantage_reason: "Baryon Mode's life-force drain mechanic poses a unique threat Luffy's rubber body cannot negate.",
    match_title: "Will of Fire vs Freedom of the Sea",
    location: "Marineford Ruins",
    rounds: [
      { title: "Rival Energy", narrative: "Naruto opens with a barrage of shadow clones while Luffy stretches into Gear Third, his fist inflating to building size. The clones scatter as Luffy's punch pulverizes them, but the real Naruto appears above — crashing down with a Rasenshuriken that forces Luffy to coat himself in Armament Haki.", winner: "Naruto", winner_team: 0, reasoning: "Naruto's clone tactics create openings that Luffy's straightforward fighting style struggles to handle." },
      { title: "Gear Fifth Awakens", narrative: "Luffy laughs and activates Gear Fifth — his hair turns white, his body warping with cartoon elasticity. He grabs the ground itself like rubber and slingshots Naruto into the sky, then inflates his fist to the size of an island for a thunderous downward slam.", winner: "Luffy", winner_team: 1, reasoning: "Gear Fifth's reality-warping toon physics completely upends Naruto's tactical planning." },
      { title: "Baryon Mode", narrative: "Naruto's chakra flares into a deep crimson — Baryon Mode activates, burning Kurama's life force as fuel. His speed becomes incomprehensible, landing a dozen precise strikes in a fraction of a second. Each hit drains Luffy's vitality, the sun god's laugh growing slightly strained.", winner: "Naruto", winner_team: 0, reasoning: "Baryon Mode's life-drain bypasses Luffy's rubber durability entirely." },
      { title: "Last Man Standing", narrative: "Both fighters are breathing hard — Baryon Mode's cost weighing on Naruto as Luffy grins through the pain. Luffy unleashes a Bajrang Gun wrapped in Conqueror's Haki, the colossal fist meeting Naruto's final Tailed Beast Ball. The collision levels half the battlefield.", winner: "Naruto", winner_team: 0, reasoning: "Naruto's sustained power output in Baryon Mode edges Luffy's Gear Fifth at the margin." },
    ],
    winning_team: "Naruto",
    winner_team_index: 0,
    mvp: "Naruto",
    finish: "Baryon Mode Tailed Beast Ball",
    verdict: "Naruto's Baryon Mode proves decisive — the life-drain mechanic bypasses Luffy's rubber constitution in a way no conventional attack could. Luffy's Gear Fifth kept him competitive through pure creativity and will, but Naruto's combination of raw power escalation and tactical clones gave him too many angles to defend. An incredibly close fight that could go differently on another day.",
  },
  {
    id: "2v2",
    label: "Goku + Naruto vs Superman + Luffy",
    type: "2v2",
    teams: [
      [
        { name: "Goku", wiki: "Dragon Ball Super", tier: "Universe level+", stats: { Strength: 95, Speed: 98, Durability: 93, Intelligence: 72 }, abilities: ["Ultra Instinct", "Super Saiyan Blue", "Kamehameha", "Instant Transmission", "Ki Sensing"] },
        { name: "Naruto", wiki: "Naruto (New Era)", tier: "Large Star level", stats: { Strength: 88, Speed: 90, Durability: 85, Intelligence: 78 }, abilities: ["Baryon Mode", "Six Paths Sage Mode", "Rasenshuriken", "Shadow Clones", "Kurama Chakra"] },
      ],
      [
        { name: "Superman", wiki: "DC Comics", tier: "Universe level", stats: { Strength: 96, Speed: 95, Durability: 97, Intelligence: 80 }, abilities: ["Heat Vision", "Flight", "Invulnerability", "Solar Absorption", "Super Speed"] },
        { name: "Luffy", wiki: "One Piece", tier: "Star level", stats: { Strength: 85, Speed: 87, Durability: 82, Intelligence: 70 }, abilities: ["Gear Fifth", "Conqueror's Haki", "Advanced Armament Haki", "Rubber Body", "Sun God Nika"] },
      ],
    ],
    matchup_summary: "A dream team battle — Goku and Naruto's synergy is exceptional given both are tactical fighters who elevate under pressure. Superman and Luffy are a more volatile pairing but their combined durability and unpredictability make them dangerous. The match hinges on whether Superman can neutralize Goku before Naruto's clones overwhelm Luffy.",
    advantage: "Team 1",
    advantage_reason: "Goku and Naruto's power ceiling and combat synergy edges Team 2's raw durability.",
    match_title: "Infinite Convergence",
    location: "Tournament of Power Arena",
    rounds: [
      { title: "Team Tactics", narrative: "Goku and Naruto split immediately — Goku engaging Superman head-on while Naruto floods the field with a thousand shadow clones aimed at Luffy. Superman and Luffy struggle to coordinate, Luffy laughing as he bats clones away while Superman trades ki blasts with Goku.", winner: "Team 1", winner_team: 0, reasoning: "Goku and Naruto's instinctive teamwork overwhelms Superman and Luffy's looser coordination." },
      { title: "Gear Fifth Chaos", narrative: "Luffy activates Gear Fifth, turning the battlefield into a cartoon nightmare — grabbing lightning bolts and hurling them at Naruto, stretching the arena floor into a slingshot. Naruto switches to Sage Mode to read the nature energy, predicting Luffy's impossibly random movements.", winner: "Team 2", winner_team: 1, reasoning: "Luffy's Gear Fifth chaos disrupts Naruto's tactical plans and evens the field." },
      { title: "Dual Transformation", narrative: "Goku hits Ultra Instinct while Naruto ignites Baryon Mode simultaneously — a blinding pulse of energy radiates outward. Superman flies directly into Goku's autonomous counter-strike while Naruto's life-drain touches reach Luffy, the sun god's laughter finally faltering.", winner: "Team 1", winner_team: 0, reasoning: "Simultaneous peak transformations overwhelm Team 2's ability to respond." },
      { title: "Final Stand", narrative: "Superman pushes past his limits with a planetary-force punch aimed at both Goku and Naruto — Goku teleports them out via Instant Transmission while Naruto leaves a clone to absorb the blow. Reappearing behind Superman, Goku and Naruto unleash a combined Kamehameha-Rasenshuriken that Superman cannot absorb fast enough.", winner: "Team 1", winner_team: 0, reasoning: "Instant Transmission combined with Naruto's clone tactics creates an unstoppable coordinated finishing move." },
    ],
    winning_team: "Team 1 (Goku + Naruto)",
    winner_team_index: 0,
    mvp: "Goku",
    finish: "Combined Kamehameha-Rasenshuriken",
    verdict: "Goku and Naruto's synergy proves to be the decisive factor — two fighters who have spent their entire lives pushing past limits in team environments, their coordination feels almost telepathic. Superman's universe-level power kept Team 2 competitive but Luffy's unpredictability, while useful solo, created coordination problems when Superman needed a reliable partner. The dual transformation in Round 3 sealed it.",
  },
];

function StatBar({ label, value, color }) {
  const pct = Math.min(100, Math.max(0, value));
  const tier = pct >= 90 ? "Max" : pct >= 70 ? "High" : pct >= 50 ? "Mid" : "Low";
  return (
    <div style={{marginBottom:"6px"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"2px"}}>
        <span style={{fontSize:"11px", color:"rgba(255,255,255,0.55)"}}>{label}</span>
        <span style={{fontSize:"11px", color, fontWeight:500}}>{tier}</span>
      </div>
      <div style={{height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", overflow:"hidden"}}>
        <div style={{width:`${pct}%`, height:"100%", background:color, borderRadius:"3px"}} />
      </div>
    </div>
  );
}

function RoundCard({ round, index }) {
  const [open, setOpen] = useState(false);
  const color = round.winner === "Draw" ? "#888" : TEAM_COLORS[round.winner_team];
  return (
    <div style={{border:`1px solid ${color}33`, borderRadius:"var(--border-radius-md)", marginBottom:"8px", overflow:"hidden"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", cursor:"pointer", background:"rgba(255,255,255,0.03)"}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <div style={{width:"22px", height:"22px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:500, color:"#0d0d14"}}>{index+1}</div>
          <span style={{fontSize:"13px", fontWeight:500, color:"#fff"}}>{round.title}</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <span style={{fontSize:"11px", padding:"2px 8px", borderRadius:"8px", background:color+"22", color, border:`1px solid ${color}44`}}>{round.winner} wins</span>
          <span style={{color:"rgba(255,255,255,0.3)", fontSize:"12px"}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{padding:"12px 14px", borderTop:`1px solid ${color}22`, background:"#0d0d14"}}>
          <p style={{fontSize:"13px", color:"rgba(255,255,255,0.8)", margin:"0 0 8px", lineHeight:1.7}}>{round.narrative}</p>
          <p style={{fontSize:"12px", color:"rgba(255,255,255,0.4)", margin:0, fontStyle:"italic"}}>{round.reasoning}</p>
        </div>
      )}
    </div>
  );
}

function FighterCard({ fighter, color, showImage }) {
  return (
    <div style={{background:"#12121e", borderRadius:"var(--border-radius-md)", border:`1px solid ${color}44`, overflow:"hidden"}}>
      <div style={{height:"220px", background:`${color}08`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", borderBottom:`1px solid ${color}22`}}>
        {showImage ? (
          <img src={IMAGES[fighter.name]} alt={fighter.name} style={{width:"100%", height:"220px", objectFit:"cover", objectPosition:"top center"}} />
        ) : (
          <div style={{width:"60px", height:"80px", borderRadius:"4px", background:`${color}22`, border:`2px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"8px", fontSize:"18px", fontWeight:500, color}}>{fighter.name.slice(0,2).toUpperCase()}</div>
        )}
      </div>
      <div style={{padding:"10px 12px"}}>
        <p style={{fontSize:"14px", fontWeight:500, color, margin:"0 0 1px"}}>{fighter.name}</p>
        <div style={{display:"flex", gap:"5px", alignItems:"center", marginBottom:"8px"}}>
          <span style={{fontSize:"10px", color:"rgba(255,255,255,0.3)"}}>{fighter.wiki}</span>
          <span style={{fontSize:"9px", padding:"1px 5px", borderRadius:"4px", background:color+"22", color, border:`0.5px solid ${color}44`}}>{fighter.tier}</span>
        </div>
        {Object.entries(fighter.stats).map(([k,v])=><StatBar key={k} label={k} value={v} color={color} />)}
        <div style={{marginTop:"8px"}}>
          <p style={{fontSize:"9px", color:"rgba(255,255,255,0.25)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.06em"}}>Abilities</p>
          <div style={{display:"flex", flexWrap:"wrap", gap:"3px"}}>
            {fighter.abilities.map(a=><span key={a} style={{fontSize:"10px", color:"rgba(255,255,255,0.6)", padding:"2px 6px", background:"rgba(255,255,255,0.04)", borderRadius:"4px"}}>{a}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VSBattlesDemo() {
  const [activeMatchup, setActiveMatchup] = useState(0);
  const [stage, setStage] = useState("setup");
  const m = MATCHUPS[activeMatchup];
  const winColor = TEAM_COLORS[m.winner_team_index];

  function selectMatchup(i) { setActiveMatchup(i); setStage("setup"); }

  const hasImage = (name) => !!IMAGES[name];

  return (
    <div style={{fontFamily:"var(--font-sans)", padding:"1.5rem 0"}}>

      {/* Header */}
      <div style={{background:"#0d0d14", borderRadius:"var(--border-radius-lg)", padding:"20px", border:"1px solid #1e1e30", marginBottom:"1rem", position:"relative"}}>
        {[[true,true],[false,true],[true,false],[false,false]].map(([top,left],i)=>(
          <div key={i} style={{position:"absolute", top:top?"0":"auto", bottom:top?"auto":"0", left:left?"0":"auto", right:left?"auto":"0", width:"28px", height:"28px",
            borderTop:top?"2px solid #C0202A":"none", borderBottom:top?"none":"2px solid #C0202A",
            borderLeft:left?"2px solid #C0202A":"none", borderRight:left?"none":"2px solid #C0202A",
            borderRadius:top&&left?"var(--border-radius-lg) 0 0 0":top&&!left?"0 var(--border-radius-lg) 0 0":!top&&left?"0 0 0 var(--border-radius-lg)":"0 0 var(--border-radius-lg) 0"}} />
        ))}
        <p style={{fontSize:"10px", fontWeight:500, color:"#C0202A", letterSpacing:"0.16em", textTransform:"uppercase", margin:"0 0 4px", textAlign:"center"}}>Fandom · Lore Battle Simulator</p>
        <h1 style={{fontSize:"26px", fontWeight:500, margin:"0 0 16px", color:"#fff", textAlign:"center"}}>VS Battles</h1>

        {/* Matchup selector tabs */}
        <div style={{display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap"}}>
          {MATCHUPS.map((m,i)=>(
            <button key={m.id} onClick={()=>selectMatchup(i)}
              style={{fontSize:"12px", padding:"7px 14px", background: activeMatchup===i ? "#C0202A" : "#1a1a2e", border:`1px solid ${activeMatchup===i ? "#C0202A" : "#3a3a55"}`, color: activeMatchup===i ? "#fff" : "rgba(255,255,255,0.55)", borderRadius:"var(--border-radius-md)", cursor:"pointer", fontWeight: activeMatchup===i ? 500 : 400}}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stage nav */}
      <div style={{display:"flex", gap:"6px", marginBottom:"1rem"}}>
        {["setup","matchup","result"].map(s=>(
          <button key={s} onClick={()=>setStage(s)}
            style={{flex:1, padding:"9px", fontSize:"12px", background: stage===s ? "#1a1a2e" : "transparent", border:`1px solid ${stage===s ? "#3a3a55" : "#1e1e30"}`, color: stage===s ? "#fff" : "rgba(255,255,255,0.3)", borderRadius:"var(--border-radius-md)", cursor:"pointer", textTransform:"capitalize", fontWeight: stage===s ? 500 : 400}}>
            {s === "setup" ? "Fight Card" : s === "matchup" ? "Matchup Analysis" : "Battle Result"}
          </button>
        ))}
      </div>

      {/* ── SETUP STAGE ── */}
      {stage==="setup" && (
        <div style={{background:"#0d0d14", borderRadius:"var(--border-radius-lg)", border:"1px solid #1e1e30", overflow:"hidden"}}>
          <div style={{background:"#C0202A", padding:"8px 16px", textAlign:"center"}}>
            <p style={{fontSize:"12px", fontWeight:500, color:"#fff", margin:0, letterSpacing:"0.06em"}}>{m.label}</p>
          </div>
          <div style={{padding:"16px", display:"grid", gridTemplateColumns: m.teams[0].length > 1 ? "1fr auto 1fr" : "1fr auto 1fr", gap:"12px", alignItems:"start"}}>
            {/* Team 1 */}
            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              <p style={{fontSize:"10px", fontWeight:500, color:TEAM_COLORS[0], textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px", textAlign:"center"}}>Team 1</p>
              {m.teams[0].map((f,i)=><FighterCard key={i} fighter={f} color={TEAM_COLORS[0]} showImage={hasImage(f.name)} />)}
            </div>

            {/* VS */}
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"40px", gap:"8px"}}>
              <div style={{width:"1px", height:"30px", background:"#2a2a40"}} />
              <div style={{width:"40px", height:"40px", borderRadius:"50%", background:"#C0202A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:500, color:"#fff"}}>VS</div>
              <div style={{width:"1px", height:"30px", background:"#2a2a40"}} />
            </div>

            {/* Team 2 */}
            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              <p style={{fontSize:"10px", fontWeight:500, color:TEAM_COLORS[1], textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px", textAlign:"center"}}>Team 2</p>
              {m.teams[1].map((f,i)=><FighterCard key={i} fighter={f} color={TEAM_COLORS[1]} showImage={hasImage(f.name)} />)}
            </div>
          </div>
          <div style={{padding:"12px 16px", borderTop:"1px solid #1e1e30"}}>
            <button onClick={()=>setStage("matchup")} style={{width:"100%", padding:"13px", fontSize:"14px", fontWeight:500, background:"#C0202A", color:"#fff", border:"none", borderRadius:"var(--border-radius-md)", cursor:"pointer"}}>
              View Matchup Analysis →
            </button>
          </div>
        </div>
      )}

      {/* ── MATCHUP STAGE ── */}
      {stage==="matchup" && (
        <div style={{background:"#0d0d14", borderRadius:"var(--border-radius-lg)", border:"1px solid #2a2a40", overflow:"hidden"}}>
          <div style={{background:"#C0202A", padding:"8px 16px", textAlign:"center"}}>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.8)", margin:0, textTransform:"uppercase", letterSpacing:"0.1em"}}>Lore Matchup Details</p>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
            {m.teams.map((team,ti)=>{
              const color = TEAM_COLORS[ti];
              return (
                <div key={ti} style={{padding:"14px", borderRight:ti===0?"1px solid #1e1e30":"none"}}>
                  <p style={{fontSize:"11px", fontWeight:500, color, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px"}}>Team {ti+1}</p>
                  {team.map((f,fi)=>(
                    <div key={fi} style={{marginBottom:"16px", paddingBottom:"16px", borderBottom: fi<team.length-1?"1px solid #1e1e30":"none"}}>
                      <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px"}}>
                        <div style={{width:"44px", height:"54px", borderRadius:"4px", overflow:"hidden", background:`${color}11`, border:`1px solid ${color}33`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          {hasImage(f.name) ? <img src={IMAGES[f.name]} alt={f.name} style={{width:"100%", height:"100%", objectFit:"contain", objectPosition:"center"}} /> : <span style={{fontSize:"10px", color, fontWeight:500}}>{f.name.slice(0,2).toUpperCase()}</span>}
                        </div>
                        <div>
                          <p style={{fontSize:"13px", fontWeight:500, color, margin:0}}>{f.name}</p>
                          <div style={{display:"flex", gap:"4px", marginTop:"2px"}}>
                            <span style={{fontSize:"9px", color:"rgba(255,255,255,0.3)"}}>{f.wiki}</span>
                            <span style={{fontSize:"9px", padding:"1px 5px", borderRadius:"4px", background:color+"22", color}}>{f.tier}</span>
                          </div>
                        </div>
                      </div>
                      {Object.entries(f.stats).map(([k,v])=><StatBar key={k} label={k} value={v} color={color} />)}
                      <div style={{marginTop:"8px"}}>
                        <p style={{fontSize:"9px", color:"rgba(255,255,255,0.25)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.06em"}}>Abilities</p>
                        <div style={{display:"flex", flexWrap:"wrap", gap:"3px"}}>
                          {f.abilities.map(a=><span key={a} style={{fontSize:"10px", color:"rgba(255,255,255,0.6)", padding:"2px 6px", background:"rgba(255,255,255,0.04)", borderRadius:"4px"}}>{a}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{padding:"12px 16px", borderTop:"1px solid #1e1e30", background:"rgba(255,255,255,0.02)", textAlign:"center"}}>
            <p style={{fontSize:"13px", color:"rgba(255,255,255,0.7)", margin:"0 0 5px", lineHeight:1.65}}>{m.matchup_summary}</p>
            <p style={{fontSize:"12px", color:"rgba(255,255,255,0.35)", margin:0, fontStyle:"italic"}}>Edge: <span style={{color:"#e8b800"}}>{m.advantage}</span> — {m.advantage_reason}</p>
          </div>
          <div style={{padding:"12px 16px", borderTop:"1px solid #1e1e30"}}>
            <button onClick={()=>setStage("result")} style={{width:"100%", padding:"13px", fontSize:"14px", fontWeight:500, background:"#C0202A", color:"#fff", border:"none", borderRadius:"var(--border-radius-md)", cursor:"pointer"}}>
              Simulate Battle →
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT STAGE ── */}
      {stage==="result" && (
        <div style={{background:"#0d0d14", borderRadius:"var(--border-radius-lg)", border:`1px solid ${winColor}44`, overflow:"hidden"}}>
          <div style={{background:"#C0202A", padding:"10px 16px", textAlign:"center"}}>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.7)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.1em"}}>{m.location}</p>
            <h2 style={{fontSize:"18px", fontWeight:500, color:"#fff", margin:0}}>{m.match_title}</h2>
          </div>
          <div style={{padding:"16px 20px"}}>
            <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em"}}>Round by round</p>
            {m.rounds.map((r,i)=><RoundCard key={i} round={r} index={i} />)}
            <div style={{marginTop:"16px", background:`${winColor}11`, border:`1px solid ${winColor}33`, borderRadius:"var(--border-radius-md)", padding:"16px"}}>
              <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"center"}}>Winner</p>
              <div style={{display:"flex", alignItems:"center", gap:"16px", marginBottom:"12px"}}>
                {hasImage(m.mvp) && (
                  <div style={{width:"60px", height:"80px", borderRadius:"var(--border-radius-md)", overflow:"hidden", border:`2px solid ${winColor}`, flexShrink:0}}>
                    <img src={IMAGES[m.mvp]} alt={m.mvp} style={{width:"100%", height:"100%", objectFit:"cover", objectPosition:"top"}} />
                  </div>
                )}
                <div>
                  <p style={{fontSize:"22px", fontWeight:500, color:winColor, margin:"0 0 2px"}}>{m.winning_team}</p>
                  <p style={{fontSize:"12px", color:"rgba(255,255,255,0.4)", margin:0}}>MVP: <span style={{color:winColor}}>{m.mvp}</span> · via {m.finish}</p>
                </div>
              </div>
              <p style={{fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.7}}>{m.verdict}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}