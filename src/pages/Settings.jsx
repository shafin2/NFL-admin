import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Smartphone, Bell, Tv, AlertTriangle } from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Switch from '../components/ui/Switch'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import Table from '../components/ui/Table'

const SCREENS = [
  { key: 'HomeScreen', label: 'Home Screen' },
  { key: 'LiveScreen', label: 'Live Screen' },
  { key: 'NewsScreen', label: 'News Screen' },
  { key: 'ReplaysScreen', label: 'Replays Screen' },
  { key: 'ScheduleScreen', label: 'Schedule Screen' },
]

const Settings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAppSettings()
      if (response.success) {
        setSettings(response.data)
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleDirectChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // New handler for per-screen ad toggles
  const handlePerScreenAdChange = (screen, adType, value) => {
    setSettings(prev => ({
      ...prev,
      ads: {
        ...prev.ads,
        per_screen: {
          ...prev.ads?.per_screen,
          [screen]: {
            ...prev.ads?.per_screen?.[screen],
            [adType]: value
          }
        }
      }
    }))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await apiService.updateAppSettings(settings)
      if (response.success) {
        toast.success('Settings updated successfully')
      } else {
        toast.error(response.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Failed to load settings</p>
        <button 
          onClick={fetchSettings}
          className="mt-2 text-red-700 hover:text-red-900 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
        <p className="text-gray-600">Configure your NFL app behavior and features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Configuration */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">App Configuration</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Input
              label="App Version"
              value={settings.app_version || ''}
              onChange={(e) => handleDirectChange('app_version', e.target.value)}
              placeholder="1.0.0"
              required
            />

            <Switch
              label="Force Update"
              description="Force users to update to the latest version"
              checked={settings.force_update || false}
              onChange={(checked) => handleDirectChange('force_update', checked)}
            />

            <Input
              label="Minimum Supported Version"
              value={settings.min_supported_version || ''}
              onChange={(e) => handleDirectChange('min_supported_version', e.target.value)}
              placeholder="1.0.0"
            />
          </div>
        </div>

        {/* Advertisement Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Advertisement Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Switch
              label="Enable Banner Ads"
              description="Show banner advertisements in the app"
              checked={settings.ads?.enable_banner || false}
              onChange={(checked) => handleInputChange('ads', 'enable_banner', checked)}
            />

            <Switch
              label="Enable Interstitial Ads"
              description="Show full-screen ads between content"
              checked={settings.ads?.enable_interstitial || false}
              onChange={(checked) => handleInputChange('ads', 'enable_interstitial', checked)}
            />

            <Input
              label="Banner Frequency (seconds)"
              type="number"
              value={settings.ads?.banner_frequency || 30}
              onChange={(e) => handleInputChange('ads', 'banner_frequency', parseInt(e.target.value))}
              min={10}
              max={300}
            />

            <Input
              label="Interstitial Frequency (seconds)"
              type="number"
              value={settings.ads?.interstitial_frequency || 180}
              onChange={(e) => handleInputChange('ads', 'interstitial_frequency', parseInt(e.target.value))}
              min={60}
              max={600}
            />

            {/* Per-screen ad settings table */}
            <div>
              <h4 className="font-semibold mb-2">Per-Screen Ad Control</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border">Screen</th>
                      <th className="px-3 py-2 border">Banner</th>
                      <th className="px-3 py-2 border">Interstitial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREENS.map(screen => (
                      <tr key={screen.key}>
                        <td className="px-3 py-2 border font-medium">{screen.label}</td>
                        <td className="px-3 py-2 border text-center">
                          <Switch
                            checked={settings.ads?.per_screen?.[screen.key]?.banner ?? true}
                            onChange={checked => handlePerScreenAdChange(screen.key, 'banner', checked)}
                            label=""
                          />
                        </td>
                        <td className="px-3 py-2 border text-center">
                          <Switch
                            checked={settings.ads?.per_screen?.[screen.key]?.interstitial ?? true}
                            onChange={checked => handlePerScreenAdChange(screen.key, 'interstitial', checked)}
                            label=""
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Feature Toggles</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Switch
              label="Live Streaming"
              description="Enable live match streaming"
              checked={settings.features?.live_streaming || false}
              onChange={(checked) => handleInputChange('features', 'live_streaming', checked)}
            />

            <Switch
              label="Replays"
              description="Enable match replay functionality"
              checked={settings.features?.replays || false}
              onChange={(checked) => handleInputChange('features', 'replays', checked)}
            />

            <Switch
              label="News"
              description="Enable news articles section"
              checked={settings.features?.news || false}
              onChange={(checked) => handleInputChange('features', 'news', checked)}
            />

            <Switch
              label="Push Notifications"
              description="Enable push notifications to users"
              checked={settings.features?.push_notifications || false}
              onChange={(checked) => handleInputChange('features', 'push_notifications', checked)}
            />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Switch
              label="Enable Maintenance Mode"
              description="Put the app in maintenance mode for all users"
              checked={settings.maintenance?.is_enabled || false}
              onChange={(checked) => handleInputChange('maintenance', 'is_enabled', checked)}
            />

            <Input
              label="Maintenance Message"
              value={settings.maintenance?.message || ''}
              onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
              placeholder="The app is currently under maintenance..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                value={settings.maintenance?.start_time ? new Date(settings.maintenance.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('maintenance', 'start_time', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />

              <Input
                label="End Time"
                type="datetime-local"
                value={settings.maintenance?.end_time ? new Date(settings.maintenance.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('maintenance', 'end_time', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          loading={saving}
          size="lg"
        >
          <Save className="w-4 h-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}

export default Settings 