import { layoutCopy } from './layoutCopy'

export function SkipLink() {
  return (
    <a className="skip-link" href="#content">
      {layoutCopy.skipToContent}
    </a>
  )
}
