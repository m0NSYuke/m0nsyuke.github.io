import {imageSources} from '../lib/site';

// Responsive AVIF/WebP image built from the variants in public/assets/img.
export default function Picture({file, fallback, alt = '', sizes, width, height, priority = false, className = ''}) {
  const source = imageSources(file, fallback);
  if (!source) return null;
  return <picture className={className}>
    <source type="image/avif" srcSet={source.avif} sizes={sizes}/>
    <source type="image/webp" srcSet={source.webp} sizes={sizes}/>
    <img src={source.src} alt={alt} width={width} height={height || (width ? Math.round(width / source.ratio) : undefined)} sizes={sizes} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} fetchPriority={priority ? 'high' : undefined}/>
  </picture>;
}
