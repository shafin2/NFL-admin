import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'
import ConfirmModal from '../components/ui/ConfirmModal'
import MatchForm from '../components/MatchForm'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const statusTabs = [
  { value: '', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'replay', label: 'Replay' },
  { value: 'completed', label: 'Completed' }
]

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_matches: 0,
    has_next: false,
    has_prev: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  })
  
  // Modal states
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingMatch, setDeletingMatch] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()

  const itemsPerPage = 20

  useEffect(() => {
    fetchMatches()
  }, [currentPage, filters])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      }
      
      const response = await apiService.getMatches(params)
      if (response.success) {
        setMatches(response.data.matches || [])
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = () => {
    setEditingMatch(null)
    setShowMatchForm(true)
  }

  const handleEditMatch = (match) => {
    setEditingMatch(match)
    setShowMatchForm(true)
  }

  const handleViewMatch = (match) => {
    navigate(`/matches/${match._id}`)
  }

  const handleDeleteMatch = (match) => {
    setDeletingMatch(match)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingMatch) return
    
    try {
      setDeleteLoading(true)
      const response = await apiService.deleteMatch(deletingMatch._id)
      if (response.success) {
        toast.success('Match deleted successfully')
        setDeleteModalOpen(false)
        setDeletingMatch(null)
        fetchMatches()
      } else {
        toast.error(response.message || 'Failed to delete match')
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      toast.error('Failed to delete match')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleMatchSaved = () => {
    setShowMatchForm(false)
    setEditingMatch(null)
    fetchMatches()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({ search: '', status: '' })
    setCurrentPage(1)
  }

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-800',
      live: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      replay: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      key: 'title',
      label: 'Match',
      sortable: false,
      render: (_, match) => (
        <div>
          <div className="font-medium text-gray-900">{match.title}</div>
          <div className="text-sm text-gray-500">
            {match.away_team} @ {match.home_team}
          </div>
        </div>
      )
    },
    {
      key: 'scheduled_at',
      label: 'Date & Time',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'score',
      label: 'Score',
      sortable: false,
      render: (_, match) => (
        <div className="text-sm text-gray-900">
          {match.score?.home || 0} - {match.score?.away || 0}
        </div>
      )
    },
    {
      key: 'm3u8_links',
      label: 'Stream Links',
      sortable: false,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {value && value.length > 0 ? `${value.length} link(s)` : 'No links'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, match) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewMatch(match)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditMatch(match)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteMatch(match)
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-1">
            Manage NFL matches and streaming links
          </p>
        </div>
        <Button onClick={handleCreateMatch}>
          <Plus className="w-4 h-4 mr-2" />
          Add Match
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange('status', tab.value)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filters.status === tab.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search matches..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={resetFilters}
            disabled={!filters.search && !filters.status}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              data={matches}
              columns={columns}
              emptyMessage="No matches found"
              onRowClick={handleViewMatch}
              rowClassName="cursor-pointer hover:bg-gray-50"
            />
            {pagination.total_matches > itemsPerPage && (
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={pagination.total_matches}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Match Form Modal */}
      <Modal
        isOpen={showMatchForm}
        onClose={() => setShowMatchForm(false)}
        title={editingMatch ? 'Edit Match' : 'Create Match'}
        size="xl"
      >
        <MatchForm
          match={editingMatch}
          onSave={handleMatchSaved}
          onCancel={() => setShowMatchForm(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Match"
        message={`Are you sure you want to delete "${deletingMatch?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Matches 