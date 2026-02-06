import { ApprovedPremisesApplication, Cas1SpaceBooking, PersonRisks, RiskEnvelopeStatus } from '@approved-premises/api'
import {
  HtmlItem,
  RequestWithSession,
  SummaryListItem,
  SummaryListWithCard,
  TabItem,
  Table,
  TextItem,
} from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import type { Request } from 'express'
import { DateFormats } from '../dateUtils'
import { canonicalDates, placementStatusTag } from '../placements'
import { ApiOutcome, linkTo, objectClean } from '../utils'
import config from '../../config'
import { hasPermission } from '../users'
import managePaths from '../../paths/manage'
import { getPageBackLink } from '../backlinks'
import { displayName } from '../personUtils'
import { RenderAs, summaryListItem } from '../formUtils'

export type ResidentProfileTab = 'personal' | 'health' | 'placement' | 'risk' | 'sentence' | 'drugAndAlcohol'
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
  drugAndAlcohol: { label: 'Drug and alcohol' },
}

export const residentTabItems = (placement: Cas1SpaceBooking, activeTab: ResidentProfileTab): Array<TabItem> => {
  const getSelfLink = (tab: ResidentProfileTab): string => {
    const pathRoot = managePaths.resident
    const pathParams = { placementId: placement.id, crn: placement.person.crn }
    switch (tab) {
      case 'personal':
        return pathRoot.tabPersonal.personalDetails(pathParams)
      case 'health':
        return pathRoot.tabHealth.healthDetails(pathParams)
      case 'drugAndAlcohol':
        return pathRoot.tabDrugAndAlcohol.drugAndAlcohol(pathParams)
      case 'placement':
        return pathRoot.tabPlacement.placementDetails(pathParams)
      case 'risk':
        return pathRoot.tabRisk.riskDetails(pathParams)
      case 'sentence':
        return pathRoot.tabSentence.offence(pathParams)
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

  const attribute = (title: string, description: string): { title: string; description: string } => ({
    title,
    description,
  })

  return {
    name: displayName(placement.person),
    photoUrl: undefined,
    statusBadge: placementStatusTag(placement),
    badges,
    attributes: [
      [
        attribute('CRN', placement.person.crn),
        attribute('AP', placement.premises.name),
        attribute('Arrival', DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })),
        attribute('Departure', DateFormats.isoDateToUIDate(departureDate, { format: 'short' })),
        attribute('Length of stay', DateFormats.durationBetweenDates(arrivalDate, departureDate).ui),
      ],
    ],
  }
}

function getBadge(text: string): string {
  return `<span class="moj-badge moj-badge--black">${text}</span>`
}

export const card = ({
  title,
  rows,
  table,
  html,
  topHtml,
}: {
  title?: string
  rows?: Array<SummaryListItem>
  table?: Table
  html?: string
  topHtml?: string
}) =>
  objectClean<SummaryListWithCard>({
    card: title && {
      title: { text: title },
    },
    table,
    rows,
    html,
    topHtml,
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
  | 'EventsList'

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

export const returnPath = (req: Request, placement: Cas1SpaceBooking) => {
  const defaultPath = hasPermission((req as RequestWithSession).session.user, ['cas1_ap_resident_profile'])
    ? managePaths.resident.show({ crn: placement.person.crn, placementId: placement.id })
    : managePaths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id })

  return getPageBackLink(
    `${managePaths.premises.placements.show.pattern}:action`,
    req as RequestWithSession,
    [managePaths.premises.placements.show.pattern, `${managePaths.resident.show.pattern}{/*tab}`],
    defaultPath,
  )
}

export const summaryItemNd = (label: string, value: string, renderAs = undefined as RenderAs) => {
  return value ? summaryListItem(label, value, renderAs) : summaryListItem(label, 'Not entered in NDelius', renderAs)
}

export const loadingErrorMessage = ({
  result,
  item,
  source,
}: {
  result: ApiOutcome
  item: string
  source: string
}): string => {
  switch (result) {
    case 'success':
      return undefined
    case 'notFound':
      return `No ${item} information found in ${source}`
    default:
      return `We cannot load ${item} information right now because ${source} is not available.<br>Try again later`
  }
}
