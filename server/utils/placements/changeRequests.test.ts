import nunjucks from 'nunjucks'
import { NamedId } from '@approved-premises/api'
import { AppealSessionData } from '@approved-premises/ui'
import { appealSessionDataFactory } from '../../testutils/factories'
import {
  getAppealReasonText,
  getConfirmationSummary,
  validateNewAppealResponse,
  getConditionalHtml,
  mapAppealReasonsToRadios,
  getAppealReasonId,
} from './changeRequests'
import { summaryListItem } from '../formUtils'
import { DateFormats } from '../dateUtils'
import { ValidationError } from '../errors'

const appealReasons: Array<NamedId> = [
  { name: 'staffConflictOfInterest', id: 'id1' },
  { name: 'exclusionZoneOrProximityToVictim', id: 'id2' },
]

describe('changeRequestUtils', () => {
  describe('getConditionalHtml', () => {
    it('renders html for a conditional text area', () => {
      const renderedHtml = '<p>Test</p>'
      jest.spyOn(nunjucks, 'render').mockImplementation(() => renderedHtml)
      const result = getConditionalHtml('controlName', 'This is the label', { controlName: 'This is the content' })
      expect(result).toEqual(renderedHtml)
      expect(jest.spyOn(nunjucks, 'render')).toHaveBeenCalledWith(
        'manage/premises/placements/changeRequests/detailsTextarea.njk',
        { conditionalQuestion: 'This is the label', name: 'controlName', value: 'This is the content' },
      )
    })
  })

  describe('mapAppealReasonsToRadios', () => {
    it('returns a set of appeal reason radio buttons with conditional textareas', () => {
      const conditional = 'conditional'
      jest.spyOn(nunjucks, 'render').mockImplementation(() => conditional)

      const result = mapAppealReasonsToRadios(appealReasons, { appealReason: 'staffConflictOfInterest' })
      expect(result).toEqual([
        {
          checked: true,
          conditional: { html: conditional },
          text: 'Staff conflict of interest',
          value: 'staffConflictOfInterest',
        },
        {
          checked: false,
          conditional: {
            html: conditional,
          },
          text: 'Exclusion zone or proximity to victim',
          value: 'exclusionZoneOrProximityToVictim',
        },
      ])
    })
  })

  describe('getAppealReasonId', () => {
    it('returns a reasonId for the API, given the reason code', () => {
      expect(getAppealReasonId('staffConflictOfInterest', appealReasons)).toEqual('id1')
      expect(getAppealReasonId('exclusionZoneOrProximityToVictim', appealReasons)).toEqual('id2')
      expect(getAppealReasonId('doesNotExist', appealReasons)).toEqual(undefined)
    })
  })

  describe('getAppealReasonText', () => {
    const reasonDetails = 'More details\nfor the reason'
    it('returns a reasonId for the API, given the reason code', () => {
      expect(
        getAppealReasonText({
          appealReason: 'exclusionZoneOrProximityToVictim',
          exclusionZoneOrProximityToVictimDetail: reasonDetails,
        } as AppealSessionData & { exclusionZoneOrProximityToVictimDetail: string }),
      ).toEqual(`Exclusion zone or proximity to victim\n\n${reasonDetails}`)
    })
  })

  describe('validateNewAppealResponse', () => {
    it('should not throw if input valid', () => {
      const sessionData = appealSessionDataFactory.build()
      expect(validateNewAppealResponse(sessionData)).toBeUndefined()
    })
    it('should throw if input invalid', () => {
      const sessionData = appealSessionDataFactory.build()
      expect(() => {
        validateNewAppealResponse({ ...sessionData, areaManagerName: null })
      }).toThrow(new ValidationError({}))
    })
  })

  describe('getConfirmationSummary', () => {
    it('should generate an appeal summary list', () => {
      const sessionData = appealSessionDataFactory.build()
      expect(getConfirmationSummary(sessionData)).toEqual([
        summaryListItem('Name of area manager', sessionData.areaManagerName),
        summaryListItem('Email address', sessionData.areaManagerEmail),
        summaryListItem('Date they approved', DateFormats.isoDateToUIDate(sessionData.approvalDate)),
        summaryListItem('Reason for appeal', getAppealReasonText(sessionData), 'textBlock'),
        summaryListItem('Any other information', sessionData.notes, 'textBlock'),
      ])
    })
  })
})
