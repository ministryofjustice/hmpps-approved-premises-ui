import * as GOVUKFrontend from 'govuk-frontend'
import { ButtonMenu, SortableTable, DatePicker } from '@ministryofjustice/frontend'
import flattenPremisesOptions from './flattenPremisesOptions'
import linkDebounce from './linkDebounce'
import SubNavAsTabs from './tabPanelTableScript'
import makeAutocomplete from './accessibleAutocomplete'
import clearErrorsOnSubmit from './clearErrors'
import initWhatsNewTopBanner from './whatsNewTopBanner'

GOVUKFrontend.initAll()

document.querySelectorAll('.moj-button-menu').forEach(container => {
  const extraElement = document.createElement('span')
  container.appendChild(extraElement)
  new ButtonMenu(container, {
    alignMenu: 'right',
  })
  extraElement.parentElement.remove()
})
document.querySelectorAll('[data-module="moj-sortable-table"]').forEach(table => {
  new SortableTable(table)
})
document.querySelectorAll('[data-premises-with-areas]').forEach((el, index) => flattenPremisesOptions(el, index))
document.querySelectorAll('a[data-debounce-link]').forEach(linkDebounce)
document.querySelectorAll('[data-sub-navigation-as-tabs]').forEach(element => {
  new SubNavAsTabs(element)
})
document.querySelectorAll('[data-autocomplete]').forEach(makeAutocomplete)
document.querySelectorAll('[data-module="moj-date-picker"]').forEach(el => {
  new DatePicker(el)
})
document.querySelectorAll('form[data-clear-errors-on-submit]').forEach(clearErrorsOnSubmit)
document.querySelectorAll('#whats-new-top-banner').forEach(initWhatsNewTopBanner)
