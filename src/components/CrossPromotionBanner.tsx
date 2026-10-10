import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

interface CrossPromotionBannerProps {
  variant?: 'default' | 'prominent' | 'subtle';
  title: string;
  description: string;
  benefits?: string[];
  ctaText: string;
  ctaLink: string;
  icon?: React.ReactNode;
  imageSrc?: string;
}

export default function CrossPromotionBanner({
  variant = 'default',
  title,
  description,
  benefits,
  ctaText,
  ctaLink,
  icon,
  imageSrc
}: CrossPromotionBannerProps) {

  const variantStyles = {
    default: 'bg-blue-50 border-2 border-blue-200',
    prominent: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white',
    subtle: 'bg-gray-50 border border-gray-200'
  };

  const textColor = variant === 'prominent' ? 'text-white' : 'text-gray-700';
  const headingColor = variant === 'prominent' ? 'text-white' : 'text-blue-900';
  const buttonStyles = variant === 'prominent'
    ? 'bg-white text-blue-900 hover:bg-blue-50'
    : 'bg-blue-900 text-white hover:bg-blue-800';

  return (
    <div className={`rounded-xl p-8 ${variantStyles[variant]}`}>
      <div className={`${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : ''}`}>
        <div>
          {icon && (
            <div className="mb-4">
              {icon}
            </div>
          )}

          <h3 className={`text-2xl font-bold ${headingColor} mb-3`}>
            {title}
          </h3>

          <p className={`text-lg ${textColor} mb-6 leading-relaxed`}>
            {description}
          </p>

          {benefits && benefits.length > 0 && (
            <ul className="space-y-3 mb-6">
              {benefits.map((benefit, index) => (
                <li key={index} className={`flex items-start space-x-3 ${textColor}`}>
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variant === 'prominent' ? 'text-green-300' : 'text-green-600'}`} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={ctaLink}
            className={`inline-flex items-center justify-center px-6 py-3 ${buttonStyles} rounded-lg font-semibold transition-all hover:scale-105 shadow-lg`}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        {imageSrc && (
          <div className="hidden lg:block">
            <img
              src={imageSrc}
              alt={title}
              className="rounded-lg shadow-xl w-full h-auto"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
