const STORAGE_KEY = 'whats-new-top-banner-hidden'

const initWhatsNewTopBanner = bannerElement => {
  const { bannerVersion } = bannerElement.dataset

  if (localStorage.getItem(STORAGE_KEY) === bannerVersion) {
    bannerElement.style.display = 'none'
    return
  }

  const hideBanner = (navigateTo = null) => {
    localStorage.setItem(STORAGE_KEY, bannerVersion)
    bannerElement.style.display = 'none'
    if (navigateTo) {
      window.location.href = navigateTo
    }
  }

  bannerElement.querySelector('#hide-message')?.addEventListener('click', e => {
    e.preventDefault()
    hideBanner()
  })

  bannerElement.querySelector('a[href="/whats-new"]')?.addEventListener('click', e => {
    e.preventDefault()
    hideBanner(e.currentTarget.href)
  })
}

export default initWhatsNewTopBanner

