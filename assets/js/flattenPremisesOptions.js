function flattenPremisesOptions(select, index) {
  var formGroup = select.parentNode
  var formElement = formGroup.parentNode
  var optgroups = select.getElementsByTagName('optgroup')
  var selectedArea

  function hideSelect() {
    formGroup.classList.add('govuk-visually-hidden')

    var options = select.getElementsByTagName('option')

    for (let r = 0; r < options.length; ++r) {
      options[r].setAttribute('hidden', true)
    }
  }

  function getAreas() {
    var areas = []

    for (let i = 0; i < optgroups.length; ++i) {
      areas.push(optgroups[i].label)
    }

    return areas
  }

  function flattenOptions() {
    var ungroupedOptions = []

    for (let i = 0; i < optgroups.length; ++i) {
      var options = optgroups[i].getElementsByTagName('option')

      for (let r = 0; r < options.length; ++r) {
        options[r].dataset.area = optgroups[i].label
        ungroupedOptions.push(options[r])
      }
    }

    for (let i = 0; i < ungroupedOptions.length; ++i) {
      if (ungroupedOptions[i].hasAttribute('selected')) {
        selectedArea = ungroupedOptions[i].dataset.area
      }
      select.appendChild(ungroupedOptions[i])
    }

    while (optgroups[0]) {
      optgroups[0].parentNode.removeChild(optgroups[0])
    }
  }

  function createAreaSelect(areas) {
    var areaFormGroup = formGroup.cloneNode(true)
    var areaSelect = areaFormGroup.querySelector('select')
    var areaLabel = areaFormGroup.querySelector('label')
    var formName = 'area' + index

    var prompt = document.createElement('option')
    var promptText = select.dataset.areaPrompt ? select.dataset.areaPrompt : 'Select an area'

    areaSelect.innerHTML = ''
    prompt.innerText = promptText
    areaSelect.appendChild(prompt)
    areaSelect.id = formName
    areaSelect.name = formName
    areaFormGroup.classList.remove('govuk-visually-hidden')

    areaLabel.innerText = 'Select an Area'
    areaLabel.setAttribute('for', formName)

    for (let i = 0; i < areas.length; ++i) {
      var option = document.createElement('option')
      option.innerText = areas[i]
      option.selected = option.innerText === selectedArea
      areaSelect.appendChild(option)
    }

    formElement.insertBefore(areaFormGroup, formGroup)

    areaSelect.addEventListener('change', function (e) {
      hideSelect()
      var area = e.target.value

      formGroup.classList.remove('govuk-visually-hidden')

      var premisesWithArea = formGroup.querySelectorAll('option[data-area="' + area + '"]')

      for (let i = 0; i < premisesWithArea.length; ++i) {
        premisesWithArea[i].removeAttribute('hidden')
      }
    })
  }

  var areas = getAreas()

  flattenOptions()

  if (areas.length > 1) {
    if (select.value.length === 0) {
      hideSelect()
    }
    createAreaSelect(areas, selectedArea)
  }
}

var selectItems = document.querySelectorAll('[data-premises-with-areas]')

for (let i = 0; i < selectItems.length; ++i) {
  flattenPremisesOptions(selectItems[i], i)
}
