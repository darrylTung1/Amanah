import type { DistrictId } from '@/engine/model';
import { districtNames } from '@/engine/districts';
import BrandMark from '@/components/BrandMark';
export default function Header({
  demo = false,
  district = 'kampong-glam',
}: {
  demo?: boolean;
  district?: DistrictId;
}) {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <BrandMark />Amanah
      </a>
      <div className="toplinks">
        <span className="muted small">Voices of the next hundred years</span>
        <span className="tag">
          {demo ? 'Rehearsal · scripted council' : districtNames[district]}
        </span>
      </div>
    </header>
  );
}
