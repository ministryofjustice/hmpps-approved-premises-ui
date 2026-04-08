import {
  BookingDetails,
  Cas1OASysGroup,
  DietAndAllergyResponse,
  DietaryItemDto,
  PersonAcctAlert,
  ValueWithMetadataListDietaryItemDto,
  ValueWithMetadataString,
} from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { card, cellMetaData, combineResultAndContent, insetText, loadingErrorMessage, ResidentProfileSubTab } from '.'
import paths from '../../paths/manage'
import { dateCellNoWrap, textCell } from '../tableUtils'
import { oasysQuestionDetailsByNumber, summaryCards, tableRow } from './riskUtils'
import { ApiOutcome, linkTo } from '../utils'
import { bulletList, summaryListItem } from '../formUtils'

export const smokingStatusMapping: Record<string, string> = {
  Yes: 'Smoker',
  No: 'Does not smoke or vape',
  'Vaper/NRT Only': 'Vaper or uses nicotine replacement therapy (NRT)',
}

export const getSmokingStatus = (bookingDetails: BookingDetails): string => {
  const smokingInfo = bookingDetails?.profileInformation?.find(info => info.type === 'SMOKE')?.resultValue
  return smokingStatusMapping[smokingInfo] || smokingInfo
}

export const healthSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabHealth
  return [
    {
      text: 'Health and disability',
      href: basePath.healthDetails({ crn, placementId }),
      active: subTab === 'healthDetails',
    },
    {
      text: 'Mental health',
      href: basePath.mentalHealth({ crn, placementId }),
      active: subTab === 'mentalHealth',
    },
  ]
}

export const listDietItems = (items: Array<DietaryItemDto> = []): string => {
  const itemsHtml = items.map(
    ({ value, comment }) => `${value?.description}${comment?.length ? `<span>: ${comment}</span>` : ''}`,
  )
  if (items?.length > 1) return bulletList(itemsHtml)
  if (items?.length === 1) return itemsHtml[0]
  return 'None'
}

export const getLastUpdated = (
  metaList: Array<ValueWithMetadataListDietaryItemDto | ValueWithMetadataString>,
): string => {
  return metaList.reduce(
    (last, meta) => (!last || meta?.lastModifiedAt > last ? meta?.lastModifiedAt : last),
    undefined as string,
  )
}

export const dietCard = (dietResponse: DietAndAllergyResponse, result: ApiOutcome): SummaryListWithCard => {
  const error = loadingErrorMessage(combineResultAndContent(result, dietResponse), 'diet and allergy', 'dps')
  const { dietAndAllergy: dto = {} } = dietResponse || {}
  const {
    cateringInstructions: { value: cateringInstructions } = {},
    foodAllergies: { value: foodAllergyList } = {},
    medicalDietaryRequirements: { value: medicalRequirementList } = {},
    personalisedDietaryRequirements: { value: personalisedDietaryList } = {},
  } = dto

  const lastModified = getLastUpdated([
    dto.foodAllergies,
    dto.personalisedDietaryRequirements,
    dto.medicalDietaryRequirements,
    dto.cateringInstructions,
  ])

  return card({
    title: 'Diet and food allergies',
    topHtml: error || cellMetaData('dps', lastModified),
    rows: !error
      ? [
          summaryListItem('Medical diet', listDietItems(medicalRequirementList), 'html'),
          summaryListItem('Food allergies', listDietItems(foodAllergyList), 'html'),
          summaryListItem('Personalised dietary requirements', listDietItems(personalisedDietaryList), 'html'),
          summaryListItem('Catering instructions', cateringInstructions || 'None', 'textBlock'),
        ]
      : undefined,
  })
}

export const smokerCard = (bookingDetails: BookingDetails, outcome: ApiOutcome): SummaryListWithCard => {
  const smokingResult = getSmokingStatus(bookingDetails)
  const smokingError = loadingErrorMessage(combineResultAndContent(outcome, smokingResult), 'smoking status', 'dps')
  return card({
    title: 'Smoker or vaper',
    topHtml: smokingError || cellMetaData('dps'),
    rows: !smokingError ? [summaryListItem('Smoker or vaper', smokingResult)] : undefined,
  })
}

export const healthDetailsCards = ({
  supportingInformation,
  supportingInformationOutcome,
  bookingDetails,
  bookingDetailsOutcome,
  dietAndAllergy,
  dietAndAllergyOutcome,
  crn,
  placementId,
}: {
  supportingInformation: Cas1OASysGroup
  supportingInformationOutcome: ApiOutcome
  bookingDetails: BookingDetails
  bookingDetailsOutcome: ApiOutcome
  dietAndAllergy: DietAndAllergyResponse
  dietAndAllergyOutcome: ApiOutcome
  crn?: string
  placementId?: string
}) => {
  const linkText = `Go to the ${linkTo(paths.resident.tabPlacement.application({ crn, placementId }), { text: 'application and assessment page' })} to check if any access, cultural and healthcare needs were added to the application.`

  let cards = [card({ html: insetText(linkText) })]

  const assessentIso = supportingInformation?.assessmentMetadata?.dateCompleted
  if (assessentIso && assessentIso > '2025-04-09T18:00') {
    const definition = oasysQuestionDetailsByNumber['13.1']
    cards = cards.concat(
      card({
        title: definition.label,
        html: `<p>We cannot load general health - any physical or mental health conditions right now.</p>
<p>Go to OASys to check if any general health details have been entered.</p>`,
      }),
    )
  } else {
    cards = cards.concat(summaryCards(['13.1'], supportingInformation, supportingInformationOutcome))
  }

  cards = cards.concat([
    dietCard(dietAndAllergy, dietAndAllergyOutcome),
    smokerCard(bookingDetails, bookingDetailsOutcome),
  ])
  return cards
}

export const mentalHealthCards = ({
  personAcctAlerts,
  personAcctAlertsOutcome,
  riskToSelf,
  riskToSelfOutcome,
  supportingInformation,
  supportingInformationOutcome,
}: {
  personAcctAlerts: Array<PersonAcctAlert>
  personAcctAlertsOutcome: ApiOutcome
  riskToSelf: Cas1OASysGroup
  riskToSelfOutcome: ApiOutcome
  supportingInformation: Cas1OASysGroup
  supportingInformationOutcome: ApiOutcome
}) => [
  card({ html: insetText('Imported from Digital Prison Service and OASys') }),
  ...summaryCards(['FA62', 'FA63', 'FA64', 'R8.1.1', 'R8.2.1', 'R8.3.1'], riskToSelf, riskToSelfOutcome),
  ...summaryCards(['10.9'], supportingInformation, supportingInformationOutcome),
  card({
    title: 'ACCT alerts',
    topHtml: tableRow('Imported from Digital Prison Service'),
    table: personAcctAlerts?.length && {
      head: [textCell('Date created'), textCell('Description'), textCell('Expiry date')],
      rows: personAcctAlerts.map((acctAlert: PersonAcctAlert) => [
        dateCellNoWrap(acctAlert.dateCreated),
        textCell(acctAlert.description),
        dateCellNoWrap(acctAlert.dateExpires),
      ]),
    },
    html: !personAcctAlerts?.length ? loadingErrorMessage(personAcctAlertsOutcome, 'ACCT alerts', 'dps') : undefined,
  }),
]
