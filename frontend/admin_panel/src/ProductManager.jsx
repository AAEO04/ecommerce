// file: frontend/admin_panel/src/ProductManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ADMIN_API_URL = 'http://localhost:8001';
const PRODUCT_API_URL = 'http://localhost:8000';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [variants, setVariants] = useState([{ size: '', color: '', price: 0, stock_quantity: 0 }]);
  const [imageFiles, setImageFiles] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${PRODUCT_API_URL}/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackMessage('Failed to load products.');
      setSnackSeverity('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', price: 0, stock_quantity: 0 }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setVariants([{ size: '', color: '', price: 0, stock_quantity: 0 }]);
    setImageFiles([]);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0 || variants.some(v => !v.size)) {
        setSnackMessage('Add at least one variant with a size.');
        setSnackSeverity('warning');
        return;
    }
    setIsLoading(true);

    let newImageUrls = [];
    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => {
            const formData = new FormData();
            formData.append("file", file);
            return axios.post(`${ADMIN_API_URL}/admin/upload-image/`, formData);
        });

        try {
            const responses = await Promise.all(uploadPromises);
            newImageUrls = responses.map(res => res.data.image_url);
        } catch (error) {
            console.error("Image upload failed:", error);
            setSnackMessage('Image upload failed.');
            setSnackSeverity('error');
            setIsLoading(false);
            return;
        }
    }

    const existingImageUrls = editingProduct ? editingProduct.images.map(img => img.image_url) : [];
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    const productData = {
        name: productName,
        description: productDescription,
        image_urls: allImageUrls,
        variants: variants.map(v => ({...v, price: parseFloat(v.price) || 0, stock_quantity: parseInt(v.stock_quantity) || 0})),
    };

    const url = editingProduct ? `${ADMIN_API_URL}/admin/products/${editingProduct.id}` : `${ADMIN_API_URL}/admin/products/`;
    const method = editingProduct ? 'put' : 'post';

    try {
        await axios[method](url, productData);
        const msg = editingProduct ? 'Product updated!' : 'Product created!';
        setSnackMessage(msg);
        setSnackSeverity('success');
        resetForm();
        fetchProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        setSnackMessage(`Failed to ${editingProduct ? 'update' : 'create'} product.`);
        setSnackSeverity('error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setProductName(product.name);
    setProductDescription(product.description);
    setVariants(product.variants || []);
    setImageFiles([]);
    setEditingProduct(product);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${ADMIN_API_URL}/admin/products/${deletingId}/`);
      setSnackMessage('Product deleted!');
      setSnackSeverity('success');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      setSnackMessage('Failed to delete product.');
      setSnackSeverity('error');
    } finally {
      setIsLoading(false);
      setOpenDelete(false);
    }
  };

  const handleCloseSnack = () => setSnackMessage('');

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Card sx={{ p: 3, flex: 1, alignSelf: 'flex-start' }}>
        <Typography variant="h5" gutterBottom>{editingProduct ? 'Edit Product' : 'Add New Product'}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField fullWidth label="Product Name" variant="outlined" value={productName} onChange={(e) => setProductName(e.target.value)} margin="normal" required disabled={isLoading} />
          <TextField fullWidth label="Description" variant="outlined" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} margin="normal" multiline rows={4} disabled={isLoading} />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Product Images:</Typography>
          <Button variant="contained" component="label" disabled={isLoading}>
              Upload Images
              <input type="file" hidden multiple onChange={(e) => setImageFiles(Array.from(e.target.files))} />
          </Button>
          <Box sx={{ mt: 1 }}>
              {imageFiles.map(file => <Typography key={file.name} variant="caption" display="block">{file.name}</Typography>)}
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Variants:</Typography>
          {variants.map((variant, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField label="Size" size="small" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} sx={{ flex: 1 }} disabled={isLoading} required />
              <TextField label="Color" size="small" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} sx={{ flex: 1 }} disabled={isLoading} />
              <TextField label="Price" type="number" size="small" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} sx={{ width: 100 }} disabled={isLoading} />
              <TextField label="Stock" type="number" size="small" value={variant.stock_quantity} onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)} sx={{ width: 100 }} disabled={isLoading} />
              <IconButton color="error" onClick={() => removeVariant(index)} disabled={isLoading}><DeleteIcon /></IconButton>
            </Box>
          ))}
          <Button type="button" variant="outlined" onClick={addVariant} sx={{ mt: 1 }} disabled={isLoading}>Add Variant</Button>
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : editingProduct ? 'Update Product' : 'Create Product'}</Button>
            {editingProduct && (<Button variant="text" onClick={resetForm} sx={{ ml: 2 }} disabled={isLoading}>Cancel Edit</Button>)}
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3, flex: 1, alignSelf: 'flex-start' }}>
        <Typography variant="h5" gutterBottom>Existing Products</Typography>
        {isLoading && products.length === 0 ? (<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>) : (
          <List>
            {products.map((product) => (
              <ListItem key={product.id} secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleEdit(product)}><EditIcon /></IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                </Box>
              }>
                <ListItemText primary={product.name} secondary={`${product.variants?.length || 0} variants`} />
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this product? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete} disabled={isLoading}>{isLoading ? <CircularProgress size={20} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackMessage} autoHideDuration={4000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnack} severity={snackSeverity} sx={{ width: '100%' }}>{snackMessage}</Alert>
      </Snackbar>
    </Box>
  );
}