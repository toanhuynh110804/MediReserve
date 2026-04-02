import { STORAGE_KEYS } from '../../src/shared/constants/storageKeys'

export async function seedSession(page, user) {
  await page.addInitScript(
    ({ tokenKey, userKey, token, payload }) => {
      window.localStorage.setItem(tokenKey, token)
      window.localStorage.setItem(userKey, JSON.stringify(payload))
    },
    {
      tokenKey: STORAGE_KEYS.token,
      userKey: STORAGE_KEYS.user,
      token: 'playwright-token',
      payload: user,
    },
  )
}
