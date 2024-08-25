import { ICell, ICellSpecial, ISheet } from '../../types/sheet/cell/cell.types';
import { alphabet } from '../constants/alphabet';

export const getSheet = (rowsQty: number, colsQty: number): ISheet =>
  Array.from({ length: rowsQty }, (_, positionY) =>
    Array.from({ length: colsQty }, (_, positionX) => {
      const number = positionY + 1;
      const letter = String.fromCharCode(65 + positionX);
      const id = `${letter}${positionY + 1}`;

      return {
        positionY,
        id,
        letter,
        number,
        positionX,
        value: `y:${positionY} - x:${positionX}`,
        computedValue: `y:${positionY} - x:${positionX}`,
      };
    })
  );

export const getSheetLetters = (colsQty: number): ICellSpecial[] => {
  return Array.from({ length: colsQty }, (_, i) => ({
    name: alphabet[i],
    value: i,
  }));
};

export const getSheetNumbers = (rowsQty: number): ICellSpecial[] => {
  return Array.from({ length: rowsQty }, (_, i) => ({
    name: String(i + 1),
    value: i,
  }));
};

export const adjustSheetSize = (
  rows: number,
  cols: number,
  currentSheet: ISheet
): ISheet => {
  // Genera una nueva hoja completa
  const newSheet = getSheet(rows, cols);

  // Sobrescribe las celdas de la nueva hoja con las celdas existentes en currentSheet, si las hay
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let colIndex = 0; colIndex < cols; colIndex++) {
      if (currentSheet[rowIndex]?.[colIndex]) {
        newSheet[rowIndex][colIndex] = currentSheet[rowIndex][colIndex];
      }
    }
  }

  return newSheet;
};

export const getCellFromMouseEvent = (e: any, sheet: ISheet): ICell | null => {
  const [cellId] = e.target.id.split('-');

  if (!cellId) return null;

  const cell = sheet.flat().find((cell) => cell.id === cellId) ?? null;

  return cell;
};
