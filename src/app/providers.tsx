'use client'

import { useEffect, useState } from 'react'
import { Provider, useSelector } from 'react-redux'
import { store } from '@/src/store/store'
import { loadUserFromStorage } from '@/src/store/slices/authSlice'
import { useWebSocket } from '@/src/hooks/useWebSocket' 
import { authAPI } from '@/src/services/authService'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('🔄 [Auth] Loading user from storage...')
    store.dispatch(loadUserFromStorage())
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

// FIXED: WebSocket initializer using the combined hook
function WebSocketInitializer({ children }: { children: React.ReactNode }) {
  // Get auth state
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  
  // Get token from cookies
  const tokens = authAPI.getAuthTokens();
  const token = tokens?.access || null;
  
  // Use the COMBINED hook that handles both connection AND events
  useWebSocket(isAuthenticated ? token : null);
  
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <WebSocketInitializer>
          {children}
        </WebSocketInitializer>
      </AuthInitializer>
    </Provider>
  )
}