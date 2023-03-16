import { applicationSummary, groupByAllocation } from '.'
import applicationFactory from '../../testutils/factories/application'
import taskFactory from '../../testutils/factories/task'
import userFactory from '../../testutils/factories/user'
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
            text: DateFormats.isoDateToUIDate(arrivalDateFromApplication(application)),
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
