import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import Button from './ui/Button'
import Input from './ui/Input'
import toast from 'react-hot-toast'

const ChannelForm = ({ channel, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name || ''
      })
    }
  }, [channel])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Channel name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setLoading(true)
      
      const cleanFormData = {
        name: formData.name.trim()
      }

      let response
      if (channel) {
        response = await apiService.updateChannel(channel._id, cleanFormData)
      } else {
        response = await apiService.createChannel(cleanFormData)
      }

      if (response.success) {
        toast.success(`Channel ${channel ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        toast.error(response.message || `Failed to ${channel ? 'update' : 'create'} channel`)
      }
    } catch (error) {
      console.error('Error saving channel:', error)
      toast.error(`Failed to ${channel ? 'update' : 'create'} channel`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Channel Name */}
      <Input
        label="Channel Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        required
        placeholder="e.g., ESPN, Fox Sports, NBC"
      />

      {/* Preview */}
      {formData.name && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{formData.name}</div>
                <div className="text-sm text-gray-500">
                  Channel for M3U8 stream names
                </div>
              </div>
            </div>
          </div>
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
          {channel ? 'Update Channel' : 'Create Channel'}
        </Button>
      </div>
    </form>
  )
}

export default ChannelForm 