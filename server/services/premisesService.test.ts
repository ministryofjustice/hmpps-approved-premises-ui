import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'
import {
  bedDetailFactory,
  bedOccupancyRangeFactory,
  bedSummaryFactory,
  extendedPremisesSummaryFactory,
  premisesFactory,
  premisesSummaryFactory,
  roomFactory,
  staffMemberFactory,
} from '../testutils/factories'
import { mapApiOccupancyToUiOccupancy } from '../utils/premisesUtils'
import paths from '../paths/manage'

jest.mock('../data/premisesClient')
jest.mock('../utils/premisesUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const premisesClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
  })

  describe('getAll', () => {
    it('calls the all method of the premises client and returns the response', async () => {
      const premises = premisesSummaryFactory.buildList(2)
      premisesClient.all.mockResolvedValue(premises)

      const result = await service.getAll(token)

      expect(result).toEqual(premises)
      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.all).toHaveBeenCalled()
    })

    it('sorts the premises returned by name', async () => {
      const premisesA = premisesSummaryFactory.build({ name: 'A' })
      const premisesB = premisesSummaryFactory.build({ name: 'B' })

      premisesClient.all.mockResolvedValue([premisesB, premisesA])

      const result = await service.getAll(token)

      expect(result).toEqual([premisesA, premisesB])
    })
  })

  describe('getStaffMembers', () => {
    it('on success returns the person given their CRN', async () => {
      const staffMembers = staffMemberFactory.buildList(5)
      premisesClient.getStaffMembers.mockResolvedValue(staffMembers)

      const result = await service.getStaffMembers(token, premisesId)

      expect(result).toEqual(staffMembers)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getStaffMembers).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getRooms', () => {
    it('on success returns the rooms given a premises ID', async () => {
      const rooms = roomFactory.buildList(1)
      premisesClient.getRooms.mockResolvedValue(rooms)

      const result = await service.getRooms(token, premisesId)

      expect(result).toEqual(rooms)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getRooms).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getBeds', () => {
    it('on success returns the beds given a premises ID', async () => {
      const beds = bedSummaryFactory.buildList(1)
      premisesClient.getBeds.mockResolvedValue(beds)

      const result = await service.getBeds(token, premisesId)

      expect(result).toEqual(beds)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getBeds).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getBed', () => {
    it('on success returns a bed given a premises ID and bed ID', async () => {
      const bed = bedDetailFactory.build()
      premisesClient.getBed.mockResolvedValue(bed)

      const result = await service.getBed(token, premisesId, bed.id)

      expect(result).toEqual(bed)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getBed).toHaveBeenCalledWith(premisesId, bed.id)
    })
  })

  describe('getRoom', () => {
    it('on success returns the room given a premises ID and room ID', async () => {
      const room = roomFactory.build()
      premisesClient.getRoom.mockResolvedValue(room)

      const result = await service.getRoom(token, premisesId, room.id)

      expect(result).toEqual(room)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getRoom).toHaveBeenCalledWith(premisesId, room.id)
    })
  })

  describe('tableRows', () => {
    it('returns a table view of the premises', async () => {
      const premises1 = premisesSummaryFactory.build({ name: 'XYZ' })
      const premises2 = premisesSummaryFactory.build({ name: 'ABC' })
      const premises3 = premisesSummaryFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]
      premisesClient.all.mockResolvedValue(premises)

      const rows = await service.tableRows(token)
      expect(rows).toEqual([
        [
          {
            text: premises2.name,
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises2.id,
            })}">View<span class="govuk-visually-hidden">about ${premises2.name}</span></a>`,
          },
        ],
        [
          {
            text: premises3.name,
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises3.id,
            })}">View<span class="govuk-visually-hidden">about ${premises3.name}</span></a>`,
          },
        ],
        [
          {
            text: premises1.name,
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises1.id,
            })}">View<span class="govuk-visually-hidden">about ${premises1.name}</span></a>`,
          },
        ],
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.all).toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('fetches the premises from the client', async () => {
      const premises = premisesFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.find(token, premises.id)
      expect(result).toEqual(premises)
    })
  })

  describe('getPremisesDetails', () => {
    it('returns a title and a summary list for a given Premises ID', async () => {
      const premises = extendedPremisesSummaryFactory.build()
      premisesClient.summary.mockResolvedValue(premises)

      const result = await service.getPremisesDetails(token, premises.id)

      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.summary).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getOccupancy', () => {
    it('returns the premises occupancy from the client', async () => {
      const occupancy = bedOccupancyRangeFactory.buildList(1)
      const startDate = '2020-01-01'
      const endDate = '2020-01-31'

      premisesClient.calendar.mockResolvedValue(occupancy)
      ;(mapApiOccupancyToUiOccupancy as jest.Mock).mockReturnValue(occupancy)

      const result = await service.getOccupancy(token, premisesId, startDate, endDate)

      expect(result).toEqual(occupancy)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.calendar).toHaveBeenCalledWith(premisesId, startDate, endDate)
    })
  })
})
