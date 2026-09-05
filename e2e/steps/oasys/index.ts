/* eslint-disable import/no-extraneous-dependencies, no-console */
import { BrowserContext, Page, expect } from '@playwright/test'
import { PersonTier, TestOptions } from '@approved-premises/e2e'
import { signAndlock } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/sign-and-lock.mjs'
import { createLayer3AssessmentWithoutNeeds } from './layer3-assessment/create-layer3-assessment/create-layer3-without-needs'
import { loginOasysWithRetry } from './login'

type UseOasysSections = (sections: TestOptions['oasysSections']) => Promise<void>
type OasysTier = Extract<PersonTier, 'A' | 'B' | 'C'>

const signAndLockWithFallback = async (page: Page) => {
  try {
    await Promise.race([
      signAndlock(page),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Primary sign-and-lock flow timed out, trying fallback')), 20_000)
      }),
    ])
  } catch (error) {
    const continueButton = page.locator('[value="Continue with Signing"]')
    if (await continueButton.isVisible()) {
      await continueButton.click()
    }

    const confirmButton = page
      .getByRole('button', { name: /Confirm Sign (&|and) Lock/i })
      .or(page.locator('[value="Confirm Sign & Lock"]'))
      .first()
    if (await confirmButton.isVisible()) {
      await confirmButton.click()
    }

    const taskManagerHeader = page.locator('#searchtop > h2')
    await taskManagerHeader.waitFor({ timeout: 30_000, state: 'visible' })
    await expect(taskManagerHeader).toHaveText('Task Manager')

    console.log('Recovered OASys sign and lock via fallback flow')
  }
}

export const createOasysAssessment = async (
  context: BrowserContext,
  person: TestOptions['person'],
  useOrTier: UseOasysSections | PersonTier,
  maybeTier: PersonTier = 'A',
) => {
  const page = await context.newPage()
  const tier = typeof useOrTier === 'string' ? useOrTier : maybeTier

  try {
    if (tier === 'MISSING' || tier === 'NOT_SUPERVISED') {
      console.log(`Skipping OASys assessment for CRN ${person.crn}`)
    } else {
      console.log(`Creating OASys assessment for CRN ${person.crn}`)
      await loginOasysWithRetry(page)
      await createLayer3AssessmentWithoutNeeds(page, person, tier as OasysTier)
      await signAndLockWithFallback(page)
      console.log(`Created and signed OASys assessment for CRN ${person.crn}`)
    }
  } finally {
    await page.close()
  }

  if (typeof useOrTier === 'function') {
    await useOrTier([])
  }
}
