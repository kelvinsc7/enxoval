export interface SeasonPhase {
  size: 'RN' | '3M' | '6M' | '9M' | '12M';
  ageLabel: string;
  monthsLabel: string;
  season: 'Verão' | 'Outono' | 'Inverno' | 'Primavera';
  climateTip: string;
}

const MONTH_NAMES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

export function getSeasonForMonth(monthIndex: number, _city: string = 'São Paulo'): 'Verão' | 'Outono' | 'Inverno' | 'Primavera' {
  // Brazilian seasons by month index (0 = Jan, 11 = Dec)
  if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) return 'Verão';
  if (monthIndex >= 2 && monthIndex <= 4) return 'Outono';
  if (monthIndex >= 5 && monthIndex <= 7) return 'Inverno';
  return 'Primavera';
}

export function calculatePhases(dueDateStr: string, city: string = 'São Paulo'): SeasonPhase[] {
  const date = new Date(dueDateStr);
  const birthMonth = isNaN(date.getTime()) ? 1 : date.getMonth(); // Default Feb (index 1)

  const phases: SeasonPhase[] = [
    {
      size: 'RN',
      ageLabel: '0 a 1 mês',
      monthsLabel: MONTH_NAMES[birthMonth],
      season: getSeasonForMonth(birthMonth, city),
      climateTip: 'Peças em 100% algodão suedine e tecidos respiráveis para a pele sensível.'
    },
    {
      size: '3M',
      ageLabel: '0 a 3 meses',
      monthsLabel: `${MONTH_NAMES[birthMonth]}-${MONTH_NAMES[(birthMonth + 2) % 12]}`,
      season: getSeasonForMonth((birthMonth + 1) % 12, city),
      climateTip: 'Fase de muitas trocas diárias de roupinha e crescimento acelerado.'
    },
    {
      size: '6M',
      ageLabel: '3 a 6 meses',
      monthsLabel: `${MONTH_NAMES[(birthMonth + 3) % 12]}-${MONTH_NAMES[(birthMonth + 5) % 12]}`,
      season: getSeasonForMonth((birthMonth + 4) % 12, city),
      climateTip: 'Início das primeiras brincadeiras no chão e sentar com apoio.'
    },
    {
      size: '9M',
      ageLabel: '6 a 9 meses',
      monthsLabel: `${MONTH_NAMES[(birthMonth + 6) % 12]}-${MONTH_NAMES[(birthMonth + 8) % 12]}`,
      season: getSeasonForMonth((birthMonth + 7) % 12, city),
      climateTip: 'Fase de engatinhar: peças confortáveis com proteção nos joelhinhos.'
    },
    {
      size: '12M',
      ageLabel: '9 a 12 meses',
      monthsLabel: `${MONTH_NAMES[(birthMonth + 9) % 12]}-${MONTH_NAMES[(birthMonth + 11) % 12]}`,
      season: getSeasonForMonth((birthMonth + 10) % 12, city),
      climateTip: 'Bebê começando a ficar em pé: sapatinhos com sola antiderrapante.'
    }
  ];

  return phases;
}
