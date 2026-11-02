/* PDF is made entirely on this device. Browser font fallback preserves names
   in different scripts. Pages are high-resolution images; no data is sent. */
(function(root){
'use strict';
async function create(state,missions){
if(typeof document==='undefined')throw new Error('Browser required');
await document.fonts.ready;
const W=595,H=842,scale=2,margin=42,maxWidth=W-margin*2,pages=[];
let canvas,ctx,y=0,lines=[];
function begin(){canvas=document.createElement('canvas');canvas.width=W*scale;canvas.height=H*scale;ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';y=42;lines=[];}
function finish(){ctx.font='9px Arial, sans-serif';ctx.fillStyle='#59646c';ctx.fillText('Gemaakt door Marijke Peusken · Aventus · 2026',margin,H-33);ctx.textAlign='right';ctx.fillText('Pagina '+(pages.length+1),W-margin,H-33);ctx.textAlign='left';const raw=atob(canvas.toDataURL('image/jpeg',0.95).split(',')[1]);pages.push({image:Uint8Array.from(raw,c=>c.charCodeAt(0)),lines:lines});}
const graphemes=t=>typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('nl',{granularity:'grapheme'}).segment(t)].map(s=>s.segment):Array.from(t);
function line(text,size=11,bold=false,color='#303b43'){
if(y+size+5>H-56){finish();begin();}
ctx.font=`${bold?'bold ':''}${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.fillText(text,margin,y);lines.push({text,y,size});y+=size+5;
}
function paragraph(value,size=11,bold=false,color='#303b43'){
const font=`${bold?'bold ':''}${size}px Arial, sans-serif`;
for(const raw of String(value).replace(/\r\n?/g,'\n').split('\n')){
ctx.font=font;let buf='';
for(const ch of graphemes(raw)){ctx.font=font;if(ctx.measureText(buf+ch).width>maxWidth&&buf){const last=buf.lastIndexOf(' ');if(last>0){line(buf.slice(0,last),size,bold,color);buf=buf.slice(last+1)+ch;}else{line(buf,size,bold,color);buf=ch;}}else buf+=ch;}
line(buf,size,bold,color);
}y+=6;
}
function heading(t){if(y>H-145){finish();begin();}y+=8;paragraph(t,13,true,'#176573');}
begin();paragraph('Mijn toekomst? Geen idee!',23,true);paragraph('Persoonlijke startkaart · LOB',12,true);y+=4;
paragraph('Naam: '+state.name.trim()+'    |    Klas: '+state.group.trim());paragraph('Gemaakt op: '+new Date().toLocaleDateString('nl-NL',{timeZone:'Europe/Amsterdam'}),10);
for(let i=0;i<5;i++){
heading((i+1)+'. '+missions[i].competency);
if(i<4){paragraph(missions[i].question,10,true);paragraph(state.answers[i].trim());if(i<3){paragraph(missions[i].extra,10,true);paragraph(state.details[i].trim());}}
else state.contacts.filter((c,i)=>i<2||c.who.trim()||c.help.trim()||c.newPerson).forEach((c,j)=>{paragraph('Persoon '+(j+1)+': '+c.who.trim(),11,true);paragraph('Kan helpen met: '+c.help.trim());if(c.newPerson)paragraph('Zo ga ik contact leggen: '+c.reach.trim());});
}
heading('Mijn onderwerp');paragraph(state.focus);heading('Mijn leerdoel: ik wil ontdekken…');paragraph(state.goal.trim());finish();
// Standard PDF image pages. Text is rendered by the browser, including font
// fallback and shaping, rather than being reduced to a Latin-only encoding.
const enc=new TextEncoder(),chunks=[];let length=0;const offsets=[0];
const push=b=>{if(typeof b==='string')b=enc.encode(b);chunks.push(b);length+=b.length;};
const obj=(id,parts)=>{offsets[id]=length;push(`${id} 0 obj\n`);for(const p of parts)push(p);push('\nendobj\n');};
push('%PDF-1.4\n');obj(1,['<< /Type /Catalog /Pages 2 0 R >>']);obj(2,[`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')}] >>`]);
const utf16=s=>'FEFF'+Array.from({length:s.length},(_,i)=>s.charCodeAt(i).toString(16).padStart(4,'0')).join('');
pages.forEach((p,i)=>{const id=3+i*3,stream=`q ${W} 0 0 ${H} 0 0 cm /Image Do Q\n`+p.lines.map(l=>`/Span << /ActualText <${utf16(l.text)}> >> BDC BT /F1 ${l.size} Tf 3 Tr 1 0 0 1 ${margin} ${H-l.y-l.size} Tm (x) Tj ET EMC`).join('\n');obj(id,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${3+pages.length*3} 0 R >> /XObject << /Image ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`]);obj(id+1,[`<< /Type /XObject /Subtype /Image /Width ${W*scale} /Height ${H*scale} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.image.length} >>\nstream\n`,p.image,'\nendstream']);obj(id+2,[`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`]);});
obj(3+pages.length*3,['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']);
const xref=length;push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);offsets.slice(1).forEach(o=>push(String(o).padStart(10,'0')+' 00000 n \n'));push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
const bytes=new Uint8Array(length);let pos=0;chunks.forEach(b=>{bytes.set(b,pos);pos+=b.length;});return bytes;
}
root.LobPDF={create};
})(typeof window==='undefined'?globalThis:window);
