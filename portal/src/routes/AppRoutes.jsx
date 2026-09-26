import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const Energy = lazy(() => import('../pages/Energy'))
const Installers = lazy(() => import('../pages/Energy/Installers'))
const Vehicles = lazy(() => import('../pages/Energy/Vehicles'))
const ElectronicCommunications = lazy(() => import('../pages/ElectronicCommunications'))
const SpaceSatellite = lazy(() => import('../pages/SpaceSatellite'))
const Broadcasting = lazy(() => import('../pages/Broadcasting'))
const SpaceSatellitePage = lazy(() => import('../pages/SpaceSatellite/SpacePage'))
const Policies = lazy(() => import('../pages/Policies'))
const Consultations = lazy(() => import('../pages/Consultations'))
const Projects = lazy(() => import('../pages/Projects'))
const ProjectDetail = lazy(() => import('../pages/Projects/ProjectDetail'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const RenewableDashboard = lazy(() => import('../pages/Dashboard/RenewableDashboard'))
const TransitionDashboard = lazy(() => import('../pages/Dashboard/TransitionDashboard'))
const Registry = lazy(() => import('../pages/Registry'))
const GIS = lazy(() => import('../pages/GIS'))
const Education = lazy(() => import('../pages/Education'))
const Bursary = lazy(() => import('../pages/Bursary'))
const Innovation = lazy(() => import('../pages/Innovation'))
const News = lazy(() => import('../pages/News'))
const NewsArticle = lazy(() => import('../pages/News/NewsArticle'))
const Contact = lazy(() => import('../pages/Contact'))
const LegalPage = lazy(() => import('../pages/Legal/LegalPage'))
const NotFound = lazy(() => import('../pages/NotFound'))

function PageLoader() {
  return <LoadingSpinner label="Loading page" />
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="energy" element={<Energy />} />
          <Route path="energy/installers" element={<Installers />} />
          <Route path="energy/vehicles" element={<Vehicles />} />
          <Route path="electronic-communications" element={<ElectronicCommunications />} />
          <Route path="broadcasting" element={<Broadcasting />} />
          <Route path="space-satellite" element={<SpaceSatellite />} />
          <Route path="space-satellite/:slug" element={<SpaceSatellitePage />} />
          <Route path="policies" element={<Policies />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          {/* Three sibling pages, not a tabbed parent. The two dashboards each
              carry their own banner now, and /dashboard is a hub that links to
              them. The URLs are unchanged, so every existing link still works. */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/renewable" element={<RenewableDashboard />} />
          <Route path="dashboard/transition" element={<TransitionDashboard />} />
          <Route path="registry" element={<Registry />} />
          <Route path="gis" element={<GIS />} />
          <Route path="education" element={<Education />} />
          <Route path="bursary" element={<Bursary />} />
          <Route path="innovation" element={<Innovation />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<NewsArticle />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<LegalPage />} />
          <Route path="terms" element={<LegalPage />} />
          <Route path="accessibility" element={<LegalPage />} />
          <Route path="cookies" element={<LegalPage />} />
          <Route path="image-credits" element={<LegalPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
