interface InMemoryStore {
  userVersion: string
}
// will be used for data storage from api response that needed to be used later in the app
const inMemoryStore: InMemoryStore = {
  userVersion: '',
}
export default inMemoryStore
