import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Products.css';
import ProductCard from '../components/ProductCard';
import productAPI from '../api/ProductAPI';

// Import images directly
import appleImage from '../images/apple_home.png';
import bananaImage from '../images/b_order_pg.jpg';
import orangeJuiceImage from '../images/pdt_pg.jpg';
import driedBerriesImage from '../images/berries_pdt_pg.jpg';
import detoxPackageImage from '../images/jui_order_pg.jpg';
import placeholderImage from '../images/order_pg.jpg';
import greenJuice from '../images/smoothie.png';
import mango from '../images/health_tips_top_bg.jpg';

// Static product data with imported images (fallback)
const staticProducts = [
  {
    id: 1,
    name: "Fresh Apples",
    description: "Crisp and delicious red apples",
    price: 4000,
    category: "Fresh Fruits",
    image: appleImage,
    stock_quantity: 50
  },
  {
    id: 2,
    name: "Organic Bananas",
    description: "Sweet and ripe organic bananas",
    price: 3500,
    category: "Fresh Fruits",
    image: bananaImage,
    stock_quantity: 75
  },
  {
    id: 3,
    name: "Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 2000,
    category: "Natural Juices",
    image: orangeJuiceImage,
    stock_quantity: 30
  },
  {
    id: 4,
    name: "Mixed Berries",
    description: "Dried mix of strawberries and blueberries",
    price: 6000,
    category: "Dried Fruits",
    image: driedBerriesImage,
    stock_quantity: 40
  },
  {
    id: 5,
    name: "Detox Package",
    description: "3-day juice cleanse package",
    price: 7000,
    category: "Detox Juice Packages",
    image: detoxPackageImage,
    stock_quantity: 15
  },
  {
    id: 6,
    name: "Fresh Strawberries",
    description: "Sweet and juicy strawberries",
    price: 4000,
    category: "Fresh Fruits",
    image: placeholderImage,
    stock_quantity: 60
  },
  {
    id: 7,
    name: "Green Juice",
    description: "Healthy blend of spinach, kale, and apple",
    price: 4000,
    category: "Natural Juices",
    image: greenJuice,
    stock_quantity: 25
  },
  {
    id: 8,
    name: "Dried Mango",
    description: "Sweet and chewy dried mango slices",
    price: 7.99,
    category: "Dried Fruits",
    image: mango,
    stock_quantity: 35
  },
  {
    id: 9,
    name: "Fresh Pineapple",
    description: "Tropical sweet pineapple",
    price: 4000,
    category: "Fresh Fruits",
    image: placeholderImage,
    stock_quantity: 45
  }
];

// Category mapping to match API categories with frontend categories
const categoryMapping = {
  'Fruit': 'Fresh Fruits',
  'Juice': 'Natural Juices',
  // Add more mappings as needed
};

const Products = () => {
  const { cart = [] } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Available categories
  const categories = [
    "Fresh Fruits",
    "Natural Juices", 
    "Dried Fruits",
    "Detox Juice Packages"
  ];
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch products...');
        console.log('API URL:', process.env.REACT_APP_API_URL);
        const productsData = await productAPI.getPublicProducts();
        console.log('Products fetched:', productsData);
        
        // Transform the data to match the expected format
        const transformedProducts = productsData.map(product => {
          // Map the category from API to frontend category
          const mappedCategory = categoryMapping[product.category] || product.category;
          
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: mappedCategory,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            is_active: product.is_active,
            is_featured: product.is_featured
          };
        });
        
        console.log('Transformed products:', transformedProducts);
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error in fetchProducts:', err);
        setError(`Failed to load products: ${err.message}. Using fallback data.`);
        // Fallback to static data if API fails
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Debug: Log the products state
  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });
  
  // Debug: Log filtered products
  useEffect(() => {
    console.log('Filtered products:', filteredProducts);
  }, [filteredProducts]);
  
  // Get products for the selected category (or all if none selected)
  const getProductsForCategory = (category) => {
    return filteredProducts.filter(product => product.category === category);
  };
  
  if (loading) {
    return (
      <div className="products-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="products-container">
        <div className="error-container">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Debug: Check if we have products
  console.log('Rendering products. Number of products:', products.length);
  console.log('Rendering filtered products. Number of filtered products:', filteredProducts.length);
  
  // Debug: Log products by category
  categories.forEach(category => {
    const categoryProducts = getProductsForCategory(category);
    console.log(`Category "${category}" has ${categoryProducts.length} products:`, categoryProducts);
  });
  
  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Fresh Products</h1>
        <p>Browse our selection of fresh fruits, juices, and health packages</p>
      </div>
      
      <div className="search-filter-container">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter-container">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setShowMore(false);
            }}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Debug: Show product count */}
      <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>Total products: {products.length}</p>
        <p>Filtered products: {filteredProducts.length}</p>
        {categories.map(category => (
          <p key={category}>{category}: {getProductsForCategory(category).length} products</p>
        ))}
      </div>
      
      {/* Conditionally render categories based on filter */}
      {categoryFilter === "" ? (
        // Show all categories when no filter is selected
        <>
          {renderCategorySection("Fresh Fruits")}
          {renderCategorySection("Natural Juices")}
          {renderCategorySection("Dried Fruits")}
          {renderCategorySection("Detox Juice Packages")}
        </>
      ) : (
        // Show only the selected category
        renderCategorySection(categoryFilter)
      )}
      
      {cart && cart.length > 0 && (
        <div className="cart-summary">
          <h2>Cart Summary</h2>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.title} x {item.quantity}</span>
                <span>UGX {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="total">
            <h3>Total: <span>UGX {cart.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()}</span></h3>
          </div>
          <Link to="/checkout" className="btn-primary-n">Proceed to Checkout</Link>
        </div>
      )}
    </div>
  );
  
  // Helper function to render a category section
  function renderCategorySection(categoryName) {
    const categoryProducts = getProductsForCategory(categoryName);
    const visibleProducts = showMore ? categoryProducts : categoryProducts.slice(0, 3);
    
    // Debug: Log category rendering
    console.log(`Rendering category: ${categoryName}, products:`, categoryProducts);
    
    // Always render the category section, even if empty, for debugging
    return (
      <div className="category-section">
        <div className="category-header">
          <h2>{categoryName}</h2>
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
            ({categoryProducts.length} products)
          </span>
          {categoryProducts.length > 3 && (
            <button 
              className="more-btn"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        
        {categoryProducts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No products found in this category.
          </p>
        ) : (
          <div className="products-grid">
            {visibleProducts.map(product => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.name}
                description={product.description}
                price={product.price}
                category={product.category}
                image={product.image_url || product.image || placeholderImage}
                stock_quantity={product.stock_quantity}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default Products;