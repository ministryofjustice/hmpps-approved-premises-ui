import { ProjectAllocationsDto, SessionDto } from '../@types/shared'
import SessionClient from '../data/sessionClient'
import SessionService from './sessionService'

jest.mock('../data/sessionClient')

describe('ProviderService', () => {
  const sessionClient = new SessionClient(null) as jest.Mocked<SessionClient>
  let sessionService: SessionService

  beforeEach(() => {
    sessionService = new SessionService(sessionClient)
  })

  it('should call getSessions on the api client and return its result', async () => {
    const sessions: ProjectAllocationsDto = {
      allocations: [
        {
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
        },
      ],
    }

    sessionClient.getSessions.mockResolvedValue(sessions)

    const result = await sessionService.getSessions({
      username: 'some-username',
      teamId: 1,
      startDate: '2025-09-01',
      endDate: '2025-09-02',
    })

    expect(sessionClient.getSessions).toHaveBeenCalledTimes(1)
    expect(result).toEqual(sessions)
    expect(result.allocations[0]).toEqual(sessions.allocations[0])
  })

  it('should call find on the client and return its result', async () => {
    const session: SessionDto = {
      projectName: 'Park cleaning',
      projectCode: 'XCT12',
      projectLocation: 'Hammersmith',
      date: '2025-01-02',
      startTime: '11:00',
      endTime: '12:00',
      appointmentSummaries: [
        {
          id: 1001,
          requirementMinutes: 600,
          completedMinutes: 500,
          offender: {
            forename: 'John',
            surname: 'Smith',
            crn: 'CRN123',
            objectType: 'OffenderFull',
          },
        },
      ],
    }

    sessionClient.find.mockResolvedValue(session)
    const result = await sessionService.getSession('some-username', '1', '2025-01-01')

    expect(sessionClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(session)
    expect(result.appointmentSummaries[0]).toEqual(session.appointmentSummaries[0])
  })
})
