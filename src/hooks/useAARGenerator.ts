import { useState, useCallback } from 'react';

interface AARState {
  isGenerating: boolean;
  report: string;
  error: string | null;
}

export function useAARGenerator() {
  const [state, setState] = useState<AARState>({ isGenerating: false, report: '', error: null });

  const generate = useCallback(async (windowHours: number = 24) => {
    setState({ isGenerating: true, report: '', error: null });

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-aar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ window_hours: windowHours }),
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Stream failed' }));
        setState((s) => ({ ...s, isGenerating: false, error: err.error || `HTTP ${resp.status}` }));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let accumulated = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const json = line.slice(6).trim();
          if (json === '[DONE]') break;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setState((s) => ({ ...s, report: accumulated }));
            }
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }

      setState((s) => ({ ...s, isGenerating: false }));
    } catch (e) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isGenerating: false, report: '', error: null });
  }, []);

  return { ...state, generate, reset };
}
