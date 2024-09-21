import {
  CellFound,
  ICell,
  ISheet,
  ParseExpressionReturn,
} from '../../../types/sheet/cell/cell.types';
import { CELL_REGEX } from '../../constants/regex.constans';
import { isValidExcelExpression } from './is-valid-exp-helper';

export const parseExpression = (
  value: string,
  sheet: ISheet
): ParseExpressionReturn => {
  const cellHasFunction = value.startsWith('=');

  const exp = cellHasFunction ? value.substring(1) : value;
  const isMathExp = isMathExpression(value);

  const cellsFound: CellFound[] = [];

  const parsedExp = exp.replace(CELL_REGEX, (_, col, row) => {
    const id = `${col}${row}`;

    const x = col.charCodeAt(0) - 'A'.charCodeAt(0);
    const y = parseInt(row, 10) - 1;

    const computedValue = sheet[y][x].computedValue;

    cellsFound.push({ id, value: computedValue, y: y, x: x });

    const numberValue = Number(computedValue);

    const isString = isNaN(numberValue);

    // Devolver el valor de la celda desde la matriz
    return String(isString ? `'${computedValue}'` : numberValue);
  });

  return { isMathExp, parsedExp, cellsFound };
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

  if (!cellHasFunction) {
    return {
      ...cell,
      value,
      computedValue: value,
    };
  }

  let computedValue = cellHasFunction ? value.substring(1) : value;

  try {
    const isValid = isValidExcelExpression(computedValue);

    if (!isValid) throw new Error();

    const { parsedExp } = parseExpression(computedValue, sheet);
    console.log({ parsedExp });

    const finalExp = eval(parsedExp);

    computedValue = finalExp;
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
