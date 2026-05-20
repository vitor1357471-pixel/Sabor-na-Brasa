// =========================================
// DATA & CONFIGURAÇÕES
// =========================================
let orders = JSON.parse(localStorage.getItem('snb_orders') || '[]');
let filtroPedidoAtual = 'Todos';
let products = JSON.parse(localStorage.getItem('snb_products') || 'null') || [
  { id:1, name:'Classic Smash', cat:'Hambúrgueres', desc:'Smash burger, queijo cheddar derretido, alface, tomate, picles e molho especial da casa.', price: 28.90, emoji:'🍔', badge:'🔥 Mais Pedido', available:true },
  { id:2, name:'Bacon Monster', cat:'Hambúrgueres', desc:'Três carnes, bacon crocante, queijo americano, cebola caramelizada e BBQ artesanal.', price:35.90, emoji:'🥩', badge:'⭐ Especial', available:true },
  { id:3, name:'Veggie Delight', cat:'Hambúrgueres', desc:'Hambúrguer de grão-de-bico, queijo coalho grelhado, alface americana, tomate e tahine.', price:26.90, emoji:'🥗', badge:'Novo', available:true },
  { id:4, name:'Combo Classic', cat:'Combos', desc:'Classic Smash + Batata Frita M + Refrigerante 350ml.', price:42.90, emoji:'🍟', badge:'🏷️ Promoção', available:true },
  
  // EXEMPLOS INICIAIS ADAPTADOS COM MÚLTIPLOS TAMANHOS CORRETOS
  { id:5, name:'Batata Frita Saborosa', cat:'Fritas', desc:'Batata frita crocante com tempero especial da casa.', prices: { pequena: 12.00, media: 16.00, grande: 22.00 }, emoji:'🍟', available:true },
  { id:6, name:'Refrigerante Guaraná', cat:'Bebidas', desc:'Lata, 600ml, 1L ou 2L.', prices: { pequena: 5.00, media: 8.00, litro: 10.00, grande: 13.00 }, emoji:'🥤', available:true },
  { id:7, name:'Macarrão na Chapa', cat:'Massas', desc:'Massa tradicional com tiras de carne, frango e vegetais.', prices: { media: 25.00, grande: 32.00 }, emoji:'🍝', badge:'Sucesso', available:true }
];

let settings = JSON.parse(localStorage.getItem('snb_settings') || 'null') || {
  name: 'Sabor na Brasa',
  phone: '(37) 99917-5310',
  address: 'Rua Abaete, 66 - Nossa Senhora da Conceição',
  hours: 'Ter-Dom 18:00 às 23:45',
  delivery: 0.00,
  minOrder: 20.00
};

let banners = JSON.parse(localStorage.getItem('snb_banners')) || [
  { id: 1, img: 'images/burger1.jpg', badge: 'Mais Pedido', name: 'Brasa Clássico' },
  { id: 2, img: 'images/burger2.jpg', badge: 'Novo', name: 'Smoke Monster' },
  { id: 3, img: 'images/burger3.jpg', badge: 'Cheddar Love' }
];

// LISTA DE ADICIONAIS DISPONÍVEIS (Apenas para Hambúrgueres/Combos)
const LISTA_ADICIONAIS = [
    { id: 'bacon', name: 'Bacon Extra', price: 3.00 },
    { id: 'queijo', name: 'Queijo Cheddar', price: 4.00 },
    { id: 'catupiry', name:'catupiry', price: 4.00},
    { id: 'ovo', name: 'Ovo', price: 2.00 },
    { id: 'hamburguer', name: 'bife', price: 4.00 },
    { id: 'lombo', name: 'lombo', price: 3.00 },
    { id: 'presunto', name: 'presunto', price: 2.00 },
    { id: 'muçarela', name: 'muçarela', price: 2.00},
    { id: 'cebola roxa', name: 'cebola roxa', price: 1.00},
    { id: 'maionese', name: 'Maionese da Casa', price: 2.00 }
];

let cart = [];
let nextId = products.reduce((m,p) => Math.max(m,p.id),0) + 1;
let currentCat = 'Todos';
let itemEmEdicao = null; 
let tamanhoSelecionado = 'media'; 

// =========================================
// NAVEGAÇÃO
// =========================================
function showPage(page) {
  ['home','admin'].forEach(p => {
    const el = document.getElementById('page-'+p);
    if(el) el.style.display = p === page ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  if(page==='home') document.getElementById('nav-home')?.classList.add('active');
  window.scrollTo(0,0);
}

// =========================================
// ACESSO OCULTO ADMIN
// =========================================
let logoClicks = 0, logoTimer = null;
function handleLogoClick() {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoClicks = 0; }, 1200);
  if(logoClicks >= 5) {
    logoClicks = 0;
    openAdminLogin();
  }
}

let triggerClicks = 0, triggerTimer = null;
function handleAdminTrigger() {
  triggerClicks++;
  const el = document.getElementById('adminTrigger');
  if (el) el.style.color = triggerClicks >= 2 ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.15)';
  clearTimeout(triggerTimer);
  triggerTimer = setTimeout(() => { triggerClicks = 0; if(el) el.style.color = 'rgba(255,255,255,0.07)'; }, 1800);
  if(triggerClicks >= 3) {
    triggerClicks = 0;
    if(el) el.style.color = 'rgba(255,255,255,0.07)';
    openAdminLogin();
  }
}

// =========================================
// CONTROLAR EXIBIÇÃO DOS CAMPOS DE PREÇO NO ADMIN
// =========================================
function controlarCamposPreco() {
  const cat = document.getElementById('fCat').value;
  
  const blocoUnico = document.getElementById('wrapper-preco-unico');
  const blocoBebidas = document.getElementById('wrapper-precos-bebidas');
  const blocoFritas = document.getElementById('wrapper-precos-fritas');
  const blocoMassas = document.getElementById('wrapper-precos-massas');

  if(!blocoUnico || !blocoBebidas || !blocoFritas || !blocoMassas) return;

  // Esconde todos os blocos primeiro
  blocoUnico.style.display = 'none';
  blocoBebidas.style.display = 'none';
  blocoFritas.style.display = 'none';
  blocoMassas.style.display = 'none';

  // Define display flex para layouts lado a lado
  blocoBebidas.style.gap = '10px';
  blocoFritas.style.gap = '10px';
  blocoMassas.style.gap = '10px';

  // Exibe o bloco correspondente
  if (cat === 'Bebidas') {
    blocoBebidas.style.display = 'flex';
  } else if (cat === 'Fritas') {
    blocoFritas.style.display = 'flex';
  } else if (cat === 'Massas') {
    blocoMassas.style.display = 'flex';
  } else {
    blocoUnico.style.display = 'block';
  }
}

// Monitorador para troca de categoria
document.addEventListener('change', function(e) {
  if(e.target && e.target.id === 'fCat') {
    controlarCamposPreco();
  }
});

// =========================================
// CONTROLE DE UPLOADS DE IMAGENS
// =========================================
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'fFoto') {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) { document.getElementById('fFotoBase64').value = ev.target.result; };
      reader.readAsDataURL(file);
    }
  }
  
  for(let i=1; i<=3; i++) {
    if (e.target && e.target.id === `fBanner${i}`) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          banners[i-1].img = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }
});

// =========================================
// RENDERIZAÇÃO DO CARROSSEL DE CABEÇALHO
// =========================================
function renderBanners() {
  const wrapper = document.getElementById('carouselWrapper');
  if(!wrapper) return;
  wrapper.innerHTML = banners.map(b => `
    <div class="carousel-item">
      <img src="${b.img}" alt="${b.name}" class="carousel-img">
      <div class="carousel-overlay">
        ${b.badge ? `<div class="carousel-badge">${b.badge}</div>` : ''}
        <div class="carousel-name">${b.name}</div>
      </div>
    </div>
  `).join('');
}

function loadBannersIntoAdmin() {
  for(let i=1; i<=3; i++) {
    const b = banners[i-1];
    if(document.getElementById(`fBannerBadge${i}`)) document.getElementById(`fBannerBadge${i}`).value = b.badge || '';
    if(document.getElementById(`fBannerName${i}`)) document.getElementById(`fBannerName${i}`).value = b.name || '';
  }
}

function saveBanners() {
  for(let i=1; i<=3; i++) {
    banners[i-1].badge = document.getElementById(`fBannerBadge${i}`).value.trim();
    banners[i-1].name = document.getElementById(`fBannerName${i}`).value.trim();
  }
  localStorage.setItem('snb_banners', JSON.stringify(banners));
  renderBanners();
  showToast('✅ Destaques do cabeçalho atualizados!');
}

// =========================================
// RENDERIZAÇÃO DO CARDÁPIO
// =========================================
function getCategories() {
  const cats = [...new Set(products.filter(p=>p.available).map(p=>p.cat))];
  return ['Todos', ...cats];
}

function renderCats() {
  const tabs = document.getElementById('catTabs');
  if (!tabs) return;
  tabs.innerHTML = getCategories().map(c =>
    `<button class="cat-tab ${c===currentCat?'active':''}" onclick="filterCat('${c}')">${c}</button>`
  ).join('');
}

function filterCat(cat) {
  currentCat = cat;
  renderCats();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const filtered = products.filter(p => p.available && (currentCat==='Todos' || p.cat===currentCat));
  if(!filtered.length) {
    grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1">Nenhum item nesta categoria.</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(p => {
    const isImage = p.emoji.startsWith('data:image') || p.emoji.startsWith('http');
    const fotoRenderizada = isImage ? `<img src="${p.emoji}" alt="${p.name}">` : `<span>${p.emoji || '🍔'}</span>`;

    let precoExibido = '';
    if (p.prices) {
      if (p.cat === 'Massas') {
        precoExibido = `A partir de R$ ${p.prices.media.toFixed(2).replace('.',',')}`;
      } else {
        precoExibido = `A partir de R$ ${p.prices.pequena.toFixed(2).replace('.',',')}`;
      }
    } else {
      precoExibido = `R$ ${p.price.toFixed(2).replace('.',',')}`;
    }

    return `
      <div class="product-card">
        <div class="product-img">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          ${fotoRenderizada}
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-footer">
            <div class="product-price">${precoExibido}</div>
            <button class="add-btn" onclick="addToCart(${p.id})">+ Adicionar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =========================================
// LOGICA DE ADICIONAR AO CARRINHO, TAMANHOS & ADICIONAIS
// =========================================
function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    if (p.prices || p.cat === 'Hambúrgueres' || p.cat === 'Combos') {
        itemEmEdicao = { ...p };
        tamanhoSelecionado = p.prices ? (p.cat === 'Massas' ? 'media' : 'pequena') : null;
        abrirModalAdicionais();
    } else {
        const cartId = p.id + '_unico';
        const itemExistente = cart.find(x => x.cartId === cartId);
        if(itemExistente) {
            itemExistente.qty++;
        } else {
            cart.push({ ...p, cartId: cartId, qty: 1, extras: [], tamanho: null });
        }
        updateCartUI();
        showToast('Item adicionado!');
    }
}

function abrirModalAdicionais() {
    const modal = document.getElementById('modalAdicionais');
    const tContent = document.getElementById('tamanhosContent');
    const aContent = document.getElementById('adicionaisContent');
    if(!modal || !aContent || !tContent) return;
    
    modal.classList.add('open');
    
    if (itemEmEdicao.prices) {
        let optionsHTML = `<h3 style="font-family:'Bebas Neue'; font-size:1.6rem; margin-bottom:10px; color:var(--brand);">Escolha o Tamanho</h3>
                           <div class="size-selector-wrap" style="display:flex; flex-direction:column; gap:8px;">`;

        if (itemEmEdicao.cat === 'Bebidas') {
            optionsHTML += `
                <div class="size-option ${tamanhoSelecionado==='pequena'?'selected':''}" onclick="mudarTamanho('pequena')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Lata 350ml</span> <strong>R$ ${itemEmEdicao.prices.pequena.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='media'?'selected':''}" onclick="mudarTamanho('media')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>600ml</span> <strong>R$ ${itemEmEdicao.prices.media.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='litro'?'selected':''}" onclick="mudarTamanho('litro')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>1 Litro</span> <strong>R$ ${itemEmEdicao.prices.litro.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='grande'?'selected':''}" onclick="mudarTamanho('grande')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>2 Litros</span> <strong>R$ ${itemEmEdicao.prices.grande.toFixed(2).replace('.',',')}</strong>
                </div>`;
        } else if (itemEmEdicao.cat === 'Fritas') {
            optionsHTML += `
                <div class="size-option ${tamanhoSelecionado==='pequena'?'selected':''}" onclick="mudarTamanho('pequena')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Pequena (P)</span> <strong>R$ ${itemEmEdicao.prices.pequena.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='media'?'selected':''}" onclick="mudarTamanho('media')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Média (M)</span> <strong>R$ ${itemEmEdicao.prices.media.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='grande'?'selected':''}" onclick="mudarTamanho('grande')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Grande (G)</span> <strong>R$ ${itemEmEdicao.prices.grande.toFixed(2).replace('.',',')}</strong>
                </div>`;
        } else if (itemEmEdicao.cat === 'Massas') {
            optionsHTML += `
                <div class="size-option ${tamanhoSelecionado==='media'?'selected':''}" onclick="mudarTamanho('media')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Média (M)</span> <strong>R$ ${itemEmEdicao.prices.media.toFixed(2).replace('.',',')}</strong>
                </div>
                <div class="size-option ${tamanhoSelecionado==='grande'?'selected':''}" onclick="mudarTamanho('grande')" style="padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between;">
                  <span>Grande (G)</span> <strong>R$ ${itemEmEdicao.prices.grande.toFixed(2).replace('.',',')}</strong>
                </div>`;
        }

        optionsHTML += `</div>`;
        tContent.innerHTML = optionsHTML;
    } else {
        tContent.innerHTML = ''; 
    }
    
    if (itemEmEdicao.cat === 'Hambúrgueres' || itemEmEdicao.cat === 'Combos') {
        aContent.innerHTML = `
            <h3 style="margin-bottom:15px; font-family:'Bebas Neue'; font-size:1.8rem; color:var(--brand);">Turbine seu ${itemEmEdicao.name}</h3>
            <p style="font-size:0.9rem; color:var(--muted); margin-bottom:15px;">Escolha os seus adicionais:</p>
            ${LISTA_ADICIONAIS.map(extra => `
                <div class="extra-item">
                    <span style="font-weight:600;">${extra.name} (+R$ ${extra.price.toFixed(2).replace('.',',')})</span>
                    <input type="checkbox" class="extra-checkbox" value="${extra.id}" data-price="${extra.price}" data-name="${extra.name}">
                </div>
            `).join('')}
        `;
    } else {
        aContent.innerHTML = ''; 
    }
}

function mudarTamanho(tamanho) {
    tamanhoSelecionado = tamanho;
    abrirModalAdicionais();
}

function confirmarAdicionais() {
    const checkboxes = document.querySelectorAll('.extra-checkbox:checked');
    const selecionados = [];
    let precoExtra = 0;

    checkboxes.forEach(cb => {
        selecionados.push({
            name: cb.getAttribute('data-name'),
            price: parseFloat(cb.getAttribute('data-price'))
        });
        precoExtra += parseFloat(cb.getAttribute('data-price'));
    });

    let precoBase = itemEmEdicao.prices ? itemEmEdicao.prices[tamanhoSelecionado] : itemEmEdicao.price;
    const cartId = itemEmEdicao.id + '_' + (tamanhoSelecionado || 'unico') + '_' + selecionados.map(s => s.name).join('-');

    const itemExistente = cart.find(x => x.cartId === cartId);
    if(itemExistente) {
        itemExistente.qty++;
    } else {
        cart.push({
            ...itemEmEdicao,
            cartId: cartId,
            qty: 1,
            price: precoBase + precoExtra,
            tamanho: tamanhoSelecionado,
            extras: selecionados
        });
    }

    closeModalAdicionais();
    updateCartUI();
    showToast('Item adicionado ao carrinho!');
}

function closeModalAdicionais() {
    document.getElementById('modalAdicionais')?.classList.remove('open');
    itemEmEdicao = null;
}

function removeFromCart(cartId) {
  const idx = cart.findIndex(x => x.cartId === cartId);
  if(idx === -1) return;
  if(cart[idx].qty > 1) cart[idx].qty--;
  else cart.splice(idx,1);
  updateCartUI();
}

function addToCartFromUI(cartId) {
  const item = cart.find(x => x.cartId === cartId);
  if(item) {
    item.qty++;
    updateCartUI();
  }
}

function clearCart() { cart = []; updateCartUI(); }
function cartTotal() { return cart.reduce((s,i) => s + i.price * i.qty, 0); }

function updateCartUI() {
  const count = cart.reduce((s,i)=>s+i.qty,0);
  if(document.getElementById('cartCount')) document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if(!itemsEl) return;

  if(!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Seu carrinho está vazio.</p></div>`;
    if(footerEl) footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(item => {
    const isImage = item.emoji.startsWith('data:image') || item.emoji.startsWith('http');
    const iconRender = isImage ? `<img src="${item.emoji}">` : item.emoji;

    let formatLabel = '';
    if(item.tamanho) {
       if(item.cat === 'Bebidas') {
         formatLabel = item.tamanho === 'pequena' ? ' (LATA)' : item.tamanho === 'media' ? ' (600ML)' : item.tamanho === 'litro' ? ' (1L)' : ' (2L)';
       } else {
         formatLabel = ` (${item.tamanho.toUpperCase()})`;
       }
    }

    const extrasRender = item.extras && item.extras.length > 0 
      ? `<div style="font-size:0.75rem; color:var(--brand); margin-top:2px;">+ ${item.extras.map(e => e.name).join(', ')}</div>` 
      : '';

    return `
      <div class="cart-item">
        <div class="cart-item-icon">${iconRender}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}${formatLabel}</div>
          ${extrasRender}
          <div class="cart-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.',',')}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="removeFromCart('${item.cartId}')">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="addToCartFromUI('${item.cartId}')">+</button>
        </div>
      </div>
    `;
  }).join('');

  const sub = cartTotal();
  const delivery = settings.delivery || 0;
  const total = sub + delivery;
  
  if(document.getElementById('cartSubtotal')) document.getElementById('cartSubtotal').textContent = `R$ ${sub.toFixed(2).replace('.',',')}`;
  if(document.getElementById('cartDelivery')) document.getElementById('cartDelivery').textContent = `R$ ${delivery.toFixed(2).replace('.',',')}`;
  if(document.getElementById('cartTotal')) document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2).replace('.',',')}`;
  if(footerEl) footerEl.style.display = 'block';
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if(sidebar && overlay) {
    const open = sidebar.classList.toggle('open');
    overlay.classList.toggle('open', open);
  }
}

// =========================================
// FINALIZAR PEDIDO (WHATSAPP + IMPRESSÃO TÉRMICA)
// =========================================
function openCheckout() {
  if(!cart.length) return;
  toggleCart();
  const modal = document.getElementById('checkoutModal');
  if(modal) modal.classList.add('open');
  if(document.getElementById('checkoutForm')) document.getElementById('checkoutForm').style.display = 'block';
  if(document.getElementById('orderSuccess')) document.getElementById('orderSuccess').style.display = 'none';

  const summary = cart.map(i => {
     let formatLabel = '';
     if(i.tamanho) {
        formatLabel = i.cat === 'Bebidas' ? (i.tamanho === 'pequena' ? ' (LATA)' : i.tamanho === 'media' ? ' (600ML)' : i.tamanho === 'litro' ? ' (1L)' : ' (2L)') : ` (${i.tamanho.toUpperCase()})`;
     }
     return `${i.qty}x ${i.name}${formatLabel}`;
  }).join(', ');
  
  const total = (cartTotal() + (settings.delivery||0)).toFixed(2).replace('.',',');
  if(document.getElementById('checkoutSummary')) document.getElementById('checkoutSummary').textContent = summary;
  if(document.getElementById('checkoutTotal')) document.getElementById('checkoutTotal').textContent = `Total: R$ ${total}`;
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if(modal) modal.classList.remove('open');
}

function placeOrder() {
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const deliveryType = document.getElementById('cDelivery').value;
  const address = document.getElementById('cAddress') ? document.getElementById('cAddress').value.trim() : '';
  const payment = document.getElementById('cPayment').value;
  const obs = document.getElementById('cObs') ? document.getElementById('cObs').value.trim() : '';

  if(!name || !phone) { showToast('⚠️ Preencha nome e telefone!'); return; }
  if(deliveryType === 'entrega' && !address) { showToast('⚠️ Preencha o endereço!'); return; }

  const subtotal = cartTotal();
  const deliveryFee = deliveryType === 'entrega' ? (settings.delivery || 0) : 0;
  const total = subtotal + deliveryFee;

  let textItems = "";
  cart.forEach(item => { 
    let formatLabel = '';
    if(item.tamanho) {
       formatLabel = item.cat === 'Bebidas' ? (item.tamanho === 'pequena' ? ' (Lata)' : item.tamanho === 'media' ? ' (600ml)' : item.tamanho === 'litro' ? ' (1L)' : ' (2L)') : ` (${item.tamanho.toUpperCase()})`;
    }
    textItems += `*${item.qty}x* ${item.name}${formatLabel} (R$ ${item.price.toFixed(2).replace('.',',')})\n`; 
    if(item.extras && item.extras.length > 0) {
        item.extras.forEach(ex => { textItems += `  └ _+ ${ex.name}_\n`; });
    }
  });

  let message = `🔥 *NOVO PEDIDO - SABOR NA BRASA* 🔥\n\n`;
  message += `👤 *Cliente:* ${name}\n📞 *Contato:* ${phone}\n--------------------------------\n\n`;
  message += `📋 *Itens do Pedido:*\n${textItems}\n--------------------------------\n`;
  message += `💰 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.',',')}\n`;
  message += `🛵 *Entrega:* ${deliveryType === 'entrega' ? `R$ ${deliveryFee.toFixed(2).replace('.',',')}` : 'Retirada na Loja (Grátis)'}\n`;
  message += `⭐ *TOTAL:* R$ ${total.toFixed(2).replace('.',',')}\n\n--------------------------------\n`;
  message += `📦 *Forma de Envio:* ${deliveryType === 'entrega' ? 'Entrega ao Domicílio' : 'Retirar no Balcão'}\n`;
  if(deliveryType === 'entrega') message += `📍 *Endereço:* ${address}\n`;
  
  const paymentMethods = { pix: 'PIX 🪙', dinheiro: 'Dinheiro 💵', credito: 'Cartão de Crédito 💳', debito: 'Cartão de Débito 💳' };
  message += `💳 *Forma de Pagamento:* ${paymentMethods[payment] || payment}\n`;
  if(obs) message += `📝 *Observações:* _${obs}_\n`;

  const receiptEl = document.getElementById('thermal-receipt');
  if (receiptEl) {
    const dataAtual = new Date().toLocaleString('pt-BR');
    let receiptHTML = `
        <div class="receipt-header">🔥 ${settings.name.toUpperCase()} 🔥</div>
        <div style="text-align:center; font-size:10px;">Pedido efetuado via Web</div>
        <div class="receipt-divider"></div>
        <div><b>DATA:</b> ${dataAtual}</div>
        <div><b>CLIENTE:</b> ${name}</div>
        <div><b>TEL:</b> ${phone}</div>
        <div class="receipt-divider"></div>
        <div style="font-weight:bold; margin-bottom:5px;">QTD  ITEM</div>
    `;

    cart.forEach(item => {
        let formatLabel = '';
        if(item.tamanho) {
           formatLabel = item.cat === 'Bebidas' ? (item.tamanho === 'pequena' ? ' (LATA)' : item.tamanho === 'media' ? ' (600ML)' : item.tamanho === 'litro' ? ' (1L)' : ' (2L)') : ` (${item.tamanho.toUpperCase()})`;
        }
        receiptHTML += `
            <div class="receipt-item">
                <span>${item.qty}x ${item.name}${formatLabel}</span>
                <span>R$ ${(item.price * item.qty).toFixed(2).replace('.',',')}</span>
            </div>
        `;
        if (item.extras) {
            item.extras.forEach(ex => {
                receiptHTML += `<div class="receipt-extras">+ ${ex.name}</div>`;
            });
        }
    });

    receiptHTML += `
        <div class="receipt-divider"></div>
        <div><b>ENVIO:</b> ${deliveryType === 'entrega' ? 'ENTREGA À DOMICÍLIO' : 'RETIRAR NO BALCÃO'}</div>
        ${deliveryType === 'entrega' ? `<div><b>END:</b> ${address}</div>` : ''}
        <div><b>PAGTO:</b> ${payment.toUpperCase()}</div>
        ${obs ? `<div><b>OBS:</b> ${obs}</div>` : ''}
        <div class="receipt-divider"></div>
        <div style="font-size:15px; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
            <span>TOTAL:</span>
            <span>R$ ${total.toFixed(2).replace('.',',')}</span>
        </div>
        <div class="receipt-footer">
            Obrigado pela preferência!<br>
            Bom apetite! 🍔
        </div>
    `;
    receiptEl.innerHTML = receiptHTML;
  }

  let cleanPhone = settings.phone.replace(/\D/g, '');
  if(!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone;

  // --- SALVAR PEDIDO NO PAINEL DO ADMIN ---
  const novoPedido = {
    id: 'PED_' + Date.now(),
    numero: orders.length + 1,
    data: new Date().toLocaleString('pt-BR'),
    cliente: name,
    telefone: phone,
    tipoEnvio: deliveryType,
    endereco: address,
    pagamento: paymentMethods[payment] || payment,
    observacoes: obs,
    itens: cart.map(i => {
      let formatLabel = '';
      if(i.tamanho) {
         formatLabel = i.cat === 'Bebidas' ? (i.tamanho === 'pequena' ? ' (Lata)' : i.tamanho === 'media' ? ' (600ml)' : i.tamanho === 'litro' ? ' (1L)' : ' (2L)') : ` (${i.tamanho.toUpperCase()})`;
      }
      return {
        qtd: i.qty,
        nome: i.name + formatLabel,
        extras: i.extras ? i.extras.map(e => e.name) : []
      };
    }),
    total: total,
    status: 'Pendente' // Todo pedido começa pendente
  };
  
  orders.push(novoPedido);
  localStorage.setItem('snb_orders', JSON.stringify(orders));
  // ----------------------------------------

  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
  setTimeout(() => { window.print(); }, 1200);

  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('orderSuccess').style.display = 'block';
}


// =========================================
// PAINEL DE ADMINISTRAÇÃO
// =========================================
function openAdminLogin() { document.getElementById('adminLogin')?.classList.add('show'); }
function closeAdminLogin() { document.getElementById('adminLogin')?.classList.remove('show'); }

function doLogin() {
  const u = document.getElementById('loginUser').value;
  const p = document.getElementById('loginPass').value;
  if(u === 'admin' && p === '1234') {
    closeAdminLogin();
    showPage('admin');
    renderAdminList();
    renderPedidosAdmin(); // 👈 Adicionamos isso aqui para carregar os pedidos direto no login
    loadSettings();
    loadBannersIntoAdmin();
  } else {
    if(document.getElementById('loginError')) document.getElementById('loginError').style.display = 'block';
  }
}

function renderAdminList() {
  if(document.getElementById('itemCount')) document.getElementById('itemCount').textContent = products.length;
  const list = document.getElementById('adminProductList');
  if(!list) return;
  list.innerHTML = products.map(p => {
    const isImage = p.emoji.startsWith('data:image') || p.emoji.startsWith('http');
    const imagePreview = isImage ? `<img src="${p.emoji}">` : p.emoji;
    
    let exibicaoPrecoAdmin = '';
    if(p.prices) {
       if(p.cat === 'Bebidas') {
          exibicaoPrecoAdmin = `Lata: R$ ${p.prices.pequena.toFixed(2)} | 600ml: R$ ${p.prices.media.toFixed(2)} | 1L: R$ ${(p.prices.litro || 0).toFixed(2)} | 2L: R$ ${p.prices.grande.toFixed(2)}`;
       } else if (p.cat === 'Fritas') {
          exibicaoPrecoAdmin = `P: R$ ${p.prices.pequena.toFixed(2)} | M: R$ ${p.prices.media.toFixed(2)} | G: R$ ${p.prices.grande.toFixed(2)}`;
       } else if (p.cat === 'Massas') {
          exibicaoPrecoAdmin = `M: R$ ${p.prices.media.toFixed(2)} | G: R$ ${p.prices.grande.toFixed(2)}`;
       }
    } else {
       exibicaoPrecoAdmin = `R$ ${p.price.toFixed(2).replace('.',',')}`;
    }

    return `
      <div class="admin-product-item">
        <div class="admin-product-emoji">${imagePreview}</div>
        <div class="admin-product-info">
          <div class="admin-product-name">${p.name} ${!p.available?'<span style="color:#E24B4A;font-size:0.75rem">(Indisponível)</span>':''}</div>
          <div class="admin-product-cat">${p.cat}${p.badge?' · '+p.badge:''}</div>
        </div>
        <div class="admin-product-price" style="font-size: 0.85rem; max-width: 230px;">${exibicaoPrecoAdmin}</div>
        <div class="admin-product-actions">
          <button class="edit-btn" onclick="editProduct(${p.id})">✏️ Editar</button>
          <button class="del-btn" onclick="deleteProduct(${p.id})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function saveProduct() {
  const name = document.getElementById('fName').value.trim();
  const cat = document.getElementById('fCat').value;
  if(!name) { showToast('Preencha o nome do item!'); return; }

  const editId = document.getElementById('editId').value;
  let fotoFinal = document.getElementById('fFotoBase64').value;
  if(!fotoFinal && editId) {
    const prodAntigo = products.find(x => x.id === parseInt(editId));
    if(prodAntigo) fotoFinal = prodAntigo.emoji;
  }
  if(!fotoFinal) fotoFinal = '🍔';

  let product = {
    id: editId ? parseInt(editId) : nextId++,
    name, 
    cat,
    desc: document.getElementById('fDesc').value, 
    emoji: fotoFinal,
    badge: document.getElementById('fBadge').value, 
    available: document.getElementById('fAvailable').checked
  };

  // Coleta de Preços Rigorosa e Corrigida
  if (cat === 'Bebidas') {
    const pLata = parseFloat(document.getElementById('fPriceLata').value) || 0;
    const p600 = parseFloat(document.getElementById('fPrice600').value) || 0;
    const p1L  = parseFloat(document.getElementById('fPrice1L').value) || 0;
    const p2L  = parseFloat(document.getElementById('fPrice2L').value) || 0;
    product.prices = { pequena: pLata, media: p600, litro: p1L, grande: p2L };
    delete product.price;
  } else if (cat === 'Fritas') {
    const pP = parseFloat(document.getElementById('fPriceFritasP').value) || 0;
    const pM = parseFloat(document.getElementById('fPriceFritasM').value) || 0;
    const pG = parseFloat(document.getElementById('fPriceFritasG').value) || 0;
    product.prices = { pequena: pP, media: pM, grande: pG };
    delete product.price;
  } else if (cat === 'Massas') {
    const pM = parseFloat(document.getElementById('fPriceMassasM').value) || 0;
    const pG = parseFloat(document.getElementById('fPriceMassasG').value) || 0;
    product.prices = { media: pM, grande: pG };
    delete product.price;
  } else {
    product.price = parseFloat(document.getElementById('fPrice').value) || 0;
    delete product.prices;
  }

  if(editId) {
    const idx = products.findIndex(p => p.id === parseInt(editId));
    if(idx !== -1) products[idx] = product;
  } else { 
    products.push(product); 
  }

  saveProducts(); 
  clearForm(); 
  renderAdminList();
  showToast(editId ? 'Item atualizado!' : 'Item adicionado!');
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if(!p) return;
  
  document.getElementById('editId').value = p.id;
  document.getElementById('fFotoBase64').value = p.emoji.startsWith('data:image') ? p.emoji : '';
  document.getElementById('fCat').value = p.cat;
  document.getElementById('fName').value = p.name;
  document.getElementById('fDesc').value = p.desc;
  document.getElementById('fBadge').value = p.badge || '';
  document.getElementById('fAvailable').checked = p.available;
  
  controlarCamposPreco();

  // Reseta todos os inputs de preço antes do carregamento
  const camposPreco = ['fPrice','fPriceLata','fPrice600','fPrice1L','fPrice2L','fPriceFritasP','fPriceFritasM','fPriceFritasG','fPriceMassasM','fPriceMassasG'];
  camposPreco.forEach(idInput => { if(document.getElementById(idInput)) document.getElementById(idInput).value = ''; });

  if (p.cat === 'Bebidas' && p.prices) {
    document.getElementById('fPriceLata').value = p.prices.pequena || '';
    document.getElementById('fPrice600').value = p.prices.media || '';
    document.getElementById('fPrice1L').value = p.prices.litro || '';
    document.getElementById('fPrice2L').value = p.prices.grande || '';
  } else if (p.cat === 'Fritas' && p.prices) {
    document.getElementById('fPriceFritasP').value = p.prices.pequena || '';
    document.getElementById('fPriceFritasM').value = p.prices.media || '';
    document.getElementById('fPriceFritasG').value = p.prices.grande || '';
  } else if (p.cat === 'Massas' && p.prices) {
    document.getElementById('fPriceMassasM').value = p.prices.media || '';
    document.getElementById('fPriceMassasG').value = p.prices.grande || '';
  } else {
    document.getElementById('fPrice').value = p.price || '';
  }

  document.getElementById('formTitle').textContent = '✏️ Editar Item';
  document.querySelector('.admin-card').scrollIntoView({behavior:'smooth'});
}

function deleteProduct(id) {
  if(!confirm('Tem certeza que quer remover este item?')) return;
  products = products.filter(p=>p.id!==id);
  saveProducts(); renderAdminList(); showToast('Item removido!');
}

function clearForm() {
  const ids = ['editId','fFoto','fFotoBase64','fName','fDesc','fPrice','fPriceLata','fPrice600','fPrice1L','fPrice2L','fPriceFritasP','fPriceFritasM','fPriceFritasG','fPriceMassasM','fPriceMassasG'];
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  
  if(document.getElementById('fCat')) document.getElementById('fCat').value = 'Hambúrgueres';
  if(document.getElementById('fBadge')) document.getElementById('fBadge').value = '';
  if(document.getElementById('fAvailable')) document.getElementById('fAvailable').checked = true;
  if(document.getElementById('formTitle')) document.getElementById('formTitle').textContent = '➕ Adicionar Item ao Cardápio';
  
  controlarCamposPreco();
}

function saveProducts() { localStorage.setItem('snb_products', JSON.stringify(products)); renderCats(); renderProducts(); }

function loadSettings() {
  ['sName','sPhone','sAddress','sHours'].forEach(id => { const el = document.getElementById(id); if(el) el.value = settings[id.substring(1).toLowerCase()] || ''; });
  if(document.getElementById('sDelivery')) document.getElementById('sDelivery').value = settings.delivery || 0;
  if(document.getElementById('sMinOrder')) document.getElementById('sMinOrder').value = settings.minOrder || 20;
}

function saveSettings() {
  settings = {
    name: document.getElementById('sName').value, phone: document.getElementById('sPhone').value,
    address: document.getElementById('sAddress').value, hours: document.getElementById('sHours').value,
    delivery: parseFloat(document.getElementById('sDelivery').value) || 0, minOrder: parseFloat(document.getElementById('sMinOrder').value) || 20,
  };
  localStorage.setItem('snb_settings', JSON.stringify(settings)); showToast('✅ Configurações salvas!');
}

function showToast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); }, 3000);
}

// INICIALIZAÇÃO AUTOMÁTICA DO SITE AO CARREGAR
window.onload = function() {
  renderBanners();
  renderCats();
  renderProducts();
};

// =========================================
// CONTROLE DO PAINEL DE PEDIDOS (ADMIN)
// =========================================
function filtrarPedidos(status) {
  filtroPedidoAtual = status;
  
  // Atualiza visual dos botões de filtro do painel
  ['Todos', 'Pendente', 'Em Preparo', 'Saiu para Entrega'].forEach(st => {
    const idBtn = 'btn-ped-' + (st === 'Em Preparo' ? 'preparo' : st === 'Saiu para Entrega' ? 'entrega' : st.toLowerCase());
    const btn = document.getElementById(idBtn);
    if(btn) {
      if(st === status) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  renderPedidosAdmin();
}

function renderPedidosAdmin() {
  const grid = document.getElementById('painelPedidosGrid');
  if(!grid) return;

  // Filtra os pedidos (esconde os 'Finalizados' por padrão na visão geral)
  const filtrados = orders.filter(o => {
    if (filtroPedidoAtual === 'Todos') return o.status !== 'Finalizado';
    return o.status === filtroPedidoAtual;
  });

  if(!filtrados.length) {
    grid.innerHTML = `<p style="color:#666; padding: 10px;">Nenhum pedido encontrado como "${filtroPedidoAtual}".</p>`;
    return;
  }

  grid.innerHTML = filtrados.map(o => {
    // Cores dinâmicas por status para as etiquetas (badges)
    const badgeColor = o.status === 'Pendente' ? '#ffc107' : o.status === 'Em Preparo' ? '#17a2b8' : '#007bff';
    const textColor = o.status === 'Pendente' ? '#000' : '#fff';

    return `
      <div class="admin-product-item" style="display: flex; flex-direction: column; align-items: stretch; border-left: 5px solid ${badgeColor}; padding: 15px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); color: #333;">
        
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;">
          <div>
            <strong style="color: var(--brand, #d35400); font-size: 1.1rem;">Pedido #${o.numero}</strong> 
            <span style="font-size: 0.8rem; color: #777;"> (${o.data})</span>
          </div>
          <span style="background: ${badgeColor}; color: ${textColor}; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            ${o.status}
          </span>
        </div>

        <div style="font-size: 0.9rem; margin-bottom: 10px; line-height: 1.5; color: #444;">
          <div>👤 <b>Cliente:</b> <span style="color: #111;">${o.cliente}</span> (${o.telefone})</div>
          <div>🛵 <b>Tipo:</b> ${o.tipoEnvio === 'entrega' ? `Entrega 📍 <span style="color: #111;">${o.endereco}</span>` : 'Retirada no Balcão 🏢'}</div>
          <div>💳 <b>Pagamento:</b> <span style="color: #111;">${o.pagamento}</span></div>
          ${o.observacoes ? `<div style="color: #d35400; background: #fff5e6; padding: 4px 8px; border-radius: 4px; margin-top: 5px;">📝 <b>Obs:</b> "${o.observacoes}"</div>` : ''}
          
          <div style="margin-top: 10px; background: #ffffff; border: 1px solid #eaeaea; padding: 12px; border-radius: 6px;">
            <b style="color: var(--brand, #d35400); font-size: 0.85rem; letter-spacing: 0.5px;">🛒 PRODUTOS</b>
            <ul style="margin: 8px 0 0 15px; padding: 0; color: #222;">
              ${o.itens.map(i => `
                <li style="margin-bottom: 6px;">
                  <b style="color: #000;">${i.qtd}x</b> ${i.nome}
                  ${i.extras.length ? `<br><small style="color:#777; margin-left: 5px;">+ ${i.extras.join(', ')}</small>` : ''}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e5e5; padding-top: 10px; flex-wrap: wrap; gap: 10px;">
          <div style="color: #333;">Total: <b style="color: var(--brand, #d35400); font-size: 1.2rem;">R$ ${o.total}</b></div>
          <div style="display: flex; gap: 6px;">
            ${o.status === 'Pendente' ? `
              <button onclick="alterarStatusPedido('${o.id}', 'Em Preparo')" style="background: #17a2b8; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">👨‍🍳 Iniciar Preparo</button>
            ` : ''}
            ${o.status === 'Em Preparo' ? `
              <button onclick="alterarStatusPedido('${o.id}', 'Saiu para Entrega')" style="background: #007bff; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">🛵 Enviar Pedido</button>
            ` : ''}
            ${o.status === 'Saiu para Entrega' || (o.status === 'Em Preparo' && o.tipoEnvio !== 'entrega') ? `
              <button onclick="alterarStatusPedido('${o.id}', 'Finalizado')" style="background: #2ed573; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">✅ Concluir / Arquivar</button>
            ` : ''}
            <button onclick="removerPedidoDoPainel('${o.id}')" style="background: #fff; color: #a3a3a3; border: 1px solid #dcdcdc; padding: 8px 10px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;" onmouseover="this.style.background='#fff0f0'; this.style.color='#e24b4a';" onmouseout="this.style.background='#fff'; this.style.color='#a3a3a3';" title="Excluir do histórico">🗑️</button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

function alterarStatusPedido(id, novoStatus) {
  const pedido = orders.find(o => o.id === id);
  if(!pedido) return;
  
  pedido.status = novoStatus;
  localStorage.setItem('snb_orders', JSON.stringify(orders));
  renderPedidosAdmin();
  showToast(`Pedido #${pedido.numero} movido para: ${novoStatus}!`);
}

function removerPedidoDoPainel(id) {
  if(!confirm('Deseja excluir permanentemente este pedido do registro?')) return;
  orders = orders.filter(o => o.id !== id);
  localStorage.setItem('snb_orders', JSON.stringify(orders));
  renderPedidosAdmin();
  showToast('Pedido removido.');
}