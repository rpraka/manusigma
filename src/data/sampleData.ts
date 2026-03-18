// ============================================================================
// ManuSigma - Body-in-White Sheet Metal Stamping Quality Management
// Sample Data for Automotive Factory
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  material: string;
  thickness: number; // mm
  process: "stamping" | "welding" | "assembly";
  status: "active" | "engineering-change" | "pre-production" | "discontinued";
  supplier: string;
  vehicle: string;
  annualVolume: number;
  valueStream: string[];
}

export interface QualityIssue {
  id: string;
  partId: string;
  partName: string;
  issueType:
    | "crack"
    | "wrinkle"
    | "springback"
    | "weld spatter"
    | "dimensional"
    | "surface defect"
    | "hole misalignment"
    | "thinning"
    | "edge wave"
    | "skid mark";
  severity: "critical" | "major" | "minor";
  status: "open" | "resolved" | "monitoring";
  dateReported: string;
  dateResolved: string | null;
  rootCause: string;
  correctiveAction: string;
  affectedCount: number;
  process: string;
  station: string;
  shift: "A" | "B" | "C";
  occurrenceRate: number; // defects per thousand
  detectionMethod: string;
}

export interface PFMEAEntry {
  id: string;
  partId: string;
  processStep: string;
  potentialFailureMode: string;
  potentialEffect: string;
  severity: number; // 1-10
  occurrence: number; // 1-10
  detection: number; // 1-10
  rpn: number; // severity * occurrence * detection
  currentControls: string;
  recommendedAction: string;
  status: "open" | "in-progress" | "completed" | "deferred";
}

export interface ControlPlan {
  id: string;
  partId: string;
  processStep: string;
  characteristic: string;
  specification: string;
  tolerance: string;
  measurementMethod: string;
  sampleSize: number;
  frequency: string;
  controlMethod: string;
  reactionPlan: string;
  isCompliant: boolean;
}

export interface Prediction {
  id: string;
  partId: string;
  partName: string;
  failureMode: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  timeframe: string;
  impactLevel: "high" | "medium" | "low";
  recommendedAction: string;
  basedOn: string;
  relatedIssues: string[];
  predictedAffectedParts: number;
}

export interface HorizontalDeployment {
  id: string;
  sourceIssueId: string;
  sourcePartName: string;
  affectedParts: string[];
  commonProcess: string;
  standardsToUpdate: string[];
  status: "planned" | "in-progress" | "completed" | "verified";
  completionPercentage: number;
}

export interface BOMItem {
  name: string;
  quantity: number;
  unitCost: number;
}

export interface RFQ {
  id: string;
  partName: string;
  customerName: string;
  material: string;
  dimensions: string;
  annualVolume: number;
  complexity: "low" | "medium" | "high";
  estimatedCost: number;
  leadTime: number; // weeks
  feasibilityScore: number; // 0-100
  riskFactors: string[];
  bomItems: BOMItem[];
}

export interface MonthlyData {
  month: string;
  issues: number;
  resolved: number;
  predicted: number;
  compliance: number; // percentage
}

export interface FactoryStats {
  totalParts: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  avgResolutionDays: number;
  complianceRate: number; // percentage
  predictionAccuracy: number; // percentage
  monthlyData: MonthlyData[];
}

export interface Standard {
  id: string;
  name: string;
  code: string;
  category: string;
  lastUpdated: string;
  applicableParts: string[];
  status: "current" | "needs-update" | "outdated";
}

// ---------------------------------------------------------------------------
// 1. Parts
// ---------------------------------------------------------------------------

export const parts: Part[] = [
  {
    id: "PRT-001",
    name: "Hood Outer",
    partNumber: "BIW-HD-2024-001",
    material: "AA6016-T4 Aluminum",
    thickness: 1.0,
    process: "stamping",
    status: "active",
    supplier: "Novelis Inc.",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B2",
      "Lubrication & Centering",
      "Transfer Press TP-4200 (Draw)",
      "Transfer Press TP-4200 (Trim)",
      "Transfer Press TP-4200 (Flange)",
      "Transfer Press TP-4200 (Restrike)",
      "In-Line CMM Check",
      "Hem Flange Assembly",
      "E-Coat & Sealer",
      "Rack & Ship to GA"
    ],
  },
  {
    id: "PRT-002",
    name: "Front Fender LH",
    partNumber: "BIW-FD-2024-002",
    material: "DC04 Mild Steel",
    thickness: 0.7,
    process: "stamping",
    status: "active",
    supplier: "ThyssenKrupp Steel",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B1",
      "Lubrication & Centering",
      "Tandem Press TP-2500 (Draw)",
      "Tandem Press TP-2500 (Trim/Pierce)",
      "Tandem Press TP-2500 (Flange/Cam)",
      "Surface Audit Station",
      "Spot Weld Bracket Assembly",
      "Dimensional CMM",
      "E-Coat Rack",
      "Ship to GA Body Shop"
    ],
  },
  {
    id: "PRT-003",
    name: "Front Door Outer LH",
    partNumber: "BIW-DR-2024-003",
    material: "BH210 Bake-Hardening Steel",
    thickness: 0.65,
    process: "stamping",
    status: "active",
    supplier: "POSCO",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B1",
      "Wash & Lubrication",
      "Transfer Press TP-3600 (Draw)",
      "Transfer Press TP-3600 (Trim/Pierce)",
      "Transfer Press TP-3600 (Flange)",
      "Transfer Press TP-3600 (Restrike/Cam)",
      "Surface Inspection Tunnel",
      "Roller Hem Cell DH-12",
      "Adhesive & Sealer Application",
      "Dimensional Audit",
      "Ship to GA Trim Line"
    ],
  },
  {
    id: "PRT-004",
    name: "Roof Panel",
    partNumber: "BIW-RF-2024-004",
    material: "DP590 Dual-Phase Steel",
    thickness: 0.7,
    process: "stamping",
    status: "active",
    supplier: "ArcelorMittal",
    vehicle: "Atlas EV Sedan",
    annualVolume: 60000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B3 (Large Format)",
      "Lubrication & Centering",
      "Hydraulic Press HP-5000 (Draw)",
      "Hydraulic Press HP-5000 (Trim)",
      "Hydraulic Press HP-5000 (Restrike)",
      "Laser Trim Cell LT-08",
      "Surface Audit Station",
      "Roof Bow Spot Weld",
      "Dimensional CMM",
      "Convey to BIW Framing"
    ],
  },
  {
    id: "PRT-005",
    name: "Trunk Lid Outer",
    partNumber: "BIW-TK-2024-005",
    material: "AA6022-T4 Aluminum",
    thickness: 1.0,
    process: "stamping",
    status: "engineering-change",
    supplier: "Novelis Inc.",
    vehicle: "Atlas EV Sedan",
    annualVolume: 60000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B2",
      "Lubrication & Centering",
      "Transfer Press TP-3600 (Draw)",
      "Transfer Press TP-3600 (Trim)",
      "Transfer Press TP-3600 (Flange)",
      "Transfer Press TP-3600 (Restrike)",
      "Surface Inspection",
      "Hem Flange Assembly",
      "Adhesive Bond & Sealer",
      "Ship to GA"
    ],
  },
  {
    id: "PRT-006",
    name: "Rear Quarter Panel LH",
    partNumber: "BIW-QP-2024-006",
    material: "DP780 Dual-Phase Steel",
    thickness: 1.2,
    process: "stamping",
    status: "active",
    supplier: "ArcelorMittal",
    vehicle: "Atlas EV Sedan",
    annualVolume: 60000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B3 (Large Format)",
      "Lubrication",
      "Transfer Press TP-4200 (Draw)",
      "Transfer Press TP-4200 (Trim/Pierce)",
      "Transfer Press TP-4200 (Flange/Cam)",
      "Transfer Press TP-4200 (Restrike)",
      "Laser Trim Cell LT-10",
      "Dimensional CMM",
      "Sub-Assembly Spot Weld",
      "Convey to BIW Framing"
    ],
  },
  {
    id: "PRT-007",
    name: "Rocker Panel Inner LH",
    partNumber: "BIW-RP-2024-007",
    material: "CP800 Complex-Phase Steel",
    thickness: 1.4,
    process: "stamping",
    status: "active",
    supplier: "SSAB",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B1",
      "Lubrication",
      "Tandem Press TP-2500 (Draw)",
      "Tandem Press TP-2500 (Trim/Pierce)",
      "Tandem Press TP-2500 (Flange)",
      "Dimensional Check Fixture",
      "Spot Weld to Rocker Reinforcement",
      "Convey to BIW Underbody"
    ],
  },
  {
    id: "PRT-008",
    name: "A-Pillar Reinforcement LH",
    partNumber: "BIW-AP-2024-008",
    material: "22MnB5 Hot-Stamped Boron Steel",
    thickness: 1.5,
    process: "stamping",
    status: "active",
    supplier: "Gestamp",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Blank Receipt & Inspection",
      "Roller Hearth Furnace (930 C / 5 min)",
      "Hot Stamp Press HSP-1200 (Form & Quench)",
      "Laser Trim Cell LT-03",
      "Shot Blast Cleaning",
      "Hardness & Microstructure Check",
      "Dimensional CMM",
      "Spot Weld Sub-Assembly",
      "Convey to BIW Framing"
    ],
  },
  {
    id: "PRT-009",
    name: "B-Pillar Reinforcement LH",
    partNumber: "BIW-BP-2024-009",
    material: "22MnB5 Hot-Stamped Boron Steel (Tailored)",
    thickness: 1.8,
    process: "stamping",
    status: "pre-production",
    supplier: "Gestamp",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Tailor-Welded Blank Receipt",
      "Roller Hearth Furnace (Differential Heating)",
      "Hot Stamp Press HSP-1200 (Form & Quench)",
      "Laser Trim Cell LT-04",
      "Shot Blast Cleaning",
      "Hardness Mapping (Soft & Hard Zones)",
      "Dimensional CMM",
      "Spot Weld Sub-Assembly",
      "Convey to BIW Framing"
    ],
  },
  {
    id: "PRT-010",
    name: "Floor Pan Front",
    partNumber: "BIW-FP-2024-010",
    material: "DP590 Dual-Phase Steel",
    thickness: 1.0,
    process: "stamping",
    status: "active",
    supplier: "ThyssenKrupp Steel",
    vehicle: "Atlas EV Sedan",
    annualVolume: 60000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B3 (Large Format)",
      "Lubrication",
      "Hydraulic Press HP-5000 (Draw)",
      "Hydraulic Press HP-5000 (Trim/Pierce)",
      "Hydraulic Press HP-5000 (Flange/Restrike)",
      "Dimensional CMM",
      "Nut & Stud Projection Weld",
      "Convey to BIW Underbody"
    ],
  },
  {
    id: "PRT-011",
    name: "Wheel House Inner LH",
    partNumber: "BIW-WH-2024-011",
    material: "HSLA340 High-Strength Low-Alloy Steel",
    thickness: 0.8,
    process: "stamping",
    status: "active",
    supplier: "POSCO",
    vehicle: "Atlas EV Sedan",
    annualVolume: 120000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B1",
      "Lubrication",
      "Tandem Press TP-2500 (Draw)",
      "Tandem Press TP-2500 (Trim/Pierce)",
      "Tandem Press TP-2500 (Flange/Cam)",
      "Dimensional Check Fixture",
      "Spot Weld Sub-Assembly",
      "Convey to BIW Underbody"
    ],
  },
  {
    id: "PRT-012",
    name: "Dash Panel",
    partNumber: "BIW-DP-2024-012",
    material: "DP780 Dual-Phase Steel",
    thickness: 1.0,
    process: "stamping",
    status: "active",
    supplier: "ArcelorMittal",
    vehicle: "Atlas EV Sedan",
    annualVolume: 60000,
    valueStream: [
      "Coil Receipt & Inspection",
      "Blanking Line B3 (Large Format)",
      "Lubrication",
      "Hydraulic Press HP-5000 (Draw)",
      "Hydraulic Press HP-5000 (Trim/Pierce)",
      "Hydraulic Press HP-5000 (Flange)",
      "Laser Trim Cell LT-06",
      "Dimensional CMM",
      "Projection Weld (Studs & Brackets)",
      "Convey to BIW Underbody"
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Quality Issues
// ---------------------------------------------------------------------------

export const qualityIssues: QualityIssue[] = [
  {
    id: "QI-2025-001",
    partId: "PRT-001",
    partName: "Hood Outer",
    issueType: "surface defect",
    severity: "major",
    status: "resolved",
    dateReported: "2025-06-14",
    dateResolved: "2025-06-28",
    rootCause:
      "Die polish degradation on draw die cavity; micro-pitting caused by aluminum galling buildup after 18,000 hits without re-polish",
    correctiveAction:
      "Implemented PVD (Physical Vapor Deposition) TiAlN coating on draw die surfaces; established die polish interval at 12,000 hits with optical surface audit",
    affectedCount: 342,
    process: "Stamping - Draw Operation",
    station: "Transfer Press TP-4200, Station 1",
    shift: "A",
    occurrenceRate: 4.8,
    detectionMethod: "Automated surface inspection tunnel with deflectometry",
  },
  {
    id: "QI-2025-002",
    partId: "PRT-002",
    partName: "Front Fender LH",
    issueType: "wrinkle",
    severity: "major",
    status: "resolved",
    dateReported: "2025-07-03",
    dateResolved: "2025-07-19",
    rootCause:
      "Insufficient blank holder force in the draw die flange area near headlamp pocket; material flow imbalance due to incoming coil property variation (yield strength 12% below nominal)",
    correctiveAction:
      "Increased blank holder pressure from 420 kN to 510 kN in Zone 3; added draw bead in headlamp pocket region; tightened incoming coil mechanical property specification to +/- 5% yield strength",
    affectedCount: 187,
    process: "Stamping - Draw Operation",
    station: "Tandem Press TP-2500, Die 1",
    shift: "B",
    occurrenceRate: 2.6,
    detectionMethod: "Visual inspection at surface audit station",
  },
  {
    id: "QI-2025-003",
    partId: "PRT-003",
    partName: "Front Door Outer LH",
    issueType: "springback",
    severity: "critical",
    status: "monitoring",
    dateReported: "2025-07-22",
    dateResolved: "2025-08-15",
    rootCause:
      "BH210 material elastic recovery exceeding die compensation; flange angle deviating 2.8 deg from nominal causing door fit gap exceedance at B-pillar interface",
    correctiveAction:
      "Re-cut restrike die with additional 3.5 deg overbend compensation; added stake bead in flange to lock material; verified with 50-piece trial run showing Cpk > 1.67",
    affectedCount: 523,
    process: "Stamping - Restrike/Cam Operation",
    station: "Transfer Press TP-3600, Station 4",
    shift: "A",
    occurrenceRate: 7.3,
    detectionMethod: "CMM dimensional audit (6 per shift)",
  },
  {
    id: "QI-2025-004",
    partId: "PRT-006",
    partName: "Rear Quarter Panel LH",
    issueType: "crack",
    severity: "critical",
    status: "resolved",
    dateReported: "2025-08-05",
    dateResolved: "2025-08-30",
    rootCause:
      "Corner radius too tight (R3) at wheel arch transition; DP780 material exceeded forming limit at 38% thinning in draw operation",
    correctiveAction:
      "Opened corner radius from R3 to R5 with engineering approval; added intermediate form step; verified thinning reduced to 22% (below 25% FLD limit); updated forming simulation model",
    affectedCount: 89,
    process: "Stamping - Draw Operation",
    station: "Transfer Press TP-4200, Station 1",
    shift: "C",
    occurrenceRate: 1.2,
    detectionMethod: "Operator detection (audible crack during forming)",
  },
  {
    id: "QI-2025-005",
    partId: "PRT-008",
    partName: "A-Pillar Reinforcement LH",
    issueType: "dimensional",
    severity: "major",
    status: "resolved",
    dateReported: "2025-08-18",
    dateResolved: "2025-09-05",
    rootCause:
      "Thermal distortion during hot stamp quench cycle; non-uniform cooling channel flow in die causing uneven martensite transformation and 1.8mm bow in pillar length",
    correctiveAction:
      "Rebalanced cooling channel flow rates; replaced clogged cooling lines in die upper cavity; added conformal cooling inserts in critical zone; verified distortion < 0.5mm",
    affectedCount: 214,
    process: "Hot Stamping - Form & Quench",
    station: "Hot Stamp Press HSP-1200",
    shift: "A",
    occurrenceRate: 3.0,
    detectionMethod: "CMM dimensional audit (3 per shift)",
  },
  {
    id: "QI-2025-006",
    partId: "PRT-010",
    partName: "Floor Pan Front",
    issueType: "hole misalignment",
    severity: "major",
    status: "resolved",
    dateReported: "2025-09-02",
    dateResolved: "2025-09-12",
    rootCause:
      "Pilot pin wear causing 1.2mm positional drift on battery tray mounting holes; pin diameter reduced from 10.00mm to 9.72mm through abrasive wear",
    correctiveAction:
      "Replaced worn pilot pins with carbide-tipped pins; added pin wear gauge to PM checklist (weekly); established pin replacement interval at 80,000 hits",
    affectedCount: 156,
    process: "Stamping - Trim/Pierce Operation",
    station: "Hydraulic Press HP-5000, Station 2",
    shift: "B",
    occurrenceRate: 2.2,
    detectionMethod: "Go/No-Go gauge check at dimensional check fixture",
  },
  {
    id: "QI-2025-007",
    partId: "PRT-004",
    partName: "Roof Panel",
    issueType: "surface defect",
    severity: "minor",
    status: "resolved",
    dateReported: "2025-09-15",
    dateResolved: "2025-09-22",
    rootCause:
      "Skid marks from blank transfer automation; vacuum cup pad material degradation causing marks on Class A surface",
    correctiveAction:
      "Replaced all vacuum cup pads with non-marking silicone compound; adjusted transfer speed from 18 to 14 strokes/min; added pad inspection to daily start-up checklist",
    affectedCount: 78,
    process: "Stamping - Blank Loading",
    station: "Hydraulic Press HP-5000, Loader",
    shift: "A",
    occurrenceRate: 1.1,
    detectionMethod: "Surface audit station (Dstone lighting)",
  },
  {
    id: "QI-2025-008",
    partId: "PRT-007",
    partName: "Rocker Panel Inner LH",
    issueType: "thinning",
    severity: "major",
    status: "resolved",
    dateReported: "2025-09-28",
    dateResolved: "2025-10-15",
    rootCause:
      "CP800 material strain hardening insufficient to redistribute deformation; localized thinning to 32% at B-pillar junction corner exceeding 28% safety limit",
    correctiveAction:
      "Added draw bead to redistribute material flow; adjusted blank size from 1450x380 to 1480x395mm providing additional material in critical zone; thinning reduced to 21%",
    affectedCount: 134,
    process: "Stamping - Draw Operation",
    station: "Tandem Press TP-2500, Die 1",
    shift: "C",
    occurrenceRate: 1.9,
    detectionMethod: "Ultrasonic thickness measurement (1 per 500 parts)",
  },
  {
    id: "QI-2025-009",
    partId: "PRT-003",
    partName: "Front Door Outer LH",
    issueType: "weld spatter",
    severity: "minor",
    status: "resolved",
    dateReported: "2025-10-08",
    dateResolved: "2025-10-14",
    rootCause:
      "Spot weld gun tip wear on bracket sub-assembly cell; electrode cap diameter mushroomed from 6mm to 7.8mm reducing current density and causing expulsion",
    correctiveAction:
      "Implemented automatic tip dresser with 200-weld interval; installed weld current monitoring with adaptive control; reduced tip change interval from 4,000 to 2,500 welds",
    affectedCount: 62,
    process: "Welding - Bracket Sub-Assembly",
    station: "Spot Weld Cell SW-23",
    shift: "B",
    occurrenceRate: 0.9,
    detectionMethod: "Visual inspection at weld audit station",
  },
  {
    id: "QI-2025-010",
    partId: "PRT-005",
    partName: "Trunk Lid Outer",
    issueType: "edge wave",
    severity: "major",
    status: "open",
    dateReported: "2025-10-25",
    dateResolved: null,
    rootCause:
      "AA6022 aluminum blank exhibiting residual stress from coil leveling; edge waviness amplitude 0.8mm exceeding 0.3mm Class A surface spec on trailing edge",
    correctiveAction:
      "Under investigation: evaluating tension leveling parameters at supplier; interim containment with 100% surface audit and manual rework of affected panels",
    affectedCount: 203,
    process: "Stamping - Draw Operation",
    station: "Transfer Press TP-3600, Station 1",
    shift: "A",
    occurrenceRate: 5.6,
    detectionMethod: "Automated surface inspection tunnel with deflectometry",
  },
  {
    id: "QI-2025-011",
    partId: "PRT-009",
    partName: "B-Pillar Reinforcement LH",
    issueType: "crack",
    severity: "critical",
    status: "open",
    dateReported: "2025-11-03",
    dateResolved: null,
    rootCause:
      "Hydrogen embrittlement at transition zone of tailored property B-pillar; micro-cracks initiating at soft zone / hard zone boundary during laser trimming",
    correctiveAction:
      "Under investigation: adjusting furnace heating profile to widen transition zone; evaluating laser trim parameters (power, speed, assist gas); consulting with Gestamp on TWB weld line placement",
    affectedCount: 34,
    process: "Hot Stamping / Laser Trim",
    station: "Laser Trim Cell LT-04",
    shift: "A",
    occurrenceRate: 0.5,
    detectionMethod: "Magnetic particle inspection (1 per 200 parts)",
  },
  {
    id: "QI-2025-012",
    partId: "PRT-012",
    partName: "Dash Panel",
    issueType: "wrinkle",
    severity: "minor",
    status: "monitoring",
    dateReported: "2025-11-10",
    dateResolved: "2025-11-28",
    rootCause:
      "Minor wrinkle formation in HVAC duct opening region; excess material in non-critical area creating aesthetic wrinkle visible only under angled lighting",
    correctiveAction:
      "Added local emboss feature in trim die to consume excess material; wrinkle eliminated in trial but monitoring for 30 production days per PPAP requirement",
    affectedCount: 98,
    process: "Stamping - Trim Operation",
    station: "Hydraulic Press HP-5000, Station 2",
    shift: "B",
    occurrenceRate: 1.4,
    detectionMethod: "Visual inspection at dimensional check fixture",
  },
  {
    id: "QI-2025-013",
    partId: "PRT-011",
    partName: "Wheel House Inner LH",
    issueType: "dimensional",
    severity: "major",
    status: "resolved",
    dateReported: "2025-11-18",
    dateResolved: "2025-12-06",
    rootCause:
      "Cam unit timing drift on flange operation; actuator return spring fatigue causing inconsistent flange angle on shock tower mounting face",
    correctiveAction:
      "Replaced cam actuator return springs; added proximity sensor for cam position verification; implemented cam stroke monitoring in press PLC with auto-stop on deviation > 0.3mm",
    affectedCount: 167,
    process: "Stamping - Flange/Cam Operation",
    station: "Tandem Press TP-2500, Die 3",
    shift: "A",
    occurrenceRate: 2.3,
    detectionMethod: "CMM dimensional audit (6 per shift)",
  },
  {
    id: "QI-2025-014",
    partId: "PRT-001",
    partName: "Hood Outer",
    issueType: "springback",
    severity: "major",
    status: "open",
    dateReported: "2025-12-02",
    dateResolved: null,
    rootCause:
      "AA6016-T4 material from new coil lot showing 8% higher yield strength (148 MPa vs. nominal 137 MPa); increased springback causing hood-to-fender gap exceedance by 0.6mm",
    correctiveAction:
      "Under investigation: evaluating restrike die pressure increase; working with Novelis to tighten T4 temper aging window; interim containment with CMM sort",
    affectedCount: 278,
    process: "Stamping - Restrike Operation",
    station: "Transfer Press TP-4200, Station 4",
    shift: "B",
    occurrenceRate: 3.9,
    detectionMethod: "CMM dimensional audit and flush/gap measurement",
  },
  {
    id: "QI-2025-015",
    partId: "PRT-002",
    partName: "Front Fender LH",
    issueType: "skid mark",
    severity: "minor",
    status: "resolved",
    dateReported: "2025-12-10",
    dateResolved: "2025-12-18",
    rootCause:
      "Draw die nitrogen spring failure in one of eight pressure pads; uneven blank holder contact causing material slip and skid marks on Class A surface",
    correctiveAction:
      "Replaced all eight nitrogen springs as a set; added nitrogen spring pressure monitoring to press PLC; established spring replacement interval at 500,000 cycles",
    affectedCount: 45,
    process: "Stamping - Draw Operation",
    station: "Tandem Press TP-2500, Die 1",
    shift: "C",
    occurrenceRate: 0.6,
    detectionMethod: "Surface audit station (Dstone lighting)",
  },
  {
    id: "QI-2026-001",
    partId: "PRT-006",
    partName: "Rear Quarter Panel LH",
    issueType: "surface defect",
    severity: "major",
    status: "open",
    dateReported: "2026-01-08",
    dateResolved: null,
    rootCause:
      "Die face scoring from hardened slug fragment embedded in draw die binder surface; slug from upstream pierce operation migrating into draw die during part transfer",
    correctiveAction:
      "Under investigation: adding slug retention magnets to pierce die; evaluating slug chute redesign; interim containment with die face inspection every 2,000 hits",
    affectedCount: 112,
    process: "Stamping - Draw Operation",
    station: "Transfer Press TP-4200, Station 1",
    shift: "A",
    occurrenceRate: 1.6,
    detectionMethod: "Automated surface inspection tunnel with deflectometry",
  },
  {
    id: "QI-2026-002",
    partId: "PRT-004",
    partName: "Roof Panel",
    issueType: "dimensional",
    severity: "critical",
    status: "open",
    dateReported: "2026-01-20",
    dateResolved: null,
    rootCause:
      "Progressive die wear on trim steels causing roof edge profile deviation; laser trim cell alignment drift contributing additional 0.4mm offset from nominal on drip rail feature",
    correctiveAction:
      "Under investigation: scheduling trim steel re-grind; recalibrating laser trim cell LT-08; evaluating in-process laser measurement for closed-loop trim correction",
    affectedCount: 189,
    process: "Stamping - Trim / Laser Trim",
    station: "Hydraulic Press HP-5000, Station 2 / Laser Trim Cell LT-08",
    shift: "B",
    occurrenceRate: 2.6,
    detectionMethod: "CMM dimensional audit (3 per shift)",
  },
  {
    id: "QI-2026-003",
    partId: "PRT-008",
    partName: "A-Pillar Reinforcement LH",
    issueType: "thinning",
    severity: "major",
    status: "monitoring",
    dateReported: "2026-02-05",
    dateResolved: "2026-02-22",
    rootCause:
      "Furnace zone 3 temperature overshoot (945C vs. 930C target) causing excessive austenite grain growth; reduced ductility in form operation resulting in localized thinning at windshield flange",
    correctiveAction:
      "Recalibrated furnace zone 3 thermocouples; added redundant pyrometer measurement; tightened furnace PLC temperature tolerance from +/-15C to +/-8C; monitoring 30-day Cpk",
    affectedCount: 76,
    process: "Hot Stamping - Furnace / Form",
    station: "Roller Hearth Furnace / HSP-1200",
    shift: "C",
    occurrenceRate: 1.1,
    detectionMethod: "Ultrasonic thickness measurement (1 per 300 parts)",
  },
  {
    id: "QI-2026-004",
    partId: "PRT-010",
    partName: "Floor Pan Front",
    issueType: "crack",
    severity: "critical",
    status: "monitoring",
    dateReported: "2026-02-18",
    dateResolved: "2026-03-05",
    rootCause:
      "Edge cracking at battery tray mounting flange; blanking die burr height exceeding 0.15mm limit causing stress concentration at flanged edge",
    correctiveAction:
      "Re-sharpened blanking die trim steels; implemented burr height measurement at blanking line (every 1,000 blanks); set die re-sharp trigger at 0.10mm burr height; monitoring Cpk for 30 days",
    affectedCount: 67,
    process: "Blanking / Stamping - Flange",
    station: "Blanking Line B3 / HP-5000 Station 3",
    shift: "A",
    occurrenceRate: 0.9,
    detectionMethod: "Operator detection during visual audit",
  },
  {
    id: "QI-2026-005",
    partId: "PRT-007",
    partName: "Rocker Panel Inner LH",
    issueType: "weld spatter",
    severity: "minor",
    status: "open",
    dateReported: "2026-03-01",
    dateResolved: null,
    rootCause:
      "Projection weld nut attachment cell: weld current too high for CP800 material coating; zinc layer vaporization causing spatter around M8 weld nuts on B-pillar attachment flange",
    correctiveAction:
      "Under investigation: evaluating weld schedule adjustment (slope-up, current reduction); testing alternative weld nut supplier with modified projection geometry for coated AHSS",
    affectedCount: 91,
    process: "Welding - Projection Weld",
    station: "Projection Weld Cell PW-07",
    shift: "B",
    occurrenceRate: 1.3,
    detectionMethod: "Visual inspection at weld audit station",
  },
];

// ---------------------------------------------------------------------------
// 3. PFMEA Data
// ---------------------------------------------------------------------------

export const pfmeaData: PFMEAEntry[] = [
  {
    id: "PFMEA-001",
    partId: "PRT-001",
    processStep: "Draw Operation - Hood Outer",
    potentialFailureMode: "Panel splitting at draw wall radius",
    potentialEffect: "Scrap part; line stoppage for die adjustment; potential delivery shortage",
    severity: 8,
    occurrence: 3,
    detection: 4,
    rpn: 96,
    currentControls: "Forming simulation validated; draw bead force monitoring; tonnage monitoring on press",
    recommendedAction: "Install in-die thinning sensor array for real-time strain monitoring",
    status: "in-progress",
  },
  {
    id: "PFMEA-002",
    partId: "PRT-001",
    processStep: "Surface Inspection - Hood Outer",
    potentialFailureMode: "Surface defect escapes to customer (dent, scratch, skid mark)",
    potentialEffect: "Customer complaint; warranty claim; potential recall if systemic",
    severity: 7,
    occurrence: 4,
    detection: 3,
    rpn: 84,
    currentControls: "Automated deflectometry inspection tunnel; manual Dstone audit every 50 parts",
    recommendedAction: "Upgrade deflectometry software to v3.2 with deep learning defect classification",
    status: "open",
  },
  {
    id: "PFMEA-003",
    partId: "PRT-003",
    processStep: "Restrike/Cam Operation - Door Outer",
    potentialFailureMode: "Excessive springback causing dimensional non-conformance",
    potentialEffect: "Door fit gap and flush exceedance; rework at body shop; customer dissatisfaction",
    severity: 8,
    occurrence: 5,
    detection: 5,
    rpn: 200,
    currentControls: "CMM audit 6 per shift; check fixture with go/no-go pins",
    recommendedAction: "Implement in-line 3D optical scanner for 100% dimensional verification on critical features",
    status: "open",
  },
  {
    id: "PFMEA-004",
    partId: "PRT-006",
    processStep: "Draw Operation - Quarter Panel",
    potentialFailureMode: "Crack at wheel arch transition radius",
    potentialEffect: "Scrap part; potential structural integrity concern if undetected",
    severity: 9,
    occurrence: 3,
    detection: 5,
    rpn: 135,
    currentControls: "FLD analysis in simulation; tonnage monitoring; visual inspection 1 per 100",
    recommendedAction: "Add acoustic emission monitoring for real-time crack detection during forming",
    status: "in-progress",
  },
  {
    id: "PFMEA-005",
    partId: "PRT-008",
    processStep: "Hot Stamp Form & Quench - A-Pillar",
    potentialFailureMode: "Incomplete martensitic transformation (soft spots)",
    potentialEffect: "Reduced crashworthiness; safety-critical failure in side impact",
    severity: 10,
    occurrence: 2,
    detection: 4,
    rpn: 80,
    currentControls: "Hardness test 1 per 200 parts; furnace temperature monitoring; quench flow monitoring",
    recommendedAction: "Implement 100% inline hardness testing with eddy current probe at die exit",
    status: "completed",
  },
  {
    id: "PFMEA-006",
    partId: "PRT-009",
    processStep: "Laser Trim - B-Pillar (Hot Stamped)",
    potentialFailureMode: "Micro-cracking at soft/hard zone transition during laser trim",
    potentialEffect: "Delayed fracture in service; safety-critical structural failure",
    severity: 10,
    occurrence: 4,
    detection: 6,
    rpn: 240,
    currentControls: "Magnetic particle inspection 1 per 200 parts; cross-section metallography 1 per lot",
    recommendedAction: "Increase MPI frequency to 1 per 50 parts; add inline eddy current inspection; redesign laser trim path to avoid transition zone",
    status: "open",
  },
  {
    id: "PFMEA-007",
    partId: "PRT-010",
    processStep: "Trim/Pierce - Floor Pan (Battery Tray Holes)",
    potentialFailureMode: "Hole position drift from pilot pin wear",
    potentialEffect: "Battery tray misalignment; assembly line rework; potential safety concern",
    severity: 8,
    occurrence: 4,
    detection: 4,
    rpn: 128,
    currentControls: "Go/No-Go gauge 6 per shift; pilot pin wear check weekly",
    recommendedAction: "Implement vision system for 100% hole position verification in-die",
    status: "in-progress",
  },
  {
    id: "PFMEA-008",
    partId: "PRT-004",
    processStep: "Blanking - Roof Panel (Large Format)",
    potentialFailureMode: "Blank edge burr exceeding spec causing downstream edge crack",
    potentialEffect: "Cracking in draw operation; scrap increase; unplanned die maintenance",
    severity: 7,
    occurrence: 3,
    detection: 5,
    rpn: 105,
    currentControls: "Burr height measurement 1 per 1,000 blanks; die re-sharp schedule",
    recommendedAction: "Install inline laser burr measurement system at blanking line exit conveyor",
    status: "open",
  },
  {
    id: "PFMEA-009",
    partId: "PRT-002",
    processStep: "Draw Operation - Fender",
    potentialFailureMode: "Wrinkle in headlamp pocket area from material flow imbalance",
    potentialEffect: "Part rework or scrap; headlamp fit issue at assembly",
    severity: 6,
    occurrence: 4,
    detection: 3,
    rpn: 72,
    currentControls: "Draw bead force monitoring; blank holder pressure gauges; surface audit station",
    recommendedAction: "Add strain-based draw-in sensors on draw die binder for closed-loop blank holder pressure control",
    status: "deferred",
  },
  {
    id: "PFMEA-010",
    partId: "PRT-005",
    processStep: "Hem Flange Assembly - Trunk Lid",
    potentialFailureMode: "Hem flange crack on aluminum outer panel",
    potentialEffect: "Scrap assembly; hem quality defect visible to customer; water leak potential",
    severity: 7,
    occurrence: 3,
    detection: 3,
    rpn: 63,
    currentControls: "Pre-hem and final hem force monitoring; cross-section audit 1 per shift",
    recommendedAction: "Implement roller hemming with adaptive force control replacing table-top hemming",
    status: "completed",
  },
  {
    id: "PFMEA-011",
    partId: "PRT-012",
    processStep: "Draw Operation - Dash Panel",
    potentialFailureMode: "Wrinkle at HVAC opening flange from excess material",
    potentialEffect: "Cosmetic defect; potential interference with HVAC duct at assembly",
    severity: 5,
    occurrence: 4,
    detection: 4,
    rpn: 80,
    currentControls: "Visual inspection at check fixture; blank size audit",
    recommendedAction: "Add local emboss feature in die to absorb excess material; update forming simulation",
    status: "completed",
  },
  {
    id: "PFMEA-012",
    partId: "PRT-007",
    processStep: "Projection Weld - Rocker Panel (M8 Nuts)",
    potentialFailureMode: "Weld spatter from zinc coating vaporization on CP800",
    potentialEffect: "Spatter on mating surface causing assembly interference; cosmetic defect",
    severity: 5,
    occurrence: 5,
    detection: 4,
    rpn: 100,
    currentControls: "Visual weld audit; push-out torque test 3 per shift",
    recommendedAction: "Optimize weld schedule with multi-pulse slope-up profile; evaluate low-spatter weld nut design",
    status: "in-progress",
  },
  {
    id: "PFMEA-013",
    partId: "PRT-011",
    processStep: "Flange/Cam Operation - Wheel House",
    potentialFailureMode: "Cam unit timing drift causing flange angle deviation",
    potentialEffect: "Shock tower mounting surface out-of-spec; ride quality impact; assembly rework",
    severity: 7,
    occurrence: 3,
    detection: 5,
    rpn: 105,
    currentControls: "CMM audit 6 per shift; cam position proximity sensor",
    recommendedAction: "Implement servo-driven cam actuators with closed-loop position feedback replacing spring return",
    status: "open",
  },
  {
    id: "PFMEA-014",
    partId: "PRT-004",
    processStep: "Laser Trim - Roof Panel (Drip Rail)",
    potentialFailureMode: "Laser trim offset causing drip rail profile deviation",
    potentialEffect: "Roof molding fitment issue; water leak at weatherstrip; customer complaint",
    severity: 7,
    occurrence: 4,
    detection: 5,
    rpn: 140,
    currentControls: "CMM audit 3 per shift; laser cell alignment check weekly",
    recommendedAction: "Implement inline seam tracking sensor for real-time laser path correction; reduce calibration interval to daily",
    status: "open",
  },
  {
    id: "PFMEA-015",
    partId: "PRT-008",
    processStep: "Shot Blast Cleaning - A-Pillar (Hot Stamped)",
    potentialFailureMode: "Insufficient oxide scale removal leaving residual scale patches",
    potentialEffect: "E-coat adhesion failure; paint defect; corrosion in service",
    severity: 6,
    occurrence: 2,
    detection: 3,
    rpn: 36,
    currentControls: "Visual inspection for scale; adhesion tape test 1 per shift; shot media fill level check daily",
    recommendedAction: "Add inline surface roughness measurement to verify Ra value post-blast; automate shot media replenishment",
    status: "deferred",
  },
];

// ---------------------------------------------------------------------------
// 4. Control Plans
// ---------------------------------------------------------------------------

export const controlPlans: ControlPlan[] = [
  {
    id: "CP-001",
    partId: "PRT-001",
    processStep: "Draw Operation - Hood Outer",
    characteristic: "Draw depth at center crown",
    specification: "42.0 mm",
    tolerance: "+/- 0.5 mm",
    measurementMethod: "CMM (Zeiss Contura G3)",
    sampleSize: 3,
    frequency: "Every 2 hours (6 per shift)",
    controlMethod: "Xbar-R chart with SPC software",
    reactionPlan: "Stop production; verify tonnage and draw bead force; adjust blank holder pressure; notify quality engineer; re-measure 5 consecutive parts before restart",
    isCompliant: true,
  },
  {
    id: "CP-002",
    partId: "PRT-003",
    processStep: "Restrike Operation - Door Outer",
    characteristic: "B-pillar interface flange angle",
    specification: "90.0 deg",
    tolerance: "+/- 0.8 deg",
    measurementMethod: "CMM with angular probe (6 per shift) + check fixture go/no-go",
    sampleSize: 3,
    frequency: "Every 2 hours (6 per shift)",
    controlMethod: "Xbar-R chart; check fixture 100% operator verification",
    reactionPlan: "Stop production; segregate suspect parts back to last good check; verify restrike die condition and cam return; call die maintenance if deviation > 1.0 deg",
    isCompliant: false,
  },
  {
    id: "CP-003",
    partId: "PRT-008",
    processStep: "Hot Stamp Form & Quench - A-Pillar",
    characteristic: "Martensite hardness",
    specification: "450 HV10 minimum",
    tolerance: "450 - 550 HV10",
    measurementMethod: "Vickers hardness tester HV10 (3 locations per part)",
    sampleSize: 1,
    frequency: "Every 200 parts",
    controlMethod: "Individual-Moving Range chart; process interlock on furnace temp and quench flow",
    reactionPlan: "Quarantine all parts since last good test; verify furnace zone temperatures; check quench water flow rate and temperature; do not release until metallurgical verification",
    isCompliant: true,
  },
  {
    id: "CP-004",
    partId: "PRT-010",
    processStep: "Trim/Pierce - Floor Pan (Battery Tray Mounting Holes)",
    characteristic: "Hole true position (6x M10 battery tray mounting)",
    specification: "Per GD&T datum scheme on drawing BIW-FP-2024-010 Rev C",
    tolerance: "+/- 0.25 mm true position (MMC)",
    measurementMethod: "CMM with probe qualification on datum A/B/C",
    sampleSize: 3,
    frequency: "Every 2 hours (6 per shift)",
    controlMethod: "Xbar-R chart; Go/No-Go pin gauge 100% at check fixture",
    reactionPlan: "Stop production; check pilot pin diameter with pin gauge; replace pins if worn > 0.05mm from nominal; remeasure 5 parts; quarantine back to last good check",
    isCompliant: true,
  },
  {
    id: "CP-005",
    partId: "PRT-006",
    processStep: "Draw Operation - Quarter Panel",
    characteristic: "Material thinning at wheel arch transition",
    specification: "Maximum 25% thinning",
    tolerance: "0 - 25%",
    measurementMethod: "Ultrasonic thickness gauge (Olympus 38DL Plus)",
    sampleSize: 1,
    frequency: "Every 500 parts",
    controlMethod: "Individual-Moving Range chart; forming simulation correlation check quarterly",
    reactionPlan: "If thinning > 22%: increase monitoring to every 200 parts. If thinning > 25%: stop production; check draw die condition; verify blank position and lube application; notify engineering",
    isCompliant: true,
  },
  {
    id: "CP-006",
    partId: "PRT-009",
    processStep: "Laser Trim - B-Pillar (Soft/Hard Zone Boundary)",
    characteristic: "Micro-crack absence at transition zone",
    specification: "Zero cracks per ASTM E709 (magnetic particle inspection)",
    tolerance: "No indications > 0.5 mm",
    measurementMethod: "Fluorescent magnetic particle inspection (MPI)",
    sampleSize: 1,
    frequency: "Every 200 parts",
    controlMethod: "Attribute chart (p-chart); cross-section metallography 1 per lot",
    reactionPlan: "Quarantine entire lot since last good inspection; increase MPI to 100% until root cause identified; notify engineering and Gestamp immediately; initiate 8D",
    isCompliant: false,
  },
  {
    id: "CP-007",
    partId: "PRT-002",
    processStep: "Surface Audit - Fender",
    characteristic: "Class A surface quality (no dents, scratches, wrinkles, skid marks)",
    specification: "Zero surface defects on Class A surfaces per CQI-14 Body in White standard",
    tolerance: "No defects > 0.05 mm depth on Class A; no defects > 0.1 mm on Class B",
    measurementMethod: "Dstone fluorescent lighting tunnel; manual stone wash 1 per shift",
    sampleSize: 1,
    frequency: "Every 50 parts (visual); every shift (stone wash)",
    controlMethod: "Attribute chart; defect pareto by type and location",
    reactionPlan: "Tag and segregate defective parts; inspect previous 50 parts; if > 3 defective: stop production and investigate die condition; notify quality engineer",
    isCompliant: true,
  },
  {
    id: "CP-008",
    partId: "PRT-004",
    processStep: "Laser Trim - Roof Panel (Drip Rail Profile)",
    characteristic: "Drip rail trim edge profile and position",
    specification: "Trim line per CAD nominal BIW-RF-2024-004 Rev B",
    tolerance: "+/- 0.5 mm from nominal trim line",
    measurementMethod: "CMM with edge scan probe",
    sampleSize: 2,
    frequency: "Every 3 hours (4 per shift)",
    controlMethod: "Xbar-R chart; laser cell alignment verification",
    reactionPlan: "Stop laser cell; verify fixture clamp positions; run calibration artifact; re-align if offset > 0.3mm; remeasure 3 parts before restart",
    isCompliant: false,
  },
  {
    id: "CP-009",
    partId: "PRT-007",
    processStep: "Projection Weld - Rocker Panel (M8 Weld Nuts)",
    characteristic: "Weld nut push-out torque strength",
    specification: "Minimum 25 Nm push-out torque",
    tolerance: ">= 25 Nm",
    measurementMethod: "Torque wrench push-out test (destructive)",
    sampleSize: 1,
    frequency: "Every shift (3 per day) + start of production",
    controlMethod: "Individual-Moving Range chart; weld current and force monitoring 100%",
    reactionPlan: "If torque < 25 Nm: stop production; quarantine back to last good test; verify electrode condition and weld schedule parameters; replace electrodes if worn; revalidate with 5 consecutive passing tests",
    isCompliant: true,
  },
  {
    id: "CP-010",
    partId: "PRT-012",
    processStep: "Draw Operation - Dash Panel",
    characteristic: "Panel flatness on firewall mating surface",
    specification: "Flatness 0.8 mm over 600 mm span",
    tolerance: "0 - 0.8 mm",
    measurementMethod: "CMM surface scan (25-point grid)",
    sampleSize: 2,
    frequency: "Every 2 hours (6 per shift)",
    controlMethod: "Xbar-R chart; check fixture with feeler gauge verification",
    reactionPlan: "If flatness > 0.6 mm: increase monitoring frequency to every hour. If > 0.8 mm: stop production; verify draw die condition and tonnage; check blank centering; call die maintenance",
    isCompliant: true,
  },
];

// ---------------------------------------------------------------------------
// 5. Predictions
// ---------------------------------------------------------------------------

export const predictions: Prediction[] = [
  {
    id: "PRED-001",
    partId: "PRT-001",
    partName: "Hood Outer",
    failureMode: "Surface defect recurrence due to die polish cycle approaching limit",
    probability: 0.72,
    confidence: 0.85,
    timeframe: "Next 2 weeks (estimated 10,000 hits until polish needed)",
    impactLevel: "high",
    recommendedAction:
      "Schedule die polish for TP-4200 Station 1 draw die during next planned downtime (weekend of March 28-29); pre-order PVD re-coat if inspection shows coating breakdown",
    basedOn: "Historical die polish interval data (18 months); current hit counter at 10,200 of 12,000 limit; trend analysis of surface defect rate showing upward slope",
    relatedIssues: ["QI-2025-001"],
    predictedAffectedParts: 450,
  },
  {
    id: "PRED-002",
    partId: "PRT-003",
    partName: "Front Door Outer LH",
    failureMode: "Springback exceedance from incoming material variation",
    probability: 0.65,
    confidence: 0.78,
    timeframe: "Next incoming coil lot (arrival March 24)",
    impactLevel: "high",
    recommendedAction:
      "Request material test certificates from POSCO for next coil lot before release to production; pre-set restrike die to high-strength compensation setting if yield strength > 245 MPa",
    basedOn: "Material property trend analysis showing increasing yield strength over last 5 coil lots; seasonal variation pattern from 2024-2025 data; correlation analysis between yield strength and springback angle",
    relatedIssues: ["QI-2025-003"],
    predictedAffectedParts: 600,
  },
  {
    id: "PRED-003",
    partId: "PRT-009",
    partName: "B-Pillar Reinforcement LH",
    failureMode: "Micro-crack propagation at transition zone during production ramp-up",
    probability: 0.58,
    confidence: 0.71,
    timeframe: "During pre-production validation (next 30 days)",
    impactLevel: "high",
    recommendedAction:
      "Increase MPI inspection to 1 per 50 parts during ramp-up; request Gestamp furnace data for each lot; do not ramp above 60% line speed until crack issue root cause confirmed resolved",
    basedOn: "Open issue QI-2025-011 trend data; similar failure mode from 2024 benchmarking data on tailored hot-stamped B-pillars; literature review on hydrogen embrittlement in 22MnB5",
    relatedIssues: ["QI-2025-011"],
    predictedAffectedParts: 120,
  },
  {
    id: "PRED-004",
    partId: "PRT-005",
    partName: "Trunk Lid Outer",
    failureMode: "Edge wave severity increase with summer temperature rise",
    probability: 0.61,
    confidence: 0.73,
    timeframe: "April - June 2026 (seasonal temperature increase)",
    impactLevel: "medium",
    recommendedAction:
      "Coordinate with Novelis on coil storage temperature controls; evaluate adding leveler pass before blanking; pre-approve additional rework labor for trunk lid line",
    basedOn: "2025 seasonal defect correlation analysis showing 40% increase in aluminum edge wave during warm months; Novelis coil property data showing age-hardening acceleration at higher ambient temperatures",
    relatedIssues: ["QI-2025-010"],
    predictedAffectedParts: 350,
  },
  {
    id: "PRED-005",
    partId: "PRT-010",
    partName: "Floor Pan Front",
    failureMode: "Pilot pin wear reaching replacement threshold",
    probability: 0.81,
    confidence: 0.91,
    timeframe: "Approximately 15,000 hits (estimated March 25-28)",
    impactLevel: "medium",
    recommendedAction:
      "Pre-order carbide pilot pin set (P/N CP-10.00-6H); schedule replacement during March 28-29 weekend shutdown; verify pin gauge tool is calibrated",
    basedOn: "Pin wear rate tracking data (linear regression); current hit count 65,200 of 80,000 limit; last pin measurement showing 9.88mm diameter (replace at 9.85mm)",
    relatedIssues: ["QI-2025-006"],
    predictedAffectedParts: 200,
  },
  {
    id: "PRED-006",
    partId: "PRT-006",
    partName: "Rear Quarter Panel LH",
    failureMode: "Draw die surface degradation from slug contamination recurrence",
    probability: 0.55,
    confidence: 0.68,
    timeframe: "Next 4-6 weeks",
    impactLevel: "medium",
    recommendedAction:
      "Expedite slug retention magnet installation (currently in procurement); implement temporary slug inspection protocol at part transfer; schedule die face re-polish",
    basedOn: "Open issue QI-2026-001 root cause analysis; slug migration pattern analysis; historical data showing 3-4 week recurrence cycle when magnets not present",
    relatedIssues: ["QI-2026-001", "QI-2025-004"],
    predictedAffectedParts: 180,
  },
  {
    id: "PRED-007",
    partId: "PRT-004",
    partName: "Roof Panel",
    failureMode: "Trim steel failure requiring unplanned die maintenance",
    probability: 0.48,
    confidence: 0.65,
    timeframe: "Next 8-10 weeks based on wear rate projection",
    impactLevel: "high",
    recommendedAction:
      "Schedule proactive trim steel re-grind during April planned shutdown; order spare trim steel inserts as backup; recalibrate laser trim cell LT-08 on same shutdown",
    basedOn: "Trim edge quality degradation trend from QI-2026-002; trim steel hardness test showing softening to 58 HRC from original 62 HRC; historical trim steel life data from similar dies",
    relatedIssues: ["QI-2026-002"],
    predictedAffectedParts: 300,
  },
  {
    id: "PRED-008",
    partId: "PRT-011",
    partName: "Wheel House Inner LH",
    failureMode: "Cam actuator spring fatigue recurrence",
    probability: 0.44,
    confidence: 0.62,
    timeframe: "Approximately 400,000 cycles (estimated May 2026)",
    impactLevel: "low",
    recommendedAction:
      "Evaluate upgrade to servo-driven cam actuators during summer shutdown; interim: add spring fatigue cycle counter to PLC with pre-emptive replacement alert at 350,000 cycles",
    basedOn: "Spring fatigue life data from QI-2025-013 resolution; current cycle count tracking; cam position sensor trend data showing slight return time increase",
    relatedIssues: ["QI-2025-013"],
    predictedAffectedParts: 150,
  },
];

// ---------------------------------------------------------------------------
// 6. Horizontal Deployments
// ---------------------------------------------------------------------------

export const horizontalDeployments: HorizontalDeployment[] = [
  {
    id: "HD-001",
    sourceIssueId: "QI-2025-006",
    sourcePartName: "Floor Pan Front",
    affectedParts: [
      "Rear Quarter Panel LH",
      "Dash Panel",
      "Wheel House Inner LH",
      "Rocker Panel Inner LH",
    ],
    commonProcess: "Stamping - Trim/Pierce Operation (pilot pin guided)",
    standardsToUpdate: [
      "SOP-STM-042 Pilot Pin Wear Inspection Procedure",
      "PM-STM-018 Trim Die Preventive Maintenance Schedule",
      "QS-STM-007 Hole Position Verification Standard",
    ],
    status: "completed",
    completionPercentage: 100,
  },
  {
    id: "HD-002",
    sourceIssueId: "QI-2025-001",
    sourcePartName: "Hood Outer",
    affectedParts: [
      "Trunk Lid Outer",
      "Front Door Outer LH",
      "Front Fender LH",
      "Roof Panel",
    ],
    commonProcess: "Stamping - Draw Operation (Class A surface dies)",
    standardsToUpdate: [
      "SOP-STM-015 Die Polish Procedure and Interval",
      "PM-STM-003 Draw Die Surface Maintenance Schedule",
      "QS-STM-012 Surface Defect Inspection Standard",
    ],
    status: "in-progress",
    completionPercentage: 65,
  },
  {
    id: "HD-003",
    sourceIssueId: "QI-2025-005",
    sourcePartName: "A-Pillar Reinforcement LH",
    affectedParts: [
      "B-Pillar Reinforcement LH",
    ],
    commonProcess: "Hot Stamping - Form & Quench (cooling channel maintenance)",
    standardsToUpdate: [
      "SOP-HST-008 Cooling Channel Flow Verification Procedure",
      "PM-HST-002 Hot Stamp Die Cooling System Maintenance",
      "QS-HST-004 Martensitic Transformation Verification Standard",
    ],
    status: "verified",
    completionPercentage: 100,
  },
  {
    id: "HD-004",
    sourceIssueId: "QI-2025-009",
    sourcePartName: "Front Door Outer LH",
    affectedParts: [
      "Front Fender LH",
      "Wheel House Inner LH",
      "Rocker Panel Inner LH",
      "Dash Panel",
    ],
    commonProcess: "Welding - Spot Weld / Projection Weld (electrode tip management)",
    standardsToUpdate: [
      "SOP-WLD-022 Electrode Tip Dress and Change Procedure",
      "PM-WLD-011 Weld Gun Maintenance Schedule",
      "QS-WLD-006 Weld Quality Monitoring Standard",
    ],
    status: "in-progress",
    completionPercentage: 40,
  },
  {
    id: "HD-005",
    sourceIssueId: "QI-2025-013",
    sourcePartName: "Wheel House Inner LH",
    affectedParts: [
      "Front Fender LH",
      "Rear Quarter Panel LH",
      "Rocker Panel Inner LH",
    ],
    commonProcess: "Stamping - Flange/Cam Operation (cam actuator systems)",
    standardsToUpdate: [
      "SOP-STM-031 Cam Unit Operation and Monitoring Procedure",
      "PM-STM-025 Cam Actuator Preventive Maintenance Schedule",
      "QS-STM-015 Flange Angle Verification Standard",
    ],
    status: "planned",
    completionPercentage: 10,
  },
];

// ---------------------------------------------------------------------------
// 7. RFQ Data
// ---------------------------------------------------------------------------

export const rfqData: RFQ[] = [
  {
    id: "RFQ-2026-001",
    partName: "Front Door Outer RH (Mirror Image)",
    customerName: "Atlas EV Program - Phase 2",
    material: "BH210 Bake-Hardening Steel",
    dimensions: "1120 x 780 x 145 mm (L x W x Draw Depth)",
    annualVolume: 120000,
    complexity: "high",
    estimatedCost: 14.85,
    leadTime: 32,
    feasibilityScore: 82,
    riskFactors: [
      "Springback control on BH210 requires restrike die compensation (known issue on LH variant)",
      "Class A surface quality requires PVD-coated draw die with 12,000-hit polish interval",
      "Roller hem process for inner/outer assembly requires tight dimensional control",
      "Mirror image die requires new CAM programming - cannot simply mirror LH die due to coil grain direction",
    ],
    bomItems: [
      { name: "BH210 Steel Blank (1280 x 920 x 0.65 mm)", quantity: 1, unitCost: 3.20 },
      { name: "Draw Die Set (upper/lower/binder)", quantity: 1, unitCost: 0.85 },
      { name: "Trim/Pierce Die Set", quantity: 1, unitCost: 0.42 },
      { name: "Flange Die Set", quantity: 1, unitCost: 0.38 },
      { name: "Restrike/Cam Die Set", quantity: 1, unitCost: 0.45 },
      { name: "Stamping Press Time (4 ops @ TP-3600)", quantity: 1, unitCost: 4.20 },
      { name: "Surface Inspection (automated)", quantity: 1, unitCost: 0.35 },
      { name: "Roller Hem Assembly", quantity: 1, unitCost: 2.80 },
      { name: "Dimensional CMM Audit (allocated)", quantity: 1, unitCost: 0.18 },
      { name: "Packaging & Logistics", quantity: 1, unitCost: 0.92 },
      { name: "Quality Overhead (PPM, warranty reserve)", quantity: 1, unitCost: 1.10 },
    ],
  },
  {
    id: "RFQ-2026-002",
    partName: "Rear Floor Cross-Member",
    customerName: "Atlas EV SUV Platform",
    material: "DP980 Dual-Phase Steel",
    dimensions: "1450 x 220 x 85 mm (L x W x Draw Depth)",
    annualVolume: 80000,
    complexity: "medium",
    estimatedCost: 8.65,
    leadTime: 24,
    feasibilityScore: 91,
    riskFactors: [
      "DP980 has limited formability window - requires careful blank development and simulation validation",
      "Structural part requires full dimensional compliance to GD&T with Cpk > 1.67",
      "Projection weld nuts (8x M8) require optimized weld schedule for DP980 coating",
    ],
    bomItems: [
      { name: "DP980 Steel Blank (1580 x 340 x 1.2 mm)", quantity: 1, unitCost: 2.85 },
      { name: "Draw Die Set (progressive)", quantity: 1, unitCost: 0.55 },
      { name: "Trim/Pierce Die Set", quantity: 1, unitCost: 0.32 },
      { name: "Flange Die Set", quantity: 1, unitCost: 0.28 },
      { name: "Stamping Press Time (3 ops @ TP-2500)", quantity: 1, unitCost: 2.10 },
      { name: "Projection Weld (8x M8 nuts)", quantity: 8, unitCost: 0.12 },
      { name: "Dimensional CMM Audit (allocated)", quantity: 1, unitCost: 0.15 },
      { name: "Packaging & Logistics", quantity: 1, unitCost: 0.68 },
      { name: "Quality Overhead (PPM, warranty reserve)", quantity: 1, unitCost: 0.76 },
    ],
  },
  {
    id: "RFQ-2026-003",
    partName: "Shotgun Assembly (Inner + Reinforcement)",
    customerName: "Atlas EV Sedan - Mid-Cycle Enhancement",
    material: "22MnB5 Boron Steel (Hot Stamped) + DP590 (Cold Stamped Inner)",
    dimensions: "890 x 310 x 120 mm (assembled)",
    annualVolume: 120000,
    complexity: "high",
    estimatedCost: 22.40,
    leadTime: 40,
    feasibilityScore: 74,
    riskFactors: [
      "Mixed material assembly (hot-stamped + cold-stamped) requires careful welding parameter development",
      "Hot-stamped reinforcement requires new furnace recipe and die tooling for HSP-1200",
      "Assembly involves 24 spot welds with mixed stack-up thickness combinations",
      "Crash performance validation required - 8 week test program at external lab",
      "Current HSP-1200 capacity may be constrained - need to evaluate cycle time impact on A-pillar and B-pillar production",
    ],
    bomItems: [
      { name: "22MnB5 Blank (reinforcement, 520 x 280 x 1.5 mm)", quantity: 1, unitCost: 2.10 },
      { name: "DP590 Blank (inner, 950 x 380 x 1.0 mm)", quantity: 1, unitCost: 1.65 },
      { name: "Hot Stamp Press Time (HSP-1200)", quantity: 1, unitCost: 3.40 },
      { name: "Cold Stamp Press Time (3 ops @ TP-2500)", quantity: 1, unitCost: 2.10 },
      { name: "Laser Trim (hot-stamped part)", quantity: 1, unitCost: 1.80 },
      { name: "Shot Blast Cleaning", quantity: 1, unitCost: 0.45 },
      { name: "Spot Weld Assembly (24 welds)", quantity: 24, unitCost: 0.08 },
      { name: "Adhesive Bond (structural, 2 beads)", quantity: 1, unitCost: 0.95 },
      { name: "Dimensional CMM Audit (allocated)", quantity: 1, unitCost: 0.22 },
      { name: "Hardness & Metallurgical Testing (allocated)", quantity: 1, unitCost: 0.35 },
      { name: "Packaging & Logistics", quantity: 1, unitCost: 1.15 },
      { name: "Quality Overhead (PPM, warranty, crash test reserve)", quantity: 1, unitCost: 6.25 },
    ],
  },
];

// ---------------------------------------------------------------------------
// 8. Factory Stats
// ---------------------------------------------------------------------------

export const factoryStats: FactoryStats = {
  totalParts: 12,
  totalIssues: 20,
  openIssues: 6,
  resolvedIssues: 11,
  avgResolutionDays: 17.4,
  complianceRate: 92.3,
  predictionAccuracy: 78.5,
  monthlyData: [
    { month: "Apr 2025", issues: 0, resolved: 0, predicted: 0, compliance: 95.1 },
    { month: "May 2025", issues: 0, resolved: 0, predicted: 0, compliance: 94.8 },
    { month: "Jun 2025", issues: 1, resolved: 0, predicted: 1, compliance: 94.2 },
    { month: "Jul 2025", issues: 2, resolved: 1, predicted: 1, compliance: 93.5 },
    { month: "Aug 2025", issues: 3, resolved: 1, predicted: 2, compliance: 92.8 },
    { month: "Sep 2025", issues: 4, resolved: 3, predicted: 3, compliance: 92.1 },
    { month: "Oct 2025", issues: 3, resolved: 3, predicted: 2, compliance: 91.6 },
    { month: "Nov 2025", issues: 3, resolved: 2, predicted: 3, compliance: 91.0 },
    { month: "Dec 2025", issues: 2, resolved: 2, predicted: 2, compliance: 91.4 },
    { month: "Jan 2026", issues: 2, resolved: 1, predicted: 2, compliance: 91.8 },
    { month: "Feb 2026", issues: 2, resolved: 1, predicted: 1, compliance: 92.0 },
    { month: "Mar 2026", issues: 1, resolved: 0, predicted: 1, compliance: 92.3 },
  ],
};

// ---------------------------------------------------------------------------
// 9. Standards
// ---------------------------------------------------------------------------

export const standards: Standard[] = [
  {
    id: "STD-001",
    name: "Pilot Pin Wear Inspection Procedure",
    code: "SOP-STM-042",
    category: "Stamping - Die Maintenance",
    lastUpdated: "2025-10-02",
    applicableParts: ["PRT-010", "PRT-006", "PRT-012", "PRT-011", "PRT-007"],
    status: "current",
  },
  {
    id: "STD-002",
    name: "Draw Die Surface Maintenance & Polish Interval",
    code: "SOP-STM-015",
    category: "Stamping - Die Maintenance",
    lastUpdated: "2025-07-15",
    applicableParts: ["PRT-001", "PRT-002", "PRT-003", "PRT-004", "PRT-005", "PRT-006"],
    status: "needs-update",
  },
  {
    id: "STD-003",
    name: "Hot Stamp Cooling Channel Flow Verification",
    code: "SOP-HST-008",
    category: "Hot Stamping - Process Control",
    lastUpdated: "2025-09-20",
    applicableParts: ["PRT-008", "PRT-009"],
    status: "current",
  },
  {
    id: "STD-004",
    name: "Electrode Tip Dress and Change Procedure",
    code: "SOP-WLD-022",
    category: "Welding - Electrode Management",
    lastUpdated: "2025-10-20",
    applicableParts: ["PRT-003", "PRT-002", "PRT-007", "PRT-011", "PRT-012"],
    status: "needs-update",
  },
  {
    id: "STD-005",
    name: "Class A Surface Defect Inspection Standard",
    code: "QS-STM-012",
    category: "Quality - Surface Inspection",
    lastUpdated: "2025-08-10",
    applicableParts: ["PRT-001", "PRT-002", "PRT-003", "PRT-004", "PRT-005"],
    status: "current",
  },
  {
    id: "STD-006",
    name: "Martensitic Transformation Verification Standard",
    code: "QS-HST-004",
    category: "Quality - Hot Stamping",
    lastUpdated: "2024-11-30",
    applicableParts: ["PRT-008", "PRT-009"],
    status: "outdated",
  },
  {
    id: "STD-007",
    name: "Cam Unit Operation and Monitoring Procedure",
    code: "SOP-STM-031",
    category: "Stamping - Press Operations",
    lastUpdated: "2025-12-15",
    applicableParts: ["PRT-002", "PRT-003", "PRT-006", "PRT-011"],
    status: "needs-update",
  },
  {
    id: "STD-008",
    name: "Incoming Coil Material Verification Standard",
    code: "QS-MAT-001",
    category: "Quality - Material Control",
    lastUpdated: "2026-01-10",
    applicableParts: [
      "PRT-001", "PRT-002", "PRT-003", "PRT-004", "PRT-005",
      "PRT-006", "PRT-007", "PRT-010", "PRT-011", "PRT-012",
    ],
    status: "current",
  },
];
