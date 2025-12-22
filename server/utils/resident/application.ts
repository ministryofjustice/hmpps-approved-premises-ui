import { ApprovedPremisesApplication } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { Accordion, alertBanner, card, renderCardList, renderPersonDetails, TabData } from './index'
import { SubmittedDocumentRenderer } from '../forms/submittedDocumentRenderer'
import { TabControllerParameters } from './TabControllerParameters'
import { insetText } from './riskUtils'
import { DateFormats } from '../dateUtils'

// export const applicationDocumentAccordion = (application: ApprovedPremisesApplication): Accordion => {
//   const sections = new SubmittedDocumentRenderer(application).response
//
//   const personDetails = { heading: { text: 'Person details' }, content: { html: renderPersonDetails(application) } }
//
//   return {
//     id: 'applicationId',
//
//     items: [
//       personDetails,
//       ...sections.map(section => {
//         const content: string = renderCardList(section.tasks as unknown as Array<SummaryListWithCard>)
//         return { heading: { text: section.title }, content: { html: content } }
//       }),
//     ],
//   }
// }

// export const placementApplicationTabController = async ({
//   applicationService,
//   token,
//   placement,
// }: TabControllerParameters): Promise<TabData> => {
//   const [application]: [ApprovedPremisesApplication] = await Promise.all([
//     applicationService.findApplication(token, placement.applicationId),
//   ])
//
//   const cardList: Array<SummaryListWithCard> = [
//     card({
//       html: alertBanner({
//         variant: 'information',
//         title: 'This application may not show the latest resident information',
//         html: 'Check this profile for the most up-to-date information for this resident.',
//       }),
//     }),
//     card({
//       html: insetText(
//         `Application submitted by ${application.applicantUserDetails?.name} on ${DateFormats.isoDateToUIDate(application.submittedAt)}`,
//       ),
//     }),
//   ]
//
//   return {
//     cardList,
//     subHeading: 'Application',
//     accordion: applicationDocumentAccordion(application),
//   }
// }
