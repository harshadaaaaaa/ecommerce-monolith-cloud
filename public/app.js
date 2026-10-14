const money = n => "₹" + Number(n).toLocaleString("en-IN");
const state = {products:[], cart:[], category:"All", search:"", sort:"featured", liked:new Set()};
const grid = document.getElementById("product-grid");
const toast = document.getElementById("toast");
let toastTimer;
async function api(path, options={}) {
  const res = await fetch("/api" + path, {headers:{"Content-Type":"application/json"}, ...options});
  const data = await res.json().catch(()=>({error:"Something went wrong"}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2300)}
function visibleProducts(){
  let items=state.products.filter(p=>(state.category==="All"||p.category===state.category)&&(`${p.name} ${p.category} ${p.description}`).toLowerCase().includes(state.search.toLowerCase()));
  if(state.sort==="low")items.sort((a,b)=>a.price-b.price);
  if(state.sort==="high")items.sort((a,b)=>b.price-a.price);
  return items;
}
function renderProducts(){
  const items=visibleProducts();document.getElementById("result-count").textContent=String(items.length).padStart(2,"0");
  if(!items.length){grid.innerHTML='<div class="no-results">No finds just yet. Try another search ✳</div>';return}
  grid.innerHTML=items.map((p,i)=>`<article class="product-card" style="animation-delay:${i*45}ms">
    <div class="product-visual"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#e9eddf,#f4d8c9)'"><span class="product-tag">${p.tag||"GOOD FIND"}</span><button class="wish-btn ${state.liked.has(p.id)?"liked":""}" data-like="${p.id}" aria-label="Save ${p.name}">${state.liked.has(p.id)?"♥":"♡"}</button></div>
    <div class="product-info"><div class="product-type">${p.category} · SHOPNEST EDIT</div><div class="product-name-row"><span class="product-name">${p.name}</span><span class="product-price">${money(p.price)}</span></div><p class="product-description">${p.description}</p><button class="add-btn" data-add="${p.id}">Add to bag <span>↗</span></button></div>
  </article>`).join("");
}
async function loadCart(){
  try{state.cart=await api("/cart");renderCart()}catch(e){notify("Couldn't load your bag. Refresh and try again.")}
}
function renderCart(){
  const count=state.cart.reduce((sum,item)=>sum+item.quantity,0);
  document.getElementById("cart-count").textContent=count;document.getElementById("drawer-count").textContent=`(${count})`;
  const subtotal=state.cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  document.getElementById("subtotal").textContent=money(subtotal);document.getElementById("modal-total").textContent=money(subtotal);
  const target=document.getElementById("cart-items");
  if(!state.cart.length){target.innerHTML='<div class="empty-cart"><span>♡</span><h3>Your bag is taking a nap.</h3><p>Add something lovely to wake it up.</p><button class="primary-btn" id="continue-shopping">Explore the collection ↗</button></div>';return}
  target.innerHTML=state.cart.map(item=>`<div class="cart-line"><img src="${item.image}" alt="${item.name}"><div><h4>${item.name}</h4><span class="line-price">${money(item.price)}</span><div class="qty-controls"><button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-btn" data-remove="${item.id}">Remove</button></div>`).join("");
}
async function addToCart(id){try{await api("/cart",{method:"POST",body:JSON.stringify({productId:id})});await loadCart();notify("A good find added to your bag ♡")}catch(e){notify(e.message)}}
async function changeQty(id,delta){try{await api("/cart/"+id,{method:"PATCH",body:JSON.stringify({delta})});await loadCart()}catch(e){notify(e.message)}}
async function removeItem(id){try{await api("/cart/"+id,{method:"DELETE"});await loadCart();notify("Removed from your bag")}catch(e){notify(e.message)}}
function setCategory(category){state.category=category;document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category===category));renderProducts()}
function openCart(){document.getElementById("overlay").classList.add("visible");document.getElementById("cart-drawer").classList.add("open");document.body.style.overflow="hidden"}
function closeCart(){document.getElementById("overlay").classList.remove("visible");document.getElementById("cart-drawer").classList.remove("open");document.body.style.overflow=""}
document.addEventListener("click",async e=>{
 const add=e.target.closest("[data-add]");if(add){await addToCart(add.dataset.add);return}
 const qty=e.target.closest("[data-qty]");if(qty){await changeQty(qty.dataset.qty,Number(qty.dataset.delta));return}
 const remove=e.target.closest("[data-remove]");if(remove){await removeItem(remove.dataset.remove);return}
 const like=e.target.closest("[data-like]");if(like){const id=like.dataset.like;state.liked.has(id)?state.liked.delete(id):state.liked.add(id);renderProducts();return}
 const cat=e.target.closest("[data-category]");if(cat){setCategory(cat.dataset.category);return}
 const nav=e.target.closest("[data-filter-link]");if(nav){setCategory(nav.dataset.filterLink);return}
 if(e.target.closest("#continue-shopping")){closeCart();document.getElementById("shop").scrollIntoView({behavior:"smooth"});return}
});
document.getElementById("cart-open").addEventListener("click",openCart);
document.getElementById("cart-close").addEventListener("click",closeCart);
document.getElementById("overlay").addEventListener("click",closeCart);
document.getElementById("search-toggle").addEventListener("click",()=>{const row=document.getElementById("search-row");row.classList.toggle("open");if(row.classList.contains("open"))document.getElementById("search-input").focus()});
document.getElementById("search-close").addEventListener("click",()=>{document.getElementById("search-input").value="";state.search="";document.getElementById("search-row").classList.remove("open");renderProducts()});
document.getElementById("search-input").addEventListener("input",e=>{state.search=e.target.value;renderProducts()});
document.getElementById("sort-select").addEventListener("change",e=>{state.sort=e.target.value;renderProducts()});
document.getElementById("checkout-btn").addEventListener("click",()=>{if(!state.cart.length){notify("Your bag is empty for now ♡");return}document.getElementById("checkout-modal").classList.add("open")});
document.getElementById("modal-close").addEventListener("click",()=>document.getElementById("checkout-modal").classList.remove("open"));
document.getElementById("checkout-modal").addEventListener("click",e=>{if(e.target.id==="checkout-modal")e.currentTarget.classList.remove("open")});
document.getElementById("checkout-form").addEventListener("submit",async e=>{
 e.preventDefault();const form=new FormData(e.currentTarget);const details=Object.fromEntries(form.entries());
 try{const result=await api("/orders",{method:"POST",body:JSON.stringify({...details,items:state.cart})});state.cart=[];await loadCart();document.getElementById("checkout-modal").classList.remove("open");closeCart();e.currentTarget.reset();notify(`Order ${result.orderId} placed! Thanks for shopping ✳`)}catch(err){notify(err.message)}
});
document.getElementById("newsletter-form").addEventListener("submit",e=>{e.preventDefault();e.currentTarget.reset();notify("You're on the list. Good things ahead ✳")});
(async()=>{try{state.products=await api("/products");renderProducts();await loadCart()}catch(e){grid.innerHTML='<div class="no-results">The shop is taking a tiny break. Please refresh in a moment.</div>';notify("Couldn't connect to the shop API")}})();
