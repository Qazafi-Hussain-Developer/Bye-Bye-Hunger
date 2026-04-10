npm create vite@latest bye-bye-hunger-frontend

cd bye-bye-hunger-frontend

npm install

npm install react-router-dom

npm run dev

npm install @fortawesome/fontawesome-free

npm install axios

Frontend
bye-bye-hunger-frontend/
├─ node_modules/  
├─ public/
│ ├─ images/
│ ├─ videos/
│ │ └─ main-video.mp4
├─ src/
│ ├─ assets/
│ │ └─ logo.svg
│ ├─ components/
│ │ ├─ Footer/
│ │ │ ├─ Footer.css
│ │ │ └─ Footer.jsx
│ │ ├─ Hero/
│ │ │ ├─ Hero.css
│ │ │ └─ Hero.jsx
│ │ └─ Navbar/
│ │ ├─ Navbar.css
│ │ └─ Navbar.jsx
│ ├─ adminSidebar/
│ │ │ ├─ adminSidebar.css
│ │ │ └─ adminSidebar.jsx
│ │ ├─ loadingSpinner/
│ │ │ ├─ loadingSpinner.css
│ │ │ └─ loadingSpinner.jsx
│ │ └─ protectedRoute/
│ │ ├─ protectedRoute.css
│ │ └─ protectedRoute.jsx
│ ├─ pages/
│ │ ├─ About/
│ │ │ ├─ About.css
│ │ │ └─ About.jsx
│ │ ├─ Contact/
│ │ │ ├─ Contact.css
│ │ │ └─ Contact.jsx
│ │ ├─ Home/
│ │ │ ├─ Home.css
│ │ │ └─ Home.jsx
│ │ ├─ Menu/
│ │ │ ├─ Menu.css
│ │ │ └─ Menu.jsx
│ │ ├─ auth/
│ │ | ├─ SignIn/
│ │ | │ ├─ SignIn.css
│ │ | │ └─ SignIn.jsx
│ │ | └─ SignUp/
│ │ | | ├─ SignUp.css
│ │ | | └─ SignUp.jsx
│ │ ├─ Service/
│ │ │ ├─ Service.css
│ │ │ └─ Service.jsx
│ │ ├─ Admin/
│ │ │ ├─ Admin.css
│ │ │ └─ AddFood.jsx
│ │ │ └─ AdminDashboard.jsx
│ │ │ └─ AdminLayout.jsx
│ │ │ └─ EditFood.jsx
│ │ │ └─ ManageFoods.jsx
│ │ │ └─ ManageOrders.jsx
│ │ │ └─ ManageUsers.jsx
│ │ └─ context/
│ │ ├─ AutContext.jsx
│ │ └─ CartContext.jsx
│ │ ├─ services/
│ │ │ ├─ api.jsx
│ │ │ └─ auth.jsx
│ │ │ └─ mockData.jsx
│ │ ├─ user/
| ├── Cart
| │ ├── Cart.css
| │ └── Cart.jsx
| ├── Dashboard
| │ ├── Dashboard.css
| │ └── Dashboard.jsx
| ├── MyOrders
| │ ├── MyOrders.css
| │ └── MyOrders.jsx
| ├── Profile
| │ ├── Profile.css
| │ └── Profile.jsx
| └── utils
| └── constants.js
│ ├─ styles/
│ │ ├─ global.css
│ │ └─ variables.css
│ ├─ App.css
│ ├─ App.jsx
│ ├─ index.css
│ ├─ main.jsx
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ README.md
└─ vite.config.js

Backend

# Navigate to your project root (outside frontend)

cd ..
mkdir bye-bye-hunger-backend
cd bye-bye-hunger-backend

# Initialize Node.js project

npm init -y

# Install dependencies

npm install express mongoose mysql2 dotenv cors bcryptjs jsonwebtoken express-validator multer
npm install nodemon --save-dev

bye-bye-hunger-backend/
├─ node_modules/
├─ config/
│ ├─ db.js
│ ├─ mysql.js
├─ controllers/
│ ├─ authController.js
│ ├─ foodController.js
│ ├─ orderController.js
│ ├─ contactController.js
├─ middleware/
│ ├─ authMiddleware.js
│ ├─ fileMiddleware.js
├─ models/
│ ├─ User.js (MongoDB)
│ ├─ Food.js (MongoDB)
│ ├─ Order.js (MongoDB)
│ ├─ mysql/
│ ├─ userModel.js
│ ├─ orderModel.js
├─ routes/
│ ├─ authRoutes.js
│ ├─ foodRoutes.js
│ ├─ orderRoutes.js
│ ├─ contactRoutes.js
├─ utils/
│ ├─ fileWriter.js
├─ uploads/ (for file uploads)
├─ logs/ (for txt files)
├─ .env
├─ .gitignore
├─ server.js
├─ package.json

# Create directories

mkdir -p controllers middleware models routes utils config uploads logs

# Create route files

touch routes/authRoutes.js
touch routes/foodRoutes.js
touch routes/orderRoutes.js
touch routes/contactRoutes.js

# Create controller files

touch controllers/authController.js
touch controllers/foodController.js
touch controllers/orderController.js

# Create middleware files

touch middleware/authMiddleware.js
touch middleware/fileMiddleware.js

cd backend
npm install nodemailer
