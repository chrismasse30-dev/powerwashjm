import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CrossPromotionInlineProps {
  text: string;
  linkText: string;
  linkUrl: string;
  icon?: React.ReactNode;
}

export default function CrossPromotionInline({
  text,
  linkText,
  linkUrl,
  icon
}: CrossPromotionInlineProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-blue-100">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{text}</span>
      <Link
        to={linkUrl}
        className="inline-flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors underline"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
