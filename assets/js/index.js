import * as GOVUKFrontend from 'govuk-frontend'
import { ButtonMenu, SortableTable } from '@ministryofjustice/frontend'
import flattenPremisesOptions from './flattenPremisesOptions'
import linkDebounce from './linkDebounce'
import SubNavAsTabs from './tabPanelTableScript'
import makeAutocomplete from './accessibleAutocomplete'

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
  new SortableTable({ table })
})
document.querySelectorAll('[data-premises-with-areas]').forEach((el, index) => flattenPremisesOptions(el, index))
document.querySelectorAll('a[data-debounce-link]').forEach(link => linkDebounce(link))
document.querySelectorAll('[data-sub-navigation-as-tabs]').forEach(element => {
  new SubNavAsTabs(element)
})
document.querySelectorAll('[data-autocomplete]').forEach(el => makeAutocomplete(el))
