import { applicationFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('getDefaultPlacementDurationInDays', () => {
  const application = applicationFactory.build()

  it.each([
    [12, 'normal'],
    [12, 'standard'],
    [12, 'mhapElliottHouse'],
    [12, 'mhapStJosephs'],
    [12, 'rfap'],
    [26, 'pipe'],
    [52, 'esap'],
  ])('returns %s weeks when the AP type is "%s"', (weeks, apType) => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce(apType)
    expect(getDefaultPlacementDurationInDays(application)).toEqual(weeks * 7)
  })

  it('returns null when the AP type is anything else', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('something else')
    expect(getDefaultPlacementDurationInDays(application)).toEqual(null)
  })
})
