# 1. Create Vite React project

npm create vite@latest Restaurant-Frontend -- --template react

# 2. Go inside project

cd Restaurant-Frontend

# 3. Install dependencies

npm install
npm install react-router-dom swiper --legacy-peer-deps

# 4. Install dev tools

npm install eslint@9.39.3 --save-dev

# 5. Initialize Git

git init

# 6. Add all files

git add .

# 7. Commit

git commit -m "Initial commit - React Vite setup"

# 8. Add remote repo (replace URL with your GitHub repo)

git remote add origin https://github.com/Qazafi-Hussain-Developer/Bye-Bye-Hunger.git

# 9. Set branch to main

git branch -M main

# 10. Pull remote if there is README (avoids non-fast-forward errors)

git pull origin main --allow-unrelated-histories

# 11. Push to GitHub

git push -u origin main

Restaurant-Frontend/
├── public/
│ ├── favicon.svg
│ └── assets/ # images, videos, icons
│
├── src/
│ ├── components/ # Shared reusable components
│ │ ├── Navbar.jsx
│ │ ├── Footer.jsx
│ │ └── Hero.jsx
│ │
│ ├── pages/ # Page-level components
│ │ ├── Home/
│ │ │ ├── Home.jsx
│ │ │ ├── Home.css
│ │ │ ├── Hero.jsx
│ │ │ ├── Services.jsx
│ │ │ ├── Reservation.jsx
│ │ │ ├── Menu.jsx
│ │ │ ├── Team.jsx
│ │ │ └── Testimonial.jsx
│ │ │
│ │ ├── About/
│ │ │ ├── AboutPage.jsx
│ │ │ └── AboutPage.css
│ │ │
│ │ ├── Contact/
│ │ │ ├── Contact.jsx
│ │ │ └── Contact.css
│ │
│ ├── styles/ # Global and CSS variables
│ │ ├── global.css
│ │ └── variables.css
│ │
│ ├── App.jsx
│ └── main.jsx # Entry point
│
├── .gitignore
├── package.json
└── README.md
