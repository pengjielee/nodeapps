module.exports = {
  arrowParens: 'avoid', //在箭头函数参数周围包含圆括号，默认"always"；avoid:x => x，always:(x) => x
  bracketSpacing: true, //是否在括号之间打印空格，默认true；true:{ foo: bar }，false:{foo:bar}
  printWidth: 100, //每行的长度，默认80；
  semi: true, //是否在语句的末尾打印分号，默认true；
  singleQuote: true, //使用单引号而不是双引号，默认false；
  tabWidth: 2, //指定Tab的空格数，默认2；
  trailingComma: 'all', //多行时，尽可能在后面打印逗号，默认"es5"；
  jsxSingleQuote: false, //在JSX中使用单引号而不是双引号，默认false；
  jsxBracketSameLine: false, //将多行JSX元素的>放在最后一行的末尾，而不是单独放在下一行(不应用于自闭元素)，默认false
  useTabs: false, //是否使用Tab，默认false
};
