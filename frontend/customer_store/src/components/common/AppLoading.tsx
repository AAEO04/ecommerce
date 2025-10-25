'use client'

import { type FC } from 'react'
import { Skeleton } from '@/components/ui'

interface AppLoadingProps {
  title?: string
  subtitle?: string
}

export const AppLoading: FC<AppLoadingProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait while we load your content.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default AppLoading