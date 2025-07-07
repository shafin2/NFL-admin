import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import Button from './ui/Button'
import Input from './ui/Input'
import TextArea from './ui/TextArea'
import Select from './ui/Select'
import Switch from './ui/Switch'
import toast from 'react-hot-toast'

const NewsForm = ({ news, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    image_url: '',
    image_alt: '',
    image_caption: '',
    byline: '',
    published_at: '',
    type: 'Story',
    is_premium: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (news) {
      setFormData({
        headline: news.headline || '',
        description: news.description || '',
        image_url: news.image_url || '',
        image_alt: news.image_alt || '',
        image_caption: news.image_caption || '',
        byline: news.byline || '',
        published_at: news.published_at 
          ? new Date(news.published_at).toISOString().slice(0, 16) 
          : new Date().toISOString().slice(0, 16),
        type: news.type || 'Story',
        is_premium: news.is_premium || false
      })
    } else {
      // Set default published date to now for new articles
      setFormData(prev => ({
        ...prev,
        published_at: new Date().toISOString().slice(0, 16)
      }))
    }
  }, [news])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.published_at) {
      newErrors.published_at = 'Published date is required'
    }

    // Validate URLs if provided
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid image URL'
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
      
      const cleanFormData = {
        ...formData,
        published_at: new Date(formData.published_at).toISOString()
      }

      let response
      if (news) {
        response = await apiService.updateNews(news._id, cleanFormData)
      } else {
        response = await apiService.createNews(cleanFormData)
      }

      if (response.success) {
        toast.success(`Article ${news ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        toast.error(response.message || `Failed to ${news ? 'update' : 'create'} article`)
      }
    } catch (error) {
      console.error('Error saving news:', error)
      toast.error(`Failed to ${news ? 'update' : 'create'} article`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Headline */}
      <Input
        label="Headline"
        value={formData.headline}
        onChange={(e) => handleInputChange('headline', e.target.value)}
        error={errors.headline}
        required
        placeholder="Enter the news headline..."
      />

      {/* Description */}
      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
        required
        rows={4}
        placeholder="Enter the article description or summary..."
      />

      {/* Image URL */}
      <Input
        label="Image URL"
        type="url"
        value={formData.image_url}
        onChange={(e) => handleInputChange('image_url', e.target.value)}
        error={errors.image_url}
        placeholder="https://example.com/image.jpg"
      />

      {/* Image Alt Text */}
      <Input
        label="Image Alt Text"
        value={formData.image_alt}
        onChange={(e) => handleInputChange('image_alt', e.target.value)}
        placeholder="Describe the image for accessibility"
      />

      {/* Image Caption */}
      <Input
        label="Image Caption"
        value={formData.image_caption}
        onChange={(e) => handleInputChange('image_caption', e.target.value)}
        placeholder="Caption or credit for the image"
      />

      {/* Byline */}
      <Input
        label="Author/Byline"
        value={formData.byline}
        onChange={(e) => handleInputChange('byline', e.target.value)}
        placeholder="Author name or source"
      />

      {/* Published Date */}
      <Input
        label="Published Date"
        type="datetime-local"
        value={formData.published_at}
        onChange={(e) => handleInputChange('published_at', e.target.value)}
        error={errors.published_at}
        required
      />

      {/* Type Selection */}
      <Select
        label="Article Type"
        value={formData.type}
        onChange={(e) => handleInputChange('type', e.target.value)}
        options={[
          { value: 'Story', label: 'Story' },
          { value: 'Video', label: 'Video' },
          { value: 'Photo', label: 'Photo' },
          { value: 'Breaking', label: 'Breaking News' }
        ]}
      />

      {/* Premium Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <Switch
          label="Premium Article"
          description="Mark this article as premium content"
          checked={formData.is_premium}
          onChange={(checked) => handleInputChange('is_premium', checked)}
        />
      </div>

      {/* Preview Section */}
      {(formData.headline || formData.description || formData.image_url) && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {formData.image_url && (
              <div className="mb-4">
                <img 
                  src={formData.image_url} 
                  alt={formData.image_alt || "Preview"} 
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                {formData.image_caption && (
                  <p className="text-xs text-gray-500 mt-1">{formData.image_caption}</p>
                )}
              </div>
            )}
            {formData.headline && (
              <h4 className="font-semibold text-gray-900 mb-2">{formData.headline}</h4>
            )}
            {formData.byline && (
              <p className="text-sm text-gray-600 mb-2">By {formData.byline}</p>
            )}
            {formData.description && (
              <p className="text-gray-600 text-sm">{formData.description}</p>
            )}
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {formData.type}
              </span>
              {formData.is_premium && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Premium
                </span>
              )}
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
          {news ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </form>
  )
}

export default NewsForm 