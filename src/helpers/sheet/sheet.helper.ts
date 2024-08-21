import { ICell, ICellSpecial, ISheet } from '../../types/cell';
import { alphabet } from '../constants/alphabet';

export const getSheet = (rowsQty: number, colsQty: number): ISheet =>
  Array.from({ length: rowsQty }, (_, rowIndex) =>
    Array.from({ length: colsQty }, (_, colIndex) => {
      const number = rowIndex + 1;
      const letter = String.fromCharCode(65 + colIndex);
      const id = `${letter}${rowIndex + 1}`;

      return {
        col: colIndex,
        id,
        letter,
        number,
        row: rowIndex,
        value: '',
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
  const cellId = e.target.id;

  if (!cellId) return null;

  const cell = sheet.flat().find((cell) => cell.id === cellId) ?? null;

  // Debes implementar una lógica que convierta la posición del mouse a una celda en tu hoja
  return cell;
};
