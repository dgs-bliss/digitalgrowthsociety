import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCMS, wrapFieldsWithMeta } from 'tinacms';

type CustomFieldProps = {
  input: {
    value?: unknown;
    onChange: (value: string[]) => void;
    onBlur?: () => void;
  };
};

type CategoryOption = { label: string; value: string };
type CategoryConnectionResponse = {
  categoryConnection?: {
    edges?: Array<{ node?: { title?: string | null; _sys?: { path?: string | null } | null } | null } | null> | null;
    pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
  } | null;
};

const CATEGORY_QUERY = `
  query DynamicCategoryOptions($after: String) {
    categoryConnection(first: 100, after: $after) {
      edges {
        node {
          title
          _sys { path }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function categoryReference(sys?: { path?: string | null } | null) {
  return sys?.path?.trim() || '';
}

function labelFromReference(reference: string) {
  return reference.split('/').pop()?.replace(/\.(json|mdx|md)$/i, '').replace(/[-_]+/g, ' ') || reference;
}

async function fetchAllCategories(cms: ReturnType<typeof useCMS>) {
  if (!cms.api.tina) throw new Error('The Tina content API is not available.');
  const options: CategoryOption[] = [];
  let after: string | null = null;
  for (let page = 0; page < 100; page += 1) {
    const response: CategoryConnectionResponse = await cms.api.tina.request<CategoryConnectionResponse>(CATEGORY_QUERY, { variables: { after } });
    const connection = response?.categoryConnection;
    for (const edge of connection?.edges || []) {
      const value = categoryReference(edge?.node?._sys);
      if (!value) continue;
      options.push({ label: edge?.node?.title?.trim() || labelFromReference(value), value });
    }
    if (!connection?.pageInfo?.hasNextPage || !connection.pageInfo.endCursor) break;
    after = connection.pageInfo.endCursor;
  }
  return [...new Map(options.map((option) => [option.value, option])).values()]
    .sort((a, b) => a.label.localeCompare(b.label));
}

function CategoryCheckboxInput(props: CustomFieldProps) {
  const cms = useCMS();
  const selected = Array.isArray(props.input.value) ? props.input.value.filter((value): value is string => typeof value === 'string') : [];
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOptions(await fetchAllCategories(cms));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  }, [cms]);

  useEffect(() => { void load(); }, [load]);

  const renderedOptions = useMemo(() => {
    const known = new Set(options.map((option) => option.value));
    const unavailable = selected
      .filter((value) => !known.has(value))
      .map((value) => ({ label: `${labelFromReference(value)} (currently unavailable)`, value }));
    return [...options, ...unavailable];
  }, [options, selected]);

  function toggle(value: string, checked: boolean) {
    const next = checked ? [...new Set([...selected, value])] : selected.filter((item) => item !== value);
    props.input.onChange(next);
    props.input.onBlur?.();
  }

  return (
    <div style={{ display: 'grid', gap: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
          Loaded from the Category collection; no options are defined in code.
        </span>
        <button type="button" onClick={() => void load()} disabled={loading} style={{ color: '#2563eb', fontWeight: 600 }}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {error && <div role="alert" style={{ color: '#b91c1c' }}>{error}</div>}
      {!loading && !error && renderedOptions.length === 0 && (
        <div style={{ color: '#64748b' }}>Create a Category document first, then click Refresh.</div>
      )}
      {renderedOptions.map((option) => (
        <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={(event) => toggle(option.value, event.currentTarget.checked)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export const CategoryCheckboxGroupField = wrapFieldsWithMeta(CategoryCheckboxInput);
