import { motion, useReducedMotion, type Variants } from 'motion/react'
import { events, join, site } from '../../../data/content'
import { cx } from '../../../lib/cx'
import { EASE_OUT, VIEWPORT } from '../../../lib/motion'
import { Logo } from '../../brand/Logo'
import { QrCode } from '../../ui/QrCode'
import { Button } from '../../ui/Button'
import { Magnetic } from '../../ui/Magnetic'
import { Tilt } from '../../ui/Tilt'

type MembershipStubProps = { className?: string }

const DEAL_DUR = 0.8
const QR_DELAY = 0.55

/** The primary button links to the members' group when an invite exists, otherwise to the first event's registration. */
export function MembershipStub({ className }: MembershipStubProps) {
  const reduce = useReducedMotion() ?? false
  const group = site.links.joinGroup
  const registerUrl = events[0]?.registerUrl
  const primary = group
    ? { href: group, label: join.stub.ctaGroup }
    : registerUrl
      ? { href: registerUrl, label: join.stub.ctaRegister }
      : null

  const deal: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: 56, rotate: 4 },
        show: { opacity: 1, x: 0, rotate: 0, transition: { duration: DEAL_DUR, ease: EASE_OUT } },
      }

  return (
    <motion.div
      className={cx('member-stub__deal', className)}
      variants={deal}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={VIEWPORT}
    >
      <div className="member-stub__rest">
        <Tilt max={4} foil className="member-stub__tilt">
          <div className="ticket ticket--sm member-stub" role="group" aria-labelledby="member-stub-title">
            <div className="ticket__main member-stub__main">
              <div className="member-stub__head">
                <p className="t-label member-stub__label">{join.stub.label}</p>
                <Logo size={40} title="" className="member-stub__mark" />
              </div>
              <h3 id="member-stub-title" className="t-h2 member-stub__title">
                {join.stub.title}
              </h3>
              <p className="t-small member-stub__line">{join.stub.line}</p>

              {primary && (
                <Magnetic strength={0.15} className="member-stub__magnet">
                  <Button variant="primary" full external href={primary.href} className="member-stub__cta">
                    {primary.label}
                  </Button>
                </Magnetic>
              )}

              <div className="member-stub__follow">
                <Button variant="ghost" external href={site.links.linkedin}>
                  {join.stub.followLinkedin}
                </Button>
                <Button variant="ghost" external href={site.links.instagram}>
                  {join.stub.followInstagram}
                </Button>
              </div>
            </div>

            <div className="ticket__stub member-stub__strip">
              {primary && (
                <QrCode
                  value={primary.href}
                  label={group ? 'QR code: join the GSX Gwalior members group' : `QR code: ${primary.label}`}
                  delay={QR_DELAY}
                  className="member-stub__qr"
                />
              )}
              <span className="member-stub__strip-text">
                <span className="t-meta member-stub__scan">{group ? join.stub.qrGroup : join.stub.qrRegister}</span>
                <span className="t-meta member-stub__serial">{join.stub.serial}</span>
              </span>
            </div>
          </div>
        </Tilt>
      </div>
    </motion.div>
  )
}
