import { BrowserContext } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { createTestPerson, PersonLifecycle } from '../setup/person'
import { teardownTestPerson } from '../teardown/person'

type UsePerson = (person: TestOptions['person']) => Promise<void>

export const useTestPerson = async (context: BrowserContext, use: UsePerson) => {
  const page = await context.newPage()
  const lifecycle: PersonLifecycle = { booked: false }
  let lifecycleError: unknown

  try {
    const person = await createTestPerson(page, lifecycle)
    await use(person)
  } catch (error) {
    lifecycleError = error
  }

  const cleanupErrors = await teardownTestPerson(page, lifecycle)
  await page.close()

  if (cleanupErrors.length) {
    const messages = cleanupErrors.map(error => (error instanceof Error ? error.message : String(error)))
    if (lifecycleError instanceof Error) {
      lifecycleError.message = `${lifecycleError.message}; cleanup also failed: ${messages.join('; ')}`
      throw lifecycleError
    }
    if (lifecycleError) {
      throw new Error(`${String(lifecycleError)}; cleanup also failed: ${messages.join('; ')}`)
    }
    throw new Error(`Could not clean up E2E person data: ${messages.join('; ')}`)
  }

  if (lifecycleError) {
    throw lifecycleError
  }
}
