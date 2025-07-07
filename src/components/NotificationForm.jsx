import { useState } from 'react'
import Input from './ui/Input'
import TextArea from './ui/TextArea'
import Button from './ui/Button'
import Switch from './ui/Switch'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

// props: onSent, onCancel
export default function NotificationForm({ onSent, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    link: '',
    withLink: false,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Title and Body are required')
      return
    }
    try {
      setLoading(true)
      const payload = {
        title: formData.title,
        body: formData.body,
      }
      if (formData.withLink && formData.link.trim()) {
        payload.link = formData.link.trim()
      }
      const res = await apiService.sendNotification(payload)
      if (res.success) {
        toast.success('Notification sent')
        onSent && onSent()
      } else {
        toast.error(res.message || 'Failed to send')
      }
    } catch (err) {
      console.error('Send noti error', err)
      toast.error('Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        required
      />
      <TextArea
        label="Body"
        value={formData.body}
        onChange={(e) => handleChange('body', e.target.value)}
        required
      />
      <Switch
        label="Include External Link"
        checked={formData.withLink}
        onChange={(checked) => handleChange('withLink', checked)}
      />
      {formData.withLink && (
        <Input
          label="Link URL"
          type="url"
          value={formData.link}
          onChange={(e) => handleChange('link', e.target.value)}
          required
        />
      )}
      <div className="flex space-x-3">
        <Button type="submit" loading={loading}>
          Send Notification
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 