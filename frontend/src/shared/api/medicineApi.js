import { httpClient } from './httpClient'

export async function getMedicinesApi() {
  const response = await httpClient.get('/api/medicines')
  return response.data
}