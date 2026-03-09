/**
 * ============================================
 * Fashion Store Types
 * ============================================
 */


/**
 * Product Image
 * @typedef {Object} ProductImage
 * @property {number} id
 * @property {number} product_id
 * @property {string} image
 * @property {string} image_url
 * @property {number} sort_order
 */


/**
 * Variant Value (Size / Color)
 * @typedef {Object} VariantValue
 * @property {number} id
 * @property {string} value
 * @property {number} quantity
 * @property {number} price
 */


/**
 * Product Variant
 * @typedef {Object} ProductVariant
 * @property {number} id
 * @property {string} name
 * @property {number} product_id
 * @property {VariantValue[]} values
 */


/**
 * Product Attribute
 * @typedef {Object} ProductAttribute
 * @property {number} id
 * @property {string} name
 * @property {string} value
 */


/**
 * Product
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} sku
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} short_description
 * @property {number} price
 * @property {number} compare_price
 * @property {number} quantity
 * @property {string} gender
 * @property {string} fabric
 * @property {string} season
 * @property {string[]} colors
 * @property {string[]} sizes
 * @property {string} main_image
 * @property {string} main_image_url
 * @property {boolean} is_new
 * @property {boolean} on_sale
 * @property {boolean} is_featured
 * @property {number} rating
 * @property {number} reviews_count
 * @property {number} sold_count
 * @property {number} category_id
 * @property {number} brand_id
 * @property {ProductImage[]} images
 * @property {ProductVariant[]} variants
 * @property {ProductAttribute[]} attributes
 */


/**
 * Category
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} image
 * @property {number} products_count
 * @property {Category[]} children
 */


/**
 * Brand
 * @typedef {Object} Brand
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} logo
 */


/**
 * Wishlist Item
 * @typedef {Object} WishlistItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} main_image
 * @property {string} color
 * @property {string} size
 * @property {string} added_at
 */


/**
 * Cart Item
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {string} size
 * @property {string} color
 * @property {string} main_image
 */


/**
 * Cart
 * @typedef {Object} Cart
 * @property {CartItem[]} items
 * @property {number} total
 * @property {number} subtotal
 * @property {number} shipping
 * @property {number} tax
 */


/**
 * User
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 */


/**
 * Address
 * @typedef {Object} Address
 * @property {number} id
 * @property {string} city
 * @property {string} address
 * @property {string} postal_code
 */


/**
 * Order
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} order_number
 * @property {number} total
 * @property {string} status
 * @property {string} payment_method
 * @property {string} created_at
 * @property {CartItem[]} items
 */


/**
 * Review
 * @typedef {Object} Review
 * @property {number} id
 * @property {number} product_id
 * @property {string} user_name
 * @property {number} rating
 * @property {string} comment
 * @property {string} created_at
 */