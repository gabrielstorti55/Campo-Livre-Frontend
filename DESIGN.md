---
version: alpha
name: CampoLivre — Campo Editorial + Estádio Municipal
description: Sistema visual esportivo, editorial, comunitário e operacional para todas as jornadas do CampoLivre.
colors:
  primary: '#173F2F'
  secondary: '#142438'
  tertiary: '#F2C94C'
  neutral: '#F5F1E6'
  surface: '#FBFAF4'
  field: '#216447'
  field-soft: '#DFE8D9'
  ink: '#17241D'
  muted: '#5F675F'
  line: '#C9C8BC'
  danger: '#B42318'
  warning: '#8A5A00'
  success: '#216447'
typography:
  display-xl:
    fontFamily: Barlow Condensed
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '0.01em'
  display-lg:
    fontFamily: Barlow Condensed
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '0.01em'
  heading:
    fontFamily: Barlow Condensed
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '0.01em'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0em'
  label:
    fontFamily: IBM Plex Sans
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '0.08em'
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '#FFFFFF'
    rounded: '{rounded.md}'
    padding: 12px
  button-primary-hover:
    backgroundColor: '{colors.secondary}'
    textColor: '#FFFFFF'
  button-highlight:
    backgroundColor: '{colors.tertiary}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: 12px
  canvas:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.ink}'
  surface:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
  input-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
  status-success:
    backgroundColor: '{colors.field-soft}'
    textColor: '{colors.success}'
    rounded: '{rounded.md}'
  field-band:
    backgroundColor: '{colors.field}'
    textColor: '{colors.neutral}'
    rounded: '{rounded.sm}'
  copy-muted:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.muted}'
  divider:
    backgroundColor: '{colors.line}'
    textColor: '{colors.ink}'
  status-danger:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.danger}'
  status-warning:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.warning}'
  navigation:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.neutral}'
---

## Overview

CampoLivre combina **Campo Editorial + Estádio Municipal**. A interface deve parecer parte do futebol local: direta, autoral, comunitária e legível, com o rigor de uma súmula, uma tabela e um placar municipal. Este arquivo é a fonte de verdade visual para telas atuais, novas jornadas e integrações futuras da API.

A marca principal é sempre **CampoLivre**. `LigaPro` não deve aparecer como marca paralela. O logo atual permanece até decisão específica de redesign.

O tom muda por contexto sem criar temas desconectados:

- **Público:** editorial, esportivo e emocional.
- **Atleta:** pessoal, esportivo e orientado à própria trajetória.
- **Organizador:** operacional, preciso e denso quando necessário.
- **Prefeitura:** institucional, confiável e orientado à infraestrutura.
- **Autenticação:** direta, local e focada no acesso; sem linguagem genérica de SaaS.

## Colors

- **Verde de campo (`primary`, `field`):** ações principais, vínculo esportivo e estados positivos.
- **Azul-noturno (`secondary`):** navegação, superfícies de estádio e contextos institucionais.
- **Amarelo de estádio (`tertiary`):** destaque raro, seleção e informação que merece atenção.
- **Creme/giz (`neutral`):** canvas principal; substitui o branco clínico de dashboard.
- **Superfície (`surface`):** blocos de leitura sobre o canvas, sem empilhar cartão dentro de cartão.
- **Tinta (`ink`):** texto principal.

Cores de estado não substituem rótulos textuais. Nunca comunicar situação apenas por cor.

## Typography

- **Barlow Condensed:** títulos, números, placares, métricas e chamadas esportivas. Usar peso 700 e caixa alta com moderação em rótulos de estádio/tabela.
- **IBM Plex Sans:** navegação, formulários, tabelas, textos, mensagens e controles.
- As fontes são autocontidas por `@fontsource`; produção não depende de fontes remotas.
- Evitar Poppins, Inter ou `system-ui` como identidade visível, mantendo fallback apenas técnico.

## Layout

- Canvas creme com linhas sutis quando o grafismo ajuda a orientar a superfície.
- Largura máxima compartilhada de 1380 px para shells principais.
- Hierarquia por tipografia, divisores e alinhamento — não por uma grade uniforme de cartões.
- Métricas comparáveis formam faixas ou grades com divisores.
- Listas operacionais e tabelas devem ser densas, escaneáveis e responsivas.
- No mobile, ações mantêm alvo mínimo de 44 px, tabelas têm contêiner de rolagem explícito e abas horizontais indicam continuidade quando necessário.

## Elevation & Depth

- Sombras são exceção para overlays e menus elevados.
- Superfícies comuns usam borda e contraste de fundo, não sombra.
- Não usar glassmorphism, blur decorativo ou gradientes tecnológicos.
- Overlay modal pode usar escurecimento simples; o conteúdo modal continua sólido e legível.

## Shapes

- Raios padrão: 4–8 px.
- Pílulas apenas para estados compactos, filtros exclusivos e tags realmente categóricas.
- Evitar `rounded-2xl`, `rounded-3xl` e valores arbitrários em contêineres de conteúdo.
- Linhas de campo, círculo central, placar, súmula e numeração esportiva são o vocabulário gráfico permitido.

## Components

- **Cabeçalho de página:** título condensado forte, subtítulo funcional e divisor; ações alinhadas sem card externo.
- **Seção:** superfície editorial com borda firme ou apenas divisores; nunca card dentro de card.
- **Métrica:** número condensado, rótulo curto e agrupamento comparável.
- **Botão:** raio médio, sem sombra padrão; uma ação primária clara por região.
- **Formulário:** labels explícitos, campos sólidos, foco visível e feedback textual.
- **Navegação autenticada:** azul-noturno ou verde profundo, grafismo de campo discreto, sem fotografia.
- **Modal:** Radix/shadcn, foco capturado e restaurado, título acessível e fechamento por Escape.
- **Abas:** `tab` associado a `tabpanel`, foco de teclado e indicação de rolagem no mobile quando houver overflow.
- **Tabela/súmula:** cabeçalho firme, divisores horizontais, números condensados e leitura possível em 390 px.

## Do's and Don'ts

### Faça

- Use composição editorial e vocabulário do futebol local.
- Preserve rotas, regras, dados, permissões e estados ao reformar a apresentação.
- Construa controles genéricos com shadcn/ui ou Radix.
- Mantenha componentes próprios para composições reais de domínio.
- Registre novos tokens e padrões neste arquivo antes de criar uma variação visual durável.
- Valide desktop, mobile, teclado, contraste e fontes carregadas.

### Não faça

- Não reintroduza `LigaPro` como marca principal ou assinatura de mesmo peso.
- Não use fotografia como sustentação da identidade.
- Não crie card para cada bloco, ícone ou mensagem.
- Não use pílulas, sombras e grandes raios como padrão.
- Não use frases motivacionais artificiais ou linguagem genérica de SaaS.
- Não permita que a chegada da API altere o sistema visual; estados de loading, vazio, erro e sucesso devem usar estes mesmos tokens e componentes.
