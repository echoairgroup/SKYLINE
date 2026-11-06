(() => {
  "use strict";
  const MAP_BASE="https://adsb.lol/";
  const REGIONS={
    world:{name:"Worldwide",lat:28,lon:12,zoom:3},
    europe:{name:"Europe",lat:50,lon:12,zoom:5},
    netherlands:{name:"Netherlands",lat:52.15,lon:5.3,zoom:7},
    northamerica:{name:"North America",lat:39,lon:-98,zoom:4},
    southamerica:{name:"South America",lat:-15,lon:-58,zoom:4},
    asia:{name:"Asia-Pacific",lat:23,lon:110,zoom:4},
    middleeast:{name:"Middle East",lat:28,lon:48,zoom:5}
  };
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clean=s=>String(s??"").trim();
  const makeMapUrl=params=>{const url=new URL(MAP_BASE);Object.entries(params).forEach(([k,v])=>{if(v!==null&&v!==undefined&&String(v)!=="")url.searchParams.set(k,String(v));});return url.toString();};
  function initNav(){
    const nav=$("#mainNav"),btn=$("#menuToggle");
    btn?.addEventListener("click",()=>{const open=nav.classList.toggle("open");btn.setAttribute("aria-expanded",String(open));});
    const y=$("#year");if(y)y.textContent=new Date().getFullYear();
  }
  function initRegionButtons(){
    const frame=$("#liveMap");if(!frame)return;
    const link=$("#openMap");
    function applyRegion(key){
      const region=REGIONS[key]||REGIONS.world;
      const url=makeMapUrl({lat:region.lat,lon:region.lon,zoom:region.zoom});
      frame.src=url;if(link)link.href=url;
      $$(".region-btn").forEach(b=>b.classList.toggle("active",b.dataset.region===key));
      const label=$("#regionLabel");if(label)label.textContent=region.name.toUpperCase()+" · LIVE MAP";
    }
    $$(".region-btn").forEach(b=>b.addEventListener("click",()=>applyRegion(b.dataset.region)));
    const initial=new URLSearchParams(location.search).get("region")||"world";
    applyRegion(initial);
  }
  function initTrafficFilters(){
    const form=$("#trafficFilters"),frame=$("#trafficMap"),link=$("#openTrafficMap");if(!form||!frame)return;
    function apply(e){
      e?.preventDefault();
      const mode=$("#filterMode").value,value=clean($("#filterValue").value);
      const min=clean($("#altMin").value),max=clean($("#altMax").value);
      const params={lat:50,lon:12,zoom:4};
      if(value){
        if(mode==="callsign")params.filterCallSign=value;
        if(mode==="type")params.filterType=value.toUpperCase();
        if(mode==="registration")params.reg=value.toUpperCase();
        if(mode==="icao")params.icao=value.toUpperCase();
        if(mode==="squawk")params.filterSquawk=value;
        if(mode==="altitude")params.filterAltMin=value;
      }
      if(min)params.filterAltMin=min;
      if(max)params.filterAltMax=max;
      const url=makeMapUrl(params);frame.src=url;if(link)link.href=url;
      const msg=$("#filterStatus");if(msg)msg.textContent=value||min||max?"LIVE MAP FILTER APPLIED":"Showing all visible aircraft";
    }
    form.addEventListener("submit",apply);
    $("#clearFilters")?.addEventListener("click",()=>{form.reset();const url=makeMapUrl({lat:50,lon:12,zoom:4});frame.src=url;if(link)link.href=url;const msg=$("#filterStatus");if(msg)msg.textContent="All map filters cleared";});
    const url=makeMapUrl({lat:50,lon:12,zoom:4});frame.src=url;if(link)link.href=url;
  }
  function initLookup(){
    const form=$("#lookupForm"),frame=$("#lookupMap"),link=$("#openLookupMap");if(!form||!frame)return;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const mode=$("#lookupMode").value,value=clean($("#lookupValue").value);
      const msg=$("#lookupMessage");
      if(!value){msg.textContent="Enter an aircraft identifier.";return;}
      const params={lat:50,lon:12,zoom:6};
      if(mode==="icao"){
        if(!/^[a-fA-F0-9]{6}$/.test(value)){msg.textContent="ICAO24 addresses must contain six hexadecimal characters.";return;}
        params.icao=value.toUpperCase();params.zoom=10;
      }else if(mode==="registration"){params.reg=value.toUpperCase();params.zoom=8;}
      else {params.filterCallSign=value;params.zoom=7;}
      const url=makeMapUrl(params);frame.src=url;if(link)link.href=url;
      msg.textContent="Live map search opened for "+value.toUpperCase()+".";
    });
    $("#clearLookup")?.addEventListener("click",()=>{form.reset();const url=makeMapUrl({lat:50,lon:12,zoom:5});frame.src=url;if(link)link.href=url;$("#lookupMessage").textContent="Search cleared.";});
    const start=makeMapUrl({lat:50,lon:12,zoom:5});frame.src=start;if(link)link.href=start;
  }
  document.addEventListener("DOMContentLoaded",()=>{initNav();initRegionButtons();initTrafficFilters();initLookup();});
})();