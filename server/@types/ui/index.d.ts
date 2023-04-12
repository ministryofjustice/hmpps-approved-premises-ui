import {
  Application,
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  ApprovedPremisesAssessment as Assessment,
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  Booking,
  Document,
  FlagsEnvelope,
  Mappa,
  OASysSection,
  Person,
  PersonAcctAlert,
  PlacementRequest,
  PlacementRequestStatus,
  ReleaseTypeOption,
  RiskTier,
  RoshRisks,
  UserRole,
} from '@approved-premises/api'

interface TasklistPage {
  body: Record<string, unknown>
}
interface PersonService {}

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

export type TaskNames =
  | 'basic-information'
  | 'type-of-ap'
  | 'risk-management-features'
  | 'prison-information'
  | 'location-factors'
  | 'access-and-healthcare'
  | 'further-considerations'
  | 'move-on'
  | 'check-your-answers'

export type YesOrNoWithDetail<T extends string> = {
  [K in T]: YesOrNo
} & {
  [K in `${T}Detail`]: string
}

export type YesNoOrIDKWithDetail<T extends string> = {
  [K in T]: YesNoOrIDK
} & {
  [K in `${T}Detail`]: string
}

export type UiTask = {
  id: string
  title: string
  pages: Record<string, unknown>
}

export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'cannot_start'

export type TaskWithStatus = UiTask & { status: TaskStatus }

export type FormSection = {
  title: string
  name: string
  tasks: Array<UiTask>
}

export type FormSections = Array<FormSection>

export type FormPages = { [key in TaskNames]: Record<string, unknown> }

export type PageResponse = Record<string, string | Array<string> | Array<Record<string, unknown>>>

export interface HtmlAttributes {
  [key: string]: string | number
}

export interface TextItem {
  text: string
}

export interface HtmlItem {
  html: string
}

export type TableCell = { text: string; attributes?: HtmlAttributes; classes?: string } | { html: string }

export type TableRow = Array<TableCell>

export interface RadioItem {
  text: string
  value: string
  checked?: boolean
}

export type CheckBoxItem =
  | {
      text: string
      value: string
      checked?: boolean
    }
  | CheckBoxDivider

export type CheckBoxDivider = { divider: string }

export interface SelectOption {
  text: string
  value: string
  selected?: boolean
}

export interface SummaryList {
  classes?: string
  attributes?: HtmlAttributes
  rows: Array<SummaryListItem>
}

export interface SummaryListActionItem {
  href: string
  text: string
  visuallyHiddenText?: string
}

export interface SummaryListActions {
  items: Array<SummaryListActionItem>
}

export interface SummaryListItem {
  key: TextItem | HtmlItem
  value: TextItem | HtmlItem
  actions?: SummaryListActions
}

export interface IdentityBarMenu {
  items: Array<IdentityBarMenuItem>
}

export interface IdentityBarMenuItem {
  classes: string
  href: string
  text: string
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

export type TierNumber = '1' | '2' | '3' | '4'
export type TierLetter = 'A' | 'B' | 'C' | 'D'
export type RiskTierLevel = `${TierLetter}${TierNumber}`

export type ApplicationType = 'Standard' | 'PIPE'

export interface ErrorMessage {
  text: string
  attributes: {
    [K: string]: boolean
  }
}

export interface ErrorMessages {
  [K: string]: ErrorMessage
}

export interface ErrorSummary {
  text: string
  href: string
}

export interface ErrorsAndUserInput {
  errors: ErrorMessages
  errorSummary: Array<string>
  userInput: Record<string, unknown>
}

export type TaskListErrors<K extends TasklistPage> = Partial<Record<keyof K['body'], unknown>>

export type YesOrNo = 'yes' | 'no'
export type YesNoOrIDK = YesOrNo | 'iDontKnow'

export type PersonStatus = 'InCustody' | 'InCommunity'

export interface ReferenceData {
  id: string
  name: string
  isActive: boolean
  serviceScope: string
}

export interface PersonRisksUI {
  roshRisks: RoshRisks
  tier: RiskTier
  flags: FlagsEnvelope['value']
  mappa: Mappa
}

export type GroupedListofBookings = {
  [K in 'arrivingToday' | 'departingToday' | 'upcomingArrivals' | 'upcomingDepartures']: Array<Booking>
}

export type DataServices = Partial<{
  personService: {
    getPrisonCaseNotes: (token: string, crn: string) => Promise<Array<PrisonCaseNote>>
    getAdjudications: (token: string, crn: string) => Promise<Array<Adjudication>>
    getAcctAlerts: (token: string, crn: string) => Promise<Array<PersonAcctAlert>>
    getOasysSelections: (token: string, crn: string) => Promise<Array<OASysSection>>
    getOasysSections: (token: string, crn: string, selectedSections?: Array<number>) => Promise<OASysSections>
    getPersonRisks: (token: string, crn: string) => Promise<PersonRisksUI>
  }
  applicationService: {
    getDocuments: (token: string, application: ApprovedPremisesApplication) => Promise<Array<Document>>
  }
  userService: {
    getUserById: (token: string, id: string) => Promise<User>
  }
}>

export type AssessmentGroupingCategory = 'status' | 'allocation'

export type GroupedAssessments = {
  completed: Array<Assessment>
  requestedFurtherInformation: Array<Assessment>
  awaiting: Array<Assessment>
}

export interface AllocatedAndUnallocatedAssessments {
  allocated: Array<Assessment>
  unallocated: Array<Assessment>
}

export interface GroupedApplications {
  inProgress: Array<Application>
  requestedFurtherInformation: Array<Application>
  submitted: Array<Application>
}

export type GroupedPlacementRequests = Record<PlacementRequestStatus, Array<PlacementRequest>>

export interface ApplicationWithRisks extends Application {
  person: PersonWithRisks
}

export interface PersonWithRisks extends Person {
  risks: PersonRisks
}

export type OasysImportArrays =
  | ArrayOfOASysOffenceDetailsQuestions
  | ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
  | ArrayOfOASysSupportingInformationQuestions
  | ArrayOfOASysRiskToSelfQuestions
  | ArrayOfOASysRiskManagementPlanQuestions

export type OasysSummariesSection = { [index: string]: OasysImportArrays }

export type JourneyType = 'applications' | 'assessments'

export type ServiceSection = {
  id: string
  title: string
  description: string
  shortTitle: string
  href: string
}

export type UserDetails = {
  id: string
  name: string
  displayName: string
  roles: Array<UserRole>
}

export type PartnerAgencyDetails = {
  partnerAgencyName: string
  namedContact: string
  phoneNumber: string
  roleInPlan: string
}

export type ContingencyPlanQuestionId =
  | 'noReturn'
  | 'placementWithdrawn'
  | 'victimConsiderations'
  | 'unsuitableAddresses'
  | 'suitableAddresses'
  | 'breachInformation'
  | 'otherConsiderations'

export type ContingencyPlanQuestionsBody = Record<ContingencyPlanQuestionId, string>

type ContingencyPlanQuestion = {
  question: string
  hint?: string
  error: string
}

export type ContingencyPlanQuestionsRecord = Record<ContingencyPlanQuestionId, ContingencyPlanQuestion>

export interface BedSearchParametersUi extends BedSearchParameters {
  durationDays: string
  maxDistanceMiles: string
  crn: string
  applicationId: string
  assessmentId: string
  [index: string]: unknown
  selectedRequiredCharacteristics?: Array<string>
}

export type ReleaseTypeOptions = Record<ReleaseTypeOption, string>
