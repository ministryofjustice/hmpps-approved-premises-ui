import { groupByAllocation, taskSummary, userQualificationsSelectOptions } from '.'
import { type ApprovedPremisesApplication, Task } from '../../@types/shared'
import { applicationFactory, placementDatesFactory, taskFactory, userFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getApplicationType } from '../applications/utils'
import paths from '../../paths/apply'
import placementApplicationTask from '../../testutils/factories/placementApplicationTask'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'
import { displayName } from '../personUtils'

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
    let task: Task
    let application: ApprovedPremisesApplication

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(null)

      application = applicationFactory.build({
        person: fullPersonFactory.build(),
        isWomensApplication: false,
        applicantUserDetails: undefined,
        caseManagerUserDetails: undefined,
      })
      task = taskFactory.build({
        probationDeliveryUnit: undefined,
        allocatedToStaffMember: undefined,
      })
    })

    describe('when the application and task have minimal details', () => {
      it('renders a minimal summary list with defaults', () => {
        expect(taskSummary(task, application)).toEqual([
          {
            key: { text: 'Name' },
            value: { text: displayName(application.person) },
          },
          {
            key: { text: 'CRN' },
            value: { text: application.person.crn },
          },
          {
            key: { text: 'Arrival date' },
            value: { text: 'Not provided' },
          },
          {
            key: { text: 'Application type' },
            value: { text: getApplicationType(application) },
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
            key: { text: 'AP area' },
            value: { text: application.apArea.name },
          },
          {
            key: { text: 'Currently allocated to' },
            value: { text: 'Unallocated' },
          },
          {
            key: { text: 'AP gender' },
            value: { text: 'Men' },
          },
        ])
      })

      it('indicates if the person is a Limited access offender', () => {
        const laoPerson = fullPersonFactory.build({ isRestricted: true })
        const laoApplication = { ...application, person: laoPerson }

        expect(taskSummary(task, laoApplication)[0].value).toEqual({
          text: `${laoPerson.name} (Limited access offender)`,
        })
      })
    })

    describe("when the application is for the Women's Estate", () => {
      beforeEach(() => {
        application.isWomensApplication = true
      })

      it('renders the AP gender accordingly', () => {
        expect(taskSummary(task, application)).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'AP gender' },
              value: { text: 'Women' },
            },
          ]),
        )
      })
    })

    describe('when the application contains an arrival date', () => {
      beforeEach(() => {
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
      })

      it('renders the arrival date', () => {
        expect(taskSummary(task, application)).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Arrival date' },
              value: { text: 'Sat 1 Jan 2022' },
            },
          ]),
        )
      })
    })

    describe('when the application has an applicant', () => {
      const applicant = applicationUserDetailsFactory.build()

      beforeEach(() => {
        application.applicantUserDetails = applicant
      })

      it('renders the applicant details', () => {
        expect(taskSummary(task, application)).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Applicant' },
              value: { text: `${applicant.name} (${applicant.email})` },
            },
          ]),
        )
      })
    })

    describe('when there is a case manager that is not the applicant', () => {
      const caseManager = applicationUserDetailsFactory.build()

      beforeEach(() => {
        application.caseManagerUserDetails = caseManager
        application.caseManagerIsNotApplicant = true
      })

      it('renders the case manager details', () => {
        expect(taskSummary(task, application)).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Case manager' },
              value: { text: `${caseManager.name} (${caseManager.email})` },
            },
          ]),
        )
      })
    })

    describe('when taskType is placementApplication with a PDU', () => {
      const placementApplication = placementApplicationTask.build({
        placementDates: [
          placementDatesFactory.build({ expectedArrival: '2023-05-08' }),
          placementDatesFactory.build({ expectedArrival: '2023-06-12' }),
        ],
        probationDeliveryUnit: { id: '1', name: 'test' },
      })

      it('renders Arrival date based on first placement date and PDU', () => {
        expect(taskSummary(placementApplication, application)).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Arrival date' },
              value: { text: 'Mon 8 May 2023' },
            },
            {
              key: { text: 'Applicant PDU' },
              value: { text: 'test' },
            },
          ]),
        )
      })
    })
  })

  describe('userQualificationsSelectOptions', () => {
    it('should return select options for tiers with the all tiers option selected by default', () => {
      expect(userQualificationsSelectOptions(null)).toEqual([
        { selected: true, text: 'All qualifications', value: '' },
        { selected: false, text: 'Emergency APs', value: 'emergency' },
        { selected: false, text: 'ESAP', value: 'esap' },
        { selected: false, text: 'PIPE', value: 'pipe' },
        { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
        { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
      ])
    })

    it('should return the selected status if provided', () => {
      expect(userQualificationsSelectOptions('emergency')).toEqual([
        { selected: false, text: 'All qualifications', value: '' },
        { selected: true, text: 'Emergency APs', value: 'emergency' },
        { selected: false, text: 'ESAP', value: 'esap' },
        { selected: false, text: 'PIPE', value: 'pipe' },
        { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
        { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
      ])
    })
  })
})
