import { UiPlacementCriteria, placementCriteriaLabels } from './placementCriteriaUtils'
import { sentenceCase } from './utils'

export const cell = (requirement: string, preference: string, checked?: boolean) => {
  const id = `${requirement}-${preference}`
  return `<td class="govuk-table__cell">
  <div class="govuk-radios" data-module="govuk-radios">
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="${id}" name="${requirement}" type="radio" value="${preference}" ${
              checked ? 'checked' : ''
            }>
            <label class="govuk-label govuk-radios__label" for="${id}"><span class="govuk-visually-hidden">${sentenceCase(
              requirement,
            )} ${preference}</span></label>
          </div>
        </td>`
}

export const row = (rowName: UiPlacementCriteria, options: Array<string>, value: string) => `<tr>
  <th class="govuk-table__cell govuk-!-font-weight-regular" scope="row">${placementCriteriaLabels[rowName]}</td>
    ${options.map(preference => cell(rowName, preference, value === preference)).join('')}
</tr>`

export const heading = (headingNames: Array<string>) => {
  return `<thead class="govuk-table__head">
<tr class="govuk-table__row">
${headingNames.map(title => `<th class="govuk-table__header" scope="col">${title}</th>`).join('')}
</tr>
</thead>`
}

export const radioMatrixTable = (
  columnHeadings: Array<string>,
  rowHeader: Array<UiPlacementCriteria>,
  options: Array<string>,
  body: Record<string, string>,
) => {
  return `<table class="govuk-table">
  ${heading(columnHeadings)}
  ${rowHeader
    .map(rowHead => {
      const requirementValue = Object.keys(body).find(key => key === rowHead)
      return row(rowHead, options, body[requirementValue])
    })
    .join('')}
</table>`
}
