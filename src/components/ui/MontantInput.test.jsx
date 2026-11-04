import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MontantInput from './MontantInput';

describe('MontantInput', () => {
  it('formate la saisie en groupes de milliers et renvoie un nombre', () => {
    const onChange = vi.fn();
    render(<MontantInput id="montant" label="Montant" valeur={null} onChange={onChange} />);

    const champ = screen.getByLabelText(/^Montant/);
    fireEvent.change(champ, { target: { value: '1234567' } });

    expect(champ).toHaveValue('1 234 567');
    expect(onChange).toHaveBeenLastCalledWith(1234567);
  });

  it('accepte une decimale a la virgule et vide la valeur sur effacement', () => {
    const onChange = vi.fn();
    render(<MontantInput id="montant" label="Montant" valeur={2500.5} onChange={onChange} />);

    const champ = screen.getByLabelText(/^Montant/);
    fireEvent.change(champ, { target: { value: '2 500,75' } });
    expect(onChange).toHaveBeenLastCalledWith(2500.75);

    fireEvent.change(champ, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
