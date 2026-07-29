import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const md = `
| header1          | header2          |
| ---------------- | ---------------- |
| DevOps Team ||
`;

const result = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkExtendedTable, { colspanWithEmptyCell: true })
  .use(remarkRehype, { handlers: extendedTableHandlers })
  .use(rehypeStringify)
  .process(md);

console.log(result.toString());
