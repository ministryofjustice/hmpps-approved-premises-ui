import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import PipeReferral from './pipeReferral'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('PipeReferral', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    it('shold add the name of the person', () => {
      const page = new PipeReferral({}, application)

      expect(page.title).toEqual('Has John Wayne been screened into the Offender Personality Disorder Pathway (OPD)?')
    })
  })

  describe('body', () => {
    it('should set the body correctly', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'yes',
          'opdPathwayDate-year': '2022',
          'opdPathwayDate-month': '3',
          'opdPathwayDate-day': '3',
        },
        application,
      )

      expect(page.body).toEqual({
        opdPathway: 'yes',
        'opdPathwayDate-year': '2022',
        'opdPathwayDate-month': '3',
        'opdPathwayDate-day': '3',
        opdPathwayDate: '2022-03-03',
      })
    })
  })

  itShouldHaveNextValue(new PipeReferral({}, application), 'pipe-opd-screening')

  itShouldHavePreviousValue(new PipeReferral({}, application), 'ap-type')

  describe('errors', () => {
    describe('if opdPathway is yes', () => {
      it('should return an empty object if the date is specified', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
            'opdPathwayDate-year': '2022',
            'opdPathwayDate-month': '3',
            'opdPathwayDate-day': '3',
          },
          application,
        )
        expect(page.errors()).toEqual({})
      })

      it('should return an error if  the date is not populated', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
          },
          application,
        )
        expect(page.errors()).toEqual({ opdPathwayDate: 'You must enter an OPD Pathway date' })
      })

      it('should return an error if the date is invalid', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
            'opdPathwayDate-year': '99',
            'opdPathwayDate-month': '99',
            'opdPathwayDate-day': '99',
          },
          application,
        )
        expect(page.errors()).toEqual({ opdPathwayDate: 'The OPD Pathway date is an invalid date' })
      })
    })

    it('should return an empty object if opdPathway in no', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'no',
        },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the opdPathway field is not populated', () => {
      const page = new PipeReferral({}, application)
      expect(page.errors()).toEqual({
        opdPathway: 'You must specify if John Wayne has been screened into the OPD pathway',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when opdPathway is "no"', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'no',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when opdPathway is "yes"', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'yes',
          'opdPathwayDate-year': '2022',
          'opdPathwayDate-month': '11',
          'opdPathwayDate-day': '11',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        "When was John Wayne's last consultation or formulation?": 'Friday 11 November 2022',
      })
    })
  })
})
