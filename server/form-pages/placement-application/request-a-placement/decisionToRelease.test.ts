import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue } from '../../shared'

import DecisionToRelease, { Body } from './decisionToRelease'
import { DateFormats } from '../../../utils/dateUtils'
import { placementApplicationFactory } from '../../../testutils/factories'
import * as artifactUtils from '../../../utils/retrieveQuestionResponseFromFormArtifact'

describe('DecisionToRelease', () => {
  const body = {
    informationFromDirectionToRelease: 'Some information',
    'decisionToReleaseDate-year': '2023',
    'decisionToReleaseDate-month': '12',
    'decisionToReleaseDate-day': '1',
  } as Body

  const placementApplicaton = placementApplicationFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new DecisionToRelease(body, placementApplicaton)

      expect(page.body).toEqual({
        'decisionToReleaseDate-year': '2023',
        'decisionToReleaseDate-month': '12',
        'decisionToReleaseDate-day': '1',
        decisionToReleaseDate: '2023-12-01',
        informationFromDirectionToRelease: 'Some information',
      })
    })
  })
  describe('previous', () => {
    it('previous - sentence type unchanged', () => {
      jest.spyOn(artifactUtils, 'retrieveQuestionResponseFromFormArtifact').mockReturnValue('no')
      expect(new DecisionToRelease(body, placementApplicaton).previous()).toEqual('sentence-type-check')
    })

    it('previous - sentence type changed', () => {
      jest.spyOn(artifactUtils, 'retrieveQuestionResponseFromFormArtifact').mockReturnValue('yes')
      expect(new DecisionToRelease(body, placementApplicaton).previous()).toEqual('release-type')
    })
  })

  itShouldHaveNextValue(new DecisionToRelease(body, placementApplicaton), 'additional-documents')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new DecisionToRelease(body, placementApplicaton)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if decisionToRelease is blank', () => {
      const page = new DecisionToRelease(fromPartial({}), placementApplicaton)
      expect(page.errors()).toEqual({
        decisionToReleaseDate: 'You must state the date of the decision to release',
        informationFromDirectionToRelease: 'You must state the relevant information from the direction to release',
      })
    })

    it('should return errors if the last decision to release date is invalid', () => {
      const page = new DecisionToRelease(
        {
          ...body,
          'decisionToReleaseDate-year': '99999',
          'decisionToReleaseDate-month': '99999',
          'decisionToReleaseDate-day': '199999',
        },
        placementApplicaton,
      )
      expect(page.errors()).toEqual({
        decisionToReleaseDate: 'The decision to release date is invalid',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DecisionToRelease(body, placementApplicaton)

      expect(page.response()).toEqual({
        'Enter the date of decision': DateFormats.dateAndTimeInputsToUiDate(body, 'decisionToReleaseDate'),
        'Provide relevant information from the direction to release that will impact the placement': 'Some information',
      })
    })
  })
})
