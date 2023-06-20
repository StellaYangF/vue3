# Vue3 Handwriting

## Aims

This repository aims to record the learning details of Vue3, personally. So there are unavoidably some misunderstanding or errors to the source code. If you have any questions, feel free to tell me, which will be warmly appreciated.

## Packages

Since the source code is split into several packages. Here are the relative documents of the main packages. See from the following:

- `reactive`
- `runtime-core`
- `runtime-dom`
- `compiler-core`
- `compiler-dom`

## Plugins
These are also called the ecosystems to Vue3.x.

- pinia
- vue-router
- ...
## Preferences

Here are listed of the above packages as well as some usage. To make it more clear, here I scatter them into individual docs.

- [Init](https://github.com/StellaYangF/vue3/blob/main/docs/init.md)
- [Dependencies](https://github.com/StellaYangF/vue3/blob/main/docs/addDependencies.md)
- [reactive](https://github.com/StellaYangF/vue3/blob/main/docs/reactive.md)
- [watch](https://github.com/StellaYangF/vue3/blob/main/docs/watch.md)
- [computed](https://github.com/StellaYangF/vue3/blob/main/docs/computed.md)
- [ref](https://github.com/StellaYangF/vue3/blob/main/docs/ref.md)
- [runtime](https://github.com/StellaYangF/vue3/blob/main/docs/runtime.md)
- [diff](https://github.com/StellaYangF/vue3/blob/main/docs/diff.md)
- [componentRender](https://github.com/StellaYangF/vue3/blob/main/docs/component.md)
- [asyncComponent](https://github.com/StellaYangF/vue3/blob/main/docs/asyncComponent.md)
- [compiler](https://github.com/StellaYangF/vue3/blob/main/docs/compiler.md)

## More

### 位运算符 
[reference](https://www.runoob.com/w3cnote/bit-operation.html)
| 符号 | 描述 | 运算规则 |
| ---- | ---- | --- |
| &	| 与 |	两个位都为1时，结果才为1 |
| \|| 或 |	两个位都为0时，结果才为0 |
| ^	| 异或 |	两个位相同为0，相异为1 |
| ~	| 取反 |	0变1，1变0 |
| <<| 左移 |	各二进位全部左移若干位，高位丢弃，低位补0 |
| >>| 右移 |	各二进位全部右移若干位，对无符号数，高位补0，有符号数，各编译器处理方法不一样，有的补符号位（算术右移），有的补0（逻辑右移） |
## Error Records

1. `dev` 环境下的打包，基于 `esbuild` 快捷高效，便于 `tree-shaking`。打包时，dev.js 文件，引入包名时有两种方式`import or require`。如果使用 `node require` 方式，打包编译时会报如下错误：
 ![typeError](./assets/typeError.jpg)
解决：根据提示可知，package.json 中添加 `type: "module"` 即可。

2. 上述步骤，再次运行，新问题出现：
 ![nodeBuildReferenceError](./assets/nodeBuildReferenceError.jpg)
解决： `__dirname` 属于 `node` 变量，在 `module` 中存在。根据源码，可引用 `dirname` 方法。
 ![dirname](./assets/dirname.jpg)

