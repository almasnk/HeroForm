import { NextPage } from 'next'
import Layout from '@components/layout'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Toast from '@components/toast'

import { ROUTES } from '@constants/routes'
import { LoadingIcon } from '@components/icons'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import isEmpty from 'lodash.isempty'
import Link from 'next/link'
import { SITE_DATA } from '@constants/site-data'
import { PlusIcon } from '@components/icons'
import { useAuth } from '@lib/auth/provider'

const DashboardPage: NextPage = () => {
  const { isLoggedIn, isAuthUnknown, user } = useAuth()
  const router = useRouter()

  const {
    isLoading: loadingForms,
    isFetching: fetchingForms,
    error: loadingFormsError,
    data: formsData,
    isSuccess: formsLoaded,
  }: {
    isLoading: boolean
    isFetching: boolean
    error: Error
    data: { forms: any[] }
    isSuccess: boolean
  } = useQuery(`${ROUTES.API.GET_FORMS}?email=${user?.email}`, {
    enabled: isLoggedIn,
    onError: (error) => {
      console.error(error)
      toast.error('Could not get forms')
    },
  })
  const noExistingForms = !loadingForms && isEmpty(formsData?.forms)
  const {
    mutate: createForm,
    isLoading: creatingForm,
    isSuccess: createdForm,
  } = useMutation(
    () =>
      axios.post(ROUTES.API.CREATE_FORM, {
        email: user?.email,
      }),
    {
      onSuccess({ data: { publicId } }) {
        console.log({ publicId })
        toast.success('Form created!')
        router.push(`${publicId}/${ROUTES.EDIT}`)
      },
      onError(error: any) {
        console.log({ error })
        toast.error('Could not create form. Try again later :)')
      },
    },
  )

  const handleCreateClick = () => createForm()

  const renderForms = () =>
    formsData?.forms?.map((form) => <Form {...form} key={form.id} />)

  const getStatusText = () => {
    if (loadingForms) {
      return {
        heading: 'Loading Your Forms 😘',
        body: 'Hold tight, this is taking some time 😅',
      }
    }

    if (loadingFormsError) {
      return {
        heading: 'Oops, Something went wrong 😢',
        body: "We couldn't load your forms, try again later pls?",
      }
    }

    if (formsLoaded && noExistingForms && !creatingForm) {
      return {
        heading: "You don't have any forms yet 😢",
        body: 'Create your first form by clicking the button below',
      }
    }
    if (formsLoaded && !noExistingForms && !creatingForm) {
      return { heading: "Here's Your Forms 👇", body: null }
    }
    if (creatingForm) {
      return {
        heading: 'Creating Form... 😅',
        body: "We'll redirect you to the form editor in a sec.",
      }
    }
    if (createdForm) {
      return {
        heading: 'Form Created! 🎉',
        body: 'Redirecting now...',
      }
    }
    return {
      heading: '',
      body: '',
    }
  }

  return (
    <Layout showFooter showHeader isProtected title="Dashboard">
      <div className="flex flex-col items-start justify-start flex-grow w-full px-5 mx-auto my-20 overflow-hidden max-w-7xl">
        <div className="w-full">
          <div className="flex flex-col items-center max-w-full xl:flex-row xl:justify-between">
            <h3 className="py-2 text-3xl font-heading">
              {getStatusText().heading}
            </h3>
            {fetchingForms && (
              <div className="flex items-center justify-start">
                <LoadingIcon />
                <span className="ml-2 text-xs">Refreshing...</span>
              </div>
            )}
          </div>
          <div className="flex justify-center w-full h-2 xl:justify-start">
            <p className="text-sm text-gray-500 font-body">
              {getStatusText().body}
            </p>
          </div>
          <div className="flex flex-wrap justify-center w-full my-16 xl:justify-start space-evenly gap-x-9 gap-y-9">
            {renderForms()}
            {!loadingForms && (
              <AddFormButton
                handleCreateClick={handleCreateClick}
                creatingForm={creatingForm}
              />
            )}
          </div>
        </div>
      </div>
      <Toast />
    </Layout>
  )
}

export default DashboardPage

const Form = ({ publicId, name, _count: { responses: responseCount } }) => {
  const href = `${publicId}${ROUTES.EDIT}`
  const handleUnSupportedViewportClick = () => {
    toast(
      `Editing is not supported on smaller screens. The form URL will be copied to your clipboard: ${SITE_DATA.domain}/${publicId}`,
      {
        duration: 6000,
      },
    )

    navigator.clipboard
      .writeText(`https://${SITE_DATA.domain}/${publicId}`)
      .then(
        () => {
          // do nothing on success
        },
        (err) => {
          // freak out on error
          toast.error('Could not copy to clipboard')
        },
      )
  }

  return (
    <>
      <Link href={href}>
        <a className="flex-col items-center justify-center hidden w-32 h-40 text-sm text-center transition-shadow border border-gray-100 rounded-md shadow-md cursor-pointer lg:flex hover:shadow-xl">
          <h1>{name}</h1>
          <p className="mt-2 text-xs text-gray-500">
            {responseCount} response{responseCount > 1 && 's'}
          </p>
        </a>
      </Link>
      <div
        onClick={handleUnSupportedViewportClick}
        className="flex flex-col items-center justify-center w-32 h-40 text-sm text-center transition-shadow border border-gray-100 rounded-md shadow-md cursor-pointer hover:shadow-xl lg:hidden"
      >
        <h1>{name}</h1>
        <p className="mt-2 text-xs text-gray-500">
          {responseCount} response{responseCount > 1 && 's'}
        </p>
      </div>
    </>
  )
}

const AddFormButton = ({ handleCreateClick, creatingForm }) => {
  return (
    <button
      className={`flex items-center justify-center w-32 h-40 text-indigo-900 transition-all ${
        creatingForm
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-gray-100 hover:shadow-xl'
      } rounded-md shadow-md text-7xl group`}
      onClick={handleCreateClick}
      disabled={creatingForm}
    >
      {creatingForm ? (
        <LoadingIcon />
      ) : (
        <span className="transition-all duration-75 group-hover:rotate-12 transform-gpu">
          <PlusIcon />
        </span>
      )}
    </button>
  )
}
