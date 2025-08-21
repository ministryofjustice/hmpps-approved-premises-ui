import nunjucks from 'nunjucks'
import { NamedId } from '@approved-premises/api'
import { AppealFormData } from '@approved-premises/ui'
import { addDays } from 'date-fns'
import { appealSessionDataFactory } from '../../testutils/factories'
import {
  getAppealReasonText,
  getConfirmationSummary,
  validateNewAppealResponse,
  getConditionalHtml,
  mapChangeRequestReasonsToRadios,
  getChangeRequestReasonId,
} from './changeRequests'
import { summaryListItem } from '../formUtils'
import { DateFormats } from '../dateUtils'
import { ValidationError } from '../errors'

const appealReasons: Array<NamedId> = [
  { name: 'staffConflictOfInterest', id: 'id1' },
  { name: 'exclusionZoneOrProximityToVictim', id: 'id2' },
]

describe('changeRequest utilities', () => {
  describe('getConditionalHtml', () => {
    it('renders html for a conditional text area', () => {
      const renderedHtml = '<p>Test</p>'
      jest.spyOn(nunjucks, 'render').mockImplementation(() => renderedHtml)
      const result = getConditionalHtml('controlName', 'This is the label', { controlName: 'This is the content' })
      expect(result).toEqual(renderedHtml)
      expect(nunjucks.render).toHaveBeenCalledWith('partials/detailsTextarea.njk', {
        conditionalQuestion: 'This is the label',
        name: 'controlName',
        value: 'This is the content',
      })
    })
  })

  describe('mapAppealReasonsToRadios', () => {
    it('returns a set of known appeal reason radio buttons with conditional textareas', () => {
      const conditional = 'conditional'
      const conditionalRenderSpy = jest.spyOn(nunjucks, 'render').mockImplementation(() => conditional)
      const unknownAppealReasons = [{ name: 'unknownReason', id: 'unknown1' }]
      const result = mapChangeRequestReasonsToRadios(
        [...appealReasons, ...unknownAppealReasons],
        'appealReason',
        {
          appealReason: 'staffConflictOfInterest',
        },
        'Default conditional question',
      )
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
        {
          checked: false,
          conditional: {
            html: conditional,
          },
          text: 'Unknown reason',
          value: 'unknownReason',
        },
      ])

      expect(conditionalRenderSpy).toHaveBeenCalledWith(
        'partials/detailsTextarea.njk',
        expect.objectContaining({ conditionalQuestion: 'Default conditional question' }),
      )
    })
  })

  describe('getAppealReasonId', () => {
    it('returns a reasonId for the API, given the reason code', () => {
      expect(getChangeRequestReasonId('staffConflictOfInterest', appealReasons)).toEqual('id1')
      expect(getChangeRequestReasonId('exclusionZoneOrProximityToVictim', appealReasons)).toEqual('id2')
      expect(getChangeRequestReasonId('doesNotExist', appealReasons)).toEqual(undefined)
    })
  })

  describe('getAppealReasonText', () => {
    const reasonDetails = 'More details\nfor the reason'
    it('returns a reasonId for the API, given the reason code', () => {
      expect(
        getAppealReasonText({
          appealReason: 'exclusionZoneOrProximityToVictim',
          exclusionZoneOrProximityToVictimDetail: reasonDetails,
        } as AppealFormData & { exclusionZoneOrProximityToVictimDetail: string }),
      ).toEqual(`Exclusion zone or proximity to victim\n\n${reasonDetails}`)
    })
  })

  describe('validateNewAppealResponse', () => {
    const sessionData = appealSessionDataFactory.build()
    const tomorrow = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))

    it('should not throw if input valid', () => {
      expect(validateNewAppealResponse(sessionData)).toBeUndefined()
    })

    it.each([
      [
        'no area manager supplied',
        { areaManagerName: undefined },
        { areaManagerName: 'You must provide the name of the approving area manager' },
      ],
      [
        'no area manager email supplied',
        { areaManagerEmail: undefined },
        { areaManagerEmail: 'You must provide the email address of the approving area manager' },
      ],
      [
        'no approval date supplied',
        { 'approvalDate-day': undefined },
        { approvalDate: 'You must enter the date of the approval' },
      ],
      [
        'invalid approval date',
        { 'approvalDate-day': '30', 'approvalDate-month': '02', 'approvalDate-year': '2025' },
        { approvalDate: 'You must enter a valid approval date' },
      ],
      [
        'approval date in the future',
        { ...DateFormats.isoDateToDateInputs(tomorrow, 'approvalDate') },
        { approvalDate: 'The approval date must be today or in the past' },
      ],
      ['no appeal reason', { appealReason: undefined }, { appealReason: 'You must select a reason for the appeal' }],
      [
        'no appeal reason details',
        { [`${sessionData.appealReason}Detail`]: undefined },
        { [`${sessionData.appealReason}Detail`]: 'You must enter more details' },
      ],
    ])('should throw if %s', (_, override, expected) => {
      let error
      try {
        validateNewAppealResponse({ ...sessionData, ...override })
      } catch (e) {
        error = e
      }
      expect(error).toEqual(new ValidationError({}))
      expect(error.data).toEqual(expected)
    })
  })

  describe('getConfirmationSummary', () => {
    it('should generate an appeal summary list', () => {
      const sessionData = appealSessionDataFactory.build()
      expect(getConfirmationSummary(sessionData)).toEqual([
        summaryListItem('Name of area manager', sessionData.areaManagerName),
        summaryListItem('Email address', sessionData.areaManagerEmail),
        summaryListItem('Date they approved', sessionData.approvalDate, 'date'),
        summaryListItem('Reason for appeal', getAppealReasonText(sessionData), 'textBlock'),
        summaryListItem('Any other information', sessionData.notes, 'textBlock'),
      ])
    })
  })
})
