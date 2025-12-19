# Serendip Waves - Cruise Booking System

Modern React-based cruise booking platform with multi-step booking flow, dashboards, and real-time availability. Built with React 19, Vite, and Bootstrap.

## 🚀 Tech Stack

- **React 19** - Latest React version with improved performance
- **Vite** - Fast build tool and dev server
- **Bootstrap 5.3** - Responsive UI framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management

## 🎨 Theme

The application uses a purple gradient theme:
- Primary gradient: `#667eea` to `#764ba2`
- Table headers: `#6c5ce7`
- All currency displayed in **USD**

## ✨ Features

### Multi-Step Booking Flow
1. **Summary** - Select cruise package
2. **Passengers** - Enter passenger information (controlled forms with validation)
3. **Cabin** - Choose cabin type
4. **Payment** - Complete payment (USD only)
5. **Success** - Booking confirmation

### Role-Based Dashboards
- **Customer** - View bookings and make new reservations
- **Admin** - Manage bookings and view statistics
- **SuperAdmin** - System administration and user management
- **Chef** - Menu management and food orders
- **Staff** - Task management and operations

### Contexts
- **AuthContext** - User authentication and authorization
- **BookingContext** - Booking state management across steps
- **ToastContext** - Notifications with `useToast` hook
  - `showSuccess(message)` - Success notifications
  - `showError(message)` - Error notifications
  - `showConfirm(message)` - Confirmation dialogs

## 🛠️ Setup & Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Login and authentication
│   ├── booking/       # Booking flow components
│   ├── common/        # Shared components (Navbar, etc.)
│   └── dashboards/    # Role-based dashboards
├── contexts/          # React contexts
│   ├── AuthContext.jsx
│   ├── BookingContext.jsx
│   └── ToastContext.jsx
├── pages/             # Page components
├── services/          # API service layer
├── styles/            # CSS and theme files
└── utils/             # Utility functions
```

## 🎯 UI Guidelines

- **Tables**: Use `.table-purple` class for purple headers
- **Notifications**: Always use `showSuccess`, `showError`, `showConfirm` - NEVER use browser `alert()` or `confirm()`
- **Forms**: All forms use controlled components with validation
- **Currency**: All prices displayed in USD format

## 🔐 Demo Users

The login page includes quick-fill buttons for demo users:
- Customer: `customer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`
- SuperAdmin: `superadmin@demo.com` / `demo123`
- Chef: `chef@demo.com` / `demo123`
- Staff: `staff@demo.com` / `demo123`

## 📝 API Integration

The application expects a PHP/MySQL backend at the configured `VITE_API_URL`. All API calls include:
- JWT token authentication (stored in localStorage)
- Automatic 401 redirect to login
- Centralized error handling

## 🚢 Booking Flow Details

The booking process maintains state across all steps:
1. Users select a cruise package
2. Add passenger details (minimum 1 required)
3. Choose cabin type (affects total price)
4. Enter payment information
5. Receive confirmation with booking summary

Total calculation: `(cruise_price + cabin_price) × number_of_passengers`

## 📱 Responsive Design

Bootstrap 5 responsive grid system ensures the application works on:
- Desktop (large screens)
- Tablets (medium screens)
- Mobile devices (small screens)

## 🎨 Custom Styling

All custom styles are in `src/styles/theme.css` including:
- Purple gradient backgrounds
- Table styling
- Button variants
- Booking step indicators
- Dashboard cards with hover effects

## License

MIT
