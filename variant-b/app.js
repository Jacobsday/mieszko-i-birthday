(()=>{
  'use strict';
  const $=selector=>document.querySelector(selector);
  const data=typeof products!=='undefined'&&Array.isArray(products)?products:[];
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const sizes=product=>product.category==='Sneakers'?['42','43','44','45']:['S','M','L','XL'];
  const photoPath=photo=>{if(!photo)return '';if(/^(https?:|data:|\/)/i.test(photo))return photo;return photo.startsWith('assets/')?`../${photo}`:photo};
  const placeholder=(product)=>{const color=/^#[\da-f]{6}$/i.test(product.color||'')?product.color:'#c8c7bc';const rgb=[1,3,5].map(offset=>parseInt(color.slice(offset,offset+2),16));const ink=(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)<130?'#efeee8':'#171715';return `<div class="photo-placeholder" style="--placeholder:${color};--placeholder-ink:${ink}"><strong>MIESZKO I</strong><small>SESSION FRAME PENDING</small><b>✳</b></div>`};
  const media=(product,index)=>`<div class="card-media"><span class="card-number">${String(index+1).padStart(2,'0')} / M1</span>${product.photo?`<img data-image-id="${escape(product.id)}" src="${escape(photoPath(product.photo))}" alt="Mieszko w stylizacji ${escape(product.brand)} ${escape(product.name)}" loading="lazy">`:placeholder(product)}</div>`;
  function bindMedia(root){root.querySelectorAll('img[data-image-id]').forEach(image=>image.addEventListener('error',()=>{const product=data.find(item=>item.id===image.dataset.imageId);if(product){image.insertAdjacentHTML('afterend',placeholder(product));image.remove()}}))}
  let category='all',query='',sort='featured',selectedSize='';
  const storageKey='mieszko-i-variant-b-cart';
  let cart=[];
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');cart=Array.isArray(saved)?saved.filter(item=>{const product=data.find(p=>p.id===item.id);return product&&sizes(product).includes(item.size)}).map(item=>({id:item.id,size:item.size,qty:Math.min(9,Math.max(1,Number(item.qty)||1))})):[]}catch{}
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(cart))}catch{}$('#cartCount').textContent=`(${cart.reduce((sum,item)=>sum+item.qty,0)})`};
  const categories=['all',...new Set(data.map(product=>product.category).filter(Boolean))];
  $('#categories').innerHTML=categories.map(item=>`<button type="button" data-category="${escape(item)}" class="${item==='all'?'active':''}" aria-pressed="${item==='all'}">${item==='all'?'Wszystko':escape(item)}</button>`).join('');
  function render(){
    let list=data.filter(product=>(category==='all'||product.category===category)&&`${product.brand} ${product.name} ${product.edition} ${product.year} ${product.category}`.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')));
    if(sort==='newest')list.sort((a,b)=>Number(b.year)-Number(a.year));
    if(sort==='oldest')list.sort((a,b)=>Number(a.year)-Number(b.year));
    if(sort==='az')list.sort((a,b)=>String(a.name).localeCompare(String(b.name),'pl'));
    $('#resultCount').textContent=`${String(list.length).padStart(2,'0')} / ${String(data.length).padStart(2,'0')} PRODUKTÓW`;
    $('#productGrid').innerHTML=list.length?list.map((product,index)=>`<button type="button" class="product-card" data-product="${escape(product.id)}" aria-label="Zobacz ${escape(product.brand)} ${escape(product.name)}">${media(product,index)}<div class="card-meta"><span>${escape(product.brand)}</span><span>${escape(product.year)}</span></div><h3>${escape(product.name)}</h3><p>${escape(product.edition)}</p><div class="card-link"><span>OBEJRZYJ PRODUKT</span><span>↗</span></div></button>`).join(''):`<div class="no-results">Nic tu nie ma.<br><button type="button" id="clearFilters">Pokaż całą kolekcję ↗</button></div>`;
    bindMedia($('#productGrid'));
    $('#productGrid').querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>showProduct(button.dataset.product)));
    $('#clearFilters')?.addEventListener('click',()=>{category='all';query='';$('#search').value='';syncCategories();render()});
  }
  function syncCategories(){document.querySelectorAll('#categories [data-category]').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))})}
  function showProduct(id){
    const product=data.find(item=>item.id===id);if(!product)return;selectedSize='';
    const index=data.indexOf(product);
    $('#productDialogBody').innerHTML=`<div class="detail-layout"><div class="detail-media">${media(product,index)}</div><div class="detail-copy"><span class="brand">${escape(product.brand)} / ${escape(product.year)}</span><h2>${escape(product.name)}</h2><p class="edition">${escape(product.edition)}</p><span class="demo-tag">EDYCJA POKAZOWA / BEZ SPRZEDAŻY</span><div class="size-title"><span>WYBIERZ ROZMIAR</span><button type="button" data-info="sizes">ROZMIARÓWKA ↗</button></div><div class="size-options" role="group" aria-label="Rozmiar">${sizes(product).map(size=>`<button type="button" data-size="${size}" aria-pressed="false">${size}</button>`).join('')}</div><p id="sizeError" class="size-error" role="status" hidden>Wybierz rozmiar.</p><button type="button" id="addToCart" class="primary">DODAJ DO KOSZYKA POKAZOWEGO ↗</button><p class="fineprint">Koszyk jest częścią artystycznej symulacji. Nie składasz zamówienia.</p><details open><summary>O PRODUKCIE</summary><p>${escape(product.why||'Wybrany element urodzinowej kolekcji Mieszka.')}</p></details><details><summary>INFORMACJE O WYDANIU</summary><p>${escape(product.brand)} · ${escape(product.edition)} · ${escape(product.year)}. Rozmiary mają charakter pokazowy i nie oznaczają stanu magazynowego.</p></details></div></div>`;
    bindMedia($('#productDialogBody'));
    $('#productDialogBody').querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{selectedSize=button.dataset.size;document.querySelectorAll('#productDialogBody [data-size]').forEach(other=>{const active=other===button;other.classList.toggle('selected',active);other.setAttribute('aria-pressed',String(active))});$('#sizeError').hidden=true}));
    $('#productDialogBody [data-info]').addEventListener('click',()=>showInfo('sizes'));
    $('#addToCart').addEventListener('click',()=>{if(!selectedSize){$('#sizeError').hidden=false;return}const item=cart.find(entry=>entry.id===id&&entry.size===selectedSize);if(item)item.qty=Math.min(9,item.qty+1);else cart.push({id,size:selectedSize,qty:1});save();$('#productDialog').close();showCart();toast('Dodano do koszyka pokazowego')});
    $('#productDialog').showModal();
  }
  function showCart(){
    const count=cart.reduce((sum,item)=>sum+item.qty,0);
    $('#cartDialogBody').innerHTML=`<div class="cart-inner"><p class="eyebrow">M1 / YOUR SELECTION</p><h2>KOSZYK<br>POKAZOWY</h2>${cart.length?`${cart.map((item,index)=>{const product=data.find(p=>p.id===item.id);return `<div class="cart-row">${media(product,data.indexOf(product))}<div><small>${escape(product.brand)}</small><strong>${escape(product.name)}</strong><small>${escape(product.edition)} / ROZMIAR ${escape(item.size)}</small><div class="qty"><button type="button" data-change="${index}" data-delta="-1" aria-label="Zmniejsz ilość">−</button><span>${item.qty}</span><button type="button" data-change="${index}" data-delta="1" aria-label="Zwiększ ilość" ${item.qty===9?'disabled':''}>+</button><button type="button" class="remove" data-remove="${index}">USUŃ</button></div></div></div>`}).join('')}<div class="cart-summary">${count} ELEMENTÓW W WIRTUALNYM KOSZYKU.<br>TO PREZENT URODZINOWY. BEZ CEN, PŁATNOŚCI, ZAMÓWIEŃ I DOSTAW.</div><button type="button" id="finish" class="primary">PRZEJDŹ DO FINAŁU ↗</button>`:`<div class="cart-empty">Twój koszyk czeka na pierwszy wybór.</div><button type="button" id="continue" class="primary">ODKRYJ KOLEKCJĘ ↗</button>`}</div>`;
    bindMedia($('#cartDialogBody'));
    $('#cartDialogBody').querySelectorAll('[data-change]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.change);cart[index].qty=Math.min(9,Math.max(0,cart[index].qty+Number(button.dataset.delta)));if(!cart[index].qty)cart.splice(index,1);save();showCart()}));
    $('#cartDialogBody').querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{cart.splice(Number(button.dataset.remove),1);save();showCart()}));
    $('#finish')?.addEventListener('click',celebrate);
    $('#continue')?.addEventListener('click',()=>{$('#cartDialog').close();$('#catalog').scrollIntoView({behavior:'smooth'})});
    if(!$('#cartDialog').open)$('#cartDialog').showModal();
  }
  function celebrate(){const count=cart.reduce((sum,item)=>sum+item.qty,0);$('#cartDialogBody').innerHTML=`<div class="cart-inner birthday"><div class="burst">✳</div><p class="eyebrow">M1 / ONE OF ONE</p><h2>WSZYSTKIEGO<br>NAJLEPSZEGO,<br>MIESZKO.</h2><p>Kolejny sezon należy do Ciebie.</p><small>${count} WYBRANYCH ELEMENTÓW. TO ARTYSTYCZNA SYMULACJA — BEZ ZAMÓWIENIA I PŁATNOŚCI.</small><button type="button" id="backToStore" class="primary">WRÓĆ DO KOLEKCJI ↗</button></div>`;$('#backToStore').addEventListener('click',()=>{$('#cartDialog').close();$('#catalog').scrollIntoView({behavior:'smooth'})})}
  const info={about:['O PROJEKCIE','MIESZKO I to urodzinowy projekt artystyczny: fikcyjny sklep prezentujący wybrane wydania streetwearu. Nie jest oficjalnym sklepem ani współpracą z wymienionymi markami.'],sizes:['ROZMIARY','Ubrania: S, M, L, XL. Sneakers: EU 42, 43, 44, 45. Wybór ma charakter pokazowy. Nie podajemy wymiarów ani dostępności konkretnych egzemplarzy.'],demo:['ZAKUPY I DOSTAWA','To artystyczna symulacja sklepu. Koszyk nie tworzy zamówienia. Nie ma cen, płatności, rezerwacji ani dostawy. Finał koszyka otwiera życzenia urodzinowe.']};
  function showInfo(key){const [title,copy]=info[key]||info.about;$('#infoDialogBody').innerHTML=`<div class="info-inner"><p class="eyebrow">M1 / INFORMATION</p><h2>${title}</h2><p>${copy}</p><small>EDYCJA POKAZOWA / 2026</small></div>`;$('#infoDialog').showModal()}
  let toastTimer;function toast(message){const element=$('#toast');element.textContent=message;element.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('show'),2200)}
  $('#categories').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;category=button.dataset.category;syncCategories();render()});
  $('#search').addEventListener('input',event=>{query=event.target.value.trim();render()});
  $('#sort').addEventListener('change',event=>{sort=event.target.value;render()});
  $('#searchToggle').addEventListener('click',()=>{$('#catalog').scrollIntoView({behavior:'smooth'});$('#search').focus()});
  $('#cartToggle').addEventListener('click',showCart);
  $('#aboutButton').addEventListener('click',()=>showInfo('about'));
  document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>showInfo(button.dataset.info)));
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})});
  save();render();
})();
