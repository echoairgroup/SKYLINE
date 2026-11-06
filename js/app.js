(() => {
  const D = window.SKYLINE_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const fmt = n => new Intl.NumberFormat('en-US').format(n);
  const byId = id => D.flights.find(f => f.id === id);
  let toastTimer;
  function toast(msg) {
    const el = $('#toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }
  function initShell() {
    const nav = $('#mainNav'), menu = $('#menuToggle');
    menu?.addEventListener('click', () => {
      const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open));
    });
    if (localStorage.getItem('skyline-theme') === 'light') document.documentElement.classList.add('light-mode');
    $('#themeToggle')?.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('skyline-theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
      toast('Display preference saved');
    });
    const tick = () => {
      const now = new Date();
      if ($('#liveClock')) $('#liveClock').textContent = now.toLocaleTimeString('en-GB');
      if ($('#liveDate')) $('#liveDate').textContent = now.toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'long', year:'numeric'}).toUpperCase();
      if ($('#year')) $('#year').textContent = now.getFullYear();
    };
    tick(); setInterval(tick, 1000);
  }
  const statusClass = s => s === 'Delayed' ? 'delayed' : s === 'Landed' ? 'landed' : s === 'Scheduled' ? 'scheduled' : '';
  function row(f) {
    return '<tr data-flight="' + f.id + '" tabindex="0"><td><b class="flight-id">' + f.id + '</b><span class="subtext">' + f.airline + '</span></td><td><b class="route-cell">' + f.from + ' <span>→</span> ' + f.to + '</b><span class="subtext">' + f.fromCity + ' to ' + f.toCity + '</span></td><td>' + f.aircraft + '<span class="subtext">' + f.registration + '</span></td><td>' + f.departure + '<span class="subtext">' + f.arrival + ' arrival</span></td><td><span class="status ' + statusClass(f.status) + '">' + f.status + '</span></td><td>' + (f.status === 'Airborne' ? f.progress + '%' : f.status === 'Landed' ? 'Complete' : '—') + '</td></tr>';
  }
  function openFlight(id) {
    const f = byId(id), modal = $('#flightModal'); if (!f || !modal) return;
    $('#modalTitle').textContent = f.id; $('#modalSub').textContent = f.airline + ' · ' + f.aircraft;
    const rows = [['Route', f.from + ' → ' + f.to], ['Journey', f.fromCity + ' to ' + f.toCity], ['Registration', f.registration], ['Status', f.status], ['Altitude', f.altitude ? fmt(f.altitude) + ' ft' : 'On ground'], ['Ground speed', f.speed ? f.speed + ' kt' : '—'], ['Progress', f.progress + '%'], ['Departure / arrival', f.departure + ' / ' + f.arrival], ['Distance', fmt(f.distance) + ' nm']];
    $('#modalRows').innerHTML = rows.map(r => '<div class="modal-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  }
  function bindModal() {
    $('#modalClose')?.addEventListener('click', () => $('#flightModal').classList.remove('open'));
    $('#flightModal')?.addEventListener('click', e => { if (e.target.id === 'flightModal') e.currentTarget.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#flightModal')?.classList.remove('open'); });
  }
  function bindRows(el) {
    el?.addEventListener('click', e => { const tr = e.target.closest('[data-flight]'); if (tr) openFlight(tr.dataset.flight); });
    el?.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-flight]')) { e.preventDefault(); openFlight(e.target.dataset.flight); } });
  }
  const coords = {EHAM:[4.76,52.31], EGLL:[-.45,51.47], EDDF:[8.57,50.03], KJFK:[-73.78,40.64], RJTT:[139.78,35.55], LEMD:[-3.56,40.49], LFPG:[2.55,49.01], OMDB:[55.36,25.25], RKSI:[126.45,37.46], KBOS:[-71,42.36], VIDP:[77.1,28.56], LEBL:[2.08,41.3], LIRF:[12.25,41.8], CYYZ:[-79.63,43.67]};
  function drawMap(svg) {
    if (!svg) return;
    const xy = (lon, lat) => ({x:(lon+180)/360*1000, y:(90-lat)/180*500});
    const shapes = ['M75 105 L105 72 160 57 190 72 218 55 262 67 286 98 275 126 244 144 230 175 194 184 168 215 139 195 124 161 94 148Z','M225 226 L260 241 278 274 268 311 250 351 239 391 218 422 202 392 207 351 192 316 197 277Z','M440 100 L474 78 506 80 525 100 561 104 580 130 562 151 532 148 510 164 483 153 462 137Z','M474 163 L523 154 566 173 594 210 577 252 563 298 541 341 515 376 488 349 476 299 457 258 448 211Z','M565 95 L621 65 692 61 743 88 787 82 826 107 859 137 835 167 802 170 782 200 744 198 715 225 675 207 656 183 614 170 592 142Z','M740 277 L787 259 833 270 863 301 850 338 817 357 781 345 757 320Z','M875 387 L896 380 910 396 899 415 880 409Z'];
    let html = [-60,-30,0,30,60].map(v => '<path class="graticule" d="M0 ' + xy(0,v).y + 'H1000"/>').join('');
    html += [-120,-60,0,60,120].map(v => '<path class="graticule" d="M' + xy(v,0).x + ' 0V500"/>').join('');
    html += shapes.map(d => '<path class="land" d="' + d + '"/>').join('');
    const active = D.flights.filter(f => f.status === 'Airborne' || f.status === 'Delayed');
    html += active.map(f => {
      const a=xy(...(coords[f.from]||[0,0])), b=xy(...(coords[f.to]||[0,0]));
      return '<path class="route" d="M'+a.x+' '+a.y+' Q'+((a.x+b.x)/2)+' '+(((a.y+b.y)/2)-35)+' '+b.x+' '+b.y+'" data-route="'+f.id+'"/>';
    }).join('');
    html += D.airports.map(a => { const p=xy(...(coords[a.code]||[0,0])); return '<circle class="airport-point" cx="'+p.x+'" cy="'+p.y+'" r="3.2"><title>'+a.code+' · '+a.city+'</title></circle>'; }).join('');
    html += active.map(f => { const p=xy(f.lon,f.lat); return '<circle class="aircraft-point" cx="'+p.x+'" cy="'+p.y+'" r="5" data-plane="'+f.id+'" tabindex="0"><title>'+f.id+'</title></circle>'; }).join('');
    svg.setAttribute('viewBox','0 0 1000 500'); svg.innerHTML=html;
    svg.addEventListener('click', e => { const p=e.target.closest('[data-plane]'); if(p) openFlight(p.dataset.plane); });
  }
  function dashboard() {
    const airborne = D.flights.filter(f => f.status === 'Airborne').length;
    [['#metricFlights',D.flights.length],['#metricAirborne',airborne],['#metricOnTime','87%'],['#metricAirports',D.airports.length]].forEach(x => {if($(x[0])) $(x[0]).textContent=x[1];});
    drawMap($('#dashboardMap'));
    if ($('#activityList')) $('#activityList').innerHTML = D.flights.slice(0,5).map((f,i) => '<div class="activity"><div class="activity-icon">'+(i%2?'⌖':'✈')+'</div><div class="activity-text"><strong>'+f.id+' · '+f.from+' → '+f.to+'</strong><small>'+f.airline+' · '+f.status.toLowerCase()+'</small></div><div class="activity-time">'+f.departure+'</div></div>').join('');
    if ($('#airportStrip')) $('#airportStrip').innerHTML = D.airports.slice(0,4).map(a => '<div class="airport-mini"><strong>'+a.code+'</strong><p>'+a.city+'</p><div class="bar"><span style="width:'+a.activity+'%"></span></div><div class="mini-foot"><span>ACTIVITY</span><span>'+a.activity+'%</span></div></div>').join('');
    if ($('#recentFlights')) { $('#recentFlights').innerHTML=D.flights.slice(0,5).map(row).join(''); bindRows($('#recentFlights')); }
    $('#replayBtn')?.addEventListener('click', () => {const f=D.flights[Math.floor(Math.random()*D.flights.length)];toast('Replay marker refreshed · '+f.id);});
  }
  function download(name, text, type) {
    const a=document.createElement('a'), url=URL.createObjectURL(new Blob([text],{type}));
    a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
  }
  function flightsPage() {
    const body=$('#flightRows'), search=$('#flightSearch'), status=$('#statusFilter'), region=$('#regionFilter');
    if (!body) return;
    function render() {
      const q=(search.value||'').toLowerCase(), s=status.value, r=region.value;
      const list=D.flights.filter(f=>(!q||[f.id,f.airline,f.from,f.to,f.fromCity,f.toCity,f.registration,f.aircraft].join(' ').toLowerCase().includes(q))&&(s==='all'||f.status===s)&&(r==='all'||f.region===r));
      body.innerHTML=list.length?list.map(row).join(''):'<tr><td class="empty" colspan="6">No flights match these filters. Try another search.</td></tr>';
      $('#flightCount').textContent=list.length+' OF '+D.flights.length+' FLIGHTS';
    }
    [search,status,region].forEach(el=>el?.addEventListener('input',render)); render(); bindRows(body);
    $('#exportFlights')?.addEventListener('click',()=>{
      const rows=[['Flight','Airline','From','To','Aircraft','Registration','Status','Progress'],...D.flights.map(f=>[f.id,f.airline,f.from,f.to,f.aircraft,f.registration,f.status,f.progress])];
      const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');
      download('skyline-flights-demo.csv',csv,'text/csv'); toast('Flight list exported');
    });
  }
  function mapPage() {
    const svg=$('#networkMap'), list=$('#mapFlightList'); drawMap(svg); if(!list)return;
    let selected='SKY214';
    const active=D.flights.filter(f=>f.status==='Airborne'||f.status==='Delayed');
    function choose(id) {
      selected=id; $$('.map-flight',list).forEach(b=>b.classList.toggle('active',b.dataset.id===id));
      const f=byId(id); if(!f)return;
      $('#mapSelectedCode').textContent=f.id; $('#mapSelectedRoute').textContent=f.from+' → '+f.to;
      $('#mapSelectedMeta').textContent=f.aircraft+' · '+f.registration; $('#mapSelectedProgress').textContent=f.progress+'%';
      $('#mapProgressBar').style.width=f.progress+'%'; $$('[data-route]',svg).forEach(p=>p.classList.toggle('active',p.dataset.route===id));
    }
    list.innerHTML=active.map(f=>'<button class="map-flight" data-id="'+f.id+'"><span class="metric-icon">✈</span><span class="grow"><strong>'+f.id+'</strong><small>'+f.from+' → '+f.to+'</small></span><span class="arrow">↗</span></button>').join('');
    list.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)choose(b.dataset.id);});
    choose(selected);
    $('#centerMapBtn')?.addEventListener('click',()=>toast('Network view centred'));
    $('#mapRefresh')?.addEventListener('click',()=>{drawMap(svg);choose(selected);toast('Replay positions refreshed');});
  }
  function airportsPage() {
    const grid=$('#airportGrid'), search=$('#airportSearch'), region=$('#airportRegion'); if(!grid)return;
    function render() {
      const q=(search.value||'').toLowerCase(), r=region.value;
      const list=D.airports.filter(a=>(!q||[a.code,a.name,a.city,a.country].join(' ').toLowerCase().includes(q))&&(r==='all'||a.region===r));
      grid.innerHTML=list.length?list.map(a=>'<article class="airport-card"><div class="airport-card-top"><div><div class="airport-card-code">'+a.code+'</div><div class="airport-card-name">'+a.name+'</div></div><span class="status">Active</span></div><div class="airport-country">'+a.city.toUpperCase()+' · '+a.country.toUpperCase()+'</div><div class="airport-stats"><div class="airport-stat"><b>'+a.movements+'</b><span>DAILY MOVEMENTS</span></div><div class="airport-stat"><b>'+a.activity+'%</b><span>ACTIVITY INDEX</span></div><div class="airport-stat"><b>'+a.departures+'</b><span>DEPARTURES</span></div><div class="airport-stat"><b>'+a.arrivals+'</b><span>ARRIVALS</span></div></div><div class="bar"><span style="width:'+a.activity+'%"></span></div><div class="airport-runway"><span>'+a.runways+'</span><span>'+a.timezone+'</span></div></article>').join(''):'<div class="callout">No airports match your search.</div>';
      $('#airportCount').textContent=list.length+' AIRPORTS';
    }
    [search,region].forEach(el=>el?.addEventListener('input',render)); render();
  }
  function fleetPage() {
    const grid=$('#fleetGrid'), search=$('#fleetSearch'), filter=$('#fleetFilter'); if(!grid)return;
    const plane='<svg viewBox="0 0 180 60" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 31 82 26 147 5l19 2-49 25 49 12-18 5-56-13-32 5-14 11-7-1 8-13-36-3-8-4Z" fill="rgba(185,207,211,.10)"/></svg>';
    function render() {
      const q=(search.value||'').toLowerCase(), s=filter.value;
      const list=D.fleet.filter(f=>(!q||[f.registration,f.type,f.operator,f.base].join(' ').toLowerCase().includes(q))&&(s==='all'||f.status===s));
      grid.innerHTML=list.length?list.map(f=>'<article class="fleet-card"><div class="fleet-card-top"><div><div class="fleet-reg">'+f.registration+'</div><div class="fleet-type">'+f.type+'</div></div><span class="status '+(f.status==='Maintenance'?'delayed':f.status==='Standby'?'scheduled':'')+'">'+f.status+'</span></div><div class="fleet-visual">'+plane+'</div><div class="fleet-meta"><div><span>OPERATOR</span><b>'+f.operator+'</b></div><div><span>BASE</span><b>'+f.base+'</b></div><div><span>AGE</span><b>'+f.age+'</b></div><div><span>CONFIGURATION</span><b>'+f.seats+' seats</b></div></div></article>').join(''):'<div class="callout">No aircraft match your search.</div>';
      $('#fleetCount').textContent=list.length+' AIRCRAFT';
    }
    [search,filter].forEach(el=>el?.addEventListener('input',render)); render();
  }
  function analyticsPage() {
    const canvas=$('#performanceChart'); if(!canvas)return;
    const ctx=canvas.getContext('2d'); let period=7;
    function draw() {
      const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
      canvas.width=rect.width*dpr; canvas.height=rect.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      const w=rect.width,h=rect.height,p={l:28,r:10,t:12,b:28};
      const values=period===7?[61,68,65,74,72,81,78]:period===30?[52,59,57,65,63,68,73,70,79,76,82,80]:[48,54,53,60,58,65,62,68,72,69,76,74];
      const other=values.map((v,i)=>Math.max(40,v-10+(i%3)*3)), x=i=>p.l+i*(w-p.l-p.r)/(values.length-1), y=v=>h-p.b-(v-35)/55*(h-p.t-p.b);
      ctx.strokeStyle='rgba(170,198,205,.13)';
      for(let i=0;i<5;i++){const yy=p.t+i*(h-p.t-p.b)/4;ctx.beginPath();ctx.moveTo(p.l,yy);ctx.lineTo(w-p.r,yy);ctx.stroke();}
      function line(arr,color,fill){ctx.beginPath();arr.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.stroke();if(fill){ctx.lineTo(x(arr.length-1),h-p.b);ctx.lineTo(x(0),h-p.b);ctx.closePath();const g=ctx.createLinearGradient(0,p.t,0,h-p.b);g.addColorStop(0,'rgba(255,135,103,.2)');g.addColorStop(1,'rgba(255,135,103,0)');ctx.fillStyle=g;ctx.fill();}}
      line(other,'#86dfc2',false); line(values,'#ff8767',true);
      ctx.fillStyle='#91a7b2';ctx.font='9px DM Mono,monospace';ctx.textAlign='center';
      const labels=period===7?['MON','TUE','WED','THU','FRI','SAT','SUN']:period===30?['01','04','07','10','13','16','19','22','25','28','31']:['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'];
      labels.forEach((v,i)=>ctx.fillText(v,x(Math.round(i*(values.length-1)/(labels.length-1))),h-8));
    }
    draw(); window.addEventListener('resize',draw);
    $$('[data-period]').forEach(b=>b.addEventListener('click',()=>{$$('[data-period]').forEach(x=>x.classList.toggle('primary',x===b));period=Number(b.dataset.period);draw();toast('Sample period updated');}));
    $('#analyticsExport')?.addEventListener('click',()=>{const rows=[['Metric','Sample value'],['Flights tracked',D.flights.length],['Airborne',D.flights.filter(f=>f.status==='Airborne').length],['On-time performance','87%'],['Airports',D.airports.length]];download('skyline-analytics-demo.csv',rows.map(r=>r.join(',')).join('\n'),'text/csv');toast('Analytics summary exported');});
  }
  function init() {
    initShell(); bindModal();
    const pages={dashboard,flights:flightsPage,map:mapPage,airports:airportsPage,fleet:fleetPage,analytics:analyticsPage};
    pages[document.body.dataset.page]?.();
  }
  document.addEventListener('DOMContentLoaded',init);
})();