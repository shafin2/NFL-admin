import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const NewsDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      const response = await apiService.getNewsItem(id)
      if (response.success) setNews(response.data)
      setLoading(false)
    }
    fetchNews()
  }, [id])

  if (loading) return <LoadingSpinner text="Loading news article..." />
  if (!news) return <div className="p-8">News article not found.</div>

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-2">{news.headline}</h2>
      <div className="mb-2 text-gray-600">Published: {news.published_at ? new Date(news.published_at).toLocaleString() : ''}</div>
      {news.images && news.images.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {news.images.map((img, idx) => (
            <img key={idx} src={img.url} alt="news" className="w-40 h-24 object-cover rounded" />
          ))}
        </div>
      )}
      <div className="mb-4 text-gray-800 whitespace-pre-line">{news.description}</div>
      {news.article_link && (
        <a href={news.article_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Read original article</a>
      )}
      <div className="mt-4 text-sm text-gray-500">News ID: {news._id}</div>
    </div>
  )
}

export default NewsDetail 