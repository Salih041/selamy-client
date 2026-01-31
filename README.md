# SelamY Blog Client (Frontend)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

**SelamY Blog Client** is the modern, responsive frontend interface for the SelamY platform. It offers a seamless blogging experience with a rich text editor, real-time feedback, and a secure environment.

[**🔴 Live Demo**](https://www.selamy.me)

---

## Key Features

- **Modern & Responsive UI:** Fully responsive design for mobile and desktop experiences.
- **Rich Text Editor:** Integrated **React-Quill-New** for advanced post creation (Bold, Italic, Links, Images).
- **Security:**
  - **XSS Protection:** Implements `DOMPurify` to sanitize HTML content before rendering.
  - **Safe Parsing:** Uses `DOMParser` for safe content previews on the homepage.
- **User Dashboard:**
  - Profile management with Avatar upload.
  - Bio editing and personal post history.
  - Tabs for Liked Posts, Saved Posts, and Drafts.
- **Real-time Feedback:** Enhanced UX with **React-Hot-Toast** notifications.
- **Dynamic Tagging:** Categorize posts with a flexible tagging system.
- **Image Handling:** Optimized image uploads via Cloudinary integration.

## Tech Stack

- **Core:** React 18 (Vite)
- **Routing:** React Router Dom v7
- **State Management:** Context API (Auth Context)
- **HTTP Client:** Axios (with Interceptors for token management)
- **Styling:** Custom CSS (Flexbox)
- **Editor:** React-Quill
- **Utilities:** DOMPurify, React-Loading-Skeleton

## Getting Started

Follow these steps to run the project ***locally***.

### Prerequisites
- Node.js
- Running Backend Service [See Backend Repo](https://github.com/Salih041/Blog_API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Salih041/selamy-client
   cd selamy-client
2. **Install dependencies**
    ```bash
    npm install
3. **Environment Variables** Create a .env file in the root directory:
    ```bash
    # Local Backend URL
    VITE_API_URL=http://localhost:3000/api
4. **Run the application**
     ```bash
     npm run dev

### License
Distributed under the MIT License. See LICENSE for more information.

---
**Developed by [Salih Özbek](https://www.linkedin.com/in/salihozbk41)**
