import { PersonAcctAlert } from '@approved-premises/api'
import { acctAlertFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { healthSideNavigation, mentalHealthCards } from './healthUtils'
import * as utils from './index'

describe('healthUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  describe('healthSideNavigation', () => {
    it('should render the health side navigation', () => {
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/health/`
      expect(healthSideNavigation('healthDetails', crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}healthDetails`,
          text: 'Health and disability',
        },
        {
          active: false,
          href: `${basePath}mentalHealth`,
          text: 'Mental health',
        },
        {
          active: false,
          href: `${basePath}drugsAndAlcohol`,
          text: 'Drug and alcohol use',
        },
      ])
    })
  })

  describe('mentalHealthCards', () => {
    it('should render the mental health cards', () => {
      const acctAlerts = acctAlertFactory.buildList(2)

      jest.spyOn(utils, 'insetText').mockReturnValue('inset text')

      const result = mentalHealthCards(acctAlerts)
      expect(result).toEqual([
        { html: 'inset text' },
        {
          card: { title: { text: 'ACCT alerts' } },
          table: {
            head: [
              { text: 'Date created' },
              { text: 'Description' },
              { text: 'Expiry date' },
              { text: 'Alert type' },
              { text: 'Comment' },
            ],
            rows: acctAlerts.map((acctAlert: PersonAcctAlert) => [
              { text: acctAlert.dateCreated },
              { text: acctAlert.description },
              { text: acctAlert.dateExpires },
              { text: acctAlert.alertTypeDescription },
              { text: acctAlert.comment },
            ]),
          },
        },
      ])
    })
  })
})
