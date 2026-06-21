//for every html page
function init() {
    setTodayDate();
    forModalWindow();
    formatPhoneInput();
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
