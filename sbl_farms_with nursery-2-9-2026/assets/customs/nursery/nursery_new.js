/* ============================================================
   PLANT DATA
   ============================================================ */
const PLANTS = [
  {
    id:"hibiscus",
    name:"Hibiscus",
    botanical:"Hibiscus rosa-sinensis",
    color:"red",
    stakeColor:"#C1382C",
    sun:"full-sun",
    height:"medium",
    heightCm:180,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/hibiscus,red,flower?lock=11",
    tagline:"The classic garden bloom",
    description:"A cheerful, everyday flowering shrub that keeps a garden looking finished. Large trumpet blooms open fresh each morning in shades from scarlet to soft peach, held above glossy, deep-green foliage that stays attractive all year.",
    specs:{water:"Moderate",bloom:"Year-round",spacing:"60–90 cm",growth:"Fast"},
    highlights:["Flowers nearly every month of the year","Tolerant of pruning — shapes into a neat hedge","Draws sunbirds and butterflies to the garden"]
  },
  {
    id:"bougainvillea",
    name:"Bougainvillea",
    botanical:"Bougainvillea glabra",
    color:"purple",
    stakeColor:"#8B5FBF",
    sun:"full-sun",
    height:"tall",
    heightCm:250,
    type:["climber","hedge"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/bougainvillea,flower?lock=12",
    tagline:"Papery colour by the armful",
    description:"Sold for its papery coloured bracts rather than its small true flowers, this vigorous, thorny climber smothers walls, arches and gates in continuous colour. Thrives on neglect once established and prefers to be kept a little dry.",
    specs:{water:"Low",bloom:"8–10 months",spacing:"90–150 cm",growth:"Vigorous"},
    highlights:["Best colour when soil is kept on the drier side","Can be trained as a climber, hedge or standard","Very low maintenance once rooted"]
  },
  {
    id:"ixora",
    name:"Ixora",
    botanical:"Ixora coccinea",
    color:"orange",
    stakeColor:"#E3752A",
    sun:"full-sun",
    height:"small",
    heightCm:90,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/ixora,flower?lock=13",
    tagline:"Jungle flame in tight clusters",
    description:"Dense, rounded clusters of small star-shaped florets sit above dark leathery leaves, giving the shrub a neat, tidy silhouette even without pruning. A dependable border and edging plant that flowers through the heat of summer.",
    specs:{water:"Moderate",bloom:"Summer–monsoon",spacing:"45–60 cm",growth:"Slow-moderate"},
    highlights:["Compact habit, ideal for borders and edging","Attracts butterflies with its nectar-rich clusters","Handles heat and part-day sun equally well"]
  },
  {
    id:"tecoma",
    name:"Yellow Bells",
    botanical:"Tecoma stans",
    color:"yellow",
    stakeColor:"#E9B830",
    sun:"full-sun",
    height:"tall",
    heightCm:280,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/tecoma,yellow,flower?lock=14",
    tagline:"Golden trumpets, fast and free",
    description:"A fast, upright shrub that can be kept trimmed as a hedge or let go as a small flowering tree. Clusters of bright yellow, bell-shaped flowers appear in flushes through the warmer months, followed by slender seed pods.",
    specs:{water:"Low-moderate",bloom:"Mar–Nov",spacing:"90–120 cm",growth:"Fast"},
    highlights:["One of the fastest growing flowering hedges","Good screening plant for boundary walls","Self-seeds readily once established"]
  },
  {
    id:"oleander",
    name:"Oleander",
    botanical:"Nerium oleander",
    color:"pink",
    stakeColor:"#E187A5",
    sun:"full-sun",
    height:"tall",
    heightCm:250,
    type:["hedge"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/oleander,pink,flower?lock=15",
    tagline:"Tough roadside beauty",
    description:"Narrow, leathery leaves and clusters of soft, five-petalled flowers make this one of the toughest flowering shrubs available — equally at home in a coastal garden or a dusty roadside median. Note: all parts are toxic if ingested.",
    specs:{water:"Low",bloom:"Almost year-round",spacing:"120–180 cm",growth:"Moderate"},
    highlights:["Extremely drought and heat tolerant","Excellent windbreak and privacy screen","Keep away from children and grazing animals"]
  },
  {
    id:"plumeria",
    name:"Plumeria",
    botanical:"Plumeria rubra",
    color:"white",
    stakeColor:"#F1EAD9",
    sun:"full-sun",
    height:"tall",
    heightCm:300,
    type:["fragrant"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/plumeria,frangipani,flower?lock=16",
    tagline:"The temple flower",
    description:"Thick, sculptural branches carry rosettes of leaves and clusters of waxy, intensely fragrant flowers, most fragrant in the evening. A slow, sculptural small tree that anchors a courtyard or entrance planting beautifully.",
    specs:{water:"Low",bloom:"Apr–Oct",spacing:"150–250 cm",growth:"Slow"},
    highlights:["Among the most fragrant flowers in the nursery","Sculptural even without leaves in winter","Grows well in large pots on a terrace"]
  },
  {
    id:"lantana",
    name:"Lantana",
    botanical:"Lantana camara",
    color:"multicolor",
    stakeColor:"#B5651D",
    sun:"full-sun",
    height:"small",
    heightCm:100,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/lantana,flower?lock=17",
    tagline:"A single flower, many colours",
    description:"Each small flower head opens in one shade and shifts through others as it ages, so a single cluster can carry yellow, orange and pink at once. Rugged and reliable, it flowers hardest when left slightly hungry and dry.",
    specs:{water:"Low",bloom:"Year-round",spacing:"45–75 cm",growth:"Fast"},
    highlights:["Constantly in flower with almost no care","A magnet for butterflies through the day","Good low, informal border hedge"]
  },
  {
    id:"duranta",
    name:"Golden Dewdrop",
    botanical:"Duranta erecta",
    color:"purple",
    stakeColor:"#8B5FBF",
    sun:"full-sun",
    height:"tall",
    heightCm:220,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/duranta,flower?lock=18",
    tagline:"Lilac blooms, golden berries",
    description:"Slender arching branches carry drooping sprays of small violet-blue flowers, later followed by strings of golden-yellow berries that hang on well after flowering ends — giving two seasons of interest from one plant.",
    specs:{water:"Moderate",bloom:"Summer–autumn",spacing:"90–120 cm",growth:"Fast"},
    highlights:["Golden berries follow the flowers for extra colour","Shears well into a formal hedge or topiary","A gold-leaved form is available for contrast planting"]
  },
  {
    id:"allamanda",
    name:"Allamanda",
    botanical:"Allamanda cathartica",
    color:"yellow",
    stakeColor:"#E9B830",
    sun:"full-sun",
    height:"medium",
    heightCm:150,
    type:["climber"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/allamanda,yellow,flower?lock=19",
    tagline:"Glossy trumpets on a scrambling vine",
    description:"A vigorous, semi-climbing shrub with glossy dark leaves and generous, wide-throated golden trumpets. Left unsupported it mounds into a rounded shrub; given a trellis or fence, it scrambles upward for a wall of colour.",
    specs:{water:"Moderate",bloom:"Summer–monsoon",spacing:"90–150 cm",growth:"Fast"},
    highlights:["Doubles as a shrub or a trained climber","Glossy foliage looks good even out of bloom","Best flowering in full sun with regular water"]
  },
  {
    id:"mussaenda",
    name:"Mussaenda",
    botanical:"Mussaenda erythrophylla",
    color:"pink",
    stakeColor:"#E187A5",
    sun:"partial-shade",
    height:"medium",
    heightCm:170,
    type:["pollinator"],
    sunIcon:"⛅",
    img:"https://loremflickr.com/600/460/mussaenda,flower?lock=20",
    tagline:"Coloured leaves, not petals",
    description:"What looks like a large flower is mostly enlarged, papery bracts — the true flowers are the small yellow stars at the centre. Soft-textured and shrubby, it fills the middle layer of a mixed border with sustained colour.",
    specs:{water:"Moderate",bloom:"Monsoon–winter",spacing:"75–100 cm",growth:"Moderate"},
    highlights:["The colourful part is actually modified leaves","Good filler shrub for part-shaded borders","Pairs well under taller flowering trees"]
  },
  {
    id:"clerodendrum",
    name:"Pagoda Flower",
    botanical:"Clerodendrum paniculatum",
    color:"orange",
    stakeColor:"#E3752A",
    sun:"partial-shade",
    height:"medium",
    heightCm:150,
    type:["pollinator"],
    sunIcon:"⛅",
    img:"https://loremflickr.com/600/460/clerodendrum,flower?lock=21",
    tagline:"Stacked tiers of coral bloom",
    description:"Tall pyramidal spikes of small coral-orange flowers rise like a tiered pagoda roof above large, heart-shaped leaves. A striking accent plant for a shaded corner where more sun-hungry shrubs would struggle to flower.",
    specs:{water:"Moderate-high",bloom:"Monsoon–autumn",spacing:"60–90 cm",growth:"Moderate"},
    highlights:["Architectural flower spikes up to 30 cm tall","Thrives in the dappled shade under trees","A strong butterfly and bee attractant"]
  },
  {
    id:"calliandra",
    name:"Powder Puff",
    botanical:"Calliandra haematocephala",
    color:"red",
    stakeColor:"#C1382C",
    sun:"full-sun",
    height:"medium",
    heightCm:200,
    type:["hedge","pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/calliandra,flower?lock=22",
    tagline:"A burst of silky red thread",
    description:"Feathery, fern-like leaves set off round flower heads made almost entirely of long silky red stamens, giving the effect of a powder puff. A favourite for hummingbird-style sunbird visits and for softening a hard boundary.",
    specs:{water:"Moderate",bloom:"Winter–spring",spacing:"90–150 cm",growth:"Moderate"},
    highlights:["Flowers are made of stamens, not petals","Fine, feathery foliage softens hard edges","Popular with nectar-feeding sunbirds"]
  },
  {
    id:"bauhinia",
    name:"Orchid Tree",
    botanical:"Bauhinia purpurea",
    color:"purple",
    stakeColor:"#8B5FBF",
    sun:"full-sun",
    height:"tall",
    heightCm:350,
    type:["pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/bauhinia,orchid,flower?lock=23",
    tagline:"Orchid-like flowers on a small tree",
    description:"Distinctive twin-lobed leaves give this small flowering tree its common name of camel's foot, but it's grown for its large, orchid-shaped purple-pink flowers that cover bare branches in the cooler months of the year.",
    specs:{water:"Moderate",bloom:"Oct–Feb",spacing:"250–350 cm",growth:"Moderate"},
    highlights:["Flowers appear on bare branches in winter","Unmistakable twin-lobed camel's-foot leaves","Grows into a graceful small flowering tree"]
  },
  {
    id:"adenium",
    name:"Desert Rose",
    botanical:"Adenium obesum",
    color:"pink",
    stakeColor:"#E187A5",
    sun:"full-sun",
    height:"small",
    heightCm:70,
    type:["pollinator"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/adenium,desert,rose?lock=24",
    tagline:"A swollen trunk, a crown of colour",
    description:"A succulent shrub that stores water in a swollen, sculptural trunk (or caudex), topped with a crown of glossy leaves and clusters of vivid, funnel-shaped flowers. Ideal for pots on a sunny balcony or a rock garden.",
    specs:{water:"Very low",bloom:"Spring–summer",spacing:"Pot or 45 cm",growth:"Slow"},
    highlights:["Stores water in its trunk — needs very little watering","Perfect for pots, balconies and rock gardens","Named varieties come in many flower colours"]
  },
  {
    id:"jasmine",
    name:"Jasmine",
    botanical:"Jasminum sambac",
    color:"white",
    stakeColor:"#F1EAD9",
    sun:"full-sun",
    height:"small",
    heightCm:100,
    type:["fragrant","climber"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/jasmine,white,flower?lock=25",
    tagline:"Small white stars, big fragrance",
    description:"Small double white flowers open in the evening and release a rich, heady fragrance that carries across a garden. A traditional favourite grown as much for temple garlands and hair flowers as for garden colour.",
    specs:{water:"Moderate",bloom:"Summer–monsoon",spacing:"45–75 cm",growth:"Moderate"},
    highlights:["Strongly fragrant, especially after sunset","Flowers traditionally used for garlands","Can be trained on a low trellis or kept bushy"]
  },
  {
    id:"gardenia",
    name:"Gardenia",
    botanical:"Gardenia jasminoides",
    color:"white",
    stakeColor:"#F1EAD9",
    sun:"partial-shade",
    height:"small",
    heightCm:90,
    type:["fragrant"],
    sunIcon:"⛅",
    img:"https://loremflickr.com/600/460/gardenia,flower?lock=26",
    tagline:"Waxy white blooms, glossy leaves",
    description:"Deep glossy evergreen leaves set off creamy-white, richly perfumed double blooms. A little fussier than most shrubs on this list — it prefers slightly acidic, well-drained soil — but rewards the effort with unmatched fragrance.",
    specs:{water:"Moderate",bloom:"Spring–summer",spacing:"60–90 cm",growth:"Slow"},
    highlights:["One of the most fragrant flowers you can grow","Glossy foliage stays attractive year-round","Prefers slightly acidic, well-drained soil"]
  },
  {
    id:"rose",
    name:"Garden Rose",
    botanical:"Rosa hybrid varieties",
    color:"red",
    stakeColor:"#C1382C",
    sun:"full-sun",
    height:"small",
    heightCm:90,
    type:["fragrant","hedge"],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/rose,garden,flower?lock=27",
    tagline:"The nursery's best-loved bloom",
    description:"Our rose beds carry a rotating mix of hybrid tea and floribunda varieties in red, pink, yellow and white, chosen for repeat flowering and disease resistance in local conditions. Ask in-store for the current season's named varieties.",
    specs:{water:"Regular",bloom:"Winter–spring peak",spacing:"45–60 cm",growth:"Moderate"},
    highlights:["Best flowering through the cooler winter months","Regular deadheading extends the bloom season","Wide range of colours available in-store"]
  },
  {
    id:"euphorbia",
    name:"Crown of Thorns",
    botanical:"Euphorbia milii",
    color:"red",
    stakeColor:"#C1382C",
    sun:"full-sun",
    height:"small",
    heightCm:60,
    type:[],
    sunIcon:"☀",
    img:"https://loremflickr.com/600/460/euphorbia,milii,flower?lock=28",
    tagline:"Thorny stems, near-constant colour",
    description:"A thorny, semi-succulent shrub that flowers almost continuously in small clusters of bright red, pink or yellow bracts. Nearly indestructible once established, and equally happy in a border or a compact pot.",
    specs:{water:"Very low",bloom:"Nearly year-round",spacing:"30–45 cm",growth:"Slow"},
    highlights:["Flowers almost continuously with minimal care","Thorny stems make it a natural barrier planting","Handles poor soil and long dry spells"]
  }
];

/* ============================================================
   STATE
   ============================================================ */
const state = {
  filters:{color:new Set(),sun:new Set(),height:new Set(),type:new Set()},
  search:"",
  sort:"default"
};

const grid = document.getElementById("plantGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const activeChips = document.getElementById("activeChips");
const statCount = document.getElementById("statCount");

statCount.textContent = PLANTS.length;

/* ============================================================
   RENDER CARDS
   ============================================================ */
function cardTemplate(p){
  const typeLabels = {fragrant:"✿ Fragrant",hedge:"▤ Hedge",climber:"↝ Climber",pollinator:"🦋 Pollinator"};
  const tags = p.type.map(t=>`<span class="mini-tag">${typeLabels[t]}</span>`).join("");
  return `
  <article class="plant-card" data-id="${p.id}">
    <div class="card-stake" style="--stake-color:${p.stakeColor}"></div>
    <div class="card-media">
      <img src="${p.img}" alt="${p.name} — ${p.botanical}" loading="lazy"
           onerror="this.onerror=null;this.src='https://picsum.photos/seed/${p.id}/600/460';">
      
      <div class="badge-sun" title="${p.sun === 'full-sun' ? 'Full sun' : 'Partial shade'}">${p.sunIcon}</div>
      <div class="card-overlay">
        <div class="card-overlay-tags">${tags}</div>
        <span class="view-btn">View details
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>
    </div>
    <div class="card-body">
      <h3 class="common-name">${p.name}</h3>
      <span class="botanical-name">${p.botanical}</span>
      <div class="card-specs">
        <span>💧 ${p.specs.water}</span>
        <span>📏 ${p.specs.spacing.split(",")[0]}</span>
        <span>🌸 ${p.specs.bloom}</span>
      </div>
    </div>
  </article>`;
}

function matches(p){
  const f = state.filters;
  if(f.color.size && !f.color.has(p.color)) return false;
  if(f.sun.size && !f.sun.has(p.sun)) return false;
  if(f.height.size && !f.height.has(p.height)) return false;
  if(f.type.size && ![...f.type].every(t=>p.type.includes(t))) return false;
  if(state.search){
    const q = state.search.toLowerCase();
    if(!p.name.toLowerCase().includes(q) && !p.botanical.toLowerCase().includes(q)) return false;
  }
  return true;
}

function sortList(list){
  const l = [...list];
  if(state.sort === "az") l.sort((a,b)=>a.name.localeCompare(b.name));
  if(state.sort === "za") l.sort((a,b)=>b.name.localeCompare(a.name));
  if(state.sort === "height") l.sort((a,b)=>a.heightCm-b.heightCm);
  return l;
}

let revealObserver;
function render(){
  const list = sortList(PLANTS.filter(matches));
  grid.innerHTML = list.map(cardTemplate).join("");
  resultsCount.innerHTML = `Showing <strong>${list.length}</strong> flowering shrub${list.length===1?"":"s"}`;
  emptyState.hidden = list.length !== 0;

  // reveal animation
  if(revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("reveal"); revealObserver.unobserve(e.target); }
    });
  },{threshold:0.12});
  grid.querySelectorAll(".plant-card").forEach((card,i)=>{
    card.style.animationDelay = `${Math.min(i%8,8)*0.05}s`;
    revealObserver.observe(card);
    card.addEventListener("click", ()=>openModal(card.dataset.id));
  });

  renderChips();
}

function renderChips(){
  const labels = {color:"",sun:"",height:"",type:""};
  let html = "";
  Object.entries(state.filters).forEach(([group,set])=>{
    set.forEach(val=>{
      html += `<span class="chip" data-group="${group}" data-value="${val}">${prettify(val)}<button aria-label="Remove filter">&times;</button></span>`;
    });
  });
  activeChips.innerHTML = html;
  activeChips.querySelectorAll(".chip button").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const chip = e.target.closest(".chip");
      toggleFilter(chip.dataset.group, chip.dataset.value);
    });
  });
}

function prettify(v){
  return v.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
}

/* ============================================================
   FILTER INTERACTIONS
   ============================================================ */
function toggleFilter(group, value){
  const set = state.filters[group];
  if(set.has(value)) set.delete(value); else set.add(value);
  syncTagButtons();
  render();
}

function syncTagButtons(){
  document.querySelectorAll(".tag-opt").forEach(btn=>{
    const group = btn.closest(".tag-options").dataset.filter;
    btn.classList.toggle("active", state.filters[group].has(btn.dataset.value));
  });
}

document.querySelectorAll(".tag-opt").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const group = btn.closest(".tag-options").dataset.filter;
    toggleFilter(group, btn.dataset.value);
  });
});

document.getElementById("clearFilters").addEventListener("click", ()=>{
  Object.values(state.filters).forEach(s=>s.clear());
  syncTagButtons();
  render();
});
document.getElementById("emptyClear").addEventListener("click", ()=>{
  Object.values(state.filters).forEach(s=>s.clear());
  state.search = "";
  document.getElementById("searchInput").value = "";
  syncTagButtons();
  render();
});

document.getElementById("searchInput").addEventListener("input", (e)=>{
  state.search = e.target.value.trim();
  render();
});

document.getElementById("sortSelect").addEventListener("change",(e)=>{
  state.sort = e.target.value;
  render();
});

/* ============================================================
   MOBILE FILTER DRAWER
   ============================================================ */
const filtersPanel = document.getElementById("filters");
const filtersBackdrop = document.getElementById("filtersBackdrop");
function openFilters(){ filtersPanel.classList.add("open"); filtersBackdrop.classList.add("open"); document.body.style.overflow="hidden"; }
function closeFilters(){ filtersPanel.classList.remove("open"); filtersBackdrop.classList.remove("open"); document.body.style.overflow=""; }
document.getElementById("mobileFilterBtn").addEventListener("click", openFilters);
document.getElementById("filtersClose").addEventListener("click", closeFilters);
filtersBackdrop.addEventListener("click", closeFilters);

/* ============================================================
   MODAL
   ============================================================ */
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

function modalTemplate(p){
  return `
    <div class="modal-hero">
      <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${p.id}/900/500';">
      <div class="modal-hero-text">
        <h2>${p.name}</h2>
        <span class="botanical">${p.botanical}</span>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-tags">
        <span class="mini-tag" style="background:${p.stakeColor}22;color:${p.stakeColor};border-color:${p.stakeColor}55">${prettify(p.color)} bloom</span>
        <span class="mini-tag" style="background:var(--moss-soft);color:var(--forest-mid);border-color:transparent">${p.sunIcon} ${p.sun==='full-sun'?'Full sun':'Partial shade'}</span>
        <span class="mini-tag" style="background:var(--moss-soft);color:var(--forest-mid);border-color:transparent">📏 ${prettify(p.height)} habit</span>
      </div>
      <p class="modal-desc"><em>"${p.tagline}."</em> ${p.description}</p>

      <div class="spec-grid">
        <div class="spec-card"><span class="label">Watering</span><span class="value">${p.specs.water}</span></div>
        <div class="spec-card"><span class="label">Bloom season</span><span class="value">${p.specs.bloom}</span></div>
        <div class="spec-card"><span class="label">Spacing</span><span class="value">${p.specs.spacing}</span></div>
        <div class="spec-card"><span class="label">Growth rate</span><span class="value">${p.specs.growth}</span></div>
      </div>

      <div class="highlight-list">
        <h3>Why gardeners choose it</h3>
        <ul>
          ${p.highlights.map(h=>`<li><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 7"/></svg>${h}</li>`).join("")}
        </ul>
      </div>


      <div class="modal-cta">
        <a class="btn-primary" href="#contact" onclick="closeModal()">Enquire about ${p.name}</a>
        <button class="btn-secondary" onclick="closeModal()">Continue browsing</button>
      </div>

      
    </div>`;
}

function openModal(id){
  const p = PLANTS.find(x=>x.id===id);
  if(!p) return;
  modalContent.innerHTML = modalTemplate(p);
  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click",(e)=>{ if(e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown",(e)=>{ if(e.key === "Escape") closeModal(); });
window.closeModal = closeModal;

/* ============================================================
   INIT
   ============================================================ */
render();
