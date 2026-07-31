"""
Extrai o texto de uma tabela Fontana preservando a ORDEM VISUAL da linha.

O conector do Google Drive entrega o texto linha a linha, e o parser inteiro
assume essa ordem. Os extratores locais não:

  - MarkItDown agrupa por COLUNA (todas as unidades, depois todos os boxes…)
  - PyMuPDF `get_text("text")` agrupa por unidade, mas com as colunas fora de
    ordem: unidade, dorm, box, CUB, total, …, entrada, parcela, reforço, área

Aqui as palavras vêm COM COORDENADAS. Agrupando por Y e ordenando por X,
a linha sai na ordem em que o olho lê — que é a mesma do conector.

Uso: python3 scripts/extrair-tabela.py arquivo.pdf > arquivo.txt
"""
import re
import sys

import fitz

# Duas palavras na mesma linha visual raramente diferem mais que isto no Y.
# Folga suficiente para célula com duas linhas de texto, apertada o bastante
# para não juntar linhas vizinhas da tabela.
TOLERANCIA_Y = 3.0
# Quão perto um fragmento precisa estar da linha de dados para pertencer a ela.
# 6 pontos, e o valor importa: a 14 o cabeçalho das tabelas Mar di era sugado
# para dentro da primeira unidade e as quatro voltavam com 100% rejeitadas. O
# fragmento de uma célula fica a menos de 4 pontos da linha; o cabeçalho, a
# ~11. A janela útil vai de 4 a 10 — em 12 já quebra.
LIMITE_Y = float(__import__('os').environ.get('LIMITE_Y', '6.0'))


def linhas_da_pagina(pagina):
    palavras = pagina.get_text("words")  # (x0, y0, x1, y1, palavra, ...)
    if not palavras:
        return []
    linhas = []
    for x0, y0, _x1, _y1, palavra, *_ in sorted(palavras, key=lambda w: (round(w[1], 1), w[0])):
        for linha in linhas:
            if abs(linha["y"] - y0) <= TOLERANCIA_Y:
                linha["palavras"].append((x0, palavra))
                break
        else:
            linhas.append({"y": y0, "palavras": [(x0, palavra)]})
    linhas.sort(key=lambda l: l["y"])

    # Costura de FRAGMENTOS, no nível das PALAVRAS.
    #
    # Célula com texto em várias linhas visuais é fatiada pelo agrupamento por
    # Y. Casos reais: o box "25 e 26S - 1º Pav/DEP 25" do Mar di Arienzo 1503, e
    # a palavra "(Diferenciado)" do Gran Michel, que partiu ao meio e vazou o
    # "o)" para a unidade seguinte.
    #
    # Concatenar o fragmento no começo ou no fim da linha NÃO resolve: o box
    # precisa cair na COLUNA dele, entre os dormitórios e as áreas. Por isso a
    # absorção é de palavras — devolvidas ao conjunto da linha de dados e
    # reordenadas por X, que é justamente a informação que diz onde cada
    # pedaço estava na página.
    #
    # Fragmento = linha SEM valor monetário. Só é absorvida se estiver a menos
    # de LIMITE_Y da linha de dados mais próxima — é essa distância que impede
    # o cabeçalho, que também não tem valores, de ser sugado para dentro da
    # primeira unidade.
    def palavras_ordenadas(l):
        return sorted(l["palavras"], key=lambda p: p[0])

    def texto(l):
        return " ".join(t for _, t in palavras_ordenadas(l))

    dados = [i for i, l in enumerate(linhas) if re.search(r"\d[\d.]*,\d{2}", texto(l))]
    if not dados:
        return [texto(l) for l in linhas]

    # Cada fragmento entra como BLOCO, na posição que o X do seu primeiro termo
    # indica — e mantendo a ordem interna. Misturar as palavras dos fragmentos
    # com as da linha de dados num único sort por X as intercala: o box
    # "25 e 26S - 1º" mais o "Pav/DEP 25" viravam "25 Pav/DEP e 26S - 25 1º".
    anexos = {i: [] for i in dados}
    absorvidas = set()
    for i, l in enumerate(linhas):
        if i in dados:
            continue
        alvo = min(dados, key=lambda d: abs(linhas[d]["y"] - l["y"]))
        if abs(linhas[alvo]["y"] - l["y"]) <= LIMITE_Y:
            anexos[alvo].append(l)
            absorvidas.add(i)

    saida = []
    for i, l in enumerate(linhas):
        if i in absorvidas:
            continue
        if i not in dados or not anexos[i]:
            saida.append(texto(l))
            continue
        # Ordem entre fragmentos: de cima para baixo na página.
        # As posições são calculadas contra a linha ORIGINAL. Calcular contra a
        # linha já modificada faz o segundo fragmento entrar DENTRO do
        # primeiro — "25 e 26S - 1º" + "Pav/DEP 25" virava
        # "25 Pav/DEP 25 e 26S - 1º".
        spine = palavras_ordenadas(l)
        blocos = sorted(anexos[i], key=lambda f: f["y"])
        posicao = {}
        for f in blocos:
            termos = palavras_ordenadas(f)
            k = next((n for n, (px, _) in enumerate(spine) if px > termos[0][0]), len(spine))
            posicao.setdefault(k, []).append(termos)

        montado = []
        for n in range(len(spine) + 1):
            for termos in posicao.get(n, []):
                montado.extend(termos)
            if n < len(spine):
                montado.append(spine[n])
        saida.append(" ".join(t for _, t in montado))
    return saida


def main():
    doc = fitz.open(sys.argv[1])
    saida = []
    for pagina in doc:
        saida.extend(linhas_da_pagina(pagina))
    print("\n".join(saida))


if __name__ == "__main__":
    main()
