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
  { value: 'closed', label: 'Closed' },
  { value: 'replay', label: 'Replay' }
]

const MatchForm = ({ match, channels, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    game_id: '',
    title: '',
    round: '',
    home_team: '',
    away_team: '',
    scheduled_at: '',
    status: 'upcoming',
    m3u8_links: [{ name: '', url: '' }],
    live_channel_ids: [],
    score: { home: 0, away: 0 },
    metadata: {
      venue: { name: '', city: '', state: '' },
      game_type: '',
      weather: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (match) {
      setFormData({
        game_id: match.game_id || '',
        title: match.title || '',
        round: match.round || '',
        home_team: match.home_team || '',
        away_team: match.away_team || '',
        scheduled_at: match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(0, 16) : '',
        status: match.status || 'upcoming',
        m3u8_links: match.m3u8_links && match.m3u8_links.length > 0 ? match.m3u8_links : [{ name: '', url: '' }],
        live_channel_ids: match.live_channel_ids || [],
        score: match.score || { home: 0, away: 0 },
        metadata: {
          venue: match.metadata?.venue || { name: '', city: '', state: '' },
          game_type: match.metadata?.game_type || '',
          weather: match.metadata?.weather || ''
        }
      })
    }
  }, [match])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleM3u8LinkChange = (index, field, value) => {
    const newLinks = [...formData.m3u8_links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFormData(prev => ({ ...prev, m3u8_links: newLinks }))
  }

  const addM3u8Link = () => {
    setFormData(prev => ({
      ...prev,
      m3u8_links: [...prev.m3u8_links, { name: '', url: '' }]
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

    if (!formData.game_id.trim()) {
      newErrors.game_id = 'Game ID is required'
    }

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

    // Validate m3u8 links
    const validM3u8Links = formData.m3u8_links.filter(link => link.name.trim() && link.url.trim())
    if (validM3u8Links.length > 0) {
      const invalidLinks = validM3u8Links.some(link => !isValidUrl(link.url))
      if (invalidLinks) {
        newErrors.m3u8_links = 'Please enter valid URLs for all m3u8 links'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
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
      
      // Filter out empty m3u8 links and prepare data
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

  const channelOptions = channels.map(channel => ({
    value: channel._id,
    label: channel.name
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Game ID"
          value={formData.game_id}
          onChange={(e) => handleInputChange('game_id', e.target.value)}
          error={errors.game_id}
          required
          placeholder="e.g., game-123-456"
        />
        
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="e.g., NFC Wild Card"
        />
      </div>

      {/* Team Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          placeholder="e.g., Buffalo Bills"
        />

        <Input
          label="Round"
          value={formData.round}
          onChange={(e) => handleInputChange('round', e.target.value)}
          placeholder="e.g., Wild Card Round"
        />
      </div>

      {/* Date and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          onChange={(e) => handleInputChange('status', e.target.value)}
          options={statusOptions}
          error={errors.status}
          required
        />
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Home Team Score"
          type="number"
          min="0"
          value={formData.score.home}
          onChange={(e) => handleScoreChange('home', e.target.value)}
          placeholder="0"
        />
        
        <Input
          label="Away Team Score"
          type="number"
          min="0"
          value={formData.score.away}
          onChange={(e) => handleScoreChange('away', e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Venue Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Venue Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Venue Name"
            value={formData.metadata.venue.name}
            onChange={(e) => handleVenueChange('name', e.target.value)}
            placeholder="e.g., Lincoln Financial Field"
          />
          
          <Input
            label="City"
            value={formData.metadata.venue.city}
            onChange={(e) => handleVenueChange('city', e.target.value)}
            placeholder="e.g., Philadelphia"
          />
          
          <Input
            label="State"
            value={formData.metadata.venue.state}
            onChange={(e) => handleVenueChange('state', e.target.value)}
            placeholder="e.g., PA"
          />
        </div>
      </div>

      {/* Additional Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Game Type"
          value={formData.metadata.game_type}
          onChange={(e) => handleMetadataChange('game_type', e.target.value)}
          placeholder="e.g., playoff, regular"
        />
        
        <Input
          label="Weather"
          value={formData.metadata.weather}
          onChange={(e) => handleMetadataChange('weather', e.target.value)}
          placeholder="e.g., Cloudy, 40°F"
        />
      </div>

      {/* Channel Assignment */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Assigned Channels (Multi-select)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {channelOptions.map(channel => (
            <label key={channel.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.live_channel_ids.includes(channel.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      live_channel_ids: [...prev.live_channel_ids, channel.value]
                    }))
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      live_channel_ids: prev.live_channel_ids.filter(id => id !== channel.value)
                    }))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{channel.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* M3U8 Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            M3U8 Stream Links
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addM3u8Link}
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </div>
        
        {formData.m3u8_links.map((link, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={link.name}
                onChange={(e) => handleM3u8LinkChange(index, 'name', e.target.value)}
                placeholder={`Stream name ${index + 1}`}
              />
              <Input
                type="url"
                value={link.url}
                onChange={(e) => handleM3u8LinkChange(index, 'url', e.target.value)}
                placeholder={`Stream URL ${index + 1}`}
              />
            </div>
            {formData.m3u8_links.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeM3u8Link(index)}
                className="mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {errors.m3u8_links && (
          <p className="text-sm text-red-600">{errors.m3u8_links}</p>
        )}
      </div>

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