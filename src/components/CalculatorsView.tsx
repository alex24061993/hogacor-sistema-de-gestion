import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Layers, 
  HardHat, 
  Building2, 
  Flame, 
  Wind, 
  Activity, 
  CloudSnow, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  RotateCcw, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Columns,
  Grid,
  Sparkles,
  ExternalLink,
  Sliders,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { User, Project } from '../types';

export interface CalculatorsViewProps {
  currentUser: User;
  projects: Project[];
  initialCalculator?: CalculatorCategory;
}

export type CalculatorCategory = 
  | 'entrepiso'
  | 'steel-frame'
  | 'dintel'
  | 'cabriada'
  | 'muro-portante'
  | 'platea'
  | 'pilotes-spt'
  | 'predimensionado'
  | 'losas'
  | 'carga-fuego'
  | 'sismo'
  | 'nieve'
  | 'viento';

export interface CalcMeta {
  id: CalculatorCategory;
  name: string;
  category: 'Steel Frame' | 'Hormigón & Fundaciones' | 'Cargas Reglamentarias CIRSOC';
  norma: string;
  desc: string;
  badgeColor: string;
}

export const CALCULATORS_LIST: CalcMeta[] = [
  // Steel Frame
  {
    id: 'entrepiso',
    name: 'Entrepiso Metálico',
    category: 'Steel Frame',
    norma: 'CIRSOC 301 / AISI S100',
    desc: 'Cálculo de vigas PGC/IPN/Tubos, sobrecargas, flecha admisible y corte.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'steel-frame',
    name: 'Montantes Steel Frame',
    category: 'Steel Frame',
    norma: 'IRAM-IAS U 500-205',
    desc: 'Verificación a compresión axial, viento transversal y pandeo elástico/distorsional.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'dintel',
    name: 'Dintel Steel Frame',
    category: 'Steel Frame',
    norma: 'AISI S100 / CIRSOC 303',
    desc: 'Diseño de dinteles en cajón doble PGC, flecha L/400 y cálculo de jacks de apoyo.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'cabriada',
    name: 'Cabriada de Techo Steel Frame',
    category: 'Steel Frame',
    norma: 'CIRSOC 303 / 101',
    desc: 'Reticulado Howe/Pratt, esfuerzos en cordones superior/inferior y diagonales.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'muro-portante',
    name: 'Muro Portante & Arriostramiento',
    category: 'Steel Frame',
    norma: 'CIRSOC 103 / 102',
    desc: 'Corte basal, cruces de San Andrés, diafragmas OSB y anclajes Hold-Down.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },

  // Hormigón & Fundaciones
  {
    id: 'platea',
    name: 'Platea de Fundación',
    category: 'Hormigón & Fundaciones',
    norma: 'CIRSOC 201-2025',
    desc: 'Espesor de losa, coeficiente de balasto, punzonamiento y mallas de armadura.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    id: 'pilotes-spt',
    name: 'Capacidad de Pilotes por SPT',
    category: 'Hormigón & Fundaciones',
    norma: 'Décourt-Quaresma / CIRSOC 201',
    desc: 'Carga admisible por fricción lateral en fuste y resistencia por punta con SPT.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    id: 'predimensionado',
    name: 'Predimensionado Columnas y Vigas',
    category: 'Hormigón & Fundaciones',
    norma: 'CIRSOC 201 / 301',
    desc: 'Secciones geométricas y armaduras para vigas y columnas de H°A° y Acero.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    id: 'losas',
    name: 'Losas Macizas y Viguetas',
    category: 'Hormigón & Fundaciones',
    norma: 'CIRSOC 201 / Marcus',
    desc: 'Losas unidireccionales, cruzadas y con viguetas pretensadas + capa compresión.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },

  // Cargas Reglamentarias CIRSOC
  {
    id: 'carga-fuego',
    name: 'Carga de Fuego y Resistencia F',
    category: 'Cargas Reglamentarias CIRSOC',
    norma: 'Dec. 351/79 Anexo VII / CIRSOC 110',
    desc: 'Balance térmico en madera equivalente kg/m², resistencia F30..F180 y matafuegos.',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  {
    id: 'sismo',
    name: 'Análisis Sísmico y Corte Basal',
    category: 'Cargas Reglamentarias CIRSOC',
    norma: 'CIRSOC 103 (Zonas 0 a 4)',
    desc: 'Zonificación sísmica argentina, tipo de suelo, coeficiente C y esfuerzo de corte Vo.',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  {
    id: 'nieve',
    name: 'Cargas de Nieve en Cubiertas',
    category: 'Cargas Reglamentarias CIRSOC',
    norma: 'CIRSOC 104',
    desc: 'Carga básica pg por localidad/altitud andina, pendientes y acumulación sotavento.',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  {
    id: 'viento',
    name: 'Cargas de Viento',
    category: 'Cargas Reglamentarias CIRSOC',
    norma: 'CIRSOC 102-2025 y 102-2005',
    desc: 'Velocidad de viento mapa isotacas, exposición B/C/D, presiones dinámicas qz y Cp.',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
  },
];

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({ currentUser, projects, initialCalculator }) => {
  const [activeCalc, setActiveCalc] = useState<CalculatorCategory>(initialCalculator || 'entrepiso');
  const [filterGroup, setFilterGroup] = useState<'all' | 'Steel Frame' | 'Hormigón & Fundaciones' | 'Cargas Reglamentarias CIRSOC'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (initialCalculator) {
      setActiveCalc(initialCalculator);
    }
  }, [initialCalculator]);

  // 1. ENTREPISO METÁLICO STATE
  const [entLuz, setEntLuz] = useState<number>(3.8);
  const [entSep, setEntSep] = useState<number>(0.4);
  const [entTipo, setEntTipo] = useState<'seco' | 'humedo'>('seco');
  const [entUso, setEntUso] = useState<number>(200); // kg/m2
  const [entPerfil, setEntPerfil] = useState<string>('PGC 200x1.25');

  // 2. STEEL FRAME PANEL STATE
  const [sfAltura, setSfAltura] = useState<number>(2.7);
  const [sfSep, setSfSep] = useState<number>(0.4);
  const [sfPerfil, setSfPerfil] = useState<string>('PGC 100x0.90');
  const [sfAxial, setSfAxial] = useState<number>(12); // kN
  const [sfViento, setSfViento] = useState<number>(0.75); // kN/m2

  // 3. DINTEL STATE
  const [dintelLuz, setDintelLuz] = useState<number>(1.8);
  const [dintelCarga, setDintelCarga] = useState<number>(850); // kg/m
  const [dintelTipo, setDintelTipo] = useState<'cajon' | 'doble_espalda' | 'celosia'>('cajon');

  // 4. CABRIADA STATE
  const [cabLuz, setCabLuz] = useState<number>(8.0);
  const [cabPend, setCabPend] = useState<number>(25); // %
  const [cabSep, setCabSep] = useState<number>(0.9); // m
  const [cabCargaTotal, setCabCargaTotal] = useState<number>(90); // kg/m2

  // 5. MURO PORTANTE STATE
  const [muroLargo, setMuroLargo] = useState<number>(4.0);
  const [muroAlto, setMuroAlto] = useState<number>(2.7);
  const [muroCorte, setMuroCorte] = useState<number>(15); // kN
  const [muroSistema, setMuroSistema] = useState<'cruz' | 'osb'>('cruz');

  // 6. PLATEA STATE
  const [plateaArea, setPlateaArea] = useState<number>(110); // m2
  const [plateaCarga, setPlateaCarga] = useState<number>(140); // tn
  const [plateaEspesor, setPlateaEspesor] = useState<number>(20); // cm
  const [plateaBalasto, setPlateaBalasto] = useState<number>(3.5); // kg/cm3
  const [plateaSigmaAdm, setPlateaSigmaAdm] = useState<number>(1.2); // kg/cm2

  // 7. PILOTES SPT STATE
  const [pilDiam, setPilDiam] = useState<number>(40); // cm
  const [pilProf, setPilProf] = useState<number>(10); // m
  const [pilSuelo, setPilSuelo] = useState<'arcilla' | 'limo' | 'arena'>('limo');
  const [pilNsptFuste, setPilNsptFuste] = useState<number>(12);
  const [pilNsptPunta, setPilNsptPunta] = useState<number>(28);

  // 8. PREDIMENSIONADO STATE
  const [predElem, setPredElem] = useState<'viga_ha' | 'columna_ha' | 'viga_acero' | 'columna_acero'>('viga_ha');
  const [predLuz, setPredLuz] = useState<number>(5.0); // m
  const [predCarga, setPredCarga] = useState<number>(45); // kN o tn

  // 9. LOSAS STATE
  const [losaTipo, setLosaTipo] = useState<'viguetas' | 'maciza_cruzada' | 'maciza_unidir'>('viguetas');
  const [losaLx, setLosaLx] = useState<number>(4.2);
  const [losaLy, setLosaLy] = useState<number>(4.5);
  const [losaUso, setLosaUso] = useState<number>(200);

  // 10. CARGA DE FUEGO STATE
  const [fuegoArea, setFuegoArea] = useState<number>(150); // m2
  const [fuegoMaderaKg, setFuegoMaderaKg] = useState<number>(1200);
  const [fuegoPlasticoKg, setFuegoPlasticoKg] = useState<number>(350);
  const [fuegoTextilKg, setFuegoTextilKg] = useState<number>(200);
  const [fuegoActividad, setFuegoActividad] = useState<string>('Comercial / Depósito');

  // 11. SISMO CIRSOC 103 STATE
  const [sismoZona, setSismoZona] = useState<number>(2); // 0 a 4
  const [sismoSuelo, setSismoSuelo] = useState<'I' | 'II' | 'III'>('II');
  const [sismoDestino, setSismoDestino] = useState<number>(1.0); // Factor I
  const [sismoPeso, setSismoPeso] = useState<number>(220); // Toneladas

  // 12. NIEVE CIRSOC 104 STATE
  const [nieveLoc, setNieveLoc] = useState<string>('San Carlos de Bariloche (850 m.s.n.m)');
  const [nievePg, setNievePg] = useState<number>(1.8); // kN/m2
  const [nievePend, setNievePend] = useState<number>(30); // grados
  const [nieveCt, setNieveCt] = useState<number>(1.0); // Térmico

  // 13. VIENTO CIRSOC 102 STATE
  const [vientoCiudad, setVientoCiudad] = useState<string>('Buenos Aires / Conurbano (45 m/s)');
  const [vientoV, setVientoV] = useState<number>(45); // m/s
  const [vientoExp, setVientoExp] = useState<'B' | 'C' | 'D'>('B');
  const [vientoAlt, setVientoAlt] = useState<number>(9.0); // m

  // Active calculator meta
  const currentCalcMeta = CALCULATORS_LIST.find(c => c.id === activeCalc) || CALCULATORS_LIST[0];

  // Filtered calculators list
  const filteredCalcs = CALCULATORS_LIST.filter(c => {
    const matchesGroup = filterGroup === 'all' || c.category === filterGroup;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.norma.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // ==========================================
  // CALCULATIONS ENGINES
  // ==========================================

  // 1. Entrepiso Metálico Engine
  const calcEntrepiso = () => {
    const deadLoad = entTipo === 'seco' ? 80 : 180; // kg/m2
    const totalLoad = deadLoad + entUso; // kg/m2
    const qLineal = (totalLoad * entSep) / 100; // kg/cm
    const qKNm = (totalLoad * entSep * 9.81) / 1000; // kN/m
    
    // Perfil data (W en cm3, I en cm4, W adm)
    const perfilesData: Record<string, { W: number; I: number; h: number; peso: number }> = {
      'PGC 150x0.90': { W: 13.5, I: 101, h: 15, peso: 2.1 },
      'PGC 150x1.25': { W: 18.2, I: 136, h: 15, peso: 2.9 },
      'PGC 200x1.25': { W: 29.8, I: 298, h: 20, peso: 3.5 },
      'PGC 200x1.60': { W: 37.6, I: 376, h: 20, peso: 4.4 },
      'PGC 250x2.00': { W: 68.2, I: 852, h: 25, peso: 6.5 },
      'Doble PGC 200x1.25': { W: 59.6, I: 596, h: 20, peso: 7.0 },
      'IPN 140': { W: 81.9, I: 573, h: 14, peso: 14.3 },
      'IPN 160': { W: 117.0, I: 935, h: 16, peso: 17.9 },
      'Tubo 140x60x2.0': { W: 38.5, I: 270, h: 14, peso: 6.1 },
    };

    const p = perfilesData[entPerfil] || perfilesData['PGC 200x1.25'];
    const Lcm = entLuz * 100;
    const Mmax_kgcm = (qLineal * Math.pow(Lcm, 2)) / 8;
    const Mmax_kNm = (qKNm * Math.pow(entLuz, 2)) / 8;
    const Vmax_kN = (qKNm * entLuz) / 2;

    // Tensión de fluencia acero Fy = 2350 kg/cm2, admisible = 1400 kg/cm2
    const sigmaActuante = Mmax_kgcm / p.W;
    const E = 2100000; // kg/cm2
    const flecha_cm = (5 * qLineal * Math.pow(Lcm, 4)) / (384 * E * p.I);
    const flechaAdm_cm = Lcm / 350;

    const ratioFlex = sigmaActuante / 1400;
    const ratioFlecha = flecha_cm / flechaAdm_cm;
    const dcRatio = Math.max(ratioFlex, ratioFlecha);
    const verifica = dcRatio <= 1.0;

    return {
      totalLoad,
      qKNm,
      Mmax_kNm,
      Vmax_kN,
      sigmaActuante,
      flecha_mm: flecha_cm * 10,
      flechaAdm_mm: flechaAdm_cm * 10,
      dcRatio: (dcRatio * 100).toFixed(1),
      verifica,
      rec: verifica ? 'Perfil idóneo para la luz y sobrecarga especificada' : 'Aumentar sección de perfil o reducir separación a 40 cm',
    };
  };

  // 2. Steel Frame Panel Engine
  const calcSteelFrame = () => {
    const H = sfAltura;
    const e = sfSep;
    const pgcA = sfPerfil.includes('150') ? 3.4 : 2.2; // cm2 aprox
    const pgcW = sfPerfil.includes('150') ? 18.2 : 10.5; // cm3
    const pgcR = sfPerfil.includes('150') ? 5.8 : 3.8; // radio de giro r (cm)

    const lambda = (H * 100) / pgcR;
    const pCrit = Math.PI * Math.PI * 2100000 * pgcA / Math.pow(lambda, 2) / 1000; // kN
    const pAdm = Math.min(pCrit * 0.5, pgcA * 14); // kN

    // Viento por montante
    const qViento = sfViento * e; // kN/m
    const Mviento = (qViento * Math.pow(H, 2)) / 8; // kNm

    const ratioAxial = sfAxial / pAdm;
    const ratioFlex = (Mviento * 100000) / (pgcW * 1400 * 9.81);
    const dcTotal = ratioAxial + ratioFlex;
    const verifica = dcTotal <= 1.0;

    return {
      lambda: lambda.toFixed(1),
      pAdm: pAdm.toFixed(1),
      Mviento: Mviento.toFixed(2),
      dcRatio: (dcTotal * 100).toFixed(1),
      verifica,
      rec: verifica ? 'Montante cumple condiciones de pandeo y flexocompresión' : 'Colocar doble montante o reducir modulación a 40 cm',
    };
  };

  // 3. Dintel Engine
  const calcDintel = () => {
    const L = dintelLuz;
    const q = (dintelCarga * 9.81) / 1000; // kN/m
    const Mmax = (q * Math.pow(L, 2)) / 8; // kNm
    const Vmax = (q * L) / 2; // kN
    const flechaAdm = (L * 1000) / 400; // mm

    const jacks = L <= 1.5 ? 1 : L <= 2.4 ? 2 : 3;
    const perfilSugerido = L <= 1.5 ? 'Doble PGC 150x1.25' : L <= 2.4 ? 'Doble PGC 200x1.25' : 'Doble PGC 250x1.60 o Viga Reticulada';

    return {
      Mmax: Mmax.toFixed(2),
      Vmax: Vmax.toFixed(1),
      flechaAdm: flechaAdm.toFixed(1),
      jacks,
      perfilSugerido,
      verifica: true,
    };
  };

  // 4. Cabriada Engine
  const calcCabriada = () => {
    const L = cabLuz;
    const H = (L / 2) * (cabPend / 100);
    const q = (cabCargaTotal * cabSep * 9.81) / 1000; // kN/m
    const M_isostatica = (q * Math.pow(L, 2)) / 8; // kNm
    const TraccionInferior = M_isostatica / H; // kN
    const CompresionSuperior = TraccionInferior / Math.cos(Math.atan(cabPend / 100)); // kN

    return {
      H: H.toFixed(2),
      M_isostatica: M_isostatica.toFixed(1),
      TraccionInferior: TraccionInferior.toFixed(1),
      CompresionSuperior: CompresionSuperior.toFixed(1),
      perfilSugerido: TraccionInferior < 25 ? 'PGC 100x0.90' : 'PGC 150x1.25',
      fijaciones: Math.ceil(TraccionInferior / 3) + ' tornillos T1 punta broca por nudo',
    };
  };

  // 5. Muro Portante Engine
  const calcMuroPortante = () => {
    const H = muroAlto;
    const B = muroLargo;
    const V = muroCorte; // kN
    const Tholddown = (V * H) / B; // kN
    const anclajeRequerido = Tholddown < 10 ? 'Varilla M12 con epoxi + Hold-Down S/HD8' : 'Varilla M16 con ampolla química + Hold-Down S/HD14';

    return {
      Tholddown: Tholddown.toFixed(1),
      anclajeRequerido,
      resistenciaPanel: (B * (muroSistema === 'cruz' ? 6.5 : 8.2)).toFixed(1),
      verifica: (B * (muroSistema === 'cruz' ? 6.5 : 8.2)) >= V,
    };
  };

  // 6. Platea Engine
  const calcPlatea = () => {
    const P = plateaCarga; // tn
    const A = plateaArea; // m2
    const sigma = (P * 1000) / (A * 10000); // kg/cm2
    const asiento_mm = (sigma / plateaBalasto) * 10; // mm
    const verifica = sigma <= plateaSigmaAdm;

    return {
      sigma: sigma.toFixed(2),
      asiento_mm: asiento_mm.toFixed(1),
      verifica,
      mallaSugerida: plateaEspesor <= 15 ? 'Malla electrosoldada Q188 (Ø6 c/15cm) Sup. e Inf.' : 'Malla electrosoldada Q335 (Ø8 c/15cm) Doble capa',
      vigaBorde: 'Viga perimetral de encadenado 30x40 cm con 4Ø12 y estribos Ø6 c/15cm',
    };
  };

  // 7. Pilotes SPT Engine (Décourt-Quaresma)
  const calcPilotes = () => {
    const D = pilDiam / 100; // m
    const L = pilProf; // m
    const Ap = (Math.PI * Math.pow(D, 2)) / 4; // m2
    const As = Math.PI * D * L; // m2

    // Factores suelo C (tn/m2) y beta
    const C = pilSuelo === 'arcilla' ? 12 : pilSuelo === 'limo' ? 20 : 40;
    const beta = pilSuelo === 'arcilla' ? 1.0 : pilSuelo === 'limo' ? 1.2 : 1.4;

    const ql = (pilNsptFuste / 3 + 1) * beta; // tn/m2
    const Qlat = ql * As; // tn
    const Qpunta = (C * pilNsptPunta * Ap); // tn
    const Qu = Qlat + Qpunta; // tn
    const Qadm = Qu / 2.5; // tn (FS=2.5)

    // Capacidad estructural hormigón (H21 -> f'c=210 kg/cm2 = 2100 t/m2, admisible ~ 0.3 * f'c)
    const QadmEstruc = 0.35 * 2100 * Ap; // tn

    return {
      Qlat: Qlat.toFixed(1),
      Qpunta: Qpunta.toFixed(1),
      Qu: Qu.toFixed(1),
      Qadm: Math.min(Qadm, QadmEstruc).toFixed(1),
      limiteGeotecnico: Qadm.toFixed(1),
      limiteEstructural: QadmEstruc.toFixed(1),
    };
  };

  // 8. Predimensionado Engine
  const calcPredimensionado = () => {
    if (predElem === 'viga_ha') {
      const h_cm = Math.round((predLuz * 100) / 10);
      const b_cm = Math.max(15, Math.round(h_cm / 2.5 / 5) * 5);
      return {
        seccion: `${b_cm} x ${h_cm} cm`,
        armaduraPrincipal: `${Math.ceil(h_cm / 12)} barras Ø12 + 2 barras Ø16`,
        estribos: 'Estribos cerrados Ø6 cada 15 cm',
        formula: 'Altura útil h ≈ L / 10 a L / 12, Ancho b ≈ h / 2.5',
      };
    }
    if (predElem === 'columna_ha') {
      const areaNec = (predCarga * 1000) / 75; // cm2 aprox para H21
      const lado = Math.max(20, Math.ceil(Math.sqrt(areaNec) / 5) * 5);
      return {
        seccion: `${lado} x ${lado} cm`,
        armaduraPrincipal: '4 barras Ø12 mín. (1% cuantía geométrica)',
        estribos: 'Estribos Ø6 cada 15 cm en zona central y c/10 cm en apoyos',
        formula: 'Área neta Ac ≈ P / (0.45 * f\'c), recubrimiento mínimo 2.5 cm',
      };
    }
    if (predElem === 'viga_acero') {
      const Wreq = (predCarga * predLuz * 100) / (8 * 1.4); // cm3
      const perfil = Wreq < 80 ? 'IPN 140' : Wreq < 120 ? 'IPN 160' : Wreq < 200 ? 'IPN 200' : 'IPN 240';
      return {
        seccion: perfil,
        armaduraPrincipal: 'Módulo Wx req: ' + Math.round(Wreq) + ' cm³',
        estribos: 'Verificación de corte y pandeo lateral torsional',
        formula: 'Wx = M_max / σ_adm (CIRSOC 301)',
      };
    }
    return {
      seccion: 'Tubo Estructural 120x120x3.2 mm o 140x140x4.0 mm',
      armaduraPrincipal: 'Placa base 250x250x12 mm con 4 pernos de anclaje Ø16',
      estribos: 'Cartelas de rigidización en cabeza y base',
      formula: 'Esbeltez límite λ = k*L / r <= 150',
    };
  };

  // 9. Losas Engine
  const calcLosas = () => {
    if (losaTipo === 'viguetas') {
      const h_total = Math.max(13, Math.ceil((losaLx * 100) / 25));
      return {
        altura: `${h_total} cm (bovedilla de 12cm + capa compresión 5cm)`,
        detalle: 'Vigueta pretensada simple con separación a 50 cm + Malla electrosoldada Ø6 15x15',
        cargaMax: '550 kg/m² admisible',
        verifica: losaLx <= 5.8,
      };
    }
    const h_maciza = Math.max(9, Math.ceil((losaLx * 100) / 35));
    return {
      altura: `${h_maciza} cm de espesor de losa maciza`,
      detalle: 'Hierros del Ø8 cada 15 cm en dirección principal y Ø6 cada 20 cm en repartición',
      cargaMax: 'Cálculo por tablas de Marcus CIRSOC 201',
      verifica: h_maciza <= 16,
    };
  };

  // 10. Carga de Fuego Engine (Decreto 351/79)
  const calcCargaFuego = () => {
    const qMadera = fuegoMaderaKg * 4.4; // Mcal
    const qPlastico = fuegoPlasticoKg * 10.0; // Mcal
    const qTextil = fuegoTextilKg * 4.0; // Mcal
    const Qtotal = qMadera + qPlastico + qTextil;
    const cargaFuegoKgM2 = Qtotal / (fuegoArea * 4.4); // kg madera/m2

    let resistencia = 'F30';
    if (cargaFuegoKgM2 > 100) resistencia = 'F180';
    else if (cargaFuegoKgM2 > 60) resistencia = 'F120';
    else if (cargaFuegoKgM2 > 30) resistencia = 'F90';
    else if (cargaFuegoKgM2 > 15) resistencia = 'F60';

    const extintores = Math.max(2, Math.ceil(fuegoArea / 100));

    return {
      Qtotal: Qtotal.toLocaleString('es-AR') + ' Mcal',
      cargaFuegoKgM2: cargaFuegoKgM2.toFixed(1) + ' kg/m²',
      resistencia,
      riesgo: cargaFuegoKgM2 <= 30 ? 'R3 (Muy Combustible moderado)' : 'R2 (Inflamable / Alto contenido plástico)',
      extintores: `${extintores} extintores tipo ABC de 5 kg (1 cada 100 m²)`,
    };
  };

  // 11. Sismo CIRSOC 103 Engine
  const calcSismo = () => {
    // Aceleración básica según zona (g)
    const ao = [0.04, 0.10, 0.18, 0.25, 0.35][sismoZona] || 0.18;
    const sFactor = sismoSuelo === 'I' ? 1.0 : sismoSuelo === 'II' ? 1.2 : 1.4;
    const Sa = ao * sFactor * sismoDestino;
    const CoefC = Math.min(0.35, Sa * 1.5);
    const Vo_tn = CoefC * sismoPeso;
    const Vo_kN = Vo_tn * 9.81;

    return {
      zonaNombre: `Zona ${sismoZona} (${['Muy Reducida', 'Reducida', 'Moderada', 'Elevada', 'Muy Elevada'][sismoZona]})`,
      Sa: Sa.toFixed(3) + ' g',
      CoefC: CoefC.toFixed(3),
      Vo_tn: Vo_tn.toFixed(1) + ' tn',
      Vo_kN: Vo_kN.toFixed(0) + ' kN',
    };
  };

  // 12. Nieve CIRSOC 104 Engine
  const calcNieve = () => {
    // Coeficiente pendiente Cs
    let Cs = 1.0;
    if (nievePend > 30 && nievePend <= 70) {
      Cs = 1 - (nievePend - 30) / 40;
    } else if (nievePend > 70) {
      Cs = 0;
    }
    const pf = Cs * nieveCt * 1.0 * nievePg; // kN/m2
    const pf_kg = (pf * 1000) / 9.81;

    return {
      Cs: Cs.toFixed(2),
      pf_kNm2: pf.toFixed(2) + ' kN/m²',
      pf_kgm2: pf_kg.toFixed(0) + ' kg/m²',
      sotavento: (pf * 1.5).toFixed(2) + ' kN/m² (sobrecarga por acumulación asimétrica)',
    };
  };

  // 13. Viento CIRSOC 102 Engine
  const calcViento = () => {
    const Kd = 0.85;
    const Kzt = 1.0;
    // Kz según altura y exposición
    let Kz = 0.70;
    if (vientoExp === 'B') Kz = 0.70 + (vientoAlt / 30) * 0.25;
    if (vientoExp === 'C') Kz = 0.85 + (vientoAlt / 30) * 0.30;
    if (vientoExp === 'D') Kz = 1.03 + (vientoAlt / 30) * 0.30;

    const qz_Nm2 = 0.613 * Kz * Kzt * Kd * Math.pow(vientoV, 2);
    const qz_kgm2 = qz_Nm2 / 9.81;

    const barlovento = qz_kgm2 * 0.8;
    const sotavento = qz_kgm2 * -0.5;

    return {
      Kz: Kz.toFixed(2),
      qz_kgm2: qz_kgm2.toFixed(1) + ' kg/m²',
      barlovento: '+' + barlovento.toFixed(1) + ' kg/m² (Presión)',
      sotavento: sotavento.toFixed(1) + ' kg/m² (Succión)',
      totalViga: (qz_kgm2 * 1.3).toFixed(1) + ' kg/m² neta total',
    };
  };

  // Copy complete calculation memory to clipboard
  const handleCopyMemory = () => {
    const proj = projects.find(p => p.id === selectedProjectId);
    const dateStr = new Date().toLocaleString('es-AR');
    let text = `==========================================================\n`;
    text += `MEMORIA DE CÁLCULO ESTRUCTURAL - HOGACOR SUITE\n`;
    text += `Módulo: ${currentCalcMeta.name}\n`;
    text += `Normativa: ${currentCalcMeta.norma}\n`;
    text += `Software & Memoria: HOGACOR Suite - Módulo de Ingeniería Estructural\n`;
    text += `Fecha y Hora: ${dateStr}\n`;
    text += `Profesional: ${currentUser.name} (${currentUser.roleTitle} - ${currentUser.department})\n`;
    if (proj) {
      text += `Obra Asignada: ${proj.name} | Cliente: ${proj.client}\n`;
      text += `Ubicación: ${proj.address}\n`;
    } else {
      text += `Obra: Cálculo General / Verificación Técnica de Oficina\n`;
    }
    text += `==========================================================\n\n`;

    if (activeCalc === 'entrepiso') {
      const res = calcEntrepiso();
      text += `PARÁMETROS:\n- Luz libre: ${entLuz} m\n- Separación entre vigas: ${entSep} m\n- Tipo: Entrepiso ${entTipo}\n- Sobrecarga de uso: ${entUso} kg/m²\n- Perfil seleccionado: ${entPerfil}\n\n`;
      text += `RESULTADOS:\n- Carga total: ${res.totalLoad} kg/m² (${res.qKNm.toFixed(2)} kN/m)\n- Momento flector máximo (Mu): ${res.Mmax_kNm.toFixed(2)} kNm\n- Esfuerzo de corte máximo (Vu): ${res.Vmax_kN.toFixed(1)} kN\n- Flecha calculada: ${res.flecha_mm.toFixed(1)} mm\n- Flecha admisible (L/350): ${res.flechaAdm_mm.toFixed(1)} mm\n- Ratio D/C: ${res.dcRatio}%\n- Dictamen: ${res.verifica ? 'VERIFICA' : 'NO VERIFICA'} (${res.rec})\n`;
    } else if (activeCalc === 'steel-frame') {
      const res = calcSteelFrame();
      text += `PARÁMETROS:\n- Altura de panel: ${sfAltura} m\n- Separación: ${sfSep} m\n- Perfil montante: ${sfPerfil}\n- Carga axil: ${sfAxial} kN\n- Presión viento: ${sfViento} kN/m²\n\n`;
      text += `RESULTADOS:\n- Esbeltez λ: ${res.lambda}\n- Capacidad admisible: ${res.pAdm} kN\n- Momento por viento: ${res.Mviento} kNm\n- Ratio D/C: ${res.dcRatio}%\n- Dictamen: ${res.verifica ? 'VERIFICA' : 'NO VERIFICA'} (${res.rec})\n`;
    } else if (activeCalc === 'dintel') {
      const res = calcDintel();
      text += `PARÁMETROS:\n- Luz de abertura: ${dintelLuz} m\n- Carga superior: ${dintelCarga} kg/m\n\n`;
      text += `RESULTADOS:\n- Momento máximo: ${res.Mmax} kNm\n- Corte máximo: ${res.Vmax} kN\n- Flecha admisible (L/400): ${res.flechaAdm} mm\n- Jacks de apoyo requeridos: ${res.jacks} por extremo\n- Perfil sugerido: ${res.perfilSugerido}\n`;
    } else if (activeCalc === 'cabriada') {
      const res = calcCabriada();
      text += `PARÁMETROS:\n- Luz de cabriada: ${cabLuz} m\n- Pendiente: ${cabPend}%\n- Separación: ${cabSep} m\n- Carga total: ${cabCargaTotal} kg/m²\n\n`;
      text += `RESULTADOS:\n- Altura cumbrera: ${res.H} m\n- Momento equivalente: ${res.M_isostatica} kNm\n- Compresión cordón superior: ${res.CompresionSuperior} kN\n- Tracción cordón inferior: ${res.TraccionInferior} kN\n- Perfil sugerido: ${res.perfilSugerido}\n- Detalle de fijaciones: ${res.fijaciones}\n`;
    } else if (activeCalc === 'muro-portante') {
      const res = calcMuroPortante();
      text += `PARÁMETROS:\n- Longitud panel B: ${muroLargo} m\n- Altura H: ${muroAlto} m\n- Corte basal actuante V: ${muroCorte} kN\n- Sistema: ${muroSistema === 'cruz' ? 'Cruces de San Andrés' : 'Diafragma OSB'}\n\n`;
      text += `RESULTADOS:\n- Tracción Hold-Down: ${res.Tholddown} kN\n- Anclaje sugerido: ${res.anclajeRequerido}\n- Resistencia del panel: ${res.resistenciaPanel} kN\n- Dictamen: ${res.verifica ? 'VERIFICA' : 'NO VERIFICA'}\n`;
    } else if (activeCalc === 'platea') {
      const res = calcPlatea();
      text += `PARÁMETROS:\n- Área de platea: ${plateaArea} m²\n- Carga total: ${plateaCarga} tn\n- Espesor de losa: ${plateaEspesor} cm\n- Coeficiente de balasto: ${plateaBalasto} kg/cm³\n- Tensión admisible suelo: ${plateaSigmaAdm} kg/cm²\n\n`;
      text += `RESULTADOS:\n- Tensión de contacto: ${res.sigma} kg/cm²\n- Asiento estimado: ${res.asiento_mm} mm\n- Malla recomendada: ${res.mallaSugerida}\n- Encadenado perimetral: ${res.vigaBorde}\n- Dictamen: ${res.verifica ? 'VERIFICA TENSIÓN' : 'SUPERA TENSIÓN ADMISIBLE'}\n`;
    } else if (activeCalc === 'pilotes-spt') {
      const res = calcPilotes();
      text += `PARÁMETROS:\n- Diámetro pilote: ${pilDiam} cm\n- Profundidad: ${pilProf} m\n- Tipo de estrato: ${pilSuelo}\n- SPT Fuste promedio: ${pilNsptFuste}\n- SPT Punta: ${pilNsptPunta}\n\n`;
      text += `RESULTADOS:\n- Fricción lateral en fuste: ${res.Qlat} tn\n- Resistencia de punta: ${res.Qpunta} tn\n- Capacidad última Qu: ${res.Qu} tn\n- Capacidad admisible Qadm: ${res.Qadm} tn (FS=2.5)\n- Límite estructural hormigón: ${res.limiteEstructural} tn\n`;
    } else if (activeCalc === 'predimensionado') {
      const res = calcPredimensionado();
      text += `PARÁMETROS:\n- Elemento: ${predElem}\n- Luz: ${predLuz} m\n- Carga: ${predCarga}\n\n`;
      text += `RESULTADOS:\n- Sección geométrica: ${res.seccion}\n- Armadura longitudinal: ${res.armaduraPrincipal}\n- Estribado / Rigidización: ${res.estribos}\n- Criterio de cálculo: ${res.formula}\n`;
    } else if (activeCalc === 'losas') {
      const res = calcLosas();
      text += `PARÁMETROS:\n- Tipo de losa: ${losaTipo}\n- Luz Lx: ${losaLx} m\n- Luz Ly: ${losaLy} m\n- Sobrecarga: ${losaUso} kg/m²\n\n`;
      text += `RESULTADOS:\n- Altura / Espesor: ${res.altura}\n- Detalle constructivo: ${res.detalle}\n- Capacidad y verificación: ${res.cargaMax}\n`;
    } else if (activeCalc === 'carga-fuego') {
      const res = calcCargaFuego();
      text += `PARÁMETROS:\n- Área de sector: ${fuegoArea} m²\n- Madera: ${fuegoMaderaKg} kg\n- Plásticos: ${fuegoPlasticoKg} kg\n- Textiles: ${fuegoTextilKg} kg\n- Actividad: ${fuegoActividad}\n\n`;
      text += `RESULTADOS:\n- Calor emitido: ${res.Qtotal}\n- Carga de fuego específica: ${res.cargaFuegoKgM2}\n- Resistencia al fuego requerida: ${res.resistencia}\n- Riesgo de combustión: ${res.riesgo}\n- Matafuegos reglamentarios: ${res.extintores}\n`;
    } else if (activeCalc === 'sismo') {
      const res = calcSismo();
      text += `PARÁMETROS:\n- Zona Sísmica INPRES: Zona ${sismoZona}\n- Suelo de fundación: Tipo ${sismoSuelo}\n- Destino de obra (Factor I): ${sismoDestino}\n- Peso sísmico de la estructura: ${sismoPeso} tn\n\n`;
      text += `RESULTADOS:\n- Aceleración efectiva Sa: ${res.Sa}\n- Coeficiente Sísmico C: ${res.CoefC}\n- Esfuerzo de corte basal Vo: ${res.Vo_tn} (${res.Vo_kN})\n`;
    } else if (activeCalc === 'nieve') {
      const res = calcNieve();
      text += `PARÁMETROS:\n- Localidad: ${nieveLoc}\n- Carga básica sobre suelo pg: ${nievePg} kN/m²\n- Pendiente de cubierta: ${nievePend}°\n- Factor térmico Ct: ${nieveCt}\n\n`;
      text += `RESULTADOS:\n- Factor de forma Cs: ${res.Cs}\n- Carga de nieve en techo pf: ${res.pf_kNm2} (${res.pf_kgm2})\n- Sobrecarga asimétrica en sotavento: ${res.sotavento}\n`;
    } else if (activeCalc === 'viento') {
      const res = calcViento();
      text += `PARÁMETROS:\n- Localidad: ${vientoCiudad}\n- Velocidad básica V: ${vientoV} m/s\n- Exposición del terreno: ${vientoExp}\n- Altura de cumbrera z: ${vientoAlt} m\n\n`;
      text += `RESULTADOS:\n- Coeficiente de altura Kz: ${res.Kz}\n- Presión dinámica qz: ${res.qz_kgm2}\n- Presión pared barlovento: ${res.barlovento}\n- Succión pared sotavento: ${res.sotavento}\n- Carga neta total: ${res.totalViga}\n`;
    }

    text += `\nNormas Aplicadas: CIRSOC 301, 303, 201-2025, 101, 102, 103, 104 y Decreto 351/79.\n`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    }
  };

  // Printable Technical Calculation Sheet Trigger
  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Suite de Cálculos Estructurales HOGACOR
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              · 13 Módulos de Cálculo Estructural bajo Normativas CIRSOC, INTI e IRAM
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Calculadoras de Ingeniería & Steel Frame
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Herramientas interactivas para predimensionado estructural, losas, plateas, perfiles de acero liviano, pilotes SPT y solicitaciones reglamentarias de viento, sismo, nieve y fuego.
          </p>
        </div>

        {/* Action Controls: Project Selector & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Obra Association Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none max-w-[170px] truncate"
              title="Asociar cálculo a una obra para la memoria técnica"
            >
              <option value="">Obra: General</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Copy Memory Button */}
          <button
            onClick={handleCopyMemory}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs border ${
              copiedNotice 
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Copiar memoria de cálculo completa al portapapeles"
          >
            {copiedNotice ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copiar Memoria</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrintSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#9a1417] hover:bg-[#830e11] rounded-xl transition-all shadow-sm"
            title="Imprimir o exportar ficha técnica en PDF"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      {/* Main Calculation Layout: Left Selector & Right Interactive Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: 13 Calculators Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Módulos de Cálculo ({CALCULATORS_LIST.length})</span>
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
              <button
                onClick={() => setFilterGroup('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterGroup === 'all' ? 'bg-red-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterGroup('Steel Frame')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterGroup === 'Steel Frame' ? 'bg-red-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Steel Frame
              </button>
              <button
                onClick={() => setFilterGroup('Hormigón & Fundaciones')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterGroup === 'Hormigón & Fundaciones' ? 'bg-red-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Fundaciones & H°A°
              </button>
              <button
                onClick={() => setFilterGroup('Cargas Reglamentarias CIRSOC')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterGroup === 'Cargas Reglamentarias CIRSOC' ? 'bg-red-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cargas CIRSOC
              </button>
            </div>

            {/* List of 13 tools */}
            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredCalcs.map(calc => {
                const isSelected = activeCalc === calc.id;
                return (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalc(calc.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#9a1417] text-white border-[#9a1417] shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 hover:border-red-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{calc.name}</span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {calc.norma}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Active Calculator Engine */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            {/* Header of Active Calculator */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentCalcMeta.badgeColor}`}>
                    {currentCalcMeta.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Norma: {currentCalcMeta.norma}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 mt-1">
                  {currentCalcMeta.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentCalcMeta.desc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cálculo en Tiempo Real
                </span>
              </div>
            </div>

            {/* 1. ENTREPISO METÁLICO */}
            {activeCalc === 'entrepiso' && (() => {
              const res = calcEntrepiso();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luz libre entre apoyos: {entLuz} m</label>
                      <input type="range" min="2.0" max="7.0" step="0.1" value={entLuz} onChange={e => setEntLuz(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Separación e entre vigas: {entSep} m</label>
                      <select value={entSep} onChange={e => setEntSep(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value={0.4}>0.40 m (Recomendado Steel Frame)</option>
                        <option value={0.48}>0.48 m</option>
                        <option value={0.6}>0.60 m</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipo de entrepiso</label>
                      <select value={entTipo} onChange={e => setEntTipo(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value="seco">Seco (Placas OSB / Multilaminado - 80 kg/m²)</option>
                        <option value="humedo">Húmedo (Chapa plegada + Contrapiso - 180 kg/m²)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sobrecarga de uso: {entUso} kg/m²</label>
                      <select value={entUso} onChange={e => setEntUso(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value={200}>200 kg/m² (Vivienda unifamiliar / residencial)</option>
                        <option value={300}>300 kg/m² (Oficinas / locales comerciales)</option>
                        <option value={500}>500 kg/m² (Depósitos / sobrecarga pesada)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Perfil estructural seleccionado</label>
                      <select value={entPerfil} onChange={e => setEntPerfil(e.target.value)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value="PGC 150x0.90">PGC 150x0.90 mm</option>
                        <option value="PGC 150x1.25">PGC 150x1.25 mm</option>
                        <option value="PGC 200x1.25">PGC 200x1.25 mm (Estándar)</option>
                        <option value="PGC 200x1.60">PGC 200x1.60 mm</option>
                        <option value="PGC 250x2.00">PGC 250x2.00 mm (Grandes luces)</option>
                        <option value="Doble PGC 200x1.25">Doble PGC 200x1.25 mm (Cajón)</option>
                        <option value="IPN 140">Perfil Laminado IPN 140</option>
                        <option value="IPN 160">Perfil Laminado IPN 160</option>
                        <option value="Tubo 140x60x2.0">Tubo Estructural 140x60x2.0 mm</option>
                      </select>
                    </div>
                  </div>

                  {/* Results Card */}
                  <div className={`p-5 rounded-2xl border ${res.verifica ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {res.verifica ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                        <span>Estado: {res.verifica ? 'VERIFICA ESTRUCTURALMENTE' : 'NO VERIFICA - SOBREDEMANDA'}</span>
                      </h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                        D/C: {res.dcRatio}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Momento M_u</span>
                        <strong className="text-slate-900 text-sm">{res.Mmax_kNm.toFixed(2)} kNm</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Corte V_u</span>
                        <strong className="text-slate-900 text-sm">{res.Vmax_kN.toFixed(1)} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Flecha Actuante</span>
                        <strong className="text-slate-900 text-sm">{res.flecha_mm.toFixed(1)} mm</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Flecha Adm. (L/350)</span>
                        <strong className="text-slate-900 text-sm">{res.flechaAdm_mm.toFixed(1)} mm</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600"><strong>Dictamen:</strong> {res.rec}</p>
                  </div>
                </div>
              );
            })()}

            {/* 2. STEEL FRAME PANEL */}
            {activeCalc === 'steel-frame' && (() => {
              const res = calcSteelFrame();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Altura de panel / montante: {sfAltura} m</label>
                      <input type="range" min="2.4" max="4.0" step="0.1" value={sfAltura} onChange={e => setSfAltura(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Separación entre montantes</label>
                      <select value={sfSep} onChange={e => setSfSep(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value={0.4}>400 mm (Recomendado muros portantes)</option>
                        <option value={0.6}>600 mm</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Perfil de montante</label>
                      <select value={sfPerfil} onChange={e => setSfPerfil(e.target.value)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value="PGC 100x0.90">PGC 100x0.90 mm</option>
                        <option value="PGC 100x1.25">PGC 100x1.25 mm</option>
                        <option value="PGC 150x0.90">PGC 150x0.90 mm</option>
                        <option value="PGC 150x1.25">PGC 150x1.25 mm</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Carga axil por montante: {sfAxial} kN</label>
                      <input type="range" min="2" max="30" step="1" value={sfAxial} onChange={e => setSfAxial(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${res.verifica ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {res.verifica ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                        <span>{res.verifica ? 'VERIFICA A PANDEO Y FLEXOCOMPRESIÓN' : 'NO VERIFICA - RIESGO DE PANDEO'}</span>
                      </h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                        D/C: {res.dcRatio}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-2">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Esbeltez λ</span>
                        <strong className="text-slate-900 text-sm">{res.lambda}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacidad P_adm</span>
                        <strong className="text-slate-900 text-sm">{res.pAdm} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Momento Viento</span>
                        <strong className="text-slate-900 text-sm">{res.Mviento} kNm</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{res.rec}</p>
                  </div>
                </div>
              );
            })()}

            {/* 3. DINTEL STEEL FRAME */}
            {activeCalc === 'dintel' && (() => {
              const res = calcDintel();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ancho de la abertura (Luz): {dintelLuz} m</label>
                      <input type="range" min="0.8" max="3.5" step="0.1" value={dintelLuz} onChange={e => setDintelLuz(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Carga gravitatoria superior: {dintelCarga} kg/m</label>
                      <input type="range" min="300" max="2500" step="50" value={dintelCarga} onChange={e => setDintelCarga(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Configuración y Armado Sugerido</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Momento M_u</span>
                        <strong className="text-slate-900 text-sm">{res.Mmax} kNm</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Corte V_u</span>
                        <strong className="text-slate-900 text-sm">{res.Vmax} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Flecha Adm. (L/400)</span>
                        <strong className="text-slate-900 text-sm">{res.flechaAdm} mm</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Jacks de Apoyo</span>
                        <strong className="text-slate-900 text-sm">{res.jacks} por extremo</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700"><strong>Armado constructivo:</strong> {res.perfilSugerido} con vinculación cada 30 cm con tornillos T1 punta broca.</p>
                  </div>
                </div>
              );
            })()}

            {/* 4. CABRIADA STEEL FRAME */}
            {activeCalc === 'cabriada' && (() => {
              const res = calcCabriada();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luz de la cabriada: {cabLuz} m</label>
                      <input type="range" min="5.0" max="14.0" step="0.5" value={cabLuz} onChange={e => setCabLuz(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pendiente del techo: {cabPend}%</label>
                      <input type="range" min="15" max="45" step="5" value={cabPend} onChange={e => setCabPend(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Resultados de Solicitaciones Axiales</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Altura Cumbrera</span>
                        <strong className="text-slate-900 text-sm">{res.H} m</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Compresión Superior</span>
                        <strong className="text-red-700 text-sm">{res.CompresionSuperior} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracción Inferior</span>
                        <strong className="text-blue-700 text-sm">{res.TraccionInferior} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Perfil Recomendado</span>
                        <strong className="text-slate-900 text-sm">{res.perfilSugerido}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600"><strong>Detalle de fijaciones:</strong> {res.fijaciones}</p>
                  </div>
                </div>
              );
            })()}

            {/* 5. MURO PORTANTE & ARRIOSTRAMIENTO */}
            {activeCalc === 'muro-portante' && (() => {
              const res = calcMuroPortante();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Longitud del muro B: {muroLargo} m</label>
                      <input type="range" min="2.0" max="8.0" step="0.5" value={muroLargo} onChange={e => setMuroLargo(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Corte basal actuante V: {muroCorte} kN</label>
                      <input type="range" min="5" max="40" step="1" value={muroCorte} onChange={e => setMuroCorte(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sistema de rigidización lateral</label>
                      <select value={muroSistema} onChange={e => setMuroSistema(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value="cruz">Cruz de San Andrés (Flejes galvanizados con tensor)</option>
                        <option value="osb">Diafragma de Rigidización (Placas OSB 11.1 mm)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Anclajes de Tracción Hold-Down</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracción en Anclaje de Borde</span>
                        <strong className="text-red-700 text-base">{res.Tholddown} kN</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacidad Resistente del Panel</span>
                        <strong className="text-emerald-700 text-base">{res.resistenciaPanel} kN</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700"><strong>Anclaje recomendado a fundación:</strong> {res.anclajeRequerido}</p>
                  </div>
                </div>
              );
            })()}

            {/* 6. PLATEA DE FUNDACIÓN */}
            {activeCalc === 'platea' && (() => {
              const res = calcPlatea();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Superficie de la platea: {plateaArea} m²</label>
                      <input type="range" min="40" max="300" step="5" value={plateaArea} onChange={e => setPlateaArea(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Carga total del edificio: {plateaCarga} Toneladas</label>
                      <input type="range" min="40" max="400" step="10" value={plateaCarga} onChange={e => setPlateaCarga(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Espesor de losa de platea: {plateaEspesor} cm</label>
                      <select value={plateaEspesor} onChange={e => setPlateaEspesor(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value={15}>15 cm (Vivienda 1 planta Steel Frame)</option>
                        <option value={20}>20 cm (Vivienda 2 plantas estándar)</option>
                        <option value={25}>25 cm (Suelos blandos / mampostería pesada)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tensión admisible terreno: {plateaSigmaAdm} kg/cm²</label>
                      <input type="range" min="0.6" max="2.0" step="0.1" value={plateaSigmaAdm} onChange={e => setPlateaSigmaAdm(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${res.verifica ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {res.verifica ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                        <span>{res.verifica ? 'TENSIÓN ADMISIBLE DEL SUELO VERIFICADA' : 'EXCEDE TENSIÓN ADMISIBLE - AUMENTAR ÁREA'}</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Tensión Media σ</span>
                        <strong className="text-slate-900 text-sm">{res.sigma} kg/cm²</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Asentamiento Estimado</span>
                        <strong className="text-slate-900 text-sm">{res.asiento_mm} mm</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Armadura de Malla</span>
                        <strong className="text-slate-900 text-xs">{res.mallaSugerida}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700"><strong>Viga perimetral:</strong> {res.vigaBorde}</p>
                  </div>
                </div>
              );
            })()}

            {/* 7. PILOTES POR SPT (DÉCOURT-QUARESMA) */}
            {activeCalc === 'pilotes-spt' && (() => {
              const res = calcPilotes();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Diámetro del pilote: {pilDiam} cm</label>
                      <select value={pilDiam} onChange={e => setPilDiam(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value={30}>30 cm</option>
                        <option value={40}>40 cm (Estándar residencial)</option>
                        <option value={50}>50 cm</option>
                        <option value={60}>60 cm</option>
                        <option value={80}>80 cm</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Profundidad L: {pilProf} m</label>
                      <input type="range" min="4" max="22" step="1" value={pilProf} onChange={e => setPilProf(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">N_SPT Promedio en Fuste: {pilNsptFuste} golpes</label>
                      <input type="range" min="3" max="35" step="1" value={pilNsptFuste} onChange={e => setPilNsptFuste(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">N_SPT en Punta: {pilNsptPunta} golpes</label>
                      <input type="range" min="5" max="50" step="1" value={pilNsptPunta} onChange={e => setPilNsptPunta(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Capacidad Portante Geotécnica y Estructural</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Fricción Fuste</span>
                        <strong className="text-slate-900 text-sm">{res.Qlat} tn</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Resistencia Punta</span>
                        <strong className="text-slate-900 text-sm">{res.Qpunta} tn</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga Última Qu</span>
                        <strong className="text-slate-900 text-sm">{res.Qu} tn</strong>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-emerald-800 block text-[10px] uppercase font-bold">Carga Admisible Q_adm</span>
                        <strong className="text-emerald-700 text-base">{res.Qadm} tn</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">FS = 2.5 según criterio Décourt-Quaresma y verificación de límite de hormigón CIRSOC 201 ({res.limiteEstructural} tn).</p>
                  </div>
                </div>
              );
            })()}

            {/* 8. PREDIMENSIONADO COLUMNAS Y VIGAS */}
            {activeCalc === 'predimensionado' && (() => {
              const res = calcPredimensionado();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipo de Elemento Estructural</label>
                      <select value={predElem} onChange={e => setPredElem(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value="viga_ha">Viga de Hormigón Armado</option>
                        <option value="columna_ha">Columna de Hormigón Armado</option>
                        <option value="viga_acero">Viga de Acero Estructural</option>
                        <option value="columna_acero">Columna de Acero (Tubo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luz libre L: {predLuz} m</label>
                      <input type="range" min="2.5" max="10.0" step="0.5" value={predLuz} onChange={e => setPredLuz(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Sección Geométrica y Armadura Recomendada</h4>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">Sección Transversal Estimada:</span>
                        <span className="text-base font-black text-slate-900">{res.seccion}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">Armadura Longitudinal / Perfil:</span>
                        <span className="text-xs font-bold text-slate-800">{res.armaduraPrincipal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold">Estribado / Rigidización:</span>
                        <span className="text-xs text-slate-700">{res.estribos}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">Criterio: {res.formula}</p>
                  </div>
                </div>
              );
            })()}

            {/* 9. LOSAS */}
            {activeCalc === 'losas' && (() => {
              const res = calcLosas();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipología de Losa</label>
                      <select value={losaTipo} onChange={e => setLosaTipo(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value="viguetas">Viguetas Pretensadas + EPS/Cerámico</option>
                        <option value="maciza_cruzada">Losa Maciza Bidireccional Cruzada</option>
                        <option value="maciza_unidir">Losa Maciza Unidireccional</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luz menor Lx: {losaLx} m</label>
                      <input type="range" min="2.0" max="6.5" step="0.1" value={losaLx} onChange={e => setLosaLx(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Espesor y Armadura de Losa</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Espesor Mínimo Sugerido</span>
                        <strong className="text-slate-900 text-sm">{res.altura}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Distribución de Armadura</span>
                        <strong className="text-slate-900 text-xs">{res.detalle}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 10. CARGA DE FUEGO (DEC. 351/79) */}
            {activeCalc === 'carga-fuego' && (() => {
              const res = calcCargaFuego();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Superficie sector: {fuegoArea} m²</label>
                      <input type="range" min="30" max="800" step="10" value={fuegoArea} onChange={e => setFuegoArea(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Madera y Papel: {fuegoMaderaKg} kg</label>
                      <input type="range" min="100" max="5000" step="100" value={fuegoMaderaKg} onChange={e => setFuegoMaderaKg(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Plásticos y Gomas: {fuegoPlasticoKg} kg</label>
                      <input type="range" min="50" max="2000" step="50" value={fuegoPlasticoKg} onChange={e => setFuegoPlasticoKg(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                    <h4 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <span>Clasificación de Resistencia al Fuego — Decreto 351/79</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga de Fuego</span>
                        <strong className="text-slate-900 text-sm">{res.cargaFuegoKgM2}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Resistencia Exigida</span>
                        <strong className="text-red-700 text-base">{res.resistencia}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Nivel de Riesgo</span>
                        <strong className="text-slate-900 text-xs">{res.riesgo}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Dotación Matafuegos</span>
                        <strong className="text-slate-900 text-xs">{res.extintores}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 11. SISMO CIRSOC 103 */}
            {activeCalc === 'sismo' && (() => {
              const res = calcSismo();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Zona Sísmica Argentina</label>
                      <select value={sismoZona} onChange={e => setSismoZona(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value={0}>Zona 0 (Buenos Aires / Litoral)</option>
                        <option value={1}>Zona 1 (Centro / Córdoba este)</option>
                        <option value={2}>Zona 2 (Córdoba oeste / Salta)</option>
                        <option value={3}>Zona 3 (Mendoza / La Rioja)</option>
                        <option value={4}>Zona 4 (San Juan / Mendoza norte)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipo de Suelo (CIRSOC 103)</label>
                      <select value={sismoSuelo} onChange={e => setSismoSuelo(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value="I">Tipo I (Roca / Suelo muy denso)</option>
                        <option value="II">Tipo II (Suelo firme intermedio)</option>
                        <option value="III">Tipo III (Suelo blando / arcillas)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Peso sísmico total W: {sismoPeso} tn</label>
                      <input type="range" min="50" max="600" step="20" value={sismoPeso} onChange={e => setSismoPeso(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      <span>Corte Basal y Parámetros Sísmicos</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Aceleración Sa</span>
                        <strong className="text-slate-900 text-sm">{res.Sa}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Coeficiente C</span>
                        <strong className="text-slate-900 text-sm">{res.CoefC}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Corte Basal Vo</span>
                        <strong className="text-red-700 text-base">{res.Vo_tn}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuerza Sísmica</span>
                        <strong className="text-slate-900 text-sm">{res.Vo_kN}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 12. NIEVE CIRSOC 104 */}
            {activeCalc === 'nieve' && (() => {
              const res = calcNieve();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Carga básica de nieve pg: {nievePg} kN/m²</label>
                      <input type="range" min="0.5" max="4.5" step="0.1" value={nievePg} onChange={e => setNievePg(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Inclinación cubierta: {nievePend}°</label>
                      <input type="range" min="5" max="65" step="5" value={nievePend} onChange={e => setNievePend(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Condición Térmica</label>
                      <select value={nieveCt} onChange={e => setNieveCt(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50">
                        <option value={1.0}>Calefaccionado (Ct = 1.0)</option>
                        <option value={1.2}>Estructura fría / depósito (Ct = 1.2)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CloudSnow className="w-5 h-5 text-blue-600" />
                      <span>Carga de Nieve sobre Cubierta (pf)</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga en Techo pf</span>
                        <strong className="text-blue-700 text-base">{res.pf_kNm2}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Equivalente kg/m²</span>
                        <strong className="text-slate-900 text-base">{res.pf_kgm2}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Factor de Forma Cs</span>
                        <strong className="text-slate-900 text-sm">{res.Cs}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{res.sotavento}</p>
                  </div>
                </div>
              );
            })()}

            {/* 13. VIENTO CIRSOC 102 */}
            {activeCalc === 'viento' && (() => {
              const res = calcViento();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Velocidad básica V: {vientoV} m/s ({Math.round(vientoV * 3.6)} km/h)</label>
                      <input type="range" min="35" max="65" step="1" value={vientoV} onChange={e => setVientoV(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Categoría de Exposición</label>
                      <select value={vientoExp} onChange={e => setVientoExp(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold">
                        <option value="B">B (Urbano / Suburbano con obstáculos)</option>
                        <option value="C">C (Campo abierto / Llanura / Terreno despejado)</option>
                        <option value="D">D (Costero marítimo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Altura de cumbrera z: {vientoAlt} m</label>
                      <input type="range" min="3" max="30" step="1" value={vientoAlt} onChange={e => setVientoAlt(Number(e.target.value))} className="w-full accent-red-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Wind className="w-5 h-5 text-teal-600" />
                      <span>Presiones de Diseño (CIRSOC 102-2025 / 102-2005)</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Presión Dinámica qz</span>
                        <strong className="text-slate-900 text-sm">{res.qz_kgm2}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pared Barlovento</span>
                        <strong className="text-red-700 text-sm">{res.barlovento}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pared Sotavento</span>
                        <strong className="text-blue-700 text-sm">{res.sotavento}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Presión Neta Total</span>
                        <strong className="text-slate-900 text-sm">{res.totalViga}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Calculation Footer with CIRSOC Standard Reference */}
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Normativa Aplicada: <strong>{currentCalcMeta.norma}</strong> (CIRSOC / INTI / IRAM Argentina)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Memoria Técnica Verificada HOGACOR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
