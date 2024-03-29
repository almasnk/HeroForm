import { ROUTES } from '@constants/routes'
import { SITE_DATA } from '@constants/site-data'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Link from 'next/link'
export const UnAuthenticated = ({ handleSignInClick }) => {
  const isLoginPage = useRouter().pathname === '/login'

  return (
    <>
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center gap-y-7">
        <h1 className="text-4xl tracking-normal">
          {isLoginPage ? 'Welcome back!' : 'Sign Up to ' + SITE_DATA.name}
        </h1>
        {isLoginPage ? (
          <p className="mb-3 text-center text-gray-600 text-md">
            Click the button below to continue. This will prompt you to give
            access to{' '}
            <Image
              width={20}
              height={20}
              src={require('/public/images/sheets.png')}
              alt="sheets"
            />{' '}
            <b>Google Sheets</b> again for security purposes.
          </p>
        ) : (
          <p className="mb-3 text-center text-gray-600 text-md">
            Click the button below to connect your{' '}
            <Image
              width={20}
              height={20}
              src={require('/public/images/sheets.png')}
              alt="sheets"
            />{' '}
            <b>Google Sheets</b> &amp; start creating forms/surveys.
          </p>
        )}
      </div>
      <button
        onClick={handleSignInClick}
        className="flex items-center justify-center px-6 py-3 font-medium text-gray-600 border border-gray-200 rounded-lg shadow-3xl gap-x-4"
      >
        <GoogleLogoIcon />
        <span className="ml-3">Continue with Google</span>
      </button>

      <div className="flex justify-center items-center text-sm gap-x-1 mt-6">
        <p>
          {isLoginPage ? "Don't have an account?" : 'Already Have An Account?'}
        </p>
        <Link href={ROUTES.CONTINUE}>
          <a className="text-blue-500 hover:text-blue-900 transition-all underline">
            {isLoginPage ? 'Sign Up' : 'Log back in'}
          </a>
        </Link>
      </div>

      <div className="block max-w-md px-6 py-3 mt-12 text-sm rounded-lg bg-indigo-50">
        📌 &nbsp;{SITE_DATA.name} will *only* be able to view the spreadsheets
        that are going to be created with our tool and nothing else.
      </div>
    </>
  )
}

const GoogleLogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
)
