# Brag V2 Plan: CampoLivre — produto em campo

## Direção

Uma peça híbrida de 36 segundos: identidade editorial esportiva no hook e no encerramento, com a maior parte do tempo dedicada a capturas reais do frontend executado em `NEXT_PUBLIC_APP_MODE=prototipo`.

A demonstração preserva visível o indicador “Modo de demonstração — dados simulados e não persistidos”, portanto não comunica integração backend inexistente.

## Resumo do produto

CampoLivre organiza a descoberta pública de campeonatos, partidas, participantes e resultados do futebol local.

## Hook

**Futebol local, jogo aberto.**

## Formato

- Landscape 1920×1080
- 30 FPS
- 36 segundos
- Sem narração
- Música + SFX discretos
- Capturas reais 1600×900

## Storyboard

### 1. O campo abre — 0:00–0:04

- Fundo creme com geometria de campo.
- “FUTEBOL LOCAL” entra pela esquerda.
- “JOGO ABERTO” pousa sobre faixa amarela.
- Transição por faixa verde.

### 2. A porta de entrada — 0:04–0:10

- Captura real da home.
- Moldura de navegador e etiqueta “INTERFACE REAL · MODO PROTÓTIPO”.
- Zoom lento na área “Campeonatos em andamento”.
- Cursor cruza a tela e clica em “Ver todos os campeonatos”.
- Copy: “O futebol da cidade começa aqui.”

### 3. Campeonatos públicos — 0:10–0:17

- Captura real de `/campeonatos`.
- Zoom no catálogo e nos filtros.
- Cursor percorre o filtro e clica no card Copa Franca 2026.
- Copy: “Encontre competições. Veja o que está em andamento.”

### 4. Uma competição, várias histórias — 0:17–0:23

- Captura real de `/campeonatos/1`.
- Movimento de câmera do hero para as áreas de participantes, artilharia e agenda.
- Copy: “Participantes, artilharia e agenda em um só lugar.”

### 5. Agenda pública — 0:23–0:28

- Captura real de `/partidas`.
- Zoom no confronto Mandante × Visitante.
- Cursor clica no card.
- Copy: “Da rodada ao campo.”

### 6. A partida em detalhe — 0:28–0:33

- Captura real de `/partidas/1`.
- Zoom no placar e no resumo público.
- Copy: “Acompanhe o jogo. Consulte o resumo publicado.”

### 7. Marca — 0:33–0:36

- Campo verde-noturno.
- CampoLivre centralizado.
- “Futebol local, jogo aberto.”
- Hold final para poster.

## Áudio

- Trilha: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Volume da música: 0.23
- Impactos: hook, entrada do produto, placar e marca
- Cliques: transições de navegação
- Sem voz e sem afirmações de backend

## Critérios de aprovação

- Capturas são arquivos obtidos do frontend em execução.
- Indicador de protótipo permanece visível.
- Texto legível e sem cortes.
- Zoom não degrada significativamente a captura.
- Runtime, layout, motion e contraste passam no Hyperframes.
- MP4 contém vídeo H.264 e áudio AAC, com 36 segundos.
