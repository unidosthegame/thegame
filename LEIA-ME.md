# Unidos Sem Noção

Protótipo de fan game de luta em formato vertical 9:16, feito para celular e instalação como PWA. O menu principal leva à seleção de personagens, com retrato e palco correspondente. O chefão aparece bloqueado na seleção e entra como sétimo adversário.

## Elenco e torneio

O pacote atual tem 14 personagens selecionáveis: Augustão, Calvo, Cheng, Cunha, Danilo, Flavinha, Kley, Leo, Maicon, Moraes, Raphael, Samuka, Vitão e Wagnão. Cada personagem tem sua própria arte, retrato e stage; cada luta acontece no palco do rival. Em cada campanha, o jogo sorteia seis rivais sem repetir; o sétimo confronto é contra o Chefão, em sua arena. Cada confronto é melhor de três rounds.

O ZIP original foi convertido para WebP para reduzir o download no celular. Retratos e cenas são carregados quando necessários e ficam no cache do service worker para as próximas partidas.

## Controles

- **◀ / ▶**: movimentação.
- **Soco**: golpe rápido.
- **Chute**: golpe mais forte.
- **Defesa**: segure para reduzir dano.
- No teclado: setas ou `A`/`D` para mover; `1`/`J` para soco; `2`/`K` para chute; `3`/`L` para defesa; `P` ou `Esc` pausa.

O anúncio de voz fala “Round one”, “Round two” e “Final round”. Som e voz podem depender do suporte do navegador e de uma interação inicial na tela.

## Abrir localmente e instalar

O service worker precisa de HTTPS ou `localhost`. Para servir a pasta:

```powershell
cd outputs
python -m http.server 8000
```

Abra `http://localhost:8000` no computador ou sirva os mesmos arquivos por HTTPS para instalar no celular pelo menu do navegador. O repositório pode ser publicado no GitHub Pages apontando para a pasta `outputs` ou copiando o conteúdo dela para a raiz publicada.

## Arquivos

- `index.html`, `style.css`, `game.js`: menu, seleção, arena e controles.
- `assets/roster/roster-data.js`: dados do elenco e os caminhos das artes.
- `assets/roster/<personagem>/`: sprites, retratos, cenários, parallax e NPCs otimizados.
- `sw.js`: arquivos principais em cache e cache sob demanda das artes.
