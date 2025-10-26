# Vercel Deployment Guide for Mwaslatak Transportation App

## 🚀 Quick Fix for Login Issues

### 1. Environment Variables Setup

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
MONGODB_URI = mongodb+srv://alifikry939_db_user:UEDV5sNO5PRTKh2C@cluster0.lzz9rgq.mongodb.net/mwaslatak-transport?retryWrites=true&w=majority
JWT_SECRET = your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE = 30d
NODE_ENV = production
```

### 2. Vercel Configuration

The `vercel.json` file has been created with:
- ✅ Correct build configuration
- ✅ Environment variables
- ✅ Route handling

### 3. Common Login Issues & Solutions

#### Issue 1: "Server error in authentication"
**Solution:** Environment variables not set in Vercel
- Add all environment variables in Vercel dashboard
- Redeploy the application

#### Issue 2: Database connection fails
**Solution:** MongoDB URI might be incorrect
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes Vercel IPs (0.0.0.0/0)

#### Issue 3: JWT token issues
**Solution:** JWT_SECRET not set
- Set JWT_SECRET in Vercel environment variables
- Use a strong, random secret key

### 4. Testing After Deployment

#### Test Registration:
```bash
curl -X POST https://your-app.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","phone":"+1234567890"}'
```

#### Test Login:
```bash
curl "https://your-app.vercel.app/api/users/login?email=test@example.com&password=test123"
```

#### Test Metro Network API:
```bash
curl "https://your-app.vercel.app/api/users/metro-network"
```

### 5. MongoDB Atlas Configuration

**Ensure these settings in MongoDB Atlas:**
1. **Network Access:** Add `0.0.0.0/0` (allow all IPs)
2. **Database User:** Verify credentials are correct
3. **Cluster Status:** Ensure cluster is running

### 6. Vercel Deployment Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Check logs
vercel logs
```

### 7. Debugging Steps

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions → View Logs

2. **Test Environment Variables:**
   ```javascript
   console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
   console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
   ```

3. **Test Database Connection:**
   - Check MongoDB Atlas logs
   - Verify connection string format

### 8. Production Checklist

- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas IP whitelist configured
- [ ] JWT_SECRET is secure and random
- [ ] All API endpoints tested
- [ ] CORS configured for production domain
- [ ] Error handling working properly

## 🔧 Quick Fix Commands

```bash
# Redeploy with new environment variables
vercel --prod

# Check deployment status
vercel ls

# View function logs
vercel logs --follow
```

## 📞 Support

If login still doesn't work after these steps:
1. Check Vercel function logs
2. Verify MongoDB Atlas connection
3. Test API endpoints individually
4. Check browser network tab for errors
