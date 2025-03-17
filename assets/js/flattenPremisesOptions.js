function flattenPremisesOptions(select, index) {
  const formGroup = select.parentNode
  const formElement = formGroup.parentNode
  const optgroups = select.getElementsByTagName('optgroup')
  let selectedArea

  function hideSelect() {
    formGroup.classList.add('govuk-visually-hidden')

    const options = select.getElementsByTagName('option')

    for (let r = 0; r < options.length; ++r) {
      options[r].setAttribute('hidden', true)
    }
  }

  function getAreas() {
    const areas = []

    for (let i = 0; i < optgroups.length; ++i) {
      areas.push(optgroups[i].label)
    }

    return areas
  }

  function flattenOptions() {
    const ungroupedOptions = []

    for (let i = 0; i < optgroups.length; ++i) {
      const options = optgroups[i].getElementsByTagName('option')

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
    const areaFormGroup = formGroup.cloneNode(true)
    const areaSelect = areaFormGroup.querySelector('select')
    const areaLabel = areaFormGroup.querySelector('label')
    const formName = 'area' + index

    const prompt = document.createElement('option')
    const promptText = select.dataset.areaPrompt ? select.dataset.areaPrompt : 'Select an area'

    areaSelect.innerHTML = ''
    prompt.innerText = promptText
    areaSelect.appendChild(prompt)
    areaSelect.id = formName
    areaSelect.name = formName
    areaFormGroup.classList.remove('govuk-visually-hidden')

    areaLabel.innerText = 'Select an Area'
    areaLabel.setAttribute('for', formName)

    for (let i = 0; i < areas.length; ++i) {
      const option = document.createElement('option')
      option.innerText = areas[i]
      option.selected = option.innerText === selectedArea
      areaSelect.appendChild(option)
    }

    formElement.insertBefore(areaFormGroup, formGroup)

    areaSelect.addEventListener('change', function (e) {
      hideSelect()
      const area = e.target.value

      formGroup.classList.remove('govuk-visually-hidden')

      const premisesWithArea = formGroup.querySelectorAll('option[data-area="' + area + '"]')

      for (let i = 0; i < premisesWithArea.length; ++i) {
        premisesWithArea[i].removeAttribute('hidden')
      }
    })
  }

  const areas = getAreas()

  flattenOptions()

  if (areas.length > 1) {
    if (select.value.length === 0) {
      hideSelect()
    }
    createAreaSelect(areas, selectedArea)
  }
}

export default flattenPremisesOptions
