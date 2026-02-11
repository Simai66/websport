import { Link } from 'react-router-dom';
import { formatPrice, typeLabels } from '../data';

export default function FieldCard({ field }) {
    return (
        <Link to={`/field/${field.id}`} className="card premium-card hover-lift">
            <div className="card-image">
                <img src={field.image} alt={field.name} width="400" height="225" />
                <span className="card-badge">{typeLabels[field.type]}</span>
            </div>
            <div className="card-body">
                <h3 className="card-title">{field.name}</h3>
                <p className="card-description">{field.description}</p>
                <div className="card-meta">
                    <div className="card-price">
                        ฿{formatPrice(field.price)} <span>/ชั่วโมง</span>
                    </div>
                    <button className="btn btn-sm btn-primary btn-glow">จองเลย</button>
                </div>
            </div>
        </Link>
    );
}
