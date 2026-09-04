# Vídeo controlado por scroll com Hero pinado

Este documento descreve o padrão usado na landing page VITRI para criar um **pinned scroll section**: durante um trecho de rolagem, o Hero permanece fixo abaixo da navbar e o scroll controla o tempo de um vídeo. Não é apenas um vídeo que acompanha o scroll de uma página que continua deslizando.

## Resultado esperado

1. O usuário chega ao Hero.
2. O Hero é fixado logo abaixo da navbar.
3. Cada alteração de scroll atualiza continuamente o `currentTime` do vídeo, de `0` até `video.duration`.
4. Só após o fim do trecho de scroll reservado pelo `end` o pin é liberado e a próxima seção começa a entrar na viewport.
5. Ao subir, o ScrollTrigger percorre a mesma animação em sentido inverso e o vídeo retorna continuamente ao início.

O vídeo continua no layout normal da coluna direita; apenas o seu tempo é animado. Ele não é fullscreen, não toca automaticamente e não substitui o Hero.

## Dependências e ordem de carregamento

O projeto usa as versões UMD do GSAP e ScrollTrigger no fim do `body`, **antes** de `script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="script.js"></script>
```

No JavaScript, o plugin precisa ser registrado uma vez:

```js
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
```

Se os scripts estiverem em outra ordem, `window.gsap` ou `window.ScrollTrigger` não existirá e o pin não será inicializado.

## Estrutura do DOM

A separação entre `section` (gatilho) e `hero-sticky` (elemento pinado) é essencial:

```html
<section id="hero-scroll" class="hero relative">
  <div class="hero-sticky h-[calc(100svh-76px)]">
    <div class="wrap h-full grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
      <div><!-- texto e CTAs --></div>

      <div><!-- coluna direita --></div>
      <video id="hero-video" muted playsinline preload="auto">
        <source src="./src/assets/videos/video-scroll-keyframes.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
</section>
```

- `#hero-scroll` é o `trigger` do ScrollTrigger.
- `.hero-sticky` é o único alvo do `pin`. Ela contém o Hero completo, preservando texto, vídeo, grade e dimensões originais.
- `#hero-video` é apenas o elemento cujo `currentTime` será controlado.
- A classe `h-[calc(100svh-76px)]` faz o Hero visível ocupar a viewport menos a navbar de 76 px.

Não aplique `pin` somente no vídeo: isso quebra o alinhamento do Hero e não atende ao requisito de manter o texto fixo junto dele.

## Navbar, altura e camadas

A navbar atual é `sticky`, tem `h-[76px]` e `z-20`. Por isso o pin inicia em `top 76px`:

```js
start: "top 76px"
```

O CSS do Hero deve manter a área visível e deixar o conteúdo acima do fundo decorativo:

```css
.hero {
  position: relative;
  overflow: visible;
  min-height: calc(100svh - 76px);
}

.hero-sticky {
  position: relative;
  z-index: 1;
}
```

`overflow: hidden`, `overflow: auto` ou `overflow: scroll` em um ancestral do elemento pinado pode recortar ou interferir no mecanismo de pin. O `overflow-hidden` do container imediato do vídeo é aceitável, pois ele é descendente do elemento pinado, não um ancestral dele.

Não combine `position: sticky` no mesmo elemento usado por `pin`. Escolha um único sistema: neste projeto, GSAP/ScrollTrigger controla o pin.

## Fluxo de inicialização do vídeo

`video.duration` só é confiável depois de `loadedmetadata`. A inicialização deve esperar esse evento (ou verificar `readyState` quando os metadados já estiverem disponíveis):

```js
function initHeroVideo() {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;

  video.pause();
  video.currentTime = 0;
  // criar tween e ScrollTrigger aqui
}

if (video.readyState >= 1) {
  initHeroVideo();
} else {
  video.addEventListener("loadedmetadata", initHeroVideo, { once: true });
}
```

Isso evita tentar mapear progresso para duração `0`, `NaN` ou indisponível. O vídeo é mantido em pausa: `currentTime` é atualizado pelo scroll, não por `play()`.

## Mapeamento contínuo entre scroll e vídeo

O ScrollTrigger anima um objeto numérico intermediário. Em cada atualização, ele mapeia o progresso entre `0` e `1` para o intervalo real do vídeo:

```js
const playhead = { progress: 0 };

const videoTween = gsap.to(playhead, {
  progress: 1,
  ease: "none",
  paused: true,
  onUpdate: () => {
    video.currentTime = playhead.progress * video.duration;
  },
});
```

`ease: "none"` é obrigatório para relação linear: por exemplo, 37,42% do scroll reservado aponta para 37,42% da duração do vídeo. Não usar marcos discretos como 25%, 50%, 75%.

## Configuração do pin

A configuração atual é:

```js
ScrollTrigger.create({
  trigger: section,
  pin: hero,
  start: "top 76px",
  end: "+=4000",
  scrub: true,
  animation: videoTween,
  invalidateOnRefresh: true,
  anticipatePin: 1,
});
```

Significado dos campos:

- `trigger: section`: determina quando a experiência começa e termina.
- `pin: hero`: fixa o Hero inteiro, não o vídeo isoladamente.
- `start: "top 76px"`: fixa o Hero ao alcançar a área logo abaixo da navbar.
- `end: "+=4000"`: reserva 4.000 pixels de scroll para atravessar o vídeo. É a variável principal de ritmo; não representa a duração em segundos do arquivo.
- `scrub: true`: liga diretamente o progresso da animação à posição do scroll, em ambos os sentidos.
- `animation: videoTween`: conecta o progresso do ScrollTrigger ao `currentTime`.
- `invalidateOnRefresh: true`: recalcula medições em resize/refresh.
- `anticipatePin: 1`: reduz o salto perceptível no instante em que o pin começa.

O `pinSpacing` é deixado no padrão (`true`). Assim, o ScrollTrigger insere o espaço necessário durante o pin e mantém a próxima seção na posição correta. Não crie simultaneamente uma altura manual grande, como `h-[200svh]`, **e** um `pinSpacing` adicional: isso duplica a distância e causa seção gigante ou espaço sobrando ao final.

### Como escolher o `end`

`+=4000` produz uma interação longa e precisa de 4.000 px de scroll antes de liberar a próxima seção. Para uma experiência mais curta, use por exemplo:

```js
end: () => `+=${window.innerHeight}`
```

Ou use um múltiplo da viewport:

```js
end: () => `+=${window.innerHeight * 1.5}`
```

Ao usar uma função, chame `ScrollTrigger.refresh()` após alterações relevantes de layout. O valor adequado é uma escolha de experiência: aumentar o `end` deixa o vídeo mais lento; diminuir o `end` deixa a passagem mais rápida.

## O que não deve coexistir

Para evitar conflito, mantenha apenas um controlador do vídeo e um controlador do pin:

- Não manter um `window.addEventListener("scroll", ...)` que também escreva em `video.currentTime`.
- Não manter um loop `requestAnimationFrame` suavizando ou sobrescrevendo o tempo enquanto o GSAP o controla.
- Não usar `position: sticky` no `.hero-sticky` junto com `pin: hero`.
- Não ter dois `ScrollTrigger.create()` para o mesmo vídeo/Hero.
- Não usar `pinSpacing: false` se não houver uma altura de seção cuidadosamente calculada para substituir o espaço que o GSAP deixaria.

No estado atual do projeto, o ScrollTrigger é o único sistema que controla `currentTime` no Hero.

## Fluidez: código versus arquivo de vídeo

O código fornece progresso contínuo, mas o navegador só consegue exibir frames que consegue buscar e decodificar. Para scrub suave:

- exportar um MP4 compatível com navegadores (H.264 é a opção mais segura);
- usar 30 FPS ou mais, conforme a necessidade visual;
- gerar keyframes muito frequentes, idealmente um keyframe por frame (All-I / intra-frame) para um vídeo de scrub curto;
- manter duração e resolução moderadas;
- usar `preload="auto"`, `muted` e `playsinline`.

Um vídeo com GOP longo pode parecer saltar mesmo quando o `currentTime` recebe valores contínuos, pois o navegador precisa buscar a partir de keyframes distantes. O arquivo atual foi nomeado `video-scroll-keyframes.mp4`, indicando que deve ser preparado especificamente para esse uso.

## Checklist para outro agente

1. Confirmar que GSAP e ScrollTrigger são carregados antes do script da página.
2. Confirmar `gsap.registerPlugin(ScrollTrigger)`.
3. Confirmar que os seletores de `section`, `.hero-sticky` e `#hero-video` existem.
4. Confirmar que o vídeo tem duração finita após `loadedmetadata`.
5. Garantir que somente uma rotina atualiza `video.currentTime`.
6. Garantir que o alvo de `pin` não use `position: sticky`.
7. Garantir que ancestrais do alvo pinado não tenham overflow de scroll/recorte.
8. Ajustar `start` para a altura real da navbar.
9. Ajustar somente `end` para mudar a duração percebida do scrub; não aumentar arbitrariamente a altura do Hero.
10. Testar: scroll pequeno, scroll longo, fim do vídeo, retorno para cima, resize e navegação em mobile.

## Diagnóstico rápido

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| Vídeo muda, mas Hero não fica preso | plugin não carregado/registrado, seletor incorreto ou pin conflitante | revisar ordem dos scripts, `registerPlugin`, `.hero-sticky` e remover `sticky` concorrente |
| Hero gigante ou espaço extra após vídeo | altura manual e pin spacing duplicados | remover `h-[200svh]` e deixar o ScrollTrigger reservar o espaço |
| Hero é coberto pela navbar | `start` usa `top top` | usar `start: "top 76px"` ou a altura real da navbar |
| Vídeo começa em `NaN`/não responde | metadados ainda não carregaram | inicializar em `loadedmetadata` |
| Scrub aos saltos | arquivo com keyframes esparsos ou ainda carregando | reexportar com keyframes frequentes e manter `preload="auto"` |
| Próxima seção aparece antes do fim | `end` curto, trigger/pin errado ou outro controlador interferindo | revisar `end`, alvo de `pin` e duplicação de listeners |
