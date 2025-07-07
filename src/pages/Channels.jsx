import { useState, useEffect } from 'react'
import { Tv, Plus, Edit, Trash2, Search } from 'lucide-react'
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
        setTotalItems(response.data.pagination?.total_channels || response.data.length || 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600 mt-1">
            Manage channel names for M3U8 stream links
          </p>
        </div>
        <Button onClick={handleCreateChannel}>
          <Plus className="w-4 h-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search channels..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={resetFilters}
            disabled={!filters.search}
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
              data={channels}
              columns={columns}
              emptyMessage="No channels found"
            />
            {totalItems > itemsPerPage && (
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Channel Form Modal */}
      <Modal
        isOpen={showChannelForm}
        onClose={() => setShowChannelForm(false)}
        title={editingChannel ? 'Edit Channel' : 'Create Channel'}
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
        message={`Are you sure you want to delete "${deletingChannel?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Channels 