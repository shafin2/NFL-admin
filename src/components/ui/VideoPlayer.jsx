import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react'
import Button from './Button'

const VideoPlayer = ({ src, title, className = '' }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setError(null)
    setIsLoading(true)

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      })
      
      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data)
        if (data.fatal) {
          setError(`Stream error: ${data.details}`)
          setIsLoading(false)
        }
      })

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      setIsLoading(false)
    } else {
      setError('HLS is not supported in this browser')
      setIsLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Play error:', err)
          setError('Failed to play video')
        })
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen()
    }
  }

  const handleVideoClick = () => {
    handlePlayPause()
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium mb-2">Playback Error</p>
          <p className="text-sm opacity-75">{error}</p>
          <Button
            onClick={() => window.open(src, '_blank')}
            className="mt-4 bg-white text-gray-900 hover:bg-gray-100"
          >
            Open Stream in New Tab
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(e) => setIsMuted(e.target.muted)}
        controls={false}
        playsInline
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Button
            onClick={handlePlayPause}
            className="bg-white bg-opacity-90 hover:bg-white text-gray-900 w-16 h-16 rounded-full p-0"
          >
            <Play className="w-8 h-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              onClick={handleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex-1 mx-4">
            <p className="text-sm font-medium truncate">{title}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer 