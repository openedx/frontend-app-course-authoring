import {
  normalizeProblemIds,
  normalizeJumpBackField,
  resolveQuizItemJumpBack,
  parseJumpBackField,
  expandTimemapToQuizItems,
  buildTimemapFromQuizItems,
  buildJumpBackFromQuizItems,
  GLOBAL_JUMP_BACK_KEY,
} from './inVideoQuiz';

describe('inVideoQuiz timemap helpers', () => {
  describe('normalizeProblemIds', () => {
    it('returns array for array input', () => {
      expect(normalizeProblemIds(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('wraps string in array', () => {
      expect(normalizeProblemIds('problem-1')).toEqual(['problem-1']);
    });

    it('returns empty array for falsy input', () => {
      expect(normalizeProblemIds('')).toEqual([]);
      expect(normalizeProblemIds(null)).toEqual([]);
    });
  });

  describe('expandTimemapToQuizItems', () => {
    it('expands legacy single-problem timemap', () => {
      const items = expandTimemapToQuizItems({ '1:30': 'problem-1' }, { '1:30': '0:45' });
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        problemId: 'problem-1',
        time: '1:30',
        jumpBack: '0:45',
      });
    });

    it('expands multi-problem timemap into separate rows', () => {
      const items = expandTimemapToQuizItems({
        '1:30': ['problem-1', 'problem-2'],
      });
      expect(items).toHaveLength(2);
      expect(items[0].problemId).toBe('problem-1');
      expect(items[1].problemId).toBe('problem-2');
      expect(items[0].time).toBe('1:30');
      expect(items[1].time).toBe('1:30');
    });

    it('assigns per-problem jump back for problems at the same timestamp', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        { 'problem-1': '1:29', 'problem-2': '1:35' },
      );
      expect(items).toHaveLength(2);
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:35');
    });

    it('falls back to legacy time-keyed jump back', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': 'problem-1' },
        { '1:30': '1:00' },
      );
      expect(items[0].jumpBack).toBe('1:00');
    });

    it('applies legacy global jump back string to every problem row', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        '1:29',
      );
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:29');
    });
  });

  describe('normalizeJumpBackField', () => {
    it('wraps legacy global MM:SS string', () => {
      expect(normalizeJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('returns object maps unchanged', () => {
      expect(normalizeJumpBackField({ 'problem-1': '1:29' })).toEqual({
        'problem-1': '1:29',
      });
    });
  });

  describe('resolveQuizItemJumpBack', () => {
    it('prefers per-problem value over time and default', () => {
      const map = { 'problem-1': '1:29', '1:30': '1:00', [GLOBAL_JUMP_BACK_KEY]: '0:30' };
      expect(resolveQuizItemJumpBack(map, 'problem-1', '1:30')).toBe('1:29');
    });

    it('falls back to time-keyed legacy value', () => {
      expect(resolveQuizItemJumpBack({ '1:30': '1:00' }, 'problem-1', '1:30')).toBe('1:00');
    });

    it('falls back to global default', () => {
      expect(resolveQuizItemJumpBack({ [GLOBAL_JUMP_BACK_KEY]: '0:45' }, 'problem-1', '1:30')).toBe('0:45');
    });
  });

  describe('parseJumpBackField', () => {
    it('parses per-problem JSON map', () => {
      expect(parseJumpBackField('{"problem-1":"1:29","problem-2":"1:45"}')).toEqual({
        'problem-1': '1:29',
        'problem-2': '1:45',
      });
    });

    it('parses legacy plain MM:SS string', () => {
      expect(parseJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('parses legacy time-keyed JSON map', () => {
      expect(parseJumpBackField('{"1:30":"1:29"}')).toEqual({ '1:30': '1:29' });
    });
  });

  describe('buildTimemapFromQuizItems', () => {
    it('uses string value for single problem at a timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { problemId: 'problem-1', time: '1:30' },
        { problemId: 'problem-2', time: '2:00' },
      ]);
      expect(timemap).toEqual({
        '1:30': 'problem-1',
        '2:00': 'problem-2',
      });
    });

    it('uses array value for multiple problems at the same timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { problemId: 'problem-1', time: '1:30' },
        { problemId: 'problem-2', time: '1:30' },
      ]);
      expect(timemap).toEqual({
        '1:30': ['problem-1', 'problem-2'],
      });
    });
  });

  describe('buildJumpBackFromQuizItems', () => {
    it('stores a jump back value per problem, even at the same timestamp', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { problemId: 'problem-2', time: '1:30', jumpBack: '0:45' },
      ]);
      expect(jumpBack).toEqual({
        'problem-1': '0:30',
        'problem-2': '0:45',
      });
    });

    it('omits problems without a jump back value', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { problemId: 'problem-2', time: '1:30', jumpBack: '' },
      ]);
      expect(jumpBack).toEqual({ 'problem-1': '0:30' });
    });
  });
});
