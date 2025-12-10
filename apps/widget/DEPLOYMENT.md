# Tourify Widget - Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development
```bash
npm run dev
# Opens test/index.html automatically at http://localhost:3000
```

### 3. Build for Production
```bash
npm run build
# Creates: dist/tourify-widget.js (single file with CSS injected)
# Also copies: public/Chick.gltf to dist/
```

## 📦 What Gets Built

After running `npm run build`, you'll have:
```
dist/
├── tourify-widget.js    # Single minified JS file with CSS
└── Chick.gltf          # 3D avatar model
```

## 🌐 Deployment Options

### Option 1: Cloudflare Pages (Recommended)

1. Push your code to GitHub
2. Go to Cloudflare Pages Dashboard
3. Create new project → Connect GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy!

**Your CDN URL will be:**
```
https://your-project.pages.dev/tourify-widget.js
https://your-project.pages.dev/Chick.gltf
```

### Option 2: Netlify

1. Connect GitHub repo to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy!

**Your CDN URL:**
```
https://your-site.netlify.app/tourify-widget.js
```

### Option 3: Vercel

Same as Netlify - connect repo and auto-deploy.

### Option 4: AWS S3 + CloudFront

```bash
# Build first
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --acl public-read

# Set up CloudFront distribution pointing to your S3 bucket
```

### Option 5: Self-Host

Just upload the `dist/` folder to any web server:
```bash
# Via FTP, rsync, or any deployment method
scp -r dist/* user@your-server.com:/var/www/html/tourify/
```

## 📖 Usage After Deployment

### Method 1: Auto-Initialize with Data Attributes

```html
<script 
  src="https://your-cdn.com/tourify-widget.js"
  data-tour-id="my-tour"
  data-auto-start="true"
  data-show-avatar="true">
</script>
```

### Method 2: Manual Initialization

```html
<script src="https://your-cdn.com/tourify-widget.js"></script>
<script>
  // Access the global TourWidget instance
  console.log(window.TourWidget);
  
  // Control methods:
  TourWidget.start();   // Start tour
  TourWidget.stop();    // Stop tour
  TourWidget.next();    // Go to next step
  TourWidget.prev();    // Go to previous step
  TourWidget.destroy(); // Clean up
</script>
```

### Method 3: Create New Instance

```html
<script src="https://your-cdn.com/tourify-widget.js"></script>
<script>
  // Create custom instance
  const myTour = new TourifyWidget();
  
  myTour.init({
    tourId: 'custom-tour',
    autoStart: false,
    showAvatar: true,
    theme: 'light',
    apiUrl: 'https://api.example.com',
    modelUrl: 'https://your-cdn.com/Chick.gltf'
  });
  
  // Start manually
  myTour.start();
</script>
```

## 🎨 Customization

### Custom Avatar Model

1. Replace `public/Chick.gltf` with your own GLTF model
2. Rebuild: `npm run build`
3. Or specify custom URL:

```html
<script 
  src="https://your-cdn.com/tourify-widget.js"
  data-model-url="https://your-cdn.com/custom-avatar.gltf">
</script>
```

### Custom API Endpoint

```html
<script 
  src="https://your-cdn.com/tourify-widget.js"
  data-api-url="https://api.yourcompany.com"
  data-tour-id="welcome-tour">
</script>
```

## 🔍 Testing Locally

```bash
# Development mode
npm run dev

# Test production build locally
npm run build
npx serve dist
# Visit http://localhost:3000
```

## 📊 Analytics

The widget automatically tracks:
- `tour_initialized` - When widget loads
- `tour_started` - When tour begins
- `step_viewed` - Each step viewed
- `step_completed` - When user proceeds
- `tour_completed` - Tour finished
- `tour_skipped` - User skipped/closed

Access analytics:
```javascript
// Get all events
const events = TourWidget.getAnalytics();
console.log(events);
```

## 🐛 Debugging

```javascript
// Check if widget loaded
console.log(window.TourWidget);
console.log(window.TourifyWidget);

// View stored analytics
const events = JSON.parse(localStorage.getItem('tour_analytics_ecommerce-demo'));
console.log(events);

// Check tour progress
const progress = JSON.parse(localStorage.getItem('tour_progress_ecommerce-demo'));
console.log(progress);
```

## 🎯 Example Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app">
    <nav id="main-nav">...</nav>
    <button id="create-btn">Create</button>
  </div>

  <!-- Add Tourify -->
  <script src="https://your-cdn.com/tourify-widget.js"></script>
  <script>
    // Auto-starts tour if user hasn't seen it
    // Uses the mock data built into the widget (getMockTourData)
  </script>
</body>
</html>
```

## 🔐 Security Notes

- Widget uses localStorage for progress tracking
- No external API calls by default (configurable)
- Analytics stored locally unless API endpoint configured
- Model files served from your CDN

## 📝 File Size

After build:
- `tourify-widget.js`: ~500-800KB (includes Three.js)
- `Chick.gltf`: Size depends on your model

Consider gzip compression on your CDN for smaller file sizes.

## ✅ Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome Android

Requires:
- ES6 support
- WebGL (for 3D avatar)
- LocalStorage

## 🚨 Common Issues

### Avatar not loading
- Check browser console for GLTF loading errors
- Verify Chick.gltf is in the same directory as tourify-widget.js
- Check CORS settings if hosting on different domain

### Tour not starting
- Check `data-auto-start="true"` attribute
- Verify target elements exist: `document.querySelector('#your-target')`
- Check browser console for errors

### Animations not working
- Verify GLTF file has animations embedded
- Check animation names in console logs
- Try with fallback emoji mode

## 📞 Support

For issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. localStorage for saved state
4. Element inspector for DOM issues