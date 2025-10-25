import { type FC } from 'react'

export function GridSkeleton(){
  return <div className="animate-pulse bg-gray-200 h-32 rounded" />
}

interface SkeletonProps {
  className?: string
}

export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-muted rounded ${className}`}
      role="status"
      aria-label="Loading..."
    />
  )
}

export default Skeleton
