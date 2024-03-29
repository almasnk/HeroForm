import { SITE_DATA } from '@constants/site-data'
import * as Sentry from '@sentry/nextjs'
import { OauthV2AccessResponse } from '@slack/web-api'
import axios from 'axios'
import qs from 'qs'
import { handleRequest } from '@lib/api-handler'
import prisma from '@lib/prisma'
import { ROUTES } from '@constants/routes'

type Query = {
  code: string
  state: string
}

const callback = async (req, res) => {
  const { code, state } = req.query as Query
  const publicFormId = state

  const authenticationData = await exchangeCodeForAccessToken(code)
  console.log(authenticationData)

  await saveToDB(authenticationData, publicFormId)

  await sendGreetingMessageToChannel(authenticationData.incoming_webhook.url)

  return res.redirect(getRedirectURL(publicFormId))
}

const handler = (req, res) => handleRequest(req, res, callback)

export default Sentry.withSentry(handler)

/**
 * @see https://api.slack.com/authentication/oauth-v2
 * @description Exchange the temporary code for an access token (valid indefinitely according to the doc). 
 *  This also returns additional information about the user and the auth details. 
 *  At this point, the auth process is complete.
 * 
 * @example
    data: {
        ok: true,
        app_id: 'APP_ID_HERE',
        authed_user: { id: 'ID_HERE' },
        scope: 'incoming-webhook,chat:write',
        token_type: 'bot',
        access_token: 'FEW_CHARACTERS_HERE',
        bot_user_id: 'ID_HERE',
        team: { id: 'ID_HERE', name: 'NAME_HERE' },
        enterprise: null,
        is_enterprise_install: false,
        incoming_webhook: {
            channel: '#secret-channel',
            channel_id: 'ID_HERE',
            configuration_url: 'https://heroform.slack.com/services/<CONFIG_SLUG_HERE>',
            url: 'https://hooks.slack.com/services/<TEAM_ID>/<CONFIG_SLUG_HERE>/<WEBHOOK_SLUG_HERE>'
        }
    }
 */
const exchangeCodeForAccessToken = async (
  code: string,
): Promise<OauthV2AccessResponse> => {
  const config = {
    method: 'POST',
    url: 'https://slack.com/api/oauth.v2.access',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: code,
    }),
  }

  const { data } = await axios(config as any)

  return data
}

/**
 * @see https://api.slack.com/messaging/webhooks#posting_with_webhooks
 * @description Send a greeting to the Slack Channel using the webhook URL obtained from OAuth
 */
const sendGreetingMessageToChannel = async (
  webhookURL: string,
): Promise<void> => {
  const data = {
    text: `👋 Hello, it’s ${SITE_DATA.name}. Whenever someone submits a form, I’ll share the answers with you here.\nThanks for connecting!`,
  }
  await axios.post(webhookURL, data)
}

const getRedirectURL = (publicFormId: string): string => {
  // construct proper redirect URL
  return `/${publicFormId}${ROUTES.SETTINGS}`
}

/**
 * @description Save the data to the DB. <write schema structure so it's easy to understand>
 */
const saveToDB = async (
  data: OauthV2AccessResponse,
  publicFormId: string,
): Promise<void> => {
  const {
    access_token: accessToken,
    bot_user_id: botUserId,
    incoming_webhook: {
      channel,
      channel_id: channelId,
      configuration_url: webhookConfigurationUrl,
      url: webhookUrl,
    },
    scope,
  } = data

  await prisma.form.update({
    data: {
      slackIntegration: {
        create: {
          accessToken,
          botUserId,
          channel,
          channelId,
          scope,
          webhookConfigurationUrl,
          webhookUrl,
        },
      },
    },
    where: {
      publicId: publicFormId,
    },
  })
}
