import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        // Find product by ID
        const found = products.find(p => p.id === parseInt(id));
        if (found) {
            setProduct(found);
            // Find related products (same category, excluding current)
            const others = products.filter(p => p.category === found.category && p.id !== found.id);
            setRelated(others.slice(0, 3));
            window.scrollTo(0, 0);
        } else {
            navigate('/shop');
        }
    }, [id, navigate]);

    if (!product) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                {/* Image Section */}
                <div>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                </div>

                {/* Info Section */}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#3E2723' }}>{product.name}</h1>
                    <div style={{ fontSize: '1.5rem', color: '#5D4037', fontWeight: 'bold', marginBottom: '2rem' }}>
                        ₹{product.price}
                    </div>

                    <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
                        {product.description}
                    </p>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #eee' }}>
                        <h3 style={{ marginTop: 0 }}>Health Benefits</h3>
                        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Rich in Omega-3 Fatty Acids</li>
                            <li>Supports Brain Health</li>
                            <li>High in Antioxidants</li>
                            <li>100% Organic & Preservative Free</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => {
                                addToCart(product);
                                showToast('Added to cart!');
                            }}
                            style={{
                                flex: 1, padding: '15px', background: 'white', color: '#5D4037',
                                border: '2px solid #5D4037', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'
                            }}
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { addToCart(product); navigate('/cart'); }}
                            style={{
                                flex: 2, padding: '15px', background: '#5D4037', color: 'white',
                                border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'
                            }}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <div style={{ marginTop: '4rem', borderTop: '1px solid #ddd', paddingTop: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>You May Also Like</h2>
                    <div className="product-grid">
                        {related.map(p => (
                            <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                <img src={p.image} alt={p.name} className="product-image" />
                                <div className="product-info">
                                    <h3 className="product-title">{p.name}</h3>
                                    <span className="product-price">₹{p.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
