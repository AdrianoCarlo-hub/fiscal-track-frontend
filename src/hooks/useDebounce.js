import { useEffect, useState } from 'react';

export function useDebounce(valeur, delai = 200) {
  const [debouncee, setDebouncee] = useState(valeur);

  useEffect(() => {
    const minuterie = window.setTimeout(() => setDebouncee(valeur), delai);
    return () => window.clearTimeout(minuterie);
  }, [valeur, delai]);

  return debouncee;
}

export default useDebounce;
