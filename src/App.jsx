import { useState } from "react";

const MAX_FIGHTERS = 5;

const EXAMPLES = [
  { label: "Goku vs Superman", urls: ["https://vsbattles.fandom.com/wiki/Goku", "https://vsbattles.fandom.com/wiki/Superman"] },
  { label: "Naruto vs Luffy vs Ichigo", urls: ["https://vsbattles.fandom.com/wiki/Naruto_Uzumaki", "https://vsbattles.fandom.com/wiki/Monkey_D._Luffy", "https://vsbattles.fandom.com/wiki/Ichigo_Kurosaki"] },
];

const ROUND_COLORS = ["#e8b800", "#C0202A", "#2250A8", "#1A6E3C", "#5A3A8A"];

function validateUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("fandom.com") && u.pathname.startsWith("/wiki/") && u.pathname.length > 6;
  } catch { return false; }
}

function extractCharName(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || parts[parts.length - 2]).replace(/_/g, " ");
  } catch { return url; }
}

function extractWikiName(url) {
  try { return new URL(url).hostname.split(".")[0]; }
  catch { return "wiki"; }
}

function FighterInput({ index, url, onChange, onRemove, canRemove }) {
  const isValid = url ? validateUrl(url) : null;
  const color = ROUND_COLORS[index];
  return (
    <div style={{background:"#12121e", borderRadius:"var(--border-radius-md)", padding:"12px 14px", border:`1px solid ${url && isValid ? color+"55" : url && !isValid ? "#a32d2d" : "#2a2a40"}`, marginBottom:"8px"}}>
      <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"7px", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <div style={{width:"22px", height:"22px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:500, color: index === 0 ? "#0d0d14" : "#fff", flexShrink:0}}>{index + 1}</div>
          <span style={{fontSize:"11px", fontWeight:500, color:color, textTransform:"uppercase", letterSpacing:"0.08em"}}>
            {url && isValid ? extractCharName(url) : `Fighter ${index + 1}`}
          </span>
          {url && isValid && <span style={{fontSize:"10px", color:"rgba(255,255,255,0.35)"}}>· {extractWikiName(url)}</span>}
        </div>
        {canRemove && <button onClick={onRemove} style={{background:"transparent", border:"none", color:"rgba(255,255,255,0.25)", cursor:"pointer", fontSize:"16px", padding:"0 4px", lineHeight:1}}>×</button>}
      </div>
      <div style={{position:"relative"}}>
        <input type="text" value={url} onChange={e => onChange(e.target.value)} placeholder="https://vsbattles.fandom.com/wiki/Character or any fandom wiki"
          style={{width:"100%", boxSizing:"border-box", background:"#0d0d14", border:`1px solid ${url && isValid ? color+"66" : url && !isValid ? "#a32d2d55" : "#2a2a40"}`, color:"#fff", borderRadius:"var(--border-radius-md)", padding:"8px 32px 8px 10px", fontSize:"12px"}} />
        {url && isValid && <span style={{position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", color:"#1a6e3c", fontSize:"14px"}}>✓</span>}
        {url && !isValid && <span style={{position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", color:"#a32d2d", fontSize:"14px"}}>✕</span>}
      </div>
    </div>
  );
}

function RoundCard({ round, index, fighterColors }) {
  const [expanded, setExpanded] = useState(false);
  const winnerColor = fighterColors[round.winner_index] || "#e8b800";
  return (
    <div style={{border:`1px solid ${winnerColor}33`, borderRadius:"var(--border-radius-md)", marginBottom:"10px", overflow:"hidden"}}>
      <div onClick={() => setExpanded(!expanded)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", cursor:"pointer", background:"rgba(255,255,255,0.03)"}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <div style={{width:"24px", height:"24px", borderRadius:"50%", background:winnerColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:500, color:"#0d0d14", flexShrink:0}}>{index + 1}</div>
          <span style={{fontSize:"13px", fontWeight:500, color:"#fff"}}>{round.title}</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <span style={{fontSize:"11px", padding:"2px 8px", borderRadius:"8px", background:winnerColor+"22", color:winnerColor, border:`1px solid ${winnerColor}44`}}>{round.winner} wins</span>
          <span style={{color:"rgba(255,255,255,0.3)", fontSize:"12px"}}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{padding:"12px 14px", borderTop:`1px solid ${winnerColor}22`, background:"#0d0d14"}}>
          <p style={{fontSize:"13px", color:"rgba(255,255,255,0.78)", margin:"0 0 8px", lineHeight:1.7}}>{round.narrative}</p>
          <p style={{fontSize:"12px", color:"rgba(255,255,255,0.4)", margin:0, fontStyle:"italic"}}>{round.reasoning}</p>
        </div>
      )}
    </div>
  );
}

export default function VSBattles() {
  const [urls, setUrls] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const validUrls = urls.filter(u => u && validateUrl(u));
  const canGenerate = validUrls.length >= 2 && !loading;

  function updateUrl(i, val) { const n = [...urls]; n[i] = val; setUrls(n); setResult(null); }
  function addFighter() { if (urls.length < MAX_FIGHTERS) setUrls([...urls, ""]); }
  function removeFighter(i) { setUrls(urls.filter((_, idx) => idx !== i)); setResult(null); }

  async function fetchCharData(url) {
    const charName = extractCharName(url);
    const wikiBase = url.match(/https?:\/\/[^/]+/)[0];
    const wikiName = extractWikiName(url);
    const apiUrl = `${wikiBase}/api/v1/Articles/AsSimpleJson?title=${encodeURIComponent(charName.replace(/ /g, "_"))}`;
    let content = "";
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
      const data = await res.json();
      const parsed = JSON.parse(data.contents);
      if (parsed.sections) {
        parsed.sections.slice(0, 8).forEach(s => {
          if (s.title) content += `\n## ${s.title}\n`;
          if (s.content) s.content.forEach(c => { if (c.text) content += c.text + " "; });
        });
      }
    } catch(e) {}
    return { name: charName, wiki: wikiName, content: content.trim().slice(0, 2000) };
  }

  async function generate() {
    if (!canGenerate) return;
    setLoading(true); setError(null); setResult(null);

    const fighters = [];
    for (let i = 0; i < validUrls.length; i++) {
      setLoadingMsg(`Fetching ${extractCharName(validUrls[i])}'s data…`);
      const data = await fetchCharData(validUrls[i]);
      fighters.push(data);
      await new Promise(r => setTimeout(r, 400));
    }

    setLoadingMsg("Analyzing power levels and abilities…");
    await new Promise(r => setTimeout(r, 600));
    setLoadingMsg("Scripting the battle…");

    const fighterList = fighters.map((f, i) => `Fighter ${i+1}: ${f.name} from ${f.wiki}${f.content ? `\nLore: ${f.content}` : ""}`).join("\n\n");

    const prompt = `You are a lore-accurate battle scripter. Based purely on each character's canonical abilities, feats, and power levels from their wiki pages, simulate a fight between these characters. Be fair and analytical — the winner must be determined by lore, not popularity.

${fighterList}

The fight should have 4-6 rounds. Each round focuses on a different aspect of the battle (opening clash, power escalation, tactical exchanges, finishing move, etc).

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "match_title": "dramatic title for this fight",
  "location": "a fitting battle location",
  "pre_fight_analysis": "2-3 sentences analyzing the matchup and power dynamics before the fight",
  "rounds": [
    {
      "title": "round title e.g. 'Opening Clash'",
      "narrative": "3-4 sentences of vivid fight narration for this round",
      "winner": "name of who wins this round",
      "winner_index": 0,
      "reasoning": "1-2 sentences of lore-based reasoning for why they won this round"
    }
  ],
  "winner": "name of overall winner",
  "winner_index": 0,
  "finish": "name of the finishing move or technique used",
  "verdict": "3-4 sentences explaining the lore-accurate verdict and why this character won",
  "power_rankings": [
    { "name": "character name", "tier": "e.g. Planet level", "score": 95 }
  ]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("");
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch(e) { setError("Battle simulation failed — check the URLs and try again."); }
    setLoading(false);
  }

  const fighterColors = validUrls.map((_, i) => ROUND_COLORS[i]);

  return (
    <div style={{fontFamily:"var(--font-sans)", padding:"1.5rem 0"}}>

      {/* Hero */}
      <div style={{background:"#0d0d14", borderRadius:"var(--border-radius-lg)", padding:"28px 20px 20px", marginBottom:"1.25rem", border:"1px solid #1e1e30", position:"relative"}}>
        {[["0","top","0","left"],["0","top","0","right"],["auto","bottom","0","left"],["auto","bottom","0","right"]].map(([t,vc,b,hc],i)=>(
          <div key={i} style={{position:"absolute", top:vc==="top"?"0":"auto", bottom:vc==="bottom"?"0":"auto", left:hc==="left"?"0":"auto", right:hc==="right"?"0":"auto", width:"32px", height:"32px",
            borderTop:vc==="top"?"2px solid #C0202A":"none", borderBottom:vc==="bottom"?"2px solid #C0202A":"none",
            borderLeft:hc==="left"?"2px solid #C0202A":"none", borderRight:hc==="right"?"2px solid #C0202A":"none",
            borderRadius:vc==="top"&&hc==="left"?"var(--border-radius-lg) 0 0 0":vc==="top"&&hc==="right"?"0 var(--border-radius-lg) 0 0":vc==="bottom"&&hc==="left"?"0 0 0 var(--border-radius-lg)":"0 0 var(--border-radius-lg) 0"}} />
        ))}

        <p style={{fontSize:"10px", fontWeight:500, color:"#C0202A", letterSpacing:"0.16em", textTransform:"uppercase", margin:"0 0 8px", textAlign:"center"}}>Fandom · Lore Battle Simulator</p>
        <h1 style={{fontSize:"30px", fontWeight:500, margin:"0 0 4px", color:"#fff", textAlign:"center"}}>VS Battles</h1>
        <p style={{fontSize:"13px", color:"rgba(255,255,255,0.35)", margin:"0 0 22px", textAlign:"center", lineHeight:1.5}}>Add up to 5 characters from any Fandom wiki. The lore decides who wins.</p>

        {/* Fighter inputs */}
        {urls.map((url, i) => (
          <FighterInput key={i} index={i} url={url} onChange={v => updateUrl(i, v)} onRemove={() => removeFighter(i)} canRemove={urls.length > 2} />
        ))}

        {/* Add fighter */}
        {urls.length < MAX_FIGHTERS && (
          <button onClick={addFighter} style={{width:"100%", padding:"8px", fontSize:"12px", background:"transparent", border:"1px dashed #2a2a40", color:"rgba(255,255,255,0.3)", borderRadius:"var(--border-radius-md)", cursor:"pointer", marginBottom:"12px"}}>
            + Add another fighter
          </button>
        )}

        {/* Examples */}
        <div style={{marginBottom:"16px"}}>
          <p style={{fontSize:"10px", color:"rgba(255,255,255,0.2)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.1em"}}>Try an example</p>
          <div style={{display:"flex", gap:"6px", flexWrap:"wrap"}}>
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={() => { setUrls([...ex.urls, ...Array(Math.max(0, urls.length - ex.urls.length)).fill("")]); setResult(null); }}
                style={{fontSize:"11px", padding:"4px 10px", background:"transparent", border:"1px solid #2a2a40", color:"rgba(255,255,255,0.4)", borderRadius:"var(--border-radius-md)", cursor:"pointer"}}>{ex.label}</button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={!canGenerate}
          style={{width:"100%", padding:"14px", fontSize:"15px", fontWeight:500, cursor:!canGenerate?"not-allowed":"pointer", opacity:!canGenerate?0.4:1,
            background:canGenerate?"#C0202A":"#1a1a2e", color:"#fff", border:"none", borderRadius:"var(--border-radius-md)"}}>
          {loading ? loadingMsg : "Simulate Battle"}
        </button>
      </div>

      {error && <p style={{color:"var(--color-text-danger)", fontSize:"13px", marginBottom:"1rem"}}>{error}</p>}

      {/* Result */}
      {result && (
        <div style={{borderRadius:"var(--border-radius-lg)", overflow:"hidden", border:"1px solid #C0202A44"}}>

          {/* Header */}
          <div style={{background:"#C0202A", padding:"12px 16px", textAlign:"center"}}>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.7)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.1em"}}>{result.location}</p>
            <h2 style={{fontSize:"20px", fontWeight:500, color:"#fff", margin:0}}>{result.match_title}</h2>
          </div>

          <div style={{background:"#0d0d14", padding:"16px 20px"}}>

            {/* Pre-fight */}
            <div style={{marginBottom:"16px", paddingBottom:"16px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em"}}>Pre-fight analysis</p>
              <p style={{fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.7}}>{result.pre_fight_analysis}</p>
            </div>

            {/* Power rankings */}
            {result.power_rankings && (
              <div style={{marginBottom:"16px", paddingBottom:"16px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em"}}>Power rankings</p>
                <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
                  {result.power_rankings.map((p, i) => (
                    <div key={i} style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={{width:"20px", height:"20px", borderRadius:"50%", background:ROUND_COLORS[i]||"#888", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:500, color:"#fff", flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:"12px", color:"#fff", width:"120px", flexShrink:0}}>{p.name}</span>
                      <div style={{flex:1, height:"6px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", overflow:"hidden"}}>
                        <div style={{width:`${p.score}%`, height:"100%", background:ROUND_COLORS[i]||"#888", borderRadius:"3px"}} />
                      </div>
                      <span style={{fontSize:"11px", color:"rgba(255,255,255,0.4)", width:"80px", textAlign:"right", flexShrink:0}}>{p.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rounds */}
            <div style={{marginBottom:"16px"}}>
              <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em"}}>Round by round</p>
              {result.rounds.map((r, i) => (
                <RoundCard key={i} round={r} index={i} fighterColors={ROUND_COLORS} />
              ))}
            </div>

            {/* Winner */}
            <div style={{background:"#C0202A11", border:"1px solid #C0202A44", borderRadius:"var(--border-radius-md)", padding:"16px"}}>
              <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.08em"}}>Lore verdict</p>
              <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px"}}>
                <div style={{width:"32px", height:"32px", borderRadius:"50%", background:ROUND_COLORS[result.winner_index]||"#C0202A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:500, color:"#fff"}}>{(result.winner||"?").slice(0,2).toUpperCase()}</div>
                <div>
                  <p style={{fontSize:"16px", fontWeight:500, color:"#fff", margin:0}}>{result.winner}</p>
                  <p style={{fontSize:"11px", color:"rgba(255,255,255,0.4)", margin:0}}>wins via {result.finish}</p>
                </div>
              </div>
              <p style={{fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.7}}>{result.verdict}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}