# 🏺 Artisans: Handcrafted Goods Marketplace

![Project Banner](https://via.placeholder.com/1200x400?text=Artisans+Marketplace)

## 📝 Project Description

Artisans is a full-featured e-commerce platform dedicated to showcasing and selling unique, handcrafted goods from talented artisans around the world. Our mission is to connect passionate creators with art lovers and support small-scale craftsmanship.

## ✨ Features

- 🛍️ Browse handcrafted goods from multiple categories
- 👤 User authentication and profile management
- 🛒 Robust shopping cart and checkout system
- 💳 Secure payment integration
- 🌟 Product reviews and ratings
- 🔍 Advanced search and filtering
- 📦 Order management

## 🚀 Technologies Used

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB for database
- Mongoose ODM
- JSON Web Token (JWT) for authentication

### Additional Tools
- Stripe for payment processing
- Multer for file uploads
- Bcrypt for password encryption

## 🛠️ Prerequisites

- Node.js (v16.0.0 or later)
- MongoDB
- npm or Yarn

## 🔧 Installation

### Clone the Repository
```bash
git clone https://github.com/vighneshparab/Artisans/
cd Artisans
```

### Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables
Create `.env` files in both backend and frontend directories with:
- MONGO_URI
- JWT_SECRET
- PORT
- STRIPE_SECRET_KEY
- NODEMAILER_EMAIL
- NODEMAILER_PASSWORD

### Run the Application
```bash
# Start backend (from backend directory)
npm run server

# Start frontend (from frontend directory)
npm start
```

## 📂 Project Structure
```
artisans-ecommerce/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── redux/
        └── utils/
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Your Name - vighneshparab83@gmail.com 

Project Link: [https://github.com/vighneshparab/Artisans/]

## 🙏 Acknowledgements

- React.js
- Node.js
- MongoDB
- Stripe
```
