import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import TextArea from './ui/TextArea'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'replay', label: 'Replay' }
]

const MatchForm = ({ match, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    round: '',
    home_team: '',
    away_team: '',
    scheduled_at: '',
    status: 'upcoming',
    m3u8_links: [],
    score: { home: 0, away: 0 },
    metadata: {
      venue: { name: '', city: '', state: '' },
      game_type: '',
      weather: ''
    }
  })
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchChannels()
    if (match) {
      setFormData({
        title: match.title || '',
        round: match.round || '',
        home_team: match.home_team || '',
        away_team: match.away_team || '',
        scheduled_at: match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(0, 16) : '',
        status: match.status || 'upcoming',
        m3u8_links: match.m3u8_links || [],
        score: match.score || { home: 0, away: 0 },
        metadata: {
          venue: match.metadata?.venue || { name: '', city: '', state: '' },
          game_type: match.metadata?.game_type || '',
          weather: match.metadata?.weather || ''
        }
      })
    }
  }, [match])

  const fetchChannels = async () => {
    try {
      const response = await apiService.getChannelsForDropdown()
      if (response.success) {
        setChannels(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleStatusChange = (event) => {
    const status = event.target.value
    setFormData(prev => {
      const newData = { ...prev, status }
      // Clear m3u8_links if status is upcoming
      if (status === 'upcoming') {
        newData.m3u8_links = []
      }
      // Add empty m3u8_links if status is live or replay and no links exist
      else if ((status === 'live' || status === 'replay') && newData.m3u8_links.length === 0) {
        newData.m3u8_links = [{ name: '', url: '' }]
      }
      return newData
    })
  }

  const handleM3u8LinkChange = (index, field, value) => {
    const newLinks = [...formData.m3u8_links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFormData(prev => ({ ...prev, m3u8_links: newLinks }))
  }

  const addM3u8Link = () => {
    setFormData(prev => ({
      ...prev,
      m3u8_links: [...prev.m3u8_links, { name: '', url: '', userAgent: '', origin: '', referer: '' }]
    }))
  }

  const removeM3u8Link = (index) => {
    if (formData.m3u8_links.length > 1) {
      const newLinks = formData.m3u8_links.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, m3u8_links: newLinks }))
    }
  }

  const handleScoreChange = (team, value) => {
    setFormData(prev => ({
      ...prev,
      score: { ...prev.score, [team]: parseInt(value) || 0 }
    }))
  }

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }))
  }

  const handleVenueChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        venue: { ...prev.metadata.venue, [field]: value }
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.home_team.trim()) {
      newErrors.home_team = 'Home team is required'
    }

    if (!formData.away_team.trim()) {
      newErrors.away_team = 'Away team is required'
    }

    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Scheduled date and time is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    // Validate m3u8 links based on status
    if (formData.status === 'live' || formData.status === 'replay') {
      if (!formData.m3u8_links || formData.m3u8_links.length === 0) {
        newErrors.m3u8_links = 'M3U8 links are required for live and replay matches'
      } else {
        const invalidLinks = formData.m3u8_links.some(link => !link.name.trim() || !link.url.trim() || !isValidUrl(link.url))
        if (invalidLinks) {
          newErrors.m3u8_links = 'All M3U8 links must have both name and valid URL'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return string.includes('.m3u8')
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setLoading(true)
      
      // Prepare data
      const cleanFormData = {
        ...formData,
        m3u8_links: formData.m3u8_links.filter(link => link.name.trim() && link.url.trim()),
        scheduled_at: new Date(formData.scheduled_at).toISOString()
      }

      let response
      if (match) {
        response = await apiService.updateMatch(match._id, cleanFormData)
      } else {
        response = await apiService.createMatch(cleanFormData)
      }

      if (response.success) {
        toast.success(`Match ${match ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        toast.error(response.message || `Failed to ${match ? 'update' : 'create'} match`)
      }
    } catch (error) {
      console.error('Error saving match:', error)
      toast.error(`Failed to ${match ? 'update' : 'create'} match`)
    } finally {
      setLoading(false)
    }
  }

  const canAddM3u8Links = formData.status === 'live' || formData.status === 'replay'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Match Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="e.g., Chiefs vs Cowboys"
        />

        <Input
          label="Round"
          value={formData.round}
          onChange={(e) => handleInputChange('round', e.target.value)}
          placeholder="e.g., Week 1, Wild Card"
        />

        <Input
          label="Home Team"
          value={formData.home_team}
          onChange={(e) => handleInputChange('home_team', e.target.value)}
          error={errors.home_team}
          required
          placeholder="e.g., Kansas City Chiefs"
        />

        <Input
          label="Away Team"
          value={formData.away_team}
          onChange={(e) => handleInputChange('away_team', e.target.value)}
          error={errors.away_team}
          required
          placeholder="e.g., Dallas Cowboys"
        />

        <Input
          label="Scheduled Date & Time"
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
          error={errors.scheduled_at}
          required
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={handleStatusChange}
          options={statusOptions}
          error={errors.status}
          required
        />
      </div>

      {/* M3U8 Links */}
      {canAddM3u8Links && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              M3U8 Stream Links
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addM3u8Link}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Link
            </Button>
          </div>

          {formData.m3u8_links.map((link, index) => (
            <div key={index} className="flex flex-col gap-2 border rounded-lg p-3 mb-2 bg-gray-50">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Select
                    label={index === 0 ? 'Stream Name' : ''}
                    value={link.name}
                    onChange={(e) => handleM3u8LinkChange(index, 'name', e.target.value)}
                    options={channels.map(channel => ({
                      value: channel.name,
                      label: channel.name
                    }))}
                    placeholder="Select channel name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label={index === 0 ? 'Stream URL' : ''}
                    value={link.url}
                    onChange={(e) => handleM3u8LinkChange(index, 'url', e.target.value)}
                    placeholder="https://example.com/stream.m3u8"
                    required
                  />
                </div>
                {formData.m3u8_links.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeM3u8Link(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {/* New fields for headers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <Input
                  label="User-Agent (optional)"
                  value={link.userAgent || ''}
                  onChange={e => handleM3u8LinkChange(index, 'userAgent', e.target.value)}
                  placeholder="e.g. Mozilla/5.0 ..."
                />
                <Input
                  label="Origin (optional)"
                  value={link.origin || ''}
                  onChange={e => handleM3u8LinkChange(index, 'origin', e.target.value)}
                  placeholder="e.g. https://example.com"
                />
                <Input
                  label="Referer (optional)"
                  value={link.referer || ''}
                  onChange={e => handleM3u8LinkChange(index, 'referer', e.target.value)}
                  placeholder="e.g. https://example.com/"
                />
              </div>
            </div>
          ))}
          {errors.m3u8_links && (
            <p className="text-sm text-red-600">{errors.m3u8_links}</p>
          )}
        </div>
      )}

      {/* Score */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Score</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Home Score"
            type="number"
            min="0"
            value={formData.score.home}
            onChange={(e) => handleScoreChange('home', e.target.value)}
          />
          <Input
            label="Away Score"
            type="number"
            min="0"
            value={formData.score.away}
            onChange={(e) => handleScoreChange('away', e.target.value)}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Venue Name"
            value={formData.metadata.venue.name}
            onChange={(e) => handleVenueChange('name', e.target.value)}
            placeholder="e.g., Arrowhead Stadium"
          />
          <Input
            label="City"
            value={formData.metadata.venue.city}
            onChange={(e) => handleVenueChange('city', e.target.value)}
            placeholder="e.g., Kansas City"
          />
          <Input
            label="State"
            value={formData.metadata.venue.state}
            onChange={(e) => handleVenueChange('state', e.target.value)}
            placeholder="e.g., Missouri"
          />
          <Input
            label="Game Type"
            value={formData.metadata.game_type}
            onChange={(e) => handleMetadataChange('game_type', e.target.value)}
            placeholder="e.g., Regular Season, Playoff"
          />
        </div>
        <TextArea
          label="Weather"
          value={formData.metadata.weather}
          onChange={(e) => handleMetadataChange('weather', e.target.value)}
          placeholder="e.g., Clear, 72°F, Wind 5 mph"
          rows={2}
        />
      </div>

      {/* Status Info */}
      {formData.status === 'upcoming' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> M3U8 links cannot be added for upcoming matches. Change status to 'Live' or 'Replay' to add streaming links.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {match ? 'Update Match' : 'Create Match'}
        </Button>
      </div>
    </form>
  )
}

export default MatchForm 