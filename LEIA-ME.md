# Mundos Sem Noção

Protótipo de luta em formato vertical 9:16, com seleção entre Kley e Samuka, cenários próprios e sprites animados. O mapeamento segue a demo: escolher Kley abre `smkstage` com `tilesetsmk`; escolher Samuka abre `kleystage` com `kleytileset`.

## Jogar no computador

Abra `index.html` em um navegador e escolha um lutador. Use as setas esquerda e direita para andar, `1` para soco, `2` para chute e segure `3` para defesa. No celular, use os controles na tela. A luta tem três rounds com FX, efeitos de clima e voz em inglês anunciando “Round one”, “Round two” e “Final round”.

## Jogar no celular e instalar como PWA

Sirva a pasta `outputs` por HTTPS ou em `localhost` (por exemplo, com `python -m http.server 8000` dentro dela) e abra o endereço no navegador do celular. A instalação é oferecida pelo menu do navegador quando disponível. Depois da primeira visita, os arquivos do jogo ficam em cache para abrir offline.

## Próxima etapa

O próximo passo pode ser refinar as animações de cada golpe e acrescentar um segundo jogador local ou modo versus online.
