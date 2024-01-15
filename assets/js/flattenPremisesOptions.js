function flattenPremisesOptions(select, index) {
  var formGroup = select.parentNode
  var formElement = formGroup.parentNode
  var optgroups = select.getElementsByTagName('optgroup')
  var selectedRegion

  function hideSelect() {
    formGroup.classList.add('govuk-visually-hidden')

    var options = select.getElementsByTagName('option')

    for (let r = 0; r < options.length; ++r) {
      options[r].setAttribute('hidden', true)
    }
  }

  function getRegions() {
    var regions = []

    for (let i = 0; i < optgroups.length; ++i) {
      regions.push(optgroups[i].label)
    }

    return regions
  }

  function flattenOptions() {
    var ungroupedOptions = []

    for (let i = 0; i < optgroups.length; ++i) {
      var options = optgroups[i].getElementsByTagName('option')

      for (let r = 0; r < options.length; ++r) {
        options[r].dataset.region = optgroups[i].label
        ungroupedOptions.push(options[r])
      }
    }

    for (let i = 0; i < ungroupedOptions.length; ++i) {
      if (ungroupedOptions[i].hasAttribute('selected')) {
        selectedRegion = ungroupedOptions[i].dataset.region
      }
      select.appendChild(ungroupedOptions[i])
    }

    while (optgroups[0]) {
      optgroups[0].parentNode.removeChild(optgroups[0])
    }
  }

  function createRegionSelect(regions) {
    var regionFormGroup = formGroup.cloneNode(true)
    var regionSelect = regionFormGroup.querySelector('select')
    var regionLabel = regionFormGroup.querySelector('label')
    var formName = 'region' + index

    var prompt = document.createElement('option')
    var promptText = select.dataset.regionPrompt ? select.dataset.regionPrompt : 'Select a region'

    regionSelect.innerHTML = ''
    prompt.innerText = promptText
    regionSelect.appendChild(prompt)
    regionSelect.id = formName
    regionSelect.name = formName
    regionFormGroup.classList.remove('govuk-visually-hidden')

    regionLabel.innerText = 'Select a Region'
    regionLabel.setAttribute('for', formName)

    for (let i = 0; i < regions.length; ++i) {
      var option = document.createElement('option')
      option.innerText = regions[i]
      option.selected = option.innerText === selectedRegion
      regionSelect.appendChild(option)
    }

    formElement.insertBefore(regionFormGroup, formGroup)

    regionSelect.addEventListener('change', function (e) {
      hideSelect()
      var region = e.target.value

      formGroup.classList.remove('govuk-visually-hidden')

      var premisesWithRegion = formGroup.querySelectorAll('option[data-region="' + region + '"]')

      for (let i = 0; i < premisesWithRegion.length; ++i) {
        premisesWithRegion[i].removeAttribute('hidden')
      }
    })
  }

  var regions = getRegions()
  flattenOptions()

  if (regions.length > 1) {
    if (select.value.length === 0) {
      hideSelect()
    }
    createRegionSelect(regions, selectedRegion)
  }
}

var selectItems = document.querySelectorAll('[data-premises-with-regions]')

for (let i = 0; i < selectItems.length; ++i) {
  flattenPremisesOptions(selectItems[i], i)
}
