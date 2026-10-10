import { Shield, Award, CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';

interface TrustBadgesProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

function TrustBadges({ className = '', variant = 'horizontal' }: TrustBadgesProps) {
  const badges = [
    {
      icon: Shield,
      title: 'Licensed & Insured',
      description: 'Full coverage protection',
      ariaLabel: 'Licensed and Insured business with full coverage protection',
      link: null
    },
    {
      icon: Award,
      title: '100% Satisfaction',
      description: 'Guarantee',
      ariaLabel: '100% satisfaction guarantee on all services',
      link: '/satisfaction-guarantee'
    }
  ];

  const layoutClasses = variant === 'horizontal'
    ? 'flex flex-col sm:flex-row gap-4 justify-center items-center'
    : 'flex flex-col gap-4';

  return (
    <div
      className={`${layoutClasses} ${className}`}
      role="region"
      aria-label="Trust and credibility badges"
    >
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        const BadgeContent = () => (
          <>
            <div className="flex-shrink-0">
              <Icon
                className="w-10 h-10 text-blue-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg leading-tight">
                {badge.title}
              </div>
              <div className="text-sm text-gray-600">
                {badge.description}
              </div>
            </div>
          </>
        );

        if (badge.link) {
          return (
            <Link
              key={index}
              to={badge.link}
              className="flex items-center gap-3 bg-white border-2 border-blue-600 rounded-lg px-6 py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              role="article"
              aria-label={badge.ariaLabel}
            >
              <BadgeContent />
            </Link>
          );
        }

        return (
          <div
            key={index}
            className="flex items-center gap-3 bg-white border-2 border-blue-600 rounded-lg px-6 py-4 shadow-lg hover:shadow-xl transition-shadow"
            role="article"
            aria-label={badge.ariaLabel}
          >
            <BadgeContent />
          </div>
        );
      })}
    </div>
  );
}

export default memo(TrustBadges);
