import {LOGO_PATH, LOGO_VIEWBOX} from '../logo';

export default function Logo({size = 32, className = '', title}) {
  return <svg className={className} width={size} height={size} viewBox={LOGO_VIEWBOX} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} focusable="false">
    <path fillRule="evenodd" fill="currentColor" d={LOGO_PATH}/>
  </svg>;
}
