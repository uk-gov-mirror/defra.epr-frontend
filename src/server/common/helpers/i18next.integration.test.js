import { load } from 'cheerio'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'
import { createServer } from '~/src/server/index.js'

/**
 * i18n plugin integration tests
 *
 * These tests verify the i18n plugin integration with a real Hapi server.
 * Tests cover:
 * 1. Language detection from URL path (/cy prefix for Welsh)
 * 2. URL rewriting (stripping /cy prefix)
 * 3. Translation context injection into views
 * 4. HTML lang attribute setting
 */
describe('#i18nPlugin - integration', () => {
  /** @type {Server} */
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('language detection and html lang attribute', () => {
    it.each([
      {
        url: '/',
        expectedLang: 'en',
        heading: 'Sites',
        description: 'english'
      },
      { url: '/cy', expectedLang: 'cy', heading: 'Hafan', description: 'welsh' }
    ])(
      'should set lang="$expectedLang" for $description pages ($url)',
      async ({ expectedLang, heading, url }) => {
        const response = await server.inject({
          method: 'GET',
          url
        })

        expect(response.statusCode).toBe(statusCodes.ok)

        const $ = load(response.result)

        expect($('h1').first().text()).toBe(heading)
        expect($('html').attr('lang')).toBe(expectedLang)
      }
    )
  })

  describe('url rewriting', () => {
    it.each([
      { originalUrl: '/cy', expectedPath: '/' },
      { originalUrl: '/cy/', expectedPath: '/' },
      { originalUrl: '/cy/health', expectedPath: '/health' },
      { originalUrl: '/cy/some/deep/path', expectedPath: '/some/deep/path' }
    ])(
      'should rewrite $originalUrl to $expectedPath',
      async ({ originalUrl, expectedPath }) => {
        const response = await server.inject({
          method: 'GET',
          url: originalUrl
        })

        // Verify the URL was rewritten correctly
        expect(response.request.path).toBe(expectedPath)
      }
    )
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
