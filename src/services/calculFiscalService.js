import api from './api';

const calculFiscalService = {
  /**
   * Simule un calcul IR. Ne persiste rien.
   */
  calculerIr: async (data) =>
    (await api.post('/api/calculs/ir', data)).data,

  /**
   * Simule un calcul IS.
   */
  calculerIs: async (data) =>
    (await api.post('/api/calculs/is', data)).data,

  /**
   * Simule un calcul IRSA.
   */
  calculerIrsa: async (data) =>
    (await api.post('/api/calculs/irsa', data)).data,

  /**
   * Simule un calcul TVA.
   */
  calculerTva: async (data) =>
    (await api.post('/api/calculs/tva', data)).data,

  /**
   * Simule un calcul IMP (marches publics).
   */
  calculerImp: async (data) =>
    (await api.post('/api/calculs/imp', data)).data,

  /**
   * Simule un calcul IPVI (plus-values immobilieres).
   */
  calculerIpvi: async (data) =>
    (await api.post('/api/calculs/ipvi', data)).data,

  /**
   * Simule un calcul IRCM (revenus des capitaux mobiliers).
   */
  calculerIrcm: async (data) =>
    (await api.post('/api/calculs/ircm', data)).data,
};

export default calculFiscalService;
