import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { ChevronDown, ChevronRight, Edit2, Trash2, Map, Maximize2, Check, X } from 'lucide-react';
import svgPaths from '../imports/svg-7hg6d30srz';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableRow } from './ui/table';

type DataLayersProps = {
  className?: string;
  style?: React.CSSProperties;
  orientation?: 'vertical' | 'horizontal';
  onHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCollapse?: () => void;
  regionFilter?: string[];
  setRegionFilter?: (filter: string[]) => void;
  incidentFilter?: string[];
  setIncidentFilter?: (filter: string[]) => void;
  onStartDraftingRadarPrecipitation?: () => void;
  onStartDraftingNewDataLayer?: () => void;
};

export function DataLayers({ 
  className, 
  style, 
  orientation = 'vertical', 
  onHandlePointerDown, 
  onCollapse,
  regionFilter: externalRegionFilter,
  setRegionFilter: externalSetRegionFilter,
  incidentFilter: externalIncidentFilter,
  setIncidentFilter: externalSetIncidentFilter,
  onStartDraftingRadarPrecipitation,
  onStartDraftingNewDataLayer
}: DataLayersProps) {
  const [myDraftsExpanded, setMyDraftsExpanded] = React.useState(false);
  const [myArcGISExpanded, setMyArcGISExpanded] = React.useState(false);
  const [fsltpExpanded, setFsltpExpanded] = React.useState(false);
  const [marineInfraExpanded, setMarineInfraExpanded] = React.useState(false);
  const [weatherExpanded, setWeatherExpanded] = React.useState(false);
  const [resourcesExpanded, setResourcesExpanded] = React.useState(false);
  const [tacticsExpanded, setTacticsExpanded] = React.useState(false);
  const [grsExpanded, setGrsExpanded] = React.useState(false);
  const [vesselsExpanded, setVesselsExpanded] = React.useState(false);
  const [expandedLayers, setExpandedLayers] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [layerToggles, setLayerToggles] = React.useState({
    weather: { radar: true, warnings: true },
    resources: { staging: true, facilities: true },
    tactics: { booms: true, skimmers: false },
    grs: { priority: true, anchor: false },
    vessels: { ais: true, patrol: false },
  });
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [info, setInfo] = React.useState<{
    title: string;
    source: string;
    owner: string;
    created: string;
    lastUpdated: string;
    timezone: string;
    frequency: string;
  } | null>(null);
  const [layerModalOpen, setLayerModalOpen] = React.useState(false);
  const [layerModalCategory, setLayerModalCategory] = React.useState<string | null>(null);
  const [individualLayerModalOpen, setIndividualLayerModalOpen] = React.useState(false);
  const [selectedIndividualLayer, setSelectedIndividualLayer] = React.useState<string | null>(null);
  const [layerVersion, setLayerVersion] = React.useState('v3');
  const [layerIncidents, setLayerIncidents] = React.useState<string[]>([]);
  const [layerAORs, setLayerAORs] = React.useState<string[]>([]);
  const [localRegionFilter, setLocalRegionFilter] = React.useState<string[]>([]);
  const [localIncidentFilter, setLocalIncidentFilter] = React.useState<string[]>([]);
  const [addLayerSearchOpen, setAddLayerSearchOpen] = React.useState(false);
  const [selectedLayersToMove, setSelectedLayersToMove] = React.useState<string[]>([]);
  const [categoryLayers, setCategoryLayers] = React.useState<Record<string, string[]>>({});
  const [expandedModalLayers, setExpandedModalLayers] = React.useState<Set<string>>(new Set());
  const [objectsExpanded, setObjectsExpanded] = React.useState(false);
  const [expandedObjects, setExpandedObjects] = React.useState<Set<string>>(new Set());
  const [objectSearchTerm, setObjectSearchTerm] = React.useState('');
  const [selectedObjects, setSelectedObjects] = React.useState<Set<string>>(new Set());
  const [bulkEditModalOpen, setBulkEditModalOpen] = React.useState(false);
  const [addingNewObject, setAddingNewObject] = React.useState(false);
  const [newObjectName, setNewObjectName] = React.useState('');
  const [objectStatusFilter, setObjectStatusFilter] = React.useState<string[]>([]);
  const [objectSignalStrengthFilter, setObjectSignalStrengthFilter] = React.useState<string[]>([]);
  const [objectSourceFilter, setObjectSourceFilter] = React.useState<string[]>([]);
  const [objectSectorFilter, setObjectSectorFilter] = React.useState<string[]>([]);
  const [objectDistrictFilter, setObjectDistrictFilter] = React.useState<string[]>([]);
  const [objectAreaFilter, setObjectAreaFilter] = React.useState<string[]>([]);
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const [signalStrengthFilterOpen, setSignalStrengthFilterOpen] = React.useState(false);
  const [sourceFilterOpen, setSourceFilterOpen] = React.useState(false);
  const [sectorFilterOpen, setSectorFilterOpen] = React.useState(false);
  const [districtFilterOpen, setDistrictFilterOpen] = React.useState(false);
  const [areaFilterOpen, setAreaFilterOpen] = React.useState(false);
  const [addLayerModalOpen, setAddLayerModalOpen] = React.useState(false);
  const [addLayerMode, setAddLayerMode] = React.useState<'upload' | 'draw'>('upload');
  const [addLayerCategory, setAddLayerCategory] = React.useState<string>('No Category');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = React.useState(false);
  const [selectedLayersPillExpanded, setSelectedLayersPillExpanded] = React.useState(false);
  const [layerViewerIndividuals, setLayerViewerIndividuals] = React.useState<string[]>([]);
  const [layerEditorIndividuals, setLayerEditorIndividuals] = React.useState<string[]>([]);
  const [layerDrafterIndividuals, setLayerDrafterIndividuals] = React.useState<string[]>([]);
  const [layerReviewerIndividuals, setLayerReviewerIndividuals] = React.useState<string[]>([]);
  const [layerViewerTeams, setLayerViewerTeams] = React.useState<string[]>([]);
  const [layerEditorTeams, setLayerEditorTeams] = React.useState<string[]>([]);
  const [layerDrafterTeams, setLayerDrafterTeams] = React.useState<string[]>([]);
  const [layerReviewerTeams, setLayerReviewerTeams] = React.useState<string[]>([]);
  const [viewerIndividualsOpen, setViewerIndividualsOpen] = React.useState(false);
  const [editorIndividualsOpen, setEditorIndividualsOpen] = React.useState(false);
  const [drafterIndividualsOpen, setDrafterIndividualsOpen] = React.useState(false);
  const [reviewerIndividualsOpen, setReviewerIndividualsOpen] = React.useState(false);
  const [viewerTeamsOpen, setViewerTeamsOpen] = React.useState(false);
  const [editorTeamsOpen, setEditorTeamsOpen] = React.useState(false);
  const [drafterTeamsOpen, setDrafterTeamsOpen] = React.useState(false);
  const [reviewerTeamsOpen, setReviewerTeamsOpen] = React.useState(false);

  // Use external filters if provided, otherwise use local state
  const regionFilter = externalRegionFilter !== undefined ? externalRegionFilter : localRegionFilter;
  const setRegionFilter = externalSetRegionFilter !== undefined ? externalSetRegionFilter : setLocalRegionFilter;
  const incidentFilter = externalIncidentFilter !== undefined ? externalIncidentFilter : localIncidentFilter;
  const setIncidentFilter = externalSetIncidentFilter !== undefined ? externalSetIncidentFilter : setLocalIncidentFilter;

  // Initialize object filters with all options selected when layer changes
  React.useEffect(() => {
    if (individualLayerModalOpen && selectedIndividualLayer) {
      const uniqueValues = getUniqueFieldValues(selectedIndividualLayer);
      setObjectStatusFilter(uniqueValues.status);
      setObjectSignalStrengthFilter(uniqueValues.signalStrength);
      setObjectSourceFilter(uniqueValues.sources);
      setObjectSectorFilter(uniqueValues.sectors);
      setObjectDistrictFilter(uniqueValues.districts);
      setObjectAreaFilter(uniqueValues.areas);
    }
  }, [individualLayerModalOpen, selectedIndividualLayer]);

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

  const openLayerModal = (category: string) => {
    setLayerModalCategory(category);
    setLayerModalOpen(true);
  };

  const openIndividualLayerModal = (layerName: string) => {
    setSelectedIndividualLayer(layerName);
    setIndividualLayerModalOpen(true);
  };

  const getLayerRegion = (layerName: string): string => {
    const gulfCoastLayers = [
      'Radar Precipitation',
      'Active Weather Warnings',
      'Staging Areas',
      'Boom Deployment Lines',
      'Skimmer Operations',
      'Priority Protection Areas',
      'Boom Anchor Points'
    ];
    const midAtlanticLayers = [
      'Critical Facilities',
      'AIS Vessel Tracks',
      'Patrol Sectors'
    ];
    
    if (gulfCoastLayers.includes(layerName)) return 'gulf-coast';
    if (midAtlanticLayers.includes(layerName)) return 'mid-atlantic';
    return 'all';
  };

  const getLayerIncident = (layerName: string): string => {
    // Gulf Coast Pipeline Spill (parent)
    const gulfCoastPipelineLayers = [
      'Radar Precipitation',
      'Active Weather Warnings'
    ];
    // Bayou Dularge Contamination (child)
    const bayouDulargeLayers = [
      'Staging Areas',
      'Boom Deployment Lines'
    ];
    // Estuarine Wildlife Area Response (child)
    const estuarineWildlifeLayers = [
      'Skimmer Operations',
      'Priority Protection Areas',
      'Boom Anchor Points'
    ];
    // Delaware River Tanker Spill (parent)
    const delawareRiverTankerLayers = [
      'Critical Facilities'
    ];
    // Port Terminal Contamination (child)
    const portTerminalLayers = [
      'AIS Vessel Tracks'
    ];
    // Delaware Estuary Shoreline Protection (child)
    const delawareEstuaryLayers = [
      'Patrol Sectors'
    ];
    
    if (gulfCoastPipelineLayers.includes(layerName)) return 'gulf-coast-pipeline';
    if (bayouDulargeLayers.includes(layerName)) return 'bayou-dularge';
    if (estuarineWildlifeLayers.includes(layerName)) return 'estuarine-wildlife';
    if (delawareRiverTankerLayers.includes(layerName)) return 'delaware-river-tanker';
    if (portTerminalLayers.includes(layerName)) return 'port-terminal';
    if (delawareEstuaryLayers.includes(layerName)) return 'delaware-estuary';
    return 'all';
  };

  const shouldShowCategory = (categoryLayers: string[]): boolean => {
    if (regionFilter.length === 0 && incidentFilter.length === 0) return true;
    
    return categoryLayers.some(layer => {
      const matchesRegion = regionFilter.length === 0 || regionFilter.includes(getLayerRegion(layer));
      const matchesIncident = incidentFilter.length === 0 || incidentFilter.includes(getLayerIncident(layer));
      return matchesRegion && matchesIncident;
    });
  };

  const getAllLayers = (): string[] => {
    const allCategories = ['weather', 'resources', 'tactics', 'grs', 'vessels'];
    const allLayers: string[] = [];
    allCategories.forEach(category => {
      getLayersForCategory(category).forEach(layer => {
        allLayers.push(layer.name);
      });
    });
    return allLayers;
  };

  const moveLayersToCategory = () => {
    if (!layerModalCategory || selectedLayersToMove.length === 0) return;
    
    // Add selected layers to the target category
    setCategoryLayers(prev => ({
      ...prev,
      [layerModalCategory]: [
        ...(prev[layerModalCategory] || []),
        ...selectedLayersToMove.filter(layer => !(prev[layerModalCategory] || []).includes(layer))
      ]
    }));
    
    // Clear selection and close dropdown
    setSelectedLayersToMove([]);
    setAddLayerSearchOpen(false);
  };

  const toggleModalLayer = (layerName: string) => {
    setExpandedModalLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerName)) {
        next.delete(layerName);
      } else {
        next.add(layerName);
      }
      return next;
    });
  };

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

  const toggleSelectAllObjects = (layerName: string) => {
    const allObjects = getLayerObjects(layerName).slice(0, 2);
    const allObjectNames = allObjects.map(obj => obj.name);
    const allSelected = allObjectNames.every(name => selectedObjects.has(name));
    
    if (allSelected) {
      // Deselect all
      setSelectedObjects(prev => {
        const next = new Set(prev);
        allObjectNames.forEach(name => next.delete(name));
        return next;
      });
    } else {
      // Select all
      setSelectedObjects(prev => {
        const next = new Set(prev);
        allObjectNames.forEach(name => next.add(name));
        return next;
      });
    }
  };

  // Get unique values for each field type across all objects
  const getUniqueFieldValues = (layerName: string) => {
    const objects = getLayerObjects(layerName).slice(0, 2);
    const allFields = objects.flatMap(obj => getObjectFields(obj.name));
    
    return {
      status: Array.from(new Set(allFields.map(f => f.status))),
      signalStrength: Array.from(new Set(allFields.map(f => f.signalStrength))),
      sources: Array.from(new Set(allFields.map(f => f.source))),
      sectors: Array.from(new Set(allFields.map(f => f.sector))),
      districts: Array.from(new Set(allFields.map(f => f.district))),
      areas: Array.from(new Set(allFields.map(f => f.area)))
    };
  };

  // Toggle filter selection
  const toggleFilterItem = (filterType: 'status' | 'signalStrength' | 'source' | 'sector' | 'district' | 'area', item: string) => {
    const setFilter = {
      status: setObjectStatusFilter,
      signalStrength: setObjectSignalStrengthFilter,
      source: setObjectSourceFilter,
      sector: setObjectSectorFilter,
      district: setObjectDistrictFilter,
      area: setObjectAreaFilter
    }[filterType];

    const currentFilter = {
      status: objectStatusFilter,
      signalStrength: objectSignalStrengthFilter,
      source: objectSourceFilter,
      sector: objectSectorFilter,
      district: objectDistrictFilter,
      area: objectAreaFilter
    }[filterType];

    if (currentFilter.includes(item)) {
      setFilter(currentFilter.filter(i => i !== item));
    } else {
      setFilter([...currentFilter, item]);
    }
  };

  // Toggle select all for a filter
  const toggleSelectAllFilter = (filterType: 'status' | 'signalStrength' | 'source' | 'sector' | 'district' | 'area', layerName: string) => {
    const uniqueValues = getUniqueFieldValues(layerName);
    const allItems = {
      status: uniqueValues.status,
      signalStrength: uniqueValues.signalStrength,
      source: uniqueValues.sources,
      sector: uniqueValues.sectors,
      district: uniqueValues.districts,
      area: uniqueValues.areas
    }[filterType];

    const setFilter = {
      status: setObjectStatusFilter,
      signalStrength: setObjectSignalStrengthFilter,
      source: setObjectSourceFilter,
      sector: setObjectSectorFilter,
      district: setObjectDistrictFilter,
      area: setObjectAreaFilter
    }[filterType];

    const currentFilter = {
      status: objectStatusFilter,
      signalStrength: objectSignalStrengthFilter,
      source: objectSourceFilter,
      sector: objectSectorFilter,
      district: objectDistrictFilter,
      area: objectAreaFilter
    }[filterType];

    if (currentFilter.length === allItems.length) {
      setFilter([]);
    } else {
      setFilter(allItems);
    }
  };

  const getObjectFields = (objectName: string): Array<{ field: string; value: string; source: string; lastUpdated: string }> => {
    // Return mock field data based on object name
    if (objectName.includes('KHGX')) {
      return [
        { field: 'Latitude', value: '29.4719', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Longitude', value: '-95.0792', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Status', value: 'Active', source: 'PRATUS', lastUpdated: '2025-11-15 14:03' },
        { field: 'District', value: 'District 8', source: 'PRATUS', lastUpdated: '2025-11-15 14:00' },
        { field: 'Sector', value: 'Houston-Galveston', source: 'CART', lastUpdated: '2025-11-15 14:05' }
      ];
    } else if (objectName.includes('KLCH')) {
      return [
        { field: 'Latitude', value: '30.1253', source: 'CART', lastUpdated: '2025-11-15 14:04' },
        { field: 'Longitude', value: '-93.2161', source: 'CART', lastUpdated: '2025-11-15 14:04' },
        { field: 'Status', value: 'Active', source: 'PRATUS', lastUpdated: '2025-11-15 14:02' },
        { field: 'District', value: 'District 8', source: 'PRATUS', lastUpdated: '2025-11-15 14:00' },
        { field: 'Sector', value: 'Lake Charles', source: 'CART', lastUpdated: '2025-11-15 14:04' }
      ];
    } else {
      return [
        { field: 'Latitude', value: '30.3367', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Longitude', value: '-89.8253', source: 'CART', lastUpdated: '2025-11-15 14:05' },
        { field: 'Status', value: 'Standby', source: 'PRATUS', lastUpdated: '2025-11-15 14:01' },
        { field: 'District', value: 'District 8', source: 'PRATUS', lastUpdated: '2025-11-15 14:00' },
        { field: 'Sector', value: 'New Orleans', source: 'CART', lastUpdated: '2025-11-15 14:05' }
      ];
    }
  };

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
      case 'Staging Areas':
        return [
          { name: 'Staging Area Alpha', lastUpdated: '2025-11-15 13:40' },
          { name: 'Staging Area Bravo', lastUpdated: '2025-11-15 13:35' },
          { name: 'Staging Area Charlie', lastUpdated: '2025-11-15 13:30' }
        ];
      case 'Critical Facilities':
        return [
          { name: 'Water Treatment Plant #1', lastUpdated: '2025-11-15 12:00' },
          { name: 'Emergency Operations Center', lastUpdated: '2025-11-15 12:00' },
          { name: 'Hospital - Main Campus', lastUpdated: '2025-11-15 12:00' }
        ];
      case 'Boom Deployment Lines':
        return [
          { name: 'Boom Line Delta-1', lastUpdated: '2025-11-15 13:55' },
          { name: 'Boom Line Delta-2', lastUpdated: '2025-11-15 13:50' },
          { name: 'Boom Line Echo-1', lastUpdated: '2025-11-15 13:45' }
        ];
      case 'Skimmer Operations':
        return [
          { name: 'Skimmer Vessel-101', lastUpdated: '2025-11-15 13:50' },
          { name: 'Skimmer Vessel-102', lastUpdated: '2025-11-15 13:48' },
          { name: 'Skimmer Vessel-103', lastUpdated: '2025-11-15 13:45' }
        ];
      case 'Priority Protection Areas':
        return [
          { name: 'Coastal Wetland Zone A', lastUpdated: '2025-11-15 12:45' },
          { name: 'Bird Nesting Area B', lastUpdated: '2025-11-15 12:45' },
          { name: 'Oyster Beds C', lastUpdated: '2025-11-15 12:45' }
        ];
      case 'Boom Anchor Points':
        return [
          { name: 'Anchor Point AP-001', lastUpdated: '2025-11-15 12:20' },
          { name: 'Anchor Point AP-002', lastUpdated: '2025-11-15 12:18' },
          { name: 'Anchor Point AP-003', lastUpdated: '2025-11-15 12:15' }
        ];
      case 'AIS Vessel Tracks':
        return [
          { name: 'Vessel MV OCEAN RANGER', lastUpdated: '2025-11-15 14:05' },
          { name: 'Vessel MV ATLANTIC PRIDE', lastUpdated: '2025-11-15 14:04' },
          { name: 'Vessel MV COASTAL GUARDIAN', lastUpdated: '2025-11-15 14:03' }
        ];
      case 'Patrol Sectors':
        return [
          { name: 'Patrol Sector North', lastUpdated: '2025-11-15 13:25' },
          { name: 'Patrol Sector South', lastUpdated: '2025-11-15 13:25' },
          { name: 'Patrol Sector Central', lastUpdated: '2025-11-15 13:25' }
        ];
      default:
        return [
          { name: 'Object 1', lastUpdated: '2025-11-15 12:00' },
          { name: 'Object 2', lastUpdated: '2025-11-15 12:00' }
        ];
    }
  };

  const getLayersForCategory = (category: string) => {
    let baseLayers: Array<{ name: string; checked: boolean }> = [];
    
    switch (category) {
      case 'weather':
        baseLayers = [
          { name: 'Radar Precipitation', checked: layerToggles.weather.radar },
          { name: 'Active Weather Warnings', checked: layerToggles.weather.warnings }
        ];
        break;
      case 'resources':
        baseLayers = [
          { name: 'Staging Areas', checked: layerToggles.resources.staging },
          { name: 'Critical Facilities', checked: layerToggles.resources.facilities }
        ];
        break;
      case 'tactics':
        baseLayers = [
          { name: 'Boom Deployment Lines', checked: layerToggles.tactics.booms },
          { name: 'Skimmer Operations', checked: layerToggles.tactics.skimmers }
        ];
        break;
      case 'grs':
        baseLayers = [
          { name: 'Priority Protection Areas', checked: layerToggles.grs.priority },
          { name: 'Boom Anchor Points', checked: layerToggles.grs.anchor }
        ];
        break;
      case 'vessels':
        baseLayers = [
          { name: 'AIS Vessel Tracks', checked: layerToggles.vessels.ais },
          { name: 'Patrol Sectors', checked: layerToggles.vessels.patrol }
        ];
        break;
      default:
        baseLayers = [];
    }
    
    // Add dynamically moved layers
    const movedLayers = categoryLayers[category] || [];
    const movedLayerObjects = movedLayers.map(name => ({ name, checked: true }));
    
    return [...baseLayers, ...movedLayerObjects];
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'weather': return 'Weather';
      case 'resources': return 'Resources';
      case 'tactics': return 'Tactics';
      case 'grs': return 'Geographic Response Strategies';
      case 'vessels': return 'Vessel Tracks';
      default: return '';
    }
  };

  const openLayerInfo = (title: string) => {
    // Provide plausible metadata per layer title
    const presets: Record<
      string,
      { source: string; owner: string; created: string; lastUpdated: string; timezone: string; frequency: string }
    > = {
      'Radar Precipitation': {
        source: 'NOAA NEXRAD Composite',
        owner: 'NOAA',
        created: '2022-01-01 00:00',
        lastUpdated: '2025-11-15 14:05',
        timezone: 'UTC',
        frequency: 'Every 5 minutes'
      },
      'Active Weather Warnings': {
        source: 'NOAA Weather Alerts (CAP)',
        owner: 'NOAA',
        created: '2020-05-12 08:00',
        lastUpdated: '2025-11-15 14:02',
        timezone: 'UTC',
        frequency: 'Real-time'
      },
      'Staging Areas': {
        source: 'Incident Logistics GIS (IMS)',
        owner: 'Unified Command - Logistics',
        created: '2025-11-14 09:15',
        lastUpdated: '2025-11-15 13:40',
        timezone: 'UTC',
        frequency: 'Hourly'
      },
      'Critical Facilities': {
        source: 'State Infrastructure GIS',
        owner: 'State EOC - Infrastructure',
        created: '2024-06-01 12:00',
        lastUpdated: '2025-11-15 12:00',
        timezone: 'UTC',
        frequency: 'Daily'
      },
      'Boom Deployment Lines': {
        source: 'Operations Section (Field Mapping)',
        owner: 'Operations - Marine Branch',
        created: '2025-11-15 06:00',
        lastUpdated: '2025-11-15 13:55',
        timezone: 'UTC',
        frequency: 'Ad hoc (as reported)'
      },
      'Skimmer Operations': {
        source: 'Operations Section (Marine)',
        owner: 'Operations - Marine Branch',
        created: '2025-11-15 05:30',
        lastUpdated: '2025-11-15 13:50',
        timezone: 'UTC',
        frequency: 'Ad hoc (as reported)'
      },
      'Open Action Items': {
        source: 'Planning Section (ICS-204/215)',
        owner: 'Planning Section',
        created: '2025-11-14 18:00',
        lastUpdated: '2025-11-15 13:30',
        timezone: 'UTC',
        frequency: 'Per operational update'
      },
      'Completed Action Items': {
        source: 'Planning Section (ICS-204/215)',
        owner: 'Planning Section',
        created: '2025-11-14 18:00',
        lastUpdated: '2025-11-15 13:10',
        timezone: 'UTC',
        frequency: 'Per operational update'
      },
      'Priority Protection Areas': {
        source: 'Environmental Unit (GRP/GRS)',
        owner: 'Environmental Unit',
        created: '2023-03-10 10:00',
        lastUpdated: '2025-11-15 12:45',
        timezone: 'UTC',
        frequency: 'Daily'
      },
      'Boom Anchor Points': {
        source: 'Environmental Unit (Field Survey)',
        owner: 'Environmental Unit',
        created: '2025-11-12 11:25',
        lastUpdated: '2025-11-15 12:20',
        timezone: 'UTC',
        frequency: 'Ad hoc (as surveyed)'
      },
      'AIS Vessel Tracks': {
        source: 'AIS Feed (USCG / Commercial AIS)',
        owner: 'USCG / AIS Providers',
        created: '2019-01-01 00:00',
        lastUpdated: '2025-11-15 14:05',
        timezone: 'UTC',
        frequency: 'Every minute'
      },
      'Patrol Sectors': {
        source: 'USCG Sector Command',
        owner: 'USCG Sector Command',
        created: '2025-11-10 07:00',
        lastUpdated: '2025-11-15 13:25',
        timezone: 'UTC',
        frequency: 'Per shift'
      }
    };
    const meta = presets[title] ?? {
      source: 'Unknown',
      owner: 'Unknown',
      created: 'N/A',
      lastUpdated: 'N/A',
      timezone: 'UTC',
      frequency: 'N/A'
    };
    setInfo({ title, ...meta });
    setInfoOpen(true);
  };

  // counts: selected/total per category
  const weatherSelected = Object.values(layerToggles.weather).filter(Boolean).length;
  const weatherTotal = Object.keys(layerToggles.weather).length;
  const resourcesSelected = Object.values(layerToggles.resources).filter(Boolean).length;
  const resourcesTotal = Object.keys(layerToggles.resources).length;
  const tacticsSelected = Object.values(layerToggles.tactics).filter(Boolean).length;
  const tacticsTotal = Object.keys(layerToggles.tactics).length;
  const grsSelected = Object.values(layerToggles.grs).filter(Boolean).length;
  const grsTotal = Object.keys(layerToggles.grs).length;
  const vesselsSelected = Object.values(layerToggles.vessels).filter(Boolean).length;
  const vesselsTotal = Object.keys(layerToggles.vessels).length;

  // Total selected layers across all categories
  const totalSelectedLayers = weatherSelected + resourcesSelected + tacticsSelected + grsSelected + vesselsSelected;

  // Get list of all selected layers with their deselect handlers
  const getSelectedLayersList = () => {
    const layers: Array<{ name: string; category: string; onDeselect: () => void }> = [];
    
    if (layerToggles.weather.radar) {
      layers.push({
        name: 'Radar Precipitation',
        category: 'Weather',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, weather: { ...prev.weather, radar: false } }))
      });
    }
    if (layerToggles.weather.warnings) {
      layers.push({
        name: 'Active Weather Warnings',
        category: 'Weather',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, weather: { ...prev.weather, warnings: false } }))
      });
    }
    if (layerToggles.resources.staging) {
      layers.push({
        name: 'Staging Areas',
        category: 'Resources',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, resources: { ...prev.resources, staging: false } }))
      });
    }
    if (layerToggles.resources.facilities) {
      layers.push({
        name: 'Critical Facilities',
        category: 'Resources',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, resources: { ...prev.resources, facilities: false } }))
      });
    }
    if (layerToggles.tactics.booms) {
      layers.push({
        name: 'Boom Deployment Lines',
        category: 'Tactics',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, tactics: { ...prev.tactics, booms: false } }))
      });
    }
    if (layerToggles.tactics.skimmers) {
      layers.push({
        name: 'Skimmer Operations',
        category: 'Tactics',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, tactics: { ...prev.tactics, skimmers: false } }))
      });
    }
    if (layerToggles.grs.priority) {
      layers.push({
        name: 'Priority Protection Areas',
        category: 'GRS',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, grs: { ...prev.grs, priority: false } }))
      });
    }
    if (layerToggles.grs.anchor) {
      layers.push({
        name: 'Boom Anchor Points',
        category: 'GRS',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, grs: { ...prev.grs, anchor: false } }))
      });
    }
    if (layerToggles.vessels.ais) {
      layers.push({
        name: 'AIS Vessel Tracks',
        category: 'Vessels',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, vessels: { ...prev.vessels, ais: false } }))
      });
    }
    if (layerToggles.vessels.patrol) {
      layers.push({
        name: 'Patrol Sectors',
        category: 'Vessels',
        onDeselect: () => setLayerToggles(prev => ({ ...prev, vessels: { ...prev.vessels, patrol: false } }))
      });
    }
    
    return layers;
  };

  const selectedLayers = getSelectedLayersList();

  return (
    <Card className={`${className ?? ''} flex flex-col relative`} style={style} role="complementary" aria-label="Data Layers">
      <CardHeader>
        {/* Selected Layers Pill */}
        {totalSelectedLayers > 0 && (
          <div className="mb-3" style={{ marginTop: '-5px' }}>
            <div 
              className="inline-flex flex-col border border-accent rounded-lg bg-accent/10 overflow-hidden"
              style={{ minWidth: selectedLayersPillExpanded ? '300px' : 'auto' }}
            >
              {/* Pill Header */}
              <div 
                className="flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-accent/20 transition-colors"
                onClick={() => setSelectedLayersPillExpanded(!selectedLayersPillExpanded)}
              >
                <span className="caption font-medium text-accent">{totalSelectedLayers} Layers Selected</span>
                {selectedLayersPillExpanded ? (
                  <ChevronDown className="w-3 h-3 text-accent ml-2" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-accent ml-2" />
                )}
              </div>
              
              {/* Expanded Layer List */}
              {selectedLayersPillExpanded && (
                <div className="border-t border-accent/30">
                  {/* Deselect All Button */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-accent/30">
                    <span className="text-xs text-white flex-1">Deselect All</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayerToggles({
                          weather: { radar: false, warnings: false },
                          resources: { staging: false, facilities: false },
                          tactics: { booms: false, skimmers: false },
                          grs: { priority: false, anchor: false },
                          vessels: { ais: false, patrol: false },
                        });
                      }}
                      className="ml-2 p-1 hover:bg-accent/30 rounded transition-colors flex-shrink-0"
                      title="Deselect all layers"
                    >
                      <X className="text-white" style={{ width: '14.4px', height: '14.4px' }} />
                    </button>
                  </div>

                  {/* Layer List */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {selectedLayers.map((layer, index) => (
                      <div 
                        key={`${layer.category}-${layer.name}`}
                        className="flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors"
                        style={{ borderTop: index > 0 ? '1px solid rgba(2, 163, 254, 0.2)' : 'none' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{layer.name}</p>
                          <p className="text-accent/70 mt-0.5" style={{ fontSize: '0.84375rem' }}>{layer.category}</p>
                        </div>
                        <div className="flex items-center" style={{ gap: '27px' }}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              openIndividualLayerModal(layer.name);
                            }}
                            title="View layer details"
                          >
                            <Maximize2 className="w-3 h-3 text-white" />
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              layer.onDeselect();
                            }}
                            className="p-1 hover:bg-accent/30 rounded transition-colors flex-shrink-0"
                            title={`Deselect ${layer.name}`}
                          >
                            <X className="text-white" style={{ width: '14.4px', height: '14.4px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2" style={{ marginTop: '10px' }}>
          <div className="relative h-[26px] w-[195px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="box-border w-full h-[26px] bg-transparent border border-[#6e757c] rounded-[4px] px-[26px] py-[3.25px] caption text-white placeholder:text-white focus:outline-none focus:border-accent"
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
          <div className="ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
              onClick={() => onCollapse && onCollapse()}
              title="Collapse data layers"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-[26px] px-3 bg-transparent border-border text-white hover:bg-muted/50"
          >
            + Add Category
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (onStartDraftingNewDataLayer) {
                onStartDraftingNewDataLayer();
              }
            }}
            className="h-[26px] px-3 bg-transparent border-border text-white hover:bg-muted/50"
          >
            + Add Layer
          </Button>
        </div>
        <div className="flex items-start gap-2 mt-3">
          <div className="flex-1">
            <Label className="text-white text-xs mb-1 block">AORs</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[26px] w-full justify-between bg-transparent border-border text-white text-xs hover:bg-muted/50"
                >
                  <span className="truncate">
                    {regionFilter.length === 0 || regionFilter.length === 2
                      ? 'All AORs'
                      : regionFilter.length === 1
                      ? regionFilter[0] === 'gulf-coast'
                        ? 'Gulf Coast'
                        : 'Mid-Atlantic'
                      : `${regionFilter.length} selected`}
                  </span>
                  <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                <Command className="bg-[#222529]">
                  <CommandInput placeholder="Search..." className="h-8 text-white text-xs" />
                  <CommandEmpty className="text-white/70 p-2 text-xs">No region found.</CommandEmpty>
                  <CommandGroup className="max-h-[150px] overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        if (regionFilter.length === 2) {
                          setRegionFilter([]);
                        } else {
                          setRegionFilter(['gulf-coast', 'mid-atlantic']);
                        }
                      }}
                      className="text-white cursor-pointer text-xs font-semibold border-b border-border/30 mb-1"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={regionFilter.length === 2}
                          className="pointer-events-none h-3 w-3"
                        />
                        <span>Select All</span>
                      </div>
                    </CommandItem>
                    {[
                      { value: 'gulf-coast', label: 'Gulf Coast Region' },
                      { value: 'mid-atlantic', label: 'Mid-Atlantic Region' }
                    ].map((region) => (
                      <CommandItem
                        key={region.value}
                        onSelect={() => {
                          setRegionFilter(prev =>
                            prev.includes(region.value)
                              ? prev.filter(v => v !== region.value)
                              : [...prev, region.value]
                          );
                        }}
                        className="text-white cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={regionFilter.includes(region.value)}
                            className="pointer-events-none h-3 w-3"
                          />
                          <span>{region.label}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <Label className="text-white text-xs mb-1 block">Incident</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[26px] w-full justify-between bg-transparent border-border text-white text-xs hover:bg-muted/50"
                >
                  <span className="truncate">
                    {incidentFilter.length === 0 || incidentFilter.length === 6
                      ? 'All Incidents'
                      : incidentFilter.length === 1
                      ? incidentFilter[0] === 'gulf-coast-pipeline'
                        ? 'GC Pipeline'
                        : incidentFilter[0] === 'bayou-dularge'
                        ? 'Bayou Dularge'
                        : incidentFilter[0] === 'estuarine-wildlife'
                        ? 'Estuarine Wildlife'
                        : incidentFilter[0] === 'delaware-river-tanker'
                        ? 'DR Tanker'
                        : incidentFilter[0] === 'port-terminal'
                        ? 'Port Terminal'
                        : 'DE Estuary'
                      : `${incidentFilter.length} selected`}
                  </span>
                  <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                <Command className="bg-[#222529]">
                  <CommandInput placeholder="Search..." className="h-8 text-white text-xs" />
                  <CommandEmpty className="text-white/70 p-2 text-xs">No incident found.</CommandEmpty>
                  <CommandGroup className="max-h-[150px] overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        if (incidentFilter.length === 6) {
                          setIncidentFilter([]);
                        } else {
                          setIncidentFilter(['gulf-coast-pipeline', 'bayou-dularge', 'estuarine-wildlife', 'delaware-river-tanker', 'port-terminal', 'delaware-estuary']);
                        }
                      }}
                      className="text-white cursor-pointer text-xs font-semibold border-b border-border/30 mb-1"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={incidentFilter.length === 6}
                          className="pointer-events-none h-3 w-3"
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
                          setIncidentFilter(prev =>
                            prev.includes(incident.value)
                              ? prev.filter(v => v !== incident.value)
                              : [...prev, incident.value]
                          );
                        }}
                        className="text-white cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={incidentFilter.includes(incident.value)}
                            className="pointer-events-none h-3 w-3"
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2">
        {/* My Drafts */}
        <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${myDraftsExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setMyDraftsExpanded((v) => !v)}
                >
                  {myDraftsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Label
                  className="cursor-pointer"
                  onClick={() => setMyDraftsExpanded((v) => !v)}
                >
                  My Drafts
                </Label>
              </div>
            </div>
          </div>
          {myDraftsExpanded && (
            <div className="p-3 space-y-2">
              {/* Empty for now */}
            </div>
          )}
        </div>

        {/* My ArcGIS */}
        <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${myArcGISExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setMyArcGISExpanded((v) => !v)}
                >
                  {myArcGISExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Label
                  className="cursor-pointer"
                  onClick={() => setMyArcGISExpanded((v) => !v)}
                >
                  My ArcGIS
                </Label>
              </div>
            </div>
          </div>
          {myArcGISExpanded && (
            <div className="p-3 space-y-2">
              {/* Empty for now */}
            </div>
          )}
        </div>

        {/* FSLTP */}
        <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${fsltpExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setFsltpExpanded((v) => !v)}
                >
                  {fsltpExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Label
                  className="cursor-pointer"
                  onClick={() => setFsltpExpanded((v) => !v)}
                >
                  FSLTP
                </Label>
              </div>
            </div>
          </div>
          {fsltpExpanded && (
            <div className="p-3 space-y-2">
              {/* Empty for now */}
            </div>
          )}
        </div>

        {/* Marine Critical Infrastructure */}
        <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${marineInfraExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setMarineInfraExpanded((v) => !v)}
                >
                  {marineInfraExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Label
                  className="cursor-pointer"
                  onClick={() => setMarineInfraExpanded((v) => !v)}
                >
                  Marine Critical Infrastructure
                </Label>
              </div>
            </div>
          </div>
          {marineInfraExpanded && (
            <div className="p-3 space-y-2">
              {/* Empty for now */}
            </div>
          )}
        </div>

        {/* Weather */}
        {shouldShowCategory(['Radar Precipitation', 'Active Weather Warnings']) && <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
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
                  onClick={() => openLayerModal('weather')}
                  title="View all layers"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
          {weatherExpanded && (
            <div className="p-3 space-y-2">
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
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
                {expandedLayers.has('weather-radar') && (
                  <div className="px-4 py-4">
                    <button
                      onClick={() => {
                        if (onStartDraftingRadarPrecipitation) {
                          onStartDraftingRadarPrecipitation();
                        }
                      }}
                      className="bg-[#01669f] h-[22.75px] rounded-[4px] hover:bg-[#01669f]/90 transition-colors flex items-center gap-2 px-4 mb-4"
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
                  </div>
                )}
              </div>
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
        </div>}

        {/* Resources */}
        {shouldShowCategory(['Staging Areas', 'Critical Facilities']) && <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${resourcesExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setResourcesExpanded((v) => !v)}
                >
                  {resourcesExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Checkbox
                  checked={resourcesSelected === resourcesTotal}
                  onCheckedChange={(v) => {
                    const allChecked = !!v;
                    setLayerToggles((prev) => ({
                      ...prev,
                      resources: { staging: allChecked, facilities: allChecked },
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '3px' }}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setResourcesExpanded((v) => !v)}
                >
                  Resources
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={() => openLayerModal('resources')}
                  title="View all layers"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
          {resourcesExpanded && (
            <div className="p-3 space-y-2">
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.resources.staging}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        resources: { ...prev.resources, staging: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('resources-staging')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('resources-staging') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Staging Areas</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Staging Areas');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: '#22c55e', border: '1px solid rgba(255,255,255,0.6)' }}
                    aria-hidden
                  />
                </div>
                {expandedLayers.has('resources-staging') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 13:40 UTC
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
                  </div>
                )}
              </div>
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.resources.facilities}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        resources: { ...prev.resources, facilities: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('resources-facilities')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('resources-facilities') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Critical Facilities</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Critical Facilities');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: '#a855f7', border: '1px solid rgba(255,255,255,0.6)' }}
                    aria-hidden
                  />
                </div>
                {expandedLayers.has('resources-facilities') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 12:00 UTC
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Region: Mid-Atlantic Region
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Incident: Delaware River Tanker Spill
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Type: data layer
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Sources: PRATUS
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>}

        {/* Tactics */}
        {shouldShowCategory(['Boom Deployment Lines', 'Skimmer Operations']) && <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${tacticsExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setTacticsExpanded((v) => !v)}
                >
                  {tacticsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Checkbox
                  checked={tacticsSelected === tacticsTotal}
                  onCheckedChange={(v) => {
                    const allChecked = !!v;
                    setLayerToggles((prev) => ({
                      ...prev,
                      tactics: { booms: allChecked, skimmers: allChecked },
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '3px' }}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setTacticsExpanded((v) => !v)}
                >
                  Tactics
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={() => openLayerModal('tactics')}
                  title="View all layers"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
          {tacticsExpanded && (
            <div className="p-3 space-y-2">
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.tactics.booms}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        tactics: { ...prev.tactics, booms: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('tactics-booms')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('tactics-booms') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Boom Deployment Lines</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Boom Deployment Lines');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block"
                    style={{
                      width: '24px',
                      height: '6px',
                      backgroundColor: '#f59e0b',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '3px'
                    }}
                    aria-hidden
                    title="Line symbol"
                  />
                </div>
                {expandedLayers.has('tactics-booms') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 13:55 UTC
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
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.tactics.skimmers}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        tactics: { ...prev.tactics, skimmers: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('tactics-skimmers')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('tactics-skimmers') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Skimmer Operations</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Skimmer Operations');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block"
                    style={{
                      width: '24px',
                      height: '6px',
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #3b82f6 0 8px, transparent 8px 12px)',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '3px'
                    }}
                    aria-hidden
                    title="Dashed line symbol"
                  />
                </div>
                {expandedLayers.has('tactics-skimmers') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 13:50 UTC
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
        </div>}

        {/* Geographic Response Strategies */}
        {shouldShowCategory(['Priority Protection Areas', 'Boom Anchor Points']) && <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${grsExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setGrsExpanded((v) => !v)}
                >
                  {grsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Checkbox
                  checked={grsSelected === grsTotal}
                  onCheckedChange={(v) => {
                    const allChecked = !!v;
                    setLayerToggles((prev) => ({
                      ...prev,
                      grs: { priority: allChecked, anchor: allChecked },
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '3px' }}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setGrsExpanded((v) => !v)}
                >
                  Geographic Response Strategies
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={() => openLayerModal('grs')}
                  title="View all layers"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
          {grsExpanded && (
            <div className="p-3 space-y-2">
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.grs.priority}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        grs: { ...prev.grs, priority: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('grs-priority')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('grs-priority') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Priority Protection Areas</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Priority Protection Areas');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block w-3 h-3 rounded-[2px]"
                    style={{ backgroundColor: 'rgba(13,148,136,0.35)', border: '1px solid #0d9488' }}
                    aria-hidden
                  />
                </div>
                {expandedLayers.has('grs-priority') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 12:45 UTC
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
                      Sources: PRATUS
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.grs.anchor}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        grs: { ...prev.grs, anchor: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('grs-anchor')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('grs-anchor') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Boom Anchor Points</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Boom Anchor Points');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: '#ef4444', border: '1px solid rgba(255,255,255,0.6)' }}
                    aria-hidden
                  />
                </div>
                {expandedLayers.has('grs-anchor') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 12:20 UTC
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
                      Sources: PRATUS
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>}

        {/* Vessel Tracks */}
        {shouldShowCategory(['AIS Vessel Tracks', 'Patrol Sectors']) && <div
          className="border border-border rounded-lg overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)',
            ...(orientation === 'horizontal' ? { minWidth: '320px' } : {})
          }}
        >
          <div className={`p-3 ${vesselsExpanded ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between">
              <div
                className="flex items-start gap-2 flex-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setVesselsExpanded((v) => !v)}
                >
                  {vesselsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <Checkbox
                  checked={vesselsSelected === vesselsTotal}
                  onCheckedChange={(v) => {
                    const allChecked = !!v;
                    setLayerToggles((prev) => ({
                      ...prev,
                      vessels: { ais: allChecked, patrol: allChecked },
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '3px' }}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setVesselsExpanded((v) => !v)}
                >
                  Vessel Tracks
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={() => openLayerModal('vessels')}
                  title="View all layers"
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
          {vesselsExpanded && (
            <div className="p-3 space-y-2">
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.vessels.ais}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        vessels: { ...prev.vessels, ais: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('vessels-ais')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('vessels-ais') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">AIS Vessel Tracks</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('AIS Vessel Tracks');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block"
                    style={{
                      width: '24px',
                      height: '6px',
                      backgroundColor: '#22c55e',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '3px'
                    }}
                    aria-hidden
                    title="Line symbol"
                  />
                </div>
                {expandedLayers.has('vessels-ais') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 14:05 UTC
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Region: Mid-Atlantic Region
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Incident: Delaware River Tanker Spill
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Type: data layer
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Sources: CART, PRATUS
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-border/30 rounded-md overflow-hidden bg-card/30">
                <div className="flex items-center gap-3 py-3 px-3">
                  <Checkbox
                    checked={layerToggles.vessels.patrol}
                    onCheckedChange={(v) =>
                      setLayerToggles((prev) => ({
                        ...prev,
                        vessels: { ...prev.vessels, patrol: !!v },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleLayer('vessels-patrol')}
                    className="flex items-center gap-1 flex-1 bg-transparent p-0"
                  >
                    {expandedLayers.has('vessels-patrol') ? (
                      <ChevronDown className="w-3 h-3 text-white flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white flex-shrink-0" />
                    )}
                    <Label className="cursor-pointer flex-1">Patrol Sectors</Label>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      openIndividualLayerModal('Patrol Sectors');
                    }}
                    title="View layer details"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </Button>
                  <span
                    className="inline-block"
                    style={{
                      width: '24px',
                      height: '6px',
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #ec4899 0 8px, transparent 8px 12px)',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '3px'
                    }}
                    aria-hidden
                    title="Dashed line symbol"
                  />
                </div>
                {expandedLayers.has('vessels-patrol') && (
                  <div className="px-4 py-4">
                    <div className="text-sm leading-none text-white">
                      Last Updated: 2025-11-15 13:25 UTC
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Region: Mid-Atlantic Region
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Incident: Delaware River Tanker Spill
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Type: data layer
                    </div>
                    <div className="text-sm leading-none text-white mt-3">
                      Sources: CART, PRATUS
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>}
      </CardContent>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{info?.title ?? 'Layer Details'}</DialogTitle>
          </DialogHeader>
          <div className="dl-expanded-content space-y-2 text-white">
            <div className="flex items-center justify-between">
              <span>Data Source</span>
              <span>{info?.source ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Owner</span>
              <span>{info?.owner ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created</span>
              <span>{info?.created ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Updated</span>
              <span>{info?.lastUpdated ?? '—'} {info?.timezone ? `(${info.timezone})` : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Update Frequency</span>
              <span>{info?.frequency ?? '—'}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Layer Modal */}
      <Dialog open={layerModalOpen} onOpenChange={setLayerModalOpen}>
        <DialogContent className="bg-[#222529] border-[#6e757c] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {layerModalCategory ? getCategoryDisplayName(layerModalCategory) : 'Layers'}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Layers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Existing layers in category */}
            <div className="space-y-3">
              {layerModalCategory && getLayersForCategory(layerModalCategory).map((layer, idx) => {
                const isExpanded = expandedModalLayers.has(layer.name);
                return (
                  <div
                    key={idx}
                    className="border border-border/30 rounded-md bg-card/30"
                  >
                    {/* Layer header */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleModalLayer(layer.name)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white" />
                        )}
                        <span className="text-sm text-white">{layer.name}</span>
                      </div>
                    </div>
                    
                    {/* Layer details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 text-xs">
                        <div className="flex justify-between border-t border-border/30 pt-2">
                          <span className="text-white/70">Last Updated</span>
                          <span className="text-white">2025-11-15 14:05</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Region</span>
                          <span className="text-white">{getLayerRegion(layer.name) === 'gulf-coast' ? 'Gulf Coast Region' : getLayerRegion(layer.name) === 'mid-atlantic' ? 'Mid-Atlantic Region' : 'All AORs'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Incident</span>
                          <span className="text-white">
                            {getLayerIncident(layer.name) === 'gulf-coast-pipeline' ? 'Gulf Coast Pipeline Spill' :
                             getLayerIncident(layer.name) === 'bayou-dularge' ? 'Bayou Dularge Contamination' :
                             getLayerIncident(layer.name) === 'estuarine-wildlife' ? 'Estuarine Wildlife Area Response' :
                             getLayerIncident(layer.name) === 'delaware-river-tanker' ? 'Delaware River Tanker Spill' :
                             getLayerIncident(layer.name) === 'port-terminal' ? 'Port Terminal Contamination' :
                             getLayerIncident(layer.name) === 'delaware-estuary' ? 'Delaware Estuary Shoreline Protection' :
                             'All Incidents'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Type</span>
                          <span className="text-white">data layer</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Sources</span>
                          <span className="text-white">CART, PRATUS</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Add layer to category */}
            <div className="border-t border-border/30 pt-4">
              <Label className="text-white text-sm mb-2 block">Move Layer to Category</Label>
              <Popover open={addLayerSearchOpen} onOpenChange={setAddLayerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-transparent border-border text-white text-sm hover:bg-muted/50"
                  >
                    <span>
                      {selectedLayersToMove.length === 0 
                        ? 'Select layers...' 
                        : `${selectedLayersToMove.length} layer${selectedLayersToMove.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-[#222529] border-[#6e757c]" align="start">
                  {/* Move button at top */}
                  {selectedLayersToMove.length > 0 && (
                    <div className="p-2 border-b border-border/30">
                      <Button
                        onClick={moveLayersToCategory}
                        className="w-full bg-[#01669f] hover:bg-[#01669f]/90 text-white"
                      >
                        Move {selectedLayersToMove.length} Layer{selectedLayersToMove.length > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                  <Command className="bg-[#222529]">
                    <CommandInput placeholder="Search layers..." className="h-9 text-white text-sm" />
                    <CommandEmpty className="text-white/70 p-3 text-sm">No layer found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {getAllLayers().map((layer) => (
                        <CommandItem
                          key={layer}
                          onSelect={() => {
                            setSelectedLayersToMove(prev =>
                              prev.includes(layer)
                                ? prev.filter(l => l !== layer)
                                : [...prev, layer]
                            );
                          }}
                          className="text-white cursor-pointer text-sm"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={selectedLayersToMove.includes(layer)}
                              className="pointer-events-none h-3 w-3"
                            />
                            <span>{layer}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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
              },
              'Staging Areas': {
                source: 'Incident Logistics GIS (IMS)',
                owner: 'Unified Command - Logistics',
                created: '2025-11-14 09:15',
                lastUpdated: '2025-11-15 13:40',
                timezone: 'UTC',
                frequency: 'Hourly',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Bayou Dularge Contamination'
              },
              'Critical Facilities': {
                source: 'State Infrastructure GIS',
                owner: 'State EOC - Infrastructure',
                created: '2024-06-01 12:00',
                lastUpdated: '2025-11-15 12:00',
                timezone: 'UTC',
                frequency: 'Daily',
                type: 'data layer',
                region: 'Mid-Atlantic Region',
                incident: 'Delaware River Tanker Spill'
              },
              'Boom Deployment Lines': {
                source: 'Operations Section (Field Mapping)',
                owner: 'Operations - Marine Branch',
                created: '2025-11-15 06:00',
                lastUpdated: '2025-11-15 13:55',
                timezone: 'UTC',
                frequency: 'Ad hoc (as reported)',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Bayou Dularge Contamination'
              },
              'Skimmer Operations': {
                source: 'Operations Section (Marine)',
                owner: 'Operations - Marine Branch',
                created: '2025-11-15 05:30',
                lastUpdated: '2025-11-15 13:50',
                timezone: 'UTC',
                frequency: 'Ad hoc (as reported)',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Estuarine Wildlife Area Response'
              },
              'Priority Protection Areas': {
                source: 'Environmental Unit (GRP/GRS)',
                owner: 'Environmental Unit',
                created: '2023-03-10 10:00',
                lastUpdated: '2025-11-15 12:45',
                timezone: 'UTC',
                frequency: 'Daily',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Estuarine Wildlife Area Response'
              },
              'Boom Anchor Points': {
                source: 'Environmental Unit (Field Survey)',
                owner: 'Environmental Unit',
                created: '2025-11-12 11:25',
                lastUpdated: '2025-11-15 12:20',
                timezone: 'UTC',
                frequency: 'Ad hoc (as surveyed)',
                type: 'data layer',
                region: 'Gulf Coast Region',
                incident: 'Estuarine Wildlife Area Response'
              },
              'AIS Vessel Tracks': {
                source: 'AIS Feed (USCG / Commercial AIS)',
                owner: 'USCG / AIS Providers',
                created: '2019-01-01 00:00',
                lastUpdated: '2025-11-15 14:05',
                timezone: 'UTC',
                frequency: 'Every minute',
                type: 'data layer',
                region: 'Mid-Atlantic Region',
                incident: 'Port Terminal Contamination'
              },
              'Patrol Sectors': {
                source: 'USCG Sector Command',
                owner: 'USCG Sector Command',
                created: '2025-11-10 07:00',
                lastUpdated: '2025-11-15 13:25',
                timezone: 'UTC',
                frequency: 'Per shift',
                type: 'data layer',
                region: 'Mid-Atlantic Region',
                incident: 'Delaware Estuary Shoreline Protection'
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
                            // Apply bulk edit logic here
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
                                // Save logic here
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

      {/* Add Layer Modal */}
      <Dialog open={addLayerModalOpen} onOpenChange={setAddLayerModalOpen}>
        <DialogContent className="bg-[#222529] border-[#6e757c] text-white overflow-y-auto" style={{ maxWidth: '1008px', maxHeight: '75vh' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">Add Layer</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {/* Toggle between Upload and Draw */}
            <div className="flex w-full border border-border bg-[#1a1d21] rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setAddLayerMode('upload')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  addLayerMode === 'upload'
                    ? 'bg-[#01669f] text-white'
                    : 'bg-transparent text-foreground hover:bg-muted/50'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setAddLayerMode('draw')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                  addLayerMode === 'draw'
                    ? 'bg-[#01669f] text-white'
                    : 'bg-transparent text-foreground hover:bg-muted/50'
                }`}
              >
                Draw Layer
              </button>
            </div>

            {/* Content area */}
            <div className="p-4 border border-border/30 rounded-md bg-card/30">
              <p className="text-center text-white/70 text-xs">
                {addLayerMode === 'upload' ? '[Upload File Placeholder]' : '[Draw Layer Placeholder]'}
              </p>
            </div>

            {/* Permissions Section */}
            <div className="space-y-2 p-3 border border-border/30 rounded-md bg-card/30">
              <Label className="text-white text-xs font-semibold block">Permissions</Label>
              
              <div className="grid grid-cols-4 gap-2">
                {/* Viewer Permissions */}
                <div className="space-y-1.5">
                  <Label className="text-white text-[10px] block">Viewer</Label>
                  
                  {/* Viewer Individuals */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Individuals</Label>
                    <Popover open={viewerIndividualsOpen} onOpenChange={setViewerIndividualsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerViewerIndividuals.length === 0 
                            ? 'Select individuals...' 
                            : `${layerViewerIndividuals.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search individuals..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No individual found.</CommandEmpty>
                            <CommandGroup>
                              {['J. Smith', 'M. Rodriguez', 'K. Johnson', 'L. Williams', 'T. Brown'].map((person) => (
                                <CommandItem
                                  key={person}
                                  value={person}
                                  onSelect={() => {
                                    setLayerViewerIndividuals(prev =>
                                      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerViewerIndividuals.includes(person)}
                                    className="mr-1 h-2.5 w-2.5"
                                  />
                                  {person}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Viewer Teams */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Teams</Label>
                    <Popover open={viewerTeamsOpen} onOpenChange={setViewerTeamsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerViewerTeams.length === 0 
                            ? 'Select teams...' 
                            : `${layerViewerTeams.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search teams..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No team found.</CommandEmpty>
                            <CommandGroup>
                              {['Operations Team', 'Planning Team', 'Safety Team', 'Logistics Team', 'Command Staff'].map((team) => (
                                <CommandItem
                                  key={team}
                                  value={team}
                                  onSelect={() => {
                                    setLayerViewerTeams(prev =>
                                      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerViewerTeams.includes(team)}
                                    className="mr-1 h-2.5 w-2.5"
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

                {/* Editor Permissions */}
                <div className="space-y-1.5">
                  <Label className="text-white text-[10px] block">Editor</Label>
                  
                  {/* Editor Individuals */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Individuals</Label>
                    <Popover open={editorIndividualsOpen} onOpenChange={setEditorIndividualsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerEditorIndividuals.length === 0 
                            ? 'Select individuals...' 
                            : `${layerEditorIndividuals.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search individuals..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No individual found.</CommandEmpty>
                            <CommandGroup>
                              {['J. Smith', 'M. Rodriguez', 'K. Johnson', 'L. Williams', 'T. Brown'].map((person) => (
                                <CommandItem
                                  key={person}
                                  value={person}
                                  onSelect={() => {
                                    setLayerEditorIndividuals(prev =>
                                      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerEditorIndividuals.includes(person)}
                                    className="mr-1 h-2.5 w-2.5"
                                  />
                                  {person}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Editor Teams */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Teams</Label>
                    <Popover open={editorTeamsOpen} onOpenChange={setEditorTeamsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerEditorTeams.length === 0 
                            ? 'Select teams...' 
                            : `${layerEditorTeams.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search teams..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No team found.</CommandEmpty>
                            <CommandGroup>
                              {['Operations Team', 'Planning Team', 'Safety Team', 'Logistics Team', 'Command Staff'].map((team) => (
                                <CommandItem
                                  key={team}
                                  value={team}
                                  onSelect={() => {
                                    setLayerEditorTeams(prev =>
                                      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerEditorTeams.includes(team)}
                                    className="mr-1 h-2.5 w-2.5"
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

                {/* Drafter Permissions */}
                <div className="space-y-1.5">
                  <Label className="text-white text-[10px] block">Drafter</Label>
                  
                  {/* Drafter Individuals */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Individuals</Label>
                    <Popover open={drafterIndividualsOpen} onOpenChange={setDrafterIndividualsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerDrafterIndividuals.length === 0 
                            ? 'Select individuals...' 
                            : `${layerDrafterIndividuals.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search individuals..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No individual found.</CommandEmpty>
                            <CommandGroup>
                              {['J. Smith', 'M. Rodriguez', 'K. Johnson', 'L. Williams', 'T. Brown'].map((person) => (
                                <CommandItem
                                  key={person}
                                  value={person}
                                  onSelect={() => {
                                    setLayerDrafterIndividuals(prev =>
                                      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerDrafterIndividuals.includes(person)}
                                    className="mr-1 h-2.5 w-2.5"
                                  />
                                  {person}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Drafter Teams */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Teams</Label>
                    <Popover open={drafterTeamsOpen} onOpenChange={setDrafterTeamsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerDrafterTeams.length === 0 
                            ? 'Select teams...' 
                            : `${layerDrafterTeams.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search teams..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No team found.</CommandEmpty>
                            <CommandGroup>
                              {['Operations Team', 'Planning Team', 'Safety Team', 'Logistics Team', 'Command Staff'].map((team) => (
                                <CommandItem
                                  key={team}
                                  value={team}
                                  onSelect={() => {
                                    setLayerDrafterTeams(prev =>
                                      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerDrafterTeams.includes(team)}
                                    className="mr-1 h-2.5 w-2.5"
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

                {/* Reviewer Permissions */}
                <div className="space-y-1.5">
                  <Label className="text-white text-[10px] block">Reviewer</Label>
                  
                  {/* Reviewer Individuals */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Individuals</Label>
                    <Popover open={reviewerIndividualsOpen} onOpenChange={setReviewerIndividualsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerReviewerIndividuals.length === 0 
                            ? 'Select individuals...' 
                            : `${layerReviewerIndividuals.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search individuals..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No individual found.</CommandEmpty>
                            <CommandGroup>
                              {['J. Smith', 'M. Rodriguez', 'K. Johnson', 'L. Williams', 'T. Brown'].map((person) => (
                                <CommandItem
                                  key={person}
                                  value={person}
                                  onSelect={() => {
                                    setLayerReviewerIndividuals(prev =>
                                      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerReviewerIndividuals.includes(person)}
                                    className="mr-1 h-2.5 w-2.5"
                                  />
                                  {person}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Reviewer Teams */}
                  <div>
                    <Label className="text-white/70 text-[9px] mb-0.5 block">Teams</Label>
                    <Popover open={reviewerTeamsOpen} onOpenChange={setReviewerTeamsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                        >
                          {layerReviewerTeams.length === 0 
                            ? 'Select teams...' 
                            : `${layerReviewerTeams.length} selected`}
                          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 bg-[#1a1d21] border-border" align="start">
                        <Command className="bg-[#1a1d21]">
                          <CommandInput placeholder="Search teams..." className="h-7 text-white text-[10px]" />
                          <CommandList>
                            <CommandEmpty className="text-white/70 p-1.5 text-[9px]">No team found.</CommandEmpty>
                            <CommandGroup>
                              {['Operations Team', 'Planning Team', 'Safety Team', 'Logistics Team', 'Command Staff'].map((team) => (
                                <CommandItem
                                  key={team}
                                  value={team}
                                  onSelect={() => {
                                    setLayerReviewerTeams(prev =>
                                      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
                                    );
                                  }}
                                  className="text-white cursor-pointer text-[10px]"
                                >
                                  <Checkbox
                                    checked={layerReviewerTeams.includes(team)}
                                    className="mr-1 h-2.5 w-2.5"
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

            {/* Layer Category Dropdown */}
            <div>
              <Label className="text-white text-[10px] mb-0.5 block">Layer Category</Label>
              <Popover open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryDropdownOpen}
                    className="w-full justify-between bg-[#1a1d21] border-border text-white hover:bg-muted/50 h-7 text-[10px]"
                  >
                    {addLayerCategory}
                    <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[624px] p-0 bg-[#1a1d21] border-border" align="start">
                  <Command className="bg-[#1a1d21]">
                    <CommandInput 
                      placeholder="Search categories..." 
                      className="bg-[#1a1d21] text-white border-none h-7 text-[10px]"
                    />
                    <CommandList>
                      <CommandEmpty className="text-white/70 py-4 text-center text-[10px]">
                        No category found.
                      </CommandEmpty>
                      <CommandGroup>
                        {[
                          'No Category',
                          'My Drafts',
                          'My ArcGIS',
                          'FSLTP',
                          'Marine Critical Infrastructure',
                          'Weather',
                          'Resources',
                          'Tactics',
                          'Geographic Response Strategies'
                        ].map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => {
                              setAddLayerCategory(category);
                              setCategoryDropdownOpen(false);
                            }}
                            className="text-white hover:bg-muted/50 text-[10px]"
                          >
                            <Check
                              className={`mr-1 h-3 w-3 ${
                                addLayerCategory === category ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Submit logic here
                  setAddLayerModalOpen(false);
                }}
                className="bg-primary hover:bg-primary/90 px-4 py-0.5 h-auto text-xs"
              >
                Submit to East District
              </Button>
              <Button
                onClick={() => setAddLayerModalOpen(false)}
                variant="outline"
                className="border-border px-4 py-0.5 h-auto text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="bg-[#222529] border-[#6e757c] text-white" style={{ maxWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Bulk Edit Objects ({selectedObjects.size} selected)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-white/70">
              Edit fields for selected objects. Changes will apply to all {selectedObjects.size} selected object(s).
            </p>
            
            {/* Field Selection */}
            <div className="space-y-3">
              <div>
                <Label className="text-white mb-2 block">Field to Edit</Label>
                <Select>
                  <SelectTrigger className="bg-[#1a1d21] border-border text-white">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222529] border-[#6e757c]">
                    <SelectItem value="value" className="text-white">Value</SelectItem>
                    <SelectItem value="source" className="text-white">Source</SelectItem>
                    <SelectItem value="lastUpdated" className="text-white">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white mb-2 block">New Value</Label>
                <Input
                  type="text"
                  placeholder="Enter new value..."
                  className="bg-[#1a1d21] border-border text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setBulkEditModalOpen(false)}
                variant="outline"
                className="border-border text-white hover:bg-muted/20"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Apply bulk edit logic here
                  setBulkEditModalOpen(false);
                  setSelectedObjects(new Set());
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


