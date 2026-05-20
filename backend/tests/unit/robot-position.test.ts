import { calculateNewPosition } from '../../src/modules/robot/robot.service';

describe('calculateNewPosition', () => {
  it('moves within map boundaries', () => {
    expect(calculateNewPosition({ x: 5, y: 5 }, 'RIGHT')).toEqual({ x: 6, y: 5 });
    expect(calculateNewPosition({ x: 5, y: 5 }, 'LEFT')).toEqual({ x: 4, y: 5 });
    expect(calculateNewPosition({ x: 5, y: 5 }, 'UP')).toEqual({ x: 5, y: 4 });
    expect(calculateNewPosition({ x: 5, y: 5 }, 'DOWN')).toEqual({ x: 5, y: 6 });
  });

  it('does not move past edges', () => {
    expect(calculateNewPosition({ x: 0, y: 0 }, 'LEFT')).toEqual({ x: 0, y: 0 });
    expect(calculateNewPosition({ x: 0, y: 0 }, 'UP')).toEqual({ x: 0, y: 0 });
    expect(calculateNewPosition({ x: 20, y: 20 }, 'RIGHT')).toEqual({ x: 20, y: 20 });
    expect(calculateNewPosition({ x: 20, y: 20 }, 'DOWN')).toEqual({ x: 20, y: 20 });
  });
});
