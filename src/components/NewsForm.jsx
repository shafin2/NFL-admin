import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import Button from './ui/Button'
import Input from './ui/Input'
import TextArea from './ui/TextArea'
import Switch from './ui/Switch'
import toast from 'react-hot-toast'

const NewsForm = ({ news, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    image: '',
    source_link: '',
    published_date: '',
    is_featured: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (news) {
      setFormData({
        headline: news.headline || '',
        description: news.description || '',
        image: news.image || '',
        source_link: news.source_link || '',
        published_date: news.published_date 
          ? new Date(news.published_date).toISOString().slice(0, 16) 
          : new Date().toISOString().slice(0, 16),
        is_featured: news.is_featured || false
      })
    } else {
      // Set default published date to now for new articles
      setFormData(prev => ({
        ...prev,
        published_date: new Date().toISOString().slice(0, 16)
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

    if (!formData.published_date) {
      newErrors.published_date = 'Published date is required'
    }

    // Validate URLs if provided
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL'
    }

    if (formData.source_link && !isValidUrl(formData.source_link)) {
      newErrors.source_link = 'Please enter a valid source URL'
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
        published_date: new Date(formData.published_date).toISOString()
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
        value={formData.image}
        onChange={(e) => handleInputChange('image', e.target.value)}
        error={errors.image}
        placeholder="https://example.com/image.jpg"
      />

      {/* Source Link */}
      <Input
        label="Source Link"
        type="url"
        value={formData.source_link}
        onChange={(e) => handleInputChange('source_link', e.target.value)}
        error={errors.source_link}
        placeholder="https://example.com/original-article"
      />

      {/* Published Date */}
      <Input
        label="Published Date"
        type="datetime-local"
        value={formData.published_date}
        onChange={(e) => handleInputChange('published_date', e.target.value)}
        error={errors.published_date}
        required
      />

      {/* Featured Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <Switch
          label="Featured Article"
          description="Mark this article as featured to highlight it in the app"
          checked={formData.is_featured}
          onChange={(checked) => handleInputChange('is_featured', checked)}
        />
      </div>

      {/* Preview Section */}
      {(formData.headline || formData.description || formData.image) && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            {formData.headline && (
              <h4 className="font-semibold text-gray-900 mb-2">{formData.headline}</h4>
            )}
            {formData.description && (
              <p className="text-gray-600 text-sm">{formData.description}</p>
            )}
            {formData.is_featured && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured Article
                </span>
              </div>
            )}
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