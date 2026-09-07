import {
  validate,
  run,
  programme,
  levers,
  type DecisionRecord,
  type Decision,
  type DistrictId,
  type LeverId,
} from './model.ts';

export type GameSave = {
  version: 1;
  record: DecisionRecord;
  draft: Decision[];
  sceneId: string | null;
  lever: LeverId | null;
  accepted: boolean;
  showingFuture: boolean;
};

export const saveKey = (district: DistrictId) =>
  `sociopoly:save:v1:${district}`;

export function readSave(value: string, district: DistrictId): GameSave {
  if (value.length > 20000) throw Error('Save is too large');
  const save: GameSave = JSON.parse(value);
  if (!save || save.version !== 1) throw Error('Unsupported save');
  validate(save.record);
  if (
    (save.record.district ?? 'kampong-glam') !== district ||
    !Array.isArray(save.draft) ||
    save.draft.length > (save.record.v === 1 ? 1 : 3) ||
    (save.sceneId !== null && typeof save.sceneId !== 'string') ||
    (save.lever !== null && !Object.hasOwn(levers, save.lever)) ||
    typeof save.accepted !== 'boolean' ||
    typeof save.showingFuture !== 'boolean' ||
    (save.showingFuture && (!save.record.rounds.length || save.draft.length)) ||
    (save.record.rounds.length === 3 && save.draft.length)
  )
    throw Error('Invalid save');
  run(save.record);
  if (save.draft.length) {
    const preview = {
      ...save.record,
      rounds: [...save.record.rounds, programme(save.draft)],
    };
    validate(preview);
    run(preview);
  }
  return save;
}
