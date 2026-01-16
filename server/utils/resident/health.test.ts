import { createMock } from '@golevelup/ts-jest'
import * as healthUtils from './healthUtils'
import { card } from './index'
import { healthTabController, mentalHealthTabController } from './health'
import { PersonService } from '../../services'
import { acctAlertFactory } from '../../testutils/factories'

const mockCardList = [card({ title: 'mock card' })]
const personService = createMock<PersonService>({})
const token = 'token'
const crn = 'crn'

const acctAlerts = acctAlertFactory.buildList(10)

describe('Health tab', () => {
  describe('healthTabController', () => {
    it('should get acctAlerts and then render the cards', async () => {
      jest.spyOn(healthUtils, 'mentalHealthCards').mockReturnValue(mockCardList)
      personService.getAcctAlerts.mockResolvedValue(acctAlerts)

      const result = await healthTabController()

      expect(result).toEqual({ subHeading: 'Health and disability' })
    })
  })

  describe('mentalHealthTabController', () => {
    it('should get acctAlerts and then render the cards', async () => {
      jest.spyOn(healthUtils, 'mentalHealthCards').mockReturnValue(mockCardList)
      personService.getAcctAlerts.mockResolvedValue(acctAlerts)

      const result = await mentalHealthTabController({
        personService,
        token,
        crn,
      })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Mental health' })
      expect(personService.getAcctAlerts).toHaveBeenCalledWith(token, crn)
      expect(healthUtils.mentalHealthCards).toHaveBeenCalledWith(acctAlerts)
    })
  })
})
