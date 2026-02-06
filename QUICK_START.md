# SubHub - Quick Start Guide

## ✅ Your Files Are Ready!

You have 4 files:
- `index.html` (28 KB) - Main website
- `styles.css` (34 KB) - All styling
- `script.js` (25 KB) - All functionality  
- `README_PRODUCTION.md` - Complete documentation

## 🚀 Three Ways to Run SubHub:

### Method 1: Open Directly (Simplest)
1. Download all files to the same folder
2. Double-click `index.html`
3. It opens in your browser and works!

### Method 2: Local Server (Recommended for Testing)
```bash
# Navigate to the folder with your files
cd path/to/subhub

# Start a server (choose one):

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Method 3: GitHub Pages (For Public Hosting)
1. Create new repository on GitHub
2. Upload these 3 files:
   - index.html
   - styles.css
   - script.js
3. Go to repository Settings
4. Click "Pages" in left sidebar
5. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
6. Click "Save"
7. Wait 1-2 minutes
8. Your site will be live at: `https://yourusername.github.io/repository-name`

## 🔍 Troubleshooting

### Page is blank or not loading?

**Check 1: Are all files in the same folder?**
```
your-folder/
  ├── index.html
  ├── styles.css
  └── script.js
```

**Check 2: Open browser console (F12)**
- Press F12 in your browser
- Click "Console" tab
- Look for errors (red text)

Common issues:
- "Failed to load resource" → Files not in same folder
- "CORS error" → Use local server instead of file://
- No errors? → Everything is working!

**Check 3: Try different browser**
- Chrome, Firefox, Edge all supported
- Must be modern browser (not IE)

### Still having issues?

**Verify file integrity:**
```bash
# Check file sizes
ls -lh index.html styles.css script.js

# Should show:
# index.html  ~28KB
# styles.css  ~34KB
# script.js   ~25KB
```

**Test JavaScript:**
```bash
node -c script.js
# No output = file is valid
```

## ✨ What Works Out of the Box:

✅ Search subdomains
✅ Check availability
✅ Claim up to 5 subdomains
✅ Configure DNS records (A, AAAA, CNAME, URL)
✅ Bulk search (up to 50 at once)
✅ Edit/delete subdomains
✅ Advanced options
✅ Complete documentation
✅ Mobile responsive
✅ Data saved in browser

## 🎯 First Steps After Loading:

1. **Search for a subdomain:**
   - Type "myapp" in the search box
   - Select a domain (.subhub.dev)
   - Click "Check"

2. **Try bulk search:**
   - Click "Bulk Search Subdomains"
   - Enter multiple names (one per line):
     ```
     myapp
     blog
     api
     admin
     ```
   - Click "Check All Subdomains"

3. **Claim a subdomain:**
   - When you find available one
   - Click "Claim"
   - Configure DNS settings:
     - Record Type: A
     - Destination: 192.168.1.1
     - TTL: 1 hour
   - Submit!

4. **View your subdomains:**
   - Scroll to "My Subdomains"
   - See all claimed subdomains
   - Edit or delete as needed

## 📱 Browser Compatibility:

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Opera 76+
❌ Internet Explorer (not supported)

## 🔐 Data Storage:

All data is stored in **browser localStorage**:
- Persists between sessions
- Specific to your browser
- Private to your computer
- Clear browser data = loses subdomains

## 🌐 Making it Production Ready:

The current version uses localStorage (client-side only).

For a real production system:
1. Set up backend API (Node.js, Python, PHP, etc.)
2. Connect to database (PostgreSQL, MySQL, MongoDB)
3. Implement user authentication
4. Connect to real DNS provider (Cloudflare, Route53)
5. Add email verification

See `README_PRODUCTION.md` for complete backend integration guide.

## 💡 Tips:

- Use Chrome DevTools to inspect (F12)
- Check "My Subdomains" to see data structure
- localStorage stored under: `localStorage.userSubdomains`
- Export your data: `console.log(localStorage.getItem('userSubdomains'))`
- Import data: `localStorage.setItem('userSubdomains', 'your-json-here')`

## 🎨 Customization:

**Change colors:** Edit `styles.css` line 1-10 (CSS variables)
**Add domains:** Edit `script.js` line 2 (availableDomains array)
**Change limit:** Edit `script.js` search for "5" and change subdomain limit

## 📞 Support:

If you're still having issues:
1. Check TEST.html for file status
2. Review README_PRODUCTION.md
3. Ensure files are not corrupted (check file sizes)
4. Try re-downloading all files
5. Test in incognito/private mode

## ✅ Quick Test Checklist:

- [ ] All 3 files in same folder
- [ ] Opened index.html in browser
- [ ] No console errors (F12)
- [ ] Can see SubHub logo and homepage
- [ ] Search box accepts input
- [ ] Fonts loaded (not using system font)
- [ ] Background has animated gradient blobs
- [ ] Clicking "Check" shows results

If all checked ✅ → **You're good to go!** 🎉

---

**Need help?** Open browser console (F12) and type:
```javascript
console.log('SubHub Version: 1.0');
console.log('Files loaded:', {
    html: document.title,
    css: getComputedStyle(document.body).backgroundColor,
    js: typeof userSubdomains !== 'undefined'
});
```

This will show which components loaded successfully.
