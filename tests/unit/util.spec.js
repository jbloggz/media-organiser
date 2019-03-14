import { pretty_size } from '@/util.js';

describe('pretty_size', () => {
  it('Calculates bytes', () => {
    expect(pretty_size(1)).toBe('1 B');
    expect(pretty_size(12)).toBe('12 B');
    expect(pretty_size(123)).toBe('123 B');
  });
  it('Calculates kiB', () => {
    expect(pretty_size(1234)).toBe('1.21 kiB');
    expect(pretty_size(12345)).toBe('12.06 kiB');
    expect(pretty_size(123456)).toBe('120.56 kiB');
  });
  it('Calculates MiB', () => {
    expect(pretty_size(1234567)).toBe('1.18 MiB');
    expect(pretty_size(12345678)).toBe('11.77 MiB');
    expect(pretty_size(123456789)).toBe('117.74 MiB');
  });
  it('Calculates GiB', () => {
    expect(pretty_size(1234567891)).toBe('1.15 GiB');
    expect(pretty_size(12345678912)).toBe('11.5 GiB');
    expect(pretty_size(123456789123)).toBe('114.98 GiB');
  });
  it('Calculates TiB', () => {
    expect(pretty_size(1234567891234)).toBe('1.12 TiB');
    expect(pretty_size(12345678912345)).toBe('11.23 TiB');
    expect(pretty_size(123456789123456)).toBe('112.28 TiB');
    expect(pretty_size(1234567891234567)).toBe('1122.83 TiB');
  });
});
