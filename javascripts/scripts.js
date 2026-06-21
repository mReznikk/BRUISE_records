//for every html page
function init() {
    setTodayDate();
    forModalWindow();
    formatPhoneInput();
    burgerMenu();
    editorialTouch();
    regionTouch();
}
document.addEventListener('DOMContentLoaded', init);

function formatPhoneInput() {
    let phoneInput = document.querySelector('input[name="phone"]')

    if (!phoneInput) return

    phoneInput.addEventListener('keypress', (event) => {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault()
        }
    })

    phoneInput.addEventListener('input', function () {
        let numbers = this.value.replace(/\D/g, '').substring(0, 11)
        let cc = numbers.slice(0, 1)
        numbers = numbers.slice(1)

        let formatted = cc ? '+' + cc + ' ' : ''

        if (numbers.length > 0) {
            formatted += '(' + numbers.substring(0, 3)
        }
        if (numbers.length >= 4) {
            formatted += ')' + numbers.substring(3, 6)
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

        dateInput.value = `${yyyy}/${mm}/${dd}`
        dateInput.readOnly = true
        dateInput.tabIndex = -1
    }
}

function forModalWindow() {
    let form = document.querySelector('form')

    if (!form) return

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

function burgerMenu() {
    let logo = document.querySelector('.mainMenu-logo')
    let links = document.querySelector('.mainMenu-links')
    if (!logo || !links) return
    logo.addEventListener('click', () => links.classList.toggle('open'))
}

function editorialTouch() {
    let images = document.querySelectorAll('.editorial-image')
    images.forEach((image) => {
        image.addEventListener('click', () => image.classList.toggle('show'))
    })
}

function regionTouch() {
    let regions = document.querySelectorAll('.region')
    regions.forEach((region) => {
        region.addEventListener('click', () => {
            let open = region.classList.contains('show')
            regions.forEach((r) => r.classList.remove('show'))
            if (!open) region.classList.add('show')
        })
    })
}
