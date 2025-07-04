# NFL Admin Panel

A modern React.js admin panel for managing NFL content with Tailwind CSS styling.

## Features

- 🔐 **Token-based Authentication** - Secure admin login with localStorage persistence
- 📱 **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- 🎨 **Modern UI** - Clean, professional design with custom color scheme
- 🔄 **Context-based State Management** - Global authentication state
- 🛡️ **Protected Routes** - Route protection with custom ProtectedRoute component
- ⚡ **Loading States** - Smooth loading experiences throughout the app
- 📊 **Dashboard Overview** - Real-time statistics and quick actions
- 🎯 **Modular Components** - Reusable UI components (Button, Table, Modal, etc.)

### 📝 **Complete CRUD Operations**
- **🏈 Matches Management** - Create, edit, delete matches with filters, pagination, and channel assignment
- **📰 News Management** - Full article management with featured toggles, image support, and source links
- **📺 Channels Management** - Simple channel CRUD with active/inactive status
- **🔍 Advanced Filtering** - Search and filter across all entities
- **📄 Pagination** - Efficient data pagination for large datasets
- **✅ Form Validation** - Comprehensive client-side validation with error handling
- **🗑️ Delete Confirmation** - Safe deletion with confirmation modals
- **🔔 Toast Notifications** - Real-time feedback for all operations

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Color Theme

The admin panel uses a consistent teal-based color scheme:

- **Primary**: `#00897B` (teal-600)
- **Light**: `#E0F2F1` (teal-50)  
- **Dark**: `#004D40` (teal-900)
- **Accent**: `#00E5FF`
- **Danger**: `#F44336`
- **Warning**: `#FFC107`
- **Success**: `#4CAF50`

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- NFL Backend API running on `http://localhost:3000`

### Installation

1. **Navigate to the admin directory**:
   ```bash
   cd NFL-admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the admin panel**:
   Open http://localhost:3001 in your browser

### Default Login

Use the default admin token to login:
- **Token**: `mysecrettoken` (or check your backend's `ADMIN_TOKEN` environment variable)

## 🚀 CRUD Features Guide

### Matches Management
- **Create**: Add new NFL matches with team names, date/time, status, type, and optional channel assignment
- **Edit**: Update match details including live URLs, replay URLs, and channel assignments
- **Delete**: Remove matches with confirmation dialog
- **Filter**: Search by team names, filter by status (upcoming/live/replay) and type
- **Channel Assignment**: Assign active channels to live matches

### News Management  
- **Create**: Add news articles with headline, description, image URL, and source link
- **Edit**: Update article content and toggle featured status
- **Delete**: Remove articles with confirmation
- **Featured Toggle**: Mark articles as featured with a single click
- **Filter**: Search articles and filter by featured status
- **Preview**: Real-time preview of article appearance

### Channels Management
- **Create**: Add new streaming channels with just a name
- **Edit**: Update channel names and active status
- **Delete**: Remove unused channels
- **Status Toggle**: Activate/deactivate channels with one click
- **Integration**: Active channels appear in match assignment dropdowns

## Project Structure

```
NFL-admin/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── layout/                # Layout components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   └── ProtectedRoute.jsx     # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── pages/                     # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Matches.jsx
│   │   ├── News.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   └── apiService.js          # API communication
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## API Integration

The admin panel is designed to work with the NFL Backend API. It includes:

- **Authentication validation** via `/admin/dashboard` endpoint
- **Dashboard statistics** from `/admin/dashboard`
- **CRUD operations** for matches, news, and channels
- **Automatic token management** with request/response interceptors
- **Error handling** with automatic redirect on auth failure

### API Endpoints Used

- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/matches` - List matches
- `POST /admin/matches` - Create match
- `PUT /admin/matches/:id` - Update match
- `DELETE /admin/matches/:id` - Delete match
- `GET /admin/news` - List news articles
- `POST /admin/news` - Create news article
- `PUT /admin/news/:id` - Update news article
- `DELETE /admin/news/:id` - Delete news article
- `GET /admin/channels` - List channels
- `POST /admin/channels` - Create channel
- `PUT /admin/channels/:id` - Update channel
- `DELETE /admin/channels/:id` - Delete channel
- `GET /admin/app-settings` - Get app settings
- `PUT /admin/app-settings` - Update app settings

## Authentication Flow

1. **Login**: User enters admin token on login page
2. **Validation**: Token is validated against backend API
3. **Storage**: Valid token is stored in localStorage
4. **Persistence**: Token is automatically added to all API requests
5. **Protection**: Protected routes redirect to login if not authenticated
6. **Logout**: Token is removed from localStorage and user is redirected

## Development

### Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update sidebar navigation in `src/components/layout/Sidebar.jsx`

### Customizing Theme

Edit `tailwind.config.js` to modify colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#E0F2F1',
        600: '#00897B',  // Main primary color
        900: '#004D40',
      },
      // Add custom colors here
    },
  },
}
```

## Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure environment**:
   - Update API base URL in `src/services/apiService.js`
   - Ensure backend CORS settings allow your domain

## Security Notes

- The admin token should be kept secure and rotated regularly
- In production, consider implementing JWT tokens with expiration
- Enable HTTPS for production deployments
- Configure proper CORS settings on the backend

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Use the provided UI components for consistency
3. Add proper TypeScript types if converting to TypeScript
4. Test authentication flows thoroughly
5. Ensure responsive design on all screen sizes

## License

This project is part of the NFL App ecosystem. 