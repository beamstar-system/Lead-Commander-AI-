
export interface Lead {
  id: string;
  businessName: string;
  address: string;
  phoneNumber: string;
  website: string;
  latitude: number;
  longitude: number;
  businessType: string;
  googleMapsUrl: string;
  roofType: string;
  estimatedSqFt: string;
  roofCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
  estimatedAge: string;
  notes: string;
  scannedAt: string;
}

export interface ScanProgress {
  total: number;
  current: number;
  status: 'idle' | 'searching' | 'analyzing' | 'completed' | 'error';
  message: string;
}

export enum RoofMaterial {
  ASPHALT = 'Asphalt Shingle',
  METAL = 'Metal',
  EPDM = 'EPDM Rubber',
  TPO = 'TPO / PVC White Membrane',
  MOD_BIT = 'Modified Bitumen',
  BUILT_UP = 'Built-up (Tar & Gravel)',
  CONCRETE = 'Concrete / Tile'
}
