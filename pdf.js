/* Local PDF export: no network request, account or external dependency. */
(function(root){
'use strict';
function clean(text){return String(text).normalize('NFC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/\u00a0/g,' ').replace(/[^\x20-\x7e\xa0-\xff\n\r\t]/gu,'?');}
function literal(text){return clean(text).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
function wrap(text,max=79){const result=[];for(const line of clean(text).split(/\r?\n/)){let rest=line.replace(/\t/g,'    ');if(!rest){result.push('');continue;}while(rest.length>max){let cut=rest.lastIndexOf(' ',max);if(cut<1)cut=max;result.push(rest.slice(0,cut));rest=rest.slice(cut).replace(/^ +/,'');}result.push(rest);}return result;}
function create(state,missions){
const pages=[];let commands=[],y=785,page=1;
const text=(value,size=10,font='F1',color='0.235 0.235 0.235')=>{if(y<65)finish();commands.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 48 ${y} Tm (${literal(value)}) Tj ET`);y-=size+5;};
function finish(){commands.push(`BT /F1 9 Tf 0.35 0.39 0.42 rg 1 0 0 1 48 32 Tm (Gemaakt door Marijke Peusken | Aventus | 2026 | Pagina ${page++}) Tj ET`);pages.push(commands.join('\n'));commands=[];y=785;}
function para(s){for(const line of wrap(s||'Nog niet ingevuld'))text(line);y-=6;}
text('MIJN TOEKOMST? GEEN IDEE!',19,'F2');text('Persoonlijke startkaart - Leerjaar 2 - Periode 2',11,'F2');y-=8;
para('Naam: '+(state.name||'Niet ingevuld')+' | Klas: '+(state.group||'Niet ingevuld'));
para('Gemaakt op: '+new Date().toLocaleDateString('nl-NL',{timeZone:'Europe/Amsterdam'}));
for(let i=0;i<missions.length;i++){
 if(y<130)finish();
 text(`${i+1}. ${missions[i].competency}`,12,'F2','0.10 0.36 0.41');
 text(missions[i].title,10,'F2');y-=4;
 para(state.answers[i]);y-=10;
}
if(y<150)finish();text('Mijn keuze voor deze periode',12,'F2','0.10 0.36 0.41');para(state.focus);
text('Mijn leerdoel: ik wil ontdekken...',11,'F2');para(state.goal);
finish();
const objects=[];const add=s=>{objects.push(s);return objects.length;};
add('<< /Type /Catalog /Pages 2 0 R >>');add('');
add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
const ids=[];for(const stream of pages){const content=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);ids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${content} 0 R >>`));}
objects[1]=`<< /Type /Pages /Kids [${ids.map(id=>id+' 0 R').join(' ')}] /Count ${ids.length} >>`;
let pdf='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=pdf.length;
pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
return Uint8Array.from(pdf,c=>c.charCodeAt(0));
}
root.LobPDF={create,wrap};
})(typeof window==='undefined'?globalThis:window);
