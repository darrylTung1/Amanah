'use client';
import { encode, type DistrictId } from '@/engine/model';
import { districtNames } from '@/engine/districts';

export default function RestartDistrict({ district }: { district: DistrictId }) {
  return (
    <button
      type="button"
      className="text-action"
      onClick={() => {
        if (!window.confirm(`Restart ${districtNames[district]} from 2026? This replaces your saved progress for this district. Other districts will keep their progress.`)) return;
        const fresh = encode({ v: 3, district, weights: [3, 3, 2, 2], rounds: [] });
        window.location.assign(`/?district=${district}&d=${fresh}`);
      }}
    >
      Restart district
    </button>
  );
}
