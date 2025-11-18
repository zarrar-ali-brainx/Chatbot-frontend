# Chatbot Frontend

A modern React-based frontend application for an AI-powered chatbot system with document-based RAG (Retrieval Augmented Generation) capabilities.

## Features

- 🔐 **User Authentication**: Secure login and registration with JWT token management
- 💬 **General Chat**: Direct conversations with OpenAI-powered chatbot
- 📚 **RAG Chat**: Context-aware conversations using uploaded documents
- 📄 **Document Management**: Upload, view, and manage documents (PDF, TXT, MD, DOCX)
- 💾 **Chat Sessions**: Save and manage multiple chat conversations
- 🎨 **Modern UI**: Built with Tailwind CSS and Headless UI components
- 🔄 **Real-time Updates**: Stream responses and manage chat state efficiently

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the frontend directory (optional, defaults are provided):

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Available Scripts

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload automatically when you make edits. You'll also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode. See the [running tests](https://facebook.github.io/create-react-app/docs/running-tests) section for more information.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.



## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── ChatSidebar.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ChatContext.tsx
│   ├── pages/           # Page components
│   │   ├── Chat.tsx
│   │   ├── Documents.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── package.json
└── tailwind.config.js   # Tailwind CSS configuration
```

## Key Components

### AuthContext
Manages user authentication state, login, logout, and registration functionality.

### ChatContext
Handles chat-related state including:
- Message management for both general and RAG chats
- Session management
- Real-time message streaming
- Request cancellation

### Pages

- **Home**: Landing page with project information
- **Login/Register**: Authentication pages
- **Chat**: Main chat interface with support for general and RAG conversations
- **Documents**: Document upload and management interface

## API Integration

The frontend communicates with the backend API through the `api.ts` service file. All API calls are automatically authenticated using JWT tokens stored in localStorage.

### API Endpoints Used

- `/auth/login` - User login
- `/auth/register` - User registration
- `/chat/sessions` - Get chat sessions
- `/chat/messages/:sessionId` - Get messages for a session
- `/chat/general` - Send general chat message
- `/chat/rag` - Send RAG chat message
- `/documents` - Document management endpoints

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add API methods in `src/services/api.ts`
5. Update types in `src/types/index.ts`

### Styling

The project uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Troubleshooting

### CORS Issues
Ensure the backend CORS configuration includes your frontend URL.

### Authentication Issues
Check that JWT tokens are being stored correctly in localStorage and sent with requests.

### API Connection Issues
Verify the backend is running and the `REACT_APP_API_URL` environment variable is set correctly.

## Deployment

1. Build the production bundle:
```bash
npm run build
```

2. The `build` folder contains the production-ready static files that can be served by any static file server.

3. For deployment to platforms like Vercel, Netlify, or AWS S3, refer to their respective documentation for React apps.

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
