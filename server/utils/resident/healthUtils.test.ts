import { PersonAcctAlert } from '@approved-premises/api'
import { render } from 'nunjucks'
import { acctAlertFactory, cas1OasysGroupFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { drugAndAlcoholCards, healthDetailsCards, healthSideNavigation, mentalHealthCards } from './healthUtils'
import { DateFormats } from '../dateUtils'
import { tableRow } from './riskUtils'

jest.mock('nunjucks')

describe('healthUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  beforeEach(() => {
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

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

  describe('healthDetailsCards', () => {
    it('should render the health details cards', () => {
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = healthDetailsCards(supportingInformation)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${tableRow('13.1 OASys supporting information')}Nunjucks template partials/detailsBlock.njk`,
      )
    })
  })

  describe('mentalHealthCards', () => {
    it('should render the mental health cards', () => {
      const acctAlerts = acctAlertFactory.buildList(2)
      const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()

      const result = mentalHealthCards(acctAlerts, riskToSelf)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from DPS, NDelius and OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${tableRow('FA62 OASys risk to self')}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[2].html).toMatchStringIgnoringWhitespace(
        `${tableRow('FA63 OASys risk to self')}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[3].html).toMatchStringIgnoringWhitespace(
        `${tableRow('FA64 OASys risk to self')}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[4]).toEqual({
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
            { text: DateFormats.isoDateToUIDate(acctAlert.dateCreated, { format: 'short' }) },
            { text: acctAlert.description },
            { text: DateFormats.isoDateToUIDate(acctAlert.dateExpires, { format: 'short' }) },
            { text: acctAlert.alertTypeDescription },
            { text: acctAlert.comment },
          ]),
        },
      })
    })
  })

  describe('drug and alcohol cards', () => {
    it('should render the drug and alcohol cards', () => {
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = drugAndAlcoholCards(supportingInformation)
      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${tableRow('8.9 OASys supporting information')}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[2].html).toMatchStringIgnoringWhitespace(
        `${tableRow('9.9 OASys supporting information')}Nunjucks template partials/detailsBlock.njk`,
      )

      supportingInformation.answers.forEach(answer => {
        if (['8.9', '9.9'].includes(answer.questionNumber))
          expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
            summaryText: 'View information',
            text: answer.answer,
          })
      })
    })
  })
})
