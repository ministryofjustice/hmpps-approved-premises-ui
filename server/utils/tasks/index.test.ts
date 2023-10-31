import { applicationSummary, groupByAllocation } from '.'
import { applicationFactory, taskFactory, userFactory } from '../../testutils/factories'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getApplicationType } from '../applications/utils'
import { DateFormats } from '../dateUtils'

jest.mock('../applications/arrivalDateFromApplication')

describe('index', () => {
  describe('groupByAllocation', () => {
    it('should return an object with allocated and unallocated tasks', () => {
      const allocatedTask = taskFactory.build({ allocatedToStaffMember: userFactory.build() })
      const unallocatedTask = taskFactory.build({ allocatedToStaffMember: undefined })
      const tasks = [allocatedTask, unallocatedTask]

      const result = groupByAllocation(tasks)

      expect(result.allocated).toEqual([allocatedTask])
      expect(result.unallocated).toEqual([unallocatedTask])
    })
  })

  describe('applicationSummary', () => {
    describe('when the application contains an arrival date', () => {
      beforeEach(() => {
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
      })

      it('returns the summary list when the assessment has a staff member allocated', () => {
        const application = applicationFactory.build()

        expect(applicationSummary(application)).toEqual([
          {
            key: {
              text: 'CRN',
            },
            value: {
              text: application.person.crn,
            },
          },
          {
            key: {
              text: 'Arrival date',
            },
            value: {
              text: DateFormats.isoDateToUIDate(arrivalDateFromApplication(application) as string),
            },
          },
          {
            key: {
              text: 'Application Type',
            },
            value: {
              text: getApplicationType(application),
            },
          },
        ])
      })
    })
    describe('when the application doesnt have an arrival date', () => {
      beforeEach(() => {
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(null)
      })

      it('returns the summary list when the assessment has a staff member allocated', () => {
        const application = applicationFactory.build()

        expect(applicationSummary(application)).toEqual([
          {
            key: {
              text: 'CRN',
            },
            value: {
              text: application.person.crn,
            },
          },
          {
            key: {
              text: 'Arrival date',
            },
            value: {
              text: 'Not provided',
            },
          },
          {
            key: {
              text: 'Application Type',
            },
            value: {
              text: getApplicationType(application),
            },
          },
        ])
      })
    })
  })
})
