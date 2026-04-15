import { CurrencyBrlPipe } from './currency-brl.pipe';

describe('CurrencyBrlPipe', () => {
  let pipe: CurrencyBrlPipe;

  beforeEach(() => {
    pipe = new CurrencyBrlPipe();
  });

  it('should format a number to BRL currency', () => {
    const result = pipe.transform(1234.56);
    expect(result).toContain('R$');
    expect(result).toContain('1.234,56');
  });

  it('should format zero', () => {
    expect(pipe.transform(0)).toContain('R$');
    expect(pipe.transform(0)).toContain('0,00');
  });

  it('should format a string number', () => {
    const result = pipe.transform('99.9');
    expect(result).toContain('R$');
    expect(result).toContain('99,90');
  });

  it('should return R$ 0,00 for null', () => {
    expect(pipe.transform(null)).toBe('R$ 0,00');
  });

  it('should return R$ 0,00 for undefined', () => {
    expect(pipe.transform(undefined)).toBe('R$ 0,00');
  });

  it('should return R$ 0,00 for empty string', () => {
    expect(pipe.transform('')).toBe('R$ 0,00');
  });

  it('should return R$ 0,00 for non-numeric string', () => {
    expect(pipe.transform('abc')).toBe('R$ 0,00');
  });

  it('should handle negative numbers', () => {
    const result = pipe.transform(-50);
    expect(result).toContain('R$');
    expect(result).toContain('50,00');
  });

  it('should handle large numbers', () => {
    const result = pipe.transform(1000000);
    expect(result).toContain('R$');
    expect(result).toContain('1.000.000,00');
  });
});
