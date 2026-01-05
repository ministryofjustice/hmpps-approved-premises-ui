import { ApprovedPremisesApplication } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { Accordion, alertBanner, card, renderCardList, renderPersonDetails } from './index'
import { SubmittedDocumentRenderer } from '../forms/submittedDocumentRenderer'
import { insetText } from './riskUtils'
import { DateFormats } from '../dateUtils'

export const applicationDocumentAccordion = (application: ApprovedPremisesApplication): Accordion => {
  const sections = new SubmittedDocumentRenderer(application).response

  const personDetails = { heading: { text: 'Person details' }, content: { html: renderPersonDetails(application) } }

  return {
    id: 'applicationAccordion',

    items: [
      personDetails,
      ...sections.map(section => {
        return {
          heading: { text: section.title },
          content: { html: renderCardList(section.tasks as unknown as Array<SummaryListWithCard>) },
        }
      }),
    ],
  }
}

export const applicationCardList = (application: ApprovedPremisesApplication): Array<SummaryListWithCard> => {
  return [
    card({
      html: alertBanner({
        variant: 'information',
        title: 'This application may not show the latest resident information',
        html: 'Check this profile for the most up-to-date information for this resident.',
      }),
    }),
    card({
      html: insetText(
        `Application submitted by ${application.applicantUserDetails?.name} on ${DateFormats.isoDateToUIDate(application.submittedAt)}`,
      ),
    }),
  ]
}
