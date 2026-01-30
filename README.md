# PixiJS Chest Game

A high-performance, interactive game built with [PixiJS](https://pixijs.com/) and TypeScript. This project demonstrates production-level game logic, state management, and testing practices.

## 🚀 Features

- **Interactive Gameplay**: Clickable chests with dynamic states (Open, Closed).
- **Game Logic**: Robust state management handling wins, losses, and bonus rounds.
- **Performance**: Optimized rendering using PixiJS's WebGL renderer.
- **Type Safety**: Fully typed codebase using TypeScript.
- **Testing**: Comprehensive unit tests using Jest.

## 🛠️ Tech Stack

- **Core**: [PixiJS](https://pixijs.com/), TypeScript
- **Testing**: Jest, ts-jest
- **Tooling**: Prettier, ESLint

## 📋 Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## ⚙️ Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd pixi.js
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## ▶️ Running the Game

To start the development server and run the game locally:

```bash
npm start
```

Open your browser and navigate to the local server address displayed in your terminal `http://localhost:5173`.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be generated in the `dist/` directory, ready for deployment to any static hosting service.

## 🧪 Testing

This project uses Jest for unit testing game logic.

**Run all tests:**

```bash
npm test
```

## 🎨 Code Quality

**Linting:**

```bash
npm run lint
```

**Formatting:**

```bash
npm run format
```
