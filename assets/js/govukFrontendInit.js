import { initAll } from './govuk/govuk-frontend.min.js'
import { debounce } from './js/linkDebounce.js'

initAll()

document.querySelectorAll('.moj-button-menu').forEach(container => {
  new MOJFrontend.ButtonMenu(container, {
    buttonText: 'Actions',
    alignMenu: 'right',
  }).initMenu()
})

document.querySelectorAll('a[data-debounce-link]').forEach(link => {
  debounce(link)
})
