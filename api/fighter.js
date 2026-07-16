// api/fighter.js — Vercel serverless function
// Fetches and parses VS Battles wiki stats for a given character page

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing name param' });

  try {
    const url = `https://vsbattles.fandom.com/api.php?action=parse&page=${encodeURIComponent(name)}&prop=wikitext&format=json&origin=*`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArenaBot/1.0)',
        'Accept': 'application/json',
      }
    });

    if (!r.ok) return res.status(502).json({ error: `VS Battles API returned ${r.status}` });

    const data = await r.json();
    if (data.error) return res.status(404).json({ error: data.error.info || 'Page not found' });

    const wikitext = data?.parse?.wikitext?.['*'] || '';
    if (!wikitext) return res.status(404).json({ error: 'Empty page' });

    const parsed = parseStats(wikitext, name);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // cache 1hr on Vercel edge
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ── Scoring tables ──────────────────────────────────────────────────
const TIER_SCORES = {
  "boundless":100,"high outerverse":97,"outerverse":95,"low outerverse":93,
  "high hyperverse":90,"hyperverse":87,"high complex multiverse":84,
  "complex multiverse":81,"low complex multiverse":78,
  "multiverse+":75,"multiverse level+":75,"multiverse":72,"low multiverse":69,
  "universe level+":66,"universe+":66,"high universe":63,"universe":60,
  "multi-galaxy":57,"galaxy":54,"multi-solar system":51,"solar system":48,
  "large star":45,"star":43,"small star":41,"brown dwarf":39,
  "large planet":37,"planet":35,"small planet":33,"moon":31,
  "multi-continent":29,"continent":27,"large country":25,"country":23,
  "large island":19,"island":17,"large mountain":15,"mountain":14,
  "city":13,"large town":11,"town":10,"city block":7,
  "large building":6,"building":5,"small building":4,"wall":3,
  "street":2,"athlete":1,"human":0.5,"unknown":10,
};
const PREFIXED = {
  "2-a":75,"2-b":72,"2-c":69,"3-a":60,"3-b":57,"3-c":54,
  "4-a":51,"4-b":48,"4-c":43,"5-a":37,"5-b":35,"5-c":31,
  "6-a":27,"6-b":23,"6-c":17,"7-a":14,"7-b":13,"7-c":10,
  "8-a":8,"8-b":7,"8-c":5,"9-a":4,"9-b":3,"9-c":2,
  "high 4-c":45,"low 4-c":41,"high 5-a":39,"low 5-b":33,
  "high 6-a":29,"high 6-b":25,"high 6-c":19,"high 7-a":15,
  "low 7-c":9,"low 7-b":12,"low 2-c":66,"high 1-b":90,
  "high 1-c":84,"high 1-a":97,"low 1-c":78,"low 1-a":93,
};
const SPEED_SCORES = {
  "immeasurable":100,"massively ftl+":90,"massively ftl":85,
  "ftl+":80,"ftl":75,"relativistic+":65,"relativistic":60,
  "massively hypersonic+":45,"massively hypersonic":40,
  "high hypersonic+":35,"high hypersonic":32,
  "hypersonic+":28,"hypersonic":24,
  "supersonic+":20,"supersonic":17,
  "superhuman":6,"peak human":4,"unknown":5,
};
const HAX_LIST = [
  "reality warping","causality manipulation","soul manipulation",
  "void manipulation","time manipulation","death manipulation",
  "mind manipulation","bfr","power nullification","ability negation",
  "durability negation","existence erasure","fate manipulation",
  "conceptual manipulation","acausality","statistics amplification",
  "regeneration","immortality","transformation","resistance to soul manipulation",
  "resistance to mind manipulation",
];

function cleanWikitext(t) {
  return t
    .replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, '$1')  // [[link|text]] -> text
    .replace(/'''|''/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractField(wikitext, field) {
  const pattern = new RegExp(`\\|\\s*${field}\\s*=\\s*([\\s\\S]*?)(?=\\|\\s*\\w[\\w\\s]*\\s*=|\\}\\})`, 'i');
  const m = wikitext.match(pattern);
  if (!m) return '';
  return cleanWikitext(m[1]).slice(0, 400);
}

function scoreTier(t) {
  if (!t) return 10;
  t = t.toLowerCase().replace(/at least|at most|likely|far higher|higher|possibly|comparable to/g, '').trim();
  for (const [k, v] of Object.entries(PREFIXED)) if (t.includes(k)) return v;
  const sorted = Object.entries(TIER_SCORES).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sorted) if (t.includes(k)) return v;
  return 10;
}

function scoreSpeed(t) {
  if (!t) return 5;
  t = t.toLowerCase();
  const sorted = Object.entries(SPEED_SCORES).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sorted) if (t.includes(k)) return v;
  return 5;
}

function parseStats(wikitext, name) {
  const tier     = cleanWikitext(extractField(wikitext, 'tier')).slice(0, 100);
  const ap       = extractField(wikitext, 'ap');
  const speed    = extractField(wikitext, 'speed');
  const dur      = extractField(wikitext, 'durability');
  const powers   = extractField(wikitext, 'powers').slice(0, 600);

  const apScore  = scoreTier(ap || tier);
  const durScore = scoreTier(dur || tier);
  const spdScore = scoreSpeed(speed);

  // Hax detection
  const powersLower = powers.toLowerCase();
  const hax = HAX_LIST.filter(h => powersLower.includes(h));
  const haxScore = Math.min(hax.reduce((s, h) => {
    const weights = {
      "reality warping":20,"causality manipulation":18,"soul manipulation":15,
      "void manipulation":18,"time manipulation":15,"death manipulation":15,
      "mind manipulation":12,"bfr":12,"power nullification":15,
      "ability negation":15,"durability negation":20,"existence erasure":18,
      "fate manipulation":18,"conceptual manipulation":20,"acausality":10,
      "statistics amplification":5,"regeneration":8,"immortality":8,
      "transformation":5,"resistance to soul manipulation":8,
      "resistance to mind manipulation":8,
    };
    return s + (weights[h] || 5);
  }, 0), 100);

  const battleScore = Math.round(
    apScore * 0.35 + durScore * 0.20 + spdScore * 0.20 +
    70 * 0.10 + 80 * 0.08 + haxScore * 0.07   // intel/stamina default 70/80
  );

  return {
    name,
    tier,
    ap,
    speed,
    durability: dur,
    powers,
    hax: hax.slice(0, 8),
    scores: { ap: apScore, speed: spdScore, durability: durScore, hax: haxScore },
    battleScore,
  };
}
