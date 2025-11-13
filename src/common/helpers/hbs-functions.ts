export const helpers = {
  dateFormat: (date: string) => {
    const locale = new Date(date);
    return locale.toLocaleString('pt-BR');
  },
  inc: (value: string) => parseInt(value) + 1,
  json: (context) => JSON.stringify(context, null, 2),
  // 'error-message': (errors: any[], key: string) =>
  //   errors?.find((i) => i.property == key)?.message,
  // 'error-messages': (errors: any[], key: string) =>
  //   errors?.find((i) => i.property == key)?.messages,
  // setValue: (valueDefault: any, valueCheck?: any) => {
  //   if (!valueCheck) return valueDefault;
  //   if (valueDefault && valueCheck) return valueDefault;

  //   return valueCheck;
  // },
  'selected-option': (id: any, compareId: any, oldId?: any) => {
    if (oldId) return id == oldId ? 'selected' : '';

    return id == compareId ? 'selected' : '';
  },
  isString: (value) => typeof value === 'string',
  year: () => new Date().getFullYear(),
  getError: (errors: any[], key: string) => {
    const errorObj = errors?.find((i) => i.property == key);
    return errorObj ? errorObj.message : null;
  },
  getValue: (old: string, defaultValue: string) => {
    return old || defaultValue;
  },
};
