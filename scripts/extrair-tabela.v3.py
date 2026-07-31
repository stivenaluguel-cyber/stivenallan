"""
Extrai tabela preservando a ordem visual, agrupando por CAIXA DE TEXTO.

A v1 (em produção) reagrupa PALAVRAS por coordenada Y. Funciona nas 13 tabelas
da Fontana, mas fatia célula que ocupa várias linhas visuais — o box
"25 e 26S - 1º Pav/DEP 25" do Mar di Arienzo 1503 vira três linhas soltas.

A v2 tentou costurar fragmentos por proximidade e QUEBROU quatro tabelas: nas
Mar di, o cabeçalho fica a menos de 14 pontos da primeira unidade e foi sugado
para dentro dela. Critério de distância não serve.

Aqui o agrupamento vem do próprio PDF: `get_text("dict")` devolve BLOCOS, e uma
célula multilinha é UM bloco. Cabeçalho é outro. Não há limiar escolhido por
mim — só a estrutura que o gerador do PDF já registrou.
"""
import sys

import fitz

# Blocos na mesma faixa vertical formam uma linha da tabela. Mais folgado que a
# tolerância de palavra da v1 porque aqui se comparam caixas, não baselines.
TOLERANCIA_Y = 6.0


def texto_do_bloco(bloco):
    partes = []
    for linha in bloco.get("lines", []):
        for span in linha.get("spans", []):
            t = span.get("text", "").strip()
            if t:
                partes.append(t)
    return " ".join(partes)


def linhas_da_pagina(pagina):
    caixas = []
    for bloco in pagina.get_text("dict").get("blocks", []):
        if bloco.get("type") != 0:
            continue
        t = texto_do_bloco(bloco)
        if not t:
            continue
        x0, y0, _x1, _y1 = bloco["bbox"]
        caixas.append({"x": x0, "y": y0, "txt": t})

    linhas = []
    for c in sorted(caixas, key=lambda c: (round(c["y"], 1), c["x"])):
        for linha in linhas:
            if abs(linha["y"] - c["y"]) <= TOLERANCIA_Y:
                linha["caixas"].append((c["x"], c["txt"]))
                break
        else:
            linhas.append({"y": c["y"], "caixas": [(c["x"], c["txt"])]})

    linhas.sort(key=lambda l: l["y"])
    return [" ".join(t for _, t in sorted(l["caixas"], key=lambda p: p[0])) for l in linhas]


def main():
    doc = fitz.open(sys.argv[1])
    saida = []
    for pagina in doc:
        saida.extend(linhas_da_pagina(pagina))
    print("\n".join(saida))


if __name__ == "__main__":
    main()
