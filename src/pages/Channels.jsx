import { useState, useEffect } from 'react'
import { Tv, Plus, Edit, Trash2, Filter, Users } from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'
import ConfirmModal from '../components/ui/ConfirmModal'
import ChannelForm from '../components/ChannelForm'
import toast from 'react-hot-toast'

const Channels = () => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: ''
  })
  
  // Modal states
  const [showChannelForm, setShowChannelForm] = useState(false)
  const [editingChannel, setEditingChannel] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingChannel, setDeletingChannel] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchChannels()
  }, [currentPage, filters])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      }
      
      const response = await apiService.getChannels(params)
      if (response.success) {
        setChannels(response.data.channels || response.data || [])
        setTotalItems(response.data.total || response.data.length || 0)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      toast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChannel = () => {
    setEditingChannel(null)
    setShowChannelForm(true)
  }

  const handleEditChannel = (channel) => {
    setEditingChannel(channel)
    setShowChannelForm(true)
  }

  const handleDeleteChannel = (channel) => {
    setDeletingChannel(channel)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingChannel) return
    
    try {
      setDeleteLoading(true)
      const response = await apiService.deleteChannel(deletingChannel._id)
      if (response.success) {
        toast.success('Channel deleted successfully')
        setDeleteModalOpen(false)
        setDeletingChannel(null)
        fetchChannels()
      } else {
        toast.error(response.message || 'Failed to delete channel')
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
      toast.error('Failed to delete channel')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleChannelSaved = () => {
    setShowChannelForm(false)
    setEditingChannel(null)
    fetchChannels()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({ search: '' })
    setCurrentPage(1)
  }

  const toggleChannelStatus = async (channel) => {
    try {
      const response = await apiService.updateChannel(channel._id, {
        ...channel,
        is_active: !channel.is_active
      })
      if (response.success) {
        toast.success(`Channel ${channel.is_active ? 'deactivated' : 'activated'} successfully`)
        fetchChannels()
      }
    } catch (error) {
      console.error('Error updating channel status:', error)
      toast.error('Failed to update channel status')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Channel Name',
      sortable: true,
      render: (value, channel) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Tv className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {channel._id?.slice(-8)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: false,
      render: (value, channel) => (
        <button
          onClick={() => toggleChannelStatus(channel)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'assigned_matches',
      label: 'Assigned Matches',
      sortable: false,
      render: (_, channel) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>0 matches</span> {/* This would be calculated from actual data */}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, channel) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditChannel(channel)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteChannel(channel)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600">Manage streaming channels for live matches</p>
        </div>
        <Button onClick={handleCreateChannel}>
          <Plus className="w-4 h-4" />
          Add Channel
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
            placeholder="Search channels..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
          
          <div className="md:col-span-3">
            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading channels..." />
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No channels found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f) 
                ? 'No channels match your current filters.' 
                : 'Get started by adding your first streaming channel.'
              }
            </p>
            <Button onClick={handleCreateChannel}>
              <Plus className="w-4 h-4" />
              Add First Channel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={channels}
            loading={loading}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Channel Form Modal */}
      <Modal
        isOpen={showChannelForm}
        onClose={() => setShowChannelForm(false)}
        title={editingChannel ? 'Edit Channel' : 'Add New Channel'}
        size="md"
      >
        <ChannelForm
          channel={editingChannel}
          onSave={handleChannelSaved}
          onCancel={() => setShowChannelForm(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Channel"
        message={`Are you sure you want to delete the channel "${deletingChannel?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Channels 