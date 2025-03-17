import * as GOVUKFrontend from 'govuk-frontend'
import * as MOJFrontend from '@ministryofjustice/frontend'
import flattenPremisesOptions from './flattenPremisesOptions'
import linkDebounce from './linkDebounce'
import SubNavAsTabs from './tabPanelTableScript'

GOVUKFrontend.initAll()

document.querySelectorAll('.moj-button-menu').forEach(container => {
  new MOJFrontend.ButtonMenu(container, {
    buttonText: 'Actions',
    alignMenu: 'right',
  }).initMenu()
})
document.querySelectorAll('[data-module="moj-sortable-table"]').forEach(table => {
  new MOJFrontend.SortableTable({ table })
})
document.querySelectorAll('[data-premises-with-areas]').forEach((el, index) => flattenPremisesOptions(el, index))
document.querySelectorAll('a[data-debounce-link]').forEach(link => linkDebounce(link))
document.querySelectorAll('[data-sub-navigation-as-tabs]').forEach(element => {
  new SubNavAsTabs(element)
})
