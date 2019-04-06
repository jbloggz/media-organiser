import util from '@/util.js';

describe('pretty_size', () => {
  it('Calculates bytes', () => {
    expect(util.pretty_size(1)).toBe('1 B');
    expect(util.pretty_size(12)).toBe('12 B');
    expect(util.pretty_size(123)).toBe('123 B');
  });
  it('Calculates kiB', () => {
    expect(util.pretty_size(1234)).toBe('1.21 kiB');
    expect(util.pretty_size(12345)).toBe('12.06 kiB');
    expect(util.pretty_size(123456)).toBe('120.56 kiB');
  });
  it('Calculates MiB', () => {
    expect(util.pretty_size(1234567)).toBe('1.18 MiB');
    expect(util.pretty_size(12345678)).toBe('11.77 MiB');
    expect(util.pretty_size(123456789)).toBe('117.74 MiB');
  });
  it('Calculates GiB', () => {
    expect(util.pretty_size(1234567891)).toBe('1.15 GiB');
    expect(util.pretty_size(12345678912)).toBe('11.5 GiB');
    expect(util.pretty_size(123456789123)).toBe('114.98 GiB');
  });
  it('Calculates TiB', () => {
    expect(util.pretty_size(1234567891234)).toBe('1.12 TiB');
    expect(util.pretty_size(12345678912345)).toBe('11.23 TiB');
    expect(util.pretty_size(123456789123456)).toBe('112.28 TiB');
    expect(util.pretty_size(1234567891234567)).toBe('1122.83 TiB');
  });
});
