import { placementApplicationFactory } from '../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import { itShouldHaveNextValue } from '../../shared-examples'

import UpdatesToApplication, { Body } from './updatesToApplication'

jest.mock('../../../utils/retrieveQuestionResponseFromFormArtifact')

const body: Body = {
  significantEvents: 'yes',
  significantEventsDetail: 'significant events detail',
  changedCirumstances: 'yes',
  changedCirumstancesDetail: 'changed circumstances detail',
  riskFactors: 'yes',
  riskFactorsDetail: 'risk factors detail',
  accessOrHealthcareNeeds: 'yes',
  accessOrHealthcareNeedsDetail: 'access or healthcare needs detail',
  locationFactors: 'yes',
  locationFactorsDetail: 'location factors detail',
}

describe('UpdatesToApplication', () => {
  const placementApplication = placementApplicationFactory.build()
  describe('title', () => {
    expect(new UpdatesToApplication({}, placementApplication).title).toBe('Updates to application')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new UpdatesToApplication(body, placementApplication)
      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new UpdatesToApplication({}, placementApplication), 'check-your-answers')

  describe('previous', () => {
    const reasonsAndPreviousPages = [
      { reason: 'rotl', previousPage: 'dates-of-placement' },
      { reason: 'additional_placement', previousPage: 'additional-placement-details' },
      { reason: 'release_following_decision', previousPage: 'additional-documents' },
    ]

    it.each(reasonsAndPreviousPages)('should return the correct previous page for %s', ({ reason, previousPage }) => {
      ;(
        retrieveQuestionResponseFromFormArtifact as jest.MockedFn<typeof retrieveQuestionResponseFromFormArtifact>
      ).mockReturnValue(reason)

      const page = new UpdatesToApplication(body, placementApplication)
      expect(page.previous()).toBe(previousPage)
    })
  })

  describe('errors', () => {
    it('if no response is given an error is returned for each missing response', () => {
      expect(new UpdatesToApplication({}, placementApplication).errors()).toEqual({
        accessOrHealthcareNeeds:
          "You must state if the person's access or healthcare needs changed since the application was assessed",
        changedCirumstances:
          "You must state if the person's circumstances changed which affect the planned AP placement?",
        locationFactors: "You must state if the person's location factors changed since the application was assessed",
        riskFactors: "You must state if the person's risk factors changed since the application was assessed",
        significantEvents:
          'You must state if there have been any significant events since the application was assessed',
      })
    })

    it('if detail isnt given an error is returned for each missing detail', () => {
      expect(
        new UpdatesToApplication(
          {
            ...body,
            significantEventsDetail: '',
            changedCirumstancesDetail: '',
            riskFactorsDetail: '',
            accessOrHealthcareNeedsDetail: '',
            locationFactorsDetail: '',
          },
          placementApplication,
        ).errors(),
      ).toEqual({
        accessOrHealthcareNeedsDetail: "You must provide details of the person's changed access or healthcare needs",
        changedCirumstancesDetail: 'You must provide details of the changed circumstances',
        locationFactorsDetail: 'You must provide details of any changed location factors',
        riskFactorsDetail: 'You must provide details of any changed risk factors',
        significantEventsDetail:
          'You must provide details of any significant events since the application was assessed',
      })
    })
  })

  describe('response', () => {
    it('should return the correct response object', () => {
      expect(new UpdatesToApplication(body, placementApplication).response()).toEqual({
        "Has the person's access or healthcare needs changed since the application was assessed?":
          'Yes - access or healthcare needs detail',
        "Has the person's circumstances changed which affect the planned AP placement?":
          'Yes - changed circumstances detail',
        "Has the person's location factors changed since the application was assessed?":
          'Yes - location factors detail',
        "Has the person's risk factors changed since the application was assessed?": 'Yes - risk factors detail',
        'Have there been any significant events since the application was assessed?': 'Yes - significant events detail',
      })
    })
  })
})
