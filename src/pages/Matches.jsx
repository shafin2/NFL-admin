import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Filter, Search, Tv } from 'lucide-react'
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
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' }
]

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [channels, setChannels] = useState([])
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
    fetchChannels()
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

  const fetchChannels = async () => {
    try {
      const response = await apiService.getChannels()
      if (response.success) {
        setChannels(response.data.channels || response.data || [])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
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
      closed: 'bg-gray-100 text-gray-800',
      replay: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getChannelNames = (channelIds) => {
    if (!channelIds || channelIds.length === 0) return 'No channels'
    const channelNames = channelIds.map(id => {
      const channel = channels.find(c => c._id === id)
      return channel ? channel.name : 'Unknown'
    })
    return channelNames.join(', ')
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
          {match.score?.away || 0} - {match.score?.home || 0}
        </div>
      )
    },
    {
      key: 'live_channel_ids',
      label: 'Channels',
      sortable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Tv className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{getChannelNames(value)}</span>
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
            onClick={() => navigate(`/matches/${match._id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditMatch(match)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMatch(match)}
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
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600">Manage NFL match schedules and information</p>
        </div>
        <Button onClick={handleCreateMatch}>
          <Plus className="w-4 h-4" />
          Add Match
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${filters.status === tab.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => handleFilterChange('status', tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search matches..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
          
          <Select
            placeholder="Filter by status"
            options={statusTabs}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
          
          <Button variant="outline" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading matches..." />
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f) 
                ? 'No matches match your current filters.' 
                : 'Get started by adding your first NFL match.'
              }
            </p>
            <Button onClick={handleCreateMatch}>
              <Plus className="w-4 h-4" />
              Add First Match
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={matches}
            loading={loading}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination.total_matches}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Match Form Modal */}
      <Modal
        isOpen={showMatchForm}
        onClose={() => setShowMatchForm(false)}
        title={editingMatch ? 'Edit Match' : 'Add New Match'}
        size="lg"
      >
        <MatchForm
          match={editingMatch}
          channels={channels}
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
        message={`Are you sure you want to delete the match "${deletingMatch?.home_team} vs ${deletingMatch?.away_team}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Matches 