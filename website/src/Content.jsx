import { useMemo } from 'react';
import { Marked } from 'marked';
import DOMPurify from 'dompurify';
const parser = new Marked();
parser.use({renderer:{heading({tokens,depth}){const text=this.parser.parseInline(tokens);const plain=text.replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}]+/gu,'-');return `<h${depth} id="section-${plain}">${text}</h${depth}>`;}}});
export function RichText({content=''}) { const html=useMemo(()=>DOMPurify.sanitize(parser.parse(content),{USE_PROFILES:{html:true},ADD_ATTR:['id']}),[content]);return <div dangerouslySetInnerHTML={{__html:html}}/>; }
