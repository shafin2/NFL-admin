import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Tv, ExternalLink } from 'lucide-react'
import { apiService } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import VideoPlayer from '../components/ui/VideoPlayer'
import toast from 'react-hot-toast'

const MatchDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState(null)

  useEffect(() => {
    const fetchMatch = async () => {
      try {
      setLoading(true)
      const response = await apiService.getMatch(id)
        if (response.success) {
          setMatch(response.data)
          // Auto-select first stream if available
          if (response.data.m3u8_links && response.data.m3u8_links.length > 0) {
            setSelectedStream(response.data.m3u8_links[0])
          }
        } else {
          toast.error('Failed to load match details')
        }
      } catch (error) {
        console.error('Error fetching match:', error)
        toast.error('Failed to load match details')
      } finally {
      setLoading(false)
      }
    }
    fetchMatch()
  }, [id])

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-800',
      live: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      replay: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const handleStreamSelect = (stream) => {
    setSelectedStream(stream)
  }

  const handlePlayInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h2>
          <p className="text-gray-600 mb-6">The match you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/matches')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/matches')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Matches
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{match.title}</h1>
            <div className="flex items-center gap-4 text-lg text-gray-600">
              <span className="font-semibold">{match.away_team}</span>
              <span>@</span>
              <span className="font-semibold">{match.home_team}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(match.status)}`}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Information</h2>
            
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Scheduled</div>
                  <div className="text-sm text-gray-600">
                    {new Date(match.scheduled_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Score</div>
                  <div className="text-sm text-gray-600">
                    {match.score?.home || 0} - {match.score?.away || 0}
                  </div>
                </div>
              </div>

              {/* Venue */}
              {match.metadata?.venue?.name && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Venue</div>
                    <div className="text-sm text-gray-600">
                      {match.metadata.venue.name}
                      {match.metadata.venue.city && `, ${match.metadata.venue.city}`}
                      {match.metadata.venue.state && `, ${match.metadata.venue.state}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Round */}
              {match.round && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">R</span>
                  </div>
                  <div>
                    <div className="font-medium">Round</div>
                    <div className="text-sm text-gray-600">{match.round}</div>
                  </div>
                </div>
              )}

              {/* Game Type */}
              {match.metadata?.game_type && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">T</span>
                  </div>
                  <div>
                    <div className="font-medium">Game Type</div>
                    <div className="text-sm text-gray-600">{match.metadata.game_type}</div>
                  </div>
                </div>
              )}

              {/* Weather */}
              {match.metadata?.weather && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">W</span>
                  </div>
                  <div>
                    <div className="font-medium">Weather</div>
                    <div className="text-sm text-gray-600">{match.metadata.weather}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stream Player & Links */}
        <div className="lg:col-span-2">
          {match.m3u8_links && match.m3u8_links.length > 0 ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Stream Player</h2>
                
                {selectedStream ? (
                  <div className="space-y-4">
                    <VideoPlayer
                      src={selectedStream.url}
                      title={`${selectedStream.name} - ${match.title}`}
                      className="aspect-video"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Stream: {selectedStream.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayInNewTab(selectedStream.url)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Tv className="w-16 h-16 mx-auto mb-4" />
                      <p>Select a stream to play</p>
                    </div>
        </div>
      )}
              </div>

              {/* Stream Links */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Streams</h2>
                
                <div className="space-y-2">
                  {match.m3u8_links.map((stream, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStream?.url === stream.url
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStreamSelect(stream)}
                    >
                      <div className="flex items-center gap-3">
                        <Tv className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{stream.name}</div>
                          <div className="text-sm text-gray-500">M3U8 Stream</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayInNewTab(stream.url)
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedStream?.url === stream.url ? "primary" : "ghost"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStreamSelect(stream)
                          }}
                        >
                          {selectedStream?.url === stream.url ? 'Playing' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <Tv className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Streams Available</h3>
                <p className="text-gray-600">
                  {match.status === 'upcoming' 
                    ? 'Stream links will be available when the match goes live or becomes available for replay.'
                    : 'No stream links have been configured for this match.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MatchDetail 