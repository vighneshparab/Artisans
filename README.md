# 🏺 Artisans: Global Handcrafted Goods Marketplace

![Artisans Marketplace Banner](https://source.unsplash.com/1600x600/?handmade,crafts)

## 📝 Project Overview

Artisans is a comprehensive e-commerce platform designed to celebrate and support global craftsmanship. Our mission is to create a vibrant marketplace that connects passionate artisans with art enthusiasts, providing a seamless and inspiring shopping experience for unique, handcrafted goods.

### 🌍 Our Vision

We believe in:
- Empowering small-scale artisans worldwide
- Preserving traditional crafting techniques
- Promoting sustainable and ethical consumption
- Creating a global community of makers and buyers

## ✨ Key Features

### 🛍️ For Buyers
- **Diverse Catalog**: Explore handcrafted goods from multiple categories
- **Advanced Discovery**: Intelligent search and filtering options
- **Secure Transactions**: Integrated Stripe payments with robust security
- **Community Insights**: Detailed product reviews and ratings
- **Personalized Experience**: User profiles and recommendation engine

### 🖌️ For Sellers
- **Easy Onboarding**: Simple seller registration and product listing
- **Sales Management**: Comprehensive order tracking and analytics
- **Payment Integration**: Transparent and reliable payment processing
- **Marketing Tools**: Promotional features to showcase artisan stories

## 🚀 Technical Architecture

### Frontend Ecosystem
- **React.js**: Component-based UI development
- **React Router**: Smooth, dynamic navigation
- **Axios**: Efficient API communication
- **Tailwind CSS**: Responsive, utility-first styling
- **Redux**: Centralized state management

### Backend Infrastructure
- **Node.js & Express.js**: Scalable server-side application
- **MongoDB (Mongoose)**: Flexible, document-oriented database
- **JWT Authentication**: Secure user authorization
- **Bcrypt**: Advanced password encryption

### Integrated Services
- **Stripe**: Payment processing
- **Multer**: File upload management
- **Nodemailer**: Transactional email communication

## 🛠️ Development Setup

### Prerequisites

Ensure you have the following installed:
- Node.js (v16.0.0+)
- MongoDB (v4.4+)
- npm or Yarn
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vighneshparab/Artisans.git
   cd Artisans
   ```

2. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure Environment**
   Create `.env` files in backend and frontend directories:

   **Backend `.env`**:
   ```ini
   MONGO_URI=mongodb_connection_string
   JWT_SECRET=secure_random_string
   PORT=5000
   STRIPE_SECRET_KEY=stripe_secret
   NODEMAILER_EMAIL=your_email
   NODEMAILER_PASSWORD=email_password
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend `.env`**:
   ```ini
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=stripe_publishable_key
   ```

4. **Run the Application**
   ```bash
   # Start backend server
   cd backend
   npm run server

   # In another terminal, start frontend
   cd frontend
   npm start
   ```

## 🔍 Project Structure

```bash
artisans-ecommerce/
├── backend/
│   ├── config/           # Environment & database configurations
│   ├── controllers/      # Request handling logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoint definitions
│   └── middleware/       # Authentication & validation middleware
│
└── frontend/
    ├── public/           # Static assets
    └── src/
        ├── components/   # Reusable React components
        ├── pages/        # Top-level page components
        ├── redux/        # State management
        └── utils/        # Utility functions
```

## 🤝 Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/innovative-feature`)
3. **Commit** changes (`git commit -m 'Add innovative feature'`)
4. **Push** to branch (`git push origin feature/innovative-feature`)
5. Open a **Pull Request**

### Contribution Expectations
- Follow existing code style
- Write unit tests for new features
- Update documentation
- Ensure code passes all CI checks

## 📄 Licensing

This project is open-source and available under the MIT License. See `LICENSE` file for complete details.

## 📞 Contact & Support

**Vighnesh Sadanand Parab**
- 📧 Email: vighneshparab83@gmail.com
- 🔗 GitHub: [/vighneshparab](https://github.com/vighneshparab)
- 🌐 Project Repository: [Artisans Marketplace](https://github.com/vighneshparab/Artisans/)

## 🙏 Acknowledgements

Special thanks to the open-source community and the incredible technologies that power this project:
- React.js
- Node.js
- MongoDB
- Stripe
- Tailwind CSS

---

🚀 **Craft Your Dreams, Share Your Passion!** 🎨🛍️
