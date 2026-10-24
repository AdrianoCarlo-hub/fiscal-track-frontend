import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatutBadge from './StatutBadge';

describe('StatutBadge', () => {
  it('affiche le libelle francais, jamais le code technique', () => {
    render(<StatutBadge famille="statutValidation" code="VALIDEE" />);
    expect(screen.getByText('Validée')).toBeInTheDocument();
    expect(screen.queryByText('VALIDEE')).not.toBeInTheDocument();
  });

  it('affiche un tiret quand le statut est absent', () => {
    render(<StatutBadge famille="statutValidation" code={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
