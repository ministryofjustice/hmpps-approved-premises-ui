import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'

type OasysTierProfile = 'A' | 'B' | 'C'

const clickSection2To4WithSelections = async (
  page: Page,
  person: TestOptions['person']['details'],
  selections: {
    identifiableChildren: 'R2.4.1~YES' | 'R2.4.1~NO'
    childrenInGeneral: 'R2.4.2~YES' | 'R2.4.2~NO'
    riskOfSuicide: 'R3.1~YES' | 'R3.1~NO'
    riskOfSelfHarm: 'R3.2~YES' | 'R3.2~NO'
    copingInCustody: 'R3.3~YES' | 'R3.3~NO'
    vulnerability: 'R3.4~YES' | 'R3.4~NO'
    escapeAbscond: 'R4.1~YES' | 'R4.1~NO'
    controlIssues: 'R4.6~YES' | 'R4.6~NO'
    risksToOtherPrisoners: 'R4.4~YES' | 'R4.4~NO'
  },
) => {
  await page
    .getByLabel(
      `Could ${person.firstName}'s behaviour and circumstances have a negative impact on a child's wellbeing?`,
    )
    .selectOption('R2.3~YES')
  await page.getByLabel('Identifiable children').selectOption(selections.identifiableChildren)
  await page.getByLabel('Children in general').selectOption(selections.childrenInGeneral)
  await page.getByLabel('Risk of suicide').selectOption(selections.riskOfSuicide)
  await page.getByLabel('Risk of self-harm').selectOption(selections.riskOfSelfHarm)
  await page.getByLabel('Coping in Custody / Approved Premises / Hostel').selectOption(selections.copingInCustody)
  await page.getByLabel('Vulnerability').selectOption(selections.vulnerability)
  await page.getByLabel('Escape / abscond').selectOption(selections.escapeAbscond)
  await page
    .getByLabel('Control Issues / Disruptive Behaviour and Breach of Trust')
    .selectOption(selections.controlIssues)
  await page.getByLabel('Risks to other prisoners').selectOption(selections.risksToOtherPrisoners)

  await page.keyboard.down('End')
  await page.click('input[value="Save"]')
  await page.click('input[value="Next"]')
}

const roshSelectionsByTier: Record<OasysTierProfile, Parameters<typeof clickSection2To4WithSelections>[2]> = {
  A: {
    identifiableChildren: 'R2.4.1~NO',
    childrenInGeneral: 'R2.4.2~YES',
    riskOfSuicide: 'R3.1~YES',
    riskOfSelfHarm: 'R3.2~YES',
    copingInCustody: 'R3.3~YES',
    vulnerability: 'R3.4~YES',
    escapeAbscond: 'R4.1~YES',
    controlIssues: 'R4.6~YES',
    risksToOtherPrisoners: 'R4.4~YES',
  },
  B: {
    identifiableChildren: 'R2.4.1~NO',
    childrenInGeneral: 'R2.4.2~YES',
    riskOfSuicide: 'R3.1~YES',
    riskOfSelfHarm: 'R3.2~YES',
    copingInCustody: 'R3.3~YES',
    vulnerability: 'R3.4~NO',
    escapeAbscond: 'R4.1~YES',
    controlIssues: 'R4.6~YES',
    risksToOtherPrisoners: 'R4.4~NO',
  },
  C: {
    identifiableChildren: 'R2.4.1~NO',
    childrenInGeneral: 'R2.4.2~YES',
    riskOfSuicide: 'R3.1~NO',
    riskOfSelfHarm: 'R3.2~NO',
    copingInCustody: 'R3.3~NO',
    vulnerability: 'R3.4~NO',
    escapeAbscond: 'R4.1~YES',
    controlIssues: 'R4.6~YES',
    risksToOtherPrisoners: 'R4.4~NO',
  },
}

export const clickSection2To4ForTier = async (
  page: Page,
  person: TestOptions['person']['details'],
  tier: OasysTierProfile,
) => clickSection2To4WithSelections(page, person, roshSelectionsByTier[tier])
