import { HtmlItem, SummaryListItem } from '../../@types/ui'
import { placementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import { preferredApsRow } from './preferredApsRow'

jest.mock('./getPreferredApsFromApplication')

describe('preferredApsRow', () => {
  const placementRequest = placementRequestDetailFactory.build()

  it('should return undefined if there are no preferred APs', () => {
    ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])

    expect(preferredApsRow(placementRequest)).toEqual(undefined)
  })

  it('should return a list of premises if there are preferred APs', () => {
    const premises = premisesFactory.buildList(4)
    ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue(premises)

    const row = preferredApsRow(placementRequest) as SummaryListItem

    expect(row.key).toEqual({ text: 'Preferred APs' })
    expect((row.value as HtmlItem).html).toMatchStringIgnoringWhitespace(`
      <ol class="govuk-list govuk-list--number">
        <li>${premises[0].name}</li>
        <li>${premises[1].name}</li>
        <li>${premises[2].name}</li>
        <li>${premises[3].name}</li>
      </ol>
      `)
  })
})
