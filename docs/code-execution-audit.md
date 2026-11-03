# 内置代码执行检查（2026-11-02）

## 检查范围与结论

在本地网页的真实浏览器运行模式逐项检查 30 个内置示例、5 个默认示例、14 道编程题参考实现、3 类标准输入读取，共 52 项。33 项纯文本输出逐项与预期核对；4 个 HTML 示例检查实际预览；默认 HTML 点击计数从 0 变为 1；14 道题的 47 条断言均通过。不是模拟编译或仅检查代码字符串。

编程题提交在独立测试地址 4184 完成，未提交到用户的 4180 学习记录。默认/参考示例在独立测试标签页验证，没有开启麦克风、摄像头或调用面试 AI。

## 内置示例结果

| 类别 | 示例 ID | 预期输出 / 可见结果 |
| --- | --- | --- |
| C | c-io、c-file | Hello, Forma! |
| C | c-int | 2147483647（本次 WASI 目标） |
| C | c-if | Eligible |
| C | c-loop | 0、1、2 |
| C | c-pointer | 20 |
| C | c-heap | 1 |
| C | c-struct | id=1 active=1 |
| C++ | cpp-basics | 0 |
| C++ | cpp-class | 1 0 |
| C++ | cpp-raii | Saved |
| C++ | cpp-virtual | 1 |
| C++ | cpp-vector | 1 2 3 |
| C++ | cpp-map | Sam |
| C++ | cpp-smart | 42 1 |
| Python | py-basics | True、False |
| Python | py-containers | {1: 'done', 2: 'waiting'} |
| Python | py-functions | ['first']、['first', 'second']，演示可变默认参数 |
| Python | py-comprehension | [4, 16] |
| Python | py-class | ['One idea']，演示共享类属性 |
| Python | py-errors | Enter a whole number.（异常已被示例捕获） |
| JavaScript | js-values | Sam、false |
| JavaScript | js-scope | ready（本次修复后复测） |
| JavaScript | js-arrays | [4,6] |
| JavaScript | js-async | ready |
| JavaScript | js-dom | DOM examples need a document.（该文本示例不操作 DOM；交互在 HTML 预览中验证） |
| HTML | html-structure | Study notes、One useful idea. |
| HTML | html-flex | Read、Practise |
| HTML | html-grid | Plan、Practice |
| HTML | html-form | Email 输入框及 Join 按钮 |

默认程序：C 输出 Count: 3；C++ 输出 2 4 6；Python 输出 Hello Forma；JS 输出 [2,4,6]；HTML 的 Add one 点击后 Count 变为 1。

输入检查：scanf、cin、input() 均读取输入 5 并输出平方 25。

编程题参考实现：sum-even、reverse-words、chunk、average、fizzbuzz、slugify、json-lines、unique、price、access、form、group、retry、summary，全通过。

## 本次修复与防回归

- 自由编程的 js-scope 曾误用课堂故障起始代码，导致 status is not defined。现在加载该课可运行的参考解答。课堂的找错练习仍保留，并明确标注其初始代码故意报错。
- 只对浏览器中精确匹配旧版内置 RAII 故障模板的草稿补全头文件；不匹配的用户修改不覆盖。
- 新增全体 C/C++ 示例必需头文件检查、5 个 JS 示例真实执行及精确输出检查、30 个示例完整性检查、旧模板精准修复测试。
- 之前修复的 RAII 头文件和 WASI 临时目录已经过本轮真实执行复查。

## 边界

这不是“任意用户代码都不会报错”的保证。题目的起始代码故意留有待完成部分，不能伪造通过；错误输入、语法错误、死循环仍应报告真实错误。网络、资源配额、设备内存和浏览器差异仍可能影响运行。

本轮覆盖浏览器默认模式；远程 Wandbox 备用接口有既有验证测试，但未把全部示例再次上传到第三方。HTML 检查不是完整的视觉/可访问性/表单提交审计。面试服务、付费模型及各个生产部署环境不在本轮真实调用范围内。没有发布或推送。
