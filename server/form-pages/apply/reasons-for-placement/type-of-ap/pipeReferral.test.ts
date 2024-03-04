import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import PipeReferral from './pipeReferral'

describe('PipeReferral', () => {
  describe('body', () => {
    it('should set the body correctly', () => {
      const page = new PipeReferral({
        opdPathway: 'yes',
        'opdPathwayDate-year': '2022',
        'opdPathwayDate-month': '3',
        'opdPathwayDate-day': '3',
      })

      expect(page.body).toEqual({
        opdPathway: 'yes',
        'opdPathwayDate-year': '2022',
        'opdPathwayDate-month': '3',
        'opdPathwayDate-day': '3',
        opdPathwayDate: '2022-03-03',
      })
    })
  })

  itShouldHaveNextValue(new PipeReferral({}), 'pipe-opd-screening')

  itShouldHavePreviousValue(new PipeReferral({}), 'ap-type')

  describe('errors', () => {
    describe('if opdPathway is yes', () => {
      it('should return an empty object if the date is specified', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
          'opdPathwayDate-year': '2022',
          'opdPathwayDate-month': '3',
          'opdPathwayDate-day': '3',
        })
        expect(page.errors()).toEqual({})
      })

      it('should return an error if  the date is not populated', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
        })
        expect(page.errors()).toEqual({ opdPathwayDate: 'You must enter an OPD Pathway date' })
      })

      it('should return an error if the date is invalid', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
          'opdPathwayDate-year': '99',
          'opdPathwayDate-month': '99',
          'opdPathwayDate-day': '99',
        })
        expect(page.errors()).toEqual({ opdPathwayDate: 'The OPD Pathway date is an invalid date' })
      })
    })

    it('should return an empty object if opdPathway in no', () => {
      const page = new PipeReferral({
        opdPathway: 'no',
      })
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the opdPathway field is not populated', () => {
      const page = new PipeReferral({})
      expect(page.errors()).toEqual({
        opdPathway: 'You must specify if the person has been screened into the OPD pathway',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when opdPathway is "no"', () => {
      const page = new PipeReferral({
        opdPathway: 'no',
      })

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when opdPathway is "yes"', () => {
      const body = {
        opdPathway: 'yes' as const,
        'opdPathwayDate-year': '2022',
        'opdPathwayDate-month': '11',
        'opdPathwayDate-day': '11',
      }
      const page = new PipeReferral(body)

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        "When was the person's last consultation or formulation?": DateFormats.dateAndTimeInputsToUiDate(
          body,
          'opdPathwayDate',
        ),
      })
    })
  })
})
