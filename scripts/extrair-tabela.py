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
import sys
import fitz

# Duas palavras na mesma linha visual raramente diferem mais que isto no Y.
# Folga suficiente para célula com duas linhas de texto, apertada o bastante
# para não juntar linhas vizinhas da tabela.
TOLERANCIA_Y = 3.0


def linhas_da_pagina(pagina):
    palavras = pagina.get_text("words")  # (x0, y0, x1, y1, palavra, ...)
    if not palavras:
        return []
    linhas = []
    for x0, y0, _x1, _y1, texto, *_ in sorted(palavras, key=lambda w: (round(w[1], 1), w[0])):
        for linha in linhas:
            if abs(linha["y"] - y0) <= TOLERANCIA_Y:
                linha["palavras"].append((x0, texto))
                break
        else:
            linhas.append({"y": y0, "palavras": [(x0, texto)]})
    linhas.sort(key=lambda l: l["y"])
    return [" ".join(t for _, t in sorted(l["palavras"], key=lambda p: p[0])) for l in linhas]


def main():
    doc = fitz.open(sys.argv[1])
    saida = []
    for pagina in doc:
        saida.extend(linhas_da_pagina(pagina))
    print("\n".join(saida))


if __name__ == "__main__":
    main()
