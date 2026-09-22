import { generateIUE } from '../utils/iueGenerator';

export interface ProvinceDistricts {
  province: string;
  districts: string[];
}

export const MOZAMBIQUE_PROVINCES: ProvinceDistricts[] = [
  {
    province: 'Cabo Delgado',
    districts: [
      'Pemba (Cidade)',
      'Ancuabe',
      'Balama',
      'Chiúre',
      'Ibo',
      'Macomia',
      'Mecúfi',
      'Meluco',
      'Metuge',
      'Mocímboa da Praia',
      'Montepuez',
      'Mueda',
      'Muidumbe',
      'Namuno',
      'Palma',
      'Quissanga'
    ]
  },
  {
    province: 'Gaza',
    districts: [
      'Xai-Xai (Cidade)',
      'Bilene',
      'Chibuto',
      'Chicualacuala',
      'Chigubo',
      'Chókwè',
      'Chongoene',
      'Guijá',
      'Limpopo',
      'Mabalane',
      'Manjacaze',
      'Mapai',
      'Massangena',
      'Massingir'
    ]
  },
  {
    province: 'Inhambane',
    districts: [
      'Inhambane (Cidade)',
      'Maxixe (Cidade)',
      'Funhalouro',
      'Govuro',
      'Homoíne',
      'Inharrime',
      'Inhassoro',
      'Jangamo',
      'Mabote',
      'Massinga',
      'Morrumbene',
      'Panda',
      'Vilankulo',
      'Zavala'
    ]
  },
  {
    province: 'Manica',
    districts: [
      'Chimoio (Cidade)',
      'Báruè',
      'Gondola',
      'Guro',
      'Macate',
      'Machaze',
      'Macossa',
      'Manica',
      'Mossurize',
      'Sussundenga',
      'Tambara',
      'Vanduzi'
    ]
  },
  {
    province: 'Maputo Cidade',
    districts: [
      'KaMpfumo',
      'KaNlhamankulu',
      'KaMaxakeni',
      'KaMavota',
      'KaMubukwana',
      'KaTembe',
      'KaNyaka'
    ]
  },
  {
    province: 'Maputo Província',
    districts: [
      'Matola (Cidade)',
      'Boane',
      'Magude',
      'Manhiça',
      'Marracuene',
      'Matutuíne',
      'Moamba',
      'Namaacha'
    ]
  },
  {
    province: 'Nampula',
    districts: [
      'Nampula (Cidade)',
      'Nacala-Porto (Cidade)',
      'Angoche',
      'Eráti',
      'Ilha de Moçambique',
      'Lalaua',
      'Larde',
      'Liúpo',
      'Malema',
      'Meconta',
      'Mecubúri',
      'Memba',
      'Mogincual',
      'Mogovolas',
      'Moma',
      'Monapo',
      'Mossuril',
      'Muecate',
      'Murrupula',
      'Nacala-a-Velha',
      'Nacarôa',
      'Rapale',
      'Ribáuè'
    ]
  },
  {
    province: 'Niassa',
    districts: [
      'Lichinga (Cidade)',
      'Cuamba (Cidade)',
      'Chimbunila',
      'Lago',
      'Majune',
      'Mandimba',
      'Marrupa',
      'Maúa',
      'Mecanhelas',
      'Mecula',
      'Metarica',
      'Muembe',
      'N\'gauma',
      'Sanga'
    ]
  },
  {
    province: 'Sofala',
    districts: [
      'Beira (Cidade)',
      'Dondo (Cidade)',
      'Búzi',
      'Caia',
      'Chemba',
      'Cheringoma',
      'Chibabava',
      'Gorongosa',
      'Machanga',
      'Marínguè',
      'Marromeu',
      'Muanza',
      'Nhamatanda'
    ]
  },
  {
    province: 'Tete',
    districts: [
      'Tete (Cidade)',
      'Moatize (Vila)',
      'Angónia',
      'Cahora-Bassa',
      'Changara',
      'Chifunde',
      'Chiuta',
      'Dôa',
      'Macanga',
      'Magoé',
      'Marara',
      'Marávia',
      'Mutarara',
      'Tsangano',
      'Zumbo'
    ]
  },
  {
    province: 'Zambézia',
    districts: [
      'Quelimane (Cidade)',
      'Mocuba (Cidade)',
      'Gurué (Cidade)',
      'Alto Molócue',
      'Chinde',
      'Derre',
      'Gilé',
      'Ilha de Inhassunge',
      'Luabo',
      'Lugela',
      'Maganja da Costa',
      'Milange',
      'Mocubela',
      'Molumbo',
      'Mopeia',
      'Morrumbala',
      'Mulevala',
      'Namacurra',
      'Namarroi',
      'Nicoadala',
      'Pebane'
    ]
  }
];

export function getDistrictsForProvince(provinceName: string): string[] {
  const found = MOZAMBIQUE_PROVINCES.find(
    p => p.province.toLowerCase() === (provinceName || '').trim().toLowerCase()
  );
  return found ? found.districts : [];
}

export function getInitials(name: string): string {
  const cleanName = (name || '').trim();
  if (!cleanName) return '';
  const stopWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  const words = cleanName.split(/\s+/).filter(Boolean);
  
  let initials = words
    .filter(w => !stopWords.has(w.toLowerCase()))
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  if (!initials && words.length > 0) {
    initials = words.map(w => w[0]?.toUpperCase() || '').join('');
  }
  return initials;
}

/**
 * Generates an automatic unique employee ID based on initials of the name and the NUIT
 */
export function generateEmployeeId(name: string, nuit: string): string {
  const initials = getInitials(name) || 'COL';
  const cleanNuit = (nuit || '').trim().replace(/\D/g, '');
  return cleanNuit ? `${initials}-${cleanNuit}` : initials;
}

export { 
  generateIUE, 
  generateNIM, 
  formatDocumentReference, 
  generateStudentQRCodePayload, 
  parseIUE, 
  validateIUE 
} from '../utils/iueGenerator';

/**
 * Generates an automatic unique student ID / IUE based on institutional standard:
 * [INICIAIS]-[Nº_DOCUMENTO]-[CÓDIGO_ESCOLA]/[PROVÍNCIA]/[DISTRITO]/[ANO]
 */
export function generateStudentId(
  name: string, 
  nuit?: string, 
  idCardNumber?: string,
  extra?: { schoolName?: string; schoolCode?: string; province?: string; district?: string; academicYear?: number | string }
): string {
  // If full parameters are provided, generate standard IUE
  if (extra?.province || extra?.schoolName || extra?.district) {
    return generateIUE({
      name,
      documentNumber: idCardNumber || nuit,
      schoolName: extra.schoolName,
      schoolCode: extra.schoolCode,
      province: extra.province,
      district: extra.district,
      academicYear: extra.academicYear
    });
  }

  const initials = getInitials(name) || 'ALU';
  const identifier = (nuit || idCardNumber || '').trim().replace(/\D/g, '');
  return identifier ? `${initials}-${identifier}` : `${initials}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}
