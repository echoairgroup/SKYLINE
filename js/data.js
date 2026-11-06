/* SKYLINE demonstration network. These records are illustrative replay data, not a live feed. */
window.SKYLINE_DATA = {
  flights: [
    {id:'SKY214',airline:'Skyline Air',from:'EHAM',to:'EGLL',fromCity:'Amsterdam',toCity:'London',aircraft:'Airbus A320neo',registration:'PH-SKA',status:'Airborne',progress:67,altitude:37000,speed:451,departure:'10:18',arrival:'11:12',duration:'00:54',distance:231,lat:52.7,lon:2.1,region:'Europe'},
    {id:'SKY508',airline:'Skyline Air',from:'EDDF',to:'LEMD',fromCity:'Frankfurt',toCity:'Madrid',aircraft:'Airbus A321',registration:'PH-SKB',status:'Airborne',progress:43,altitude:35000,speed:439,departure:'10:42',arrival:'12:58',duration:'02:16',distance:897,lat:45.2,lon:0.3,region:'Europe'},
    {id:'SKY731',airline:'Northstar Connect',from:'KJFK',to:'KBOS',fromCity:'New York',toCity:'Boston',aircraft:'Embraer E195-E2',registration:'N-SKY7',status:'Delayed',progress:0,altitude:0,speed:0,departure:'11:25',arrival:'12:32',duration:'01:07',distance:163,lat:40.2,lon:-73.5,region:'North America'},
    {id:'SKY882',airline:'Skyline Air',from:'LFPG',to:'LIRF',fromCity:'Paris',toCity:'Rome',aircraft:'Airbus A320neo',registration:'PH-SKC',status:'Airborne',progress:78,altitude:39000,speed:458,departure:'09:55',arrival:'12:01',duration:'02:06',distance:685,lat:43.1,lon:8.2,region:'Europe'},
    {id:'SKY106',airline:'Pacific Meridian',from:'RJTT',to:'RKSI',fromCity:'Tokyo',toCity:'Seoul',aircraft:'Boeing 787-9',registration:'JA-PM9',status:'Airborne',progress:51,altitude:41000,speed:488,departure:'11:04',arrival:'13:21',duration:'02:17',distance:758,lat:36.8,lon:131.5,region:'Asia Pacific'},
    {id:'SKY365',airline:'Skyline Air',from:'LEBL',to:'EHAM',fromCity:'Barcelona',toCity:'Amsterdam',aircraft:'Airbus A320',registration:'PH-SKD',status:'Landed',progress:100,altitude:0,speed:0,departure:'08:42',arrival:'10:58',duration:'02:16',distance:769,lat:52.3,lon:4.8,region:'Europe'},
    {id:'SKY420',airline:'Atlantic Regional',from:'CYYZ',to:'KBOS',fromCity:'Toronto',toCity:'Boston',aircraft:'Airbus A220-300',registration:'C-AT20',status:'Scheduled',progress:0,altitude:0,speed:0,departure:'13:10',arrival:'14:52',duration:'01:42',distance:431,lat:44.5,lon:-77.1,region:'North America'},
    {id:'SKY947',airline:'Skyline Air',from:'OMDB',to:'VIDP',fromCity:'Dubai',toCity:'Delhi',aircraft:'Boeing 737 MAX 8',registration:'PH-SKE',status:'Airborne',progress:29,altitude:36000,speed:447,departure:'10:56',arrival:'13:48',duration:'02:52',distance:1360,lat:24.1,lon:68.3,region:'Middle East'}
  ],
  airports: [
    {code:'EHAM',name:'Amsterdam Airport Schiphol',city:'Amsterdam',country:'Netherlands',region:'Europe',movements:184,departures:91,arrivals:93,runways:'6 operational',activity:92,timezone:'UTC+1'},
    {code:'EGLL',name:'London Heathrow',city:'London',country:'United Kingdom',region:'Europe',movements:168,departures:82,arrivals:86,runways:'2 operational',activity:86,timezone:'UTC+0'},
    {code:'EDDF',name:'Frankfurt Airport',city:'Frankfurt',country:'Germany',region:'Europe',movements:143,departures:70,arrivals:73,runways:'4 operational',activity:77,timezone:'UTC+1'},
    {code:'KJFK',name:'John F. Kennedy International',city:'New York',country:'United States',region:'North America',movements:157,departures:79,arrivals:78,runways:'4 operational',activity:82,timezone:'UTC−5'},
    {code:'RJTT',name:'Tokyo Haneda Airport',city:'Tokyo',country:'Japan',region:'Asia Pacific',movements:201,departures:101,arrivals:100,runways:'4 operational',activity:96,timezone:'UTC+9'},
    {code:'LEMD',name:'Adolfo Suárez Madrid–Barajas',city:'Madrid',country:'Spain',region:'Europe',movements:132,departures:65,arrivals:67,runways:'4 operational',activity:71,timezone:'UTC+1'},
    {code:'LFPG',name:'Paris Charles de Gaulle',city:'Paris',country:'France',region:'Europe',movements:176,departures:89,arrivals:87,runways:'4 operational',activity:89,timezone:'UTC+1'},
    {code:'OMDB',name:'Dubai International',city:'Dubai',country:'United Arab Emirates',region:'Middle East',movements:192,departures:96,arrivals:96,runways:'2 operational',activity:94,timezone:'UTC+4'},
    {code:'RKSI',name:'Incheon International',city:'Seoul',country:'South Korea',region:'Asia Pacific',movements:149,departures:74,arrivals:75,runways:'3 operational',activity:78,timezone:'UTC+9'}
  ],
  fleet: [
    {registration:'PH-SKA',type:'Airbus A320neo',family:'A320',operator:'Skyline Air',age:'3.2 years',status:'In service',base:'Amsterdam (EHAM)',range:'3,400 nm',seats:186},
    {registration:'PH-SKB',type:'Airbus A321',family:'A320',operator:'Skyline Air',age:'5.1 years',status:'In service',base:'Frankfurt (EDDF)',range:'3,200 nm',seats:220},
    {registration:'PH-SKC',type:'Airbus A320neo',family:'A320',operator:'Skyline Air',age:'2.4 years',status:'In service',base:'Paris (LFPG)',range:'3,400 nm',seats:186},
    {registration:'PH-SKD',type:'Airbus A320',family:'A320',operator:'Skyline Air',age:'7.8 years',status:'Turnaround',base:'Amsterdam (EHAM)',range:'3,300 nm',seats:180},
    {registration:'PH-SKE',type:'Boeing 737 MAX 8',family:'737',operator:'Skyline Air',age:'1.9 years',status:'In service',base:'Dubai (OMDB)',range:'3,550 nm',seats:189},
    {registration:'JA-PM9',type:'Boeing 787-9',family:'787',operator:'Pacific Meridian',age:'4.6 years',status:'In service',base:'Tokyo (RJTT)',range:'7,635 nm',seats:296},
    {registration:'N-SKY7',type:'Embraer E195-E2',family:'E-Jet',operator:'Northstar Connect',age:'2.1 years',status:'Maintenance',base:'New York (KJFK)',range:'2,600 nm',seats:132},
    {registration:'C-AT20',type:'Airbus A220-300',family:'A220',operator:'Atlantic Regional',age:'3.7 years',status:'Standby',base:'Toronto (CYYZ)',range:'3,400 nm',seats:145}
  ]
};
