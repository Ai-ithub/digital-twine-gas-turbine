# 🚀 Quick Dashboard Run Guide

## ✅ Step 1: Check Prerequisites

```bash
# Check Node.js (must be >= 18)
node --version

# Check npm
npm --version

# Check Docker (for the backend)
docker --version
```

---

## ✅ Step 2: Install the Frontend

```bash
# Go to the frontend folder
cd "C:\Users\asus\Documents\companies\ithub\AI\products\clones\digital twin\digital-twine-gas-turbine-1\frontend"

# Install dependencies
npm install

# If you get an error, try this:
npm install --legacy-peer-deps
```

---

## ✅ Step 3: Run the Frontend

```bash
# In the same frontend folder
npm run dev
```

**The output should look like this:**
```
  VITE v7.1.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Step 4: Open the Browser

1. **Open:** http://localhost:5173/

2. **Various pages:**
   - Main Dashboard: http://localhost:5173/dashboard
   - Chart test: http://localhost:5173/test-charts ⭐ **Try this first**
   - Graph Analysis: http://localhost:5173/graph-analysis
   - Control: http://localhost:5173/control
   - Real-Time Optimization: http://localhost:5173/real-time-op

---

## 🧪 Quick Chart Test

If the charts are not displayed:

### 1. Go to the test page:
```
http://localhost:5173/test-charts
```

### 2. Check the Console:
- Press `F12`
- Open the **Console** tab
- You should see these messages:
  ```
  TestChartsPage rendered
  Test Data: [{...}, {...}, ...]
  ```

### 3. If you see an error:
- Copy the error
- Search on Google
- Or tell me!

---

## ❌ Common Problems and Solutions

### Problem 1: "Cannot find module 'recharts'"

**Solution:**
```bash
cd frontend
npm install recharts@latest
npm install @mui/x-charts@latest
```

### Problem 2: The page is white

**Solution:**
1. Open the Console (F12)
2. Read the errors
3. Clear the browser cache:
   - `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Delete
4. Hard Refresh: `Ctrl + Shift + R`

### Problem 3: "Port 5173 is already in use"

**Solution:**
```bash
# Close the Terminal and reopen it
# Or change the port:
npm run dev -- --port 3000
```

### Problem 4: npm install gives an error

**Solution:**
```bash
# Clear the cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 🎯 Login to the Dashboard

If it asks you to log in:

```
Username: admin
Password: admin123
```

**Note:** For this, the backend must be running.

---

## 🐳 Run the Backend (Optional)

If you want to see real data:

```bash
# Return to root
cd "C:\Users\asus\Documents\companies\ithub\AI\products\clones\digital twin\digital-twine-gas-turbine-1"

# Run with Docker
docker-compose up -d

# Or without Docker:
cd backend
pip install -r ../requirements.txt
python api/app.py
```

---

## 📸 Screenshot the Problem

If you have a problem, provide this information:

1. **Screenshot of the page**
2. **Screenshot of the Console (F12 → Console)**
3. **Screenshot of the Network Tab (F12 → Network)**
4. **The output of the Terminal where you ran `npm run dev`**

---

## ✅ Final Checklist

Before saying "it doesn't work", check these:

- [ ] `npm install` has been run
- [ ] `npm run dev` is running
- [ ] The browser is open at `http://localhost:5173`
- [ ] The Console has no errors (F12)
- [ ] The browser cache is cleared
- [ ] A Hard Refresh was done (Ctrl+Shift+R)
- [ ] The test page was tried (`/test-charts`)

---

## 🎉 Success!

If you see the charts:
- ✅ recharts works
- ✅ @mui/x-charts works
- ✅ The Dashboard is ready!

**Now you can go to the main pages:**
- `/dashboard` - main page with Gauges
- `/graph-analysis` - Noise and Histogram charts
- `/control` - turbine control
- `/real-time-op` - optimization

---

**Important note:** If you change the code, the file reloads automatically. No restart is needed!

