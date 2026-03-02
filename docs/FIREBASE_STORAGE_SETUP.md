# Firebase Storage Setup - Configuration Guide

## ⚠️ SECURITY WARNING
**NEVER commit Firebase credentials to the repository. Always use environment variables.**

---

## Step 1: Add Environment Variable in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (**perfectmockup**)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**

### Variable Configuration:

**Name:** `FIREBASE_SERVICE_ACCOUNT`

**Value:** (Paste the entire JSON as a single line - see below)

**Environment:** Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

**Type:** Mark as **Secret** (encrypted)

---

## Step 2: Format the JSON Credential

Copy the JSON credential and **convert to single line** (remove all line breaks):

### Original JSON (DO NOT paste like this):
```json
{
  "type": "service_account",
  "project_id": "perfectmockup-storage",
  "private_key_id": "170ec1c678a0218f9bceea214f514ebb89029f2e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBA...",
  "client_email": "firebase-adminsdk-fbsvc@perfectmockup-storage.iam.gserviceaccount.com",
  ...
}
```

### Single Line JSON (paste THIS in Vercel):

**Use the actual JSON credential you received from Firebase Console.**

Example format (single line):
```
{"type":"service_account","project_id":"your-project-id","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40your-project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

⚠️ **Important:** Keep the `\n` characters as literal `\n` in the private_key field (not actual line breaks).

---

## Step 3: Save and Redeploy

After adding the environment variable:

1. Click **Save**
2. Vercel will automatically redeploy
3. OR manually trigger: Go to **Deployments** → **Redeploy**

---

## Step 4: Verify Configuration

### Check Vercel Deployment Logs:

Look for this message in the logs:
```
✅ Firebase Admin SDK initialized successfully
```

### Check Error Logs:

If you see this error:
```
❌ FIREBASE_SERVICE_ACCOUNT environment variable is not set
```

→ Go back to Step 1 and verify you added the variable correctly

---

## Architecture Changes Summary

### Before (Base64 inline):
```
User generates image 
  → Vercel Function returns base64 (3 MB)
  → User refreshes page
  → Vercel Function serves base64 again (3 MB)
  → ZERO CACHE → High bandwidth consumption
```

### After (Firebase Storage):
```
User generates image
  → Vercel Function uploads to Firebase Storage
  → Returns Firebase CDN URL
  → User refreshes page
  → Browser loads from Firebase CDN cache
  → Vercel origin transfer = ZERO
```

---

## Expected Impact

**Bandwidth Reduction:** ~95%

- **Before:** 10 GB origin transfer
- **After:** <500 MB origin transfer

**Cost:**
- Firebase Storage: Free tier (1 GB/day downloads, 5 GB storage)
- Vercel: Stays within free tier limits

---

## Troubleshooting

### Error: "Failed to initialize Firebase Admin SDK"

**Solution:** Check that `FIREBASE_SERVICE_ACCOUNT` is:
1. Added in Vercel Dashboard
2. Formatted as single-line JSON
3. Marked as "Secret"
4. Applied to Production, Preview, Development

### Error: "Private key must be a string"

**Solution:** The `\n` characters in the private key must be preserved as literal `\n` (not actual line breaks)

### Images not loading

**Solution:** Check Firebase Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /generated/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if false; // Only server can write
    }
  }
}
```

---

## Security Best Practices

✅ **DO:**
- Store credentials in Vercel Environment Variables (encrypted)
- Mark as "Secret" in Vercel Dashboard
- Use `.env.example` for documentation (without real values)
- Add `.env` to `.gitignore`

❌ **DON'T:**
- Commit credentials to git repository
- Share credentials in Slack/Discord/Email
- Store in plain text files
- Hardcode in source code

---

## Next Steps

After successful deployment:

1. Monitor Vercel Analytics (24-48 hours)
2. Check Firebase Storage usage
3. Verify bandwidth reduction
4. Document results in `docs/VERCEL_BANDWIDTH_DIAGNOSTIC.md`
