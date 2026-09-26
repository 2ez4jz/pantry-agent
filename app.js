const KEY='pantry-agent-v1';
const demo={
  inventory:[
    {id:crypto.randomUUID(),name:'瘦牛肉碎',quantity:900,unit:'g',days:3,kcal:176,protein:21,carbs:0,fat:10},
    {id:crypto.randomUUID(),name:'鸡腿肉',quantity:1400,unit:'g',days:4,kcal:177,protein:24,carbs:0,fat:8},
    {id:crypto.randomUUID(),name:'鸡蛋',quantity:8,unit:'个',days:14,kcal:143,protein:13,carbs:1,fat:10},
    {id:crypto.randomUUID(),name:'土豆',quantity:850,unit:'g',days:8,kcal:77,protein:2,carbs:17,fat:0.1},
    {id:crypto.randomUUID(),name:'米',quantity:2200,unit:'g',days:90,kcal:360,protein:7,carbs:79,fat:0.6},
    {id:crypto.randomUUID(),name:'西兰花',quantity:320,unit:'g',days:2,kcal:34,protein:2.8,carbs:7,fat:0.4}
  ],meals:[]};
let state=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(demo)}catch{return structuredClone(demo)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function toGrams(item,amount){if(item.unit==='kg')return amount*1000;if(item.unit==='g')return amount;return amount*100}
function nutrition(item,amount){const g=toGrams(item,amount);const f=g/100;return {kcal:item.kcal*f,protein:item.protein*f,carbs:item.carbs*f,fat:item.fat*f}}
function fmt(n){return Math.round(n*10)/10}
function todayMeals(){const t=new Date().toDateString();return state.meals.filter(m=>new Date(m.time).toDateString()===t)}
function totalMacros(meals=todayMeals()){return meals.reduce((a,m)=>({kcal:a.kcal+m.macros.kcal,protein:a.protein+m.macros.protein,carbs:a.carbs+m.macros.carbs,fat:a.fat+m.macros.fat}),{kcal:0,protein:0,carbs:0,fat:0})}
function renderMetrics(){const m=totalMacros();$('#metrics').innerHTML=[
 ['库存种类',state.inventory.length,'items'],
 ['今日热量',Math.round(m.kcal),'kcal'],
 ['今日蛋白',Math.round(m.protein),'g'],
 ['今日碳水 / 脂肪',Math.round(m.carbs)+' / '+Math.round(m.fat),'g']
].map(([a,b,c])=>`<div class="metric"><small>${a}</small><strong>${b}</strong><small>${c}</small></div>`).join('')}
function renderInventory(){
  if(!state.inventory.length){$('#inventoryTable').innerHTML='<div class="empty">还没有库存，先添加第一样食物。</div>';return}
  $('#inventoryTable').innerHTML=state.inventory.map(i=>`<div class="inventory-row">
    <div><strong>${i.name}</strong><br><span class="tag ${i.days<=2?'warn':''}">${i.days<=2?'尽快吃':'约 '+i.days+' 天'}</span></div>
    <div class="qty">${fmt(i.quantity)} ${i.unit}</div>
    <div><small>${i.protein}g P /100g</small></div>
    <button class="delete-btn" data-delete="${i.id}">删除</button>
  </div>`).join('');
  $$('[data-delete]').forEach(b=>b.onclick=()=>{state.inventory=state.inventory.filter(i=>i.id!==b.dataset.delete);save()})
}
function recipeCandidates(){
 const inv=[...state.inventory].sort((a,b)=>a.days-b.days);
 const protein=inv.find(i=>/牛|鸡|鱼|虾|蛋|火鸡|猪/.test(i.name))||inv[0];
 const carb=inv.find(i=>/米|土豆|面|燕麦|面包/.test(i.name));
 const veg=inv.find(i=>/菜|花|菠菜|椒|豆|菇/.test(i.name));
 if(!protein)return [];
 const pAmt=protein.unit==='个'?2:300;
 const cAmt=carb?(carb.unit==='个'?1:200):0;
 const vAmt=veg?(veg.unit==='个'?1:250):0;
 const parts=[{i:protein,a:pAmt},...(carb?[{i:carb,a:cAmt}]:[]),...(veg?[{i:veg,a:vAmt}]:[])];
 const macros=parts.reduce((a,x)=>{const n=nutrition(x.i,x.a);Object.keys(a).forEach(k=>a[k]+=n[k]);return a},{kcal:0,protein:0,carbs:0,fat:0});
 const base=`${protein.name}${carb?' + '+carb.name:''}${veg?' + '+veg.name:''}`;
 return [
  {name:'高蛋白组合',desc:`优先使用库存中较快到期的食物：${base}。`,macros},
  {name:'少油快手版',desc:`以 ${protein.name} 为主，减少额外油脂；配现有主食与蔬菜。`,macros:{...macros,fat:Math.max(0,macros.fat-5),kcal:Math.max(0,macros.kcal-45)}},
  {name:'库存清理版',desc:`先消耗 ${inv.slice(0,3).map(x=>x.name).join('、')}，避免放太久。`,macros}
 ];
}
function renderRecipes(){$('#recipeList').innerHTML=recipeCandidates().map(r=>`<div class="recipe"><h4>${r.name}</h4><p>${r.desc}</p><div class="macro">${Math.round(r.macros.kcal)} kcal · P ${Math.round(r.macros.protein)}g · C ${Math.round(r.macros.carbs)}g · F ${Math.round(r.macros.fat)}g</div></div>`).join('')||'<div class="empty">添加库存后，这里会自动给出食谱建议。</div>'}
function renderMeals(){
 if(!state.meals.length){$('#mealLog').innerHTML='<div class="empty">今天还没有记录。</div>';return}
 $('#mealLog').innerHTML=[...state.meals].reverse().slice(0,8).map(m=>`<div class="log-row"><div><strong>${m.mealType}</strong><br><small>${m.items.map(x=>x.name+' '+x.amount+(x.unit==='g'?'g':x.unit)).join('、')}</small></div><div><strong>${Math.round(m.macros.kcal)} kcal</strong><br><small>P ${Math.round(m.macros.protein)} · C ${Math.round(m.macros.carbs)} · F ${Math.round(m.macros.fat)}</small></div></div>`).join('')
}
function render(){renderMetrics();renderInventory();renderRecipes();renderMeals();populateMealSelectors()}
function populateMealSelectors(){ $$('.food-select').forEach(s=>{const cur=s.value;s.innerHTML=state.inventory.map(i=>`<option value="${i.id}">${i.name}</option>`).join('');if(cur)s.value=cur})}
function addMealRow(){const node=$('#mealItemTemplate').content.cloneNode(true);$('#mealItems').appendChild(node);populateMealSelectors();$$('.remove-row').forEach(b=>b.onclick=()=>b.parentElement.remove())}
$$('[data-open]').forEach(b=>b.onclick=()=>$('#'+b.dataset.open).showModal());
$('#inventoryForm').addEventListener('submit',e=>{
 const f=new FormData(e.currentTarget);const q=Number(f.get('quantity'));
 state.inventory.push({id:crypto.randomUUID(),name:f.get('name').trim(),quantity:q,unit:f.get('unit'),days:Number(f.get('days')),kcal:Number(f.get('kcal')),protein:Number(f.get('protein')),carbs:Number(f.get('carbs')),fat:Number(f.get('fat'))});
 save();e.currentTarget.reset();toast('已加入库存')
});
$('#mealForm').addEventListener('submit',e=>{
 const rows=$$('.meal-item-row');const items=[];let macros={kcal:0,protein:0,carbs:0,fat:0};
 rows.forEach(r=>{const item=state.inventory.find(i=>i.id===r.querySelector('.food-select').value);const amount=Number(r.querySelector('.food-amount').value);if(!item||!amount)return;const n=nutrition(item,amount);Object.keys(macros).forEach(k=>macros[k]+=n[k]);items.push({id:item.id,name:item.name,amount,unit:'g'});if(item.unit==='g')item.quantity=Math.max(0,item.quantity-amount);else if(item.unit==='kg')item.quantity=Math.max(0,item.quantity-amount/1000);else item.quantity=Math.max(0,item.quantity-Math.max(1,Math.round(amount/100)))});
 if(!items.length){toast('请至少添加一种食物');return}
 state.meals.push({id:crypto.randomUUID(),time:new Date().toISOString(),mealType:new FormData(e.currentTarget).get('mealType'),items,macros});
 $('#mealItems').innerHTML='';addMealRow();save();toast('已记录，并同步扣减库存')
});
$('#addMealItemBtn').onclick=addMealRow;
$('#refreshRecipesBtn').onclick=()=>{renderRecipes();toast('已按当前库存刷新')};
$('#imageImportBtn').onclick=()=>toast('图片识别将在下一步接入');
$('#emailImportBtn').onclick=()=>toast('邮箱订单导入将在下一步接入');
$('#resetDemoBtn').onclick=()=>{if(confirm('恢复示例数据？当前本地记录会被清除。')){state=structuredClone(demo);save()}};
addMealRow();render();