/* ==========================================================================
   1. BANCO DE DADOS E CONFIGURAÇÕES
   ========================================================================== */
const produtosOfertas = [
    { id: 1, nome: "Cimento cpII 50kg", preco: 44.99, img: "img/cimento.png" },
    { id: 2, nome: "Tijolo santa cecilia 8 furos (milheiro)", preco: 799.99, img: "img/tijolo.png", permiteMeio: true },
    { 
        id: 3, 
        nome: "cerâmica enseada Stela tipo(A) cx2,69m²", 
        preco: 29.99, 
        img: "img/enseada.png",
        isCaixa: true,        
        metrosPorCaixa: 2.69 
    },
    { id: 4, nome: "argamassa acIII Portokoll 20kg", preco: 39.99, img: "img/argamassa.png" }
];

const produtosGerais = [
    { id: 10, nome: "Torneira Gourmet", preco: 120.00, img: "img/torneira.png" },
    { id: 11, nome: "Lâmpada LED 9w (Avant)", preco: 2.99, img: "img/lampada.png" },
    { id: 12, nome: "Cabo Flexível Sil 2.5mm (peca)", preco: 249.99, img: "img/cabo.png" },
    { id: 13, nome: "Joelho 20mm 90° PVC (Krona)", preco: 1.50, img: "img/joelho.png" },
    { id: 14, nome: "Tubo PVC 75mm", preco: 39.00, img: "img/tubo.png" },
    { id: 15, nome: "tubo pvc 100mm krona", preco: 95.00, img: "img/tubo100.png" },
    { id: 16, nome: "tubo 50mm Krona", preco: 79.00, img: "img/tubo50.png" }
];

let carrinho = [];
let produtosVisiveis = 4;

/* ==========================================================================
   2. RENDERIZAÇÃO DE PRODUTOS NO SITE
   ========================================================================== */
function renderizarTudo() {
    const containerOfertas = document.getElementById('grid-produtos');
    if (containerOfertas) {
        containerOfertas.innerHTML = produtosOfertas.map(p => criarCardHTML(p, true)).join('');
    }

    const containerGeral = document.getElementById('grid-geral');
    if (containerGeral) {
        const listaReduzida = produtosGerais.slice(0, produtosVisiveis);
        containerGeral.innerHTML = listaReduzida.map(p => criarCardHTML(p, false)).join('');

        const btn = document.getElementById('btn-ver-mais');
        if (btn) {
            btn.style.display = produtosGerais.length <= 4 ? 'none' : 'inline-block';
            btn.innerText = (produtosVisiveis >= produtosGerais.length) ? "VER MENOS" : "VER MAIS PRODUTOS";
        }
    }
    // Timeout ajustado para não travar o carregamento inicial
    setTimeout(animarScroll, 300);
}

function criarCardHTML(p, ehOferta) {
    return `
        <div class="product-card revelar">
            ${ehOferta ? '<div class="badge-oferta">OFERTA</div>' : ''}
            <img src="${p.img}" alt="${p.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Bella+Casa'">
            <h3>${p.nome}</h3>
            <span class="price">R$ ${p.preco.toFixed(2)} ${p.isCaixa ? '<small>/m²</small>' : ''} <small style="font-size: 11px; color: #777; font-weight: normal;">à vista</small></span>
            <button class="btn-add" onclick="adicionarAoCarrinho(${p.id}, ${ehOferta})">COMPRAR</button>
        </div>
    `;
}

function toggleProdutos() {
    if (produtosVisiveis < produtosGerais.length) {
        produtosVisiveis += 4;
    } else {
        produtosVisiveis = 4;
        const grid = document.getElementById('grid-geral');
        if(grid) grid.scrollIntoView({ behavior: 'smooth' });
    }
    renderizarTudo();
}

/* ==========================================================================
   3. LÓGICA DO CARRINHO
   ========================================================================== */
function adicionarAoCarrinho(id, veioDasOfertas) {
    const lista = veioDasOfertas ? produtosOfertas : produtosGerais;
    const produtoBase = lista.find(p => p.id === id);

    if (produtoBase) {
        const itemExistente = carrinho.find(item => item.id === id);
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({ ...produtoBase, quantidade: 1 });
        }
        atualizarCarrinhoUI();
    }
}

function atualizarCarrinhoUI() {
    const lista = document.getElementById('itens-carrinho');
    const totalEl = document.getElementById('total-carrinho');
    const countEl = document.getElementById('cart-count');

    if(!lista) return; // Segurança para Android

    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    if (countEl) {
        countEl.innerText = Math.floor(totalItens);
        countEl.style.display = totalItens > 0 ? "flex" : "none";
    }

    if (carrinho.length === 0) {
        lista.innerHTML = '<p style="text-align:center; padding:40px; color:#999;">Carrinho vazio, sô!</p>';
        if (totalEl) totalEl.innerHTML = "R$ 0,00";
        atualizarLinkWhatsapp();
        return;
    }

    lista.innerHTML = carrinho.map((item, index) => {
        const precoReal = item.isCaixa ? (item.preco * item.metrosPorCaixa) : item.preco;
        let unidadeMedida = " un";
        if (item.permiteMeio) unidadeMedida = " mil";
        if (item.isCaixa) unidadeMedida = " cx";
        
        return `
            <div class="item-no-carrinho">
                <img src="${item.img}" alt="${item.nome}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                <div class="item-info" style="flex-grow:1; margin-left:10px;">
                    <h4 style="font-size:14px; margin:0;">${item.nome}</h4>
                    <p class="item-preco" style="color:#e67e22; font-weight:bold; margin:5px 0;">
                        R$ ${(precoReal * item.quantidade).toFixed(2)}
                    </p>
                    <div class="quantidade-container" style="display:flex; align-items:center; gap:10px;">
                        <button class="btn-qtd" onclick="alterarQtd(${index}, -1)">−</button>
                        <span class="qtd-numero">${item.quantidade}${unidadeMedida}</span>
                        <button class="btn-qtd" onclick="alterarQtd(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remover" onclick="removerDoCarrinho(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    const total = calcularTotal();
    if (totalEl) {
        totalEl.innerHTML = `R$ ${total.toFixed(2)} <small style="font-size: 12px; font-weight: normal;">à vista</small>`;
    }
    atualizarLinkWhatsapp();
}

function calcularTotal() {
    return carrinho.reduce((acc, item) => {
        const valorUnit = item.isCaixa ? (item.preco * item.metrosPorCaixa) : item.preco;
        return acc + (valorUnit * item.quantidade);
    }, 0);
}

function alterarQtd(index, mudanca) {
    const item = carrinho[index];
    if (item.permiteMeio) {
        item.quantidade += (mudanca > 0 ? 0.5 : -0.5);
    } else {
        item.quantidade += mudanca;
    }
    if (item.quantidade <= 0) removerDoCarrinho(index);
    else atualizarCarrinhoUI();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

/* ==========================================================================
   4. FUNÇÕES WHATSAPP
   ========================================================================== */
function atualizarLinkWhatsapp() {
    const botaoZap = document.getElementById('btn-finalizar-whatsapp');
    if (!botaoZap) return;

    if (carrinho.length === 0) {
        botaoZap.href = "javascript:void(0)";
        botaoZap.onclick = (e) => { e.preventDefault(); alert("Adicione produtos primeiro!"); };
        return;
    }

    botaoZap.onclick = null;
    const numeroLoja = "5581987554832";
    let texto = "*NOVO PEDIDO - BELLA CASA* 🏠\n\n";

    carrinho.forEach(item => {
        const precoReal = item.isCaixa ? (item.preco * item.metrosPorCaixa) : item.preco;
        const unidade = item.isCaixa ? "cx" : (item.permiteMeio ? "mil" : "un");
        texto += `✅ *${item.quantidade}${unidade}* - ${item.nome}\n`;
        texto += `Subtotal: R$ ${(precoReal * item.quantidade).toFixed(2)}\n\n`;
    });

    const totalFinal = calcularTotal();
    texto += `*TOTAL: R$ ${totalFinal.toFixed(2)}*`;

    botaoZap.href = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(texto)}`;
}

/* ==========================================================================
   5. INTERFACE E ANIMAÇÕES
   ========================================================================== */
function toggleCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho-lateral');
    const overlay = document.getElementById('cart-overlay');
    if(!carrinhoDiv || !overlay) return;

    carrinhoDiv.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll', carrinhoDiv.classList.contains('active'));
}

function toggleMenu() {
    const menu = document.getElementById('menu-lateral');
    const overlay = document.getElementById('menu-overlay');
    if(!menu || !overlay) return;

    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll', menu.classList.contains('active'));
}

function toggleSubmenu(elemento) {
    elemento.parentElement.classList.toggle('aberto');
}

function animarScroll() {
    const elementos = document.querySelectorAll('.revelar, .product-card');
    elementos.forEach(el => {
        const topo = el.getBoundingClientRect().top;
        if (topo < window.innerHeight * 0.9) {
            el.classList.add('aparecer');
        }
    });
}

let slideIndex = 0;
function mudarSlideManual(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    slides[slideIndex].classList.remove('active');
    if(dots[slideIndex]) dots[slideIndex].classList.remove('active');
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    if(dots[slideIndex]) dots[slideIndex].classList.add('active');
}

/* CORREÇÃO PARA O SPLASH SCREEN NO ANDROID */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderiza os dados
    renderizarTudo();
    
    // 2. Garante que o Splash suma em no máximo 4 segundos (Segurança Android)
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => { splash.style.display = 'none'; }, 600);
        }
    }, 3000);

    window.addEventListener('scroll', animarScroll);
    setInterval(() => mudarSlideManual(1), 5000);
});
