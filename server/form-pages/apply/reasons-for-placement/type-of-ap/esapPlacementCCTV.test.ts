import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import * as formUtils from '../../../../utils/formUtils'

import EsapPlacementCCTV, { cctvHistory } from './esapPlacementCCTV'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => [] as Array<never>) }
})

describe('EsapPlacementCCTV', () => {
  const application = applicationFactory.build()

  itShouldHaveNextValue(new EsapPlacementCCTV({}, application), '')

  describe('previous', () => {
    describe('when the application has a previous response that includes `secreting`', () => {
      beforeEach(() => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['cctv', 'secreting'])
      })

      itShouldHavePreviousValue(new EsapPlacementCCTV({}, application), 'esap-placement-secreting')
    })

    describe('when the application has a previous response does not include `secreting`', () => {
      beforeEach(() => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['cctv'])
      })

      itShouldHavePreviousValue(new EsapPlacementCCTV({}, application), 'esap-placement-screening')
    })
  })

  describe('response', () => {
    it('should translate the response correctly', () => {
      const person = personFactory.build()
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: 'Some detail',
          cctvNotes: 'notes',
        },
        applicationFactory.build({ person }),
      )

      expect(page.response()).toEqual({
        'Which behaviours has the person demonstrated that require enhanced CCTV provision to monitor?':
          'Physically assaulted other people in prison',
        'Have partnership agencies requested the sharing of intelligence captured via enhanced CCTV?': 'Yes',
        'Provide details': 'Some detail',
        'Provide any supporting information about why the person requires enhanced CCTV provision': 'notes',
      })
    })
  })

  describe('errors', () => {
    beforeEach(() => {
      const person = personFactory.build()
      application.person = person
    })

    it('should return an empty object when `cctvHistory` and `cctvIntelligence` are defined', () => {
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: 'Some detail',
          cctvNotes: 'notes',
        },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    it('should return error messages when `cctvHistory` and `cctvIntelligence` are undefined', () => {
      const page = new EsapPlacementCCTV({}, application)
      expect(page.errors()).toEqual({
        cctvHistory:
          'You must specify which behaviours the person has demonstrated that require enhanced CCTV provision to monitor',
        cctvIntelligence:
          'You must specify if partnership agencies requested the sharing of intelligence captured via enhanced CCTV',
      })
    })

    it('should return an error message when `cctvHistory` is empty', () => {
      const page = new EsapPlacementCCTV({ cctvHistory: [], cctvIntelligence: 'no' }, application)
      expect(page.errors()).toEqual({
        cctvHistory:
          'You must specify which behaviours the person has demonstrated that require enhanced CCTV provision to monitor',
      })
    })

    it('should return an empty array when `cctvIntelligence` is yes and no details are given', () => {
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: '',
          cctvNotes: 'notes',
        },
        application,
      )
      expect(page.errors()).toEqual({
        cctvIntelligenceDetails:
          'You must specify the details if partnership agencies have requested the sharing of intelligence captured via enhanced CCTV',
      })
    })
  })

  describe('cctvHistoryItems', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      jest.spyOn(formUtils, 'flattenCheckboxInput').mockReturnValue(['prisonerAssualt'])
      jest.spyOn(formUtils, 'convertKeyValuePairToCheckBoxItems')

      const page = new EsapPlacementCCTV({ cctvHistory: ['prisonerAssualt'] }, application)
      page.cctvHistoryItems()

      expect(formUtils.convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(cctvHistory, page.body.cctvHistory)
    })
  })
})
