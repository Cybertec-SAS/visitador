/* ============ MOCK "REGISTRO" DATABASE ============
   Datos ficticios que simulan la información ya guardada en el módulo
   de Registro (clientes → granjas → galpones + contactos). En la
   integración real esto vendrá de una consulta a ese módulo. */
const clientesDB = [
  {
    id:'c1', nombre:'Avícola El Roble S.A.S',
    granjas:[
      { id:'g1', nombre:'Granja La Esperanza', ubicacion:'Vereda San Isidro, Pereira, Risaralda', totalGalpones:6,
        admNombre:'Luis Rodriguez', admCel:'300 512 8890',
        vetNombre:'Dra. Laura Restrepo', vetCel:'311 470 2231',
        correo:'contacto@elroble.com',
        galpones:[
          {id:'p1', numero:'1', numAves:30500},
          {id:'p2', numero:'2', numAves:31200},
          {id:'p3', numero:'3', numAves:32000},
          {id:'p4', numero:'4', numAves:29800},
        ]
      }
    ]
  },
  {
    id:'c2', nombre:'Pollos del Valle Ltda',
    granjas:[
      { id:'g2', nombre:'Granja Santa Rita', ubicacion:'Corregimiento La Cumbre, Palmira, Valle del Cauca', totalGalpones:4,
        admNombre:'Jorge Salamanca', admCel:'315 220 4471',
        vetNombre:'Dr. Andrés Piedrahita', vetCel:'318 902 1145',
        correo:'operaciones@pollosdelvalle.com',
        galpones:[
          {id:'p5', numero:'1', numAves:18000},
          {id:'p6', numero:'2', numAves:17500},
        ]
      },
      { id:'g3', nombre:'Granja El Mirador', ubicacion:'Vereda Guayabal, Cerrito, Valle del Cauca', totalGalpones:8,
        admNombre:'Marta Iznaga', admCel:'300 771 6620',
        vetNombre:'Dr. Andrés Piedrahita', vetCel:'318 902 1145',
        correo:'mirador@pollosdelvalle.com',
        galpones:[
          {id:'p7', numero:'1', numAves:34000},
          {id:'p8', numero:'2', numAves:33750},
          {id:'p9', numero:'3', numAves:34500},
        ]
      }
    ]
  },
  {
    id:'c3', nombre:'Granjas Avícolas San Marcos S.A.',
    granjas:[
      { id:'g4', nombre:'Granja San Marcos I', ubicacion:'Km 8 vía Girardot, Cundinamarca', totalGalpones:10,
        admNombre:'Ricardo Fonseca', admCel:'320 455 9081',
        vetNombre:'Dra. Paula Nieto', vetCel:'312 668 4420',
        correo:'sanmarcos1@sanmarcos.com',
        galpones:[
          {id:'p10', numero:'1', numAves:40000},
          {id:'p11', numero:'2', numAves:39500},
          {id:'p12', numero:'3', numAves:41000},
        ]
      }
    ]
  }
];

let selectedCliente = null;
let selectedGranja = null;
let selectedGalpon = null;
let acMatches = [];

/* ============ DATA MODEL ============ */
const sensorTypes = [
  { key:"temp", label:"Temperatura", icon:'<path d="M14 14.76V4a2 2 0 0 0-4 0v10.76a4 4 0 1 0 4 0Z"/>' },
  { key:"pres", label:"Presión estática", icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  { key:"hum",  label:"Humedad", icon:'<path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>' },
  { key:"co2",  label:"CO2", icon:'<circle cx="12" cy="12" r="9"/><path d="M8 10a2 2 0 1 1 4 0v4"/><path d="M15 10a2 2 0 1 1 4 0v4"/>' },
  { key:"amm",  label:"Amoníaco", icon:'<path d="M12 2v6M8 6l4 2 4-2"/><circle cx="12" cy="15" r="7"/>' },
];

const estadoCriterios = [
  "Pantalla", "Teclado / botones", "Gabinete", "Cableado eléctrico",
  "Fuente de alimentación"
];

const tableroFisicoCriterios = ["Limpieza", "Humedad", "Corrosión", "Orden"];
const otrosEquiposItems = ["DIMMER", "RDT-5", "RSW/RSU", "BACKUP"];

const pruebaEmergenciaCriterios = [
  "Alarma sonora", "Alarma visual", "Desarme de cortina", "Ventilación forzada", "Backup", "Temperatura alta", "Presión alta"
];
const medAmbientalesCriterios = [
  { key:'presSellamiento', label:'Presión estática (sellamiento)', unit:'IN.H2O' },
  { key:'presVentMinima',  label:'Presión estática (ventilación mínima)', unit:'IN.H2O' },
  { key:'velAire',         label:'Velocidad de aire promedio', unit:'m/s' },
  { key:'intensidadLuz',   label:'Intensidad de luz', unit:'lux' },
];

const PILL_BRM  = [{v:'b',label:'BUENO'},{v:'r',label:'REGULAR'},{v:'m',label:'MALO'}];
const PILL_BRMN = [{v:'b',label:'BUENO'},{v:'r',label:'REGULAR'},{v:'m',label:'MALO'},{v:'n',label:'N/A'}];
const PILL_BM   = [{v:'b',label:'BUENO'},{v:'m',label:'MALO'}];

const SEG_SINO = [{v:'si',label:'SÍ'},{v:'no',label:'NO'}];
const SEG_SINONA = [{v:'si',label:'SÍ'},{v:'no',label:'NO'},{v:'na',label:'N/A'}];

let estadoState = {};      // criterio -> 'b'|'r'|'m'|'n'
let sensorState = {};      // key -> {instalados, detectados, estado}
let tableroFisicoState = {}; // criterio -> 'b'|'r'|'m'
let otrosEquiposState = {};  // equipo -> 'b'|'r'|'m'
let puntosCalientes = null;  // 'si' | 'no' | null
let pruebaEmergenciaState = {}; // criterio -> 'si'|'no'
let medAmbientalesState = {};   // key -> {valor:'', estado:'n'}

let extractoresState = {};    // "Estado" -> 'b'|'r'|'m'
let inletsState = {};         // "Estado" -> 'b'|'r'|'m'
let nebulizacionState = {};   // "Estado" -> 'b'|'m'
let panelHumedoState = {};    // "Estado general"->b/r/m, "Moja Uniforme"->si/no/na, "Estado de la bomba"->b/m
let tunelState = {};          // "Estado" -> 'b'|'r'|'m'
let ventiladoresState = {};   // "Estado" -> 'b'|'m'

let comederoState = {};       // "Estado" -> 'b'|'r'|'m'
let bebederoState = {};       // "Estado panel hidráulico"/"Estado filtro"/"Estado Dosatron" -> 'b'|'m'
let alimentacionState = {};   // "Estado" -> 'b'|'r'|'m'

let evidenciaFotos = []; // {id, dataUrl, descripcion}

/* ============ NARRATIVA DEL INFORME (editable) ============ */
const narrativeKeys = ['objetivos','alcance','actividades','resultados','conclusiones','recomendaciones'];
let narrativeState = {}; // key -> texto (vacío hasta que se autogenera o el usuario escribe)

function autoGrowTextarea(el){
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function setNarrativeDefault(key, generatedText){
  if(!narrativeState[key]) narrativeState[key] = generatedText;
  const el = document.getElementById('r_' + key);
  el.value = narrativeState[key];
  autoGrowTextarea(el);
}

narrativeKeys.forEach(key=>{
  const el = document.getElementById('r_' + key);
  el.addEventListener('input', e=>{
    narrativeState[key] = e.target.value;
    autoGrowTextarea(e.target);
  });
});

/* ============ EVIDENCIA FOTOGRÁFICA ============ */
function renderFotoGrid(){
  const grid = document.getElementById('fotoGrid');
  const empty = document.getElementById('fotoEmpty');
  empty.style.display = evidenciaFotos.length ? 'none' : 'block';
  grid.innerHTML = evidenciaFotos.map(f=>`
    <div class="foto-card" data-id="${f.id}">
      <button type="button" class="foto-remove" data-id="${f.id}" title="Quitar fotografía">✕</button>
      <div class="foto-thumb"><img src="${f.dataUrl}" alt=""></div>
      <div class="foto-body">
        <textarea class="foto-desc" data-id="${f.id}" placeholder="Describe qué muestra esta fotografía...">${f.descripcion}</textarea>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.foto-remove').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      evidenciaFotos = evidenciaFotos.filter(f=> f.id !== btn.dataset.id);
      renderFotoGrid();
    });
  });
  grid.querySelectorAll('.foto-desc').forEach(ta=>{
    ta.addEventListener('input', e=>{
      const f = evidenciaFotos.find(f=> f.id === e.target.dataset.id);
      if(f) f.descripcion = e.target.value;
    });
  });
}

document.getElementById('btnAddFoto').addEventListener('click', ()=>{
  document.getElementById('fotoInput').click();
});
document.getElementById('fotoInput').addEventListener('change', e=>{
  Array.from(e.target.files).forEach(file=>{
    const reader = new FileReader();
    reader.onload = ev=>{
      evidenciaFotos.push({
        id: 'f' + Date.now() + Math.random().toString(36).slice(2),
        dataUrl: ev.target.result,
        descripcion: ''
      });
      renderFotoGrid();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

/* ============ RENDER: sensor table ============ */
function renderSensorTable(){
  const body = document.getElementById('sensorBody');
  body.innerHTML = '';
  sensorTypes.forEach(s=>{
    if(!sensorState[s.key]) sensorState[s.key] = {instalados:'', detectados:'', estado:'b'};
    const st = sensorState[s.key];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="sensor-name">
          <div class="sensor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg></div>
          ${s.label}
        </div>
      </td>
      <td><input class="num-input" type="number" min="0" value="${st.instalados}" data-key="${s.key}" data-field="instalados"></td>
      <td><input class="num-input" type="number" min="0" max="${st.instalados}" value="${st.detectados}" data-key="${s.key}" data-field="detectados"></td>
      <td>
        <div class="gauge-cell">
          <svg width="30" height="30" viewBox="0 0 30 30" class="gauge-${s.key}"></svg>
          <span class="gauge-pct" id="pct-${s.key}">0%</span>
        </div>
      </td>
      <td>
        <div class="pill-select" data-key="${s.key}">
          <div class="pill b" data-v="b">BUENO</div>
          <div class="pill r" data-v="r">REGULAR</div>
          <div class="pill m" data-v="m">MALO</div>
          <div class="pill n" data-v="n">N/A</div>
        </div>
      </td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll('.num-input').forEach(inp=>{
    inp.addEventListener('input', e=>{
      const k = e.target.dataset.key, f = e.target.dataset.field;
      sensorState[k][f] = e.target.value;

      // Detectados no puede superar la cantidad instalada
      const inst = parseFloat(sensorState[k].instalados);
      const det = parseFloat(sensorState[k].detectados);
      const detInput = body.querySelector(`.num-input[data-key="${k}"][data-field="detectados"]`);
      if(!isNaN(inst)){
        if(detInput) detInput.max = inst;
        if(!isNaN(det) && det > inst){
          sensorState[k].detectados = inst;
          if(detInput) detInput.value = inst;
        }
      }

      updateGauge(k);
    });
  });
  body.querySelectorAll('.pill-select').forEach(sel=>{
    sel.querySelectorAll('.pill').forEach(p=>{
      p.addEventListener('click', ()=>{
        const k = sel.dataset.key;
        sensorState[k].estado = p.dataset.v;
        refreshPills(sel, sensorState[k].estado);
      });
    });
    refreshPills(sel, sensorState[sel.dataset.key].estado);
  });
  sensorTypes.forEach(s=>updateGauge(s.key));
}

function refreshPills(container, value){
  container.querySelectorAll('.pill').forEach(p=>{
    p.classList.toggle('sel', p.dataset.v === value);
  });
}

function updateGauge(key){
  const st = sensorState[key];
  const inst = parseFloat(st.instalados) || 0;
  const det = parseFloat(st.detectados) || 0;
  const pct = inst > 0 ? Math.min(100, Math.round((det/inst)*100)) : 0;
  const svg = document.querySelector(`.gauge-${key}`);
  const r = 12, c = 2*Math.PI*r;
  const color = pct >= 90 ? 'var(--brand)' : pct >= 60 ? 'var(--orange)' : 'var(--red)';
  svg.innerHTML = `
    <circle cx="15" cy="15" r="${r}" fill="none" stroke="var(--line-soft)" stroke-width="3"/>
    <circle cx="15" cy="15" r="${r}" fill="none" stroke="${color}" stroke-width="3"
      stroke-dasharray="${c}" stroke-dashoffset="${c - (pct/100)*c}"
      stroke-linecap="round" transform="rotate(-90 15 15)"/>
  `;
  document.getElementById(`pct-${key}`).textContent = pct + '%';
}

/* ============ RENDER: generic pill-list (estado físico, tablero, otros equipos) ============ */
function renderPillList(containerId, items, stateObj, pillOptions){
  const list = document.getElementById(containerId);
  list.innerHTML = '';
  items.forEach(name=>{
    if(!stateObj[name]) stateObj[name] = pillOptions[0].v;
    const row = document.createElement('div');
    row.className = 'estado-row';
    row.innerHTML = `
      <div class="er-name">${name}</div>
      <div class="pill-select" data-key="${name}">
        ${pillOptions.map(o=>`<div class="pill ${o.v}" data-v="${o.v}">${o.label}</div>`).join('')}
      </div>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.pill-select').forEach(sel=>{
    sel.querySelectorAll('.pill').forEach(p=>{
      p.addEventListener('click', ()=>{
        const k = sel.dataset.key;
        stateObj[k] = p.dataset.v;
        refreshPills(sel, stateObj[k]);
      });
    });
    refreshPills(sel, stateObj[sel.dataset.key]);
  });
}

function renderEstadoList(){ renderPillList('estadoList', estadoCriterios, estadoState, PILL_BRMN); }
function renderTableroFisicoList(){ renderPillList('tableroFisicoList', tableroFisicoCriterios, tableroFisicoState, PILL_BRM); }
function renderOtrosEquiposList(){ renderPillList('otrosEquiposList', otrosEquiposItems, otrosEquiposState, PILL_BRM); }

/* ============ RENDER: generic seg-list (SÍ/NO/N-A toggles) ============ */
function renderSegList(containerId, items, stateObj, segOptions){
  const list = document.getElementById(containerId);
  list.innerHTML = '';
  items.forEach(name=>{
    const row = document.createElement('div');
    row.className = 'estado-row';
    row.innerHTML = `
      <div class="er-name">${name}</div>
      <div class="seg-toggle" data-key="${name}">
        ${segOptions.map(o=>`<button type="button" class="seg-btn" data-v="${o.v}">${o.label}</button>`).join('')}
      </div>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.seg-toggle').forEach(tog=>{
    tog.querySelectorAll('.seg-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const k = tog.dataset.key;
        stateObj[k] = btn.dataset.v;
        tog.querySelectorAll('.seg-btn').forEach(b=> b.classList.toggle('sel', b.dataset.v === stateObj[k]));
      });
    });
    if(stateObj[tog.dataset.key]){
      tog.querySelectorAll('.seg-btn').forEach(b=> b.classList.toggle('sel', b.dataset.v === stateObj[tog.dataset.key]));
    }
  });
}

function renderPruebaEmergenciaList(){ renderSegList('pruebaEmergenciaList', pruebaEmergenciaCriterios, pruebaEmergenciaState, SEG_SINO); }

function renderExtractoresList(){ renderPillList('extractoresEstadoList', ["Estado"], extractoresState, PILL_BRM); }
function renderInletsList(){ renderPillList('inletsEstadoList', ["Estado"], inletsState, PILL_BRM); }
function renderNebulizacionList(){ renderPillList('nebulizacionEstadoList', ["Estado"], nebulizacionState, PILL_BM); }
function renderPanelHumedoGeneral(){ renderPillList('panelHumedoGeneralList', ["Estado general"], panelHumedoState, PILL_BRM); }
function renderMojaUniforme(){ renderSegList('mojaUniformeList', ["Moja Uniforme"], panelHumedoState, SEG_SINONA); }
function renderPanelHumedoBomba(){ renderPillList('panelHumedoBombaList', ["Estado de la bomba"], panelHumedoState, PILL_BM); }
function renderTunelList(){ renderPillList('tunelEstadoList', ["Estado"], tunelState, PILL_BRM); }
function renderVentiladoresList(){ renderPillList('ventiladoresEstadoList', ["Estado"], ventiladoresState, PILL_BM); }

function renderComederoList(){ renderPillList('comederoEstadoList', ["Estado"], comederoState, PILL_BRM); }
function renderBebederoList(){ renderPillList('bebederoEstadoList', ["Estado panel hidráulico", "Estado filtro", "Estado Dosatron"], bebederoState, PILL_BM); }
function renderAlimentacionList(){ renderPillList('alimentacionEstadoList', ["Estado"], alimentacionState, PILL_BRM); }

function renderMedAmbientalesList(){
  const list = document.getElementById('medAmbientalesList');
  list.innerHTML = '';
  medAmbientalesCriterios.forEach(c=>{
    if(!medAmbientalesState[c.key]) medAmbientalesState[c.key] = {valor:'', estado:'n'};
    const st = medAmbientalesState[c.key];
    const row = document.createElement('div');
    row.className = 'ma-row';
    row.innerHTML = `
      <div class="er-name">${c.label}</div>
      <div class="ma-controls">
        <div class="field unit-field" style="width:140px;margin:0;"><input type="number" step="0.01" value="${st.valor}" data-key="${c.key}"><span class="unit-tag">${c.unit}</span></div>
        <div class="pill-select" data-key="${c.key}">
          <div class="pill n" data-v="n">N/A</div>
          <div class="pill b" data-v="b">BUENO</div>
          <div class="pill m" data-v="m">MALO</div>
          <div class="pill r" data-v="r">REGULAR</div>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('input[type="number"]').forEach(inp=>{
    inp.addEventListener('input', e=>{
      medAmbientalesState[e.target.dataset.key].valor = e.target.value;
    });
  });
  list.querySelectorAll('.pill-select').forEach(sel=>{
    sel.querySelectorAll('.pill').forEach(p=>{
      p.addEventListener('click', ()=>{
        const k = sel.dataset.key;
        medAmbientalesState[k].estado = p.dataset.v;
        refreshPills(sel, medAmbientalesState[k].estado);
      });
    });
    refreshPills(sel, medAmbientalesState[sel.dataset.key].estado);
  });
}

/* ============ TERMOGRAFIA: toggle puntos calientes ============ */
document.querySelectorAll('#puntosCalientesToggle .seg-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    puntosCalientes = btn.dataset.v;
    document.querySelectorAll('#puntosCalientesToggle .seg-btn').forEach(b=>{
      b.classList.toggle('sel', b.dataset.v === puntosCalientes);
    });
  });
});

/* ============ CLIENTE: buscador con autocompletado ============ */
function normalizeStr(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

function renderClienteDropdown(query){
  const dropdown = document.getElementById('clienteDropdown');
  const q = normalizeStr(query.trim());
  acMatches = !q ? clientesDB : clientesDB.filter(c => normalizeStr(c.nombre).includes(q));

  if(!acMatches.length){
    dropdown.innerHTML = `<div class="ac-empty">No se encontraron clientes registrados con ese nombre.</div>`;
  } else {
    dropdown.innerHTML = acMatches.map((c,i)=>`
      <div class="ac-item" data-idx="${i}">
        <div class="ac-name">${c.nombre}</div>
        <div class="ac-meta">${c.granjas.length} granja${c.granjas.length===1?'':'s'} registrada${c.granjas.length===1?'':'s'}</div>
      </div>
    `).join('');
    dropdown.querySelectorAll('.ac-item').forEach(item=>{
      item.addEventListener('mousedown', e=>{
        e.preventDefault();
        pickCliente(acMatches[parseInt(item.dataset.idx)].id);
      });
    });
  }
  dropdown.classList.add('open');
}

function pickCliente(id){
  selectedCliente = clientesDB.find(c => c.id === id);
  const search = document.getElementById('clienteSearch');
  search.value = selectedCliente.nombre;
  search.readOnly = true;
  document.getElementById('clienteId').value = selectedCliente.id;
  document.getElementById('clienteClear').style.display = 'flex';
  document.getElementById('clienteDropdown').classList.remove('open');
  populateGranjaSelect();
  updateContextChip();
}

function clearCliente(){
  selectedCliente = null;
  const search = document.getElementById('clienteSearch');
  search.value = '';
  search.readOnly = false;
  document.getElementById('clienteId').value = '';
  document.getElementById('clienteClear').style.display = 'none';
  resetGranjaGalpon();
  updateContextChip();
  search.focus();
}

function populateGranjaSelect(){
  const sel = document.getElementById('granjaSelect');
  sel.innerHTML = '<option value="">Selecciona una granja...</option>' +
    selectedCliente.granjas.map(g => `<option value="${g.id}">${g.nombre}</option>`).join('');
  sel.disabled = false;
  selectedGranja = null;
  clearGranjaFields();
  resetGalponSelect();
}

function resetGranjaGalpon(){
  const sel = document.getElementById('granjaSelect');
  sel.innerHTML = '<option value="">Selecciona un cliente primero...</option>';
  sel.disabled = true;
  selectedGranja = null;
  clearGranjaFields();
  resetGalponSelect();
}

function clearGranjaFields(){
  document.getElementById('ubicacion').value = '';
  document.getElementById('totalGalpones').value = '';
  document.getElementById('admNombre').value = '';
  document.getElementById('admCel').value = '';
  document.getElementById('vetNombre').value = '';
  document.getElementById('vetCel').value = '';
  document.getElementById('correo').value = '';
}

function resetGalponSelect(){
  const sel = document.getElementById('galponSelect');
  sel.innerHTML = '<option value="">Selecciona una granja primero...</option>';
  sel.disabled = true;
  selectedGalpon = null;
  document.getElementById('numAves').value = '';
}

function populateGalponSelect(){
  const sel = document.getElementById('galponSelect');
  sel.innerHTML = '<option value="">Selecciona un galpón...</option>' +
    selectedGranja.galpones.map(p => `<option value="${p.id}">Galpón ${p.numero}</option>`).join('');
  sel.disabled = false;
  selectedGalpon = null;
  document.getElementById('numAves').value = '';
}

document.getElementById('clienteSearch').addEventListener('input', e=>{
  selectedCliente = null;
  document.getElementById('clienteId').value = '';
  resetGranjaGalpon();
  renderClienteDropdown(e.target.value);
  updateContextChip();
});
document.getElementById('clienteSearch').addEventListener('focus', e=>{
  if(!e.target.readOnly) renderClienteDropdown(e.target.value);
});
document.getElementById('clienteClear').addEventListener('click', clearCliente);
document.addEventListener('click', e=>{
  if(!e.target.closest('.autocomplete-wrap')) document.getElementById('clienteDropdown').classList.remove('open');
});

document.getElementById('granjaSelect').addEventListener('change', e=>{
  const gid = e.target.value;
  if(!gid){ selectedGranja=null; clearGranjaFields(); resetGalponSelect(); updateContextChip(); return; }
  selectedGranja = selectedCliente.granjas.find(g => g.id === gid);
  document.getElementById('ubicacion').value = selectedGranja.ubicacion;
  document.getElementById('totalGalpones').value = selectedGranja.totalGalpones;
  document.getElementById('admNombre').value = selectedGranja.admNombre;
  document.getElementById('admCel').value = selectedGranja.admCel;
  document.getElementById('vetNombre').value = selectedGranja.vetNombre;
  document.getElementById('vetCel').value = selectedGranja.vetCel;
  document.getElementById('correo').value = selectedGranja.correo;
  populateGalponSelect();
  updateContextChip();
});

document.getElementById('galponSelect').addEventListener('change', e=>{
  const pid = e.target.value;
  if(!pid){ selectedGalpon=null; document.getElementById('numAves').value=''; updateContextChip(); return; }
  selectedGalpon = selectedGranja.galpones.find(p => p.id === pid);
  document.getElementById('numAves').value = selectedGalpon.numAves;
  updateContextChip();
});

function clienteNombre(){ return selectedCliente ? selectedCliente.nombre : ''; }
function granjaNombre(){ return selectedGranja ? selectedGranja.nombre : ''; }
function galponNumero(){ return selectedGalpon ? selectedGalpon.numero : ''; }

/* ============ STEP NAVIGATION ============ */
let currentStep = 1;
function goStep(n){
  currentStep = n;
  document.querySelectorAll('.step-panel').forEach(p=>p.style.display='none');
  document.getElementById('panel-'+n).style.display='block';

  document.querySelectorAll('.step-item').forEach(si=>{
    const s = parseInt(si.dataset.step);
    si.classList.toggle('active', s===n);
    si.classList.toggle('done', s<n);
  });

  updateContextChip();
  if(n===8) buildReport();
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('.step-item').forEach(si=>{
  si.addEventListener('click', ()=> goStep(parseInt(si.dataset.step)));
});

function updateContextChip(){
  document.getElementById('ctxGranja').textContent = granjaNombre() || '—';
  document.getElementById('ctxCliente').textContent = clienteNombre() || '—';
  document.getElementById('ctxFecha').textContent = val('fecha') || '—';
  document.getElementById('ctxGalpon').textContent = galponNumero() || '—';
}

function val(id){ const el = document.getElementById(id); return el ? el.value : ''; }

/* ============ REPORT BUILD ============ */
const statusLabel = {b:'Bueno', r:'Regular', m:'Malo', n:'No aplica'};
const statusClass = {b:'bueno', r:'regular', m:'malo', n:'na'};

function buildReport(){
  const granja = granjaNombre() || 'la granja visitada';
  const galpon = galponNumero() ? `galpón N° ${galponNumero()}` : 'el galpón evaluado';
  const fechaVisita = val('fecha') || 'la fecha registrada';
  const diaLoteTxt = val('diaLote') ? `, día de lote ${val('diaLote')}` : '';

  setNarrativeDefault('objetivos',
    `Evaluar el estado operativo de los sistemas de control, ventilación, alimentación e hidratación del ${galpon} `+
    `en ${granja}, verificando su correcto funcionamiento y las condiciones ambientales del lote actual`+
    `${diaLoteTxt}, con el fin de identificar hallazgos que puedan afectar el bienestar animal o la eficiencia productiva.`);

  setNarrativeDefault('alcance',
    `La presente visita técnica cubrió la inspección del sistema de control y automatización, el tablero de potencia, `+
    `las variables ambientales, los sistemas de ventilación y refrigeración, y los sistemas mecánicos de alimentación `+
    `y bebederos del ${galpon} en ${granja}, realizada el ${fechaVisita}. No se incluyen aspectos sanitarios ni de manejo zootécnico.`);

  setNarrativeDefault('actividades',
    `Durante la visita se revisaron los sensores instalados y su cobertura, se tomaron lecturas de temperatura, humedad, `+
    `presión estática, CO2 y amoníaco, se inspeccionó el estado físico del tablero y otros equipos, se realizaron pruebas `+
    `de emergencia y termografía, se evaluaron los sistemas de ventilación y los sistemas mecánicos de alimentación e `+
    `hidratación, y se registró evidencia fotográfica de los hallazgos relevantes.`);

  document.getElementById('r_cliente').textContent = clienteNombre() || '—';
  document.getElementById('r_granja').textContent = granjaNombre() || '—';
  document.getElementById('r_ubicacion').textContent = val('ubicacion') || '—';
  document.getElementById('r_fecha').textContent = val('fecha') || '—';
  document.getElementById('r_galpones').textContent = `${val('totalGalpones')||'—'} / N° ${galponNumero()||'—'}`;
  document.getElementById('r_aves').textContent = val('numAves') ? val('numAves')+' aves' : '—';
  document.getElementById('r_lote').textContent = val('diaLote') ? 'Día '+val('diaLote') : '—';

  document.getElementById('r_admin').textContent = [val('admNombre'), val('admCel')].filter(Boolean).join(' · ') || '—';
  document.getElementById('r_vet').textContent = [val('vetNombre'), val('vetCel')].filter(Boolean).join(' · ') || '—';
  document.getElementById('r_correo').textContent = val('correo') || '—';

  document.getElementById('r_ctrl').textContent = [val('ctrlMarca'), val('ctrlModelo')].filter(Boolean).join(' · ') || '—';
  document.getElementById('r_serial').textContent = val('ctrlSerial') || '—';
  document.getElementById('r_version').textContent = val('ctrlVersion') || '—';
  document.getElementById('r_volt').textContent = (val('voltAC')||val('voltDC')) ? `${val('voltAC')||'—'} V AC / ${val('voltDC')||'—'} V DC` : '—';

  document.getElementById('r_ltemp').textContent = val('lTemp') ? val('lTemp')+' °C' : '—';
  document.getElementById('r_lhum').textContent = val('lHum') ? val('lHum')+' %' : '—';
  document.getElementById('r_lpres').textContent = val('lPres') ? val('lPres')+' in.H2O' : '—';
  document.getElementById('r_lco2').textContent = val('lCO2') ? val('lCO2')+' ppm' : '—';
  document.getElementById('r_lamm').textContent = val('lAmm') ? val('lAmm')+' ppm' : '—';

  document.getElementById('r_medFases').textContent = (val('mL1L2')||val('mL2L3')||val('mL1L3'))
    ? `${val('mL1L2')||'—'} / ${val('mL2L3')||'—'} / ${val('mL1L3')||'—'} V` : '—';
  document.getElementById('r_medNeutro').textContent = (val('mL1N')||val('mL2N')||val('mL3N'))
    ? `${val('mL1N')||'—'} / ${val('mL2N')||'—'} / ${val('mL3N')||'—'} V` : '—';
  document.getElementById('r_tempMax').textContent = val('tempMax') ? val('tempMax')+' °C' : '—';
  document.getElementById('r_puntosCalientes').textContent = puntosCalientes ? (puntosCalientes==='si' ? 'Sí' : 'No') : '—';

  document.getElementById('r_termostatos').textContent = (val('termoInstalados')||val('termoOperativos'))
    ? `${val('termoInstalados')||'—'} / ${val('termoOperativos')||'—'}` : '—';
  const peValues = Object.values(pruebaEmergenciaState);
  document.getElementById('r_pruebaEmergencia').textContent = peValues.length
    ? `${peValues.filter(v=>v==='si').length} de ${pruebaEmergenciaCriterios.length} en SÍ` : '—';
  const maState = medAmbientalesState;
  document.getElementById('r_presSellamiento').textContent = (maState.presSellamiento && maState.presSellamiento.valor) ? maState.presSellamiento.valor+' IN.H2O' : '—';
  document.getElementById('r_presVentMinima').textContent = (maState.presVentMinima && maState.presVentMinima.valor) ? maState.presVentMinima.valor+' IN.H2O' : '—';
  document.getElementById('r_velAire').textContent = (maState.velAire && maState.velAire.valor) ? maState.velAire.valor+' m/s' : '—';
  document.getElementById('r_intensidadLuz').textContent = (maState.intensidadLuz && maState.intensidadLuz.valor) ? maState.intensidadLuz.valor+' lux' : '—';

  document.getElementById('r_extractores').textContent = (val('extMarca')||val('extCantidad'))
    ? `${val('extMarca')||'—'} / ${val('extCantidad')||'—'}` : '—';
  document.getElementById('r_inlets').textContent = (val('inlVelocidad')||val('inlCantidad'))
    ? `${val('inlVelocidad')||'—'} m/s / ${val('inlCantidad')||'—'}` : '—';
  document.getElementById('r_tunel').textContent = (val('tunelNPuertas')||val('tunelLongitud'))
    ? `${val('tunelNPuertas')||'—'} / ${val('tunelLongitud')||'—'}` : '—';
  const mojaMap = {si:'Sí', no:'No', na:'N/A'};
  document.getElementById('r_mojaUniforme').textContent = mojaMap[panelHumedoState['Moja Uniforme']] || '—';

  document.getElementById('r_comedero').textContent = (val('comLongitud')||val('comNLineas'))
    ? `${val('comLongitud')||'—'} / ${val('comNLineas')||'—'}` : '—';
  document.getElementById('r_bebedero').textContent = (val('bebLongitud')||val('bebNLineas'))
    ? `${val('bebLongitud')||'—'} / ${val('bebNLineas')||'—'}` : '—';
  document.getElementById('r_alimentacion').textContent = (val('aliNSilos')||val('aliNLineas'))
    ? `${val('aliNSilos')||'—'} / ${val('aliNLineas')||'—'}` : '—';

  document.getElementById('r_recibe').textContent = [val('recibeNombre'), val('recibeFirma')].filter(Boolean).join(' · ') || '—';
  document.getElementById('r_realiza').textContent = [val('realizaNombre'), val('realizaFirma')].filter(Boolean).join(' · ') || '—';

  document.getElementById('repSub').textContent = `${granjaNombre()||'Granja sin nombre'} · ${val('fecha')||'Fecha sin definir'}`;

  // estados agrupados por sección (para el resumen y cada bloque del informe)
  const sec2 = [];
  Object.entries(estadoState).forEach(([k,v])=> sec2.push({name:k, v}));
  sensorTypes.forEach(s=> sec2.push({name:s.label, v: sensorState[s.key] ? sensorState[s.key].estado : 'n'}));

  const sec3 = [];
  Object.entries(tableroFisicoState).forEach(([k,v])=> sec3.push({name:k, v}));
  Object.entries(otrosEquiposState).forEach(([k,v])=> sec3.push({name:k, v}));

  const sec4 = [];
  medAmbientalesCriterios.forEach(c=> sec4.push({name:c.label, v: medAmbientalesState[c.key] ? medAmbientalesState[c.key].estado : 'n'}));

  const sec5 = [];
  Object.entries(extractoresState).forEach(([k,v])=> sec5.push({name:'Extractores', v}));
  Object.entries(inletsState).forEach(([k,v])=> sec5.push({name:'Inlets', v}));
  Object.entries(nebulizacionState).forEach(([k,v])=> sec5.push({name:'Nebulización', v}));
  if(panelHumedoState['Estado general']) sec5.push({name:'Panel húmedo (general)', v:panelHumedoState['Estado general']});
  if(panelHumedoState['Estado de la bomba']) sec5.push({name:'Panel húmedo (bomba)', v:panelHumedoState['Estado de la bomba']});
  Object.entries(tunelState).forEach(([k,v])=> sec5.push({name:'Túnel door', v}));
  Object.entries(ventiladoresState).forEach(([k,v])=> sec5.push({name:'Ventiladores', v}));

  const sec6 = [];
  Object.entries(comederoState).forEach(([k,v])=> sec6.push({name:'Comedero automático', v}));
  Object.entries(bebederoState).forEach(([k,v])=> sec6.push({name:k, v}));
  Object.entries(alimentacionState).forEach(([k,v])=> sec6.push({name:'Sistema de alimentación', v}));

  const sectionRowsHtml = items => items.map(c=>`
    <div class="rd-row"><span>${c.name}</span><span class="status-badge ${statusClass[c.v]}"><span class="dot"></span>${statusLabel[c.v]}</span></div>
  `).join('');

  document.getElementById('r_estado_sec2').innerHTML = sectionRowsHtml(sec2);
  document.getElementById('r_estado_sec3').innerHTML = sectionRowsHtml(sec3);
  document.getElementById('r_estado_sec4').innerHTML = sectionRowsHtml(sec4);
  document.getElementById('r_estado_sec5').innerHTML = sectionRowsHtml(sec5);
  document.getElementById('r_estado_sec6').innerHTML = sectionRowsHtml(sec6);

  const combined = [...sec2, ...sec3, ...sec4, ...sec5, ...sec6];

  document.getElementById('r_obs').textContent = val('observaciones') || 'Sin observaciones registradas.';

  const tableroObsParts = [];
  if(val('obsTableroFisico')) tableroObsParts.push('Tablero: ' + val('obsTableroFisico'));
  if(val('obsOtrosEquipos')) tableroObsParts.push('Otros equipos: ' + val('obsOtrosEquipos'));
  if(val('obsTermografia')) tableroObsParts.push('Termografía: ' + val('obsTermografia'));
  document.getElementById('r_obsTablero').textContent = tableroObsParts.length ? tableroObsParts.join('\n') : 'Sin observaciones registradas.';

  const variablesObsParts = [];
  if(val('obsPruebaEmergencia')) variablesObsParts.push('Prueba de emergencia: ' + val('obsPruebaEmergencia'));
  if(val('obsTermostatos')) variablesObsParts.push('Termostatos: ' + val('obsTermostatos'));
  if(val('obsMedAmbientales')) variablesObsParts.push('Mediciones ambientales: ' + val('obsMedAmbientales'));
  document.getElementById('r_obsVariables').textContent = variablesObsParts.length ? variablesObsParts.join('\n') : 'Sin observaciones registradas.';

  document.getElementById('r_obsVentilacion').textContent = val('obsVentilacion') || 'Sin observaciones registradas.';
  document.getElementById('r_obsMecanicos').textContent = val('obsMecanicos') || 'Sin observaciones registradas.';

  const fotoGrid = document.getElementById('r_fotoGrid');
  const fotoEmpty = document.getElementById('r_fotoEmpty');
  fotoEmpty.style.display = evidenciaFotos.length ? 'none' : 'block';
  fotoGrid.innerHTML = evidenciaFotos.map(f=>`
    <div class="rfoto-card">
      <img src="${f.dataUrl}" alt="">
      <div class="rfoto-caption">${f.descripcion ? f.descripcion : 'Sin descripción.'}</div>
    </div>
  `).join('');

  let cb=0, cr=0, cm=0, cn=0;
  combined.forEach(c=>{
    if(c.v==='b') cb++; else if(c.v==='r') cr++; else if(c.v==='m') cm++; else cn++;
  });
  const cTotal = cb+cr+cm+cn || 1;
  const cPct = Math.round((cb/cTotal)*100);

  setNarrativeDefault('resultados',
    `De los ${cTotal} criterios técnicos evaluados durante la visita, ${cb} (${cPct}%) se encontraron en buen estado, `+
    `${cr} en estado regular y ${cm} en estado malo. `+
    (cm>0
      ? `Los hallazgos más críticos se concentran en los equipos y variables detallados en las secciones anteriores, particularmente aquellos marcados en estado malo.`
      : `No se identificaron equipos en estado crítico durante la evaluación.`));

  setNarrativeDefault('conclusiones',
    (cPct>=85
      ? `El ${galpon} en ${granja} presenta condiciones generales adecuadas para el desarrollo del lote actual, con la mayoría de los sistemas de control, ventilación y alimentación operando dentro de los parámetros esperados.`
      : cPct>=60
        ? `El ${galpon} en ${granja} presenta condiciones aceptables en general, aunque existen equipos y variables en estado regular o malo que deben ser corregidos para asegurar el desempeño óptimo del lote.`
        : `El ${galpon} en ${granja} presenta condiciones que requieren atención, con un número considerable de equipos y variables fuera de los parámetros esperados.`)+
    ` Esta visita permitió documentar de forma objetiva el estado actual de la infraestructura evaluada.`);

  setNarrativeDefault('recomendaciones',
    `Se recomienda dar seguimiento prioritario a los equipos y variables registrados en estado malo, y programar mantenimiento `+
    `preventivo para los que se encuentran en estado regular. Así mismo, se sugiere verificar la calibración de los sensores `+
    `instalados, mantener actualizado el registro fotográfico de hallazgos y coordinar una próxima visita de seguimiento para `+
    `confirmar la implementación de las acciones correctivas aquí señaladas.`);

  drawDonut(combined);
}

function drawDonut(combined){
  let b=0,r=0,m=0,n=0;
  combined.forEach(c=>{
    if(c.v==='b') b++; else if(c.v==='r') r++; else if(c.v==='m') m++; else n++;
  });
  const total = b+r+m+n || 1;

  document.getElementById('r_sumBueno').textContent = b;
  document.getElementById('r_sumRegular').textContent = r;
  document.getElementById('r_sumMalo').textContent = m;
  document.getElementById('r_sumNA').textContent = n;
  document.getElementById('r_pctBueno').textContent = Math.round((b/total)*100) + '%';
  document.getElementById('r_pctRegular').textContent = Math.round((r/total)*100) + '%';
  document.getElementById('r_pctMalo').textContent = Math.round((m/total)*100) + '%';
  document.getElementById('r_pctNA').textContent = Math.round((n/total)*100) + '%';
  document.getElementById('r_donutTotal').textContent = `${total} criterio${total===1?'':'s'} evaluado${total===1?'':'s'}`;

  const pctGoodVerdict = Math.round((b/total)*100);
  const verdictParts = [`<b>${pctGoodVerdict}%</b> de los ${total} criterios evaluados se encuentran en buen estado.`];
  if(m>0) verdictParts.push(`Se identificaron <b>${m}</b> criterio${m===1?'':'s'} en estado malo que requiere${m===1?'':'n'} atención prioritaria.`);
  if(r>0) verdictParts.push(`<b>${r}</b> criterio${r===1?'':'s'} en estado regular a monitorear.`);
  const verdictEl = document.getElementById('r_verdict');
  verdictEl.innerHTML = verdictParts.join(' ');
  verdictEl.classList.remove('tier-good','tier-warn','tier-bad');
  verdictEl.classList.add(pctGoodVerdict>=85 ? 'tier-good' : pctGoodVerdict>=60 ? 'tier-warn' : 'tier-bad');
  const data = [
    {v:b, color:'#1C8B4C'}, {v:r, color:'#EE7D0E'}, {v:m, color:'#C0392B'}, {v:n, color:'#93A199'}
  ];
  const svg = document.getElementById('donutSvg');
  const cx=75, cy=75, radius=58, stroke=18, circ = 2*Math.PI*radius;
  let offset = 0;
  let circles = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#EDF3EC" stroke-width="${stroke}"/>`;
  data.forEach(d=>{
    if(d.v<=0) return;
    const frac = d.v/total;
    const len = frac*circ;
    circles += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${d.color}" stroke-width="${stroke}"
      stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;
    offset += len;
  });
  const pctGood = Math.round((b/total)*100);
  circles += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-family="IBM Plex Mono" font-size="22" font-weight="700" fill="#152920">${pctGood}%</text>`;
  circles += `<text x="${cx}" y="${cy+16}" text-anchor="middle" font-family="Inter" font-size="10" fill="#8B9990">en buen estado</text>`;
  svg.innerHTML = circles;
}

/* ============ SAMPLE DATA ============ */
function loadSample(){
  pickCliente('c1');
  const granjaSel = document.getElementById('granjaSelect');
  granjaSel.value = 'g1';
  granjaSel.dispatchEvent(new Event('change'));
  const galponSel = document.getElementById('galponSelect');
  galponSel.value = 'p3';
  galponSel.dispatchEvent(new Event('change'));

  document.getElementById('fecha').value = new Date().toISOString().slice(0,10);
  document.getElementById('diaLote').value = 18;

  document.getElementById('ctrlMarca').value = 'Rotem';
  document.getElementById('ctrlModelo').value = 'Pro Touch 10';
  document.getElementById('ctrlSerial').value = 'RT-88213-A';
  document.getElementById('ctrlVersion').value = 'v4.2.1';
  document.getElementById('voltAC').value = 118.4;
  document.getElementById('voltDC').value = 12.1;

  sensorState = {
    temp:{instalados:8, detectados:8, estado:'b'},
    pres:{instalados:2, detectados:2, estado:'b'},
    hum:{instalados:4, detectados:3, estado:'r'},
    co2:{instalados:2, detectados:1, estado:'m'},
    amm:{instalados:2, detectados:2, estado:'b'},
  };
  renderSensorTable();

  document.getElementById('lTemp').value = 24.6;
  document.getElementById('lHum').value = 61;
  document.getElementById('lPres').value = 0.08;
  document.getElementById('lCO2').value = 1850;
  document.getElementById('lAmm').value = 12;

  estadoState = {
    "Pantalla":'b', "Teclado / botones":'r', "Gabinete":'b', "Cableado eléctrico":'r',
    "Fuente de alimentación":'b'
  };
  renderEstadoList();

  document.getElementById('observaciones').value = 'Sensor de CO2 en galpón 3 con detección intermitente, se recomienda reemplazo. Ventilador N°4 presenta ruido anormal, programar mantenimiento preventivo esta semana.';

  document.getElementById('mL1L2').value = 219.4;
  document.getElementById('mL2L3').value = 220.1;
  document.getElementById('mL1L3').value = 218.7;
  document.getElementById('mL1N').value = 126.8;
  document.getElementById('mL2N').value = 127.2;
  document.getElementById('mL3N').value = 125.9;

  tableroFisicoState = { "Limpieza":'b', "Humedad":'b', "Corrosión":'r', "Orden":'b' };
  renderTableroFisicoList();
  document.getElementById('obsTableroFisico').value = 'Ligera oxidación en prensaestopas inferior del tablero, sin afectar el circuito.';

  otrosEquiposState = { "DIMMER":'b', "RDT-5":'b', "RSW/RSU":'r', "BACKUP":'b' };
  renderOtrosEquiposList();
  document.getElementById('obsOtrosEquipos').value = 'RSW/RSU con respuesta lenta al reconectar, se recomienda revisión.';

  document.getElementById('tempMax').value = 38.5;
  puntosCalientes = 'no';
  document.querySelectorAll('#puntosCalientesToggle .seg-btn').forEach(b=>{
    b.classList.toggle('sel', b.dataset.v === puntosCalientes);
  });
  document.getElementById('obsTermografia').value = 'Sin puntos calientes relevantes; temperatura máxima dentro de rango normal.';

  pruebaEmergenciaState = {
    "Alarma sonora":'si', "Alarma visual":'si', "Desarme de cortina":'si', "Ventilación forzada":'si',
    "Backup":'si', "Temperatura alta":'no', "Presión alta":'no'
  };
  renderPruebaEmergenciaList();
  document.getElementById('obsPruebaEmergencia').value = 'Alarmas de temperatura y presión alta no dispararon durante la prueba; se recomienda calibrar sensores.';

  document.getElementById('termoInstalados').value = 4;
  document.getElementById('termoOperativos').value = 4;
  document.getElementById('obsTermostatos').value = 'Todos los termostatos responden correctamente dentro del rango esperado.';

  medAmbientalesState = {
    presSellamiento: {valor:0.12, estado:'b'},
    presVentMinima:  {valor:0.05, estado:'b'},
    velAire:         {valor:1.8,  estado:'r'},
    intensidadLuz:   {valor:8,    estado:'b'},
  };
  renderMedAmbientalesList();
  document.getElementById('obsMedAmbientales').value = 'Velocidad de aire promedio ligeramente por debajo del óptimo en galpón 3.';

  document.getElementById('extMarca').value = 'Munters';
  document.getElementById('extCantidad').value = 8;
  extractoresState = { "Estado":'b' };
  renderExtractoresList();

  document.getElementById('inlVelocidad').value = 2.4;
  document.getElementById('inlCantidad').value = 24;
  inletsState = { "Estado":'b' };
  renderInletsList();

  nebulizacionState = { "Estado":'b' };
  renderNebulizacionList();

  panelHumedoState = { "Estado general":'r', "Moja Uniforme":'si', "Estado de la bomba":'b' };
  renderPanelHumedoGeneral();
  renderMojaUniforme();
  renderPanelHumedoBomba();

  document.getElementById('tunelNPuertas').value = 4;
  document.getElementById('tunelLongitud').value = 110;
  tunelState = { "Estado":'b' };
  renderTunelList();

  ventiladoresState = { "Estado":'b' };
  renderVentiladoresList();

  document.getElementById('obsVentilacion').value = 'Panel húmedo con leve canalización de agua en el tercio final; se recomienda ajustar distribución.';

  document.getElementById('comLongitud').value = 120;
  document.getElementById('comNLineas').value = 4;
  comederoState = { "Estado":'b' };
  renderComederoList();

  document.getElementById('bebLongitud').value = 120;
  document.getElementById('bebNLineas').value = 4;
  bebederoState = { "Estado panel hidráulico":'b', "Estado filtro":'m', "Estado Dosatron":'b' };
  renderBebederoList();

  document.getElementById('aliNSilos').value = 2;
  document.getElementById('aliNLineas').value = 4;
  alimentacionState = { "Estado":'b' };
  renderAlimentacionList();

  document.getElementById('obsMecanicos').value = 'Filtro del bebedero con sedimento acumulado; se recomienda limpieza esta semana.';

  document.getElementById('recibeNombre').value = 'Pedro Perez';
  document.getElementById('realizaNombre').value = 'Briam Becerra';

  updateContextChip();
}

document.getElementById('btnSample').addEventListener('click', loadSample);

/* ============ INIT ============ */
renderSensorTable();
renderEstadoList();
renderTableroFisicoList();
renderOtrosEquiposList();
renderPruebaEmergenciaList();
renderMedAmbientalesList();
renderExtractoresList();
renderInletsList();
renderNebulizacionList();
renderPanelHumedoGeneral();
renderMojaUniforme();
renderPanelHumedoBomba();
renderTunelList();
renderVentiladoresList();
renderComederoList();
renderBebederoList();
renderAlimentacionList();
renderFotoGrid();
updateContextChip();
