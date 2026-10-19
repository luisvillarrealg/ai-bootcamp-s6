import { renderHook, act } from '@testing-library/react';
import useCurrentDate from '../useCurrentDate';

describe('useCurrentDate', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date(2026, 9, 19, 23, 0),
      doNotFake: [
        'nextTick',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
        'queueMicrotask'
      ]
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the local date on mount', () => {
    const { result } = renderHook(() => useCurrentDate());

    expect(result.current).toBe('2026-10-19');
  });

  it('should update when the tab becomes visible on a new day', () => {
    const { result } = renderHook(() => useCurrentDate());

    jest.setSystemTime(new Date(2026, 9, 20, 0, 5));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe('2026-10-20');
  });

  it('should update when the window regains focus on a new day', () => {
    const { result } = renderHook(() => useCurrentDate());

    jest.setSystemTime(new Date(2026, 9, 21, 8, 0));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current).toBe('2026-10-21');
  });

  it('should keep the same value and not re-render when the date is unchanged', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useCurrentDate();
    });
    const rendersAfterMount = renderCount;

    act(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe('2026-10-19');
    expect(renderCount).toBe(rendersAfterMount);
  });

  it('should ignore visibilitychange while the document is hidden', () => {
    const { result } = renderHook(() => useCurrentDate());
    const visibilitySpy = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

    jest.setSystemTime(new Date(2026, 9, 20, 9, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe('2026-10-19');
    visibilitySpy.mockRestore();
  });

  it('should remove its listeners on unmount', () => {
    const windowSpy = jest.spyOn(window, 'removeEventListener');
    const documentSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useCurrentDate());

    unmount();

    expect(windowSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(documentSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    windowSpy.mockRestore();
    documentSpy.mockRestore();
  });
});
