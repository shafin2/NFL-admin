import { useState, useEffect } from 'react'
import NotificationForm from '../components/NotificationForm'
import Button from '../components/ui/Button'

export default function Notifications() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Push Notifications</h1>
        <Button onClick={() => setShowForm(true)}>Send Notification</Button>
      </div>

      {showForm && (
        <NotificationForm onSent={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      )}

      {/* Could list previous notifications here if stored */}
    </div>
  )
} 