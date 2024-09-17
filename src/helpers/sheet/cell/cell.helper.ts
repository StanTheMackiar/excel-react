import { ICell, ISheet } from '../../../types/sheet/cell/cell.types';
import { CELL_REGEX } from '../../constants/regex.constans';

export const parseExpression = (
  exp: string,
  sheet: ISheet,
  isMathExp = false
) => {
  const result = exp.replace(CELL_REGEX, (_, col, row) => {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);

    const rowIndex = parseInt(row, 10) - 1;

    // Devolver el valor de la celda desde la matriz
    return sheet[rowIndex][colIndex].computedValue || (isMathExp ? '0' : '');
  });

  return result;
};

export const parseRange = (range: string) => {
  const [start, end] = range.split(':');
  return { start, end };
};

export const computeCell = (
  cell: ICell,
  sheet: ISheet,
  newValue?: string
): ICell => {
  const value = newValue ?? cell.value;
  const cellHasFunction = value.startsWith('=');

  let computedValue = cellHasFunction ? value.substring(1) : value;

  try {
    const isMathExp = isMathExpression(computedValue);

    const parsedExp = parseExpression(computedValue, sheet, isMathExp);

    const finalExp = isMathExp ? eval(parsedExp) : parsedExp;

    const avaiableTypes = ['string', 'number'];
    const resultType = typeof finalExp;

    if (avaiableTypes.includes(resultType)) computedValue = finalExp;
    else throw new Error();
  } catch (error) {
    console.error(error);

    computedValue = '#ERROR';
  }

  return {
    ...cell,
    value,
    computedValue,
  };
};

export const isMathExpression = (expression: string): boolean => {
  // Expresión regular para validar celdas del tipo A1, operadores matemáticos y paréntesis
  const mathRegex = /^([A-Z]+\d+|\d+)([\s]*[+\-*/][\s]*([A-Z]+\d+|\d+))+$/i;

  // Verificar si la expresión coincide con la expresión regular
  return mathRegex.test(expression);
};
