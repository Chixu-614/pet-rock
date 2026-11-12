
'use strict';
const KEY='pet-rock-hard-carry-v1',$=s=>document.querySelector(s),pick=a=>a[Math.floor(Math.random()*a.length)];
let logsExpanded=false;let state=RockStore.state;const valid=RockStore.valid;function save(){RockStore.state=state;RockStore.save()}
function toast(text){$('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3500)}
function say(text){RockScene.pet();$('#speech').textContent=text}
function log(text){state.logs.unshift({text,time:Date.now()});state.logs=state.logs.slice(0,40)}
function achieve(name){if(!state.ach.includes(name)){state.ach.push(name);log('◇ 达成成就：'+name);RockFeedback.achievement(name)}}
function render(){ $('#soundToggle').textContent='音效：'+(state.sound?'开':'关');$('#soundToggle').setAttribute('aria-pressed',String(state.sound));$('#nameplate').textContent='「'+state.name+'」 · 品种：路边的';$('#days').textContent='相识第 '+Math.max(1,Math.floor((Date.now()-state.born)/86400000)+1)+' 天';$('#touches').textContent='被摸 '+state.pets+' 次';RockScene.sync(state);$('#log').replaceChildren();$('#toggleLogs').hidden=state.logs.length<=5;$('#toggleLogs').textContent=logsExpanded?'收起记录':'展开其余 '+Math.max(0,state.logs.length-5)+' 条';$('#toggleLogs').setAttribute('aria-expanded',String(logsExpanded));for(const item of (logsExpanded?state.logs:state.logs.slice(0,5))){let el=document.createElement('div');el.className='entry';let t=new Date(item.time);el.textContent=t.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})+'　'+item.text;$('#log').append(el)}save()}
function modal(title,body,choices){$('#modalTitle').textContent=title;$('#modalBody').replaceChildren();if(typeof body==='string'){const p=document.createElement('p');p.textContent=body;$('#modalBody').append(p)}else $('#modalBody').append(body);if(choices){const group=document.createElement('div');group.className='choices';for(const [label,fn] of choices){const b=document.createElement('button');b.textContent=label;const foodIcon={'饺子':'dumpling','米饭':'rice','白开水':'water','特辣火锅':'hotpot'}[label];if(foodIcon){const icon=document.createElement('span');icon.className='choice-icon';icon.innerHTML=RockIcons.svg(foodIcon);b.prepend(icon)}b.onclick=()=>{$('#modal').close();fn()};group.append(b)}$('#modalBody').append(group)}$('#modal').showModal()}
$('#dismiss').onclick=()=>$('#modal').close();
function pet(){const woke=RockScene.touch();state.pets++;say(woke?'我没睡。我在进行低功耗存在。':state.pets===1?'干什么。……也没说不让摸。':RockLines.next('pet'));if(state.pets===5)achieve('摸石过河');if(state.pets===20)achieve('抛光师傅');if(state.pets%5===0)log('你摸了它 '+state.pets+' 次。它表面上毫无波澜。');render()}
function walk(){state.walks++;say(RockLines.next('walk'));log('散步完成：位移若干像素。精神上环游世界。');achieve('带它见过世面');if(state.walks===5)achieve('地质勘探员');render()}
const actions={pet,reset:()=>{RockScene.reset();say(RockLines.next('reset'))},walk:()=>RockScene.walk(),feed:()=>modal('今天吃点什么？','它没有嘴。不要被这个小问题限制。',[['饺子',()=>feed('饺子','我是石头，我不吃……什么馅的？')],['米饭',()=>feed('米饭','放那吧。你转过去，我研究一下。')],['白开水',()=>feed('白开水','谢谢，正在经历缓慢的水土流失。')],['特辣火锅',()=>feed('火锅','现在我是一块有温度的石头。物理意义上的。')]]),bed:()=>itemsPanel(),sound:()=>{state.sound=!state.sound;render();if(state.sound)RockFeedback.play('item')},friend:()=>friendsPanel(),mental:()=>{say('硬撑。');modal('精神状态检查报告','精神状态：硬撑。\n身体状态：硬的。\n近期目标：保持原样。\n医嘱：别给自己太大压力，也别给石头。');achieve('确诊为石头');render()},name:()=>{const box=document.createElement('div'),p=document.createElement('p'),input=document.createElement('input');p.textContent='名字会影响它的一生吗？不会，但你可以取。';input.maxLength=20;input.value=state.name;input.setAttribute('aria-label','石头的新名字');box.append(p,input);modal('户口登记处',box,[['确认登记',()=>{state.name=input.value.trim()||'石头';say('好，我现在叫'+state.name+'。叫我也不一定会答应。');log('正式更名为「'+state.name+'」。岩性未变。');achieve('这块石头有编制');render()}]])},achievements:()=>achievementsPanel(),export:()=>{const blob=new Blob([JSON.stringify({format:'pet-rock-backup',state},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='石头的户口本.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);say('连我这种履历也要备份吗。……你还挺认真的。')},import:()=>$('#importFile').click()};
function feed(food,line){const key={'饺子':'dumpling','米饭':'rice','白开水':'water','火锅':'hotpot'}[food];state.feeds++;say(state.feeds===1?line:RockLines.next(key));log('投喂了'+food+'。食物在你没注意时消失了。');if(state.feeds===1)achieve('地质学无法解释');render()}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>actions[b.dataset.action]());
$('#importFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>200000){toast('这本户口本太厚了，不能超过 200KB。');return}try{const data=JSON.parse(await file.text());if(data.format!=='pet-rock-backup'||!valid(data.state))throw Error();modal('接回这块石头？','导入会替换当前进度。如果舍不得现在这块，请先取消并导出存档。',[['确认替换',()=>{state=RockStore.migrate(data.state);logsExpanded=false;RockScene.reset();render();say('搬家完成。我没出力。')}],['取消',()=>{}]])}catch(e){toast('不是有效的石头存档。没有改动当前进度。')}};
function panelReply(box,text){if(!text)return;const reply=document.createElement('p');reply.className='panel-reply';reply.setAttribute('role','status');reply.setAttribute('aria-live','polite');reply.textContent=text;box.append(reply)}
function friendsPanel(feedback=''){
 const box=document.createElement('div'),intro=document.createElement('p');intro.textContent='最多两位一起发呆。收起只是回去歇歇，不会删除友谊。';box.append(intro);panelReply(box,feedback);
 for(const [id,label,detail] of [['round','小圆石','圆得很有边界感'],['tall','瘦高石','站得高，也没看远'],['flat','扁石','已经主动躺平']]){const b=document.createElement('button'),present=state.friends.includes(id);b.textContent=label+' · '+detail+' / '+(present?'暂时收起':'邀请');b.disabled=!present&&state.friends.length>=2;b.onclick=()=>{if(present){state.friends=state.friends.filter(x=>x!==id);say('它先回去了。具体回哪了，地质学界暂无定论。');log(label+'暂时回去了。友谊不受出勤率影响。')}else{if(state.friends.length>=2)return;state.friends.push(id);state.friend=true;achieve('沉默是一个群聊');say(RockLines.next('friend'));log(label+'来串门了。空气没有变得更热闹。')}render();$('#modal').close();friendsPanel($('#speech').textContent)};box.append(b)}modal('朋友来串门 · '+state.friends.length+' / 2',box)
}
$('#toggleLogs').onclick=()=>{logsExpanded=!logsExpanded;render()};
$('#clearLogs').onclick=()=>modal('销毁事故记录？','只清空文字记录，名字、次数、成就、物品和朋友都会保留。',[['确认清空',()=>{state.logs=[];logsExpanded=false;render();say('记录已销毁。我俩现在都没有案底。')}],['取消',()=>{}]]);
RockIcons.mount();RockScene.init($('#scene'),{pet,walk,friend:()=>{say('它专程来看我。它说：顺路，板块运动。')},rotate:heavy=>{if($('#modal').open)return false;RockScene.rotated(heavy);say(RockLines.next(heavy?'dizzy':'rotate'))}});window.addEventListener('rock-storage-error',()=>toast('当前浏览器无法保存，请及时导出备份。'));
const away=Date.now()-state.last;render();if(away>86400000)say('你回来了。这几天我一动没动，腰都坐没了。……我本来就没有腰。');else if(state.pets>0)say('又见面了。我还在这里，没有偷偷努力。');if(!RockStore.storageOK)toast('当前浏览器无法读取存档，请及时导出备份。');

const itemInfo={bed:['小床','有房了。但我还是想睡外面。'],blanket:['小毯子','现在是一份打包的地质资料。'],hat:['小帽子','学历没有变化，身份看起来增加了。'],box:['小纸箱','这是我的独栋。请不要问公摊。'],sign:['迷你路牌','此处有石。情况属实。'],note:['小纸条','对目前居住环境的建议：无。本人没有住过更好的。']};
function itemsPanel(feedback=''){
 const box=document.createElement('div'),intro=document.createElement('p');
 intro.textContent='免费捡点小玩意。地面摆件同时一件，帽子单独戴；收起不删除收藏。';box.append(intro);panelReply(box,feedback);
 const draw=document.createElement('button');draw.textContent='捡点什么回来';
 draw.onclick=()=>{
  const id=pick(Object.keys(itemInfo)),[name,line]=itemInfo[id];let reply;
  if(state.items.includes(id)){reply='捡到了同款'+name+'。没有搬回来，怕家里开分店。'}
  else{state.items.push(id);if(id==='bed'){state.bed=true;achieve('钱没花，冤枉当了')}if(id==='hat')state.hat=true;else if(id!=='note')state.placed=id;reply=line;log('捡到了'+name+'。'+line)}
  say(reply);RockFeedback.play('item');render();$('#modal').close();itemsPanel(reply);
 };box.append(draw);
 for(const id of state.items){
  const b=document.createElement('button'),[name,line]=itemInfo[id],shown=id==='hat'?state.hat:state.placed===id;
  b.textContent=name+' · '+(id==='note'?'读一读':shown?'收起来':'摆出来');
  b.onclick=()=>{
   if(id==='note'){say(line);modal('石头的意见',line);return}
   if(id==='hat')state.hat=!state.hat;else state.placed=shown?null:id;
   const reply=shown?(id==='hat'?'帽子摘了。现在恢复无职称状态。':name+'收好了。这里重新成为一块没有装修的地。'):line;
   say(reply);RockFeedback.play(shown?'put':'item');render();$('#modal').close();itemsPanel(reply);
  };box.append(b);
 }modal('随机物品 · 已收藏 '+state.items.length+' / 6',box)
}
function achievementsPanel(){const box=document.createElement('div');box.className='achievement-list';for(const name of state.ach){const card=document.createElement('div');card.className='achievement-badge';card.textContent='✦ '+name;box.append(card)}if(!state.ach.length)box.textContent='还没有。也没关系，它本来就没指望你有什么成就。';modal('无用成就 · '+state.ach.length+' / 9',box)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled&&b.dataset.action!=='sound')RockFeedback.play(b.dataset.action==='pet'?'pet':'tap')},true);
