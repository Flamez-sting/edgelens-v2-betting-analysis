import React,{useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {Activity,AlertTriangle,ArrowDown,ArrowUp,BarChart3,Bell,Calculator,ChevronDown,CircleDollarSign,Eye,Filter,LineChart,RefreshCw,Search,ShieldCheck,Star,TrendingUp,X} from "lucide-react";
import "./styles.css";

const markets=[
 {id:1,match:"Arsenal vs Chelsea",sport:"Football",market:"1X2",selection:"Arsenal",fair:0.57,books:[["Bet365",1.95],["Betway",2.02],["SportPesa",1.91]],move:+6.2},
 {id:2,match:"Man City vs Liverpool",sport:"Football",market:"Over 2.5",selection:"Over 2.5",fair:0.62,books:[["Betway",1.86],["Bet365",1.92],["SportPesa",1.80]],move:-3.4},
 {id:3,match:"Lakers vs Warriors",sport:"Basketball",market:"Moneyline",selection:"Warriors",fair:0.54,books:[["Bet365",2.08],["Betway",2.01],["SportPesa",2.12]],move:+4.8},
 {id:4,match:"Barcelona vs Atletico",sport:"Football",market:"BTTS",selection:"Yes",fair:0.59,books:[["Betway",1.78],["Bet365",1.83],["SportPesa",1.76]],move:+2.1},
 {id:5,match:"Nadal vs Alcaraz",sport:"Tennis",market:"Match Winner",selection:"Alcaraz",fair:0.67,books:[["Bet365",1.58],["Betway",1.61],["SportPesa",1.55]],move:-1.9},
 {id:6,match:"Bayern vs Dortmund",sport:"Football",market:"Over 3.5",selection:"Over 3.5",fair:0.43,books:[["Betway",2.48],["Bet365",2.55],["SportPesa",2.40]],move:+8.7}
];

function implied(o){return 1/o}
function bestBook(m){return m.books.reduce((a,b)=>b[1]>a[1]?b:a)}
function edge(m){return bestBook(m)[1]*m.fair-1}
function App(){
 const [sport,setSport]=useState("All"),[minEdge,setMinEdge]=useState(0),[query,setQuery]=useState(""),[tab,setTab]=useState("scanner");
 const [watch,setWatch]=useState(()=>JSON.parse(localStorage.getItem("edgelens-watch")||"[]"));
 const [bankroll,setBankroll]=useState(10000),[pct,setPct]=useState(2),[alerts,setAlerts]=useState(true);
 const filtered=useMemo(()=>markets.filter(m=>(sport==="All"||m.sport===sport)&&edge(m)*100>=minEdge&&`${m.match} ${m.market} ${m.selection}`.toLowerCase().includes(query.toLowerCase())),[sport,minEdge,query]);
 const toggleWatch=id=>{const n=watch.includes(id)?watch.filter(x=>x!==id):[...watch,id];setWatch(n);localStorage.setItem("edgelens-watch",JSON.stringify(n))}
 const bestEdge=Math.max(...markets.map(edge))*100;
 const avg=markets.reduce((s,m)=>s+edge(m),0)/markets.length*100;
 return <div className="app">
  <header><div className="brand"><div className="logo">E</div><div><b>EdgeLens</b><span>Free Analysis</span></div></div>
   <div className="live"><i/> LIVE DATA MODE <small>demo feed</small></div>
   <button className="icon" onClick={()=>location.reload()} title="Refresh"><RefreshCw size={18}/></button>
   <button className="icon" onClick={()=>setAlerts(!alerts)}><Bell size={18}/>{alerts&&<em/>}</button>
  </header>
  <section className="hero"><div><p className="eyebrow">ODDS INTELLIGENCE</p><h1>Find the market edge.</h1><p>Compare prices, estimate implied probability, track movement and monitor potential value in one place.</p></div>
   <div className="heroStats"><div><span>Markets</span><strong>{markets.length}</strong></div><div><span>Best edge</span><strong>{bestEdge.toFixed(1)}%</strong></div><div><span>Avg edge</span><strong>{avg.toFixed(1)}%</strong></div></div>
  </section>
  <nav className="tabs">{[["scanner","Edge Scanner",Activity],["movement","Line Movement",LineChart],["arbitrage","Arbitrage",ShieldCheck],["calculator","Stake Calculator",Calculator],["watchlist","Watchlist",Star]].map(([id,label,I])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}><I size={16}/>{label}{id==="watchlist"&&watch.length>0?<b className="count">{watch.length}</b>:null}</button>)}</nav>
  {tab==="scanner"&&<main>
   <div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search match, market..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
    <div className="select"><Filter size={16}/><select value={sport} onChange={e=>setSport(e.target.value)}><option>All</option><option>Football</option><option>Basketball</option><option>Tennis</option></select><ChevronDown size={15}/></div>
    <label className="range">Min edge <b>{minEdge}%</b><input type="range" min="0" max="15" step="1" value={minEdge} onChange={e=>setMinEdge(+e.target.value)}/></label>
   </div>
   <div className="notice"><AlertTriangle size={17}/><span><b>Analysis only:</b> EdgeLens uses displayed/demo prices in this build. It does not guarantee outcomes or place bets.</span></div>
   <div className="tableWrap"><table><thead><tr><th>MARKET</th><th>SELECTION</th><th>BEST ODDS</th><th>IMPLIED</th><th>FAIR PROB.</th><th>EDGE</th><th>MOVEMENT</th><th></th></tr></thead>
   <tbody>{filtered.map(m=>{const best=bestBook(m),e=edge(m),imp=implied(best[1]);return <tr key={m.id}><td><strong>{m.match}</strong><small>{m.sport} · {m.market}</small></td><td>{m.selection}</td><td><b>{best[1].toFixed(2)}</b><small>{best[0]}</small></td><td>{(imp*100).toFixed(1)}%</td><td>{(m.fair*100).toFixed(1)}%</td><td><span className={e>0?"positive":"negative"}>{(e*100).toFixed(1)}%</span></td><td><span className={m.move>=0?"up":"down"}>{m.move>=0?<ArrowUp size={14}/>:<ArrowDown size={14}/>} {Math.abs(m.move).toFixed(1)}%</span></td><td><button className={watch.includes(m.id)?"star on":"star"} onClick={()=>toggleWatch(m.id)}><Star size={17} fill={watch.includes(m.id)?"currentColor":"none"}/></button></td></tr>})}</tbody></table></div>
  </main>}
  {tab==="movement"&&<main><Panel title="Market movement monitor" icon={<LineChart/>}><div className="cards">{markets.map(m=><div className="moveCard" key={m.id}><div><small>{m.sport}</small><h3>{m.match}</h3><span>{m.market} · {m.selection}</span></div><strong className={m.move>=0?"up":"down"}>{m.move>=0?"+":""}{m.move}%</strong><div className="spark">{[22,35,30,48,42,58,50,68].map((x,i)=><i key={i} style={{height:x+"%"}}/>)}</div><small>Opening → current price movement</small></div>)}</div></Panel></main>}
  {tab==="arbitrage"&&<main><Panel title="Arbitrage scanner" icon={<ShieldCheck/>}><div className="emptyState"><ShieldCheck size={42}/><h2>Cross-book opportunity monitor</h2><p>Compare opposite outcomes across supported bookmakers. This free build provides the interface and calculation engine; live bookmaker feeds must be connected separately.</p><div className="arbBox"><span>Example market</span><b>2-way market</b><span>Best A: 2.10 · Best B: 2.05</span><strong>Combined implied: {(100/2.10+100/2.05).toFixed(1)}%</strong></div></div></Panel></main>}
  {tab==="calculator"&&<main><Panel title="Stake & exposure calculator" icon={<Calculator/>}><div className="calc"><label>Bankroll<input type="number" value={bankroll} onChange={e=>setBankroll(+e.target.value)}/></label><label>Stake %<input type="number" min="0" max="100" step=".5" value={pct} onChange={e=>setPct(+e.target.value)}/></label><div className="calcResult"><span>Suggested stake</span><strong>KES {(bankroll*pct/100).toLocaleString()}</strong><small>{pct}% of KES {bankroll.toLocaleString()}</small></div></div></Panel></main>}
  {tab==="watchlist"&&<main><Panel title="Saved markets" icon={<Star/>}>{watch.length?<div className="cards">{markets.filter(m=>watch.includes(m.id)).map(m=><div className="watchCard" key={m.id}><Star fill="currentColor"/><div><b>{m.match}</b><span>{m.market} · {m.selection}</span></div><strong>{(edge(m)*100).toFixed(1)}% edge</strong><button onClick={()=>toggleWatch(m.id)}><X size={16}/></button></div>)}</div>:<div className="emptyState"><Star size={40}/><h2>Your watchlist is empty</h2><p>Star markets in the Edge Scanner to track them here.</p></div>}</Panel></main>}
  <footer><span>EdgeLens Free v2.0</span><span>Prices shown in this build are demonstration data.</span></footer>
 </div>
}
function Panel({title,icon,children}){return <div className="panel"><div className="panelHead">{icon}<h2>{title}</h2></div>{children}</div>}
createRoot(document.getElementById("root")).render(<App/>);
