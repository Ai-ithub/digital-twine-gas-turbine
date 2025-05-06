
#  React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.([Vite](https://vitejs.dev/) & [React](https://reactjs.org/) )
 located in the `frontend` directory. It is built using **React**, **Vite**, and **SWC-based plugin** for optimized performance. The development is done entirely in **Visual Studio Code (VSCode)**.

## Features

- ⚛️ React with Vite for fast development and HMR (Hot Module Replacement)
- 🚀 SWC-based plugin for fast compilation: [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)
- 📊 Data visualization using [`Recharts`](https://recharts.org/)To draw interactive and responsive diagrams
- 🧹 ESLint integration for code quality

---

## Getting Started

### 1.  navigate into the frontend folder:

```bash
cd frontend
```

### 2. Install dependencies

Make sure you have Node.js installed, then run:

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```
By default it will be accessible at http://localhost:5173


This will start the Vite dev server with hot-reloading.

---

## Build for Production

To build the project for production:

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

---

## ESLint

ESLint is already set up in this project. To run linting manually:

```bash
npm run lint
```

You can also enable auto-fix in VSCode or run:

```bash
npm run lint -- --fix
```

---


## Useful Links

- [Vite Documentation](https://vitejs.dev/)
- [Recharts Documentation](https://recharts.org/)
- [ESLint Documentation](https://eslint.org/)
- [SWC](https://swc.rs/)


---

