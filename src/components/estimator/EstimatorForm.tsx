import { useState, useEffect } from 'react';
import { getPricing } from '../../utils/estimatorPricing';
import { getServiceTips } from '../../utils/serviceTips';
import { calculateServiceAreaSurcharge } from '../../utils/serviceAreaSurcharge';
import ProgressBar from './ProgressBar';
import Step1Services from './Step1Services';
import Step2HouseSize from './Step2HouseSize';
import StepHouseDetails from './StepHouseDetails';
import Step3Roof from './Step3Roof';
import StepSolar from './StepSolar';
import StepFence from './StepFence';
import StepDeck from './StepDeck';
import StepDriveway from './StepDriveway';
import StepPatio from './StepPatio';
import StepGutter from './StepGutter';
import StepContact from './StepContact';
import StepFinal from './StepFinal';

export interface FormData {
  services: string[];
  stories: string;
  walkout: boolean;
  sizeType: 'range' | 'exact';
  houseSize: string;
  exactHouseSize: string;
  hasGarage: boolean;
  garageAttachment: 'attached' | 'detached' | '';
  garageCars: '1' | '2' | 'other' | '';
  garageCustomCars: string;
  roofStories: string;
  houseSoilLevel: string;
  roofSoilLevel: string;
  deckSoilLevel: string;
  deckType: 'composite' | 'wood' | 'painted';
  drivewayMaterial: string;
  drivewaySoilLevel: string;
  solarPanelQty: number;
  fenceType: 'panel' | 'linearFoot';
  fencePanelQty: number;
  fenceLinearFootQty: number;
  fenceCoverage: 'oneSide' | 'bothSides';
  fenceMaterial: 'wood' | 'vinyl';
  fenceHeight: '4' | '5' | '6' | 'other';
  fenceCustomHeight: string;
  deckSqFt: number;
  drivewaySqFt: number;
  poolSqFt: number;
  patioSqFt: number;
  walkwaySqFt: number;
  patioMaterial: string;
  patioDirtiness: string;
  gutterLinearFeet: number;
  gutterStories: string;
  gutterSoilLevel: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_city: string;
  contact_state: string;
  contact_zip: string;
}

type StepId = 'step1' | 'step2' | 'stepHouseDetails' | 'step3' | 'stepSolar' | 'stepFence' | 'stepDeck' | 'stepDriveway' | 'stepPatio' | 'stepGutter' | 'stepContact' | 'stepFinal';

interface EstimatorFormProps {
  resumeQuoteId?: string | null;
}

export default function EstimatorForm({ resumeQuoteId }: EstimatorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    services: [],
    stories: '2',
    walkout: false,
    sizeType: 'range',
    houseSize: '2499',
    exactHouseSize: '',
    hasGarage: false,
    garageAttachment: '',
    garageCars: '',
    garageCustomCars: '',
    roofStories: '2',
    houseSoilLevel: 'moderate',
    roofSoilLevel: 'moderate',
    deckSoilLevel: 'moderate',
    deckType: 'composite',
    drivewayMaterial: 'concrete',
    drivewaySoilLevel: 'moderate',
    solarPanelQty: 0,
    fenceType: 'panel',
    fencePanelQty: 0,
    fenceLinearFootQty: 0,
    fenceCoverage: 'oneSide',
    fenceMaterial: 'wood',
    fenceHeight: '6',
    fenceCustomHeight: '',
    deckSqFt: 0,
    drivewaySqFt: 0,
    poolSqFt: 0,
    patioSqFt: 0,
    walkwaySqFt: 0,
    patioMaterial: 'concrete',
    patioDirtiness: 'moderate',
    gutterLinearFeet: 0,
    gutterStories: '2',
    gutterSoilLevel: 'moderate',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    contact_city: '',
    contact_state: '',
    contact_zip: ''
  });

  const [stepQueue, setStepQueue] = useState<StepId[]>(['step1']);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [estimateRange, setEstimateRange] = useState({ min: 0, max: 0 });
  const [estimateSummary, setEstimateSummary] = useState<Array<{ service: string; details: string }>>([]);
  const [maintenanceTips, setMaintenanceTips] = useState<string[]>([]);
  const [surchargeInfo, setSurchargeInfo] = useState<{ surcharge: number; distance: number; ruleId: string | null; baseZipCode: string } | null>(null);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const buildStepQueue = () => {
    const queue: StepId[] = ['step1'];

    if (formData.services.includes('houseWash') || formData.services.includes('roof')) {
      queue.push('step2');
    }
    if (formData.services.includes('houseWash')) {
      queue.push('stepHouseDetails');
    }
    if (formData.services.includes('roof')) {
      queue.push('step3');
    }
    if (formData.services.includes('solar')) {
      queue.push('stepSolar');
    }
    if (formData.services.includes('fence')) {
      queue.push('stepFence');
    }
    if (formData.services.includes('deck')) {
      queue.push('stepDeck');
    }
    if (formData.services.includes('driveway')) {
      queue.push('stepDriveway');
    }
    if (formData.services.includes('patio')) {
      queue.push('stepPatio');
    }
    if (formData.services.includes('gutter')) {
      queue.push('stepGutter');
    }

    queue.push('stepContact');
    queue.push('stepFinal');

    setStepQueue(queue);
  };

  useEffect(() => {
    buildStepQueue();
  }, [formData.services]);

  // Load saved quote data when resuming
  useEffect(() => {
    const loadSavedQuote = async () => {
      if (!resumeQuoteId) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/quote_submissions?id=eq.${resumeQuoteId}&select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          console.error('Failed to load saved quote');
          return;
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const savedQuote = data[0];

          // Pre-populate contact information
          if (savedQuote.name) setFormData(prev => ({ ...prev, contact_name: savedQuote.name }));
          if (savedQuote.email) setFormData(prev => ({ ...prev, contact_email: savedQuote.email }));
          if (savedQuote.phone) setFormData(prev => ({ ...prev, contact_phone: savedQuote.phone }));
          if (savedQuote.address) setFormData(prev => ({ ...prev, contact_address: savedQuote.address }));
          if (savedQuote.city) setFormData(prev => ({ ...prev, contact_city: savedQuote.city }));
          if (savedQuote.state) setFormData(prev => ({ ...prev, contact_state: savedQuote.state }));
          if (savedQuote.zip) setFormData(prev => ({ ...prev, contact_zip: savedQuote.zip }));

          // Pre-populate services if available
          if (savedQuote.services) {
            let services: string[] = [];
            if (Array.isArray(savedQuote.services)) {
              services = savedQuote.services;
            } else if (typeof savedQuote.services === 'string') {
              services = savedQuote.services.split(',').map((s: string) => s.trim());
            }
            if (services.length > 0) {
              setFormData(prev => ({ ...prev, services }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved quote:', error);
      }
    };

    loadSavedQuote();
  }, [resumeQuoteId]);

  const getHouseSqFt = (): number => {
    if (formData.sizeType === 'exact') {
      return parseInt(formData.exactHouseSize, 10) || 0;
    }

    const ranges: Record<string, number> = {
      '1599': 1300,
      '1999': 1800,
      '2499': 2250,
      '2999': 2750,
      '3999': 3500,
      '4999': 4500,
      '5000': 5500
    };
    return ranges[formData.houseSize] || 2250;
  };

  const calculateEstimate = async () => {
    const pricing = getPricing();
    let total = 0;

    formData.services.forEach(service => {
      switch (service) {
        case 'houseWash': {
          const sqft = getHouseSqFt();
          const storyMultiplier = pricing.houseWash.storyMultiplier[formData.stories as '1' | '2' | '3'];
          const soilMultiplier = pricing.houseWash.soilLevelMultiplier[formData.houseSoilLevel as 'light' | 'moderate' | 'heavy'];
          total += sqft * pricing.houseWash.pricePerSqFt * storyMultiplier * soilMultiplier;
          if (formData.walkout) {
            total += pricing.houseWashAddOns.walkout;
          }
          break;
        }
        case 'roof': {
          const sqft = getHouseSqFt();
          const storyMultiplier = pricing.roofCleaning.storyMultiplier[formData.roofStories as '1' | '2' | '3' | '4'];
          const soilMultiplier = pricing.roofCleaning.soilLevelMultiplier[formData.roofSoilLevel as 'light' | 'moderate' | 'heavy'];
          total += sqft * pricing.roofCleaning.pricePerSqFt * storyMultiplier * soilMultiplier;
          break;
        }
        case 'solar':
          total += formData.solarPanelQty * pricing.solarPanelCleaning.pricePerPanel;
          break;
        case 'fence': {
          let fenceTotal = 0;
          if (formData.fenceType === 'panel') {
            fenceTotal = formData.fencePanelQty * pricing.fenceWash.pricePerPanel;
          } else {
            fenceTotal = formData.fenceLinearFootQty * pricing.fenceWash.pricePerLinearFoot;
          }
          if (formData.fenceCoverage === 'bothSides') {
            fenceTotal *= 2;
          }
          total += fenceTotal;
          break;
        }
        case 'deck': {
          const soilMultiplier = pricing.deckWash.soilLevelMultiplier[formData.deckSoilLevel as 'light' | 'moderate' | 'heavy'];
          total += formData.deckSqFt * pricing.deckWash.pricePerSqFt * soilMultiplier;
          break;
        }
        case 'driveway': {
          const soilMultiplier = pricing.drivewayWash.soilLevelMultiplier[formData.drivewaySoilLevel as 'light' | 'moderate' | 'heavy'];
          total += formData.drivewaySqFt * pricing.drivewayWash.pricePerSqFt * soilMultiplier;
          break;
        }
        case 'patio': {
          const totalSqFt = formData.poolSqFt + formData.patioSqFt + formData.walkwaySqFt;
          const material = formData.patioMaterial as keyof typeof pricing.patioWash.materialMultiplier;
          const dirtiness = formData.patioDirtiness as keyof typeof pricing.patioWash.dirtinessMultiplier;
          total += totalSqFt * pricing.patioWash.pricePerSqFt *
                   pricing.patioWash.materialMultiplier[material] *
                   pricing.patioWash.dirtinessMultiplier[dirtiness];
          break;
        }
        case 'gutter': {
          const storyMultiplier = pricing.gutterCleaning.storyMultiplier[formData.gutterStories as '1' | '2' | '3' | '4'];
          const soilMultiplier = pricing.gutterCleaning.soilLevelMultiplier[formData.gutterSoilLevel as 'light' | 'moderate' | 'heavy'];
          total += formData.gutterLinearFeet * pricing.gutterCleaning.pricePerLinearFoot * storyMultiplier * soilMultiplier;
          break;
        }
      }
    });

    let surchargeCalc = { surcharge: 0, distance: 0, ruleId: null, baseZipCode: '02919' };
    if (formData.contact_zip && formData.contact_zip.length >= 5) {
      surchargeCalc = await calculateServiceAreaSurcharge(formData.contact_zip);
      setSurchargeInfo(surchargeCalc);
      total += surchargeCalc.surcharge;
    }

    const minPrice = Math.round(total * 0.9);
    const maxPrice = Math.round(total * 1.1);
    setEstimateRange({ min: minPrice, max: maxPrice });
  };

  const generateSummary = () => {
    const summary: Array<{ service: string; details: string }> = [];
    const serviceNames: Record<string, string> = {
      houseWash: 'House Wash',
      roof: 'Roof Cleaning',
      patio: 'Pool, Patio, Walkway',
      driveway: 'Driveway Wash',
      fence: 'Fence Wash',
      solar: 'Solar Panel Cleaning',
      deck: 'Deck Wash',
      gutter: 'Gutter Cleaning'
    };

    formData.services.forEach(service => {
      let details = '';
      switch (service) {
        case 'houseWash':
          details = `${formData.stories} Stories, approx. ${getHouseSqFt()} sq ft`;
          break;
        case 'roof':
          details = `${formData.roofStories} Stories, approx. ${getHouseSqFt()} sq ft`;
          break;
        case 'solar':
          details = `${formData.solarPanelQty} panels`;
          break;
        case 'fence':
          details = formData.fenceType === 'panel'
            ? `${formData.fencePanelQty} panels`
            : `${formData.fenceLinearFootQty} linear feet`;
          break;
        case 'deck':
          details = `${formData.deckSqFt} sq ft`;
          break;
        case 'driveway':
          details = `${formData.drivewaySqFt} sq ft`;
          break;
        case 'patio':
          details = `${formData.poolSqFt + formData.patioSqFt + formData.walkwaySqFt} sq ft`;
          break;
        case 'gutter':
          details = `${formData.gutterLinearFeet} linear feet, ${formData.gutterStories} stories`;
          break;
      }
      summary.push({ service: serviceNames[service], details });
    });

    setEstimateSummary(summary);
  };

  const moveToNextStep = async () => {
    if (currentStepIndex < stepQueue.length - 1) {
      setCurrentStepIndex(prev => prev + 1);

      if (stepQueue[currentStepIndex + 1] === 'stepContact') {
        generateSummary();
        await calculateEstimate();
      }

      if (stepQueue[currentStepIndex + 1] === 'stepFinal') {
        setMaintenanceTips(getServiceTips(formData.services));
      }
    }
  };

  const moveToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAddServiceFromContact = (serviceId: string) => {
    // Add the service to the form data
    updateFormData({ services: [...formData.services, serviceId] });

    // Build new step queue with the added service
    const newQueue: StepId[] = ['step1'];
    const updatedServices = [...formData.services, serviceId];

    if (updatedServices.includes('houseWash') || updatedServices.includes('roof')) {
      newQueue.push('step2');
    }
    if (updatedServices.includes('houseWash')) {
      newQueue.push('stepHouseDetails');
    }
    if (updatedServices.includes('roof')) {
      newQueue.push('step3');
    }
    if (updatedServices.includes('solar')) {
      newQueue.push('stepSolar');
    }
    if (updatedServices.includes('fence')) {
      newQueue.push('stepFence');
    }
    if (updatedServices.includes('deck')) {
      newQueue.push('stepDeck');
    }
    if (updatedServices.includes('driveway')) {
      newQueue.push('stepDriveway');
    }
    if (updatedServices.includes('patio')) {
      newQueue.push('stepPatio');
    }
    if (updatedServices.includes('gutter')) {
      newQueue.push('stepGutter');
    }
    newQueue.push('stepContact');
    newQueue.push('stepFinal');

    setStepQueue(newQueue);

    // Navigate to the appropriate step for the newly added service
    let targetStepIndex = 0;
    switch(serviceId) {
      case 'houseWash':
        targetStepIndex = newQueue.indexOf('stepHouseDetails') !== -1 ? newQueue.indexOf('stepHouseDetails') : newQueue.indexOf('step2');
        break;
      case 'roof':
        targetStepIndex = newQueue.indexOf('step3');
        break;
      case 'solar':
        targetStepIndex = newQueue.indexOf('stepSolar');
        break;
      case 'fence':
        targetStepIndex = newQueue.indexOf('stepFence');
        break;
      case 'deck':
        targetStepIndex = newQueue.indexOf('stepDeck');
        break;
      case 'driveway':
        targetStepIndex = newQueue.indexOf('stepDriveway');
        break;
      case 'patio':
        targetStepIndex = newQueue.indexOf('stepPatio');
        break;
      case 'gutter':
        targetStepIndex = newQueue.indexOf('stepGutter');
        break;
    }

    setCurrentStepIndex(targetStepIndex);
  };

  const handleReset = () => {
    setFormData({
      services: [],
      stories: '2',
      walkout: false,
      sizeType: 'range',
      houseSize: '2499',
      exactHouseSize: '',
      roofStories: '2',
      houseSoilLevel: 'moderate',
      roofSoilLevel: 'moderate',
      deckSoilLevel: 'moderate',
      drivewayMaterial: 'concrete',
      drivewaySoilLevel: 'moderate',
      solarPanelQty: 0,
      fenceType: 'panel',
      fencePanelQty: 0,
      fenceLinearFootQty: 0,
      deckSqFt: 0,
      drivewaySqFt: 0,
      poolSqFt: 0,
      patioSqFt: 0,
      walkwaySqFt: 0,
      patioMaterial: 'concrete',
      patioDirtiness: 'moderate',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      contact_address: '',
      contact_city: '',
      contact_state: '',
      contact_zip: ''
    });
    setUploadedFiles([]);
    setCurrentStepIndex(0);
    setStepQueue(['step1']);
    setSubmittedQuoteId(null);
  };

  const currentStep = stepQueue[currentStepIndex];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-10">
      <ProgressBar
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={stepQueue.length}
      />

      <form onSubmit={(e) => e.preventDefault()}>
        {currentStep === 'step1' && (
          <Step1Services
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
          />
        )}

        {currentStep === 'step2' && (
          <Step2HouseSize
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepHouseDetails' && (
          <StepHouseDetails
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'step3' && (
          <Step3Roof
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepSolar' && (
          <StepSolar
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepFence' && (
          <StepFence
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepDeck' && (
          <StepDeck
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepDriveway' && (
          <StepDriveway
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepPatio' && (
          <StepPatio
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepGutter' && (
          <StepGutter
            formData={formData}
            updateFormData={updateFormData}
            onContinue={moveToNextStep}
            onBack={moveToPrevStep}
          />
        )}

        {currentStep === 'stepContact' && (
          <StepContact
            formData={formData}
            updateFormData={updateFormData}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            estimateSummary={estimateSummary}
            estimateRange={estimateRange}
            onContinue={(quoteId) => {
              if (quoteId) {
                setSubmittedQuoteId(quoteId);
              }
              moveToNextStep();
            }}
            onAddService={handleAddServiceFromContact}
            onBack={() => {
              buildStepQueue();
              const contactIndex = stepQueue.indexOf('stepContact');
              setCurrentStepIndex(contactIndex - 1);
            }}
            surchargeInfo={surchargeInfo}
          />
        )}

        {currentStep === 'stepFinal' && (
          <StepFinal
            estimateSummary={estimateSummary}
            estimateRange={estimateRange}
            maintenanceTips={maintenanceTips}
            onReset={handleReset}
            quoteId={submittedQuoteId}
            contactInfo={{
              name: formData.contact_name,
              email: formData.contact_email,
              phone: formData.contact_phone,
              address: formData.contact_address,
              city: formData.contact_city,
              state: formData.contact_state,
              zip: formData.contact_zip
            }}
          />
        )}
      </form>
    </div>
  );
}
