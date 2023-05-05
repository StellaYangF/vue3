export function compile(template) {
  // 1. 将模板转化成 ast 模板
  const ast = baseParse(template)
  // 2. 对 ast 语法树进行转化
  transform(ast)
  // 生成代码
  return generate(ast)
}

// 准备语法树相关type
export const enum NodeTypes {
  ROOT,
  ELEMENT,
  TEXT,
  COMMENT,
  SIMPLE_EXPRESSION,
  INTERPOLATION, // template expression
  ATTRIBUTE,
  DIRECTIVE,
  COMPOUND_EXPRESSION,
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL,
  VNODE_CALL,
  JS_CALL_EXPRESSION
}