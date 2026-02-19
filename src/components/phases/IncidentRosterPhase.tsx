import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, Map, X } from 'lucide-react';
import { toast } from 'sonner';
import svgPaths from '../../imports/svg-300ru7qiwa';
import searchSvgPaths from '../../imports/svg-7hg6d30srz';

interface IncidentRosterPhaseProps {
  data: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  onComplete: () => void;
  onPrevious?: () => void;
  isMapExpanded?: boolean;
  onZoomToLocation?: (center: string, scale: string) => void;
  onAddAIContext?: (itemName: string) => void;
}

interface Unit {
  id: string;
  name: string;
  type: string;
  status: 'Available' | 'Deployed' | 'Maintenance' | 'Standby';
  location?: string;
  personnel?: number;
}

interface AssignedMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  checkedIn: boolean;
  checkInTime?: string;
  signedIn: boolean;
  signInTime?: string;
  activationStatus: 'Activated' | 'Not Activated' | 'Awaiting Confirmation';
  units?: Unit[];
}

interface RosterPosition {
  id: string;
  title: string;
  description?: string;
  location?: string;
  assignedMembers?: AssignedMember[];
}

interface AvailablePerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Mock available personnel database (INDOPACOM/Oahu power context)
const AVAILABLE_PERSONNEL: AvailablePerson[] = [
  { id: 'p1', name: 'Col. Hana Kealoha (INDOPACOM J3/J35 Ops)', email: 'hana.kealoha@pacom.mil', phone: '(808) 472-1001' },
  { id: 'p2', name: 'Maj. Eric Tan (USMC MCBH Facilities)', email: 'eric.tan@usmc.mil', phone: '(808) 257-1002' },
  { id: 'p3', name: 'Kai Nakamura (Utility Grid Operations Liaison)', email: 'kai.nakamura@utility.hi', phone: '(808) 543-1003' },
  { id: 'p4', name: 'Ava Ikaika (State Energy Office Liaison)', email: 'ava.ikaika@hawaii.gov', phone: '(808) 587-1004' },
  { id: 'p5', name: 'Noa Silva (Honolulu Board of Water Supply Ops)', email: 'noa.silva@hbws.hi.us', phone: '(808) 748-1005' },
  { id: 'p6', name: 'Dr. Leilani Park (Hospital Coalition Coordinator)', email: 'leilani.park@hihealth.org', phone: '(808) 531-1006' },
  { id: 'p7', name: 'Malia Young (Telecom ESF‑2 Lead)', email: 'malia.young@telecom.hi', phone: '(808) 533-1007' },
  { id: 'p8', name: 'Lt. Cmdr. Jonah Reyes (Navy Region Hawaii Liaison)', email: 'jonah.reyes@navy.mil', phone: '(808) 473-1008' },
  { id: 'p9', name: 'Ken Ito (OT/ICS Security Lead)', email: 'ken.ito@utility.hi', phone: '(808) 543-1009' },
  { id: 'p10', name: 'Megan Lau (Public Affairs – JIC)', email: 'megan.lau@hawaii.gov', phone: '(808) 586-1010' },
  { id: 'p11', name: 'Daniel Kim (Legal & Privacy Counsel)', email: 'daniel.kim@ag.hi.gov', phone: '(808) 586-1011' },
  { id: 'p12', name: 'Sgt. Kalani Ho (Logistics – Fuel & Gensets)', email: 'kalani.ho@hi.ng.mil', phone: '(808) 672-1012' },
];

export function IncidentRosterPhase({ data, onDataChange, onComplete, onPrevious, isMapExpanded = true, onZoomToLocation, onAddAIContext }: IncidentRosterPhaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ memberId: string; positionId: string } | null>(null);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [selectedArea, setSelectedArea] = useState<'all' | 'atlantic' | 'pacific'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Dynamic column widths based on map expansion state
  const columnWidths = isMapExpanded ? {
    person: 'w-[240px]',
    position: 'w-[180px]',
    activation: 'w-[150px]',
    checkIn: 'w-[140px]',
    signIn: 'w-[140px]',
    actions: 'w-[100px]'
  } : {
    person: 'w-[320px]',
    position: 'w-[240px]',
    activation: 'w-[200px]',
    checkIn: 'w-[180px]',
    signIn: 'w-[180px]',
    actions: 'w-[120px]'
  };

  // Get map coordinates for areas (highest level)
  const getAreaCoordinates = (area: 'atlantic' | 'pacific'): { center: string; scale: string } => {
    switch (area) {
      case 'atlantic':
        // Atlantic Area - covers East Coast, Gulf, Great Lakes, inland waterways
        return { center: '-80.0,38.0', scale: '18489297.737236' }; // Large view of Atlantic/Eastern US
      case 'pacific':
        // Pacific Area - covers West Coast, Alaska, Hawaii, Pacific Islands
        return { center: '-140.0,35.0', scale: '36978595.474472' }; // Large view of Pacific region
      default:
        return { center: '-95.7129,37.0902', scale: '36978595.474472' }; // Continental US
    }
  };

  // Get map coordinates for districts
  const getDistrictCoordinates = (districtId: string): { center: string; scale: string } => {
    switch (districtId) {
      case 'northeast': // New England region
        return { center: '-71.0589,42.3601', scale: '1155581.108577' };
      case 'east': // NY/NJ region
        return { center: '-74.006,40.7128', scale: '577790.554289' };
      case 'southeast': // Southeast Atlantic
        return { center: '-80.8431,32.0809', scale: '2311162.217155' };
      case 'heartland': // Mississippi River region
        return { center: '-90.0715,38.6270', scale: '2311162.217155' };
      case 'greatlakes': // Great Lakes region
        return { center: '-84.5555,43.0125', scale: '2311162.217155' };
      case 'southwest': // Southern California
        return { center: '-118.2437,34.0522', scale: '1155581.108577' };
      case 'northwest': // Pacific Northwest
        return { center: '-122.3321,47.6062', scale: '1155581.108577' };
      case 'oceania': // Hawaii/Pacific
        return { center: '-157.8583,21.3099', scale: '4622324.434309' };
      case 'arctic': // Alaska
        return { center: '-149.9003,61.2181', scale: '9244648.868618' };
      default:
        return { center: '-95.7129,37.0902', scale: '36978595.474472' }; // Continental US
    }
  };

  // Get map coordinates for a specific unit within a sector
  const getUnitCoordinates = (sectorId: string, unitId: string): { center: string; scale: string } => {
    const sectorCoords = getSectorCoordinates(sectorId);
    if (!sectorCoords) return { center: '-95.7129,37.0902', scale: '36978595.474472' };
    
    // Parse the sector coordinates
    const [sectorLon, sectorLat] = sectorCoords.center.split(',').map(parseFloat);
    
    // Generate a unique offset based on unit ID for variation within ~5-15 miles of sector center
    const unitHash = unitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = ((unitHash % 100) - 50) * 0.002; // ~0.1 degree variation (about 7 miles)
    const offsetLon = (((unitHash * 7) % 100) - 50) * 0.002;
    
    const unitLat = sectorLat + offsetLat;
    const unitLon = sectorLon + offsetLon;
    
    // More zoomed in scale for individual units
    return { 
      center: `${unitLon.toFixed(6)},${unitLat.toFixed(6)}`, 
      scale: '36111.909643' // About 4x more zoomed in than sector level
    };
  };

  // Get map coordinates for sectors
  const getSectorCoordinates = (sectorId: string): { center: string; scale: string } => {
    switch (sectorId) {
      // Northeast District
      case 'aor1': return { center: '-71.0589,42.3601', scale: '144447.638572' }; // Boston
      case 'aor2': return { center: '-70.2568,43.6591', scale: '288895.277144' }; // Northern New England
      case 'aor3': return { center: '-71.3128,41.8240', scale: '288895.277144' }; // Southeastern New England
      case 'aor4': return { center: '-72.9279,41.3082', scale: '144447.638572' }; // Long Island Sound
      case 'aor5': return { center: '-70.0465,41.7003', scale: '144447.638572' }; // Cape Cod
      // East District
      case 'aor6': return { center: '-74.006,40.7128', scale: '144447.638572' }; // New York
      case 'aor7': return { center: '-75.1652,39.6738', scale: '144447.638572' }; // Delaware Bay
      case 'aor8': return { center: '-76.6122,39.2904', scale: '144447.638572' }; // Maryland-NCR
      case 'aor9': return { center: '-72.6151,40.9221', scale: '144447.638572' }; // Long Island
      case 'aor10': return { center: '-74.4057,40.0583', scale: '144447.638572' }; // New Jersey
      // Southeast District
      case 'aor11': return { center: '-79.9311,32.7765', scale: '144447.638572' }; // Charleston
      case 'aor12': return { center: '-80.1918,25.7617', scale: '144447.638572' }; // Miami
      case 'aor13': return { center: '-81.6557,30.3322', scale: '144447.638572' }; // Jacksonville
      case 'aor14': return { center: '-81.7800,24.5551', scale: '144447.638572' }; // Key West
      case 'aor15': return { center: '-77.9447,34.2257', scale: '288895.277144' }; // North Carolina
      // Heartland District
      case 'aor16': return { center: '-90.1994,38.6270', scale: '288895.277144' }; // Upper Mississippi
      case 'aor17': return { center: '-85.7585,38.2527', scale: '288895.277144' }; // Ohio Valley
      case 'aor18': return { center: '-90.0715,29.9511', scale: '288895.277144' }; // Lower Mississippi
      case 'aor19': return { center: '-92.2896,34.7465', scale: '288895.277144' }; // Arkansas River
      case 'aor20': return { center: '-86.7816,36.1627', scale: '288895.277144' }; // Tennessee-Cumberland
      // Great Lakes District
      case 'aor21': return { center: '-87.6298,41.8781', scale: '288895.277144' }; // Lake Michigan
      case 'aor22': return { center: '-83.0458,42.3314', scale: '144447.638572' }; // Detroit
      case 'aor23': return { center: '-78.8784,42.8864', scale: '144447.638572' }; // Buffalo
      case 'aor24': return { center: '-84.3476,46.4953', scale: '144447.638572' }; // Sault Ste. Marie
      case 'aor25': return { center: '-81.6944,41.4993', scale: '144447.638572' }; // Cleveland
      // Southwest District
      case 'aor26': return { center: '-117.1611,32.7157', scale: '144447.638572' }; // San Diego
      case 'aor27': return { center: '-118.2437,33.7701', scale: '144447.638572' }; // LA-Long Beach
      case 'aor28': return { center: '-119.6982,34.0195', scale: '144447.638572' }; // Channel Islands
      case 'aor29': return { center: '-119.6982,34.4208', scale: '144447.638572' }; // Santa Barbara
      case 'aor30': return { center: '-117.3795,33.1959', scale: '144447.638572' }; // Oceanside
      // Northwest District
      case 'aor31': return { center: '-122.4194,37.7749', scale: '144447.638572' }; // San Francisco
      case 'aor32': return { center: '-122.3321,47.6062', scale: '144447.638572' }; // Puget Sound
      case 'aor33': return { center: '-123.8313,46.1879', scale: '144447.638572' }; // Columbia River
      case 'aor34': return { center: '-124.2179,40.8021', scale: '144447.638572' }; // Humboldt Bay
      case 'aor35': return { center: '-124.2179,43.4065', scale: '144447.638572' }; // North Bend
      // Oceania District
      case 'aor36': return { center: '-157.8583,21.3099', scale: '288895.277144' }; // Honolulu
      case 'aor37': return { center: '144.7937,13.4443', scale: '288895.277144' }; // Guam
      case 'aor38': return { center: '-170.7020,-14.2710', scale: '288895.277144' }; // American Samoa
      case 'aor39': return { center: '145.7545,15.1850', scale: '288895.277144' }; // Saipan
      case 'aor40': return { center: '-177.3647,28.2072', scale: '288895.277144' }; // Midway
      // Arctic District
      case 'aor41': return { center: '-149.9003,61.2181', scale: '288895.277144' }; // Anchorage
      case 'aor42': return { center: '-134.4197,58.3019', scale: '288895.277144' }; // Juneau
      case 'aor43': return { center: '-152.4072,57.7900', scale: '288895.277144' }; // Kodiak
      case 'aor44': return { center: '-165.4064,64.5011', scale: '288895.277144' }; // Nome
      case 'aor45': return { center: '-146.3486,61.1308', scale: '288895.277144' }; // Valdez
      default:
        return { center: '-95.7129,37.0902', scale: '36978595.474472' }; // Continental US
    }
  };

  // Helper function to generate units for a sector
  const generateUnitsForSector = (sectorName: string, sectorId: string): Unit[] => {
    const unitTypes = [
      { type: '87-ft Patrol Boat', abbr: 'WPB' },
      { type: '45-ft Response Boat', abbr: 'RB-M' },
      { type: 'MH-65 Helicopter', abbr: 'HH-65' },
      { type: 'MH-60 Helicopter', abbr: 'HH-60' },
      { type: 'HC-130 Aircraft', abbr: 'HC-130' },
      { type: '25-ft Response Boat', abbr: 'RB-S' },
      { type: 'Pollution Response Team', abbr: 'PRT' },
      { type: 'Maritime Safety Team', abbr: 'MST' },
      { type: 'Port Security Unit', abbr: 'PSU' },
      { type: 'Tactical Law Enforcement', abbr: 'TACLET' }
    ];

    const statuses: Unit['status'][] = ['Available', 'Deployed', 'Maintenance', 'Standby'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const unitType = unitTypes[i % unitTypes.length];
      const statusIndex = i % statuses.length;
      return {
        id: `${sectorId}-unit-${i + 1}`,
        name: `${unitType.abbr}-${(8701 + parseInt(sectorId.slice(-2) || '0') * 5 + i)}`,
        type: unitType.type,
        status: statuses[statusIndex],
        location: statusIndex === 1 ? 'At sea' : 'Station',
        personnel: unitType.abbr.includes('H') ? 4 : unitType.type.includes('Team') ? 8 : 5
      };
    });
  };

  // Helper function to generate assets for a SubUnit
  const generateAssetsForSubUnit = (unitId: string, unitName: string): any[] => {
    const assetTypes = [
      { type: 'Navigation Equipment', name: 'GPS System' },
      { type: 'Communication Equipment', name: 'Radio System' },
      { type: 'Safety Equipment', name: 'Life Rafts' },
      { type: 'Emergency Equipment', name: 'First Aid Kit' },
      { type: 'Operational Equipment', name: 'Binoculars' }
    ];
    
    const conditions = ['Operational', 'Needs Maintenance', 'In Repair', 'Operational'];
    
    return Array.from({ length: 4 }, (_, i) => {
      const assetType = assetTypes[i % assetTypes.length];
      return {
        id: `${unitId}-asset-${i + 1}`,
        name: `${assetType.name} ${i + 1}`,
        type: assetType.type,
        condition: conditions[i % conditions.length],
        serialNumber: `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
    });
  };

  // Atlantic Area Districts
  const atlanticRoster: RosterPosition[] = [
    { 
      id: 'northeast', 
      title: 'Northeast District',
      location: 'Boston, MA',
      description: 'Covers New England coastal waters from the Canadian border to Long Island Sound. Primary focus on commercial fishing vessel safety, port security for Boston and Portland, and SAR operations in challenging North Atlantic conditions.',
      assignedMembers: [
        { id: 'aor1', name: 'Sector Boston', email: 'secBoston.cc@uscg.mil', phone: '(617) 223-3201', location: 'Boston, MA', checkedIn: true, checkInTime: new Date().toLocaleString(), signedIn: true, signInTime: new Date().toLocaleString(), activationStatus: 'Activated' },
        { id: 'aor2', name: 'Sector Northern New England', email: 'secNNE.cc@uscg.mil', phone: '(207) 767-0303', location: 'South Portland, ME', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor3', name: 'Sector Southeastern New England', email: 'secSENE.cc@uscg.mil', phone: '(401) 435-2300', location: 'Woods Hole, MA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor4', name: 'Sector Long Island Sound', email: 'secLIS.cc@uscg.mil', phone: '(203) 468-4400', location: 'New Haven, CT', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor5', name: 'Sector Cape Cod', email: 'secCapeCod.cc@uscg.mil', phone: '(508) 457-3200', location: 'Buzzards Bay, MA', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'east', 
      title: 'East District',
      location: 'Staten Island, NY',
      description: 'Encompasses the New York/New Jersey port complex and Delaware Bay. Manages the busiest maritime corridor on the East Coast with emphasis on counter-terrorism, environmental protection, and vessel traffic management.',
      assignedMembers: [
        { id: 'aor6', name: 'Sector New York', email: 'secNY.cc@uscg.mil', phone: '(718) 354-4353', location: 'Staten Island, NY', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor7', name: 'Sector Delaware Bay', email: 'secDEBay.cc@uscg.mil', phone: '(215) 271-4807', location: 'Philadelphia, PA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor8', name: 'Sector Maryland-National Capital Region', email: 'secMDNCR.cc@uscg.mil', phone: '(410) 576-2625', location: 'Baltimore, MD', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor9', name: 'Sector Long Island', email: 'secLI.cc@uscg.mil', phone: '(631) 661-9100', location: 'Fire Island, NY', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor10', name: 'Sector New Jersey', email: 'secNJ.cc@uscg.mil', phone: '(609) 724-4450', location: 'Atlantic City, NJ', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'southeast', 
      title: 'Southeast District',
      location: 'Miami, FL',
      description: 'Responsible for the southeastern Atlantic coast and Caribbean approaches. Conducts extensive counter-narcotics operations, migrant interdiction, and hurricane response. Key ports include Charleston, Savannah, and Miami.',
      assignedMembers: [
        { id: 'aor11', name: 'Sector Charleston', email: 'secCharleston.cc@uscg.mil', phone: '(843) 740-7050', location: 'Charleston, SC', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor12', name: 'Sector Miami', email: 'secMiami.cc@uscg.mil', phone: '(305) 535-4472', location: 'Miami Beach, FL', checkedIn: true, signedIn: false, activationStatus: 'Awaiting Confirmation' },
        { id: 'aor13', name: 'Sector Jacksonville', email: 'secJax.cc@uscg.mil', phone: '(904) 564-7500', location: 'Mayport, FL', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor14', name: 'Sector Key West', email: 'secKeyWest.cc@uscg.mil', phone: '(305) 292-8727', location: 'Key West, FL', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor15', name: 'Sector North Carolina', email: 'secNC.cc@uscg.mil', phone: '(252) 247-4598', location: 'Wilmington, NC', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'heartland', 
      title: 'Heartland District',
      location: 'St. Louis, MO',
      description: 'Oversees inland river systems including the Mississippi, Missouri, Ohio, and Tennessee rivers. Focuses on commercial towing vessel safety, ATON maintenance, and pollution prevention for inland waterways supporting critical agricultural and industrial transport.',
      assignedMembers: [
        { id: 'aor16', name: 'Sector Upper Mississippi River', email: 'secUMR.cc@uscg.mil', phone: '(314) 269-2332', location: 'St. Louis, MO', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor17', name: 'Sector Ohio Valley', email: 'secOhioValley.cc@uscg.mil', phone: '(502) 779-5347', location: 'Louisville, KY', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor18', name: 'Sector Lower Mississippi River', email: 'secLMR.cc@uscg.mil', phone: '(504) 589-6298', location: 'Memphis, TN', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor19', name: 'Sector Arkansas River', email: 'secArkRiver.cc@uscg.mil', phone: '(501) 324-5266', location: 'Little Rock, AR', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor20', name: 'Sector Tennessee-Cumberland', email: 'secTennCumb.cc@uscg.mil', phone: '(615) 736-5421', location: 'Nashville, TN', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'greatlakes', 
      title: 'Great Lakes District',
      location: 'Cleveland, OH',
      description: 'Manages operations across all five Great Lakes and the St. Lawrence Seaway. Specializes in icebreaking to extend the commercial shipping season, recreational boating safety during peak summer months, and binational coordination with Canadian authorities.',
      assignedMembers: [
        { id: 'aor21', name: 'Sector Lake Michigan', email: 'secLakeMichigan.cc@uscg.mil', phone: '(414) 747-7182', location: 'Milwaukee, WI', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor22', name: 'Sector Detroit', email: 'secDetroit.cc@uscg.mil', phone: '(313) 568-9564', location: 'Detroit, MI', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor23', name: 'Sector Buffalo', email: 'secBuffalo.cc@uscg.mil', phone: '(716) 843-9570', location: 'Buffalo, NY', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor24', name: 'Sector Sault Ste. Marie', email: 'secSault.cc@uscg.mil', phone: '(906) 635-3233', location: 'Sault Ste. Marie, MI', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor25', name: 'Sector Cleveland', email: 'secCleveland.cc@uscg.mil', phone: '(216) 902-6050', location: 'Cleveland, OH', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    }
  ];

  // Pacific Area Districts
  const pacificRoster: RosterPosition[] = [
    { 
      id: 'southwest', 
      title: 'Southwest District',
      location: 'Alameda, CA',
      description: 'Covers Southern California waters from Point Conception to the Mexican border. Manages the busiest container port complex in North America (LA/Long Beach), conducts extensive counter-narcotics patrols, and coordinates migrant rescue operations.',
      assignedMembers: [
        { id: 'aor26', name: 'Sector San Diego', email: 'sectorsd.cc@uscg.mil', phone: '(619) 278-7033', location: 'San Diego, CA', checkedIn: true, checkInTime: new Date().toLocaleString(), signedIn: true, signInTime: new Date().toLocaleString(), activationStatus: 'Activated' },
        { id: 'aor27', name: 'Sector Los Angeles–Long Beach', email: 'seclalb.cc@uscg.mil', phone: '(310) 521-3801', location: 'San Pedro, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor28', name: 'Sector Channel Islands', email: 'secChannelIslands.cc@uscg.mil', phone: '(805) 382-8511', location: 'Port Hueneme, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor29', name: 'Sector Santa Barbara', email: 'secSantaBarbara.cc@uscg.mil', phone: '(805) 965-5351', location: 'Santa Barbara, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor30', name: 'Sector Oceanside', email: 'secOceanside.cc@uscg.mil', phone: '(760) 967-4000', location: 'Oceanside, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'northwest', 
      title: 'Northwest District',
      location: 'Seattle, WA',
      description: 'Responsible for Northern California, Oregon, and Washington coastal waters. Emphasizes commercial fishing vessel safety in treacherous North Pacific conditions, environmental response for oil transport routes, and vessel traffic management in the Strait of Juan de Fuca.',
      assignedMembers: [
        { id: 'aor31', name: 'Sector San Francisco', email: 'secsf.cc@uscg.mil', phone: '(415) 399-3547', location: 'Alameda, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor32', name: 'Sector Puget Sound', email: 'secPugetSound.cc@uscg.mil', phone: '(206) 217-6001', location: 'Seattle, WA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor33', name: 'Sector Columbia River', email: 'secColumbiaRiver.cc@uscg.mil', phone: '(503) 861-6211', location: 'Warrenton, OR', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor34', name: 'Sector Humboldt Bay', email: 'secHumboldtBay.cc@uscg.mil', phone: '(707) 839-6113', location: 'Eureka, CA', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor35', name: 'Sector North Bend', email: 'secNorthBend.cc@uscg.mil', phone: '(541) 756-9213', location: 'North Bend, OR', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'oceania', 
      title: 'Oceania District',
      location: 'Honolulu, HI',
      description: 'Administers vast Pacific Ocean areas including Hawaii, Guam, American Samoa, and surrounding Exclusive Economic Zones. Conducts long-range fisheries enforcement, supports DoD operations in the Western Pacific, and provides SAR across millions of square miles of open ocean.',
      assignedMembers: [
        { id: 'aor36', name: 'Sector Honolulu', email: 'secHonolulu.cc@uscg.mil', phone: '(808) 842-2600', location: 'Honolulu, HI', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor37', name: 'Sector Guam', email: 'secGuam.cc@uscg.mil', phone: '(671) 355-4824', location: 'Apra Harbor, Guam', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor38', name: 'Sector American Samoa', email: 'secAmSamoa.cc@uscg.mil', phone: '(684) 633-4500', location: 'Pago Pago, American Samoa', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor39', name: 'Sector Saipan', email: 'secSaipan.cc@uscg.mil', phone: '(670) 237-7100', location: 'Saipan, Northern Mariana Islands', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor40', name: 'Sector Midway', email: 'secMidway.cc@uscg.mil', phone: '(808) 842-2650', location: 'Midway Atoll', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    },
    { 
      id: 'arctic', 
      title: 'Arctic District',
      location: 'Juneau, AK',
      description: 'Manages Alaska\'s extensive coastline from the Aleutian Islands to the Beaufort Sea. Specializes in polar icebreaking, subsistence community support, commercial fishing oversight in Bering Sea, and increasingly important Arctic maritime domain awareness as ice cover diminishes.',
      assignedMembers: [
        { id: 'aor41', name: 'Sector Anchorage', email: 'secAnchorage.cc@uscg.mil', phone: '(907) 463-2000', location: 'Anchorage, AK', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor42', name: 'Sector Juneau', email: 'secJuneau.cc@uscg.mil', phone: '(907) 463-2245', location: 'Juneau, AK', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor43', name: 'Sector Kodiak', email: 'secKodiak.cc@uscg.mil', phone: '(907) 487-5760', location: 'Kodiak, AK', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor44', name: 'Sector Nome', email: 'secNome.cc@uscg.mil', phone: '(907) 443-3444', location: 'Nome, AK', checkedIn: true, signedIn: true, activationStatus: 'Activated' },
        { id: 'aor45', name: 'Sector Valdez', email: 'secValdez.cc@uscg.mil', phone: '(907) 835-7206', location: 'Valdez, AK', checkedIn: true, signedIn: true, activationStatus: 'Activated' }
      ] 
    }
  ];

  // Determine which roster to use based on selected area
  const roster: RosterPosition[] = 
    selectedArea === 'atlantic' ? atlanticRoster :
    selectedArea === 'pacific' ? pacificRoster :
    [...atlanticRoster, ...pacificRoster];

  // Add/Edit Member Side Sheet form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    positionId: roster[0]?.id || 'incident-commander',
    activationStatus: 'Activated' as 'Activated' | 'Not Activated' | 'Awaiting Confirmation',
    checkedIn: false,
    signedIn: false,
  });

  const handleGenerateTeamsSite = () => {
    toast.success('Generating Microsoft Teams site for Incident Roster...');
  };

  const openAddMemberSheet = () => {
    setEditingMember(null);
    setFormData({ name: '', email: '', phone: '', positionId: roster[0]?.id || 'incident-commander', activationStatus: 'Activated', checkedIn: false, signedIn: false });
    setIsSheetOpen(true);
  };

  const openEditMemberSheet = (memberId: string, positionId: string) => {
    const position = roster.find(p => p.id === positionId);
    const member = position?.assignedMembers?.find(m => m.id === memberId);
    if (!member) return;
    setEditingMember({ memberId, positionId });
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      positionId,
      activationStatus: member.activationStatus,
      checkedIn: member.checkedIn,
      signedIn: member.signedIn,
    });
    setIsSheetOpen(true);
  };

  const saveMember = () => {
    if (!formData.name || !formData.email || !formData.positionId) {
      toast.error('Please fill in name, email, and position');
      return;
    }

    const updatedRoster = roster.map(position => {
      if (position.id !== formData.positionId && editingMember && position.id === editingMember.positionId) {
        // If position changed, remove from old position below, then will be added to new position in next pass
        return {
          ...position,
          assignedMembers: position.assignedMembers?.filter(m => m.id !== editingMember.memberId) || [],
        };
      }
      return position;
    }).map(position => {
      if (position.id === formData.positionId) {
        if (editingMember && position.id === formData.positionId) {
          // Update existing in same position
          return {
            ...position,
            assignedMembers: (position.assignedMembers || []).map(m => m.id === editingMember.memberId ? {
              ...m,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              activationStatus: formData.activationStatus,
              checkedIn: formData.checkedIn,
              signedIn: formData.signedIn,
            } : m)
          };
        } else if (editingMember && position.id === formData.positionId) {
          return position; // handled above
        } else {
          // Add new
          const newMember: AssignedMember = {
            id: `${Date.now()}-${Math.random()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            checkedIn: formData.checkedIn,
            signedIn: formData.signedIn,
            activationStatus: formData.activationStatus,
          };
          return {
            ...position,
            assignedMembers: [...(position.assignedMembers || []), newMember]
          };
        }
      }
      return position;
    });

    onDataChange({ ...data, roster: updatedRoster });
    setIsSheetOpen(false);
    setEditingMember(null);
    toast.success(editingMember ? 'Member updated successfully' : 'Member added successfully');
  };

  const handleRemoveMember = (memberId: string, positionId: string) => {
    const updatedRoster = roster.map(position => {
      if (position.id === positionId) {
        return {
          ...position,
          assignedMembers: position.assignedMembers?.filter(m => m.id !== memberId) || []
        };
      }
      return position;
    });

    onDataChange({ ...data, roster: updatedRoster });
    toast.success('Member removed');
  };

  const handleEditMember = (memberId: string, positionId: string) => {
    openEditMemberSheet(memberId, positionId);
  };

  const handleCheckInChange = (memberId: string, positionId: string, value: string) => {
    const newCheckedIn = value === 'checked-in';
    const updatedRoster = roster.map(position => {
      if (position.id === positionId) {
        return {
          ...position,
          assignedMembers: position.assignedMembers?.map(member => {
            if (member.id === memberId) {
              return {
                ...member,
                checkedIn: newCheckedIn,
                checkInTime: newCheckedIn ? new Date().toLocaleString() : undefined
              };
            }
            return member;
          }) || []
        };
      }
      return position;
    });

    onDataChange({ ...data, roster: updatedRoster });
    
    const position = roster.find(p => p.id === positionId);
    const member = position?.assignedMembers?.find(m => m.id === memberId);
    if (member) {
      toast.success(`${member.name} ${newCheckedIn ? 'checked in' : 'checked out'}`);
    }
  };

  const handleSignInChange = (memberId: string, positionId: string, value: string) => {
    const newSignedIn = value === 'signed-in';
    const updatedRoster = roster.map(position => {
      if (position.id === positionId) {
        return {
          ...position,
          assignedMembers: position.assignedMembers?.map(member => {
            if (member.id === memberId) {
              return {
                ...member,
                signedIn: newSignedIn,
                signInTime: newSignedIn ? new Date().toLocaleString() : undefined
              };
            }
            return member;
          }) || []
        };
      }
      return position;
    });

    onDataChange({ ...data, roster: updatedRoster });
    
    const position = roster.find(p => p.id === positionId);
    const member = position?.assignedMembers?.find(m => m.id === memberId);
    if (member) {
      toast.success(`${member.name} ${newSignedIn ? 'signed in' : 'signed out'}`);
    }
  };

  const handleToggleActivation = (memberId: string, positionId: string) => {
    const updatedRoster = roster.map(position => {
      if (position.id === positionId) {
        return {
          ...position,
          assignedMembers: position.assignedMembers?.map(member => {
            if (member.id === memberId) {
              // Cycle through: Activated -> Awaiting Confirmation -> Not Activated -> Activated
              let newStatus: 'Activated' | 'Not Activated' | 'Awaiting Confirmation';
              if (member.activationStatus === 'Activated') {
                newStatus = 'Awaiting Confirmation';
              } else if (member.activationStatus === 'Awaiting Confirmation') {
                newStatus = 'Not Activated';
              } else {
                newStatus = 'Activated';
              }
              
              return {
                ...member,
                activationStatus: newStatus
              };
            }
            return member;
          }) || []
        };
      }
      return position;
    });

    onDataChange({ ...data, roster: updatedRoster });
  };

  // Helper function to get activation status color
  const getActivationStatusColor = (status: 'Activated' | 'Not Activated' | 'Awaiting Confirmation') => {
    switch (status) {
      case 'Activated':
        return 'var(--accent)';
      case 'Awaiting Confirmation':
        return '#F59E0B'; // Warning/amber color
      case 'Not Activated':
        return 'var(--muted)';
      default:
        return 'var(--muted)';
    }
  };

  // Helper function to get activation status text color
  const getActivationStatusTextColor = (status: 'Activated' | 'Not Activated' | 'Awaiting Confirmation') => {
    switch (status) {
      case 'Activated':
        return 'white';
      case 'Awaiting Confirmation':
        return '#F59E0B'; // Warning/amber color
      case 'Not Activated':
        return '#6e757c';
      default:
        return '#6e757c';
    }
  };

  // Filter districts by search term and selected filters
  const filteredDistricts = (() => {
    // If a sector is selected, show only that sector as a top-level item
    if (selectedDistrict && selectedSector) {
      const district = roster.find(d => d.id === selectedDistrict);
      if (district) {
        const sector = district.assignedMembers?.find(s => s.id === selectedSector);
        if (sector) {
          // Generate units for this sector
          const units = generateUnitsForSector(sector.name, sector.id);
          // Create a pseudo-district that represents the selected sector at top level
          // with units as children (represented as assignedMembers)
          return [{
            id: `sector-${selectedSector}`,
            title: sector.name,
            description: `Selected sector from ${district.title}`,
            assignedMembers: units.map(unit => ({
              id: unit.id,
              name: `${unit.name} — ${unit.type}`,
              email: sector.email,
              phone: sector.phone,
              checkedIn: unit.status === 'Available' || unit.status === 'Deployed',
              signedIn: unit.status === 'Deployed',
              activationStatus: unit.status === 'Maintenance' ? 'Not Activated' : 'Activated' as const
            }))
          }];
        }
      }
      return [];
    }
    
    // If only district is selected, show only that district
    if (selectedDistrict) {
      const district = roster.find(d => d.id === selectedDistrict);
      return district ? [district] : [];
    }
    
    // Normal filtering by search term
    return roster.filter((district) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return district.title.toLowerCase().includes(s);
    });
  })();

  const toggleMember = (id: string) => {
    setExpandedMembers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSector = (id: string) => {
    setExpandedSectors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSectorMapClick = (districtId: string, sectorId: string) => {
    setSelectedDistrict(districtId);
    setSelectedSector(sectorId);
    // Auto-expand the sector to show its units
    setExpandedMembers(prev => new Set([...prev, `sector-${sectorId}`]));
  };

  const clearDistrictFilter = () => {
    setSelectedDistrict(null);
    setSelectedSector(null);
  };

  const clearSectorFilter = () => {
    setSelectedSector(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Sticky (mirrors Resources) */}
      <div className="sticky top-0 z-10 bg-[#222529] rounded-lg border border-[#6e757c] relative">
        <div className="flex flex-col border-b-2 border-border rounded-t-lg rounded-b-none">
          {/* First Row: Title and Search/Add */}
          <div className="flex items-center justify-between px-[13px] py-3">
            {/* Title */}
            <p className="caption text-nowrap text-white whitespace-pre">AORs</p>
            {/* Search + Add Member (search immediately left of button) */}
            <div className="flex items-center gap-4">
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
                    <path d={searchSvgPaths.p3a3bec00} stroke="#6E757C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.710938" />
                    <path d={searchSvgPaths.p380aaa80} stroke="#6E757C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.710938" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          </div>
          {/* Second Row: Area Toggle */}
          <div className="flex items-center px-[13px] py-3 border-t border-[#6e757c]">
            <div className="flex items-center border border-[#6e757c] rounded-[4px] overflow-hidden">
              <button
                onClick={() => setSelectedArea('all')}
                className={`caption px-3 py-1 transition-colors ${
                  selectedArea === 'all' 
                    ? 'bg-[#01669f] text-white' 
                    : 'bg-transparent text-white hover:bg-[#6e757c]/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedArea('atlantic')}
                className={`px-3 py-1 transition-colors border-l border-[#6e757c] flex items-center gap-1.5 ${
                  selectedArea === 'atlantic' 
                    ? 'bg-[#01669f] text-white' 
                    : 'bg-transparent text-white hover:bg-[#6e757c]/20'
                }`}
              >
                <span className="caption">Atlantic Area</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onZoomToLocation) {
                      const coords = getAreaCoordinates('atlantic');
                      onZoomToLocation(coords.center, coords.scale);
                    }
                  }}
                  className="p-0.5 hover:bg-white/20 rounded transition-colors"
                  title="Zoom to Atlantic Area"
                >
                  <Map className="w-3 h-3" />
                </button>
              </button>
              <button
                onClick={() => setSelectedArea('pacific')}
                className={`px-3 py-1 transition-colors border-l border-[#6e757c] flex items-center gap-1.5 ${
                  selectedArea === 'pacific' 
                    ? 'bg-[#01669f] text-white' 
                    : 'bg-transparent text-white hover:bg-[#6e757c]/20'
                }`}
              >
                <span className="caption">Pacific Area</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onZoomToLocation) {
                      const coords = getAreaCoordinates('pacific');
                      onZoomToLocation(coords.center, coords.scale);
                    }
                  }}
                  className="p-0.5 hover:bg-white/20 rounded transition-colors"
                  title="Zoom to Pacific Area"
                >
                  <Map className="w-3 h-3" />
                </button>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      {(selectedDistrict || selectedSector) && (
        <div className="flex items-center gap-2 mb-4">
          {selectedDistrict && (
            <div className="flex items-center gap-2 bg-[#01669f] rounded-[4px] px-3 py-1.5">
              <span className="caption text-white">
                District: {roster.find(d => d.id === selectedDistrict)?.title || selectedDistrict}
              </span>
              <button
                onClick={clearDistrictFilter}
                className="hover:bg-white/20 rounded transition-colors p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          {selectedSector && (
            <div className="flex items-center gap-2 bg-[#01669f] rounded-[4px] px-3 py-1.5">
              <span className="caption text-white">
                Sector: {roster.find(d => d.id === selectedDistrict)?.assignedMembers?.find(s => s.id === selectedSector)?.name || selectedSector}
              </span>
              <button
                onClick={clearSectorFilter}
                className="hover:bg-white/20 rounded transition-colors p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Districts List */}
      <div className="space-y-4">
        {filteredDistricts.map((district) => {
          const isExpanded = expandedMembers.has(district.id);
          
          // Special case: If this is a sector-level view (showing SubUnits), skip the parent container
          // and render the SubUnits directly as top-level items
          if (district.id.startsWith('sector-')) {
            return (
              <div key={district.id} className="space-y-2">
                {district.assignedMembers?.map((sector) => {
                  const sectorId = `${district.id}:${sector.id}`;
                  const isSectorExpanded = expandedSectors.has(sectorId);
                  return (
                    <div
                      key={sectorId}
                      className="border border-border/50 rounded-lg overflow-hidden"
                      style={{ backgroundColor: 'rgba(139, 123, 168, 0.15)' }}
                    >
                      {/* SubUnit Header */}
                      <div className={`p-3 ${isSectorExpanded ? 'border-b border-border/50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div
                            className="flex items-start gap-2 cursor-pointer flex-1"
                            onClick={() => {
                              toggleSector(sectorId);
                              if (onAddAIContext) {
                                onAddAIContext(sector.name);
                              }
                            }}
                          >
                            {isSectorExpanded ? (
                              <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                            )}
                            <span className="caption text-white">{sector.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation();
                                // Zoom to unit location
                                if (onZoomToLocation) {
                                  const coords = getUnitCoordinates(selectedSector || '', sector.id);
                                  onZoomToLocation(coords.center, coords.scale);
                                }
                              }}
                              className="p-1 hover:bg-muted/30 rounded transition-colors"
                              title="Zoom to unit location"
                            >
                              <Map className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* SubUnit Details (Expanded) */}
                      {isSectorExpanded && (
                        <div className="p-3 space-y-3 bg-card/20">
                          {/* SubUnit-specific details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-white mb-1 block text-xs">Unit Type</label>
                              <p className="caption text-white text-sm">{sector.name.split(' — ')[1] || 'USCG Asset'}</p>
                            </div>
                            <div>
                              <label className="text-white mb-1 block text-xs">Status</label>
                              <p className="caption text-white text-sm">{sector.activationStatus || 'Active'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-white mb-1 block text-xs">Contact</label>
                              <p className="caption text-white text-sm">{sector.email || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-white mb-1 block text-xs">Phone</label>
                              <p className="caption text-white text-sm">{sector.phone || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Assets List */}
                          <div>
                            <label className="text-white mb-2 block text-xs">Resources ({generateAssetsForSubUnit(sector.id, sector.name).length})</label>
                            <div className="space-y-2">
                              {generateAssetsForSubUnit(sector.id, sector.name).map((asset) => {
                                const assetId = `${sectorId}:${asset.id}`;
                                const isAssetExpanded = expandedAssets.has(assetId);
                                return (
                                  <div
                                    key={assetId}
                                    className="border border-border/50 rounded-lg overflow-hidden"
                                    style={{ backgroundColor: 'rgba(139, 123, 168, 0.15)' }}
                                  >
                                    {/* Asset Header */}
                                    <div className={`p-3 ${isAssetExpanded ? 'border-b border-border/50' : ''}`}>
                                      <div className="flex items-start justify-between">
                                        <div
                                          className="flex items-start gap-2 cursor-pointer flex-1"
                                          onClick={() => {
                                            setExpandedAssets(prev => {
                                              const next = new Set(prev);
                                              if (next.has(assetId)) next.delete(assetId);
                                              else next.add(assetId);
                                              return next;
                                            });
                                          }}
                                        >
                                          {isAssetExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                          )}
                                          <span className="caption text-white">{asset.name}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Asset Details (Expanded) */}
                                    {isAssetExpanded && (
                                      <div className="p-3 space-y-3 bg-card/20">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-white mb-1 block text-xs">Type</label>
                                            <p className="caption text-white text-sm">{asset.type}</p>
                                          </div>
                                          <div>
                                            <label className="text-white mb-1 block text-xs">Condition</label>
                                            <p className="caption text-white text-sm">{asset.condition}</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-white mb-1 block text-xs">Serial Number</label>
                                            <p className="caption text-white text-sm">{asset.serialNumber}</p>
                                          </div>
                                          <div>
                                            <label className="text-white mb-1 block text-xs">Last Inspection</label>
                                            <p className="caption text-white text-sm">{asset.lastInspection}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Normal district rendering
          return (
            <div
              key={district.id}
              className="border border-border rounded-lg overflow-hidden"
              style={{ background: 'linear-gradient(90deg, rgba(2, 163, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(90deg, rgb(20, 23, 26) 0%, rgb(20, 23, 26) 100%)' }}
            >
              {/* District Header */}
              <div className={`p-3 ${isExpanded ? 'border-b border-border' : ''}`}>
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-start gap-2 flex-1 cursor-pointer"
                    onClick={() => {
                      toggleMember(district.id);
                      if (onAddAIContext) {
                        onAddAIContext(district.title);
                      }
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="caption text-white">{district.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        // Zoom to district location
                        if (onZoomToLocation) {
                          const coords = getDistrictCoordinates(district.id);
                          onZoomToLocation(coords.center, coords.scale);
                        }
                      }}
                      className="p-1 hover:bg-muted/30 rounded transition-colors"
                      title="Zoom to district"
                    >
                      <Map className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* District Details (Expanded) */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-card/50">
                  {/* District Location */}
                  {district.location && (
                    <div>
                      <label className="text-white mb-1 block">Location</label>
                      <p className="caption text-white">
                        {district.location}
                        {(() => {
                          const coords = getDistrictCoordinates(district.id);
                          const [lon, lat] = coords.center.split(',');
                          return ` (${parseFloat(lat).toFixed(4)}°N, ${Math.abs(parseFloat(lon)).toFixed(4)}°W)`;
                        })()}
                      </p>
                    </div>
                  )}
                  
                  {/* District Description */}
                  {district.description && (
                    <div>
                      <label className="text-white mb-1 block">Description</label>
                      <p className="caption text-white">{district.description}</p>
                    </div>
                  )}
                  
                  {/* Nested Sectors/SubUnits List */}
                  <div>
                    <label className="text-white mb-2 block">
                      {district.id.startsWith('sector-') ? 'SubUnits' : 'Sectors'} ({district.assignedMembers?.length || 0})
                    </label>
                    <div className="space-y-2">
                      {district.assignedMembers?.map((sector) => {
                        const sectorId = `${district.id}:${sector.id}`;
                        const isSectorExpanded = expandedSectors.has(sectorId);
                        return (
                          <div
                            key={sectorId}
                            className="border border-border/50 rounded-lg overflow-hidden"
                            style={{ backgroundColor: 'rgba(139, 123, 168, 0.15)' }}
                          >
                            {/* Sector Header */}
                            <div className={`p-3 ${isSectorExpanded ? 'border-b border-border/50' : ''}`}>
                              <div className="flex items-start justify-between">
                                <div
                                  className="flex items-start gap-2 cursor-pointer flex-1"
                                  onClick={() => {
                                    toggleSector(sectorId);
                                    if (onAddAIContext) {
                                      onAddAIContext(sector.name);
                                    }
                                  }}
                                >
                                  {isSectorExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="caption text-white">{sector.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      // Zoom to location - either specific unit location or sector location
                                      if (onZoomToLocation) {
                                        let coords;
                                        if (district.id.startsWith('sector-')) {
                                          // This is a unit - zoom to unique unit location near parent sector
                                          coords = getUnitCoordinates(selectedSector || '', sector.id);
                                        } else {
                                          // This is a sector - zoom to sector location
                                          coords = getSectorCoordinates(sector.id);
                                        }
                                        onZoomToLocation(coords.center, coords.scale);
                                      }
                                    }}
                                    className="p-1 hover:bg-muted/30 rounded transition-colors"
                                    title={district.id.startsWith('sector-') ? "Zoom to unit location" : "Zoom to sector"}
                                  >
                                    <Map className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Sector/SubUnit Details (Expanded) */}
                            {isSectorExpanded && (
                              <div className="p-3 space-y-3 bg-card/20">
                                {/* Show Sector SubUnits Button */}
                                {!district.id.startsWith('sector-') && (
                                  <div className="mb-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Apply filters to show sector's units
                                        handleSectorMapClick(district.id, sector.id);
                                      }}
                                      className="bg-[#01669f] h-[22.75px] rounded-[4px] px-4 hover:bg-[#01669f]/90 transition-colors flex items-center justify-center"
                                    >
                                      <p className="caption text-nowrap text-white">Show Sector SubUnits</p>
                                    </button>
                                  </div>
                                )}
                                {/* Check if this is a unit (promoted sector showing units as children) */}
                                {district.id.startsWith('sector-') ? (
                                  // This is a unit - show unit-specific details
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Unit Type</label>
                                      <p className="caption text-white text-sm">{sector.name.split(' — ')[1] || 'USCG Asset'}</p>
                                    </div>
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Status</label>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getActivationStatusColor(sector.activationStatus) }} />
                                        <span className="caption text-sm" style={{ color: getActivationStatusTextColor(sector.activationStatus) }}>
                                          {sector.signedIn ? 'Deployed' : sector.checkedIn ? 'Available' : 'Standby'}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Location</label>
                                      <p className="caption text-white text-sm">
                                        {sector.signedIn ? 'At sea' : 'Station'}
                                        {(() => {
                                          const coords = getUnitCoordinates(selectedSector || '', sector.id);
                                          const [lon, lat] = coords.center.split(',');
                                          return ` (${parseFloat(lat).toFixed(4)}°N, ${Math.abs(parseFloat(lon)).toFixed(4)}°W)`;
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Personnel</label>
                                      <p className="caption text-white text-sm">
                                        {sector.name.includes('Helicopter') || sector.name.includes('HH-') ? '4' : 
                                         sector.name.includes('Team') ? '8' : '5'}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  // This is a regular sector - show sector details
                                  <div className="grid grid-cols-2 gap-3">
                                    {sector.location && (
                                      <div>
                                        <label className="text-white mb-1 block text-xs">Location</label>
                                        <p className="caption text-white text-sm">
                                          {sector.location}
                                          {(() => {
                                            const coords = getSectorCoordinates(sector.id);
                                            const [lon, lat] = coords.center.split(',');
                                            return ` (${parseFloat(lat).toFixed(4)}°N, ${Math.abs(parseFloat(lon)).toFixed(4)}°W)`;
                                          })()}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Command Center Email</label>
                                      <p className="caption text-white text-sm">{sector.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Command Center Phone</label>
                                      <p className="caption text-white text-sm">{sector.phone || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-white mb-1 block text-xs">Operating Status</label>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getActivationStatusColor(sector.activationStatus) }} />
                                        <span className="caption text-sm" style={{ color: getActivationStatusTextColor(sector.activationStatus) }}>{sector.activationStatus}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Air Stations (Northeast District only) */}
                  {district.id === 'northeast' && (() => {
                    const airStations = [
                      { id: 'air-cape-cod', name: 'Air Station Cape Cod', location: 'Buzzards Bay, MA', email: 'airCapeCod.cc@uscg.mil', phone: '(508) 968-6110', activationStatus: 'Activated' },
                      { id: 'air-atlantic-city', name: 'Air Station Atlantic City', location: 'Atlantic City, NJ', email: 'airAtlanticCity.cc@uscg.mil', phone: '(609) 677-2200', activationStatus: 'Activated' },
                      { id: 'air-boston', name: 'Air Station Boston', location: 'Boston, MA', email: 'airBoston.cc@uscg.mil', phone: '(781) 925-4560', activationStatus: 'Activated' },
                    ];
                    return (
                      <div>
                        <label className="text-white mb-2 block">Air Stations ({airStations.length})</label>
                        <div className="space-y-2">
                          {airStations.map((station) => {
                            const stationId = `${district.id}:${station.id}`;
                            const isStationExpanded = expandedSectors.has(stationId);
                            return (
                              <div
                                key={stationId}
                                className="border border-border/50 rounded-lg overflow-hidden"
                                style={{ backgroundColor: 'rgba(139, 123, 168, 0.15)' }}
                              >
                                <div className={`p-3 ${isStationExpanded ? 'border-b border-border/50' : ''}`}>
                                  <div className="flex items-start justify-between">
                                    <div
                                      className="flex items-start gap-2 cursor-pointer flex-1"
                                      onClick={() => {
                                        toggleSector(stationId);
                                        if (onAddAIContext) {
                                          onAddAIContext(station.name);
                                        }
                                      }}
                                    >
                                      {isStationExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                      )}
                                      <span className="caption text-white">{station.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onZoomToLocation) {
                                            const coords = getSectorCoordinates(station.id);
                                            onZoomToLocation(coords.center, coords.scale);
                                          }
                                        }}
                                        className="p-1 hover:bg-muted/30 rounded transition-colors"
                                        title="Zoom to air station"
                                      >
                                        <Map className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {isStationExpanded && (
                                  <div className="p-3 space-y-3 bg-card/20">
                                    <div className="grid grid-cols-2 gap-3">
                                      {station.location && (
                                        <div>
                                          <label className="text-white mb-1 block text-xs">Location</label>
                                          <p className="caption text-white text-sm">{station.location}</p>
                                        </div>
                                      )}
                                      <div>
                                        <label className="text-white mb-1 block text-xs">Command Center Email</label>
                                        <p className="caption text-white text-sm">{station.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-white mb-1 block text-xs">Command Center Phone</label>
                                        <p className="caption text-white text-sm">{station.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-white mb-1 block text-xs">Operating Status</label>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getActivationStatusColor(station.activationStatus) }} />
                                          <span className="caption text-sm" style={{ color: getActivationStatusTextColor(station.activationStatus) }}>{station.activationStatus}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
              </div>

      {/* Add/Edit Region Side Panel */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[640px] bg-card overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>{editingMember ? 'Edit Region' : 'Add Region'}</SheetTitle>
            <SheetDescription>
              {editingMember ? 'Update the region information below.' : 'Fill in the form below to add a new region.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 pb-6">
            <div className="space-y-2">
              <Label className="text-foreground">Region Name <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g., Southwest District"
                className="bg-input-background border-border" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Area <span className="text-destructive">*</span></Label>
              <Select value={formData.positionId} onValueChange={(value) => setFormData({ ...formData, positionId: value })}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue placeholder="Select area..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atlantic">Atlantic Area</SelectItem>
                  <SelectItem value="pacific">Pacific Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="Describe the region's area of responsibility, key operations, and strategic focus..."
                className="bg-input-background border-border min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Primary Contact Email</Label>
              <Input 
                type="email" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="region.command@uscg.mil"
                className="bg-input-background border-border" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Command Center Phone</Label>
              <Input 
                value="" 
                placeholder="(123) 456-7890"
                className="bg-input-background border-border" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Operational Status</Label>
              <Select value={formData.activationStatus} onValueChange={(value) => setFormData({ ...formData, activationStatus: value as any })}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activated">Fully Operational</SelectItem>
                  <SelectItem value="Awaiting Confirmation">Limited Operations</SelectItem>
                  <SelectItem value="Not Activated">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Geographic Coordinates</Label>
              <Input 
                placeholder="e.g., -118.2437,34.0522"
                className="bg-input-background border-border" 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={saveMember} className="flex-1 bg-primary hover:bg-primary/90">
                {editingMember ? 'Update Region' : 'Add Region'}
              </Button>
              <Button onClick={() => setIsSheetOpen(false)} variant="outline" className="flex-1 border-border">
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
