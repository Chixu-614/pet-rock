/* Local synthesized effects: no audio downloads or background music. */
window.RockFeedback=(()=>{
 let ctx,last=0,queue=[],busy=false;
 // Midrange harmonics carry better on small phone speakers than low sine ticks.
 async function play(type='tap'){
  if(!RockStore.state.sound)return;
  const now=performance.now();if(type==='tap'||type==='pet'){if(now-last<110)return;last=now}
  try{
   ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
   if(ctx.state!=='running')await ctx.resume();
   if(!RockStore.state.sound||ctx.state!=='running')return;
   const notes={tap:[740],pet:[520],put:[440],item:[660,880],achievement:[659,831,988]}[type]||[740];
   notes.forEach((hz,i)=>{
    const t=ctx.currentTime+.012+i*.16,o=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.85,t+.22);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.50,t+.012);
    g.gain.setValueAtTime(.38,t+.075);g.gain.exponentialRampToValueAtTime(.0001,t+.28);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.30);
    o.onended=()=>{o.disconnect();g.disconnect()};
   });
  }catch(e){/* Audio is optional. */}
 }
 function next(){
  if(busy||!queue.length)return;busy=true;
  const name=queue.shift(),card=document.createElement('div');card.className='achievement-pop';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  const seal=document.createElement('div');seal.className='achievement-seal';seal.textContent='✦ 成就达成 ✦';
  const greeting=document.createElement('div');greeting.className='achievement-greeting';greeting.textContent='恭喜你达成';
  const title=document.createElement('strong');title.textContent='「'+name+'」';
  const caption=document.createElement('small');caption.textContent='你的无用之举，现已获得正式认可。';card.append(seal,greeting,title,caption);
  for(let i=0;i<16;i++){const star=document.createElement('i');star.textContent=i%2?'✦':'●';star.style.setProperty('--x',(i*37%100)+'%');star.style.setProperty('--delay',i*.035+'s');card.append(star)}
  document.body.append(card);
  if(typeof card.showPopover==='function'){card.setAttribute('popover','manual');try{card.showPopover()}catch(e){card.removeAttribute('popover')}}
   if(!card.hasAttribute('popover')){card.dataset.fallback='true';placeFallback()}
  play('achievement');setTimeout(()=>card.classList.add('leaving'),3700);setTimeout(()=>{card.remove();busy=false;next()},4100);
 }
 function placeFallback(){const dialog=document.querySelector('#modal'),parent=dialog?.open?dialog:document.body;document.querySelectorAll('.achievement-pop[data-fallback]').forEach(card=>{if(card.parentNode!==parent)parent.append(card)})}
 const dialog=document.querySelector('#modal');if(dialog){new MutationObserver(placeFallback).observe(dialog,{attributes:true,attributeFilter:['open']});dialog.addEventListener('close',placeFallback)}
 return{play,achievement(name){queue.push(name);next()}};
})();
