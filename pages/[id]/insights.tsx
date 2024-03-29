import Layout from '@components/layout'
import BackButton from '@components/back-button'

const Card = ({ title, number }) => {
  return (
    <div className="flex flex-col justify-center items-center text-sm shadow-sm rounded-sm border border-gray-100 py-5 w-full max-w-[220px] bg-white">
      <p className="text-xl">{number}</p>
      <h3>{title}</h3>
    </div>
  )
}
const InsightsPage = (data) => {
  const {
    uniqueVisitors = 1,
    responseCount = 1,
    visitDuration = 1,
    completionRate = 1,
  } = data

  return (
    <Layout isProtected title="Analytics">
      <div className="overflow-hidden bg-slate-50">
        <div className="flex-col h-screen max-h-screen lg:flex">
          <header className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-200">
            <div className="flex">
              <div className="flex items-center justify-center border-r border-gray-300 pr-7 mr-7">
                <BackButton />
              </div>
              <h1 className="flex items-center justify-center text-lg gap-x-2">
                Settings
              </h1>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl pt-16">
            <h2 className="text-lg mb-3">Integrations</h2>
            <div className="flex w-full gap-x-6">
              <Card title="Unique Visitors" number={uniqueVisitors} />
              <Card title="Total Responses" number={responseCount} />
              <Card title="Visit Duration" number={visitDuration} />
              <Card title="Completion Rate" number={completionRate} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default InsightsPage
