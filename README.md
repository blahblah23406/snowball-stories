# Snowball Stories ❄️📖

A real-time, collaborative, chain-storytelling web application. Users log in with Google to collaboratively write stories paragraph by paragraph.

## How It Works
1. **Google Auth**: Secure authentication via Firebase Auth.
2. **Chain Storytelling**: Every story consists of three parts: **Introduction**, **Body**, and **Conclusion**.
3. **Collaboration Guard**: 
   - A user cannot write two consecutive paragraphs in the same story.
   - Once a user submits their contribution, the application automatically finds or creates an active story where they haven't yet contributed.
   - If a user starts writing a paragraph and leaves/closes the tab, the system automatically frees up that paragraph for other authors to edit.
4. **Archive**: View all completed or contributed stories in a clean archive view.

## Tech Stack
- **Frontend**: React, React Router v6
- **Database**: Cloud Firestore (Real-time NoSQL)
- **Auth**: Firebase Authentication (Google OAuth)
- **Style**: Plain vanilla CSS with responsive glassmorphism aesthetic

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/BlahBlah23406/snowball-stories.git
   cd snowball-stories
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server locally:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

## License
MIT License. Created for portfolio presentation.
