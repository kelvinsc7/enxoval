import { CategorySummary } from '../types';

export const CATEGORIES: CategorySummary[] = [
  {
    id: 'quarto',
    title: 'Para o quarto',
    description: 'Itens para segurança, ambiente e organização do quartinho.',
    iconName: 'BedDouble',
    subcategories: ['Móveis', 'Ambiente', 'Organização', 'Segurança']
  },
  {
    id: 'soninho',
    title: 'Para o soninho',
    description: 'Itens para o berço, conforto e rotina de sono do bebê.',
    iconName: 'Moon',
    subcategories: ['Berço e roupa de cama', 'Conforto térmico', 'Rotina e monitoramento', 'Complementos do soninho']
  },
  {
    id: 'vestir',
    title: 'Para vestir',
    description: 'Roupinhas calculadas pelo clima e estação para cada fase do bebê.',
    iconName: 'Shirt',
    subcategories: ['Recém-nascido', '3 meses', '6 meses', '9 meses', '12 meses']
  },
  {
    id: 'higiene',
    title: 'Higiene e Banho',
    description: 'Cuidados diários, banho, trocas de fralda e farmacinha.',
    iconName: 'Sparkles',
    subcategories: ['Banho', 'Cuidados diários', 'Limpeza nasal', 'Farmacinha', 'Troca de fraldas', 'Paninhos', 'Fraldas descartáveis']
  },
  {
    id: 'alimentacao',
    title: 'Alimentação',
    description: 'Amamentação, mamadeiras e a fase de introdução alimentar.',
    iconName: 'Baby',
    subcategories: ['Amamentação', 'Mamadeiras', 'Introdução alimentar']
  },
  {
    id: 'passeio',
    title: 'Passeio e acessórios',
    description: 'Transporte, bolsas de passeio, chupetas e desenvolvimento.',
    iconName: 'Car',
    subcategories: ['Transporte', 'Bolsas e organização', 'Chupeta', 'Desenvolvimento']
  },
  {
    id: 'mamae',
    title: 'Para a mamãe',
    description: 'Conforto e itens essenciais da mãe durante o parto e pós-parto.',
    iconName: 'Heart',
    subcategories: ['Roupas', 'Pós-parto']
  },
  {
    id: 'maternidade',
    title: 'Mala maternidade',
    description: 'O que levar no dia do parto para a mamãe, bebê e acompanhante.',
    iconName: 'Luggage',
    subcategories: ['Mochila sala de parto', 'Mala do bebê', 'Mala da mamãe']
  }
];
