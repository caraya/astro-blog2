import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // console.log('reading-time plugin:', { textOnPage, readingTime });
    data.astro.frontmatter.minutesRead = readingTime.text;
console.log('remark plugin assigned minutesRead:', data.astro.frontmatter.minutesRead);
  };
}