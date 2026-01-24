import { Link } from 'react-router-dom';
import { formatPrice } from '../data';

export default function PremiumFieldCard({ field }) {
    const typeLabels = {
        football: 'ฟุตบอล',
        badminton: 'แบดมินตัน',
        basketball: 'บาสเกตบอล',
        tennis: 'เทนนิส'
    };

    return (
        <Link to={`/field/${field.id}`} className="group relative block h-[450px] w-full overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/10 transition-all duration-500 hover:border-[#FF6B35]/50 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)]">
            {/* Image Background with Gradient Overlay */}
            <div className="absolute inset-0 h-full w-full">
                <img
                    src={field.image}
                    alt={field.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent opacity-90" />
            </div>

            {/* Status Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 border border-white/10">
                <div className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]"></div>
                <span className="text-xs font-medium text-white/80">ว่าง</span>
            </div>

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
                <span className="inline-block rounded-md bg-[#FF6B35] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]">
                    {typeLabels[field.type]}
                </span>
            </div>

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-6 translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                {/* Title & Price */}
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                    <h3 className="font-bebas text-4xl text-white tracking-wide leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {field.name}
                    </h3>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-[#FF6B35]" style={{ fontFamily: 'var(--font-numbers)' }}>
                            ฿{formatPrice(field.price)}
                        </span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">/ชั่วโมง</span>
                    </div>
                </div>

                {/* Hidden details revealed on hover */}
                <div className="opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-500 delay-100">
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 font-light">
                        {field.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {field.facilities.slice(0, 3).map((facility, idx) => (
                                <span key={idx} className="text-[10px] uppercase tracking-wider text-zinc-500 border border-white/10 px-2 py-1 rounded">
                                    {facility}
                                </span>
                            ))}
                        </div>
                        <span className="text-[#FF6B35] text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                            Book Now →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
