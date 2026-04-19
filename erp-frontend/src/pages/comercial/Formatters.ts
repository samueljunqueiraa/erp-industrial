// src/utils/formatters.ts

export const formatDocumento = (val: string | undefined) => {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');

  // CPF (11 dígitos)
  if (clean.length <= 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } 
  // CNPJ (12 a 14 dígitos)
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatTelefone = (val: string | undefined) => {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');

  // Fixo: (11) 3333-4444 (10 dígitos)
  if (clean.length <= 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Celular: (11) 9 9999-8888 (11 dígitos)
  return clean.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
};

export const formatCep = (val: string | undefined) => {
  if (!val) return '';
  return val.replace(/\D/g, '').replace(/^(\d{5})(\d{3})/, '$1-$2');
};