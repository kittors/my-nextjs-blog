---
title: 'Markdown Syntax Test'
postId: 'Markdown-Syntax-Test'
date: '2025-07-06'
author: 'Full-Stack-Ingenieur'
description: 'Ein Dokument zum Testen grundlegender Markdown-Syntax.'
tags: ['Markdown', 'Test', 'Syntax']
---

# Willkommen zum Markdown-Syntax-Testdokument!

Dieses Dokument dient dazu, verschiedene grundlegende Markdown-Syntaxelemente zu testen.

---

## Überschriften

### Dies ist eine H3-Überschrift

#### Dies ist eine H4-Überschrift

##### Dies ist eine H5-Überschrift

###### Dies ist eine H6-Überschrift

---

## Textformatierung

**Dies ist fetter Text**

_Dies ist kursiver Text_

**_Dies ist fetter und kursiver Text_**

~~Dies ist durchgestrichener Text~~

<u>Dies ist unterstrichener Text (HTML-Tag)</u>

---

## Listen

### Ungeordnete Liste

- Listenpunkt 1
- Listenpunkt 2
  - Verschachtelter Listenpunkt 2.1
    - Tiefer verschachtelt 2.1.1
- Listenpunkt 3

### Geordnete Liste

1.  Erster Punkt
2.  Zweiter Punkt
    1.  Verschachtelter erster Punkt
    2.  Verschachtelter zweiter Punkt
3.  Dritter Punkt

### Aufgabenliste

- [x] Abgeschlossene Aufgabe
- [ ] Nicht abgeschlossene Aufgabe
- [x] Eine weitere abgeschlossene Aufgabe

---

## Links und Bilder

Dies ist ein [normaler Link](https://www.google.com).

Dies ist ein [Link mit Titel](https://www.example.com 'Beispiel-Website').

### Bilder

![Testbild](https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)
_Bildunterschrift: Dies ist ein wunderschönes Landschaftsfoto._

![Testbild](https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg)

![Testbild](https://images.pexels.com/photos/1271620/pexels-photo-1271620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

![Testbild](https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

---

## Codeblöcke

### Inline-Code

Dies ist ein Beispiel für `Inline-Code`.

### Codeblöcke

```javascript
// JavaScript-Codebeispiel
function greet(name) {
  console.log(`Hallo, ${name}!`);
}
greet('Welt');
```

```python
# Python-Codebeispiel
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

---

## Zitatblöcke

> Dies ist ein Zitatblock. Er kann mehrere Zeilen Text enthalten.
>
> > Dies ist ein verschachtelter Zitatblock.

---

## Tabellen

| Spaltenkopf 1 | Spaltenkopf 2 | Spaltenkopf 3 |
| ------------- | ------------- | ------------- |
| Linksbündig   | Zentriert     | Rechtsbündig  |
| Inhalt A      | Inhalt B      | Inhalt C      |
| 123           | 456           | 789           |

---

## Trennlinien

---

Dies ist eine horizontale Linie, die aus drei oder mehr Bindestrichen besteht.

---

Dies ist eine horizontale Linie, die aus drei oder mehr Sternchen besteht.

---

Dies ist eine horizontale Linie, die aus drei oder mehr Unterstrichen besteht.

---

## Mathematische Formeln (gerendert mit KaTeX oder MathJax)

### Inline-Formel

Pythagoräischer Satz:

$$a^2+b^2=c^2$$

### Blockformel

$$E=mc^2 $$

$$\sum\_{i=1}^{n} i = \frac{n(n+1)}{2}$$

---

## Sonstiges

### Kommentare (werden im gerenderten Dokument nicht angezeigt)

Dies ist ein normal angezeigter Absatz.

---

Vielen Dank, dass Sie dieses Markdown-Syntax-Testdokument gelesen haben!
