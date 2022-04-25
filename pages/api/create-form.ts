import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import prisma from '@lib/prisma'
import { getSession } from 'next-auth/react'
import { nanoid } from 'nanoid'
import { initForm, initMetadata } from '@lib/sheets'
import * as Sentry from '@sentry/nextjs'

const FORM_ID_LENGTH = 8

const createFormHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req })
    const { email } = session.user || {}
    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    const user = await prisma().user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        accounts: true,
      },
    })

    const { accounts } = user
    const account = accounts[0]
    const refreshToken = account.refresh_token

    const auth = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    })

    auth.setCredentials({
      refresh_token: refreshToken,
    })

    const response = await initForm({ auth })
    const { spreadsheetId } = response.data
    await initMetadata({ auth, spreadsheetId })

    const publicId = nanoid(FORM_ID_LENGTH)

    await prisma().form.create({
      data: {
        spreadsheetId,
        publicId,
        userId: user.id,
      },
    })

    return res.status(200).json({
      success: true,
      publicId,
    })
  } catch (error) {
    Sentry.captureException(error)
    console.error({ error })
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

export default Sentry.withSentry(createFormHandler)