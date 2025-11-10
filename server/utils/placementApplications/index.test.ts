import { faker } from '@faker-js/faker'
import { placementApplicationFactory } from '../../testutils/factories'
import { getSentenceType } from '.'
import { standardDeterminateReleaseTypes } from '../applications/releaseTypeUtils'

describe('getSentenceType', () => {
  const dataUpdated = {
    'sentence-type-check': {
      sentenceTypeCheck: 'yes',
      applicationSentenceType: 'standardDeterminate',
      applicationReleaseType: 'licence',
    },
  }

  const wrap = (data: Record<string, unknown>) => ({
    'request-a-placement': data,
  })

  const placementApplication = placementApplicationFactory.build()
  it('should return the sentence type from the application', () => {
    const localData = {
      'sentence-type-check': {
        sentenceTypeCheck: 'no',
        applicationSentenceType: 'standardDeterminate',
        applicationReleaseType: 'licence',
      },
    }
    expect(getSentenceType({ ...placementApplication, data: wrap(localData) })).toEqual({
      releaseType: 'licence',
      sentenceType: 'standardDeterminate',
      sentenceTypeCheck: 'no',
    })
  })

  it.each([['standardDeterminate'], ['life'], ['ipp'], ['extendedDeterminate']])(
    'should return the selected release type and situation for sentence type %s',
    sentenceType => {
      const releaseType = faker.helpers.arrayElement(Object.keys(standardDeterminateReleaseTypes))
      const localData = {
        ...dataUpdated,
        'sentence-type': {
          sentenceType,
        },
        'release-type': {
          releaseType,
        },
      }
      expect(getSentenceType({ ...placementApplication, data: wrap(localData) })).toEqual({
        sentenceType,
        releaseType,
        sentenceTypeCheck: 'yes',
      })
    },
  )

  it.each([['communityOrder'], ['bailPlacement']])(
    'should return the default release type and situation for sentence type: %s',
    sentenceType => {
      const localData = {
        ...dataUpdated,
        'sentence-type': {
          sentenceType,
        },
        situation: {
          situation: 'bailAssessment',
        },
      }
      expect(getSentenceType({ ...placementApplication, data: wrap(localData) })).toEqual({
        sentenceType,
        releaseType: 'in_community',
        situation: 'bailAssessment',
        sentenceTypeCheck: 'yes',
      })
    },
  )

  it.each([['nonStatutory']])('should return the default release type for sentence type: %s', sentenceType => {
    const localData = {
      ...dataUpdated,
      'sentence-type': {
        sentenceType,
      },
    }
    expect(getSentenceType({ ...placementApplication, data: wrap(localData) })).toEqual({
      sentenceType,
      releaseType: 'not_applicable',
      sentenceTypeCheck: 'yes',
    })
  })
})
