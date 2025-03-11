import { initAll } from './govuk/govuk-frontend.min.js'
import { debounce } from './js/linkDebounce.js'

initAll()

document.querySelectorAll('.moj-button-menu').forEach((container) => {
  new MOJFrontend.ButtonMenu(container, {
    mq: '(min-width: 200em)',
    buttonText: 'Actions',
    menuClasses: 'moj-button-menu__wrapper--right',
  }).init()
})

document.querySelectorAll('a[data-debounce-link]').forEach(link => {
  debounce(link)
})
