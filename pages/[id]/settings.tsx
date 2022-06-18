import Button from '@components/button'
import { BackIcon } from '@components/icons'
import { Loader } from '@components/loader'
import Toast from '@components/toast'
import { ROUTES } from '@constants/routes'
import { useAuth } from '@lib/auth/provider'
import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { ChangeEventHandler, FormEventHandler, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'

const DeveloperSettingsPage: NextPage = () => {
  const [redirectUrl, setRedirectUrl] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')

  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query as Record<string, string>

  const {
    isFetching,
    isError,
    error,
  }: {
    data: {
      data: {
        webhookUrl?: string
        redirectUrl?: string
      }
    }
    isFetching: boolean
    isError: boolean
    error: Error
  } = useQuery(
    `${ROUTES.API.INTEGRATIONS.WEBHOOK.GET_URLS}?id=${router.query.id}`,
    {
      refetchOnReconnect: false,
      // refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: !!id,
      onSuccess({ data }) {
        setRedirectUrl(data?.redirectUrl)
        setWebhookUrl(data?.webhookUrl)
      },
    },
  )

  const {
    mutate: saveURLs,
    isLoading: isSaveURLsLoading,
    isSuccess: isSaveURLsSuccess,
  } = useMutation(
    ({
      id,
      webhookUrl,
      redirectUrl,
    }: {
      id: string
      webhookUrl?: string
      redirectUrl?: string
    }) => {
      return axios.post(ROUTES.API.INTEGRATIONS.WEBHOOK.UPDATE_URLS, {
        id,
        webhookUrl,
        redirectUrl,
      })
    },
    {
      onSuccess() {
        toast.success('URLs updated')
      },
      onError(error: any) {
        toast.error('Error saving URLs')
      },
    },
  )

  const handleWebhookUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setWebhookUrl(e.target.value)
  const handleRedirectUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setRedirectUrl(e.target.value)
  const handleSaveURLs: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    saveURLs({
      id,
      webhookUrl,
      redirectUrl,
    })
  }

  if (isFetching) return <Loader />
  if (error) return <p>What a tough luck</p>

  return (
    <>
      <div className="overflow-hidden bg-slate-50">
        <div className="flex-col h-screen max-h-screen lg:flex">
          <header className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-200">
            <div className="flex">
              <div className="flex items-center justify-center border-r border-gray-300 pr-7 mr-7">
                <BackButton />
              </div>
              <h1 className="flex items-center justify-center text-lg gap-x-2">
                Developer Settings
              </h1>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl pt-16">
            <form
              className="flex flex-col w-full max-w-xl"
              onSubmit={handleSaveURLs}
            >
              <div className="mb-4">
                <h5 className="text-sm">Webhook URL</h5>
                <input
                  className="font-medium w-full py-2 px-3 rounded-md border border-gray-200 focus:outline-none ring-0 ring-blue-300 focus:ring-2 transition"
                  placeholder="https://api.heroform.io/webhook/signup"
                  type="text"
                  value={webhookUrl}
                  onChange={handleWebhookUrlChange}
                />
              </div>
              <div className="mb-16">
                <h5 className="text-sm">Redirect URL</h5>
                <input
                  className="font-medium w-full py-2 px-3 rounded-md border border-gray-200 focus:outline-none ring-0 ring-blue-300 focus:ring-2 transition"
                  placeholder="https://heroform.io/dashboard"
                  type="text"
                  value={redirectUrl}
                  onChange={handleRedirectUrlChange}
                />
              </div>
              <Button className="self-end">Save</Button>
            </form>
          </div>
        </div>
      </div>
      <Toast />
    </>
  )
}

export default DeveloperSettingsPage

const BackButton = () => {
  const router = useRouter()

  const onClick = () => {
    const id = router.query.id
    router.push(`/${id}${ROUTES.EDIT}`)
  }

  return (
    <button
      className="text-gray-900 transition-all duration-75 cursor-pointer hover:text-gray-700"
      onClick={onClick}
    >
      <BackIcon />
    </button>
  )
}