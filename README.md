# 👶 EnxovalFácil

> Monte seu enxoval personalizado para o seu bebê. Sem exageros. Adaptado ao clima da sua cidade e mês do nascimento.

Inspirado na experiência elegante e contextual do Enxovaly, o **EnxovalFácil** é um aplicativo Web/PWA Mobile-First que ajuda gestantes e famílias a planejarem cada peça do enxoval na medida certa, sem compras desnecessárias.

---

## ✨ Funcionalidades

- **Cálculo Climático Inteligente**: Baseado na data prevista do parto e na cidade, ajusta automaticamente as estações do ano e os tecidos/quantidades para cada tamanho (RN a 12M).
- **Checklist Completo por Categorias**:
  - Para o quarto (Móveis, Ambiente, Organização, Segurança)
  - Para o soninho (Berço, Conforto térmico, Monitoramento)
  - Para vestir (Calculado por idade: RN, 3M, 6M, 9M, 12M)
  - Higiene e Banho (Banho, Cuidados, Limpeza nasal, Farmacinha, Fraldas)
  - Alimentação (Amamentação, Mamadeiras, Introdução alimentar)
  - Passeio e acessórios (Transporte, Bolsas, Chupetas)
  - Para a mamãe (Roupas, Pós-parto)
  - Mala maternidade (Mochila sala de parto, Mala do bebê, 1ª troca do bebê)
- **Armário Virtual (Closet Inteligente)**:
  - Classificação por tamanho (*Serve agora* vs *Na gaveta para depois*).
  - Gerador de **Look do Dia** sugerido pelo clima.
- **Lia Assistente com IA**: Dúvidas frequentes de enxoval e registro ágil de peças por conversa.
- **Lista de Presentes / Chá de Bebê**: Link público compartilhável onde familiares e amigos podem ver o que falta e reservar presentes sem repetir.
- **Banco de Dados Supabase**: Schema dedicado (`enxoval`) com Row Level Security (RLS) e sincronização em tempo real.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Conexão com o Supabase
Crie um arquivo `.env` na raiz com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
```

---

## 🛠️ Tecnologias
- **React 19 + TypeScript**
- **Vite**
- **Tailwind CSS** (Design system mobile-first com paleta lavanda/dourado)
- **Lucide React** (Ícones)
- **Canvas Confetti** (Micro-interações)
- **Supabase** (PostgreSQL com schema isolado `enxoval` e RLS)
