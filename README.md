# Safarnama 🌍

Safarnama is a clean, modern, and utility-first travel management and expense sharing application. It is designed to help you organize trips, split expenses seamlessly, and keep track of your travel memories.

Built with an emphasis on a calm, intent-driven user experience, Safarnama features a minimalist dark-mode default interface inspired by modern design trends.

## Features ✨

- **Travel Management:** Organize your trips, itineraries, and travel plans in one place.
- **Expense Sharing:** Easily track group expenses, split costs, and settle balances.
- **Modern UI/UX:** A pristine dark-themed interface built with Tailwind CSS, utilizing a Monochrome Pro aesthetic.
- **Real-time Sync:** Powered by Firebase (Auth & Firestore) for real-time updates and seamless data flow.
- **Responsive Design:** Works flawlessly across desktop, tablet, and mobile devices.

## Tech Stack 🛠️

- **Frontend:** React, Vite, Tailwind CSS
- **Backend as a Service (BaaS):** Firebase (Authentication, Firestore, Hosting)
- **Icons:** Lucide React

## Repository Structure 📂

- **`client/`**: Contains the frontend application. See the [Client README](client/README.md) for detailed setup and development instructions.

*(Note: Safarnama uses a serverless architecture with Firebase, meaning all backend logic is handled via Firebase security rules and client-side integrations.)*

## Getting Started 🚀

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A [Firebase](https://firebase.google.com/) account for backend services

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/uvic19/Safarnama.git
   cd Safarnama
   ```

2. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Set up Firebase Environment Variables:**
   Create a `.env` file in the `client/` directory and configure your Firebase credentials. See the [Client Setup Instructions](client/README.md#3-firebase-configuration) for more details.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Design System 🎨

Safarnama employs a "Monochrome Pro" theme focusing on:
- **Calm UX:** Reduced visual noise with generous whitespace.
- **Typography:** `Syne` for distinctive headings and `DM Sans` for highly legible body text.
- **Color Palette:** Deep Zinc backgrounds with subtle translucent borders and crisp white accents.

## Contributing 🤝

Contributions are welcome! If you'd like to improve the app, please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is open-source and available under the MIT License.
