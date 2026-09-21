"use client"

import { Blobatar } from "@blobatar/react"
import { useGaze } from "@blobatar/react/gaze"
import "blobatar/motion.css"
import "blobatar/gaze.css"

// Blobatar siempre animado (se mueve y parpadea) cuyos ojos siguen el puntero.
export function AnimatedBlobatar({
  name,
  size = 32,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const { ref } = useGaze({ travel: 4, lookAt: "pointer" })

  return (
    <Blobatar
      ref={ref}
      name={name}
      size={size}
      animate="always"
      className={className}
    />
  )
}
