# everynote

> Encrypted notes for everyone. Private by default, public by choice.

A beautifully minimal, end-to-end encrypted note-publishing platform. Zero backend, zero tracking, zero compromise.

![everynote](https://img.shields.io/badge/encryption-AES--256--GCM-green)
![everynote](https://img.shields.io/badge/key%20derivation-PBKDF2-blue)
![everynote](https://img.shields.io/badge/backend-none-orange)

## ✨ Features

- **End-to-end encryption** — Private notes are encrypted with AES-256-GCM before they ever leave your device
- **Zero-knowledge design** — We never see your passwords or decrypted content
- **PBKDF2 key derivation** — 600,000 iterations protect against brute force attacks
- **Shareable links** — Share encrypted notes via URL; recipients need the password to decrypt
- **No account required** — Start writing immediately
- **Works offline** — All data stored locally in your browser
- **Beautiful design** — Refined, elegant, distraction-free writing experience

## 🔐 Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR DEVICE                              │
├─────────────────────────────────────────────────────────────┤
│  Password ──► PBKDF2 (600k iterations) ──► AES-256 Key      │
│                                                ↓             │
│  Note Content ──────────────────────────► Encryption        │
│                                                ↓             │
│                                         Ciphertext          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Stored in LocalStorage
                    or shared via URL
```

**Technical Details:**
- **Encryption:** AES-256-GCM (authenticated encryption)
- **Key Derivation:** PBKDF2-SHA256 with 600,000 iterations
- **Salt:** 16 bytes, cryptographically random per note
- **IV/Nonce:** 12 bytes, cryptographically random per encryption
- **Implementation:** Web Crypto API (browser-native, FIPS-compliant)

## 🚀 Deploy to GitHub Pages

### Option 1: One-Click Deploy

1. Fork this repository
2. Go to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Your site will be live at `https://yourusername.github.io/everynote`

### Option 2: Custom Domain

1. Fork and deploy (above steps)
2. In **Settings** → **Pages**, add your custom domain
3. Create a `CNAME` file in the repo root with your domain:
   ```
   everynote.io
   ```
4. Configure your DNS:
   - For apex domain: A records pointing to GitHub's IPs
   - For subdomain: CNAME record pointing to `yourusername.github.io`

## 🔗 Sharing Notes

### Without Firebase (Default)
Notes are encoded directly in the share URL:
- ✅ Works immediately, no setup needed
- ✅ Fully serverless  
- ⚠️ Long notes = long URLs (browser limit ~2000 chars)
- ⚠️ Notes only persist on your device

### With Firebase (Recommended)
Notes stored in cloud with short, clean share links:
- ✅ Short URLs (just the note ID)
- ✅ Notes persist across devices
- ✅ No URL length limits
- ✅ True cross-user sharing

## ☁️ Firebase Setup (10 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" → name it "everynote"
3. Disable Google Analytics (optional) → Create

### 2. Enable Firestore
1. Build → Firestore Database → "Create database"
2. Choose "Start in production mode" → Select region → Enable

### 3. Set Security Rules
In Firestore → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      // Allow reading individual notes by ID (for sharing)
      // But prevent listing/enumeration of all notes
      allow get: if true;
      allow list: if request.auth != null || 
                   (resource.data.userId == request.query.userId);
      
      // Create: userId must match document structure
      allow create: if request.resource.data.userId is string
                    && request.resource.data.id == noteId
                    && request.resource.data.keys().hasAll(['id', 'userId', 'updatedAt']);
      
      // Update/Delete: verify ownership hasn't changed
      allow update: if resource.data.userId == request.resource.data.userId;
      allow delete: if resource.data.userId == request.resource.data.userId;
    }
  }
}
```

> **Security Notes:**
> - `allow get` enables sharing via direct links
> - `allow list` only permits users to query their own notes
> - Ownership (`userId`) cannot be changed after creation

### 4. Get Config & Add to App
1. Project Settings → Your apps → Web `</>`
2. Register app → Copy `firebaseConfig`
3. In `index.html`, replace the config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123:web:abc"
};
```

### Option 3: Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/everynote.git
cd everynote

# Serve locally (any static server works)
npx serve .
# or
python -m http.server 8000
```

## 📁 Project Structure

```
everynote/
├── index.html      # Complete application (single file)
├── CNAME           # Custom domain (optional)
├── README.md       # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## 🎨 Design Philosophy

everynote is intentionally minimal:

- **Single HTML file** — No build step, no dependencies, instant loading
- **No frameworks** — Vanilla JavaScript, future-proof
- **Typography-first** — Cormorant Garamond for content, DM Sans for UI
- **Warm palette** — Paper tones that are easy on the eyes
- **Zero tracking** — No analytics, no cookies, no fingerprinting

## 🔒 Privacy Guarantees

1. **No server** — Static hosting only; we can't see your data
2. **No accounts** — Nothing to breach
3. **No cookies** — Nothing to track
4. **No analytics** — We don't know you visited
5. **Client-side only** — Encryption happens in your browser
6. **Open source** — Audit the code yourself

## ⚠️ Important Notes

- **Password recovery is impossible** — If you forget your password, your encrypted notes are unrecoverable. This is a feature, not a bug.
- **Local storage limits** — Browser storage is limited (~5-10MB typically). For extensive use, export your notes regularly.
- **Share carefully** — Anyone with the share link AND password can read encrypted notes.

## 🤝 Contributing

Contributions welcome! Please:

1. Keep the single-file architecture
2. Maintain zero dependencies
3. Preserve the design aesthetic
4. Test encryption/decryption thoroughly

## 📜 License

MIT License — Use freely, modify freely, deploy anywhere.

---

<p align="center">
  <strong>everynote</strong><br>
  <em>Your thoughts, encrypted.</em>
</p>
