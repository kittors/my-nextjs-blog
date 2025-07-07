---
title: 'Markdown Syntax Test'
postId: 'Markdown-Syntax-Test'
date: '2025-07-06'
author: 'Full-Stack Engineer'
description: 'A document for testing basic Markdown syntax.'
tags: ['Markdown', 'Test', 'Syntax']
---

# Welcome to the Markdown Syntax Test Document!

This document is designed to test various basic Markdown syntax elements.

---

## Headings

### This is an H3 Heading

#### This is an H4 Heading

##### This is an H5 Heading

###### This is an H6 Heading

---

## Text Styles

**This is bold text**

_This is italic text_

**_This is bold and italic text_**

~~This is strikethrough text~~

<u>This is underlined text (HTML Tag)</u>

---

## Lists

### Unordered List

- List item 1
- List item 2
  - Nested list item 2.1
    - Deeper nested 2.1.1
- List item 3

### Ordered List

1.  First item
2.  Second item
    1.  Nested first item
    2.  Nested second item
3.  Third item

### Task List

- [x] Completed task
- [ ] Uncompleted task
- [x] Another completed task

---

## Links and Images

This is a [regular link](https://www.google.com).

This is a [link with a title](https://www.example.com 'Example Website').

### Images

![Test Image](https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)
_Image Caption: This is a beautiful landscape photo._

![Test Image](https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg)

![Test Image](https://images.pexels.com/photos/1271620/pexels-photo-1271620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

![Test Image](https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

---

## Code Blocks

### Inline Code

This is an `inline code` example.

### Code Blocks

```javascript
// JavaScript code example
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet('World');
```

```python
# Python code example
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

---

## Blockquotes

> This is a blockquote. It can contain multiple lines of text.
>
> > This is a nested blockquote.

---

## Tables

| Header 1     | Header 2  | Header 3      |
| ------------ | --------- | ------------- |
| Left Aligned | Centered  | Right Aligned |
| Content A    | Content B | Content C     |
| 123          | 456       | 789           |

---

## Horizontal Rules

---

This is a horizontal rule made of three or more hyphens.

---

This is a horizontal rule made of three or more asterisks.

---

This is a horizontal rule made of three or more underscores.

---

## Math Formulas (rendered via KaTeX or MathJax)

### Inline Formula

Pythagorean theorem:

$$a^2+b^2=c^2$$

### Block Formula

$$E=mc^2 $$
$$\sum\_{i=1}^{n} i = \frac{n(n+1)}{2}$$

---

## Other

### Comments (not displayed in the rendered document)

This is a normal paragraph that will be displayed.

---

Thank you for reading this Markdown syntax test document!
