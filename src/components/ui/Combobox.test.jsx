import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Combobox from './Combobox';

const OPTIONS = [
  { code: 'TVA', libelle: 'Taxe sur la valeur ajoutée' },
  { code: 'IS', libelle: 'Impôt sur les sociétés' },
  { code: 'IR', libelle: 'Impôt sur les revenus' },
];

describe('Combobox', () => {
  it('filtre sans tenir compte des accents et selectionne une option', () => {
    const onChange = vi.fn();
    render(<Combobox id="impot" label="Type d’impôt" valeur="" onChange={onChange} options={OPTIONS} />);

    const champ = screen.getByRole('combobox', { name: 'Type d’impôt' });
    fireEvent.click(champ);
    fireEvent.change(champ, { target: { value: 'societes' } });

    expect(screen.getByRole('option', { name: /Impôt sur les sociétés/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Taxe sur la valeur/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /Impôt sur les sociétés/ }));
    expect(onChange).toHaveBeenCalledWith('IS', OPTIONS[1]);
  });

  it('affiche l’option vide et permet de l’effacer', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        id="categorie"
        label="Catégorie"
        valeur="IS"
        onChange={onChange}
        options={OPTIONS}
        optionVide={{ code: '', libelle: 'Non renseignée' }}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Catégorie' })).toHaveValue('Impôt sur les sociétés');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la sélection' }));
    expect(onChange).toHaveBeenCalledWith('', null);
  });
});
