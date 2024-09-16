import { UserDetails } from '@approved-premises/ui'

interface InMemoryStore {
  users: Record<UserDetails['id'], UserDetails['version']>
}

// the in-memory store can be used for data that needs to persist across several sessions,
// or where the session store cannot be used.
const inMemoryStore: InMemoryStore = {
  users: {},
}

export default inMemoryStore
