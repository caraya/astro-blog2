import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const md = `
| Phase | Task Details | Assigned Team | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Database Migration Setup | Backend Infrastructure | [x] Completed |
| **Phase 2** | API Authentication Engine | ~Security Team~ Core Devs | [ ] In Progress |
| ^ | Frontend UI Components | Design & UI Team | [ ] Pending |
| **Phase 3** | Global CDN Deployment | > | DevOps Team |
| ^ | Final End-to-End Testing | > | DevOps Team |
`;

const result = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkExtendedTable)
  .use(remarkRehype, { handlers: extendedTableHandlers })
  .use(rehypeStringify)
  .process(md);

console.log(result.toString());
