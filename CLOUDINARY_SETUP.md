# Cloudinary Setup Guide for Madrush

This guide will help you set up Cloudinary for image uploads in the admin panel.

## Why Cloudinary?

- **Free tier**: 25GB storage and 25GB bandwidth per month
- **Automatic optimization**: Images are automatically optimized for web
- **CDN delivery**: Fast image delivery worldwide
- **Transformations**: Resize, crop, and transform images on-the-fly
- **No backend storage**: Images are stored in the cloud, not on your server

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

After logging in to your Cloudinary dashboard:

1. Go to **Dashboard** (default page after login)
2. You'll see your **Cloud Name** - copy this
3. Scroll down to find **Upload Presets** section

### 3. Create an Upload Preset

Upload presets define how images should be handled when uploaded.

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `madrush_products` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned** (for frontend uploads)
   - **Folder**: Enter `madrush/products` (optional, organizes your images)
   - **Allowed formats**: `jpg, png, webp`
   - **Max file size**: `10485760` (10MB in bytes)
   - **Transformation**: (optional) You can add automatic transformations
5. Click **Save**

### 4. Configure Your Admin Panel

1. Navigate to `frontend/admin_panel/`
2. Create a `.env.local` file (copy from `.env.local.example`)
3. Add your Cloudinary credentials:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=madrush_products

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: Replace `your_cloud_name_here` with your actual Cloud Name from step 2.

### 5. Test the Setup

1. Start your admin panel:
   ```bash
   cd frontend/admin_panel
   npm run dev
   ```

2. Log in to the admin panel
3. Go to **Products** → **Add Product**
4. Try uploading an image
5. You should see "Uploading images to Cloudinary..." message
6. Check your Cloudinary dashboard to see the uploaded image

## Folder Structure in Cloudinary

Images will be organized as:
```
madrush/
  └── products/
      ├── image1.jpg
      ├── image2.png
      └── ...
```

## Security Notes

- ✅ **Unsigned uploads are safe** for your use case because:
  - Upload preset limits file types and sizes
  - Images are public anyway (product images)
  - No sensitive data is being uploaded
  
- ⚠️ **For production**, consider:
  - Setting up signed uploads (requires backend)
  - Adding rate limiting
  - Monitoring your usage

## Troubleshooting

### Error: "Cloudinary is not configured"

**Solution**: Make sure your `.env.local` file exists and contains the correct credentials.

### Error: "Upload failed"

**Possible causes**:
1. Invalid Cloud Name - double-check it matches your dashboard
2. Invalid Upload Preset - make sure it's set to "Unsigned"
3. File too large - max 10MB per file
4. Invalid file type - only JPG, PNG, WebP allowed

### Images not appearing in Cloudinary dashboard

**Solution**: 
1. Check the folder path in your upload preset
2. Look in the **Media Library** section
3. Filter by date to find recent uploads

## Cost Considerations

**Free Tier Limits**:
- 25 GB storage
- 25 GB bandwidth/month
- 25 credits/month (transformations)

**Typical usage**:
- 1 product image ≈ 500KB - 2MB
- 100 products with 3 images each ≈ 150-600MB storage
- Should be well within free tier for small to medium stores

## Advanced Features (Optional)

### Automatic Image Optimization

Add to your upload preset:
```
Transformation: c_limit,w_1200,q_auto,f_auto
```
This will:
- Limit width to 1200px
- Auto quality
- Auto format (WebP for supported browsers)

### Lazy Loading

Images from Cloudinary support lazy loading out of the box.

### Responsive Images

You can generate different sizes:
```
https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_400/madrush/products/image.jpg
https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_800/madrush/products/image.jpg
```

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [React Integration](https://cloudinary.com/documentation/react_integration)

## Next Steps

After setting up Cloudinary:

1. ✅ Test uploading images in the admin panel
2. ✅ Verify images appear on the customer store
3. ✅ Monitor your Cloudinary usage in the dashboard
4. Consider setting up automatic backups (optional)
