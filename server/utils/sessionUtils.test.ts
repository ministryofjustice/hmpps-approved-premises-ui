import { AppointmentSummaryDto, OffenderFullDto, ProjectAllocationsDto } from '../@types/shared'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './hmtlUtils'
import SessionUtils from './sessionUtils'
import { createQueryString } from './utils'

describe('SessionUtils', () => {
  const fakeLink = '<a>link</a>'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('sessionResultTableRows', () => {
    const fakeFormattedDate = '20 January 2026'
    const fakeFormattedTime = '12:00'
    const fakeElement = '<div>project</div>'

    beforeEach(() => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(fakeFormattedDate)
      jest.spyOn(DateTimeFormats, 'stripTime').mockReturnValue(fakeFormattedTime)
      jest.spyOn(HtmlUtils, 'getElementWithContent').mockReturnValue(fakeElement)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
    })

    it('returns session results formatted into expected table rows', () => {
      const allocation = {
        id: 1001,
        projectId: 3,
        date: '2025-09-07',
        projectName: 'project-name',
        projectCode: 'prj',
        startTime: '09:00',
        endTime: '17:00',
        numberOfOffendersAllocated: 5,
        numberOfOffendersWithOutcomes: 3,
        numberOfOffendersWithEA: 1,
      }

      const sessions: ProjectAllocationsDto = {
        allocations: [allocation],
      }

      const result = SessionUtils.sessionResultTableRows(sessions)

      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        allocation.projectName,
        `${paths.sessions.show({ id: allocation.projectId.toString() })}?${createQueryString({ date: allocation.date })}`,
      )

      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(1, fakeLink)
      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(2, allocation.projectCode)

      expect(result).toEqual([
        [
          { html: fakeElement + fakeElement },
          { text: fakeFormattedDate },
          { text: fakeFormattedTime },
          { text: fakeFormattedTime },
          { text: allocation.numberOfOffendersAllocated },
          { text: allocation.numberOfOffendersWithOutcomes },
          { text: allocation.numberOfOffendersWithEA },
        ],
      ])
    })
  })

  describe('sessionListTableRows', () => {
    it('returns session formatted into expected table rows', () => {
      const mockTag = '<strong>Status</strong>'
      const mockHiddenText = '<span></span>'
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(mockTag)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
      jest.spyOn(DateTimeFormats, 'minutesToHoursAndMinutes').mockReturnValue('1:00')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        objectType: 'Full',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 60,
        },
      ]

      const result = SessionUtils.sessionListTableRows(appointments)

      expect(HtmlUtils.getHiddenText).toHaveBeenCalledWith(`${offender.forename} ${offender.surname}`)
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        `Update ${mockHiddenText}`,
        paths.appointments.update({ appointmentId: '1' }),
      )

      expect(result).toEqual([
        [
          { text: 'Sam Smith' },
          { text: 'CRN123' },
          { text: '1:00' },
          { text: '1:00' },
          { text: '1:00' },
          { html: mockTag },
          { html: fakeLink },
        ],
      ])
    })

    it('calculates and formats times completed', () => {
      jest.spyOn(DateTimeFormats, 'minutesToHoursAndMinutes').mockReturnValue('1:00')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        objectType: 'Full',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 90,
        },
      ]

      const result = SessionUtils.sessionListTableRows(appointments)

      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(1, 120)
      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(2, 90)
      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(3, 30)

      const row = result[0]
      expect(row[2]).toEqual({ text: '1:00' })
      expect(row[3]).toEqual({ text: '1:00' })
      expect(row[4]).toEqual({ text: '1:00' })
    })
  })
})
