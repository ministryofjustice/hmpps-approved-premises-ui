import { mapSearchParamCharacteristicsForUi } from './mapSearchParamCharacteristicsForUi'

describe('mapSearchParamCharacteristicsForUi', () => {
  it('it returns the search results characteristics names in a list', () => {
    expect(mapSearchParamCharacteristicsForUi(['isPIPE'])).toEqual(
      '<ul class="govuk-list"><li>Psychologically Informed Planned Environment (PIPE)</li></ul>',
    )
  })
})
