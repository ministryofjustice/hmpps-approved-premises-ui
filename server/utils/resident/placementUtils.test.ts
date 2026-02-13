import { render } from 'nunjucks'
import {
  applicationFactory,
  assessmentFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingShortSummaryFactory,
} from '../../testutils/factories'
import { applicationCardList, applicationDocumentAccordion, assessmentCard, placementCard } from './placementUtils'
import { DateFormats } from '../dateUtils'
import assessPaths from '../../paths/assess'
import { linkTo } from '../utils'

jest.mock('nunjucks')

describe('placementUtils', () => {
  describe('application utils', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
    })

    describe('applicationDocumentAccordion', () => {
      const application = applicationFactory.build()

      const expectedItem = (title: string, template = 'cardList.njk') => ({
        content: { html: `Nunjucks template manage/resident/partials/${template}` },
        heading: { text: title },
      })

      beforeEach(() => {
        jest.resetAllMocks()
        ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
      })

      it('should render the application document as a card accordion', () => {
        expect(applicationDocumentAccordion(application)).toEqual({
          id: 'applicationAccordion',
          rememberExpanded: false,
          items: [
            expectedItem('Person details', 'personDetails.njk'),
            expectedItem('Type of AP required'),
            expectedItem('Risk and need factors'),
            expectedItem('Considerations for when the placement ends'),
            expectedItem('Add documents'),
          ],
        })

        expect((render as jest.Mock).mock.calls[1][1]).toEqual({
          cardList: [
            {
              card: {
                attributes: { 'data-cy-section': 'basic-information' },
                title: { headingLevel: 2, text: 'Basic Information' },
              },
              rows: [],
            },
            {
              card: {
                attributes: { 'data-cy-section': 'type-of-ap' },
                title: { headingLevel: 2, text: 'Type of AP required' },
              },
              rows: [],
            },
          ],
        })
        expect((render as jest.Mock).mock.calls[4][1]).toEqual({
          cardList: [
            {
              card: {
                attributes: { 'data-cy-section': 'attach-required-documents' },
                title: { headingLevel: 2, text: 'Attach required documents' },
              },
              rows: [],
            },
          ],
        })
      })

      it('should render the alert and metadata cards', () => {
        expect(applicationCardList(application)).toEqual([
          { html: 'Nunjucks template manage/resident/partials/alert.njk' },
          { html: 'Nunjucks template partials/insetText.njk' },
        ])

        expect((render as jest.Mock).mock.calls[0]).toEqual([
          'manage/resident/partials/alert.njk',
          {
            html: 'Check this profile for the most up-to-date information for this resident.',
            title: 'This application may not show the latest resident information',
            variant: 'information',
          },
        ])
        expect((render as jest.Mock).mock.calls[1]).toEqual([
          'partials/insetText.njk',
          {
            html: `Application submitted by ${application.applicantUserDetails.name} on ${DateFormats.isoDateToUIDate(application.submittedAt)}`,
          },
        ])
      })
    })

    describe('assessmentLink inset', () => {
      it('should generate inset assessment link section', () => {
        const assessment = assessmentFactory.build()
        const expectedLink = linkTo(assessPaths.assessments.show({ id: assessment.id }), { text: 'View assessment' })

        assessmentCard(assessment)

        expect((render as jest.Mock).mock.calls[0]).toEqual([
          'partials/insetText.njk',
          {
            html: `Application assessed by ${assessment.allocatedToStaffMember.name} on ${DateFormats.isoDateToUIDate(assessment.submittedAt)}<p class="govuk-!-margin-top-4">${expectedLink}</p>`,
          },
        ])
      })
    })
  })

  describe('placementCard', () => {
    const getFieldLabels = (card: ReturnType<typeof placementCard>) =>
      card.rows.filter(Boolean).map(f => (f.key as { text: string }).text)

    const commonFields = [
      'Approved Premises',
      'Date of booking',
      'Key worker',
      'AP type',
      'AP requirements',
      'Room requirements',
      'Delius event number',
    ]

    it('should show expected dates for upcoming placement', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.upcoming().build()
      const fieldLabels = getFieldLabels(placementCard(placement))

      expect(fieldLabels).toContain('Expected arrival date')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).not.toContain('Arrival date')
      expect(fieldLabels).not.toContain('Departure date')
      commonFields.forEach(field => expect(fieldLabels).toContain(field))
    })

    it('should show arrival date when arrived', () => {
      const placement = cas1SpaceBookingFactory.current().build()
      const fieldLabels = getFieldLabels(placementCard(placement))

      expect(fieldLabels).toContain('Actual arrival date')
      expect(fieldLabels).toContain('Arrival time')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).not.toContain('Expected arrival date')
      commonFields.forEach(field => expect(fieldLabels).toContain(field))
    })

    it('should show non-arrival reason for notArrived placement', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.nonArrival().build()
      const fieldLabels = getFieldLabels(placementCard(placement))

      expect(fieldLabels).toContain('Non-arrival reason')
      commonFields.forEach(field => expect(fieldLabels).toContain(field))
    })

    it('should show departure details for departed placement', () => {
      const placement = cas1SpaceBookingFactory.departed().build()
      const fieldLabels = getFieldLabels(placementCard(placement))

      expect(fieldLabels).toContain('Actual arrival date')
      expect(fieldLabels).toContain('Actual departure date')
      expect(fieldLabels).toContain('Departure time')
      expect(fieldLabels).toContain('Departure reason')
      expect(fieldLabels).toContain('Move on')
      expect(fieldLabels).not.toContain('Expected arrival date')
      expect(fieldLabels).not.toContain('Expected departure date')
      commonFields.forEach(field => expect(fieldLabels).toContain(field))
    })

    it('should show cancellation details for cancelled placement', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.cancelled().build()
      const fieldLabels = getFieldLabels(placementCard(placement))

      expect(fieldLabels).toContain('Cancellation date')
      commonFields.forEach(field => expect(fieldLabels).toContain(field))
    })
  })
})
