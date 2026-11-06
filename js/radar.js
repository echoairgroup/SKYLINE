(() => {
  "use strict";
  const API = "https://api.adsb.lol";
  const RADIUS_NM = 250;
  const REFRESH_MS = 60000;
  const DEFAULT_CENTER = {lat:51.5, lon:5.2};
  const state = {aircraft:[], updatedAt:null, center:null, map:null, markers:null, radius:null, selectedHex:null, request:null, lastRequestAt:0, retryAfter:0};
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const text = (selector, value) => {const el=$(selector); if(el) el.textContent=value ?? "—";};
  const clean = value => String(value ?? "").trim();
  const number = (value, digits=0) => Number.isFinite(Number(value)) ? new Intl.NumberFormat("en-US",{maximumFractionDigits:digits}).format(Number(value)) : "—";
  const coords = (lat,lon) => ({lat:Number(lat),lon:Number(lon)});
  const toNm = meters => meters/1852;
  const iconPlane = (heading=0,selected=false,emergency=false) => L.divIcon({
    className:"",
    html:'<div class="aircraft-marker '+(selected?'selected ':'')+(emergency?'emergency':'')+'" style="transform:rotate('+(Number(heading)||0)+'deg)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 12.1c0-.7-.6-1.3-1.3-1.3l-7.2-4.4V3.8c0-.8-.4-1.5-.9-1.5s-.9.7-.9 1.5v2.6L4 10.8c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3l7.1-2v5.1l-2.2 1.4v1.7l3.1-.8 3.1.8v-1.7l-2.2-1.4v-5.1l7.2 2c.7 0 1.3-.6 1.3-1.3Z"/></svg></div>',
    iconSize:[28,28], iconAnchor:[14,14]
  });
  function getCenter() {
    try {
      const lat=Number(localStorage.getItem("skyline.radar.lat")),lon=Number(localStorage.getItem("skyline.radar.lon"));
      if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180)return coords(lat,lon);
    } catch {}
    return {...DEFAULT_CENTER};
  }
  function saveCenter(c) {
    state.center=c;
    try {localStorage.setItem("skyline.radar.lat",String(c.lat));localStorage.setItem("skyline.radar.lon",String(c.lon));} catch {}
  }
  function status(mode,message) {
    const badges=$$(".source-badge");
    badges.forEach(el=>{el.classList.toggle("offline",mode==="error");const label=el.querySelector("[data-status-label]");if(label)label.textContent=message;});
    const dot=$("#feedDot"); if(dot){dot.className="status-dot"+(mode==="error"?" error":mode==="loading"?" warn":"");}
    if($("#feedStatus"))$("#feedStatus").textContent=message;
  }
  const numeric = value => value!==null&&value!==undefined&&value!==""&&Number.isFinite(Number(value))?Number(value):null;
  function normalise(p) {
    if(p.lat===null||p.lat===undefined||p.lon===null||p.lon===undefined)return null;
    const lat=Number(p.lat),lon=Number(p.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180)return null;
    const alt=typeof p.alt_baro==="number"?p.alt_baro:null;
    const emergency=clean(p.emergency).toLowerCase();
    const squawk=clean(p.squawk);
    return {hex:clean(p.hex).toUpperCase(),callsign:clean(p.flight).replace(/\s+/g,""),registration:clean(p.r),type:clean(p.t),lat,lon,altitude:alt,ground:p.alt_baro==="ground",speed:numeric(p.gs),track:numeric(p.track)??numeric(p.nav_heading)??0,verticalRate:numeric(p.baro_rate),squawk,emergency,category:clean(p.category),seen:numeric(p.seen),seenPosition:numeric(p.seen_pos),alert:Number(p.alert)||0,messages:Number(p.messages)||0,mlat:Array.isArray(p.mlat)?p.mlat:[],tisb:Array.isArray(p.tisb)?p.tisb:[]};
  }
  function isEmergency(a) {return ["7500","7600","7700"].includes(a.squawk)||Boolean(a.emergency&&a.emergency!=="none");}
  function altitude(a) {return a.ground?"On ground":a.altitude===null?"Unknown":number(a.altitude)+" ft";}
  function speed(a) {return a.speed===null?"—":number(a.speed)+" kt";}
  function heading(a) {return Number.isFinite(a.track)?Math.round(a.track)+"°":"—";}
  function age(a) {return a.seenPosition===null?"Unknown":a.seenPosition<1?"<1 sec":Math.round(a.seenPosition)+" sec";}
  function makeCell(label,value) {
    const cell=document.createElement("div"),l=document.createElement("span"),v=document.createElement("b");
    cell.className="detail-cell";l.textContent=label;v.textContent=value||"—";cell.append(l,v);return cell;
  }
  function selectAircraft(hex,pan=false) {
    const a=state.aircraft.find(x=>x.hex===hex);if(!a)return;
    state.selectedHex=hex;
    if(state.markers)state.markers.eachLayer(marker=>{const current=marker.options.aircraftHex,plane=state.aircraft.find(x=>x.hex===current);marker.setIcon(iconPlane(plane?.track,current===hex,plane&&isEmergency(plane)));});
    const box=$("#aircraftDetails");
    if(box){
      box.replaceChildren();
      const head=document.createElement("div");head.className="aircraft-title";head.textContent=a.callsign||a.registration||a.hex;
      const sub=document.createElement("div");sub.className="aircraft-sub";sub.textContent=[a.registration,a.type,a.hex].filter(Boolean).join(" · ");
      box.append(head,sub);
      const grid=document.createElement("div");grid.className="detail-grid";
      grid.append(makeCell("BAROMETRIC ALTITUDE",altitude(a)),makeCell("GROUND SPEED",speed(a)),makeCell("HEADING",heading(a)),makeCell("VERTICAL RATE",a.verticalRate===null?"—":number(a.verticalRate)+" ft/min"),makeCell("SQUAWK",a.squawk||"—"),makeCell("EMERGENCY",a.emergency||"None reported"),makeCell("POSITION AGE",age(a)),makeCell("CATEGORY",a.category||"Unspecified"));
      box.append(grid);
      const footer=document.createElement("div");footer.className="detail-footer";footer.textContent="ICAO24 "+a.hex+" · "+a.messages+" messages";box.append(footer);
    }
    if(pan&&state.map){state.map.setView([a.lat,a.lon],Math.max(state.map.getZoom(),7));}
    renderNearby();
    $$(".data-table tr[data-hex]").forEach(row=>row.classList.toggle("is-selected",row.dataset.hex===hex));
  }
  function aircraftRow(a) {
    const tr=document.createElement("tr");tr.dataset.hex=a.hex;tr.tabIndex=0;
    const cells=[
      [a.callsign||"No callsign",a.hex],
      [a.registration||"Unknown registration",a.type||"Unknown type"],
      [a.ground?"Ground":"Airborne",a.ground?"Surface":"In flight"],
      [altitude(a),speed(a)],
      [heading(a),a.verticalRate===null?"—":number(a.verticalRate)+" ft/min"],
      [a.squawk||"—",age(a)]
    ];
    cells.forEach((pair,i)=>{const td=document.createElement("td");const primary=document.createElement("span");primary.className=i===0?"callsign":"";primary.textContent=pair[0];td.append(primary);const small=document.createElement("span");small.className="subtext";small.textContent=pair[1];td.append(small);tr.append(td);});
    const statusCell=document.createElement("td");const chip=document.createElement("span");chip.className="chip"+(isEmergency(a)?" alert":a.ground?" ground":"");chip.textContent=isEmergency(a)?"ALERT":a.ground?"ON GROUND":"AIRBORNE";statusCell.append(chip);tr.append(statusCell);
    tr.addEventListener("click",()=>selectAircraft(a.hex));
    tr.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectAircraft(a.hex);}});
    return tr;
  }
  function renderTraffic() {
    const body=$("#aircraftRows");if(!body)return;
    const q=clean($("#aircraftSearch")?.value).toLowerCase(),filter=$("#aircraftFilter")?.value||"all";
    const list=state.aircraft.filter(a=>{
      const text=[a.callsign,a.registration,a.type,a.hex,a.squawk].join(" ").toLowerCase();
      return (!q||text.includes(q))&&(filter==="all"||(filter==="airborne"&&!a.ground)||(filter==="ground"&&a.ground)||(filter==="alert"&&isEmergency(a)));
    }).sort((a,b)=>(b.altitude||0)-(a.altitude||0));
    body.replaceChildren();
    if(!list.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=7;td.className="empty-state";td.textContent=state.aircraft.length?"No aircraft match your filter.":"No aircraft positions are currently available in this radar area.";tr.append(td);body.append(tr);}
    else list.forEach(a=>body.append(aircraftRow(a)));
    text("#aircraftCount",number(list.length)+" AIRCRAFT SHOWN");
  }
  function renderNearby() {
    const list=$("#nearbyList");if(!list)return;
    const data=[...state.aircraft].sort((a,b)=>(a.seenPosition??999)-(b.seenPosition??999)).slice(0,9);
    list.replaceChildren();
    if(!data.length){const p=document.createElement("div");p.className="empty-detail";p.textContent="No aircraft positions returned for this area.";list.append(p);return;}
    data.forEach(a=>{
      const b=document.createElement("button");b.className="nearby-row";b.type="button";
      const ico=document.createElement("span");ico.className="plane-mini";ico.innerHTML='<svg viewBox="0 0 24 24"><path d="M21.4 12.1c0-.7-.6-1.3-1.3-1.3l-7.2-4.4V3.8c0-.8-.4-1.5-.9-1.5s-.9.7-.9 1.5v2.6L4 10.8c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3l7.1-2v5.1l-2.2 1.4v1.7l3.1-.8 3.1.8v-1.7l-2.2-1.4v-5.1l7.2 2c.7 0 1.3-.6 1.3-1.3Z"/></svg>';
      const copy=document.createElement("span");copy.className="nearby-copy";
      const name=document.createElement("span");name.className="nearby-callsign";name.textContent=a.callsign||a.registration||a.hex;
      const meta=document.createElement("span");meta.className="nearby-meta";meta.textContent=[a.type,a.registration].filter(Boolean).join(" · ")||a.hex;
      copy.append(name,meta);
      const alt=document.createElement("span");alt.className="nearby-alt";alt.textContent=altitude(a);
      b.append(ico,copy,alt);b.addEventListener("click",()=>selectAircraft(a.hex,true));list.append(b);
    });
  }
  function updateMetrics() {
    text("#metricAircraft",number(state.aircraft.length));
    text("#metricAirborne",number(state.aircraft.filter(a=>!a.ground).length));
    text("#metricAlerts",number(state.aircraft.filter(isEmergency).length));
    text("#metricCoverage",RADIUS_NM+" NM");
    text("#lastUpdate",state.updatedAt?state.updatedAt.toLocaleTimeString():"Waiting for feed");
    const updated=$("#mapUpdated");if(updated)updated.textContent=state.updatedAt?"Updated "+state.updatedAt.toLocaleTimeString():"Waiting for live data";
  }
  function renderMap() {
    if(!state.markers)return;
    state.markers.clearLayers();
    state.aircraft.forEach(a=>{
      const marker=L.marker([a.lat,a.lon],{icon:iconPlane(a.track,a.hex===state.selectedHex,isEmergency(a)),keyboard:true,title:a.callsign||a.hex});
      marker.options.aircraftHex=a.hex;
      marker.bindPopup('<div class="popup-title">'+escapeHtml(a.callsign||a.registration||a.hex)+'</div><div class="popup-muted">'+escapeHtml([a.type,a.registration,a.hex].filter(Boolean).join(" · "))+'</div><div class="popup-muted">'+escapeHtml(altitude(a))+' · '+escapeHtml(speed(a))+'</div><a class="popup-link" href="#" data-select="'+escapeHtml(a.hex)+'">Open aircraft details →</a>');
      marker.on("popupopen",e=>{const link=e.popup.getElement()?.querySelector("[data-select]");link?.addEventListener("click",ev=>{ev.preventDefault();selectAircraft(a.hex);});});
      marker.on("click",()=>selectAircraft(a.hex));
      state.markers.addLayer(marker);
    });
    renderNearby();updateMetrics();renderTraffic();
    if(state.selectedHex&&!state.aircraft.some(a=>a.hex===state.selectedHex)){state.selectedHex=null;const box=$("#aircraftDetails");if(box)box.textContent="Select an aircraft marker or a nearby aircraft to inspect live transponder data.";}
  }
  function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function showError(message) {
    status("error","FEED UNAVAILABLE");
    const panel=$("#feedError");
    if(panel){panel.hidden=false;panel.textContent=message;}
    text("#mapUpdated","Live feed unavailable");
  }
  function clearError(){const panel=$("#feedError");if(panel){panel.hidden=true;panel.textContent="";}}
  async function loadArea({force=false}={}) {
    if(state.request)state.request.abort();
    const now=Date.now();
    if(now<state.retryAfter&&!force){showError("The data provider has temporarily limited requests. SKYLINE will try again after the cooldown.");return;}
    const center=state.center||getCenter();
    const controller=new AbortController();state.request=controller;
    status("loading","CONNECTING TO ADS-B");
    const refresh=$$("#refreshBtn");refresh.forEach(b=>{b.disabled=true;b.innerHTML='<span class="loading-ring"></span> Updating';});
    clearError();
    const lat=center.lat.toFixed(4),lon=center.lon.toFixed(4);
    try{
      const response=await fetch(API+"/v2/lat/"+lat+"/lon/"+lon+"/dist/"+RADIUS_NM,{signal:controller.signal,headers:{Accept:"application/json"},cache:"no-store"});
      if(!response.ok){if(response.status===429){state.retryAfter=Date.now()+180000;throw new Error("ADSB.lol has rate-limited this request (HTTP 429). Wait a few minutes before retrying.");}throw new Error("ADSB.lol returned HTTP "+response.status+".");}
      const payload=await response.json();
      if(!Array.isArray(payload.ac))throw new Error("The live data provider returned an unexpected response.");
      state.aircraft=payload.ac.map(normalise).filter(Boolean);
      state.updatedAt=new Date();
      state.lastRequestAt=Date.now();
      status("online","LIVE ADS-B DATA");
      text("#feedStatus","ADSB.lol · "+number(state.aircraft.length)+" aircraft");
      clearError();renderMap();updateMetrics();
      const label=$("#mapCenter");if(label)label.textContent="RADAR CENTRE "+center.lat.toFixed(2)+"°, "+center.lon.toFixed(2)+"° · "+RADIUS_NM+" NM";
      if($("#aircraftRows"))renderTraffic();
      if(!state.selectedHex&&state.aircraft.length)selectAircraft(state.aircraft[0].hex);
    }catch(error){
      if(error.name!=="AbortError"){showError(error.message||"Unable to connect to the live aircraft data service.");}
    }finally{
      state.request=null;refresh.forEach(b=>{b.disabled=false;b.textContent="↻ Refresh";});
    }
  }
  function initMap() {
    const node=$("#radarMap");if(!node||!window.L)return;
    const initial=getCenter();state.center=initial;
    state.map=L.map(node,{zoomControl:true,preferCanvas:true,worldCopyJump:true}).setView([initial.lat,initial.lon],5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'}).addTo(state.map);
    state.markers=L.markerClusterGroup?L.markerClusterGroup({showCoverageOnHover:false,spiderfyOnMaxZoom:true,removeOutsideVisibleBounds:true,maxClusterRadius:48}):L.layerGroup();
    state.markers.addTo(state.map);
    state.radius=L.circle([initial.lat,initial.lon],{radius:RADIUS_NM*1852,color:"#ff8868",weight:1.3,opacity:.8,fillColor:"#ff8868",fillOpacity:.045,dashArray:"6 7"}).addTo(state.map);
    let lastCenter=initial;
    state.map.on("moveend",()=>{
      const c=state.map.getCenter();
      if(state.map.distance([lastCenter.lat,lastCenter.lon],[c.lat,c.lng])>30000){
        lastCenter={lat:c.lat,lon:c.lng};saveCenter(lastCenter);
        state.radius.setLatLng([c.lat,c.lng]);
        const label=$("#mapCenter");if(label)label.textContent="RADAR CENTRE "+c.lat.toFixed(2)+"°, "+c.lng.toFixed(2)+"° · "+RADIUS_NM+" NM";
        clearTimeout(state.moveTimer);state.moveTimer=setTimeout(()=>loadArea(),700);
      }
    });
    setTimeout(()=>state.map.invalidateSize(),80);
    $("#centerMap")?.addEventListener("click",()=>{state.map.setView([DEFAULT_CENTER.lat,DEFAULT_CENTER.lon],5);saveCenter({...DEFAULT_CENTER});});
  }
  function bindShared() {
    $("#menuToggle")?.addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
    $$("#refreshBtn").forEach(b=>b.addEventListener("click",()=>loadArea({force:true})));
    $("#aircraftSearch")?.addEventListener("input",renderTraffic);
    $("#aircraftFilter")?.addEventListener("change",renderTraffic);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-state.lastRequestAt>REFRESH_MS)loadArea();});
    if($("#radarMap")||$("#aircraftRows"))setInterval(()=>{if(!document.hidden)loadArea();},REFRESH_MS);
  }
  function lookupEndpoint(kind,value) {
    const safe=encodeURIComponent(value.trim());
    if(kind==="callsign")return API+"/v2/callsign/"+safe;
    if(kind==="registration")return API+"/v2/reg/"+safe;
    return API+"/v2/hex/"+safe;
  }
  async function lookup(kind,value) {
    const result=$("#lookupResults");if(!result)return;
    result.replaceChildren();
    const wait=document.createElement("div");wait.className="lookup-result-empty";wait.innerHTML='<span><span class="loading-ring"></span><br><br>Querying live aircraft transponder data…</span>';result.append(wait);
    try{
      const response=await fetch(lookupEndpoint(kind,value),{headers:{Accept:"application/json"},cache:"no-store"});
      if(!response.ok)throw new Error(response.status===404?"No matching aircraft found.":"The provider returned HTTP "+response.status+".");
      const payload=await response.json(),aircraft=(payload.ac||[]).map(normalise).filter(Boolean);
      result.replaceChildren();
      if(!aircraft.length){const empty=document.createElement("div");empty.className="lookup-result-empty";empty.textContent="No aircraft with a current position matched that query. It may be outside receiver coverage or not transmitting a usable position.";result.append(empty);return;}
      aircraft.forEach(a=>{
        const card=document.createElement("article");card.className="feature";
        const title=document.createElement("h3");title.textContent=a.callsign||a.registration||a.hex;
        const sub=document.createElement("p");sub.textContent=[a.registration,a.type,a.hex].filter(Boolean).join(" · ");
        const grid=document.createElement("div");grid.className="result-grid";
        [["POSITION",a.lat.toFixed(4)+", "+a.lon.toFixed(4)],["ALTITUDE",altitude(a)],["SPEED",speed(a)],["HEADING",heading(a)],["SQUAWK",a.squawk||"—"],["POSITION AGE",age(a)]].forEach(([k,v])=>grid.append(makeCell(k,v)));
        const action=document.createElement("button");action.className="btn primary";action.textContent="Show on radar ↗";action.style.marginTop="14px";
        action.addEventListener("click",()=>{saveCenter({lat:a.lat,lon:a.lon});location.href="index.html?hex="+encodeURIComponent(a.hex);});
        card.append(title,sub,grid,action);result.append(card);
      });
    }catch(error){result.replaceChildren();const empty=document.createElement("div");empty.className="lookup-result-empty";empty.textContent=error.message||"Lookup failed. Please try again.";result.append(empty);}
  }
  function initLookup(){
    const form=$("#lookupForm");if(!form)return;
    form.addEventListener("submit",e=>{e.preventDefault();const query=clean($("#lookupValue").value),kind=$("#lookupKind").value;
      if(!query){$("#lookupValue").focus();return;}
      if(kind==="icao"&&!/^[a-fA-F0-9]{6}$/.test(query)){const msg=$("#lookupMessage");msg.textContent="Enter a six-character ICAO24 hexadecimal address.";return;}
      const msg=$("#lookupMessage");msg.textContent="";lookup(kind,query);
    });
  }
  function init() {
    bindShared();
    if($("#radarMap")){initMap();loadArea();const hex=new URLSearchParams(location.search).get("hex");if(hex){setTimeout(()=>{const a=state.aircraft.find(x=>x.hex===hex.toUpperCase());if(a)selectAircraft(a.hex,true);},2500);}}
    if($("#aircraftRows"))loadArea();
    initLookup();
    text("#year",new Date().getFullYear());
  }
  document.addEventListener("DOMContentLoaded",init);
  window.SkylineRadar={loadArea,selectAircraft,state};
})();