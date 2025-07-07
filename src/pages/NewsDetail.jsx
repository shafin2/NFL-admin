import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Crown, Edit, ExternalLink, Image as ImageIcon, User } from 'lucide-react'
import { apiService } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const NewsDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
      setLoading(true)
      const response = await apiService.getNewsItem(id)
        if (response.success) {
          setNews(response.data)
        } else {
          toast.error('Failed to load news article')
          navigate('/news')
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        toast.error('Failed to load news article')
        navigate('/news')
      } finally {
      setLoading(false)
      }
    }
    fetchNews()
  }, [id, navigate])

  const handleEdit = () => {
    navigate(`/news/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading news article..." />
      </div>
    )
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">News article not found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/news')}>
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/news')}>
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Button>
        <Button onClick={handleEdit}>
          <Edit className="w-4 h-4" />
          Edit Article
        </Button>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image */}
        {news.image_url && (
          <div className="relative">
            <img 
              src={news.image_url} 
              alt={news.image_alt || news.headline}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {news.image_caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <p className="text-sm">{news.image_caption}</p>
              </div>
            )}
          </div>
        )}

        {/* Article Header */}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              news.type === 'Breaking' ? 'bg-red-100 text-red-800' :
              news.type === 'Video' ? 'bg-blue-100 text-blue-800' :
              news.type === 'Photo' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {news.type}
            </span>
            
            {news.is_premium && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Crown className="w-4 h-4" />
                Premium
              </span>
            )}

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              news.source === 'api' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {news.source === 'api' ? 'API' : 'Manual'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">{news.headline}</h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b">
            {news.byline && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By {news.byline}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(news.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose max-w-none">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
              {news.description}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Article ID:</span>
            <span className="ml-2 text-gray-600">{news._id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-600">
              {new Date(news.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <span className="ml-2 text-gray-600">
              {new Date(news.updatedAt).toLocaleDateString()}
            </span>
          </div>
          {news.api_id && (
            <div>
              <span className="font-medium text-gray-700">API ID:</span>
              <span className="ml-2 text-gray-600">{news.api_id}</span>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

export default NewsDetail 