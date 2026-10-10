import { useParams, Navigate } from 'react-router-dom';
import TownPageTemplate from '../components/TownPageTemplate';
import { getTownBySlug } from '../data/townsData';

export default function TownPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/towns/" replace />;
  }

  const townData = getTownBySlug(slug);

  if (!townData) {
    return <Navigate to="/towns/" replace />;
  }

  return (
    <TownPageTemplate
      townName={townData.name}
      state={townData.state}
      stateAbbr={townData.stateAbbr}
      zipCode={townData.zipCode}
      description={townData.description}
      keywords={townData.keywords}
      heroImage={townData.heroImage}
      townSlug={slug}
      seoContent={townData.seoContent}
      mapEmbedUrl={townData.mapEmbedUrl}
      metaTitle={townData.metaTitle}
      metaDescription={townData.metaDescription}
      coordinates={townData.coordinates}
      neighborhood1={townData.neighborhood1}
      neighborhood2={townData.neighborhood2}
      neighborhood3={townData.neighborhood3}
      pricingLow={townData.pricingLow}
      pricingHigh={townData.pricingHigh}
    />
  );
}
