import { Navigate, Outlet } from 'react-router-dom'

export default function RouteGuard({ isAllowed = true, redirectTo = '/' }) {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
