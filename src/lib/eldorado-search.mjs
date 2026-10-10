import { accounts, source } from './eldorado-data.mjs';
export const normalize = (s) => s.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
export function paragraphs(text, account_id) {
    const hits = [];
    let line = 1, previous = 0;
    const start = text.match(/\*\*\* START OF[^\n]*\n/);
    const end = text.match(/\*\*\* END OF/);
    let cursor = 0;
    for (const chunk of text.split(/\n[^\S\n]*\n/)) {
        const base = text.indexOf(chunk, cursor);
        cursor = base + chunk.length;
        const leading = chunk.search(/\S/);
        if (leading < 0)
            continue;
        const char_start = base + leading, excerpt = chunk.trim();
        line += (text.slice(previous, char_start).match(/\n/g) || []).length;
        previous = char_start;
        if (start && char_start < start.index + start[0].length || end && char_start >= end.index)
            continue;
        hits.push({ id: `${account_id}:${char_start}`, account_id, excerpt, line_start: line, char_start, char_end: char_start + excerpt.length });
    }
    return hits;
}
let index;
export function searchRecords(records, catalog, query, book = '', offset = 0) {
    return queryIndex(records.map(hit => ({ hit, text: normalize(hit.excerpt) })), catalog, query, book, offset);
}
function queryIndex(records, catalog, query, book, offset) {
    const q = normalize(query);
    const terms = q.split(' ').filter(Boolean);
    const books = catalog.filter(a => (!book || a.id === book) && terms.every(t => normalize(`${a.author} ${a.title}`).includes(t)));
    const hits = terms.length ? records.filter(r => (!book || r.hit.account_id === book) && terms.every(t => r.text.includes(t))) : [];
    return { books, hits: hits.slice(offset, offset + 20).map(r => r.hit), total: hits.length, offset };
}
export function search(query, book = '', offset = 0) {
    index ??= accounts.flatMap(a => paragraphs(source(a.id), a.id).map(hit => ({ hit, text: normalize(hit.excerpt) })));
    return queryIndex(index, accounts, query, book, offset);
}
