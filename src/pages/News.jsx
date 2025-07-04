import { useState, useEffect } from 'react'
import { Newspaper, Plus, Edit, Trash2, Filter, Star, ExternalLink, Image } from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'
import ConfirmModal from '../components/ui/ConfirmModal'
import NewsForm from '../components/NewsForm'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const News = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_news: 0,
    has_next: false,
    has_prev: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    featured: ''
  })
  
  // Modal states
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingNews, setDeletingNews] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const itemsPerPage = 20 // Increased from 10 to show more news
  const navigate = useNavigate()

  useEffect(() => {
    fetchNews()
  }, [currentPage, filters])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      }
      
      const response = await apiService.getNews(params)
      if (response.success) {
        setNews(response.data.news || [])
        // Use backend pagination metadata
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      toast.error('Failed to load news articles')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNews = () => {
    setEditingNews(null)
    setShowNewsForm(true)
  }

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem)
    setShowNewsForm(true)
  }

  const handleDeleteNews = (newsItem) => {
    setDeletingNews(newsItem)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingNews) return
    
    try {
      setDeleteLoading(true)
      const response = await apiService.deleteNews(deletingNews._id)
      if (response.success) {
        toast.success('News article deleted successfully')
        setDeleteModalOpen(false)
        setDeletingNews(null)
        fetchNews()
      } else {
        toast.error(response.message || 'Failed to delete news article')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error('Failed to delete news article')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleNewsSaved = () => {
    setShowNewsForm(false)
    setEditingNews(null)
    fetchNews()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({ search: '', featured: '' })
    setCurrentPage(1)
  }

  const toggleFeatured = async (newsItem) => {
    try {
      const response = await apiService.updateNews(newsItem._id, {
        ...newsItem,
        is_featured: !newsItem.is_featured
      })
      if (response.success) {
        toast.success(`Article ${newsItem.is_featured ? 'removed from' : 'marked as'} featured`)
        fetchNews()
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const columns = [
    {
      key: 'headline',
      label: 'Article',
      sortable: true,
      render: (value, article) => (
        <div className="flex items-start gap-3">
          {article.image ? (
            <img 
              src={article.image} 
              alt="" 
              className="w-16 h-12 object-cover rounded-lg bg-gray-100"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2">{value}</h3>
            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
              {article.description}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'published_date',
      label: 'Published',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'is_featured',
      label: 'Featured',
      sortable: false,
      render: (value, article) => (
        <button
          onClick={() => toggleFeatured(article)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            value 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-3 h-3 ${value ? 'fill-current' : ''}`} />
          {value ? 'Featured' : 'Regular'}
        </button>
      )
    },
    {
      key: 'source_link',
      label: 'Source',
      sortable: false,
      render: (value) => (
        value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
          >
            <ExternalLink className="w-3 h-3" />
            View Source
          </a>
        ) : (
          <span className="text-gray-400 text-sm">No source</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, news) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/news/${news._id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditNews(news)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteNews(news)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  const totalPages = pagination.total_pages

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="text-gray-600">Manage NFL news articles and content</p>
        </div>
        <Button onClick={handleCreateNews}>
          <Plus className="w-4 h-4" />
          Add Article
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search articles..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
          
          <select
            value={filters.featured}
            onChange={(e) => handleFilterChange('featured', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Articles</option>
            <option value="true">Featured Only</option>
            <option value="false">Regular Only</option>
          </select>
          
          <div className="md:col-span-2">
            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading news articles..." />
        </div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f) 
                ? 'No articles match your current filters.' 
                : 'Start creating engaging NFL content for your users.'
              }
            </p>
            <Button onClick={handleCreateNews}>
              <Plus className="w-4 h-4" />
              Create First Article
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={news}
            loading={loading}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination.total_news}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* News Form Modal */}
      <Modal
        isOpen={showNewsForm}
        onClose={() => setShowNewsForm(false)}
        title={editingNews ? 'Edit News Article' : 'Add New Article'}
        size="lg"
      >
        <NewsForm
          news={editingNews}
          onSave={handleNewsSaved}
          onCancel={() => setShowNewsForm(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete News Article"
        message={`Are you sure you want to delete the article "${deletingNews?.headline}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}

export default News 