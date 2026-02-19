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
import { ChevronDown, ChevronRight, X, Maximize2, Map, Edit2 } from 'lucide-react';
import svgPaths from '../../imports/svg-7hg6d30srz';

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
    'Counter-UAS Operations - Northeast Region',
    'Mass Gathering Security - Fan Zones'
  ];

  // Available AORs for filtering
  const aors = [
    'Northeast Region',
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

          {/* Add Layer Button */}
          <button
            onClick={() => {
              // Add Layer functionality placeholder
              console.log('Add Layer clicked');
            }}
            className="bg-[#01669f] h-[22.75px] rounded-[4px] w-[130.625px] hover:bg-[#01669f]/90 transition-colors flex items-center justify-center relative"
          >
            <div className="absolute left-[16px] size-[13px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                <g>
                  <path d="M2.70833 6.5H10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                  <path d="M6.5 2.70833V10.2917" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
                </g>
              </svg>
            </div>
            <p className="caption text-nowrap text-white ml-[21px]">
              Add Layer
            </p>
          </button>
        </div>
      </div>

      {/* Incidents and AORs Filters */}
      <div className="mb-4 flex items-center gap-2">
        {/* Incident Filter */}
        <div className="flex-1 px-4 py-3 bg-[#222529] rounded-lg border border-[#6e757c]">
          <div className="flex items-center gap-2">
            <span className="caption text-white whitespace-nowrap">Incident:</span>
            <Popover open={isIncidentPopoverOpen} onOpenChange={setIsIncidentPopoverOpen}>
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
                  {selectedIncidents.length === 0 
                    ? 'All Incidents' 
                    : selectedIncidents.length === 1 
                    ? selectedIncidents[0]
                    : `${selectedIncidents.length} selected`}
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                <Command className="bg-[#222529]">
                  <CommandInput 
                    placeholder="Search incident..." 
                    className="h-9 caption text-white"
                    style={{ 
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '18px'
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="caption text-white/70 p-2">No incident found.</CommandEmpty>
                    <CommandGroup>
                      {incidents.map((incident) => (
                        <CommandItem
                          key={incident}
                          value={incident}
                          onSelect={() => toggleIncident(incident)}
                          className="caption text-white cursor-pointer hover:bg-[#14171a] data-[selected=true]:bg-[#14171a]"
                          style={{ 
                            fontFamily: "'Open Sans', sans-serif",
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: '18px'
                          }}
                        >
                          <Checkbox
                            checked={selectedIncidents.includes(incident)}
                            className="mr-2 h-3 w-3 border-white data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                          />
                          {incident}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedIncidents.length > 0 && (
              <button
                onClick={clearIncidentFilter}
                className="p-1 hover:bg-muted/30 rounded transition-colors"
                title="Clear filter"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
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
            {/* Radar Precipitation */}
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
                  <span
                    className="inline-block w-3 h-3 rounded-[2px]"
                    style={{ backgroundColor: 'rgba(0,123,255,0.35)', border: '1px solid rgba(255,255,255,0.6)' }}
                    aria-hidden
                  />
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
                    Region: Gulf Coast Region
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Incident: Gulf Coast Pipeline Spill
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
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6' }}
                          ></div>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => {
                              console.log('Edit icon clicked for KHGX');
                              // Edit functionality placeholder
                            }}
                            title="Edit station"
                          >
                            <Edit2 className="w-3 h-3 text-white" />
                          </Button>
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
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6' }}
                          ></div>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => {
                              console.log('Edit icon clicked for KLCH');
                              // Edit functionality placeholder
                            }}
                            title="Edit station"
                          >
                            <Edit2 className="w-3 h-3 text-white" />
                          </Button>
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

            {/* Active Weather Warnings */}
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
                <span
                  className="inline-block w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: 'rgba(220,53,69,0.15)', border: '1px solid rgba(255,255,255,0.6)' }}
                  aria-hidden
                />
              </div>
              {expandedLayers.has('weather-warnings') && (
                <div className="px-4 py-4">
                  <div className="text-sm leading-none text-white">
                    Last Updated: 2025-11-15 14:02 UTC
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Region: Gulf Coast Region
                  </div>
                  <div className="text-sm leading-none text-white mt-3">
                    Incident: Gulf Coast Pipeline Spill
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
            {/* Submit and Cancel Buttons */}
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
                  onDataChange({
                    ...data,
                    isDraftingNewDataLayer: false
                  });
                }}
              >
                Cancel
              </Button>
            </div>
            
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
              Region: Gulf Coast Region
            </div>
            <div className="text-sm leading-none text-white mt-3">
              Incident: Gulf Coast Pipeline Spill
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
              </div>
              
              {/* Spacer */}
              <div style={{ height: '32px' }}></div>
              
              {/* Symbology Section */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-white text-xs">Symbology:</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                ></div>
              </div>
              
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
                region: 'Gulf Coast Region',
                incident: 'Gulf Coast Pipeline Spill'
              },
              'Active Weather Warnings': {
                source: 'NOAA Weather Alerts (CAP)',
                owner: 'NOAA',
                created: '2020-05-12 08:00',
                lastUpdated: '2025-11-15 14:02',
                timezone: 'UTC',
                frequency: 'Real-time',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Gulf Coast Pipeline Spill'
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
                      <TableCell className="text-sm text-white/70 p-2">Region</TableCell>
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
                              ? 'Gulf Coast Pipeline Spill'
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
                            { value: 'gulf-coast-pipeline', label: 'Gulf Coast Pipeline Spill' },
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
    </div>
  );
}
