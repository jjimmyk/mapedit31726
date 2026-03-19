import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { ChevronDown, ChevronRight, X, Maximize2, Map, CheckCircle } from 'lucide-react';
import svgPaths from '../../imports/svg-7hg6d30srz';

// Object types for Drafting New Data Layer (choose-object dropdown)
const DRAFTING_OBJECT_TYPES = [
  { value: 'nexrad-station', label: 'NEXRAD Station', symbology: '#3b82f6' },
  { value: 'weather-buoy', label: 'Weather Buoy', symbology: '#22c55e' },
  { value: 'observation-point', label: 'Observation Point', symbology: '#f59e0b' },
  { value: 'sensor-station', label: 'Sensor Station', symbology: '#8b5cf6' },
  { value: 'radar-site', label: 'Radar Site', symbology: '#06b6d4' },
] as const;

interface LayersPhaseProps {
  data: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  onComplete: () => void;
  onPrevious?: () => void;
}

export function LayersPhase({ data, onDataChange, onComplete, onPrevious }: LayersPhaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [isIncidentPopoverOpen, setIsIncidentPopoverOpen] = useState(false);
  const [selectedAORs, setSelectedAORs] = useState<string[]>([]);
  const [isAORPopoverOpen, setIsAORPopoverOpen] = useState(false);
  const [weatherExpanded, setWeatherExpanded] = useState(true);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [layerToggles, setLayerToggles] = useState({
    weather: { radar: false, warnings: false }
  });
  const [individualLayerModalOpen, setIndividualLayerModalOpen] = useState(false);
  const [selectedIndividualLayer, setSelectedIndividualLayer] = useState<string | null>(null);
  const [layerVersion, setLayerVersion] = useState('v3');
  const [layerIncidents, setLayerIncidents] = useState<string[]>([]);
  const [layerAORs, setLayerAORs] = useState<string[]>([]);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [addingNewObject, setAddingNewObject] = useState(false);
  const [newObjectName, setNewObjectName] = useState('');
  const [radarPrecipitationVersion, setRadarPrecipitationVersion] = useState('v3');
  const [addingNexradStation, setAddingNexradStation] = useState(false);
  const [nexradName, setNexradName] = useState('');
  const [nexradLatitude, setNexradLatitude] = useState('');
  const [nexradLongitude, setNexradLongitude] = useState('');
  const [nexradStatus, setNexradStatus] = useState('');
  const [nexradDistrict, setNexradDistrict] = useState('');
  const [nexradSector, setNexradSector] = useState('');
  const [nexradDrawingLocation, setNexradDrawingLocation] = useState(false);
  const [nexradDescription, setNexradDescription] = useState('');
  const [draftingObjectType, setDraftingObjectType] = useState<string>('');
  const [addLayerDropdownOpen, setAddLayerDropdownOpen] = useState(false);
  const [arcGISConnected, setArcGISConnected] = useState(false);
  const [showArcGISBrowser, setShowArcGISBrowser] = useState(false);
  const [arcGISSearchTerm, setArcGISSearchTerm] = useState('');
  const [arcGISExpandedLayers, setArcGISExpandedLayers] = useState<Set<string>>(new Set());
  const [arcGISCheckedLayers, setArcGISCheckedLayers] = useState<Set<string>>(new Set());
  const [arcGISFeatureLayersExpanded, setArcGISFeatureLayersExpanded] = useState(true);
  const [arcGISWebMapsExpanded, setArcGISWebMapsExpanded] = useState(true);
  const [weatherLayerSearchTerm, setWeatherLayerSearchTerm] = useState('');
  const [cutterVesselsSearchTerm, setCutterVesselsSearchTerm] = useState('');
  const [boomLayerSearchTerm, setBoomLayerSearchTerm] = useState('');
  const [draftingAORs, setDraftingAORs] = useState<string[]>([]);
  const [draftingAORsOpen, setDraftingAORsOpen] = useState(false);
  const [draftingLayerName, setDraftingLayerName] = useState('');
  const [draftingLayerCategory, setDraftingLayerCategory] = useState('');
  const [savedDraftObjects, setSavedDraftObjects] = useState<Array<{
    id: string;
    type: string;
    label: string;
    symbology: string;
    name: string;
    latitude: string;
    longitude: string;
    description: string;
  }>>([]);
  const [expandedDraftObjects, setExpandedDraftObjects] = useState<Set<string>>(new Set());
  const [viewerPositions, setViewerPositions] = useState<string[]>([]);
  const [viewerTeams, setViewerTeams] = useState<string[]>([]);
  const [editorPositions, setEditorPositions] = useState<string[]>([]);
  const [editorTeams, setEditorTeams] = useState<string[]>([]);

  // Update lat/lon when map click sets coordinates
  useEffect(() => {
    if (data.nexradLat) {
      setNexradLatitude(data.nexradLat);
    }
    if (data.nexradLon) {
      setNexradLongitude(data.nexradLon);
    }
    if (data.drawingNexradLocation !== undefined) {
      setNexradDrawingLocation(data.drawingNexradLocation);
    }
  }, [data.nexradLat, data.nexradLon, data.drawingNexradLocation]);

  // Ensure version is set to v4 when drafting mode is active
  useEffect(() => {
    if (data.isDraftingNewVersion && radarPrecipitationVersion !== 'v4') {
      setRadarPrecipitationVersion('v4');
    }
  }, [data.isDraftingNewVersion, radarPrecipitationVersion]);

  // Available incidents for filtering
  const incidents = [
    'World Cup 2026 - MetLife Stadium Operations',
    'World Cup 2026 - Gillette Stadium Operations',
    'World Cup 2026 - Lincoln Financial Field Operations',
    'Credentialing and Access Control - All Venues',
    'Counter-UAS Operations - Northeast AORs',
    'Mass Gathering Security - Fan Zones'
  ];

  // Available AORs for filtering
  const aors = [
    'Northeast AORs',
    'MetLife Stadium Complex',
    'NYC Metro Area',
    'TSA Screening Operations',
    'CBP Entry Points',
  ];

  // Handler for incident selection
  const toggleIncident = (incident: string) => {
    setSelectedIncidents(prev => 
      prev.includes(incident) 
        ? prev.filter(i => i !== incident)
        : [...prev, incident]
    );
  };

  const clearIncidentFilter = () => {
    setSelectedIncidents([]);
  };

  // Handler for AOR selection
  const toggleAOR = (aor: string) => {
    setSelectedAORs(prev => 
      prev.includes(aor) 
        ? prev.filter(a => a !== aor)
        : [...prev, aor]
    );
  };

  const clearAORFilter = () => {
    setSelectedAORs([]);
  };

  // Toggle individual layer expansion
  const toggleLayer = (layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Calculate selected/total for weather category
  const weatherSelected = [layerToggles.weather.radar, layerToggles.weather.warnings].filter(Boolean).length;
  const weatherTotal = 2;
  const normalizedWeatherSearch = weatherLayerSearchTerm.trim().toLowerCase();
  const showWeatherRadar = normalizedWeatherSearch === '' || 'radar precipitation'.includes(normalizedWeatherSearch);
  const showWeatherWarnings = normalizedWeatherSearch === '' || 'active weather warnings'.includes(normalizedWeatherSearch);

  // Open individual layer modal
  const openIndividualLayerModal = (layerName: string) => {
    setSelectedIndividualLayer(layerName);
    setIndividualLayerModalOpen(true);
  };

  // Get layer objects
  const getLayerObjects = (layerName: string): Array<{ name: string; lastUpdated: string }> => {
    switch (layerName) {
      case 'Radar Precipitation':
        return [
          { name: 'NEXRAD Station KHGX', lastUpdated: '2025-11-15 14:05' },
          { name: 'NEXRAD Station KLCH', lastUpdated: '2025-11-15 14:04' },
          { name: 'NEXRAD Station KLIX', lastUpdated: '2025-11-15 14:05' },
          { name: 'Composite Mosaic', lastUpdated: '2025-11-15 14:05' }
        ];
      case 'Active Weather Warnings':
        return [
          { name: 'Gale Warning Zone 1', lastUpdated: '2025-11-15 13:45' },
          { name: 'Gale Warning Zone 2', lastUpdated: '2025-11-15 13:50' },
          { name: 'Small Craft Advisory Zone 3', lastUpdated: '2025-11-15 14:00' },
          { name: 'Marine Weather Statement', lastUpdated: '2025-11-15 13:30' }
        ];
      default:
        return [];
    }
  };

  // Get object fields
  const getObjectFields = (objectName: string): Array<{ field: string; value: string; source: string; lastUpdated: string }> => {
    if (objectName.includes('KHGX')) {
      return [
        { field: 'Latitude', value: '29.4719', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Longitude', value: '-95.0792', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Status', value: 'Active', source: 'PRATUS', lastUpdated: '2025-11-15 14:03' },
        { field: 'District', value: 'District 8', source: 'PRATUS', lastUpdated: '2025-11-15 14:00' },
        { field: 'Sector', value: 'Houston-Galveston', source: 'CART', lastUpdated: '2025-11-15 14:05' }
      ];
    }
    return [];
  };

  // Toggle object expansion
  const toggleObject = (objectName: string) => {
    setExpandedObjects(prev => {
      const next = new Set(prev);
      if (next.has(objectName)) {
        next.delete(objectName);
      } else {
        next.add(objectName);
      }
      return next;
    });
  };

  // Toggle object selection
  const toggleObjectSelection = (objectName: string) => {
    setSelectedObjects(prev => {
      const next = new Set(prev);
      if (next.has(objectName)) {
        next.delete(objectName);
      } else {
        next.add(objectName);
      }
      return next;
    });
  };

  // Toggle select all objects
  const toggleSelectAllObjects = (layerName: string) => {
    const allObjects = getLayerObjects(layerName).slice(0, 2);
    const allObjectNames = allObjects.map(obj => obj.name);
    const allSelected = allObjectNames.every(name => selectedObjects.has(name));
    
    if (allSelected) {
      setSelectedObjects(prev => {
        const next = new Set(prev);
        allObjectNames.forEach(name => next.delete(name));
        return next;
      });
    } else {
      setSelectedObjects(prev => {
        const next = new Set(prev);
        allObjectNames.forEach(name => next.add(name));
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Section - Sticky */}
      <div className="sticky top-0 z-10 bg-[#222529] rounded-lg border border-[#6e757c] relative">
        <div className="flex items-center justify-between px-[13px] py-3 w-full border-b-2 border-border rounded-t-lg rounded-b-none">
          {/* Title and Search */}
          <div className="flex items-center gap-4">
            <p className="caption text-nowrap text-white whitespace-pre">
              Layers
            </p>
            
            {/* Search Input */}
            <div className="relative h-[26px] w-[195px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="box-border w-full h-[26px] bg-transparent border border-[#6e757c] rounded-[4px] px-[26px] py-[3.25px] caption text-white placeholder:text-[#6e757c] focus:outline-none focus:border-accent"
              />
              <div className="absolute left-[8px] size-[11.375px] top-[7.44px] pointer-events-none">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                  <g>
                    <path d={svgPaths.p3a3bec00} stroke="#6E757C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.710938" />
                    <path d={svgPaths.p380aaa80} stroke="#6E757C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.710938" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Add Category and Add Layer Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Add Category functionality placeholder
                console.log('Add Category clicked');
              }}
              className="bg-[#01669f] h-[22.75px] rounded-[4px] px-3 hover:bg-[#01669f]/90 transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="size-[13px] shrink-0" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                <g>
                  <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                  <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                </g>
              </svg>
              <p className="caption text-nowrap text-white">
                Add Category
              </p>
            </button>
            {/* Add Layer dropdown */}
            <div className="relative">
              <button
                onClick={() => setAddLayerDropdownOpen(prev => !prev)}
                className="bg-[#01669f] h-[22.75px] rounded-[4px] px-3 hover:bg-[#01669f]/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="size-[13px] shrink-0" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                  <g>
                    <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                    <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                  </g>
                </svg>
                <p className="caption text-nowrap text-white">Add Layer</p>
                <ChevronDown className="w-3 h-3 text-white shrink-0" />
              </button>
              {addLayerDropdownOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-[150]"
                    onClick={() => setAddLayerDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-[151] bg-[#222529] border border-[#6e757c] rounded-md shadow-lg overflow-hidden min-w-[180px]">
                    <button
                      className="w-full text-left px-3 py-2 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif", lineHeight: '1.5' }}
                      onClick={() => {
                        setAddLayerDropdownOpen(false);
                        onDataChange({ ...data, isDraftingNewDataLayer: true });
                      }}
                    >
                      <svg width="11" height="11" fill="none" viewBox="0 0 13 13" style={{ flexShrink: 0 }}>
                        <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                        <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                      </svg>
                      Add Internal Layer
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif", lineHeight: '1.5' }}
                      onClick={() => {
                        setAddLayerDropdownOpen(false);
                        setShowArcGISBrowser(true);
                        setArcGISSearchTerm('');
                      }}
                    >
                      <svg width="11" height="11" fill="none" viewBox="0 0 13 13" style={{ flexShrink: 0 }}>
                        <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                        <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                      </svg>
                      Add From ArcGIS
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showArcGISBrowser && (
        <div>
          {/* Back button */}
          <button
            className="flex items-center gap-1.5 mb-3 text-white/60 hover:text-white transition-colors"
            style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif" }}
            onClick={() => setShowArcGISBrowser(false)}
          >
            <ChevronRight width={12} height={12} style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
            Back to Layers
          </button>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={arcGISSearchTerm}
              onChange={(e) => setArcGISSearchTerm(e.target.value)}
              placeholder="Search ArcGIS layers..."
              className="w-full h-[30px] bg-[#222529] border border-[#6e757c] rounded-[4px] px-3 caption text-white placeholder:text-[#6e757c] focus:outline-none focus:border-accent"
            />
          </div>

          {/* Import Selected Layers */}
          <div className="mb-4">
            <button
              className="flex items-center gap-1.5 px-3 h-[26px] rounded border border-[#6e757c] bg-transparent text-white hover:bg-[#6e757c]/20 transition-colors"
              style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif" }}
              onClick={() => {
                if (arcGISCheckedLayers.size > 0) setShowArcGISBrowser(false);
              }}
            >
              Import Selected Layers
              {arcGISCheckedLayers.size > 0 && (
                <span
                  className="ml-0.5 text-white/70"
                  style={{ fontSize: '11px', fontFamily: "'Open Sans', sans-serif" }}
                >
                  ({arcGISCheckedLayers.size})
                </span>
              )}
            </button>
          </div>

          {/* Layer groups */}
          {(() => {
            const featureLayers = [
              { name: 'NWS Active Weather Warnings', owner: 'NWS', type: 'Feature', updated: '2025-11-15', color: 'rgba(220,53,69,0.15)' },
              { name: 'USCG AIS Vessel Tracking', owner: 'USCG', type: 'Feature', updated: '2025-11-14', color: 'rgba(34,197,94,0.15)' },
              { name: 'Oil Spill Response Zones', owner: 'EPA', type: 'Feature', updated: '2025-10-30', color: 'rgba(234,179,8,0.15)' },
              { name: 'Shoreline Sensitivity Index', owner: 'NOAA', type: 'Feature', updated: '2025-09-12', color: 'rgba(245,158,11,0.15)' },
              { name: 'Critical Infrastructure – Gulf Coast', owner: 'DHS', type: 'Feature', updated: '2025-11-01', color: 'rgba(239,68,68,0.15)' },
              { name: 'Coast Guard Sectors Boundaries', owner: 'USCG', type: 'Feature', updated: '2025-07-05', color: 'rgba(99,102,241,0.15)' },
            ];
            const webMaps = [
              { name: 'NOAA Weather Radar (NEXRAD)', owner: 'NOAA', type: 'Raster', updated: '2025-11-15', color: 'rgba(59,130,246,0.15)' },
              { name: 'Federal Staging Areas', owner: 'FEMA', type: 'Feature', updated: '2025-11-10', color: 'rgba(139,92,246,0.15)' },
              { name: 'Pipeline Infrastructure Network', owner: 'PHMSA', type: 'Feature', updated: '2025-10-15', color: 'rgba(249,115,22,0.15)' },
              { name: 'Flood Inundation Forecast', owner: 'NWS', type: 'Raster', updated: '2025-11-13', color: 'rgba(6,182,212,0.15)' },
              { name: 'Protected Marine Areas', owner: 'NOAA', type: 'Feature', updated: '2025-08-20', color: 'rgba(20,184,166,0.15)' },
              { name: 'Satellite Imagery – Gulf AORs', owner: 'NASA', type: 'Imagery', updated: '2025-11-15', color: 'rgba(236,72,153,0.15)' },
            ];

            const filterLayers = (layers: typeof featureLayers) =>
              arcGISSearchTerm === ''
                ? layers
                : layers.filter(l =>
                    l.name.toLowerCase().includes(arcGISSearchTerm.toLowerCase()) ||
                    l.owner.toLowerCase().includes(arcGISSearchTerm.toLowerCase()) ||
                    l.type.toLowerCase().includes(arcGISSearchTerm.toLowerCase())
                  );

            const renderLayerItem = (layer: typeof featureLayers[number]) => (
              <div key={layer.name} className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={arcGISCheckedLayers.has(layer.name)}
                    onCheckedChange={(v) =>
                      setArcGISCheckedLayers((prev) => {
                        const next = new Set(prev);
                        v ? next.add(layer.name) : next.delete(layer.name);
                        return next;
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setArcGISExpandedLayers((prev) => {
                        const next = new Set(prev);
                        next.has(layer.name) ? next.delete(layer.name) : next.add(layer.name);
                        return next;
                      })
                    }
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {arcGISExpandedLayers.has(layer.name) ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">{layer.name}</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Map icon clicked for ArcGIS layer:', layer.name);
                      // Map functionality placeholder
                    }}
                    title="View on map"
                  >
                    <Map className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block w-3 h-3 rounded-[2px]"
                    style={{ backgroundColor: layer.color, border: '1px solid rgba(255,255,255,0.6)' }}
                    aria-hidden
                  />
                </div>
                {arcGISExpandedLayers.has(layer.name) && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">Last Updated: {layer.updated}</div>
                    <div className="text-sm leading-none text-white mt-3">Owner: {layer.owner}</div>
                    <div className="text-sm leading-none text-white mt-3">Type: {layer.type}</div>
                  </div>
                )}
              </div>
            );

            const renderGroup = (
              title: string,
              layers: typeof featureLayers,
              expanded: boolean,
              setExpanded: (v: boolean) => void
            ) => {
              const visible = filterLayers(layers);
              if (arcGISSearchTerm !== '' && visible.length === 0) return null;
              return (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div
                    className={`p-3 ${expanded ? 'border-b border-border' : ''}`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-white flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                      )}
                      <Label className="cursor-pointer">{title}</Label>
                      <span
                        className="ml-1 px-1.5 rounded-full text-white/50"
                        style={{ fontSize: '10px', fontFamily: "'Open Sans', sans-serif" }}
                      >
                        {visible.length}
                      </span>
                    </div>
                  </div>
                  {expanded && (
                    <div className="p-3 space-y-2">
                      {visible.map(renderLayerItem)}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div className="space-y-2">
                {renderGroup('Feature Services', featureLayers, arcGISFeatureLayersExpanded, setArcGISFeatureLayersExpanded)}
                {renderGroup('Web Maps', webMaps, arcGISWebMapsExpanded, setArcGISWebMapsExpanded)}
              </div>
            );
          })()}
        </div>
      )}

      {!showArcGISBrowser && (
      <>
      {/* Connect ArcGIS + Review Queue buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setArcGISConnected(true)}
          className={`border rounded-[4px] h-[26px] px-3 transition-colors flex items-center gap-1.5 ${
            arcGISConnected
              ? 'bg-[#166534] border-[#22c55e] text-white'
              : 'bg-transparent border-[#6e757c] text-white hover:bg-[#6e757c]/20'
          }`}
          style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif" }}
        >
          {arcGISConnected ? (
            <>
              ArcGIS Connected
              <CheckCircle width={12} height={12} strokeWidth={2} style={{ flexShrink: 0, color: '#22c55e' }} />
            </>
          ) : (
            'Connect ArcGIS'
          )}
        </button>
        {arcGISConnected && (
          <button
            onClick={() => setArcGISConnected(false)}
            className="bg-transparent border border-[#6e757c] rounded-[4px] h-[26px] px-3 text-white hover:bg-[#6e757c]/20 transition-colors flex items-center gap-1.5"
            style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif" }}
          >
            Sign Out of ArcGIS
          </button>
        )}
        <button
          onClick={() => console.log('Review Queue clicked')}
          className="bg-transparent border border-[#6e757c] rounded-[4px] h-[26px] px-3 text-white hover:bg-[#6e757c]/20 transition-colors flex items-center gap-1.5"
          style={{ fontSize: '12px', fontFamily: "'Open Sans', sans-serif" }}
        >
          Review Queue
        </button>
      </div>

      {/* Incidents and AORs Filters */}
      <div className="mb-4 flex items-center gap-2">
        {/* Incident Filter - read-only */}
        <div
          className="flex-1 px-4 py-3 bg-[#222529] rounded-lg border border-[#6e757c] relative group"
          title="You can only view and edit layers for this Incident inside its Incident Workspace."
        >
          <div className="flex items-center gap-2">
            <span className="caption text-white whitespace-nowrap">Incident:</span>
            <div
              className="w-[180px] h-[24px] bg-transparent border border-[#6e757c]/50 rounded-[4px] px-2 caption text-white flex items-center justify-between cursor-not-allowed opacity-75"
              style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', fontWeight: 400, lineHeight: '18px' }}
            >
              <span className="truncate" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', fontWeight: 400, lineHeight: '18px' }}>Miami FIFA World Cup</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-30" />
            </div>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-[#14171a] border border-[#6e757c] rounded text-white/90 text-[10px] leading-tight whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            You can only view and edit layers for this Incident inside its Incident Workspace.
          </div>
        </div>

        {/* AOR Filter */}
        <div className="flex-1 px-4 py-3 bg-[#222529] rounded-lg border border-[#6e757c]">
          <div className="flex items-center gap-2">
            <span className="caption text-white whitespace-nowrap">AOR:</span>
            <Popover open={isAORPopoverOpen} onOpenChange={setIsAORPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="w-[180px] h-[24px] bg-transparent border border-[#6e757c] rounded-[4px] px-2 caption text-white focus:outline-none focus:border-accent cursor-pointer flex items-center justify-between"
                  style={{ 
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '18px'
                  }}
                >
                  {selectedAORs.length === 0 
                    ? 'All AORs' 
                    : selectedAORs.length === 1 
                    ? selectedAORs[0]
                    : `${selectedAORs.length} selected`}
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                <Command className="bg-[#222529]">
                  <CommandInput 
                    placeholder="Search AOR..." 
                    className="h-9 caption text-white"
                    style={{ 
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '18px'
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="caption text-white/70 p-2">No AOR found.</CommandEmpty>
                    <CommandGroup>
                      {aors.map((aor) => (
                        <CommandItem
                          key={aor}
                          value={aor}
                          onSelect={() => toggleAOR(aor)}
                          className="caption text-white cursor-pointer hover:bg-[#14171a] data-[selected=true]:bg-[#14171a]"
                          style={{ 
                            fontFamily: "'Open Sans', sans-serif",
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: '18px'
                          }}
                        >
                          <Checkbox
                            checked={selectedAORs.includes(aor)}
                            className="mr-2 h-3 w-3 border-white data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                          />
                          {aor}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedAORs.length > 0 && (
              <button
                onClick={clearAORFilter}
                className="p-1 hover:bg-muted/30 rounded transition-colors"
                title="Clear filter"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weather Category */}
      <div
        className="border border-border rounded-lg overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)'
        }}
      >
        <div className={`p-3 ${weatherExpanded ? 'border-b border-border' : ''}`}>
          <div className="flex items-start justify-between">
            <div
              className="flex items-start gap-2 flex-1"
            >
              <div
                className="cursor-pointer"
                onClick={() => setWeatherExpanded((v) => !v)}
              >
                {weatherExpanded ? (
                  <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                )}
              </div>
              <Checkbox
                checked={weatherSelected === weatherTotal}
                onCheckedChange={(v) => {
                  const allChecked = !!v;
                  setLayerToggles((prev) => ({
                    ...prev,
                    weather: { radar: allChecked, warnings: allChecked },
                  }));
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: '3px' }}
              />
              <Label
                className="cursor-pointer"
                onClick={() => setWeatherExpanded((v) => !v)}
              >
                Weather
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={() => {
                  // View all layers functionality placeholder
                  console.log('View all weather layers');
                }}
                title="View all layers"
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
        {weatherExpanded && (
          <div className="p-3 space-y-2">
            <div className="relative mb-2">
              <input
                type="text"
                value={weatherLayerSearchTerm}
                onChange={(e) => setWeatherLayerSearchTerm(e.target.value)}
                placeholder="Search weather layers..."
                className="w-full h-[26px] bg-transparent border border-[#6e757c] rounded-[4px] px-3 caption text-white placeholder:text-[#6e757c] focus:outline-none focus:border-accent"
              />
            </div>

            {/* Radar Precipitation */}
            {showWeatherRadar && (
            <div 
              className={`rounded-md bg-card/30 transition-all duration-300 ${data.isDraftingNewVersion ? 'fixed inset-0 overflow-y-auto' : 'overflow-hidden'}`}
              style={{
                border: data.isDraftingNewVersion ? '2px solid #3b82f6' : '1px solid rgba(110, 117, 124, 0.3)',
                boxShadow: data.isDraftingNewVersion ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.2)' : 'none',
                backgroundColor: data.isDraftingNewVersion ? '#1a1d21' : undefined,
                ...(data.isDraftingNewVersion ? {
                  width: '33.33vw',
                  height: '100vh',
                  zIndex: 100,
                  left: 0,
                  top: 0
                } : {})
              }}
            >
              {/* Blue Pill - Drafting Status */}
              {data.isDraftingNewVersion && (
                <div className="px-4 pt-4 pb-2">
                  <div 
                    className="px-4 py-2 rounded-full border border-blue-500/50 text-white font-medium text-sm inline-block"
                    style={{
                      backgroundColor: '#1e3a8a',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.15)'
                    }}
                  >
                    Drafting New Version of Radar Precipitation
                  </div>
                </div>
              )}
              
              {!data.isDraftingNewVersion && (
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.weather.radar}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        weather: { ...prev.weather, radar: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('weather-radar')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('weather-radar') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Radar Precipitation</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Radar Precipitation');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Map icon clicked for Radar Precipitation');
                      // Map functionality placeholder
                    }}
                    title="View on map"
                  >
                    <Map className="w-3 h-3 text-white" />
                  </Button>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#3b82f6' }}
                    aria-hidden
                  ></div>
                </div>
              )}
              {(expandedLayers.has('weather-radar') || data.isDraftingNewVersion) && (
                <div className="px-4 py-4">
                  {/* Draft New Version Button */}
                  {!data.isDraftingNewVersion && (
                    <>
                      <button
                        onClick={() => {
                          setRadarPrecipitationVersion('v4');
                          setExpandedLayers(prev => {
                            const next = new Set(prev);
                            next.add('weather-radar');
                            return next;
                          });
                          onDataChange({
                            ...data,
                            isDraftingNewVersion: true,
                            draftingLayerName: 'Radar Precipitation'
                          });
                        }}
                        className="bg-[#01669f] h-[22.75px] rounded-[4px] hover:bg-[#01669f]/90 transition-colors flex items-center gap-2 px-4"
                      >
                        <div className="size-[13px] flex-shrink-0">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                            <g>
                              <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                              <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                            </g>
                          </svg>
                        </div>
                        <p className="caption text-nowrap text-white">
                          Draft New Version
                        </p>
                      </button>
                      
                      {/* Spacer */}
                      <div style={{ height: '32px' }}></div>
                    </>
                  )}
                  
                  {/* Submit and Cancel Buttons */}
                  {data.isDraftingNewVersion && (
                    <div className="mb-4 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={() => {
                          console.log('Submit to Section Chief');
                          // Submit functionality placeholder
                        }}
                      >
                        Submit to Section Chief
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Cancel');
                          // Cancel functionality placeholder
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  {/* Version Selector */}
                  <div className="mb-4">
                    <Select value={radarPrecipitationVersion} onValueChange={setRadarPrecipitationVersion}>
                      <SelectTrigger className="bg-[#1a1d21] border-border text-white h-8 w-full text-xs">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222529] border-[#6e757c] w-[350px]">
                        <SelectItem value="v4" className="text-white text-xs">
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>v4 (Draft) In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="v3" className="text-white text-xs">
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>v3 (Latest)</span>
                            <span className="text-white/50">2025-11-15 14:05</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="v2" className="text-white text-xs">
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>v2</span>
                            <span className="text-white/50">2025-10-20 09:30</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="v1" className="text-white text-xs">
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>v1</span>
                            <span className="text-white/50">2025-09-10 16:45</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm leading-none text-white">
                    Last Updated: 2025-11-15 14:05 UTC
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    AORs: Gulf Coast AORs
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Incident: Miami FIFA World Cup
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Type: data layer
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Sources: CART, PRATUS
                  </div>
                  
                  {/* Objects Section */}
                  <div className="mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm leading-none text-white font-semibold">
                        Objects
                      </div>
                      {data.isDraftingNewVersion && (
                        <button
                          onClick={() => {
                            setAddingNexradStation(true);
                            setNexradName('');
                            setNexradLatitude('');
                            setNexradLongitude('');
                            setNexradStatus('');
                            setNexradDistrict('');
                            setNexradSector('');
                          }}
                          className="bg-black h-[22.75px] rounded-[4px] hover:bg-black/80 transition-colors border border-border text-white flex items-center gap-2 px-3"
                        >
                          <div className="size-[13px] flex-shrink-0">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                              <g>
                                <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                                <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                              </g>
                            </svg>
                          </div>
                          <span className="caption text-nowrap text-white">Add NEXRAD Station</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Spacer */}
                    <div style={{ height: '32px' }}></div>
                    
                    {/* Symbology Section */}
                    {data.isDraftingNewVersion && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-white text-xs">Symbology:</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: '#3b82f6' }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {/* Add NEXRAD Station - Edit State */}
                      {addingNexradStation && (
                        <div 
                          className="rounded-md bg-[#1a1d21] p-4 relative"
                          style={{
                            border: '2px solid white',
                            zIndex: 10
                          }}
                        >
                          {/* Object Type Field */}
                          <div className="mb-[22px] flex items-center gap-2">
                            <span className="text-white text-xs">Object Type:</span>
                            <span className="text-white text-sm">NEXRAD Station</span>
                          </div>
                          
                          {/* Symbology */}
                          <div className="mb-4 flex items-center gap-2">
                            <span className="text-white text-xs">Symbology:</span>
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: '#3b82f6' }}
                            ></div>
                          </div>
                          
                          <div className="mb-4">
                            <Input
                              value={nexradName}
                              onChange={(e) => setNexradName(e.target.value)}
                              placeholder="Enter NEXRAD Station name..."
                              className="bg-[#222529] border-border text-white font-semibold"
                            />
                          </div>
                          
                          {/* Location Section */}
                          <div className="mb-4">
                            <Label className="text-white text-xs mb-2 block">Location</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newDrawingState = !nexradDrawingLocation;
                                setNexradDrawingLocation(newDrawingState);
                                onDataChange({
                                  ...data,
                                  drawingNexradLocation: newDrawingState
                                });
                              }}
                              className="mb-3"
                              style={{
                                backgroundColor: nexradDrawingLocation ? '#60a5fa' : 'transparent',
                                borderColor: nexradDrawingLocation ? '#60a5fa' : undefined,
                                color: nexradDrawingLocation ? 'white' : undefined
                              }}
                            >
                              Draw Location
                            </Button>
                            
                            {/* Latitude and Longitude Inputs */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label className="text-white text-xs mb-1 block">Latitude</Label>
                                <Input
                                  value={nexradLatitude}
                                  onChange={(e) => setNexradLatitude(e.target.value)}
                                  placeholder="e.g., 29.4719"
                                  className="bg-[#222529] border-border text-white"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <Label className="text-white text-xs mb-1 block">Longitude</Label>
                                <Input
                                  value={nexradLongitude}
                                  onChange={(e) => setNexradLongitude(e.target.value)}
                                  placeholder="e.g., -95.0792"
                                  className="bg-[#222529] border-border text-white"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Input */}
                          <div className="mb-3">
                            <Label className="text-white text-xs mb-2 block">Status</Label>
                            <Input
                              value={nexradStatus}
                              onChange={(e) => setNexradStatus(e.target.value)}
                              placeholder="e.g., Active"
                              className="bg-[#222529] border-border text-white"
                            />
                          </div>
                          
                          {/* District Input */}
                          <div className="mb-3">
                            <Label className="text-white text-xs mb-2 block">District</Label>
                            <Input
                              value={nexradDistrict}
                              onChange={(e) => setNexradDistrict(e.target.value)}
                              placeholder="e.g., District 8"
                              className="bg-[#222529] border-border text-white"
                            />
                          </div>
                          
                          {/* Sector Input */}
                          <div className="mb-4">
                            <Label className="text-white text-xs mb-2 block">Sector</Label>
                            <Input
                              value={nexradSector}
                              onChange={(e) => setNexradSector(e.target.value)}
                              placeholder="e.g., Houston-Galveston"
                              className="bg-[#222529] border-border text-white"
                            />
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="text-white"
                              style={{ backgroundColor: '#2563eb' }}
                              onClick={() => {
                                console.log('Save NEXRAD Station:', {
                                  name: nexradName,
                                  latitude: nexradLatitude,
                                  longitude: nexradLongitude,
                                  status: nexradStatus,
                                  district: nexradDistrict,
                                  sector: nexradSector
                                });
                                setAddingNexradStation(false);
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAddingNexradStation(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* NEXRAD Station KHGX */}
                      <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                        <div className="flex items-center gap-3 py-2 px-3">
                          <button
                            type="button"
                            onClick={() => toggleLayer('weather-radar-khgx')}
                            className="flex items-center gap-1 flex-1 bg-transparent p-0"
                          >
                            {expandedLayers.has('weather-radar-khgx') ? (
                              <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                            )}
                            <Label className="cursor-pointer flex-1 text-sm">NEXRAD Station KHGX</Label>
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => {
                              console.log('Map icon clicked for KHGX');
                              // Map functionality placeholder
                            }}
                            title="View on map"
                          >
                            <Map className="w-3 h-3 text-white" />
                          </Button>
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6' }}
                          ></div>
                        </div>
                        {expandedLayers.has('weather-radar-khgx') && (
                          <div className="px-4 py-3 border-t border-border/30">
                            <div className="text-xs leading-none text-white">
                              Last Updated: 2025-11-15 14:05 UTC
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Latitude: 29.4719 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Longitude: -95.0792 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Status: Active {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              District: District 8 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Sector: Houston-Galveston {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* NEXRAD Station KLCH */}
                      <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                        <div className="flex items-center gap-3 py-2 px-3">
                          <button
                            type="button"
                            onClick={() => toggleLayer('weather-radar-klch')}
                            className="flex items-center gap-1 flex-1 bg-transparent p-0"
                          >
                            {expandedLayers.has('weather-radar-klch') ? (
                              <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                            )}
                            <Label className="cursor-pointer flex-1 text-sm">NEXRAD Station KLCH</Label>
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => {
                              console.log('Map icon clicked for KLCH');
                              // Map functionality placeholder
                            }}
                            title="View on map"
                          >
                            <Map className="w-3 h-3 text-white" />
                          </Button>
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6' }}
                          ></div>
                        </div>
                        {expandedLayers.has('weather-radar-klch') && (
                          <div className="px-4 py-3 border-t border-border/30">
                            <div className="text-xs leading-none text-white">
                              Last Updated: 2025-11-15 14:04 UTC
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Latitude: 30.1253 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Longitude: -93.2161 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Status: Active {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              District: District 8 {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                            <div className="text-xs leading-none text-white mt-2">
                              Sector: Lake Charles {data.isDraftingNewVersion && <span className="text-white/50">Data Source: PRATUS</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Permissions Section */}
                  {data.isDraftingNewVersion && (
                    <div className="mt-6 border-t border-border pt-4">
                      <div className="text-sm font-semibold text-white mb-4">Permissions</div>
                      
                      {/* Viewer Permissions */}
                      <div className="mb-4">
                        <Label className="text-white text-xs mb-2 block">Viewer</Label>
                        
                        <div className="flex gap-2">
                          {/* Positions */}
                          <div className="flex-1">
                            <Label className="text-white/70 text-xs mb-1 block">Positions</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {viewerPositions.length > 0 ? `${viewerPositions.length} selected` : 'Select positions'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                                <Command className="bg-[#222529]">
                                  <CommandInput placeholder="Search positions..." className="text-white" />
                                  <CommandList>
                                    <CommandEmpty className="text-white">No positions found.</CommandEmpty>
                                    <CommandGroup>
                                      {['Planning Section Chief', 'Operations Section Chief', 'Logistics Section Chief', 'Finance Section Chief'].map((position) => (
                                        <CommandItem
                                          key={position}
                                          onSelect={() => {
                                            setViewerPositions(prev =>
                                              prev.includes(position)
                                                ? prev.filter(p => p !== position)
                                                : [...prev, position]
                                            );
                                          }}
                                          className="text-white"
                                        >
                                          <Checkbox
                                            checked={viewerPositions.includes(position)}
                                            className="mr-2"
                                          />
                                          {position}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          {/* Teams */}
                          <div className="flex-1">
                            <Label className="text-white/70 text-xs mb-1 block">Teams</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {viewerTeams.length > 0 ? `${viewerTeams.length} selected` : 'Select teams'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                                <Command className="bg-[#222529]">
                                  <CommandInput placeholder="Search teams..." className="text-white" />
                                  <CommandList>
                                    <CommandEmpty className="text-white">No teams found.</CommandEmpty>
                                    <CommandGroup>
                                      {['Response Team Alpha', 'Response Team Beta', 'Analysis Team', 'Field Operations'].map((team) => (
                                        <CommandItem
                                          key={team}
                                          onSelect={() => {
                                            setViewerTeams(prev =>
                                              prev.includes(team)
                                                ? prev.filter(t => t !== team)
                                                : [...prev, team]
                                            );
                                          }}
                                          className="text-white"
                                        >
                                          <Checkbox
                                            checked={viewerTeams.includes(team)}
                                            className="mr-2"
                                          />
                                          {team}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      
                      {/* Editor Permissions */}
                      <div>
                        <Label className="text-white text-xs mb-2 block">Editor</Label>
                        
                        <div className="flex gap-2">
                          {/* Positions */}
                          <div className="flex-1">
                            <Label className="text-white/70 text-xs mb-1 block">Positions</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {editorPositions.length > 0 ? `${editorPositions.length} selected` : 'Select positions'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                                <Command className="bg-[#222529]">
                                  <CommandInput placeholder="Search positions..." className="text-white" />
                                  <CommandList>
                                    <CommandEmpty className="text-white">No positions found.</CommandEmpty>
                                    <CommandGroup>
                                      {['Planning Section Chief', 'Operations Section Chief', 'Logistics Section Chief', 'Finance Section Chief'].map((position) => (
                                        <CommandItem
                                          key={position}
                                          onSelect={() => {
                                            setEditorPositions(prev =>
                                              prev.includes(position)
                                                ? prev.filter(p => p !== position)
                                                : [...prev, position]
                                            );
                                          }}
                                          className="text-white"
                                        >
                                          <Checkbox
                                            checked={editorPositions.includes(position)}
                                            className="mr-2"
                                          />
                                          {position}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          {/* Teams */}
                          <div className="flex-1">
                            <Label className="text-white/70 text-xs mb-1 block">Teams</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {editorTeams.length > 0 ? `${editorTeams.length} selected` : 'Select teams'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                                <Command className="bg-[#222529]">
                                  <CommandInput placeholder="Search teams..." className="text-white" />
                                  <CommandList>
                                    <CommandEmpty className="text-white">No teams found.</CommandEmpty>
                                    <CommandGroup>
                                      {['Response Team Alpha', 'Response Team Beta', 'Analysis Team', 'Field Operations'].map((team) => (
                                        <CommandItem
                                          key={team}
                                          onSelect={() => {
                                            setEditorTeams(prev =>
                                              prev.includes(team)
                                                ? prev.filter(t => t !== team)
                                                : [...prev, team]
                                            );
                                          }}
                                          className="text-white"
                                        >
                                          <Checkbox
                                            checked={editorTeams.includes(team)}
                                            className="mr-2"
                                          />
                                          {team}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Active Weather Warnings */}
            {showWeatherWarnings && (
            <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
              <div className="flex items-center gap-3 py-3 px-3">
                <Checkbox
                  checked={layerToggles.weather.warnings}
                  onCheckedChange={(v) =>
                    setLayerToggles((prev) => ({
                      ...prev,
                      weather: { ...prev.weather, warnings: !!v },
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => toggleLayer('weather-warnings')}
                  className="flex items-center gap-1 flex-1 bg-transparent p-0"
                >
                  {expandedLayers.has('weather-warnings') ? (
                    <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                  )}
                  <Label className="cursor-pointer flex-1">Active Weather Warnings</Label>
                </button>
                <span
                  className="caption px-2 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: '#22c55e20',
                    color: '#22c55e',
                    border: '1px solid #22c55e60'
                  }}
                >
                  ArcGIS Hosted
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    openIndividualLayerModal('Active Weather Warnings');
                  }}
                  title="View layer details"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Map icon clicked for Active Weather Warnings');
                    // Map functionality placeholder
                  }}
                  title="View on map"
                >
                  <Map className="w-3 h-3 text-white" />
                </Button>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#3b82f6' }}
                  aria-hidden
                ></div>
              </div>
              {expandedLayers.has('weather-warnings') && (
                <div className="px-4 py-4">
                  <div className="text-sm leading-none text-white">
                    Last Updated: 2025-11-15 14:02 UTC
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    AORs: Gulf Coast AORs
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Incident: Miami FIFA World Cup
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Type: data layer
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Sources: CART
                  </div>
                </div>
              )}
            </div>
            )}
            {!showWeatherRadar && !showWeatherWarnings && (
              <div className="caption text-white/50 px-1 py-2">No matching weather layers.</div>
            )}
          </div>
        )}
      </div>

      {/* Cutter Vessels Category */}
      <div
        className="border border-border rounded-lg overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)'
        }}
      >
        <div className={`p-3 ${expandedLayers.has('cutter-vessels') ? 'border-b border-border' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div
                className="cursor-pointer"
                onClick={() => toggleLayer('cutter-vessels')}
              >
                {expandedLayers.has('cutter-vessels') ? (
                  <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                )}
              </div>
              <Checkbox
                checked={false}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: '3px' }}
              />
              <Label
                className="cursor-pointer"
                onClick={() => toggleLayer('cutter-vessels')}
              >
                Cutter Vessels
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={() => openIndividualLayerModal('Cutter Vessels')}
                title="View layer details"
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
        {expandedLayers.has('cutter-vessels') && (
          <div className="p-3 space-y-2">
            <div className="relative mb-2">
              <input
                type="text"
                value={cutterVesselsSearchTerm}
                onChange={(e) => setCutterVesselsSearchTerm(e.target.value)}
                placeholder="Search cutter vessels..."
                className="w-full h-[26px] bg-transparent border border-[#6e757c] rounded-[4px] px-3 caption text-white placeholder:text-[#6e757c] focus:outline-none focus:border-accent"
              />
            </div>
            <div className="caption text-white/50">No objects added yet.</div>
          </div>
        )}
      </div>

      {/* Boom Category */}
      <div
        className="border border-border rounded-lg overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)'
        }}
      >
        <div className={`p-3 ${expandedLayers.has('boom') ? 'border-b border-border' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div
                className="cursor-pointer"
                onClick={() => toggleLayer('boom')}
              >
                {expandedLayers.has('boom') ? (
                  <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                )}
              </div>
              <Checkbox
                checked={false}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: '3px' }}
              />
              <Label
                className="cursor-pointer"
                onClick={() => toggleLayer('boom')}
              >
                Boom
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={() => openIndividualLayerModal('Boom')}
                title="View layer details"
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
        {expandedLayers.has('boom') && (
          <div className="p-3 space-y-2">
            <div className="relative mb-2">
              <input
                type="text"
                value={boomLayerSearchTerm}
                onChange={(e) => setBoomLayerSearchTerm(e.target.value)}
                placeholder="Search boom layers..."
                className="w-full h-[26px] bg-transparent border border-[#6e757c] rounded-[4px] px-3 caption text-white placeholder:text-[#6e757c] focus:outline-none focus:border-accent"
              />
            </div>
            <div className="caption text-white/50">No objects added yet.</div>
          </div>
        )}
      </div>

      {/* New Data Layer Overlay */}
      {data.isDraftingNewDataLayer && (
        <div 
          className="fixed inset-0 overflow-y-auto rounded-md bg-card/30 transition-all duration-300"
          style={{
            border: '2px solid #3b82f6',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.2)',
            backgroundColor: '#1a1d21',
            width: '33.33vw',
            height: '100vh',
            zIndex: 100,
            left: 0,
            top: 0
          }}
        >
          {/* Blue Pill - Drafting Status */}
          <div className="px-4 pt-4 pb-2">
            <div 
              className="px-4 py-2 rounded-full border border-blue-500/50 text-white font-medium text-sm inline-block"
              style={{
                backgroundColor: '#1e3a8a',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.15)'
              }}
            >
              Drafting New Data Layer
            </div>
          </div>
          
          <div className="px-4 py-4">
            {/* Version Selector */}
            <div className="mb-4">
              <Select value="v1" disabled>
                <SelectTrigger className="bg-[#1a1d21] border-border text-white h-8 w-full text-xs">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent className="bg-[#222529] border-[#6e757c] w-[350px]">
                  <SelectItem value="v1" className="text-white text-xs">
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>v1 (Draft) In Progress</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm leading-none text-white">
              Last Updated: N/A
            </div>
            <div className="text-sm leading-none text-white mt-3">
              Type: Data Layer
            </div>
            <div className="text-sm leading-none text-white mt-3">
              Sources: PRATUS
            </div>

            {/* Layer Name */}
            <div className="mt-3">
              <Label className="text-white text-xs mb-1 block">Layer Name</Label>
              <Input
                value={draftingLayerName}
                onChange={(e) => setDraftingLayerName(e.target.value)}
                placeholder="Enter data layer name..."
                className="bg-[#222529] border-border text-white text-sm h-8"
              />
            </div>

            {/* Incident */}
            <div className="mt-3">
              <Label className="text-white text-xs mb-1 block">Incident</Label>
              <div className="relative group">
                <div
                  className="w-full h-8 bg-[#222529] border border-border rounded-md px-3 text-white text-xs flex items-center justify-between cursor-not-allowed opacity-75"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  <span className="truncate">Miami FIFA World Cup</span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-30" />
                </div>
                <div
                  className="absolute bottom-full left-0 mb-2 px-2 py-1.5 bg-[#14171a] border border-[#6e757c] rounded text-white/90 text-[10px] leading-tight whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  Map Layers created in Incident Workspace must be associated with the current Incident.
                </div>
              </div>
            </div>

            {/* AORs */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm leading-none text-white shrink-0">AORs:</span>
              <Popover open={draftingAORsOpen} onOpenChange={setDraftingAORsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 bg-transparent border-border text-white hover:bg-muted/50 text-xs justify-between min-w-[160px]"
                  >
                    <span className="truncate">
                      {draftingAORs.length === 0
                        ? 'Select AORs...'
                        : draftingAORs.length === 1
                        ? draftingAORs[0]
                        : `${draftingAORs.length} selected`}
                    </span>
                    <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 200 }} align="start">
                  <Command className="bg-[#222529]">
                    <CommandInput placeholder="Search AORs..." className="h-8 text-white text-xs" />
                    <CommandList>
                      <CommandEmpty className="text-white/70 p-2 text-xs">No AOR found.</CommandEmpty>
                      <CommandGroup>
                        {[
                          'Gulf Coast AORs',
                          'Mid-Atlantic AORs',
                          'Northeast AORs',
                          'Southeast AORs',
                          'Pacific AORs',
                        ].map((aor) => (
                          <CommandItem
                            key={aor}
                            onSelect={() =>
                              setDraftingAORs(prev =>
                                prev.includes(aor) ? prev.filter(a => a !== aor) : [...prev, aor]
                              )
                            }
                            className="text-white cursor-pointer text-xs"
                          >
                            <Checkbox
                              checked={draftingAORs.includes(aor)}
                              className="mr-2 h-3 w-3 pointer-events-none"
                            />
                            {aor}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div className="mt-3">
              <Label className="text-white text-xs mb-1 block">Category</Label>
              <Select value={draftingLayerCategory} onValueChange={setDraftingLayerCategory}>
                <SelectTrigger className="bg-[#222529] border-border text-white h-8 w-full text-xs">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-[#222529] border-[#6e757c]" style={{ zIndex: 200 }}>
                  <SelectItem value="weather" className="text-white text-xs">Weather</SelectItem>
                  <SelectItem value="cutter-vessels" className="text-white text-xs">Cutter Vessels</SelectItem>
                  <SelectItem value="boom" className="text-white text-xs">Boom</SelectItem>
                  <SelectItem value="infrastructure" className="text-white text-xs">Infrastructure</SelectItem>
                  <SelectItem value="operations" className="text-white text-xs">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Objects Section */}
            <div className="mt-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-sm leading-none text-white font-semibold">
                  Objects
                </div>
                {!addingNexradStation && (
                  <button
                    onClick={() => {
                      setAddingNexradStation(true);
                      setDraftingObjectType('');
                      setNexradName('');
                      setNexradLatitude('');
                      setNexradLongitude('');
                      setNexradDescription('');
                    }}
                    className="bg-black h-[22.75px] rounded-[4px] hover:bg-black/80 transition-colors border border-border text-white flex items-center gap-2 px-3"
                  >
                    <div className="size-[13px] flex-shrink-0">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                        <g>
                          <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                          <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                        </g>
                      </svg>
                    </div>
                    <span className="caption text-nowrap text-white">Add Object</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mt-3">
                {/* Add Object - Edit State (shown on click of + Add Object) */}
                {addingNexradStation && (() => {
                  const selectedObj = DRAFTING_OBJECT_TYPES.find(t => t.value === draftingObjectType);
                  return (
                  <div 
                    className="rounded-md bg-[#1a1d21] p-4 relative"
                    style={{ border: '2px solid white', zIndex: 10 }}
                  >
                    {/* Choose Object dropdown (replaces static Object Type) */}
                    <div className="mb-4 flex items-center gap-2">
                      <Label className="text-white text-xs shrink-0">Choose Object:</Label>
                      <Select
                        value={draftingObjectType}
                        onValueChange={(v) => setDraftingObjectType(v)}
                      >
                        <SelectTrigger className="bg-[#222529] border-border text-white h-8 w-[180px] text-xs">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#222529] border-[#6e757c]" style={{ zIndex: 200 }}>
                          {DRAFTING_OBJECT_TYPES.map((obj) => (
                            <SelectItem key={obj.value} value={obj.value} className="text-white text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0 inline-block" style={{ backgroundColor: obj.symbology }} />
                                {obj.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Symbology - shown once an object type is selected */}
                    {selectedObj && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-white text-xs">Symbology:</span>
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: selectedObj.symbology }}
                        />
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <Label className="text-white text-xs mb-2 block">Object Name</Label>
                      <Input
                        value={nexradName}
                        onChange={(e) => setNexradName(e.target.value)}
                        placeholder={selectedObj ? `Enter ${selectedObj.label} name...` : 'Enter object name...'}
                        className="bg-[#222529] border-border text-white font-semibold"
                      />
                    </div>
                    
                    {/* Location Section */}
                    <div className="mb-4">
                      <Label className="text-white text-xs mb-2 block">Location</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDrawingState = !nexradDrawingLocation;
                          setNexradDrawingLocation(newDrawingState);
                          onDataChange({
                            ...data,
                            drawingNexradLocation: newDrawingState
                          });
                        }}
                        className="mb-3"
                        style={{
                          backgroundColor: nexradDrawingLocation ? '#60a5fa' : 'transparent',
                          borderColor: nexradDrawingLocation ? '#60a5fa' : undefined,
                          color: nexradDrawingLocation ? 'white' : undefined
                        }}
                      >
                        Draw Location
                      </Button>
                      
                      {/* Latitude and Longitude Inputs */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-white text-xs mb-1 block">Latitude</Label>
                          <Input
                            value={nexradLatitude}
                            onChange={(e) => setNexradLatitude(e.target.value)}
                            placeholder="e.g., 29.4719"
                            className="bg-[#222529] border-border text-white"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Label className="text-white text-xs mb-1 block">Longitude</Label>
                          <Input
                            value={nexradLongitude}
                            onChange={(e) => setNexradLongitude(e.target.value)}
                            placeholder="e.g., -95.0792"
                            className="bg-[#222529] border-border text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Description Input */}
                    <div className="mb-4">
                      <Label className="text-white text-xs mb-2 block">Description</Label>
                      <textarea
                        value={nexradDescription}
                        onChange={(e) => setNexradDescription(e.target.value)}
                        placeholder="Enter a description..."
                        rows={3}
                        className="w-full bg-[#222529] border border-border text-white text-sm rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent placeholder:text-white/40"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={() => {
                          if (draftingObjectType) {
                            const objType = DRAFTING_OBJECT_TYPES.find(t => t.value === draftingObjectType);
                            if (objType) {
                              const newObj = {
                                id: `obj-${Date.now()}`,
                                type: draftingObjectType,
                                label: objType.label,
                                symbology: objType.symbology,
                                name: nexradName || objType.label,
                                latitude: nexradLatitude,
                                longitude: nexradLongitude,
                                description: nexradDescription,
                              };
                              setSavedDraftObjects(prev => [...prev, newObj]);
                            }
                          }
                          setAddingNexradStation(false);
                          setDraftingObjectType('');
                          setNexradName('');
                          setNexradLatitude('');
                          setNexradLongitude('');
                          setNexradDescription('');
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddingNexradStation(false);
                          setDraftingObjectType('');
                          setNexradName('');
                          setNexradLatitude('');
                          setNexradLongitude('');
                          setNexradDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  );
                })()}

                {/* Saved Objects List */}
                {savedDraftObjects.map((obj) => {
                  const isExpanded = expandedDraftObjects.has(obj.id);
                  return (
                    <div key={obj.id} className="border border-border/40 rounded-md overflow-hidden bg-[#1a1d21]">
                      {/* Collapsed header row */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedDraftObjects(prev => {
                          const next = new Set(prev);
                          if (next.has(obj.id)) next.delete(obj.id); else next.add(obj.id);
                          return next;
                        })}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3 h-3 text-white/60 shrink-0" />
                          : <ChevronRight className="w-3 h-3 text-white/60 shrink-0" />}
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: obj.symbology }} />
                        <span className="text-white text-xs font-medium truncate flex-1">{obj.name}</span>
                        <span className="text-white/40 text-[10px] shrink-0">{obj.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Map view for:', obj.name);
                          }}
                          className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                          title="View on map"
                        >
                          <Map className="w-3 h-3 text-white/60" />
                        </button>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 space-y-1 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <span className="text-white/50 text-[10px] w-20 shrink-0">Object Type</span>
                            <span className="text-white text-xs">{obj.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/50 text-[10px] w-20 shrink-0">Symbology</span>
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: obj.symbology }} />
                          </div>
                          {obj.name && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/50 text-[10px] w-20 shrink-0">Name</span>
                              <span className="text-white text-xs">{obj.name}</span>
                            </div>
                          )}
                          {(obj.latitude || obj.longitude) && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/50 text-[10px] w-20 shrink-0">Location</span>
                              <span className="text-white text-xs">{obj.latitude}{obj.latitude && obj.longitude ? ', ' : ''}{obj.longitude}</span>
                            </div>
                          )}
                          {obj.description && (
                            <div className="flex items-start gap-2">
                              <span className="text-white/50 text-[10px] w-20 shrink-0 mt-0.5">Description</span>
                              <span className="text-white text-xs">{obj.description}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Permissions Section */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="text-sm font-semibold text-white mb-4">Permissions</div>
              
              {/* Viewer Permissions */}
              <div className="mb-4">
                <Label className="text-white text-xs mb-2 block">Viewer</Label>
                
                <div className="flex gap-2">
                  {/* Positions */}
                  <div className="flex-1">
                    <Label className="text-white/70 text-xs mb-1 block">Positions</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left font-normal"
                        >
                          {viewerPositions.length > 0 ? `${viewerPositions.length} selected` : 'Select positions'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                        <Command className="bg-[#222529]">
                          <CommandInput placeholder="Search positions..." className="text-white" />
                          <CommandList>
                            <CommandEmpty className="text-white">No positions found.</CommandEmpty>
                            <CommandGroup>
                              {['Planning Section Chief', 'Operations Section Chief', 'Logistics Section Chief', 'Finance Section Chief'].map((position) => (
                                <CommandItem
                                  key={position}
                                  onSelect={() => {
                                    setViewerPositions(prev =>
                                      prev.includes(position)
                                        ? prev.filter(p => p !== position)
                                        : [...prev, position]
                                    );
                                  }}
                                  className="text-white"
                                >
                                  <Checkbox
                                    checked={viewerPositions.includes(position)}
                                    className="mr-2"
                                  />
                                  {position}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                </div>
              </div>
              
              {/* Editor Permissions */}
              <div>
                <Label className="text-white text-xs mb-2 block">Editor</Label>
                
                <div className="flex gap-2">
                  {/* Positions */}
                  <div className="flex-1">
                    <Label className="text-white/70 text-xs mb-1 block">Positions</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left font-normal"
                        >
                          {editorPositions.length > 0 ? `${editorPositions.length} selected` : 'Select positions'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-[#222529] border-[#6e757c]" style={{ zIndex: 9999 }}>
                        <Command className="bg-[#222529]">
                          <CommandInput placeholder="Search positions..." className="text-white" />
                          <CommandList>
                            <CommandEmpty className="text-white">No positions found.</CommandEmpty>
                            <CommandGroup>
                              {['Planning Section Chief', 'Operations Section Chief', 'Logistics Section Chief', 'Finance Section Chief'].map((position) => (
                                <CommandItem
                                  key={position}
                                  onSelect={() => {
                                    setEditorPositions(prev =>
                                      prev.includes(position)
                                        ? prev.filter(p => p !== position)
                                        : [...prev, position]
                                    );
                                  }}
                                  className="text-white"
                                >
                                  <Checkbox
                                    checked={editorPositions.includes(position)}
                                    className="mr-2"
                                  />
                                  {position}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: '#2563eb' }}
                  onClick={() => {
                    console.log('Submit for Review');
                  }}
                >
                  Submit for Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDataChange({
                      ...data,
                      isDraftingNewDataLayer: false
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Layer Modal */}
      <Dialog open={individualLayerModalOpen} onOpenChange={setIndividualLayerModalOpen}>
        <DialogContent className="bg-[#222529] border-[#6e757c] text-white overflow-hidden flex flex-col" style={{ maxWidth: '1008px', maxHeight: '90vh' }}>
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-white">
                {selectedIndividualLayer || 'Layer Details'}
              </DialogTitle>
              <Select value={layerVersion} onValueChange={setLayerVersion}>
                <SelectTrigger className="bg-[#1a1d21] border-border text-white h-8 w-[225px] text-xs">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent className="bg-[#222529] border-[#6e757c] w-[350px]">
                  <SelectItem value="v3" className="text-white text-xs">
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>v3 (Latest)</span>
                      <span className="text-white/50">2025-11-15 14:05</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="v2" className="text-white text-xs">
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>v2</span>
                      <span className="text-white/50">2025-10-20 09:30</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="v1" className="text-white text-xs">
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>v1</span>
                      <span className="text-white/50">2025-09-10 16:45</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-transparent border-border text-white hover:bg-muted/50 px-3 text-xs whitespace-nowrap"
                style={{ height: '32px' }}
              >
                + New Version
              </Button>
            </div>
            <DialogDescription className="text-white/70">
              Layer Details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
          {selectedIndividualLayer && (() => {
            const presets: Record<
              string,
              { source: string; owner: string; created: string; lastUpdated: string; timezone: string; frequency: string; type: string; region: string; incident: string }
            > = {
              'Radar Precipitation': {
                source: 'NOAA NEXRAD Composite',
                owner: 'NOAA',
                created: '2022-01-01 00:00',
                lastUpdated: '2025-11-15 14:05',
                timezone: 'UTC',
                frequency: 'Every 5 minutes',
                type: 'data layer',
                region: 'Gulf Coast AORs',
                incident: 'Miami FIFA World Cup'
              },
              'Active Weather Warnings': {
                source: 'NOAA Weather Alerts (CAP)',
                owner: 'NOAA',
                created: '2020-05-12 08:00',
                lastUpdated: '2025-11-15 14:02',
                timezone: 'UTC',
                frequency: 'Real-time',
                type: 'data layer',
                region: 'Gulf Coast AORs',
                incident: 'Miami FIFA World Cup'
              }
            };
            const meta = presets[selectedIndividualLayer] ?? {
              source: 'Unknown',
              owner: 'Unknown',
              created: 'N/A',
              lastUpdated: 'N/A',
              timezone: 'UTC',
              frequency: 'N/A',
              type: 'data layer',
              region: 'N/A',
              incident: 'N/A'
            };
            
            return (
              <div className="mt-4 space-y-3">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Data Source</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.source}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Data Owner</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.owner}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Created</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.created}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Last Updated</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.lastUpdated} ({meta.timezone})</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">AORs</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.region}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Incident</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.incident}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2">Type</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right">{meta.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-white/70 p-2 border-b-0">Update Frequency</TableCell>
                      <TableCell className="text-sm text-white p-2 text-right border-b-0">{meta.frequency}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                {/* Incidents Section */}
                <div className="mt-4">
                  <Label className="text-xs text-white/70 mb-2 block">Incidents</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-[#1a1d21] border-border text-white text-sm hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {layerIncidents.length === 0
                            ? 'Select incidents...'
                            : layerIncidents.length === 1
                            ? layerIncidents[0] === 'gulf-coast-pipeline'
                              ? 'Miami FIFA World Cup'
                              : layerIncidents[0] === 'bayou-dularge'
                              ? 'Bayou Dularge Contamination'
                              : layerIncidents[0] === 'estuarine-wildlife'
                              ? 'Estuarine Wildlife Area Response'
                              : layerIncidents[0] === 'delaware-river-tanker'
                              ? 'Delaware River Tanker Spill'
                              : layerIncidents[0] === 'port-terminal'
                              ? 'Port Terminal Contamination'
                              : 'Delaware Estuary Shoreline Protection'
                            : `${layerIncidents.length} selected`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                      <Command className="bg-[#222529]">
                        <CommandInput placeholder="Search incidents..." className="h-9 text-white text-sm" />
                        <CommandEmpty className="text-white/70 p-2 text-sm">No incident found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          <CommandItem
                            onSelect={() => {
                              if (layerIncidents.length === 6) {
                                setLayerIncidents([]);
                              } else {
                                setLayerIncidents(['gulf-coast-pipeline', 'bayou-dularge', 'estuarine-wildlife', 'delaware-river-tanker', 'port-terminal', 'delaware-estuary']);
                              }
                            }}
                            className="text-white cursor-pointer text-sm font-semibold border-b border-border/30 mb-1"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={layerIncidents.length === 6}
                                className="pointer-events-none"
                              />
                              <span>Select All</span>
                            </div>
                          </CommandItem>
                          {[
                            { value: 'gulf-coast-pipeline', label: 'Miami FIFA World Cup' },
                            { value: 'bayou-dularge', label: 'Bayou Dularge Contamination' },
                            { value: 'estuarine-wildlife', label: 'Estuarine Wildlife Area Response' },
                            { value: 'delaware-river-tanker', label: 'Delaware River Tanker Spill' },
                            { value: 'port-terminal', label: 'Port Terminal Contamination' },
                            { value: 'delaware-estuary', label: 'Delaware Estuary Shoreline Protection' }
                          ].map((incident) => (
                            <CommandItem
                              key={incident.value}
                              onSelect={() => {
                                setLayerIncidents(prev =>
                                  prev.includes(incident.value)
                                    ? prev.filter(v => v !== incident.value)
                                    : [...prev, incident.value]
                                );
                              }}
                              className="text-white cursor-pointer text-sm"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Checkbox
                                  checked={layerIncidents.includes(incident.value)}
                                  className="pointer-events-none"
                                />
                                <span>{incident.label}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* AORs Section */}
                <div className="mt-4">
                  <Label className="text-xs text-white/70 mb-2 block">AORs</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-[#1a1d21] border-border text-white text-sm hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {layerAORs.length === 0
                            ? 'AORs...'
                            : layerAORs.length === 1
                            ? layerAORs[0] === 'sector-houston-galveston'
                              ? 'Sector Houston-Galveston'
                              : layerAORs[0] === 'sector-new-orleans'
                              ? 'Sector New Orleans'
                              : layerAORs[0] === 'sector-mobile'
                              ? 'Sector Mobile'
                              : layerAORs[0] === 'sector-corpus-christi'
                              ? 'Sector Corpus Christi'
                              : layerAORs[0] === 'district-8'
                              ? 'District 8'
                              : 'Fifth District'
                            : `${layerAORs.length} selected`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                      <Command className="bg-[#222529]">
                        <CommandInput placeholder="Search AORs..." className="h-9 text-white text-sm" />
                        <CommandEmpty className="text-white/70 p-2 text-sm">No AOR found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          <CommandItem
                            onSelect={() => {
                              if (layerAORs.length === 6) {
                                setLayerAORs([]);
                              } else {
                                setLayerAORs(['sector-houston-galveston', 'sector-new-orleans', 'sector-mobile', 'sector-corpus-christi', 'district-8', 'fifth-district']);
                              }
                            }}
                            className="text-white cursor-pointer text-sm font-semibold border-b border-border/30 mb-1"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={layerAORs.length === 6}
                                className="pointer-events-none"
                              />
                              <span>Select All</span>
                            </div>
                          </CommandItem>
                          {[
                            { value: 'sector-houston-galveston', label: 'Sector Houston-Galveston' },
                            { value: 'sector-new-orleans', label: 'Sector New Orleans' },
                            { value: 'sector-mobile', label: 'Sector Mobile' },
                            { value: 'sector-corpus-christi', label: 'Sector Corpus Christi' },
                            { value: 'district-8', label: 'District 8' },
                            { value: 'fifth-district', label: 'Fifth District' }
                          ].map((aor) => (
                            <CommandItem
                              key={aor.value}
                              onSelect={() => {
                                setLayerAORs(prev =>
                                  prev.includes(aor.value)
                                    ? prev.filter(v => v !== aor.value)
                                    : [...prev, aor.value]
                                );
                              }}
                              className="text-white cursor-pointer text-sm"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Checkbox
                                  checked={layerAORs.includes(aor.value)}
                                  className="pointer-events-none"
                                />
                                <span>{aor.label}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Objects Section */}
                <div className="mt-4">
                  <p className="text-xs text-white/70 mb-3">Objects</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      type="text"
                      placeholder="Search objects..."
                      value={objectSearchTerm}
                      onChange={(e) => setObjectSearchTerm(e.target.value)}
                      className="flex-1 bg-[#1a1d21] border-border text-white"
                    />
                    <Button
                      onClick={() => setAddingNewObject(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-border text-white hover:bg-muted/50 whitespace-nowrap"
                    >
                      + Add Object
                    </Button>
                  </div>
                  
                  {/* Select All and Inline Bulk Edit Controls */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-all-objects-${selectedIndividualLayer}`}
                        checked={getLayerObjects(selectedIndividualLayer).slice(0, 2).length > 0 && getLayerObjects(selectedIndividualLayer).slice(0, 2).every(obj => selectedObjects.has(obj.name))}
                        onCheckedChange={() => toggleSelectAllObjects(selectedIndividualLayer)}
                        className="border-border"
                      />
                      <label
                        htmlFor={`select-all-objects-${selectedIndividualLayer}`}
                        className="text-xs text-white cursor-pointer whitespace-nowrap"
                      >
                        Select All
                      </label>
                    </div>
                    
                    {selectedObjects.size > 0 && (
                      <>
                        <Select>
                          <SelectTrigger className="bg-[#1a1d21] border-border text-white h-9 w-[140px]">
                            <SelectValue placeholder="Field to edit" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#222529] border-[#6e757c]">
                            <SelectItem value="value" className="text-white">Value</SelectItem>
                            <SelectItem value="source" className="text-white">Source</SelectItem>
                            <SelectItem value="lastUpdated" className="text-white">Last Updated</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="text"
                          placeholder="New value..."
                          className="flex-1 bg-[#1a1d21] border-border text-white h-9"
                        />
                        
                        <Button
                          onClick={() => {
                            setSelectedObjects(new Set());
                          }}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                        >
                          Apply Changes
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    {/* New Object Form */}
                    {addingNewObject && (
                      <div
                        className="border border-accent rounded-lg overflow-hidden"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(2, 163, 254, 0.15) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)'
                        }}
                      >
                        <div className="p-3 space-y-3">
                          <div>
                            <Input
                              type="text"
                              placeholder="Enter object name..."
                              value={newObjectName}
                              onChange={(e) => setNewObjectName(e.target.value)}
                              className="w-full bg-[#1a1d21] border-border text-white"
                              autoFocus
                            />
                          </div>
                          
                          {/* Fields */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-white/70 mb-1 block">Latitude</Label>
                              <Input
                                type="text"
                                placeholder="29.4719"
                                className="bg-[#1a1d21] border-border text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-white/70 mb-1 block">Longitude</Label>
                              <Input
                                type="text"
                                placeholder="-95.0792"
                                className="bg-[#1a1d21] border-border text-white text-sm"
                              />
                            </div>
                          </div>
                          
                          {/* Draw Location Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border text-white hover:bg-muted/20"
                          >
                            <Map className="w-4 h-4 mr-2" />
                            Draw Location on Map
                          </Button>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs text-white/70 mb-1 block">Status</Label>
                              <Select>
                                <SelectTrigger className="bg-[#1a1d21] border-border text-white text-sm h-8">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#222529] border-[#6e757c]">
                                  <SelectItem value="active" className="text-white">Active</SelectItem>
                                  <SelectItem value="standby" className="text-white">Standby</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-white/70 mb-1 block">District</Label>
                              <Input
                                type="text"
                                placeholder="District 8"
                                className="bg-[#1a1d21] border-border text-white text-sm h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-white/70 mb-1 block">Sector</Label>
                              <Input
                                type="text"
                                placeholder="Gulf Coast"
                                className="bg-[#1a1d21] border-border text-white text-sm h-8"
                              />
                            </div>
                          </div>
                          
                          {/* Save/Cancel Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setAddingNewObject(false);
                                setNewObjectName('');
                              }}
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setAddingNewObject(false);
                                setNewObjectName('');
                              }}
                              size="sm"
                              variant="outline"
                              className="border-border"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Existing Objects */}
                    {getLayerObjects(selectedIndividualLayer)
                      .slice(0, 2)
                      .filter(obj => obj.name.toLowerCase().includes(objectSearchTerm.toLowerCase()))
                      .map((obj, idx) => {
                    const isExpanded = expandedObjects.has(obj.name);
                    return (
                      <div
                        key={idx}
                        className="border border-border rounded-lg overflow-hidden"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)'
                        }}
                      >
                        <div className="p-3 hover:bg-muted/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`object-${idx}-${obj.name}`}
                                checked={selectedObjects.has(obj.name)}
                                onCheckedChange={() => toggleObjectSelection(obj.name)}
                                onClick={(e) => e.stopPropagation()}
                                className="border-border"
                              />
                              <div 
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => toggleObject(obj.name)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-white flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                                )}
                                <span className="text-white">{obj.name}</span>
                              </div>
                            </div>
                            <span className="text-xs text-white/50">Last updated: {obj.lastUpdated}</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border/30 p-3">
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="text-sm font-medium text-white/70 p-2">Field</TableCell>
                                  <TableCell className="text-sm font-medium text-white/70 p-2">Value</TableCell>
                                  <TableCell className="text-sm font-medium text-white/70 p-2">Source</TableCell>
                                  <TableCell className="text-sm font-medium text-white/70 p-2">Last Updated</TableCell>
                                </TableRow>
                                {getObjectFields(obj.name).map((field, fieldIdx) => (
                                  <TableRow key={fieldIdx}>
                                    <TableCell className="text-sm text-white p-2">{field.field}</TableCell>
                                    <TableCell className="text-sm text-white p-2">{field.value}</TableCell>
                                    <TableCell className="text-sm text-white p-2">{field.source}</TableCell>
                                    <TableCell className="text-sm text-white p-2">{field.lastUpdated}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            );
          })()}
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}
