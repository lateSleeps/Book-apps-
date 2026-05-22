# Rara Beauty - Booking Apps

Complete salon booking system with separate applications for customers and business owners.

## 📁 Project Structure

```
booking-apps/
├── customer/          # Customer-facing booking application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── owner/            # Owner/Admin dashboard application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## 🎯 Applications

### Customer App (`/customer`)
- **Purpose**: Customer-facing salon booking application
- **Tech Stack**: Next.js 14.2.5, React, Tailwind CSS
- **Features**:
  - Browse available services
  - Book appointments
  - View booking history
  - Mobile responsive design
  - Floating Action Button (FAB) for mobile navigation
  
- **Setup**:
  ```bash
  cd customer
  npm install
  npm run dev
  ```
  Access at: `http://localhost:3000` (or next available port)

### Owner App (`/owner`)
- **Purpose**: Business owner/admin dashboard
- **Tech Stack**: Next.js 14.2.5, React, Tailwind CSS
- **Features**:
  - Manage salon services
  - View and manage bookings
  - Analytics and reports
  - Staff management
  - Admin dashboard
  
- **Setup**:
  ```bash
  cd owner
  npm install
  npm run dev
  ```
  Access at: `http://localhost:3001` (or next available port)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository** (when pushed to GitHub):
   ```bash
   git clone https://github.com/yourusername/booking-apps.git
   cd booking-apps
   ```

2. **Install dependencies for Customer App**:
   ```bash
   cd customer
   npm install
   ```

3. **Install dependencies for Owner App**:
   ```bash
   cd owner
   npm install
   ```

### Environment Variables

Create `.env.local` files in both `customer/` and `owner/` directories with your configuration:

**customer/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Rara Beauty Customer
```

**owner/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Rara Beauty Owner
```

### Running Applications

**Option 1: Run separately in different terminals**

Terminal 1 - Customer App:
```bash
cd customer
npm run dev
```

Terminal 2 - Owner App:
```bash
cd owner
npm run dev
```

**Option 2: Run from root directory**

You can use npm workspaces (optional setup for future enhancement)

## 📱 Responsive Design

Both applications are fully responsive:
- **Mobile**: Optimized for touch, hamburger menu navigation, Floating Action Button (FAB)
- **Tablet**: Optimized layout for medium screens
- **Desktop**: Full-featured interface with sidebar navigation

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Color Scheme**: 
  - Primary: `#1a1a1a` (dark/black)
  - Background: `#fafaf8` (off-white)
  - Border: separator color
- **Design Pattern**: Mobile-first responsive design

## 🔐 Version Control Guidelines

### Important Notes
- **Keep applications separate**: Never merge customer and owner code
- **Use meaningful commit messages**: Describe what and why you changed
- **Branch naming**:
  - `main` or `master` - Production ready code
  - `develop` - Development branch
  - `feature/feature-name` - Feature branches
  - `bugfix/bug-name` - Bug fix branches

### Commit Examples
```bash
# Good commits
git commit -m "feat: Add mobile drawer navigation for customer app"
git commit -m "fix: Resolve responsive layout issue on tablet"
git commit -m "docs: Update README with setup instructions"

# Avoid
git commit -m "fix"
git commit -m "updated"
git commit -m "changes"
```

## 📋 Maintenance

### Regular Tasks
1. **Update dependencies**: Run `npm update` periodically
2. **Check for vulnerabilities**: Run `npm audit`
3. **Code review**: Review changes before pushing to main
4. **Test responsiveness**: Test on multiple devices/screen sizes

### Troubleshooting

**Port already in use?**
- Next.js automatically tries the next available port
- Or manually specify: `npm run dev -- -p 3002`

**Cache issues?**
- Delete `.next` folder: `rm -rf .next`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Styling issues?**
- Ensure Tailwind CSS is properly configured in `tailwind.config.js`
- Check for class name typos
- Restart dev server after config changes

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Contributing

When making changes to either application:
1. Create a new branch from `develop`
2. Make your changes
3. Test thoroughly on mobile, tablet, and desktop
4. Commit with clear messages
5. Create a Pull Request for review

## 📝 License

Rara Beauty © 2026 - All Rights Reserved

## 🆘 Support

For issues or questions about either application, please:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include screenshots/logs if applicable

---

**Last Updated**: 2026-05-23
**Status**: Active Development
