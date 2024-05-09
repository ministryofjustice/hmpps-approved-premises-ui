export const embeddedSummaryListItem = (answers: Array<Record<string, unknown>>): string => {
  let response = ''

  answers.forEach(answer => {
    response += '<dl class="govuk-summary-list govuk-summary-list--embedded">'
    Object.keys(answer).forEach(key => {
      response += `
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            ${key}
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
          ${answer[key]}
          </dd>
        </div>
        `
    })
    response += '</dl>'
  })

  return response
}
