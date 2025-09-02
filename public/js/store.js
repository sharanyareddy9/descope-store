let products = [];
let cart = JSON.parse(localStorage.getItem('descopeCart') || '[]');
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupFilters();
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data.products || [];
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsContainer').innerHTML = 
            '<div class="loading">Error loading products. Please try again later.</div>';
    }
}

// Render products
function renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">No products available</div>';
        return;
    }

    const filteredProducts = currentFilter === 'all' 
        ? products 
        : products.filter(p => p.type === currentFilter);

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="loading">No products found for this category</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'products-grid';

    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercent = hasDiscount 
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : 0;

    const description = product.body.replace(/<[^>]*>/g, '').substring(0, 100) + '...';

    const variants = product.variants.map(variant => 
        `<div class="variant-option" data-variant-id="${variant.id}" data-price="${variant.price}">
            ${variant.option1_value}
        </div>`
    ).join('');

    const tags = product.tags.slice(0, 3).map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    card.innerHTML = `
        <div class="product-image">
            ${product.image_url ? `<img src="${product.image_url}" alt="${product.title}">` : '📦'}
            ${hasDiscount ? `<div class="product-badge">${discountPercent}% OFF</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${description}</p>
            <div class="product-tags">${tags}</div>
            <div class="product-price">
                <div>
                    <span class="price" data-base-price="${product.price}">$${product.price.toFixed(2)}</span>
                    ${hasDiscount ? `<span class="original-price">$${product.compare_at_price.toFixed(2)}</span>` : ''}
                </div>
            </div>
            ${product.variants.length > 1 ? `
                <div class="product-variants">
                    <div class="variant-label">${product.variants[0].option1_name}:</div>
                    <div class="variant-options">${variants}</div>
                </div>
            ` : ''}
            <button class="add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `;

    // Setup variant selection
    const variantOptions = card.querySelectorAll('.variant-option');
    if (variantOptions.length > 0) {
        variantOptions[0].classList.add('selected');
        
        variantOptions.forEach(option => {
            option.addEventListener('click', function() {
                variantOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                const price = parseFloat(this.dataset.price);
                const priceElement = card.querySelector('.price');
                priceElement.textContent = `$${price.toFixed(2)}`;
            });
        });
    }

    // Setup add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(parseInt(this.dataset.productId), this);
    });

    return card;
}

// Setup filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProducts();
        });
    });
}

// Add to cart
function addToCart(productId, buttonElement) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const productCard = buttonElement.closest('.product-card');
    const selectedVariant = productCard.querySelector('.variant-option.selected');
    
    const cartItem = {
        id: Date.now(),
        productId: product.id,
        title: product.title,
        price: selectedVariant ? parseFloat(selectedVariant.dataset.price) : product.price,
        variantId: selectedVariant ? parseInt(selectedVariant.dataset.variantId) : null,
        variantName: selectedVariant ? selectedVariant.textContent : null,
        quantity: 1,
        image: product.image_url
    };

    // Check if item already exists
    const existingItem = cart.find(item => 
        item.productId === cartItem.productId && 
        item.variantId === cartItem.variantId
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    
    // Visual feedback
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Added!';
    buttonElement.style.background = '#38a169';
    setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.background = '';
    }, 1000);
}

// Cart functions
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    countElement.textContent = count;
    countElement.style.display = count > 0 ? 'flex' : 'none';
}

function saveCart() {
    localStorage.setItem('descopeCart', JSON.stringify(cart));
}

function openCart() {
    renderCart();
    document.getElementById('cartModal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        totalElement.textContent = 'Total: $0.00';
        return;
    }

    let total = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                ${item.variantName ? `<div class="cart-item-variant">${item.variantName}</div>` : ''}
                <div>$${item.price.toFixed(2)} each</div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" data-item-id="${item.id}" data-change="-1">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-item-id="${item.id}" data-change="1">+</button>
            </div>
            <div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
                <button data-item-id="${item.id}" style="color: #e53e3e; background: none; border: none; cursor: pointer; margin-top: 0.5rem;" class="remove-item">Remove</button>
            </div>
        `;
        container.appendChild(cartItem);
    });

    totalElement.textContent = `Total: $${total.toFixed(2)}`;

    // Setup quantity controls
    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.dataset.itemId);
            const change = parseInt(this.dataset.change);
            updateQuantity(itemId, change);
        });
    });

    // Setup remove buttons
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.dataset.itemId);
            removeFromCart(itemId);
        });
    });
}

function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartCount();
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Create order
    const email = prompt('Please enter your email address:');
    if (!email) {
        alert('Email is required to place an order.');
        return;
    }

    const orderData = {
        customer_email: email,
        items: cart.map(item => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity
        }))
    };

    // Submit order
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(order => {
        alert(`Order placed successfully! Order ID: ${order.id}`);
        cart = [];
        saveCart();
        updateCartCount();
        closeCart();
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    });
}

// Global functions for HTML onclick handlers
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target === modal) {
        closeCart();
    }
}