import accessibleAutocomplete from 'accessible-autocomplete'

function makeAutocomplete(selectElement) {
  if (selectElement.hasAttribute('data-autocomplete-hint')) {
    const elementId = selectElement.getAttribute('id')
    const hint = document.createElement('p')
    hint.className = 'govuk-hint'
    hint.textContent = 'Start typing and select an option'
    document.querySelector(`label[for="${elementId}"]`).insertAdjacentElement('afterend', hint)
  }

  accessibleAutocomplete.enhanceSelectElement({
    selectElement,
    defaultValue: '',
  })
}

export default makeAutocomplete
