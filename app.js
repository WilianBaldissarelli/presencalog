
let DB = {employees:[],dates:[]};
const $ = id => document.getElementById(id);
const fmt = iso => new Date(iso+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
const currentDate = () => {
  const iso = new Date().toISOString().slice(0,10);
  return DB.dates.includes(iso) ? iso : DB.dates[DB.dates.length-1];
};
fetch("data.json").then(r=>r.json()).then(data=>{DB=data;setup();});

function setup(){
  [...new Set(DB.employees.map(e=>e.turno).filter(Boolean))].sort().forEach(v=>$("shiftFilter").insertAdjacentHTML("beforeend",`<option>${v}</option>`));
  [...new Set(DB.employees.map(e=>e.cargo).filter(Boolean))].sort().forEach(v=>$("roleFilter").insertAdjacentHTML("beforeend",`<option>${v}</option>`));
  DB.dates.forEach(d=>$("dateFilter").insertAdjacentHTML("beforeend",`<option value="${d}">${fmt(d)}</option>`));
  $("dateFilter").value=currentDate();
  $("employeeLoginBtn").onclick=loginEmployee;
  $("managerLoginBtn").onclick=()=>showManager();
  $("logoutBtn").onclick=logout;
  ["dateFilter","shiftFilter","roleFilter","searchFilter"].forEach(id=>$(id).addEventListener("input",renderManager));
}
function show(view){
  ["loginView","employeeView","managerView"].forEach(id=>$(id).classList.add("hidden"));
  $(view).classList.remove("hidden");
  $("logoutBtn").classList.toggle("hidden",view==="loginView");
}
function loginEmployee(){
  const id=$("loginId").value.trim();
  const emp=DB.employees.find(e=>e.idGroot===id && !e.reposicao);
  if(!emp){$("loginError").textContent="ID Groot não encontrado na planilha.";return;}
  $("loginError").textContent="";
  renderEmployee(emp);show("employeeView");
}
function renderEmployee(emp){
  const date=currentDate(), status=emp.calendario[date]||"SEM DADO";
  $("employeeName").textContent=emp.nome;
  $("employeeMeta").textContent=`${emp.cargo} • Turno ${emp.turno}`;
  $("employeeTime").textContent=emp.horario||"-";
  $("employeeScale").textContent=emp.escala||"-";
  $("todayStatus").textContent=status==="TRABALHA"?"Trabalha":status==="FOLGA"?"Folga":"Sem dado";
  $("todayBadge").textContent=$("todayStatus").textContent;
  $("todayBadge").className="status-badge "+(status==="TRABALHA"?"status-work":"status-off");
  const next=DB.dates.find(d=>d>date && emp.calendario[d]==="FOLGA");
  $("nextOff").textContent=next?fmt(next):"Não encontrada";
  $("employeeCalendar").innerHTML=DB.dates.map(d=>{
    const st=emp.calendario[d], cls=st==="FOLGA"?"offday":"workday";
    return `<div class="day ${cls}"><b>${fmt(d).slice(0,5)}</b><span>${st==="FOLGA"?"Folga":"Trabalha"}</span></div>`;
  }).join("");
}
function showManager(){show("managerView");renderManager();}
function renderManager(){
  const date=$("dateFilter").value, shift=$("shiftFilter").value, role=$("roleFilter").value, q=$("searchFilter").value.toLowerCase();
  const filtered=DB.employees.filter(e=>(!shift||e.turno===shift)&&(!role||e.cargo===role)&&(!q||e.nome.toLowerCase().includes(q)||e.idGroot.includes(q)));
  $("kpiTotal").textContent=filtered.length;
  $("kpiWorking").textContent=filtered.filter(e=>e.calendario[date]==="TRABALHA"&&!e.reposicao).length;
  $("kpiOff").textContent=filtered.filter(e=>e.calendario[date]==="FOLGA"&&!e.reposicao).length;
  $("kpiReplacement").textContent=filtered.filter(e=>e.reposicao).length;
  $("resultCount").textContent=`${filtered.length} registros`;
  $("employeesTable").innerHTML=filtered.map(e=>{
    const st=e.calendario[date]||"SEM DADO";
    return `<tr class="${e.reposicao?"replacement":""}"><td>${e.nome}</td><td>${e.idGroot||"—"}</td><td>${e.cargo}</td><td>${e.turno}</td><td>${e.escala}</td><td>${e.horario}</td><td>${e.reposicao?"REPOSIÇÃO":st}</td></tr>`;
  }).join("");
}
function logout(){show("loginView");$("loginPassword").value="";}
