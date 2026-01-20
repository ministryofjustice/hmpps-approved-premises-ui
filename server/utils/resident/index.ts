import {
  ApprovedPremisesApplication,
  Cas1SpaceBooking,
  FullPerson,
  PersonRisks,
  RiskEnvelopeStatus,
} from '@approved-premises/api'
import { HtmlItem, SummaryListItem, SummaryListWithCard, TabItem, Table, TextItem } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { detailedStatus, statusTextMap } from '../placements/status'
import { canonicalDates, placementStatusTag } from '../placements'
import { linkTo, objectClean } from '../utils'
import config from '../../config'

export type ResidentProfileTab = 'personal' | 'health' | 'placement' | 'risk' | 'sentence' | 'enforcement'
export type ResidentProfileSubTab =
  | 'personalDetails'
  | 'healthDetails'
  | 'mentalHealth'
  | 'drugAndAlcohol'
  | 'placementDetails'
  | 'allApPlacements'
  | 'application'
  | 'riskDetails'
  | 'offence'
  | 'licence'
  | 'orders'
  | 'parole'
  | 'prison'
  | 'contacts'

export type CsraClassification = 'STANDARD' | 'HI'

export const csraClassificationMapping: Record<CsraClassification, string> = { STANDARD: 'Standard', HI: 'High' }

export type ResidentHeader = {
  name: string
  photoUrl?: string
  statusBadge?: string
  badges: Array<string>
  attributes: Array<Array<{ title: string; description: string }>>
}

type TextOrHtml = TextItem | HtmlItem

type AccordionSection = {
  heading: TextOrHtml
  content: TextOrHtml
}

export type Accordion = {
  id: string
  headingLevel?: number
  classes?: string
  attributes?: Record<string, string>
  rememberExpanded?: boolean
  hideAllSectionsText?: string
  showAllSectionsText?: string
  items: Array<AccordionSection>
}

export type TabData = {
  cardList?: Array<SummaryListWithCard>
  subHeading?: string
  accordion?: Accordion
}

export const tabLabels: Record<
  ResidentProfileTab,
  { label: string; disableRestricted?: boolean; disableOffline?: boolean }
> = {
  personal: { label: 'Personal details' },
  health: { label: 'Health' },
  placement: { label: 'Placement' },
  risk: { label: 'Risk' },
  sentence: { label: 'Sentence' },
  enforcement: { label: 'Enforcement' },
}

export const residentTabItems = (placement: Cas1SpaceBooking, activeTab: ResidentProfileTab): Array<TabItem> => {
  const getSelfLink = (tab: ResidentProfileTab): string => {
    const pathRoot = paths.resident
    const pathParams = { placementId: placement.id, crn: placement.person.crn }
    switch (tab) {
      case 'personal':
        return pathRoot.tabPersonal.personalDetails(pathParams)
      case 'health':
        return pathRoot.tabHealth.healthDetails(pathParams)
      case 'placement':
        return pathRoot.tabPlacement.placementDetails(pathParams)
      case 'risk':
        return pathRoot.tabRisk.riskDetails(pathParams)
      case 'sentence':
        return pathRoot.tabSentence.offence(pathParams)
      case 'enforcement':
        return pathRoot.tabEnforcement(pathParams)
      default:
        return pathRoot.show(pathParams)
    }
  }
  return Object.entries(tabLabels).map(([key, { label }]) => ({
    text: label,
    active: activeTab === key,
    href: getSelfLink(key as ResidentProfileTab),
  }))
}

const isRetrieved = (status: RiskEnvelopeStatus) => status.toLowerCase() === 'retrieved'

export function getResidentHeader(placement: Cas1SpaceBooking, personRisks: PersonRisks): ResidentHeader {
  const person = placement.person as FullPerson
  const { arrivalDate, departureDate } = canonicalDates(placement)

  const {
    roshRisks: { status: roshStatus, value: roshValue },
    mappa: { status: mappaStatus, value: mappaValue },
    flags: { status: flagsStatus, value: flags },
  } = personRisks
  const roshRisk = roshValue?.overallRisk

  const badges: Array<string> = [
    getBadge(`${isRetrieved(roshStatus) && roshRisk ? roshRisk : 'Unknown'} RoSH`),
    isRetrieved(mappaStatus) && getBadge(`${mappaValue?.level} MAPPA`),
    ...(isRetrieved(flagsStatus) && flags ? flags.map(flag => getBadge(flag)) : []),
  ].filter(Boolean)

  return {
    name: person.name,
    photoUrl: undefined,
    statusBadge: placementStatusTag(placement),
    badges,
    attributes: [
      [
        {
          title: 'CRN',
          description: person.crn,
        },
        {
          title: 'Approved Premises',
          description: placement.premises.name,
        },
        {
          title: 'Key worker',
          description: placement.keyWorkerAllocation?.name ?? 'Not assigned',
        },
        {
          title: 'Arrival',
          description: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
        },
        {
          title: 'Departure',
          description: DateFormats.isoDateToUIDate(departureDate, { format: 'short' }),
        },
        {
          title: 'Length of stay',
          description: DateFormats.durationBetweenDates(arrivalDate, departureDate).ui,
        },
      ],
    ],
  }
}

function getBadge(text: string): string {
  return `<span class="moj-badge moj-badge--black">${text}</span>`
}

export const getResidentStatus = (placement: Cas1SpaceBooking): string => {
  return statusTextMap[detailedStatus(placement)]
}

export const card = ({
  title,
  rows,
  table,
  html,
}: {
  title?: string
  rows?: Array<SummaryListItem>
  table?: Table
  html?: string
}) =>
  objectClean<SummaryListWithCard>({
    card: title && {
      title: { text: title },
    },
    table,
    rows,
    html,
  })

export const detailsBody = (summaryText: string, text: string) => {
  return nunjucks.render(`partials/detailsBlock.njk`, { summaryText, text })
}

export const insetText = (html: string): string => {
  return nunjucks.render(`partials/insetText.njk`, { html })
}

export const renderCardList = (cardListData: Array<SummaryListWithCard>) => {
  return nunjucks.render(`manage/resident/partials/cardList.njk`, { cardList: cardListData })
}

export const renderPersonDetails = (application: ApprovedPremisesApplication): string => {
  return nunjucks.render(`manage/resident/partials/personDetails.njk`, { application })
}

type AlertVariant = 'information' | 'success' | 'warning' | 'error'
export const alertBanner = (parameters: { variant: AlertVariant; title: string; html?: string }) => {
  return nunjucks.render(`manage/resident/partials/alert.njk`, parameters)
}

type NdeliusComponent =
  | 'CaseSummary'
  | 'PersonalContacts'
  | 'PersonalCircumstances'
  | 'AddressandAccommodation'
  | 'EqualityMonitoring'
  | 'RegisterSummary'

export const ndeliusDeeplink = (args: {
  component: NdeliusComponent
  crn: string
  text: string
  attributes?: Record<string, string>
  hiddenText?: string
  hiddenPrefix?: string
  openInNewTab?: boolean
}): string => {
  const basePath = config.paths.ndeliusDeeplink
  return basePath
    ? linkTo(basePath, { openInNewTab: true, ...args, query: { component: args.component as string, CRN: args.crn } })
    : ''
}
