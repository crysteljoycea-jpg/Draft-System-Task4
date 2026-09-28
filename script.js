var KEY="draft-system-v1", drafts=[], cur=null, timer=null;
function load(){try{drafts=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){drafts=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(drafts))}catch(e){}}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function get(id){return drafts.find(function(d){return d.id===id})}
function renderList(){
  var q=document.getElementById("q").value.toLowerCase();
  var items=drafts.filter(function(d){return (d.title+d.body).toLowerCase().indexOf(q)>-1})
    .sort(function(a,b){return b.updated-a.updated});
  document.getElementById("list").innerHTML=items.length?items.map(function(d){
    return '<div class="item'+(d.id===cur?' on':'')+'" data-id="'+d.id+'"><b>'+esc(d.title||"Untitled")+'<span class="tag">'+d.status+'</span></b><span class="m">'+new Date(d.updated).toLocaleString()+'</span></div>'
  }).join(""):'<div class="m">No drafts found.</div>';
}
function renderEditor(){
  var d=get(cur), el=document.getElementById("editor");
  if(!d){el.innerHTML='<div class="empty">Select a draft or create a new one.</div>';return}
  el.innerHTML='<div class="row"><input id="t" placeholder="Title" value="'+esc(d.title)+'" style="flex:1">'+
    '<select id="s" style="width:auto"><option>Draft</option><option>In review</option><option>Final</option></select></div>'+
    '<textarea id="b" placeholder="Start writing...">'+esc(d.body)+'</textarea>'+
    '<div class="row" style="margin:10px 0 0;justify-content:space-between;align-items:center"><span class="m" id="info"></span>'+
    '<span><button id="dup">Duplicate</button> <button id="dl">Download .txt</button> <button class="d" id="del">Delete</button></span></div>';
  document.getElementById("s").value=d.status;
  info(d);
}
function info(d){var w=d.body.trim()?d.body.trim().split(/\s+/).length:0;
  var i=document.getElementById("info");if(i)i.textContent=w+" words - saved "+new Date(d.updated).toLocaleTimeString()}
function touch(){
  var d=get(cur);if(!d)return;
  d.title=document.getElementById("t").value;
  d.body=document.getElementById("b").value;
  d.status=document.getElementById("s").value;
  clearTimeout(timer);
  timer=setTimeout(function(){d.updated=Date.now();save();renderList();info(d)},400);
}
function mk(o){var d={id:"d"+Date.now()+Math.floor(Math.random()*999),title:"",body:"",status:"Draft",updated:Date.now()};
  for(var k in o)d[k]=o[k];drafts.push(d);save();cur=d.id;renderList();renderEditor()}
document.getElementById("new").onclick=function(){mk({})};
document.getElementById("q").oninput=renderList;
document.getElementById("list").onclick=function(e){var n=e.target.closest(".item");if(n){cur=n.dataset.id;renderList();renderEditor()}};
document.getElementById("editor").addEventListener("input",touch);
document.getElementById("editor").addEventListener("click",function(e){
  var d=get(cur),id=e.target.id;if(!d)return;
  if(id==="dup")mk({title:d.title+" (copy)",body:d.body});
  if(id==="dl"){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([d.body],{type:"text/plain"}));a.download=(d.title||"draft")+".txt";a.click()}
  if(id==="del"&&confirm("Delete this draft?")){drafts=drafts.filter(function(x){return x.id!==cur});save();cur=null;renderList();renderEditor()}
});
load();if(drafts.length)cur=drafts[0].id;renderList();renderEditor();
