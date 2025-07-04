import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const MatchDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true)
      const response = await apiService.getMatch(id)
      if (response.success) setMatch(response.data)
      setLoading(false)
    }
    fetchMatch()
  }, [id])

  if (loading) return <LoadingSpinner text="Loading match details..." />
  if (!match) return <div className="p-8">Match not found.</div>

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-2">{match.title}</h2>
      <div className="mb-2 text-gray-600">Status: <span className="font-semibold">{match.status}</span></div>
      <div className="mb-2">Scheduled: {new Date(match.scheduled_at).toLocaleString()}</div>
      <div className="mb-2">Home: <b>{match.home_team}</b> vs Away: <b>{match.away_team}</b></div>
      {match.score && (
        <div className="mb-2">Score: {match.score.home} - {match.score.away}</div>
      )}
      {match.venue && (
        <div className="mb-2">Venue: {match.venue.name}, {match.venue.city}, {match.venue.state}</div>
      )}
      {match.m3u8_links && match.m3u8_links.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Streams:</div>
          <ul className="list-disc ml-6">
            {match.m3u8_links.map((link, idx) => (
              <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link.name || link.url}</a></li>
            ))}
          </ul>
        </div>
      )}
      {match.channels && match.channels.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold">Channels:</div>
          <ul className="list-disc ml-6">
            {match.channels.map((ch, idx) => (
              <li key={idx}>{ch.name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-500">Game ID: {match.game_id}</div>
    </div>
  )
}

export default MatchDetail 