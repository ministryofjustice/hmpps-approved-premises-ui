import { placementCriteriaLabels } from '../placementCriteriaUtils'

export const mapSearchParamCharacteristicsForUi = (characteristics: Array<string>) => {
  return `<ul class="govuk-list">${characteristics
    .map(characteristicPair => `<li>${placementCriteriaLabels[characteristicPair]}</li>`)
    .join('')}</ul>`
}
