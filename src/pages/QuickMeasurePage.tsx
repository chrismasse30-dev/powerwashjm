import React, { useState, useRef, useEffect } from 'react';
import { Upload, Ruler, Square, Download, LogOut, RotateCcw, ZoomIn, ZoomOut, Mail, Undo, Redo, ChevronDown, Menu, X, ArrowLeft, Trees, BookOpen, Users, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import DesignGuideModal from '../components/DesignGuideModal';
import { getActiveTemplate, replaceTemplateVariables, generateSubject } from '../services/emailTemplateService';
import {
  Point,
  CalibrationData,
  Measurement,
  calculateDistance,
  calculateRealWorldDistance,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  convertToFeetInches,
  convertToMeters,
  convertToSquareFeet,
  convertToSquareMeters
} from '../utils/measurementUtils';

type Tool = 'length' | 'area' | 'tree' | 'bush' | null;
type Units = 'imperial' | 'metric';

interface HistoryState {
  measurements: Measurement[];
  calibration: CalibrationData | null;
}

const PRESET_REFERENCES = [
  { name: 'Standard Door (80")', value: 80 },
  { name: 'Double Garage Door (192")', value: 192 },
  { name: 'Single Garage Door (96")', value: 96 }
];

export default function QuickMeasurePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [image2, setImage2] = useState<HTMLImageElement | null>(null);
  const [activePhoto, setActivePhoto] = useState<'photo1' | 'photo2'>('photo1');
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [units, setUnits] = useState<Units>('imperial');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string>('');
  const [isSettingReference, setIsSettingReference] = useState(false);
  const [tempCalibrationPoints, setTempCalibrationPoints] = useState<[Point, Point] | null>(null);

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingCustomerEmail, setIsSendingCustomerEmail] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientBusinessName, setClientBusinessName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientZip, setClientZip] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [salesRep, setSalesRep] = useState('Chris M');
  const [lineColor, setLineColor] = useState('#ef4444');
  const [fontSize, setFontSize] = useState(10);
  const [lineThickness, setLineThickness] = useState(20);
  const [perFootCostHouse, setPerFootCostHouse] = useState(7);
  const [perFootCostTree, setPerFootCostTree] = useState(3.5);
  const [perFootCostPowerCord, setPerFootCostPowerCord] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [treeMeasurements, setTreeMeasurements] = useState<Measurement[]>([]);
  const [treeWidth, setTreeWidth] = useState<number | null>(null);
  const [treeHeight, setTreeHeight] = useState<number | null>(null);
  const [treeWidthPoints, setTreeWidthPoints] = useState<[Point, Point] | null>(null);
  const [treeHeightPoints, setTreeHeightPoints] = useState<[Point, Point] | null>(null);
  const [wrapSpacing, setWrapSpacing] = useState('24');
  const [treeMeasurementStep, setTreeMeasurementStep] = useState<'width' | 'height' | null>(null);
  const [bushShapes, setBushShapes] = useState<Array<{points: Point[], photoId: 'photo1' | 'photo2', estimatedFeet: number, lightPositions: Point[]}>>([]);
  const [showDesignGuide, setShowDesignGuide] = useState(false);
  const [imageDarkness, setImageDarkness] = useState(0);
  const [multiplySideBy2, setMultiplySideBy2] = useState(false);
  const [includePhoto1, setIncludePhoto1] = useState(true);
  const [includePhoto2, setIncludePhoto2] = useState(true);
  const [manualInputPhoto1, setManualInputPhoto1] = useState('');
  const [manualInputPhoto2, setManualInputPhoto2] = useState('');
  const [manualPowerCordPhoto1, setManualPowerCordPhoto1] = useState('');
  const [manualPowerCordPhoto2, setManualPowerCordPhoto2] = useState('');
  const [photo1Name, setPhoto1Name] = useState('Front View');
  const [photo2Name, setPhoto2Name] = useState('Side View');
  const [showMeasurementAmounts, setShowMeasurementAmounts] = useState(true);
  const [projectNarrative, setProjectNarrative] = useState('');
  const [holidayLightsQuotes, setHolidayLightsQuotes] = useState<any[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [emailTemplate, setEmailTemplate] = useState<'residential' | 'commercial'>('residential');
  const [showPriceConfirmModal, setShowPriceConfirmModal] = useState(false);
  const [confirmedPrice, setConfirmedPrice] = useState<number | null>(null);
  const [priceOverride, setPriceOverride] = useState<string>('');

  // Auto-save functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-switch to commercial template when business name is filled
  useEffect(() => {
    if (clientBusinessName && clientBusinessName.trim().length > 0) {
      setEmailTemplate('commercial');
    } else {
      setEmailTemplate('residential');
    }
  }, [clientBusinessName]);

  useEffect(() => {
    fetchHolidayLightsQuotes();
  }, []);

  // Load existing design if quoteId is in URL
  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    if (quoteId) {
      loadExistingDesign(quoteId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
    if (image2 && canvas2Ref.current) {
      drawCanvas2();
    }
  }, [image, image2, measurements, treeMeasurements, currentPoints, calibration, zoom, mousePosition, lineColor, fontSize, lineThickness, panOffset, activeTool, treeWidth, treeHeight, treeWidthPoints, treeHeightPoints, activePhoto, multiplySideBy2, photo1Name, photo2Name, showMeasurementAmounts, imageDarkness, bushShapes]);

  // Track changes to design data
  useEffect(() => {
    if (selectedQuoteId && (measurements.length > 0 || treeMeasurements.length > 0 || image || image2)) {
      setHasUnsavedChanges(true);
    }
  }, [measurements, treeMeasurements, image, image2, calibration, lineColor, fontSize, lineThickness,
      perFootCostHouse, perFootCostTree, perFootCostPowerCord, discount, projectNarrative,
      manualInputPhoto1, manualInputPhoto2, manualPowerCordPhoto1, manualPowerCordPhoto2,
      photo1Name, photo2Name, salesRep, clientName, clientBusinessName, clientEmail,
      clientPhone, clientAddress, clientCity, clientState, clientZip]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !selectedQuoteId) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 30 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSaveEnabled, selectedQuoteId, measurements, treeMeasurements]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchHolidayLightsQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_submissions')
        .select('*')
        .eq('status', 'Needs Measure')
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching quotes needing measurement:', error);
        return;
      }

      setHolidayLightsQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes needing measurement:', err);
    }
  };

  /**
   * Load existing design from database
   * Restores complete design state including measurements, photos, calibration, and settings
   */
  const loadExistingDesign = async (quoteId: string) => {
    try {
      const { data, error } = await supabase
        .from('quote_submissions')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) {
        console.error('Error loading design:', error);
        alert('Failed to load design. Please try again.');
        return;
      }

      if (!data) {
        alert('Design not found.');
        return;
      }

      // Set the selected quote in dropdown
      setSelectedQuoteId(quoteId);

      // Populate client info
      setClientName(data.name || '');
      setClientBusinessName(data.business_name || '');
      setClientAddress(data.address || '');
      setClientCity(data.city || '');
      setClientState(data.state || '');
      setClientZip(data.zip || '');
      setClientPhone(data.phone || '');
      setClientEmail(data.email || '');
      // Load project narrative from design_data if available, otherwise empty
      setProjectNarrative('');

      // Check if we have the new design_data format (with measurements and settings)
      const hasNewFormatData = data.design_data && Object.keys(data.design_data).length > 0;

      // Check if we have legacy design files (just images, no editable data)
      const hasLegacyDesign = (data.design_file_url || data.design_image_url) && !hasNewFormatData;

      if (hasNewFormatData) {
        // NEW FORMAT: Load complete design with measurements
        const designData = data.design_data;

        // Restore measurements
        if (designData.measurements) {
          setMeasurements(designData.measurements);
        }

        if (designData.treeMeasurements) {
          setTreeMeasurements(designData.treeMeasurements);
        }

        // Restore calibration
        if (designData.calibration) {
          setCalibration(designData.calibration);
        }

        // Restore settings
        if (designData.lineColor) setLineColor(designData.lineColor);
        if (designData.fontSize) setFontSize(designData.fontSize);
        if (designData.lineThickness) setLineThickness(designData.lineThickness);
        if (designData.showMeasurementAmounts !== undefined) setShowMeasurementAmounts(designData.showMeasurementAmounts);
        if (designData.perFootCostHouse) setPerFootCostHouse(designData.perFootCostHouse);
        if (designData.perFootCostTree) setPerFootCostTree(designData.perFootCostTree);
        if (designData.perFootCostPowerCord) setPerFootCostPowerCord(designData.perFootCostPowerCord);
        if (designData.discount) setDiscount(designData.discount);
        // Note: manualInput is calculated from manualInputPhoto1 and manualInputPhoto2, not stored separately
        if (designData.manualInputPhoto1) setManualInputPhoto1(designData.manualInputPhoto1);
        if (designData.manualInputPhoto2) setManualInputPhoto2(designData.manualInputPhoto2);
        if (designData.manualPowerCordPhoto1) setManualPowerCordPhoto1(designData.manualPowerCordPhoto1);
        if (designData.manualPowerCordPhoto2) setManualPowerCordPhoto2(designData.manualPowerCordPhoto2);

        // Restore photo checkboxes
        if (designData.includePhoto1 !== undefined) setIncludePhoto1(designData.includePhoto1);
        if (designData.includePhoto2 !== undefined) setIncludePhoto2(designData.includePhoto2);

        // Restore photo names
        if (designData.photo1Name) setPhoto1Name(designData.photo1Name);
        if (designData.photo2Name) setPhoto2Name(designData.photo2Name);

        // Restore project narrative
        if (designData.projectNarrative) setProjectNarrative(designData.projectNarrative);

        // Restore sales rep
        if (designData.salesRep) setSalesRep(designData.salesRep);

        // Load images from URLs if available
        if (designData.photo1Url) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            setImage(img);
          };
          img.src = designData.photo1Url;
        }

        if (designData.photo2Url) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            setImage2(img);
          };
          img.src = designData.photo2Url;
        }

        // Show success message
        alert(`✅ Design loaded successfully!\n\nClient: ${data.name}\nLast saved: ${data.design_saved_at ? new Date(data.design_saved_at).toLocaleString() : 'Unknown'}\n\nYou can now edit and save your changes.`);
      } else if (hasLegacyDesign) {
        // LEGACY FORMAT: Only has design image files, no editable measurements
        alert(`⚠️ Legacy Design Detected\n\nClient: ${data.name}\n\nThis quote has an old design format (image only) that cannot be edited.\n\nYou can:\n• View the existing design images in the Quote Dashboard\n• Create a new design by uploading photos and taking measurements\n• The new design will replace the old one when saved`);
      } else {
        // NO DESIGN: Just populate client info
        alert(`Client info loaded: ${data.name}\n\nNo previous design found. You can start creating a new design.`);
      }
    } catch (err) {
      console.error('Error loading design:', err);
      alert('An error occurred while loading the design.');
    }
  };

  const handleQuoteSelection = (quoteId: string) => {
    setSelectedQuoteId(quoteId);

    if (!quoteId) return;

    const selectedQuote = holidayLightsQuotes.find(q => q.id === quoteId);
    if (!selectedQuote) return;

    setClientName(selectedQuote.name || '');
    setClientBusinessName(selectedQuote.business_name || '');
    setClientAddress(selectedQuote.address || '');
    setClientCity(selectedQuote.city || '');
    setClientZip(selectedQuote.zip || '');
    setClientPhone(selectedQuote.phone || '');
    setClientEmail(selectedQuote.email || '');
    setSalesRep(selectedQuote.sales_rep || 'Chris M');
  };

  const saveToHistory = () => {
    const newState: HistoryState = {
      measurements: [...measurements],
      calibration: calibration ? { ...calibration } : null
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setMeasurements(prevState.measurements);
      setCalibration(prevState.calibration);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setMeasurements(nextState.measurements);
      setCalibration(nextState.calibration);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setMeasurements([]);
        setCalibration(null);
        setActiveTool(null);
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
        setHistory([]);
        setHistoryIndex(-1);
        setSelectedReference('');
        setActivePhoto('photo1');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImage2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage2(img);
        setActivePhoto('photo2');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // Apply darkness overlay for night effect
    if (imageDarkness > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${imageDarkness / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (calibration) {
      // Reference line is always solid yellow with fixed small thickness
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(calibration.referencePoints[0].x, calibration.referencePoints[0].y);
      ctx.lineTo(calibration.referencePoints[1].x, calibration.referencePoints[1].y);
      ctx.stroke();

      const midX = (calibration.referencePoints[0].x + calibration.referencePoints[1].x) / 2;
      const midY = (calibration.referencePoints[0].y + calibration.referencePoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(calibration.realWorldDistance), '#fbbf24');
    }

    // Draw temporary tree measurements (placeholder - before adding to total)
    // Only draw on the active photo
    if (activeTool === 'tree' && treeWidthPoints && activePhoto === 'photo1') {
      const widthPoints = treeWidthPoints;
      // Draw with green dashed line to indicate temporary/placeholder state
      const placeholderColor = '#10b981'; // green-500
      ctx.strokeStyle = placeholderColor;
      ctx.lineWidth = lineThickness;
      ctx.setLineDash([10, 5]); // Dashed line for placeholder
      ctx.beginPath();
      ctx.moveTo(widthPoints[0].x, widthPoints[0].y);
      ctx.lineTo(widthPoints[1].x, widthPoints[1].y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line

      const midX = (widthPoints[0].x + widthPoints[1].x) / 2;
      const midY = (widthPoints[0].y + widthPoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(treeWidth || 0), placeholderColor);
    }

    if (activeTool === 'tree' && treeHeightPoints && activePhoto === 'photo1') {
      const heightPoints = treeHeightPoints;
      // Draw with green dashed line to indicate temporary/placeholder state
      const placeholderColor = '#10b981'; // green-500
      ctx.strokeStyle = placeholderColor;
      ctx.lineWidth = lineThickness;
      ctx.setLineDash([10, 5]); // Dashed line for placeholder
      ctx.beginPath();
      ctx.moveTo(heightPoints[0].x, heightPoints[0].y);
      ctx.lineTo(heightPoints[1].x, heightPoints[1].y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line

      const midX = (heightPoints[0].x + heightPoints[1].x) / 2;
      const midY = (heightPoints[0].y + heightPoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(treeHeight || 0), placeholderColor);
    }

    // Draw bush wraps on photo 1 (visual decoration only)
    bushShapes.forEach((bush) => {
      if (bush.photoId === 'photo1') {
        drawBushWrap(ctx, bush.points, lineColor, false, bush.lightPositions);
      }
    });

    // Draw saved tree measurements (added to total)
    // Fix: Only draw tree measurements that belong to photo1 or have no photoId
    treeMeasurements.forEach((treeMeasurement) => {
      const photoMatches = !treeMeasurement.metadata?.photoId || treeMeasurement.metadata?.photoId === 'photo1';

      if (photoMatches && treeMeasurement.metadata?.widthPoints) {
        const widthPoints = treeMeasurement.metadata.widthPoints as [Point, Point];
        if (lineColor === '#ffffff' || lineColor === '#fbbf24' || lineColor === '#redwhite') {
          drawLightString(ctx, widthPoints[0], widthPoints[1], lineColor);
        } else {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(widthPoints[0].x, widthPoints[0].y);
          ctx.lineTo(widthPoints[1].x, widthPoints[1].y);
          ctx.stroke();
        }
        const midX = (widthPoints[0].x + widthPoints[1].x) / 2;
        const midY = (widthPoints[0].y + widthPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(treeMeasurement.metadata.width || 0), lineColor);
      }

      if (photoMatches && treeMeasurement.metadata?.heightPoints) {
        const heightPoints = treeMeasurement.metadata.heightPoints as [Point, Point];
        if (lineColor === '#ffffff' || lineColor === '#fbbf24' || lineColor === '#redwhite') {
          drawLightString(ctx, heightPoints[0], heightPoints[1], lineColor);
        } else {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(heightPoints[0].x, heightPoints[0].y);
          ctx.lineTo(heightPoints[1].x, heightPoints[1].y);
          ctx.stroke();
        }
        const midX = (heightPoints[0].x + heightPoints[1].x) / 2;
        const midY = (heightPoints[0].y + heightPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(treeMeasurement.metadata.height || 0), lineColor);
      }
    });

    measurements.forEach((measurement) => {
      if (measurement.type === 'length' && measurement.points.length === 2 && (!measurement.metadata?.photoId || measurement.metadata?.photoId === 'photo1')) {
        // Always use current lineColor state for display
        const isPowerCord = measurement.metadata?.isPowerCord || lineColor === '#powercord';
        const displayColor = isPowerCord ? '#ffffff' : lineColor;

        // Power cord draws as solid white line, lights draw with bulbs
        if (!isPowerCord && (displayColor === '#ffffff' || displayColor === '#fbbf24' || displayColor === '#redwhite')) {
          drawLightString(ctx, measurement.points[0], measurement.points[1], displayColor);
        } else {
          ctx.strokeStyle = displayColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
          ctx.lineTo(measurement.points[1].x, measurement.points[1].y);
          ctx.stroke();
        }

        const midX = (measurement.points[0].x + measurement.points[1].x) / 2;
        const midY = (measurement.points[0].y + measurement.points[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(measurement.value), displayColor);
      } else if (measurement.type === 'area' && measurement.points.length > 2 && (!measurement.metadata?.photoId || measurement.metadata?.photoId === 'photo1')) {
        // Use current lineColor for area measurements
        const displayColor = lineColor === '#powercord' ? '#ffffff' : lineColor;
        const fillAlpha = displayColor === '#ffffff' ? 0.2 : 0.1;
        ctx.fillStyle = displayColor === '#ffffff' ? 'rgba(255, 255, 255, 0.2)' : displayColor === '#000000' ? 'rgba(0, 0, 0, 0.1)' : displayColor === '#fbbf24' ? 'rgba(251, 191, 36, 0.1)' : displayColor === '#redwhite' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
        ctx.beginPath();
        ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
        measurement.points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fill();

        if (displayColor === '#ffffff' || displayColor === '#fbbf24' || displayColor === '#redwhite') {
          for (let i = 0; i < measurement.points.length; i++) {
            const p1 = measurement.points[i];
            const p2 = measurement.points[(i + 1) % measurement.points.length];
            drawLightString(ctx, p1, p2, displayColor);
          }
        } else {
          ctx.strokeStyle = displayColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
          measurement.points.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.stroke();
        }

        const centroid = calculateCentroid(measurement.points);
        const label = `${formatArea(measurement.value)}\n${formatLength(measurement.perimeter || 0)}`;
        drawMeasurementLabel(ctx, centroid.x, centroid.y, label, lineColor);
      }
    });

    if (currentPoints.length > 0) {
      const isPowerCord = lineColor === '#powercord';
      const displayLineColor = isPowerCord ? '#ffffff' : lineColor;
      const pointColor = displayLineColor === '#fbbf24' ? '#fbbf24' : displayLineColor === '#ffffff' ? '#ffffff' : displayLineColor === '#redwhite' ? '#ef4444' : displayLineColor;
      ctx.fillStyle = pointColor;

      currentPoints.forEach((point, index) => {
        // Don't draw dots for bush tool
        if (activeTool !== 'bush') {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        if (index > 0) {
          // Bush tool: draw thin path line
          if (activeTool === 'bush') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPoints[index - 1].x, currentPoints[index - 1].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
          // Power cord draws as solid line, lights draw with bulbs
          else if (!isPowerCord && (displayLineColor === '#ffffff' || displayLineColor === '#fbbf24' || displayLineColor === '#redwhite')) {
            drawLightString(ctx, currentPoints[index - 1], point, displayLineColor);
          } else {
            ctx.strokeStyle = displayLineColor;
            ctx.lineWidth = lineThickness;
            ctx.beginPath();
            ctx.moveTo(currentPoints[index - 1].x, currentPoints[index - 1].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      });

      if (activeTool === 'area' && currentPoints.length > 2) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
        ctx.lineTo(currentPoints[0].x, currentPoints[0].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (mousePosition && currentPoints.length > 0 && (activeTool || isSettingReference)) {
        // Bush tool: show preview of web pattern
        if (activeTool === 'bush' && currentPoints.length >= 2) {
          drawBushWrap(ctx, [...currentPoints, mousePosition], displayLineColor, true);
        }
        // Power cord draws as solid line, lights draw with bulbs
        else if (!isPowerCord && (displayLineColor === '#ffffff' || displayLineColor === '#fbbf24')) {
          drawLightString(ctx, currentPoints[currentPoints.length - 1], mousePosition, displayLineColor, true);
        } else if (activeTool !== 'bush') {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = displayLineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
          ctx.lineTo(mousePosition.x, mousePosition.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Show real-time measurement for length and tree tools
        if ((activeTool === 'length' || activeTool === 'tree') && calibration && currentPoints.length === 1) {
          const pixelDistance = calculateDistance(currentPoints[0], mousePosition);
          const realDistance = calculateRealWorldDistance(pixelDistance, calibration);
          const midX = (currentPoints[0].x + mousePosition.x) / 2;
          const midY = (currentPoints[0].y + mousePosition.y) / 2;
          drawMeasurementLabel(ctx, midX, midY, formatLength(realDistance), displayLineColor);
        }
        // Show real-time reference distance when setting calibration
        else if (isSettingReference && currentPoints.length === 1) {
          const preset = PRESET_REFERENCES.find(p => p.name === selectedReference);
          if (preset) {
            const midX = (currentPoints[0].x + mousePosition.x) / 2;
            const midY = (currentPoints[0].y + mousePosition.y) / 2;
            drawMeasurementLabel(ctx, midX, midY, formatLength(preset.value), '#fbbf24');
          }
        }
      }
    }
  };

  const drawCanvas2 = () => {
    const canvas = canvas2Ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image2) return;

    canvas.width = image2.width;
    canvas.height = image2.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image2, 0, 0);

    // Apply darkness overlay for night effect
    if (imageDarkness > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${imageDarkness / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (calibration && activePhoto === 'photo2') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(calibration.referencePoints[0].x, calibration.referencePoints[0].y);
      ctx.lineTo(calibration.referencePoints[1].x, calibration.referencePoints[1].y);
      ctx.stroke();

      const midX = (calibration.referencePoints[0].x + calibration.referencePoints[1].x) / 2;
      const midY = (calibration.referencePoints[0].y + calibration.referencePoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(calibration.realWorldDistance), '#fbbf24');
    }

    // Draw temporary tree measurements for photo2
    if (activeTool === 'tree' && treeWidthPoints && activePhoto === 'photo2') {
      const widthPoints = treeWidthPoints;
      const placeholderColor = '#10b981';
      ctx.strokeStyle = placeholderColor;
      ctx.lineWidth = lineThickness;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(widthPoints[0].x, widthPoints[0].y);
      ctx.lineTo(widthPoints[1].x, widthPoints[1].y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (widthPoints[0].x + widthPoints[1].x) / 2;
      const midY = (widthPoints[0].y + widthPoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(treeWidth || 0), placeholderColor);
    }

    if (activeTool === 'tree' && treeHeightPoints && activePhoto === 'photo2') {
      const heightPoints = treeHeightPoints;
      const placeholderColor = '#10b981';
      ctx.strokeStyle = placeholderColor;
      ctx.lineWidth = lineThickness;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(heightPoints[0].x, heightPoints[0].y);
      ctx.lineTo(heightPoints[1].x, heightPoints[1].y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (heightPoints[0].x + heightPoints[1].x) / 2;
      const midY = (heightPoints[0].y + heightPoints[1].y) / 2;
      drawMeasurementLabel(ctx, midX, midY, formatLength(treeHeight || 0), placeholderColor);
    }

    // Draw bush wraps on photo 2 (visual decoration only)
    bushShapes.forEach((bush) => {
      if (bush.photoId === 'photo2') {
        drawBushWrap(ctx, bush.points, lineColor, false, bush.lightPositions);
      }
    });

    // Draw saved tree measurements for photo2
    treeMeasurements.forEach((treeMeasurement) => {
      const photoMatches = treeMeasurement.metadata?.photoId === 'photo2';

      if (photoMatches && treeMeasurement.metadata?.widthPoints) {
        const widthPoints = treeMeasurement.metadata.widthPoints as [Point, Point];
        if (lineColor === '#ffffff' || lineColor === '#fbbf24' || lineColor === '#redwhite') {
          drawLightString(ctx, widthPoints[0], widthPoints[1], lineColor);
        } else {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(widthPoints[0].x, widthPoints[0].y);
          ctx.lineTo(widthPoints[1].x, widthPoints[1].y);
          ctx.stroke();
        }
        const midX = (widthPoints[0].x + widthPoints[1].x) / 2;
        const midY = (widthPoints[0].y + widthPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(treeMeasurement.metadata.width || 0), lineColor);
      }

      if (photoMatches && treeMeasurement.metadata?.heightPoints) {
        const heightPoints = treeMeasurement.metadata.heightPoints as [Point, Point];
        if (lineColor === '#ffffff' || lineColor === '#fbbf24' || lineColor === '#redwhite') {
          drawLightString(ctx, heightPoints[0], heightPoints[1], lineColor);
        } else {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(heightPoints[0].x, heightPoints[0].y);
          ctx.lineTo(heightPoints[1].x, heightPoints[1].y);
          ctx.stroke();
        }
        const midX = (heightPoints[0].x + heightPoints[1].x) / 2;
        const midY = (heightPoints[0].y + heightPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(treeMeasurement.metadata.height || 0), lineColor);
      }
    });

    measurements.forEach((measurement) => {
      if (measurement.type === 'length' && measurement.points.length === 2 && measurement.metadata?.photoId === 'photo2') {
        // Always use current lineColor state for display
        const isPowerCord = measurement.metadata?.isPowerCord || lineColor === '#powercord';
        const displayColor = isPowerCord ? '#ffffff' : lineColor;

        // Power cord draws as solid white line, lights draw with bulbs
        if (!isPowerCord && (displayColor === '#ffffff' || displayColor === '#fbbf24' || displayColor === '#redwhite')) {
          drawLightString(ctx, measurement.points[0], measurement.points[1], displayColor);
        } else {
          ctx.strokeStyle = displayColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
          ctx.lineTo(measurement.points[1].x, measurement.points[1].y);
          ctx.stroke();
        }

        const midX = (measurement.points[0].x + measurement.points[1].x) / 2;
        const midY = (measurement.points[0].y + measurement.points[1].y) / 2;
        const displayValue = multiplySideBy2 ? measurement.value * 2 : measurement.value;
        drawMeasurementLabel(ctx, midX, midY, formatLength(displayValue), displayColor);
      }
    });

    if (activePhoto === 'photo2' && currentPoints.length > 0) {
      const isPowerCord = lineColor === '#powercord';
      const displayLineColor = isPowerCord ? '#ffffff' : lineColor;
      const pointColor = displayLineColor === '#fbbf24' ? '#fbbf24' : displayLineColor === '#ffffff' ? '#ffffff' : displayLineColor === '#redwhite' ? '#ef4444' : displayLineColor;
      ctx.fillStyle = pointColor;

      currentPoints.forEach((point, index) => {
        // Don't draw dots for bush tool
        if (activeTool !== 'bush') {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        if (index > 0) {
          // Bush tool: draw thin path line
          if (activeTool === 'bush') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPoints[index - 1].x, currentPoints[index - 1].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
          // Power cord draws as solid line, lights draw with bulbs
          else if (!isPowerCord && (displayLineColor === '#ffffff' || displayLineColor === '#fbbf24' || displayLineColor === '#redwhite')) {
            drawLightString(ctx, currentPoints[index - 1], point, displayLineColor);
          } else {
            ctx.strokeStyle = displayLineColor;
            ctx.lineWidth = lineThickness;
            ctx.beginPath();
            ctx.moveTo(currentPoints[index - 1].x, currentPoints[index - 1].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      });

      if (mousePosition && currentPoints.length > 0 && (activeTool || isSettingReference)) {
        // Power cord draws as solid line, lights draw with bulbs
        if (!isPowerCord && (displayLineColor === '#ffffff' || displayLineColor === '#fbbf24')) {
          drawLightString(ctx, currentPoints[currentPoints.length - 1], mousePosition, displayLineColor, true);
        } else {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = displayLineColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
          ctx.lineTo(mousePosition.x, mousePosition.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Show real-time measurement for length and tree tools (Photo 2)
        if ((activeTool === 'length' || activeTool === 'tree') && calibration && currentPoints.length === 1) {
          const pixelDistance = calculateDistance(currentPoints[0], mousePosition);
          const realDistance = calculateRealWorldDistance(pixelDistance, calibration);
          // Apply 2x multiplier if enabled for photo 2
          const displayDistance = multiplySideBy2 ? realDistance * 2 : realDistance;
          const midX = (currentPoints[0].x + mousePosition.x) / 2;
          const midY = (currentPoints[0].y + mousePosition.y) / 2;
          drawMeasurementLabel(ctx, midX, midY, formatLength(displayDistance), displayLineColor);
        }
        // Show real-time reference distance when setting calibration
        else if (isSettingReference && currentPoints.length === 1) {
          const preset = PRESET_REFERENCES.find(p => p.name === selectedReference);
          if (preset) {
            const midX = (currentPoints[0].x + mousePosition.x) / 2;
            const midY = (currentPoints[0].y + mousePosition.y) / 2;
            drawMeasurementLabel(ctx, midX, midY, formatLength(preset.value), '#fbbf24');
          }
        }
      }
    }
  };

  const drawSingleLight = (ctx: CanvasRenderingContext2D, x: number, y: number, lightColor: string, nightModeBoost: number) => {
    // Calculate bulb size based on scale calibration (for bushes/trees)
    const bulbDiameterInches = 1.125;
    const pixelsPerInch = calibration?.pixelsPerUnit || 10;
    const scaledBulbRadius = (bulbDiameterInches * pixelsPerInch * 1.0) / 2;

    const sizeVariation = 0.90 + (Math.random() * 0.10);
    const baseRadius = Math.max(2, scaledBulbRadius * sizeVariation);
    const glowMultiplier = 1 + (nightModeBoost * 0.8);

    // LAYER 1: Outer glow
    ctx.fillStyle = lightColor;
    ctx.shadowColor = lightColor;
    ctx.shadowBlur = 14 * glowMultiplier;
    ctx.globalAlpha = 0.3 + (nightModeBoost * 0.15);
    ctx.beginPath();
    ctx.arc(x, y, (baseRadius + 1.5) * (1 + nightModeBoost * 0.2), 0, 2 * Math.PI);
    ctx.fill();

    // LAYER 2: Middle glow
    ctx.shadowBlur = 10 * glowMultiplier;
    ctx.globalAlpha = 0.6 + (nightModeBoost * 0.1);
    ctx.beginPath();
    ctx.arc(x, y, (baseRadius + 0.8) * (1 + nightModeBoost * 0.15), 0, 2 * Math.PI);
    ctx.fill();

    // LAYER 3: Inner core
    ctx.shadowBlur = 5 * glowMultiplier;
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius * (1 + nightModeBoost * 0.1), 0, 2 * Math.PI);
    ctx.fill();

    // LAYER 4: Bright center highlight
    ctx.shadowBlur = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, baseRadius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
  };

  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const generateBushLightPositions = (points: Point[]): Point[] => {
    // Calculate bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    // Minimum spacing between lights (in pixels) to prevent overlap
    const minSpacing = 10;
    const minSpacingSquared = minSpacing * minSpacing;

    // Calculate area-based light count
    const area = Math.abs(calculatePolygonArea(points));
    const density = 0.003;
    const estimatedLights = Math.floor(area * density);
    const maxLights = Math.min(400, estimatedLights);

    // Use Poisson disk sampling for non-overlapping distribution
    const placedLights: Point[] = [];
    const maxAttempts = maxLights * 50;
    let attempts = 0;

    while (placedLights.length < maxLights && attempts < maxAttempts) {
      attempts++;

      // Generate random candidate position
      const candidate = {
        x: minX + Math.random() * width,
        y: minY + Math.random() * height
      };

      // Check if inside polygon
      if (!isPointInPolygon(candidate, points)) continue;

      // Check minimum distance from all existing lights
      let tooClose = false;
      for (const existing of placedLights) {
        const dx = candidate.x - existing.x;
        const dy = candidate.y - existing.y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared < minSpacingSquared) {
          tooClose = true;
          break;
        }
      }

      // If valid placement, add it
      if (!tooClose) {
        placedLights.push(candidate);
      }
    }

    return placedLights;
  };

  const drawBushWrap = (ctx: CanvasRenderingContext2D, points: Point[], color: string, isPreview: boolean = false, savedLightPositions?: Point[]) => {
    if (points.length < 3) return;

    // Calculate night mode intensity boost
    const nightModeBoost = Math.min((imageDarkness / 70) * 0.4, 0.4);

    // Use the selected line color for bush wrap lights
    const lightColor = color;

    // Draw freehand path ONLY in preview mode
    if (isPreview) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Use saved positions if provided (for existing bushes), otherwise generate new ones (for preview)
    const placedLights = savedLightPositions || generateBushLightPositions(points);

    // Determine color palette based on selected line color
    const colors = color === '#fbbf24'
      ? ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] // Multicolor
      : color === '#redwhite'
      ? ['#ffffff', '#ef4444'] // Red & White
      : [color]; // Single color (white or custom)

    // Draw all placed lights with color cycling
    placedLights.forEach((light, index) => {
      const currentColor = colors[index % colors.length];
      drawSingleLight(ctx, light.x, light.y, currentColor, nightModeBoost);
    });

    // Reset
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  };

  const drawLightString = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string, isPreview: boolean = false) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Calculate night mode intensity boost (0 = day, 1 = full night)
    // Use minimal boost to keep lights looking crisp and clean
    const nightModeBoost = Math.min((imageDarkness / 70) * 0.4, 0.4);

    // IMPORTANT: Do NOT draw wire for light strings (White, Colored, Red/White)
    // The dark wire should ONLY show the bulbs, not the connecting line
    // Wire is intentionally omitted for cleaner light display

    const lightSpacing = 30;
    const numLights = Math.floor(length / lightSpacing);

    // Enhanced color palettes with more vibrant, realistic holiday colors
    const colors = color === '#fbbf24'
      ? ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      : color === '#redwhite'
      ? ['#ffffff', '#ef4444']
      : ['#ffffff'];

    for (let i = 0; i <= numLights; i++) {
      const t = i / numLights;
      const x = p1.x + dx * t;
      const y = p1.y + dy * t;

      const lightColor = (color === '#fbbf24' || color === '#redwhite') ? colors[i % colors.length] : '#ffffff';

      // Calculate bulb size based on scale calibration
      // C9 bulbs are approximately 1.125 inches in diameter
      // We calculate pixels per inch from calibration, then scale appropriately
      const bulbDiameterInches = 1.125;
      const pixelsPerInch = calibration?.pixelsPerUnit || 10; // fallback to 10 if no calibration
      const scaledBulbRadius = (bulbDiameterInches * pixelsPerInch * 1.0) / 2;

      // Add subtle size variation for organic appearance (±10%)
      const sizeVariation = 0.90 + (Math.sin(i * 2.5) * 0.10);
      const baseRadius = Math.max(2, scaledBulbRadius * sizeVariation); // minimum 2px radius

      // Minimal glow boost - keeps lights looking clean even at max darkness
      const glowMultiplier = 1 + (nightModeBoost * 0.8);

      // LAYER 1: Outer glow (subtle, controlled)
      ctx.fillStyle = lightColor;
      ctx.shadowColor = lightColor;
      ctx.shadowBlur = 14 * glowMultiplier;
      ctx.globalAlpha = 0.3 + (nightModeBoost * 0.15);
      ctx.beginPath();
      ctx.arc(x, y, (baseRadius + 1.5) * (1 + nightModeBoost * 0.2), 0, 2 * Math.PI);
      ctx.fill();

      // LAYER 2: Middle glow (controlled brightness)
      ctx.shadowBlur = 10 * glowMultiplier;
      ctx.globalAlpha = 0.6 + (nightModeBoost * 0.1);
      ctx.beginPath();
      ctx.arc(x, y, (baseRadius + 0.8) * (1 + nightModeBoost * 0.15), 0, 2 * Math.PI);
      ctx.fill();

      // LAYER 3: Inner core (the actual light bulb)
      ctx.shadowBlur = 5 * glowMultiplier;
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius * (1 + nightModeBoost * 0.1), 0, 2 * Math.PI);
      ctx.fill();

      // LAYER 4: Bright center highlight (simulates bulb glass reflection)
      ctx.shadowBlur = 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, baseRadius * 0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow and alpha for next bulb
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }
  };

  const drawMeasurementLabel = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string = '#1e40af') => {
    if (!showMeasurementAmounts) return;

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.27;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    lines.forEach((line, index) => {
      const offsetY = (index - (lines.length - 1) / 2) * lineHeight;
      ctx.strokeText(line, x, y + offsetY);
      ctx.fillText(line, x, y + offsetY);
    });
  };

  const calculateCentroid = (points: Point[]): Point => {
    const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  };

  const formatLength = (inches: number): string => {
    return units === 'imperial' ? convertToFeetInches(inches) : convertToMeters(inches);
  };

  const formatArea = (squareInches: number): string => {
    return units === 'imperial' ? convertToSquareFeet(squareInches) : convertToSquareMeters(squareInches);
  };

  const calculateTotal = (): number => {
    return measurements
      .filter(m => m.type === 'length')
      .reduce((sum, m) => sum + m.value, 0);
  };

  const calculateTreeTotal = (): number => {
    const treeMeasurementsTotal = treeMeasurements.reduce((sum, m) => sum + m.value, 0);
    const bushTotal = bushShapes.reduce((sum, bush) => sum + bush.estimatedFeet, 0);
    return treeMeasurementsTotal + bushTotal;
  };

  const calculateHouseTotal = (): number => {
    const lengthTotal = measurements
      .filter(m => m.type === 'length' && !m.metadata?.isPowerCord)
      .reduce((sum, m) => {
        const value = m.metadata?.photoId === 'photo2' && multiplySideBy2 ? m.value * 2 : m.value;
        return sum + value;
      }, 0);
    const areaTotal = measurements
      .filter(m => m.type === 'area')
      .reduce((sum, m) => {
        const perimeter = m.metadata?.photoId === 'photo2' && multiplySideBy2 ? (m.perimeter || 0) * 2 : (m.perimeter || 0);
        return sum + perimeter;
      }, 0);
    return lengthTotal + areaTotal;
  };

  const calculatePowerCordTotal = (): number => {
    const measuredTotal = measurements
      .filter(m => m.type === 'length' && m.metadata?.isPowerCord)
      .reduce((sum, m) => {
        const value = m.metadata?.photoId === 'photo2' && multiplySideBy2 ? m.value * 2 : m.value;
        return sum + value;
      }, 0);

    // Add manual power cord inputs (convert feet to inches)
    const manualTotal = getManualPowerCordValue();
    return measuredTotal + manualTotal;
  };

  const getManualInputValue = (): number => {
    // Convert feet to inches (multiply by 12)
    const value1 = parseFloat(manualInputPhoto1);
    const value2 = parseFloat(manualInputPhoto2);
    const total1 = isNaN(value1) || value1 <= 0 ? 0 : value1 * 12;
    const total2 = isNaN(value2) || value2 <= 0 ? 0 : value2 * 12;
    return total1 + total2;
  };

  const getManualInputPhoto1Value = (): number => {
    const value = parseFloat(manualInputPhoto1);
    return isNaN(value) || value <= 0 ? 0 : value * 12; // Convert feet to inches
  };

  const getManualInputPhoto2Value = (): number => {
    const value = parseFloat(manualInputPhoto2);
    return isNaN(value) || value <= 0 ? 0 : value * 12; // Convert feet to inches
  };

  const getManualPowerCordValue = (): number => {
    // Convert feet to inches (multiply by 12)
    const value1 = parseFloat(manualPowerCordPhoto1);
    const value2 = parseFloat(manualPowerCordPhoto2);
    const total1 = isNaN(value1) || value1 <= 0 ? 0 : value1 * 12;
    const total2 = isNaN(value2) || value2 <= 0 ? 0 : value2 * 12;
    return total1 + total2;
  };

  const getManualPowerCordPhoto1Value = (): number => {
    const value = parseFloat(manualPowerCordPhoto1);
    return isNaN(value) || value <= 0 ? 0 : value * 12; // Convert feet to inches
  };

  const getManualPowerCordPhoto2Value = (): number => {
    const value = parseFloat(manualPowerCordPhoto2);
    return isNaN(value) || value <= 0 ? 0 : value * 12; // Convert feet to inches
  };

  const calculateGrandTotal = (): number => {
    return calculateTreeTotal() + calculateHouseTotal() + getManualInputValue();
  };

  const handleAddTreeMeasurement = () => {
    if (!treeWidth || !treeHeight) {
      alert('Please measure both tree width and height.');
      return;
    }

    const spacing = parseFloat(wrapSpacing);
    if (!spacing || spacing <= 0) {
      alert('Please enter a valid spacing value.');
      return;
    }

    // Tree wrap formula: Circumference × (Height ÷ Spacing) = Total Light Length
    const circumference = Math.PI * treeWidth; // in inches
    const wraps = treeHeight / spacing;
    const totalLength = circumference * wraps; // in inches

    const newTreeMeasurement: Measurement = {
      id: Date.now().toString(),
      type: 'tree' as any,
      points: [],
      value: totalLength,
      metadata: {
        width: treeWidth,
        height: treeHeight,
        spacing,
        circumference,
        wraps,
        widthPoints: treeWidthPoints,
        heightPoints: treeHeightPoints,
        photoId: activePhoto  // Fix: Track which photo this tree was measured on
      }
    };

    setTreeMeasurements([...treeMeasurements, newTreeMeasurement]);
    setTreeWidth(null);
    setTreeHeight(null);
    setTreeWidthPoints(null);
    setTreeHeightPoints(null);
    setWrapSpacing('24');
    setTreeMeasurementStep(null);
    setCurrentPoints([]);
    setActiveTool(null);
    saveToHistory();
  };

  const handleResetTrees = () => {
    if (confirm('Are you sure you want to reset all tree measurements?')) {
      setTreeMeasurements([]);
      setTreeWidth(null);
      setTreeHeight(null);
      setTreeWidthPoints(null);
      setTreeHeightPoints(null);
      setTreeMeasurementStep(null);
      setWrapSpacing('24');
      setCurrentPoints([]);
      if (activeTool === 'tree') {
        setActiveTool(null);
      }
      saveToHistory();
    }
  };

  const handleReferenceSelect = (preset: { name: string; value: number }) => {
    setSelectedReference(preset.name);
    setShowReferenceDropdown(false);
    setIsSettingReference(true);
    setCurrentPoints([]);
    setActiveTool(null);
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = activePhoto === 'photo1' ? canvasRef.current : canvas2Ref.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0].clientX;
      clientY = e.touches[0]?.clientY || e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    // Freehand drawing for bush tool
    if (activeTool === 'bush' && isDrawing && currentPoints.length > 0) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only add point if moved enough (smooth the path)
      if (distance > 3) {
        setCurrentPoints([...currentPoints, point]);
      }
      setMousePosition(point);
    } else if (currentPoints.length > 0 && (activeTool || isSettingReference)) {
      setMousePosition(point);
    }
  };

  const handleCanvasMouseLeave = () => {
    setMousePosition(null);
  };

  const handleCanvasMouseUp = () => {
    // Auto-finish bush drawing when mouse is released
    if (activeTool === 'bush' && isDrawing && currentPoints.length >= 10) {
      finishBush();
    }
    setIsDrawing(false);
  };

  const isPointNearLine = (point: Point, lineStart: Point, lineEnd: Point, threshold: number = 20): boolean => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < threshold;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasPoint(e);

    // Close mobile menu when clicking on canvas
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }

    // Check if clicking on an existing measurement to remove it (only when no tool is active)
    if (!activeTool && !isSettingReference && calibration) {
      // Check house measurements
      for (let i = 0; i < measurements.length; i++) {
        const m = measurements[i];
        if (m.type === 'length' && m.points.length === 2) {
          const photoMatches = !m.metadata?.photoId || m.metadata?.photoId === activePhoto;
          if (photoMatches && isPointNearLine(point, m.points[0], m.points[1])) {
            if (confirm(`Remove this measurement line (${formatLength(m.value)})?`)) {
              const newMeasurements = measurements.filter((_, index) => index !== i);
              setMeasurements(newMeasurements);
              saveToHistory();
            }
            return;
          }
        }
      }

      // Check tree measurements
      for (let i = 0; i < treeMeasurements.length; i++) {
        const m = treeMeasurements[i];
        if (m.metadata?.widthPoints) {
          const widthPoints = m.metadata.widthPoints as [Point, Point];
          if (isPointNearLine(point, widthPoints[0], widthPoints[1])) {
            if (confirm(`Remove this tree measurement (${formatLength(m.value)})?`)) {
              const newTreeMeasurements = treeMeasurements.filter((_, index) => index !== i);
              setTreeMeasurements(newTreeMeasurements);
              saveToHistory();
            }
            return;
          }
        }
        if (m.metadata?.heightPoints) {
          const heightPoints = m.metadata.heightPoints as [Point, Point];
          if (isPointNearLine(point, heightPoints[0], heightPoints[1])) {
            if (confirm(`Remove this tree measurement (${formatLength(m.value)})?`)) {
              const newTreeMeasurements = treeMeasurements.filter((_, index) => index !== i);
              setTreeMeasurements(newTreeMeasurements);
              saveToHistory();
            }
            return;
          }
        }
      }
    }

    if (isSettingReference) {
      const newPoints = [...currentPoints, point];
      setCurrentPoints(newPoints);

      if (newPoints.length === 2) {
        const preset = PRESET_REFERENCES.find(p => p.name === selectedReference);
        if (!preset) return;

        const pixelDistance = calculateDistance(newPoints[0], newPoints[1]);
        const pixelsPerUnit = pixelDistance / preset.value;

        setCalibration({
          pixelDistance,
          realWorldDistance: preset.value,
          pixelsPerUnit,
          referencePoints: [newPoints[0], newPoints[1]]
        });

        setCurrentPoints([]);
        setIsSettingReference(false);
        saveToHistory();
      }
      return;
    }

    if (!activeTool) return;

    if (!calibration) {
      alert('Please set a reference first by selecting a reference option.');
      return;
    }

    if (activeTool === 'length') {
      const newPoints = [...currentPoints, point];
      setCurrentPoints(newPoints);

      if (newPoints.length === 2) {
        const pixelDistance = calculateDistance(newPoints[0], newPoints[1]);
        const realDistance = calculateRealWorldDistance(pixelDistance, calibration!);

        const newMeasurements = [
          ...measurements,
          {
            id: Date.now().toString(),
            type: 'length',
            points: newPoints,
            value: realDistance,
            metadata: {
              photoId: activePhoto,
              lineColor: lineColor,
              isPowerCord: lineColor === '#powercord'
            }
          }
        ];
        setMeasurements(newMeasurements);
        setCurrentPoints([]);
        saveToHistory();
      }
    } else if (activeTool === 'tree') {
      const newPoints = [...currentPoints, point];
      setCurrentPoints(newPoints);

      if (newPoints.length === 2) {
        const pixelDistance = calculateDistance(newPoints[0], newPoints[1]);
        const realDistance = calculateRealWorldDistance(pixelDistance, calibration!);

        if (treeMeasurementStep === 'width') {
          setTreeWidth(realDistance);
          setTreeWidthPoints([newPoints[0], newPoints[1]]);
          setTreeMeasurementStep('height');
          setCurrentPoints([]);
        } else if (treeMeasurementStep === 'height') {
          setTreeHeight(realDistance);
          setTreeHeightPoints([newPoints[0], newPoints[1]]);
          setTreeMeasurementStep(null);
          setCurrentPoints([]);
        }
      }
    } else if (activeTool === 'bush') {
      // Bush tool: freehand drawing mode
      setCurrentPoints([point]);
      setIsDrawing(true);
    } else if (activeTool === 'area') {
      setCurrentPoints([...currentPoints, point]);
    }
  };

  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setMousePosition(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      const distance = getTouchDistance(e.touches);

      if (lastTouchDistance && lastTouchDistance > 0) {
        const delta = distance - lastTouchDistance;
        const zoomFactor = 1 + (delta * 0.005);
        const newZoom = Math.max(0.5, Math.min(5, zoom * zoomFactor));
        setZoom(newZoom);
      }

      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      handleCanvasMouseMove(e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
    }

    if (e.touches.length === 0 && e.changedTouches.length === 1 && lastTouchDistance === null) {
      handleCanvasClick(e);
    }
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) {
      alert('Please add at least 3 points to create a polygon.');
      return;
    }

    const pixelArea = calculatePolygonArea(currentPoints);
    const pixelPerimeter = calculatePolygonPerimeter(currentPoints);

    const scaleFactor = calibration!.pixelsPerUnit;
    const realArea = pixelArea / (scaleFactor * scaleFactor);
    const realPerimeter = pixelPerimeter / scaleFactor;

    const newMeasurements = [
      ...measurements,
      {
        id: Date.now().toString(),
        type: 'area',
        points: currentPoints,
        value: realArea,
        perimeter: realPerimeter,
        metadata: { photoId: activePhoto }
      }
    ];
    setMeasurements(newMeasurements);
    setCurrentPoints([]);
    setActiveTool(null);
    saveToHistory();
  };

  const finishBush = () => {
    if (currentPoints.length < 10) {
      alert('Please draw a longer path around the bush.');
      return;
    }

    // Bush wrap is VISUAL ONLY - no footage calculation
    // Generate light positions once and save them so they don't move when night mode changes
    const lightPositions = generateBushLightPositions(currentPoints);

    const newBush = {
      points: currentPoints,
      photoId: activePhoto,
      estimatedFeet: 0, // Visual decoration only
      lightPositions: lightPositions
    };

    setBushShapes([...bushShapes, newBush]);
    setCurrentPoints([]);
    setActiveTool(null);
    setIsDrawing(false);
    saveToHistory();
  };

  /**
   * Helper function to draw canvas without reference line for export
   */
  const drawCanvasForExport = (sourceImage: HTMLImageElement, measurements: Measurement[], treeMeasurements: Measurement[], color: string, photoId: 'photo1' | 'photo2' = 'photo1') => {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    tempCanvas.width = sourceImage.width;
    tempCanvas.height = sourceImage.height;

    ctx.drawImage(sourceImage, 0, 0);

    // Apply darkness overlay for night effect in exported images
    if (imageDarkness > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${imageDarkness / 100})`;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Draw bush wraps - filter by photoId
    bushShapes.forEach((bush) => {
      if (bush.photoId === photoId) {
        drawBushWrap(ctx, bush.points, color, false, bush.lightPositions);
      }
    });

    // Draw measurements only (no reference line) - filter by photoId
    measurements.forEach((measurement) => {
      const photoMatches = !measurement.metadata?.photoId || measurement.metadata?.photoId === photoId;
      if (photoMatches && measurement.type === 'length' && measurement.points.length === 2) {
        const isPowerCord = measurement.metadata?.isPowerCord || false;
        const measurementColor = isPowerCord ? '#ffffff' : color;

        // Power cord draws as solid white line, lights draw with bulbs
        if (!isPowerCord && (measurementColor === '#ffffff' || measurementColor === '#fbbf24' || measurementColor === '#redwhite')) {
          drawLightString(ctx, measurement.points[0], measurement.points[1], measurementColor);
        } else {
          ctx.strokeStyle = measurementColor;
          ctx.lineWidth = lineThickness;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
          ctx.lineTo(measurement.points[1].x, measurement.points[1].y);
          ctx.stroke();
        }

        const midX = (measurement.points[0].x + measurement.points[1].x) / 2;
        const midY = (measurement.points[0].y + measurement.points[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(measurement.value), measurementColor);
      }
    });

    // Draw tree measurements - filter by photoId
    treeMeasurements.forEach((tree) => {
      const photoMatches = tree.metadata?.photoId === photoId;

      // Draw width measurements with selected line color
      if (photoMatches && tree.metadata?.widthPoints) {
        const widthPoints = tree.metadata.widthPoints as [Point, Point];
        if (color === '#ffffff' || color === '#fbbf24') {
          drawLightString(ctx, widthPoints[0], widthPoints[1], color);
        } else {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineThickness;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(widthPoints[0].x, widthPoints[0].y);
          ctx.lineTo(widthPoints[1].x, widthPoints[1].y);
          ctx.stroke();
        }
        const midX = (widthPoints[0].x + widthPoints[1].x) / 2;
        const midY = (widthPoints[0].y + widthPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(tree.metadata.width || 0), color);
      }

      // Draw height measurements with selected line color
      if (photoMatches && tree.metadata?.heightPoints) {
        const heightPoints = tree.metadata.heightPoints as [Point, Point];
        if (color === '#ffffff' || color === '#fbbf24') {
          drawLightString(ctx, heightPoints[0], heightPoints[1], color);
        } else {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineThickness;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(heightPoints[0].x, heightPoints[0].y);
          ctx.lineTo(heightPoints[1].x, heightPoints[1].y);
          ctx.stroke();
        }
        const midX = (heightPoints[0].x + heightPoints[1].x) / 2;
        const midY = (heightPoints[0].y + heightPoints[1].y) / 2;
        drawMeasurementLabel(ctx, midX, midY, formatLength(tree.metadata.height || 0), color);
      }
    });

    return tempCanvas;
  };

  /**
   * VALIDATION SYSTEM
   * Comprehensive field validation for Download, Email, and Save functions
   */

  interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
    errorMessage: string;
  }

  const validateDownloadRequirements = (): ValidationResult => {
    const missing: string[] = [];

    // Check if at least one photo is uploaded
    if (!image && !image2) {
      missing.push('Property Photos');
    }

    // Check if at least one photo checkbox is selected
    if (!includePhoto1 && !includePhoto2) {
      missing.push('Photo Selection (check at least one photo)');
    }

    // Check if selected photos are actually loaded
    if (includePhoto1 && !image) {
      missing.push('Photo 1 Upload (Photo 1 is selected but not loaded)');
    }
    if (includePhoto2 && !image2) {
      missing.push('Photo 2 Upload (Photo 2 is selected but not loaded)');
    }

    // Check if calibration is set (required for accurate measurements)
    if (!calibration) {
      missing.push('Scale Calibration (set a reference measurement)');
    }

    // Check if there are any measurements
    if (measurements.length === 0 && treeMeasurements.length === 0 && getManualInputValue() === 0) {
      missing.push('Measurements (create at least one measurement)');
    }

    // Check client information
    if (!clientName || clientName.trim() === '') {
      missing.push('Client Name');
    }

    if (!clientAddress || clientAddress.trim() === '') {
      missing.push('Client Address');
    }

    const isValid = missing.length === 0;
    const errorMessage = isValid
      ? ''
      : `Unable to Download: Missing the following required information:\n\n${missing.map((field, i) => `${i + 1}. ${field}`).join('\n')}\n\nPlease complete all required fields before downloading.`;

    return { isValid, missingFields: missing, errorMessage };
  };

  const validateEmailRequirements = (): ValidationResult => {
    const missing: string[] = [];

    // Check if at least one photo is uploaded
    if (!image && !image2) {
      missing.push('Property Photos');
    }

    // Check if at least one photo checkbox is selected
    if (!includePhoto1 && !includePhoto2) {
      missing.push('Photo Selection (check at least one photo)');
    }

    // Check if selected photos are actually loaded
    if (includePhoto1 && !image) {
      missing.push('Photo 1 Upload (Photo 1 is selected but not loaded)');
    }
    if (includePhoto2 && !image2) {
      missing.push('Photo 2 Upload (Photo 2 is selected but not loaded)');
    }

    // Check if calibration is set
    if (!calibration) {
      missing.push('Scale Calibration (set a reference measurement)');
    }

    // Check if there are any measurements
    if (measurements.length === 0 && treeMeasurements.length === 0 && getManualInputValue() === 0) {
      missing.push('Measurements (create at least one measurement)');
    }

    // Check client information (required for email)
    if (!clientName || clientName.trim() === '') {
      missing.push('Client Name');
    }

    if (!clientAddress || clientAddress.trim() === '') {
      missing.push('Client Address');
    }

    if (!clientEmail || clientEmail.trim() === '') {
      missing.push('Client Email Address');
    }

    const isValid = missing.length === 0;
    const errorMessage = isValid
      ? ''
      : `Unable to Email Design: Missing the following required information:\n\n${missing.map((field, i) => `${i + 1}. ${field}`).join('\n')}\n\nPlease complete all required fields before emailing.`;

    return { isValid, missingFields: missing, errorMessage };
  };

  const validateSaveRequirements = (): ValidationResult => {
    const missing: string[] = [];

    // Check if a client is selected from the dropdown
    if (!selectedQuoteId) {
      missing.push('Client Selection (select a client from the dropdown)');
    }

    // Check if at least one photo is uploaded
    if (!image && !image2) {
      missing.push('Property Photos');
    }

    // Check if calibration is set
    if (!calibration) {
      missing.push('Scale Calibration (set a reference measurement)');
    }

    // Check if there are any measurements
    if (measurements.length === 0 && treeMeasurements.length === 0) {
      missing.push('Measurements (create at least one measurement)');
    }

    const isValid = missing.length === 0;
    const errorMessage = isValid
      ? ''
      : `Unable to Save Design: Missing the following required information:\n\n${missing.map((field, i) => `${i + 1}. ${field}`).join('\n')}\n\nPlease complete all required fields before saving.`;

    return { isValid, missingFields: missing, errorMessage };
  };

  // Helper functions to check if buttons should be disabled
  const isDownloadDisabled = (): boolean => {
    return !image && !image2; // Basic check - at least one photo needed
  };

  const isEmailDisabled = (): boolean => {
    return !image && !image2; // Basic check - at least one photo needed
  };

  const isSaveDisabled = (): boolean => {
    return !selectedQuoteId || (!image && !image2); // Basic check
  };

  /**
   * Download Design Function with Comprehensive Validation
   * Only includes images with checked checkboxes in the download
   */
  const handleExport = () => {
    // Run comprehensive validation
    const validation = validateDownloadRequirements();

    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    const canvas = canvasRef.current;
    const canvas2 = canvas2Ref.current;

    // Create export versions without reference line
    const exportCanvas1 = image && includePhoto1 ? drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1') : null;
    const exportCanvas2 = image2 && includePhoto2 ? drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2') : null;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const headerHeight = 200;
    const footerHeight = 300;
    const padding = 30;
    const logoHeight = 120;
    const photoLabelHeight = 60;
    const photoSpacing = 40;

    // Calculate dimensions based on which photos are included
    // Ensure minimum width of 1600px for header/footer content to render properly
    const minCanvasWidth = 1600;
    let maxWidth = minCanvasWidth;
    if (includePhoto1 && exportCanvas1) maxWidth = Math.max(maxWidth, exportCanvas1.width);
    if (includePhoto2 && exportCanvas2) maxWidth = Math.max(maxWidth, exportCanvas2.width);

    let totalHeight = headerHeight + footerHeight;

    if (includePhoto1 && exportCanvas1) {
      totalHeight += exportCanvas1.height + photoLabelHeight;
    }

    if (includePhoto2 && exportCanvas2 && image2) {
      totalHeight += exportCanvas2.height + photoLabelHeight + photoSpacing;
    }

    exportCanvas.width = maxWidth;
    exportCanvas.height = totalHeight;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // LEFT SIDE: Logo and Company Name
      ctx.drawImage(logo, padding, padding, logoHeight * 1.5, logoHeight);

      // "Holiday Lighting Design" text next to logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Holiday Lighting Design', padding + logoHeight * 1.5 + 20, padding + 60);

      // RIGHT SIDE: Client Information
      let clientY = padding + 20;

      if (clientName || clientAddress || clientPhone || clientEmail) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('CLIENT INFORMATION', exportCanvas.width - padding, clientY);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        clientY += 30;

        if (clientName) {
          ctx.fillText(clientName, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientAddress) {
          ctx.fillText(clientAddress, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientCity || clientZip) {
          ctx.fillText(`${clientCity}${clientCity && clientZip ? ', ' : ''}${clientZip}`, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientPhone) {
          ctx.fillText(clientPhone, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientEmail) {
          ctx.fillText(clientEmail, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
      }

      // Project Narrative will be drawn in footer section

      let currentPhotoY = headerHeight;

      // Only draw Photo 1 if checkbox is checked (without reference line)
      if (includePhoto1 && exportCanvas1) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`📷 Photo 1: ${photo1Name}`, padding, currentPhotoY + 30);
        currentPhotoY += photoLabelHeight;

        // Center image horizontally if it's smaller than canvas width
        const photo1X = (exportCanvas.width - exportCanvas1.width) / 2;
        ctx.drawImage(exportCanvas1, photo1X, currentPhotoY);
        currentPhotoY += exportCanvas1.height;
      }

      // Only draw Photo 2 if checkbox is checked (without reference line)
      if (includePhoto2 && exportCanvas2 && image2) {
        currentPhotoY += photoSpacing;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`📷 Photo 2: ${photo2Name}`, padding, currentPhotoY + 30);
        currentPhotoY += photoLabelHeight;

        // Center image horizontally if it's smaller than canvas width
        const photo2X = (exportCanvas.width - exportCanvas2.width) / 2;
        ctx.drawImage(exportCanvas2, photo2X, currentPhotoY);
        currentPhotoY += exportCanvas2.height;
      }

      const footerY = currentPhotoY + 20;

      ctx.fillStyle = '#374151';
      ctx.fillRect(0, currentPhotoY, exportCanvas.width, footerHeight);

      // Project Notes on the LEFT side
      if (projectNarrative) {
        const narrativeY = footerY + 20;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('PROJECT NOTES:', padding, narrativeY);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#d1d5db';
        const maxNarrativeWidth = (exportCanvas.width / 2) - (padding * 2);
        const words = projectNarrative.split(' ');
        let line = '';
        let narrativeLineY = narrativeY + 25;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxNarrativeWidth && n > 0) {
            ctx.fillText(line, padding, narrativeLineY);
            line = words[n] + ' ';
            narrativeLineY += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, narrativeLineY);
      }

      // Measurement Summary on the RIGHT side
      const totalBoxWidth = 500;
      const totalBoxX = exportCanvas.width - totalBoxWidth - padding - 20;
      let currentY = footerY + 20;

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MEASUREMENT SUMMARY', totalBoxX + (totalBoxWidth / 2) + 20, currentY);
      currentY += 20;

      ctx.fillStyle = '#1f2937';
      ctx.fillRect(totalBoxX - 20, currentY, totalBoxWidth + 40, 230);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(totalBoxX - 20, currentY, totalBoxWidth + 40, 230);

      currentY += 30;

      const manualInputValue = getManualInputValue();
      const houseTotalFeet = (houseTotal + manualInputValue) * 1.1;
      const treeTotalFeet = treeTotal * 1.1;
      const powerCordTotalFeet = powerCordTotal * 1.1;
      const grandTotalFeet = grandTotalPlus10;
      const houseQuote = (houseTotalFeet / 12) * perFootCostHouse;
      const treeQuote = (treeTotalFeet / 12) * perFootCostTree;
      const powerCordQuote = (powerCordTotalFeet / 12) * perFootCostPowerCord;
      const subtotalQuote = houseQuote + treeQuote + powerCordQuote;
      const discountAmount = subtotalQuote * (discount / 100);
      const totalQuote = subtotalQuote - discountAmount;

      ctx.textAlign = 'left';
      ctx.font = '18px Arial';
      ctx.fillStyle = '#9ca3af';

      if (houseTotal > 0 || manualInputValue > 0) {
        ctx.fillText('House/Property Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(houseTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      if (treeTotal > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Tree Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(treeTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      if (powerCordTotal > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Power Cord Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(powerCordTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(totalBoxX, currentY - 10);
      ctx.lineTo(totalBoxX + totalBoxWidth, currentY - 10);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText('Grand Total (+10%):', totalBoxX, currentY + 10);
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.fillText(formatLength(grandTotalFeet), totalBoxX + totalBoxWidth, currentY + 10);
      currentY += 40;
      ctx.textAlign = 'left';

      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(totalBoxX, currentY - 10);
      ctx.lineTo(totalBoxX + totalBoxWidth, currentY - 10);
      ctx.stroke();

      if (discount > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Subtotal:', totalBoxX, currentY + 10);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(`$${subtotalQuote.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY + 10);
        currentY += 30;
        ctx.textAlign = 'left';

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Discount (${discount}%):`, totalBoxX, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(`-$${discountAmount.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY);
        currentY += 40;
        ctx.textAlign = 'left';
      }

      ctx.fillStyle = '#fbbf24';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ESTIMATED INVESTMENT AMOUNT:', totalBoxX, currentY + 10);

      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`$${totalQuote.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY + 10);

      const link = document.createElement('a');
      link.download = `${clientName ? clientName.replace(/\s+/g, '-') : 'quickmeasure'}-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL();
      link.click();
    };

    logo.onerror = () => {
      // LEFT SIDE: Fallback text if logo fails to load
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Holiday Lighting Design', padding, padding + 60);

      // RIGHT SIDE: Client Information
      let clientY = padding + 20;

      if (clientName || clientAddress || clientPhone || clientEmail) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('CLIENT INFORMATION', exportCanvas.width - padding, clientY);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        clientY += 30;

        if (clientName) {
          ctx.fillText(clientName, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientAddress) {
          ctx.fillText(clientAddress, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientCity || clientZip) {
          ctx.fillText(`${clientCity}${clientCity && clientZip ? ', ' : ''}${clientZip}`, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientPhone) {
          ctx.fillText(clientPhone, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
        if (clientEmail) {
          ctx.fillText(clientEmail, exportCanvas.width - padding, clientY);
          clientY += 25;
        }
      }

      // Project Narrative will be drawn in footer section

      let currentPhotoY = headerHeight;

      // Only draw Photo 1 if checkbox is checked (without reference line)
      if (includePhoto1 && exportCanvas1) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`📷 Photo 1: ${photo1Name}`, padding, currentPhotoY + 30);
        currentPhotoY += photoLabelHeight;

        // Center image horizontally if it's smaller than canvas width
        const photo1X = (exportCanvas.width - exportCanvas1.width) / 2;
        ctx.drawImage(exportCanvas1, photo1X, currentPhotoY);
        currentPhotoY += exportCanvas1.height;
      }

      // Only draw Photo 2 if checkbox is checked (without reference line)
      if (includePhoto2 && exportCanvas2 && image2) {
        currentPhotoY += photoSpacing;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`📷 Photo 2: ${photo2Name}`, padding, currentPhotoY + 30);
        currentPhotoY += photoLabelHeight;

        // Center image horizontally if it's smaller than canvas width
        const photo2X = (exportCanvas.width - exportCanvas2.width) / 2;
        ctx.drawImage(exportCanvas2, photo2X, currentPhotoY);
        currentPhotoY += exportCanvas2.height;
      }

      const footerY = currentPhotoY + 20;

      ctx.fillStyle = '#374151';
      ctx.fillRect(0, currentPhotoY, exportCanvas.width, footerHeight);

      // Project Notes on the LEFT side
      if (projectNarrative) {
        const narrativeY = footerY + 20;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('PROJECT NOTES:', padding, narrativeY);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#d1d5db';
        const maxNarrativeWidth = (exportCanvas.width / 2) - (padding * 2);
        const words = projectNarrative.split(' ');
        let line = '';
        let narrativeLineY = narrativeY + 25;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxNarrativeWidth && n > 0) {
            ctx.fillText(line, padding, narrativeLineY);
            line = words[n] + ' ';
            narrativeLineY += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, narrativeLineY);
      }

      // Measurement Summary on the RIGHT side
      const totalBoxWidth = 500;
      const totalBoxX = exportCanvas.width - totalBoxWidth - padding - 20;
      let currentY = footerY + 20;

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MEASUREMENT SUMMARY', totalBoxX + (totalBoxWidth / 2) + 20, currentY);
      currentY += 20;

      ctx.fillStyle = '#1f2937';
      ctx.fillRect(totalBoxX - 20, currentY, totalBoxWidth + 40, 230);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(totalBoxX - 20, currentY, totalBoxWidth + 40, 230);

      currentY += 30;

      const manualInputValue = getManualInputValue();
      const houseTotalFeet = (houseTotal + manualInputValue) * 1.1;
      const treeTotalFeet = treeTotal * 1.1;
      const powerCordTotalFeet = powerCordTotal * 1.1;
      const grandTotalFeet = grandTotalPlus10;
      const houseQuote = (houseTotalFeet / 12) * perFootCostHouse;
      const treeQuote = (treeTotalFeet / 12) * perFootCostTree;
      const powerCordQuote = (powerCordTotalFeet / 12) * perFootCostPowerCord;
      const subtotalQuote = houseQuote + treeQuote + powerCordQuote;
      const discountAmount = subtotalQuote * (discount / 100);
      const totalQuote = subtotalQuote - discountAmount;

      ctx.textAlign = 'left';
      ctx.font = '18px Arial';
      ctx.fillStyle = '#9ca3af';

      if (houseTotal > 0 || manualInputValue > 0) {
        ctx.fillText('House/Property Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(houseTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      if (treeTotal > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Tree Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(treeTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      if (powerCordTotal > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Power Cord Total:', totalBoxX, currentY);
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(formatLength(powerCordTotalFeet), totalBoxX + totalBoxWidth, currentY);
        currentY += 30;
        ctx.textAlign = 'left';
      }

      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(totalBoxX, currentY - 10);
      ctx.lineTo(totalBoxX + totalBoxWidth, currentY - 10);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText('Grand Total (+10%):', totalBoxX, currentY + 10);
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.fillText(formatLength(grandTotalFeet), totalBoxX + totalBoxWidth, currentY + 10);
      currentY += 40;
      ctx.textAlign = 'left';

      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(totalBoxX, currentY - 10);
      ctx.lineTo(totalBoxX + totalBoxWidth, currentY - 10);
      ctx.stroke();

      if (discount > 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Subtotal:', totalBoxX, currentY + 10);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(`$${subtotalQuote.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY + 10);
        currentY += 30;
        ctx.textAlign = 'left';

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Discount (${discount}%):`, totalBoxX, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(`-$${discountAmount.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY);
        currentY += 40;
        ctx.textAlign = 'left';
      }

      ctx.fillStyle = '#fbbf24';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ESTIMATED INVESTMENT AMOUNT:', totalBoxX, currentY + 10);

      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`$${totalQuote.toFixed(2)}`, totalBoxX + totalBoxWidth, currentY + 10);

      const link = document.createElement('a');
      link.download = `${clientName ? clientName.replace(/\s+/g, '-') : 'quickmeasure'}-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL();
      link.click();
    };

    logo.src = '/logos/holidaylogo.png';
  };

  /**
   * Email Design Function with Comprehensive Validation
   * Only includes images with checked checkboxes in the email
   */
  const handleEmailDesign = async () => {
    // Run comprehensive validation
    const validation = validateEmailRequirements();

    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    const canvas = canvasRef.current;
    const canvas2 = canvas2Ref.current;

    setIsSendingEmail(true);

    try {
      const clientInfoText = [
        clientName && `Name: ${clientName}`,
        clientBusinessName && `Business: ${clientBusinessName}`,
        clientAddress && `Address: ${clientAddress}`,
        (clientCity || clientZip) && `Location: ${clientCity}${clientCity && clientZip ? ', ' : ''}${clientZip}`,
        clientPhone && `Phone: ${clientPhone}`,
        clientEmail && `Email: ${clientEmail}`,
        salesRep && `Sales Rep: ${salesRep}`,
        projectNarrative && `\nProject Notes:\n${projectNarrative}`
      ].filter(Boolean).join('\n');

      // Calculate pricing details FIRST (before using in measurementsText)
      const emailHouseTotal = calculateHouseTotal();
      const emailTreeTotal = calculateTreeTotal();
      const emailPowerCordTotal = calculatePowerCordTotal();
      const emailManualInput = getManualInputValue();
      const emailGrandTotal = emailHouseTotal + emailTreeTotal + emailManualInput;
      const emailGrandTotalPlus10 = emailGrandTotal * 1.1;

      const measurementsText = [
        ...measurements.map((m, i) =>
          m.type === 'length'
            ? `${i + 1}. Length: ${formatLength(m.value)}`
            : `${i + 1}. Area: ${formatArea(m.value)} (Perimeter: ${formatLength(m.perimeter || 0)})`
        ),
        ...treeMeasurements.map((m, i) =>
          `${measurements.length + i + 1}. Tree: ${formatLength(m.value)} (Spacing: ${m.metadata?.spacing}")`
        ),
        ...(emailManualInput > 0 ? [`${measurements.length + treeMeasurements.length + 1}. Manual Input: ${formatLength(emailManualInput)}`] : [])
      ].join('\n');

      const { supabase } = await import('../lib/supabase');

      // Upload Photo 1 (Front View) only if checkbox is checked (WITHOUT reference line)
      let publicUrl = null;
      if (includePhoto1 && image) {
        const exportCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        if (exportCanvas1) {
          const imageData = exportCanvas1.toDataURL('image/png');
          const blob = await (await fetch(imageData)).blob();
          const fileName = `measurement-photo1-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName, blob, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error(`Failed to upload Photo 1: ${uploadError.message || JSON.stringify(uploadError)}`);
          }

          const { data: { publicUrl: url1 } } = supabase.storage
            .from('measurement-designs')
            .getPublicUrl(uploadData.path);
          publicUrl = url1;
        }
      }

      // Upload Photo 2 (Side View) only if checkbox is checked (WITHOUT reference line)
      let publicUrl2 = null;
      if (includePhoto2 && image2) {
        const exportCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        if (exportCanvas2) {
          const imageData2 = exportCanvas2.toDataURL('image/png');
          const blob2 = await (await fetch(imageData2)).blob();
          const fileName2 = `measurement-photo2-${Date.now()}.png`;

          const { data: uploadData2, error: uploadError2 } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName2, blob2, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError2) {
            console.error('Photo 2 upload error:', uploadError2);
            throw new Error(`Failed to upload Photo 2: ${uploadError2.message}`);
          }

          if (uploadData2) {
            const { data: { publicUrl: url2 } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData2.path);
            publicUrl2 = url2;
          }
        }
      }

      // Calculate remaining pricing components
      const houseCost = (((emailHouseTotal + emailManualInput) * 1.1) / 12) * perFootCostHouse;
      const treeCost = ((emailTreeTotal * 1.1) / 12) * perFootCostTree;
      const powerCordCost = ((emailPowerCordTotal * 1.1) / 12) * perFootCostPowerCord;
      const subtotal = houseCost + treeCost + powerCordCost;
      const discountAmount = subtotal * (discount / 100);
      const totalQuote = subtotal - discountAmount;

      const pricingText = `
PRICING BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per Foot Cost (House): $${perFootCostHouse.toFixed(2)}/ft
Per Foot Cost (Trees): $${perFootCostTree.toFixed(2)}/ft
Per Foot Cost (Power Cord): $${perFootCostPowerCord.toFixed(2)}/ft

House/Property: ${formatLength((emailHouseTotal + emailManualInput) * 1.1)} × $${perFootCostHouse}/ft = $${houseCost.toFixed(2)}
${emailTreeTotal > 0 ? `Tree Measurements: ${formatLength(emailTreeTotal * 1.1)} × $${perFootCostTree}/ft = $${treeCost.toFixed(2)}
` : ''}${emailPowerCordTotal > 0 ? `Power Cord: ${formatLength(emailPowerCordTotal * 1.1)} × $${perFootCostPowerCord}/ft = $${powerCordCost.toFixed(2)}` : ''}

Subtotal: $${subtotal.toFixed(2)}
${discount > 0 ? `Discount (${discount}%): -$${discountAmount.toFixed(2)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATED INVESTMENT AMOUNT: $${totalQuote.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      const plainTextMessage = `
QuickMeasure Design Report
J & M Power Washing

A new property measurement has been completed using QuickMeasure.

${clientInfoText ? `CLIENT INFORMATION:\n${clientInfoText}\n\n` : ''}
MEASUREMENT SUMMARY:
Total: ${formatLength(emailGrandTotal)}
Total +10%: ${formatLength(emailGrandTotalPlus10)}

INDIVIDUAL MEASUREMENTS:
${measurementsText}

${pricingText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️  VIEW DESIGN IMAGES - CLICK LINKS BELOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${publicUrl ? `📷 Photo 1 (Front View):\n👉 ${publicUrl}\n\n` : ''}${publicUrl2 ? `📷 Photo 2 (Side View):\n👉 ${publicUrl2}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the links above or copy and paste them into your browser to view the
measurement designs with visual annotations and all property details.
      `.trim();

      // Dynamic subject line logic
      let emailSubject: string;
      if (clientName && clientAddress) {
        emailSubject = `${clientName} - ${clientAddress}`;
      } else {
        emailSubject = `QuickMeasure Design - $${totalQuote.toFixed(2)}`;
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'fd56a2dd-939a-402e-955d-5d6345cadc3c',
          subject: emailSubject,
          from_name: 'QuickMeasure System',
          message: plainTextMessage
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Email sent successfully:', result);
        alert('Design emailed successfully!');
      } else {
        console.error('Email response error:', result);
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  /**
   * Generate Business/Commercial Email Template
   */
  const generateCommercialEmailTemplate = (params: {
    clientName: string;
    clientBusinessName: string;
    clientAddress: string;
    clientCity: string;
    clientZip: string;
    clientPhone: string;
    totalQuote: number;
    emailHouseTotal: number;
    emailTreeTotal: number;
    emailGrandTotal: number;
    emailGrandTotalPlus10: number;
    houseCost: number;
    treeCost: number;
    powerCordCost: number;
    subtotal: number;
    discountAmount: number;
    discount: number;
    publicUrl: string | null;
    publicUrl2: string | null;
    projectNotes?: string;
  }) => {
    const {
      clientName, clientBusinessName, clientAddress, clientCity, clientZip,
      totalQuote, emailHouseTotal, emailTreeTotal, emailGrandTotal, emailGrandTotalPlus10,
      houseCost, treeCost, powerCordCost, subtotal, discountAmount, discount,
      publicUrl, publicUrl2, projectNotes
    } = params;

    const businessName = clientBusinessName || 'Your Business';
    const companyName = 'J&M Power Washing';
    const companyPhone = '(401) 595-0726';

    // Calculate financing
    const roundedAmount = Math.ceil(totalQuote / 100) * 100;
    const monthlyPayment = (roundedAmount / 12).toFixed(2);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f8f9fa; }
    .container { max-width: 650px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-logo { max-width: 200px; height: auto; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1e3a8a; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section-title { color: #1e3a8a; font-size: 20px; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #3b82f6; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .price-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0; }
    .price-box .amount { font-size: 36px; font-weight: 700; margin: 10px 0; }
    .price-box .label { font-size: 16px; opacity: 0.95; }
    .benefits { list-style: none; padding: 0; }
    .benefits li { padding: 12px 0; padding-left: 30px; position: relative; }
    .benefits li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }
    .pricing-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .pricing-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .cta-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; }
    .cta-box p { margin: 10px 0; font-size: 16px; color: #92400e; }
    .cta-box strong { color: #78350f; font-size: 18px; }
    .image-container { margin: 25px 0; text-align: center; }
    .image-container img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .image-container h4 { color: #1e3a8a; margin: 15px 0 10px 0; }
    .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
    .footer strong { color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lighting" class="header-logo" />
      <h1>Your Holiday Lighting Estimate</h1>
      <p>${businessName} – Attract Customers This Season</p>
    </div>

    <div class="content">
      <p class="greeting">Dear ${clientName},</p>

      <p>Thank you for requesting a holiday lighting design quote for your business, <strong>${businessName}</strong>, located at <strong>${clientAddress}${clientCity ? ', ' + clientCity : ''}${clientZip ? ' ' + clientZip : ''}</strong>. The team at ${companyName} is excited to help you transform your property for the upcoming holiday season!</p>

      <div class="price-box">
        <div class="label">Estimated Investment Amount</div>
        <div class="amount">$${totalQuote.toFixed(2)}</div>
        <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">Complete, turnkey solution for your business</p>
      </div>

      <div class="section">
        <h2 class="section-title">Complete Turnkey Solution</h2>
        <p>This price covers the entire process from start to finish:</p>
        <ul class="benefits">
          <li><strong>Custom Design</strong> tailored to ${businessName}'s unique facade</li>
          <li><strong>Professional Installation</strong> of our commercial-grade lighting</li>
          <li><strong>Maintenance</strong> throughout the season (we fix any issues quickly)</li>
          <li><strong>Hassle-free Removal and Storage</strong> until next year</li>
        </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Maximize Your Holiday Season</h2>
        <p>For a landmark business like yours, our professional lighting service is a strategic investment that offers significant benefits by ensuring your guests have an outstanding experience.</p>

        <div class="highlight-box">
          <p><strong>We utilize durable, commercial-grade LED lighting</strong> that is brighter and more energy-efficient than standard retail products. Our solution is designed to:</p>
          <ul class="benefits">
            <li><strong>Attract More Customers:</strong> An eye-catching, festive display instantly draws foot traffic and makes your business the standout destination, directly contributing to increased revenue</li>
            <li><strong>Enhance the Customer Experience:</strong> The ambiance created by our lighting helps set a celebratory and welcoming mood, giving your patrons a truly memorable experience</li>
            <li><strong>Provide a Truly Hassle-Free Season:</strong> We handle all the work—from design to storage—allowing you and your team to focus entirely on running your business</li>
          </ul>
        </div>
      </div>

      ${projectNotes ? `
      <div class="section">
        <h2 class="section-title">📋 Project Notes</h2>
        <div class="highlight-box" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; white-space: pre-wrap; line-height: 1.8; margin: 0;">${projectNotes}</p>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">Pricing Breakdown</h2>
        <div class="pricing-details">
          ${houseCost > 0 ? `<div class="pricing-row">
            <span>Property Lighting:</span>
            <strong>$${houseCost.toFixed(2)}</strong>
          </div>` : ''}
          ${treeCost > 0 ? `<div class="pricing-row">
            <span>Feature Lighting:</span>
            <strong>$${treeCost.toFixed(2)}</strong>
          </div>` : ''}
          ${powerCordCost > 0 ? `<div class="pricing-row">
            <span>Power Distribution:</span>
            <strong>$${powerCordCost.toFixed(2)}</strong>
          </div>` : ''}
          <div class="pricing-row">
            <span>Subtotal:</span>
            <strong>$${subtotal.toFixed(2)}</strong>
          </div>
          ${discount > 0 ? `<div class="pricing-row" style="color: #059669;">
            <span>Business Discount (${discount}%):</span>
            <strong>-$${discountAmount.toFixed(2)}</strong>
          </div>` : ''}
        </div>
      </div>

      ${publicUrl || publicUrl2 ? `
      <div class="section">
        <h2 class="section-title">Proposed Lighting Layout:</h2>
        ${publicUrl ? `
        <div class="image-container">
          <h4>Design Photo 1</h4>
          <img src="${publicUrl}" alt="Holiday Lighting Design Photo 1" />
        </div>` : ''}
        ${publicUrl2 ? `
        <div class="image-container">
          <h4>Design Photo 2</h4>
          <img src="${publicUrl2}" alt="Holiday Lighting Design Photo 2" />
        </div>` : ''}
      </div>` : ''}

      <div class="section">
        <h2 class="section-title">💳 We Offer Financing</h2>
        <div class="highlight-box">
          <p style="font-size: 16px; margin-bottom: 15px;">Make your holiday lighting more affordable with our flexible financing options!</p>
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Based on your estimate of <strong style="color: #1e3a8a;">$${totalQuote.toFixed(2)}</strong> (rounded to <strong style="color: #1e3a8a;">$${roundedAmount}</strong>):</p>
            <p style="font-size: 20px; color: #059669; font-weight: 600; margin: 10px 0;">Estimated Monthly Payment: $${monthlyPayment}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Based on a 12-month term</p>
          </div>
          <p style="margin-top: 15px;"><a href="https://powerwashjm.com/financing/" style="color: #1e3a8a; font-weight: 600; text-decoration: none;">Learn more about financing options and use our calculator →</a></p>
        </div>
      </div>

      <div class="cta-box">
        <p><strong>Ready to Make This Your Brightest Holiday Season?</strong></p>
        <p>We would love to connect to discuss this design and our different customizable options to ensure the lighting perfectly reflects the prestige of ${businessName}.</p>
        <p style="margin-top: 20px;">📞 Call us at <strong>(401) 595-0726</strong> or reply to this email to schedule a brief consultation or to confirm your installation.</p>
      </div>
    </div>

    <div class="footer">
      <p style="margin-bottom: 20px;">We look forward to making this your brightest holiday season yet!</p>
      <div style="border-top: 1px solid #475569; padding-top: 20px; margin-top: 20px;">
        <p><strong>The J&M Sales Team</strong></p>
        <p style="margin: 10px 0;">E: <a href="mailto:sales@powerwashjm.com" style="color: #3b82f6; text-decoration: none;">sales@powerwashjm.com</a></p>
        <p style="margin: 10px 0;">P: <a href="tel:+14015950726" style="color: #3b82f6; text-decoration: none;">(401) 595-0726</a></p>
        <p style="margin: 10px 0;">A: PO Box 452, Greenville, RI 02828</p>
        <p style="margin: 10px 0;">W: <a href="https://powerwashjm.com" style="color: #3b82f6; text-decoration: none;">powerwashjm.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return htmlContent;
  };

  /**
   * Generate Residential/Homeowner Email Template
   */
  const generateResidentialEmailTemplate = (params: {
    clientName: string;
    clientAddress: string;
    clientCity: string;
    clientZip: string;
    clientPhone: string;
    totalQuote: number;
    emailHouseTotal: number;
    emailTreeTotal: number;
    emailGrandTotal: number;
    emailGrandTotalPlus10: number;
    houseCost: number;
    treeCost: number;
    powerCordCost: number;
    subtotal: number;
    discountAmount: number;
    discount: number;
    publicUrl: string | null;
    publicUrl2: string | null;
    projectNotes?: string;
  }) => {
    const {
      clientName, clientAddress, clientCity, clientZip,
      totalQuote, emailHouseTotal, emailTreeTotal, emailGrandTotal, emailGrandTotalPlus10,
      houseCost, treeCost, powerCordCost, subtotal, discountAmount, discount,
      publicUrl, publicUrl2, projectNotes
    } = params;

    const nameParts = clientName.trim().split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || clientName;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || 'Client';
    const companyName = 'J&M Power Washing';

    // Calculate financing
    const roundedAmount = Math.ceil(totalQuote / 100) * 100;
    const monthlyPayment = (roundedAmount / 12).toFixed(2);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f8f9fa; }
    .container { max-width: 650px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header .emoji { font-size: 36px; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #dc2626; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section-title { color: #dc2626; font-size: 20px; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #ef4444; display: flex; align-items: center; gap: 10px; }
    .highlight-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .price-box { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }
    .price-box .label { font-size: 16px; opacity: 0.95; margin-bottom: 10px; }
    .price-box .amount { font-size: 42px; font-weight: 700; margin: 10px 0; }
    .benefits { list-style: none; padding: 0; margin: 20px 0; }
    .benefits li { padding: 12px 0; padding-left: 35px; position: relative; line-height: 1.6; }
    .benefits li:before { content: "🎄"; position: absolute; left: 0; font-size: 18px; }
    .design-box { background: #f0f9ff; border: 2px solid #3b82f6; padding: 25px; border-radius: 8px; margin: 25px 0; }
    .design-box h3 { color: #1e40af; margin-top: 0; }
    .design-box ul { margin: 15px 0; }
    .design-box li { margin: 10px 0; line-height: 1.6; }
    .advantage-box { background: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; }
    .advantage-box h3 { color: #92400e; margin-top: 0; }
    .advantage-item { margin: 15px 0; }
    .advantage-item strong { color: #78350f; display: block; margin-bottom: 5px; }
    .pricing-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .pricing-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .enhancement-box { background: #dcfce7; border: 2px solid #10b981; padding: 25px; border-radius: 8px; margin: 30px 0; }
    .enhancement-box h3 { color: #065f46; margin-top: 0; }
    .enhancement-box p { color: #047857; line-height: 1.7; }
    .image-container { margin: 25px 0; text-align: center; }
    .image-container img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .image-container h4 { color: #dc2626; margin: 15px 0 10px 0; }
    .cta-button { background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600; }
    .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
    .footer strong { color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lighting" class="header-logo" />
      <h1>Your Custom Holiday Lighting Design</h1>
      <p>For the ${lastName} Home</p>
    </div>

    <div class="content">
      <p class="greeting">Dear ${firstName},</p>

      <p>Thank you for allowing <strong>${companyName}</strong> the opportunity to design a beautiful, custom holiday display for your home at <strong>${clientAddress}${clientCity ? ', ' + clientCity : ''}${clientZip ? ' ' + clientZip : ''}</strong>. We are confident this elegant design will enhance your home's curb appeal throughout the holiday season.</p>

      <div class="section">
        <h2 class="section-title"><span>🎄</span> Your Proposed Holiday Lighting Design</h2>
        <div class="design-box">
          <p>The design focuses on architectural lighting to highlight your home's unique features. This is a timeless look that offers maximum sophistication and visibility:</p>
          <ul>
            ${emailHouseTotal > 0 ? `<li><strong>Main House Outline:</strong> We will outline your rooflines and peaks with bright, clean, commercial-grade LED lights (${formatLength(emailHouseTotal)}), emphasizing the structure's elegance</li>` : ''}
            ${emailTreeTotal > 0 ? `<li><strong>Landscape Features:</strong> The lighting includes accent trees and focal points (${formatLength(emailTreeTotal)}), ensuring a cohesive and complete holiday presentation</li>` : ''}
            <li><strong>Complete Coverage:</strong> Total of ${formatLength(emailGrandTotalPlus10)} (including 10% overage for perfect coverage)</li>
          </ul>
        </div>
      </div>

      ${publicUrl || publicUrl2 ? `
      <div class="section">
        <h2 class="section-title"><span>📸</span> Proposed Lighting Layout:</h2>
        ${publicUrl ? `
        <div class="image-container">
          <h4>Design Photo 1</h4>
          <img src="${publicUrl}" alt="Holiday Lighting Design Photo 1" />
        </div>` : ''}
        ${publicUrl2 ? `
        <div class="image-container">
          <h4>Design Photo 2</h4>
          <img src="${publicUrl2}" alt="Holiday Lighting Design Photo 2" />
        </div>` : ''}
      </div>` : ''}

      ${projectNotes ? `
      <div class="section">
        <h2 class="section-title"><span>📋</span> Project Notes</h2>
        <div class="highlight-box" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; white-space: pre-wrap; line-height: 1.8; margin: 0;">${projectNotes}</p>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title"><span>🌟</span> The ${companyName} Advantage</h2>
        <div class="advantage-box">
          <p>When you choose ${companyName}, you are investing in a premium, stress-free holiday experience. Our service is all-inclusive, providing significant value beyond just the lights:</p>

          <div class="advantage-item">
            <strong>✓ Complete Turnkey Service</strong>
            We handle everything—from custom design and professional installation to proactive maintenance throughout the season.
          </div>

          <div class="advantage-item">
            <strong>✓ Quality & Safety</strong>
            We use commercial-grade, energy-efficient LED lighting installed by trained professionals, ensuring a safe, secure, and brilliant display all season long.
          </div>

          <div class="advantage-item">
            <strong>✓ Hassle-Free Removal & Storage</strong>
            After the holidays, we efficiently remove the lights and store them securely in our facility, freeing up your valuable time and storage space.
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title"><span>💰</span> Investment Details</h2>
        <div class="pricing-details">
          <div class="pricing-row">
            <span>Design & Installation:</span>
            <strong>Professional Grade</strong>
          </div>
          <div class="pricing-row">
            <span>Maintenance & Support:</span>
            <strong>All Season Long</strong>
          </div>
          <div class="pricing-row">
            <span>Removal & Storage:</span>
            <strong>Fully Included</strong>
          </div>
          ${discount > 0 ? `<div class="pricing-row" style="color: #059669;">
            <span>Special Discount (${discount}%):</span>
            <strong>-$${discountAmount.toFixed(2)}</strong>
          </div>` : ''}
        </div>

        <div class="price-box">
          <div class="label">Estimated Total Investment Amount</div>
          <div class="amount">$${totalQuote.toFixed(2)}</div>
          <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">Complete turnkey service - Everything included</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title"><span>💳</span> We Offer Financing</h2>
        <div class="highlight-box">
          <p style="font-size: 16px; margin-bottom: 15px;">Make your holiday lighting more affordable with our flexible financing options!</p>
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Based on your estimate of <strong style="color: #dc2626;">$${totalQuote.toFixed(2)}</strong> (rounded to <strong style="color: #dc2626;">$${roundedAmount}</strong>):</p>
            <p style="font-size: 20px; color: #059669; font-weight: 600; margin: 10px 0;">Estimated Monthly Payment: $${monthlyPayment}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Based on a 12-month term</p>
          </div>
          <p style="margin-top: 15px;"><a href="https://powerwashjm.com/financing/" style="color: #dc2626; font-weight: 600; text-decoration: none;">Learn more about financing options and use our calculator →</a></p>
        </div>
      </div>

      <div class="enhancement-box">
        <h3>✅ Next Steps: Review & Enhancement</h3>
        <p>The current design is a beautiful starting point. We also offer enhancements to make your display truly stunning and layered. Would you be interested in upgrading the proposal to include elements like <strong>wreaths and garland, window outlines, or additional tree lighting?</strong></p>
        <p style="margin-top: 15px;">Please let us know your thoughts on the proposal, or if you'd like to schedule a brief call to discuss enhancements or proceed with booking your installation date!</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Ready to transform your home this holiday season?</p>
        <p style="font-size: 18px; color: #dc2626; font-weight: 600;">📞 (401) 595-0726</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Or simply reply to this email</p>
      </div>
    </div>

    <div class="footer">
      <p style="margin-bottom: 20px;">Creating magical holiday memories, one home at a time.</p>
      <div style="border-top: 1px solid #475569; padding-top: 20px; margin-top: 20px;">
        <p><strong>The J&M Sales Team</strong></p>
        <p style="margin: 10px 0;">E: <a href="mailto:sales@powerwashjm.com" style="color: #3b82f6; text-decoration: none;">sales@powerwashjm.com</a></p>
        <p style="margin: 10px 0;">P: <a href="tel:+14015950726" style="color: #3b82f6; text-decoration: none;">(401) 595-0726</a></p>
        <p style="margin: 10px 0;">A: PO Box 452, Greenville, RI 02828</p>
        <p style="margin: 10px 0;">W: <a href="https://powerwashjm.com" style="color: #3b82f6; text-decoration: none;">powerwashjm.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return htmlContent;
  };

  /**
   * Email Customer Estimate using ZeptoMail
   * Sends a professional estimate directly to the customer
   */
  const handleEmailCustomerEstimate = async () => {
    // Validate customer email is present
    if (!clientEmail || !clientEmail.includes('@')) {
      alert('Please enter a valid customer email address before sending the estimate.');
      return;
    }

    if (!clientName) {
      alert('Please enter the customer name before sending the estimate.');
      return;
    }

    // Check if there are measurements or images
    if (measurements.length === 0 && treeMeasurements.length === 0) {
      alert('Please add at least one measurement before sending the estimate.');
      return;
    }

    // Show price confirmation modal instead of sending immediately
    const pricingBreakdown = calculatePricingBreakdown();
    setConfirmedPrice(pricingBreakdown.grand_total);
    setPriceOverride(pricingBreakdown.grand_total.toFixed(2));
    setShowPriceConfirmModal(true);
    return;
  };

  const handleConfirmAndSendEmail = async () => {
    setShowPriceConfirmModal(false);
    setIsSendingCustomerEmail(true);

    try {
      const canvas = canvasRef.current;
      const canvas2 = canvas2Ref.current;

      // Use the confirmed price (may be overridden by user)
      const totalQuote = parseFloat(priceOverride) || confirmedPrice || 0;

      // Calculate pricing details using the centralized function for breakdown
      const pricingBreakdown = calculatePricingBreakdown();
      const discountAmount = pricingBreakdown.discount;

      // For display in email (inches measurement)
      const emailHouseTotal = calculateHouseTotal();
      const emailTreeTotal = calculateTreeTotal();
      const emailPowerCordTotal = calculatePowerCordTotal();
      const emailManualInput = getManualInputValue();
      const emailGrandTotal = emailHouseTotal + emailTreeTotal + emailManualInput;
      const emailGrandTotalPlus10 = emailGrandTotal * 1.1;

      // Individual cost breakdown for fallback templates
      const houseCost = pricingBreakdown.house_measurements.total + pricingBreakdown.manual_input.total;
      const treeCost = pricingBreakdown.trees.total;
      const powerCordCost = pricingBreakdown.power_cord.total;
      const subtotal = pricingBreakdown.subtotal;

      // Upload images if available (WITHOUT reference line for customer)
      const { supabase } = await import('../lib/supabase');
      let publicUrl = null;
      let publicUrl2 = null;

      if (includePhoto1 && image) {
        // Create export version WITHOUT yellow reference line
        const exportCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        if (exportCanvas1) {
          const imageData = exportCanvas1.toDataURL('image/png');
          const blob = await (await fetch(imageData)).blob();
          const fileName = `customer-estimate-photo1-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName, blob, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadError && uploadData) {
            const { data: { publicUrl: url1 } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData.path);
            publicUrl = url1;
          }
        }
      }

      if (includePhoto2 && image2) {
        // Create export version WITHOUT yellow reference line
        const exportCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        if (exportCanvas2) {
          const imageData2 = exportCanvas2.toDataURL('image/png');
          const blob2 = await (await fetch(imageData2)).blob();
          const fileName2 = `customer-estimate-photo2-${Date.now()}.png`;

          const { data: uploadData2, error: uploadError2 } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName2, blob2, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadError2 && uploadData2) {
            const { data: { publicUrl: url2 } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData2.path);
            publicUrl2 = url2;
          }
        }
      }

      // Automatically determine template type based on business name
      const templateType = clientBusinessName && clientBusinessName.trim().length > 0 ? 'commercial' : 'residential';

      // Fetch template from database
      const template = await getActiveTemplate(templateType);

      // Extract name parts for use in both template paths
      const nameParts = clientName.trim().split(' ').filter(part => part.length > 0);
      const firstName = nameParts[0] || clientName;
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || 'Client';

      // Fallback to hardcoded templates if database fetch fails
      let htmlContent: string;
      let subject: string;

      if (template) {
        // Use database template with variable replacement
        const roundedAmount = Math.ceil(totalQuote / 100) * 100;
        const monthlyPayment = (roundedAmount / 12).toFixed(2);

        const templateVariables = {
          BUSINESS_NAME: clientBusinessName || clientName,
          CLIENT_NAME: clientName,
          FIRST_NAME: firstName,
          LAST_NAME: lastName,
          TOTAL_QUOTE: totalQuote.toFixed(2),
          ROUNDED_AMOUNT: roundedAmount.toString(),
          MONTHLY_PAYMENT: monthlyPayment,
          PHOTO_1_URL: publicUrl || '',
          PHOTO_2_URL: publicUrl2 || '',
          PROJECT_NOTES: projectNarrative || '',
          QUOTE_ID: selectedQuoteId || ''
        };

        htmlContent = replaceTemplateVariables(template.html_content, templateVariables);
        subject = generateSubject(template.subject, templateVariables);
      } else {
        // Fallback to hardcoded templates
        console.warn(`Template not found in database, using fallback for ${emailTemplate}`);
        const templateParams = {
          clientName,
          clientBusinessName,
          clientAddress,
          clientCity,
          clientZip,
          clientPhone,
          totalQuote,
          emailHouseTotal,
          emailTreeTotal,
          emailGrandTotal,
          emailGrandTotalPlus10,
          houseCost,
          treeCost,
          powerCordCost,
          subtotal,
          discountAmount,
          discount,
          publicUrl,
          publicUrl2,
          projectNotes: projectNarrative
        };

        htmlContent = emailTemplate === 'commercial'
          ? generateCommercialEmailTemplate(templateParams)
          : generateResidentialEmailTemplate(templateParams);

        subject = emailTemplate === 'commercial'
          ? `Your Holiday Lighting Estimate: ${clientBusinessName || clientName} – Attract Customers This Season`
          : `Your Custom Holiday Lighting Design & Estimate for ${lastName} Home`;
      }

      // Plain text version
      const textContent = `
Holiday Lighting Estimate
J&M Power Washing

Customer Information:
Name: ${clientName}
${clientBusinessName ? `Business: ${clientBusinessName}` : ''}
${clientAddress ? `Address: ${clientAddress}` : ''}
${clientCity || clientZip ? `Location: ${clientCity}${clientCity && clientZip ? ', ' : ''}${clientZip}` : ''}
${clientPhone ? `Phone: ${clientPhone}` : ''}

Measurement Summary:
Total Linear Feet: ${formatLength(emailGrandTotal)}
Total with 10% Overage: ${formatLength(emailGrandTotalPlus10)}

Pricing Breakdown:
${houseCost > 0 ? `House/Property: $${houseCost.toFixed(2)}` : ''}
${treeCost > 0 ? `Tree Measurements: $${treeCost.toFixed(2)}` : ''}
${powerCordCost > 0 ? `Power Cord: $${powerCordCost.toFixed(2)}` : ''}
Subtotal: $${subtotal.toFixed(2)}
${discount > 0 ? `Discount (${discount}%): -$${discountAmount.toFixed(2)}` : ''}

Total Investment: $${totalQuote.toFixed(2)}

${publicUrl ? `View Photo 1: ${publicUrl}` : ''}
${publicUrl2 ? `View Photo 2: ${publicUrl2}` : ''}

Thank you for considering J&M Power Washing for your holiday lighting needs!
      `.trim();

      // Send email via MailJet Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-customer-estimate-mailjet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            customerEmail: clientEmail,
            customerName: clientName,
            subject,
            htmlContent,
            textContent,
            quoteId: selectedQuoteId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log('📧 Email send result:', result);
        console.log('📋 Internal Copy Status:', result.internalCopy?.status);
        if (result.internalCopy?.error) {
          console.error('⚠️ Internal copy error:', result.internalCopy.error);
        }
        // Update status to "Quoted" and log email send if this was loaded from a quote
        if (selectedQuoteId) {
          console.log('Updating quote status to Quoted for quote ID:', selectedQuoteId);
          const { error: updateError } = await supabase
            .from('quote_submissions')
            .update({
              status: 'Quoted',
              customer_estimate_sent: true,
              customer_estimate_sent_at: new Date().toISOString(),
              total_price: totalQuote,
              pricing_breakdown: {
                ...pricingBreakdown,
                grand_total: totalQuote,
                after_discount: totalQuote
              },
              // Update client info fields that may have been edited
              name: clientName,
              business_name: clientBusinessName || null,
              email: clientEmail,
              phone: clientPhone,
              address: clientAddress,
              city: clientCity,
              state: clientState,
              zip: clientZip,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedQuoteId);

          if (updateError) {
            console.error('Error updating quote status:', updateError);
            alert(`⚠️ Estimate sent to ${clientEmail}, but failed to update quote status: ${updateError.message}\n\nPlease manually update the status to "Quoted" in the dashboard.`);
          } else {
            console.log('Quote status updated to Quoted and customer estimate email logged');
            alert(`✅ Estimate sent successfully to ${clientEmail}!\n\nQuote status updated to "Quoted".`);
            // Refresh the quotes list to remove this quote from the dropdown
            await fetchHolidayLightsQuotes();
          }
        } else {
          console.warn('No selectedQuoteId - skipping status update');
          alert(`✅ Estimate sent successfully to ${clientEmail}!`);
        }
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending customer estimate:', error);
      alert(`Failed to send estimate: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSendingCustomerEmail(false);
    }
  };

  /**
   * Calculate detailed pricing breakdown from measurements
   * CRITICAL: This MUST match the UI calculation exactly (calculateGrandTotal + 10%)
   */
  const calculatePricingBreakdown = () => {
    const houseRate = perFootCostHouse || 7;
    const powerCordRate = perFootCostPowerCord || 5;
    const treeRate = perFootCostTree || 3.5;

    const houseTotalInches = calculateHouseTotal();
    const houseTotalFeet = (houseTotalInches * 1.1) / 12;

    const treeTotalInches = calculateTreeTotal();
    const treeTotalFeet = (treeTotalInches * 1.1) / 12;

    const manualInputInches = getManualInputValue();
    const manualInputFeet = (manualInputInches * 1.1) / 12;

    const powerCordInches = calculatePowerCordTotal();
    const powerCordFeet = (powerCordInches * 1.1) / 12;

    const houseSubtotal = houseTotalFeet * houseRate;
    const treeSubtotal = treeTotalFeet * treeRate;
    const manualInputSubtotal = manualInputFeet * houseRate;
    const powerCordSubtotal = powerCordFeet * powerCordRate;

    const subtotal = houseSubtotal + treeSubtotal + manualInputSubtotal + powerCordSubtotal;
    const discountPercent = discount || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discountAmount;

    return {
      house_measurements: {
        footage: parseFloat(houseTotalFeet.toFixed(2)),
        rate: houseRate,
        total: parseFloat(houseSubtotal.toFixed(2))
      },
      trees: {
        footage: parseFloat(treeTotalFeet.toFixed(2)),
        rate: treeRate,
        total: parseFloat(treeSubtotal.toFixed(2))
      },
      manual_input: {
        footage: parseFloat(manualInputFeet.toFixed(2)),
        rate: houseRate,
        total: parseFloat(manualInputSubtotal.toFixed(2))
      },
      power_cord: {
        footage: parseFloat(powerCordFeet.toFixed(2)),
        rate: powerCordRate,
        total: parseFloat(powerCordSubtotal.toFixed(2))
      },
      discount: parseFloat(discountAmount.toFixed(2)),
      discount_percent: discountPercent,
      subtotal: parseFloat(subtotal.toFixed(2)),
      after_discount: parseFloat(grandTotal.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2))
    };
  };

  /**
   * Performs auto-save in the background without user confirmation
   */
  const performAutoSave = async () => {
    if (!selectedQuoteId || !hasUnsavedChanges) {
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');

      // Upload the primary design image to storage (WITHOUT reference line)
      let designFileUrl = null;
      if (image) {
        const exportCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        if (exportCanvas1) {
          const imageData = exportCanvas1.toDataURL('image/png');
          const blob = await (await fetch(imageData)).blob();
          const fileName = `design-${selectedQuoteId}-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName, blob, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData.path);
            designFileUrl = publicUrl;
          }
        }
      }

      // Upload the secondary design image (Photo 2) to storage (WITHOUT reference line)
      let designFileUrl2 = null;
      if (image2) {
        const exportCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        if (exportCanvas2) {
          const imageData2 = exportCanvas2.toDataURL('image/png');
          const blob2 = await (await fetch(imageData2)).blob();
          const fileName2 = `design2-${selectedQuoteId}-${Date.now()}.png`;

          const { data: uploadData2, error: uploadError2 } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName2, blob2, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadError2 && uploadData2) {
            const { data: { publicUrl: publicUrl2 } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData2.path);
            designFileUrl2 = publicUrl2;
          }
        }
      }

      // Get current user info for audit trail
      const { data: { user } } = await supabase.auth.getUser();
      const savedBy = user?.id || null;

      // Prepare design data JSON
      let photo1Thumbnail = null;
      if (image) {
        const thumbCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        photo1Thumbnail = thumbCanvas1?.toDataURL('image/jpeg', 0.8) || null;
      }

      let photo2Thumbnail = null;
      if (image2) {
        const thumbCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        photo2Thumbnail = thumbCanvas2?.toDataURL('image/jpeg', 0.8) || null;
      }

      const designData = {
        measurements,
        treeMeasurements,
        calibration,
        lineColor,
        fontSize,
        lineThickness,
        showMeasurementAmounts,
        perFootCostHouse,
        perFootCostTree,
        perFootCostPowerCord,
        discount,
        manualInputPhoto1,
        manualInputPhoto2,
        manualPowerCordPhoto1,
        manualPowerCordPhoto2,
        includePhoto1,
        includePhoto2,
        photo1Name,
        photo2Name,
        projectNarrative,
        salesRep,
        photo1Url: photo1Thumbnail,
        photo2Url: photo2Thumbnail,
        savedAt: new Date().toISOString(),
        savedBy
      };

      // Calculate pricing breakdown
      const pricingBreakdown = calculatePricingBreakdown();

      // Update the quote_submissions record
      const { error: updateError } = await supabase
        .from('quote_submissions')
        .update({
          design_file_url: designFileUrl,
          design_image_url: designFileUrl,
          second_design_image_url: designFileUrl2,
          design_data: designData,
          pricing_breakdown: pricingBreakdown,
          total_price: pricingBreakdown.grand_total,
          design_saved_at: new Date().toISOString(),
          design_saved_by: savedBy,
          sales_rep: salesRep,
          status: 'Measured',
          name: clientName,
          business_name: clientBusinessName,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress,
          city: clientCity,
          state: clientState,
          zip: clientZip,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuoteId);

      if (!updateError) {
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
        console.log('✅ Auto-saved design at', new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error to user for auto-save failures
    }
  };

  /**
   * Save Design to Client Record with Comprehensive Validation
   * Links the current design file with the selected Holiday Lights quote
   */
  const handleSaveDesign = async () => {
    // Run comprehensive validation
    const validation = validateSaveRequirements();

    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setIsSendingEmail(true); // Set loading state early

    try {
      const { supabase } = await import('../lib/supabase');

      // Check if a design already exists for this customer
      const { data: existingQuote, error: checkError } = await supabase
        .from('quote_submissions')
        .select('id, name, design_file_url, design_data, design_saved_at, design_saved_by')
        .eq('id', selectedQuoteId)
        .single();

      if (checkError) {
        throw new Error(`Failed to check existing design: ${checkError.message}`);
      }

      // If design exists, ask user for confirmation to overwrite
      if (existingQuote && (existingQuote.design_file_url || existingQuote.design_data)) {
        const lastSavedInfo = existingQuote.design_saved_at
          ? `\n\nLast saved: ${new Date(existingQuote.design_saved_at).toLocaleString()}`
          : '';
        const savedByInfo = existingQuote.design_saved_by
          ? `\nSaved by: ${existingQuote.design_saved_by}`
          : '';

        const overwriteConfirm = confirm(
          `⚠️ EXISTING DESIGN FOUND\n\n` +
          `An existing design was found for ${clientName}.${lastSavedInfo}${savedByInfo}\n\n` +
          `Would you like to OVERWRITE the existing design with the new design?\n\n` +
          `• Click "OK" to overwrite and replace the existing design\n` +
          `• Click "Cancel" to keep the existing design and cancel this save`
        );

        if (!overwriteConfirm) {
          // User chose to cancel - keep existing design
          setIsSendingEmail(false);
          alert('❌ Save cancelled. The existing design has been preserved.');
          return;
        }

        // User confirmed overwrite - continue with save
        console.log('User confirmed overwrite of existing design');
      } else {
        // No existing design - ask for regular save confirmation
        const confirmSave = confirm(
          `Save this design to ${clientName}'s quote record?\n\n` +
          `This will link the design file and update the quote status.`
        );

        if (!confirmSave) {
          setIsSendingEmail(false);
          return;
        }
      }

      // Proceed with save operation
      // NOTE: Save WITHOUT reference line in case designs are shared with customers later

      // Upload the primary design image to storage (WITHOUT reference line)
      let designFileUrl = null;
      if (image) {
        const exportCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        if (exportCanvas1) {
          const imageData = exportCanvas1.toDataURL('image/png');
          const blob = await (await fetch(imageData)).blob();
          const fileName = `design-${selectedQuoteId}-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName, blob, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Failed to upload design file: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('measurement-designs')
            .getPublicUrl(uploadData.path);
          designFileUrl = publicUrl;
        }
      }

      // Upload the secondary design image (Photo 2) to storage (WITHOUT reference line)
      let designFileUrl2 = null;
      if (image2) {
        const exportCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        if (exportCanvas2) {
          const imageData2 = exportCanvas2.toDataURL('image/png');
          const blob2 = await (await fetch(imageData2)).blob();
          const fileName2 = `design2-${selectedQuoteId}-${Date.now()}.png`;

          const { data: uploadData2, error: uploadError2 } = await supabase.storage
            .from('measurement-designs')
            .upload(fileName2, blob2, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError2) {
            console.warn('Failed to upload second design file:', uploadError2.message);
          } else if (uploadData2) {
            const { data: { publicUrl: publicUrl2 } } = supabase.storage
              .from('measurement-designs')
              .getPublicUrl(uploadData2.path);
            designFileUrl2 = publicUrl2;
          }
        }
      }

      // Get current user info for audit trail
      const { data: { user } } = await supabase.auth.getUser();
      const savedBy = user?.id || null;

      // Prepare design data JSON with complete state
      // Create thumbnail versions WITHOUT reference line
      let photo1Thumbnail = null;
      if (image) {
        const thumbCanvas1 = drawCanvasForExport(image, measurements, treeMeasurements, lineColor, 'photo1');
        photo1Thumbnail = thumbCanvas1?.toDataURL('image/jpeg', 0.8) || null;
      }

      let photo2Thumbnail = null;
      if (image2) {
        const thumbCanvas2 = drawCanvasForExport(image2, measurements, treeMeasurements, lineColor, 'photo2');
        photo2Thumbnail = thumbCanvas2?.toDataURL('image/jpeg', 0.8) || null;
      }

      const designData = {
        measurements,
        treeMeasurements,
        calibration,
        lineColor,
        fontSize,
        lineThickness,
        showMeasurementAmounts,
        perFootCostHouse,
        perFootCostTree,
        perFootCostPowerCord,
        discount,
        manualInputPhoto1,
        manualInputPhoto2,
        manualPowerCordPhoto1,
        manualPowerCordPhoto2,
        includePhoto1,
        includePhoto2,
        photo1Name,
        photo2Name,
        projectNarrative,
        salesRep,
        photo1Url: photo1Thumbnail,
        photo2Url: photo2Thumbnail,
        savedAt: new Date().toISOString(),
        savedBy
      };

      // Calculate pricing breakdown for email notifications
      const pricingBreakdown = calculatePricingBreakdown();

      // Update the quote_submissions record - this will OVERWRITE existing design
      const { error: updateError } = await supabase
        .from('quote_submissions')
        .update({
          design_file_url: designFileUrl,
          design_image_url: designFileUrl,
          second_design_image_url: designFileUrl2,
          design_data: designData,
          pricing_breakdown: pricingBreakdown,
          total_price: pricingBreakdown.grand_total,
          design_saved_at: new Date().toISOString(),
          design_saved_by: savedBy,
          sales_rep: salesRep,
          status: 'Measured', // Update status from "Needs Measure" to "Measured"
          // Update client info fields that may have been edited
          name: clientName,
          business_name: clientBusinessName,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress,
          city: clientCity,
          state: clientState,
          zip: clientZip,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuoteId);

      if (updateError) {
        throw new Error(`Failed to save design to quote: ${updateError.message}`);
      }

      // Delete old design file from storage if it exists (cleanup)
      if (existingQuote?.design_file_url && existingQuote.design_file_url !== designFileUrl) {
        try {
          const oldFileName = existingQuote.design_file_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('measurement-designs')
              .remove([oldFileName]);
            console.log('Old design file removed from storage');
          }
        } catch (cleanupError) {
          console.warn('Failed to remove old design file:', cleanupError);
          // Non-critical error - don't fail the save operation
        }
      }

      // Show success message
      const wasOverwrite = existingQuote && (existingQuote.design_file_url || existingQuote.design_data);
      const successMessage = wasOverwrite
        ? '✅ Design overwritten successfully!\n\nThe previous design has been replaced with your new design.\n\nStatus: Measured'
        : '✅ Design saved successfully!\n\nThe design file has been linked to the client record.\n\nStatus: Measured';

      alert(successMessage);

      // Clear unsaved changes flag and update last saved time
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());

      // Optionally refresh the quotes list
      fetchHolidayLightsQuotes();

    } catch (error) {
      console.error('Save design error:', error);
      alert(`❌ Failed to save design: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all measurements?')) {
      setMeasurements([]);
      setCalibration(null);
      setCurrentPoints([]);
      setActiveTool(null);
      setHistory([]);
      setHistoryIndex(-1);
      setSelectedReference('');
      setIsSettingReference(false);
      setBushShapes([]);
      setTreeMeasurements([]);
      setTreeWidth(null);
      setTreeHeight(null);
      setTreeWidthPoints(null);
      setTreeHeightPoints(null);
      setIsDrawing(false);
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/employee-login');
  };

  const treeTotal = calculateTreeTotal();
  const houseTotal = calculateHouseTotal();
  const powerCordTotal = calculatePowerCordTotal();
  const grandTotal = calculateGrandTotal();
  const grandTotalPlus10 = grandTotal * 1.1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 bg-gray-900 text-white p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="mb-8">
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmed = confirm(
                  '⚠️ UNSAVED CHANGES\n\n' +
                  'You have unsaved changes that will be lost if you leave this page.\n\n' +
                  'Would you like to save your design before leaving?\n\n' +
                  '• Click "OK" to stay and save your work\n' +
                  '• Click "Cancel" to leave without saving'
                );
                if (confirmed) {
                  return; // Stay on page
                }
              }
              navigate('/employee-dashboard');
            }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-2 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
            {hasUnsavedChanges && (
              <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                Unsaved
              </span>
            )}
          </button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">QuickMeasure</h1>
            {lastSavedAt && (
              <div className="text-sm text-gray-400">
                Last saved: {lastSavedAt.toLocaleTimeString()}
              </div>
            )}
            {hasUnsavedChanges && autoSaveEnabled && (
              <div className="text-sm text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Auto-saving in 30s...
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">J & M Power Washing</p>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">1. UPLOAD</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={fileInput2Ref}
              type="file"
              accept="image/jpeg,image/png,image/heic"
              onChange={handleImage2Upload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors mb-2 ${
                image
                  ? activePhoto === 'photo1'
                    ? 'bg-blue-700 text-white ring-2 ring-blue-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload className="w-5 h-5" />
              Photo 1: Front View {image && '✓'}
            </button>
            <button
              onClick={() => fileInput2Ref.current?.click()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                image2
                  ? activePhoto === 'photo2'
                    ? 'bg-green-700 text-white ring-2 ring-green-400'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={!image}
            >
              <Upload className="w-5 h-5" />
              Photo 2: Side View {image2 && '✓'}
            </button>
            {image2 && (
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={multiplySideBy2}
                  onChange={(e) => setMultiplySideBy2(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500"
                />
                <span>Multiply Side View × 2 (Both Sides)</span>
              </label>
            )}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-400 mb-2">Line Color</label>
              <select
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="#ef4444">Red</option>
                <option value="#ffffff">White Lights</option>
                <option value="#fbbf24">Colored Lights</option>
                <option value="#redwhite">Red/White Lights</option>
                <option value="#000000">Black</option>
                <option value="#powercord">Power Cord (No Lights)</option>
              </select>
            </div>

            {/* Night Mode Slider - Moved up for easy access */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Night Mode Effect</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 whitespace-nowrap">Day</span>
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={imageDarkness}
                  onChange={(e) => setImageDarkness(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(imageDarkness / 70) * 100}%, #374151 ${(imageDarkness / 70) * 100}%, #374151 100%)`
                  }}
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">Night</span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-medium text-blue-400">{imageDarkness}% Darkness</span>
              </div>
              <p className="mt-2 text-xs text-gray-500 leading-tight">Darken image to simulate nighttime. Lights will glow brighter as darkness increases.</p>
            </div>

          </div>

          {image && (
            <>
              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3">2. REFERENCE</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowReferenceDropdown(!showReferenceDropdown)}
                    disabled={!image}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isSettingReference
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      <span>{selectedReference || 'Set Reference'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showReferenceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
                      {PRESET_REFERENCES.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handleReferenceSelect(preset)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-gray-200 border-b border-gray-700 last:border-b-0"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {calibration && (
                  <p className="mt-2 text-xs text-green-400 font-medium">
                    ✓ Calibrated: {calibration.realWorldDistance}" reference
                  </p>
                )}
                {isSettingReference && !calibration && (
                  <p className="mt-2 text-xs text-yellow-400 font-medium">
                    Click two points on the image to set the {selectedReference}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3">3. MEASURE</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!calibration) {
                        alert('Please set a reference first.');
                        return;
                      }
                      setActiveTool('length');
                      setCurrentPoints([]);
                      setIsSettingReference(false);
                    }}
                    disabled={!calibration}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTool === 'length'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Ruler className="w-5 h-5" />
                    Length
                  </button>

                  <button
                    onClick={() => {
                      if (!calibration) {
                        alert('Please set a reference first.');
                        return;
                      }
                      setActiveTool('area');
                      setCurrentPoints([]);
                      setIsSettingReference(false);
                    }}
                    disabled={!calibration}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTool === 'area'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Square className="w-5 h-5" />
                    Area
                  </button>

                  <button
                    onClick={() => {
                      if (!calibration) {
                        alert('Please set a reference first.');
                        return;
                      }
                      setActiveTool('tree');
                      setCurrentPoints([]);
                      setIsSettingReference(false);
                      setTreeMeasurementStep('width');
                      setTreeWidth(null);
                      setTreeHeight(null);
                      setTreeWidthPoints(null);
                      setTreeHeightPoints(null);
                    }}
                    disabled={!calibration}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTool === 'tree'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trees className="w-5 h-5" />
                    Measure Tree
                  </button>

                  <button
                    onClick={() => {
                      setActiveTool(activeTool === 'bush' ? null : 'bush');
                      setCurrentPoints([]);
                      setIsSettingReference(false);
                    }}
                    disabled={!calibration}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTool === 'bush'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trees className="w-5 h-5" />
                    Bush Wrap
                  </button>

                  {activeTool === 'bush' && (
                    <div className="mt-3 bg-gray-800 rounded-lg p-4">
                      <div className="bg-emerald-900 bg-opacity-30 border border-emerald-500 rounded p-3">
                        <p className="text-emerald-300 text-xs font-medium mb-1">
                          Freehand Bush Wrap - Visual Only
                        </p>
                        <p className="text-emerald-200 text-xs mb-2">
                          Click and drag to draw around the bush. Lights will auto-fill with proper spacing when you release.
                        </p>
                        <p className="text-emerald-200 text-xs mb-2">
                          Light color follows the Line Color dropdown above.
                        </p>
                        <p className="text-emerald-300 text-xs italic">
                          Does NOT add to footage total (visual decoration only)
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTool === 'area' && currentPoints.length >= 3 && (
                    <button
                      onClick={finishPolygon}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                    >
                      Finish Polygon
                    </button>
                  )}

                  {activeTool === 'tree' && (
                    <div className="mt-3 bg-gray-800 rounded-lg p-4 space-y-3">
                      <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded p-3 mb-3">
                        <p className="text-blue-300 text-xs font-medium mb-1">
                          {treeMeasurementStep === 'width' && 'Step 1: Measure Tree Width (Diameter)'}
                          {treeMeasurementStep === 'height' && 'Step 2: Measure Tree Height'}
                          {!treeMeasurementStep && treeWidth && treeHeight && 'Ready to Add Tree'}
                          {!treeMeasurementStep && !treeWidth && 'Click "Measure Tree" to start'}
                        </p>
                        <p className="text-blue-200 text-xs">
                          {treeMeasurementStep === 'width' && 'Click two points across the tree width'}
                          {treeMeasurementStep === 'height' && 'Click two points for tree height'}
                          {!treeMeasurementStep && treeWidth && treeHeight && 'Click "Add Tree" to add to total'}
                          {!treeMeasurementStep && !treeWidth && 'Green dashed lines show preview'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Tree Width (Diameter)</label>
                        <div className={`px-3 py-2 rounded border text-sm ${
                          treeWidth
                            ? 'bg-green-900 bg-opacity-30 border-green-500 text-green-200'
                            : 'bg-gray-700 border-gray-600 text-white'
                        }`}>
                          {treeWidth ? formatLength(treeWidth) : 'Not measured'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Tree Height</label>
                        <div className={`px-3 py-2 rounded border text-sm ${
                          treeHeight
                            ? 'bg-green-900 bg-opacity-30 border-green-500 text-green-200'
                            : 'bg-gray-700 border-gray-600 text-white'
                        }`}>
                          {treeHeight ? formatLength(treeHeight) : 'Not measured'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Bulb Spacing (C7 bulbs)</label>
                        <select
                          value={wrapSpacing}
                          onChange={(e) => setWrapSpacing(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-green-500 focus:outline-none text-sm"
                        >
                          <option value="4">4" spacing</option>
                          <option value="6">6" spacing</option>
                          <option value="8">8" spacing</option>
                          <option value="12">12" spacing</option>
                          <option value="18">18" spacing</option>
                          <option value="24">24" spacing (Standard)</option>
                          <option value="36">36" spacing</option>
                        </select>
                      </div>

                      <button
                        onClick={handleAddTreeMeasurement}
                        disabled={!treeWidth || !treeHeight}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {treeWidth && treeHeight ? '+ Add Tree to Total' : 'Measure Width & Height First'}
                      </button>

                      {treeWidth && treeHeight && (
                        <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded p-2">
                          <p className="text-green-300 text-xs text-center">
                            ✓ Measurements ready • Click button above to save
                          </p>
                        </div>
                      )}

                      {treeMeasurements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-2">Tree Measurements ({treeMeasurements.length}):</p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {treeMeasurements.map((tree, idx) => (
                              <div key={tree.id} className="text-xs bg-gray-700 rounded p-2">
                                <p className="text-white font-medium">Tree {idx + 1}: {formatLength(tree.value)}</p>
                                <p className="text-gray-400">W: {formatLength(tree.metadata?.width || 0)} × H: {formatLength(tree.metadata?.height || 0)} (Spacing: {tree.metadata?.spacing}")</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3">4. TOOLS</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Undo className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Undo</span>
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Redo className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Redo</span>
                  </button>
                  <button
                    onClick={handleResetTrees}
                    disabled={treeMeasurements.length === 0}
                    className="px-3 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Trees className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Reset Trees</span>
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    <ZoomIn className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Zoom In</span>
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    <ZoomOut className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Zoom Out</span>
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Reset All</span>
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">Reset Zoom</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  QUICK SELECT FROM QUOTES (NEEDS MEASURE)
                </h2>
                <div className="bg-gray-800 rounded-lg p-4">
                  <select
                    value={selectedQuoteId}
                    onChange={(e) => handleQuoteSelection(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">-- Select a Previous Quote --</option>
                    {holidayLightsQuotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.name || 'No Name'} - {quote.phone || quote.email || 'No Contact'}
                      </option>
                    ))}
                  </select>
                  {holidayLightsQuotes.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">No quotes needing measurement found</p>
                  )}
                  {selectedQuoteId && (
                    <p className="text-xs text-green-400 mt-2 text-center">✓ Client info populated below</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3">CLIENT INFO</h2>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Business Name (Optional)"
                    value={clientBusinessName}
                    onChange={(e) => setClientBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={clientZip}
                      onChange={(e) => setClientZip(e.target.value)}
                      className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Sales Rep"
                    value={salesRep}
                    onChange={(e) => setSalesRep(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Email Template</label>
                    <select
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value as 'residential' | 'commercial')}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="residential">🏡 Residential/Homeowner</option>
                      <option value="commercial">🏢 Business/Commercial</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {emailTemplate === 'residential'
                        ? 'Premium home design focused on curb appeal'
                        : 'Business-focused template emphasizing ROI'}
                    </p>
                  </div>
                  <textarea
                    placeholder="Project Notes (optional)"
                    value={projectNarrative}
                    onChange={(e) => setProjectNarrative(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm resize-vertical"
                  />
                </div>
              </div>

              {(measurements.length > 0 || treeMeasurements.length > 0 || getManualInputValue() > 0) && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-300 mb-3">TOTAL</h2>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    {treeMeasurements.length > 0 && (
                      <div className="pb-3 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 text-sm font-medium">Total for Trees:</span>
                          <span className="text-green-400 text-lg font-bold">{formatLength(treeTotal)}</span>
                        </div>
                      </div>
                    )}
                    {measurements.length > 0 && (
                      <div className="pb-3 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-400 text-sm font-medium">Total for House/Property:</span>
                          <span className="text-blue-400 text-lg font-bold">{formatLength(houseTotal)}</span>
                        </div>
                      </div>
                    )}
                    {getManualInputValue() > 0 && (
                      <div className="pb-3 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 text-sm font-medium">Manual Input Total:</span>
                          <span className="text-purple-400 text-lg font-bold">{formatLength(getManualInputValue())}</span>
                        </div>
                      </div>
                    )}
                    <div className="pb-3 border-b border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm font-semibold">Grand Total:</span>
                        <span className="text-white text-xl font-bold">{formatLength(grandTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm font-semibold">Grand Total +10%:</span>
                        <span className="text-green-400 text-xl font-bold">{formatLength(grandTotalPlus10)}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Per Foot Cost (House)</label>
                          <select
                            value={perFootCostHouse}
                            onChange={(e) => setPerFootCostHouse(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                          >
                            <option value={4}>$4</option>
                            <option value={5}>$5</option>
                            <option value={6}>$6</option>
                            <option value={7}>$7</option>
                            <option value={8}>$8</option>
                            <option value={9}>$9</option>
                            <option value={10}>$10</option>
                            <option value={11}>$11</option>
                            <option value={12}>$12</option>
                            <option value={13}>$13</option>
                            <option value={14}>$14</option>
                            <option value={15}>$15</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Per Foot Cost (Trees)</label>
                          <select
                            value={perFootCostTree}
                            onChange={(e) => setPerFootCostTree(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none text-sm"
                          >
                            <option value={1}>$1</option>
                            <option value={1.5}>$1.50</option>
                            <option value={2}>$2</option>
                            <option value={2.5}>$2.50</option>
                            <option value={3}>$3</option>
                            <option value={3.5}>$3.50</option>
                            <option value={4}>$4</option>
                            <option value={4.5}>$4.50</option>
                            <option value={5}>$5</option>
                            <option value={6}>$6</option>
                            <option value={7}>$7</option>
                            <option value={8}>$8</option>
                            <option value={9}>$9</option>
                            <option value={10}>$10</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Discount</label>
                          <select
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
                          >
                            <option value={0}>No Discount</option>
                            {Array.from({ length: 25 }, (_, i) => i + 1).map(pct => (
                              <option key={pct} value={pct}>{pct}% Off</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 mt-3">
                        <span className="text-gray-400 text-xs block mb-2">Quote Amount</span>
                        <div className="space-y-2 text-xs text-gray-300 mb-2">
                          {houseTotal > 0 && (
                            <div className="flex justify-between">
                              <span>House: {formatLength(houseTotal * 1.1)} × ${perFootCostHouse}/ft</span>
                              <span>${(((houseTotal * 1.1) / 12) * perFootCostHouse).toFixed(2)}</span>
                            </div>
                          )}
                          {treeTotal > 0 && (
                            <div className="flex justify-between">
                              <span>Trees: {formatLength(treeTotal * 1.1)} × ${perFootCostTree}/ft</span>
                              <span>${(((treeTotal * 1.1) / 12) * perFootCostTree).toFixed(2)}</span>
                            </div>
                          )}
                          {powerCordTotal > 0 && (
                            <div className="flex justify-between">
                              <span>Power Cord: {formatLength(powerCordTotal * 1.1)} × ${perFootCostPowerCord}/ft</span>
                              <span>${(((powerCordTotal * 1.1) / 12) * perFootCostPowerCord).toFixed(2)}</span>
                            </div>
                          )}
                          {getManualInputValue() > 0 && (
                            <div className="flex justify-between">
                              <span>Manual Input: {formatLength(getManualInputValue() * 1.1)} × ${perFootCostHouse}/ft</span>
                              <span>${(((getManualInputValue() * 1.1) / 12) * perFootCostHouse).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        {discount > 0 && (
                          <div className="pt-2 border-t border-gray-600 mb-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Subtotal:</span>
                              <span className="text-gray-300">${(((houseTotal * 1.1 / 12) * perFootCostHouse) + ((treeTotal * 1.1 / 12) * perFootCostTree) + ((powerCordTotal * 1.1 / 12) * perFootCostPowerCord) + ((getManualInputValue() * 1.1 / 12) * perFootCostHouse)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-yellow-400">Discount ({discount}%):</span>
                              <span className="text-yellow-400">-${((((houseTotal * 1.1 / 12) * perFootCostHouse) + ((treeTotal * 1.1 / 12) * perFootCostTree) + ((powerCordTotal * 1.1 / 12) * perFootCostPowerCord) + ((getManualInputValue() * 1.1 / 12) * perFootCostHouse)) * (discount / 100)).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        <div className={`pt-2 ${discount > 0 ? '' : 'border-t border-gray-600'}`}>
                          <span className="text-green-400 text-2xl font-bold">
                            ${((((houseTotal * 1.1 / 12) * perFootCostHouse) + ((treeTotal * 1.1 / 12) * perFootCostTree) + ((powerCordTotal * 1.1 / 12) * perFootCostPowerCord) + ((getManualInputValue() * 1.1 / 12) * perFootCostHouse)) * (1 - discount / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-3">5. DOWNLOAD</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleExport}
                    disabled={isDownloadDisabled()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download design with measurements"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={handleEmailDesign}
                    disabled={isEmailDisabled() || isSendingEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Email design to recipients"
                  >
                    <Mail className="w-5 h-5" />
                    {isSendingEmail ? 'Sending...' : 'Email Design'}
                  </button>
                  <button
                    onClick={handleEmailCustomerEstimate}
                    disabled={!clientEmail || !clientName || isSendingCustomerEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send professional estimate directly to customer"
                  >
                    <Mail className="w-5 h-5" />
                    {isSendingCustomerEmail ? 'Sending...' : 'Email Customer Estimate'}
                  </button>
                  <button
                    onClick={handleSaveDesign}
                    disabled={isSaveDisabled() || isSendingEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!selectedQuoteId ? 'Select a client first to save design' : 'Save design to client record'}
                  >
                    <Save className="w-5 h-5" />
                    {isSendingEmail ? 'Saving...' : 'Save Design'}
                  </button>
                </div>

                <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Auto-Save</span>
                      <span className="text-xs text-gray-400">Automatically save every 30 seconds</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                  </label>
                  {lastSavedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last saved: {lastSavedAt.toLocaleString()}
                    </div>
                  )}
                  {hasUnsavedChanges && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-xs font-medium text-gray-400 mb-2">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value={10}>10px</option>
            <option value={11}>11px</option>
            <option value={12}>12px</option>
            <option value={13}>13px</option>
            <option value={14}>14px</option>
            <option value={15}>15px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={32}>32px</option>
            <option value={36}>36px</option>
            <option value={38}>38px</option>
            <option value={44}>44px</option>
            <option value={52}>52px</option>
            <option value={60}>60px</option>
            <option value={68}>68px</option>
            <option value={76}>76px</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-400 mb-2">Line Thickness</label>
          <select
            value={lineThickness}
            onChange={(e) => {
              const newThickness = Number(e.target.value);
              console.log('🎨 Line thickness changed:', newThickness);
              setLineThickness(newThickness);
            }}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value={6}>Thin (6px) - Subtle lines</option>
            <option value={10}>Medium (10px) - Standard visibility</option>
            <option value={15}>Thick (15px) - Good contrast</option>
            <option value={20}>Extra Thick (20px) - Holiday lights (Recommended)</option>
            <option value={25}>Very Thick (25px) - Bold visibility</option>
            <option value={30}>Maximum (30px) - Maximum impact</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMeasurementAmounts}
              onChange={(e) => setShowMeasurementAmounts(e.target.checked)}
              className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-xs font-medium text-gray-400">Show Measurement Amounts</span>
          </label>
        </div>

        <button
          onClick={() => setShowDesignGuide(true)}
          className="mt-4 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          <BookOpen className="w-3 h-3" />
          Design Guide
        </button>
        <button
          onClick={handleSignOut}
          className="mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 p-4 lg:p-8 overflow-auto pt-20 lg:pt-8" ref={containerRef}>
        <div className="max-w-6xl mx-auto space-y-6">
          {!image ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Image Loaded</h2>
                <p className="text-gray-500">Upload Photo 1 (Front View) to get started</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-lg p-2 lg:p-4 overflow-auto">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePhoto1}
                        onChange={(e) => setIncludePhoto1(e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        title="Include Photo 1 in download/email"
                      />
                      <h3 className="text-lg font-semibold text-gray-900">Photo 1:</h3>
                    </label>
                    <input
                      type="text"
                      value={photo1Name}
                      onChange={(e) => setPhoto1Name(e.target.value)}
                      className="flex-1 max-w-xs px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter photo name"
                    />
                  </div>
                  <button
                    onClick={() => setActivePhoto('photo1')}
                    className={`px-3 py-1 text-sm rounded ${
                      activePhoto === 'photo1'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {activePhoto === 'photo1' ? 'Active' : 'Switch to Photo 1'}
                  </button>
                </div>
                <div className="inline-block min-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
                  <canvas
                    ref={canvasRef}
                    onClick={(e) => activePhoto === 'photo1' && handleCanvasClick(e)}
                    onTouchStart={(e) => activePhoto === 'photo1' && handleTouchStart(e)}
                    onTouchMove={(e) => activePhoto === 'photo1' && handleTouchMove(e)}
                    onTouchEnd={(e) => activePhoto === 'photo1' && handleTouchEnd(e)}
                    onMouseMove={(e) => activePhoto === 'photo1' && handleCanvasMouseMove(e)}
                    onMouseUp={() => activePhoto === 'photo1' && handleCanvasMouseUp()}
                    onMouseLeave={handleCanvasMouseLeave}
                    onTouchCancel={handleCanvasMouseLeave}
                    className={`w-full h-auto cursor-crosshair border rounded ${
                      activePhoto === 'photo1' ? 'border-blue-500 border-2' : 'border-gray-300'
                    }`}
                    style={{ display: 'block', touchAction: 'none', opacity: activePhoto === 'photo1' ? 1 : 0.6 }}
                  />
                </div>

                {/* Manual Input Box for Photo 1 */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Manual Measurement Input (Feet)
                    </label>
                    <p className="text-xs text-gray-500">
                      Enter additional measurements in feet. This will be added to your total.
                    </p>
                    <input
                      type="number"
                      value={manualInputPhoto1}
                      onChange={(e) => setManualInputPhoto1(e.target.value)}
                      placeholder="Enter measurement in feet (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      min="0"
                      step="0.1"
                    />
                    {getManualInputPhoto1Value() > 0 && (
                      <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                        <span className="text-gray-700">Manual Input:</span>
                        <span className="font-semibold text-blue-600">{formatLength(getManualInputPhoto1Value())}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Power Cord Input for Photo 1 */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 mt-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Power Cord Manual Input (Feet)
                    </label>
                    <p className="text-xs text-gray-500">
                      Enter power cord footage in feet. Priced at ${perFootCostPowerCord.toFixed(2)}/foot.
                    </p>
                    <input
                      type="number"
                      value={manualPowerCordPhoto1}
                      onChange={(e) => setManualPowerCordPhoto1(e.target.value)}
                      placeholder="Enter power cord footage (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      min="0"
                      step="0.1"
                    />
                    {getManualPowerCordPhoto1Value() > 0 && (
                      <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                        <span className="text-gray-700">Power Cord:</span>
                        <span className="font-semibold text-blue-600">{formatLength(getManualPowerCordPhoto1Value())}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {image2 && (
                <div className="bg-white rounded-lg shadow-lg p-2 lg:p-4 overflow-auto">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includePhoto2}
                            onChange={(e) => setIncludePhoto2(e.target.checked)}
                            className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                            title="Include Photo 2 in download/email"
                          />
                          <h3 className="text-lg font-semibold text-gray-900">Photo 2:</h3>
                        </label>
                        <input
                          type="text"
                          value={photo2Name}
                          onChange={(e) => setPhoto2Name(e.target.value)}
                          className="flex-1 max-w-xs px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter photo name"
                        />
                      </div>
                      {multiplySideBy2 && (
                        <p className="text-xs text-green-600 font-medium ml-7 mt-1">× 2 multiplier active (both sides)</p>
                      )}
                    </div>
                    <button
                      onClick={() => setActivePhoto('photo2')}
                      className={`px-3 py-1 text-sm rounded ${
                        activePhoto === 'photo2'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {activePhoto === 'photo2' ? 'Active' : 'Switch to Photo 2'}
                    </button>
                  </div>
                  <div className="inline-block min-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
                    <canvas
                      ref={canvas2Ref}
                      onClick={(e) => activePhoto === 'photo2' && handleCanvasClick(e)}
                      onTouchStart={(e) => activePhoto === 'photo2' && handleTouchStart(e)}
                      onTouchMove={(e) => activePhoto === 'photo2' && handleTouchMove(e)}
                      onTouchEnd={(e) => activePhoto === 'photo2' && handleTouchEnd(e)}
                      onMouseMove={(e) => activePhoto === 'photo2' && handleCanvasMouseMove(e)}
                      onMouseUp={() => activePhoto === 'photo2' && handleCanvasMouseUp()}
                      onMouseLeave={handleCanvasMouseLeave}
                      onTouchCancel={handleCanvasMouseLeave}
                      className={`w-full h-auto cursor-crosshair border rounded ${
                        activePhoto === 'photo2' ? 'border-green-500 border-2' : 'border-gray-300'
                      }`}
                      style={{ display: 'block', touchAction: 'none', opacity: activePhoto === 'photo2' ? 1 : 0.6 }}
                    />
                  </div>

                  {/* Manual Input Box for Photo 2 */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Manual Measurement Input (Feet)
                      </label>
                      <p className="text-xs text-gray-500">
                        Enter additional measurements in feet. This will be added to your total.
                      </p>
                      <input
                        type="number"
                        value={manualInputPhoto2}
                        onChange={(e) => setManualInputPhoto2(e.target.value)}
                        placeholder="Enter measurement in feet (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        min="0"
                        step="0.1"
                      />
                      {getManualInputPhoto2Value() > 0 && (
                        <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                          <span className="text-gray-700">Manual Input:</span>
                          <span className="font-semibold text-green-600">{formatLength(getManualInputPhoto2Value())}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Power Cord Input for Photo 2 */}
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-3 mt-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Power Cord Manual Input (Feet)
                      </label>
                      <p className="text-xs text-gray-500">
                        Enter power cord footage in feet. Priced at ${perFootCostPowerCord.toFixed(2)}/foot.
                      </p>
                      <input
                        type="number"
                        value={manualPowerCordPhoto2}
                        onChange={(e) => setManualPowerCordPhoto2(e.target.value)}
                        placeholder="Enter power cord footage (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        min="0"
                        step="0.1"
                      />
                      {getManualPowerCordPhoto2Value() > 0 && (
                        <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                          <span className="text-gray-700">Power Cord:</span>
                          <span className="font-semibold text-green-600">{formatLength(getManualPowerCordPhoto2Value())}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ReturnToDashboardButton />
      <DesignGuideModal isOpen={showDesignGuide} onClose={() => setShowDesignGuide(false)} />

      {/* Price Confirmation Modal */}
      {showPriceConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Estimate Amount</h2>
              <p className="text-gray-600">Review the total before sending to customer</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Calculated Total (After Discount)</p>
                <p className="text-4xl font-bold text-blue-900">
                  ${confirmedPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {(() => {
                  const breakdown = calculatePricingBreakdown();
                  return (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">${breakdown.subtotal.toFixed(2)}</span>
                      </div>
                      {breakdown.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({breakdown.discount_percent}%):</span>
                          <span className="font-semibold">-${breakdown.discount.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Override Amount (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Enter a custom amount if you need to adjust the price manually
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>This amount will be shown in the email and on the approval page. Double-check before sending!</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPriceConfirmModal(false);
                  setPriceOverride('');
                  setConfirmedPrice(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndSendEmail}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Send Estimate
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Customer: <span className="font-semibold">{clientName}</span> ({clientEmail})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
