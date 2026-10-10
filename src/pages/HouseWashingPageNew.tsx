import ServicePageTemplate from '../components/ServicePageTemplate';
import { allServicesData } from '../data/allServicesData';

export default function HouseWashingPage() {
  const serviceData = allServicesData['house-washing'];

  return <ServicePageTemplate {...serviceData} />;
}
