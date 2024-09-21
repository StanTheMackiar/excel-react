export const isValidExcelExpression = (expression: string): boolean => {
  if (!expression) return true;

  // Expresión regular que permite referencias de celdas, números y cadenas entre comillas dobles
  const regex = /([A-Z]+[0-9]+|\d+|"[^"]*")(\s*)$/i;

  // Validar que la expresión no termine en un operador (+, -, *, /, ;, ,)
  const invalidEndings = /[+\-*/;,]$/;

  // Retorna true si cumple la regex y no termina en un operador inválido
  return regex.test(expression) && !invalidEndings.test(expression);
};
