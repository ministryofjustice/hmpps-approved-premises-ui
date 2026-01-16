import { createMock } from '@golevelup/ts-jest'
import { cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { contactsTabController, personalDetailsTabController } from './personal'
import { PersonService } from '../../services'
import * as personalUtils from './personalUtils'
import * as utils from './index'
import { card } from '.'

const personService = createMock<PersonService>({})
const token = 'token'
const placement = cas1SpaceBookingFactory.build()
const personRisks = risksFactory.build()
const { crn } = placement.person

describe('Personal tab', () => {
  describe('personalDetailsTabController', () => {
    it('should render the personal details tab content', async () => {
      personService.findByCrn.mockResolvedValue(placement.person)
      const mockCardList = [card({ title: 'mock card' })]

      jest.spyOn(personalUtils, 'personDetailsCardList').mockReturnValue(mockCardList)

      const result = await personalDetailsTabController({
        personService,
        token,
        crn,
        personRisks,
        placement,
      })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Personal details' })
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personalUtils.personDetailsCardList).toHaveBeenCalledWith(placement.person, personRisks)
    })
  })

  describe('contactsTabController', () => {
    it('should render the contacts tab content', async () => {
      jest.spyOn(utils, 'ndeliusDeeplink').mockReturnValue('NDelius deeplink')

      expect(await contactsTabController({})).toEqual({
        cardList: [{ card: { title: { text: 'Contact details' } }, html: 'NDelius deeplink' }],
        subHeading: 'Contacts',
      })
    })
  })
})
