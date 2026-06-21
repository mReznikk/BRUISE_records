//for every html page
function init() {
    setTodayDate();
    forModalWindow();
    formatPhoneInput();
}
document.addEventListener('DOMContentLoaded', init);

function formatPhoneInput() {
    let phoneInput = document.querySelector('input[name="phone"]')

    phoneInput.addEventListener('keypress', (event) => {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault()
        }
    })

    phoneInput.addEventListener('input', function () {
        let numbers = this.value.replace(/\D/g, '')
        numbers = numbers.substring(0, 10)

        let formatted = ''

        if (numbers.length > 0) {
            //  formatted = formatted + '('+ numbers.substring(0, 3) 
            formatted += '(' + numbers.substring(0, 3)
        }
        if (numbers.length >= 4) {
            formatted += ') ' + numbers.substring(3, 6)
        }
        if (numbers.length >= 7) {
            formatted += '-' + numbers.substring(6, 8)
        }
         if (numbers.length >= 9) {
            formatted += '-' + numbers.substring(8, 10)
        }

        this.value = formatted
    })
}

function setTodayDate() {
    let dateInput = document.querySelector('input[name="date"]')

    if (dateInput) {
        let today = new Date()
        let dd = String(today.getDate()).padStart(2, '0')
        let mm = String(today.getMonth() + 1).padStart(2, '0')
        let yyyy = today.getFullYear()

        dateInput.value = `${dd}/${mm}/${yyyy}`
        dateInput.readOnly = true
        dateInput.tabIndex = -1
    }
}

function forModalWindow() {
    let form = document.querySelector('form')

    form.addEventListener('submit', (event) => {
        event.preventDefault()

        let userName = form.userName.value

        if (userName == '') {
            alert(`Спасибо, неизвестный пользователь! Данные сохранены`)
        } else {
            alert(`Спасибо, ${userName}! Данные сохранены`)
        }
    })
}

// function setupCart() {
//     let counter = document.getElementById('cart-count')

//     // inject the drawer markup once
//     let panel = document.getElementById('cart-panel')
//     if (!panel) {
//         panel = document.createElement('div')
//         panel.id = 'cart-panel'
//         panel.className = 'cart-panel'
//         panel.innerHTML =
//             '<button id="cart-close" class="cart-panel__close">&times;</button>' +
//             '<h3 class="cart-panel__title">КОРЗИНА</h3>' +
//             '<ul id="cart-items" class="cart-panel__items"></ul>' +
//             '<button id="cart-checkout">CHECKOUT</button>'
//         document.body.appendChild(panel)
//     }
//     let itemsBox = panel.querySelector('#cart-items')

//     let getCart = () => {
//         let raw
//         try { raw = JSON.parse(localStorage.getItem('cartItems')) || [] }
//         catch (e) { return [] }
//         return raw.map((it) => typeof it === 'string' ? { title: it, qty: 1 } : it)
//     }
//     let setCart = (items) => localStorage.setItem('cartItems', JSON.stringify(items))
//     let updateCount = () => {
//         let total = getCart().reduce((s, it) => s + (it.qty || 0), 0)
//         if (counter) counter.textContent = total
//         localStorage.setItem('cartCount', total)
//     }
//     let addItem = (title) => {
//         let items = getCart()
//         let found = items.find((it) => it.title === title)
//         if (found) found.qty++
//         else items.push({ title: title, qty: 1 })
//         setCart(items)
//     }
//     let renderCart = () => {
//         let items = getCart()
//         if (!items.length) {
//             itemsBox.innerHTML = '<li class="cart-item cart-item--empty">Empty</li>'
//             return
//         }
//         itemsBox.innerHTML = items.map((it, i) =>
//             '<li class="cart-item">' +
//                 '<span class="cart-item__title">' + it.title + '</span>' +
//                 '<span class="cart-qty">' +
//                     '<button class="qty-btn" data-act="dec" data-i="' + i + '">−</button>' +
//                     '<span class="qty-num">' + it.qty + '</span>' +
//                     '<button class="qty-btn" data-act="inc" data-i="' + i + '">+</button>' +
//                 '</span>' +
//             '</li>'
//         ).join('')
//     }

//     // BUY -> add to cart (+1) and show "Added" nearby
//     document.querySelectorAll('.product-buy').forEach((btn) => {
//         btn.addEventListener('click', () => {
//             let card = btn.closest('.product-card')
//             let nameEl = card ? card.querySelector('.product-name') : null
//             let title = card ? (nameEl ? nameEl.textContent.trim() : 'Item') : 'FLIP BOOK'
//             addItem(title)
//             updateCount()
//             renderCart()

//             let label = btn.parentNode.querySelector('.added-label')
//             if (!label) {
//                 label = document.createElement('div')
//                 label.className = 'added-label'
//                 label.textContent = 'Added'
//                 btn.parentNode.insertBefore(label, btn.nextSibling)
//             }
//             label.style.display = 'block'
//         })
//     })

//     // + / - quantity controls
//     itemsBox.addEventListener('click', (e) => {
//         let btn = e.target.closest('.qty-btn')
//         if (!btn) return
//         let i = Number(btn.getAttribute('data-i'))
//         let items = getCart()
//         if (!items[i]) return
//         if (btn.getAttribute('data-act') === 'inc') items[i].qty++
//         else { items[i].qty--; if (items[i].qty <= 0) items.splice(i, 1) }
//         setCart(items)
//         renderCart()
//         updateCount()
//     })

//     // КОРЗИНА link -> open the drawer instead of navigating
//     let cartLink = counter ? counter.closest('a') : null
//     if (cartLink) {
//         cartLink.addEventListener('click', (e) => {
//             e.preventDefault()
//             renderCart()
//             panel.classList.add('open')
//         })
//     }
//     panel.querySelector('#cart-close').addEventListener('click', () => panel.classList.remove('open'))
//     panel.querySelector('#cart-checkout').addEventListener('click', () => alert('To order, please call 111-22-33'))

//     updateCount()
// }
// document.addEventListener('DOMContentLoaded', setupCart)