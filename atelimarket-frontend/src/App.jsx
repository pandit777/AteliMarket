import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

// API URLs from environment
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || import.meta.env.REACT_APP_AUTH_URL || 'http://localhost:5000/api/auth';

// =============================================
// IMAGE URL BUILDER
// =============================================
const getProductDisplayImage = (product) => {
  if (!product) return '';
  
  const imagePaths = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagePaths.push(...product.images);
  }
  if (product.image) imagePaths.push(product.image);
  if (product.imageUrl) imagePaths.push(product.imageUrl);
  if (product.img) imagePaths.push(product.img);
  
  const validPaths = imagePaths.filter(Boolean);
  
  if (validPaths.length > 0) {
    return validPaths[0];
  }
  
  const category = (product.category || 'Product').toString();
  const label = (product.name || 'Product').toString();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" rx="24" fill="#0B3C5D"/>
      <rect x="24" y="24" width="352" height="252" rx="18" fill="rgba(255,255,255,0.12)"/>
      <circle cx="300" cy="90" r="48" fill="#FF5722"/>
      <text x="200" y="160" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="700">${label}</text>
      <text x="200" y="205" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16">${category}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// =============================================
// PRODUCT DETAIL PAGE
// =============================================
const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [mainImage, setMainImage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
        const mainImg = getProductDisplayImage(response.data.product);
        setMainImage(mainImg);
        setSelectedImage(mainImg);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const event = new CustomEvent('addToCart', { detail: product });
    window.dispatchEvent(event);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C5D]"></div>
        <p className="text-slate-400 mt-4 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-red-500 font-bold text-lg">{error || 'Product not found'}</h3>
        <Link to="/" className="mt-4 inline-block bg-[#0B3C5D] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#07263b] transition">
          ← Back to Shopping
        </Link>
      </div>
    );
  }

  const images = product.images?.filter(Boolean) || [mainImage];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-[#0B3C5D] transition">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/?category=${product.category}`} className="hover:text-[#0B3C5D] transition">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <img 
              src={selectedImage || mainImage} 
              alt={product.name}
              className="w-full h-96 object-contain rounded-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getProductDisplayImage(product);
              }}
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition ${
                    selectedImage === img ? 'border-[#0B3C5D] shadow-md' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getProductDisplayImage(product);
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-slate-500 mt-1">Brand: <span className="font-medium">{product.brand}</span></p>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-[#0B3C5D]">₹{product.price}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">₹{product.originalPrice}</span>
                  <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1 rounded-full">
                    -{product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            {product.discountPercent > 0 && (
              <p className="text-sm text-green-600 font-medium mt-1">
                You save ₹{product.originalPrice - product.price}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-bold text-sm">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {product.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {product.description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
                <span>📝</span> Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.weight && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Weight</span>
                <span className="font-medium">{product.weight}</span>
              </div>
            )}
            {product.color && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Color</span>
                <span className="font-medium">{product.color}</span>
              </div>
            )}
            {product.size && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Size</span>
                <span className="font-medium">{product.size}</span>
              </div>
            )}
            {product.material && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Material</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.warranty && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Warranty</span>
                <span className="font-medium">{product.warranty}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="bg-white border border-slate-200 p-3 rounded-xl col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Dimensions</span>
                <span className="font-medium">{product.dimensions}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition ${
                product.stock > 0
                  ? 'bg-[#FF5722] text-white hover:bg-[#e64a19] shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
            </button>
            <Link to="/" className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              ← Back
            </Link>
          </div>

          <div className="flex justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-100">
            <span>✅ Secure Checkout</span>
            <span>🚚 Free Delivery</span>
            <span>🔄 7-Day Return</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// ORDER TRACKING COMPONENT
// =============================================
const OrderTracking = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('atelimarket_user_token');
      
      const response = await axios.get(
        `${API_URL}/orders/${orderId}/tracking`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setTracking(response.data.tracking);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order tracking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Order Placed': 'bg-orange-100 text-orange-700',
      'Order Confirmed': 'bg-yellow-100 text-yellow-700',
      'Confirmed': 'bg-yellow-100 text-yellow-700',
      'Shipped': 'bg-blue-100 text-blue-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C5D]"></div>
        <p className="text-slate-400 mt-4 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-red-500 font-bold text-lg">{error || 'Order not found'}</h3>
        <Link to="/orders" className="mt-4 inline-block bg-[#0B3C5D] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#07263b] transition">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-gradient-to-r from-[#0B3C5D] to-[#1a6496] text-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              <span>📦</span> Order Tracking
            </h2>
            <p className="text-sm opacity-80 mt-1 font-mono">
              Order ID: #{tracking.orderId?.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Placed: {new Date(tracking.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <span className="text-xs font-bold uppercase tracking-wider">Status:</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(tracking.currentStatus)}`}>
              {tracking.currentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
          <span>🚚</span> Delivery Timeline
        </h3>
        
        <div className="space-y-6 relative">
          {tracking.timeline?.map((step, index) => (
            <div key={index} className="flex gap-4 relative">
              {index < tracking.timeline.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                  step.completed ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
              
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${
                step.completed 
                  ? 'bg-green-100 border-green-500' 
                  : 'bg-slate-100 border-slate-300'
              }`}>
                {step.icon}
              </div>
              
              <div className="flex-1 pt-0.5">
                <div className={`font-bold text-sm ${
                  step.completed ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step.status}
                </div>
                <div className={`text-xs ${
                  step.completed ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {step.description}
                </div>
                {step.timestamp && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(step.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <span>📋</span> Order Summary
        </h3>
        
        <div className="space-y-2">
          {tracking.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
              <div className="flex items-center gap-3 flex-1">
                <img 
                  src={getProductDisplayImage(item)} 
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                />
                <span className="font-medium text-slate-700 flex-1">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-xs">×{item.qty}</span>
                <span className="font-bold text-[#0B3C5D]">₹{item.price * item.qty}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t-2 border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-600">Total</span>
          <span className="text-xl font-black text-[#0B3C5D]">₹{tracking.total}</span>
        </div>
      </div>

      {tracking.delivery && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-slate-100">
          <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
            <span>📬</span> Delivery Address
          </h4>
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">{tracking.delivery.fullName}</p>
            <p>{tracking.delivery.address}</p>
            <p>{tracking.delivery.city}, {tracking.delivery.state} - {tracking.delivery.pincode}</p>
            <p className="text-xs text-slate-400">📞 {tracking.delivery.phone}</p>
            {tracking.delivery.note && (
              <p className="text-xs text-slate-400 mt-1">📝 Note: {tracking.delivery.note}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/orders" className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
          ← Back to Orders
        </Link>
        {tracking.currentStatus !== 'Delivered' && tracking.currentStatus !== 'Cancelled' && (
          <button 
            onClick={fetchOrderTracking}
            className="bg-[#0B3C5D] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#07263b] transition flex items-center gap-2"
          >
            <span>🔄</span> Refresh Status
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================
// ✅ ORDERS PAGE COMPONENT - FIXED
// =============================================
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('atelimarket_user_token');
      
      if (!token) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-slate-100 text-slate-700',
      'Confirmed': 'bg-yellow-100 text-yellow-700',
      'Shipped': 'bg-blue-100 text-blue-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C5D]"></div>
        <p className="text-slate-400 mt-4">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <p className="text-red-500 font-bold">{error}</p>
        <Link to="/auth?mode=login" className="mt-4 inline-block bg-[#0B3C5D] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#07263b] transition">
          Login to view orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <span>📦</span> My Orders
        </h1>
        <Link to="/" className="text-sm text-[#0B3C5D] font-bold hover:underline">
          ← Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="font-bold text-lg text-slate-700">No orders yet</h3>
          <p className="text-slate-400 text-sm mt-2">Start shopping to place your first order!</p>
          <Link to="/" className="mt-4 inline-block bg-[#FF5722] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e64a19] transition">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-slate-600">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span className="text-slate-600">
                      {order.items?.length || 0} items
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-[#0B3C5D]">₹{order.total}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                </div>
                <Link 
                  to={`/orders/track/${order._id}`}
                  className="bg-[#0B3C5D] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#07263b] transition text-center whitespace-nowrap"
                >
                  Track Order →
                </Link>
              </div>

              {/* ✅ FIX: Order Items Display - Products properly shown */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-3">
                        <img 
                          src={item.image || getProductDisplayImage(item)} 
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=Product'}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500">
                            ₹{item.price} × {item.qty}
                            {item.originalPrice > item.price && (
                              <span className="text-[9px] text-green-600 ml-1">
                                (₹{item.originalPrice - item.price} saved)
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#0B3C5D]">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================
// MAIN APP COMPONENT
// =============================================
export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('atelimarket_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [placingOrder, setPlacingOrder] = useState(false);

  // Auth States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('atelimarket_admin') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('atelimarket_user_token'));
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('atelimarket_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userAuthMode, setUserAuthMode] = useState('login');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    note: ''
  });
  const [generatedReference, setGeneratedReference] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [usedReferences, setUsedReferences] = useState(() => {
    const saved = localStorage.getItem('atelimarket_used_refs');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Admin Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdDiscount, setNewProdDiscount] = useState('0');
  const [newProdCategory, setNewProdCategory] = useState('Groceries');
  const [newProdIcon, setNewProdIcon] = useState('📦');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdImages, setNewProdImages] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdWeight, setNewProdWeight] = useState('');
  const [newProdColor, setNewProdColor] = useState('');
  const [newProdSize, setNewProdSize] = useState('');
  const [newProdMaterial, setNewProdMaterial] = useState('');
  const [newProdWarranty, setNewProdWarranty] = useState('');

  // Admin Auth Modal State
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState('login');

  const navigate = useNavigate();
  const location = useLocation();
  const categories = ['All', 'Groceries', 'Fruits & Veg', 'Electronics', 'Fashion', 'Mens', 'Womens', 'Books', 'Home & Kitchen', 'Sports', 'Medicine'];

  // Toast Notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const resetCheckout = () => {
    setCheckoutOpen(false);
    setPaymentMethod('cod');
    setGeneratedReference('');
    setReferenceInput('');
    setDeliveryForm({
      fullName: currentUser?.name || '',
      phone: '',
      email: currentUser?.email || '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      note: ''
    });
  };

  const generateReferenceId = () => {
    const ref = `AT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setGeneratedReference(ref);
    setReferenceInput('');
    return ref;
  };

  // =============================================
  // DELIVERY CHARGE CALCULATION
  // =============================================
  const calculateDeliveryCharge = (subtotal) => {
    if (subtotal <= 500) {
      return 70;
    }
    return 50;
  };

  // =============================================
  // ✅ PLACE ORDER - FIXED with better data
  // =============================================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    console.log('📦 Placing order...');
    console.log('Payment Method:', paymentMethod);
    console.log('Cart:', cart);
    console.log('Delivery:', deliveryForm);

    const token = localStorage.getItem('atelimarket_user_token');
    if (!token) {
      showToast('Please login to place order', 'error');
      navigate('/auth?mode=login');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const missing = requiredFields.find(field => !String(deliveryForm[field]).trim());
    
    if (missing) {
      showToast(`Please fill ${missing.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
      return;
    }

    if (paymentMethod === 'online') {
      if (!generatedReference) {
        showToast('Please generate a reference ID first.', 'error');
        return;
      }

      const normalizedRef = referenceInput.trim().toUpperCase();
      const normalizedGenerated = generatedReference.toUpperCase();

      if (!normalizedRef) {
        showToast('Please paste the reference ID shown above.', 'error');
        return;
      }

      if (usedReferences.includes(normalizedRef) || normalizedRef !== normalizedGenerated) {
        showToast('Invalid reference ID. Please use the new one shown above.', 'error');
        return;
      }

      const freshUsed = [...usedReferences, normalizedGenerated];
      setUsedReferences(freshUsed);
      localStorage.setItem('atelimarket_used_refs', JSON.stringify(freshUsed));
    }

    const deliveryCharge = calculateDeliveryCharge(totalCartPrice);
    const finalTotal = totalCartPrice + deliveryCharge;

    // ✅ FIX: Order data with complete product details
    const orderData = {
      items: cart.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image || item.imageUrl || '',
        originalPrice: item.originalPrice || 0,
        discountPercent: item.discountPercent || 0,
        category: item.category || ''
      })),
      total: finalTotal,
      paymentMethod: paymentMethod,
      referenceId: paymentMethod === 'online' ? generatedReference : null,
      delivery: {
        fullName: deliveryForm.fullName,
        phone: deliveryForm.phone,
        email: deliveryForm.email || currentUser?.email || '',
        address: deliveryForm.address,
        landmark: deliveryForm.landmark || '',
        city: deliveryForm.city,
        state: deliveryForm.state,
        pincode: deliveryForm.pincode,
        note: deliveryForm.note || ''
      }
    };

    console.log('📤 Sending order data:', orderData);

    try {
      setPlacingOrder(true);
      
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response:', response.data);

      if (response.data.success) {
        setCart([]);
        localStorage.removeItem('atelimarket_cart');
        setIsCartOpen(false);
        resetCheckout();
        fetchOrders();
        
        const successMsg = paymentMethod === 'online' 
          ? `✅ Order placed successfully with online payment!` 
          : `✅ Order placed successfully! Cash on delivery selected.`;
        showToast(successMsg, 'success');
        
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      } else {
        showToast(response.data.message || 'Failed to place order', 'error');
      }
    } catch (err) {
      console.error('❌ Order error:', err);
      console.error('Response:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products`);
      const productsData = res.data?.products || res.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('atelimarket_user_token');
    if (!token) return;

    setOrdersLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchOrders();
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    localStorage.setItem('atelimarket_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setDeliveryForm(prev => ({
      ...prev,
      fullName: currentUser?.name || prev.fullName || '',
      email: currentUser?.email || prev.email || ''
    }));
  }, [currentUser?.name, currentUser?.email]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'login' || mode === 'register') {
      setUserAuthMode(mode);
    }
  }, [location.search]);

  useEffect(() => {
    const handler = (event) => {
      addToCart(event.detail);
    };
    window.addEventListener('addToCart', handler);
    return () => window.removeEventListener('addToCart', handler);
  }, []);

  // Admin Auth Handlers
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_URL}/login`, { email: loginEmail, password: loginPassword });
      if (res.data.success) {
        const userRole = res.data.user?.role;
        if (userRole !== 'admin') {
          showToast('This account is not an admin account.', 'error');
          setLoading(false);
          return;
        }

        setIsAdminLoggedIn(true);
        localStorage.setItem('atelimarket_admin', 'true');
        localStorage.setItem('atelimarket_token', res.data.token);
        localStorage.setItem('atelimarket_user', JSON.stringify(res.data.user));
        localStorage.setItem('atelimarket_user_token', res.data.token);
        setCurrentUser(res.data.user);
        setIsUserLoggedIn(true);
        setShowAdminAuth(false);
        setLoginEmail('');
        setLoginPassword('');
        showToast('🚀 Welcome Admin!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_URL}/register`, {
        name: registerName,
        email: registerEmail,
        password: registerPassword
      });
      if (res.data.success) {
        showToast('✅ Admin registration successful! Please login.', 'success');
        setAdminAuthMode('login');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('atelimarket_admin');
    localStorage.removeItem('atelimarket_token');
    showToast('👋 Admin Logged out', 'info');
  };

  // User Auth Handlers
  const handleUserRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_URL}/register`, {
        name: userName,
        email: userEmail,
        password: userPassword
      });

      if (res.data.success) {
        const userData = res.data.user;
        setCurrentUser(userData);
        setIsUserLoggedIn(true);
        localStorage.setItem('atelimarket_user', JSON.stringify(userData));
        localStorage.setItem('atelimarket_user_token', res.data.token);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        setUserAuthMode('login');
        showToast('✅ Account created successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_URL}/login`, {
        email: userEmail,
        password: userPassword
      });

      if (res.data.success) {
        const userData = res.data.user;
        setCurrentUser(userData);
        setIsUserLoggedIn(true);
        localStorage.setItem('atelimarket_user', JSON.stringify(userData));
        localStorage.setItem('atelimarket_user_token', res.data.token);
        setUserEmail('');
        setUserPassword('');
        showToast('✅ Login successful!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogout = () => {
    setIsUserLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('atelimarket_user');
    localStorage.removeItem('atelimarket_user_token');
    showToast('👋 Logged out', 'info');
  };

  const handleOrderStatusChange = async (orderId, status) => {
    const token = localStorage.getItem('atelimarket_user_token');
    try {
      const res = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(prev => prev.map(order => order._id === orderId ? res.data.order : order));
        showToast(status === 'Cancelled' ? '✅ Order cancelled successfully' : '✅ Order status updated', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Product Management
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdOriginalPrice || !newProdImageUrl) {
      showToast('Name, Price and Image URL are required!', 'error');
      return;
    }

    const productData = {
      name: newProdName,
      originalPrice: parseFloat(newProdOriginalPrice),
      discountPercent: parseFloat(newProdDiscount) || 0,
      category: newProdCategory,
      icon: newProdIcon,
      stock: parseInt(newProdStock) || 10,
      description: newProdDescription,
      brand: newProdBrand,
      weight: newProdWeight || null,
      color: newProdColor || '',
      size: newProdSize || '',
      material: newProdMaterial || '',
      warranty: newProdWarranty || '',
      imageUrl: newProdImageUrl.trim(),
      images: newProdImages ? newProdImages.split(',').map(img => img.trim()) : [newProdImageUrl.trim()]
    };

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/products/add`, productData);
      if (res.data.success) {
        setProducts([res.data.product, ...products]);
        setNewProdName('');
        setNewProdOriginalPrice('');
        setNewProdDiscount('0');
        setNewProdStock('10');
        setNewProdDescription('');
        setNewProdImageUrl('');
        setNewProdImages('');
        setNewProdBrand('');
        setNewProdWeight('');
        setNewProdColor('');
        setNewProdSize('');
        setNewProdMaterial('');
        setNewProdWarranty('');
        showToast('✅ Product added successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/products/delete/${id}`);
        setProducts(products.filter(p => p._id !== id));
        setCart(cart.filter(item => item._id !== id));
        showToast('🗑️ Product deleted', 'success');
      } catch (err) {
        showToast('Failed to delete', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast('Out of stock!', 'error');
      return;
    }
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        if (exists.qty >= product.stock) {
          showToast('Not enough stock', 'error');
          return prev;
        }
        return prev.map(item => 
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      showToast('✅ Added to cart', 'success');
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, change) => {
    setCart(prev => 
      prev.map(item => {
        if (item._id === id) {
          const newQty = item.qty + change;
          if (newQty > item.stock) {
            showToast('Not enough stock', 'error');
            return item;
          }
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchSearch && matchCategory;
  }) : [];

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalSavings = cart.reduce((sum, item) => {
    return sum + ((item.originalPrice - item.price) * item.qty);
  }, 0);
  
  const deliveryCharge = calculateDeliveryCharge(totalCartPrice);
  const grandTotal = totalCartPrice + deliveryCharge;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-bold text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 
          toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="text-2xl font-black tracking-tight hover:opacity-80 transition">
              <span className="text-[#0B3C5D]">ATELI</span>
              <span className="text-[#FF5722]">MARKET</span>
            </Link>
            
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
                🛒
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search products..." 
              className="w-full px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-[#0B3C5D] focus:bg-white focus:shadow-md text-sm transition-all"
            />
          </div>

          <nav className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              {isUserLoggedIn ? (
                <>
                  <Link to="/orders" className="text-xs font-bold px-3 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition whitespace-nowrap">
                    📦 Orders
                  </Link>
                  <button 
                    onClick={handleUserLogout} 
                    className="text-xs font-bold px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition whitespace-nowrap"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=login" className="text-xs font-extrabold px-3 py-2 bg-[#0B3C5D]/10 text-[#0B3C5D] rounded-xl hover:bg-[#0B3C5D]/20 transition whitespace-nowrap">
                    🔐 Sign In
                  </Link>
                  <Link to="/auth?mode=register" className="text-xs font-extrabold px-3 py-2 bg-[#FF5722]/10 text-[#FF5722] rounded-xl hover:bg-[#FF5722]/20 transition whitespace-nowrap">
                    ✍️ Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              {isAdminLoggedIn ? (
                <>
                  <Link to="/admin" className="text-xs font-bold px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1">
                    🛠️ Admin
                  </Link>
                  <button 
                    onClick={handleAdminLogout} 
                    className="text-xs font-bold px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition whitespace-nowrap"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setShowAdminAuth(true);
                    setAdminAuthMode('login');
                  }} 
                  className="text-xs font-extrabold px-3 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition whitespace-nowrap flex items-center gap-1 border border-purple-200"
                >
                  <span>👑</span> Admin
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition cursor-pointer">
                <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {totalCartItems}
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <>
            <section className="bg-gradient-to-br from-[#0B3C5D] via-[#104d77] to-[#1a6496] text-white py-12 px-4 text-center">
              <div className="max-w-3xl mx-auto">
                <span className="bg-white/10 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-white/20">
                  🚀 AteliMarket
                </span>
                <h1 className="text-3xl md:text-5xl font-black mb-2 mt-3 tracking-tight">
                  Smart Shopping, Smarter Savings
                </h1>
                <p className="text-xs md:text-sm opacity-85">Quality products with real-time discounts. Order now!</p>
              </div>
            </section>

            <main className="container mx-auto px-4 py-6 space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition border whitespace-nowrap cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-[#0B3C5D] text-white border-transparent shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-slate-800">
                    {searchQuery ? `🔍 "${searchQuery}"` : activeCategory}
                  </h2>
                  <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                    {filteredProducts.length} items
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B3C5D]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="text-6xl mb-3">🛍️</div>
                        <p className="text-slate-400 text-sm font-medium">No products found</p>
                      </div>
                    ) : (
                      filteredProducts.map(product => {
                        const imageUrl = getProductDisplayImage(product);
                        return (
                          <Link 
                            key={product._id} 
                            to={`/product/${product._id}`}
                            className="group bg-white rounded-2xl border border-slate-100 flex flex-col justify-between p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                          >
                            <div>
                              <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-transform relative">
                                <img 
                                  src={imageUrl} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getProductDisplayImage(product);
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                                  <span className="bg-white/90 text-[#0B3C5D] text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                    👁️ View
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                {product.category}
                              </span>
                              <h3 className="font-bold text-xs text-slate-800 line-clamp-2 min-h-[32px] mt-0.5 leading-tight">
                                {product.name}
                              </h3>
                            </div>
                            
                            <div className="mt-3 flex flex-col pt-2 border-t border-slate-50">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="font-black text-sm text-[#0B3C5D]">₹{product.price}</span>
                                {product.discountPercent > 0 && (
                                  <>
                                    <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                                    <span className="text-[9px] font-extrabold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                      -{product.discountPercent}%
                                    </span>
                                  </>
                                )}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart(product);
                                }} 
                                disabled={product.stock <= 0}
                                className={`w-full mt-2 text-xs font-bold py-2 rounded-lg transition text-center ${
                                  product.stock > 0
                                    ? 'bg-[#FF5722]/10 hover:bg-[#FF5722] text-[#FF5722] hover:text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {product.stock > 0 ? 'Add +' : 'Out of Stock'}
                              </button>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            </main>
          </>
        } />

        {/* Product Detail Page */}
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* User Auth Page */}
        <Route path="/auth" element={
          <main className="container mx-auto max-w-2xl px-4 py-10">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">👤 User Account</h1>
                  <p className="text-sm text-slate-500 mt-1">Register or login to continue shopping</p>
                </div>
                {isUserLoggedIn && currentUser && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0B3C5D]">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                )}
              </div>

              {!isUserLoggedIn ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuthMode('login');
                        navigate('/auth?mode=login');
                      }}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${userAuthMode === 'login' ? 'bg-[#0B3C5D] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuthMode('register');
                        navigate('/auth?mode=register');
                      }}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${userAuthMode === 'register' ? 'bg-[#0B3C5D] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={userAuthMode === 'register' ? handleUserRegister : handleUserLogin} className="space-y-4">
                    {userAuthMode === 'register' && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0B3C5D] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#07263b] transition disabled:opacity-50"
                    >
                      {loading ? '⏳ Processing...' : userAuthMode === 'register' ? 'Create Account' : 'Login'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <h2 className="text-xl font-black text-slate-900">You are logged in</h2>
                  <p className="text-sm text-slate-500 mt-2">Welcome back, {currentUser?.name}</p>
                  <button
                    onClick={handleUserLogout}
                    className="mt-5 bg-red-50 text-red-600 font-bold px-5 py-2.5 rounded-xl hover:bg-red-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </main>
        } />

        {/* Orders Page */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* Order Tracking Page */}
        <Route path="/orders/track/:orderId" element={<OrderTracking />} />

        {/* Admin Panel */}
        <Route path="/admin" element={
          isAdminLoggedIn ? (
            <main className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    🛠️ Admin Panel
                    <span className="text-xs font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">Live</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">Manage your product catalog</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#0B3C5D]/10 text-[#0B3C5D] font-bold text-xs px-3 py-1.5 rounded-lg">
                    📊 {products.length} Items
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm sticky top-24">
                  <h3 className="font-extrabold text-base text-slate-800 mb-4">➕ Add Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Product Name *</label>
                      <input 
                        type="text" 
                        value={newProdName} 
                        onChange={(e) => setNewProdName(e.target.value)} 
                        placeholder="e.g., Organic Milk" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Original Price *</label>
                        <input 
                          type="number" 
                          value={newProdOriginalPrice} 
                          onChange={(e) => setNewProdOriginalPrice(e.target.value)} 
                          placeholder="₹" 
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Discount %</label>
                        <input 
                          type="number" 
                          value={newProdDiscount} 
                          onChange={(e) => setNewProdDiscount(e.target.value)} 
                          placeholder="0" 
                          min="0" 
                          max="100" 
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {newProdOriginalPrice && (
                      <div className="text-[11px] text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100 flex justify-between">
                        <span>🏷️ Selling Price:</span>
                        <span>₹{Math.round(parseFloat(newProdOriginalPrice) - (parseFloat(newProdOriginalPrice) * ((parseFloat(newProdDiscount) || 0) / 100)))}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                        <select 
                          value={newProdCategory} 
                          onChange={(e) => setNewProdCategory(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        >
                          <option value="Groceries">Groceries</option>
                          <option value="Fruits & Veg">Fruits & Veg</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Mens">Mens</option>
                          <option value="Womens">Womens</option>
                          <option value="Books">Books</option>
                          <option value="Home & Kitchen">Home & Kitchen</option>
                          <option value="Sports">Sports</option>
                          <option value="Medicine">Medicine</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Stock</label>
                        <input 
                          type="number" 
                          value={newProdStock} 
                          onChange={(e) => setNewProdStock(e.target.value)} 
                          min="0"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Image URL *</label>
                      <input 
                        type="url" 
                        value={newProdImageUrl} 
                        onChange={(e) => setNewProdImageUrl(e.target.value)} 
                        placeholder="https://example.com/product-image.jpg" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        💡 Paste image URL from ImgBB, Cloudinary, or any hosting service
                      </p>
                      {newProdImageUrl && (
                        <div className="mt-2">
                          <img 
                            src={newProdImageUrl} 
                            alt="Preview" 
                            className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/64/FF5722/FFFFFF?text=Invalid+URL';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Additional Images</label>
                      <input 
                        type="text" 
                        value={newProdImages} 
                        onChange={(e) => setNewProdImages(e.target.value)} 
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Separate multiple URLs with comma
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Brand</label>
                      <input 
                        type="text" 
                        value={newProdBrand} 
                        onChange={(e) => setNewProdBrand(e.target.value)} 
                        placeholder="Brand name" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Weight</label>
                        <input 
                          type="text" 
                          value={newProdWeight} 
                          onChange={(e) => setNewProdWeight(e.target.value)} 
                          placeholder="1kg" 
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Color</label>
                        <input 
                          type="text" 
                          value={newProdColor} 
                          onChange={(e) => setNewProdColor(e.target.value)} 
                          placeholder="Black" 
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Size</label>
                        <input 
                          type="text" 
                          value={newProdSize} 
                          onChange={(e) => setNewProdSize(e.target.value)} 
                          placeholder="Large" 
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Material</label>
                        <input 
                          type="text" 
                          value={newProdMaterial} 
                          onChange={(e) => setNewProdMaterial(e.target.value)} 
                          placeholder="Cotton" 
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Warranty</label>
                      <input 
                        type="text" 
                        value={newProdWarranty} 
                        onChange={(e) => setNewProdWarranty(e.target.value)} 
                        placeholder="1 Year" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                      <textarea
                        value={newProdDescription}
                        onChange={(e) => setNewProdDescription(e.target.value)}
                        placeholder="Detailed product description..."
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Icon</label>
                      <select 
                        value={newProdIcon} 
                        onChange={(e) => setNewProdIcon(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0B3C5D]"
                      >
                        <option value="📦">📦 Box</option>
                        <option value="🥛">🥛 Dairy</option>
                        <option value="🍞">🍞 Bakery</option>
                        <option value="🥦">🥦 Vegetable</option>
                        <option value="🍎">🍎 Fruit</option>
                        <option value="⚡">⚡ Tech</option>
                        <option value="👕">👕 Fashion</option>
                        <option value="📱">📱 Electronics</option>
                        <option value="👔">👔 Mens</option>
                        <option value="👗">👗 Womens</option>
                        <option value="📚">📚 Books</option>
                        <option value="🏠">🏠 Home & Kitchen</option>
                        <option value="🏅">🏅 Sports</option>
                        <option value="💊">💊 Medicine</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#0B3C5D] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-[#07263b] transition disabled:opacity-50"
                    >
                      {loading ? '⏳ Processing...' : '🚀 Add Product'}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-800">📦 Orders</h3>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{orders.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4">Total</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Track</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                          {ordersLoading ? (
                            <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading orders...</td></tr>
                          ) : orders.length === 0 ? (
                            <tr><td colSpan="6" className="py-8 text-center text-slate-400">No orders yet</td></tr>
                          ) : (
                            orders.map(order => (
                              <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-800">{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-bold text-slate-800">{order.userName || 'Guest'}</div>
                                    <div className="text-[10px] text-slate-400">{order.userEmail || order.delivery?.email}</div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-slate-700">{order.paymentMethod === 'online' ? 'Online' : 'COD'}</div>
                                  {order.referenceId && <div className="text-[10px] text-slate-400">Ref: {order.referenceId}</div>}
                                </td>
                                <td className="py-3 px-4 font-bold text-[#0B3C5D]">₹{order.total}</td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                                      {order.status}
                                    </span>
                                    {isAdminLoggedIn ? (
                                      <select value={order.status} onChange={(e) => handleOrderStatusChange(order._id, e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold">
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                    ) : order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                      <button type="button" onClick={() => handleOrderStatusChange(order._id, 'Cancelled')} className="text-[10px] font-bold text-red-600 hover:text-red-700 text-left">
                                        Cancel Order
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Link 
                                    to={`/orders/track/${order._id}`}
                                    className="text-[10px] font-bold text-[#0B3C5D] hover:underline whitespace-nowrap"
                                  >
                                    🔍 Track
                                  </Link>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4 hidden md:table-cell">Stock</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-slate-400">
                                <div className="text-4xl mb-2">📭</div>
                                No products
                              </td>
                            </tr>
                          ) : (
                            products.map(product => (
                              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={getProductDisplayImage(product)}
                                      alt={product.name}
                                      className="h-8 w-8 object-cover rounded-lg"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = getProductDisplayImage(product);
                                      }}
                                    />
                                    <span className="font-bold text-slate-800 line-clamp-1 max-w-[120px]">{product.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 hidden sm:table-cell">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-500">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="font-black text-[#0B3C5D]">₹{product.price}</span>
                                    {product.discountPercent > 0 && (
                                      <span className="text-[9px] text-slate-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 hidden md:table-cell">
                                  <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? product.stock : 'Out'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button 
                                    onClick={() => handleDeleteProduct(product._id)} 
                                    className="text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-bold transition"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          ) : (
            <div className="text-center py-32">
              <div className="text-6xl mb-4">🔒</div>
              <p className="font-bold text-red-500 text-sm">Access Denied!</p>
              <button 
                onClick={() => {
                  setShowAdminAuth(true);
                  setAdminAuthMode('login');
                }} 
                className="mt-4 bg-[#0B3C5D] text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-[#07263b] transition"
              >
                👑 Admin Login
              </button>
            </div>
          )
        } />
      </Routes>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
          setShowAdminAuth(false);
          setAdminAuthMode('login');
        }}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => {
                setShowAdminAuth(false);
                setAdminAuthMode('login');
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold text-lg"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">👑</span>
              <h3 className="text-lg font-black text-[#0B3C5D]">
                {adminAuthMode === 'login' ? 'Admin Login' : 'Admin Register'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              {adminAuthMode === 'login' 
                ? 'Enter credentials to access admin panel' 
                : 'Create your admin account to manage the store'}
            </p>

            <form onSubmit={adminAuthMode === 'login' ? handleAdminLogin : handleAdminRegister} className="space-y-3.5">
              {adminAuthMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={registerName} 
                    onChange={(e) => setRegisterName(e.target.value)} 
                    placeholder="John Doe" 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="admin@atelimarket.com" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#0B3C5D] focus:bg-white transition"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0B3C5D] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-[#07263b] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '⏳ Processing...' : adminAuthMode === 'login' ? '🔑 Login' : '📝 Register'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={() => setAdminAuthMode(adminAuthMode === 'login' ? 'register' : 'login')} 
                className="text-[10px] text-[#0B3C5D] font-bold hover:underline"
              >
                {adminAuthMode === 'login' 
                  ? "Don't have an admin account? Register" 
                  : '← Back to Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-black text-[#0B3C5D]">🛒 Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black font-bold text-lg">
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <p className="text-slate-400 text-sm font-medium">Cart is empty</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl hover:shadow-sm transition">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={getProductDisplayImage(item)} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                          <p className="text-[11px] text-slate-400">₹{item.price} × {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                        <button onClick={() => updateQty(item._id, -1)} className="px-2 py-0.5 font-bold text-slate-400 hover:text-[#FF5722] text-xs transition">−</button>
                        <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1)} className="px-2 py-0.5 font-bold text-slate-400 hover:text-[#0B3C5D] text-xs transition">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-3 flex-shrink-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold">₹{totalCartPrice}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Delivery Charge</span>
                  <span className="font-bold text-[#FF5722]">₹{deliveryCharge}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600">
                    <span>💰 You saved</span>
                    <span className="font-bold">₹{totalSavings}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center font-bold text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-600">Grand Total:</span>
                  <span className="text-[#0B3C5D] text-lg font-black">₹{grandTotal}</span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">
                    {totalCartPrice <= 500 
                      ? '🚚 Delivery charge ₹70 (Order below ₹500)' 
                      : '🚚 Delivery charge ₹50 (Order above ₹500)'}
                  </p>
                </div>

                {checkoutOpen ? (
                  <form onSubmit={handlePlaceOrder} className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                    {/* Delivery Details */}
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Delivery Details</p>
                      <div className="grid gap-2">
                        <input 
                          required 
                          value={deliveryForm.fullName} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, fullName: e.target.value }))} 
                          placeholder="Full Name *" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <input 
                          required 
                          value={deliveryForm.phone} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, phone: e.target.value }))} 
                          placeholder="Phone Number *" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <input 
                          type="email" 
                          value={deliveryForm.email} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, email: e.target.value }))} 
                          placeholder="Email" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <textarea 
                          required 
                          value={deliveryForm.address} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, address: e.target.value }))} 
                          placeholder="Complete Address *" 
                          rows="2" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <input 
                          value={deliveryForm.landmark} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, landmark: e.target.value }))} 
                          placeholder="Landmark (optional)" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            required 
                            value={deliveryForm.city} 
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, city: e.target.value }))} 
                            placeholder="City *" 
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                          />
                          <input 
                            required 
                            value={deliveryForm.state} 
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, state: e.target.value }))} 
                            placeholder="State *" 
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                          />
                        </div>
                        <input 
                          required 
                          value={deliveryForm.pincode} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, pincode: e.target.value }))} 
                          placeholder="Pincode *" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#0B3C5D]"
                        />
                        <textarea 
                          value={deliveryForm.note} 
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, note: e.target.value }))} 
                          placeholder="Delivery note (optional)" 
                          rows="2" 
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:border-[#0B3C5D]"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Payment Method</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button" 
                          onClick={() => { 
                            setPaymentMethod('cod'); 
                            setGeneratedReference(''); 
                            setReferenceInput(''); 
                          }} 
                          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                            paymentMethod === 'cod' 
                              ? 'bg-[#0B3C5D] text-white shadow-md' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          💵 Cash on Delivery
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={() => { 
                            setPaymentMethod('online'); 
                            if (!generatedReference) generateReferenceId(); 
                          }} 
                          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                            paymentMethod === 'online' 
                              ? 'bg-[#0B3C5D] text-white shadow-md' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          📱 Online Payment
                        </button>
                      </div>

                      {paymentMethod === 'online' && (
                        <div className="mt-3 space-y-2">
                          <div className="rounded-xl border border-dashed border-[#0B3C5D] bg-white p-3 text-center">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Scan QR</p>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=8901346287@fam&pn=AteliMarket&tn=AteliMarket%20Order%20Amount%20${grandTotal}&am=${grandTotal}&cu=INR`} 
                              alt="UPI QR" 
                              className="mx-auto my-2 w-36 h-36"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=upi://pay?pa=8901346287@fam&pn=AteliMarket&tn=AteliMarket%20Order%20Amount%20${grandTotal}&am=${grandTotal}&cu=INR`;
                              }}
                            />
                            <p className="text-xs font-bold text-[#0B3C5D]">UPI: 8901346287@fam</p>
                            <p className="text-sm font-bold text-green-600 mt-1">
                              Amount: ₹{grandTotal}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              💡 Includes delivery charge: ₹{deliveryCharge}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <a 
                              href={`upi://pay?pa=8901346287@fam&pn=AteliMarket&tn=AteliMarket%20Order%20Amount%20${grandTotal}&am=${grandTotal}&cu=INR`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-green-700 transition text-center flex items-center justify-center gap-2"
                            >
                              <span>📱</span> Pay ₹{grandTotal} via UPI
                            </a>
                            <p className="text-[10px] text-slate-400 text-center">
                              Opens your UPI app with amount ₹{grandTotal} pre-filled
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-white p-2">
                            <p className="text-[10px] font-bold uppercase text-slate-400">One-time Reference ID</p>
                            <div className="flex items-center gap-2 mt-1">
                              <input 
                                value={generatedReference || 'Generate reference ID'} 
                                readOnly 
                                className="flex-1 bg-slate-50 border border-slate-200 px-2 py-2 rounded-lg text-xs font-mono"
                              />
                              <button 
                                type="button" 
                                onClick={() => { 
                                  const ref = generateReferenceId(); 
                                  navigator.clipboard?.writeText(ref); 
                                  showToast('Reference ID copied!', 'success'); 
                                }} 
                                className="text-xs font-bold text-[#0B3C5D] hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Amount: ₹{grandTotal} for this order</p>
                            <input 
                              value={referenceInput} 
                              onChange={(e) => setReferenceInput(e.target.value)} 
                              placeholder="Paste reference ID here *" 
                              className="w-full mt-2 bg-slate-50 border border-slate-200 px-2 py-2 rounded-lg text-xs focus:outline-none focus:border-[#0B3C5D]"
                              required={paymentMethod === 'online'}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col gap-2">
                      <button 
                        type="submit" 
                        disabled={placingOrder}
                        className={`w-full font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 ${
                          paymentMethod === 'online' 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-[#FF5722] text-white hover:bg-[#e64a19]'
                        } ${placingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {placingOrder ? (
                          <>
                            <span className="animate-spin">⏳</span> Processing...
                          </>
                        ) : (
                          <>
                            {paymentMethod === 'online' ? `✅ Pay ₹${grandTotal} & Confirm` : `📦 Place Order (₹${grandTotal})`}
                          </>
                        )}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={resetCheckout} 
                        className="w-full bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setCheckoutOpen(true)} 
                    className="w-full bg-[#FF5722] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#e64a19] transition shadow-md"
                  >
                    ✅ Proceed to Checkout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
