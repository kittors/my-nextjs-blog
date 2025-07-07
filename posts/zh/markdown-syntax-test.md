---
title: 'Markdown 语法测试'
postId: 'Markdown-Syntax-Test'
date: '2025-07-06'
author: '全栈工程师'
description: '一个用于测试基本 Markdown 语法的文档。'
tags: ['Markdown', '测试', '语法']
---

# 欢迎来到 Markdown 语法测试文档！

本文档旨在测试各种基本的 Markdown 语法元素。

---

## 标题

### 这是 H3 标题

#### 这是 H4 标题

##### 这是 H5 标题

###### 这是 H6 标题

---

## 文本样式

**这是粗体文本**

_这是斜体文本_

**_这是粗体加斜体文本_**

~~这是删除线文本~~

<u>这是下划线文本 (HTML 标签)</u>

---

## 列表

### 无序列表

- 列表项 1
- 列表项 2
  - 嵌套列表项 2.1
    - 更深层次嵌套 2.1.1
- 列表项 3

### 有序列表

1.  第一个项目
2.  第二个项目
    1.  嵌套的第一个项目
    2.  嵌套的第二个项目
3.  第三个项目

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务

---

## 链接与图片

这是一个[普通链接](https://www.google.com)。

这是一个[带有标题的链接](https://www.example.com '示例网站')。

### 图片

![测试图片](https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)
_图片说明：这是一张美丽的风景照片。_

![测试图片](https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg)

![测试图片](https://images.pexels.com/photos/1271620/pexels-photo-1271620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

![测试图片](https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

---

## 代码块

### 行内代码

这是一个 `行内代码` 示例。

### 代码块

```javascript
// JavaScript 代码示例
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet('World');
```

```python
# Python 代码示例
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

---

## 引用块

> 这是一个引用块。 它可能包含多行文字。
>
> > 这是一个嵌套的引用块。

---

## 表格

| 表头 1 | 表头 2 | 表头 3 |
| ------ | ------ | ------ |
| 左对齐 | 居中   | 右对齐 |
| 内容 A | 内容 B | 内容 C |
| 123    | 456    | 789    |

---

## 分隔线

---

这是一个由三个或更多连字符组成的水平线。

---

这是一个由三个或更多星号组成的水平线。

---

这是一个由三个或更多下划线组成的水平线。

---

## 数学公式 (通过 KaTeX 或 MathJax 渲染)

### 行内公式

勾股定理：$$a^2+b^2=c^2$$

### 块级公式

$$E=mc^2 $$
$$\sum\_{i=1}^{n} i = \frac{n(n+1)}{2}$$

---

## 其他

### 注释 (不显示在渲染后的文档中)

<!-- 这是一个 HTML 注释，它在渲染后的 Markdown 中不会显示 -->

这是一个正常显示的段落。

---

感谢您阅读这个 Markdown 语法测试文档！
