# 🔧 Troubleshooting Guide

## ❌ Problem: Graphs and Gauges are not displayed

### Cause:
Dependencies are not installed or `node_modules` is out of date.

### ✅ Solution:

#### 1. Install Dependencies in the Frontend:

```bash
cd frontend
npm install
```

This command installs all of the following libraries:
- `recharts@^3.3.0` - for Line Charts, Bar Charts, Scatter Charts
- `@mui/x-charts@^8.16.0` - for Gauge Components

#### 2. Run the Development Server:

```bash
npm run dev
```

#### 3. Open the Browser:

```
http://localhost:5173/dashboard
```

---

## ❌ Problem: "Gauge is not exported from @mui/x-charts" error

### Cause:
An old version of `@mui/x-charts` is installed.

### ✅ Solution:

```bash
cd frontend
npm uninstall @mui/x-charts
npm install @mui/x-charts@latest
```

---

## ❌ Problem: Console Errors related to recharts

### Cause:
A conflict in React or recharts versions

### ✅ Solution:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Problem: White or blank page

### Checklist:

1. **Check the Console in the Browser (F12):**
   ```
   - Is there a JavaScript error?
   - Is there an import error?
   ```

2. **Check the Network Tab:**
   ```
   - Are the JS/CSS files loading?
   - Is there a 404 error?
   ```

3. **Check the Backend:**
   ```bash
   # Is the backend running?
   curl http://localhost:5000/api/health
   ```

---

## ❌ Problem: Gauges encounter errors

### Check the Import in the component:

```javascript
// ✅ Correct:
import { Gauge } from '@mui/x-charts/Gauge';

// ❌ Wrong:
import { Gauge } from '@mui/x-charts';
```

---

## ❌ Problem: Charts have no data

### Cause:
- The Backend is not running
- The API endpoint is not accessible
- Mock data is not being generated

### ✅ Solution:

1. **Check that the Backend is running:**
   ```bash
   cd backend
   python api/app.py
   ```

2. **Check the State in the Component:**
   - Open: `frontend/src/pages/industrial/GraphAnalysisPage.jsx`
   - Lines 60-61: mock data should be generated
   ```javascript
   setNoiseData(generateNoiseData());
   setHistogramData(generateHistogramData());
   ```

3. **Check the Console:**
   ```javascript
   console.log('Noise Data:', noiseData);
   console.log('Histogram Data:', histogramData);
   ```

---

## ❌ Problem: Responsive Design does not work

### ✅ Solution:

Check that the viewport meta tag exists:

```html
<!-- In index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## ❌ Problem: Sidebar is not displayed on Mobile

### ✅ Solution:

1. Click the menu icon (☰)
2. Check that `IndustrialLayout.jsx` is imported correctly

---

## ❌ Problem: Authentication does not work

### Checklist:

1. **Check .env in the backend:**
   ```bash
   # Does this file exist?
   digital-twine-gas-turbine-1/.env
   
   # Is JWT_SECRET_KEY set?
   cat .env | grep JWT_SECRET_KEY
   ```

2. **Check the Database:**
   ```bash
   docker-compose up mysql
   ```

3. **Check the User:**
   ```sql
   -- Default credentials:
   Username: admin
   Password: admin123
   ```

---

## 🔍 General Debugging

### Debugging steps for any problem:

#### 1. Check the Console (Browser):
```
F12 → Console Tab
```

#### 2. Check the Network:
```
F12 → Network Tab → Reload Page
```

#### 3. Check React DevTools:
```
F12 → Components Tab
- Check State
- Check Props
```

#### 4. Check Backend Logs:
```bash
# The terminal where the backend is running
# Look at the Python errors
```

---

## 📝 Quick Test Code

### Gauge Test:

```javascript
// Add to DisplayPage.jsx
useEffect(() => {
  console.log('Sensor Data:', sensorData);
}, [sensorData]);
```

### Chart Test:

```javascript
// Add to GraphAnalysisPage.jsx
useEffect(() => {
  console.log('Noise Data Length:', noiseData.length);
  console.log('First Data Point:', noiseData[0]);
}, [noiseData]);
```

---

## 🚀 Quick Fix:

If everything is broken, do these things in order:

```bash
# 1. Clear everything
cd frontend
rm -rf node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Run
npm run dev

# 4. In a new browser:
# - Clear the cache (Ctrl+Shift+Delete)
# - Hard Refresh (Ctrl+Shift+R)
# - Open http://localhost:5173/dashboard
```

---

## 📞 Getting Help

If the problem is not solved:

1. **Take a Screenshot of the Console Errors**
2. **Copy the error message**
3. **Say which page has the problem**
4. **Check your Node.js version:** `node --version`

**Required Node.js:** >= 18.0.0

---

## ✅ Checklist Before Running:

- [ ] Node.js is installed (v18+)
- [ ] Docker is running
- [ ] `cd frontend && npm install` has been run
- [ ] The Backend is running
- [ ] The `.env` file exists in the root
- [ ] The browser cache is cleared
- [ ] The Console has no errors

---

**Important note:** If you change `package.json`, **be sure** to run `npm install` again!

