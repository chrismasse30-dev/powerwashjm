import { useParams, Navigate } from 'react-router-dom';
import HolidayLightsTownTemplate from '../components/HolidayLightsTownTemplate';
import { getHolidayLightsTownBySlug, getTownFAQs } from '../data/holidayLightsTownsData';

export default function HolidayLightsTownPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/holiday-lights/" replace />;
  }

  const townData = getHolidayLightsTownBySlug(slug);

  if (!townData) {
    return <Navigate to="/holiday-lights/" replace />;
  }

  const faqs = getTownFAQs(townData);

  return (
    <HolidayLightsTownTemplate
      townName={townData.name}
      state={townData.state}
      stateAbbr={townData.stateAbbr}
      zipCode={townData.zipCode}
      neighborhoods={townData.neighborhoods}
      description={townData.description}
      keywords={townData.keywords}
      metaTitle={townData.metaTitle}
      metaDescription={townData.metaDescription}
      seoContent={townData.seoContent}
      mapEmbedUrl={townData.mapEmbedUrl}
      townSlug={slug}
      faqs={faqs}
      localHighlight={townData.localHighlight}
    />
  );
}
