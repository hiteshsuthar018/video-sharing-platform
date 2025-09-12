# VideoShare Frontend

A modern, responsive React frontend for the VideoShare platform built with Vite, Tailwind CSS, and React Router.

## Features

- 🎥 **Video Management**: Upload, view, and manage videos
- 👤 **User Authentication**: Login, register, and profile management
- 💬 **Social Features**: Like, comment, and subscribe to channels
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 🔍 **Search & Discovery**: Find videos and channels easily
- 📊 **Dashboard**: Analytics and channel management
- 📚 **Playlists**: Organize videos into custom playlists
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` if needed:
```
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   ├── ui/             # Basic UI components
│   ├── video/          # Video-related components
│   └── dashboard/      # Dashboard components
├── pages/              # Page components
├── services/           # API service functions
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

## API Integration

The frontend integrates with the VideoShare backend API:

- **Authentication**: Login, register, profile management
- **Videos**: Upload, view, search, like videos
- **Social**: Comments, subscriptions, playlists
- **Dashboard**: Analytics and channel management

## Features Overview

### Authentication
- User registration with avatar and cover image
- Secure login with JWT tokens
- Profile management and settings
- Password change functionality

### Video Features
- Video upload with drag & drop
- Video player with controls
- Thumbnail generation
- Video search and filtering
- Like and view tracking

### Social Features
- Subscribe to channels
- Comment on videos
- Create and manage playlists
- Like videos and comments
- Channel profiles

### Dashboard
- Channel analytics
- Video management
- Performance metrics
- Quick actions

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.