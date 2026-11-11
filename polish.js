document.addEventListener('DOMContentLoaded',()=>{
 const box=document.querySelector('#rtcSettings .stBox');
 // Existing account handlers remain on their original nodes.
 const account=document.getElementById('rtcAcct'),accountTitle=account&&account.previousElementSibling;
 if(account&&accountTitle&&accountTitle.classList.contains('stSec')){const d=document.createElement('details');d.className='stAccount';const label=document.createElement('summary');label.textContent='ACCOUNT';accountTitle.before(d);d.append(label,account);accountTitle.remove();}
 for(const title of [...box.querySelectorAll(':scope > .stSec')]){const card=document.createElement('div');card.className='stCard';title.before(card);let n=title;while(n){const next=n.nextElementSibling;card.append(n);if(!next||next.classList.contains('stSec')||next.classList.contains('stNote')||next.id==='stClose'||next.classList.contains('btn'))break;n=next;}}
 const saved=document.createElement('p');saved.className='stSaved';saved.textContent='Changes saved automatically';document.getElementById('stClose').before(saved);
 const settings=document.getElementById('rtcSettings');document.addEventListener('keydown',e=>{if(settings.getAttribute('aria-hidden')==='true'||e.key!=='Tab')return;const items=[...settings.querySelectorAll('button,input,summary')].filter(el=>el.getClientRects().length&&!el.disabled);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}},true);
});
