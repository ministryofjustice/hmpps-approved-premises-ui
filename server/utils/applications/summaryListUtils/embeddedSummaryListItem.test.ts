import { embeddedSummaryListItem, embeddedSummaryListItemCompact } from './embeddedSummaryListItem'
import * as utils from './embeddedSummaryListItem'

const answers = [
  { foo: 'bar', bar: 'baz' },
  { foo: 'bar', bar: 'baz' },
]

describe('embeddedSummaryListItem', () => {
  it('returns a summary list for an array of records', () => {
    const result = embeddedSummaryListItem(answers, { class: 'test-class' }).replace(/\s+/g, ``)

    expect(result).toEqual(
      `
      <dl class="govuk-summary-list govuk-summary-list--embedded test-class">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded  test-class">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>`.replace(/\s+/g, ``),
    )
  })
})

describe('embeddedSummaryListItemCompact', () => {
  it('should call base function with class to reduce font size', () => {
    jest.spyOn(utils, 'embeddedSummaryListItem').mockReturnValue('return')

    expect(embeddedSummaryListItemCompact(answers)).toEqual('return')
    expect(utils.embeddedSummaryListItem).toHaveBeenCalledWith(answers, { class: 'govuk-summary-list--small-font' })
  })
})
