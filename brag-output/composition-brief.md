# Hyperframes Composition Brief: CampoLivre

## Objective

Criar um vídeo curto de lançamento do CampoLivre, centrado na consulta pública do futebol local e fiel à identidade “Campo Editorial + Estádio Municipal”. Esta primeira prova não apresenta adapters de protótipo como integração backend.

## Output

- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material

- Project root: `C:/Users/gabri/OneDrive/Desktop/TCC/Campo-Livre-Frontend`
- Primary files read: `DESIGN.md`, `src/app/styles.css`, `src/screens/publico/inicio.tsx`, `src/screens/publico/campeonatos.tsx`, `src/screens/publico/partidas.tsx`
- Product name: CampoLivre
- Tagline / strongest claim: Futebol local, jogo aberto
- Key UI or visual moment to recreate: catálogo público → agenda → placar publicado
- Copy that must appear verbatim:
  - CampoLivre
  - Futebol local, jogo aberto
  - Campeonatos em andamento
  - Agenda de partidas
  - Resumo da súmula publicado

## Creative Direction

- Tone preset: polished
- Creative direction: filme editorial de estádio municipal
- Interpretation: movimento disciplinado, tipografia forte e holds longos; sem fotografia ou clichê SaaS
- Angle: o futebol local ganha um campo digital com a clareza de uma tabela, uma súmula e um placar municipal
- Hook: FUTEBOL LOCAL / JOGO ABERTO
- Outro: CampoLivre — Futebol local, jogo aberto
- Avoid:
  - fotografia como sustentação visual
  - gradientes tecnológicos, glassmorphism, sombras e grandes raios
  - excesso de cartões ou pílulas
  - afirmar integração backend completa

## Visual Identity

- Background: `#F5F1E6`
- Surface: `#FBFAF4`
- Text: `#17241D`
- Field: `#216447`
- Deep green: `#173F2F`
- Night: `#142438`
- Accent: `#F2C94C`
- Line: `#C9C8BC`
- Display font: Barlow Condensed
- Body font: IBM Plex Sans
- Visual references: linhas de campo, círculo central, tabela, súmula, placar e divisores editoriais

## Storyboard

Use `brag-output/brag-plan.md` as the creative contract.

Scene summary:

1. O campo abre — 4.5s — hook tipográfico e geometria de campo
2. Campeonatos públicos — 4.2s — três competições em faixa editorial
3. Agenda de partidas — 4.4s — União Francana × Vila Nova
4. Resultado publicado — 3.8s — placar 2 × 1 e resumo da súmula
5. CampoLivre — 3.1s — marca, assinatura e hold para poster

## Audio

- Audio role: steady professional bed with sparse motion accents
- Audio arc: discreto no hook, ganha presença na agenda e pousa na marca final
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: volume 0.24; sem voz; sem áudio reativo nesta prova
- Music cue guidance: preset em `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; considerar 8.74s, 13.11s e 17.47s como landmarks opcionais
- Audio-reactive treatment: none nesta primeira prova para reduzir custo e risco de render
- Audio-coupled moments:
  - agenda revela perto de 8.74s
  - placar pousa perto de 13.11s
  - marca final entra perto de 17.47s
- SFX selection guidance: impactos quentes de baixo risco e um clique discreto, conforme `sfx-analysis.md`
- Exact SFX choice: `impactSoft_medium_001.ogg`, `click_003.ogg`, `impactSoft_medium_004.ogg`

## Hyperframes Instructions

Use o contrato oficial Hyperframes carregado no Hermes. `/brag` controla história e identidade; Hyperframes controla timing e render.

Requirements:

- mostrar elementos reais reconstruídos a partir das telas públicas
- manter todo texto legível em 1920x1080
- duração total de 20s
- usar a trilha e SFX copiados localmente
- timeline síncrona, determinística e pausada
- registrar `window.__timelines["campolivre-brag"]`
- usar transições CSS consistentes entre cenas
- executar lint, validate e inspect antes do render
