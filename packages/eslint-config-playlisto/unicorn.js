import tseslint from 'typescript-eslint';
import unicornPlugin from 'eslint-plugin-unicorn';

export default tseslint.config(
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      ...unicornPlugin.configs.recommended.rules,
      'unicorn/filename-case': ['error', { // PascalCase для компонентов реакта, kebabCase для остальных файлов
        cases: {
          kebabCase: true,
          pascalCase: true,
        },
      }],
      'unicorn/prevent-abbreviations': [0], // Отключает - Проверка читаемости имени переменной. Штука крутая, но мы слишком часто осмысленно их сокращаем, чтобы код лучше читался
      'unicorn/no-null': [0], // Отключает - Всегда писать undefined вместо null. Спорная штука, особенно в контексте реакта
      'unicorn/prefer-node-protocol': [0], // Отключает - У модулей NodeJS должен быть указан протокол
      'unicorn/no-reduce': [0], // Отключает - Запрещает использовать Array#reduce
      'unicorn/no-fn-reference-in-iterator': [0], // Отключает - Запрещает записывать ссылки на функции в тело итераторов типа .map(), .forEach() и пр.
      'unicorn/no-array-for-each': [0], // Отключает - Нельзя использовать Array#forEach
      'unicorn/no-new-array': [0], // Отключает - Нельзя неочевидно объявлять массивы
      'unicorn/no-array-reduce': [0], // Отключает - Можно использовать reduce только в простых операциях
      'unicorn/prefer-ternary': [0], // Отключает - Контролирует чистоту использования условий
      'unicorn/numeric-separators-style': [0], // Отключает - Задает стиль разделения частей чисел
      'unicorn/prefer-global-this': [0], // Отключает - Использовать только globalThis вместо глобальных переменных
      'unicorn/no-document-cookie': [0], // Отключает - Использовать вместо document.cookie Cookie Store API. Еще очень новая штука
      'unicorn/no-nested-ternary': [0], // Отключает - Запрещает использовать вложенные тернарные операторы
      'unicorn/prefer-code-point': [0], // Отключает - Запрещает использовать коды символов вместо символов
    },
  },
);
