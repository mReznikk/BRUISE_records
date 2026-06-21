(function () {
    let panel = document.querySelector('.cart-panel');
    if (!panel) {
        panel = document.createElement('aside');
        panel.className = 'cart-panel';
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML =
            '<button class="cart-panel__close" type="button" aria-label="Закрыть">×</button>' +
            '<h2 class="cart-panel__title">КОРЗИНА</h2>' +
            '<ul class="cart-panel__items"></ul>' +
            '<button id="cart-checkout" type="button">ОФОРМИТЬ ЗАКАЗ</button>';
        document.body.appendChild(panel);
    }
    let list = panel.querySelector('.cart-panel__items');
    if (!list) return;

    let cart = new Map();
    try {
        JSON.parse(localStorage.getItem('cart') || '[]').forEach(function (it) {
            if (it && it.name) cart.set(it.name, { name: it.name, price: it.price || '', qty: it.qty || 0 });
        });
    } catch (e) { }

    function save() {
        localStorage.setItem('cart', JSON.stringify(Array.from(cart.values())));
    }

    function closeCart() { panel.classList.remove('open'); }

    function updateCount(total) {
        let span = document.getElementById('cart-count');
        if (span) { span.textContent = total; return; }
        let link = document.querySelector('.mainMenu-cart-link');
        if (!link) return;
        link.childNodes.forEach(function (node) {
            if (node.nodeType === 3 && node.nodeValue.indexOf('КОРЗИНА') !== -1) {
                node.nodeValue = node.nodeValue.replace(/\(\d+\)/, '(' + total + ')');
            }
        });
    }

    function changeQty(name, delta) {
        let item = cart.get(name);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) cart.delete(name);
        render();
    }

    function addToCart(name, price) {
        let item = cart.get(name);
        if (item) item.qty += 1;
        else cart.set(name, { name: name, price: price, qty: 1 });
        render();
    }

    function render() {
        save();
        list.innerHTML = '';
        let totalQty = 0;

        if (cart.size === 0) {
            let empty = document.createElement('li');
            empty.className = 'cart-item cart-item--empty';
            empty.textContent = 'Корзина пуста';
            list.appendChild(empty);
        } else {
            cart.forEach(function (item) {
                totalQty += item.qty;

                let li = document.createElement('li');
                li.className = 'cart-item';

                let name = document.createElement('span');
                name.textContent = item.name;

                let qty = document.createElement('span');
                qty.className = 'cart-qty';

                let dec = document.createElement('button');
                dec.className = 'qty-btn';
                dec.type = 'button';
                dec.textContent = '-';
                dec.addEventListener('click', function () { changeQty(item.name, -1); });

                let num = document.createElement('span');
                num.className = 'qty-num';
                num.textContent = item.qty;

                let inc = document.createElement('button');
                inc.className = 'qty-btn';
                inc.type = 'button';
                inc.textContent = '+';
                inc.addEventListener('click', function () { changeQty(item.name, 1); });

                qty.append(dec, num, inc);
                li.append(name, qty);
                list.appendChild(li);
            });
        }

        updateCount(totalQty);
    }

    function showAdded(btn) {
        let label = btn.nextElementSibling;
        if (!label || !label.classList.contains('added-label')) {
            label = document.createElement('div');
            label.className = 'added-label';
            label.textContent = 'Added';
            btn.insertAdjacentElement('afterend', label);
        }
        label.style.display = 'block';
        clearTimeout(label._timer);
        label._timer = setTimeout(function () { label.style.display = 'none'; }, 1500);
    }

    document.querySelectorAll('.product-buy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            let card = btn.closest('.product-card, .flipbook-section');
            let nameEl = card && card.querySelector('.product-name');
            let priceEl = card && card.querySelector('.product-price');
            let name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : 'Товар';
            let price = priceEl ? priceEl.textContent.trim() : '';
            addToCart(name, price);
            showAdded(btn);
        });
    });

    let cartLink = document.querySelector('.mainMenu-cart-link');
    if (cartLink) cartLink.addEventListener('click', function (e) { e.preventDefault(); panel.classList.toggle('open'); });

    let closeBtn = panel.querySelector('.cart-panel__close');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    let checkout = document.getElementById('cart-checkout');
    if (checkout) checkout.addEventListener('click', function () {
        alert('Для подтверждения заказа напишите на почту bruiserecords@gmail.com');
    });

    render();
})();
