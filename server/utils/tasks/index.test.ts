import { groupByAllocation, taskSummary, userQualificationsSelectOptions } from '.'
import { FullPerson } from '../../@types/shared'
import { applicationFactory, taskFactory, userFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getApplicationType } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import paths from '../../paths/apply'
import placementApplicationTask from '../../testutils/factories/placementApplicationTask'

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

  describe('taskSummary', () => {
    const task = taskFactory.build()
    const application = applicationFactory.build({ person: fullPersonFactory.build() })

    describe('when the application contains an arrival date', () => {
      beforeEach(() => {
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
      })

      it('returns the summary list when the assessment has a staff member allocated', () => {
        expect(taskSummary(task, application)).toEqual([
          {
            key: {
              text: 'Name',
            },
            value: {
              text: (application.person as FullPerson).name,
            },
          },
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
            actions: {
              items: [
                {
                  href: `${paths.applications.show({ id: application.id })}?tab=timeline`,
                  text: 'View timeline',
                },
              ],
            },
          },
          {
            key: {
              text: 'AP Area',
            },
            value: {
              text: application.apArea.name,
            },
          },
          {
            key: {
              text: 'Currently allocated to',
            },
            value: {
              text: task.allocatedToStaffMember.name,
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
        expect(taskSummary(task, application)).toEqual([
          {
            key: {
              text: 'Name',
            },
            value: {
              text: (application.person as FullPerson).name,
            },
          },
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
            actions: {
              items: [
                {
                  href: `${paths.applications.show({ id: application.id })}?tab=timeline`,
                  text: 'View timeline',
                },
              ],
            },
          },
          {
            key: {
              text: 'AP Area',
            },
            value: {
              text: application.apArea.name,
            },
          },
          {
            key: {
              text: 'Currently allocated to',
            },
            value: {
              text: task.allocatedToStaffMember.name,
            },
          },
        ])
      })
    })
    describe('when taskType is placementApplication, arrival date should be derived from placementDates', () => {
      const placementApplication = placementApplicationTask.build()

      it('returns the summary list when the assessment has a staff member allocated', () => {
        expect(taskSummary(placementApplication, application)).toEqual([
          {
            key: {
              text: 'Name',
            },
            value: {
              text: (application.person as FullPerson).name,
            },
          },
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
              text: DateFormats.isoDateToUIDate(placementApplication.placementDates[0].expectedArrival),
            },
          },
          {
            key: {
              text: 'Application Type',
            },
            value: {
              text: getApplicationType(application),
            },
            actions: {
              items: [
                {
                  href: `${paths.applications.show({ id: application.id })}?tab=timeline`,
                  text: 'View timeline',
                },
              ],
            },
          },
          {
            key: {
              text: 'AP Area',
            },
            value: {
              text: application.apArea.name,
            },
          },
          {
            key: {
              text: 'Currently allocated to',
            },
            value: {
              text: placementApplication.allocatedToStaffMember.name,
            },
          },
        ])
      })
    })
  })

  describe('userQualificationsSelectOptions', () => {
    it('should return select options for tiers with the all tiers option selected by default', () => {
      expect(userQualificationsSelectOptions(null)).toEqual([
        { selected: true, text: 'All qualifications', value: '' },
        { selected: false, text: "Women's APs", value: 'womens' },
        { selected: false, text: 'Emergency APs', value: 'emergency' },
        { selected: false, text: 'ESAP', value: 'esap' },
        { selected: false, text: 'PIPE', value: 'pipe' },
        { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
        { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
      ])
    })

    it('should return the selected status if provided', () => {
      expect(userQualificationsSelectOptions('womens')).toEqual([
        { selected: false, text: 'All qualifications', value: '' },
        { selected: true, text: "Women's APs", value: 'womens' },
        { selected: false, text: 'Emergency APs', value: 'emergency' },
        { selected: false, text: 'ESAP', value: 'esap' },
        { selected: false, text: 'PIPE', value: 'pipe' },
        { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
        { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
      ])
    })
  })
})
