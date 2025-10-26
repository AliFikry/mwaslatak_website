# Mwaslatak Website

A modern, responsive website built with Node.js, Express, and vanilla JavaScript.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Fast Performance**: Optimized assets and efficient routing
- **Modern UI**: Clean, professional design with smooth animations
- **API Ready**: Structured backend with organized routes and middleware
- **SEO Friendly**: Semantic HTML and meta tags
- **Accessibility**: WCAG compliant with proper ARIA labels

## 📁 Project Structure

```
mwaslatak-website/
├── src/
│   ├── public/                 # Static HTML files
│   │   └── index.html
│   ├── client/                 # Frontend assets
│   │   ├── css/
│   │   │   ├── main.css        # Main styles
│   │   │   └── responsive.css  # Responsive styles
│   │   └── js/
│   │       └── main.js         # Main JavaScript
│   └── server/                 # Backend code
│       ├── routes/             # API routes
│       │   ├── index.js        # Main router
│       │   └── api.js          # API endpoints
│       ├── controllers/        # Business logic
│       │   └── index.js
│       ├── middleware/         # Custom middleware
│       │   ├── errorHandler.js
│       │   └── logger.js
│       ├── models/             # Database models (if needed)
│       └── utils/              # Utility functions
├── assets/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── config/                     # Configuration files
│   ├── database.js
│   └── cors.js
├── tests/                      # Test files
├── docs/                       # Documentation
├── server.js                   # Main server file
├── package.json
├── .env.example               # Environment variables template
└── .gitignore
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mwaslatak-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🎨 Customization

### Adding New Pages
1. Create HTML files in `src/public/`
2. Add routes in `src/server/routes/`
3. Update navigation in `src/public/index.html`

### Styling
- Main styles: `src/client/css/main.css`
- Responsive styles: `src/client/css/responsive.css`
- Use CSS custom properties for consistent theming

### JavaScript
- Main script: `src/client/js/main.js`
- Modular approach with separate functions
- Use ES6+ features for modern development

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development
# Add your database and API keys here
```

### CORS Configuration
Update `config/cors.js` to allow your domains.

## 📱 Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 992px
- **Large Desktop**: > 992px

## 🚀 Deployment

### Production Build
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx/Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ali Fikry**
- Website: [mwaslatak.com](https://mwaslatak.com)
- Email: info@mwaslatak.com

## 🆘 Support

For support, email info@mwaslatak.com or create an issue in the repository.
# mwaslatak_website
